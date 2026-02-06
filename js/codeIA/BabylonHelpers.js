/** CODE GÉNÉRÉ PAR IA **/
/* Helpers pour la gestion des effets de post-process BabylonJS (Scanner) */

const IABabylon = {
    createScannerCloud: function(scene, position, texture) {
        const system = new BABYLON.ParticleSystem("scanFireflies", 80, scene);
        system.particleTexture = texture;

        const offsetPosition = position.clone();
        offsetPosition.y += 1.0;
        system.emitter = offsetPosition;

        system.color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
        system.color2 = new BABYLON.Color4(1.0, 1.0, 1.0, 0.6);
        system.colorDead = new BABYLON.Color4(1, 1, 1, 0);

        system.minSize = 0.15;
        system.maxSize = 0.45;
        system.minLifeTime = 0.8;
        system.maxLifeTime = 1.5;

        // On garde un rayon large (6.0) pour le côté très diffus
        system.createSphereEmitter(6.0);

        // On réduit la puissance pour éviter l'effet "projection"
        system.minEmitPower = 0.1;
        system.maxEmitPower = 0.3;

        system.updateFunction = function(particles) {
            for (let index = 0; index < particles.length; index++) {
                let particle = particles[index];
                particle.age += this._scaledUpdateSpeed;

                if (particle.age >= particle.lifeTime) {
                    this.recycleParticle(particle);
                    index--;
                    continue;
                }

                // On utilise des valeurs beaucoup plus petites (0.01 au lieu de 0.08)
                particle.position.x += (Math.random() - 0.5) * 0.015;
                particle.position.y += 0.01; // Légère montée constante pour l'aspect vaporeux
                particle.position.z += (Math.random() - 0.5) * 0.015;

                // Fondu très fluide
                // La particule apparaît doucement et disparaît doucement (courbe en cloche)
                let lifeRatio = particle.age / particle.lifeTime;
                particle.alpha = Math.sin(lifeRatio * Math.PI);
            }
        };

        system.emitRate = 50;
        system.targetStopDuration = 1.2;
        system.disposeOnStop = true;

        return system;
    },

    createScannerEffect: function(scene) {
        let hl = scene.getHighlightLayerByName("scanner_highlight");
        if (!hl) {
            hl = new BABYLON.HighlightLayer("scanner_highlight", scene, {
                mainTextureRatio: 0.5,
                blurHorizontalSize: 2,
                blurVerticalSize: 2
            });
        }
        return hl;
    },

    executeScreenshot: function(engine, camera) {
        BABYLON.Tools.CreateScreenshot(engine, camera, { precision: 2 }, (data) => {
            const link = document.createElement('a');
            link.download = `Archipel_Exploration_${new Date().getTime()}.png`;
            link.href = data;
            link.click();
        });
    },

    initInspectionEngine: function(canvas, modelFile) {
        // Nettoyage si un moteur existe déjà sur ce canvas
        const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

        const camera = new BABYLON.ArcRotateCamera("inspectCam", -Math.PI / 2, Math.PI / 3, 4, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        camera.wheelPrecision = 50;
        camera.lowerRadiusLimit = 2;
        camera.upperRadiusLimit = 10;

        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 1.2;

        BABYLON.SceneLoader.ImportMeshAsync("", "./assets/insects/", modelFile, scene).then((result) => {
            const root = result.meshes[0];

            // Calcul automatique pour que l'insecte tienne toujours dans la vue
            const boundingInfo = root.getHierarchyBoundingVectors();
            const size = boundingInfo.max.subtract(boundingInfo.min);
            const maxDimension = Math.max(size.x, size.y, size.z);

            // On force une taille de 2.5 unités
            const scaleFactor = 2.5 / maxDimension;
            root.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);

            // Centrage parfait
            const center = boundingInfo.max.add(boundingInfo.min).scale(0.5);
            root.position = center.scale(-scaleFactor);
        });

        engine.runRenderLoop(() => {
            scene.render();
        });

        return engine;
    },

    createInspectionScene: function(canvas, modelFile) {
        const engine = new BABYLON.Engine(canvas, true);
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

        const camera = new BABYLON.ArcRotateCamera("inspectCam", -Math.PI/2, Math.PI/2.5, 5, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 1.5;

        BABYLON.SceneLoader.ImportMeshAsync("", "./assets/insects/", modelFile, scene).then((result) => {
            const root = result.meshes[0];

            // On récupère la boîte englobante réelle du modèle
            const boundingInfo = root.getHierarchyBoundingVectors();
            const size = boundingInfo.max.subtract(boundingInfo.min);
            const maxDimension = Math.max(size.x, size.y, size.z);

            // On définit une taille cible (ex: 2.5 unités)
            const targetSize = 2.5;
            const scaleFactor = targetSize / maxDimension;

            // On applique le scale calculé pour que tous les insectes aient la même taille à l'écran
            root.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);

            // On centre parfaitement le modèle sur ses nouveaux axes
            const center = boundingInfo.max.add(boundingInfo.min).scale(0.5);
            root.position = center.scale(-scaleFactor);

            // Rotation automatique
            scene.onBeforeRenderObservable.add(() => {
                root.rotation.y += 0.005;
            });
        });

        engine.runRenderLoop(() => scene.render());
        return { engine, scene };
    }
};