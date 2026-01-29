const MapScene = {
    engine: null,
    scene: null,
    camera: null,
    islands: [], // Contiendra { pivot, mesh, data, offset }
    time: 0,
    introComplete: false,

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
        this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        this.scene.fogStart = 60.0;
        this.scene.fogEnd = 300.0;
        this.scene.fogColor = skyColor;

        // 2. Caméra (Position initiale pour l'intro)
        this.camera = new BABYLON.ArcRotateCamera("camera", -Math.PI/2, Math.PI/3, 150, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(canvas, false); // Désactivé pendant l'intro
        this.camera.lowerRadiusLimit = 20;
        this.camera.upperRadiusLimit = 100;
        this.camera.upperBetaLimit = Math.PI / 2 - 0.1;
        this.camera.wheelPrecision = 10;
        this.camera.panningSensibility = 30;

        // 3. Lumières
        const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 0.8;

        // Soleil rasant
        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -0.5, -1), this.scene);
        dirLight.position = new BABYLON.Vector3(50, 20, 10);
        dirLight.diffuse = new BABYLON.Color3(1, 0.9, 0.7);
        dirLight.specular = new BABYLON.Color3(1, 0.8, 0.6);
        dirLight.intensity = 2.0;

        // Ombres
        const shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;

        // 4. Création
        this.createOcean();
        this.loadIslands(shadowGenerator);

        // 5. Lancer l'animation d'intro
        this.playIntroAnimation();

        // 6. Boucle
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.animateEnvironment();
                this.scene.render();
            }
        });

        window.addEventListener("resize", () => { if (this.engine) this.engine.resize(); });
        setTimeout(() => this.engine.resize(), 50);
    },

    playIntroAnimation() {
        // CONFIG DU TRAVELLING
        const startRadius = 130;
        const startBeta = 1.1;
        const startAlpha = Math.PI / 2; // Position Nord / Arrière

        // FINAL : Ta vue globale habituelle
        const endRadius = 75;
        const endBeta = 1.2;
        const endAlpha = -Math.PI / 2; // Retour au Sud / Avant

        const animationDuration = 300; // 5 secondes pour un vol fluide

        // Initialisation de la caméra au point de départ
        this.camera.radius = startRadius;
        this.camera.beta = startBeta;
        this.camera.alpha = startAlpha;

        // CRÉATION DES ANIMATIONS
        const radiusAnim = new BABYLON.Animation("camRad", "radius", 60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

        const betaAnim = new BABYLON.Animation("camBeta", "beta", 60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

        const alphaAnim = new BABYLON.Animation("camAlpha", "alpha", 60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

        // Clés d'animation
        radiusAnim.setKeys([{ frame: 0, value: startRadius }, { frame: animationDuration, value: endRadius }]);
        betaAnim.setKeys([{ frame: 0, value: startBeta }, { frame: animationDuration, value: endBeta }]);
        alphaAnim.setKeys([{ frame: 0, value: startAlpha }, { frame: animationDuration, value: endAlpha }]);

        // LISSAGE
        const easingFunction = new BABYLON.CubicEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

        [radiusAnim, betaAnim, alphaAnim].forEach(anim => anim.setEasingFunction(easingFunction));

        this.camera.animations = [radiusAnim, betaAnim, alphaAnim];
        this.camera.detachControl();

        this.scene.beginAnimation(this.camera, 0, animationDuration, false, 1, () => {
            this.introComplete = true;
            const canvas = document.getElementById("renderCanvas");
            this.camera.attachControl(canvas, true);

            // Verrouillage des limites pour la navigation libre
            this.camera.lowerRadiusLimit = 25;
            this.camera.upperRadiusLimit = 150;

            // Affichage de l'UI
            const mapUI = document.querySelector('.map-ui');
            if(mapUI) mapUI.style.opacity = "1";
            console.log("Survol terminé.");
        });
    },

    createOcean() {
        const waterMesh = BABYLON.MeshBuilder.CreateGround("ocean", {width: 400, height: 400, subdivisions: 40, updatable: true}, this.scene);
        waterMesh.convertToFlatShadedMesh();

        // 3. Matériau de l'eau
        const waterMat = new BABYLON.StandardMaterial("waterMat", this.scene);
        waterMat.diffuseColor = new BABYLON.Color3(0.02, 0.05, 0.15);
        waterMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        waterMat.specularPower = 32;
        waterMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
        waterMat.alpha = 0.95;
        waterMat.roughness = 0; // Très lisse

        waterMesh.material = waterMat;
        waterMesh.position.y = -1; // Un peu sous les îles

        // On permet au maillage de recevoir les ombres des îles
        waterMesh.receiveShadows = true;

        // On stocke les données initiales pour les calculs de vagues
        this.waterMesh = waterMesh;
        // On sauvegarde la position originale des sommets (X, Y, Z)
        this.basePositions = waterMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    },

    loadIslands(shadowGenerator) {
        if (!ISLANDS_DATA) return;

        ISLANDS_DATA.forEach((islandData, index) => {
            // 1. LE PIVOT (L'Ancre)
            // On place le pivot TOUJOURS à Y=0 (niveau de la mer) pour X et Z donnés.
            // C'est ce qui garantit que la logique de la map reste stable.
            const pivot = new BABYLON.TransformNode("pivot_" + islandData.id, this.scene);
            pivot.position = new BABYLON.Vector3(islandData.position.x, 0, islandData.position.z);

            // 2. LA HITBOX (La zone de clic)
            // Elle est attachée au pivot.
            const hitBox = BABYLON.MeshBuilder.CreateSphere("hit_" + islandData.id, {diameter: 12}, this.scene);
            hitBox.parent = pivot;

            // CONFIGURATION INTELLIGENTE DE LA HITBOX :
            // Si 'hitboxOffset' existe dans les data, on l'utilise, sinon on la met à 5m de haut par défaut.
            const yOffset = islandData.hitboxOffset !== undefined ? islandData.hitboxOffset : 5;
            hitBox.position.y = yOffset;

            // Si 'hitboxScale' existe (pour les très grosses îles), on grossit la zone de clic.
            if (islandData.hitboxScale) {
                hitBox.scaling = new BABYLON.Vector3(islandData.hitboxScale, islandData.hitboxScale, islandData.hitboxScale);
            }

            hitBox.visibility = 0; // Mets à 0.3 si tu veux voir la bulle pour débuguer
            hitBox.isPickable = true; // C'est ELLE qu'on clique

            // 3. LE MODÈLE VISUEL GLB
            BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", islandData.modelFile, this.scene)
                .then((result) => {
                    const root = result.meshes[0];
                    root.parent = pivot;

                    // Échelle
                    const rawScale = islandData.scale || 1;
                    const baseScaleVector = new BABYLON.Vector3(rawScale, rawScale, rawScale);
                    root.scaling = baseScaleVector.clone();

                    // POSITION VERTICALE DU VISUEL :
                    // C'est ici qu'on applique le -15. Le visuel descend, mais le pivot et la hitbox restent à 0.
                    if (islandData.position.y) {
                        root.position.y = islandData.position.y;
                    }

                    // Désactivation du clic sur le modèle (pour ne pas masquer la hitbox)
                    result.meshes.forEach(m => {
                        m.isPickable = false; // Important !
                        m.receiveShadows = true;
                        shadowGenerator.addShadowCaster(m);
                        if (m.material) m.material.fogEnabled = false;
                    });

                    // Stockage pour les animations
                    this.islands[index].visualMesh = root;
                    this.islands[index].baseScaleVector = baseScaleVector;
                })
                .catch((err) => console.error("Erreur chargement modèle:", islandData.modelFile, err));

            // 4. INTERACTION (ActionManager sur la Hitbox)
            hitBox.actionManager = new BABYLON.ActionManager(this.scene);

            // --- SURVOL (HOVER) ---
            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                document.body.style.cursor = "pointer";

                const item = this.islands[index];
                if(item && item.visualMesh && item.baseScaleVector) {
                    this.scene.stopAnimation(item.visualMesh);
                    // Effet de grossissement sur le visuel
                    const targetScale = item.baseScaleVector.scale(1.15);

                    BABYLON.Animation.CreateAndStartAnimation(
                        "grow", item.visualMesh, "scaling", 60, 15,
                        item.visualMesh.scaling, targetScale,
                        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, new BABYLON.CubicEase()
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
                    // Retour à la taille normale
                    BABYLON.Animation.CreateAndStartAnimation(
                        "shrink", item.visualMesh, "scaling", 60, 15,
                        item.visualMesh.scaling, item.baseScaleVector,
                        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, new BABYLON.CubicEase()
                    );
                }
                if (typeof UIManager !== 'undefined') UIManager.hideIslandTooltip();
            }));

            // --- CLIC ---
            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                console.log("Île cliquée :", islandData.name);
                ArchipelagoApp.selectIsland(islandData.id);
            }));

            // Ajout à la liste interne
            this.islands.push({ pivot: pivot, data: islandData, offset: index, visualMesh: null, baseScaleVector: null });
        });
    },

    animateEnvironment() {
        this.time += 0.01; // Vitesse du temps

        // --- ANIMATION DE L'OCÉAN LOW POLY ---
        if (this.waterMesh && this.basePositions) {
            // On récupère le tableau actuel des positions (c'est une copie pour travailler dessus)
            const positions = [...this.basePositions];

            // On boucle sur chaque vertex (point) du maillage
            // Le tableau est une suite de [x, y, z, x, y, z, ...]
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const z = positions[i + 2];

                // FORMULE MAGIQUE DES VAGUES
                // On calcule un nouveau Y basé sur des Sinus et Cosinus mélangés
                const waveHeight = 1.0; // Hauteur des vagues
                const waveFreq = 0.15;  // Fréquence (taille des vagues)

                // y = sin(x * freq + temps) + cos(z * freq + temps)
                const y = Math.sin(x * waveFreq + this.time) * Math.cos(z * waveFreq + this.time) * waveHeight;

                // On applique la hauteur
                positions[i + 1] = y;
            }

            // On met à jour le maillage avec les nouvelles positions
            this.waterMesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);

            // IMPORTANT : On recalcule les "normales" pour que la lumière brille sur les nouvelles facettes
            this.waterMesh.createNormals(false);
        }

        // --- ANIMATION DES ÎLES (Flottement) ---
        this.islands.forEach((obj) => {
            if (obj.pivot) {
                // On prend la position Y de base (ex: -500) et on ajoute le petit mouvement de vague
                const baseY = obj.data.position.y || 0;
                obj.pivot.position.y = baseY + Math.sin(this.time + obj.offset) * 0.3;

                // Pareil pour la rotation si besoin
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