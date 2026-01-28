const ISLANDS_DATA = [
  {
    id: "pollinators",
    name: "Île des Pollinisateurs",
    modelFile: "warm-island.glb",
    scale: 0.2,
    ecosystem: "Prairies fleuries",
    position: { x: -20, y: 0, z: 5 },
    color: "#ffeb3b",
    status: "unexplored",
    insects: [
      { id: "bee", name: "Abeille Domestique", scientific: "Apis mellifera", position: { x: 2, y: 1, z: 2 }, icon: "🐝", role: "Pollinisation", habitat: "Ruches", anecdote: "Danse pour communiquer", status: "menacé" },
      { id: "butterfly", name: "Papillon Monarque", scientific: "Danaus plexippus", position: { x: -2, y: 1.5, z: 3 }, icon: "🦋", role: "Migrateur", habitat: "Fleurs", anecdote: "Voyage de 4000km", status: "menacé" }
    ],
  },
  {
    id: "forest_green",
    name: "Île de la Forêt",
    modelFile: "forest-island.glb",
    scale: 1.5,
    ecosystem: "Forêt tempérée",
    position: { x: 20, y: -5, z: -15 },
    color: "#4caf50",
    status: "unexplored",
    insects: [
      { id: "beetle", name: "Scarabée", scientific: "Coleoptera", position: { x: 1, y: 0.5, z: 1 }, icon: "🪲", role: "Nettoyeur", habitat: "Bois mort", anecdote: "Une armure solide", status: "commun" }
    ],
  },
  {
    id: "floating_forest",
    name: "Îles Flotantes",
    modelFile: "floating-island.glb",
    scale: 0.02,
    ecosystem: "Forêt glacée",
    position: { x: 15, y: 10, z: 40 },
    color: "#e8f1e8",
    status: "unexplored",
    insects: [
      { id: "beetle", name: "Scarabée", scientific: "Coleoptera", position: { x: 1, y: 0.5, z: 1 }, icon: "🪲", role: "Nettoyeur", habitat: "Bois mort", anecdote: "Une armure solide", status: "commun" }
    ],
  },
  {
    id: "winter",
    name: "Îles Ennéigées",
    modelFile: "winter-island.glb",
    scale: 1,
    ecosystem: "Forêt glacée",
    position: { x: 25, y: -3, z: 2 },
    color: "#e8f1e8",
    status: "unexplored",
    insects: [
      { id: "beetle", name: "Scarabée", scientific: "Coleoptera", position: { x: 1, y: 0.5, z: 1 }, icon: "🪲", role: "Nettoyeur", habitat: "Bois mort", anecdote: "Une armure solide", status: "commun" }
    ],
  },
  {
    id: "decomposers",
    name: "Île des Décomposeurs",
    modelFile: "small-island.glb",
    scale: 0.01,
    ecosystem: "Bois mort et sol",
    position: { x: 5, y: 0, z: -30 },
    color: "#8d6e63",
    status: "unexplored",
    insects: [
      { id: "worm", name: "Ver de Terre", scientific: "Lumbricina", position: { x: 0, y: 0.2, z: 0 }, icon: "🪱", role: "Laboureur", habitat: "Terre", anecdote: "Pas d'yeux", status: "commun" }
    ],
  },
  {
    id: "aquatic",
    name: "Île Aquatique",
    modelFile: "phare-island.glb",
    scale: 0.5,
    ecosystem: "Zones humides",
    position: { x: -15, y: 0, z: -25 },
    color: "#29b6f6",
    status: "unexplored",
    insects: [
      { id: "dragonfly", name: "Libellule", scientific: "Odonata", position: { x: 0, y: 2, z: 0 }, icon: "🦟", role: "Prédateur", habitat: "Mares", anecdote: "Vole en arrière", status: "commun" }
    ],
  },
  {
    id: "extinct",
    name: "Île des Montagnes",
    modelFile: "mountain-island.glb",
    scale: 0.7,
    ecosystem: "Haute altitude",
    position: { x: 10, y: 0, z: 5 },
    color: "#78909c",
    status: "unexplored",
    insects: [
      { id: "apollo", name: "Apollon", scientific: "Parnassius apollo", position: { x: 0, y: 1, z: 1 }, icon: "🦋", role: "Pollinisateur", habitat: "Montagne", anecdote: "Survivant du froid", status: "menacé" }
    ],
  },
  {
    id: "flower",
    name: "Île Fleurie",
    modelFile: "flower-island.glb",
    scale: 4.5,
    ecosystem: "Haute altitude",
    position: { x: 0, y: 0, z: 25 },
    color: "#bd546f",
    status: "unexplored",
    insects: [
      { id: "apollo", name: "Apollon", scientific: "Parnassius apollo", position: { x: 0, y: 1, z: 1 }, icon: "🦋", role: "Pollinisateur", habitat: "Montagne", anecdote: "Survivant du froid", status: "menacé" }
    ],
  },
];

const JOURNAL_STATE = {
  discoveredInsects: [],
  exploredIslands: [],
};