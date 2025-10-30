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
  getOutOfJailFreeCards: number;
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
  id:string;
  name: string;
  players: Player[];
  board: (Property | { type: string, name: string })[];
  currentPlayerId: string;
  status: 'waiting' | 'active' | 'finished';
};


export type GameCard = {
  type: 'chance' | 'community-chest';
  description: string;
  action: {
    type: 'money' | 'move' | 'move_to' | 'get_out_of_jail' | 'go_to_jail' | 'repairs';
    amount?: number;
    position?: number | string;
    collectGo?: boolean;
    perHouse?: number;
    perHotel?: number;
  };
};
