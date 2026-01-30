const MapScene = {
    engine: null,
    scene: null,
    camera: null,
    islands: [],
    boatMesh: null,
    time: 0,

    // Drapeau pour bloquer les interactions pendant le zoom/navigation
    isNavigating: false,

    // Variables océan
    waterMesh: null,
    basePositions: null,

    init() {
        console.log("🗺️ MapScene.init() starting...");
        const canvas = document.getElementById("renderCanvas");
        if (!canvas) return;

        this.engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        this.scene = new BABYLON.Scene(this.engine);

        // --- AMBIANCE ---
        const skyColor = new BABYLON.Color3(0.65, 0.85, 0.95);
        this.scene.clearColor = new BABYLON.Color4(skyColor.r, skyColor.g, skyColor.b, 1);
        this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        this.scene.fogStart = 60.0;
        this.scene.fogEnd = 300.0;
        this.scene.fogColor = skyColor;

        // --- CAMÉRA (Position Finale Directe - Plus de traveling) ---
        // On met directement les valeurs de fin : Radius 75, Beta 1.2, Alpha Sud
        this.camera = new BABYLON.ArcRotateCamera("camera", -Math.PI/2, 1.2, 75, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(canvas, true); // Contrôles actifs tout de suite

        // Limites de navigation
        this.camera.lowerRadiusLimit = 25;
        this.camera.upperRadiusLimit = 150;
        this.camera.upperBetaLimit = Math.PI / 2 - 0.1;
        this.camera.wheelPrecision = 10;
        this.camera.panningSensibility = 30;

        // --- LUMIÈRES ---
        const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 0.8;

        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -0.5, -1), this.scene);
        dirLight.position = new BABYLON.Vector3(50, 20, 10);
        dirLight.diffuse = new BABYLON.Color3(1, 0.9, 0.7);
        dirLight.specular = new BABYLON.Color3(1, 0.8, 0.6);
        dirLight.intensity = 2.0;

        // Ombres
        const shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;

        // --- CRÉATION DU MONDE ---
        this.createOcean();
        this.loadBaseCamp(shadowGenerator);
        this.loadIslands(shadowGenerator);

        // Afficher l'interface de légende tout de suite
        const mapUI = document.querySelector('.map-ui-bottom');
        if(mapUI) mapUI.style.opacity = "1";

        // --- BOUCLE DE RENDU ---
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.animateEnvironment();
                this.scene.render();
            }
        });

        window.addEventListener("resize", () => { if (this.engine) this.engine.resize(); });
    },

    createOcean() {
        const waterMesh = BABYLON.MeshBuilder.CreateGround("ocean", {width: 400, height: 400, subdivisions: 40, updatable: true}, this.scene);
        waterMesh.convertToFlatShadedMesh();
        const waterMat = new BABYLON.StandardMaterial("waterMat", this.scene);
        waterMat.diffuseColor = new BABYLON.Color3(0.02, 0.05, 0.15);
        waterMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        waterMat.specularPower = 32;
        waterMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
        waterMat.alpha = 0.95;
        waterMat.roughness = 0;
        waterMesh.material = waterMat;
        waterMesh.position.y = -1;
        waterMesh.receiveShadows = true;
        this.waterMesh = waterMesh;
        this.basePositions = waterMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    },

    loadBaseCamp(shadowGenerator) {
        // PIVOT
        const portPos = new BABYLON.Vector3(40, 0, 50);
        const pivot = new BABYLON.TransformNode("baseCampPivot", this.scene);
        pivot.position = portPos;

        // HITBOX
        const hitBox = BABYLON.MeshBuilder.CreateSphere("baseCampHit", {diameter: 25}, this.scene);
        hitBox.parent = pivot;
        hitBox.position.y = 5;
        hitBox.visibility = 0;
        hitBox.isPickable = true;

        // PORT
        BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "port.glb", this.scene)
            .then((result) => {
                const port = result.meshes[0];
                port.parent = pivot;
                port.position = new BABYLON.Vector3(0, 0, 0);
                port.scaling = new BABYLON.Vector3(20, 20, 20);
                result.meshes.forEach(m => {
                    m.receiveShadows = true;
                    if (m.material) m.material.fogEnabled = false;
                });
            });

        // BATEAU
        BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "boat.glb", this.scene)
            .then((result) => {
                const boat = result.meshes[0];
                boat.position = new BABYLON.Vector3(38, 0.2, 30);
                boat.rotation.y = -Math.PI / 4;
                boat.scaling = new BABYLON.Vector3(5, 5, 5);
                this.boatMesh = boat;
                result.meshes.forEach(m => {
                    m.receiveShadows = true;
                    shadowGenerator.addShadowCaster(m);
                    if (m.material) m.material.fogEnabled = false;
                });
            });

        // INTERACTIONS
        hitBox.actionManager = new BABYLON.ActionManager(this.scene);

        hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
            // Si on est déjà en train de zoomer ou de choisir, on n'affiche pas le tooltip
            if (this.isNavigating) return;

            document.body.style.cursor = "pointer";
            if (typeof UIManager !== 'undefined') UIManager.showBaseCampTooltip(hitBox);
        }));

        hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
            document.body.style.cursor = "default";
            if (typeof UIManager !== 'undefined') UIManager.hideIslandTooltip();
        }));

        hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
            if (this.isNavigating) return;
            this.zoomToBaseCamp(pivot.absolutePosition.clone());
        }));
    },

    zoomToBaseCamp(targetPos) {
        console.log("🎬 Zoom Port en cours...");

        // 1. On cache immédiatement le tooltip pour éviter qu'il reste coincé
        if (typeof UIManager !== 'undefined') UIManager.hideIslandTooltip();

        // 2. Verrouillage
        this.isNavigating = true;
        this.scene.stopAnimation(this.camera);
        this.camera.detachControl();

        // 3. Désactiver les limites pour permettre le zoom proche
        this.camera.lowerRadiusLimit = null;
        this.camera.upperRadiusLimit = null;

        // 4. Animation
        const frameRate = 60;
        const duration = 100; // Un peu plus rapide (1.6s)

        // Création des animations vectorielles
        const animRadius = new BABYLON.Animation("zoomRadius", "radius", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animRadius.setKeys([{ frame: 0, value: this.camera.radius }, { frame: duration, value: 40 }]);

        const animBeta = new BABYLON.Animation("zoomBeta", "beta", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animBeta.setKeys([{ frame: 0, value: this.camera.beta }, { frame: duration, value: 1.3 }]);

        const animAlpha = new BABYLON.Animation("zoomAlpha", "alpha", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animAlpha.setKeys([{ frame: 0, value: this.camera.alpha }, { frame: duration, value: -Math.PI / 1.5 }]);

        const animTarget = new BABYLON.Animation("zoomTarget", "target", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animTarget.setKeys([{ frame: 0, value: this.camera.target.clone() }, { frame: duration, value: targetPos }]);

        const ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        [animRadius, animBeta, animAlpha, animTarget].forEach(anim => anim.setEasingFunction(ease));

        this.scene.beginDirectAnimation(this.camera, [animRadius, animBeta, animAlpha, animTarget], 0, duration, false, 1, () => {
            UIManager.openNavigation();
            document.body.style.cursor = "default";
        });
    },

    // --- NOUVELLE FONCTION IMPORTANTE ---
    // Appeler ceci quand on ferme la modale pour rendre la map interactive à nouveau
    resetNavigation() {
        console.log("🔄 Retour vue carte");

        // On rend la main au joueur
        this.isNavigating = false;

        // On réactive les contrôles
        this.camera.attachControl(document.getElementById("renderCanvas"), true);

        // On remet les limites pour ne pas passer sous le sol
        this.camera.lowerRadiusLimit = 25;
        this.camera.upperRadiusLimit = 150;

        // Optionnel : Petit dézoom automatique pour revenir à une vue confortable
        const animRadius = new BABYLON.Animation("resetRad", "radius", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animRadius.setKeys([{ frame: 0, value: this.camera.radius }, { frame: 60, value: 75 }]);
        this.scene.beginDirectAnimation(this.camera, [animRadius], 0, 60, false, 1);
    },

    loadIslands(shadowGenerator) {
        if (!ISLANDS_DATA) return;
        ISLANDS_DATA.forEach((islandData, index) => {
            const pivot = new BABYLON.TransformNode("pivot_" + islandData.id, this.scene);
            pivot.position = new BABYLON.Vector3(islandData.position.x, 0, islandData.position.z);
            const hitBox = BABYLON.MeshBuilder.CreateSphere("hit_" + islandData.id, {diameter: 12}, this.scene);
            hitBox.parent = pivot;
            const yOffset = islandData.hitboxOffset !== undefined ? islandData.hitboxOffset : 5;
            hitBox.position.y = yOffset;
            if (islandData.hitboxScale) hitBox.scaling = new BABYLON.Vector3(islandData.hitboxScale, islandData.hitboxScale, islandData.hitboxScale);
            hitBox.visibility = 0;
            hitBox.isPickable = true;

            BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", islandData.modelFile, this.scene)
                .then((result) => {
                    const root = result.meshes[0];
                    root.parent = pivot;
                    const rawScale = islandData.scale || 1;
                    const baseScaleVector = new BABYLON.Vector3(rawScale, rawScale, rawScale);
                    root.scaling = baseScaleVector.clone();
                    if (islandData.position.y) root.position.y = islandData.position.y;
                    result.meshes.forEach(m => {
                        m.isPickable = false;
                        m.receiveShadows = true;
                        shadowGenerator.addShadowCaster(m);
                        if (m.material) m.material.fogEnabled = false;
                    });
                    this.islands[index].visualMesh = root;
                    this.islands[index].baseScaleVector = baseScaleVector;
                })
                .catch((err) => console.error("Erreur chargement modèle:", islandData.modelFile, err));

            hitBox.actionManager = new BABYLON.ActionManager(this.scene);
            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                if (this.isNavigating) return;
                document.body.style.cursor = "pointer";
                const item = this.islands[index];
                if(item && item.visualMesh && item.baseScaleVector) {
                    this.scene.stopAnimation(item.visualMesh);
                    const targetScale = item.baseScaleVector.scale(1.15);
                    BABYLON.Animation.CreateAndStartAnimation("grow", item.visualMesh, "scaling", 60, 15, item.visualMesh.scaling, targetScale, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, new BABYLON.CubicEase());
                }
                if (typeof UIManager !== 'undefined') UIManager.showIslandTooltip(islandData, hitBox);
            }));

            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                document.body.style.cursor = "default";
                const item = this.islands[index];
                if(item && item.visualMesh && item.baseScaleVector) {
                    this.scene.stopAnimation(item.visualMesh);
                    BABYLON.Animation.CreateAndStartAnimation("shrink", item.visualMesh, "scaling", 60, 15, item.visualMesh.scaling, item.baseScaleVector, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, new BABYLON.CubicEase());
                }
                if (typeof UIManager !== 'undefined') UIManager.hideIslandTooltip();
            }));

            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                if (this.isNavigating) return;
                console.log("Île cliquée :", islandData.name);
                ArchipelagoApp.selectIsland(islandData.id);
            }));
            this.islands.push({ pivot: pivot, data: islandData, offset: index, visualMesh: null, baseScaleVector: null });
        });
    },

    animateEnvironment() {
        this.time += 0.01;
        if (this.waterMesh && this.basePositions) {
            const positions = [...this.basePositions];
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const z = positions[i + 2];
                const waveHeight = 1.0;
                const waveFreq = 0.15;
                const y = Math.sin(x * waveFreq + this.time) * Math.cos(z * waveFreq + this.time) * waveHeight;
                positions[i + 1] = y;
            }
            this.waterMesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
            this.waterMesh.createNormals(false);
        }
        this.islands.forEach((obj) => {
            if (obj.pivot) {
                const baseY = obj.data.position.y || 0;
                obj.pivot.position.y = baseY + Math.sin(this.time + obj.offset) * 0.3;
                obj.pivot.rotation.y = Math.sin(this.time * 0.2 + obj.offset) * 0.05;
            }
        });
        if (this.boatMesh) {
            this.boatMesh.rotation.x = Math.sin(this.time * 0.8) * 0.05;
            this.boatMesh.rotation.z = Math.cos(this.time * 0.5) * 0.05;
            this.boatMesh.position.y = 0.2 + Math.sin(this.time * 1.2) * 0.15;
        }
    },

    dispose() {
        if (this.engine) this.engine.stopRenderLoop();
        if (this.scene) { this.scene.dispose(); this.scene = null; }
        if (this.engine) { this.engine.dispose(); this.engine = null; }
        this.islands = [];
        this.boatMesh = null;
    },
};