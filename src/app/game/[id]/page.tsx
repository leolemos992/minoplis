
'use client';

import { useSearchParams } from 'next/navigation';
import { characters, boardSpaces } from '@/lib/game-data';
import { notFound } from 'next/navigation';
import { GameActions } from '@/components/game/game-actions';
import { PlayerHud } from '@/components/game/player-hud';
import { Home, Zap, Building, HelpCircle, Briefcase, Gem, Users, Train } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Property } from '@/lib/definitions';
import { Logo } from '@/components/logo';

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
        case 'jail': return <Building className={size} />;
        case 'free-parking': return <Briefcase className={size}/>;
        case 'go-to-jail': return <Zap className={size} />;
        case 'community-chest': return <Users className={size} />;
        case 'chance': return <HelpCircle className={size} />;
        case 'income-tax': return <div className="text-center text-[10px] leading-tight"><p className="font-bold">Imposto de Renda</p><p>R$200</p></div>;
        case 'luxury-tax': return <div className="text-center text-[10px] leading-tight"><Gem className="mx-auto" /><p className="font-bold">Imposto de Luxo</p><p>R$100</p></div>;
        case 'railroad': return <Train className={size} />
        case 'utility': 
            if(space.name.includes("Elétrica")) return <Zap className={size} />
            return <Gem className={size} />; // Placeholder for water works
        default: return null;
    }
}

const BoardSpace = ({ space, index }: { space: any, index: number }) => {
    const isProperty = 'price' in space;
    const baseClasses = "border border-black flex items-center justify-center text-center text-xs p-1 relative";

    // Corners
    if ([0, 10, 20, 30].includes(index)) {
         const rotation: { [key: number]: string } = {
            0: 'rotate-[135deg]',
            10: 'rotate-[225deg]',
            20: 'rotate-[-45deg]',
            30: 'rotate-[45deg]',
        }
        return (
            <div className={cn(baseClasses, "z-10")} style={{ gridArea: `space-${index}` }}>
                 <div className={cn("flex flex-col items-center justify-center space-y-1", rotation[index] )}>
                    <div className="transform-gpu">{getIcon(space, "w-10 h-10")}</div>
                    <span className="font-bold block w-20">{space.name}</span>
                </div>
            </div>
        )
    }
    
    // Top Row (21-29)
    if (index > 20 && index < 30) {
       return (
         <div style={{ gridArea: `space-${index}`}} className={cn(baseClasses, "flex-col-reverse")}>
             {isProperty && <div className={cn("h-5 w-full", colorClasses[(space as Property).color])} />}
             <div className="flex-1 flex flex-col justify-center items-center text-center p-1 text-[9px]">
                {getIcon(space, "w-6 h-6")}
                <span className="font-bold px-1 leading-tight">{space.name}</span>
                {isProperty && <span className="font-normal mt-1">R${(space as Property).price}</span>}
             </div>
         </div>
       )
    }

    // Bottom Row (1-9)
    if (index > 0 && index < 10) {
        return (
         <div style={{ gridArea: `space-${index}`}} className={cn(baseClasses, "flex-col")}>
             {isProperty && <div className={cn("h-5 w-full", colorClasses[(space as Property).color])} />}
             <div className="flex-1 flex flex-col justify-center items-center text-center p-1 text-[9px]">
                {getIcon(space, "w-6 h-6")}
                <span className="font-bold px-1 leading-tight">{space.name}</span>
                {isProperty && <span className="font-normal mt-1">R${(space as Property).price}</span>}
             </div>
         </div>
       )
    }

    // Left Row (11-19)
    if (index > 10 && index < 20) {
        return (
         <div style={{ gridArea: `space-${index}`}} className={cn(baseClasses, "flex-row-reverse")}>
             {isProperty && <div className={cn("w-5 h-full", colorClasses[(space as Property).color])} />}
             <div className="flex-1 flex flex-col justify-center items-center text-center p-1 text-[9px] -rotate-90">
                {getIcon(space, "w-6 h-6")}
                <span className="font-bold px-1 leading-tight block">{space.name}</span>
                {isProperty && <span className="font-normal mt-1">R${(space as Property).price}</span>}
             </div>
         </div>
       )
    }

    // Right Row (31-39)
    if (index > 30 && index < 40) {
         return (
         <div style={{ gridArea: `space-${index}`}} className={cn(baseClasses, "flex-row")}>
             {isProperty && <div className={cn("w-5 h-full", colorClasses[(space as Property).color])} />}
             <div className="flex-1 flex flex-col justify-center items-center text-center p-1 text-[9px] rotate-90">
                {getIcon(space, "w-6 h-6")}
                <span className="font-bold px-1 leading-tight block">{space.name}</span>
                {isProperty && <span className="font-normal mt-1">R${(space as Property).price}</span>}
             </div>
         </div>
       )
    }

    return null;
};

const GameBoard = () => {
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
                <div className="bg-muted flex items-center justify-center" style={{ gridArea: 'center'}}>
                    <Logo className="text-3xl sm:text-5xl" />
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
}: {
  params: { id: string };
}) {
  const searchParams = useSearchParams();
  const characterId = searchParams.get('character');
  const selectedCharacter = characters.find(
    (c) => c.id === characterId
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
        <h1 className="text-2xl font-bold mb-4">Jogo: MINOPLIS</h1>
        <GameBoard />
      </div>
      <aside className="lg:col-span-1 space-y-8">
        <PlayerHud player={mockPlayer} />
        <GameActions />
      </aside>
    </div>
  );
}
