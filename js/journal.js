const JournalManager = {
    init() {
        this.updateJournalGrid();
        this.updateJournalStats();
        this.createModal(); // On crée la modale une fois
    },

    createModal() {
        const modal = document.createElement("div");
        modal.id = "journal-modal";
        modal.className = "journal-modal";
        modal.innerHTML = `
            <div class="modal-content">
                <button class="panel-close" onclick="JournalManager.closeModal()">×</button>
                <div class="modal-visual" id="modal-visual"></div>
                <div class="modal-data" id="modal-data"></div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    updateJournalGrid() {
        const grid = document.getElementById("journal-grid");
        if (!grid) return;
        grid.innerHTML = "";

        ISLANDS_DATA.forEach(island => {
            island.insects.forEach(insect => {
                const isDiscovered = JOURNAL_STATE.discoveredInsects.includes(insect.id);
                const item = document.createElement("div");
                item.className = `journal-item ${isDiscovered ? '' : 'locked'}`;

                item.innerHTML = `
                    <div class="journal-item-icon">${isDiscovered ? insect.icon : "🔒"}</div>
                    <div class="journal-item-name">${isDiscovered ? insect.name : "Spécimen Inconnu"}</div>
                    <div class="journal-item-scientific">${isDiscovered ? insect.scientific : "---"}</div>
                `;

                if (isDiscovered) {
                    item.onclick = () => this.openModal(insect);
                }
                grid.appendChild(item);
            });
        });
    },

    openModal(insect) {
        const modal = document.getElementById("journal-modal");
        const visual = document.getElementById("modal-visual");
        const data = document.getElementById("modal-data");

        visual.innerHTML = `<div class="modal-icon-large">${insect.icon}</div>`;

        data.innerHTML = `
            <p class="modal-taxonomy">${insect.taxonomy || 'Arthropoda'}</p>
            <h2 class="panel-title">${insect.name}</h2>
            <p class="scientific-name">${insect.scientific}</p>
            <hr style="margin: 20px 0; opacity: 0.1">
            <div class="info-section">
                <h4>Rôle Écologique</h4>
                <p class="educational-text">${insect.role}</p>
            </div>
            <div class="info-section">
                <h4>Habitat Naturel</h4>
                <p class="educational-text">${insect.habitat}</p>
            </div>
            <div class="info-section">
                <h4>Note Scientifique</h4>
                <p class="educational-text italic">${insect.anecdote}</p>
            </div>
        `;

        modal.classList.add("active");
    },

    closeModal() {
        document.getElementById("journal-modal").classList.remove("active");
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
    }
};