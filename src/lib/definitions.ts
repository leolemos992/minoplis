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
  money: number;
  properties: string[];
  position: number;
  color: string;
  totem: string;
};

export type Property = {
  id: string;
  name: string; // Brusque Location
  price: number;
  rent: number[];
  color: string;
  type: 'property' | 'railroad' | 'utility';
};

export type Game = {
  id: string;
  name: string;
  players: Player[];
  board: (Property | { type: string, name: string })[];
  currentPlayerId: string;
  status: 'waiting' | 'active' | 'finished';
};
