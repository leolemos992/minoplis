export type Character = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  imageHint: string;
};

export type Player = {
  id: string;
  name: string;
  character: Character;
  money: number;
  properties: string[];
  position: number;
  color: string;
};

export type Property = {
  id: string;
  name: string;
  price: number;
  rent: number[];
  color: string;
};

export type Game = {
  id: string;
  name: string;
  players: Player[];
  board: (Property | { type: string, name: string })[];
  currentPlayerId: string;
  status: 'waiting' | 'active' | 'finished';
};
