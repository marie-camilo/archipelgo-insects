const IslandScene = {
    scene: null,
    engine: null,
    camera: null,
    currentIsland: null,
    insectsMeshes: [],
    time: 0,

    init(islandId) {
        const canvas = document.getElementById("islandCanvas");
        if (!canvas) return;

        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.currentIsland = ISLANDS_DATA.find(i => i.id === islandId);

        // 1. AMBIANCE & BROUILLARD (CORRIGÉ)
        const skyColor = new BABYLON.Color3(0.65, 0.85, 0.95);
        this.scene.clearColor = new BABYLON.Color4(skyColor.r, skyColor.g, skyColor.b, 1);

        this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        // On repousse le brouillard très loin car l'île zoomée est géante
        this.scene.fogStart = 500;
        this.scene.fogEnd = 2500;
        this.scene.fogColor = skyColor;

        // 2. CAMÉRA
        this.camera = new BABYLON.ArcRotateCamera("islandCam", -Math.PI/2, Math.PI/3, 100, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(canvas, true);
        this.camera.upperBetaLimit = Math.PI / 2 - 0.1;

        // 3. LUMIÈRES
        const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 0.8;

        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -0.8, -1), this.scene);
        dirLight.position = new BABYLON.Vector3(100, 100, 50);
        dirLight.intensity = 2.5;

        const shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);

        const glow = new BABYLON.GlowLayer("glow", this.scene);
        glow.intensity = 0.6;

        // 4. CHARGEMENT
        this.createOcean();
        this.loadIslandModel(shadowGenerator).then(() => {
            // On attend que le mesh soit bien là pour le Raycasting
            setTimeout(() => this.createInsects(), 300);
        });

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

        // Appliquer le Flat Shaded pour séparer les sommets
        waterMesh.convertToFlatShadedMesh();

        const waterMat = new BABYLON.StandardMaterial("waterMat", this.scene);
        waterMat.diffuseColor = new BABYLON.Color3(0.02, 0.05, 0.15);
        waterMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        waterMat.specularPower = 32;
        waterMat.alpha = 0.95;
        waterMat.roughness = 0;

        waterMesh.material = waterMat;
        waterMesh.position.y = this.currentIsland.waterLevel !== undefined ? this.currentIsland.waterLevel : 0;
        waterMesh.receiveShadows = true;

        this.waterMesh = waterMesh;
        this.basePositions = waterMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    },

    loadIslandModel(shadowGenerator) {
        return BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", this.currentIsland.modelFile, this.scene)
            .then((result) => {
                const root = result.meshes[0];
                const scale = (this.currentIsland.scale || 1) * 15;
                root.scaling = new BABYLON.Vector3(scale, scale, scale);

                // --- SYSTÈME DE POSITIONNEMENT ---
                const offset = this.currentIsland.modelOffset !== undefined ? this.currentIsland.modelOffset : 0;
                root.position = new BABYLON.Vector3(0, offset, 0);

                // Adaptation caméra (Inchangé)
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
            });
    },

    createInsects() {
        if (!this.currentIsland.insects) return;
        this.insectsMeshes = []; // On vide pour éviter les doublons

        const scale = (this.currentIsland.scale || 1) * 15;

        this.currentIsland.insects.forEach((insectData) => {
            const posX = insectData.position.x * scale;
            const posZ = insectData.position.z * scale;

            const ray = new BABYLON.Ray(new BABYLON.Vector3(posX, 1000, posZ), new BABYLON.Vector3(0, -1, 0), 2000);

            // On cherche n'importe quel mesh sauf l'océan
            const hit = this.scene.pickWithRay(ray, (m) => {
                return m.name !== "ocean" && m.isVisible && m.isPickable !== false;
            });

            // Si on rate le sol, on place l'insecte à une hauteur par défaut (y: 5)
            let finalY = hit.hit ? hit.pickedPoint.y + 2 : 5;

            // Création de la Hitbox (plus grosse pour faciliter le clic)
            const hitBox = BABYLON.MeshBuilder.CreateSphere("hit_" + insectData.id, {diameter: 6}, this.scene);
            hitBox.position = new BABYLON.Vector3(posX, finalY, posZ);
            hitBox.visibility = 0;
            hitBox.isPickable = true;

            // Orbe visuelle
            const orb = BABYLON.MeshBuilder.CreateSphere("orb", {diameter: 1.8}, this.scene);
            orb.parent = hitBox;
            const mat = new BABYLON.StandardMaterial("insectMat", this.scene);
            mat.emissiveColor = new BABYLON.Color3(1, 0.8, 0.2);
            mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
            orb.material = mat;

            // Anneau
            const ring = BABYLON.MeshBuilder.CreateTorus("ring", {diameter: 3, thickness: 0.15}, this.scene);
            ring.parent = hitBox;
            ring.rotation.x = Math.PI / 2;
            ring.material = mat;

            // Interaction Clic
            hitBox.actionManager = new BABYLON.ActionManager(this.scene);

            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                () => {
                    // On désactive le contrôle souris le temps du zoom pour éviter les interférences
                    this.camera.detachControl();

                    this.zoomOnInsect(hitBox.position);

                    setTimeout(() => {
                        ArchipelagoApp.selectInsect(insectData);
                        // On réactive le contrôle une fois arrivé
                        this.camera.attachControl(document.getElementById("islandCanvas"), true);
                    }, 1000); // Correspond à la durée de l'animation
                }
            ));

            this.insectsMeshes.push({ mesh: hitBox, ring: ring, offset: Math.random() * 10 });
        });
    },

    animateScene() {
        this.time += 0.01;
        if (this.waterMesh && this.basePositions) {
            const positions = [...this.basePositions];

            // On utilise exactement les mêmes réglages que MapScene
            const waveHeight = 1.2;
            const waveFreq = 0.15;

            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const z = positions[i + 2];

                // Formule identique à MapScene pour le look polygone
                const y = Math.sin(x * waveFreq + this.time) * Math.cos(z * waveFreq + this.time) * waveHeight;
                positions[i + 1] = y;
            }

            this.waterMesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
            // Crucial pour l'aspect facetté : recalcul des normales sans lissage
            this.waterMesh.createNormals(false);
        }
        this.insectsMeshes.forEach(item => { item.ring.rotation.y += 0.05; });
    },

    zoomOnInsect(targetPosition) {
        // 1. On stoppe immédiatement toute animation en cours sur la caméra pour éviter les conflits
        this.scene.stopAnimation(this.camera);

        const duration = 60; // On rallonge un peu pour plus de douceur (1s)
        const easing = new BABYLON.CubicEase();
        easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

        // 2. Animation du TARGET (On utilise Vector3.Lerp ou l'animation directe)
        BABYLON.Animation.CreateAndStartAnimation(
            "camTarget", this.camera, "target", 60, duration,
            this.camera.target.clone(), targetPosition.clone(),
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing
        );

        // 3. Animation du RADIUS
        // On vérifie que la cible n'est pas hors limites
        const targetRadius = 25; // Un peu moins serré pour éviter de traverser le sol
        BABYLON.Animation.CreateAndStartAnimation(
            "camRadius", this.camera, "radius", 60, duration,
            this.camera.radius, targetRadius,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing
        );

        // 4. Animation du BETA
        BABYLON.Animation.CreateAndStartAnimation(
            "camBeta", this.camera, "beta", 60, duration,
            this.camera.beta, Math.PI / 3, // Angle de vue confortable
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing
        );
    },

    resetView() {
        if (!this.camera) return;

        this.scene.stopAnimation(this.camera);
        const canvas = document.getElementById("islandCanvas");
        this.camera.attachControl(canvas, true);

        const duration = 60;
        const easing = new BABYLON.CubicEase();
        easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

        // 1. Retour du point de mire au centre
        BABYLON.Animation.CreateAndStartAnimation(
            "resetTarget", this.camera, "target", 60, duration,
            this.camera.target.clone(), new BABYLON.Vector3(0, 0, 0),
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing
        );

        // 2. Retour au zoom de départ (on utilise initialRadius)
        BABYLON.Animation.CreateAndStartAnimation(
            "resetRadius", this.camera, "radius", 60, duration,
            this.camera.radius, this.initialRadius || 100,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing
        );
    },

    dispose() {
        console.log("🧹 Nettoyage de la scène d'exploration...");

        // 1. Arrêter la boucle de rendu
        if (this.engine) {
            this.engine.stopRenderLoop();
        }

        // 2. Détruire la scène et libérer la mémoire GPU
        if (this.scene) {
            this.scene.dispose();
            this.scene = null;
        }

        // 3. Détruire le moteur
        if (this.engine) {
            this.engine.dispose();
            this.engine = null;
        }

        // 4. Vider les tableaux de données
        this.insectsMeshes = [];
        this.waterMesh = null;
        this.basePositions = null;
    }
};