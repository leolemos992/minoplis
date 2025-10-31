'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { boardSpaces, totems, chanceCards, communityChestCards } from '@/lib/game-data';
import Link from 'next/link';
import { GameActions } from '@/components/game/game-actions';
import { Home, Zap, Building, HelpCircle, Briefcase, Gem, Train, ShieldCheck, Box, Gavel, Hotel, Landmark, ShowerHead, CircleDollarSign, Bus, Crown, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Player, Property, GameCard, GameLog, AuctionState, Notification, Game, GameStatus } from '@/lib/definitions';
import { Logo } from '@/components/logo';
import { PlayerToken } from '@/components/game/player-token';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/game/property-card';
import { ManagePropertiesDialog } from '@/components/game/manage-properties-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { GameNotifications } from '@/components/game/game-notifications';
import { useDoc, useCollection, useUser, useFirestore, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
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

const GameBoard = ({ player, onSpaceClick, animateCardPile, notifications, children }: { player?: Player; onSpaceClick: (space: any, index: number) => void; animateCardPile: 'chance' | 'community-chest' | null; notifications: Notification[]; children: React.ReactNode }) => {
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
    
    const allHouses = player?.houses || {};
    const allMortgaged = player?.mortgagedProperties || [];


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
                            {player && player.position === index && (
                                <PlayerToken key={player.id} player={player} />
                            )}
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
  const { data: gameData } = useDoc<Game>(gameRef);
  
  const playersRef = useMemoFirebase(() => firestore && gameId ? collection(firestore, 'games', gameId, 'players') : null, [firestore, gameId]);
  const { data: playersData } = useCollection<Player>(playersRef);
  
  // Local game logic states
  const [hasRolled, setHasRolled] = useState(false);
  const [doublesCount, setDoublesCount] = useState(0);

  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [drawnCard, setDrawnCard] = useState<GameCard | null>(null);
  const [cardToExecute, setCardToExecute] = useState<GameCard | null>(null);
  const [isManageOpen, setManageOpen] = useState(false);
  const [animateCardPile, setAnimateCardPile] = useState<'chance' | 'community-chest' | null>(null);
  const [lastDiceRoll, setLastDiceRoll] = useState<[number, number]>([1, 1]);
  
  const [chanceDeck, setChanceDeck] = useState<GameCard[]>([]);
  const [communityChestDeck, setCommunityChestDeck] = useState<GameCard[]>([]);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const currentPlayer = useMemo(() => {
    if (!user?.uid || !playersData) return undefined;
    return playersData.find(p => p.id === user.uid);
  }, [user?.uid, playersData]);
  
  const shuffle = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };
  
  const JAIL_POSITION = useMemo(() => boardSpaces.findIndex(s => s.type === 'jail'), []);

  const addNotification = useCallback((message: string, variant: 'default' | 'destructive' = 'default') => {
    const id = `${Date.now()}-${Math.random()}`;
    setNotifications(prev => [...prev.slice(-4), { id, message, variant }]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);
  
const updatePlayerInFirestore = useCallback((updates: Partial<Player>) => {
    if (!firestore || !gameId || !user?.uid) return Promise.resolve();
    const playerDocRef = doc(firestore, `games/${gameId}/players`, user.uid);
    return updateDoc(playerDocRef, updates).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: playerDocRef.path,
          operation: 'update',
          requestResourceData: updates,
        })
      );
    });
  }, [firestore, gameId, user?.uid]);
  
  const updateGameInFirestore = useCallback((updates: Partial<Game>) => {
     if (!firestore || !gameId) return Promise.resolve();
     const gameDocRef = doc(firestore, `games/${gameId}`);
     return updateDoc(gameDocRef, updates).catch(error => {
       errorEmitter.emit(
         'permission-error',
         new FirestorePermissionError({
           path: gameDocRef.path,
           operation: 'update',
           requestResourceData: updates,
         })
       );
     });
  }, [firestore, gameId]);

  const handleBankruptcy = useCallback(async () => {
    if (!currentPlayer) return;
    addNotification(`${currentPlayer.name} foi à falência!`, 'destructive');
    await updateGameInFirestore({ status: 'finished' });
  }, [currentPlayer, addNotification, updateGameInFirestore]);

  const makePayment = useCallback((amount: number, receiverId: string | null = null): Promise<boolean> => {
      if (!currentPlayer || !firestore || !gameId) return Promise.resolve(false);

      if (currentPlayer.money < amount) {
          handleBankruptcy(); // This can stay async as it's a final action
          return Promise.resolve(false);
      }
      
      const batch = writeBatch(firestore);
      const payerRef = doc(firestore, 'games', gameId, 'players', currentPlayer.id);
      const payerUpdate = { money: currentPlayer.money - amount };
      batch.update(payerRef, payerUpdate);
      
      // For solo play, receiver is always the bank (null)
      
      return batch.commit()
        .then(() => true)
        .catch(error => {
            errorEmitter.emit(
              'permission-error',
              new FirestorePermissionError({
                path: payerRef.path,
                operation: 'update',
                requestResourceData: payerUpdate,
              })
            );
            return false;
        });

  }, [currentPlayer, handleBankruptcy, firestore, gameId]);
  
  const handleEndTurn = useCallback(() => {
    setDoublesCount(0);
    setHasRolled(false);
    addNotification("Seu turno terminou.");
  }, [addNotification]);

  const goToJail = useCallback(() => {
    if (!currentPlayer) return;

    addNotification('Você foi para a prisão!', 'destructive');
    updatePlayerInFirestore({ position: JAIL_POSITION, inJail: true });
    setDoublesCount(0); // Reset doubles count when jailed
    handleEndTurn();
  }, [JAIL_POSITION, addNotification, handleEndTurn, currentPlayer, updatePlayerInFirestore]);

  const handleLandedOnSpace = useCallback(async (spaceIndex: number) => {
    const space = boardSpaces[spaceIndex];
    if (!space || !currentPlayer) return;

    addNotification(`Você parou em ${space.name}.`);

    if (space.type === 'jail' && !currentPlayer.inJail) {
        addNotification("Você está apenas visitando a prisão.");
        return;
    }

    const isProperty = 'price' in space;
    if(isProperty) {
        const isOwned = currentPlayer.properties.includes(space.id);
        if (!isOwned) {
            setSelectedSpace(space);
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
            setDrawnCard(card);
            setAnimateCardPile(null);
        }, 500);
        return;

    } else if (space.type === 'income-tax') {
        const taxAmount = Math.floor(currentPlayer.money * 0.1);
        const paid = await makePayment(taxAmount);
        if (paid) {
            addNotification(`Você pagou R$${taxAmount} de Imposto de Renda.`, 'destructive');
        }
    } else if (space.type === 'luxury-tax') {
        const paid = await makePayment(100);
        if(paid) {
            addNotification(`Você pagou R$100 de Taxa das Blusinhas.`, 'destructive');
        }
    } else if (space.type === 'go-to-jail') {
        goToJail();
    }
  }, [currentPlayer, addNotification, goToJail, chanceDeck, communityChestDeck, makePayment, shuffle]);
  
  const applyCardAction = useCallback(async (card: GameCard) => {
    if (!currentPlayer) return;
  
    const { action } = card;
    let updates: Partial<Player> = {};
  
    switch (action.type) {
      case 'money':
        const amount = action.amount || 0;
        if (amount < 0) {
          await makePayment(Math.abs(amount));
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
            }
            updates.position = newPosition;
        }
        break;
      case 'go_to_jail':
        goToJail();
        break;
      case 'get_out_of_jail':
        updates.getOutOfJailFreeCards = currentPlayer.getOutOfJailFreeCards + 1;
        break;
      case 'repairs':
           const houseCount = Object.values(currentPlayer.houses).reduce((sum, count) => sum + (count < 5 ? count : 0), 0);
           const hotelCount = Object.values(currentPlayer.houses).reduce((sum, count) => sum + (count === 5 ? 1 : 0), 0);
           const repairCost = (action.perHouse! * houseCount) + (action.perHotel! * hotelCount);
           await makePayment(repairCost);
          break;
      default:
        break;
    }

    if (Object.keys(updates).length > 0) {
        await updatePlayerInFirestore(updates);
    }
    
    if (updates.position !== undefined) {
      handleLandedOnSpace(updates.position);
    }
  }, [currentPlayer, handleLandedOnSpace, makePayment, goToJail, updatePlayerInFirestore]);

  useEffect(() => {
    if (!cardToExecute || !currentPlayer) return;
  
    applyCardAction(cardToExecute);
  
    const { action } = cardToExecute;
    let notification: { message: string, variant?: 'destructive'} | null = null;
     switch (action.type) {
        case 'money':
            notification = {
                message: `Você ${action.amount! > 0 ? 'recebeu' : 'pagou'} R$${Math.abs(action.amount!)}`,
                variant: action.amount! < 0 ? 'destructive' : undefined,
            };
          break;
        case 'go_to_jail':
            notification = { message: `Você foi para a prisão!`, variant: "destructive" };
            break;
        case 'get_out_of_jail':
            notification = { message: `Você recebeu uma carta para sair da prisão!` };
            break;
     }

    if (notification) {
      setTimeout(() => addNotification(notification!.message, notification!.variant), 100);
    }
    
    setCardToExecute(null);
  }, [cardToExecute, applyCardAction, addNotification, currentPlayer]);


 const handleDiceRoll = async (dice1: number, dice2: number) => {
    if (!currentPlayer) return;

    addNotification(`Você rolou ${dice1} e ${dice2}.`);
    setLastDiceRoll([dice1, dice2]);
    const isDoubles = dice1 === dice2;

    if (currentPlayer.inJail) {
        if (isDoubles) {
            await updatePlayerInFirestore({ inJail: false });
            addNotification("Você rolou dados duplos e saiu da prisão!");
            setHasRolled(true);
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
            goToJail();
            return;
        }
    } else {
        setDoublesCount(0);
    }

    setHasRolled(true);

    if (isDoubles) {
        addNotification("Dados duplos! Você joga de novo.");
    }
    
    const total = dice1 + dice2;
    const currentPosition = currentPlayer.position;
    const newPosition = (currentPosition + total) % 40;
    
    const playerUpdate: Partial<Player> = { position: newPosition };

    if (newPosition < currentPosition) {
        playerUpdate.money = currentPlayer.money + 200;
        setTimeout(() => addNotification(`Você coletou R$200.`), 100);
    }

    await updatePlayerInFirestore(playerUpdate);

    await handleLandedOnSpace(newPosition);

    if (!isDoubles) {
      // End turn is now manual
    } else {
        setHasRolled(false); // Allow re-roll
    }
};

  const handleBuyProperty = (property: Property) => {
    if (!currentPlayer || !firestore || !gameId || !user?.uid) return;

    if (currentPlayer.money >= property.price) {
      const updates = {
        money: currentPlayer.money - property.price,
        properties: [...currentPlayer.properties, property.id],
      };
      const playerDocRef = doc(firestore, `games/${gameId}/players`, user.uid);
      updateDoc(playerDocRef, updates).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: playerDocRef.path,
            operation: 'update',
            requestResourceData: updates,
          })
        );
      });
      addNotification(`Você comprou ${property.name}.`);
      setSelectedSpace(null);
    } else {
        addNotification(`Você não tem dinheiro para comprar ${property.name}.`, 'destructive');
    }
  };
  
  const handlePassOnBuy = (property: Property) => {
    setSelectedSpace(null);
    addNotification(`Você decidiu não comprar ${property.name}.`);
  }

  const handlePayBail = async () => {
    if (!currentPlayer || !currentPlayer.inJail) return;

    const paid = await makePayment(50);
    if (paid) {
        await updatePlayerInFirestore({ inJail: false });
        addNotification("Você pagou a fiança e está livre!");
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
  
 const handleBuild = (propertyId: string, amount: number) => {
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
    
    updatePlayerInFirestore({
        money: currentPlayer.money - cost,
        houses: { ...currentPlayer.houses, [propertyId]: newHouses }
    });

    addNotification(`Você construiu ${amount} casa(s) em ${property.name}.`);
  };

  const handleSell = (propertyId: string, amount: number) => {
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

    updatePlayerInFirestore({
        money: currentPlayer.money + saleValue,
        houses: newHousesState,
    });

    addNotification(`Você vendeu ${amount} casa(s) em ${property.name} por R$${saleValue}.`);
  };

  const handleMortgage = (propertyId: string) => {
    if (!currentPlayer) return;
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property) return;
    
    const mortgageValue = property.price / 2;
    updatePlayerInFirestore({
        money: currentPlayer.money + mortgageValue,
        mortgagedProperties: [...currentPlayer.mortgagedProperties, propertyId]
    });

    addNotification(`Você hipotecou ${property.name} e recebeu R$${mortgageValue}.`);
  };

  const handleUnmortgage = (propertyId: string) => {
    if (!currentPlayer) return;
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property) return;

    const unmortgageCost = (property.price / 2) * 1.1; // 10% interest
    if (currentPlayer.money < unmortgageCost) {
        addNotification(`Você precisa de R$${unmortgageCost.toFixed(2)} para pagar a hipoteca.`, "destructive");
        return;
    }

    updatePlayerInFirestore({
        money: currentPlayer.money - unmortgageCost,
        mortgagedProperties: currentPlayer.mortgagedProperties.filter(id => id !== propertyId)
    });
     addNotification(`Você pagou a hipoteca de ${property.name}.`);
  };

  if (!currentPlayer || !gameData) {
    return (
        <div className="container flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center text-center py-12">
            <h2 className="text-2xl font-bold">A Carregar Jogo...</h2>
            <p className="text-muted-foreground">ID do Jogo: <code className="bg-muted p-1 rounded-md">{gameId}</code></p>
        </div>
    )
  }
  
  if (gameData?.status === 'waiting') {
    return (
        <div className="container flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center text-center py-12">
            <h2 className="text-2xl font-bold">A redirecionar...</h2>
            <p className="text-muted-foreground">A preparar o seu jogo.</p>
        </div>
    );
  }

  const isMyTurn = gameData?.status === 'active';
  const isGameOver = gameData?.status === 'finished';

  return (
    <>
      <div className="p-4 lg:p-8">
        <div className="w-full">
          <GameBoard 
            player={currentPlayer}
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
                playerHasProperties={currentPlayer?.properties.length > 0}
                isTurnActive={isMyTurn}
                hasRolled={hasRolled}
                onEndTurn={handleEndTurn}
             />
          </GameBoard>
        </div>
      </div>

      <AnimatePresence>
        {isGameOver && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
            >
                <Dialog open={isGameOver} onOpenChange={() => {}}>
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
                                Que pena, você foi à falência! Tente novamente.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-6 flex-col sm:flex-col gap-2">
                            <Button size="lg" asChild>
                                <Link href="/">Jogar Novamente</Link>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        )}
      </AnimatePresence>
      
      <Dialog open={!!selectedSpace} onOpenChange={(open) => !open && setSelectedSpace(null)}>
        <DialogContent className="p-0 border-0 bg-transparent shadow-none w-auto max-w-sm">
             {selectedSpace && (
                <PropertyCard 
                    space={selectedSpace} 
                    player={currentPlayer}
                    owner={null} // In solo, player is the only possible owner, handled by `isOwned`
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
        player={currentPlayer}
        onBuild={handleBuild}
        onSell={handleSell}
        onMortgage={handleMortgage}
        onUnmortgage={handleUnmortgage}
      />

    </>
  );
}

    