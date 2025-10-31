'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { boardSpaces, chanceCards, communityChestCards } from '@/lib/game-data';
import Link from 'next/link';
import { GameActions } from '@/components/game/game-actions';
import { Home, Zap, HelpCircle, Box, CircleDollarSign, Bus, Crown, Landmark, Briefcase, Hotel } from 'lucide-react';
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
import { doc, collection, updateDoc, writeBatch, runTransaction, arrayRemove } from 'firebase/firestore';
import { PlayerStatus } from '@/components/game/player-status';


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
            <div className="border border-black flex items-center justify-center text-center text-xs p-1 relative z-10 cursor-pointer" style={{ gridArea: `space-${index}` }} onClick={() => onSpaceClick(space, index)}>
                 <div className={cn("flex flex-col items-center justify-center h-full w-full", cornerTextRotation[index] )}>
                    <div className="transform-gpu">{getIcon(space, "w-10 h-10")}</div>
                    <span className="font-bold block w-20">{space.name}</span>
                </div>
                 <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 items-center justify-center gap-0 p-1 pointer-events-none">{playersOnSpace.map(p => <PlayerToken key={p.id} player={p} size={6} />)}</div>
            </div>
        )
    }

    return (
         <div style={{ gridArea: `space-${index}`}} className="border border-black flex items-center justify-center text-center text-xs p-1 relative cursor-pointer hover:bg-yellow-200/50 transition-colors" onClick={() => onSpaceClick(space, index)}>
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

const GameBoard = ({ allPlayers, currentPlayer, onSpaceClick, animateCardPile, notifications, children }: { allPlayers: Player[]; currentPlayer: Player; onSpaceClick: (space: any, index: number) => void; animateCardPile: 'chance' | 'community-chest' | null; notifications: Notification[]; children: React.ReactNode }) => {
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

    return (
        <div className="bg-green-200/40 p-2 md:p-4 aspect-square max-w-[900px] mx-auto">
            <div 
                className="grid h-full w-full relative"
                style={{ gridTemplateAreas, gridTemplateRows: '1.6fr repeat(9, 1fr) 1.6fr', gridTemplateColumns: '1.6fr repeat(9, 1fr) 1.6fr' }}
            >
                <div className="bg-muted flex flex-col items-center justify-between border-black border-[1.5px] relative p-4" style={{ gridArea: 'center'}}>
                    <div className="w-full flex justify-center items-start pt-2 sm:pt-4">
                         <Logo className="text-3xl sm:text-5xl" />
                    </div>
                     <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4"><GameNotifications notifications={notifications} /></div>
                     <PlayerStatus allPlayers={allPlayers} currentPlayerId={currentPlayer.id} />
                    <div className="flex justify-center items-center gap-2 sm:gap-8">
                        <motion.div
                            className="w-[35%] h-auto sm:w-32 sm:h-20 bg-blue-200 border-2 border-blue-800 rounded-lg flex items-center justify-center -rotate-12"
                            animate={animateCardPile === 'chance' ? { scale: 1.1, y: -5 } : {}}
                            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                        ><HelpCircle className="h-1/2 w-1/2 text-blue-800 opacity-60" /></motion.div>
                         <motion.div
                            className="w-[35%] h-auto sm:w-32 sm:h-20 bg-yellow-200 border-2 border-yellow-800 rounded-lg flex items-center justify-center rotate-12"
                            animate={animateCardPile === 'community-chest' ? { scale: 1.1, y: -5 } : {}}
                            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                         ><Box className="h-1/2 w-1/2 text-yellow-800 opacity-60" /></motion.div>
                    </div>
                    <div className="w-full max-w-[280px] scale-90 sm:scale-100">{children}</div>
                </div>
                {boardSpaces.map((space, index) => (
                    <BoardSpace 
                        key={space.name + index} 
                        space={space} 
                        index={index} 
                        onSpaceClick={onSpaceClick} 
                        houses={ 'id' in space && currentPlayer.houses ? currentPlayer.houses[space.id] : undefined}
                        isMortgaged={ 'id' in space && currentPlayer.mortgagedProperties ? currentPlayer.mortgagedProperties.includes(space.id) : false}
                        allPlayers={allPlayers}
                    />
                ))}
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
  
  const [hasRolled, setHasRolled] = useState(false);
  const [doublesCount, setDoublesCount] = useState(0);
  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [drawnCard, setDrawnCard] = useState<GameCard | null>(null);
  const [cardToExecute, setCardToExecute] = useState<GameCard | null>(null);
  const [isManageOpen, setManageOpen] = useState(false);
  const [animateCardPile, setAnimateCardPile] = useState<'chance' | 'community-chest' | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [chanceDeck, setChanceDeck] = useState<GameCard[]>(() => [...chanceCards].sort(() => Math.random() - 0.5));
  const [communityChestDeck, setCommunityChestDeck] = useState<GameCard[]>(() => [...communityChestCards].sort(() => Math.random() - 0.5));
  
  const currentPlayer = useMemo(() => allPlayers?.find(p => p.id === user?.uid), [user?.uid, allPlayers]);
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

  const handleBankruptcy = useCallback(async (bankruptPlayer: Player) => {
    if (!firestore || !gameId) return;
    addNotification(`${bankruptPlayer.name} foi à falência!`, 'destructive');
    
    // Remove player and check if game ends
    const gameDocRef = doc(firestore, `games/${gameId}`);
    try {
        await runTransaction(firestore, async (transaction) => {
            const gameDoc = await transaction.get(gameDocRef);
            if (!gameDoc.exists()) throw "Game not found!";
            
            const remainingPlayers = gameDoc.data().playerOrder.filter((pid: string) => pid !== bankruptPlayer.id);

            if (remainingPlayers.length <= 1) {
                 transaction.update(gameDocRef, { status: 'finished', playerOrder: remainingPlayers });
            } else {
                 transaction.update(gameDocRef, { playerOrder: arrayRemove(bankruptPlayer.id) });
            }
            
            const playerDocRef = doc(firestore, `games/${gameId}/players`, bankruptPlayer.id);
            transaction.delete(playerDocRef);
        });

    } catch (e: any) {
         errorEmitter.emit('permission-error', new FirestorePermissionError({
           path: gameDocRef.path, operation: 'update', requestResourceData: { status: 'finished' }
         }));
    }

  }, [addNotification, firestore, gameId]);

  const makePayment = useCallback(async (amount: number, fromPlayerId: string): Promise<boolean> => {
      if (!firestore || !gameId || !allPlayers) return false;
      const payer = allPlayers.find(p => p.id === fromPlayerId);
      if (!payer) return false;

      if (payer.money < amount) {
          await handleBankruptcy(payer);
          return false;
      }
      
      const payerRef = doc(firestore, 'games', gameId, 'players', payer.id);
      const payerUpdate = { money: payer.money - amount };
      
      try {
        await updateDoc(payerRef, payerUpdate);
        return true;
      } catch (e) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: payerRef.path, operation: 'update', requestResourceData: payerUpdate,
        }));
        return false;
      }
  }, [allPlayers, handleBankruptcy, firestore, gameId]);
  
  const handleEndTurn = useCallback(() => {
    if (!gameData || !isMyTurn) return;
    setDoublesCount(0);
    setHasRolled(false);
    
    const nextTurn = (gameData.turn + 1) % gameData.playerOrder.length;
    const nextPlayerId = gameData.playerOrder[nextTurn];
    
    updateGameInFirestore({ turn: nextTurn, currentPlayerId: nextPlayerId });
    addNotification(`Turno de ${allPlayers?.find(p => p.id === nextPlayerId)?.name}.`);

  }, [gameData, isMyTurn, updateGameInFirestore, addNotification, allPlayers]);

  const goToJail = useCallback((playerId: string) => {
    if (!allPlayers) return;
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return;

    addNotification(`${player.name} foi para a prisão!`, 'destructive');
    updatePlayerInFirestore(playerId, { position: JAIL_POSITION, inJail: true });
    setDoublesCount(0);
    if (player.id === user?.uid) {
        handleEndTurn();
    }
  }, [JAIL_POSITION, addNotification, handleEndTurn, allPlayers, updatePlayerInFirestore, user?.uid]);

  const handleLandedOnSpace = useCallback(async (spaceIndex: number, playerId: string) => {
    const space = boardSpaces[spaceIndex];
    const player = allPlayers?.find(p => p.id === playerId);
    if (!space || !player) return;
    addNotification(`${player.name} parou em ${space.name}.`);
    
    if (player.id !== user?.uid) { // Only handle logic for other players paying rent, etc.
        // TODO: Implement rent payment for other players
        return;
    }

    if (space.type === 'jail' && !player.inJail) {
        addNotification("Você está apenas visitando a prisão.");
        return;
    }

    if ('price' in space) {
        const owner = allPlayers?.find(p => p.properties.includes(space.id));
        if (!owner) setSelectedSpace(space);
        // else TODO: pay rent
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
        if (await makePayment(taxAmount, player.id)) addNotification(`Você pagou R$${taxAmount} de Imposto de Renda.`, 'destructive');
    } else if (space.type === 'luxury-tax') {
        if(await makePayment(100, player.id)) addNotification(`Você pagou R$100 de Taxa de Luxo.`, 'destructive');
    } else if (space.type === 'go-to-jail') {
        goToJail(player.id);
    }
  }, [allPlayers, addNotification, goToJail, chanceDeck, communityChestDeck, makePayment, user?.uid]);
  
  const applyCardAction = useCallback(async (card: GameCard) => {
    if (!currentPlayer) return;
    const { action } = card;
    let updates: Partial<Player> = {};
  
    switch (action.type) {
      case 'money':
        if (action.amount < 0) await makePayment(Math.abs(action.amount), currentPlayer.id);
        else updates.money = currentPlayer.money + action.amount;
        break;
      case 'move_to':
        let newPosition = (typeof action.position === 'string') ? boardSpaces.findIndex(s => 'id' in s && s.id === action.position) : action.position;
        if (newPosition !== -1) {
            if (action.collectGo && newPosition < currentPlayer.position) updates.money = (updates.money || currentPlayer.money) + 200;
            updates.position = newPosition;
        }
        break;
      case 'go_to_jail': goToJail(currentPlayer.id); break;
      case 'get_out_of_jail': updates.getOutOfJailFreeCards = (currentPlayer.getOutOfJailFreeCards || 0) + 1; break;
      case 'repairs':
           const houseCost = (Object.values(currentPlayer.houses).filter(c => c < 5).reduce((s, c) => s + c, 0)) * action.perHouse!;
           const hotelCost = (Object.values(currentPlayer.houses).filter(c => c === 5).length) * action.perHotel!;
           await makePayment(houseCost + hotelCost, currentPlayer.id);
           break;
    }
    if (Object.keys(updates).length > 0) updatePlayerInFirestore(currentPlayer.id, updates);
    if (updates.position !== undefined) handleLandedOnSpace(updates.position, currentPlayer.id);
  }, [currentPlayer, handleLandedOnSpace, makePayment, goToJail, updatePlayerInFirestore]);

  useEffect(() => {
    if (!cardToExecute) return;
    addNotification(cardToExecute.description, cardToExecute.type === 'chance' ? 'default' : 'default');
    applyCardAction(cardToExecute);
    setCardToExecute(null);
  }, [cardToExecute, applyCardAction, addNotification]);

  const handleDiceRoll = async (dice1: number, dice2: number) => {
    if (!currentPlayer || !isMyTurn) return;
    addNotification(`Você rolou ${dice1} e ${dice2}.`);
    const isDoubles = dice1 === dice2;

    if (currentPlayer.inJail) {
        if (isDoubles) {
            updatePlayerInFirestore(currentPlayer.id, { inJail: false });
            addNotification("Você rolou dados duplos e saiu da prisão!");
            setHasRolled(true);
        } else {
            addNotification("Você não rolou dados duplos. Tente na próxima rodada.");
            handleEndTurn();
        }
        return;
    }

    const currentDoublesCount = isDoubles ? doublesCount + 1 : 0;
    setDoublesCount(currentDoublesCount);
    if (currentDoublesCount === 3) {
        addNotification("Você tirou 3 duplos seguidos e foi para a prisão!", "destructive");
        goToJail(currentPlayer.id);
        return;
    }

    setHasRolled(true);
    if (isDoubles) addNotification("Dados duplos! Você joga de novo.");
    
    const total = dice1 + dice2;
    const newPosition = (currentPlayer.position + total) % 40;
    const playerUpdate: Partial<Player> = { position: newPosition };
    if (newPosition < currentPlayer.position) {
        playerUpdate.money = currentPlayer.money + 200;
        setTimeout(() => addNotification(`Você coletou R$200.`), 100);
    }
    updatePlayerInFirestore(currentPlayer.id, playerUpdate);
    await handleLandedOnSpace(newPosition, currentPlayer.id);

    if (isDoubles) setHasRolled(false);
    else handleEndTurn();
  };

  const handleBuyProperty = (property: Property) => {
    if (!currentPlayer || !user?.uid || !firestore || !gameId) return;
    if (currentPlayer.money < property.price) {
        addNotification(`Você não tem dinheiro para comprar ${property.name}.`, 'destructive');
        return;
    }
    const batch = writeBatch(firestore);
    const playerRef = doc(firestore, `games/${gameId}/players`, user.uid);
    batch.update(playerRef, {
        money: currentPlayer.money - property.price,
        properties: [...currentPlayer.properties, property.id],
    });
    batch.commit().catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: playerRef.path, operation: 'update', requestResourceData: {
          money: currentPlayer.money - property.price,
          properties: [...currentPlayer.properties, property.id],
        },
      }));
    });
    addNotification(`Você comprou ${property.name}.`);
    setSelectedSpace(null);
  };

  const handlePayBail = async () => {
    if (!currentPlayer || !currentPlayer.inJail) return;
    if (await makePayment(50, currentPlayer.id)) {
        updatePlayerInFirestore(currentPlayer.id, { inJail: false });
        addNotification("Você pagou a fiança e está livre!");
        setHasRolled(true);
    }
  }

  const handleBuild = (propertyId: string, amount: number) => {
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property || !property.houseCost || !currentPlayer) return;
    const cost = property.houseCost * amount;
    if (currentPlayer.money < cost) { addNotification("Dinheiro insuficiente.", "destructive"); return; }
    const currentHouses = currentPlayer.houses[propertyId] || 0;
    if (currentHouses + amount > 5) { addNotification('Máximo de 1 hotel por propriedade.', 'destructive'); return; }
    
    updatePlayerInFirestore(currentPlayer.id, {
        money: currentPlayer.money - cost,
        houses: { ...currentPlayer.houses, [propertyId]: currentHouses + amount }
    });
    addNotification(`Você construiu em ${property.name}.`);
  };

  const handleSell = (propertyId: string, amount: number) => {
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property || !property.houseCost || !currentPlayer) return;
    const currentHouses = currentPlayer.houses[propertyId] || 0;
    if (currentHouses < amount) { addNotification('Não há construções para vender.', 'destructive'); return; }
    
    const saleValue = (property.houseCost / 2) * amount;
    const newHousesState = { ...currentPlayer.houses };
    if (currentHouses - amount === 0) delete newHousesState[propertyId];
    else newHousesState[propertyId] = currentHouses - amount;
    
    updatePlayerInFirestore(currentPlayer.id, { money: currentPlayer.money + saleValue, houses: newHousesState });
    addNotification(`Você vendeu construções em ${property.name}.`);
  };

  const handleMortgage = (propertyId: string, isMortgaging: boolean) => {
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property || !currentPlayer) return;
    
    if (isMortgaging) {
        const mortgageValue = property.price / 2;
        updatePlayerInFirestore(currentPlayer.id, {
            money: currentPlayer.money + mortgageValue,
            mortgagedProperties: [...currentPlayer.mortgagedProperties, propertyId]
        });
        addNotification(`Você hipotecou ${property.name}.`);
    } else {
        const unmortgageCost = (property.price / 2) * 1.1;
        if (currentPlayer.money < unmortgageCost) { addNotification(`Dinheiro insuficiente para pagar a hipoteca.`, "destructive"); return; }
        updatePlayerInFirestore(currentPlayer.id, {
            money: currentPlayer.money - unmortgageCost,
            mortgagedProperties: currentPlayer.mortgagedProperties.filter(id => id !== propertyId)
        });
        addNotification(`Você pagou a hipoteca de ${property.name}.`);
    }
  };

  if (!gameData || !allPlayers || !currentPlayer) {
    return <div className="container flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center text-center py-12"><h2 className="text-2xl font-bold">A Carregar Jogo...</h2><p className="text-muted-foreground">Aguarde um momento.</p></div>
  }
  
  if (gameData.status === 'waiting') {
    router.replace(`/character-selection?gameId=${gameId}`);
    return <div className="container flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center text-center py-12"><h2 className="text-2xl font-bold">A redirecionar...</h2><p className="text-muted-foreground">A aguardar o início do jogo.</p></div>
  }

  const isGameOver = gameData.status === 'finished';
  const amITheWinner = isGameOver && gameData.playerOrder.length === 1 && gameData.playerOrder[0] === user?.uid;


  return (
    <>
      <div className="p-4 lg:p-8"><GameBoard allPlayers={allPlayers} currentPlayer={currentPlayer} onSpaceClick={(space) => setSelectedSpace(space)} animateCardPile={animateCardPile} notifications={notifications}>
        <GameActions onDiceRoll={handleDiceRoll} isPlayerInJail={currentPlayer.inJail} onPayBail={handlePayBail} canPayBail={currentPlayer.money >= 50} onManageProperties={() => setManageOpen(true)} playerHasProperties={currentPlayer.properties.length > 0} isTurnActive={isMyTurn && !isGameOver} hasRolled={hasRolled} onEndTurn={handleEndTurn} />
      </GameBoard></div>
      <AnimatePresence>{isGameOver && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"><Dialog open onOpenChange={() => {}}><DialogContent className="max-w-md text-center p-8"><DialogHeader><motion.div initial={{ scale: 0.5, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}><Crown className="w-24 h-24 mx-auto text-yellow-400 drop-shadow-lg" /></motion.div><DialogTitle className="text-3xl font-bold mt-4">Fim de Jogo!</DialogTitle><DialogDescription className="text-lg mt-2">{amITheWinner ? "Parabéns, você venceu!" : "Que pena, você foi à falência! Tente novamente."}</DialogDescription></DialogHeader><DialogFooter className="mt-6 flex-col sm:flex-col gap-2"><Button size="lg" asChild><Link href="/">Jogar Novamente</Link></Button></DialogFooter></DialogContent></Dialog></motion.div>}</AnimatePresence>
      <Dialog open={!!selectedSpace} onOpenChange={(open) => !open && setSelectedSpace(null)}>
        <DialogContent className="p-0 border-0 bg-transparent shadow-none w-auto max-w-sm">
           <DialogHeader>
             <DialogTitle className="sr-only">{selectedSpace?.name}</DialogTitle>
             <DialogDescription className="sr-only">Detalhes da propriedade {selectedSpace?.name}</DialogDescription>
           </DialogHeader>
          {selectedSpace && <PropertyCard space={selectedSpace} player={currentPlayer} onBuy={handleBuyProperty} onClose={() => setSelectedSpace(null)} isMyTurn={isMyTurn} />}
        </DialogContent>
      </Dialog>
      <Dialog open={!!drawnCard} onOpenChange={(open) => !open && setDrawnCard(null)}><DialogContent>{drawnCard && <>
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-2", drawnCard.type === 'chance' ? 'text-blue-600' : 'text-yellow-700')}>{drawnCard.type === 'chance' ? <HelpCircle/> : <Box/>}{drawnCard.type === 'chance' ? 'Sorte!' : 'Baú'}</DialogTitle>
          <DialogDescription className="pt-4 text-lg text-foreground text-center">{drawnCard.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter><Button onClick={() => { setCardToExecute(drawnCard); setDrawnCard(null); }}>Ok</Button></DialogFooter>
      </>}</DialogContent></Dialog>
       <ManagePropertiesDialog isOpen={isManageOpen} onOpenChange={setManageOpen} player={currentPlayer} allPlayers={allPlayers} onBuild={handleBuild} onSell={handleSell} onMortgage={handleMortgage} />
    </>
  );
}
