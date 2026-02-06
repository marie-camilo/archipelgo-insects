/** CODE GÉNÉRÉ PAR IA **/
/* Helpers pour la gestion des effets de post-process BabylonJS (Scanner) */

const IABabylon = {
    createScannerCloud: function(scene, position, texture) {
        const system = new BABYLON.ParticleSystem("scanFireflies", 80, scene);
        system.particleTexture = texture;

        const offsetPosition = position.clone();
        offsetPosition.y += 1.0;
        system.emitter = offsetPosition;

        // --- COULEURS : BLANC PUR ÉCLATANT ---
        system.color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
        system.color2 = new BABYLON.Color4(1.0, 1.0, 1.0, 0.6);
        system.colorDead = new BABYLON.Color4(1, 1, 1, 0);

        system.minSize = 0.15;
        system.maxSize = 0.45;
        system.minLifeTime = 0.8;
        system.maxLifeTime = 1.5;

        // --- DISPERSION TRÈS LARGE ---
        // On garde un rayon large (6.0) pour le côté très diffus
        system.createSphereEmitter(6.0);

        // On réduit la puissance pour éviter l'effet "projection"
        system.minEmitPower = 0.1;
        system.maxEmitPower = 0.3;

        // --- MOUVEMENT DOUX ET FLOTTANT ---
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
    }
};