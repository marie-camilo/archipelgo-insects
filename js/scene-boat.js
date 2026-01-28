/* SCENE BOAT - Voyage en bateau */

const BoatScene = {
    scene: null,
    engine: null,
    camera: null,

    init() {
        const canvas = document.getElementById("boatCanvas");
        if (!canvas) return;

        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.4, 0.7, 0.9, 1); // Ciel de jour

        // Caméra qui suit le bateau (côté)
        this.camera = new BABYLON.ArcRotateCamera("boatCam", -Math.PI/2, Math.PI/2.5, 15, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(canvas, false); // Pas de contrôle utilisateur pendant le voyage

        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);

        // 1. L'Océan (Infini visuellement)
        const ocean = BABYLON.MeshBuilder.CreateGround("ocean", { width: 500, height: 500 }, this.scene);
        const oceanMat = new BABYLON.StandardMaterial("oceanMat", this.scene);
        oceanMat.diffuseColor = new BABYLON.Color3(0.1, 0.4, 0.8);
        ocean.material = oceanMat;

        // 2. Le Bateau (Simplifié : Boîte brune)
        const boatGroup = new BABYLON.TransformNode("boatGroup");

        const hull = BABYLON.MeshBuilder.CreateBox("hull", {width: 2, height: 1, depth: 4}, this.scene);
        hull.position.y = 0.5;
        hull.material = new BABYLON.StandardMaterial("hullMat", this.scene);
        hull.material.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2); // Marron bois
        hull.parent = boatGroup;

        // Petite cabine
        const cabin = BABYLON.MeshBuilder.CreateBox("cabin", {width: 1.5, height: 1, depth: 1.5}, this.scene);
        cabin.position.y = 1.5;
        cabin.position.z = -0.5;
        cabin.material = hull.material;
        cabin.parent = boatGroup;

        // 3. Animation
        let time = 0;
        this.scene.registerBeforeRender(() => {
            time += 0.02;
            // Le bateau avance (en fait c'est l'eau qui recule ou juste un effet de vague)
            // Ici on fait juste tanguer le bateau
            boatGroup.position.y = Math.sin(time) * 0.2; // Houle
            boatGroup.rotation.x = Math.sin(time * 0.5) * 0.05; // Tangage
            boatGroup.rotation.z = Math.cos(time * 0.5) * 0.05; // Roulis
        });

        this.engine.runRenderLoop(() => this.scene.render());
        window.addEventListener("resize", () => this.engine.resize());

        // Resize immédiat
        setTimeout(() => this.engine.resize(), 50);
    },

    dispose() {
        if (this.engine) this.engine.stopRenderLoop();
        if (this.scene) { this.scene.dispose(); this.scene = null; }
        if (this.engine) { this.engine.dispose(); this.engine = null; }
    },
};