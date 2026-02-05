/** CODE GÉNÉRÉ PAR IA **/
/* Helpers pour la gestion des effets de post-process BabylonJS (Scanner) */

const IABabylon = {
    createScannerEffect: function(scene) {
        // On vérifie si le layer existe déjà pour éviter les doublons
        let hl = scene.getHighlightLayerByName("scanner_highlight");

        if (!hl) {
            hl = new BABYLON.HighlightLayer("scanner_highlight", scene, {
                mainTextureRatio: 1,
                blurHorizontalSize: 3,
                blurVerticalSize: 3,
                alphaBlendingMode: BABYLON.Engine.ALPHA_ADD
            });
            hl.innerGlow = false;
            hl.outerGlow = true;
        }
        return hl;
    }
};