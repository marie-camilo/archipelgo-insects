const JournalManager = {
    previewEngine: null,
    previewScene: null,
    previewCamera: null,
    currentEngine: null,
    currentInsectData: null,

    init() {
        this.renderJournalGrid();
        this.updateJournalStats();
        window.addEventListener("resize", () => {
            if (this.previewEngine) this.previewEngine.resize();
            if (this.currentEngine) this.currentEngine.resize();
        });
    },

    render() {
        this.renderJournalGrid();
        this.updateJournalStats();
    },

    // génréer la grille des insectes découverts
    renderJournalGrid() {
        const grid = document.getElementById("journal-grid");
        if (!grid) return;
        grid.innerHTML = "";

        const allInsects = [];
        ISLANDS_DATA.forEach(island => {
            island.insects.forEach(insect => {
                allInsects.push(insect);
            });
        });

        allInsects.forEach(insect => {
            const isDiscovered = JOURNAL_STATE.discoveredInsects.includes(insect.id);
            const card = document.createElement("div");
            card.className = `journal-item ${isDiscovered ? '' : 'locked'}`;

            if (isDiscovered) {
                card.innerHTML = `
                    <div class="journal-item-icon">${insect.icon}</div>
                    <div class="journal-item-name">${insect.name}</div>
                    <div class="journal-item-scientific">${insect.scientific}</div>
                `;
                card.onclick = () => this.showInsectDetails(insect);
            } else {
                card.innerHTML = `
                    <div class="journal-item-icon" style="filter:grayscale(1); opacity:0.3">❓</div>
                    <div class="journal-item-name">???</div>
                `;
            }
            grid.appendChild(card);
        });
    },

    updateJournalStats() {
        const allInsectsCount = ISLANDS_DATA.reduce((acc, island) => acc + island.insects.length, 0);
        const discoveredCount = JOURNAL_STATE.discoveredInsects.length;
        const exploredIslandsCount = JOURNAL_STATE.exploredIslands.length;

        const elements = {
            total: document.getElementById("total-insects"),
            disc: document.getElementById("total-discovered"),
            islExp: document.getElementById("islands-explored")
        };

        if(elements.total) elements.total.textContent = allInsectsCount;
        if(elements.disc) elements.disc.textContent = discoveredCount;
        if(elements.islExp) elements.islExp.textContent = exploredIslandsCount;

        const finalInsects = document.getElementById("final-insects");
        const finalIslands = document.getElementById("final-islands");
        if(finalInsects) finalInsects.textContent = discoveredCount;
        if(finalIslands) finalIslands.textContent = exploredIslandsCount;
    },

    // ajout d'un insecte découvert et sauvegarde
    addInsect(insectId) {
        if (!JOURNAL_STATE.discoveredInsects.includes(insectId)) {
            JOURNAL_STATE.discoveredInsects.push(insectId);

            this.renderJournalGrid();
            this.updateJournalStats();

            // sauvegarde dans le navigateur
            localStorage.setItem('archipelago_save', JSON.stringify(JOURNAL_STATE));
            console.log(`Insecte découvert sauvegardé : ${insectId}`);

            this.checkVictoryCondition();
        }
    },

    // modale de victoire si tous les insectes sont découverts
    checkVictoryCondition() {
        const allInsectsCount = ISLANDS_DATA.reduce((acc, island) => acc + island.insects.length, 0);
        const discoveredCount = JOURNAL_STATE.discoveredInsects.length;

        if (discoveredCount >= allInsectsCount) {
            setTimeout(() => {
                this.triggerVictoryScreen();
            }, 1500);
        }
    },

    triggerVictoryScreen() {
        const screen = document.getElementById("conclusion-screen");
        if (!screen) return;

        const title = screen.querySelector(".conclusion-title");
        const msg = screen.querySelector(".conclusion-message");

        if (title) title.textContent = "Félicitations !!";
        if (msg) {
            msg.innerHTML = `
                Super ! Vous avez répertorié <strong>100% des espèces</strong>.<br><br>
                Grâce à votre persévérance, la base de données scientifique est complète. 
                Nous comprenons mieux comment chaque maillon, du plus petit puceron au grand prédateur, soutient cet écosystème fragile.<br><br>
                <span style="font-size: 0.9em; font-style: italic; color: #888;">
                (Les insectes vous remercient pour votre intérêt, mais demandent poliment à pouvoir retourner se cacher sous leurs feuilles maintenant.)
                </span>
            `;
        }

        screen.classList.add("active");

        this.fireConfetti(); // affichage des confettis
    },

    // Animation des confettis
    fireConfetti() {
        if (typeof confetti === 'function') {
            const duration = 3000;
            const end = Date.now() + duration;
            const colors = ['#1976d2', '#81c784', '#ffd54f'];
            const confettiZIndex = 4000;

            (function frame() {
                // Canon de gauche
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors,
                    zIndex: confettiZIndex
                });

                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors,
                    zIndex: confettiZIndex
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    },

    // console F12 pour tester : JournalManager.debugVictory()
    debugVictory() {
        console.log("DEBUG: Lancement forcé de la victoire");
        this.triggerVictoryScreen();
    },

    showInsectDetails(insectData) {
        this.currentInsectData = insectData;
        const modal = document.getElementById("journal-modal");
        if(!modal) return;

        document.getElementById("modal-name").textContent = insectData.name;
        document.getElementById("modal-taxonomy").textContent = insectData.scientific;

        const nameTitle = document.getElementById("modal-name");
        const taxoTitle = document.getElementById("modal-taxonomy");

        if(nameTitle) nameTitle.textContent = insectData.name;
        if(taxoTitle) taxoTitle.textContent = insectData.taxonomy || "";

        const detailsContainer = modal.querySelector(".modal-data");

        let statusColor = "#2ecc71";
        const statusLower = insectData.status.toLowerCase();
        if(statusLower.includes("danger") || statusLower.includes("menacé") || statusLower.includes("disparition")) statusColor = "#e74c3c";
        if(statusLower.includes("vulnérable") || statusLower.includes("surveillance")) statusColor = "#f39c12";

        const existingH2 = detailsContainer.querySelector("h2").outerHTML;
        const existingP = detailsContainer.querySelector(".modal-taxonomy").outerHTML;

        detailsContainer.innerHTML = `
    ${existingH2}
    ${existingP}
    
    <div class="modal-divider"></div>
    
    <div class="info-section">
        <h4>Description & Rôle</h4>
        <p class="educational-text">${insectData.role}. ${insectData.anecdote}</p>
    </div>

    <div class="info-section">
        <h4>Habitat</h4>
        <p class="educational-text">${insectData.habitat}</p>
    </div>

    <div class="status-badge" style="margin-top:auto; align-self:start; border: 1px solid ${statusColor}; color:${statusColor}; background:rgba(255,255,255,0.8);">
        <span>${insectData.status}</span>
    </div>
`;

        modal.classList.add("active");

        setTimeout(() => {
            this.init3DPreview(insectData);
        }, 50);
    },

    openModal(insectData) {
        const modal = document.getElementById("journal-modal");
        modal.classList.add("active");

        document.getElementById("modal-name").textContent = insectData.name;
        document.getElementById("modal-taxonomy").textContent = insectData.scientific;
        document.getElementById("modal-description").textContent = insectData.anecdote;
        document.getElementById("modal-role").textContent = insectData.role;

        const canvas = document.getElementById("inspectCanvas");

        // détruit l'ancien moteur s'il existe
        if (this.currentEngine) {
            this.currentEngine.dispose();
        }

        this.currentEngine = IABabylon.initInspectionEngine(canvas, insectData.modelFile);

        modal.classList.add("active");

        setTimeout(() => {
            this.init3DPreview(insectData);
        }, 50);
    },

    closeModal() {
        const modal = document.getElementById("journal-modal");
        modal.classList.remove("active");

        if (this.currentEngine) {
            this.currentEngine.dispose();
            this.currentEngine = null;
        }
    },

    //creation d'une scène pour prévisualiser l'insecte
    init3DPreview(insectData) {
        const container = document.getElementById("journal-3d-container");
        if (!container) return;

        container.innerHTML = "";
        this.dispose3DPreview();

        // Création du Canvas
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.outline = "none";
        container.appendChild(canvas);

        this.previewEngine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        this.previewScene = new BABYLON.Scene(this.previewEngine);
        this.previewScene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

        this.previewCamera = new BABYLON.ArcRotateCamera("journalCam", 0, Math.PI / 2.5, 6, BABYLON.Vector3.Zero(), this.previewScene);
        this.previewCamera.attachControl(canvas, true);
        this.previewCamera.wheelPrecision = 50;
        this.previewCamera.lowerRadiusLimit = 2;
        this.previewCamera.upperRadiusLimit = 15;
        this.previewCamera.useAutoRotationBehavior = true;

        // Config de l'auto-rotation
        if(this.previewCamera.autoRotationBehavior) {
            this.previewCamera.autoRotationBehavior.idleRotationSpeed = 0.5;
        }

        // Lumières
        const hemi = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.previewScene);
        hemi.intensity = 1.0;
        const dir = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(1, -1, 1), this.previewScene);
        dir.intensity = 1.5;

        // Chargement du Modèle
        const filename = insectData.modelFile || "sphere.glb";

        BABYLON.SceneLoader.ImportMeshAsync("", "./assets/insects/", filename, this.previewScene)
            .then((result) => {
                const root = result.meshes[0];
                const boundingInfo = root.getHierarchyBoundingVectors();
                const sizeVec = boundingInfo.max.subtract(boundingInfo.min);
                const maxDimension = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
                const targetSize = 4;
                const scaleFactor = targetSize / maxDimension;

                root.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);

                const center = boundingInfo.max.add(boundingInfo.min).scale(0.5);
                root.position = center.scale(-1 * scaleFactor);
            })
            .catch((err) => {
                console.warn("Erreur chargement modèle journal:", err);
            });

        // Boucle de rendu
        this.previewEngine.runRenderLoop(() => {
            if (this.previewScene) this.previewScene.render();
        });
    },

    dispose3DPreview() {
        if (this.previewEngine) {
            this.previewEngine.stopRenderLoop();
            this.previewEngine.dispose();
            this.previewEngine = null;
            this.previewScene = null;
            this.previewCamera = null;
        }
    }
};

(function loadSaveGame() {
    const savedData = localStorage.getItem('archipelago_save');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if(parsed.discoveredInsects) JOURNAL_STATE.discoveredInsects = parsed.discoveredInsects;
            if(parsed.exploredIslands) JOURNAL_STATE.exploredIslands = parsed.exploredIslands;
            console.log("Sauvegarde chargée avec succès.");
        } catch (e) {
            console.error("Erreur lecture sauvegarde:", e);
        }
    }
})();