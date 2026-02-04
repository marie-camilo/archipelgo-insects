const BoatScene = {
    engine: null,
    scene: null,
    camera: null,
    boatMesh: null,
    waterMesh: null,
    basePositions: null,

    time: 0,

    quotes: [
        "Les insectes représentent plus de 80% des espèces animales sur Terre.",
        "Une fourmi peut porter jusqu'à 50 fois son propre poids.",
        "Les abeilles communiquent en dansant pour indiquer la direction des fleurs.",
        "Certaines libellules migrent sur des milliers de kilomètres.",
        "Sans les insectes pollinisateurs, nous perdrions la majorité de nos fruits et légumes."
    ],

    init() {
        const canvas = document.getElementById("boatCanvas");
        if (!canvas) return;

        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        const skyColor = new BABYLON.Color3(0.65, 0.85, 0.95);
        this.scene.clearColor = new BABYLON.Color4(skyColor.r, skyColor.g, skyColor.b, 1);
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = 0.005;
        this.scene.fogColor = skyColor;

        // Caméra
        this.camera = new BABYLON.ArcRotateCamera("boatCam", 0, 0, 0, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(canvas, false);

        // Lumières
        const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 0.8;
        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -0.5, 0.5), this.scene);
        dirLight.intensity = 1.5;

        // Création de l'Océan Low Poly
        this.createLowPolyOcean();

        // Bateau & Animation Caméra
        this.loadBoatAndAnimate();

        // Affichage Citation
        this.displayRandomQuote();

        // Boucle Rendu
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.animateEnvironment();
                this.scene.render();
            }
        });

        window.addEventListener("resize", () => { if (this.engine) this.engine.resize(); });
    },

    createLowPolyOcean() {
        const waterMesh = BABYLON.MeshBuilder.CreateGround("ocean", { width: 1000, height: 1000, subdivisions: 100, updatable: true }, this.scene);

        // Conversion en Low Poly (Flat Shading)
        waterMesh.convertToFlatShadedMesh();

        // Matériau de l'eau
        const waterMat = new BABYLON.StandardMaterial("waterMat", this.scene);
        waterMat.diffuseColor = new BABYLON.Color3(0.02, 0.05, 0.15);
        waterMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        waterMat.specularPower = 32;
        waterMat.emissiveColor = new BABYLON.Color3(0, 0, 0.1);
        waterMat.alpha = 0.95;
        waterMat.roughness = 0;

        waterMesh.material = waterMat;
        waterMesh.position.y = -0.5;

        // Stockage pour l'animation
        this.waterMesh = waterMesh;
        this.basePositions = waterMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    },

    loadBoatAndAnimate() {
        BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "boat.glb", this.scene)
            .then((result) => {
                const root = result.meshes[0];
                root.position.y = 0.5;
                this.boatMesh = root;
                this.camera.lockedTarget = this.boatMesh;
                this.playCinematicTravelling();
            })
            .catch((err) => {
                console.error("Erreur bateau:", err);
                // Fallback si pas de modèle
                this.boatMesh = BABYLON.MeshBuilder.CreateBox("fallback", {width: 2}, this.scene);
                this.camera.lockedTarget = this.boatMesh;
                this.playCinematicTravelling();
            });
    },

    playCinematicTravelling() {
        const animationFrames = 300;

        // Configuration du travelling
        const startAlpha = Math.PI / 2.8;
        const endAlpha = Math.PI / 1.2;

        // CORRECTION ICI : On regarde un peu plus de haut pour éviter les vagues
        const startBeta = 1.1; // Vue plus plongeante au début
        const endBeta = 1.3;   // Fin pas trop basse (avant c'était 1.45)

        const startRadius = 25; // On recule un peu plus au début
        const endRadius = 18;

        const animAlpha = new BABYLON.Animation("camAlpha", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animAlpha.setKeys([{ frame: 0, value: startAlpha }, { frame: animationFrames, value: endAlpha }]);

        const animBeta = new BABYLON.Animation("camBeta", "beta", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animBeta.setKeys([{ frame: 0, value: startBeta }, { frame: animationFrames, value: endBeta }]);

        const animRadius = new BABYLON.Animation("camRadius", "radius", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animRadius.setKeys([{ frame: 0, value: startRadius }, { frame: animationFrames, value: endRadius }]);

        const easing = new BABYLON.CubicEase();
        easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        [animAlpha, animBeta, animRadius].forEach(anim => anim.setEasingFunction(easing));

        this.camera.animations = [animAlpha, animBeta, animRadius];
        this.scene.beginAnimation(this.camera, 0, animationFrames, false);
    },

    animateEnvironment() {
        this.time += 0.02;

        const waveHeight = 1.5;
        const waveFreq = 0.15;

        // 1. ANIMATION DE L'OCÉAN
        if (this.waterMesh && this.basePositions) {
            const positions = [...this.basePositions];
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const z = positions[i + 2];
                // On applique la formule de l'onde
                const y = Math.sin(x * waveFreq + this.time) * Math.cos(z * waveFreq + this.time) * waveHeight;
                positions[i + 1] = y;
            }
            this.waterMesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
            this.waterMesh.createNormals(false);
        }

        // Animation bateau en fonction des mesh
        if (!GameSettings.boatAnim) {
            if (this.boatMesh) {
                const bx = this.boatMesh.position.x;
                const bz = this.boatMesh.position.z;
                const currentWaveY = Math.sin(bx * waveFreq + this.time) * Math.cos(bz * waveFreq + this.time) * waveHeight;

                this.boatMesh.position.y = currentWaveY + 1.5;

                const lookAhead = 1.0;
                const waveNextX = Math.sin((bx + lookAhead) * waveFreq + this.time) * Math.cos(bz * waveFreq + this.time) * waveHeight;
                const waveNextZ = Math.sin(bx * waveFreq + this.time) * Math.cos((bz + lookAhead) * waveFreq + this.time) * waveHeight;
                const pitch = (waveNextX - currentWaveY) * 0.5;
                const roll = (waveNextZ - currentWaveY) * 0.5;
                this.boatMesh.rotation.z = BABYLON.Scalar.Lerp(this.boatMesh.rotation.z, -pitch, 0.1);
                this.boatMesh.rotation.x = BABYLON.Scalar.Lerp(this.boatMesh.rotation.x, roll, 0.1);
                this.boatMesh.rotation.y += Math.sin(this.time * 0.5) * 0.002;
            }
            return;
        }
    },

    displayRandomQuote() {
        const quoteElement = document.getElementById("travel-quote");
        if (quoteElement) {
            quoteElement.style.animation = 'none';
            quoteElement.offsetHeight;
            quoteElement.style.animation = null;

            const randomIndex = Math.floor(Math.random() * this.quotes.length);
            quoteElement.textContent = this.quotes[randomIndex];
        }
    },

    dispose() {
        if (this.engine) this.engine.stopRenderLoop();
        if (this.scene) { this.scene.dispose(); this.scene = null; }
        if (this.engine) { this.engine.dispose(); this.engine = null; }
    },
};