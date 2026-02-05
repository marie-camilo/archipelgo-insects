/** CODE GÉNÉRÉ PAR IA **/
/* Configurations techniques détaillées des systèmes de particules. Contient les vecteurs de gravité, les couleurs RGBA et les taux d'émission. */

const IAParticles = {
    createSnow: function(scene, texture) {
        const snow = new BABYLON.ParticleSystem("snow", 5000, scene);
        snow.particleTexture = texture;
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
        return snow;
    },

    createRain: function(scene, texture) {
        const rain = new BABYLON.ParticleSystem("rain", 4000, scene);
        rain.particleTexture = texture;
        rain.emitter = new BABYLON.Vector3(0, 100, 0);
        rain.minEmitBox = new BABYLON.Vector3(-150, 0, -150);
        rain.maxEmitBox = new BABYLON.Vector3(150, 0, 150);
        rain.color1 = new BABYLON.Color4(0.6, 0.7, 0.8, 0.6);
        rain.color2 = new BABYLON.Color4(0.6, 0.7, 0.8, 0.4);
        rain.colorDead = new BABYLON.Color4(0.5, 0.5, 0.6, 0.0);
        rain.minSize = 0.4; rain.maxSize = 0.8;
        rain.isBillboardBased = false;
        rain.minLifeTime = 0.5; rain.maxLifeTime = 0.8;
        rain.emitRate = 1200;
        rain.gravity = new BABYLON.Vector3(0, -150, 0);
        rain.direction1 = new BABYLON.Vector3(0, -30, 0);
        rain.direction2 = new BABYLON.Vector3(0, -30, 0);
        return rain;
    },

    createPollen: function(scene, texture) {
        const pollen = new BABYLON.ParticleSystem("pollen", 1000, scene);
        pollen.particleTexture = texture;
        pollen.emitter = new BABYLON.Vector3(0, 30, 0);
        pollen.minEmitBox = new BABYLON.Vector3(-100, 0, -100);
        pollen.maxEmitBox = new BABYLON.Vector3(100, 0, 100);
        pollen.color1 = new BABYLON.Color4(0.9, 0.9, 0.7, 0.4);
        pollen.color2 = new BABYLON.Color4(0.9, 0.9, 0.7, 0.1);
        pollen.minSize = 0.1; pollen.maxSize = 0.4;
        pollen.minLifeTime = 8; pollen.maxLifeTime = 12;
        pollen.emitRate = 80;
        pollen.gravity = new BABYLON.Vector3(0, -0.1, 0);
        return pollen;
    },

    createFireflies: function(scene, texture) {
        const fireflies = new BABYLON.ParticleSystem("fireflies", 200, scene);
        fireflies.particleTexture = texture;
        fireflies.emitter = new BABYLON.Vector3(0, 10, 0);
        fireflies.minEmitBox = new BABYLON.Vector3(-80, -5, -80);
        fireflies.maxEmitBox = new BABYLON.Vector3(80, 20, 80);
        fireflies.color1 = new BABYLON.Color4(1, 0.8, 0.2, 1.0);
        fireflies.color2 = new BABYLON.Color4(1, 0.5, 0.1, 1.0);
        fireflies.minSize = 0.8; fireflies.maxSize = 1.2;
        fireflies.minLifeTime = 3; fireflies.maxLifeTime = 6;
        fireflies.emitRate = 30;
        fireflies.gravity = new BABYLON.Vector3(0, 0.5, 0);
        return fireflies;
    },

    createWindParticles: function(scene, texture) {
        const wind = new BABYLON.ParticleSystem("windParticles", 500, scene);
        wind.particleTexture = texture;
        wind.emitter = new BABYLON.Vector3(-200, 50, -50);
        wind.minEmitBox = new BABYLON.Vector3(0, -50, -100);
        wind.maxEmitBox = new BABYLON.Vector3(0, 50, 100);
        wind.color1 = new BABYLON.Color4(1, 1, 1, 0.5);
        wind.color2 = new BABYLON.Color4(1, 1, 1, 0.0);
        wind.minSize = 0.5; wind.maxSize = 1.5;
        wind.minLifeTime = 4; wind.maxLifeTime = 6;
        wind.emitRate = 50;
        wind.gravity = new BABYLON.Vector3(30, -2, 0);
        wind.direction1 = new BABYLON.Vector3(40, 0, 0);
        wind.direction2 = new BABYLON.Vector3(60, 5, 0);
        wind.minAngularSpeed = 0;
        wind.maxAngularSpeed = Math.PI;
        return wind;
    },

    createDistantBirds: function(scene, texture) {
        const birds = new BABYLON.ParticleSystem("birds", 40, scene);
        birds.particleTexture = texture;
        birds.emitter = new BABYLON.Vector3(0, 60, 0);
        birds.minEmitBox = new BABYLON.Vector3(-200, 0, -200);
        birds.maxEmitBox = new BABYLON.Vector3(200, 20, 200);
        birds.color1 = new BABYLON.Color4(0.2, 0.2, 0.2, 1);
        birds.color2 = new BABYLON.Color4(0.2, 0.2, 0.2, 1);
        birds.minSize = 1; birds.maxSize = 2;
        birds.isBillboardBased = true;
        birds.minLifeTime = 10; birds.maxLifeTime = 15;
        birds.emitRate = 2;
        birds.gravity = new BABYLON.Vector3(0, 0, 0);

        // Fonction de mise à jour personnalisée pour le vol circulaire
        birds.updateFunction = function(particles) {
            for (var index = 0; index < particles.length; index++) {
                var particle = particles[index];
                particle.age += this._scaledUpdateSpeed;
                particle.position.x += Math.cos(particle.age) * 0.5;
                particle.position.z += Math.sin(particle.age) * 0.5;
                particle.position.y += Math.sin(particle.age * 3) * 0.1;
                if (particle.age >= particle.lifeTime) {
                    this.recycleParticle(particle);
                    index--;
                }
            }
        };
        return birds;
    }
};