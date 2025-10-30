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
        name: "Corrida no Centro",
        players: [],
        currentPlayerId: 'player-1',
        status: 'waiting',
    },
    {
        id: '2',
        name: "Disputa no Subúrbio",
        players: [],
        currentPlayerId: 'player-1',
        status: 'waiting',
    },
    {
        id: '3',
        name: "Batalha na Praia",
        players: [],
        currentPlayerId: 'player-1',
        status: 'active',
    }
]

export const boardSpaces: (Property | { type: string, name: string })[] = [
  { type: 'go', name: 'Início' },
  { id: 'mediterranean-ave', name: 'Av. Mediterrâneo', price: 60, rent: [2, 10, 30, 90, 160, 250], color: 'brown', type: 'property' },
  { type: 'community-chest', name: 'Caixa Comunitária' },
  { id: 'baltic-ave', name: 'Av. Báltica', price: 60, rent: [4, 20, 60, 180, 320, 450], color: 'brown', type: 'property' },
  { type: 'income-tax', name: 'Imposto de Renda' },
  { id: 'reading-railroad', name: 'Ferrovia Reading', price: 200, rent: [25, 50, 100, 200], color: 'railroad', type: 'railroad' },
  { id: 'oriental-ave', name: 'Av. Oriental', price: 100, rent: [6, 30, 90, 270, 400, 550], color: 'lightblue', type: 'property' },
  { type: 'chance', name: 'Sorte' },
  { id: 'vermont-ave', name: 'Av. Vermont', price: 100, rent: [6, 30, 90, 270, 400, 550], color: 'lightblue', type: 'property' },
  { id: 'connecticut-ave', name: 'Av. Connecticut', price: 120, rent: [8, 40, 100, 300, 450, 600], color: 'lightblue', type: 'property' },
  { type: 'jail', name: 'Prisão' },
  { id: 'st-charles-place', name: 'Praça St. Charles', price: 140, rent: [10, 50, 150, 450, 625, 750], color: 'pink', type: 'property' },
  { id: 'electric-company', name: 'Companhia Elétrica', price: 150, rent: [], color: 'utility', type: 'utility' },
  { id: 'states-ave', name: 'Av. dos Estados', price: 140, rent: [10, 50, 150, 450, 625, 750], color: 'pink', type: 'property' },
  { id: 'virginia-ave', name: 'Av. Virgínia', price: 160, rent: [12, 60, 180, 500, 700, 900], color: 'pink', type: 'property' },
  { id: 'pennsylvania-railroad', name: 'Ferrovia Pensilvânia', price: 200, rent: [25, 50, 100, 200], color: 'railroad', type: 'railroad' },
  { id: 'st-james-place', name: 'Praça St. James', price: 180, rent: [14, 70, 200, 550, 750, 950], color: 'orange', type: 'property' },
  { type: 'community-chest', name: 'Caixa Comunitária' },
  { id: 'tennessee-ave', name: 'Av. Tennessee', price: 180, rent: [14, 70, 200, 550, 750, 950], color: 'orange', type: 'property' },
  { id: 'new-york-ave', name: 'Av. Nova York', price: 200, rent: [16, 80, 220, 600, 800, 1000], color: 'orange', type: 'property' },
  { type: 'free-parking', name: 'Estacionamento Grátis' },
  { id: 'kentucky-ave', name: 'Av. Kentucky', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: 'red', type: 'property' },
  { type: 'chance', name: 'Sorte' },
  { id: 'indiana-ave', name: 'Av. Indiana', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: 'red', type: 'property' },
  { id: 'illinois-ave', name: 'Av. Illinois', price: 240, rent: [20, 100, 300, 750, 925, 1100], color: 'red', type: 'property' },
  { id: 'b-o-railroad', name: 'Ferrovia B. & O.', price: 200, rent: [25, 50, 100, 200], color: 'railroad', type: 'railroad' },
  { id: 'atlantic-ave', name: 'Av. Atlântica', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: 'yellow', type: 'property' },
  { id: 'ventnor-ave', name: 'Av. Ventnor', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: 'yellow', type: 'property' },
  { id: 'water-works', name: 'Companhia de Água', price: 150, rent: [], color: 'utility', type: 'utility' },
  { id: 'marvin-gardens', name: 'Jardins Marvin', price: 280, rent: [24, 120, 360, 850, 1025, 1200], color: 'yellow', type: 'property' },
  { type: 'go-to-jail', name: 'Vá para a Prisão' },
  { id: 'pacific-ave', name: 'Av. Pacífico', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: 'green', type: 'property' },
  { id: 'north-carolina-ave', name: 'Av. Carolina do Norte', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: 'green', type: 'property' },
  { type: 'community-chest', name: 'Caixa Comunitária' },
  { id: 'pennsylvania-ave', name: 'Av. Pensilvânia', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], color: 'green', type: 'property' },
  { id: 'short-line-railroad', name: 'Ferrovia Short Line', price: 200, rent: [25, 50, 100, 200], color: 'railroad', type: 'railroad' },
  { type: 'chance', name: 'Sorte' },
  { id: 'park-place', name: 'Park Place', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], color: 'darkblue', type: 'property' },
  { type: 'luxury-tax', name: 'Imposto de Luxo' },
  { id: 'boardwalk', name: 'Boardwalk', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], color: 'darkblue', type: 'property' },
];
