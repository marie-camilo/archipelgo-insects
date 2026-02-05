/** CODE GÉNÉRÉ PAR IA **/
/** Ce fichier regroupe les fonctions mathématiques complexes utilisées pour simuler la physique des fluides (vagues) et les interpolations.
* Il est détaché de la logique métier pour alléger le code principal. **/
const IAMath = {
    /**
     * Calcule la hauteur Y d'une vague à une position X, Z donnée et un temps T.
     * Utilise une combinaison de Sinus et Cosinus pour un effet naturel.
     */
    calculateWaveHeight: function(x, z, time, waveHeight = 1.0, waveFreq = 0.15) {
        return Math.sin(x * waveFreq + time) * Math.cos(z * waveFreq + time) * waveHeight;
    },

    /**
     * Met à jour tout le maillage (vertices) d'un plan d'eau.
     * Optimisé pour ne pas recréer de tableaux à chaque frame.
     */
    updateOceanVertices: function(waterMesh, basePositions, time, waveHeight = 1.0, waveFreq = 0.15) {
        if (!waterMesh || !basePositions) return;

        // On copie le tableau de positions initiales
        const positions = [...basePositions];

        // On parcourt chaque vertex (point) du maillage
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];

            // Calcul de la hauteur Y via la formule mathématique
            const y = this.calculateWaveHeight(x, z, time, waveHeight, waveFreq);

            positions[i + 1] = y; // Application de la hauteur
        }

        // Envoi des nouvelles données à la carte graphique
        waterMesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);

        // Recalcul des normales pour que la lumière réagisse bien aux nouvelles formes
        waterMesh.createNormals(false);
    }
};