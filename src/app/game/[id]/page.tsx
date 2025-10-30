'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { boardSpaces, totems, chanceCards, communityChestCards } from '@/lib/game-data';
import { notFound } from 'next/navigation';
import { GameActions } from '@/components/game/game-actions';
import { PlayerHud } from '@/components/game/player-hud';
import { Home, Zap, Building, HelpCircle, Briefcase, Gem, Train, ShieldCheck, Box, Gavel, Hotel, Landmark, ShowerHead, CircleDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Player, Property, GameCard } from '@/lib/definitions';
import { Logo } from '@/components/logo';
import { PlayerToken } from '@/components/game/player-token';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/game/property-card';
import { useToast } from '@/hooks/use-toast';
import { GameControls } from '@/components/game/game-controls';
import { ManagePropertiesDialog } from '@/components/game/manage-properties-dialog';
import { motion } from 'framer-motion';


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
        case 'railroad': return <Train className={size} />
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

const GameBoard = ({ players, onSpaceClick, houses, mortgagedProperties, animateCardPile }: { players: Player[]; onSpaceClick: (space: any, index: number) => void, houses: { [propertyId: string]: number }, mortgagedProperties: string[], animateCardPile: 'chance' | 'community-chest' | null }) => {
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
                <div className="bg-muted flex items-center justify-center border-black border-[1.5px] relative" style={{ gridArea: 'center'}}>
                    <motion.div
                        className="absolute w-[35%] h-[20%] bg-blue-200 border-2 border-blue-800 rounded-lg flex items-center justify-center -rotate-12 top-[22%] left-[12%]"
                        animate={animateCardPile === 'chance' ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                    >
                        <HelpCircle className="h-1/2 w-1/2 text-blue-800 opacity-60" />
                    </motion.div>
                     <motion.div
                        className="absolute w-[35%] h-[20%] bg-yellow-200 border-2 border-yellow-800 rounded-lg flex items-center justify-center rotate-12 bottom-[22%] right-[12%]"
                        animate={animateCardPile === 'community-chest' ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                     >
                        <Box className="h-1/2 w-1/2 text-yellow-800 opacity-60" />
                    </motion.div>

                    <Logo className="text-3xl sm:text-5xl" />
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
                                <PlayerToken key={p.id} player={p} size={10}/>
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
  const { toast } = useToast();
  const playerName = searchParams.get('playerName') || 'Jogador 1';
  const totemId = searchParams.get('totem') || 'car';
  const colorId = searchParams.get('color') || 'blue';
  const gameName = searchParams.get('gameName') || 'MINOPLIS';

  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [drawnCard, setDrawnCard] = useState<GameCard | null>(null);
  const [cardToExecute, setCardToExecute] = useState<GameCard | null>(null);
  const [isManageOpen, setManageOpen] = useState(false);
  const [animateCardPile, setAnimateCardPile] = useState<'chance' | 'community-chest' | null>(null);
  const [lastDiceRoll, setLastDiceRoll] = useState<[number, number]>([1, 1]);
  
  const [chanceDeck, setChanceDeck] = useState<GameCard[]>([]);
  const [communityChestDeck, setCommunityChestDeck] = useState<GameCard[]>([]);
  
  const JAIL_POSITION = useMemo(() => boardSpaces.findIndex(s => s.type === 'jail'), []);
  const player = players[currentPlayerIndex];

  // Initialize players and decks on game start
  useEffect(() => {
    const shuffle = (deck: GameCard[]) => [...deck].sort(() => Math.random() - 0.5);
    setChanceDeck(shuffle(chanceCards));
    setCommunityChestDeck(shuffle(communityChestCards));

    const initialPlayer: Player = {
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
    
    // Add a dummy opponent for rent testing
    const opponent: Player = {
        id: 'opponent-1',
        name: 'Oponente',
        money: 1500,
        properties: ['poco-fundo', 'guarani', 'railroad-1'],
        mortgagedProperties: [],
        houses: {'poco-fundo': 1},
        position: -1, // Off-board
        color: 'red',
        totem: 'dog',
        getOutOfJailFreeCards: 0,
        inJail: false,
    };
    setPlayers([initialPlayer, opponent]);
  }, [playerName, totemId, colorId]);


  const updatePlayer = useCallback((playerId: string, updates: Partial<Player> | ((player: Player) => Player)) => {
    setPlayers(prevPlayers => prevPlayers.map(p => {
        if (p.id === playerId) {
            return typeof updates === 'function' ? updates(p) : { ...p, ...updates };
        }
        return p;
    }));
  }, []);

  const goToJail = useCallback((playerId: string) => {
    updatePlayer(playerId, { position: JAIL_POSITION, inJail: true });
    toast({
        variant: "destructive",
        title: "Encrenca!",
        description: "Você foi para a prisão!"
    });
  }, [JAIL_POSITION, toast, updatePlayer]);

  const handleLandedOnSpace = useCallback((spaceIndex: number, fromCard = false) => {
    const space = boardSpaces[spaceIndex];
    if (!space || !player) return;

    if (space.type === 'jail' && !player.inJail) {
        toast({ title: "Apenas Visitando", description: "Você está apenas visitando a prisão."});
        return;
    }

    const isProperty = 'price' in space;
    if(isProperty) {
        const property = space as Property;
        const owner = players.find(p => p.properties.includes(property.id));
        
        if (owner && owner.id !== player.id) {
            // Pay rent
            if (owner.mortgagedProperties.includes(property.id)) {
                 toast({ title: 'Propriedade Hipotecada', description: `${owner.name} hipotecou ${property.name}, então você não paga aluguel.` });
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
                const utilityCount = owner.properties.filter(pId => (boardSpaces.find(bs => 'id' in bs && bs.id === pId) as Property)?.type === 'utility').length;
                const multiplier = utilityCount === 1 ? 4 : 10;
                rentAmount = (lastDiceRoll[0] + lastDiceRoll[1]) * multiplier;
            }

            if(rentAmount > 0) {
                 if (player.money < rentAmount) {
                    toast({ variant: 'destructive', title: 'Falência!', description: `Você não tem dinheiro para pagar R$${rentAmount} a ${owner.name}.` });
                    // Handle bankruptcy logic here
                } else {
                    updatePlayer(player.id, p => ({ ...p, money: p.money - rentAmount }));
                    updatePlayer(owner.id, p => ({ ...p, money: p.money + rentAmount }));
                    toast({ variant: 'destructive', title: `Aluguel!`, description: `Você pagou R$${rentAmount} a ${owner.name} por parar em ${property.name}.` });
                }
            }

        } else if (!owner) {
             setSelectedSpace(space);
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
            setDrawnCard(card);
            setAnimateCardPile(null);
        }, 500);

    } else if (space.type === 'income-tax') {
        const taxAmount = Math.floor(player.money * 0.1);
        updatePlayer(player.id, p => ({...p, money: p.money - taxAmount}));
        toast({ variant: "destructive", title: "Imposto!", description: `Você pagou R$${taxAmount} de Imposto de Renda (10% do seu dinheiro).` });
    } else if (space.type === 'luxury-tax') {
        updatePlayer(player.id, p => ({...p, money: p.money - 100}));
        toast({ variant: "destructive", title: "Imposto!", description: "Você pagou R$100 de Taxa das Blusinhas." });
    } else if (space.type === 'go-to-jail') {
        goToJail(player.id);
    }

  }, [player, players, toast, goToJail, chanceDeck, communityChestDeck, updatePlayer, lastDiceRoll]);
  
  const applyCardAction = useCallback((card: GameCard) => {
    let toastInfo: { title: string; description: string; variant?: 'destructive' } | null = null;
    let postAction: (() => void) | null = null;
  
    if (!player) return { toastInfo, postAction };

    updatePlayer(player.id, prevPlayer => {
      let newPlayerState = { ...prevPlayer };
      const { action } = card;
  
      switch (action.type) {
        case 'money':
          newPlayerState.money += action.amount || 0;
          toastInfo = {
            title: card.type === 'chance' ? 'Sorte!' : 'Baú Comunitário',
            description: `Você ${action.amount! > 0 ? 'recebeu' : 'pagou'} R$${Math.abs(action.amount!).toLocaleString()}`,
            variant: action.amount! < 0 ? 'destructive' : undefined,
          };
          break;
        case 'move_to':
          let newPosition = -1;
          if (typeof action.position === 'string') {
              newPosition = boardSpaces.findIndex(s => 'id' in s && s.id === action.position);
          } else if (typeof action.position === 'number') {
              newPosition = action.position;
          }

          if (newPosition !== -1) {
              if (action.collectGo && newPosition < newPlayerState.position) {
                  newPlayerState.money += 200;
                  // This toast is queued and shown after the state update cycle
                  setTimeout(() => toast({ title: 'Oba!', description: 'Você passou pelo Início e coletou R$200.' }), 0);
              }
              newPlayerState.position = newPosition;
              postAction = () => handleLandedOnSpace(newPosition, true);
          }
          break;
        case 'go_to_jail':
          newPlayerState.position = JAIL_POSITION;
          newPlayerState.inJail = true;
          toastInfo = {
            variant: "destructive",
            title: 'Que azar!',
            description: 'Você foi para a prisão!',
          };
          break;
        case 'get_out_of_jail':
          newPlayerState.getOutOfJailFreeCards += 1;
          toastInfo = {
            title: 'Sorte Grande!',
            description: 'Você recebeu uma carta para sair da prisão!',
          };
          break;
        case 'repairs':
             const houseCount = Object.values(newPlayerState.houses).reduce((sum, count) => sum + (count < 5 ? count : 0), 0);
             const hotelCount = Object.values(newPlayerState.houses).reduce((sum, count) => sum + (count === 5 ? 1 : 0), 0);
             const repairCost = (action.perHouse! * houseCount) + (action.perHotel! * hotelCount);
             newPlayerState.money -= repairCost;
             toastInfo = {
                variant: "destructive",
                title: 'Manutenção!',
                description: `Você pagou R$${repairCost.toLocaleString()} em reparos.`,
            };
            break;
        default:
          break;
      }
      return newPlayerState;
    });

    return { toastInfo, postAction };
  }, [player, JAIL_POSITION, handleLandedOnSpace, toast, updatePlayer]);

  useEffect(() => {
    if (!cardToExecute) return;
  
    const { toastInfo, postAction } = applyCardAction(cardToExecute);
  
    if (toastInfo) {
      setTimeout(() => toast(toastInfo), 0);
    }
    if (postAction) {
      setTimeout(postAction, 0);
    }
  
    setCardToExecute(null);
  }, [cardToExecute, applyCardAction, toast]);


  const handleDiceRoll = (dice1: number, dice2: number) => {
    if (!player) return;
    setLastDiceRoll([dice1, dice2]);

    if (player.inJail) {
        if (dice1 === dice2) {
            updatePlayer(player.id, { inJail: false });
            toast({ title: "Sorte!", description: "Você rolou dados duplos e saiu da prisão!" });
        } else {
            toast({ title: "Azar...", description: "Você não rolou dados duplos. Tente na próxima rodada." });
        }
        // End turn after trying to roll doubles
        // In a multiplayer game, you'd call endTurn() here
        return;
    }
    
    const total = dice1 + dice2;
    let newPosition = 0;
    
    updatePlayer(player.id, prevPlayer => {
        const currentPosition = prevPlayer.position;
        newPosition = (currentPosition + total) % 40;
        
        let updatedPlayer = { ...prevPlayer, position: newPosition };

        if (newPosition < currentPosition) {
            updatedPlayer.money += 200;
            toast({
                title: "Você passou pelo início!",
                description: `Você coletou R$200.`,
            });
        }
        return updatedPlayer;
    });
    
    setTimeout(() => handleLandedOnSpace(newPosition), 500);
  };

  const handleBuyProperty = (property: Property) => {
    if (!player) return;

    if (player.money >= property.price) {
      updatePlayer(player.id, prev => ({
        ...prev,
        money: prev.money - property.price,
        properties: [...prev.properties, property.id],
      }));
      toast({
        title: "Propriedade Comprada!",
        description: `Você comprou ${property.name}.`,
      });
      setSelectedSpace(null);
    } else {
        toast({
            variant: "destructive",
            title: "Dinheiro insuficiente!",
            description: `Você não tem dinheiro para comprar ${property.name}.`,
        });
    }
  };

  const handlePayBail = () => {
    if (!player) return;

    if (player.inJail && player.money >= 50) {
        updatePlayer(player.id, p => ({...p, money: p.money - 50, inJail: false}));
        toast({
            title: "Você pagou a fiança!",
            description: "Você está livre da prisão."
        });
    } else if (player.inJail) {
         toast({
            variant: "destructive",
            title: "Dinheiro insuficiente!",
            description: "Você não tem R$50 para pagar a fiança.",
        });
    }
  }

  const closeCardDialog = () => {
      if (drawnCard) {
          setCardToExecute(drawnCard);
          setDrawnCard(null);
      }
  }

  const handleDebugMove = (space: any, index: number) => {
    if (!player) return;
    updatePlayer(player.id, p => ({ ...p, position: index }));
    handleLandedOnSpace(index);
  };

 const handleBuild = (propertyId: string, amount: number) => {
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property || !property.houseCost || !player) return;
    
    const propertiesInGroup = boardSpaces.filter(p => 'color' in p && p.color === property.color);
    const ownedPropertiesInGroup = propertiesInGroup.filter(p => 'id' in p && player.properties.includes(p.id));

    if (ownedPropertiesInGroup.length !== propertiesInGroup.length) {
      toast({
        variant: "destructive",
        title: "Grupo incompleto",
        description: `Você precisa possuir todas as propriedades da cor ${property.color} para construir.`
      });
      return;
    }

    const cost = property.houseCost * amount;
    if (player.money < cost) {
      toast({
        variant: "destructive",
        title: "Dinheiro insuficiente!",
        description: "Você não tem dinheiro para construir."
      });
      return;
    }
  
    updatePlayer(player.id, p => {
      const currentHouses = p.houses[propertyId] || 0;
      if (currentHouses + amount > 5) {
         toast({ variant: 'destructive', title: 'Limite Atingido', description: 'Você já construiu um hotel nesta propriedade.' });
        return p;
      }
      const newHouses = currentHouses + amount;
      
      return {
        ...p,
        money: p.money - cost,
        houses: {
          ...p.houses,
          [propertyId]: newHouses,
        }
      }
    });

    toast({
      title: "Construção realizada!",
      description: `Você construiu ${amount} casa(s) em ${property.name}.`
    });
  };

  const handleSell = (propertyId: string, amount: number) => {
    if (!player) return;
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property || !property.houseCost) return;

    const currentHouses = player.houses[propertyId] || 0;
    if (currentHouses < amount) {
        toast({ variant: 'destructive', title: 'Venda inválida', description: 'Você não tem construções suficientes para vender.'});
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
      
      return {
        ...p,
        money: p.money + saleValue,
        houses: newHousesState,
      }
    });

    toast({
      title: "Venda realizada!",
      description: `Você vendeu ${amount} casa(s) em ${property.name} por R$${saleValue}.`
    });
  };

  const handleMortgage = (propertyId: string) => {
    if (!player) return;
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property) return;
    
    const mortgageValue = property.price / 2;
    updatePlayer(player.id, p => ({
        ...p,
        money: p.money + mortgageValue,
        mortgagedProperties: [...p.mortgagedProperties, propertyId]
    }));

    toast({
        title: "Propriedade Hipotecada!",
        description: `Você hipotecou ${property.name} e recebeu R$${mortgageValue}.`
    });
  };

  const handleUnmortgage = (propertyId: string) => {
    if (!player) return;
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property) return;

    const unmortgageCost = (property.price / 2) * 1.1; // 10% interest
    if (player.money < unmortgageCost) {
        toast({
            variant: "destructive",
            title: "Dinheiro insuficiente!",
            description: `Você precisa de R$${unmortgageCost.toFixed(2)} para pagar a hipoteca de ${property.name}.`
        });
        return;
    }

    updatePlayer(player.id, p => ({
        ...p,
        money: p.money - unmortgageCost,
        mortgagedProperties: p.mortgagedProperties.filter(id => id !== propertyId)
    }));
     toast({
        title: "Hipoteca Paga!",
        description: `Você pagou a hipoteca de ${property.name}.`
    });
  };

  if (!player) {
    return <div>Carregando...</div>;
  }

  const allPlayers = players;
  const owner = selectedSpace ? allPlayers.find(p => 'id' in selectedSpace && p.properties.includes(selectedSpace.id)) : null;

  return (
    <>
      <div className="p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-4">Jogo: {gameName}</h1>
          <GameBoard 
            players={allPlayers} 
            onSpaceClick={handleDebugMove} 
            houses={player.houses} 
            mortgagedProperties={player.mortgagedProperties} 
            animateCardPile={animateCardPile} 
          />
        </div>
        <aside className="lg:col-span-1 space-y-8">
          <PlayerHud player={player} />
          <GameActions 
            onDiceRoll={handleDiceRoll} 
            isPlayerInJail={player.inJail}
            onPayBail={handlePayBail}
            canPayBail={player.money >= 50}
            onManageProperties={() => setManageOpen(true)}
            playerHasProperties={player.properties.length > 0}
          />
          <GameControls />
        </aside>
      </div>

      <Dialog open={!!selectedSpace} onOpenChange={(open) => !open && setSelectedSpace(null)}>
        <DialogContent className="p-0 border-0 bg-transparent shadow-none w-auto max-w-sm">
             {selectedSpace && (
                <PropertyCard 
                    space={selectedSpace} 
                    player={player}
                    owner={owner}
                    onBuy={handleBuyProperty}
                    onClose={() => setSelectedSpace(null)} 
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
        player={player}
        onBuild={handleBuild}
        onSell={handleSell}
        onMortgage={handleMortgage}
        onUnmortgage={handleUnmortgage}
      />
    </>
  );
}

    