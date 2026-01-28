const UIManager = {
    showIslandTooltip(islandData, mesh) {
        const tooltip = document.getElementById("island-tooltip");
        if(!tooltip) return;

        // 1. Calcul de la position (Inchangé)
        const engine = MapScene.engine;
        const scene = MapScene.scene;
        const camera = MapScene.camera;

        const screenPos = BABYLON.Vector3.Project(
            mesh.getAbsolutePosition(),
            BABYLON.Matrix.Identity(),
            scene.getTransformMatrix(),
            camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
        );

        // 2. Injection du contenu moderne
        const discovered = JOURNAL_STATE.discoveredInsects.filter(
            id => islandData.insects.some(i => i.id === id)
        ).length;
        const total = islandData.insects.length;
        const percent = (discovered / total) * 100;

        // On ajoute des icônes selon l'écosystème
        let ecoIcon = "🌱";
        if(islandData.id === "aquatic") ecoIcon = "💧";
        if(islandData.id === "winter") ecoIcon = "❄️";
        if(islandData.id === "pollinators") ecoIcon = "🌸";

        tooltip.innerHTML = `
            <div class="tooltip-title"><span>${ecoIcon}</span> ${islandData.name}</div>
            <div class="tooltip-ecosystem">${islandData.ecosystem}</div>
            <div class="tooltip-progress-container">
                <div class="tooltip-progress-bar" style="width: ${percent}%"></div>
            </div>
            <div class="tooltip-footer">
                <span>Exploration</span>
                <span>${discovered}/${total}</span>
            </div>
        `;

        // 3. Positionnement et visibilité
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

    // Met à jour la barre de progression du panneau de gauche (Island Exploration)
    updateIslandProgress(islandId) {
        const island = ISLANDS_DATA.find(i => i.id === islandId);
        if (!island) return;

        // On compte combien d'insectes de CETTE île sont dans le journal
        const discoveredCount = JOURNAL_STATE.discoveredInsects.filter(
            id => island.insects.some(insect => insect.id === id)
        ).length;

        const totalCount = island.insects.length;
        const percentage = (discoveredCount / totalCount) * 100;

        // Mise à jour de la barre visuelle
        const fill = document.getElementById("progress-fill");
        if (fill) fill.style.width = percentage + "%";

        // Mise à jour du texte (ex: 1/2 spécimens identifiés)
        const text = document.getElementById("progress-text");
        if (text) text.textContent = `${discoveredCount}/${totalCount} spécimens identifiés`;

        console.log(`📊 Progression ${island.name} : ${discoveredCount}/${totalCount}`);
    },

    // Affiche/Masque l'overlay d'aide au centre
    showHelp(text, duration = 3000) {
        const help = document.getElementById("help-overlay");
        if (!help) return;

        help.querySelector("p").textContent = text;
        help.style.display = "block";

        setTimeout(() => {
            help.style.display = "none";
        }, duration);
    },

    // Affiche la fiche de l'insecte (Right Panel)
    showInsectPanel(insectData) {
        const panel = document.getElementById("right-panel");
        if (!panel) return;

        // Remplissage texte
        document.getElementById("insect-name").textContent = insectData.name;
        document.getElementById("insect-scientific").textContent = insectData.scientific;
        document.getElementById("insect-taxonomy").textContent = insectData.taxonomy || "";
        document.getElementById("insect-role").textContent = insectData.role;
        document.getElementById("insect-habitat").textContent = insectData.habitat;
        document.getElementById("insect-anecdote").textContent = insectData.anecdote;

        // Gestion du badge de statut
        const statusBadge = document.getElementById("insect-status");
        const statusText = insectData.status.toLowerCase();

        // Nettoyage des anciennes classes
        statusBadge.classList.remove('status-safe', 'status-warning', 'status-danger');

        // Logique de couleur
        if (statusText.includes("danger") || statusText.includes("menacé")) {
            statusBadge.classList.add('status-danger');
        } else if (statusText.includes("vulnérable") || statusText.includes("surveillance")) {
            statusBadge.classList.add('status-warning');
        } else {
            statusBadge.classList.add('status-safe');
        }

        statusBadge.querySelector('span:last-child').textContent = insectData.status;

        panel.classList.add("open");
    },

    hideInsectPanel() {
        const panel = document.getElementById("right-panel");
        if (panel) panel.classList.remove("open");
    },

    hideIslandTooltip() {
        const tooltip = document.getElementById("island-tooltip");
        if(tooltip) tooltip.classList.remove("visible");
    },
};