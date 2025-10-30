
import type { Character, Game, Property } from '@/lib/definitions';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

export const characters: Character[] = [
  {
    id: 'char-capitalist',
    name: 'O Capitalista',
    description: 'Excelente em gerar riqueza com propriedades.',
    longDescription: 'Um investidor experiente que conhece a arte da negociação. O Capitalista começa com dinheiro extra e recebe um bônus ao cobrar aluguel de um conjunto completo de propriedades.',
    image: getImage('char-capitalist')?.imageUrl || '',
    imageHint: getImage('char-capitalist')?.imageHint || 'man suit',
  },
  {
    id: 'char-innovator',
    name: 'O Inovador',
    description: 'Constrói e melhora propriedades por um custo menor.',
    longDescription: 'Um visionário com visão de futuro que pode construir o futuro. O Inovador paga menos por casas e hotéis, permitindo o rápido desenvolvimento de suas propriedades.',
    image: getImage('char-innovator')?.imageUrl || '',
    imageHint: getImage('char-innovator')?.imageHint || 'woman futuristic',
  },
  {
    id: 'char-globetrotter',
    name: 'O Globetrotter',
    description: 'Viaja pelo tabuleiro com facilidade e evita taxas.',
    longDescription: 'Um explorador aventureiro que está sempre em movimento. O Globetrotter pode optar por mover espaços extras depois de rolar dados duplos e não paga taxas por cair em propriedades de serviços públicos ou transporte.',
    image: getImage('char-globetrotter')?.imageUrl || '',
    imageHint: getImage('char-globetrotter')?.imageHint || 'person backpack',
  },
  {
    id: 'char-popstar',
    name: 'A Popstar',
    description: 'Ganha renda de outros jogadores com seu carisma.',
    longDescription: 'Uma artista carismática que cativa as massas. Quando outros jogadores caem no mesmo espaço que a Popstar, eles devem pagar uma pequena taxa de aparição.',
    image: getImage('char-popstar')?.imageUrl || '',
    imageHint: getImage('char-popstar')?.imageHint || 'singer stage',
  },
];

export const mockGames: Omit<Game, 'board'>[] = [
    {
        id: '1',
        name: "MINOPLIS",
        players: [],
        currentPlayerId: 'player-1',
        status: 'waiting',
    },
    {
        id: '2',
        name: "Disputa no Subúrbio",
        players: [],
        currentPlayerId: 'player-1',
        status: 'active',
    },
    {
        id: '3',
        name: "Batalha na Praia",
        players: [],
        currentPlayerId: 'player-1',
        status: 'active',
    }
]

export const boardSpaces: (Property | { type: string; name: string })[] = [
  { type: 'go', name: 'Início' },
  { id: 'pocofundo-country', name: 'País do Bigode', ruler: 'Will Bigode', rulerDescription: 'País onde a injúria racial contra brancos está liberada.', price: 60, rent: [2, 10, 30, 90, 160, 250], color: 'black', type: 'property' },
  { type: 'community-chest', name: 'Sorte/Azar' },
  { id: 'mafra-republic', name: 'República de Mafra', ruler: 'Mafra', rulerDescription: 'Prática de exercícios será obrigatória todos os dias.', price: 60, rent: [4, 20, 60, 180, 320, 450], color: 'brown', type: 'property' },
  { type: 'income-tax', name: 'Imposto de Renda' },
  { id: 'nosso-brusque-1', name: 'Nosso Brusque - Poço Fundo', price: 200, rent: [5, 10, 20, 40], color: 'railroad', type: 'railroad' },
  { id: 'eliabe-nation', name: 'Nação Eliabe', ruler: 'Eliabe', rulerDescription: 'Não haverá mais moeda oficial, só trambiqueragem de paulista.', price: 100, rent: [6, 30, 90, 270, 400, 550], color: 'lightblue', type: 'property' },
  { type: 'chance', name: 'Sorte/Azar' },
  { id: 'zinkland', name: 'Zinklandia', ruler: 'Zink', rulerDescription: 'Todas as pessoas terão que fabricar 1 kg de plástico bolha toda semana.', price: 100, rent: [6, 30, 90, 270, 400, 550], color: 'lightblue', type: 'property' },
  { id: '62-realm', name: 'Reino de 62', ruler: '62', rulerDescription: 'Toda mulher casada terá que passar a primeira noite com ele (Bahia Palace).', price: 120, rent: [8, 40, 100, 300, 450, 600], color: 'lightblue', type: 'property' },
  { type: 'jail', name: 'Prisão' },
  { id: 'dias-domain', name: 'Domínio de Dias', ruler: 'Dias', rulerDescription: 'País do futebol, cerveja e pagodinho.', price: 140, rent: [10, 50, 150, 450, 625, 750], color: 'pink', type: 'property' },
  { id: 'electric-company', name: 'Companhia Elétrica', price: 150, rent: [], color: 'utility', type: 'utility' },
  { id: 'leo-land', name: 'Leo Land', ruler: 'Leo', rulerDescription: 'País análogo à Alemanha em 1939.', price: 140, rent: [10, 50, 150, 450, 625, 750], color: 'pink', type: 'property' },
  { id: 'fly-zone', name: 'Zona do Fly', ruler: 'Fly', rulerDescription: 'País dos de de casadas.', price: 160, rent: [12, 60, 180, 500, 700, 900], color: 'pink', type: 'property' },
  { id: 'nosso-brusque-2', name: 'Nosso Brusque - Rio Branco', price: 200, rent: [10, 20, 40, 80], color: 'railroad', type: 'railroad' },
  { id: 'hellmann-empire', name: 'Império Hellmann', ruler: 'Hellmann', rulerDescription: 'País do energético monster e salgadinho sabor camarão.', price: 180, rent: [14, 70, 200, 550, 750, 950], color: 'orange', type: 'property' },
  { type: 'community-chest', name: 'Sorte/Azar' },
  { id: 'diegao-principality', name: 'Principado de Diegão', ruler: 'Diegão', rulerDescription: 'País dos construtores e engenheiros civis.', price: 180, rent: [14, 70, 200, 550, 750, 950], color: 'orange', type: 'property' },
  { id: 'new-york-ave', name: 'República de Mafra II', ruler: 'Mafra', rulerDescription: 'Prática de exercícios será obrigatória todos os dias.', price: 200, rent: [16, 80, 220, 600, 800, 1000], color: 'orange', type: 'property' },
  { type: 'free-parking', name: 'Estacionamento Grátis' },
  { id: 'kentucky-ave', name: 'Nação Eliabe II', ruler: 'Eliabe', rulerDescription: 'Não haverá mais moeda oficial, só trambiqueragem de paulista.', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: 'red', type: 'property' },
  { type: 'chance', name: 'Sorte/Azar' },
  { id: 'indiana-ave', name: 'Zinklandia II', ruler: 'Zink', rulerDescription: 'Todas as pessoas terão que fabricar 1 kg de plástico bolha toda semana.', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: 'red', type: 'property' },
  { id: 'illinois-ave', name: 'Reino de 62 II', ruler: '62', rulerDescription: 'Toda mulher casada terá que passar a primeira noite com ele (Bahia Palace).', price: 240, rent: [20, 100, 300, 750, 925, 1100], color: 'red', type: 'property' },
  { id: 'nosso-brusque-3', name: 'Nosso Brusque - Maluche', price: 200, rent: [25, 50, 100, 200], color: 'railroad', type: 'railroad' },
  { id: 'atlantic-ave', name: 'Domínio de Dias II', ruler: 'Dias', rulerDescription: 'País do futebol, cerveja e pagodinho.', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: 'yellow', type: 'property' },
  { id: 'ventnor-ave', name: 'Leo Land II', ruler: 'Leo', rulerDescription: 'País análogo à Alemanha em 1939.', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: 'yellow', type: 'property' },
  { id: 'water-works', name: 'Companhia de Água', price: 150, rent: [], color: 'utility', type: 'utility' },
  { id: 'marvin-gardens', name: 'Zona do Fly II', ruler: 'Fly', rulerDescription: 'País dos de de casadas.', price: 280, rent: [24, 120, 360, 850, 1025, 1200], color: 'yellow', type: 'property' },
  { type: 'go-to-jail', name: 'Vá para a Prisão' },
  { id: 'pacific-ave', name: 'Império Hellmann II', ruler: 'Hellmann', rulerDescription: 'País do energético monster e salgadinho sabor camarão.', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: 'green', type: 'property' },
  { id: 'north-carolina-ave', name: 'Principado de Diegão II', ruler: 'Diegão', rulerDescription: 'País dos construtores e engenheiros civis.', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: 'green', type: 'property' },
  { type: 'community-chest', name: 'Sorte/Azar' },
  { id: 'pennsylvania-ave', name: 'País do Bigode II', ruler: 'Will Bigode', rulerDescription: 'País onde a injúria racial contra brancos está liberada.', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], color: 'green', type: 'property' },
  { id: 'nosso-brusque-4', name: 'Nosso Brusque - Centro', price: 200, rent: [50, 100, 200, 400], color: 'railroad', type: 'railroad' },
  { type: 'chance', name: 'Sorte/Azar' },
  { id: 'park-place', name: 'Reino de 62 III', ruler: '62', rulerDescription: 'Toda mulher casada terá que passar a primeira noite com ele (Bahia Palace).', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], color: 'darkblue', type: 'property' },
  { type: 'luxury-tax', name: 'Imposto de Luxo' },
  { id: 'boardwalk', name: 'Leo Land III', ruler: 'Leo', rulerDescription: 'País análogo à Alemanha em 1939.', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], color: 'darkblue', type: 'property' },
];

    
