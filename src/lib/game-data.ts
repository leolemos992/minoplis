import type { Character, Game } from '@/lib/definitions';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

export const characters: Character[] = [
  {
    id: 'char-capitalist',
    name: 'The Capitalist',
    description: 'Excels at generating wealth from properties.',
    longDescription: 'A savvy investor who knows the art of the deal. The Capitalist starts with extra cash and receives a bonus when collecting rent from a full set of properties.',
    image: getImage('char-capitalist')?.imageUrl || '',
    imageHint: getImage('char-capitalist')?.imageHint || 'man suit',
  },
  {
    id: 'char-innovator',
    name: 'The Innovator',
    description: 'Builds and upgrades properties for cheaper.',
    longDescription: 'A forward-thinking visionary who can build the future. The Innovator pays less for houses and hotels, allowing for rapid development of their properties.',
    image: getImage('char-innovator')?.imageUrl || '',
    imageHint: getImage('char-innovator')?.imageHint || 'woman futuristic',
  },
  {
    id: 'char-globetrotter',
    name: 'The Globetrotter',
    description: 'Travels the board with ease and avoids fees.',
    longDescription: 'An adventurous explorer who is always on the move. The Globetrotter can choose to move extra spaces after rolling doubles and pays no fees for landing on utility or transport properties.',
    image: getImage('char-globetrotter')?.imageUrl || '',
    imageHint: getImage('char-globetrotter')?.imageHint || 'person backpack',
  },
  {
    id: 'char-popstar',
    name: 'The Popstar',
    description: 'Earns income from other players with charisma.',
    longDescription: 'A charismatic performer who captivates the masses. When other players land on the same space as the Popstar, they must pay a small appearance fee.',
    image: getImage('char-popstar')?.imageUrl || '',
    imageHint: getImage('char-popstar')?.imageHint || 'singer stage',
  },
];

export const mockGames: Omit<Game, 'board'>[] = [
    {
        id: '1',
        name: "Downtown Dash",
        players: [],
        currentPlayerId: 'player-1',
        status: 'waiting',
    },
    {
        id: '2',
        name: "Suburb Showdown",
        players: [],
        currentPlayerId: 'player-1',
        status: 'waiting',
    },
    {
        id: '3',
        name: "Beachside Battle",
        players: [],
        currentPlayerId: 'player-1',
        status: 'active',
    }
]
