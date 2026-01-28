const ISLANDS_DATA = [
    {
        id: "pollinators",
        name: "Vallée des Nectarivores",
        modelFile: "warm-island.glb",
        scale: 0.2,
        ecosystem: "Prairie tempérée méliphage",
        environmentDesc: "Une zone ouverte caractérisée par une diversité florale élevée. Ce milieu est essentiel pour le cycle de vie des angiospermes et subit de fortes pressions dues à l'agriculture intensive.",
        position: { x: -20, y: 0, z: 5 },
        color: "#ffeb3b",
        status: "unexplored",
        insects: [
            {
                id: "bee",
                name: "Abeille Mellifère",
                scientific: "Apis mellifera",
                taxonomy: "Ordre : Hymenoptera | Famille : Apidae",
                position: { x: 2, y: 1, z: 2 },
                icon: "🐝",
                role: "Agent de pollinisation biotique",
                habitat: "Ruches sociales et cavités naturelles",
                anecdote: "Leur système de communication par 'danse frétillante' permet de transmettre la position exacte d'une source de nectar par rapport au soleil.",
                status: "Espèce sentinelle - Vulnérable"
            },
            {
                id: "butterfly",
                name: "Grand Monarque",
                scientific: "Danaus plexippus",
                taxonomy: "Ordre : Lepidoptera | Famille : Nymphalidae",
                position: { x: -2, y: 1.5, z: 3 },
                icon: "🦋",
                role: "Bio-indicateur de connectivité écologique",
                habitat: "Champs d'asclépiades et zones de migration",
                anecdote: "Ce lépidoptère parcourt jusqu'à 4 000 km lors de sa migration annuelle. Ses chenilles accumulent des toxines pour devenir immangeables.",
                status: "En danger (Liste rouge UICN)"
            }
        ],
    },
    {
        id: "forest_green",
        name: "Forêt des Coléoptères",
        modelFile: "forest-island.glb",
        scale: 1.5,
        ecosystem: "Forêt primaire à canopée dense",
        environmentDesc: "Un écosystème complexe dominé par les feuillus séculaires. L'humidité y est constante, favorisant la dégradation du bois mort, pilier de la biodiversité entomologique.",
        position: { x: 20, y: -5, z: -15 },
        modelOffset: -60,
        waterLevel: 0,
        color: "#4caf50",
        status: "unexplored",
        insects: [
            {
                id: "beetle_stag",
                name: "Lucane Cerf-Volant",
                scientific: "Lucanus cervus",
                taxonomy: "Ordre : Coleoptera | Famille : Lucanidae",
                position: { x: 1, y: 0.5, z: 1 },
                icon: "🪲",
                role: "Ingénieur forestier saproxylophage",
                habitat: "Vieux chênes et souches en décomposition",
                anecdote: "Ses mandibules évoquant des bois de cerf ne servent qu'aux joutes entre mâles. Les larves vivent 5 ans dans le bois mort.",
                status: "Protégé (Directive Habitats)"
            }
        ],
    },
    {
        id: "floating_forest",
        name: "Archipel des Cimes",
        modelFile: "floating-island.glb",
        scale: 0.02,
        ecosystem: "Forêt d'altitude subalpine",
        environmentDesc: "Milieu caractérisé par une raréfaction de l'oxygène et des vents violents. La végétation est naine et les insectes y ont développé des stratégies de résistance thermique.",
        position: { x: 15, y: 10, z: 40 },
        modelOffset: 80,
        waterLevel: 0,
        color: "#e8f1e8",
        status: "unexplored",
        insects: [
            {
                id: "ladybug",
                name: "Coccinelle à sept points",
                scientific: "Coccinella septempunctata",
                taxonomy: "Ordre : Coleoptera | Famille : Coccinellidae",
                position: { x: 1, y: 0.5, z: 1 },
                icon: "🐞",
                role: "Auxiliaire de lutte biologique",
                habitat: "Végétation herbacée",
                anecdote: "Elle peut consommer 50 pucerons par jour. Sa couleur rouge vive (aposématisme) avertit les prédateurs de sa toxicité.",
                status: "Préoccupation mineure"
            }
        ],
    },
    {
        id: "winter",
        name: "Toundra des Neiges",
        modelFile: "winter-island.glb",
        scale: 1,
        ecosystem: "Écotone boréal arctique",
        environmentDesc: "Un désert froid où le sol reste gelé en profondeur (permafrost). La faune entomologique y est restreinte à quelques espèces possédant des molécules antigel.",
        position: { x: 25, y: -3, z: 2 },
        modelOffset: -40,
        waterLevel: 0,
        color: "#e8f1e8",
        status: "unexplored",
        insects: [
            {
                id: "winter_moth",
                name: "Arpenteuse hivernale",
                scientific: "Operophtera brumata",
                taxonomy: "Ordre : Lepidoptera | Famille : Geometridae",
                position: { x: 1, y: 0.5, z: 1 },
                icon: "❄️",
                role: "Maillon trophique boréal",
                habitat: "Forêts de feuillus résistantes",
                anecdote: "Capable de rester active par des températures négatives grâce à des protéines antigel dans son hémolymphe.",
                status: "Sous surveillance climatique"
            }
        ],
    },
    {
        id: "decomposers",
        name: "Sanctuaire des Recycleurs",
        modelFile: "small-island.glb",
        scale: 0.01,
        ecosystem: "Humus et litière forestière",
        environmentDesc: "Le laboratoire de recyclage de la nature. Ici, les détritivores transforment la matière organique morte en nutriments minéraux assimilables par les plantes.",
        position: { x: 5, y: 0, z: -30 },
        color: "#8d6e63",
        status: "unexplored",
        insects: [
            {
                id: "woodlouse",
                name: "Cloporte Commun",
                scientific: "Armadillidium vulgare",
                taxonomy: "Ordre : Isopoda | Famille : Armadillidiidae",
                position: { x: 0, y: 0.2, z: 0 },
                icon: "🍂",
                role: "Décomposeur de cellulose",
                habitat: "Sous les pierres et bois humide",
                anecdote: "C'est un crustacé terrestre ! Il possède des branchies et doit rester en milieu humide pour respirer.",
                status: "Indispensable au cycle du carbone"
            }
        ],
    },
    {
        id: "aquatic",
        name: "Lagon des Odonates",
        modelFile: "phare-island.glb",
        scale: 0.5,
        ecosystem: "Zone humide lentique",
        environmentDesc: "Milieu aquatique à renouvellement lent. Les zones humides filtrent l'eau et abritent des espèces au cycle de vie double (larve aquatique / adulte aérien).",
        position: { x: -15, y: 0, z: -25 },
        color: "#29b6f6",
        status: "unexplored",
        insects: [
            {
                id: "dragonfly",
                name: "Anax Empereur",
                scientific: "Anax imperator",
                taxonomy: "Ordre : Odonata | Famille : Aeshnidae",
                position: { x: 0, y: 2, z: 0 },
                icon: "🦟",
                role: "Super-prédateur aérien",
                habitat: "Eaux stagnantes végétalisées",
                anecdote: "Possède une vision à 360° et peut chasser en vol stationnaire ou en marche arrière.",
                status: "Bio-indicateur de qualité d'eau"
            }
        ],
    },
    {
        id: "extinct",
        name: "Pic des Hautes-Alpes",
        modelFile: "mountain-island.glb",
        scale: 0.7,
        ecosystem: "Pelouses alpines rocailleuses",
        environmentDesc: "Prairies d'altitude au-dessus de la limite des arbres. Les cycles de reproduction y sont très courts à cause de la brièveté de la saison estivale.",
        position: { x: 10, y: 0, z: 5 },
        color: "#78909c",
        status: "unexplored",
        insects: [
            {
                id: "apollo",
                name: "Apollon des Montagnes",
                scientific: "Parnassius apollo",
                taxonomy: "Ordre : Lepidoptera | Famille : Papilionidae",
                position: { x: 0, y: 1, z: 1 },
                icon: "🦋",
                role: "Relique glaciaire",
                habitat: "Versants ensoleillés riches en sédums",
                anecdote: "Ses ailes parsemées d'ocelles rouges effrayent les oiseaux. C'est l'un des premiers insectes protégés au monde.",
                status: "Rare - Strictement protégé"
            }
        ],
    },
    {
        id: "flower",
        name: "Atoll Florissant",
        modelFile: "flower-island.glb",
        scale: 4.5,
        ecosystem: "Jardin botanique insulaire",
        environmentDesc: "Micro-climat favorisant une floraison continue. Ce milieu sert de refuge aux insectes généralistes dans un paysage souvent fragmenté.",
        position: { x: 0, y: 0, z: 25 },
        modelOffset: -8,
        waterLevel: 0,
        color: "#bd546f",
        status: "unexplored",
        insects: [
            {
                id: "hoverfly",
                name: "Syrphe Ceinturé",
                scientific: "Episyrphus balteatus",
                taxonomy: "Ordre : Diptera | Famille : Syrphidae",
                position: { x: 0, y: 1, z: 1 },
                icon: "🐝",
                role: "Mime batesien et pollinisateur",
                habitat: "Zones fleuries diversifiées",
                anecdote: "Mime une guêpe pour effrayer les prédateurs mais n'a pas de dard. Ses larves dévorent les pucerons.",
                status: "Auxiliaire précieux"
            }
        ],
    },
];

const SCIENTIFIC_QUOTES = [
    "Saviez-vous ? Les libellules existent depuis plus de 300 millions d'années.",
    "L'abeille est le seul insecte au monde qui produit de la nourriture consommée par l'homme.",
    "Un scarabée peut porter jusqu'à 850 fois son propre poids !",
    "La métamorphose transforme totalement l'anatomie d'un insecte.",
    "Certains papillons parcourent des milliers de kilomètres pour migrer."
];

const JOURNAL_STATE = {
    discoveredInsects: [],
    exploredIslands: [],
};