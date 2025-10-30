'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { boardSpaces, totems } from '@/lib/game-data';
import { notFound } from 'next/navigation';
import { GameActions } from '@/components/game/game-actions';
import { PlayerHud } from '@/components/game/player-hud';
import { Home, Zap, Building, HelpCircle, Briefcase, Gem, Train } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Player, Property } from '@/lib/definitions';
import { Logo } from '@/components/logo';
import { PlayerToken } from '@/components/game/player-token';

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
        case 'community-chest': return <HelpCircle className={size} />;
        case 'chance': return <HelpCircle className={size} />;
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

const BoardSpace = ({ space, index, children }: { space: any, index: number, children?: React.ReactNode }) => {
    const isProperty = 'price' in space;
    const baseClasses = "border border-black flex items-center justify-center text-center text-xs p-1 relative";
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
            <div className={cn(baseClasses, "z-10")} style={{ gridArea: `space-${index}` }}>
                 <div className={cn("flex flex-col items-center justify-center h-full w-full", cornerTextRotation[index] )}>
                    <div className="transform-gpu">{getIcon(space, "w-10 h-10")}</div>
                    <span className="font-bold block w-20">{space.name}</span>
                </div>
                 {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
            </div>
        )
    }

    return (
         <div style={{ gridArea: `space-${index}`}} className={cn(baseClasses, rotationClasses[index])}>
            {content}
            {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
         </div>
    )
};

const GameBoard = ({ players }: { players: Player[] }) => {
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
                    <BoardSpace key={space.name + index} space={space} index={index}>
                         <div className="relative w-full h-full flex flex-wrap items-center justify-center gap-1 p-1">
                            {players.filter(p => p.position === index).map(p => (
                                <PlayerToken key={p.id} player={p} />
                            ))}
                        </div>
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
  });

  const handleDiceRoll = (dice1: number, dice2: number) => {
    const total = dice1 + dice2;
    setPlayer(prevPlayer => {
        const newPosition = (prevPlayer.position + total) % 40;
        // Handle passing GO
        if (newPosition < prevPlayer.position) {
            return { ...prevPlayer, position: newPosition, money: prevPlayer.money + 200 };
        }
        return { ...prevPlayer, position: newPosition };
    });
  };

  return (
    <div className="p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-bold mb-4">Jogo: {gameName}</h1>
        <GameBoard players={[player]}/>
      </div>
      <aside className="lg:col-span-1 space-y-8">
        <PlayerHud player={player} />
        <GameActions onDiceRoll={handleDiceRoll} />
      </aside>
    </div>
  );
}
