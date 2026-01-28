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

    hideIslandTooltip() {
        const tooltip = document.getElementById("island-tooltip");
        if(tooltip) tooltip.classList.remove("visible");
    },
};