# L'Archipel des Insectes

**CAMILO–MARCHAL Marie - S6D1**

## A propos du projet

Ce projet que j’ai réalisé individuellement consiste en la réalisation d'un site web éducatif permettant l'exploration d'un environnement 3D interactif. L'objectif est de placer l'utilisateur dans le rôle d'un naturaliste explorant un archipel fictif pour y découvrir, observer et cataloguer différentes espèces d'insectes.

L'application met l'accent sur la découverte des écosystèmes (biomes) et fournit des informations détaillées sur la faune et la flore rencontrées.
**Le projet est hébergé et accessible à l'url suivante :** [https://marie-camilo.github.io/archipelgo-insects/](https://marie-camilo.github.io/archipelgo-insects/) (Hébergement Github Page)

## Comment lancer le projet ?

Le projet ne nécessite aucune installation de dépendance via npm mais requiert un serveur local pour charger correctement les textures et modèles 3D.

**Procédure à suivre :**

1. Décompresser l'archive zip du projet.
2. Lancer un serveur local à la racine du dossier `archipelago-insects/`.
* Avec VS Code : Extension "Live Server"
* Avec Python : `python -m http.server`


3. Ouvrir le navigateur à l'adresse locale indiquée (ex: `http://localhost:8000`).

**En cas de problème, vous pouvez consulter le projet hébergé à l'url suivante :** [https://marie-camilo.github.io/archipelgo-insects/](https://marie-camilo.github.io/archipelgo-insects/)

## Cartographie de l'Archipel

L'application propose 8 environnements (îles). Chaque environnement est caractérisé par un biome spécifique, une ambiance météorologique et une faune endémique.

### Liste des Îles et Espèces : Consultable dans le fichier JSON

1. **Vallée des Nectarivores** (Prairie tempérée méliphage) - *Abeille Mellifère, Grand Monarque...*
2. **Forêt des Coléoptères** (Forêt primaire) - *Lucane Cerf-Volant, Mante Religieuse...*
3. **Archipel des Cimes** (Forêt d'altitude) - *Coccinelle, Grande Sauterelle...*
4. **Toundra des Neiges** (Écotone boréal) - *Arpenteuse hivernale.*
5. **Sanctuaire des Recycleurs** (Humus) - *Cloporte, Fourmi Rousse.*
6. **Lagon des Odonates** (Zone humide) - *Anax Empereur, Criquet.*
7. **Pic des Hautes-Alpes** (Rocaille) - *Apollon des Montagnes.*
8. **Atoll Florissant** (Jardin botanique) - *Syrphe, Colibri.*

## Fonctionnalités et Interactions

L'expérience utilisateur s'articule autour d'une communication bidirectionnelle entre l'interface utilisateur et les scènes 3D.

### Navigation et Interactions

### Actions 3D vers 2D :
Survol d'éléments (Hover) :
* Le survol d'une île ou du port déclenche l'apparition d'une tooltip 2D qui suit la souris (projection des coordonnées 3D Vector3 vers des pixels 2D) affichant le nom et la progression de l'île.
* Le curseur change dynamiquement (pointer/default) selon le maillage survolé.

Sélection (Click) :
* Cliquer sur un insecte ouvre le Panneau Latéral Droit (HTML) et injecte dynamiquement les données JSON de l'insecte (Nom, description, rareté).
* Ciquer sur des éléments de décor interactifs (fleurs, rochers masqués) déclenche l'affichage d'une modale contenant une anecdote ou un fait scientifique.
* Cliquer sur le Bateau ouvre la Modale de Navigation (Overlay HTML).

Chargement de scène :
* À l'arrivée sur une île, la scène 3D envoie les données du biome au Panneau Latéral Gauche (HTML) pour mettre à jour le titre, la description de l'environnement et la barre de progression (ex: "0/4 découverts").

Condition de Victoire :
* La boucle de jeu vérifie en temps réel le nombre d'insectes trouvés. Si le total atteint 100%, la scène 3D déclenche l'ouverture de la Modale de Fin (Victory Screen).

### Actions 2D vers 3D :
Scanner de Recherche :
* Le clic sur le bouton HTML "Scanner" déclenche une fonction dans le moteur 3D qui parcourt tous les maillages d'insectes et leur applique une surbrillance (HighlightLayer) visible même à travers les obstacles.

Gestionnaire de Préférences :
* L'interrupteur HTML "Particules Météo" active ou coupe instantanément les *ParticleSystems* de la scène (pluie, neige, feuilles).
* L'interrupteur "Séquence de Navigation" modifie la logique de caméra (désactive l'interpolation d'animation du bateau pour un téléport immédiat).

Navigation Rapide :
* Le clic sur une carte dans le menu 2D force la caméra 3D à se déplacer vers des coordonnées spécifiques (zoom) avant de changer de scène.

Visualisation Journal :
* L'ouverture d'une fiche dans le journal 2D instancie un deuxième moteur 3D (miniature) dans une modale pour afficher le modèle de l'insecte hors contexte, permettant sa rotation à 360°.

Examen de précision : 
* Un clic sur le bouton déclenche l'instanciation d'une scène 3D qui permet un examen plus précis des spécimens. Un algorithme de normalisation de la boîte englobante est utilisé pour centrer et mettre à l'échelle automatiquement n'importe quel spécimen, quel que soit son volume initial.

Cycle Lumineux Dynamique :
* La sélection d'un mode (Jour, Crépuscule, Nuit) via un menu déroulant HTML modifie en temps réel les propriétés de la scène 3D : intensité et couleur des lumières (DirectionalLight), densité du brouillard et couleur du ciel (clearColor).

## Difficultés Rencontrées et Solutions
Le développement a présenté plusieurs difficultés surtout liés à l'utilisation de BabylonJS :

* **Raycasting et Hitbox des petits objets :**
  Les insectes étant petits et parfois cachés dans l'herbe, le clic précis via Raycast était difficile.
  **Solution :** Création de "Sphères de collision" invisibles (Hitboxes) plus grandes autour de chaque insecte et île. Le rayon détecte la sphère invisible mais le joueur a l'impression de cliquer sur l'objet.

* **Gestion de la Caméra Orbitale :**
  La caméra pouvait passer sous l'océan ou traverser les îles lors des rotations.
  **Solution :** Mise en place de contraintes strictes (`lowerRadiusLimit`, `upperBetaLimit`) sur l'ArcRotateCamera pour forcer l'utilisateur à rester dans une zone de navigation cohérente et restreinte.

* **Synchronisation UI / 3D :**
  Il a été difficile de garder le journal et la barre de progression à jour en temps réel sans recharger la page.
  **Solution :** Mise en place d'un objet global `JOURNAL_STATE` dont les données sont persistées dans le `localStorage` à chaque modification.

### Système Éducatif et Progression

* **Découverte :** L'utilisateur doit repérer et cliquer sur les insectes modélisés en 3D.
* **Carnet de Bord Scientifique :** Enregistrement automatique des espèces, fiches taxonomiques et visualisation 3D des spécimens collectés.
* **Fin de partie :** Une **modale de victoire** apparaît automatiquement lorsque l'utilisateur a découvert 100% des insectes de l'archipel. Il est alors possible de réinitialiser la progression pour lancer une nouvelle expédition.

### Accessibilité et UX

* **Paramètres :** Gestion des préférences (animation du bateau, particules météo, etc.).
* **Aide :** Tutoriels contextuels et guide global accessible via l'icône "?".

## Structure du Projet

```text
archipelago-insects/
├── index.html              
├── css/
│   └── main.css            # Feuilles de style
└── js/
    ├── app.js              # Contrôleur principal 
    ├── config.js           # Variables globales
    ├── game-settings.js    # Gestion des préférences utilisateur
    ├── data-islands.js     # Base de données JSON (Îles, Insectes, Dialogues)
    ├── journal.js          # Logique du carnet de bord et système de sauvegarde
    ├── ui-manager.js       # Gestion du DOM et des interfaces 2D
    ├── scene-map.js        # Scène de la carte globale avec tout l'Archipel
    ├── scene-boat.js       # Scène de transition bateau
    └── scene-island.js     # Scène d'exploration

```

## Aspects Techniques

Le projet est développé en **JavaScript** et s'appuie sur le moteur **BabylonJS 6.x**.

**Points techniques majeurs :**

* **Gestion des états :** Transitions fluides entre les scènes (Map -> Boat -> Island) avec nettoyage mémoire (*dispose*).
* **Raycasting :** Positionnement dynamique des insectes sur le maillage du terrain (*pickWithRay*) pour s'adapter à la topographie.
* **Systèmes de Particules :** Météo dynamique adaptée aux données JSON de l'île chargée.
* **Animation Procédurale :** Déformation des vertices de l'océan via fonctions sinusoïdales.
* **Persistance :** Sauvegarde locale (*localStorage*) de la progression et des préférences.

## Ressources et crédits

Les modèles 3D proviennent de **Poly Pizza** et **Sketchfab**. Ils ont été retravaillés sur Blender (optimisation, recentrage des pivots, couleurs) pour harmoniser le rendu global.

## Utilisation de l'IA et Traçabilité du Code

L'IA a été utilisée dans ce projet pour :

* La rédaction du contenu textuel scientifique
* La génération d'algorithmes mathématiques complexes (vecteurs, matrices de transformation, shaders)
* Le débogage de l'API BabylonJS

**Comment identifier le code généré ?**
Pour faciliter la lecture et l'évaluation, **les passages techniques générés quasi-intégralement par IA ont été regroupés au sein des mêmes fichiers** (principalement pour les fonctions utilitaires mathématiques complexes).

Vous pouvez retrouver ces sections facilement dans votre IDE :
- Ouvrez la recherche globale (Double Shift sur WebStorm ou `Ctrl+Shift+F` sur VS Code).
- Cherchez les mots-clés : **"Code généré par IA"**.

*L'architecture logicielle, la logique de gameplay, le design UI, le code JavaScript classique hors API BabylonJs et l'intégration des assets restent le fruit de mon travail personnel.*