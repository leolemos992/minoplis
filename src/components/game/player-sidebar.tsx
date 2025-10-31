'use client';

import { useMemo } from 'react';
import { Logo } from '@/components/logo';
import type { Player } from '@/lib/definitions';
import { Banknote, MessageSquare, Users, ScrollText, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { boardSpaces } from '@/lib/game-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const propertyColorClasses: { [key: string]: string } = {
  brown: 'bg-[#955436]', lightblue: 'bg-[#aae0fa]', pink: 'bg-[#d93a96]',
  orange: 'bg-[#f7941d]', red: 'bg-[#ed1b24]', yellow: 'bg-[#fef200]',
  green: 'bg-[#1fb25a]', darkblue: 'bg-[#0072bb]',
};

const playerBgColors: { [key: string]: string } = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500 text-black',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};


export function PlayerSidebar({ allPlayers, loggedInPlayer }: { allPlayers: Player[], loggedInPlayer: Player | undefined }) {
    
  const ownedProperties = useMemo(() => {
    if (!loggedInPlayer) return [];
    return boardSpaces
      .filter(p => 'id' in p && loggedInPlayer.properties.includes(p.id))
      .map(p => ({
          ...p,
          isMortgaged: loggedInPlayer.mortgagedProperties.includes(p.id as string)
      }));
  }, [loggedInPlayer]);
    
  return (
    <aside className="w-72 flex-col border-r bg-slate-800 text-white hidden md:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-700 px-6">
        <Logo className="text-white" />
      </div>
      
      {/* Secção Superior: Propriedades e Saldo */}
      <div className="flex flex-col p-4 border-b border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-slate-400">Meu Saldo</h3>
            <span className="text-lg font-bold text-green-400">R$ {loggedInPlayer?.money.toLocaleString() || 0}</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Minhas Propriedades ({ownedProperties.length})</h3>
          <ScrollArea className="h-64">
             <div className="pr-4 space-y-2">
                {ownedProperties.length > 0 ? ownedProperties.map(prop => (
                    <div key={prop.id} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-md text-xs">
                        <div className={cn("w-2 h-8 rounded-sm", 'color' in prop && propertyColorClasses[prop.color] ? propertyColorClasses[prop.color as string] : 'bg-gray-500')}></div>
                        <div className="flex-1">
                            <p className="font-semibold">{prop.name}</p>
                             {prop.isMortgaged && <Badge variant="destructive" className="mt-1">Hipotecado</Badge>}
                        </div>
                    </div>
                )) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        <p>Nenhuma propriedade ainda.</p>
                    </div>
                )}
            </div>
          </ScrollArea>
      </div>

      {/* Secção Inferior: Abas */}
      <div className="flex-1 flex flex-col min-h-0">
         <Tabs defaultValue="players" className="w-full flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-slate-900 rounded-none h-12">
                <TabsTrigger value="players" className="rounded-none"><Users className="h-4 w-4 mr-2" />Jogadores</TabsTrigger>
                <TabsTrigger value="chat" className="rounded-none"><MessageSquare className="h-4 w-4 mr-2" />Chat</TabsTrigger>
                <TabsTrigger value="log" className="rounded-none"><ScrollText className="h-4 w-4 mr-2" />Log</TabsTrigger>
            </TabsList>
            
            <TabsContent value="players" className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                    {allPlayers.map(player => (
                         <div key={player.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-700/50">
                            <Avatar>
                                <AvatarFallback className={cn("font-bold", playerBgColors[player.color])}>
                                    {player.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                                <p className="font-semibold flex items-center gap-2">
                                    {player.name}
                                    {player.id === loggedInPlayer?.id && <span className="text-xs text-green-400">(Você)</span>}
                                </p>
                                <div className="flex items-center text-xs text-slate-400">
                                    <Banknote className="mr-1 h-3 w-3" />
                                    <span>R$ {player.money.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="chat" className="flex-1 overflow-y-auto p-4 flex items-center justify-center text-slate-500">
                <p>Chat em breve...</p>
            </TabsContent>
            <TabsContent value="log" className="flex-1 overflow-y-auto p-4 flex items-center justify-center text-slate-500">
                <p>Log do jogo em breve...</p>
            </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}
