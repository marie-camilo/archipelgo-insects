const MapScene = {
    engine: null,
    scene: null,
    camera: null,
    islands: [], // Contiendra { pivot, mesh, data, offset }
    time: 0,

    init() {
        console.log("🗺️ MapScene.init() starting...");
        const canvas = document.getElementById("renderCanvas");
        if (!canvas) return;

        // 1. Setup Moteur
        this.engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        this.scene = new BABYLON.Scene(this.engine);

        // Ambiance
        const skyColor = new BABYLON.Color3(0.65, 0.85, 0.95);
        this.scene.clearColor = new BABYLON.Color4(skyColor.r, skyColor.g, skyColor.b, 1);
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = 0.01;
        this.scene.fogColor = skyColor;

        // 2. Caméra
        this.camera = new BABYLON.ArcRotateCamera("camera", -Math.PI/2, Math.PI/3, 60, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(canvas, true);
        this.camera.lowerRadiusLimit = 20;
        this.camera.upperRadiusLimit = 100;
        this.camera.wheelPrecision = 40;
        this.camera.panningSensibility = 0;

        // 3. Lumières
        const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 0.8;

        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), this.scene);
        dirLight.position = new BABYLON.Vector3(20, 50, 20);
        dirLight.intensity = 1.5;

        // Ombres
        const shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;

        // 4. Création
        this.createOcean();
        this.loadIslands(shadowGenerator); // Nouvelle fonction de chargement

        // 5. Boucle
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.animateEnvironment();
                this.scene.render();
            }
        });

        window.addEventListener("resize", () => { if (this.engine) this.engine.resize(); });
        setTimeout(() => this.engine.resize(), 50);
    },

    createOcean() {
        const ocean = BABYLON.MeshBuilder.CreateGround("ocean", {width: 300, height: 300}, this.scene);
        const oceanMat = new BABYLON.StandardMaterial("oceanMat", this.scene);
        oceanMat.diffuseColor = new BABYLON.Color3(0.0, 0.5, 0.8);
        oceanMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        oceanMat.alpha = 0.85;
        ocean.material = oceanMat;
        ocean.position.y = -0.5; // Juste en dessous du zéro
        this.waterMesh = ocean;
    },

    loadIslands(shadowGenerator) {
        if (!ISLANDS_DATA) return;

        ISLANDS_DATA.forEach((islandData, index) => {
            // 1. PIVOT
            const pivot = new BABYLON.TransformNode("pivot_" + islandData.id, this.scene);
            pivot.position = new BABYLON.Vector3(islandData.position.x, 0, islandData.position.z);

            // 2. HITBOX (Stable)
            const hitBox = BABYLON.MeshBuilder.CreateSphere("hit_" + islandData.id, {diameter: 12}, this.scene);
            hitBox.parent = pivot;
            hitBox.visibility = 0; // Invisible
            hitBox.position.y = 2;
            hitBox.isPickable = true;

            // 3. MODÈLE GLB
            BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", islandData.modelFile, this.scene)
                .then((result) => {
                    const root = result.meshes[0];
                    root.parent = pivot;

                    // On définit l'échelle de base
                    const rawScale = islandData.scale || 1;
                    // On crée un Vecteur Fixe qui servira de référence absolue
                    const baseScaleVector = new BABYLON.Vector3(rawScale, rawScale, rawScale);

                    // On applique la taille initiale
                    root.scaling = baseScaleVector.clone();

                    // On rend le modèle non-cliquable (c'est la hitbox qui prend les clics)
                    result.meshes.forEach(m => {
                        m.isPickable = false;
                        m.receiveShadows = true;
                        shadowGenerator.addShadowCaster(m);
                    });

                    // On stocke les références dans notre tableau pour les utiliser dans les interactions
                    this.islands[index].visualMesh = root;
                    this.islands[index].baseScaleVector = baseScaleVector; // SAUVEGARDE DE LA TAILLE DE BASE
                })
                .catch((err) => {
                    console.error("Erreur modèle:", islandData.modelFile, err);
                });

            // 4. INTERACTIONS (Sur la Hitbox)
            hitBox.actionManager = new BABYLON.ActionManager(this.scene);

            // --- SURVOL (HOVER) ---
            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                document.body.style.cursor = "pointer";

                const item = this.islands[index];
                if(item && item.visualMesh && item.baseScaleVector) {
                    // Arrêter toute animation en cours
                    this.scene.stopAnimation(item.visualMesh);

                    // CIBLE : Toujours calculer par rapport à la taille DE BASE (et pas la taille actuelle)
                    // On veut 1.2 fois la taille originale
                    const targetScale = item.baseScaleVector.scale(1.2);

                    BABYLON.Animation.CreateAndStartAnimation(
                        "grow",
                        item.visualMesh,
                        "scaling",
                        60,
                        20,
                        item.visualMesh.scaling, // On part de là où on est
                        targetScale,             // On va vers la cible fixe
                        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
                        new BABYLON.CubicEase() // CubicEase est plus stable que ElasticEase
                    );
                }

                if (typeof UIManager !== 'undefined') UIManager.showIslandTooltip(islandData, hitBox);
            }));

            // --- SORTIE (OUT) ---
            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                document.body.style.cursor = "default";

                const item = this.islands[index];
                if(item && item.visualMesh && item.baseScaleVector) {
                    this.scene.stopAnimation(item.visualMesh);

                    // CIBLE : Retour à la taille de base exacte
                    BABYLON.Animation.CreateAndStartAnimation(
                        "shrink",
                        item.visualMesh,
                        "scaling",
                        60,
                        20,
                        item.visualMesh.scaling,
                        item.baseScaleVector, // Retour à la référence
                        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
                        new BABYLON.CubicEase()
                    );
                }

                if (typeof UIManager !== 'undefined') UIManager.hideIslandTooltip();
            }));

            // CLIC
            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                ArchipelagoApp.selectIsland(islandData.id);
            }));

            // Initialisation de l'objet dans le tableau
            this.islands.push({ pivot: pivot, data: islandData, offset: index, visualMesh: null, baseScaleVector: null });
        });
    },

    animateEnvironment() {
        this.time += 0.01;

        // Eau
        if (this.waterMesh) {
            this.waterMesh.position.y = -0.5 + Math.sin(this.time * 0.5) * 0.1;
        }

        // Îles
        this.islands.forEach((obj) => {
            if (obj.pivot) {
                // Flottement doux
                obj.pivot.position.y = Math.sin(this.time + obj.offset) * 0.2;
                obj.pivot.rotation.y = Math.sin(this.time * 0.2 + obj.offset) * 0.05;
            }
        });
    },

    dispose() {
        if (this.engine) this.engine.stopRenderLoop();
        if (this.scene) { this.scene.dispose(); this.scene = null; }
        if (this.engine) { this.engine.dispose(); this.engine = null; }
        this.islands = [];
    },
};