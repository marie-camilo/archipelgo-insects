const DECOR_DATA = [
    { model: "island.glb", pos: { x: -39.29, y: -7, z: -4.73 }, scale: 10, rot: 1.5 },
    { model: "island.glb", pos: { x: -32.11, y: -3.2, z: -9.16 }, scale: 4, rot: 7 },
    { model: "island.glb", pos: { x: 7.66, y: -3, z: -41.25 }, scale: 4, rot: 1.5 },
    { model: "island.glb", pos: { x: -1.26, y: -7, z: -47.60 }, scale: 12, rot: 2 },
    { model: "island.glb", pos: { x: -52.10, y: -30, z: -83.20 }, scale: 45, rot: 4 },
    { model: "island.glb", pos: { x: -108.23, y: -20, z: -21.75 }, scale: 32, rot: 1.5 },

    // Devant les iles
    { model: "island.glb", pos: { x: 100.90, y: -20, z: -39.90 }, scale: 32, rot: 1 },
    { model: "island.glb", pos: { x: 76.42, y: -15, z: -54.33 }, scale: 23, rot: 4 },
    { model: "island.glb", pos: { x: 79, y: -7, z: -13 }, scale: 10, rot: 4 },


    { model: "floating-little-islands.glb", pos: { x: 17.91, y: 5, z: -55.78 }, scale: 10, rot: 1.5 },
    { model: "floating-little-islands.glb", pos: { x: -15.99, y: 3, z: 51.55 },scale: 8, rot: 1.5 },

    { model: "island.glb", pos: { x: -57.16, y: -7, z: -36.67 }, scale: 10, rot: 1.5 },
    { model: "island.glb", pos: { x: -22.62, y: -25, z: 82.26 }, scale: 35, rot: 1.5 },
    { model: "island.glb", pos: { x: -12.53, y: -7, z: 112.39 }, scale: 12, rot: 1.5 },
    { model: "island.glb", pos: { x: -10.22, y: -8, z: -85.64 }, scale: 12, rot: 1.5 },
    { model: "island.glb", pos: { x: 4.07, y: -15, z: -111.22 }, scale: 22, rot: 1.5 },


    { model: "island-fox.glb", pos: { x: -2.15, y: 2.4, z: -9.29 }, scale: 2, rot: 0.5 },
];

const MapScene = {
    engine: null,
    scene: null,
    camera: null,
    islands: [],
    decorMeshes: [],
    boatMesh: null,
    realBirds: [],
    time: 0,
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

        // Brouillard Linéaire
        this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        this.scene.fogStart = 60.0;
        this.scene.fogEnd = 300.0;
        this.scene.fogColor = skyColor;

        const gl = new BABYLON.GlowLayer("glow", this.scene);
        gl.intensity = 0.3;

        // --- CAMÉRA ---
        this.camera = new BABYLON.ArcRotateCamera("camera", -Math.PI/2, 1.2, 90, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(canvas, true);
        this.camera.lowerRadiusLimit = 25;
        this.camera.upperRadiusLimit = 150;
        this.camera.upperBetaLimit = Math.PI / 2 - 0.1;
        this.camera.wheelPrecision = 10;
        this.camera.useAutoRotationBehavior = true;
        this.camera.autoRotationBehavior.idleRotationSpeed = 0.05;

        // --- LUMIÈRES ---
        const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 0.8;

        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -0.5, -1), this.scene);
        dirLight.position = new BABYLON.Vector3(50, 20, 10);
        dirLight.diffuse = new BABYLON.Color3(1, 0.9, 0.7);
        dirLight.specular = new BABYLON.Color3(1, 0.8, 0.6);
        dirLight.intensity = 2.0;

        const shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;

        // --- CRÉATION DU MONDE ---
        this.createOcean();
        this.loadBaseCamp(shadowGenerator);
        this.loadIslands(shadowGenerator);
        this.loadDecor(shadowGenerator);
        this.createBirds(); // Particules (ambiance)
        this.loadRealBirds(); // Vrais modèles 3D (modifié)

        // UI
        const mapUI = document.querySelector('.map-ui-bottom');
        if(mapUI) mapUI.style.opacity = "1";

        // --- BOUCLE ---
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.animateEnvironment();
                this.scene.render();
            }
        });

        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh.name === "ocean") {
                    const p = pointerInfo.pickInfo.pickedPoint;
                    console.log(`📍 Position: { x: ${p.x.toFixed(2)}, z: ${p.z.toFixed(2)} },`);
                }
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
        const pivot = new BABYLON.TransformNode("baseCampPivot", this.scene);
        pivot.position = new BABYLON.Vector3(40, 0, 50);
        const hitBox = BABYLON.MeshBuilder.CreateSphere("baseCampHit", {diameter: 25}, this.scene);
        hitBox.parent = pivot; hitBox.position.y = 5; hitBox.visibility = 0; hitBox.isPickable = true;

        BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "port.glb", this.scene).then((r) => {
            r.meshes[0].parent = pivot;
            r.meshes[0].scaling = new BABYLON.Vector3(20, 20, 20);

            // CORRECTION FOG : On désactive le brouillard sur le port pour qu'il soit bien visible
            r.meshes.forEach(m => {
                if(m.material) m.material.fogEnabled = false;
            });
        });

        BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "boat.glb", this.scene).then((r) => {
            const boat = r.meshes[0];
            boat.position = new BABYLON.Vector3(38, 0.2, 30);
            boat.rotation.y = -Math.PI / 4;
            boat.scaling = new BABYLON.Vector3(5, 5, 5);
            this.boatMesh = boat;
            shadowGenerator.addShadowCaster(boat);

            // CORRECTION FOG : On désactive le brouillard sur le bateau
            r.meshes.forEach(m => {
                if(m.material) m.material.fogEnabled = false;
            });
        });

        hitBox.actionManager = new BABYLON.ActionManager(this.scene);
        hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
            if (this.isNavigating) return; document.body.style.cursor = "pointer"; if (typeof UIManager !== 'undefined') UIManager.showBaseCampTooltip(hitBox);
        }));
        hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
            document.body.style.cursor = "default"; if (typeof UIManager !== 'undefined') UIManager.hideIslandTooltip();
        }));
        hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
            if (this.isNavigating) return; this.zoomToBaseCamp(pivot.absolutePosition.clone(), null);
        }));
    },

    loadDecor(shadowGenerator) {
        DECOR_DATA.forEach((item, i) => {
            const pivot = new BABYLON.TransformNode("decor_" + i, this.scene);

            // On récupère la position Y définie dans les données, sinon -1 par défaut
            const baseY = item.pos.y !== undefined ? item.pos.y : -1;

            pivot.position = new BABYLON.Vector3(item.pos.x, baseY, item.pos.z);
            pivot.rotation.y = item.rot;

            BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", item.model, this.scene).then((result) => {
                const root = result.meshes[0];
                root.parent = pivot;
                root.scaling = new BABYLON.Vector3(item.scale, item.scale, item.scale);

                result.meshes.forEach(m => {
                    m.isPickable = false;
                    m.receiveShadows = true;
                    if(m.material) m.material.fogEnabled = false;
                });

                // On stocke le baseY pour l'animation
                this.decorMeshes.push({ pivot: pivot, offset: Math.random() * 100, baseY: baseY });
            });
        });
    },

    loadIslands(shadowGenerator) {
        if (typeof ISLANDS_DATA === 'undefined') return;
        ISLANDS_DATA.forEach((islandData, index) => {
            const pivot = new BABYLON.TransformNode("pivot_" + islandData.id, this.scene);

            // Gestion de la hauteur de base
            const baseY = islandData.position.y || 0;
            pivot.position = new BABYLON.Vector3(islandData.position.x, baseY, islandData.position.z);

            const hitBox = BABYLON.MeshBuilder.CreateSphere("hit_" + islandData.id, {diameter: 12}, this.scene);
            hitBox.parent = pivot;
            hitBox.position.y = islandData.hitboxOffset !== undefined ? islandData.hitboxOffset : 5;
            if (islandData.hitboxScale) hitBox.scaling = new BABYLON.Vector3(islandData.hitboxScale, islandData.hitboxScale, islandData.hitboxScale);
            hitBox.visibility = 0; hitBox.isPickable = true;

            BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", islandData.modelFile, this.scene).then((result) => {
                const root = result.meshes[0]; root.parent = pivot;
                const rawScale = islandData.scale || 1;
                const baseScaleVector = new BABYLON.Vector3(rawScale, rawScale, rawScale);
                root.scaling = baseScaleVector.clone();

                result.meshes.forEach(m => {
                    m.isPickable = false;
                    m.receiveShadows = true;
                    shadowGenerator.addShadowCaster(m);
                    if (m.material) m.material.fogEnabled = false;
                });
                this.islands[index].visualMesh = root;
                this.islands[index].baseScaleVector = baseScaleVector;
            }).catch((err) => console.error("Erreur chargement modèle:", islandData.modelFile, err));

            // Gestion Events (Tooltip, Click...) identique
            hitBox.actionManager = new BABYLON.ActionManager(this.scene);
            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                if (this.isNavigating) return; document.body.style.cursor = "pointer";
                const item = this.islands[index];
                if(item && item.visualMesh) {
                    this.scene.stopAnimation(item.visualMesh);
                    const targetScale = item.baseScaleVector.scale(1.15);
                    BABYLON.Animation.CreateAndStartAnimation("grow", item.visualMesh, "scaling", 60, 15, item.visualMesh.scaling, targetScale, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, new BABYLON.CubicEase());
                }
                if (typeof UIManager !== 'undefined') UIManager.showIslandTooltip(islandData, hitBox);
            }));
            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                document.body.style.cursor = "default";
                const item = this.islands[index];
                if(item && item.visualMesh) {
                    this.scene.stopAnimation(item.visualMesh);
                    BABYLON.Animation.CreateAndStartAnimation("shrink", item.visualMesh, "scaling", 60, 15, item.visualMesh.scaling, item.baseScaleVector, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, new BABYLON.CubicEase());
                }
                if (typeof UIManager !== 'undefined') UIManager.hideIslandTooltip();
            }));
            hitBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                if (this.isNavigating) return; UIManager.showIslandConfirmation(islandData);
            }));

            // Ajout du baseY dans l'objet stocké
            this.islands.push({ pivot: pivot, data: islandData, offset: index, visualMesh: null, baseScaleVector: null, baseY: baseY });
        });
    },

    // --- FAUX OISEAUX (PARTICULES) ---
    // --- FAUX OISEAUX (PARTICULES) : Plus petits et discrets ---
    createBirds() {
        const birdSystem = new BABYLON.ParticleSystem("birds", 200, this.scene);
        birdSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.scene);

        birdSystem.emitter = new BABYLON.Vector3(0, 20, 0); // Un peu plus haut pour la discrétion
        birdSystem.minEmitBox = new BABYLON.Vector3(-150, 0, -150);
        birdSystem.maxEmitBox = new BABYLON.Vector3(150, 10, 150);

        // MODIFICATION : Taille réduite (0.2 à 0.5 au lieu de 0.6 à 1.2)
        birdSystem.minSize = 0.2;
        birdSystem.maxSize = 0.5;

        birdSystem.isBillboardBased = true;

        // MODIFICATION : Couleur légèrement plus transparente pour être discret
        birdSystem.color1 = new BABYLON.Color4(1, 1, 1, 0.6);
        birdSystem.color2 = new BABYLON.Color4(0.8, 0.8, 0.8, 0.6);
        birdSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);

        birdSystem.minLifeTime = 10; birdSystem.maxLifeTime = 20;
        birdSystem.emitRate = 10;

        birdSystem.direction1 = new BABYLON.Vector3(-1, 0, -1);
        birdSystem.direction2 = new BABYLON.Vector3(1, 0.2, 1);

        birdSystem.updateFunction = function(particles) {
            for (var index = 0; index < particles.length; index++) {
                var particle = particles[index];
                particle.age += this._scaledUpdateSpeed;
                particle.position.x += Math.cos(particle.age * 0.5) * 0.2;
                particle.position.z += Math.sin(particle.age * 0.5) * 0.2;
                if (particle.age >= particle.lifeTime) {
                    this.recycleParticle(particle);
                    index--;
                    continue;
                }
            }
        };
        birdSystem.start();
    },

    // --- VRAIS OISEAUX (VOL LINÉAIRE CORRIGÉ) ---
    loadRealBirds() {
        const lanes = [-20, 10, 40]; // Profondeur de vol

        for(let i=0; i<3; i++) {
            BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "flying-bird.glb", this.scene).then((result) => {
                const birdMesh = result.meshes[0];

                // 1. CRÉATION D'UN CONTENEUR (C'est lui qui va voler)
                const birdRoot = new BABYLON.TransformNode("birdRoot" + i, this.scene);

                // 2. PLACEMENT DE L'OISEAU DANS LE CONTENEUR
                birdMesh.parent = birdRoot;

                // 3. CORRECTION DE LA ROTATION (LA CLÉ EST ICI)
                // On vide le Quaternion pour pouvoir utiliser la rotation normale
                birdMesh.rotationQuaternion = null;

                // On tourne l'oiseau de 90° dans son conteneur pour qu'il regarde vers la droite
                birdMesh.rotation.y = Math.PI / 2;

                // 4. TAILLE ET POSITIONS
                birdMesh.scaling = new BABYLON.Vector3(6, 6, 6);

                // On positionne le CONTENEUR au départ (à gauche de l'écran)
                birdRoot.position = new BABYLON.Vector3(-250 - (i * 50), 2 + (i * 3), lanes[i]);

                // Correction Fog
                result.meshes.forEach(m => {
                    if(m.material) m.material.fogEnabled = false;
                });

                // Animation des ailes
                if(result.animationGroups.length > 0) {
                    result.animationGroups[0].speedRatio = 1.5;
                    result.animationGroups[0].play(true);
                }

                // On stocke le CONTENEUR (birdRoot) pour le déplacer, pas le mesh
                this.realBirds.push({
                    root: birdRoot,
                    speed: 0.4 + (Math.random() * 0.2)
                });
            });
        }
    },

    zoomToBaseCamp(targetPos, callbackOnArrival) {
        if (typeof UIManager !== 'undefined') UIManager.hideIslandTooltip();
        this.isNavigating = true;
        this.scene.stopAnimation(this.camera); this.camera.detachControl();
        this.camera.lowerRadiusLimit = null; this.camera.upperRadiusLimit = null;

        const frameRate = 60; const duration = 100;
        const animRadius = new BABYLON.Animation("zoomRadius", "radius", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animRadius.setKeys([{ frame: 0, value: this.camera.radius }, { frame: duration, value: 40 }]);
        const animBeta = new BABYLON.Animation("zoomBeta", "beta", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animBeta.setKeys([{ frame: 0, value: this.camera.beta }, { frame: duration, value: 1.3 }]);
        const animAlpha = new BABYLON.Animation("zoomAlpha", "alpha", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animAlpha.setKeys([{ frame: 0, value: this.camera.alpha }, { frame: duration, value: -Math.PI / 1.5 }]);
        const animTarget = new BABYLON.Animation("zoomTarget", "target", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animTarget.setKeys([{ frame: 0, value: this.camera.target.clone() }, { frame: duration, value: targetPos }]);

        const ease = new BABYLON.CubicEase(); ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        [animRadius, animBeta, animAlpha, animTarget].forEach(anim => anim.setEasingFunction(ease));

        this.scene.beginDirectAnimation(this.camera, [animRadius, animBeta, animAlpha, animTarget], 0, duration, false, 1, () => {
            if (callbackOnArrival) callbackOnArrival(); else UIManager.openNavigation();
            document.body.style.cursor = "default";
        });
    },

    resetNavigation() {
        console.log("🔄 Retour vue carte");
        this.isNavigating = false; this.islands = [];
        this.camera.attachControl(document.getElementById("renderCanvas"), true);
        this.camera.lowerRadiusLimit = 25; this.camera.upperRadiusLimit = 150;
        const animRadius = new BABYLON.Animation("resetRad", "radius", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animRadius.setKeys([{ frame: 0, value: this.camera.radius }, { frame: 60, value: 75 }]);
        this.scene.beginDirectAnimation(this.camera, [animRadius], 0, 60, false, 1);
    },

    animateEnvironment() {
        this.time += 0.005;

        // ANIMATION OCÉAN
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

        // ÎLES (PRINCIPALES)
        this.islands.forEach((obj) => {
            if (obj.pivot) {
                // MODIF: Utilise le baseY stocké pour que les îles restent à leur hauteur Y définie
                const baseY = obj.baseY !== undefined ? obj.baseY : 0;
                obj.pivot.position.y = baseY + Math.sin(this.time + obj.offset) * 0.2;
            }
        });

        // DÉCOR (BACKGROUND)
        this.decorMeshes.forEach((obj) => {
            if (obj.pivot) {
                const currentBaseY = obj.baseY !== undefined ? obj.baseY : -1;
                obj.pivot.position.y = currentBaseY + Math.sin(this.time * 0.8 + obj.offset) * 0.3;
            }
        });

        // VRAIS OISEAUX
        this.realBirds.forEach(bird => {
            // On déplace le birdRoot (le conteneur)
            if(bird.root) {
                bird.root.position.x += bird.speed;

                // Reset quand il sort à droite
                if (bird.root.position.x > 250) {
                    bird.root.position.x = -250;
                    bird.root.position.z = (Math.random() * 100) - 50;
                }
            }
        });

        // BATEAU
        if (this.boatMesh) {
            this.boatMesh.rotation.x = Math.sin(this.time * 0.5) * 0.03;
            this.boatMesh.rotation.z = Math.cos(this.time * 0.3) * 0.03;
            this.boatMesh.position.y = 0.2 + Math.sin(this.time * 0.8) * 0.1;
        }
    },

    dispose() {
        if (this.engine) this.engine.stopRenderLoop();
        if (this.scene) { this.scene.dispose(); this.scene = null; }
        if (this.engine) { this.engine.dispose(); this.engine = null; }
        this.islands = []; this.boatMesh = null; this.realBirds = [];
    },
};