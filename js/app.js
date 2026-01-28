/* MAIN APPLICATION */

const ArchipelagoApp = {
  currentScreen: "map-view", // On démarre direct sur la carte
  currentIsland: null,
  selectedInsect: null,

  init() {
    console.log("🏝️ L'Archipel des Insectes - Initialisation");
    JournalManager.init();

    // MODIFICATION ICI : On lance directement la carte !
    this.showMap();
  },

  showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const screen = document.getElementById(screenId + "-screen");
    if (screen) {
      screen.classList.add("active");
      this.currentScreen = screenId;
    }
  },

  showIntro() {
    this.showScreen("intro");
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
    this.showScreen("boat-travel");

    const island = ISLANDS_DATA.find(i => i.id === islandId);
    document.getElementById("travel-text").textContent = `Cap vers ${island.name}...`;

    setTimeout(() => {
      BoatScene.init();
    }, 100);

    setTimeout(() => {
      this.exploreIsland(islandId);
    }, CONFIG.animation.boatTravelDuration);
  },

  exploreIsland(islandId) {
    MapScene.dispose();
    BoatScene.dispose();

    this.showScreen("island-exploration");
    const island = ISLANDS_DATA.find(i => i.id === islandId);

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
    JournalManager.addInsect(insectData.id);
    UIManager.updateIslandProgress(this.currentIsland);
  },

  closeInsectPanel() {
    UIManager.hideInsectPanel();
    this.selectedInsect = null;
  },

  addToJournal() {
    if (this.selectedInsect) {
      JournalManager.addInsect(this.selectedInsect.id);
      alert("✅ Ajouté au carnet de bord !");
    }
  },

  openJournal() {
    this.showScreen("journal");
    JournalManager.updateJournalGrid();
    JournalManager.updateJournalStats();
  },

  closeJournal() {
    // Si on ferme le journal, on revient à l'exploration ou à la carte
    // Ici on suppose qu'on l'ouvre depuis l'île
    this.showScreen("island-exploration");
  },

  returnToMap() {
    IslandScene.dispose();
    this.showScreen("map-view");
    setTimeout(() => {
      MapScene.init();
    }, 100);
  },

  restart() {
    JOURNAL_STATE.discoveredInsects = [];
    JOURNAL_STATE.exploredIslands = [];
    ISLANDS_DATA.forEach(island => island.status = "unexplored");

    if (MapScene.scene) MapScene.dispose();
    if (BoatScene.scene) BoatScene.dispose();
    if (IslandScene.scene) IslandScene.dispose();

    JournalManager.init();

    // MODIFICATION ICI AUSSI : Si on restart, on revient sur la carte
    this.showMap();
  },
};

// Auto-init
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => ArchipelagoApp.init());
} else {
  ArchipelagoApp.init();
}

window.ArchipelagoApp = ArchipelagoApp;