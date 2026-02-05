# L'Archipel des Insectes 

**CAMILO–MARCHAL Marie - S6D1** 
**Date :** Février 2026

## Descriptif du projet

Ce projet que j’ai réalisé individuellement consiste en la réalisation d'un site web éducatif permettant l'exploration d'un environnement 3D interactif. L'objectif est de placer l'utilisateur dans le rôle d'un naturaliste explorant un archipel fictif pour y découvrir, observer et cataloguer différentes espèces d'insectes.

L'application met l'accent sur la découverte des écosystèmes (biomes) et fournit des informations détaillées sur la faune et la flore rencontrées.
**Le projet est hébergé et accessible à l'url suivante :** https://marie-camilo.github.io/archipelgo-insects/ (Hébergement Github Page) 

## Installation et Lancement

Le projet ne nécessite aucune installation de dépendance via npm, mais il requiert un serveur local pour charger correctement les textures et modèles 3D.

**Procédure :**
1. Décompresser l'archive zip du projet.
2. Lancer un serveur local à la racine du dossier `archipelago-insects/`.
   - Avec VS Code : Extension "Live Server"
   - Avec Python : `python -m http.server`
4. Ouvrir le navigateur à l'adresse locale indiquée (ex: `http://localhost:8000`).

## Cartographie de l'Archipel

L'application propose 8 environnements (îles) distincts. Chaque environnement est caractérisé par un biome spécifique, une ambiance météorologique et une faune endémique.

### Liste des Îles et Espèces

1. **Vallée des Nectarivores** (Prairie tempérée méliphage)
   - *Espèces :* Abeille Mellifère, Grand Monarque, Grand Mars Changeant, Colibri d'Elena.
   - *Ambiance :* Venteuse.

2. **Forêt des Coléoptères** (Forêt primaire à canopée dense)
   - *Espèces :* Lucane Cerf-Volant, Mante Religieuse, Épeire Diadème.
   - *Ambiance :* Pollen et particules organiques.

3. **Archipel des Cimes** (Forêt d'altitude subalpine)
   - *Espèces :* Coccinelle à sept points, Grande Sauterelle Verte, Guêpe Commune.
   - *Ambiance :* Vents d'altitude.

4. **Toundra des Neiges** (Écotone boréal arctique)
   - *Espèces :* Arpenteuse hivernale.
   - *Ambiance :* Neige.

5. **Sanctuaire des Recycleurs** (Humus et litière forestière)
   - *Espèces :* Cloporte Commun, Fourmi Rousse.
   - *Ambiance :* Neutre/Humide.

6. **Lagon des Odonates** (Zone humide lentique)
   - *Espèces :* Anax Empereur, Criquet des Roseaux.
   - *Ambiance :* Pluie.

7. **Pic des Hautes-Alpes** (Pelouses alpines rocailleuses)
   - *Espèces :* Apollon des Montagnes.
   - *Ambiance :* Pluie froide.

8. **Atoll Florissant** (Jardin botanique insulaire)
   - *Espèces :* Syrphe Ceinturé, Colibri Rubis.
   - *Ambiance :* Pollen dense.

## Fonctionnalités et Interactions

L'expérience utilisateur s'articule autour de plusieurs aspects interactifs :

### Navigation
- **Carte Globale 3D :** Vue orbitale de l'archipel permettant la sélection des destinations (îles)
- **Voyage en Bateau :** Séquence de transition entre la carte et l'île (désactivable dans les réglages pour un "voyage rapide")
Pour "voyager", l'utilisateur peut cliquer directement sur les îles, ou sur le port puis sélectionner l'île qu'il souhaite explorer. 
- **Exploration des îles :** Déplacement libre sur l'île via une caméra orbitale contrainte

### Système Éducatif
- **Découverte :** L'utilisateur doit repérer et cliquer sur les insectes modélisés en 3D sur chaque île. Pour chaque découverte
- **Points d'intérêt :** Éléments de décors interactifs (arbres, rochers, structures) fournissant des informations sur la flore et la géologie
- **Carnet de Bord Scientifique :**
  - Enregistrement automatique des espèces découvertes
  - Consultation des fiches taxonomiques (Ordre, Famille, Rôle écologique)
  - Visualisation 3D individuelle des spécimens collectés

### Accessibilité et UX
- **Paramètres :** Gestion des préférences (activation/désactivation de l'animation du bateau, des systèmes de particules et de la météo)
- **Aide :** Tutoriels contextuels et guide global (accessible via l'icone "?" en haut à droite de la page) 
- **Progression :** Indicateurs visuels de complétion pour chaque île 

## Structure du Projet

```text
archipelago-insects/
├── index.html              # Point d'entrée de l'application
├── css/
│   └── main.css            # Feuilles de style
└── js/
    ├── app.js              # Contrôleur principal (Machine à états)
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
Le projet est développé en **JavaScript** et s'appuie sur le moteur BabylonJS 6.x.

**Points techniques majeurs :** 
- Gestion des états : Gestion des transitions entre les scènes (Map -> Boat -> Island) avec nettoyage mémoire (dispose)
- Lancers de Rayons (Raycasting) : Positionnement dynamique des insectes sur le maillage du terrain (pickWithRay) pour s'adapter à la topographie variable des îles
- Systèmes de Particules : Création d'ambiances météorologiques dynamiques adaptées aux données JSON de l'île chargée
- Animation Procédurale : Déformation des vertices de l'océan grâce à des fonctions sinusoïdales pour simuler la houle
- Sauvegarde Locale : Utilisation de localStorage pour la persistance de la progression (insectes découverts, îles visitées et préférences)

## Ressources et crédits 
Les modèles 3D proviennent des banques libres **Poly Pizza** et **Sketchfab**. Ils ont été retravaillés sur Blender (optimisation du maillage, recentrage des pivots, mise à l'échelle, gestion des couleurs) pour harmoniser le rendu global. 


## Utilisation de l'IA
**Dans le cadre de ce projet éducatif, l'IA générative a été utilisée pour :**
- La rédaction du contenu textuel scientifique (descriptions et anecdotes)
- La génération des algorithmes mathématiques complexes (déformation des vagues, vecteurs de particules, fonctions sinusoïdales)
- Le débogage de l'API BabylonJS

L'architecture logicielle, la logique de gameplay, le style et l'intégration des assets sont le fruit du travail de mon travail.


