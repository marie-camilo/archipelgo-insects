# 🏝️ L'Archipel des Insectes

Une expérience éducative interactive en 3D pour explorer les écosystèmes d'insectes.

## 🎯 Concept

L'Archipel des Insectes est une expérience web 3D éducative où l'utilisateur explore un archipel composé de plusieurs îles, chacune représentant un écosystème d'insectes différent. À bord d'un bateau virtuel, il voyage d'île en île, observe les espèces et complète un carnet de bord scientifique.

## ✨ Fonctionnalités

### 🗺️ **5 Îles à Explorer**

1. **Île des Pollinisateurs** - Prairies fleuries (Abeilles, Papillons, Bourdons)
2. **Île de la Forêt** - Forêt tempérée (Scarabées, Fourmis, Lucioles)
3. **Île des Décomposeurs** - Bois mort et sol (Bousiers, Vers de terre, Mille-pattes)
4. **Île Aquatique** - Zones humides (Libellules, Gerris, Éphémères)
5. **Île des Disparus** - Espèces menacées (Apollon, Grands Capricornes)

### 🐝 **20 Insectes à Découvrir**

Chaque insecte possède :
- Nom commun et scientifique
- Rôle écologique
- Habitat naturel
- Anecdote scientifique
- Statut de conservation

### 📖 **Carnet de Bord Scientifique**

- Collection progressive des insectes découverts
- Statistiques de progression
- Fiches détaillées consultables
- Système de déverrouillage par exploration

### 🚤 **Navigation Immersive**

- Vue aérienne de l'archipel (hub central)
- Transitions en bateau entre les îles
- Exploration libre de chaque île
- Caméra 3D interactive

## 🎮 Comment Jouer

1. **Page d'accueil** - Cliquez sur "Commencer l'exploration"
2. **Introduction** - Lisez la narration, puis "Accéder à la carte"
3. **Carte de l'archipel** - Cliquez sur une île pour la visiter
4. **Voyage en bateau** - Admirez le trajet (automatique, 3 secondes)
5. **Exploration** - Cliquez sur les sphères jaunes (insectes) pour les découvrir
6. **Panneau d'information** - Lisez les détails, ajoutez au carnet
7. **Carnet de bord** - Consultez votre collection via le bouton "📖 Carnet de Bord"
8. **Retour à la carte** - Explorez d'autres îles

## 🛠️ Technologies

- **Babylon.js 6.x** - Moteur 3D WebGL
- **HTML5 / CSS3** - Interface utilisateur
- **Vanilla JavaScript** - Logique applicative
- **Sphères simplifiées** - Placeholder pour les modèles 3D

## 📂 Structure du Projet

```
archipelago-insects/
├── index.html              # Page principale
├── css/
│   └── main.css           # Styles complets
└── js/
    ├── config.js          # Configuration
    ├── data-islands.js    # Données des îles et insectes
    ├── scene-map.js       # Scène de la carte
    ├── scene-boat.js      # Scène du bateau
    ├── scene-island.js    # Scène d'exploration
    ├── ui-manager.js      # Gestion de l'interface
    ├── journal.js         # Carnet de bord
    └── app.js             # Application principale
```

## 🚀 Installation

### Méthode 1 : Serveur Local Simple

```bash
# Python 3
cd archipelago-insects
python -m http.server 8000

# Node.js
npx http-server archipelago-insects -p 8000

# PHP
php -S localhost:8000
```

Puis ouvrez : `http://localhost:8000`

### Méthode 2 : Double-clic (Limité)

Ouvrez directement `index.html` dans votre navigateur (certaines fonctionnalités peuvent être limitées)

## 🎨 Version Simplifiée

Cette version utilise des **sphères colorées** pour représenter :
- 🟢 **Îles** - Grosses sphères vertes/bleues/marron selon l'écosystème
- 🟡 **Insectes** - Petites sphères jaunes flottantes

### Prochaines Étapes

Pour une version complète :
1. Remplacer les sphères par des modèles 3D réalistes (.glb)
2. Ajouter des textures et végétation sur les îles
3. Créer un vrai modèle de bateau animé
4. Ajouter des effets sonores et musique d'ambiance
5. Implémenter des animations d'insectes (vol, marche)

## 🎯 Objectifs Pédagogiques

- ✅ Comprendre le rôle écologique des insectes
- ✅ Découvrir différents écosystèmes
- ✅ Apprendre par l'exploration et l'observation
- ✅ Associer narration, interaction et données scientifiques

## ⌨️ Contrôles

### Sur la Carte
- **Clic gauche** - Sélectionner une île
- **Clic droit + Glisser** - Tourner la caméra
- **Molette** - Zoom

### Sur une Île
- **Clic gauche** - Sélectionner un insecte
- **Clic droit + Glisser** - Tourner la caméra
- **Molette** - Zoom

### Boutons UI
- **📖 Carnet de Bord** - Ouvrir le journal
- **← Retour à la carte** - Retourner à la vue d'ensemble

## 🐛 Notes Techniques

### Gestion des Scènes

Le projet utilise **3 scènes Babylon.js distinctes** :
1. `MapScene` - Vue aérienne de l'archipel
2. `BoatScene` - Animation de voyage
3. `IslandScene` - Exploration détaillée

Chaque scène est **disposée** quand on passe à une autre pour optimiser les performances.

### État du Jeu

```javascript
JOURNAL_STATE = {
  discoveredInsects: [],  // IDs des insectes trouvés
  exploredIslands: [],    // IDs des îles visitées
}
```

## 📊 Données

### Format d'une Île

```javascript
{
  id: "pollinators",
  name: "Île des Pollinisateurs",
  ecosystem: "Prairies fleuries",
  position: { x: -15, y: 0, z: 10 },
  color: "#ffeb3b",
  status: "unexplored",
  insects: [/* array of insects */]
}
```

### Format d'un Insecte

```javascript
{
  id: "bee",
  name: "Abeille Domestique",
  scientific: "Apis mellifera",
  position: { x: 2, y: 1, z: 2 },
  icon: "🐝",
  role: "Pollinisation des cultures",
  habitat: "Prairies, jardins",
  anecdote: "Visite 1000 fleurs par jour",
  status: "menacé"
}
```

## 🎨 Personnalisation

### Ajouter une Île

Dans `js/data-islands.js`, ajoutez un objet dans `ISLANDS_DATA` :

```javascript
{
  id: "desert",
  name: "Île Désertique",
  ecosystem: "Zone aride",
  position: { x: 20, y: 0, z: 20 },
  color: "#ffd54f",
  status: "unexplored",
  insects: [/* vos insectes */]
}
```

### Modifier les Couleurs

Dans `css/main.css` :

```css
:root {
  --ocean-deep: #0d47a1;
  --island-green: #7cb342;
  --ui-accent: #ffb74d;
}
```

### Ajuster les Caméras

Dans `js/config.js` :

```javascript
camera: {
  mapRadius: 50,      // Distance de la caméra sur la carte
  islandRadius: 15,   // Distance sur une île
}
```

## 🌊 Effets Visuels

- **Océan animé** - Mouvement sinusoïdal des vagues
- **Insectes flottants** - Animation verticale douce
- **Transitions fluides** - Fondu entre les écrans
- **Tooltips informatifs** - Au survol des îles

## 📱 Responsive

L'interface s'adapte automatiquement aux écrans :
- Desktop (>768px) - Panneaux latéraux larges
- Tablet (768px) - Panneaux réduits
- Mobile (<768px) - Panneaux plein écran

## 🔮 Améliorations Futures

- [ ] Modèles 3D réalistes d'insectes
- [ ] Végétation procédurale sur les îles
- [ ] Sons d'ambiance par écosystème
- [ ] Animations de vol pour les insectes
- [ ] Mini-jeux éducatifs
- [ ] Mode multijoueur
- [ ] Export du carnet en PDF
- [ ] Quiz de fin d'exploration

## 📄 Licence

Projet éducatif libre d'utilisation.

## 👥 Crédits

- **Concept** : Expérience éducative interactive
- **Technologies** : Babylon.js, HTML5, CSS3, JavaScript
- **Données scientifiques** : Sources entomologiques variées

---

**Bon voyage dans l'Archipel ! 🦋🏝️**
