const JournalManager = {
    previewEngine: null,
    previewScene: null,
    previewCamera: null,

    // Initialisation au lancement de l'application
    init() {
        console.log("Journal Manager initialized");
        this.renderJournalGrid();
        this.updateJournalStats();

        // Gestionnaire de redimensionnement pour la modale 3D
        window.addEventListener("resize", () => {
            if (this.previewEngine) this.previewEngine.resize();
        });
    },

    // Génère la grille des insectes (Découverts vs Verrouillés)
    renderJournalGrid() {
        const grid = document.getElementById("journal-grid");
        if (!grid) return;

        grid.innerHTML = "";

        // On aplatit la structure pour avoir une liste simple de tous les insectes
        const allInsects = [];
        ISLANDS_DATA.forEach(island => {
            island.insects.forEach(insect => {
                insect.islandId = island.id; // On garde une référence à l'île
                allInsects.push(insect);
            });
        });

        allInsects.forEach(insect => {
            const isDiscovered = JOURNAL_STATE.discoveredInsects.includes(insect.id);

            const card = document.createElement("div");
            card.className = `journal-item ${isDiscovered ? '' : 'locked'}`;

            if (isDiscovered) {
                // Carte verrouillée
                card.innerHTML = `
                    <div class="journal-item-icon">${insect.icon}</div>
                    <div class="journal-item-name">${insect.name}</div>
                    <div class="journal-item-scientific">${insect.scientific}</div>
                `;
                // Au clic : Ouvre la modale 3D
                card.onclick = () => this.showInsectDetails(insect);
            } else {
                // Carte verrouillée
                card.innerHTML = `
                    <div class="journal-item-icon" style="filter:grayscale(1); opacity:0.3">❓</div>
                    <div class="journal-item-name">???</div>
                    <div class="journal-item-scientific">Non découvert</div>
                `;
            }

            grid.appendChild(card);
        });
    },

    updateJournalStats() {
        const allInsectsCount = ISLANDS_DATA.reduce((acc, island) => acc + island.insects.length, 0);
        const discoveredCount = JOURNAL_STATE.discoveredInsects.length;
        const exploredIslandsCount = JOURNAL_STATE.exploredIslands.length;

        // Mise à jour UI Journal
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

    //Ajoute un insecte découvert et sauvegarde
    addInsect(insectId) {
        if (!JOURNAL_STATE.discoveredInsects.includes(insectId)) {
            JOURNAL_STATE.discoveredInsects.push(insectId);

            this.renderJournalGrid();
            this.updateJournalStats();

            // Sauvegarde dans le navigateur
            localStorage.setItem('archipelago_save', JSON.stringify(JOURNAL_STATE));
            console.log(`Insecte découvert sauvegardé : ${insectId}`);

            this.checkVictoryCondition();
        }
    },

    checkVictoryCondition() {
        // 1. Calculer le total
        const allInsectsCount = ISLANDS_DATA.reduce((acc, island) => acc + island.insects.length, 0);
        const discoveredCount = JOURNAL_STATE.discoveredInsects.length;

        // 2. Si on a tout trouvé
        if (discoveredCount >= allInsectsCount) {
            // Petit délai pour laisser le temps de voir l'animation de découverte
            setTimeout(() => {
                this.triggerVictoryScreen();
            }, 1500);
        }
    },

    triggerVictoryScreen() {
        const screen = document.getElementById("conclusion-screen");
        if (!screen) return;

        // 1. Textes
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

        // 2. Affichage avec classe Active (pour l'anim CSS)
        screen.classList.add("active");

        // 3. CONFETTIS !! (La partie fun)
        this.fireConfetti();
    },

    fireConfetti() {
        // Un tir central explosif continu
        if (typeof confetti === 'function') {
            const duration = 3000;
            const end = Date.now() + duration;

            // Couleurs de l'archipel
            const colors = ['#1976d2', '#81c784', '#ffd54f'];

            // ON DÉFINIT UN Z-INDEX TRÈS HAUT (supérieur à 3000 de l'overlay)
            const confettiZIndex = 4000;

            (function frame() {
                // Canon de gauche
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors,
                    zIndex: confettiZIndex // <--- AJOUT ICI
                });

                // Canon de droite
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors,
                    zIndex: confettiZIndex // <--- ET ICI
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    },

    // Appelle cette fonction depuis la console F12 pour tester : JournalManager.debugVictory()
    debugVictory() {
        console.log("DEBUG: Lancement forcé de la victoire");
        this.triggerVictoryScreen();
    },

    // GESTION DE LA MODALE & PRÉVISUALISATION 3D
    showInsectDetails(insectData) {
        const modal = document.getElementById("journal-modal");
        if(!modal) return;

        const nameTitle = document.getElementById("modal-name");
        const taxoTitle = document.getElementById("modal-taxonomy");

        if(nameTitle) nameTitle.textContent = insectData.name;
        if(taxoTitle) taxoTitle.textContent = insectData.taxonomy || "";

        const detailsContainer = modal.querySelector(".modal-data");

        // couleur du badge selon le statut
        let statusColor = "#2ecc71"; // Vert
        const statusLower = insectData.status.toLowerCase();
        if(statusLower.includes("danger") || statusLower.includes("menacé") || statusLower.includes("disparition")) statusColor = "#e74c3c"; // Rouge
        if(statusLower.includes("vulnérable") || statusLower.includes("surveillance")) statusColor = "#f39c12"; // Orange

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
                <span style="background:${statusColor}; width:10px; height:10px; border-radius:50%; display:inline-block; margin-right:8px;"></span>
                <span>${insectData.status}</span>
            </div>
        `;

        // AFFICHER LA MODALE
        modal.classList.add("active");

        // INITIALISER LA 3D (COLONNE GAUCHE)
        setTimeout(() => {
            this.init3DPreview(insectData);
        }, 50);
    },

    // Ferme la modale
    closeModal() {
        const modal = document.getElementById("journal-modal");
        if(modal) modal.classList.remove("active");

        this.dispose3DPreview();
    },

    /**
     * Crée une scène BabylonJS dédiée à la prévisualisation de l'insecte
     */
    init3DPreview(insectData) {
        const container = document.getElementById("journal-3d-container");
        if (!container) return;

        // Nettoyage préventif
        container.innerHTML = "";
        this.dispose3DPreview();

        // Création du Canvas
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.outline = "none";
        container.appendChild(canvas);

        // Initialisation Moteur
        this.previewEngine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        this.previewScene = new BABYLON.Scene(this.previewEngine);
        this.previewScene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // Fond Transparent

        // Caméra (Auto-rotation activée)
        // Radius 6 pour avoir un peu de recul
        this.previewCamera = new BABYLON.ArcRotateCamera("journalCam", 0, Math.PI / 2.5, 6, BABYLON.Vector3.Zero(), this.previewScene);
        this.previewCamera.attachControl(canvas, true);
        this.previewCamera.wheelPrecision = 50;
        this.previewCamera.lowerRadiusLimit = 2;
        this.previewCamera.upperRadiusLimit = 15;
        this.previewCamera.useAutoRotationBehavior = true; // L'insecte tourne tout seul

        // Config de l'auto-rotation
        if(this.previewCamera.autoRotationBehavior) {
            this.previewCamera.autoRotationBehavior.idleRotationSpeed = 0.5;
        }

        // Lumières (Studio)
        const hemi = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.previewScene);
        hemi.intensity = 1.0;
        const dir = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(1, -1, 1), this.previewScene);
        dir.intensity = 1.5;

        // Chargement du Modèle
        const filename = insectData.modelFile || "sphere.glb";

        BABYLON.SceneLoader.ImportMeshAsync("", "./assets/insects/", filename, this.previewScene)
            .then((result) => {
                const root = result.meshes[0];

                // --- NORMALISATION INTELLIGENTE ---
                // Calcule la boite englobante pour redimensionner l'insecte parfaitement
                const boundingInfo = root.getHierarchyBoundingVectors();
                const sizeVec = boundingInfo.max.subtract(boundingInfo.min);
                const maxDimension = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);

                // On veut que l'insecte fasse environ 4 unités dans la scène
                const targetSize = 4;
                const scaleFactor = targetSize / maxDimension;

                root.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);

                // Centrage : on déplace l'insecte pour que son centre soit à (0,0,0)
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

    /**
     * Nettoyage propre de BabylonJS
     */
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

// CHARGEMENT INITIAL DE LA SAUVEGARDE
(function loadSaveGame() {
    const savedData = localStorage.getItem('archipelago_save');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if(parsed.discoveredInsects) JOURNAL_STATE.discoveredInsects = parsed.discoveredInsects;
            if(parsed.exploredIslands) JOURNAL_STATE.exploredIslands = parsed.exploredIslands;
            console.log("💾 Sauvegarde chargée avec succès.");
        } catch (e) {
            console.error("Erreur lecture sauvegarde:", e);
        }
    }
})();