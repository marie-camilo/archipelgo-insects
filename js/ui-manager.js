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

    showInsectPanel(insectData) {
        const panel = document.getElementById("right-panel");
        if (!panel) return;

        // Remplissage des textes
        document.getElementById("insect-name").textContent = insectData.name;
        document.getElementById("insect-scientific").textContent = insectData.scientific;
        document.getElementById("insect-role").textContent = insectData.role || "Non défini";
        document.getElementById("insect-habitat").textContent = insectData.habitat || "Non défini";
        document.getElementById("insect-anecdote").textContent = insectData.anecdote || "";

        // Icône / Placeholder
        const placeholder = document.querySelector(".model-placeholder");
        if (placeholder) placeholder.textContent = insectData.icon || "🪲";

        // Animation d'ouverture
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