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
  userId: string; // Firebase Auth UID
  name: string;
  money: number;
  properties: string[];
  mortgagedProperties: string[];
  houses: { [propertyId: string]: number };
  position: number;
  color: string;
  totem: string;
  getOutOfJailFreeCards: number;
  inJail: boolean;
};

export type Property = {
  id: string;
  name: string; // Brusque Location
  price: number;
  houseCost?: number;
  rent: number[];
  color: string;
  type: 'property' | 'railroad' | 'utility';
};

export type GameStatus = 'waiting' | 'rolling-to-start' | 'active' | 'finished';

export type Game = {
  id:string;
  name: string;
  hostId: string;
  currentPlayerId: string | null;
  status: GameStatus;
  createdAt: any; // serverTimestamp
  playerOrder?: string[];
  lastRoll?: [number, number] | null;
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

export type GameLog = {
  message: string;
  timestamp: Date;
}

export type TradeOffer = {
  fromId: string;
  toId: string;
  propertiesFrom: string[];
  propertiesTo: string[];
  moneyFrom: number;
  moneyTo: number;
};

export type AuctionState = {
  property: Property;
  currentBid: number;
  highestBidderId: string | null;
  playersInAuction: string[];
  turnIndex: number;
};

export type Notification = {
    id: string;
    message: string;
    variant: 'default' | 'destructive';
}
