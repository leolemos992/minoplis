// Represents a player in the game.
export type Player = {
  id: string; // Document ID, typically the same as userId for simplicity in solo games.
  userId: string; // Firebase Auth UID.
  name: string;
  money: number;
  position: number;
  color: string;
  totem: string;
  inJail: boolean;
  properties: string[]; // Array of property IDs owned by the player.
  mortgagedProperties: string[]; // Array of property IDs that are mortgaged.
  houses: { [propertyId: string]: number }; // Key-value pair of propertyId and number of houses (5 for hotel).
  getOutOfJailFreeCards: number;
};

// Represents a property on the board (land, railroad, or utility).
export type Property = {
  id: string;
  type: 'property' | 'railroad' | 'utility';
  name: string;
  price: number;
  color: string;
  rent: number[];
  houseCost?: number;
};

// Represents the state of a single game session.
export type Game = {
  id:string;
  name: string;
  hostId: string;
  status: 'waiting' | 'active' | 'finished';
  currentPlayerId: string;
  createdAt: any; // Firestore ServerTimestamp.
};

// Represents a Chance or Community Chest card.
export type GameCard = {
  type: 'chance' | 'community-chest';
  description: string;
  action: {
    type: 'money' | 'move_to' | 'get_out_of_jail' | 'go_to_jail' | 'repairs';
    amount?: number;
    position?: number | string; // Can be a board index or a property ID string.
    collectGo?: boolean;
    perHouse?: number;
    perHotel?: number;
  };
};

// Represents a notification displayed to the user.
export type Notification = {
    id: string;
    message: string;
    variant: 'default' | 'destructive';
}
