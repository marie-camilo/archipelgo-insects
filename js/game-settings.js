const GameSettings = {
    // État par défaut
    boatAnim: true,
    particles: true,
    islandAnim: true,

    init() {
        // Charger depuis le localStorage si dispo
        const saved = localStorage.getItem('archipelago_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.boatAnim = parsed.boatAnim;
            this.particles = parsed.particles;
            this.islandAnim = parsed.islandAnim;
        }
        this.updateUI();
    },

    toggle(key) {
        if (this.hasOwnProperty(key)) {
            this[key] = !this[key];
            this.save();

            // Effet immédiat : Si on désactive les particules, on nettoie l'atmosphère
            if (key === 'particles' && !this.particles && typeof IslandScene !== 'undefined') {
                IslandScene.disposeAtmosphere();
            }
            // Si on réactive, on relance
            if (key === 'particles' && this.particles && typeof IslandScene !== 'undefined') {
                IslandScene.createAtmosphere();
            }
        }
    },

    save() {
        localStorage.setItem('archipelago_settings', JSON.stringify({
            boatAnim: this.boatAnim,
            particles: this.particles,
            islandAnim: this.islandAnim
        }));
    },

    updateUI() {
        // Met à jour les checkbox HTML au démarrage
        const elBoat = document.getElementById('toggle-boat-anim');
        const elPart = document.getElementById('toggle-particles');
        const elIsland = document.getElementById('toggle-island-anim');

        if(elBoat) elBoat.checked = this.boatAnim;
        if(elPart) elPart.checked = this.particles;
        if(elIsland) elIsland.checked = this.islandAnim;
    }
};

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    GameSettings.init();
});