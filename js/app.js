const ArchipelagoApp = {
  currentScreen: "map-view",
  currentIsland: null,
  selectedInsect: null,

  init() {
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

    // Voyage et scène du bateau avec settings de désactivation
    if (typeof GameSettings !== 'undefined' && !GameSettings.boatAnim) {

      setTimeout(() => {
        this.exploreIsland(islandId);
      }, 100);

      return;
    }

    this.showScreen("boat-travel");

    const island = ISLANDS_DATA.find(i => i.id === islandId);
    if(document.getElementById("travel-text")) {
      document.getElementById("travel-text").textContent = `Cap vers ${island.name}...`;
    }

    // lancement de la scène du bateau
    setTimeout(() => {
      if (typeof BoatScene !== 'undefined') BoatScene.init();
    }, 100);

    // la scène dure 5sec
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
        if (typeof UIManager !== 'undefined') {
          UIManager.triggerHelpAttention();
        }
      }, 1000);

      // setTimeout(() => {
      //   document.getElementById("help-overlay").style.display = "block";
      //   setTimeout(() => {
      //     document.getElementById("help-overlay").style.display = "none";
      //   }, 3000);
      // }, 500);
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
        const journalScreen = document.getElementById("journal-screen");
        if (journalScreen) {
            journalScreen.classList.add("active");
        }

        if (typeof JournalManager !== 'undefined') {
            JournalManager.render();
        }
    },

  openJournalFromMap() {
    this.lastContext = "map";
    this.showScreen("journal");
    JournalManager.renderJournalGrid();
    JournalManager.updateJournalStats();
  },

    closeJournal() {
        const journalScreen = document.getElementById("journal-screen");
        if (journalScreen) {
            journalScreen.classList.remove("active");
        }
    },

  returnToMap() {
    IslandScene.dispose();
    this.showScreen("map-view");
    setTimeout(() => {
      MapScene.init();
    }, 100);
  },

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