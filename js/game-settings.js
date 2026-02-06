const GameSettings = {
    // etat par défaut
    boatAnim: true,
    particles: true,
    islandAnim: true,
    timeCycle: 'day',

    init() {
        const saved = localStorage.getItem('archipelago_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.boatAnim = parsed.boatAnim !== undefined ? parsed.boatAnim : true;
            this.particles = parsed.particles !== undefined ? parsed.particles : true;
            this.islandAnim = parsed.islandAnim !== undefined ? parsed.islandAnim : true;
            this.timeCycle = parsed.timeCycle || 'day';
        }
        this.updateUI();
    },

    toggle(key) {
        if (this.hasOwnProperty(key)) {
            this[key] = !this[key];
            this.save();

            // settings de désactivation des particules
            if (key === 'particles' && !this.particles && typeof IslandScene !== 'undefined') {
                IslandScene.disposeAtmosphere();
            }
            // settings réactivés
            if (key === 'particles' && this.particles && typeof IslandScene !== 'undefined') {
                IslandScene.createAtmosphere();
            }
        }
    },

    changeTime(value) {
        this.timeCycle = value;
        this.save();

        if (typeof MapScene !== 'undefined' && MapScene.scene) {
            MapScene.applyTimeCycle(value);
        }

        if (typeof IslandScene !== 'undefined' && IslandScene.scene) {
            IslandScene.applyTimeCycle(value);
        }
    },

    save() {
        localStorage.setItem('archipelago_settings', JSON.stringify({
            boatAnim: this.boatAnim,
            particles: this.particles,
            islandAnim: this.islandAnim,
            timeCycle: this.timeCycle
        }));
    },

    updateUI() {
        const elBoat = document.getElementById('toggle-boat-anim');
        const elPart = document.getElementById('toggle-particles');
        const elIsland = document.getElementById('toggle-island-anim');
        const elTime = document.getElementById('select-time-cycle');

        if(elBoat) elBoat.checked = this.boatAnim;
        if(elPart) elPart.checked = this.particles;
        if(elIsland) elIsland.checked = this.islandAnim;
        if(elTime) elTime.value = this.timeCycle;

        setTimeout(() => {
            if (typeof MapScene !== 'undefined' && MapScene.scene) {
                MapScene.applyTimeCycle(this.timeCycle);
            }
        }, 500);
    }
};

// init
document.addEventListener('DOMContentLoaded', () => {
    GameSettings.init();
});