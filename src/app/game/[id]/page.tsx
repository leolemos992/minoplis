'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { boardSpaces, chanceCards, communityChestCards } from '@/lib/game-data';
import Link from 'next/link';
import { Home, Zap, HelpCircle, Box, CircleDollarSign, Bus, Crown, Landmark, Briefcase, Hotel, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Player, Property, GameCard, Notification, Game } from '@/lib/definitions';
import { Logo } from '@/components/logo';
import { PlayerToken } from '@/components/game/player-token';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/game/property-card';
import { ManagePropertiesDialog } from '@/components/game/manage-properties-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { GameNotifications } from '@/components/game/game-notifications';
import { useDoc, useCollection, useUser, useFirestore, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { doc, collection, updateDoc, writeBatch, runTransaction, arrayRemove, increment } from 'firebase/firestore';
import { PlayerSidebar } from '@/components/game/player-sidebar';
import { GameHeader } from '@/components/game/game-header';


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
        case 'utility': return <Zap className={size} />;
        default: return null;
    }
}

const BoardSpace = ({ space, index, children, onSpaceClick, houses, isMortgaged, allPlayers }: { space: any, index: number, children?: React.ReactNode, onSpaceClick: (space: any, index: number) => void, houses?: number, isMortgaged?: boolean, allPlayers: Player[] }) => {
    const isProperty = 'price' in space;
    
    const textRotation: { [key: number]: string } = {
        ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 11, '-rotate-90'])),
        ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 31, 'rotate-90'])),
    }

    const cornerTextRotation: { [key: number]: string } = {
        0: 'rotate-[135deg]', 10: 'rotate-[225deg]', 20: 'rotate-[-45deg]', 30: 'rotate-[45deg]',
    }

    const houseContainerClasses: { [key: number]: string } = {
       ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, 'top-0 h-5 w-full flex-row'])),
       ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 11, 'right-0 w-5 h-full flex-col'])),
       ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 21, 'bottom-0 h-5 w-full flex-row-reverse'])),
       ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 31, 'left-0 w-5 h-full flex-col-reverse'])),
    }

    const HouseDisplay = ({ count }: { count: number}) => {
        if (count === 0) return null;
        if (count === 5) return <Hotel className="w-4 h-4 text-red-600 bg-white/80 rounded-sm p-0.5" />;
        return (
            <div className="flex gap-px">
                {Array.from({ length: count }).map((_, i) => <Home key={i} className="w-3 h-3 text-green-600 bg-white/80 rounded-sm p-0.5" />)}
            </div>
        )
    };

    const playersOnSpace = allPlayers.filter(p => p.position === index);

    // Corners
    if ([0, 10, 20, 30].includes(index)) {
        return (
            <div className="border border-black flex items-center justify-center text-center text-xs p-1 relative z-10 cursor-pointer bg-slate-50" style={{ gridArea: `space-${index}` }} onClick={() => onSpaceClick(space, index)}>
                 <div className={cn("flex flex-col items-center justify-center h-full w-full", cornerTextRotation[index] )}>
                    <div className="transform-gpu">{getIcon(space, "w-10 h-10")}</div>
                    <span className="font-bold block w-20">{space.name}</span>
                </div>
                 <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 items-center justify-center gap-0 p-1 pointer-events-none">{playersOnSpace.map(p => <PlayerToken key={p.id} player={p} size={6} />)}</div>
            </div>
        )
    }

    return (
         <div style={{ gridArea: `space-${index}`}} className="border border-black flex items-center justify-center text-center text-xs p-1 relative cursor-pointer hover:bg-yellow-200/50 transition-colors bg-slate-50" onClick={() => onSpaceClick(space, index)}>
             {isProperty && (space.type === 'property' || space.type === 'railroad' || space.type === 'utility') && (
                 <div className={cn(
                    "absolute",
                    index > 0 && index < 10 && "top-0 h-5 w-full",
                    index > 10 && index < 20 && "right-0 w-5 h-full",
                    index > 20 && index < 30 && "bottom-0 h-5 w-full",
                    index > 30 && index < 40 && "left-0 w-5 h-full",
                    colorClasses[isMortgaged ? 'mortgaged' : (space as Property).color]
                )} />
            )}
             {houses !== undefined && houses > 0 && (
                <div className={cn("absolute z-10 flex items-center justify-center p-px", houseContainerClasses[index])}>
                    <HouseDisplay count={houses} />
                </div>
            )}
            <div className={cn("relative flex-1 flex flex-col justify-center items-center text-center p-1 text-[9px] h-full w-full", textRotation[index], isMortgaged && 'opacity-50')}>
                 {getIcon(space, "w-6 h-6")}
                <span className="font-bold px-1 leading-tight">{space.name}</span>
                {(isProperty || ['income-tax', 'luxury-tax'].includes(space.type)) && 
                    <span className="font-normal mt-1">R$ {space.price || (space.type === 'luxury-tax' ? 100 : '')}</span>}
            </div>
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 items-center justify-center gap-0 p-1 pointer-events-none">{playersOnSpace.map(p => <PlayerToken key={p.id} player={p} size={6}/>)}</div>
         </div>
    )
};

const GameBoard = ({ allPlayers, onSpaceClick, animateCardPile, notifications }: { allPlayers: Player[]; onSpaceClick: (space: any, index: number) => void; animateCardPile: 'chance' | 'community-chest' | null; notifications: Notification[]; }) => {
    const gridTemplateAreas = `
        "space-20 space-21 space-22 space-23 space-24 space-25 space-26 space-27 space-28 space-29 space-30"
        "space-19 center center center center center center center center center space-31"
        "space-18 center center center center center center center center center space-32"
        "space-17 center center center center center center center center center space-33"
        "space-16 center center center center center center center center center space-34"
        "space-15 center center center center center center center center center space-35"
        "space-14 center center center center center center center center center space-36"
        "space-13 center center center center center center center center center space-37"
        "space-12 center center center center center center center center center space-38"
        "space-11 center center center center center center center center center space-39"
        "space-10 space-9 space-8 space-7 space-6 space-5 space-4 space-3 space-2 space-1 space-0"
    `;

    const getPlayerForSpace = (index: number) => allPlayers.find(p => p.position === index);

    return (
        <div className="bg-slate-200/40 p-2 md:p-4 aspect-square max-w-[900px] mx-auto">
            <div 
                className="grid h-full w-full relative"
                style={{ gridTemplateAreas, gridTemplateRows: '1.6fr repeat(9, 1fr) 1.6fr', gridTemplateColumns: '1.6fr repeat(9, 1fr) 1.6fr' }}
            >
                <div className="bg-[#cad0d8] flex flex-col items-center justify-between border-black border-[1.5px] relative p-4 py-8" style={{ gridArea: 'center'}}>
                    <div className="w-full flex justify-center items-start">
                         <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline text-slate-800">
                           MINOPLIS
                         </h1>
                    </div>
                    <div className="flex justify-center items-center gap-2 sm:gap-8 w-full px-4">
                        <motion.div
                            className="w-40 h-24 bg-blue-300 border-2 border-blue-800 rounded-lg flex items-center justify-center -rotate-12 shadow-lg"
                            animate={animateCardPile === 'chance' ? { scale: 1.1, y: -5 } : {}}
                            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                        ><span className="font-bold text-blue-900">Sorte / Revés</span></motion.div>
                         <motion.div
                            className="w-40 h-24 bg-orange-300 border-2 border-orange-800 rounded-lg flex items-center justify-center rotate-12 shadow-lg"
                            animate={animateCardPile === 'community-chest' ? { scale: 1.1, y: -5 } : {}}
                            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                         ><span className="font-bold text-orange-900">Caixinha da Prefeitura</span></motion.div>
                    </div>
                    <div className="w-full max-w-sm px-4">
                        <GameNotifications notifications={notifications} />
                    </div>
                </div>
                {boardSpaces.map((space, index) => {
                    const playerOnSpace = getPlayerForSpace(index);
                    const propertyData = allPlayers.find(p => 'id' in space && p.properties.includes(space.id));
                    const houses = propertyData && 'id' in space ? propertyData.houses[space.id] : undefined;
                    const isMortgaged = propertyData && 'id' in space ? propertyData.mortgagedProperties.includes(space.id) : false;

                    return (
                        <BoardSpace 
                            key={space.name + index} 
                            space={space} 
                            index={index} 
                            onSpaceClick={onSpaceClick} 
                            houses={houses}
                            isMortgaged={isMortgaged}
                            allPlayers={allPlayers}
                        />
                    )
                })}
            </div>
        </div>
    );
};

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const { user } = useUser();
  const firestore = useFirestore();

  const gameRef = useMemoFirebase(() => firestore && gameId ? doc(firestore, 'games', gameId) : null, [firestore, gameId]);
  const { data: gameData } = useDoc<Game>(gameRef);
  
  const playersRef = useMemoFirebase(() => firestore && gameId ? collection(firestore, 'games', gameId, 'players') : null, [firestore, gameId]);
  const { data: allPlayers } = useCollection<Player>(playersRef);
  
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [hasRolled, setHasRolled] = useState(false);
  const [doublesCount, setDoublesCount] = useState(0);
  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [drawnCard, setDrawnCard] = useState<GameCard | null>(null);
  const [cardToExecute, setCardToExecute] = useState<GameCard | null>(null);
  const [isManageOpen, setManageOpen] = useState(false);
  const [animateCardPile, setAnimateCardPile] = useState<'chance' | 'community-chest' | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [chanceDeck, setChanceDeck] = useState<GameCard[]>([]);
  const [communityChestDeck, setCommunityChestDeck] = useState<GameCard[]>([]);

  useEffect(() => {
    // This should only run once when the component mounts
    setChanceDeck([...chanceCards].sort(() => Math.random() - 0.5));
    setCommunityChestDeck([...communityChestCards].sort(() => Math.random() - 0.5));
  }, []);
  
  const currentPlayer = useMemo(() => allPlayers?.find(p => p.id === gameData?.currentPlayerId), [gameData?.currentPlayerId, allPlayers]);
  const loggedInPlayer = useMemo(() => allPlayers?.find(p => p.id === user?.uid), [user?.uid, allPlayers]);
  const isMyTurn = useMemo(() => gameData?.currentPlayerId === user?.uid, [gameData, user]);

  const JAIL_POSITION = useMemo(() => boardSpaces.findIndex(s => s.type === 'jail'), []);

  const addNotification = useCallback((message: string, variant: Notification['variant'] = 'default') => {
    const id = `${Date.now()}-${Math.random()}`;
    setNotifications(prev => [...prev.slice(-4), { id, message, variant }]);
  }, []);
  
  const updatePlayerInFirestore = useCallback((playerId: string, updates: Partial<Player>) => {
    if (!firestore || !gameId) return;
    const playerDocRef = doc(firestore, `games/${gameId}/players`, playerId);
    updateDoc(playerDocRef, updates).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: playerDocRef.path, operation: 'update', requestResourceData: updates,
      }));
    });
  }, [firestore, gameId]);
  
  const updateGameInFirestore = useCallback((updates: Partial<Game>) => {
     if (!firestore || !gameId) return;
     const gameDocRef = doc(firestore, `games/${gameId}`);
     updateDoc(gameDocRef, updates).catch(error => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
         path: gameDocRef.path, operation: 'update', requestResourceData: updates,
       }));
     });
  }, [firestore, gameId]);
  
  const handleEndGame = useCallback(async (winnerId: string) => {
    if (!firestore || !gameId || !gameRef) return;
    
    // Update game status and winner
    updateGameInFirestore({ status: 'finished', winnerId: winnerId });

    // Award XP and update stats
    try {
        await runTransaction(firestore, async (transaction) => {
            for (const p of allPlayers!) {
                const userRef = doc(firestore, 'users', p.userId);
                let xpGained = 10; // Base XP for participation
                let isWinner = p.userId === winnerId;
                if (isWinner) xpGained += 50; // Bonus XP for winning

                transaction.update(userRef, {
                    gamesPlayed: increment(1),
                    wins: increment(isWinner ? 1 : 0),
                    xp: increment(xpGained),
                });
                // Note: Level up logic can be a cloud function triggered by XP update or handled client-side
            }
        });
        addNotification(`${allPlayers?.find(p=>p.id === winnerId)?.name} venceu o jogo!`, 'default');
    } catch (e) {
        console.error("Transaction failed: ", e);
    }
  }, [firestore, gameId, gameRef, allPlayers, updateGameInFirestore, addNotification]);

  const handleBankruptcy = useCallback(async (bankruptPlayerId: string) => {
    if (!firestore || !gameId || !gameRef || !allPlayers) return;

    const bankruptPlayer = allPlayers.find(p => p.id === bankruptPlayerId);
    if (!bankruptPlayer) return;

    addNotification(`${bankruptPlayer.name} foi à falência!`, 'destructive');
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const gameDoc = await transaction.get(gameRef);
            if (!gameDoc.exists()) throw "Game not found!";
            
            const remainingPlayerIds = gameDoc.data().playerOrder.filter((pid: string) => pid !== bankruptPlayer.id);

            if (remainingPlayerIds.length <= 1) {
                 handleEndGame(remainingPlayerIds[0]);
            } else {
                 // If the bankrupt player was the current player, move to the next
                 if(gameDoc.data().currentPlayerId === bankruptPlayer.id) {
                     const currentTurnIndex = gameDoc.data().playerOrder.indexOf(bankruptPlayer.id);
                     const nextTurn = currentTurnIndex % remainingPlayerIds.length;
                     const nextPlayerId = remainingPlayerIds[nextTurn];
                     transaction.update(gameRef, { playerOrder: remainingPlayerIds, currentPlayerId: nextPlayerId, turn: nextTurn });
                 } else {
                     transaction.update(gameRef, { playerOrder: remainingPlayerIds });
                 }
            }
            
            const playerDocRef = doc(firestore, `games/${gameId}/players`, bankruptPlayer.id);
            transaction.delete(playerDocRef);
        });

    } catch (e: any) {
         errorEmitter.emit('permission-error', new FirestorePermissionError({
           path: gameRef.path, operation: 'update', requestResourceData: { status: 'finished' }
         }));
    }

  }, [addNotification, firestore, gameId, gameRef, allPlayers, handleEndGame]);

  const makePayment = useCallback(async (amount: number, fromPlayerId: string, toPlayerId?: string): Promise<boolean> => {
      if (!firestore || !gameId || !allPlayers) return false;
      const payer = allPlayers.find(p => p.id === fromPlayerId);
      if (!payer) return false;

      if (payer.money < amount) {
          addNotification(`${payer.name} não tem R$${amount} para pagar!`, 'destructive');
          await handleBankruptcy(payer.id);
          return false;
      }
      
      const batch = writeBatch(firestore);
      const payerRef = doc(firestore, 'games', gameId, 'players', payer.id);
      batch.update(payerRef, { money: payer.money - amount });
      
      if (toPlayerId) {
          const recipient = allPlayers.find(p => p.id === toPlayerId);
          if (recipient) {
            const recipientRef = doc(firestore, 'games', gameId, 'players', recipient.id);
            batch.update(recipientRef, { money: recipient.money + amount });
            addNotification(`${payer.name} pagou R$${amount} a ${recipient.name}.`, 'default');
          }
      } else {
         addNotification(`${payer.name} pagou R$${amount} ao banco.`, 'destructive');
      }

      return batch.commit().then(() => true).catch((e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: payerRef.path, operation: 'update', requestResourceData: {money: '...'}
        }));
        return false;
      });
  }, [allPlayers, handleBankruptcy, firestore, gameId, addNotification]);
  
  const handleEndTurn = useCallback(() => {
    if (!gameData || !isMyTurn || doublesCount > 0) return; // Can't end turn if you rolled doubles
    setDoublesCount(0);
    setHasRolled(false);
    
    const currentTurnIndex = gameData.playerOrder.indexOf(gameData.currentPlayerId);
    const nextTurn = (currentTurnIndex + 1) % gameData.playerOrder.length;
    const nextPlayerId = gameData.playerOrder[nextTurn];
    
    updateGameInFirestore({ turn: nextTurn, currentPlayerId: nextPlayerId });
    addNotification(`Turno de ${allPlayers?.find(p => p.id === nextPlayerId)?.name}.`);

  }, [gameData, isMyTurn, updateGameInFirestore, addNotification, allPlayers, doublesCount]);

  const goToJail = useCallback((playerId: string) => {
    if (!allPlayers) return;
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return;

    addNotification(`${player.name} foi para a prisão!`, 'destructive');
    updatePlayerInFirestore(playerId, { position: JAIL_POSITION, inJail: true });
    setDoublesCount(0);
    if (player.id === gameData?.currentPlayerId) { // Only current player's turn ends
        setHasRolled(false);
        const currentTurnIndex = gameData.playerOrder.indexOf(gameData.currentPlayerId);
        const nextTurn = (currentTurnIndex + 1) % gameData.playerOrder.length;
        const nextPlayerId = gameData.playerOrder[nextTurn];
        updateGameInFirestore({ turn: nextTurn, currentPlayerId: nextPlayerId });
    }
  }, [JAIL_POSITION, addNotification, allPlayers, updatePlayerInFirestore, gameData]);
  
  const handleLandedOnSpace = useCallback(async (spaceIndex: number, playerId: string) => {
    const space = boardSpaces[spaceIndex];
    const player = allPlayers?.find(p => p.id === playerId);
    if (!space || !player) return;
    addNotification(`${player.name} parou em ${space.name}.`);

    if (space.type === 'jail' && !player.inJail) {
        addNotification("Você está apenas visitando a prisão.");
        return;
    }

    if ('price' in space) { // Is a property
        const owner = allPlayers?.find(p => p.properties.includes(space.id));
        if (owner && owner.id !== player.id) {
            // Pay Rent
            // TODO: Implement full rent logic (sets, railroads, utilities)
            const rentAmount = (space as Property).rent[0]; // Simple rent for now
            await makePayment(rentAmount, player.id, owner.id);
        } else if (!owner && player.id === user?.uid) {
          // If it's my turn and the property is unowned, show buy dialog
          setSelectedSpace(space);
        }
    } else if (space.type === 'chance' || space.type === 'community-chest') {
        setAnimateCardPile(space.type);
        setTimeout(() => {
            const isChance = space.type === 'chance';
            const [deck, setDeck, allCards] = isChance ? [chanceDeck, setChanceDeck, chanceCards] : [communityChestDeck, setCommunityChestDeck, communityChestCards];
            const [first, ...rest] = deck.length > 0 ? deck : [...allCards].sort(() => Math.random() - 0.5);
            setDeck(rest.length > 0 ? rest : [...allCards].sort(() => Math.random() - 0.5));
            setDrawnCard(first);
            setAnimateCardPile(null);
        }, 500);
    } else if (space.type === 'income-tax') {
        const taxAmount = Math.min(200, Math.floor(player.money * 0.1));
        await makePayment(taxAmount, player.id);
    } else if (space.type === 'luxury-tax') {
        await makePayment(100, player.id);
    } else if (space.type === 'go-to-jail') {
        goToJail(player.id);
    }
  }, [allPlayers, addNotification, goToJail, chanceDeck, communityChestDeck, makePayment, user?.uid, setChanceDeck, setCommunityChestDeck]);
  
  const applyCardAction = useCallback(async (card: GameCard) => {
    if (!loggedInPlayer) return;
    const { action } = card;
    let updates: Partial<Player> = {};
  
    switch (action.type) {
      case 'money':
        await makePayment(Math.abs(action.amount), loggedInPlayer.id, action.amount > 0 ? undefined : 'bank');
        break;
      case 'move_to':
        let newPosition = (typeof action.position === 'string') ? boardSpaces.findIndex(s => 'id' in s && s.id === action.position) : action.position;
        if (newPosition !== -1) {
            if (action.collectGo && newPosition < loggedInPlayer.position) updates.money = (updates.money || loggedInPlayer.money) + 200;
            updates.position = newPosition;
        }
        break;
      case 'go_to_jail': goToJail(loggedInPlayer.id); return; // Return to avoid double updates
      case 'get_out_of_jail': updates.getOutOfJailFreeCards = (loggedInPlayer.getOutOfJailFreeCards || 0) + 1; break;
      case 'repairs':
           const houseCost = (Object.values(loggedInPlayer.houses).filter(c => c < 5).reduce((s, c) => s + c, 0)) * action.perHouse!;
           const hotelCost = (Object.values(loggedInPlayer.houses).filter(c => c === 5).length) * action.perHotel!;
           await makePayment(houseCost + hotelCost, loggedInPlayer.id);
           break;
    }
    if (Object.keys(updates).length > 0) updatePlayerInFirestore(loggedInPlayer.id, updates);
    if (updates.position !== undefined) handleLandedOnSpace(updates.position, loggedInPlayer.id);
  }, [loggedInPlayer, handleLandedOnSpace, makePayment, goToJail, updatePlayerInFirestore]);

  useEffect(() => {
    if (!cardToExecute || !isMyTurn) return;
    addNotification(cardToExecute.description, cardToExecute.type === 'chance' ? 'default' : 'default');
    applyCardAction(cardToExecute);
    setCardToExecute(null);
  }, [cardToExecute, applyCardAction, addNotification, isMyTurn]);

  const handleDiceRoll = async (d1: number, d2: number) => {
    if (!loggedInPlayer || !isMyTurn || hasRolled) return;
    setDice([d1, d2]);
    addNotification(`Você rolou ${d1} e ${d2}.`);
    const isDoubles = d1 === d2;

    if (loggedInPlayer.inJail) {
        if (isDoubles) {
            updatePlayerInFirestore(loggedInPlayer.id, { inJail: false });
            addNotification("Você rolou dados duplos e saiu da prisão!");
        } else {
            addNotification("Você não rolou dados duplos. Tente na próxima rodada.");
            handleEndTurn(); // This is correct, turn ends if you fail to roll doubles
        }
        setHasRolled(true); // You've used your roll for the turn
        return;
    }

    const currentDoublesCount = isDoubles ? doublesCount + 1 : 0;
    setDoublesCount(currentDoublesCount);

    if (currentDoublesCount === 3) {
        addNotification("Você tirou 3 duplos seguidos e foi para a prisão!", "destructive");
        goToJail(loggedInPlayer.id);
        return;
    }

    setHasRolled(true);
    
    const total = d1 + d2;
    const newPosition = (loggedInPlayer.position + total) % 40;
    const playerUpdate: Partial<Player> = { position: newPosition };
    if (newPosition < loggedInPlayer.position) {
        playerUpdate.money = loggedInPlayer.money + 200;
        addNotification(`Você passou pelo Início e coletou R$200.`);
    }
    updatePlayerInFirestore(loggedInPlayer.id, playerUpdate);
    
    // Use a timeout to ensure the player piece moves before the next action happens
    setTimeout(() => handleLandedOnSpace(newPosition, loggedInPlayer.id), 500);

    if (isDoubles) {
        addNotification("Dados duplos! Você joga de novo.");
        setHasRolled(false); // Allow another roll
    }
  };

  const handleBuyProperty = (property: Property) => {
    if (!loggedInPlayer || !user?.uid || !firestore || !gameId) return;
    if (loggedInPlayer.money < property.price) {
        addNotification(`Você não tem dinheiro para comprar ${property.name}.`, 'destructive');
        return;
    }
    const batch = writeBatch(firestore);
    const playerRef = doc(firestore, `games/${gameId}/players`, user.uid);
    batch.update(playerRef, {
        money: loggedInPlayer.money - property.price,
        properties: [...loggedInPlayer.properties, property.id],
    });
    batch.commit().catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: playerRef.path, operation: 'update', requestResourceData: {
          money: loggedInPlayer.money - property.price,
          properties: [...loggedInPlayer.properties, property.id],
        },
      }));
    });
    addNotification(`Você comprou ${property.name}.`);
    setSelectedSpace(null);
  };

  const handlePayBail = async () => {
    if (!loggedInPlayer || !loggedInPlayer.inJail) return;
    if (await makePayment(50, loggedInPlayer.id)) {
        updatePlayerInFirestore(loggedInPlayer.id, { inJail: false });
        addNotification("Você pagou a fiança e está livre!");
        setHasRolled(true);
    }
  }

  const handleBuild = (propertyId: string, amount: number) => {
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property || !property.houseCost || !loggedInPlayer) return;

    const cost = property.houseCost * amount;
    if (loggedInPlayer.money < cost) {
      addNotification("Dinheiro insuficiente.", "destructive");
      return;
    }

    const currentHouses = loggedInPlayer.houses[propertyId] || 0;
    if (currentHouses + amount > 5) {
      addNotification('Máximo de 1 hotel por propriedade.', 'destructive');
      return;
    }

    // Balanced building rule
    const colorGroup = boardSpaces.filter(s => s.type === 'property' && 'color' in s && s.color === property.color) as Property[];
    for (const propInGroup of colorGroup) {
      if (propInGroup.id !== propertyId) {
        const otherHouses = loggedInPlayer.houses[propInGroup.id] || 0;
        if (currentHouses >= otherHouses) {
          addNotification('Deve construir uniformemente. Outras propriedades neste grupo têm menos casas.', 'destructive');
          return;
        }
      }
    }

    updatePlayerInFirestore(loggedInPlayer.id, {
      money: loggedInPlayer.money - cost,
      houses: { ...loggedInPlayer.houses, [propertyId]: currentHouses + amount }
    });
    addNotification(`Você construiu em ${property.name}.`);
  };

  const handleSell = (propertyId: string, amount: number) => {
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property || !property.houseCost || !loggedInPlayer) return;

    const currentHouses = loggedInPlayer.houses[propertyId] || 0;
    if (currentHouses < amount) {
      addNotification('Não há construções suficientes para vender.', 'destructive');
      return;
    }

    // Balanced selling rule
    const colorGroup = boardSpaces.filter(s => s.type === 'property' && 'color' in s && s.color === property.color) as Property[];
    for (const propInGroup of colorGroup) {
      if (propInGroup.id !== propertyId) {
        const otherHouses = loggedInPlayer.houses[propInGroup.id] || 0;
        if (currentHouses <= otherHouses) {
          addNotification('Deve vender uniformemente. Outras propriedades neste grupo têm mais casas.', 'destructive');
          return;
        }
      }
    }

    const saleValue = (property.houseCost / 2) * amount;
    const newHousesState = { ...loggedInPlayer.houses };
    if (currentHouses - amount === 0) {
      delete newHousesState[propertyId];
    } else {
      newHousesState[propertyId] = currentHouses - amount;
    }

    updatePlayerInFirestore(loggedInPlayer.id, { money: loggedInPlayer.money + saleValue, houses: newHousesState });
    addNotification(`Você vendeu construções em ${property.name}.`);
  };

  const handleMortgage = (propertyId: string, isMortgaging: boolean) => {
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property || !loggedInPlayer) return;
    
    if (isMortgaging) {
        const mortgageValue = property.price / 2;
        updatePlayerInFirestore(loggedInPlayer.id, {
            money: loggedInPlayer.money + mortgageValue,
            mortgagedProperties: [...loggedInPlayer.mortgagedProperties, propertyId]
        });
        addNotification(`Você hipotecou ${property.name}.`);
    } else {
        const unmortgageCost = (property.price / 2) * 1.1;
        if (loggedInPlayer.money < unmortgageCost) { addNotification(`Dinheiro insuficiente para pagar a hipoteca.`, "destructive"); return; }
        updatePlayerInFirestore(loggedInPlayer.id, {
            money: loggedInPlayer.money - unmortgageCost,
            mortgagedProperties: loggedInPlayer.mortgagedProperties.filter(id => id !== propertyId)
        });
        addNotification(`Você pagou a hipoteca de ${property.name}.`);
    }
  };

  if (!gameData || !allPlayers || !loggedInPlayer || !currentPlayer) {
    return <div className="flex h-screen w-full items-center justify-center bg-slate-200"><h2 className="text-2xl font-bold">A Carregar Jogo...</h2></div>
  }
  
  if (gameData.status === 'waiting') {
    router.replace(`/character-selection?gameId=${gameId}`);
    return <div className="flex h-screen w-full items-center justify-center bg-slate-200"><h2 className="text-2xl font-bold">A redirecionar para a seleção de personagem...</h2></div>
  }

  const isGameOver = gameData.status === 'finished';
  const winner = allPlayers.find(p => p.id === gameData.winnerId);
  
  return (
    <div className="flex h-screen w-full bg-slate-200">
      <PlayerSidebar allPlayers={allPlayers} loggedInPlayer={loggedInPlayer} />

      <main className="flex flex-1 flex-col">
        <GameHeader
          currentPlayerName={currentPlayer.name}
          onDiceRoll={handleDiceRoll}
          onEndTurn={handleEndTurn}
          isTurnActive={isMyTurn && !isGameOver}
          hasRolled={hasRolled}
          diceValue={dice}
          onManageProperties={() => setManageOpen(true)}
          playerInJail={loggedInPlayer.inJail}
          onPayBail={handlePayBail}
        />
        <div className="flex-1 overflow-auto p-4 lg:p-8">
            <GameBoard allPlayers={allPlayers} onSpaceClick={(space) => setSelectedSpace(space)} animateCardPile={animateCardPile} notifications={notifications} />
        </div>
      </main>

      <AnimatePresence>{isGameOver && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"><Dialog open onOpenChange={() => {}}><DialogContent className="max-w-md text-center p-8"><DialogHeader><motion.div initial={{ scale: 0.5, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}><Crown className="w-24 h-24 mx-auto text-yellow-400 drop-shadow-lg" /></motion.div><DialogTitle className="text-3xl font-bold mt-4">Fim de Jogo!</DialogTitle><DialogDescription className="text-lg mt-2">{winner ? `Parabéns, ${winner.name} venceu!` : "O jogo terminou."}</DialogDescription></DialogHeader><DialogFooter className="mt-6 flex-col sm:flex-col gap-2"><Button size="lg" asChild><Link href="/lobby">Voltar ao Lobby</Link></Button></DialogFooter></DialogContent></Dialog></motion.div>}</AnimatePresence>
      <Dialog open={!!selectedSpace} onOpenChange={(open) => !open && setSelectedSpace(null)}>
        <DialogContent className="p-0 border-0 bg-transparent shadow-none w-auto max-w-sm">
            <DialogHeader className="sr-only">
             <DialogTitle>{selectedSpace?.name}</DialogTitle>
             <DialogDescription>Detalhes da propriedade {selectedSpace?.name}</DialogDescription>
           </DialogHeader>
          {selectedSpace && loggedInPlayer && <PropertyCard space={selectedSpace} player={loggedInPlayer} allPlayers={allPlayers} onBuy={handleBuyProperty} onClose={() => setSelectedSpace(null)} isMyTurn={isMyTurn} />}
        </DialogContent>
      </Dialog>
      <Dialog open={!!drawnCard} onOpenChange={(open) => !open && setDrawnCard(null)}><DialogContent>{drawnCard && <>
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-2", drawnCard.type === 'chance' ? 'text-blue-600' : 'text-orange-700')}>{drawnCard.type === 'chance' ? <HelpCircle/> : <Box/>}{drawnCard.type === 'chance' ? 'Sorte / Revés' : 'Caixinha da Prefeitura'}</DialogTitle>
          <DialogDescription className="pt-4 text-lg text-foreground text-center">{drawnCard.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter><Button onClick={() => { setCardToExecute(drawnCard); setDrawnCard(null); }}>Ok</Button></DialogFooter>
      </>}</DialogContent></Dialog>
       {loggedInPlayer && <ManagePropertiesDialog isOpen={isManageOpen} onOpenChange={setManageOpen} player={loggedInPlayer} allPlayers={allPlayers} onBuild={handleBuild} onSell={handleSell} onMortgage={handleMortgage} />}
    </div>
  );
}

    