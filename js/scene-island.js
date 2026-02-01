/* SCENE ISLAND - Exploration détaillée & Outil de placement */

const IslandScene = {
    scene: null,
    engine: null,
    camera: null,
    currentIsland: null,
    insectsMeshes: [],
    arrivalBoat: null,
    time: 0,
    initialRadius: 100,

    init(islandId) {
        const canvas = document.getElementById("islandCanvas");
        if (!canvas) return;

        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.currentIsland = ISLANDS_DATA.find(i => i.id === islandId);

        // 1. AMBIANCE (Nettoyée)
        const skyColor = new BABYLON.Color3(0.65, 0.85, 0.95);
        this.scene.clearColor = new BABYLON.Color4(skyColor.r, skyColor.g, skyColor.b, 1);

        // On garde le brouillard de fond pour la profondeur, mais on s'assure qu'il est loin
        this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        this.scene.fogStart = 600;
        this.scene.fogEnd = 3000;
        this.scene.fogColor = skyColor;

        // 2. CAMÉRA
        this.camera = new BABYLON.ArcRotateCamera("islandCam", -Math.PI/2, Math.PI/3, 100, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(canvas, true);
        this.camera.upperBetaLimit = Math.PI / 2 - 0.1;
        this.camera.wheelPrecision = 2; // Zoom réactif

        // 3. LUMIÈRES
        const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 0.9; // Un peu plus lumineux pour bien voir les modèles

        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -0.8, -1), this.scene);
        dirLight.position = new BABYLON.Vector3(100, 100, 50);
        dirLight.intensity = 2.0;

        const shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;

        // 4. CHARGEMENT
        this.createOcean();
        this.loadIslandModel(shadowGenerator).then(() => {
            this.loadArrivalBoat(shadowGenerator);
            setTimeout(() => this.createInsects(), 200);
        });

        // 5. OUTIL DE PLACEMENT (DEBUG)
        //
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh.name !== "ocean") {
                    // On calcule l'échelle pour te donner la valeur exacte à mettre dans le JSON
                    const scale = (this.currentIsland.scale || 1) * 15;
                    const rawPos = pointerInfo.pickInfo.pickedPoint;

                    const jsonX = (rawPos.x / scale).toFixed(2);
                    const jsonY = (rawPos.y / scale).toFixed(2);
                    const jsonZ = (rawPos.z / scale).toFixed(2);

                    console.log(`📍 COORDONNÉES POUR JSON (${this.currentIsland.name}):`);
                    console.log(`position: { x: ${jsonX}, y: ${jsonY}, z: ${jsonZ} },`);
                }
            }
        });

        // 6. RENDU
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.animateScene();
                this.scene.render();
            }
        });
        window.addEventListener("resize", () => this.engine.resize());
    },

    createOcean() {
        const waterMesh = BABYLON.MeshBuilder.CreateGround("ocean", {
            width: 2000,
            height: 2000,
            subdivisions: 120,
            updatable: true
        }, this.scene);

        waterMesh.convertToFlatShadedMesh();

        const waterMat = new BABYLON.StandardMaterial("waterMat", this.scene);
        waterMat.diffuseColor = new BABYLON.Color3(0.02, 0.05, 0.15);
        waterMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        waterMat.alpha = 0.95;
        waterMat.roughness = 0;

        waterMesh.material = waterMat;
        waterMesh.position.y = this.currentIsland.waterLevel !== undefined ? this.currentIsland.waterLevel : 0;
        waterMesh.receiveShadows = true;

        this.waterMesh = waterMesh;
        this.basePositions = waterMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    },

    loadArrivalBoat(shadowGenerator) {
        BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "boat.glb", this.scene)
            .then((result) => {
                // On récupère le nœud racine (__root__)
                const boatRoot = result.meshes[0];
                this.arrivalBoat = boatRoot;

                const config = this.currentIsland.boatConfig || { position: { x: 50, z: 50 }, rotationY: 0 };
                const waterY = this.currentIsland.waterLevel !== undefined ? this.currentIsland.waterLevel : 0;

                // 1. Position
                boatRoot.position = new BABYLON.Vector3(config.position.x, waterY + 0.5, config.position.z);

                // 2. Rotation - LA CORRECTION :
                // On réinitialise d'abord pour éviter les conflits d'axes
                boatRoot.rotationQuaternion = null;
                // On applique la rotation sur l'axe Y
                boatRoot.rotation.y = config.rotationY;

                // 3. Échelle
                const bScale = config.boatScale !== undefined ? config.boatScale : 15;
                boatRoot.scaling = new BABYLON.Vector3(bScale, bScale, bScale);

                result.meshes.forEach(m => {
                    m.receiveShadows = true;
                    shadowGenerator.addShadowCaster(m);
                    if (m.material) m.material.fogEnabled = false;
                });
            })
            .catch(err => console.error("Erreur chargement bateau:", err));
    },

    loadIslandModel(shadowGenerator) {
        return BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", this.currentIsland.modelFile, this.scene)
            .then((result) => {
                const root = result.meshes[0];
                const scale = (this.currentIsland.scale || 1) * 15;
                root.scaling = new BABYLON.Vector3(scale, scale, scale);

                const offset = this.currentIsland.modelOffset !== undefined ? this.currentIsland.modelOffset : 0;
                root.position = new BABYLON.Vector3(0, offset, 0);

                const boundingInfo = root.getHierarchyBoundingVectors();
                const size = boundingInfo.max.subtract(boundingInfo.min);
                const maxDim = Math.max(size.x, size.z);
                this.camera.radius = maxDim * 1.5;
                this.camera.upperRadiusLimit = maxDim * 4;
                this.initialRadius = maxDim * 1.5;

                result.meshes.forEach(m => {
                    m.receiveShadows = true;
                    m.checkCollisions = true;
                    shadowGenerator.addShadowCaster(m);
                });
                return true;
            })
            .catch(err => console.error("Erreur chargement île:", err));
    },

    createInsects() {
        if (!this.currentIsland.insects) return;
        this.insectsMeshes = [];

        const islandScale = (this.currentIsland.scale || 1) * 15;

        this.currentIsland.insects.forEach((insectData) => {
            const posX = insectData.position.x * islandScale;
            const posZ = insectData.position.z * islandScale;

            // Raycast pour trouver le sol exact
            const ray = new BABYLON.Ray(new BABYLON.Vector3(posX, 1000, posZ), new BABYLON.Vector3(0, -1, 0), 2000);
            const hit = this.scene.pickWithRay(ray, (m) => m.name !== "ocean" && m.isVisible && m.isPickable !== false);

            // --- LOGIQUE DE VOL ---
            // On récupère le niveau du sol. S'il n'y a pas de sol, on met 0.
            let groundY = hit.hit ? hit.pickedPoint.y : 0;

            // On ajoute l'altitude définie dans le JSON (ou 0.5 par défaut pour les rampants)
            let altitude = insectData.altitude !== undefined ? insectData.altitude : 0.5;
            let finalY = groundY + altitude;

            // 1. HITBOX
            const hitBox = BABYLON.MeshBuilder.CreateSphere("hit_" + insectData.id, {diameter: 5}, this.scene);
            hitBox.position = new BABYLON.Vector3(posX, finalY, posZ);
            hitBox.visibility = 0;
            hitBox.isPickable = true;

            // 2. MODÈLE 3D
            const modelName = insectData.modelFile || "sphere.glb";
            const scale = insectData.modelScale || 1;

            BABYLON.SceneLoader.ImportMeshAsync("", "./assets/insects/", modelName, this.scene)
                .then((result) => {
                    const insectRoot = result.meshes[0];
                    insectRoot.parent = hitBox;
                    insectRoot.scaling = new BABYLON.Vector3(scale, scale, scale);

                    // On centre le modèle dans sa hitbox
                    insectRoot.position = BABYLON.Vector3.Zero();

                    result.meshes.forEach(m => { m.isPickable = false; });
                    this.insectsMeshes.push({ visual: insectRoot, hitbox: hitBox, offset: Math.random() * 100 });
                });

            // 3. INTERACTION
            hitBox.actionManager = new BABYLON.ActionManager(this.scene);

            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                document.body.style.cursor = "pointer";
            }));
            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                document.body.style.cursor = "default";
            }));

            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                () => {
                    this.camera.detachControl();
                    this.zoomOnInsect(hitBox.position);

                    setTimeout(() => {
                        if(typeof ArchipelagoApp !== 'undefined') {
                            ArchipelagoApp.selectInsect(insectData);
                        }
                        const canvas = document.getElementById("islandCanvas");
                        if(canvas) this.camera.attachControl(canvas, true);
                    }, 500); // Délai réduit pour matcher le zoom rapide
                }
            ));
        });
    },

    animateScene() {
        this.time += 0.01;

        // --- OCÉAN ---
        if (this.waterMesh && this.basePositions) {
            const positions = [...this.basePositions];
            const waveHeight = 1.2;
            const waveFreq = 0.15;

            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const z = positions[i + 2];
                const y = Math.sin(x * waveFreq + this.time) * Math.cos(z * waveFreq + this.time) * waveHeight;
                positions[i + 1] = y;
            }
            this.waterMesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
            this.waterMesh.createNormals(false);
        }

        // --- ANIMATION DU BATEAU D'ARRIVÉE ---
        if (this.arrivalBoat) {
            // Flottement synchronisé avec l'eau
            this.arrivalBoat.position.y = (this.currentIsland.waterLevel || 0) + Math.sin(this.time * 1.5) * 0.4;
            this.arrivalBoat.rotation.z = Math.sin(this.time) * 0.05; // Tangage
            this.arrivalBoat.rotation.x = Math.cos(this.time * 0.7) * 0.03;
        }

        // --- INSECTES ---
        this.insectsMeshes.forEach(item => {
            if(item.visual) {
                item.visual.position.y = Math.sin(this.time * 2 + item.offset) * 0.2;
                item.visual.rotation.y += 0.005;
            }
        });
    },

    zoomOnInsect(targetPosition) {
        this.scene.stopAnimation(this.camera);

        // DUREE REDUITE (25 frames = ~0.4 seconde) pour un effet rapide
        const duration = 25;

        // Easing moins "mou", plus direct
        const easing = new BABYLON.CubicEase();
        easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

        BABYLON.Animation.CreateAndStartAnimation(
            "camTarget", this.camera, "target", 60, duration,
            this.camera.target.clone(), targetPosition.clone(),
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing
        );

        BABYLON.Animation.CreateAndStartAnimation(
            "camRadius", this.camera, "radius", 60, duration,
            this.camera.radius, 15,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing
        );

        BABYLON.Animation.CreateAndStartAnimation(
            "camBeta", this.camera, "beta", 60, duration,
            this.camera.beta, Math.PI / 2.5,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing
        );
    },

    resetView() {
        if (!this.camera) return;
        this.scene.stopAnimation(this.camera);

        const canvas = document.getElementById("islandCanvas");
        if(canvas) this.camera.attachControl(canvas, true);

        const duration = 30; // Retour un peu plus rapide aussi
        const easing = new BABYLON.CubicEase();
        easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

        BABYLON.Animation.CreateAndStartAnimation(
            "resetTarget", this.camera, "target", 60, duration,
            this.camera.target.clone(), new BABYLON.Vector3(0, 0, 0),
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing
        );

        BABYLON.Animation.CreateAndStartAnimation(
            "resetRadius", this.camera, "radius", 60, duration,
            this.camera.radius, this.initialRadius || 100,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing
        );
    },

    dispose() {
        if (this.engine) this.engine.stopRenderLoop();
        if (this.scene) { this.scene.dispose(); this.scene = null; }
        if (this.engine) { this.engine.dispose(); this.engine = null; }
        this.insectsMeshes = [];
        this.waterMesh = null;
    }
};