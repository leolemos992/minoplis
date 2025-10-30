'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { boardSpaces, totems, chanceCards, communityChestCards } from '@/lib/game-data';
import { notFound } from 'next/navigation';
import { GameActions } from '@/components/game/game-actions';
import { PlayerHud } from '@/components/game/player-hud';
import { Home, Zap, Building, HelpCircle, Briefcase, Gem, Train, ShieldCheck, ShieldAlert, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Player, Property, GameCard } from '@/lib/definitions';
import { Logo } from '@/components/logo';
import { PlayerToken } from '@/components/game/player-token';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/game/property-card';
import { useToast } from '@/hooks/use-toast';
import { GameControls } from '@/components/game/game-controls';

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

const BoardSpace = ({ space, index, children, onSpaceClick }: { space: any, index: number, children?: React.ReactNode, onSpaceClick: (space: any, index: number) => void }) => {
    const isProperty = 'price' in space;
    const baseClasses = "border border-black flex items-center justify-center text-center text-xs p-1 relative cursor-pointer hover:bg-yellow-200/50 transition-colors";
    const rotationClasses: { [key: number]: string } = {
        // Cantos
        0: 'justify-start items-start',
        10: 'justify-start items-end',
        20: 'justify-end items-start',
        30: 'justify-end items-end',
        // Linha de baixo
        ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, 'flex-col justify-end'])),
        // Linha da esquerda
        ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 11, 'flex-row-reverse justify-end'])),
         // Linha de cima
        ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 21, 'flex-col-reverse justify-start'])),
        // Linha da direita
        ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 31, 'flex-row justify-end'])),
    };
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
         <div style={{ gridArea: `space-${index}`}} className={cn(baseClasses, rotationClasses[index])} onClick={() => onSpaceClick(space, index)}>
            {content}
            {children && <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 items-center justify-center gap-0 p-1 pointer-events-none">{children}</div>}
         </div>
    )
};

const GameBoard = ({ players, onSpaceClick }: { players: Player[]; onSpaceClick: (space: any, index: number) => void }) => {
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
                    <BoardSpace key={space.name + index} space={space} index={index} onSpaceClick={onSpaceClick}>
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
    position: 0,
    color: colorId,
    totem: totemId,
    getOutOfJailFreeCards: 0,
    inJail: false,
  });

  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [drawnCard, setDrawnCard] = useState<GameCard | null>(null);
  const JAIL_POSITION = boardSpaces.findIndex(s => s.type === 'jail');

  const goToJail = () => {
    setPlayer(p => ({...p, position: JAIL_POSITION, inJail: true}));
    toast({
        variant: "destructive",
        title: "Encrenca!",
        description: "Você foi para a prisão!"
    });
  }

  const applyCardAction = useCallback((card: GameCard) => {
    setPlayer(prevPlayer => {
      let newPlayerState = { ...prevPlayer };
      const { action } = card;

      switch (action.type) {
        case 'money':
          newPlayerState.money += action.amount || 0;
          toast({
            title: card.type === 'chance' ? 'Sorte!' : 'Azar...',
            description: `Você ${action.amount! > 0 ? 'recebeu' : 'pagou'} R$${Math.abs(action.amount!).toLocaleString()}`,
          });
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
              // A ação de sacar outra carta/pagar aluguel acontece em handleLandedOnSpace
              setTimeout(() => handleLandedOnSpace(newPosition, true), 500);
          }
          break;
        case 'go_to_jail':
          newPlayerState.position = JAIL_POSITION;
          newPlayerState.inJail = true;
           toast({
            variant: "destructive",
            title: 'Que azar!',
            description: 'Você foi para a prisão!',
          });
          break;
        case 'get_out_of_jail':
          newPlayerState.getOutOfJailFreeCards += 1;
          toast({
            title: 'Sorte Grande!',
            description: 'Você recebeu uma carta para sair da prisão!',
          });
          break;
        // A lógica de 'repairs' precisa saber quais propriedades o jogador tem
        // Para simplificar, vamos tratar como um pagamento fixo por agora.
        case 'repairs':
             const repairCost = action.perHouse! * 2; // Simulação: 2 casas
             newPlayerState.money -= repairCost;
             toast({
                variant: "destructive",
                title: 'Manutenção!',
                description: `Você pagou R$${repairCost.toLocaleString()} em reparos.`,
            });
            break;
        default:
          break;
      }
      return newPlayerState;
    });
  }, [toast, JAIL_POSITION]);

  const handleLandedOnSpace = useCallback((spaceIndex: number, fromCard = false) => {
    const space = boardSpaces[spaceIndex];
    if (!space) return;

    // Se o jogador está apenas visitando a prisão, nada acontece
    if (space.type === 'jail' && !player.inJail) {
        toast({ title: "Apenas Visitando", description: "Você está apenas visitando a prisão."});
        return;
    }

    const isProperty = 'price' in space;
    if(isProperty) {
        const property = space as Property;
        // Se a propriedade não pertence a ninguém
        if(!player.properties.includes(property.id)) { // Simplificando - precisa verificar todos os jogadores
             setSelectedSpace(space);
        }
        // Se pertence a outro jogador, pague aluguel (lógica a ser adicionada)
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


  const handleDiceRoll = (dice1: number, dice2: number) => {
    
    // Lógica da Prisão
    if (player.inJail) {
        if (dice1 === dice2) {
            setPlayer(p => ({...p, inJail: false}));
            toast({ title: "Sorte!", description: "Você rolou dados duplos e saiu da prisão!" });
        } else {
            toast({ title: " azar...", description: "Você não rolou dados duplos. Tente na próxima rodada." });
        }
        return;
    }
    
    // Lógica normal de rolagem
    const total = dice1 + dice2;
    let newPosition = 0;
    setPlayer(prevPlayer => {
        const currentPosition = prevPlayer.position;
        newPosition = (currentPosition + total) % 40;
        
        let updatedPlayer = { ...prevPlayer, position: newPosition };

        // Handle passing GO
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
          applyCardAction(drawnCard);
          setDrawnCard(null);
      }
  }

  // DEBUG: Move player by clicking on a space
  const handleDebugMove = (space: any, index: number) => {
    setPlayer(p => ({ ...p, position: index }));
    handleLandedOnSpace(index);
    if ('price' in space) {
        setSelectedSpace(space);
    }
  };


  return (
    <>
      <div className="p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-4">Jogo: {gameName}</h1>
          <GameBoard players={[player]} onSpaceClick={handleDebugMove}/>
        </div>
        <aside className="lg:col-span-1 space-y-8">
          <PlayerHud player={player} />
          <GameActions 
            onDiceRoll={handleDiceRoll} 
            isPlayerInJail={player.inJail}
            onPayBail={handlePayBail}
            canPayBail={player.money >= 50}
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
    </>
  );
}
