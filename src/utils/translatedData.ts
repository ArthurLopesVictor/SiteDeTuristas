export const getTranslatedMarketData = (t: (key: string) => string) => [
  {
    id: 'sao-jose',
    name: 'Mercado de São José', 
    description: t('data.markets.saoJose.desc'),
    location: 'Praça Dom Vital, s/n - São José, Recife',
    hours: t('data.markets.saoJose.hours'),
    image: 'https://images.unsplash.com/photo-1706097715393-45455755b017?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBzdHJlZXQlMjBtYXJrZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NjAwMjc0MDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    lat: -8.0638,
    lng: -34.8717,
    highlights: [
      t('data.products.medicinalHerbs'),
      t('data.products.handicrafts'),
      t('data.products.spices')
    ],
    history: t('data.markets.saoJose.history'),
    products: [
      { 
        category: t('data.categories.handicrafts'), 
        items: [
          t('data.products.ceramics'),
          t('data.products.laces'),
          t('data.products.woodSculptures'),
          t('data.products.basketry')
        ] 
      },
      { 
        category: t('data.categories.herbsSpices'), 
        items: [
          t('data.products.medicinalHerbs'),
          t('data.products.regionalSpices'),
          t('data.products.naturalTeas')
        ] 
      },
      { 
        category: t('data.categories.gastronomy'), 
        items: [
          'Tapioca',
          'Bolo de rolo',
          t('data.products.regionalSweets'),
          t('data.products.artisanalCachaça')
        ] 
      },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1706097715393-45455755b017?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBzdHJlZXQlMjBtYXJrZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NjAwMjc0MDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1716876995651-1ff85b65a6d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBoYW5kaWNyYWZ0JTIwYXJ0aXNhbnxlbnwxfHx8fDE3NjAwMjc0MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1616140799124-8d582de4bbb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGZvb2QlMjBtYXJrZXR8ZW58MXx8fHwxNzYwMDI3NDA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    vendors: [
      {
        name: 'Dona Maria das Ervas',
        specialty: t('data.vendors.maria.specialty'),
        location: t('data.vendors.maria.location'),
        image: 'https://images.unsplash.com/photo-1597409244351-79ff2d5da5ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZW5kb3IlMjBtYXJrZXQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjAwMzE5NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      },
      {
        name: 'Seu João do Barro',
        specialty: t('data.vendors.joao.specialty'),
        location: t('data.vendors.joao.location'),
        image: 'https://images.unsplash.com/photo-1726421690313-2e0519335b82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwY3JhZnRzbWFuJTIwd29ya2luZ3xlbnwxfHx8fDE3NTk5MzU3NjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      },
      {
        name: 'Tapiocaria da Zélia',
        specialty: t('data.vendors.zelia.specialty'),
        location: t('data.vendors.zelia.location'),
        image: 'https://images.unsplash.com/photo-1551033996-9cfddb3ffb1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBmb29kJTIwdmVuZG9yfGVufDF8fHx8MTc1OTkzNzU2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      },
    ],
  },
  {
    id: 'boa-vista',
    name: 'Mercado da Boa Vista',
    description: t('data.markets.boaVista.desc'),
    location: 'Rua General Joaquim Inácio - Boa Vista, Recife',
    hours: t('data.markets.boaVista.hours'),
    image: 'https://images.unsplash.com/photo-1612287193938-850d948fa92a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGZydWl0cyUyMG1hcmtldHxlbnwxfHx8fDE3NjAwMTMxMjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    lat: -8.0525,
    lng: -34.8925,
    highlights: [
      t('data.products.tropicalFruits'),
      t('data.products.freshFish'),
      t('data.products.regionalCheeses')
    ],
    history: t('data.markets.boaVista.history'),
    products: [
      { 
        category: t('data.categories.fruits'), 
        items: ['Manga', 'Caju', 'Graviola', 'Pitanga', 'Acerola'] 
      },
      { 
        category: t('data.categories.fishSeafood'), 
        items: [
          t('data.products.freshFish'),
          t('data.products.shrimp'),
          t('data.products.crab'),
          t('data.products.lobster')
        ] 
      },
      { 
        category: t('data.categories.dairy'), 
        items: [
          'Queijo coalho',
          'Manteiga de garrafa',
          t('data.products.creamCheese')
        ] 
      },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1612287193938-850d948fa92a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGZydWl0cyUyMG1hcmtldHxlbnwxfHx8fDE3NjAwMTMxMjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1657127990644-ee0c84587f60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNpZmUlMjBicmF6aWwlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzYwMDI3NDA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1593260085573-8c27e72cdd79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNpZmUlMjBicmF6aWwlMjBtYXJrZXR8ZW58MXx8fHwxNzYwMDI3NDA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    vendors: [
      {
        name: 'Frutaria do Severino',
        specialty: t('data.vendors.severino.specialty'),
        location: t('data.vendors.severino.location'),
        image: 'https://images.unsplash.com/photo-1651367520264-cd04fda1605c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXQlMjBzdGFsbCUyMG93bmVyJTIwYnJhemlsfGVufDF8fHx8MTc2MDAzMTk1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      },
    ],
  },
  {
    id: 'casa-amarela',
    name: 'Mercado de Casa Amarela',
    description: t('data.markets.casaAmarela.desc'),
    location: 'Estrada do Arraial - Casa Amarela, Recife',
    hours: t('data.markets.casaAmarela.hours'),
    image: 'https://images.unsplash.com/photo-1616140799124-8d582de4bbb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGZvb2QlMjBtYXJrZXR8ZW58MXx8fHwxNzYwMDI3NDA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    lat: -8.0271,
    lng: -34.9089,
    highlights: [
      t('data.products.regionalFood'),
      t('data.products.flowers'),
      t('data.products.organicProducts')
    ],
    history: t('data.markets.casaAmarela.history'),
    products: [
      { 
        category: t('data.categories.foods'), 
        items: ['Bolo de rolo', 'Cartola', 'Mungunzá', 'Cuscuz'] 
      },
      { 
        category: t('data.categories.flowersPlants'), 
        items: [
          t('data.products.orchids'),
          t('data.products.roses'),
          t('data.products.ornamentalPlants')
        ] 
      },
      { 
        category: t('data.categories.organics'), 
        items: [
          t('data.products.greens'),
          t('data.products.vegetables'),
          t('data.products.freeRangeEggs')
        ] 
      },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1616140799124-8d582de4bbb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGZvb2QlMjBtYXJrZXR8ZW58MXx8fHwxNzYwMDI3NDA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1706097715393-45455755b017?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBzdHJlZXQlMjBtYXJrZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NjAwMjc0MDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1612287193938-850d948fa92a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGZydWl0cyUyMG1hcmtldHxlbnwxfHx8fDE3NjAwMTMxMjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    vendors: [],
  },
];

export const getTranslatedVendorsData = (t: (key: string) => string) => [
  {
    id: '1',
    name: 'Dona Maria das Ervas',
    story: t('data.vendorsStories.maria'),
    specialty: t('data.vendors.maria.specialty'),
    products: [t('vendors.productErvas'), t('vendors.productChas'), t('vendors.productEspeciarias')],
    location: t('data.vendors.maria.location'),
    market: 'Mercado de São José',
    image: 'https://images.unsplash.com/photo-1597409244351-79ff2d5da5ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZW5kb3IlMjBtYXJrZXQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjAwMzE5NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badges: [t('vendors.badgeLocal').replace('📍 ', '')],
  },
  {
    id: '2',
    name: 'Seu João do Barro',
    story: t('data.vendorsStories.joao'),
    specialty: t('data.vendors.joao.specialty'),
    products: [t('vendors.productArtesanato'), t('vendors.productCeramica')],
    location: t('data.vendors.joao.location'),
    market: 'Mercado de São José',
    image: 'https://images.unsplash.com/photo-1726421690313-2e0519335b82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwY3JhZnRzbWFuJTIwd29ya2luZ3xlbnwxfHx8fDE3NTk5MzU3NjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badges: [t('vendors.badgeHandmade').replace('🎨 ', ''), t('vendors.badgeLocal').replace('📍 ', '')],
  },
  {
    id: '3',
    name: 'Tapiocaria da Zélia',
    story: t('data.vendorsStories.zelia'),
    specialty: t('data.vendors.zelia.specialty'),
    products: [t('vendors.productComida'), 'Tapioca'],
    location: t('data.vendors.zelia.location'),
    market: 'Mercado de São José',
    image: 'https://images.unsplash.com/photo-1551033996-9cfddb3ffb1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBmb29kJTIwdmVuZG9yfGVufDF8fHx8MTc1OTkzNzU2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badges: [t('vendors.badgeFamily').replace('👨\u200d👩\u200d👧\u200d👦 ', '')],
  },
  {
    id: '4',
    name: 'Frutaria do Severino',
    story: t('data.vendorsStories.severino'),
    specialty: t('data.vendors.severino.specialty'),
    products: [t('vendors.productFrutas')],
    location: t('data.vendors.severino.location'),
    market: 'Mercado da Boa Vista',
    image: 'https://images.unsplash.com/photo-1651367520264-cd04fda1605c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXQlMjBzdGFsbCUyMG93bmVyJTIwYnJhemlsfGVufDF8fHx8MTc2MDAzMTk1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badges: [t('vendors.badgeLocal').replace('📍 ', '')],
  },
  {
    id: '5',
    name: 'Peixaria da Rosa',
    story: t('data.vendorsStories.rosa'),
    specialty: t('data.vendors.rosa.specialty'),
    products: [t('vendors.productComida')],
    location: t('data.vendors.rosa.location'),
    market: 'Mercado da Boa Vista',
    image: 'https://images.unsplash.com/photo-1700187029616-8a72da6ab81a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjB3b21hbiUyMHZlbmRvciUyMG1hcmtldHxlbnwxfHx8fDE3NjAyNzcwNjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badges: [t('vendors.badgeLocal').replace('📍 ', ''), t('vendors.badgeFamily').replace('👨\\u200d👩\\u200d👧\\u200d👦 ', '')],
  },
  {
    id: '6',
    name: 'Queijaria do Antônio',
    story: t('data.vendorsStories.antonio'),
    specialty: t('data.vendors.antonio.specialty'),
    products: [t('vendors.productComida')],
    location: t('data.vendors.antonio.location'),
    market: 'Mercado da Boa Vista',
    image: 'https://images.unsplash.com/photo-1717065165653-bb853b7e6e7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBmaXNoZXJtYW4lMjBtYXJrZXQlMjBzdGFsbHxlbnwxfHx8fDE3NjAyNzcwNjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badges: [t('vendors.badgeHandmade').replace('🎨 ', ''), t('vendors.badgeLocal').replace('📍 ', '')],
  },
  {
    id: '7',
    name: 'Floricultura da Luiza',
    story: t('data.vendorsStories.luiza'),
    specialty: t('data.vendors.luiza.specialty'),
    products: [t('vendors.productArtesanato')],
    location: t('data.vendors.luiza.location'),
    market: 'Mercado de Casa Amarela',
    image: 'https://images.unsplash.com/photo-1725100313461-1608f9f3b3f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBmbG9yaXN0JTIwdmVuZG9yfGVufDF8fHx8MTc2MDI3NzA2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badges: [t('vendors.badgeLocal').replace('📍 ', '')],
  },
];

export const getTranslatedItinerariesData = (t: (key: string) => string) => [
  {
    id: '1',
    title: t('data.itineraries.gastronomy.title'),
    description: t('data.itineraries.gastronomy.desc'),
    duration: t('data.itineraries.gastronomy.duration'),
    difficulty: t('data.difficulty.easy'),
    market: 'Mercado de São José',
    image: 'https://images.unsplash.com/photo-1616140799124-8d582de4bbb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGZvb2QlMjBtYXJrZXR8ZW58MXx8fHwxNzYwMDI3NDA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stops: [
      { name: 'Tapiocaria da Zélia', description: t('data.itineraries.gastronomy.stop1'), location: t('data.locations.foodCourt') },
      { name: 'Suco de Cana do Chico', description: t('data.itineraries.gastronomy.stop2'), location: t('data.locations.stall5') },
      { name: 'Bolo de Rolo da Luiza', description: t('data.itineraries.gastronomy.stop3'), location: t('data.locations.hallC') },
    ],
    checklist: [
      t('data.itineraries.gastronomy.check1'),
      t('data.itineraries.gastronomy.check2'),
      t('data.itineraries.gastronomy.check3'),
      t('data.itineraries.gastronomy.check4'),
      t('data.itineraries.gastronomy.check5'),
    ],
  },
  {
    id: '2',
    title: t('data.itineraries.handicrafts.title'),
    description: t('data.itineraries.handicrafts.desc'),
    duration: t('data.itineraries.handicrafts.duration'),
    difficulty: t('data.difficulty.medium'),
    market: 'Mercado de São José',
    image: 'https://images.unsplash.com/photo-1716876995651-1ff85b65a6d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBoYW5kaWNyYWZ0JTIwYXJ0aXNhbnxlbnwxfHx8fDE3NjAwMjc0MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stops: [
      { name: 'Cerâmica do João', description: t('data.itineraries.handicrafts.stop1'), location: t('data.locations.stall25') },
      { name: 'Rendas da Carminha', description: t('data.itineraries.handicrafts.stop2'), location: t('data.locations.stall18') },
      { name: t('data.itineraries.handicrafts.stop3Name'), description: t('data.itineraries.handicrafts.stop3'), location: t('data.locations.hallB') },
    ],
    checklist: [
      t('data.itineraries.handicrafts.check1'),
      t('data.itineraries.handicrafts.check2'),
      t('data.itineraries.handicrafts.check3'),
      t('data.itineraries.handicrafts.check4'),
      t('data.itineraries.handicrafts.check5'),
    ],
  },
  {
    id: '3',
    title: t('data.itineraries.photo.title'),
    description: t('data.itineraries.photo.desc'),
    duration: t('data.itineraries.photo.duration'),
    difficulty: t('data.difficulty.easy'),
    market: t('data.allMarkets'),
    image: 'https://images.unsplash.com/photo-1706097715393-45455755b017?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBzdHJlZXQlMjBtYXJrZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NjAwMjc0MDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stops: [
      { name: t('data.itineraries.photo.stop1Name'), description: t('data.itineraries.photo.stop1'), location: t('data.locations.mainEntrance') },
      { name: t('data.itineraries.photo.stop2Name'), description: t('data.itineraries.photo.stop2'), location: t('data.locations.hallA') },
      { name: t('data.itineraries.photo.stop3Name'), description: t('data.itineraries.photo.stop3'), location: t('data.locations.hallB') },
    ],
    checklist: [
      t('data.itineraries.photo.check1'),
      t('data.itineraries.photo.check2'),
      t('data.itineraries.photo.check3'),
      t('data.itineraries.photo.check4'),
      t('data.itineraries.photo.check5'),
    ],
  },
];

export const getTranslatedReviewsData = (t: (key: string) => string) => [
  {
    id: '1',
    author: 'Ana Silva',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    rating: 5,
    date: t('data.reviews.date1'),
    market: 'Mercado de São José',
    comment: t('data.reviews.comment1'),
    helpful: 12,
    photos: [
      'https://images.unsplash.com/photo-1616140799124-8d582de4bbb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGZvb2QlMjBtYXJrZXQ8ZW58MXx8fHwxNzYwMDI3NDA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1716876995651-1ff85b65a6d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBoYW5kaWNyYWZ0JTIwYXJ0aXNhbnxlbnwxfHx8fDE3NjAwMjc0MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
  },
  {
    id: '2',
    author: 'Carlos Mendes',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    rating: 4,
    date: t('data.reviews.date2'),
    market: 'Mercado da Boa Vista',
    comment: t('data.reviews.comment2'),
    helpful: 8,
  },
  {
    id: '3',
    author: 'Maria Santos',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    rating: 5,
    date: t('data.reviews.date3'),
    market: 'Mercado de São José',
    comment: t('data.reviews.comment3'),
    helpful: 15,
    photos: [
      'https://images.unsplash.com/photo-1726421690313-2e0519335b82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwY3JhZnRzbWFuJTIwd29ya2luZ3xlbnwxfHx8fDE3NTk5MzU3NjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
  },
];

export const getTranslatedTipsData = (t: (key: string) => string) => [
  { id: '1', author: 'Pedro', tip: t('data.tips.tip1'), market: 'Mercado da Boa Vista', likes: 24 },
  { id: '2', author: 'Juliana', tip: t('data.tips.tip2'), market: 'Mercado de São José', likes: 18 },
  { id: '3', author: 'Ricardo', tip: t('data.tips.tip3'), market: t('data.allMarkets'), likes: 32 },
  { id: '4', author: 'Lucia', tip: t('data.tips.tip4'), market: 'Mercado de São José', likes: 20 },
];