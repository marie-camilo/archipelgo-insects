const IslandScene = {
    scene: null,
    engine: null,
    camera: null,
    currentIsland: null,
    insectsMeshes: [],
    arrivalBoat: null,
    guiTexture: null,
    activeSystems: [],

    time: 0,
    initialRadius: 100,

    init(islandId) {
        const canvas = document.getElementById("islandCanvas");
        if (!canvas) return;

        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.currentIsland = ISLANDS_DATA.find(i => i.id === islandId);

        // 1. AMBIANCE COULEUR & BROUILLARD
        let skyColor = new BABYLON.Color3(0.65, 0.85, 0.95); // Ciel bleu par défaut
        let fogColor = skyColor;
        let fogStart = 600; // Par défaut : loin pour bien voir l'île

        // Configuration spécifique par ambiance
        if (this.currentIsland.ambiance === "snow") {
            skyColor = new BABYLON.Color3(0.75, 0.80, 0.85); // Gris froid
            fogColor = new BABYLON.Color3(0.7, 0.75, 0.8);
            fogStart = 400; // Brouillard un peu plus près pour la neige
        }
        else if (this.currentIsland.ambiance === "rain") {
            skyColor = new BABYLON.Color3(0.4, 0.45, 0.5); // Ciel gris orageux
            fogColor = new BABYLON.Color3(0.35, 0.4, 0.45);
            fogStart = 300; // Ambiance dense
        }
        else if (this.currentIsland.ambiance === "wind") {
            skyColor = new BABYLON.Color3(0.6, 0.7, 0.8); // Ciel venteux clair
            fogStart = 1000; // Très dégagé, on est en altitude
        }

        this.scene.clearColor = new BABYLON.Color4(skyColor.r, skyColor.g, skyColor.b, 1);

        // Brouillard : dense au loin, clair près de l'île
        this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        this.scene.fogStart = fogStart;
        this.scene.fogEnd = 3000;
        this.scene.fogColor = fogColor;

        // 2. CAMÉRA
        this.camera = new BABYLON.ArcRotateCamera("islandCam", -Math.PI/2, Math.PI/3, 100, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(canvas, true);
        this.camera.upperBetaLimit = Math.PI / 2 - 0.1;
        this.camera.wheelPrecision = 2;

        // 3. LUMIÈRES
        const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = (this.currentIsland.ambiance === "rain") ? 0.6 : 0.9; // Plus sombre s'il pleut

        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -0.8, -1), this.scene);
        dirLight.position = new BABYLON.Vector3(100, 100, 50);
        dirLight.intensity = (this.currentIsland.ambiance === "rain") ? 1.0 : 2.0;

        const shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;

        // 4. CHARGEMENT
        this.createOcean();
        this.loadIslandModel(shadowGenerator).then(() => {
            this.loadArrivalBoat(shadowGenerator);
            setTimeout(() => {
                this.createInsects();
                this.createAtmosphere(); // Lancement de la météo
            }, 200);
        });

        // 5. RENDU
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.animateScene();
                this.scene.render();
            }
        });
        window.addEventListener("resize", () => this.engine.resize());
    },

    // ─────────────────────────────────────────────────────────────────
    // GESTION DES AMBIANCES (MÉTÉO)
    // ─────────────────────────────────────────────────────────────────

    createAtmosphere() {
        const type = this.currentIsland.ambiance;
        if (!type) return;

        this.disposeAtmosphere();

        // Texture "Flare" générique
        const particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.scene);
        // Texture "Triangle" pour les oiseaux/feuilles (générée dynamiquement si besoin, mais on utilise flare déformé ici)

        const createSystem = (name, capacity) => {
            const sys = new BABYLON.ParticleSystem(name, capacity, this.scene);
            sys.particleTexture = particleTexture;
            this.activeSystems.push(sys);
            return sys;
        };

        if (type === "snow") {

            // --- NEIGE ---
            const snow = createSystem("snow", 5000);
            snow.emitter = new BABYLON.Vector3(0, 150, 0);
            snow.minEmitBox = new BABYLON.Vector3(-300, 0, -300);
            snow.maxEmitBox = new BABYLON.Vector3(300, 0, 300);

            snow.color1 = new BABYLON.Color4(1, 1, 1, 0.9);
            snow.color2 = new BABYLON.Color4(1, 1, 1, 0.9);
            snow.colorDead = new BABYLON.Color4(1, 1, 1, 0.0);
            snow.minSize = 0.5; snow.maxSize = 1.2;
            snow.minLifeTime = 8; snow.maxLifeTime = 12;
            snow.emitRate = 400;
            snow.gravity = new BABYLON.Vector3(0, -3, 0);
            snow.start();
        }
        else if (type === "pollen") {
            // --- POLLEN & LUCIOLES ---
            const pollen = createSystem("pollen", 1000);
            pollen.emitter = new BABYLON.Vector3(0, 30, 0);
            pollen.minEmitBox = new BABYLON.Vector3(-100, 0, -100);
            pollen.maxEmitBox = new BABYLON.Vector3(100, 0, 100);
            pollen.color1 = new BABYLON.Color4(0.9, 0.9, 0.7, 0.4);
            pollen.color2 = new BABYLON.Color4(0.9, 0.9, 0.7, 0.1);
            pollen.minSize = 0.1; pollen.maxSize = 0.4;
            pollen.minLifeTime = 8; pollen.maxLifeTime = 12;
            pollen.emitRate = 80;
            pollen.gravity = new BABYLON.Vector3(0, -0.1, 0);
            pollen.start();

            const fireflies = createSystem("fireflies", 200);
            fireflies.emitter = new BABYLON.Vector3(0, 10, 0);
            fireflies.minEmitBox = new BABYLON.Vector3(-80, -5, -80);
            fireflies.maxEmitBox = new BABYLON.Vector3(80, 20, 80);
            fireflies.color1 = new BABYLON.Color4(1, 0.8, 0.2, 1.0);
            fireflies.color2 = new BABYLON.Color4(1, 0.5, 0.1, 1.0);
            fireflies.minSize = 0.8; fireflies.maxSize = 1.2;
            fireflies.minLifeTime = 3; fireflies.maxLifeTime = 6;
            fireflies.emitRate = 30;
            fireflies.gravity = new BABYLON.Vector3(0, 0.5, 0);
            fireflies.start();
        }
        else if (type === "rain") {

            // --- PLUIE INTENSE ---
            const rain = createSystem("rain", 4000);
            rain.emitter = new BABYLON.Vector3(0, 100, 0);
            rain.minEmitBox = new BABYLON.Vector3(-150, 0, -150);
            rain.maxEmitBox = new BABYLON.Vector3(150, 0, 150);

            // Couleur gris-bleu semi-transparent
            rain.color1 = new BABYLON.Color4(0.6, 0.7, 0.8, 0.6);
            rain.color2 = new BABYLON.Color4(0.6, 0.7, 0.8, 0.4);
            rain.colorDead = new BABYLON.Color4(0.5, 0.5, 0.6, 0.0);

            rain.minSize = 0.4;
            rain.maxSize = 0.8;

            // Étirement pour faire des traits
            rain.isBillboardBased = false;

            rain.minLifeTime = 0.5;
            rain.maxLifeTime = 0.8;
            rain.emitRate = 1200; // Forte pluie

            // Vitesse de chute très rapide
            rain.gravity = new BABYLON.Vector3(0, -150, 0);
            rain.direction1 = new BABYLON.Vector3(0, -30, 0);
            rain.direction2 = new BABYLON.Vector3(0, -30, 0);

            rain.start();
        }
        else if (type === "wind") {
            // --- OISEAUX & VENT (ARCHIPEL DES CIMES) ---

            // 1. Feuilles / Poussière portées par le vent
            const wind = createSystem("windParticles", 500);
            wind.emitter = new BABYLON.Vector3(-200, 50, -50); // Vient de côté
            wind.minEmitBox = new BABYLON.Vector3(0, -50, -100);
            wind.maxEmitBox = new BABYLON.Vector3(0, 50, 100);

            wind.color1 = new BABYLON.Color4(1, 1, 1, 0.5);
            wind.color2 = new BABYLON.Color4(1, 1, 1, 0.0);

            wind.minSize = 0.5;
            wind.maxSize = 1.5;
            wind.minLifeTime = 4;
            wind.maxLifeTime = 6;
            wind.emitRate = 50;

            // Vent horizontal fort
            wind.gravity = new BABYLON.Vector3(30, -2, 0);
            wind.direction1 = new BABYLON.Vector3(40, 0, 0);
            wind.direction2 = new BABYLON.Vector3(60, 5, 0);
            wind.minAngularSpeed = 0;
            wind.maxAngularSpeed = Math.PI;

            wind.start();

            // 2. Oiseaux au loin (Particules déformées)
            const birds = createSystem("birds", 40);
            birds.emitter = new BABYLON.Vector3(0, 60, 0);
            birds.minEmitBox = new BABYLON.Vector3(-200, 0, -200);
            birds.maxEmitBox = new BABYLON.Vector3(200, 20, 200);

            birds.color1 = new BABYLON.Color4(0.2, 0.2, 0.2, 1); // Noirs
            birds.color2 = new BABYLON.Color4(0.2, 0.2, 0.2, 1);

            birds.minSize = 1;
            birds.maxSize = 2;
            birds.isBillboardBased = true;

            birds.minLifeTime = 10;
            birds.maxLifeTime = 15;
            birds.emitRate = 2; // Rares

            // Vol circulaire large
            birds.gravity = new BABYLON.Vector3(0, 0, 0);

            // Update function custom pour faire tourner les oiseaux
            birds.updateFunction = function(particles) {
                for (var index = 0; index < particles.length; index++) {
                    var particle = particles[index];
                    particle.age += this._scaledUpdateSpeed;

                    // Mouvement circulaire
                    particle.position.x += Math.cos(particle.age) * 0.5;
                    particle.position.z += Math.sin(particle.age) * 0.5;
                    particle.position.y += Math.sin(particle.age * 3) * 0.1; // Battement léger

                    if (particle.age >= particle.lifeTime) {
                        this.recycleParticle(particle);
                        index--;
                    }
                }
            };

            birds.start();
        }
    },

    disposeAtmosphere() {
        if (this.activeSystems.length > 0) {
            this.activeSystems.forEach(sys => {
                sys.stop();
                sys.dispose();
            });
            this.activeSystems = [];
        }
    },

    // ─────────────────────────────────────────────────────────────────
    // RESTE DU CODE STANDARD
    // ─────────────────────────────────────────────────────────────────

    createOcean() {
        const waterMesh = BABYLON.MeshBuilder.CreateGround("ocean", { width: 2000, height: 2000, subdivisions: 120, updatable: true }, this.scene);
        waterMesh.convertToFlatShadedMesh();
        const waterMat = new BABYLON.StandardMaterial("waterMat", this.scene);
        waterMat.diffuseColor = new BABYLON.Color3(0.02, 0.05, 0.15);
        waterMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        waterMat.alpha = 0.95;
        waterMesh.material = waterMat;
        waterMesh.position.y = this.currentIsland.waterLevel !== undefined ? this.currentIsland.waterLevel : 0;
        waterMesh.receiveShadows = true;
        this.waterMesh = waterMesh;
        this.basePositions = waterMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    },

    loadArrivalBoat(shadowGenerator) {
        BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "boat.glb", this.scene)
            .then((result) => {
                const boatRoot = result.meshes[0];
                this.arrivalBoat = boatRoot;

                const config = this.currentIsland.boatConfig || { position: { x: 50, z: 50 }, rotationY: 0 };
                const waterY = this.currentIsland.waterLevel !== undefined ? this.currentIsland.waterLevel : 0;
                let posZ = Number(config.position.z);

                boatRoot.position = new BABYLON.Vector3(config.position.x, waterY + 0.5, posZ);
                boatRoot.rotationQuaternion = null;
                boatRoot.rotation.y = config.rotationY;
                const bScale = config.boatScale !== undefined ? config.boatScale : 15;
                boatRoot.scaling = new BABYLON.Vector3(bScale, bScale, bScale);

                // --- 1. GESTION DU CLIC SUR LE MESH ---
                const boatActionManager = new BABYLON.ActionManager(this.scene);

                // Animation curseur et bouton
                boatActionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                    document.body.style.cursor = "pointer";
                    if (this.btnCircle) {
                        this.btnCircle.scaleX = 1.15;
                        this.btnCircle.scaleY = 1.15;
                        this.btnCircle.background = "white";
                    }
                }));
                boatActionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                    document.body.style.cursor = "default";
                    if (this.btnCircle) {
                        this.btnCircle.scaleX = 1.0;
                        this.btnCircle.scaleY = 1.0;
                        this.btnCircle.background = "rgba(255, 255, 255, 0.9)";
                    }
                }));
                // Clic
                boatActionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                    UIManager.showReturnMapConfirmation();
                }));

                result.meshes.forEach(m => {
                    m.receiveShadows = true;
                    shadowGenerator.addShadowCaster(m);
                    if (m.material) m.material.fogEnabled = false;
                    m.isPickable = true;
                    m.actionManager = boatActionManager;
                });

                // --- 2. CRÉATION DE L'UI MODERNE ---
                this.guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

                // A. Le bouton rond (Floating Action Button style)
                const circle = new BABYLON.GUI.Ellipse();
                circle.width = "45px";
                circle.height = "45px";
                circle.color = "#ccc"; // Bordure très fine et discrète
                circle.thickness = 1;
                circle.background = "rgba(255, 255, 255, 0.9)"; // Blanc propre

                // On attache
                this.guiTexture.addControl(circle);
                circle.linkWithMesh(boatRoot);
                circle.linkOffsetY = -70; // Position juste au dessus

                this.btnCircle = circle;

                // B. L'icône FontAwesome
                const icon = new BABYLON.GUI.TextBlock();
                icon.text = "⚓";
                icon.fontFamily = "Font Awesome 6 Free";
                icon.fontWeight = 900;
                icon.fontSize = 20;
                circle.addControl(icon);

                // C. Interactivité du bouton UI
                circle.isPointerBlocker = true;
                circle.onPointerUpObservable.add(() => {
                    UIManager.showReturnMapConfirmation();
                });

                // Animations Hover sur l'UI directement
                circle.onPointerEnterObservable.add(() => {
                    document.body.style.cursor = "pointer";
                    circle.scaleX = 1.15;
                    circle.scaleY = 1.15;
                    circle.background = "white";
                });
                circle.onPointerOutObservable.add(() => {
                    document.body.style.cursor = "default";
                    circle.scaleX = 1.0;
                    circle.scaleY = 1.0;
                    circle.background = "rgba(255, 255, 255, 0.9)";
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

                // Calcul de la caméra auto
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
            const ray = new BABYLON.Ray(new BABYLON.Vector3(posX, 1000, posZ), new BABYLON.Vector3(0, -1, 0), 2000);
            const hit = this.scene.pickWithRay(ray, (m) => m.name !== "ocean" && m.isVisible && m.isPickable !== false);
            let groundY = hit.hit ? hit.pickedPoint.y : 0;
            let altitude = insectData.altitude !== undefined ? insectData.altitude : 0.5;
            let finalY = groundY + altitude;

            const hitBox = BABYLON.MeshBuilder.CreateSphere("hit_" + insectData.id, {diameter: 5}, this.scene);
            hitBox.position = new BABYLON.Vector3(posX, finalY, posZ);
            hitBox.visibility = 0;
            hitBox.isPickable = true;

            const modelName = insectData.modelFile || "sphere.glb";
            const scale = insectData.modelScale || 1;

            BABYLON.SceneLoader.ImportMeshAsync("", "./assets/insects/", modelName, this.scene)
                .then((result) => {
                    const insectRoot = result.meshes[0];
                    insectRoot.parent = hitBox;
                    insectRoot.scaling = new BABYLON.Vector3(scale, scale, scale);
                    insectRoot.position = BABYLON.Vector3.Zero();
                    result.meshes.forEach(m => { m.isPickable = false; });
                    this.insectsMeshes.push({ visual: insectRoot, hitbox: hitBox, offset: Math.random() * 100 });
                });

            hitBox.actionManager = new BABYLON.ActionManager(this.scene);
            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                document.body.style.cursor = "pointer";
            }));
            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                document.body.style.cursor = "default";
            }));
            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                this.camera.detachControl();
                this.zoomOnInsect(hitBox.position);
                setTimeout(() => {
                    if(typeof ArchipelagoApp !== 'undefined') {
                        ArchipelagoApp.selectInsect(insectData);
                    }
                    const canvas = document.getElementById("islandCanvas");
                    if(canvas) this.camera.attachControl(canvas, true);
                }, 500);
            }));
        });
    },

    animateScene() {
        this.time += 0.01;
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
        if (this.arrivalBoat) {
            this.arrivalBoat.position.y = (this.currentIsland.waterLevel || 0) + Math.sin(this.time * 1.5) * 0.4;
            this.arrivalBoat.rotation.z = Math.sin(this.time) * 0.05;
            this.arrivalBoat.rotation.x = Math.cos(this.time * 0.7) * 0.03;
        }
        this.insectsMeshes.forEach(item => {
            if(item.visual) {
                item.visual.position.y = Math.sin(this.time * 2 + item.offset) * 0.2;
                item.visual.rotation.y += 0.005;
            }
        });
    },

    zoomOnInsect(targetPosition) {
        this.scene.stopAnimation(this.camera);
        const duration = 25;
        const easing = new BABYLON.CubicEase();
        easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        BABYLON.Animation.CreateAndStartAnimation("camTarget", this.camera, "target", 60, duration, this.camera.target.clone(), targetPosition.clone(), BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing);
        BABYLON.Animation.CreateAndStartAnimation("camRadius", this.camera, "radius", 60, duration, this.camera.radius, 15, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing);
        BABYLON.Animation.CreateAndStartAnimation("camBeta", this.camera, "beta", 60, duration, this.camera.beta, Math.PI / 2.5, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing);
    },

    resetView() {
        if (!this.camera) return;
        this.scene.stopAnimation(this.camera);
        const canvas = document.getElementById("islandCanvas");
        if(canvas) this.camera.attachControl(canvas, true);
        const duration = 30;
        const easing = new BABYLON.CubicEase();
        easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        BABYLON.Animation.CreateAndStartAnimation("resetTarget", this.camera, "target", 60, duration, this.camera.target.clone(), new BABYLON.Vector3(0, 0, 0), BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing);
        BABYLON.Animation.CreateAndStartAnimation("resetRadius", this.camera, "radius", 60, duration, this.camera.radius, this.initialRadius || 100, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing);
    },

    dispose() {
        if (this.engine) this.engine.stopRenderLoop();
        this.disposeAtmosphere();

        if (this.guiTexture) {
            this.guiTexture.dispose();
            this.guiTexture = null;
        }

        if (this.scene) { this.scene.dispose(); this.scene = null; }
        if (this.engine) { this.engine.dispose(); this.engine = null; }
        this.insectsMeshes = [];
        this.waterMesh = null;
    }
};