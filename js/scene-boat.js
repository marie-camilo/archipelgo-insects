const BoatScene = {
    engine: null,
    scene: null,
    camera: null,
    boatMesh: null,
    oceanMesh: null,
    time: 0,

    // On définit les citations ici pour être sûr qu'elles soient trouvées
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
        this.scene.clearColor = new BABYLON.Color4(0.4, 0.7, 0.9, 1);
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = 0.008;
        this.scene.fogColor = new BABYLON.Color3(0.4, 0.7, 0.9);

        // Caméra
        this.camera = new BABYLON.ArcRotateCamera("boatCam", 0, 0, 0, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(canvas, false);

        // Lumières
        const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 0.8;
        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -0.5, 0.5), this.scene);
        dirLight.intensity = 1.5;

        // Océan
        this.createOcean();

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

    createOcean() {
        this.oceanMesh = BABYLON.MeshBuilder.CreateGround("ocean", { width: 1000, height: 1000, subdivisions: 100 }, this.scene);
        const oceanMat = new BABYLON.StandardMaterial("oceanMat", this.scene);
        oceanMat.diffuseColor = new BABYLON.Color3(0.1, 0.35, 0.75);
        oceanMat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        oceanMat.alpha = 0.95;
        this.oceanMesh.material = oceanMat;
    },

    loadBoatAndAnimate() {
        BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "boat.glb", this.scene)
            .then((result) => {
                const root = result.meshes[0];
                root.position.y = 0.2;
                this.boatMesh = root;
                this.camera.lockedTarget = this.boatMesh;

                // On lance le travelling une fois le bateau chargé
                this.playCinematicTravelling();
            })
            .catch((err) => {
                console.error("Erreur bateau:", err);
                this.boatMesh = BABYLON.MeshBuilder.CreateBox("fallback", {width: 2}, this.scene);
                this.camera.lockedTarget = this.boatMesh;
                this.playCinematicTravelling();
            });
    },

    playCinematicTravelling() {
        // Durée : 300 frames à 60fps = 5 secondes (Doit correspondre au timeout de app.js)
        const animationFrames = 300;

        // CONFIGURATION DU TRAVELLING (Côté -> Avant)

        // 1. Alpha (Angle horizontal)
        // Math.PI / 2 = Coté Droit exact
        // Math.PI / 1.2 = Vers l'avant (environ 3/4 avant)
        const startAlpha = Math.PI / 2.8; // Départ : Presque de profil
        const endAlpha = Math.PI / 1.2;   // Fin : Vue vers l'avant (proue)

        // 2. Beta (Hauteur)
        const startBeta = 1.35; // Vue rase-motte (proche de l'eau)
        const endBeta = 1.45;   // Encore plus bas pour l'effet dramatique

        // 3. Radius (Distance)
        const startRadius = 20; // Assez large
        const endRadius = 15;   // On se rapproche un peu

        const animAlpha = new BABYLON.Animation("camAlpha", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animAlpha.setKeys([{ frame: 0, value: startAlpha }, { frame: animationFrames, value: endAlpha }]);

        const animBeta = new BABYLON.Animation("camBeta", "beta", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animBeta.setKeys([{ frame: 0, value: startBeta }, { frame: animationFrames, value: endBeta }]);

        const animRadius = new BABYLON.Animation("camRadius", "radius", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animRadius.setKeys([{ frame: 0, value: startRadius }, { frame: animationFrames, value: endRadius }]);

        // Lissage doux
        const easing = new BABYLON.CubicEase();
        easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        [animAlpha, animBeta, animRadius].forEach(anim => anim.setEasingFunction(easing));

        this.camera.animations = [animAlpha, animBeta, animRadius];
        this.scene.beginAnimation(this.camera, 0, animationFrames, false);
    },

    animateEnvironment() {
        this.time += 0.02;
        if (this.boatMesh) {
            this.boatMesh.position.y = 0.2 + Math.sin(this.time) * 0.15;
            this.boatMesh.rotation.x = Math.sin(this.time * 0.5) * 0.05;
            this.boatMesh.rotation.z = Math.cos(this.time * 0.3) * 0.08;
        }
    },

    displayRandomQuote() {
        let quoteElement = document.getElementById("travel-quote");
        if (!quoteElement) quoteElement = document.getElementById("loading-quote");

        if (quoteElement) {
            // Reset animation
            quoteElement.style.animation = 'none';
            quoteElement.offsetHeight; /* trigger reflow */
            quoteElement.style.animation = null;

            // Choix aléatoire
            const randomIndex = Math.floor(Math.random() * this.quotes.length);
            const text = this.quotes[randomIndex];

            console.log("Affichage citation :", text); // Debug pour vérifier dans la console
            quoteElement.textContent = `"${text}"`;

            // On force le style visible au cas où
            quoteElement.style.display = "block";
            quoteElement.style.opacity = "1";
        } else {
            console.warn("Element citation introuvable (travel-quote ou loading-quote)");
        }
    },

    dispose() {
        if (this.engine) this.engine.stopRenderLoop();
        if (this.scene) { this.scene.dispose(); this.scene = null; }
        if (this.engine) { this.engine.dispose(); this.engine = null; }
    },
};