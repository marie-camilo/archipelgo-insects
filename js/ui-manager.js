const UIManager = {
    previewEngine: null,
    previewScene: null,
    previewCamera: null,
    currentPreviewMesh: null,

    showIslandTooltip(islandData, mesh) {
        const tooltip = document.getElementById("island-tooltip");
        if(!tooltip) return;

        // Récupération du moteur actif (Map ou Island)
        const engine = MapScene.engine || IslandScene.engine;
        const scene = MapScene.scene || IslandScene.scene;
        const camera = MapScene.camera || IslandScene.camera;

        if(!engine || !scene || !camera) return;

        // Projection 3D -> 2D
        const screenPos = BABYLON.Vector3.Project(
            mesh.getAbsolutePosition(),
            BABYLON.Matrix.Identity(),
            scene.getTransformMatrix(),
            camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
        );

        // Calcul Progression
        const discovered = JOURNAL_STATE.discoveredInsects.filter(
            id => islandData.insects.some(i => i.id === id)
        ).length;
        const total = islandData.insects.length;
        const percent = (discovered / total) * 100;

        // Configuration Icone Font Awesome & Couleur
        let iconClass = "fa-leaf";
        let iconColor = "#81c784"; // Vert défaut

        if(islandData.id === "aquatic") {
            iconClass = "fa-water";
            iconColor = "#4fc3f7"; // Bleu clair
        }
        else if(islandData.id === "winter") {
            iconClass = "fa-snowflake";
            iconColor = "#90caf9"; // Bleu glace
        }
        else if(islandData.id === "pollinators") {
            iconClass = "fa-spa";
            iconColor = "#f48fb1"; // Rose
        }

        // Injection HTML
        tooltip.innerHTML = `
            <div class="tooltip-title">
                <span class="eco-icon" style="color: ${iconColor}; background: ${iconColor}20;">
                    <i class="fas ${iconClass}"></i>
                </span> 
                ${islandData.name}
            </div>
            <div class="tooltip-ecosystem">${islandData.ecosystem}</div>
            <div class="tooltip-progress-container">
                <div class="tooltip-progress-bar" style="width: ${percent}%"></div>
            </div>
            <div class="tooltip-footer">
                <span>Exploration</span>
                <span>${discovered}/${total}</span>
            </div>
        `;

        // Positionnement
        tooltip.style.left = screenPos.x + "px";
        tooltip.style.top = screenPos.y + "px";
        tooltip.classList.add("visible");
    },

    toggleGlobalHelp() {
        const modal = document.getElementById("global-help-modal");
        const mapScreen = document.getElementById("map-view-screen");

        if (!modal) return;

        if (mapScreen && !mapScreen.classList.contains("active")) {
            modal.classList.remove("visible");
            return;
        }

        if (modal.classList.contains("visible")) {
            modal.classList.remove("visible");
        } else {
            modal.classList.add("visible");
        }
    },

    showBaseCampTooltip(mesh) {
        const tooltip = document.getElementById("island-tooltip");
        if(!tooltip) return;

        const engine = MapScene.engine;
        const scene = MapScene.scene;
        const camera = MapScene.camera;
        if(!engine || !scene || !camera) return;

        const screenPos = BABYLON.Vector3.Project(
            mesh.getAbsolutePosition(),
            BABYLON.Matrix.Identity(),
            scene.getTransformMatrix(),
            camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
        );

        tooltip.innerHTML = `
            <div class="tooltip-title" style="text-align: left; display: flex; align-items: center; justify-content: flex-start; gap: 10px;">
                <span class="eco-icon" style="background:rgba(25, 118, 210, 0.1); color:#1976d2; margin: 0;">
                    <i class="fas fa-anchor"></i>
                </span>
                Port d'Attache
            </div>
            <div class="tooltip-ecosystem" style="text-align: left; padding-left: 2px;">Zone de départ</div>
            <div class="tooltip-footer" style="margin-top:10px; color:#1976d2; font-weight:bold; text-align: left;">
                Cliquez pour naviguer
            </div>
        `;

        tooltip.style.left = screenPos.x + "px";
        tooltip.style.top = screenPos.y + "px";
        tooltip.classList.add("visible");
    },

    hideIslandTooltip() {
        const tooltip = document.getElementById("island-tooltip");
        if(tooltip) tooltip.classList.remove("visible");
    },

    openNavigation() {
        const modal = document.getElementById("navigation-modal");
        const grid = document.getElementById("destinations-grid");
        if(!modal || !grid) return;

        grid.innerHTML = ""; // Reset

        const introText = document.createElement("p");
        introText.className = "nav-intro-text";
        introText.style.color = "#666";
        introText.style.marginBottom = "20px";
        introText.style.fontSize = "0.95rem";
        introText.style.textAlign = "left";

        introText.innerHTML = `
            <strong>Port d'Attache :</strong> Ce port est votre base d'opérations. 
            Sélectionnez une île ci-dessous pour lancer une expédition scientifique.
        `;
        grid.parentNode.insertBefore(introText, grid);

        ISLANDS_DATA.forEach(island => {
            const card = document.createElement("div");
            card.className = "dest-card";

            let iconClass = "fa-leaf";
            if(island.id === 'aquatic') iconClass = "fa-water";
            if(island.id === 'winter') iconClass = "fa-snowflake";
            if(island.id === 'pollinators') iconClass = "fa-spa";

            card.innerHTML = `
                <div class="dest-icon"><i class="fas ${iconClass}"></i></div>
                <div class="dest-name">${island.name}</div>
                <div style="font-size:0.8rem; color:#888">Voyage rapide</div>
            `;

            card.onclick = () => {
                this.closeNavigation();
                ArchipelagoApp.selectIsland(island.id);
            };

            grid.appendChild(card);
        });

        modal.classList.add("visible");
    },

    closeNavigation() {
        const modal = document.getElementById("navigation-modal");
        if(modal) modal.classList.remove("visible");
        const texts = document.querySelectorAll(".nav-intro-text");
        texts.forEach(t => t.remove());
        if (typeof MapScene !== 'undefined') {
            MapScene.resetNavigation();
        }
    },

    showIslandConfirmation(islandData) {
        const modal = document.getElementById("island-confirmation-modal");
        if(!modal) return;

        document.getElementById("conf-island-name").textContent = islandData.name;
        const confirmBtn = document.getElementById("btn-confirm-explore");

        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        newBtn.onclick = () => {
            // 1. Fermer la modale visuellement
            this.closeIslandConfirmation();

            const portPos = new BABYLON.Vector3(40, 0, 50);

            if (MapScene) {
                MapScene.zoomToBaseCamp(portPos, () => {
                    // 2. AVANT de partir : on libère le verrou de navigation
                    // Cela permet au retour sur la map d'être interactif
                    MapScene.isNavigating = false;

                    // 3. Lancer le voyage
                    ArchipelagoApp.selectIsland(islandData.id);
                });
            }
        };

        modal.classList.add("visible");
    },

    closeIslandConfirmation() {
        const modal = document.getElementById("island-confirmation-modal");
        if(modal) modal.classList.remove("visible");
    },

    showReturnMapConfirmation() {
        const modal = document.getElementById("return-map-confirmation-modal");
        if(!modal) return;

        const confirmBtn = document.getElementById("btn-confirm-return-map");

        // On clone pour éviter de cumuler les event listeners
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        newBtn.onclick = () => {
            this.closeReturnMapConfirmation();
            ArchipelagoApp.returnToMap(); // Appelle la fonction de retour globale
        };

        modal.classList.add("visible");
    },

    closeReturnMapConfirmation() {
        const modal = document.getElementById("return-map-confirmation-modal");
        if(modal) modal.classList.remove("visible");
    },

    showInteractiveModal(data) {
        const modal = document.getElementById("interactive-modal");
        if(!modal) return;

        document.getElementById("inter-title").textContent = data.title;
        document.getElementById("inter-text").textContent = data.text;
        document.getElementById("inter-icon").textContent = data.icon || "✨";

        modal.classList.add("visible");
    },

    closeInteractiveModal() {
        const modal = document.getElementById("interactive-modal");
        if(modal) modal.classList.remove("visible");
    },

    updateIslandInfo(islandData) {
        const title = document.getElementById("island-name");
        if(title) title.textContent = islandData.name;

        const eco = document.getElementById("island-ecosystem");
        if(eco) eco.textContent = islandData.ecosystem;

        const envDesc = document.getElementById("island-env-desc");
        if (envDesc) {
            envDesc.textContent = islandData.environmentDesc || "Description non disponible.";
        }
    },

    updateIslandProgress(islandId) {
        const island = ISLANDS_DATA.find(i => i.id === islandId);
        if (!island) return;

        const discoveredCount = JOURNAL_STATE.discoveredInsects.filter(
            id => island.insects.some(insect => insect.id === id)
        ).length;

        const totalCount = island.insects.length;
        const percentage = (discoveredCount / totalCount) * 100;

        const fill = document.getElementById("progress-fill");
        if (fill) fill.style.width = percentage + "%";

        const text = document.getElementById("progress-text");
        if (text) text.textContent = `${discoveredCount}/${totalCount} spécimens identifiés`;
    },

    showHelp(text, duration = 3000) {
        const help = document.getElementById("help-overlay");
        if (!help) return;

        help.querySelector("p").textContent = text;
        help.style.display = "block";

        setTimeout(() => {
            help.style.display = "none";
        }, duration);
    },

    showInsectPanel(insectData) {
        const panel = document.getElementById("right-panel");
        if (!panel) return;

        // A. Remplissage texte
        document.getElementById("insect-name").textContent = insectData.name;
        document.getElementById("insect-scientific").textContent = insectData.scientific;
        document.getElementById("insect-taxonomy").textContent = insectData.taxonomy || "";
        document.getElementById("insect-role").textContent = insectData.role;
        document.getElementById("insect-habitat").textContent = insectData.habitat;
        document.getElementById("insect-anecdote").textContent = insectData.anecdote;

        // B. Gestion du badge de statut
        const statusBadge = document.getElementById("insect-status");
        const statusText = insectData.status.toLowerCase();
        statusBadge.classList.remove('status-safe', 'status-warning', 'status-danger');

        if (statusText.includes("danger") || statusText.includes("menacé")) {
            statusBadge.classList.add('status-danger');
        } else if (statusText.includes("vulnérable") || statusText.includes("surveillance")) {
            statusBadge.classList.add('status-warning');
        } else {
            statusBadge.classList.add('status-safe');
        }
        statusBadge.querySelector('span:last-child').textContent = insectData.status;

        // C. LANCEMENT DE LA PREVIEW 3D
        this.initInsectPreview(insectData);

        panel.classList.add("open");
    },

    hideInsectPanel() {
        const panel = document.getElementById("right-panel");
        if (panel) panel.classList.remove("open");

        // Arrêter le moteur de preview pour économiser les ressources
        if (this.previewEngine) {
            this.previewEngine.stopRenderLoop();
        }
    },

    initInsectPreview(insectData) {
        const container = document.getElementById("insect-preview");
        if (!container) return;

        // A. Nettoyage
        container.innerHTML = "";

        // B. Création Canvas
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.outline = "none";
        canvas.style.cursor = "grab"; // Curseur main ouverte
        container.appendChild(canvas);

        // Ajout de l'indice visuel
        const hintDiv = document.createElement("div");
        hintDiv.className = "interaction-hint";
        hintDiv.innerHTML = `
            <span class="hint-text">Tournez pour observer</span>
            <div class="hint-icon"><i class="fas fa-hand-pointer"></i></div>
        `;
        container.appendChild(hintDiv);

        // C. Moteur (Singleton)
        if (this.previewEngine) {
            this.previewEngine.dispose();
        }
        this.previewEngine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

        // D. Scène
        this.previewScene = new BABYLON.Scene(this.previewEngine);
        this.previewScene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // Transparent

        // E. Caméra
        this.previewCamera = new BABYLON.ArcRotateCamera("previewCam", 0, Math.PI / 2.5, 5, BABYLON.Vector3.Zero(), this.previewScene);
        this.previewCamera.attachControl(canvas, true);
        this.previewCamera.wheelPrecision = 50;
        this.previewCamera.minZ = 0.1;
        this.previewCamera.lowerRadiusLimit = 2;
        this.previewCamera.upperRadiusLimit = 10;

        // Gestion du curseur "Grabbing" (main fermée)
        canvas.addEventListener("pointerdown", () => canvas.style.cursor = "grabbing");
        canvas.addEventListener("pointerup", () => canvas.style.cursor = "grab");

        // F. Lumières
        const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.previewScene);
        light.intensity = 1.2;
        const dirLight = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(1, -1, 1), this.previewScene);
        dirLight.intensity = 1.5;

        // G. Chargement Modèle
        const filename = insectData.modelFile || "sphere.glb";

        BABYLON.SceneLoader.ImportMeshAsync("", "./assets/insects/", filename, this.previewScene)
            .then((result) => {
                const root = result.meshes[0];
                this.currentPreviewMesh = root;

                // Normalisation Taille
                const boundingInfo = root.getHierarchyBoundingVectors();
                const sizeVec = boundingInfo.max.subtract(boundingInfo.min);
                const maxDimension = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);

                const targetSize = 3;
                const scaleFactor = targetSize / maxDimension;

                root.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);

                const center = boundingInfo.max.add(boundingInfo.min).scale(0.5);
                root.position = center.scale(-1 * scaleFactor);
                root.position.y += (sizeVec.y * scaleFactor) / 2 * 0.5;
            })
            .catch((err) => {
                console.warn("Erreur preview:", err);
                // Fallback cube si erreur de chargement
                const box = BABYLON.MeshBuilder.CreateBox("box", {size: 2}, this.previewScene);
                const mat = new BABYLON.StandardMaterial("m", this.previewScene);
                mat.diffuseColor = BABYLON.Color3.Red();
                box.material = mat;
            });

        // H. Boucle de rendu
        this.previewEngine.runRenderLoop(() => {
            if (this.previewScene) {
                // Rotation auto lente si l'utilisateur ne touche pas (optionnel)
                // if (this.currentPreviewMesh) this.currentPreviewMesh.rotation.y += 0.002;
                this.previewScene.render();
            }
        });

        // I. Resize (Important si la fenêtre change de taille)
        window.addEventListener("resize", () => {
            if(this.previewEngine) this.previewEngine.resize();
        });
    }
};