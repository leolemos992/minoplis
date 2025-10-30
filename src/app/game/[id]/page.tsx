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
        case 'income-tax': return <div className="text-center text-[10px] leading-tight"><p className="font-bold">Imposto de Renda</p><p>$200</p></div>;
        case 'luxury-tax': return <div className="text-center text-[10px] leading-tight"><Gem className="mx-auto" /><p className="font-bold">Imposto de Luxo</p><p>$100</p></div>;
        case 'railroad': return <Train className={size} />
        case 'utility': 
            if(space.name.includes("Elétrica")) return <Zap className={size} />
            return <Gem className={size} />; // Placeholder for water works
        default: return null;
    }
}

const BoardSpace = ({ space, index }: { space: any, index: number }) => {
    const isProperty = 'price' in space;
    let position: 'corner' | 'top' | 'bottom' | 'left' | 'right';
    let gridArea: string;

    if (index === 0) {
        position = 'corner';
        gridArea = '11 / 11 / 12 / 12'; // bottom-right
    } else if (index < 10) {
        position = 'bottom';
        gridArea = `11 / ${11 - index} / 12 / ${12 - index}`;
    } else if (index === 10) {
        position = 'corner';
        gridArea = '11 / 1 / 12 / 2'; // bottom-left
    } else if (index < 20) {
        position = 'left';
        gridArea = `${11 - (index - 10)} / 1 / ${12 - (index - 10)} / 2`;
    } else if (index === 20) {
        position = 'corner';
        gridArea = '1 / 1 / 2 / 2'; // top-left
    } else if (index < 30) {
        position = 'top';
        gridArea = `1 / ${1 + (index - 20)} / 2 / ${2 + (index - 20)}`;
    } else if (index === 30) {
        position = 'corner';
        gridArea = '1 / 11 / 2 / 12'; // top-right
    } else { // index < 40
        position = 'right';
        gridArea = `${1 + (index - 30)} / 11 / ${2 + (index - 30)} / 12`;
    }

    const baseClasses = "border border-black flex items-center justify-center text-center text-xs p-1 relative";

    if (position === 'corner') {
         const rotation: { [key: number]: string } = {
            0: 'rotate-[135deg]',  // Go
            10: 'rotate-[225deg]', // Jail
            20: 'rotate-[-45deg]',   // Free Parking
            30: 'rotate-[45deg]',    // Go to Jail
        }
        return (
            <div className={cn(baseClasses, "z-10")} style={{ gridArea }}>
                 <div className={cn("flex flex-col items-center justify-center space-y-1", rotation[index] )}>
                    <div className="transform-gpu">{getIcon(space, "w-10 h-10")}</div>
                    <span className="font-bold block w-20">{space.name}</span>
                </div>
            </div>
        )
    }

    const contentWrapperClasses = "flex-1 flex flex-col justify-between items-center text-center p-1 text-[9px] w-full h-full";
    
    if (isProperty) {
        const property = space as Property;

        if (position === 'top' || position === 'bottom') {
            return (
                <div style={{ gridArea }} className={cn(baseClasses, "flex", position === 'top' ? 'flex-col-reverse' : 'flex-col')}>
                    <div className={cn("h-5 w-full flex-shrink-0", colorClasses[property.color])} />
                    <div className={contentWrapperClasses}>
                        {property.color === "railroad" || property.color === "utility" ? getIcon(property, "w-6 h-6") : null}
                        <span className="font-bold px-1 leading-tight">{property.name}</span>
                        <span className="font-normal mt-1">${property.price}</span>
                    </div>
                </div>
            );
        }

        // Left or Right
        return (
            <div style={{ gridArea }} className={cn(baseClasses, "flex", position === 'left' ? 'flex-row' : 'flex-row-reverse')}>
                <div className={cn("w-5 h-full flex-shrink-0", colorClasses[property.color])} />
                <div className={cn(contentWrapperClasses, "justify-center", position === 'left' ? 'rotate-90' : '-rotate-90')}>
                    {property.color === "railroad" || property.color === "utility" ? getIcon(property, "w-6 h-6") : null}
                    <span className="font-bold px-1 leading-tight">{property.name}</span>
                    <span className="font-normal mt-1">${property.price}</span>
                </div>
            </div>
        );
    }

    // Not a property, not a corner
    if (position === 'top' || position === 'bottom') {
        return (
            <div style={{ gridArea }} className={cn(baseClasses, "flex items-center justify-center")}>
                <div className={cn(contentWrapperClasses, "justify-center space-y-1")}>
                    <p className="font-bold leading-tight">{space.name}</p>
                    {getIcon(space, 'w-8 h-8')}
                </div>
            </div>
        );
    }
    // Left or Right
    return (
        <div style={{ gridArea }} className={cn(baseClasses, "flex items-center justify-center")}>
            <div className={cn(contentWrapperClasses, "justify-center space-y-1", position === 'left' ? 'rotate-90' : '-rotate-90')}>
                <p className="font-bold leading-tight">{space.name}</p>
                {getIcon(space, 'w-8 h-8')}
            </div>
        </div>
    );
};

const GameBoard = () => {
    return (
        <div className="bg-green-200/40 p-4 aspect-square max-w-[900px] mx-auto">
            <div className="grid grid-cols-11 grid-rows-11 h-full w-full relative">
                <div className="col-start-2 col-span-9 row-start-2 row-span-9 bg-muted flex items-center justify-center">
                    <Logo className="text-5xl" />
                </div>
                {boardSpaces.map((space, index) => (
                    <BoardSpace key={space.name + index} space={space} index={index} />
                ))}
            </div>
        </div>
    );
};


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
