'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { boardSpaces, totems, chanceCards, communityChestCards } from '@/lib/game-data';
import { notFound } from 'next/navigation';
import { GameActions } from '@/components/game/game-actions';
import { PlayerHud } from '@/components/game/player-hud';
import { Home, Zap, Building, HelpCircle, Briefcase, Gem, Train, ShieldCheck, ShieldAlert, Gavel, Hotel } from 'lucide-react';
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
};

const getIcon = (space: any, size = "w-8 h-8") => {
    switch(space.type) {
        case 'go': return <Home className={size} />;
        case 'jail': return <Gavel className={size} />;
        case 'free-parking': return <Briefcase className={size}/>;
        case 'go-to-jail': return <Zap className={size} />;
        case 'community-chest': return <ShieldAlert className={cn(size, "text-red-600")} />;
        case 'chance': return <ShieldCheck className={cn(size, "text-green-600")} />;
        case 'income-tax': return <div className="text-center text-[10px] leading-tight"><p className="font-bold">Imposto de Renda</p><p>R$200</p></div>;
        case 'luxury-tax': return <div className="text-center text-[10px] leading-tight"><Gem className="mx-auto" /><p className="font-bold">Imposto de Luxo</p><p>R$100</p></div>;
        case 'railroad': return <Train className={size} />
        case 'utility': 
            if(space.name.includes("CELESC")) return <Zap className={size} />
            if(space.name.includes("SAMAE")) return <Gem className={size} />
            return <Gem className={size} />;
        default: return null;
    }
}

const BoardSpace = ({ space, index, children, onSpaceClick, houses }: { space: any, index: number, children?: React.ReactNode, onSpaceClick: (space: any, index: number) => void, houses?: number }) => {
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
            {isProperty && (space.type === 'property' || space.type === 'railroad') && (
                 <div className={cn(
                    "absolute",
                    index > 0 && index < 10 && "top-0 h-5 w-full", // bottom row
                    index > 10 && index < 20 && "right-0 w-5 h-full", // left row
                    index > 20 && index < 30 && "bottom-0 h-5 w-full", // top row
                    index > 30 && index < 40 && "left-0 w-5 h-full", // right row
                    colorClasses[(space as Property).color]
                )} />
            )}
             {houses && houses > 0 && (
                <div className={cn("absolute z-10 flex items-center justify-center p-px", houseContainerClasses[index])}>
                    <HouseDisplay count={houses} />
                </div>
            )}
            <div className={cn(
                "relative flex-1 flex flex-col justify-center items-center text-center p-1 text-[9px] h-full w-full",
                textRotation[index]
            )}>
                 {getIcon(space, "w-6 h-6")}
                <span className="font-bold px-1 leading-tight">{space.name}</span>
                {isProperty && <span className="font-normal mt-1">R${(space as Property).price}</span>}
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

const GameBoard = ({ players, onSpaceClick, houses }: { players: Player[]; onSpaceClick: (space: any, index: number) => void, houses: { [propertyId: string]: number } }) => {
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
                <div className="bg-muted flex items-center justify-center border-black border-[1.5px]" style={{ gridArea: 'center'}}>
                    <Logo className="text-3xl sm:text-5xl" />
                </div>
                {boardSpaces.map((space, index) => (
                    <BoardSpace key={space.name + index} space={space} index={index} onSpaceClick={onSpaceClick} houses={ 'id' in space ? houses[space.id] : undefined}>
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
  const gameName = searchParams.get('gameName') || 'MINOPOLIS';

  const [player, setPlayer] = useState<Player>({
    id: 'player-1',
    name: playerName,
    money: 1500,
    properties: [],
    houses: {},
    position: 0,
    color: colorId,
    totem: totemId,
    getOutOfJailFreeCards: 0,
    inJail: false,
  });

  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [drawnCard, setDrawnCard] = useState<GameCard | null>(null);
  const [cardToExecute, setCardToExecute] = useState<GameCard | null>(null);
  const [isManageOpen, setManageOpen] = useState(false);
  const JAIL_POSITION = useMemo(() => boardSpaces.findIndex(s => s.type === 'jail'), []);

  const goToJail = useCallback(() => {
    setPlayer(p => ({...p, position: JAIL_POSITION, inJail: true}));
    toast({
        variant: "destructive",
        title: "Encrenca!",
        description: "Você foi para a prisão!"
    });
  }, [JAIL_POSITION, toast]);

  
  const handleLandedOnSpace = useCallback((spaceIndex: number, fromCard = false) => {
    const space = boardSpaces[spaceIndex];
    if (!space) return;

    if (space.type === 'jail' && !player.inJail) {
        toast({ title: "Apenas Visitando", description: "Você está apenas visitando a prisão."});
        return;
    }

    const isProperty = 'price' in space;
    if(isProperty) {
        const property = space as Property;
        if(!player.properties.includes(property.id)) {
             setSelectedSpace(space);
        }
    } else if (space.type === 'chance' || space.type === 'community-chest') {
        const deck = space.type === 'chance' ? chanceCards : communityChestCards;
        const card = deck[Math.floor(Math.random() * deck.length)];
        setDrawnCard(card);
    } else if (space.type === 'income-tax') {
        setPlayer(p => ({...p, money: p.money - 200}));
        toast({ variant: "destructive", title: "Imposto!", description: "Você pagou R$200 de Imposto de Renda." });
    } else if (space.type === 'luxury-tax') {
        setPlayer(p => ({...p, money: p.money - 100}));
        toast({ variant: "destructive", title: "Imposto!", description: "Você pagou R$100 de Imposto de Luxo." });
    } else if (space.type === 'go-to-jail') {
        goToJail();
    }

  }, [player.properties, player.inJail, toast, goToJail]);

  const applyCardAction = useCallback((card: GameCard) => {
    let toastInfo: { title: string, description: string, variant?: 'destructive' } | null = null;
    let postAction: (() => void) | null = null;

    setPlayer(prevPlayer => {
      let newPlayerState = { ...prevPlayer };
      const { action } = card;

      switch (action.type) {
        case 'money':
          newPlayerState.money += action.amount || 0;
          toastInfo = {
            title: card.type === 'chance' ? 'Sorte!' : 'Azar...',
            description: `Você ${action.amount! > 0 ? 'recebeu' : 'pagou'} R$${Math.abs(action.amount!).toLocaleString()}`,
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
                  toast({ title: 'Oba!', description: 'Você passou pelo Início e coletou R$200.' });
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

    if (toastInfo) {
      toast(toastInfo);
    }
    if (postAction) {
      setTimeout(postAction, 500);
    }
  }, [toast, JAIL_POSITION, handleLandedOnSpace]);

  useEffect(() => {
    if (cardToExecute) {
      applyCardAction(cardToExecute);
      setCardToExecute(null);
    }
  }, [cardToExecute, applyCardAction]);

  const handleDiceRoll = (dice1: number, dice2: number) => {
    if (player.inJail) {
        if (dice1 === dice2) {
            setPlayer(p => ({...p, inJail: false}));
            toast({ title: "Sorte!", description: "Você rolou dados duplos e saiu da prisão!" });
        } else {
            toast({ title: "Azar...", description: "Você não rolou dados duplos. Tente na próxima rodada." });
        }
        return;
    }
    
    const total = dice1 + dice2;
    let newPosition = 0;
    setPlayer(prevPlayer => {
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
    if (player.money >= property.price) {
      setPlayer(prev => ({
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
    if (player.inJail && player.money >= 50) {
        setPlayer(p => ({...p, money: p.money - 50, inJail: false}));
        toast({
            title: "Você pagou a fiança!",
            description: "Você está livre da prisão."
        });
    } else {
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
    setPlayer(p => ({ ...p, position: index }));
    handleLandedOnSpace(index);
  };

 const handleBuild = (propertyId: string, amount: number) => {
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property || !property.houseCost) return;
    
    const propertiesInGroup = boardSpaces.filter(p => 'color' in p && p.color === property.color);
    const ownedPropertiesInGroup = propertiesInGroup.filter(p => 'id' in p && player.properties.includes(p.id));

    if (ownedPropertiesInGroup.length !== propertiesInGroup.length) {
      toast({
        variant: "destructive",
        title: "Grupo incompleto",
        description: `Você precisa possuir todas as propriedades ${property.color} para construir.`
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
  
    setPlayer(p => {
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
    const property = boardSpaces.find(p => 'id' in p && p.id === propertyId) as Property | undefined;
    if (!property || !property.houseCost) return;

    const currentHouses = player.houses[propertyId] || 0;
    if (currentHouses < amount) return;

    const saleValue = (property.houseCost / 2) * amount;

    setPlayer(p => {
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

  return (
    <>
      <div className="p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-4">Jogo: {gameName}</h1>
          <GameBoard players={[player]} onSpaceClick={handleDebugMove} houses={player.houses}/>
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
                        <DialogTitle className={cn("flex items-center gap-2", drawnCard.type === 'chance' ? 'text-green-600' : 'text-red-600')}>
                            {drawnCard.type === 'chance' ? <ShieldCheck/> : <ShieldAlert/>}
                            {drawnCard.type === 'chance' ? 'Carta Sorte!' : 'Carta Azar!'}
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
      />
    </>
  );
}
