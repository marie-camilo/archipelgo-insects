const ArchipelagoApp = {
  currentScreen: "map-view",
  currentIsland: null,
  selectedInsect: null,

  init() {
    console.log("🏝️ L'Archipel des Insectes - Initialisation");
    JournalManager.init();
    this.showMap();

    const hasSeenHelp = localStorage.getItem("archipelago_help_seen");

    if (!hasSeenHelp) {
      setTimeout(() => {
        if (typeof UIManager !== 'undefined') {
          UIManager.toggleGlobalHelp();
          localStorage.setItem("archipelago_help_seen", "true");
        }
      }, 1500);
    }
  },

  showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const screen = document.getElementById(screenId + "-screen");
    if (screen) {
      screen.classList.add("active");
      this.currentScreen = screenId;
    }
  },

  showMap() {
    console.log("📍 Activation de l'écran Carte...");
    this.showScreen("map-view");

    setTimeout(() => {
      if (typeof MapScene !== 'undefined') {
        MapScene.init();
      } else {
        alert("ERREUR : Le fichier scene-map.js n'est pas chargé !");
      }
    }, 50);
  },

  selectIsland(islandId) {
    this.currentIsland = islandId;

    // --- LOGIQUE VOYAGE RAPIDE (Si animation désactivée) ---
    if (typeof GameSettings !== 'undefined' && !GameSettings.boatAnim) {
      console.log("⚡ Voyage rapide activé : saut de la scène du bateau.");

      // On lance directement l'exploration
      // On met un tout petit délai (100ms) juste pour laisser le temps au navigateur de respirer
      setTimeout(() => {
        this.exploreIsland(islandId);
      }, 100);

      return; // On arrête la fonction ici, on ne joue pas la suite
    }

    // --- LOGIQUE CINÉMATIQUE (Si animation activée) ---
    this.showScreen("boat-travel");

    const island = ISLANDS_DATA.find(i => i.id === islandId);
    // Petit check de sécurité
    if(document.getElementById("travel-text")) {
      document.getElementById("travel-text").textContent = `Cap vers ${island.name}...`;
    }

    // On lance la scène du bateau
    setTimeout(() => {
      if (typeof BoatScene !== 'undefined') BoatScene.init();
    }, 100);

    // On attend 5 secondes avant d'arriver
    setTimeout(() => {
      this.exploreIsland(islandId);
    }, 5000);
  },

  exploreIsland(islandId) {
    MapScene.dispose();
    BoatScene.dispose();

    this.showScreen("island-exploration");
    const island = ISLANDS_DATA.find(i => i.id === islandId);

    UIManager.updateIslandInfo(island);

    document.getElementById("island-name").textContent = island.name;
    document.getElementById("island-ecosystem").textContent = "Écosystème : " + island.ecosystem;

    if (!JOURNAL_STATE.exploredIslands.includes(islandId)) {
      JOURNAL_STATE.exploredIslands.push(islandId);
    }

    setTimeout(() => {
      IslandScene.init(islandId);
      UIManager.updateIslandProgress(islandId);

      setTimeout(() => {
        document.getElementById("help-overlay").style.display = "block";
        setTimeout(() => {
          document.getElementById("help-overlay").style.display = "none";
        }, 3000);
      }, 500);
    }, 100);
  },

    selectInsect(insectData) {
        this.selectedInsect = insectData;
        UIManager.showInsectPanel(insectData);
        document.activeElement.blur();
        JournalManager.addInsect(insectData.id);
        UIManager.updateIslandProgress(this.currentIsland);
    },

    closeInsectPanel() {
        UIManager.hideInsectPanel();
        this.selectedInsect = null;

        if (typeof IslandScene !== 'undefined' && IslandScene.camera) {
            IslandScene.resetView();

            const canvas = document.getElementById("islandCanvas");
            IslandScene.camera.attachControl(canvas, true);
        }
    },

  addToJournal() {
    if (this.selectedInsect) {
      JournalManager.addInsect(this.selectedInsect.id);
      alert("Ajouté au carnet de bord !");
    }
  },

  lastContext: "map",

  openJournal() {
    this.lastContext = "island";
    this.showScreen("journal");
    JournalManager.renderJournalGrid();
    JournalManager.updateJournalStats();
  },

  openJournalFromMap() {
    this.lastContext = "map";
    this.showScreen("journal");
    JournalManager.renderJournalGrid();
    JournalManager.updateJournalStats();
  },

  closeJournal() {
    if (this.lastContext === "map") {
      this.showScreen("map-view");
    } else {
      this.showScreen("island-exploration");
    }
  },

  returnToMap() {
    IslandScene.dispose();
    this.showScreen("map-view");
    setTimeout(() => {
      MapScene.init();
    }, 100);
  },

  // restart() {
  //   JOURNAL_STATE.discoveredInsects = [];
  //   JOURNAL_STATE.exploredIslands = [];
  //   ISLANDS_DATA.forEach(island => island.status = "unexplored");
  //
  //   if (MapScene.scene) MapScene.dispose();
  //   if (BoatScene.scene) BoatScene.dispose();
  //   if (IslandScene.scene) IslandScene.dispose();
  //
  //   JournalManager.init();
  //
  //   this.showMap();
  // },

  restart() {
    const victoryScreen = document.getElementById("conclusion-screen");
    if (victoryScreen) {
      victoryScreen.classList.remove("active");
    }
    localStorage.removeItem('archipelago_save');
    setTimeout(() => {
      window.location.reload();
    }, 300);
  },
};

// Auto-init
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => ArchipelagoApp.init());
} else {
  ArchipelagoApp.init();
}

window.ArchipelagoApp = ArchipelagoApp;