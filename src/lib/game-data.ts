
import type { Character, Game, Property, GameCard } from '@/lib/definitions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Car, Dog, Ship, Rocket, Bot, Cat, Landmark, ShowerHead } from 'lucide-react';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

// Characters are no longer used but kept for potential future use.
export const characters: Character[] = [
  {
    id: 'char-capitalist',
    name: 'O Capitalista',
    description: 'Excelente em gerar riqueza com propriedades.',
    longDescription: 'Um investidor experiente que conhece a arte da negociação. O Capitalista começa com dinheiro extra e recebe um bônus ao cobrar aluguel de um conjunto completo de propriedades.',
    image: getImage('char-capitalist')?.imageUrl || '',
    imageHint: getImage('char-capitalist')?.imageHint || 'man suit',
  },
];

export const totems = [
  { id: 'car', name: 'Carro', icon: Car },
  { id: 'dog', name: 'Cachorro', icon: Dog },
  { id: 'ship', name: 'Navio', icon: Ship },
  { id: 'rocket', name: 'Foguete', icon: Rocket },
  { id: 'boot', name: 'Robô', icon: Bot },
  { id: 'cat', name: 'Gato', icon: Cat },
];

export const mockGames: Omit<Game, 'board'>[] = [
    {
        id: '1',
        name: "MINOPOLIS",
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

export const boardSpaces: (Property | { type: string; name: string, id?:string })[] = [
  { type: 'go', name: 'Início', id: 'go' },
  { id: 'poco-fundo', name: 'Poço Fundo', price: 60, rent: [2, 10, 30, 90, 160, 250], color: 'brown', houseCost: 50, type: 'property' },
  { type: 'community-chest', name: 'Baú', id: 'cc1' },
  { id: 'guarani', name: 'Guarani', price: 60, rent: [4, 20, 60, 180, 320, 450], color: 'brown', houseCost: 50, type: 'property' },
  { type: 'income-tax', name: 'Imposto de Renda', id: 'income-tax' },
  { id: 'railroad-1', name: 'Nosso Brusque - Poço Fundo', price: 200, rent: [25, 50, 100, 200], color: 'railroad', type: 'railroad' },
  { id: 'azambuja', name: 'Azambuja', price: 100, rent: [6, 30, 90, 270, 400, 550], color: 'lightblue', houseCost: 50, type: 'property' },
  { type: 'chance', name: 'Sorte', id: 'chance1' },
  { id: 'dom-joaquim', name: 'Dom Joaquim', price: 100, rent: [6, 30, 90, 270, 400, 550], color: 'lightblue', houseCost: 50, type: 'property' },
  { id: 'santa-terezinha', name: 'Santa Terezinha', price: 120, rent: [8, 40, 100, 300, 450, 600], color: 'lightblue', houseCost: 50, type: 'property' },
  { type: 'jail', name: 'Prisão', id: 'jail' },
  { id: 'sao-luiz', name: 'São Luiz', price: 140, rent: [10, 50, 150, 450, 625, 750], color: 'pink', houseCost: 100, type: 'property' },
  { id: 'utility-electric', name: 'CELESC', price: 150, rent: [], color: 'utility', type: 'utility' },
  { id: 'bateas', name: 'Bateas', price: 140, rent: [10, 50, 150, 450, 625, 750], color: 'pink', houseCost: 100, type: 'property' },
  { id: 'primeiro-de-maio', name: 'Primeiro de Maio', price: 160, rent: [12, 60, 180, 500, 700, 900], color: 'pink', houseCost: 100, type: 'property' },
  { id: 'railroad-2', name: 'Nosso Brusque - Rio Branco', price: 200, rent: [25, 50, 100, 200], color: 'railroad', type: 'railroad' },
  { id: 'santa-rita', name: 'Santa Rita', price: 180, rent: [14, 70, 200, 550, 750, 950], color: 'orange', houseCost: 100, type: 'property' },
  { type: 'community-chest', name: 'Baú', id: 'cc2' },
  { id: 'sao-pedro', name: 'São Pedro', price: 180, rent: [14, 70, 200, 550, 750, 950], color: 'orange', houseCost: 100, type: 'property' },
  { id: 'limoeiro', name: 'Limoeiro', price: 200, rent: [16, 80, 220, 600, 800, 1000], color: 'orange', houseCost: 100, type: 'property' },
  { type: 'free-parking', name: 'Estacione Grátis', id: 'free-parking' },
  { id: 'rio-branco', name: 'Rio Branco', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: 'red', houseCost: 150, type: 'property' },
  { type: 'chance', name: 'Sorte', id: 'chance2' },
  { id: 'souza-cruz', name: 'Souza Cruz', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: 'red', houseCost: 150, type: 'property' },
  { id: 'agua-clara', name: 'Águas Claras', price: 240, rent: [20, 100, 300, 750, 925, 1100], color: 'red', houseCost: 150, type: 'property' },
  { id: 'railroad-3', name: 'Nosso Brusque - Maluche', price: 200, rent: [25, 50, 100, 200], color: 'railroad', type: 'railroad' },
  { id: 'centro-i', name: 'Centro I', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: 'yellow', houseCost: 150, type: 'property' },
  { id: 'maluche', name: 'Maluche', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: 'yellow', houseCost: 150, type: 'property' },
  { id: 'utility-water', name: 'SAMAE', price: 150, rent: [], color: 'utility', type: 'utility' },
  { id: 'voluntarios-da-patria', name: 'Voluntários da Pátria', price: 280, rent: [24, 120, 360, 850, 1025, 1200], color: 'yellow', houseCost: 150, type: 'property' },
  { type: 'go-to-jail', name: 'Vá para a Prisão', id: 'go-to-jail' },
  { id: 'primeiro-de-maio-ii', name: 'Primeiro de Maio II', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: 'green', houseCost: 200, type: 'property' },
  { id: 'sao-sebastiao', name: 'São Sebastião', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: 'green', houseCost: 200, type: 'property' },
  { type: 'community-chest', name: 'Baú', id: 'cc3' },
  { id: 'cedro-alto', name: 'Cedro Alto', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], color: 'green', houseCost: 200, type: 'property' },
  { id: 'railroad-4', name: 'Nosso Brusque - Centro', price: 200, rent: [25, 50, 100, 200], color: 'railroad', type: 'railroad' },
  { type: 'chance', name: 'Sorte', id: 'chance3' },
  { id: 'havan', name: 'Avenida da Havan', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], color: 'darkblue', houseCost: 200, type: 'property' },
  { type: 'luxury-tax', name: 'Imposto de Luxo', id: 'luxury-tax' },
  { id: 'centro-ii', name: 'Centro II', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], color: 'darkblue', houseCost: 200, type: 'property' },
];

export const chanceCards: GameCard[] = [
  { type: 'chance', description: 'Avance até o Início (Receba R$200)', action: { type: 'move_to', position: 'go', collectGo: true } },
  { type: 'chance', description: 'Avance para "Rio Branco". Se você passar pelo Início, receba R$200.', action: { type: 'move_to', position: 'rio-branco', collectGo: true } },
  { type: 'chance', description: 'A ponte estaiada balançou demais. Pague R$15 pela vistoria.', action: { type: 'money', amount: -15 } },
  { type: 'chance', description: 'O banco paga a você um dividendo de R$50.', action: { type: 'money', amount: 50 } },
  { type: 'chance', description: 'Receba uma carta de "Saia Livre da Prisão".', action: { type: 'get_out_of_jail' } },
  { type: 'chance', description: 'Seu empréstimo de construção vence. Receba R$150.', action: { type: 'money', amount: 150 } },
];

export const communityChestCards: GameCard[] = [
  { type: 'community-chest', description: 'É Fenarreco! Seus negócios prosperaram. Receba R$100.', action: { type: 'money', amount: 100 } },
  { type: 'community-chest', description: 'Taxas médicas. Pague R$50.', action: { type: 'money', amount: -50 } },
  { type: 'community-chest', description: 'Vá para a Prisão. Vá diretamente para a Prisão, não passe pelo Início, não receba R$200.', action: { type: 'go_to_jail' } },
  { type: 'community-chest', description: 'Pague taxa escolar de R$50.', action: { type: 'money', amount: -50 } },
  { type: 'community-chest', description: 'Você foi pego na enchente e precisou de um bote. Pague R$100.', action: { type: 'money', amount: -100 } },
  { type: 'community-chest', description: 'Você é avaliado para reparos de rua. R$40 por casa, R$115 por hotel.', action: { type: 'repairs', perHouse: 40, perHotel: 115 } },
  { type: 'community-chest', description: 'Restituição do Imposto de Renda. Receba R$20.', action: { type: 'money', amount: 20 } },
  { type: 'community-chest', description: 'Multa por excesso de velocidade: R$15.', action: { type: 'money', amount: -15 } },
  { type: 'community-chest', description: 'Faça reparos gerais em todas as suas propriedades. Para cada casa pague R$25. Para cada hotel pague R$100.', action: { type: 'repairs', perHouse: 25, perHotel: 100 } },
  { type: 'community-chest', description: 'Receba uma carta de "Saia Livre da Prisão".', action: { type: 'get_out_of_jail' } },
];
