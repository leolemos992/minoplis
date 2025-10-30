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

const BoardSpace = ({ space, position }: { space: any, position: 'corner' | 'top' | 'bottom' | 'left' | 'right' }) => {
    const isProperty = 'price' in space;

    if (position === 'corner') {
        const rotation: { [key: number]: string } = {
            0: 'rotate-[225deg]',  // Go
            10: 'rotate-[315deg]', // Jail
            20: '-rotate-45',   // Free Parking
            30: 'rotate-45',    // Go to Jail
        }
        return (
            <div className="w-28 h-28 border border-black flex items-center justify-center text-center text-xs p-1 relative">
                 <div className={cn("flex flex-col items-center justify-center space-y-1", rotation[space.position] )}>
                    <div className="transform-gpu">{getIcon(space, "w-10 h-10")}</div>
                    <span className="font-bold block w-20">{space.name}</span>
                </div>
            </div>
        )
    }

    const textContainerClasses = {
        top: 'text-center',
        bottom: 'text-center',
        left: 'text-center w-28 -rotate-90',
        right: 'text-center w-28 rotate-90',
    };

    const mainDivClasses = {
      top: 'flex-col-reverse h-28',
      bottom: 'flex-col h-28',
      left: 'flex-row w-28',
      right: 'flex-row-reverse w-28',
    }

    const colorDivClasses = {
        top: 'h-7 w-full',
        bottom: 'h-7 w-full',
        left: 'w-7 h-full',
        right: 'w-7 h-full',
    }
    
    if (isProperty) {
      const property = space as Property;
      return (
        <div className={cn("border border-black flex", mainDivClasses[position])}>
            <div className={cn("flex-shrink-0", colorClasses[property.color], colorDivClasses[position])} />
            <div className={cn("flex flex-col justify-around items-center p-1 flex-1", textContainerClasses[position])}>
                {property.color === "railroad" || property.color === "utility" ? getIcon(property, "w-6 h-6") : null}
                <span className="text-[9px] font-bold px-1">{property.name}</span>
                <span className="text-[9px] font-normal mt-1">${property.price}</span>
            </div>
        </div>
      )
    }

    // Not a property, not a corner
    return (
        <div className={cn("border border-black flex items-center justify-center", mainDivClasses[position])}>
            <div className={cn("text-[9px] p-1 space-y-1 flex flex-col justify-around items-center", textContainerClasses[position])}>
                {getIcon(space)}
                <p className="font-bold">{space.name}</p>
            </div>
        </div>
    )
}

const GameBoard = () => {
    // Bottom row (indices 9 to 1)
    const bottomRow = boardSpaces.slice(1, 10).reverse();
    // Left row (indices 19 to 11)
    const leftRow = boardSpaces.slice(11, 20).reverse();
    // Top row (indices 21 to 29)
    const topRow = boardSpaces.slice(21, 30);
    // Right row (indices 31 to 39)
    const rightRow = boardSpaces.slice(31, 40);

    return (
        <div className="bg-green-200/40 p-4 aspect-square max-w-[900px] mx-auto">
            <div className="grid grid-cols-11 grid-rows-11 w-full h-full relative">
                {/* Corners */}
                <div className="col-start-11 row-start-11"><BoardSpace space={{...boardSpaces[0], position: 0}} position="corner" /></div>
                <div className="col-start-1 row-start-11"><BoardSpace space={{...boardSpaces[10], position: 10}} position="corner" /></div>
                <div className="col-start-1 row-start-1"><BoardSpace space={{...boardSpaces[20], position: 20}} position="corner" /></div>
                <div className="col-start-11 row-start-1"><BoardSpace space={{...boardSpaces[30], position: 30}} position="corner" /></div>
                
                {/* Bottom Row */}
                {bottomRow.map((space, index) => (
                    <div key={space.id || space.name} className={`col-start-${index + 2} row-start-11`}>
                        <BoardSpace space={space} position="bottom" />
                    </div>
                ))}
                
                {/* Left Row */}
                {leftRow.map((space, index) => (
                     <div key={space.id || space.name} className={`col-start-1 row-start-${index + 2}`}>
                        <BoardSpace space={space} position="left" />
                    </div>
                ))}

                {/* Top Row */}
                {topRow.map((space, index) => (
                    <div key={space.id || space.name} className={`col-start-${index + 2} row-start-1`}>
                        <BoardSpace space={space} position="top" />
                    </div>
                ))}

                {/* Right Row */}
                {rightRow.map((space, index) => (
                    <div key={space.id || space.name} className={`col-start-11 row-start-${index + 2}`}>
                        <BoardSpace space={space} position="right" />
                    </div>
                ))}

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
