/* UI MANAGER - Gère l'interface 2D */

const UIManager = {
    // Affiche l'info-bulle au survol d'une île (Carte)
    showIslandTooltip(islandData, mesh) {
        const tooltip = document.getElementById("island-tooltip");
        if(!tooltip) return;

        // Calculer la position 2D de l'île sur l'écran
        const engine = MapScene.engine;
        const scene = MapScene.scene;
        const camera = MapScene.camera;

        // Projection 3D -> 2D
        const screenPos = BABYLON.Vector3.Project(
            mesh.position,
            BABYLON.Matrix.Identity(),
            scene.getTransformMatrix(),
            camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
        );

        tooltip.style.left = screenPos.x + "px";
        tooltip.style.top = screenPos.y + "px";
        tooltip.querySelector(".tooltip-title").textContent = islandData.name;
        tooltip.querySelector(".tooltip-ecosystem").textContent = islandData.ecosystem;
        tooltip.classList.add("visible");
    },

    hideIslandTooltip() {
        const tooltip = document.getElementById("island-tooltip");
        if(tooltip) tooltip.classList.remove("visible");
    },

    // Met à jour la barre de progression à gauche
    updateIslandProgress(islandId) {
        const island = ISLANDS_DATA.find(i => i.id === islandId);
        if (!island) return;

        const discovered = JOURNAL_STATE.discoveredInsects.filter(
            id => island.insects.some(i => i.id === id)
        ).length;
        const total = island.insects.length;
        const percentage = (discovered / total) * 100;

        document.getElementById("progress-fill").style.width = percentage + "%";
        document.getElementById("progress-text").textContent =
            `${discovered}/${total} insectes découverts`;
    },

    // --- C'EST ICI QUE SE JOUE L'OUVERTURE DU PANEL ---
    showInsectPanel(insectData) {
        console.log("UI: Ouverture du panneau pour", insectData.name); // Log pour vérifier

        const panel = document.getElementById("right-panel");

        // Remplissage des données
        document.getElementById("insect-name").textContent = insectData.name;
        document.getElementById("insect-scientific").textContent = insectData.scientific;
        document.getElementById("insect-role").textContent = insectData.role;
        document.getElementById("insect-habitat").textContent = insectData.habitat;
        document.getElementById("insect-anecdote").textContent = insectData.anecdote;

        // Icone
        document.querySelector(".model-placeholder").textContent = insectData.icon || "🐛";

        // Statut (Menacé/Commun)
        const statusBadge = document.getElementById("insect-status");
        let statusIcon = "✅";
        if(insectData.status === "menacé" || insectData.status === "protégé") statusIcon = "⚠️";
        statusBadge.innerHTML = `<span class="status-icon">${statusIcon}</span><span>${insectData.status}</span>`;

        // AJOUT DE LA CLASSE POUR L'ANIMATION CSS
        panel.classList.add("open");
    },

    hideInsectPanel() {
        const panel = document.getElementById("right-panel");
        if(panel) panel.classList.remove("open");
    },
};