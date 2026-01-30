const UIManager = {
    previewEngine: null,
    previewScene: null,
    previewCamera: null,
    currentPreviewMesh: null,

    showIslandTooltip(islandData, mesh) {
        const tooltip = document.getElementById("island-tooltip");
        if(!tooltip) return;

        const engine = MapScene.engine || IslandScene.engine;
        const scene = MapScene.scene || IslandScene.scene;
        const camera = MapScene.camera || IslandScene.camera;

        if(!engine || !scene || !camera) return;

        const screenPos = BABYLON.Vector3.Project(
            mesh.getAbsolutePosition(),
            BABYLON.Matrix.Identity(),
            scene.getTransformMatrix(),
            camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
        );

        const discovered = JOURNAL_STATE.discoveredInsects.filter(
            id => islandData.insects.some(i => i.id === id)
        ).length;
        const total = islandData.insects.length;
        const percent = (discovered / total) * 100;

        let iconClass = "fa-leaf";
        let iconColor = "#58984a";

        if(islandData.id === "aquatic") {
            iconClass = "fa-water";
            iconColor = "#0e6aa1";
        }
        else if(islandData.id === "winter") {
            iconClass = "fa-snowflake";
            iconColor = "#429dc6";
        }
        else if(islandData.id === "pollinators") {
            iconClass = "fa-spa";
            iconColor = "#f48fb1";
        }

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

        tooltip.style.left = screenPos.x + "px";
        tooltip.style.top = screenPos.y + "px";
        tooltip.classList.add("visible");
    },

    updateIslandInfo(islandData) {
        document.getElementById("island-name").textContent = islandData.name;
        document.getElementById("island-ecosystem").textContent = islandData.ecosystem;

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

        // 1. Remplissage texte
        document.getElementById("insect-name").textContent = insectData.name;
        document.getElementById("insect-scientific").textContent = insectData.scientific;
        document.getElementById("insect-taxonomy").textContent = insectData.taxonomy || "";
        document.getElementById("insect-role").textContent = insectData.role;
        document.getElementById("insect-habitat").textContent = insectData.habitat;
        document.getElementById("insect-anecdote").textContent = insectData.anecdote;

        // 2. Gestion du badge de statut
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

        // 3. LANCEMENT DE LA PREVIEW 3D
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

    hideIslandTooltip() {
        const tooltip = document.getElementById("island-tooltip");
        if(tooltip) tooltip.classList.remove("visible");
    },

    // ─────────────────────────────────────────────────────────────────
    // LOGIQUE DE LA PREVIEW 3D (MINI-SCÈNE)
    // ─────────────────────────────────────────────────────────────────

    initInsectPreview(insectData) {
        const container = document.getElementById("insect-preview");
        if (!container) return;

        // A. Nettoyage du conteneur (retirer le "?" ou l'ancien canvas)
        container.innerHTML = "";

        // B. Création d'un canvas dédié
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.outline = "none";
        container.appendChild(canvas);

        // C. Initialisation du moteur SI il n'existe pas encore (Singleton)
        // On recrée le moteur à chaque fois pour éviter les conflits de contextes GL sur les canvas dynamiques
        if (this.previewEngine) {
            this.previewEngine.dispose();
        }

        this.previewEngine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

        // D. Création de la scène
        this.previewScene = new BABYLON.Scene(this.previewEngine);
        this.previewScene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // FOND TRANSPARENT !

        // E. Caméra (Auto-rotation)
        this.previewCamera = new BABYLON.ArcRotateCamera("previewCam", 0, Math.PI / 2.5, 5, BABYLON.Vector3.Zero(), this.previewScene);
        this.previewCamera.attachControl(canvas, true);
        this.previewCamera.wheelPrecision = 50;
        this.previewCamera.minZ = 0.1;

        // Empêcher de zoomer trop loin ou trop près
        this.previewCamera.lowerRadiusLimit = 2;
        this.previewCamera.upperRadiusLimit = 10;

        // F. Lumières (Studio)
        const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.previewScene);
        light.intensity = 1.2;
        const dirLight = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(1, -1, 1), this.previewScene);
        dirLight.intensity = 1.5;

        // G. Chargement du modèle
        const filename = insectData.modelFile || "sphere.glb";

        BABYLON.SceneLoader.ImportMeshAsync("", "./assets/insects/", filename, this.previewScene)
            .then((result) => {
                const root = result.meshes[0];
                this.currentPreviewMesh = root;

                // --- NORMALISATION DE LA TAILLE ---
                // C'est l'étape clé : on force tous les insectes à avoir la même taille visuelle
                const boundingInfo = root.getHierarchyBoundingVectors();
                const sizeVec = boundingInfo.max.subtract(boundingInfo.min);
                const maxDimension = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);

                // Si l'insecte est trop petit ou trop grand, on l'ajuste pour qu'il fasse environ 3 unités
                const targetSize = 3;
                const scaleFactor = targetSize / maxDimension;

                root.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);

                // Centrage parfait (Le point de pivot est parfois décalé sur les modèles)
                const center = boundingInfo.max.add(boundingInfo.min).scale(0.5);
                // On déplace le modèle à l'opposé de son centre pour le ramener à (0,0,0)
                root.position = center.scale(-1 * scaleFactor);
                // On remonte un tout petit peu pour qu'il soit bien centré visuellement
                root.position.y += (sizeVec.y * scaleFactor) / 2 * 0.5;

            })
            .catch((err) => {
                console.warn("Erreur preview:", err);
                // Fallback cube si erreur
                const box = BABYLON.MeshBuilder.CreateBox("box", {size: 2}, this.previewScene);
                const mat = new BABYLON.StandardMaterial("m", this.previewScene);
                mat.diffuseColor = BABYLON.Color3.Red();
                box.material = mat;
            });

        // H. Boucle d'animation (Rotation lente)
        this.previewEngine.runRenderLoop(() => {
            if (this.previewScene) {
                if (this.currentPreviewMesh) {
                    this.currentPreviewMesh.rotation.y += 0.01; // Rotation automatique élégante
                }
                this.previewScene.render();
            }
        });
    }
};