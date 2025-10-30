
import type { Character, Game, Property, GameCard } from '@/lib/definitions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Car, Dog, Ship, Rocket, Bot, Cat } from 'lucide-react';

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

export const boardSpaces: (Property | { type: string; name: string })[] = [
  { type: 'go', name: 'Início' },
  { id: 'poco-fundo', name: 'Poço Fundo', price: 60, rent: [2, 10, 30, 90, 160, 250], color: 'brown', type: 'property' },
  { type: 'community-chest', name: 'Sorte/Azar' },
  { id: 'guarani', name: 'Guarani', price: 60, rent: [4, 20, 60, 180, 320, 450], color: 'brown', type: 'property' },
  { type: 'income-tax', name: 'Imposto de Renda' },
  { id: 'nosso-brusque-1', name: 'Nosso Brusque - Poço Fundo', price: 200, rent: [5], color: 'railroad', type: 'railroad' },
  { id: 'azambuja', name: 'Azambuja', price: 100, rent: [6, 30, 90, 270, 400, 550], color: 'lightblue', type: 'property' },
  { type: 'chance', name: 'Sorte/Azar' },
  { id: 'dom-joaquim', name: 'Dom Joaquim', price: 100, rent: [6, 30, 90, 270, 400, 550], color: 'lightblue', type: 'property' },
  { id: 'santa-terezinha', name: 'Santa Terezinha', price: 120, rent: [8, 40, 100, 300, 450, 600], color: 'lightblue', type: 'property' },
  { type: 'jail', name: 'Prisão' },
  { id: 'sao-luiz', name: 'São Luiz', price: 140, rent: [10, 50, 150, 450, 625, 750], color: 'pink', type: 'property' },
  { id: 'electric-company', name: 'CELESC', price: 150, rent: [], color: 'utility', type: 'utility' },
  { id: 'bateas', name: 'Bateas', price: 140, rent: [10, 50, 150, 450, 625, 750], color: 'pink', type: 'property' },
  { id: 'primeiro-de-maio', name: 'Primeiro de Maio', price: 160, rent: [12, 60, 180, 500, 700, 900], color: 'pink', type: 'property' },
  { id: 'nosso-brusque-2', name: 'Nosso Brusque - Rio Branco', price: 200, rent: [10], color: 'railroad', type: 'railroad' },
  { id: 'santa-rita', name: 'Santa Rita', price: 180, rent: [14, 70, 200, 550, 750, 950], color: 'orange', type: 'property' },
  { type: 'community-chest', name: 'Sorte/Azar' },
  { id: 'sao-pedro', name: 'São Pedro', price: 180, rent: [14, 70, 200, 550, 750, 950], color: 'orange', type: 'property' },
  { id: 'limoeiro', name: 'Limoeiro', price: 200, rent: [16, 80, 220, 600, 800, 1000], color: 'orange', type: 'property' },
  { type: 'free-parking', name: 'Estacionamento Grátis' },
  { id: 'rio-branco', name: 'Rio Branco', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: 'red', type: 'property' },
  { type: 'chance', name: 'Sorte/Azar' },
  { id: 'souza-cruz', name: 'Souza Cruz', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: 'red', type: 'property' },
  { id: 'agua-clara', name: 'Águas Claras', price: 240, rent: [20, 100, 300, 750, 925, 1100], color: 'red', type: 'property' },
  { id: 'nosso-brusque-3', name: 'Nosso Brusque - Maluche', price: 200, rent: [25], color: 'railroad', type: 'railroad' },
  { id: 'centro-i', name: 'Centro I', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: 'yellow', type: 'property' },
  { id: 'maluche', name: 'Maluche', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: 'yellow', type: 'property' },
  { id: 'water-works', name: 'SAMAE', price: 150, rent: [], color: 'utility', type: 'utility' },
  { id: 'voluntarios-da-patria', name: 'Voluntários da Pátria', price: 280, rent: [24, 120, 360, 850, 1025, 1200], color: 'yellow', type: 'property' },
  { type: 'go-to-jail', name: 'Vá para a Prisão' },
  { id: 'primeiro-de-maio-ii', name: 'Primeiro de Maio II', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: 'green', type: 'property' },
  { id: 'sao-sebastiao', name: 'São Sebastião', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: 'green', type: 'property' },
  { type: 'community-chest', name: 'Sorte/Azar' },
  { id: 'cedro-alto', name: 'Cedro Alto', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], color: 'green', type: 'property' },
  { id: 'nosso-brusque-4', name: 'Nosso Brusque - Centro', price: 200, rent: [50], color: 'railroad', type: 'railroad' },
  { type: 'chance', name: 'Sorte/Azar' },
  { id: 'havan', name: 'Avenida da Havan', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], color: 'darkblue', type: 'property' },
  { type: 'luxury-tax', name: 'Imposto de Luxo' },
  { id: 'centro-ii', name: 'Centro II', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], color: 'darkblue', type: 'property' },
];

export const chanceCards: GameCard[] = [
  { type: 'chance', description: 'Você ganhou na loteria — Receba R$ 200.000', action: { type: 'money', amount: 200000 } },
  { type: 'chance', description: 'Recebeu herança de um parente distante — Receba R$ 100.000', action: { type: 'money', amount: 100000 } },
  { type: 'chance', description: 'A prefeitura devolve imposto pago a mais — Receba R$ 40.000', action: { type: 'money', amount: 40000 } },
  { type: 'chance', description: 'Seu título da dívida vence — Receba R$ 100.000', action: { type: 'money', amount: 100000 } },
  { type: 'chance', description: 'Lucros de seus investimentos — Receba R$ 50.000', action: { type: 'money', amount: 50000 } },
  { type: 'chance', description: 'Você foi escolhido presidente do conselho da companhia — Receba R$ 20.000', action: { type: 'money', amount: 20000 } },
  { type: 'chance', description: 'Venda de ações com lucro — Receba R$ 60.000', action: { type: 'money', amount: 60000 } },
  { type: 'chance', description: 'Seu imóvel foi valorizado — Receba R$ 70.000', action: { type: 'money', amount: 70000 } },
  { type: 'chance', description: 'Avance até o ponto de partida (“Partida”) — Receba R$ 200.000', action: { type: 'move_to', position: 0, collectGo: true } },
  { type: 'chance', description: 'Vá até a Estação Ferroviária e receba R$ 20.000', action: { type: 'money', amount: 20000 } },
  { type: 'chance', description: 'Vá até a Avenida Central — Se passar pela Partida, receba R$ 200.000', action: { type: 'move_to', position: 'centro-i', collectGo: true } },
  { type: 'chance', description: 'O banco errou a seu favor — Receba R$ 20.000', action: { type: 'money', amount: 20000 } },
  { type: 'chance', description: 'Saia da prisão, se estiver preso — (guarde esta carta para uso futuro)', action: { type: 'get_out_of_jail' } },
  { type: 'chance', description: 'Sua empresa de energia pagou dividendos — Receba R$ 50.000', action: { type: 'money', amount: 50000 } },
  { type: 'chance', description: 'Descoberta de petróleo em seu terreno — Receba R$ 100.000', action: { type: 'money', amount: 100000 } },
];

export const communityChestCards: GameCard[] = [
  { type: 'community-chest', description: 'Pague imposto de renda — Pague R$ 100.000', action: { type: 'money', amount: -100000 } },
  { type: 'community-chest', description: 'Pague taxa de reparos nas suas propriedades — Pague R$ 25.000 por casa e R$ 100.000 por hotel', action: { type: 'repairs', perHouse: 25000, perHotel: 100000 } },
  { type: 'community-chest', description: 'Pague conta do médico — Pague R$ 50.000', action: { type: 'money', amount: -50000 } },
  { type: 'community-chest', description: 'Foi multado por excesso de velocidade — Pague R$ 20.000', action: { type: 'money', amount: -20000 } },
  { type: 'community-chest', description: 'Pague conserto do carro — Pague R$ 30.000', action: { type: 'money', amount: -30000 } },
  { type: 'community-chest', description: 'Vá para a prisão — Não passe pela Partida', action: { type: 'go_to_jail' } },
  { type: 'community-chest', description: 'Vá até a Avenida Paulista — Pague aluguel se houver dono', action: { type: 'move_to', position: 'havan', collectGo: false } },
  { type: 'community-chest', description: 'Foi flagrado estacionando em local proibido — Pague R$ 10.000', action: { type: 'money', amount: -10000 } },
  { type: 'community-chest', description: 'Seus imóveis foram danificados pela chuva — Pague R$ 40.000', action: { type: 'money', amount: -40000 } },
  { type: 'community-chest', description: 'Pague taxa escolar — Pague R$ 30.000', action: { type: 'money', amount: -30000 } },
  { type: 'community-chest', description: 'Pague conta de hospital — Pague R$ 50.000', action: { type: 'money', amount: -50000 } },
  { type: 'community-chest', description: 'Conserto urgente no imóvel — Pague R$ 25.000', action: { type: 'money', amount: -25000 } },
  { type: 'community-chest', description: 'Multa de construção irregular — Pague R$ 20.000', action: { type: 'money', amount: -20000 } },
  { type: 'community-chest', description: 'Pague ao banco R$ 15.000 por empréstimo', action: { type: 'money', amount: -15000 } },
  { type: 'community-chest', description: 'Vá para o ponto de Partida, sem receber nada', action: { type: 'move_to', position: 0, collectGo: false } },
];
