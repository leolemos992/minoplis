'use client';

import { characters, boardSpaces } from '@/lib/game-data';
import { notFound } from 'next/navigation';
import { GameActions } from '@/components/game/game-actions';
import { PlayerHud } from '@/components/game/player-hud';
import { Home, Zap, Building, HelpCircle, Briefcase, Gem, Users, Train } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Property } from '@/lib/definitions';
import { Logo } from '@/components/logo';

const colorClasses: { [key: string]: string } = {
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
        case 'jail': return <Building className={size} />;
        case 'free-parking': return <Briefcase className={size}/>;
        case 'go-to-jail': return <Zap className={size} />;
        case 'community-chest': return <Users className={size} />;
        case 'chance': return <HelpCircle className={size} />;
        case 'income-tax': return <div className="text-center text-[10px]"><p className="font-bold">Imposto de Renda</p><p>$200</p></div>;
        case 'luxury-tax': return <div className="text-center text-[10px]"><Gem className="mx-auto" /><p className="font-bold">Imposto de Luxo</p><p>$100</p></div>;
        case 'railroad': return <Train className={size} />
        case 'utility': 
            if(space.name.includes("Elétrica")) return <Zap className={size} />
            return <Gem className={size} />; // Placeholder for water works
        default: return null;
    }
}

const BoardSpace = ({ space, position }: { space: any, position: 'corner' | 'top' | 'bottom' | 'left' | 'right' }) => {
    const isProperty = 'price' in space;

    const cornerSpaces: { [key:number]: string } = {
        0: 'br', 20: 'tl', 10: 'bl', 30: 'tr'
    }

    if (position === 'corner') {
        const cornerPos = cornerSpaces[space.position];
        return (
            <div className={cn(
                "w-28 h-28 border border-black flex items-center justify-center text-center text-xs p-1 relative",
                {'col-start-1 row-start-1': cornerPos === 'tl'},
                {'col-start-11 row-start-1': cornerPos === 'tr'},
                {'col-start-1 row-start-11': cornerPos === 'bl'},
                {'col-start-11 row-start-11': cornerPos === 'br'},
            )}>
                 <div className={cn("flex flex-col items-center justify-center", 
                    {'rotate-45': cornerPos === 'bl', '-rotate-45': cornerPos === 'tr', 'rotate-135': cornerPos === 'tl', '-rotate-135': cornerPos === 'br'}
                 )}>
                    <div className="transform-gpu">{getIcon(space, "w-10 h-10")}</div>
                    <span className="font-bold">{space.name}</span>
                </div>
            </div>
        )
    }

    const textRotation = {
      top: '',
      bottom: '',
      left: 'transform -rotate-90',
      right: 'transform rotate-90'
    };
    
    if (isProperty) {
      const property = space as Property;
      return (
        <div className={cn("border border-black flex", {
          'flex-col': position === 'top' || position === 'bottom',
          'flex-row-reverse': position === 'left',
          'flex-row': position === 'right',
          'h-28': position === 'top' || position === 'bottom',
          'w-28': position === 'left' || position === 'right',
        })}>
            <div className={cn("flex-shrink-0", colorClasses[property.color], {
                'h-7 w-full': position === 'top' || position === 'bottom',
                'w-7 h-full': position === 'left' || position === 'right',
            })} />
            <div className={cn("flex flex-col justify-between items-center text-center text-[9px] font-bold p-1 flex-1", textRotation[position])}>
                {property.color === "railroad" || property.color === "utility" ? getIcon(property, "w-6 h-6") : null}
                <span className="px-1">{property.name}</span>
                <span className="font-normal mt-1">${property.price}</span>
            </div>
        </div>
      )
    }

    // Not a property, not a corner
    return (
        <div className={cn("border border-black flex items-center justify-center", {
          'h-28': position === 'top' || position === 'bottom',
          'w-28': position === 'left' || position === 'right',
        })}>
            <div className={cn("text-center text-[9px] p-1 space-y-1", textRotation[position])}>
                {getIcon(space)}
                <p className="font-bold">{space.name}</p>
            </div>
        </div>
    )
}

const GameBoard = () => {
    return (
        <div className="bg-green-200/40 p-4 aspect-square max-w-[900px] mx-auto">
            <div className="grid grid-cols-11 grid-rows-11 w-full h-full relative">
                {boardSpaces.map((space, index) => {
                    const props = {
                        ...space,
                        position: index,
                    }
                    if (index === 0 || index === 10 || index === 20 || index === 30) {
                        return <BoardSpace key={index} space={props} position="corner" />;
                    } else if (index > 0 && index < 10) {
                        return <div key={index} className={cn("col-start-11", `row-start-${11-index}`)}><BoardSpace space={props} position="bottom" /></div>;
                    } else if (index > 10 && index < 20) {
                        return <div key={index} className={cn(`col-start-${11-(index-10)}`, "row-start-1")}><BoardSpace space={props} position="left" /></div>
                    } else if (index > 20 && index < 30) {
                        return <div key={index} className={cn("col-start-1", `row-start-${index-19}`)}><BoardSpace space={props} position="top" /></div>
                    } else if (index > 30 && index < 40) {
                        return <div key={index} className={cn(`col-start-${index-29}`, "row-start-11")}><BoardSpace space={props} position="right" /></div>
                    }
                    return null;
                })}

                {/* Center Logo */}
                <div className="col-start-2 col-span-9 row-start-2 row-span-9 bg-muted flex items-center justify-center">
                    <Logo className="text-5xl" />
                </div>
            </div>
        </div>
    )
}


export default function GamePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { character?: string };
}) {
  const selectedCharacter = characters.find(
    (c) => c.id === searchParams.character
  );

  if (!selectedCharacter) {
    notFound();
  }

  const mockPlayer = {
    id: 'player-1',
    name: 'Jogador 1',
    character: selectedCharacter,
    money: 1500,
    properties: [],
    position: 0,
    color: 'bg-blue-500',
  };

  return (
    <div className="p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-bold mb-4">Jogo: Corrida no Centro</h1>
        <GameBoard />
      </div>
      <aside className="lg:col-span-1 space-y-8">
        <PlayerHud player={mockPlayer} />
        <GameActions />
      </aside>
    </div>
  );
}
