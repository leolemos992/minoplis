'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { boardSpaces, totems, chanceCards, communityChestCards } from '@/lib/game-data';
import Link from 'next/link';
import { GameActions } from '@/components/game/game-actions';
import { Home, Zap, Building, HelpCircle, Briefcase, Gem, Train, ShieldCheck, Box, Gavel, Hotel, Landmark, ShowerHead, CircleDollarSign, Bus, Crown, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Player, Property, GameCard, GameLog, TradeOffer, AuctionState, Notification, GameStatus } from '@/lib/definitions';
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
import { RollToStartDialog } from '@/components/game/roll-to-start-dialog';
import { useDoc, useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, writeBatch, serverTimestamp, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';


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

const GameBoard = ({ players, onSpaceClick, animateCardPile, notifications, children }: { players: Player[]; onSpaceClick: (space: any, index: number) => void; animateCardPile: 'chance' | 'community-chest' | null; notifications: Notification[]; children: React.ReactNode }) => {
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

                    <div className="w-full max-w-sm">
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


export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const { user } = useUser();
  const firestore = useFirestore();

  // Firestore data
  const gameRef = useMemoFirebase(() => firestore && gameId ? doc(firestore, 'games', gameId) : null, [firestore, gameId]);
  const { data: gameData } = useDoc(gameRef);
  
  const playersRef = useMemoFirebase(() => firestore && gameId ? collection(firestore, 'games', gameId, 'players') : null, [firestore, gameId]);
  const { data: playersData } = useCollection<Player>(playersRef);
  
  // States derived from URL or props
  const searchParams = useSearchParams();
  const gameName = searchParams.get('gameName') || 'MINOPOLIS';
  
  // Local game logic states
  const [players, setPlayers] = useState<Player[]>([]);
  const [hasRolled, setHasRolled] = useState(false);
  const [doublesCount, setDoublesCount] = useState(0);

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
  
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const isHost = gameData?.hostId === user?.uid;
  const currentPlayer = useMemo(() => {
    if (!gameData?.currentPlayerId || !players) return undefined;
    return players.find(p => p.id === gameData.currentPlayerId);
  }, [gameData?.currentPlayerId, players]);
  
  const shuffle = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };
  
  const handleStartGame = async () => {
    if (!firestore || !gameId || !isHost || !playersData || playersData.length < 2) return;

    try {
      await updateDoc(doc(firestore, 'games', gameId), { status: 'rolling-to-start' });
      addLog("O anfitrião iniciou o jogo! Role os dados para determinar a ordem.");
    } catch (error) {
      console.error("Error starting game: ", error);
    }
  };
  
  // Sync players state from Firestore
  useEffect(() => {
    if (playersData) {
      if (gameData?.playerOrder) {
          const sorted = [...playersData].sort((a, b) => {
              const indexA = gameData.playerOrder.indexOf(a.id);
              const indexB = gameData.playerOrder.indexOf(b.id);
              if (indexA === -1) return 1;
              if (indexB === -1) return -1;
              return indexA - indexB;
          });
          setPlayers(sorted);
      } else {
          setPlayers(playersData);
      }
    }
  }, [playersData, gameData?.playerOrder]);


  const JAIL_POSITION = useMemo(() => boardSpaces.findIndex(s => s.type === 'jail'), []);

  const addNotification = useCallback((message: string, variant: 'default' | 'destructive' = 'default') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev.slice(-4), { id, message, variant }]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const addLog = useCallback((message: string) => {
    setGameLog(prev => [{ message, timestamp: new Date() }, ...prev]);
  }, []);
  
  const updatePlayerInFirestore = useCallback(async (playerId: string, updates: Partial<Player>) => {
    if (!firestore || !gameId) return;
    const playerDocRef = doc(firestore, `games/${gameId}/players`, playerId);
    await updateDoc(playerDocRef, updates);
  }, [firestore, gameId]);
  
  const updateGameInFirestore = useCallback(async (updates: Partial<Game>) => {
     if (!firestore || !gameId) return;
     const gameDocRef = doc(firestore, `games/${gameId}`);
     await updateDoc(gameDocRef, updates);
  }, [firestore, gameId]);

  const handleBankruptcy = useCallback(async (bankruptPlayerId: string, creditorId?: string) => {
    if (!firestore || !gameId) return;
    const bankruptPlayer = players.find(p => p.id === bankruptPlayerId);
    if (!bankruptPlayer) return;

    addLog(`${bankruptPlayer.name} foi à falência!`);
    addNotification(`${bankruptPlayer.name} foi removido do jogo.`, 'destructive');

    if (creditorId) {
      const creditor = players.find(p => p.id === creditorId);
      if(creditor) {
          addLog(`${creditor.name} recebe todos os ativos de ${bankruptPlayer.name}.`);
          updatePlayerInFirestore(creditor.id, {
            money: creditor.money + bankruptPlayer.money,
            properties: [...creditor.properties, ...bankruptPlayer.properties],
          });
      }
    }
    // TODO: Return properties to the bank if no creditor
    
    await deleteDoc(doc(firestore, `games/${gameId}/players`, bankruptPlayerId));
    
    // If the bankrupt player was the current player, end their turn
    if(gameData?.currentPlayerId === bankruptPlayerId) {
        const remainingPlayers = players.filter(p => p.id !== bankruptPlayerId);
        const currentPlayerIndex = remainingPlayers.findIndex(p => p.id === gameData.currentPlayerId);
        const nextPlayerIndex = (currentPlayerIndex + 1) % remainingPlayers.length;
        const nextPlayerId = remainingPlayers[nextPlayerIndex]?.id;
        if(nextPlayerId) updateGameInFirestore({ currentPlayerId: nextPlayerId });
    }


  }, [players, addLog, addNotification, firestore, gameId, updatePlayerInFirestore, gameData, updateGameInFirestore]);


  const makePayment = useCallback(async (payerId: string, receiverId: string | null, amount: number) => {
      const payer = players.find(p => p.id === payerId);
      if (!payer) return false;

      if (payer.money < amount) {
          await handleBankruptcy(payerId, receiverId || undefined);
          return false;
      }
      
      const batch = writeBatch(firestore!);
      const payerRef = doc(firestore!, 'games', gameId, 'players', payerId);
      batch.update(payerRef, { money: payer.money - amount });

      if (receiverId) {
          const receiver = players.find(p => p.id === receiverId);
          if (receiver) {
            const receiverRef = doc(firestore!, 'games', gameId, 'players', receiverId);
            batch.update(receiverRef, { money: receiver.money + amount });
          }
      }
      await batch.commit();
      return true;

  }, [players, handleBankruptcy, firestore, gameId]);
  
  const handleEndTurn = useCallback(() => {
    if (!gameData || !firestore || !gameId || !gameData.playerOrder || gameData.playerOrder.length === 0) return;
    
    setDoublesCount(0);
    const livePlayers = players.filter(p => gameData.playerOrder?.includes(p.id));
    if (livePlayers.length <= 1) {
        updateGameInFirestore({ status: 'finished' });
        return;
    }

    const currentPlayerIndex = livePlayers.findIndex(p => p.id === gameData.currentPlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % livePlayers.length;
    const nextPlayer = livePlayers[nextPlayerIndex];

    if(nextPlayer) {
       addLog(`É a vez de ${nextPlayer.name}.`);
       updateGameInFirestore({ currentPlayerId: nextPlayer.id, lastRoll: null });
    }
    setHasRolled(false);
  }, [players, gameData, firestore, gameId, addLog, updateGameInFirestore]);

  const goToJail = useCallback((playerId: string) => {
    const playerToGo = players.find(p => p.id === playerId);
    if (!playerToGo) return;

    addLog(`${playerToGo.name} foi para a prisão.`);
    if (playerToGo.id === user?.uid) {
      addNotification('Você foi para a prisão!', 'destructive');
    }
    updatePlayerInFirestore(playerId, { position: JAIL_POSITION, inJail: true });
    setDoublesCount(0); // Reset doubles count when jailed
    handleEndTurn();
  }, [JAIL_POSITION, addNotification, addLog, handleEndTurn, user, players, updatePlayerInFirestore]);

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

  const handleLandedOnSpace = useCallback(async (spaceIndex: number, fromCard = false) => {
    const space = boardSpaces[spaceIndex];
    if (!space || !currentPlayer) return;

    addLog(`${currentPlayer.name} parou em ${space.name}.`);

    if (space.type === 'jail' && !currentPlayer.inJail) {
        addNotification("Você está apenas visitando a prisão.");
        return;
    }

    const isProperty = 'price' in space;
    if(isProperty) {
        const property = space as Property;
        const owner = players.find(p => p.properties.includes(property.id));
        
        if (owner && owner.id !== currentPlayer.id) {
            if (owner.mortgagedProperties.includes(property.id)) {
                 addNotification(`${owner.name} hipotecou ${property.name}, sem aluguel.`);
                 addLog(`${currentPlayer.name} não pagou aluguel por ${property.name} (hipotecada).`);
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
                 if (await makePayment(currentPlayer.id, owner.id, rentAmount)) {
                    addNotification(`${currentPlayer.name} pagou R$${rentAmount} a ${owner.name}.`, 'destructive');
                    addLog(`${currentPlayer.name} pagou R$${rentAmount} de aluguel a ${owner.name} por ${property.name}.`);
                }
            }
            return;

        } else if (!owner) {
             if (currentPlayer.userId === user?.uid) {
                setSelectedSpace(space);
             }
             return;
        } else {
            return;
        }
    } else if (space.type === 'chance' || space.type === 'community-chest') {
        setAnimateCardPile(space.type);
        setTimeout(() => {
            let card: GameCard;
            if (space.type === 'chance') {
                const [first, ...rest] = chanceDeck.length > 0 ? chanceDeck : shuffle(chanceCards);
                card = first;
                setChanceDeck(rest.length > 0 ? rest : shuffle(chanceCards));
            } else {
                const [first, ...rest] = communityChestDeck.length > 0 ? communityChestDeck : shuffle(communityChestCards);
                card = first;
                setCommunityChestDeck(rest.length > 0 ? rest : shuffle(communityChestCards));
            }

            addLog(`${currentPlayer.name} tirou uma carta de ${space.type === 'chance' ? 'Sorte' : 'Baú Comunitário'}: "${card.description}"`);
            setDrawnCard(card);
            setAnimateCardPile(null);
        }, 500);
        return;

    } else if (space.type === 'income-tax') {
        const taxAmount = Math.floor(currentPlayer.money * 0.1);
        if (await makePayment(currentPlayer.id, null, taxAmount)) {
            addNotification(`${currentPlayer.name} pagou R$${taxAmount} de Imposto de Renda.`, 'destructive');
            addLog(`${currentPlayer.name} pagou R$${taxAmount} de Imposto de Renda.`);
        }
    } else if (space.type === 'luxury-tax') {
        if(await makePayment(currentPlayer.id, null, 100)) {
            addNotification(`${currentPlayer.name} pagou R$100 de Taxa das Blusinhas.`, 'destructive');
            addLog(`${currentPlayer.name} pagou R$100 de Taxa das Blusinhas.`);
        }
    } else if (space.type === 'go-to-jail') {
        goToJail(currentPlayer.id);
    }
  }, [currentPlayer, players, addNotification, goToJail, chanceDeck, communityChestDeck, lastDiceRoll, addLog, makePayment, user?.uid, shuffle]);
  
  const applyCardAction = useCallback(async (card: GameCard) => {
    if (!currentPlayer) return;
  
    const { action } = card;
    let updates: Partial<Player> = {};
  
    switch (action.type) {
      case 'money':
        const amount = action.amount || 0;
        if (amount < 0) {
          await makePayment(currentPlayer.id, null, Math.abs(amount));
        } else {
          updates.money = currentPlayer.money + amount;
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
            if (action.collectGo && newPosition < currentPlayer.position) {
                updates.money = (updates.money || currentPlayer.money) + 200;
                addLog(`${currentPlayer.name} coletou R$200 por passar pelo Início.`);
            }
            updates.position = newPosition;
            // The update to Firestore will trigger a re-render, and an effect will call handleLandedOnSpace
            // We need to store the new position to handle it in an effect.
        }
        break;
      case 'go_to_jail':
        goToJail(currentPlayer.id);
        break;
      case 'get_out_of_jail':
        updates.getOutOfJailFreeCards = currentPlayer.getOutOfJailFreeCards + 1;
        break;
      case 'repairs':
           const houseCount = Object.values(currentPlayer.houses).reduce((sum, count) => sum + (count < 5 ? count : 0), 0);
           const hotelCount = Object.values(currentPlayer.houses).reduce((sum, count) => sum + (count === 5 ? 1 : 0), 0);
           const repairCost = (action.perHouse! * houseCount) + (action.perHotel! * hotelCount);
           if (await makePayment(currentPlayer.id, null, repairCost)) {
              addLog(`${currentPlayer.name} pagou R$${repairCost} em reparos.`);
           }
          break;
      default:
        break;
    }

    if (Object.keys(updates).length > 0) {
        await updatePlayerInFirestore(currentPlayer.id, updates);
    }
    
    // Handle landing on the new space *after* the state has been updated
    if (updates.position !== undefined) {
      handleLandedOnSpace(updates.position, true);
    }
  }, [currentPlayer, handleLandedOnSpace, addLog, makePayment, goToJail, updatePlayerInFirestore]);

  useEffect(() => {
    if (!cardToExecute || !currentPlayer) return;
  
    applyCardAction(cardToExecute);
  
    const { action } = cardToExecute;
    let notification: { message: string, variant?: 'destructive'} | null = null;
     switch (action.type) {
        case 'money':
            notification = {
                message: `${currentPlayer.name} ${action.amount! > 0 ? 'recebeu' : 'pagou'} R$${Math.abs(action.amount!)}`,
                variant: action.amount! < 0 ? 'destructive' : undefined,
            };
          break;
        case 'go_to_jail':
            notification = { message: `${currentPlayer.name} foi para a prisão!`, variant: "destructive" };
            break;
        case 'get_out_of_jail':
            notification = { message: `${currentPlayer.name} recebeu uma carta para sair da prisão!` };
            break;
     }

    if (notification) {
      setTimeout(() => addNotification(notification!.message, notification!.variant), 100);
    }
    
    setCardToExecute(null);
  }, [cardToExecute, applyCardAction, addNotification, currentPlayer]);


 const handleDiceRoll = async (dice1: number, dice2: number) => {
    if (!currentPlayer || !firestore || !gameId) return;

    addLog(`${currentPlayer.name} rolou ${dice1} e ${dice2}.`);
    setLastDiceRoll([dice1, dice2]);
    const isDoubles = dice1 === dice2;

    if (currentPlayer.inJail) {
        if (isDoubles) {
            await updatePlayerInFirestore(currentPlayer.id, { inJail: false });
            addNotification("Você rolou dados duplos e saiu da prisão!");
            addLog(`${currentPlayer.name} saiu da prisão rolando dados duplos.`);
            setHasRolled(true); // Still your turn
        } else {
            addNotification("Você não rolou dados duplos. Tente na próxima rodada.");
            handleEndTurn();
        }
        return;
    }

    let currentDoublesCount = doublesCount;
    if (isDoubles) {
        currentDoublesCount = doublesCount + 1;
        setDoublesCount(currentDoublesCount);
        if (currentDoublesCount === 3) {
            addNotification("Você tirou 3 duplos seguidos e foi para a prisão!", "destructive");
            addLog(`${currentPlayer.name} foi para a prisão por tirar 3 duplos seguidos.`);
            goToJail(currentPlayer.id);
            return;
        }
    } else {
        setDoublesCount(0);
    }

    setHasRolled(true);

    addNotification(`Você rolou ${dice1 + dice2}.`);
    if (isDoubles) {
        addNotification("Dados duplos! Você joga de novo.");
    }
    
    const total = dice1 + dice2;
    const currentPosition = currentPlayer.position;
    const newPosition = (currentPosition + total) % 40;
    
    const playerUpdate: Partial<Player> = { position: newPosition };

    if (newPosition < currentPosition && !fromCard) {
        playerUpdate.money = currentPlayer.money + 200;
        setTimeout(() => {
            addNotification(`Você coletou R$200.`);
        }, 100);
        addLog(`${currentPlayer.name} passou pelo início e coletou R$200.`);
    }

    await updatePlayerInFirestore(currentPlayer.id, playerUpdate);

    // After state updates, handle landing logic
    await handleLandedOnSpace(newPosition);

    if (!isDoubles) {
        // This is now handled by the End Turn button, unless it's automatic
    } else {
        setHasRolled(false); // Allow re-roll
    }
};

  const handleBuyProperty = async (property: Property) => {
    if (!currentPlayer) return;

    if (currentPlayer.money >= property.price) {
      await updatePlayerInFirestore(currentPlayer.id, {
        money: currentPlayer.money - property.price,
        properties: [...currentPlayer.properties, property.id],
      });
      addNotification(`Você comprou ${property.name}.`);
      addLog(`${currentPlayer.name} comprou ${property.name} por R$${property.price}.`);
      setSelectedSpace(null);
    } else {
        addNotification(`Você não tem dinheiro para comprar ${property.name}.`, 'destructive');
    }
  };
  
  const handlePassOnBuy = (property: Property) => {
    setSelectedSpace(null);
    startAuction(property);
  }

  const handlePayBail = async () => {
    if (!currentPlayer || !currentPlayer.inJail) return;

    if (await makePayment(currentPlayer.id, null, 50)) {
        await updatePlayerInFirestore(currentPlayer.id, { inJail: false });
        addNotification("Você pagou a fiança e está livre!");
        addLog(`${currentPlayer.name} pagou R$50 de fiança e saiu da prisão.`);
        setHasRolled(true); // You can now roll or end turn
    }
  }

  const closeCardDialog = () => {
      if (drawnCard) {
          setCardToExecute(drawnCard);
          setDrawnCard(null);
      }
  }

  const handleSpaceClick = (space: any, index: number) => {
    if ('price' in space) {
        setSelectedSpace(space);
    }
  };
  
  useEffect(() => {
    if (players.length > 0 && players.length < 2 && gameData?.status === 'active') {
        updateGameInFirestore({ status: 'finished' });
    }
  }, [players, gameData?.status, updateGameInFirestore]);

 const handleBuild = async (propertyId: string, amount: number) => {
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property || !property.houseCost || !currentPlayer) return;
    
    const propertiesInGroup = boardSpaces.filter(p => 'color' in p && p.color === property.color);
    const ownedPropertiesInGroup = propertiesInGroup.filter(p => 'id' in p && currentPlayer.properties.includes(p.id));

    if (ownedPropertiesInGroup.length !== propertiesInGroup.length) {
      addNotification(`Você precisa possuir todas as propriedades da cor para construir.`, "destructive");
      return;
    }

    const cost = property.houseCost * amount;
    if (currentPlayer.money < cost) {
      addNotification("Você não tem dinheiro para construir.", "destructive");
      return;
    }
  
    const currentHouses = currentPlayer.houses[propertyId] || 0;
    if (currentHouses + amount > 5) {
       addNotification('Você já construiu um hotel nesta propriedade.', 'destructive');
      return;
    }
    const newHouses = currentHouses + amount;
    
    await updatePlayerInFirestore(currentPlayer.id, {
        money: currentPlayer.money - cost,
        houses: { ...currentPlayer.houses, [propertyId]: newHouses }
    });

    const logMessage = `Você construiu ${amount > 0 ? 'uma casa' : 'um hotel'} em ${property.name}.`;
    addLog(logMessage);
    addNotification(`Você construiu ${amount} casa(s) em ${property.name}.`);
  };

  const handleSell = async (propertyId: string, amount: number) => {
    if (!currentPlayer) return;
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property || !property.houseCost) return;

    const currentHouses = currentPlayer.houses[propertyId] || 0;
    if (currentHouses < amount) {
        addNotification('Você não tem construções suficientes para vender.', 'destructive');
        return;
    }

    const saleValue = (property.houseCost / 2) * amount;
    const newHouses = currentHouses - amount;
    const newHousesState = { ...currentPlayer.houses };
    if (newHouses === 0) {
      delete newHousesState[propertyId];
    } else {
      newHousesState[propertyId] = newHouses;
    }

    await updatePlayerInFirestore(currentPlayer.id, {
        money: currentPlayer.money + saleValue,
        houses: newHousesState,
    });

    addLog(`${currentPlayer.name} vendeu ${amount} casa(s) em ${property.name} por R$${saleValue}.`);
    addNotification(`Você vendeu ${amount} casa(s) em ${property.name} por R$${saleValue}.`);
  };

  const handleMortgage = async (propertyId: string) => {
    if (!currentPlayer) return;
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property) return;
    
    const mortgageValue = property.price / 2;
    await updatePlayerInFirestore(currentPlayer.id, {
        money: currentPlayer.money + mortgageValue,
        mortgagedProperties: [...currentPlayer.mortgagedProperties, propertyId]
    });

    addLog(`${currentPlayer.name} hipotecou ${property.name} por R$${mortgageValue}.`);
    addNotification(`Você hipotecou ${property.name} e recebeu R$${mortgageValue}.`);
  };

  const handleUnmortgage = async (propertyId: string) => {
    if (!currentPlayer) return;
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property) return;

    const unmortgageCost = (property.price / 2) * 1.1; // 10% interest
    if (currentPlayer.money < unmortgageCost) {
        addNotification(`Você precisa de R$${unmortgageCost.toFixed(2)} para pagar a hipoteca.`, "destructive");
        return;
    }

    await updatePlayerInFirestore(currentPlayer.id, {
        money: currentPlayer.money - unmortgageCost,
        mortgagedProperties: currentPlayer.mortgagedProperties.filter(id => id !== propertyId)
    });
     addLog(`${currentPlayer.name} pagou a hipoteca de ${property.name}.`);
     addNotification(`Você pagou a hipoteca de ${property.name}.`);
  };

  const handleProposeTrade = (offer: TradeOffer) => {
    const fromPlayer = players.find(p => p.id === offer.fromId);
    const toPlayer = players.find(p => p.id === offer.toId);
    if (!fromPlayer || !toPlayer) return;

    addNotification(`Proposta de troca enviada para ${toPlayer.name}.`);
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

  const endAuction = useCallback(async () => {
    if (!auctionState) return;

    if (auctionState.highestBidderId) {
        const winner = players.find(p => p.id === auctionState.highestBidderId);
        if (winner) {
            addLog(`${winner.name} venceu o leilão de ${auctionState.property.name} por R$${auctionState.currentBid}!`);
            addNotification(`${winner.name} arrematou ${auctionState.property.name}!`);
            await updatePlayerInFirestore(winner.id, {
                money: winner.money - auctionState.currentBid,
                properties: [...winner.properties, auctionState.property.id],
            });
        }
    } else {
        addLog(`Ninguém deu lance por ${auctionState.property.name}. A propriedade continua do banco.`);
        addNotification("A propriedade não foi arrematada.");
    }
    setAuctionState(null);
  }, [auctionState, players, addLog, addNotification, updatePlayerInFirestore]);
  
  useEffect(() => {
    if (!auctionState) return;

    if (auctionState.playersInAuction.length <= 1) {
        endAuction();
    }
  }, [auctionState, endAuction]);


  const handleRollToStart = async (playerId: string, roll: number) => {
    if (!firestore || !gameId) return;
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    
    const rollRef = doc(firestore, `games/${gameId}/rolls-to-start`, playerId);
    await setDoc(rollRef, { roll, playerName: player.name });
    addLog(`${player.name} rolou ${roll} para começar.`);
  }
  
  const rollsToStartRef = useMemoFirebase(() => firestore && gameId ? collection(firestore, `games/${gameId}/rolls-to-start`) : null, [firestore, gameId]);
  const { data: rollsToStartData } = useCollection(rollsToStartRef);

  useEffect(() => {
    if (!isHost || !firestore || !gameId || gameData?.status !== 'rolling-to-start') return;

    if (players.length > 0 && rollsToStartData && rollsToStartData.length === players.length) {
      
      const decideOrder = async () => {
        const uniqueRolls = new Set(rollsToStartData.map(r => r.roll));
        if (uniqueRolls.size < rollsToStartData.length) {
          addLog("Houve um empate! Rolando novamente para os jogadores empatados.");
          // TODO: Logic to handle re-rolls for tied players
          return;
        }

        const sortedPlayers = [...players].sort((a, b) => {
          const rollA = rollsToStartData.find(r => r.id === a.id)?.roll || 0;
          const rollB = rollsToStartData.find(r => r.id === b.id)?.roll || 0;
          return rollB - rollA;
        });

        const playerOrder = sortedPlayers.map(p => p.id);
        const gameDocRef = doc(firestore, 'games', gameId);

        await updateDoc(gameDocRef, {
            status: 'active',
            playerOrder: playerOrder,
            currentPlayerId: playerOrder[0],
        });

        if (sortedPlayers.length > 0 && sortedPlayers[0]) {
            addLog(`A ordem do jogo foi definida. ${sortedPlayers[0].name} começa!`);
            addNotification(`A ordem foi definida. ${sortedPlayers[0].name} começa!`);
        }
      };

      const timer = setTimeout(decideOrder, 2000);
      return () => clearTimeout(timer);
    }
  }, [rollsToStartData, players, gameData?.status, isHost, firestore, gameId, addLog, addNotification]);


  if (players.length === 0 || !gameData) {
    return (
        <div className="container flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center text-center py-12">
            <h2 className="text-2xl font-bold">Carregando Jogo...</h2>
            <p className="text-muted-foreground">ID do Jogo: <code className="bg-muted p-1 rounded-md">{gameId}</code></p>
        </div>
    )
  }
  
  if (gameData?.status === 'waiting') {
    return (
        <div className="container flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center text-center py-12">
            <h2 className="text-2xl font-bold">Aguardando jogadores...</h2>
            <p className="text-muted-foreground">O jogo '{gameName}' começará em breve.</p>
            <p className="mt-4">ID do Jogo: <code className="bg-muted p-1 rounded-md">{gameId}</code></p>
            <div className='mt-8'>
                <h3 className="font-semibold mb-2">Jogadores na Sala:</h3>
                <ul className="space-y-2">
                    {players.map(p => <li key={p.id}>{p.name}</li>)}
                </ul>
            </div>
            {isHost && (
                <Button onClick={handleStartGame} disabled={players.length < 2 || !isHost} className="mt-8">
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar Jogo ({players.length} jogador(es))
                </Button>
            )}
            {!isHost && <p className="mt-8 text-sm text-muted-foreground">Aguardando o anfitrião iniciar o jogo.</p>}
        </div>
    );
  }

  const humanPlayer = players.find(p => p.userId === user?.uid) || players[0];
  const owner = selectedSpace ? players.find(p => 'id' in selectedSpace && p.properties.includes(selectedSpace.id)) : null;
  const isMyTurn = currentPlayer && currentPlayer.userId === user?.uid;
  const gameOverPlayer = gameData?.status === 'finished' ? players[0] : null;

  return (
    <>
      <div className="p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <GameBoard 
            players={players} 
            onSpaceClick={handleSpaceClick} 
            animateCardPile={animateCardPile} 
            notifications={notifications}
          >
            <GameActions 
                onDiceRoll={handleDiceRoll} 
                isPlayerInJail={currentPlayer?.inJail ?? false}
                onPayBail={handlePayBail}
                canPayBail={currentPlayer?.money >= 50}
                onManageProperties={() => setManageOpen(true)}
                onTrade={() => setTradeOpen(true)}
                playerHasProperties={humanPlayer?.properties.length > 0}
                isTurnActive={isMyTurn && gameData?.status === 'active'}
                hasRolled={hasRolled}
                onEndTurn={handleEndTurn}
             />
          </GameBoard>
        </div>
        <aside className="lg:col-span-1 space-y-8">
          <MultiplayerPanel
            player={humanPlayer}
            allPlayers={players}
            currentPlayerId={currentPlayer ? currentPlayer.id : ''}
            gameLog={gameLog}
            onBuild={handleBuild}
            onSell={handleSell}
            onMortgage={handleMortgage}
            onUnmortgage={handleUnmortgage}
          />
        </aside>
      </div>

      <AnimatePresence>
        {gameOverPlayer && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
            >
                <Dialog open={!!gameOverPlayer} onOpenChange={() => {}}>
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
                                Parabéns, <span className="font-bold text-primary">{gameOverPlayer.name}</span>! Você é o grande vencedor!
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-6 flex-col sm:flex-col gap-2">
                            <Button size="lg" asChild>
                                <Link href="/multiplayer-lobby">Novo Jogo</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/">Voltar ao Início</Link>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        )}
      </AnimatePresence>
      
      <RollToStartDialog 
        isOpen={gameData?.status === 'rolling-to-start'}
        players={players}
        rolls={rollsToStartData?.reduce((acc, roll) => ({...acc, [roll.id]: roll.roll}), {}) || {}}
        onRoll={handleRollToStart}
        localPlayerId={user?.uid}
      />

      <Dialog open={!!selectedSpace} onOpenChange={(open) => {
          if (!open) {
              if (selectedSpace && !owner && currentPlayer?.userId === user?.uid) {
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
                    player={currentPlayer!}
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
        otherPlayers={players.filter(p => p.userId !== humanPlayer.userId)}
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
