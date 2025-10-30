'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { boardSpaces, totems, chanceCards, communityChestCards } from '@/lib/game-data';
import Link from 'next/link';
import { GameActions } from '@/components/game/game-actions';
import { Home, Zap, Building, HelpCircle, Briefcase, Gem, Train, ShieldCheck, Box, Gavel, Hotel, Landmark, ShowerHead, CircleDollarSign, Bus, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Player, Property, GameCard, GameLog, TradeOffer, AuctionState, Notification } from '@/lib/definitions';
import { Logo } from '@/components/logo';
import { PlayerToken } from '@/components/game/player-token';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/game/property-card';
import { ManagePropertiesDialog } from '@/components/game/manage-properties-dialog';
import { TradeDialog } from '@/components/game/trade-dialog';
import { AuctionDialog } from '@/components/game/auction-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { MultiplayerPanel } from '@/components/game/multiplayer-panel';
import { GameNotifications } from '@/components/game/game-notifications';


const colorClasses: { [key: string]: string } = {
  black: 'bg-black',
  brown: 'bg-[#955436]',
  lightblue: 'bg-[#aae0fa]',
  pink: 'bg-[#d93a96]',
  orange: 'bg-[#f7941d]',
  red: 'bg-[#ed1b24]',
  yellow: 'bg-[#fef200]',
  green: 'bg-[#1fb25a]',
  darkblue: 'bg-[#0072bb]',
  railroad: 'bg-transparent',
  utility: 'bg-transparent',
  mortgaged: 'bg-gray-400'
};

const getIcon = (space: any, size = "w-8 h-8") => {
    switch(space.type) {
        case 'go': return <Home className={size} />;
        case 'jail': return <Landmark className={size} />;
        case 'free-parking': return <Briefcase className={size}/>;
        case 'go-to-jail': return <Zap className={size} />;
        case 'community-chest': return <Box className={cn(size, "text-yellow-600")} />;
        case 'chance': return <HelpCircle className={cn(size, "text-blue-600")} />;
        case 'income-tax': return <CircleDollarSign className={size} />;
        case 'luxury-tax': return <CircleDollarSign className={size} />;
        case 'railroad': return <Bus className={size} />
        case 'utility': 
            if(space.name.includes("CELESC")) return <Zap className={size} />
            if(space.name.includes("SAMAE")) return <ShowerHead className={size} />
            return <Gem className={size} />;
        default: return null;
    }
}

const BoardSpace = ({ space, index, children, onSpaceClick, houses, isMortgaged }: { space: any, index: number, children?: React.ReactNode, onSpaceClick: (space: any, index: number) => void, houses?: number, isMortgaged?: boolean }) => {
    const isProperty = 'price' in space;
    const baseClasses = "border border-black flex items-center justify-center text-center text-xs p-1 relative cursor-pointer hover:bg-yellow-200/50 transition-colors";
    
    const textRotation: { [key: number]: string } = {
        ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 11, '-rotate-90'])),
        ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 31, 'rotate-90'])),
    }

    const cornerTextRotation: { [key: number]: string } = {
        0: 'rotate-[135deg]',
        10: 'rotate-[225deg]',
        20: 'rotate-[-45deg]',
        30: 'rotate-[45deg]',
    }

    const houseContainerClasses: { [key: number]: string } = {
       ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, 'top-0 h-5 w-full flex-row '])), // bottom
       ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 11, 'right-0 w-5 h-full flex-col '])), // left
       ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 21, 'bottom-0 h-5 w-full flex-row-reverse '])), // top
       ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 31, 'left-0 w-5 h-full flex-col-reverse '])), // right
    }

    const HouseDisplay = ({ count }: { count: number}) => {
        if (count === 0) return null;
        if (count === 5) {
            return <Hotel className="w-4 h-4 text-red-600 bg-white/80 rounded-sm p-0.5" />;
        }
        return (
            <div className="flex gap-px">
                {Array.from({ length: count }).map((_, i) => (
                    <Home key={i} className="w-3 h-3 text-green-600 bg-white/80 rounded-sm p-0.5" />
                ))}
            </div>
        )
    };

    const content = (
        <>
            {isProperty && (space.type === 'property' || space.type === 'railroad' || space.type === 'utility') && (
                 <div className={cn(
                    "absolute",
                    index > 0 && index < 10 && "top-0 h-5 w-full", // bottom row
                    index > 10 && index < 20 && "right-0 w-5 h-full", // left row
                    index > 20 && index < 30 && "bottom-0 h-5 w-full", // top row
                    index > 30 && index < 40 && "left-0 w-5 h-full", // right row
                    colorClasses[isMortgaged ? 'mortgaged' : (space as Property).color]
                )} />
            )}
             {houses !== undefined && houses > 0 && (
                <div className={cn("absolute z-10 flex items-center justify-center p-px", houseContainerClasses[index])}>
                    <HouseDisplay count={houses} />
                </div>
            )}
            <div className={cn(
                "relative flex-1 flex flex-col justify-center items-center text-center p-1 text-[9px] h-full w-full",
                textRotation[index],
                isMortgaged && 'opacity-50'
            )}>
                 {getIcon(space, "w-6 h-6")}
                <span className="font-bold px-1 leading-tight">{space.name}</span>
                {(isProperty || space.type === 'income-tax' || space.type === 'luxury-tax') && 
                    <span className="font-normal mt-1">
                        {space.type === 'income-tax' ? '10%' :
                         space.type === 'luxury-tax' ? 'R$100' :
                         `R$${(space as Property).price}`
                        }
                    </span>
                }
            </div>
        </>
    );

    // Corners
    if ([0, 10, 20, 30].includes(index)) {
        return (
            <div className={cn(baseClasses, "z-10")} style={{ gridArea: `space-${index}` }} onClick={() => onSpaceClick(space, index)}>
                 <div className={cn("flex flex-col items-center justify-center h-full w-full", cornerTextRotation[index] )}>
                    <div className="transform-gpu">{getIcon(space, "w-10 h-10")}</div>
                    <span className="font-bold block w-20">{space.name}</span>
                </div>
                 {children && <div className="absolute inset-0 flex items-center justify-center p-2">{children}</div>}
            </div>
        )
    }

    return (
         <div style={{ gridArea: `space-${index}`}} className={cn("border border-black flex items-center justify-center text-center text-xs p-1 relative cursor-pointer hover:bg-yellow-200/50 transition-colors")} onClick={() => onSpaceClick(space, index)}>
            {content}
            {children && <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 items-center justify-center gap-0 p-1 pointer-events-none">{children}</div>}
         </div>
    )
};

const GameBoard = ({ players, onSpaceClick, mortgagedProperties, animateCardPile, notifications, children }: { players: Player[]; onSpaceClick: (space: any, index: number) => void; mortgagedProperties: string[]; animateCardPile: 'chance' | 'community-chest' | null; notifications: Notification[]; children: React.ReactNode }) => {
    const gridTemplateAreas = `
        "space-20 space-21 space-22 space-23 space-24 space-25 space-26 space-27 space-28 space-29 space-30"
        "space-19 center   center   center   center   center   center   center   center   center   space-31"
        "space-18 center   center   center   center   center   center   center   center   center   space-32"
        "space-17 center   center   center   center   center   center   center   center   center   space-33"
        "space-16 center   center   center   center   center   center   center   center   center   space-34"
        "space-15 center   center   center   center   center   center   center   center   center   space-35"
        "space-14 center   center   center   center   center   center   center   center   center   space-36"
        "space-13 center   center   center   center   center   center   center   center   center   space-37"
        "space-12 center   center   center   center   center   center   center   center   center   space-38"
        "space-11 center   center   center   center   center   center   center   center   center   space-39"
        "space-10 space-9  space-8  space-7  space-6  space-5  space-4  space-3  space-2  space-1  space-0"
    `;
    
    const allHouses = players.reduce((acc, player) => ({...acc, ...player.houses}), {} as {[key: string]: number});
    const allMortgaged = players.reduce((acc, player) => [...acc, ...player.mortgagedProperties], [] as string[]);


    return (
        <div className="bg-green-200/40 p-2 md:p-4 aspect-square max-w-[900px] mx-auto">
            <div 
                className="grid h-full w-full relative"
                style={{
                    gridTemplateAreas,
                    gridTemplateRows: '1.6fr repeat(9, 1fr) 1.6fr',
                    gridTemplateColumns: '1.6fr repeat(9, 1fr) 1.6fr',
                }}
            >
                <div className="bg-muted flex flex-col items-center justify-between border-black border-[1.5px] relative p-4" style={{ gridArea: 'center'}}>
                    <div className="w-full flex justify-center items-start pt-2 sm:pt-4">
                         <Logo className="text-3xl sm:text-5xl" />
                    </div>

                    <div className="w-4/5">
                        <GameNotifications notifications={notifications} />
                    </div>
                    
                    <div className="flex justify-center items-center gap-2 sm:gap-8">
                        <motion.div
                            className="w-[35%] h-auto sm:w-32 sm:h-20 bg-blue-200 border-2 border-blue-800 rounded-lg flex items-center justify-center -rotate-12"
                            animate={animateCardPile === 'chance' ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                        >
                            <HelpCircle className="h-1/2 w-1/2 text-blue-800 opacity-60" />
                        </motion.div>
                         <motion.div
                            className="w-[35%] h-auto sm:w-32 sm:h-20 bg-yellow-200 border-2 border-yellow-800 rounded-lg flex items-center justify-center rotate-12"
                            animate={animateCardPile === 'community-chest' ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                         >
                            <Box className="h-1/2 w-1/2 text-yellow-800 opacity-60" />
                        </motion.div>
                    </div>


                    <div className="w-full max-w-[280px] scale-90 sm:scale-100">
                      {children}
                    </div>

                </div>
                {boardSpaces.map((space, index) => (
                    <BoardSpace 
                        key={space.name + index} 
                        space={space} 
                        index={index} 
                        onSpaceClick={onSpaceClick} 
                        houses={ 'id' in space ? allHouses[space.id] : undefined}
                        isMortgaged={ 'id' in space && allMortgaged.includes(space.id)}
                    >
                         <>
                            {players.filter(p => p.position === index).map(p => (
                                <PlayerToken key={p.id} player={p} />
                            ))}
                        </>
                    </BoardSpace>
                ))}
            </div>
        </div>
    );
};


export default function GamePage({
  params,
}: {
  params: { id: string };
}) {
  const searchParams = useSearchParams();
  const playerName = searchParams.get('playerName') || 'Jogador 1';
  const totemId = searchParams.get('totem') || 'car';
  const colorId = searchParams.get('color') || 'blue';
  const gameName = searchParams.get('gameName') || 'MINOPOLIS';
  const numOpponents = parseInt(searchParams.get('numOpponents') || '1', 10);

  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [hasRolled, setHasRolled] = useState(false);

  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [drawnCard, setDrawnCard] = useState<GameCard | null>(null);
  const [cardToExecute, setCardToExecute] = useState<GameCard | null>(null);
  const [isManageOpen, setManageOpen] = useState(false);
  const [isTradeOpen, setTradeOpen] = useState(false);
  const [animateCardPile, setAnimateCardPile] = useState<'chance' | 'community-chest' | null>(null);
  const [lastDiceRoll, setLastDiceRoll] = useState<[number, number]>([1, 1]);
  
  const [chanceDeck, setChanceDeck] = useState<GameCard[]>([]);
  const [communityChestDeck, setCommunityChestDeck] = useState<GameCard[]>([]);
  
  const [gameLog, setGameLog] = useState<GameLog[]>([]);
  const [gameOver, setGameOver] = useState<Player | null>(null);
  
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const JAIL_POSITION = useMemo(() => boardSpaces.findIndex(s => s.type === 'jail'), []);
  const player = players[currentPlayerIndex];

  const addNotification = useCallback((message: string, variant: 'default' | 'destructive' = 'default') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, variant }]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const addLog = useCallback((message: string) => {
    setGameLog(prev => [{ message, timestamp: new Date() }, ...prev]);
  }, []);

  const initializeGame = useCallback(() => {
    const shuffle = (deck: GameCard[]) => [...deck].sort(() => Math.random() - 0.5);
    setChanceDeck(shuffle(chanceCards));
    setCommunityChestDeck(shuffle(communityChestCards));
  
    const humanPlayer: Player = {
      id: 'player-1',
      name: playerName,
      money: 1500,
      properties: [],
      mortgagedProperties: [],
      houses: {},
      position: 0,
      color: colorId,
      totem: totemId,
      getOutOfJailFreeCards: 0,
      inJail: false,
    };
  
    const botColors = ['red', 'green', 'yellow', 'purple', 'orange'].filter(c => c !== colorId);
    const botTotems = ['boot', 'cat', 'ship', 'rocket', 'dog'].filter(t => t !== totemId);
  
    const aiPlayers: Player[] = Array.from({ length: numOpponents }, (_, i) => ({
      id: `player-${i + 2}`,
      name: `IA-Bot ${i + 1}`,
      money: 1500,
      properties: [],
      mortgagedProperties: [],
      houses: {},
      position: 0,
      color: botColors[i % botColors.length],
      totem: botTotems[i % botTotems.length],
      getOutOfJailFreeCards: 0,
      inJail: false,
    }));
  
    setPlayers([humanPlayer, ...aiPlayers]);
    setCurrentPlayerIndex(0);
    setHasRolled(false);
    setGameLog([]);
    setNotifications([]);
    setGameOver(null);
    setAuctionState(null);
    addLog(`O jogo ${gameName} começou!`);
    addLog(`É a vez de ${humanPlayer.name}.`);
  }, [playerName, totemId, colorId, gameName, addLog, numOpponents]);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);


  const updatePlayer = useCallback((playerId: string, updates: Partial<Player> | ((player: Player) => Partial<Player>)) => {
    setPlayers(prevPlayers => prevPlayers.map(p => {
        if (p.id === playerId) {
            const newUpdates = typeof updates === 'function' ? updates(p) : updates;
            return { ...p, ...newUpdates };
        }
        return p;
    }));
  }, []);
  
  const handleBankruptcy = useCallback((bankruptPlayerId: string, creditor?: Player) => {
    const bankruptPlayer = players.find(p => p.id === bankruptPlayerId);
    if (!bankruptPlayer) return;

    addLog(`${bankruptPlayer.name} foi à falência!`);
    addNotification(`${bankruptPlayer.name} foi removido do jogo.`, 'destructive');

    if (creditor) {
      addLog(`${creditor.name} recebe todos os ativos de ${bankruptPlayer.name}.`);
      // Transfer assets
      updatePlayer(creditor.id, p => ({
        money: p.money + bankruptPlayer.money,
        properties: [...p.properties, ...bankruptPlayer.properties],
        // Note: simplified - does not handle mortgages transfer yet.
      }));
    } else {
        // Assets go back to the bank, properties become unowned.
        addLog(`As propriedades de ${bankruptPlayer.name} voltaram para o banco.`);
    }

    setPlayers(prev => prev.filter(p => p.id !== bankruptPlayerId));

  }, [players, addLog, addNotification, updatePlayer]);


  const makePayment = useCallback((payerId: string, receiverId: string | null, amount: number) => {
      const payer = players.find(p => p.id === payerId);
      if (!payer) return false;

      if (payer.money < amount) {
          // Not enough cash, check assets later. For now, bankruptcy.
          const receiver = receiverId ? players.find(p => p.id === receiverId) : undefined;
          handleBankruptcy(payerId, receiver);
          return false;
      }

      updatePlayer(payerId, p => ({ money: p.money - amount }));
      if (receiverId) {
          updatePlayer(receiverId, p => ({ money: p.money + amount }));
      }
      return true;

  }, [players, handleBankruptcy, updatePlayer]);

  const goToJail = useCallback((playerId: string) => {
    updatePlayer(playerId, (p) => {
        addLog(`${p.name} foi para a prisão.`);
        addNotification('Você foi para a prisão!', 'destructive');
        return { position: JAIL_POSITION, inJail: true };
    });
  }, [JAIL_POSITION, addNotification, updatePlayer, addLog]);

  const startAuction = useCallback((property: Property) => {
      addLog(`${property.name} foi a leilão!`);
      addNotification(`${property.name} está sendo leiloado.`);
      const playersInAuction = players.map(p => p.id);
      setAuctionState({
          property,
          currentBid: 10,
          highestBidderId: null,
          playersInAuction,
          turnIndex: 0
      });
  }, [players, addLog, addNotification]);

  const handleLandedOnSpace = useCallback((spaceIndex: number, fromCard = false) => {
    const space = boardSpaces[spaceIndex];
    if (!space || !player) return;

    addLog(`${player.name} parou em ${space.name}.`);

    if (space.type === 'jail' && !player.inJail) {
        addNotification("Você está apenas visitando a prisão.");
        return;
    }

    const isProperty = 'price' in space;
    if(isProperty) {
        const property = space as Property;
        const owner = players.find(p => p.properties.includes(property.id));
        
        if (owner && owner.id !== player.id) {
            if (owner.mortgagedProperties.includes(property.id)) {
                 addNotification(`${owner.name} hipotecou ${property.name}, sem aluguel.`);
                 addLog(`${player.name} não pagou aluguel por ${property.name} (hipotecada).`);
                 return;
            }

            let rentAmount = 0;
            if (property.type === 'property') {
                const houseCount = owner.houses[property.id] || 0;
                rentAmount = property.rent[houseCount];
            } else if (property.type === 'railroad') {
                const railroadCount = owner.properties.filter(pId => (boardSpaces.find(bs => 'id' in bs && bs.id === pId) as Property)?.type === 'railroad').length;
                rentAmount = property.rent[railroadCount - 1];
            } else if (property.type === 'utility') {
                const utilityCount = owner.properties.filter(pId => (boardSpaces.find(p => 'id' in p && p.id === pId) as Property)?.type === 'utility').length;
                const multiplier = utilityCount === 1 ? 4 : 10;
                rentAmount = (lastDiceRoll[0] + lastDiceRoll[1]) * multiplier;
            }

            if(rentAmount > 0) {
                 if (makePayment(player.id, owner.id, rentAmount)) {
                    addNotification(`${player.name} pagou R$${rentAmount} a ${owner.name}.`, 'destructive');
                    addLog(`${player.name} pagou R$${rentAmount} de aluguel a ${owner.name} por ${property.name}.`);
                }
            }

        } else if (!owner) {
             if (player.id === 'player-1') {
                setSelectedSpace(space);
             } else { // AI Logic to buy
                 if (player.money >= property.price * 1.5) { // AI is a bit picky
                    updatePlayer(player.id, prev => ({
                        money: prev.money - property.price,
                        properties: [...prev.properties, property.id],
                    }));
                    addLog(`${player.name} comprou ${property.name} por R$${property.price}.`);
                 } else {
                     startAuction(property);
                 }
             }
        }
    } else if (space.type === 'chance' || space.type === 'community-chest') {
        setAnimateCardPile(space.type);
        setTimeout(() => {
            let card: GameCard;
            if (space.type === 'chance') {
                const [first, ...rest] = chanceDeck;
                card = first;
                setChanceDeck([...rest, card]); // Move card to bottom
            } else {
                const [first, ...rest] = communityChestDeck;
                card = first;
                setCommunityChestDeck([...rest, card]); // Move card to bottom
            }

            addLog(`${player.name} tirou uma carta de ${space.type === 'chance' ? 'Sorte' : 'Baú Comunitário'}: "${card.description}"`);
            
            if (player.id === 'player-1') {
                setDrawnCard(card);
            } else {
                setCardToExecute(card);
            }
            
            setAnimateCardPile(null);
        }, 500);

    } else if (space.type === 'income-tax') {
        const taxAmount = Math.floor(player.money * 0.1);
        if (makePayment(player.id, null, taxAmount)) {
            addNotification(`${player.name} pagou R$${taxAmount} de Imposto de Renda.`, 'destructive');
            addLog(`${player.name} pagou R$${taxAmount} de Imposto de Renda.`);
        }
    } else if (space.type === 'luxury-tax') {
        if(makePayment(player.id, null, 100)) {
            addNotification(`${player.name} pagou R$100 de Taxa das Blusinhas.`, 'destructive');
            addLog(`${player.name} pagou R$100 de Taxa das Blusinhas.`);
        }
    } else if (space.type === 'go-to-jail') {
        goToJail(player.id);
    }

  }, [player, players, addNotification, goToJail, chanceDeck, communityChestDeck, updatePlayer, lastDiceRoll, addLog, makePayment, startAuction]);
  
  const applyCardAction = useCallback((card: GameCard) => {
    if (!player) return;
  
    const actionResult = (p: Player): Partial<Player> => {
      let newPlayerState: Partial<Player> = {};
      const { action } = card;
  
      switch (action.type) {
        case 'money':
          const amount = action.amount || 0;
          if (amount < 0) {
            makePayment(p.id, null, Math.abs(amount));
          } else {
            newPlayerState.money = p.money + amount;
          }
          break;
        case 'move_to':
          let newPosition = -1;
          if (typeof action.position === 'string') {
              newPosition = boardSpaces.findIndex(s => 'id' in s && s.id === action.position);
          } else if (typeof action.position === 'number') {
              newPosition = action.position;
          }

          if (newPosition !== -1) {
              if (action.collectGo && newPosition < p.position) {
                  newPlayerState.money = p.money + 200;
                  addLog(`${p.name} coletou R$200 por passar pelo Início.`);
              }
              newPlayerState.position = newPosition;
              setTimeout(() => handleLandedOnSpace(newPosition, true), 500);
          }
          break;
        case 'go_to_jail':
          newPlayerState.position = JAIL_POSITION;
          newPlayerState.inJail = true;
          break;
        case 'get_out_of_jail':
          newPlayerState.getOutOfJailFreeCards = p.getOutOfJailFreeCards + 1;
          break;
        case 'repairs':
             const houseCount = Object.values(p.houses).reduce((sum, count) => sum + (count < 5 ? count : 0), 0);
             const hotelCount = Object.values(p.houses).reduce((sum, count) => sum + (count === 5 ? 1 : 0), 0);
             const repairCost = (action.perHouse! * houseCount) + (action.perHotel! * hotelCount);
             if (makePayment(p.id, null, repairCost)) {
                addLog(`${p.name} pagou R$${repairCost} em reparos.`);
             }
            break;
        default:
          break;
      }
      return newPlayerState;
    };
    
    updatePlayer(player.id, actionResult);

  }, [player, JAIL_POSITION, handleLandedOnSpace, updatePlayer, addLog, makePayment]);

  useEffect(() => {
    if (!cardToExecute || !player) return;
  
    applyCardAction(cardToExecute);
  
    const { action } = cardToExecute;
    let notification: { message: string, variant?: 'destructive'} | null = null;
     switch (action.type) {
        case 'money':
            notification = {
                message: `${player.name} ${action.amount! > 0 ? 'recebeu' : 'pagou'} R$${Math.abs(action.amount!)}`,
                variant: action.amount! < 0 ? 'destructive' : undefined,
            };
          break;
        case 'go_to_jail':
            notification = { message: `${player.name} foi para a prisão!`, variant: "destructive" };
            break;
        case 'get_out_of_jail':
            notification = { message: `${player.name} recebeu uma carta para sair da prisão!` };
            break;
     }

    if (notification) {
      setTimeout(() => addNotification(notification!.message, notification!.variant), 100);
    }
    
    setCardToExecute(null);
  }, [cardToExecute, applyCardAction, addNotification, player]);


  const handleDiceRoll = (dice1: number, dice2: number, fromCard = false) => {
    if (!player) return;
    setHasRolled(true);
    setLastDiceRoll([dice1, dice2]);
    addLog(`${player.name} rolou ${dice1} e ${dice2}.`);
    
    if (player.id === 'player-1' && !player.inJail) {
        addNotification(`Você rolou ${dice1 + dice2}.`);
    }

    if (player.inJail) {
        if (dice1 === dice2) {
            updatePlayer(player.id, { inJail: false });
            addNotification("Você rolou dados duplos e saiu da prisão!");
            addLog(`${player.name} saiu da prisão rolando dados duplos.`);
        } else {
            addNotification("Você não rolou dados duplos. Tente na próxima rodada.");
        }
        // Rolling dice in jail (even if you don't get out) counts as your move
        return;
    }
    
    const total = dice1 + dice2;
    let newPosition = 0;
    
    updatePlayer(player.id, prevPlayer => {
        const currentPosition = prevPlayer.position;
        newPosition = (currentPosition + total) % 40;
        
        let updatedPlayer: Partial<Player> = { position: newPosition };

        if (newPosition < currentPosition && !fromCard) {
            updatedPlayer.money = prevPlayer.money + 200;
            setTimeout(() => {
                addNotification(`Você coletou R$200.`);
            }, 100);
            addLog(`${player.name} passou pelo início e coletou R$200.`);
        }
        return updatedPlayer;
    });
    
    setTimeout(() => handleLandedOnSpace(newPosition, fromCard), 500);
  };

  const handleEndTurn = () => {
    // Check for game over
    if (players.length <= 1) {
        setGameOver(players[0] || null);
        return;
    }

    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextPlayerIndex);
    setHasRolled(false);
    if(players[nextPlayerIndex]) {
       addLog(`É a vez de ${players[nextPlayerIndex].name}.`);
    }
  };

  const handleBuyProperty = (property: Property) => {
    if (!player) return;

    if (player.money >= property.price) {
      updatePlayer(player.id, prev => ({
        money: prev.money - property.price,
        properties: [...prev.properties, property.id],
      }));
      addNotification(`Você comprou ${property.name}.`);
      addLog(`${player.name} comprou ${property.name} por R$${property.price}.`);
      setSelectedSpace(null);
    } else {
        addNotification(`Você não tem dinheiro para comprar ${property.name}.`, 'destructive');
    }
  };
  
  const handlePassOnBuy = (property: Property) => {
    setSelectedSpace(null);
    startAuction(property);
  }

  const handlePayBail = () => {
    if (!player || !player.inJail) return;

    if (makePayment(player.id, null, 50)) {
        updatePlayer(player.id, { inJail: false });
        addNotification("Você pagou a fiança e está livre!");
        addLog(`${player.name} pagou R$50 de fiança e saiu da prisão.`);
    }
  }

  const closeCardDialog = () => {
      if (drawnCard) {
          setCardToExecute(drawnCard);
          setDrawnCard(null);
      }
  }

  const handleDebugMove = (space: any, index: number) => {
    if (!player || player.id !== 'player-1') return;
    updatePlayer(player.id, p => ({ position: index }));
    handleLandedOnSpace(index);
  };
  
  useEffect(() => {
    if (players.length <= 1 && players.length > 0) {
        setGameOver(players[0]);
    }
  }, [players]);

 const handleBuild = (propertyId: string, amount: number) => {
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property || !property.houseCost || !player) return;
    
    const propertiesInGroup = boardSpaces.filter(p => 'color' in p && p.color === property.color);
    const ownedPropertiesInGroup = propertiesInGroup.filter(p => 'id' in p && player.properties.includes(p.id));

    if (ownedPropertiesInGroup.length !== propertiesInGroup.length) {
      addNotification(`Você precisa possuir todas as propriedades da cor para construir.`, "destructive");
      return;
    }

    const cost = property.houseCost * amount;
    if (player.money < cost) {
      addNotification("Você não tem dinheiro para construir.", "destructive");
      return;
    }
  
    updatePlayer(player.id, p => {
      const currentHouses = p.houses[propertyId] || 0;
      if (currentHouses + amount > 5) {
         addNotification('Você já construiu um hotel nesta propriedade.', 'destructive');
        return p;
      }
      const newHouses = currentHouses + amount;
      
      const logMessage = `Você construiu ${amount > 0 ? 'uma casa' : 'um hotel'} em ${property.name}.`;
      addLog(logMessage);

      return {
        ...p,
        money: p.money - cost,
        houses: {
          ...p.houses,
          [propertyId]: newHouses,
        }
      }
    });

    addNotification(`Você construiu ${amount} casa(s) em ${property.name}.`);
  };

  const handleSell = (propertyId: string, amount: number) => {
    if (!player) return;
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property || !property.houseCost) return;

    const currentHouses = player.houses[propertyId] || 0;
    if (currentHouses < amount) {
        addNotification('Você não tem construções suficientes para vender.', 'destructive');
        return;
    }

    const saleValue = (property.houseCost / 2) * amount;

    updatePlayer(player.id, p => {
      const newHouses = currentHouses - amount;
      const newHousesState = { ...p.houses };
      if (newHouses === 0) {
        delete newHousesState[propertyId];
      } else {
        newHousesState[propertyId] = newHouses;
      }
      
      addLog(`${p.name} vendeu ${amount} casa(s) em ${property.name} por R$${saleValue}.`);

      return {
        ...p,
        money: p.money + saleValue,
        houses: newHousesState,
      }
    });

    addNotification(`Você vendeu ${amount} casa(s) em ${property.name} por R$${saleValue}.`);
  };

  const handleMortgage = (propertyId: string) => {
    if (!player) return;
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property) return;
    
    const mortgageValue = property.price / 2;
    updatePlayer(player.id, p => {
        addLog(`${p.name} hipotecou ${property.name} por R$${mortgageValue}.`);
        return {
            money: p.money + mortgageValue,
            mortgagedProperties: [...p.mortgagedProperties, propertyId]
        }
    });

    addNotification(`Você hipotecou ${property.name} e recebeu R$${mortgageValue}.`);
  };

  const handleUnmortgage = (propertyId: string) => {
    if (!player) return;
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property) return;

    const unmortgageCost = (property.price / 2) * 1.1; // 10% interest
    if (player.money < unmortgageCost) {
        addNotification(`Você precisa de R$${unmortgageCost.toFixed(2)} para pagar a hipoteca.`, "destructive");
        return;
    }

    updatePlayer(player.id, p => {
        addLog(`${p.name} pagou a hipoteca de ${property.name}.`);
        return {
            money: p.money - unmortgageCost,
            mortgagedProperties: p.mortgagedProperties.filter(id => id !== propertyId)
        }
    });
     addNotification(`Você pagou a hipoteca de ${property.name}.`);
  };

  const handleProposeTrade = (offer: TradeOffer) => {
    const fromPlayer = players.find(p => p.id === offer.fromId);
    const toPlayer = players.find(p => p.id === offer.toId);
    if (!fromPlayer || !toPlayer) return;

    // Simple AI logic for now
    if (toPlayer.id.startsWith('player-')) { // target any bot
        const valueToAI = offer.propertiesTo.reduce((sum, id) => sum + (boardSpaces.find(s => 'id' in s && s.id === id) as Property).price, 0) + offer.moneyTo;
        const valueFromAI = offer.propertiesFrom.reduce((sum, id) => sum + (boardSpaces.find(s => 'id' in s && s.id === id) as Property).price, 0) + offer.moneyFrom;

        if (valueToAI > valueFromAI * 1.2) { // AI wants a good deal
            // Accept trade
            updatePlayer(fromPlayer.id, p => ({
                money: p.money + offer.moneyFrom - offer.moneyTo,
                properties: [...p.properties.filter(id => !offer.propertiesTo.includes(id)), ...offer.propertiesFrom],
            }));
            updatePlayer(toPlayer.id, p => ({
                money: p.money + offer.moneyTo - offer.moneyFrom,
                properties: [...p.properties.filter(id => !offer.propertiesFrom.includes(id)), ...offer.propertiesTo],
            }));
            addNotification(`${toPlayer.name} aceitou sua proposta.`);
            addLog(`${fromPlayer.name} e ${toPlayer.name} realizaram uma troca.`);
        } else {
             addNotification(`${toPlayer.name} recusou sua proposta.`, 'destructive');
             addLog(`${toPlayer.name} recusou uma proposta de troca de ${fromPlayer.name}.`);
        }
    }
    setTradeOpen(false);
  };
  
  const handleAuctionBid = (playerId: string, bidAmount: number) => {
    if (!auctionState) return;

    const bidder = players.find(p => p.id === playerId);
    if (!bidder || bidder.money < bidAmount) {
        addNotification("Você não tem dinheiro suficiente.", "destructive");
        return;
    }

    addLog(`${bidder.name} deu um lance de R$${bidAmount} em ${auctionState.property.name}.`);
    setAuctionState(prev => {
        if (!prev) return null;
        return {
            ...prev,
            currentBid: bidAmount,
            highestBidderId: playerId,
            turnIndex: (prev.turnIndex + 1) % prev.playersInAuction.length,
        };
    });
  };

  const handleAuctionPass = (playerId: string) => {
      if (!auctionState) return;

      const passer = players.find(p => p.id === playerId);
      if (passer) {
        addLog(`${passer.name} passou a vez no leilão.`);
      }

      const newPlayersInAuction = auctionState.playersInAuction.filter(id => id !== playerId);
      
      setAuctionState(prev => {
          if (!prev) return null;
          return {
              ...prev,
              playersInAuction: newPlayersInAuction,
              turnIndex: prev.turnIndex % (newPlayersInAuction.length || 1),
          }
      });
  };

  const endAuction = useCallback(() => {
    if (!auctionState) return;

    if (auctionState.highestBidderId) {
        const winner = players.find(p => p.id === auctionState.highestBidderId);
        if (winner) {
            addLog(`${winner.name} venceu o leilão de ${auctionState.property.name} por R$${auctionState.currentBid}!`);
            addNotification(`${winner.name} arrematou ${auctionState.property.name}!`);
            updatePlayer(winner.id, p => ({
                money: p.money - auctionState.currentBid,
                properties: [...p.properties, auctionState.property.id],
            }));
        }
    } else {
        addLog(`Ninguém deu lance por ${auctionState.property.name}. A propriedade continua do banco.`);
        addNotification("A propriedade não foi arrematada.");
    }
    setAuctionState(null);
  }, [auctionState, players, addLog, addNotification, updatePlayer]);
  
  useEffect(() => {
    if (!auctionState) return;

    // End condition
    if (auctionState.playersInAuction.length === 1 && auctionState.highestBidderId === auctionState.playersInAuction[0]) {
        endAuction();
        return;
    }
    if (auctionState.playersInAuction.length === 0) {
        endAuction();
        return;
    }

    // AI Logic for auction
    const currentAuctionPlayerId = auctionState.playersInAuction[auctionState.turnIndex];
    if (currentAuctionPlayerId?.startsWith('player-')) { // AI's turn to bid
        const aiPlayer = players.find(p => p.id === currentAuctionPlayerId);
        if (!aiPlayer || aiPlayer.id === 'player-1') return;

        const property = auctionState.property;
        const currentBid = auctionState.currentBid;
        const valueToAI = property.price * 0.9; // AI thinks it's worth 90% of price in auction

        const nextBid = currentBid + 10;
        
        setTimeout(() => {
          if (aiPlayer.money > nextBid && nextBid < valueToAI) {
              handleAuctionBid(aiPlayer.id, nextBid);
          } else {
              handleAuctionPass(aiPlayer.id);
          }
        }, 1500);
    }

  }, [auctionState, endAuction, players]);

  const handleAiLogic = (aiPlayer: Player) => {
    if (!aiPlayer) return;

    // 1. Build houses if possible
    const colorGroups = boardSpaces.reduce((acc, space) => {
      if (space.type === 'property' && space.color) {
        if (!acc[space.color]) acc[space.color] = [];
        acc[space.color].push(space.id);
      }
      return acc;
    }, {} as { [color: string]: string[] });

    for (const color in colorGroups) {
      const groupProperties = colorGroups[color];
      const ownedGroupProperties = groupProperties.filter(id => aiPlayer.properties.includes(id));

      // Check if AI owns the full set
      if (ownedGroupProperties.length === groupProperties.length) {
        // AI owns the full set, let's build
        for (const propId of ownedGroupProperties) {
          const property = boardSpaces.find(s => 'id' in s && s.id === propId) as Property;
          const houseCount = aiPlayer.houses[propId] || 0;
          if (property.houseCost && aiPlayer.money > property.houseCost * 2 && houseCount < 5) {
            // Simple logic: build one house if we have more than double the cost
            updatePlayer(aiPlayer.id, p => ({
              money: p.money - property.houseCost!,
              houses: { ...p.houses, [propId]: (p.houses[propId] || 0) + 1 }
            }));
            addLog(`${aiPlayer.name} construiu uma casa em ${property.name}.`);
          }
        }
      }
    }

    // 2. Unmortgage properties if it has enough money
    if (aiPlayer.mortgagedProperties.length > 0 && aiPlayer.money > 1000) { // Arbitrary high cash amount
        const propToUnmortgageId = aiPlayer.mortgagedProperties[0];
        const property = boardSpaces.find(p => 'id' in p && p.id === propToUnmortgageId) as Property;
        const unmortgageCost = (property.price / 2) * 1.1;
        if (aiPlayer.money > unmortgageCost + 500) { // Keep a buffer
             updatePlayer(aiPlayer.id, p => ({
                money: p.money - unmortgageCost,
                mortgagedProperties: p.mortgagedProperties.filter(id => id !== propToUnmortgageId)
            }));
            addLog(`${aiPlayer.name} pagou a hipoteca de ${property.name}.`);
        }
    }
  };

  useEffect(() => {
    if (gameOver || auctionState || !player) return;
    if (player.id !== 'player-1' && !hasRolled) {
      // AI's turn
      setTimeout(() => {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        handleDiceRoll(dice1, dice2);
      }, 1000); // Wait 1 sec before AI rolls

      setTimeout(() => {
        handleAiLogic(player);
        handleEndTurn();
      }, 4000); // AI thinks and ends turn after 4 seconds
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayerIndex, player, hasRolled, gameOver, auctionState]);

  if (!player && !gameOver) {
    return <div>Carregando...</div>;
  }

  const allPlayers = players;
  const humanPlayer = allPlayers.find(p => p.id === 'player-1') || player;
  const owner = selectedSpace ? allPlayers.find(p => 'id' in selectedSpace && p.properties.includes(selectedSpace.id)) : null;
  const isMyTurn = player && player.id === 'player-1';

  return (
    <>
      <div className="p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <GameBoard 
            players={allPlayers} 
            onSpaceClick={handleDebugMove} 
            mortgagedProperties={humanPlayer ? humanPlayer.mortgagedProperties : []} 
            animateCardPile={animateCardPile} 
            notifications={notifications}
          >
            <GameActions 
                onDiceRoll={handleDiceRoll} 
                isPlayerInJail={player?.inJail ?? false}
                onPayBail={handlePayBail}
                canPayBail={player?.money >= 50}
                onManageProperties={() => setManageOpen(true)}
                onTrade={() => setTradeOpen(true)}
                playerHasProperties={humanPlayer?.properties.length > 0}
                isTurnActive={isMyTurn}
                hasRolled={hasRolled}
                onEndTurn={handleEndTurn}
             />
          </GameBoard>
        </div>
        <aside className="lg:col-span-1 space-y-8">
          <MultiplayerPanel
            player={humanPlayer}
            allPlayers={allPlayers}
            currentPlayerId={player ? player.id : ''}
            gameLog={gameLog}
            onBuild={handleBuild}
            onSell={handleSell}
            onMortgage={handleMortgage}
            onUnmortgage={handleUnmortgage}
          />
        </aside>
      </div>

      <AnimatePresence>
        {gameOver && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
            >
                <Dialog open={!!gameOver} onOpenChange={() => {}}>
                    <DialogContent className="max-w-md text-center p-8">
                        <DialogHeader>
                            <motion.div
                                initial={{ scale: 0.5, rotate: -15 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
                            >
                                <Crown className="w-24 h-24 mx-auto text-yellow-400 drop-shadow-lg" />
                            </motion.div>
                            <DialogTitle className="text-3xl font-bold mt-4">Fim de Jogo!</DialogTitle>
                            <DialogDescription className="text-lg mt-2">
                                Parabéns, <span className="font-bold text-primary">{gameOver.name}</span>! Você é o grande vencedor!
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-6 flex-col sm:flex-col gap-2">
                            <Button size="lg" onClick={initializeGame}>Jogar Novamente</Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/">Voltar ao Início</Link>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={!!selectedSpace} onOpenChange={(open) => {
          if (!open) {
              if (selectedSpace && !owner) {
                handlePassOnBuy(selectedSpace);
              } else {
                setSelectedSpace(null)
              }
          }
        }}>
        <DialogContent className="p-0 border-0 bg-transparent shadow-none w-auto max-w-sm">
             {selectedSpace && (
                <PropertyCard 
                    space={selectedSpace} 
                    player={player}
                    owner={owner}
                    onBuy={handleBuyProperty}
                    onClose={() => handlePassOnBuy(selectedSpace)}
                />
            )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!drawnCard} onOpenChange={(open) => !open && closeCardDialog()}>
        <DialogContent>
            {drawnCard && (
                <>
                    <DialogHeader>
                        <DialogTitle className={cn("flex items-center gap-2", drawnCard.type === 'chance' ? 'text-blue-600' : 'text-yellow-700')}>
                            {drawnCard.type === 'chance' ? <HelpCircle/> : <Box/>}
                            {drawnCard.type === 'chance' ? 'Sorte!' : 'Baú Comunitário'}
                        </DialogTitle>
                        <DialogDescription className="pt-4 text-lg text-foreground text-center">
                            {drawnCard.description}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={closeCardDialog}>Ok</Button>
                    </DialogFooter>
                </>
            )}
        </DialogContent>
      </Dialog>

       <ManagePropertiesDialog 
        isOpen={isManageOpen}
        onOpenChange={setManageOpen}
        player={humanPlayer}
        onBuild={handleBuild}
        onSell={handleSell}
        onMortgage={handleMortgage}
        onUnmortgage={handleUnmortgage}
      />
      
      <TradeDialog
        isOpen={isTradeOpen}
        onOpenChange={setTradeOpen}
        player={humanPlayer}
        otherPlayers={allPlayers.filter(p => p.id !== humanPlayer.id)}
        onProposeTrade={handleProposeTrade}
      />

      <AuctionDialog
        isOpen={!!auctionState}
        auctionState={auctionState}
        players={players}
        onBid={handleAuctionBid}
        onPass={handleAuctionPass}
        humanPlayerId={humanPlayer.id}
      />
    </>
  );
}
