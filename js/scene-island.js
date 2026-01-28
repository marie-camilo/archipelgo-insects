/* SCENE ISLAND - Exploration d'île (Version "Lush Low Poly") */

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

        // 1. MOTEUR & SCÈNE
        this.engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        this.scene = new BABYLON.Scene(this.engine);

        // Ciel bleu doux
        this.scene.clearColor = new BABYLON.Color4(0.5, 0.8, 0.95, 1);

        // Brouillard léger pour fondre l'horizon
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = 0.005;
        this.scene.fogColor = this.scene.clearColor;

        this.currentIsland = ISLANDS_DATA.find(i => i.id === islandId);

        // 2. CAMÉRA ORBITALE
        this.camera = new BABYLON.ArcRotateCamera("islandCam", -Math.PI/2, Math.PI/3, 35, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(canvas, true);
        this.camera.lowerRadiusLimit = 15; // Zoom max
        this.camera.upperRadiusLimit = 60; // Zoom min
        this.camera.upperBetaLimit = Math.PI / 2 - 0.05; // Bloque la caméra au dessus de l'eau
        this.camera.wheelPrecision = 50;

        // 3. ÉCLAIRAGE & OMBRES
        const hemiLight = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 0.6;
        hemiLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.2);

        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -1, -1), this.scene);
        dirLight.position = new BABYLON.Vector3(50, 20, 10);
        dirLight.intensity = 1.8;

        const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;

        // 4. POST-PROCESSING (Embellissement)
        const pipeline = new BABYLON.DefaultRenderingPipeline("default", true, this.scene, [this.camera]);
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.7;
        pipeline.bloomWeight = 0.4;
        pipeline.samples = 4; // Anti-aliasing

        // 5. CRÉATION DU MONDE
        this.createEnvironment();
        this.createTerrain(shadowGenerator);
        this.createInsects(); // On place les insectes APRÈS le terrain

        // 6. BOUCLE
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.animateScene();
                this.scene.render();
            }
        });
        window.addEventListener("resize", () => this.engine.resize());
        setTimeout(() => this.engine.resize(), 50);
    },

    createEnvironment() {
        // OCÉAN
        const ocean = BABYLON.MeshBuilder.CreateGround("ocean", {width: 200, height: 200}, this.scene);
        const oceanMat = new BABYLON.StandardMaterial("oceanMat", this.scene);
        oceanMat.diffuseColor = new BABYLON.Color3(0.1, 0.6, 0.8);
        oceanMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        oceanMat.alpha = 0.8;
        ocean.material = oceanMat;
        ocean.position.y = -0.5;
        this.oceanMesh = ocean; // Stocké pour animation
    },

    createTerrain(shadowGenerator) {
        // COULEUR DU SOL
        const islandColor = this.currentIsland.color ? BABYLON.Color3.FromHexString(this.currentIsland.color) : new BABYLON.Color3(0.3, 0.7, 0.3);

        // 1. BASE DE L'ÎLE (Le bloc de terre marron)
        const base = BABYLON.MeshBuilder.CreateCylinder("base", {diameter: 28, height: 8, tessellation: 16}, this.scene);
        base.position.y = -4; // On le descend un peu pour que l'herbe soit au niveau 0
        const baseMat = new BABYLON.StandardMaterial("baseMat", this.scene);
        baseMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2); // Marron terre
        baseMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Pas brillant
        base.material = baseMat;
        base.receiveShadows = true;

        // 2. SURFACE HERBEUSE (C'était le "Dôme")
        // On utilise toujours une sphère coupée pour avoir un bord arrondi joli...
        const ground = BABYLON.MeshBuilder.CreateSphere("surface", {diameter: 28.5, slice: 0.45}, this.scene);

        // ... MAIS ON L'APLATIT FORTEMENT ICI 👇
        ground.scaling.y = 0.1; // C'était 0.5 avant (trop haut)

        ground.position.y = 0; // Au niveau de l'eau à peu près

        // Low Poly Look
        ground.convertToFlatShadedMesh();

        const groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
        groundMat.diffuseColor = islandColor;
        groundMat.specularColor = new BABYLON.Color3(0, 0, 0); // Mat (pas de reflet plastique)
        groundMat.roughness = 1;
        ground.material = groundMat;
        ground.receiveShadows = true;

        // 3. DÉCORATION PROCÉDURALE
        const numItems = 30;

        for(let i=0; i<numItems; i++) {
            const angle = Math.random() * Math.PI * 2;
            // On réduit un peu le rayon pour ne pas planter des arbres dans la pente de la mer
            const radius = Math.random() * 10;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // On ajuste la hauteur (y) pour coller à la nouvelle forme aplatie
            // La formule doit suivre la courbure de la sphère aplatie
            // y = 0 est le centre, c'est plat, donc on met juste un petit offset
            const y = 0.2;

            const type = Math.random();

            if (type > 0.7) {
                this.createTree(new BABYLON.Vector3(x, y, z), shadowGenerator);
            } else if (type > 0.5) {
                this.createRock(new BABYLON.Vector3(x, y, z), shadowGenerator);
            } else {
                this.createBush(new BABYLON.Vector3(x, y, z), islandColor);
            }
        }
    },

    createTree(pos, shadowGenerator) {
        // Tronc
        const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", {height: 1.5, diameter: 0.5}, this.scene);
        trunk.position = pos.add(new BABYLON.Vector3(0, 0.75, 0));
        const trunkMat = new BABYLON.StandardMaterial("trunkMat", this.scene);
        trunkMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
        trunk.material = trunkMat;

        // Feuillage (Low Poly Cone)
        const leaves = BABYLON.MeshBuilder.CreateCylinder("leaves", {diameterTop: 0, diameterBottom: 2.5, height: 3, tessellation: 6}, this.scene);
        leaves.position = pos.add(new BABYLON.Vector3(0, 2.5, 0));
        const leavesMat = new BABYLON.StandardMaterial("leavesMat", this.scene);
        leavesMat.diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.2); // Vert foncé
        leaves.material = leavesMat;
        leaves.convertToFlatShadedMesh();

        // Ombres
        shadowGenerator.addShadowCaster(leaves);
        shadowGenerator.addShadowCaster(trunk);

        // Random rotation
        leaves.rotation.y = Math.random() * Math.PI;

        // Optimisation : fusionner ou grouper si besoin, mais ici on laisse séparé pour la simplicité
    },

    createRock(pos, shadowGenerator) {
        const rock = BABYLON.MeshBuilder.CreateIcoSphere("rock", {radius: Math.random() * 0.5 + 0.3, subdivisions: 1, flat: true}, this.scene);
        rock.position = pos.add(new BABYLON.Vector3(0, 0.3, 0));
        rock.scaling = new BABYLON.Vector3(1, 0.7, 1);
        rock.rotation = new BABYLON.Vector3(Math.random(), Math.random(), Math.random());

        const mat = new BABYLON.StandardMaterial("rockMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5); // Gris
        rock.material = mat;

        shadowGenerator.addShadowCaster(rock);
    },

    createBush(pos, color) {
        const bush = BABYLON.MeshBuilder.CreateIcoSphere("bush", {radius: Math.random() * 0.4 + 0.2, subdivisions: 0}, this.scene);
        bush.position = pos.add(new BABYLON.Vector3(0, 0.2, 0));

        const mat = new BABYLON.StandardMaterial("bushMat", this.scene);
        // Un peu plus clair que le sol
        mat.diffuseColor = color.scale(1.2);
        bush.material = mat;
        bush.convertToFlatShadedMesh();
    },

    createInsects() {
        if (!this.currentIsland || !this.currentIsland.insects) return;

        this.currentIsland.insects.forEach((insectData) => {
            // 1. HITBOX INVISIBLE (Pour éviter les bugs de clic)
            const hitBox = BABYLON.MeshBuilder.CreateSphere("hit_" + insectData.id, {diameter: 3}, this.scene);
            hitBox.position = new BABYLON.Vector3(insectData.position.x, insectData.position.y + 1.5, insectData.position.z);
            hitBox.visibility = 0; // Invisible

            // 2. L'INSECTE VISUEL (Orbe Magique)
            const orb = BABYLON.MeshBuilder.CreateSphere("orb_" + insectData.id, {diameter: 1}, this.scene);
            orb.parent = hitBox;
            orb.isPickable = false;

            const mat = new BABYLON.StandardMaterial("insectMat", this.scene);
            mat.diffuseColor = new BABYLON.Color3(1, 0.9, 0); // Jaune or
            mat.emissiveColor = new BABYLON.Color3(0.8, 0.6, 0); // Glow
            mat.alpha = 0.9;
            orb.material = mat;

            // 3. EFFET DE PARTICULES (Pour qu'on le voie bien dans l'herbe)
            // Simple anneau qui tourne autour
            const ring = BABYLON.MeshBuilder.CreateTorus("ring", {diameter: 1.8, thickness: 0.1, tessellation: 16}, this.scene);
            ring.parent = hitBox;
            ring.rotation.x = Math.PI / 2;
            ring.material = mat;
            ring.isPickable = false;

            // --- INTERACTIONS ---
            hitBox.actionManager = new BABYLON.ActionManager(this.scene);

            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                document.body.style.cursor = "pointer";
                // Agrandir l'orbe
                this.scene.stopAnimation(orb);
                BABYLON.Animation.CreateAndStartAnimation("grow", orb, "scaling", 60, 15, orb.scaling, new BABYLON.Vector3(1.5, 1.5, 1.5), 0, new BABYLON.ElasticEase());
            }));

            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                document.body.style.cursor = "default";
                // Rétrécir
                this.scene.stopAnimation(orb);
                BABYLON.Animation.CreateAndStartAnimation("shrink", orb, "scaling", 60, 15, orb.scaling, new BABYLON.Vector3(1, 1, 1), 0, new BABYLON.ElasticEase());
            }));

            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                ArchipelagoApp.selectInsect(insectData);
                // Petit effet de flash au clic
                const flash = BABYLON.MeshBuilder.CreateSphere("flash", {diameter: 0.5}, this.scene);
                flash.position = hitBox.position.clone();
                flash.material = mat;
                BABYLON.Animation.CreateAndStartAnimation("flashAnim", flash, "scaling", 60, 20, new BABYLON.Vector3(1,1,1), new BABYLON.Vector3(10,10,10), 0, null, () => flash.dispose());
                BABYLON.Animation.CreateAndStartAnimation("fadeOut", flash, "visibility", 60, 20, 1, 0, 0);
            }));

            this.insectsMeshes.push({ mesh: hitBox, visual: orb, ring: ring, offset: Math.random() * 10 });
        });
    },

    animateScene() {
        this.time += 0.02;

        // Animation de l'eau
        if (this.oceanMesh) {
            this.oceanMesh.position.y = -0.5 + Math.sin(this.time * 0.5) * 0.1;
        }

        // Animation des insectes (Flottement + Rotation anneaux)
        this.insectsMeshes.forEach(item => {
            // Mouvement vertical doux (Hitbox entière bouge)
            item.mesh.position.y += Math.sin(this.time + item.offset) * 0.005;

            // Rotation de l'anneau
            item.ring.rotation.y += 0.05;
            item.ring.rotation.x = (Math.PI / 2) + Math.sin(this.time) * 0.2;
        });
    },

    dispose() {
        if (this.engine) this.engine.stopRenderLoop();
        if (this.scene) { this.scene.dispose(); this.scene = null; }
        if (this.engine) { this.engine.dispose(); this.engine = null; }
        this.insectsMeshes = [];
    },
};