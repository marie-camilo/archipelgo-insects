const ISLANDS_DATA = [
    {
        id: "pollinators",
        name: "Vallée des Nectarivores",
        ambiance: "wind",
        modelFile: "warm-island.glb",
        scale: 0.2,
        boatConfig: {
            position: { x: 10, z: 180 },
            rotationY: Math.PI / 3,
            boatScale: 30,
        },
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
                modelFile: "bee.glb",
                modelScale: 0.9,
                taxonomy: "Ordre : Hymenoptera | Famille : Apidae",
                position: { x: 2, y: 1, z: 2 },
                altitude: 10,
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
                modelFile: "monarque.glb",
                modelScale: 0.08,
                taxonomy: "Ordre : Lepidoptera | Famille : Nymphalidae",
                position: { x: 32.14, y: 13.03, z: -8.28 },
                altitude: 35,
                icon: "🦋",
                role: "Bio-indicateur de connectivité écologique",
                habitat: "Champs d'asclépiades et zones de migration",
                anecdote: "Ce lépidoptère parcourt jusqu'à 4 000 km lors de sa migration annuelle. Ses chenilles accumulent des toxines pour devenir immangeables.",
                status: "En danger (Liste rouge UICN)"
            },
            {
                id: "purple_butterfly",
                name: "Grand Mars Changeant",
                scientific: "Apatura iris",
                modelFile: "purple_butterfly.glb",
                modelScale: 9,
                taxonomy: "Ordre : Lepidoptera | Famille : Nymphalidae",
                position: { x: 16.54, y: 15.72, z: -0.05 },
                altitude: 30,
                icon: "🦋",
                role: "Indicateur de canopée saine",
                habitat: "Lisières de forêts et saules",
                anecdote: "Ses ailes ont des reflets violets spectaculaires (iridescence) qui ne sont visibles que sous un certain angle pour attirer les femelles.",
                status: "Préoccupation mineure"
            },
            {
                id: "colibri_1",
                name: "Colibri d'Elena",
                scientific: "Mellisuga helenae",
                modelFile: "colibri.glb",
                modelScale: 0.1,
                taxonomy: "Ordre : Apodiformes | Famille : Trochilidae",
                position: { x: 31.74, y: 28.80, z: -22.09 },
                altitude: 10,
                icon: "🐦",
                role: "Pollinisateur vertébré",
                habitat: "Zones riches en fleurs tubulaires",
                anecdote: "Bien que ce ne soit pas un insecte, c'est le plus petit oiseau au monde. Il bat des ailes 80 fois par seconde !",
                status: "Quasi menacé"
            }
        ],
        interactiveElements: [
            {
                id: "palm_tree",
                position: { x: 55.55, y: 0, z: 8.74 },
                radius: 3,
                uiOffset: 0,
                title: "Parasol naturel",
                icon: "🌴",
                text: "Enfin un peu d'ombre dans cette prairie écrasée de soleil ! Attention aux chutes de noix de coco. Ces arbres offrent peu de nectar, mais servent de repère visuel lointain pour les insectes volants."
            }
        ],
    },
    {
        id: "forest_green",
        name: "Forêt des Coléoptères",
        ambiance: "pollen",
        modelFile: "forest-island.glb",
        scale: 1.5,
        boatConfig: {
            position: { x: -30, z: 150 },
            rotationY: -Math.PI / -3,
            boatScale: 30
        },
        ecosystem: "Forêt primaire à canopée dense",
        environmentDesc: "Un écosystème complexe dominé par les feuillus séculaires. L'humidité y est constante, favorisant la dégradation du bois mort, pilier de la biodiversité entomologique.",
        position: { x: 20, y: -4.4, z: -15 },
        modelOffset: -60,
        waterLevel: 0,
        color: "#4caf50",
        status: "unexplored",
        insects: [
            {
                id: "beetle_stag",
                name: "Lucane Cerf-Volant",
                scientific: "Lucanus cervus",
                modelFile: "beetle.glb",
                modelScale: 0.1,
                taxonomy: "Ordre : Coleoptera | Famille : Lucanidae",
                position: { x: -1.26, y: 0.85, z: 2.56 },
                icon: "🪲",
                role: "Ingénieur forestier saproxylophage",
                habitat: "Vieux chênes et souches en décomposition",
                anecdote: "Ses mandibules évoquant des bois de cerf ne servent qu'aux joutes entre mâles. Les larves vivent 5 ans dans le bois mort.",
                status: "Protégé (Directive Habitats)"
            },
            {
                id: "mantis",
                name: "Mante Religieuse",
                scientific: "Mantis religiosa",
                modelFile: "mantis.glb",
                modelScale: 10,
                taxonomy: "Ordre : Mantodea | Famille : Mantidae",
                position: { x: -0.10, y: 1.25, z: 3.04 },
                altitude: 3,
                icon: "🦗",
                role: "Régulateur de populations d'insectes",
                habitat: "Hautes herbes et arbustes ensoleillés",
                anecdote: "Ses pattes avant sont des armes redoutables qui se déplient en un éclair pour capturer ses proies. Elle peut tourner la tête à 180°.",
                status: "Préoccupation mineure"
            },
            {
                id: "spider",
                name: "Épeire Diadème",
                scientific: "Araneus diadematus",
                modelFile: "spider.glb",
                modelScale: 0.01,
                taxonomy: "Ordre : Araneae | Famille : Araneidae",
                position: { x: -1.44, y: 0.84, z: 3.83 },
                icon: "🕷️",
                role: "Prédateur généraliste",
                habitat: "Jardins et sous-bois",
                anecdote: "Elle recycle sa toile chaque nuit en la mangeant pour récupérer les protéines avant d'en tisser une nouvelle au matin.",
                status: "Commune"
            }
        ],
        interactiveElements: [
            {
                id: "deer_zone",
                position: { x: -63.49, y: 0, z: 50.27 },
                uiOffset: 0,
                radius: 4,
                title: "Pas vu, pas pris !",
                icon: "🦌",
                text: "Hé ! Bas les pattes ! \n\nJe sais ce que vous pensez : \"Il est bien gros pour un coléoptère celui-là\". \n\nEn effet, je suis un Cerf Élaphe. Je ne suis pas un insecte, mais sans moi, cette forêt serait une jungle impénétrable. En broutant, j'ouvre des clairières qui permettent au soleil de passer... et à vos amis les insectes de se dorer la pilule !",
            }
        ]
    },
    {
        id: "floating_forest",
        name: "Archipel des Cimes",
        ambiance: "wind",
        modelFile: "floating-island.glb",
        scale: 2,
        boatConfig: {
            position: { x: 40, z: -40 },
            rotationY: Math.PI,
            boatScale: 38,
        },
        ecosystem: "Forêt d'altitude subalpine",
        environmentDesc: "Milieu caractérisé par une raréfaction de l'oxygène et des vents violents. La végétation est naine et les insectes y ont développé des stratégies de résistance thermique.",
        position: { x: -40, y: -15, z: 40 },
        hitboxOffset: 0,
        hitboxScale: 3,
        modelOffset: 0,
        waterLevel: 215,
        color: "#e8f1e8",
        status: "unexplored",
        insects: [
            {
                id: "ladybug",
                name: "Coccinelle à sept points",
                scientific: "Coccinella septempunctata",
                modelFile: "coccinelle.glb",
                modelScale: 5,
                taxonomy: "Ordre : Coleoptera | Famille : Coccinellidae",
                position: { x: -6.40, y: 11.91, z: -2.52 },
                icon: "🐞",
                role: "Auxiliaire de lutte biologique",
                habitat: "Végétation herbacée",
                anecdote: "Elle peut consommer 50 pucerons par jour. Sa couleur rouge vive (aposématisme) avertit les prédateurs de sa toxicité.",
                status: "Préoccupation mineure"
            },
            {
                id: "grasshopper_1",
                name: "Grande Sauterelle Verte",
                scientific: "Tettigonia viridissima",
                modelFile: "grasshopper.glb",
                modelScale: 1.5,
                taxonomy: "Ordre : Orthoptera | Famille : Tettigoniidae",
                position: { x: 4.95, y: 8.15, z: -6.94 },
                icon: "🦗",
                role: "Omnivore opportuniste",
                habitat: "Strates herbacées et arbustives",
                anecdote: "Ses antennes sont plus longues que son corps. Elle chante en frottant ses élytres (stridulation) pour attirer les femelles.",
                status: "Préoccupation mineure"
            },
            {
                id: "wasp",
                name: "Guêpe Commune",
                scientific: "Vespula vulgaris",
                modelFile: "wasp.glb",
                modelScale: 0.1,
                taxonomy: "Ordre : Hymenoptera | Famille : Vespidae",
                position: { x: 4.92, y: 8.15, z: -5.60 },
                altitude: 15,
                icon: "🐝",
                role: "Régulateur et nettoyeur",
                habitat: "Nids en papier mâché (cellulose)",
                anecdote: "Contrairement à l'abeille, elle ne meurt pas après avoir piqué car son dard est lisse. C'est une architecte hors pair.",
                status: "Non menacée"
            }
        ],
    },
    {
        id: "winter",
        name: "Toundra des Neiges",
        ambiance: "snow",
        modelFile: "winter-island.glb",
        scale: 1,
        boatConfig: {
            position: { x: 60, z: 130 },
            rotationY: Math.PI / 2,
            boatScale: 25
        },
        ecosystem: "Écotone boréal arctique",
        environmentDesc: "Un désert froid où le sol reste gelé en profondeur (permafrost). La faune entomologique y est restreinte à quelques espèces possédant des molécules antigel.",
        position: { x: 25, y: -4, z: 2 },
        modelOffset: -40,
        waterLevel: 0,
        color: "#e8f1e8",
        status: "unexplored",
        insects: [
            {
                id: "winter_moth",
                name: "Arpenteuse hivernale",
                scientific: "Operophtera brumata",
                modelFile: "lil-moth.glb",
                modelScale: 1.5,
                taxonomy: "Ordre : Lepidoptera | Famille : Geometridae",
                position: { x: 0.45, y: 150, z: -2.62 },
                altitude: 10,
                icon: "❄️",
                role: "Maillon trophique boréal",
                habitat: "Forêts de feuillus résistantes",
                anecdote: "Capable de rester active par des températures négatives grâce à des protéines antigel dans son hémolymphe.",
                status: "Sous surveillance climatique"
            }
        ],
        interactiveElements: [
            {
                id: "igloo",
                position: { x: -2.01, y: 0, z: -1.54 },
                radius: 5,
                uiOffset: 0,
                title: "Studio à louer",
                icon: "🥶",
                text: "Vue imprenable sur le néant blanc. Chauffage non inclus. Idéal pour ours polaire, mais catastrophe pour la plupart des insectes qui finiraient en glaçon instantané ! Heureusement, certains ont de l'antigel naturel dans le sang."
            },
            {
                id: "winter_tree",
                position: { x: 1.38, y: 0, z: -0.42 },
                radius: 4,
                uiOffset: 0,
                title: "Manteau blanc",
                icon: "🌲",
                text: "Ces conifères gardent leurs aiguilles pour faire de la photosynthèse dès le moindre rayon de soleil. C'est aussi un refuge : sous les branches basses, la température est plus clémente que dehors."
            },
            {
                id: "frozen_pond",
                position: { x: 2.42, y: 0, z: -3.40 },
                radius: 5,
                uiOffset: 0,
                title: "Patinoire interdite",
                icon: "❄️",
                text: "En surface, c'est du béton. Mais dessous, la vie continue au ralenti. De nombreuses larves aquatiques hibernent dans la vase en attendant le dégel printanier."
            }
        ],
    },
    {
        id: "decomposers",
        name: "Sanctuaire des Recycleurs",
        modelFile: "small-island.glb",
        scale: 0.01,
        boatConfig: {
            position: { x: 80, z: 130 },
            rotationY: Math.PI / -2,
            boatScale: 35
        },
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
                modelFile: "cloporte.glb",
                modelScale: 0.2,
                taxonomy: "Ordre : Isopoda | Famille : Armadillidiidae",
                position: { x: 84.68, y: 364.74, z: -326.14 },
                icon: "🍂",
                role: "Décomposeur de cellulose",
                habitat: "Sous les pierres et bois humide",
                anecdote: "C'est un crustacé terrestre ! Il possède des branchies et doit rester en milieu humide pour respirer.",
                status: "Indispensable au cycle du carbone"
            },
            {
                id: "ant",
                name: "Fourmi Rousse",
                scientific: "Formica rufa",
                modelFile: "ant.glb",
                modelScale: 0.15,
                taxonomy: "Ordre : Hymenoptera | Famille : Formicidae",
                position: { x: -357.73, y: 366.32, z: 82.78 },
                icon: "🐜",
                role: "Ingénieur des écosystèmes",
                habitat: "Dômes d'aiguilles de pin",
                anecdote: "Elle projette de l'acide formique pour se défendre. Une colonie peut consommer des millions d'insectes par an.",
                status: "Protégée dans certains pays"
            }
        ],
        interactiveElements: [
            {
                id: "dead_tree",
                position: { x: -251.90, y: 0, z: 187.79 },
                radius: 3,
                uiOffset: 0,
                title: "Hôtel 5 étoiles",
                icon: "🪵",
                text: "Ne jugez pas ce vieux tronc ! Pour un coléoptère, c'est un palace. Le bois mort abrite près de 20% de la biodiversité forestière. C'est ici que le grand recyclage commence."
            },
            {
                id: "stream_rocks",
                position: { x: -187.24, y: 0, z: -230.83 },
                radius: 4,
                uiOffset: 0,
                title: "L'oasis de fraîcheur",
                icon: "💧",
                text: "Les cloportes et mille-pattes adorent ce coin sombre et humide. L'humidité est vitale pour eux car ils respirent par des branchies, exactement comme leurs cousins les crabes !"
            }
        ],
    },
    {
        id: "aquatic",
        name: "Lagon des Odonates",
        ambiance: "rain",
        modelFile: "phare-island.glb",
        scale: 0.5,
        boatConfig: {
            position: { x: -40, z: -220 },
            rotationY: 30,
            boatScale: 35,
        },
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
                modelFile: "dragonfly.glb",
                modelScale: 1.1,
                taxonomy: "Ordre : Odonata | Famille : Aeshnidae",
                position: { x: 0, y: 2, z: 0 },
                altitude: 30,
                icon: "🦟",
                role: "Super-prédateur aérien",
                habitat: "Eaux stagnantes végétalisées",
                anecdote: "Possède une vision à 360° et peut chasser en vol stationnaire ou en marche arrière.",
                status: "Bio-indicateur de qualité d'eau"
            },
            {
                id: "grasshopper_2",
                name: "Criquet des Roseaux",
                scientific: "Mecostethus parapleurus",
                modelFile: "grasshopper.glb",
                modelScale: 1.5,
                taxonomy: "Ordre : Orthoptera | Famille : Acrididae",
                position: { x: 20.10, y: 0, z: -7.15 },
                icon: "🦗",
                role: "Herbivore des zones humides",
                habitat: "Prairies inondables et roselières",
                anecdote: "Contrairement à la sauterelle, le criquet a des antennes courtes. Il aime l'humidité des bords de l'eau.",
                status: "Vulnérable"
            }
        ],
        interactiveElements: [
            {
                id: "lighthouse",
                position: { x: 11.48, y: 0, z: -4.20 },
                radius: 6,
                uiOffset: 0,
                title: "Le Géant de Lumière",
                icon: "💡",
                text: "Joli pour nous, mais terrible pour les papillons de nuit ! La lumière artificielle perturbe leur navigation. Heureusement, ici, il guide surtout les bateaux des explorateurs scientifiques."
            },
            {
                id: "stagnant_water",
                position: { x: 3.53, y: 0, z: -13.43 },
                radius: 5,
                uiOffset: 0,
                title: "Nurserie géante",
                icon: "🐸",
                text: "L'eau ne bouge pas ? Parfait ! C'est le berceau des libellules. Leurs larves sont de redoutables prédatrices sous-marines avant de sortir pour leur métamorphose."
            },
            {
                id: "small_forest",
                position: { x: -0.22, y: 0, z: -5.61 },
                radius: 5,
                uiOffset: 0,
                title: "Zone de repos",
                icon: "🌳",
                text: "Après une chasse effrénée au-dessus de l'eau, les libellules viennent se percher ici. C'est l'endroit idéal pour se chauffer les ailes au soleil ou digérer un moustique à l'abri du vent."
            }
        ],
    },
    {
        id: "extinct",
        name: "Pic des Hautes-Alpes",
        ambiance: "rain",
        modelFile: "mountain-island.glb",
        scale: 0.7,
        boatConfig: {
            position: { x: 50, z: 150 },
            rotationY: Math.PI / 2,
            boatScale: 25,
        },
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
                modelFile: "apollon.glb",
                modelScale: 0.5,
                taxonomy: "Ordre : Lepidoptera | Famille : Papilionidae",
                position: { x: 0, y: 1, z: 1 },
                icon: "🦋",
                role: "Relique glaciaire",
                habitat: "Versants ensoleillés riches en sédums",
                anecdote: "Ses ailes parsemées d'ocelles rouges effrayent les oiseaux. C'est l'un des premiers insectes protégés au monde.",
                status: "Rare - Strictement protégé"
            }
        ],
        interactiveElements: [
            {
                id: "snowy_mountain",
                position: { x: -0.05, y: 0, z: 6.37 },
                radius: 8,
                uiOffset: 0,
                title: "Le Toit du Monde",
                icon: "🏔️",
                text: "Là-haut, l'oxygène se fait rare et le vent souffle fort. Seuls les spécialistes comme le papillon Apollon osent s'aventurer si près des neiges éternelles."
            },
            {
                id: "alpine_tree",
                position: { x: -5.06, y: 0, z: -5.68 },
                radius: 3,
                uiOffset: 0,
                title: "Les Résistants",
                icon: "🌲",
                text: "Remarquez leur forme : ils sont plus petits et robustes pour résister au poids de la neige l'hiver. C'est la limite supérieure de la forêt, au-delà, c'est le domaine minéral des rochers."
            }
        ],
    },
    {
        id: "flower",
        name: "Atoll Florissant",
        ambiance: "pollen",
        modelFile: "flower-island.glb",
        scale: 4.5,
        boatConfig: {
            position: { x: -120, z: 230 },
            rotationY: -Math.PI / -2,
            boatScale: 35,
        },
        ecosystem: "Jardin botanique insulaire",
        environmentDesc: "Micro-climat favorisant une floraison continue. Ce milieu sert de refuge aux insectes généralistes dans un paysage souvent fragmenté.",
        position: { x: 0, y: -1.8, z: 25 },
        modelOffset: -8,
        waterLevel: 0,
        color: "#bd546f",
        status: "unexplored",
        insects: [
            {
                id: "hoverfly",
                name: "Syrphe Ceinturé",
                scientific: "Episyrphus balteatus",
                modelFile: "syrphe.glb",
                modelScale: 0.3,
                taxonomy: "Ordre : Diptera | Famille : Syrphidae",
                position: { x: 1.05, y: 0.47, z: -0.79 },
                altitude: 10,
                icon: "🐝",
                role: "Mime batesien et pollinisateur",
                habitat: "Zones fleuries diversifiées",
                anecdote: "Mime une guêpe pour effrayer les prédateurs mais n'a pas de dard. Ses larves dévorent les pucerons.",
                status: "Auxiliaire précieux"
            },
            {
                id: "colibri_2",
                name: "Colibri Rubis",
                scientific: "Archilochus colubris",
                modelFile: "colibri2.glb",
                modelScale: 12,
                taxonomy: "Ordre : Apodiformes | Famille : Trochilidae",
                position: { x: -1.35, y: 0, z: -0.24 },
                altitude: 2,
                icon: "🐦",
                role: "Pollinisateur spécialisé",
                habitat: "Jardins et lisières",
                anecdote: "Il est capable de se souvenir de chaque fleur visitée pour ne pas y retourner tant que le nectar ne s'est pas renouvelé.",
                status: "Préoccupation mineure"
            }
        ],
        interactiveElements: [
            {
                id: "pink_flowers",
                position: { x: 1.03, y: 0, z: 1.19 },
                radius: 4,
                uiOffset: 0,
                title: "Buffet à volonté",
                icon: "🌸",
                text: "Ces fleurs ne sont pas roses juste pour faire joli sur vos photos ! C'est un signal lumineux qui crie 'Nectar gratuit ici !'. Un vrai parking pour syrphes et abeilles pressées."
            },
            {
                id: "cherry_trees",
                position: { x: -0.26, y: 0, z: 0.79 },
                radius: 6,
                uiOffset: 0,
                title: "La vie en rose",
                icon: "🌸",
                text: "Ces cerisiers sont les gratte-ciels de l'atoll. Leurs fleurs attirent les insectes par milliers, mais attention : la floraison est courte ! C'est une course contre la montre pour les pollinisateurs."
            },
            {
                id: "flower_mini_forest",
                position: { x: -0.25, y: 0, z: -0.58 },
                radius: 5,
                uiOffset: 0,
                title: "Le labyrinthe vert",
                icon: "🌳",
                text: "Sous ces feuillages denses, l'humidité reste prisonnière. C'est l'endroit parfait pour une petite sieste à l'abri des prédateurs, ou pour pondre ses œufs en toute discrétion."
            },
            {
                id: "flower_bushes",
                position: { x: -1.39, y: 0, z: -1.52 },
                radius: 4,
                uiOffset: 0,
                title: "Cache-cache buisson",
                icon: "🌿",
                text: "Ces buissons sont les forteresses de l'atoll. Leurs branches emmêlées protègent les chenilles des oiseaux un peu trop gourmands. Un vrai bunker végétal !"
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