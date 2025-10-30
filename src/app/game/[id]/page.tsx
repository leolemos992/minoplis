import { characters, boardSpaces } from '@/lib/game-data';
import { notFound } from 'next/navigation';
import { GameActions } from '@/components/game/game-actions';
import { PlayerHud } from '@/components/game/player-hud';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Zap, Train, Diamond, Building, HelpCircle, Briefcase, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Property } from '@/lib/definitions';

const colorClasses: { [key: string]: string } = {
  brown: 'bg-[#955436]',
  lightblue: 'bg-[#aae0fa]',
  pink: 'bg-[#d93a96]',
  orange: 'bg-[#f7941d]',
  red: 'bg-[#ed1b24]',
  yellow: 'bg-[#fef200]',
  green: 'bg-[#1fb25a]',
  darkblue: 'bg-[#0072bb]',
  railroad: 'bg-gray-400',
  utility: 'bg-gray-300',
};


const BoardSpace = ({ space, isCorner, isSide }: { space: any, isCorner: boolean, isSide: boolean }) => {
    const isProperty = 'price' in space;

    const getIcon = (type: string) => {
        switch(type) {
            case 'go': return <Home className="w-8 h-8"/>;
            case 'jail': return <Building className="w-8 h-8"/>;
            case 'free-parking': return <Briefcase className="w-8 h-8"/>;
            case 'go-to-jail': return <Zap className="w-8 h-8"/>;
            case 'community-chest': return <Users className="w-8 h-8"/>;
            case 'chance': return <HelpCircle className="w-8 h-8"/>;
            case 'income-tax': return <div className="text-center"><p className="font-bold text-xs">Imposto de Renda</p><p>$200</p></div>;
            case 'luxury-tax': return <div className="text-center"><Gem className="mx-auto" /><p className="font-bold text-xs">Imposto de Luxo</p><p>$100</p></div>;
            case 'railroad': return <Train className="w-8 h-8"/>
            case 'utility': return <Zap className="w-8 h-8"/>
            default: return null;
        }
    }

    if (isCorner) {
        return (
            <div className="w-24 h-24 border border-black flex items-center justify-center text-center text-xs p-1">
                {getIcon(space.type)}
                <span className="absolute bottom-1">{space.name}</span>
            </div>
        )
    }

    if (isSide) {
         if (isProperty) {
            return (
                <div className="w-[4.5rem] h-24 border border-black flex flex-col justify-between">
                    <div className={cn("h-6", colorClasses[space.color])}></div>
                    <div className="text-center text-[8px] font-bold px-1 flex-1 flex items-center justify-center">{space.name}</div>
                    <div className="text-center text-[8px] pb-1">${space.price}</div>
                </div>
            )
        }
        return (
             <div className="w-[4.5rem] h-24 border border-black flex flex-col items-center justify-center text-center text-[8px] p-1">
                {getIcon(space.type)}
                <span className="font-bold mt-1">{space.name}</span>
            </div>
        )
    }


    return <div></div>
}

const GameBoard = () => {
    const topRow = boardSpaces.slice(20, 31).reverse();
    const leftRow = boardSpaces.slice(11, 20).reverse();
    const bottomRow = boardSpaces.slice(0, 11);
    const rightRow = boardSpaces.slice(31, 40);

    return (
        <div className="bg-green-200/40 p-4 aspect-square w-full">
            <div className="grid grid-cols-[auto_repeat(9,1fr)_auto] grid-rows-[auto_repeat(9,1fr)_auto] w-full h-full">
                 {/* Canto Superior Esquerdo */}
                <BoardSpace space={boardSpaces[20]} isCorner={true} isSide={false} />

                {/* Linha Superior */}
                {topRow.slice(1).map((space, i) => (
                    <div key={i} className="flex flex-col border border-black">
                        { 'price' in space ? (
                            <>
                                <div className={cn("w-full h-5", colorClasses[(space as Property).color])}></div>
                                <div className="text-center text-[8px] font-bold px-1 flex-1 flex items-center justify-center">{space.name}</div>
                                <div className="text-center text-[8px] pb-1">${(space as Property).price}</div>
                            </>
                        ) : (
                             <div className="flex-1 flex flex-col items-center justify-center text-center text-[8px] p-1">
                                {space.type === 'chance' && <HelpCircle className="w-6 h-6" />}
                                <span className="font-bold mt-1">{space.name}</span>
                            </div>
                        )}
                    </div>
                ))}
                
                {/* Canto Superior Direito */}
                <BoardSpace space={boardSpaces[30]} isCorner={true} isSide={false} />

                {/* Linha Esquerda */}
                 {leftRow.map((space, i) => (
                     <div key={i} className="flex border border-black">
                         { 'price' in space ? (
                             <>
                                <div className={cn("w-5 h-full", colorClasses[(space as Property).color])}></div>
                                <div className="text-center text-[8px] font-bold p-1 flex-1 flex items-center justify-center -rotate-90">{space.name}</div>
                                <div className="text-center text-[8px] pb-1 self-center -rotate-90">${(space as Property).price}</div>
                             </>
                         ) : (
                              <div className="flex-1 flex flex-col items-center justify-center text-center text-[8px] p-1">
                                 {space.type === 'community-chest' && <Users className="w-6 h-6" />}
                                 <span className="font-bold mt-1 -rotate-90">{space.name}</span>
                             </div>
                         )}
                     </div>
                ))}
               
                {/* Centro */}
                <div className="col-span-9 row-span-9 bg-muted flex items-center justify-center">
                    <Logo />
                </div>

                {/* Linha Direita */}
                {rightRow.map((space, i) => (
                    <div key={i} className="flex border border-black">
                         { 'price' in space ? (
                             <>
                                <div className="text-center text-[8px] pb-1 self-center rotate-90">${(space as Property).price}</div>
                                <div className="text-center text-[8px] font-bold p-1 flex-1 flex items-center justify-center rotate-90">{space.name}</div>
                                <div className={cn("w-5 h-full", colorClasses[(space as Property).color])}></div>
                             </>
                         ) : (
                              <div className="flex-1 flex flex-col items-center justify-center text-center text-[8px] p-1">
                                 {space.type === 'chance' && <HelpCircle className="w-6 h-6" />}
                                 {space.type === 'community-chest' && <Users className="w-6 h-6" />}
                                 {space.type === 'luxury-tax' && <Gem className="w-6 h-6" />}
                                 <span className="font-bold mt-1 rotate-90">{space.name}</span>
                                 {space.type === 'luxury-tax' && <span className="font-bold mt-1 rotate-90">$100</span>}
                             </div>
                         )}
                     </div>
                ))}

                {/* Canto Inferior Esquerdo */}
                <BoardSpace space={boardSpaces[10]} isCorner={true} isSide={false} />
                
                {/* Bottom Row */}
                {bottomRow.slice(1,10).reverse().map((space, i) => (
                     <div key={i} className="flex flex-col border border-black">
                        { 'price' in space ? (
                            <>
                                <div className="text-center text-[8px] pt-1">${(space as Property).price}</div>
                                <div className="text-center text-[8px] font-bold px-1 flex-1 flex items-center justify-center">{space.name}</div>
                                <div className={cn("w-full h-5", colorClasses[(space as Property).color])}></div>
                            </>
                        ) : (
                             <div className="flex-1 flex flex-col items-center justify-center text-center text-[8px] p-1">
                                {space.type === 'chance' && <HelpCircle className="w-6 h-6" />}
                                {space.type === 'community-chest' && <Users className="w-6 h-6" />}
                                 {space.type === 'income-tax' && <Gem className="w-6 h-6" />}
                                <span className="font-bold mt-1">{space.name}</span>
                                {space.type === 'income-tax' && <span className="font-bold mt-1">$200</span>}
                            </div>
                        )}
                    </div>
                ))}

                {/* Canto Inferior Direito */}
                <BoardSpace space={boardSpaces[0]} isCorner={true} isSide={false} />
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
