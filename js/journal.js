/* JOURNAL - Carnet de bord */

const JournalManager = {
  init() {
    this.updateJournalGrid();
    this.updateJournalStats();
  },

  updateJournalGrid() {
    const grid = document.getElementById("journal-grid");
    grid.innerHTML = "";
    
    ISLANDS_DATA.forEach(island => {
      island.insects.forEach(insect => {
        const item = document.createElement("div");
        const isDiscovered = JOURNAL_STATE.discoveredInsects.includes(insect.id);
        
        item.className = "journal-item" + (isDiscovered ? "" : " locked");
        item.innerHTML = `
          <div class="journal-item-icon">${isDiscovered ? insect.icon : "❓"}</div>
          <div class="journal-item-name">${isDiscovered ? insect.name : "???"}</div>
          <div class="journal-item-scientific">${isDiscovered ? insect.scientific : "Non découvert"}</div>
        `;
        
        if (isDiscovered) {
          item.onclick = () => {
            // Show details
            alert(`${insect.name}\n\n${insect.role}\n\n${insect.anecdote}`);
          };
        }
        
        grid.appendChild(item);
      });
    });
  },

  updateJournalStats() {
    const totalInsects = ISLANDS_DATA.reduce((sum, island) => sum + island.insects.length, 0);
    document.getElementById("total-discovered").textContent = JOURNAL_STATE.discoveredInsects.length;
    document.getElementById("total-insects").textContent = totalInsects;
    document.getElementById("islands-explored").textContent = JOURNAL_STATE.exploredIslands.length;
  },

  addInsect(insectId) {
    if (!JOURNAL_STATE.discoveredInsects.includes(insectId)) {
      JOURNAL_STATE.discoveredInsects.push(insectId);
      this.updateJournalGrid();
      this.updateJournalStats();
    }
  },
};
