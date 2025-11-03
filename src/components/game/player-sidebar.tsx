'use client';

import { useMemo } from 'react';
import { Logo } from '@/components/logo';
import type { LogEntry, Player } from '@/lib/definitions';
import { Banknote, MessageSquare, Users, ScrollText, Dices, LandPlot, HandCoins, UserX, UserCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { boardSpaces } from '@/lib/game-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayerToken } from './player-token';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

const propertyColorClasses: { [key: string]: string } = {
  brown: 'bg-[#955436]', lightblue: 'bg-[#aae0fa]', pink: 'bg-[#d93a96]',
  orange: 'bg-[#f7941d]', red: 'bg-[#ed1b24]', yellow: 'bg-[#fef200]',
  green: 'bg-[#1fb25a]', darkblue: 'bg-[#0072bb]',
};

const logIcons = {
    roll: <Dices className="h-4 w-4 text-blue-400" />,
    payment: <HandCoins className="h-4 w-4 text-green-400" />,
    property: <LandPlot className="h-4 w-4 text-yellow-400" />,
    jail: <UserX className="h-4 w-4 text-red-400" />,
    turn: <UserCheck className="h-4 w-4 text-purple-400" />,
    default: <Info className="h-4 w-4 text-gray-400" />,
}

export function PlayerSidebar({ allPlayers, loggedInPlayer, currentUserId, gameId, firestore }: { allPlayers: Player[], loggedInPlayer: Player | undefined, currentUserId: string | undefined, gameId: string, firestore: any }) {
    
  const ownedProperties = useMemo(() => {
    if (!loggedInPlayer) return [];
    return boardSpaces
      .filter(p => 'id' in p && loggedInPlayer.properties.includes(p.id))
      .map(p => ({
          ...p,
          isMortgaged: loggedInPlayer.mortgagedProperties.includes(p.id as string)
      }));
  }, [loggedInPlayer]);
    
  const logsRef = useMemoFirebase(() => gameId && firestore ? collection(firestore, 'games', gameId, 'logs') : null, [gameId, firestore]);
  const logsQuery = useMemoFirebase(() => logsRef ? query(logsRef, orderBy('timestamp', 'desc'), limit(50)) : null, [logsRef]);
  const { data: logs } = useCollection<LogEntry>(logsQuery);

  return (
    <aside className="w-72 flex-col border-r bg-slate-800 text-white hidden md:flex">
      <div className="flex h-14 shrink-0 items-center border-b border-slate-700 px-4">
        <Logo className="text-white" />
      </div>
      
      <div className="flex flex-col flex-1 min-h-0">
        {/* Seção Superior: Propriedades e Saldo */}
        <div className="shrink-0 p-3 border-b border-slate-700 max-h-1/2 flex flex-col">
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Meu Saldo</h3>
              <span className="text-base font-bold text-green-400">R$ {loggedInPlayer?.money.toLocaleString() || 0}</span>
            </div>
            <h3 className="text-xs font-semibold text-slate-400 mb-2 px-1 uppercase tracking-wider">Propriedades ({ownedProperties.length})</h3>
            <ScrollArea className="pr-2">
               <div className="space-y-1">
                  {ownedProperties.length > 0 ? ownedProperties.map(prop => (
                      <div key={prop.id} className="flex items-center gap-2 p-1.5 bg-slate-700/50 rounded-md text-xs">
                          <div className={cn("w-1.5 h-6 rounded-sm", 'color' in prop && propertyColorClasses[prop.color] ? propertyColorClasses[prop.color as string] : 'bg-gray-500')}></div>
                          <div className="flex-1">
                              <p className="font-medium text-slate-200 text-[11px] leading-tight">{prop.name}</p>
                               {prop.isMortgaged && <span className="text-[9px] text-red-400 font-bold">Hipotecado</span>}
                          </div>
                      </div>
                  )) : (
                      <div className="flex items-center justify-center h-full text-slate-500 text-xs p-4">
                          <p>Nenhuma propriedade ainda.</p>
                      </div>
                  )}
              </div>
            </ScrollArea>
        </div>

        {/* Seção Inferior: Abas (expansível) */}
        <div className="flex flex-col flex-1 min-h-0">
           <Tabs defaultValue="players" className="w-full flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 bg-slate-900 rounded-none h-10 shrink-0">
                  <TabsTrigger value="players" className="rounded-none text-xs h-full"><Users className="h-3.5 w-3.5 mr-1.5" />Jogadores</TabsTrigger>
                  <TabsTrigger value="chat" className="rounded-none text-xs h-full"><MessageSquare className="h-3.5 w-3.5 mr-1.5" />Chat</TabsTrigger>
                  <TabsTrigger value="log" className="rounded-none text-xs h-full"><ScrollText className="h-3.5 w-3.5 mr-1.5" />Log</TabsTrigger>
              </TabsList>
              
              <TabsContent value="players" className="flex-1 p-2 min-h-0">
                   <ScrollArea className="h-full">
                      <div className="space-y-2 pr-2">
                          {allPlayers.map(player => (
                              <div key={player.id} className="flex items-center gap-3 p-1.5 rounded-md hover:bg-slate-700/50">
                                  <PlayerToken player={player} size={8} />
                                  <div className="flex-1 text-left">
                                      <p className="font-semibold flex items-center gap-2 text-sm">
                                          {player.name}
                                          {player.id === currentUserId && <span className="text-[10px] text-green-400">(Você)</span>}
                                      </p>
                                      <div className="flex items-center text-xs text-slate-400">
                                          <Banknote className="mr-1 h-3 w-3" />
                                          <span>R$ {player.money.toLocaleString()}</span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                   </ScrollArea>
              </TabsContent>
              <TabsContent value="chat" className="flex-1 p-4 flex items-center justify-center text-slate-500 text-sm">
                  <p>Chat em breve...</p>
              </TabsContent>
               <TabsContent value="log" className="flex-1 p-2 min-h-0">
                   <ScrollArea className="h-full">
                      <div className="space-y-2 pr-2 text-xs">
                          {logs?.map(log => (
                              <div key={log.id} className="flex items-start gap-2 p-1.5 rounded-md text-slate-300">
                                  <div className="mt-0.5">{logIcons[log.type as keyof typeof logIcons] || logIcons.default}</div>
                                  <p className="flex-1" dangerouslySetInnerHTML={{ __html: log.message }} />
                              </div>
                          ))}
                           {!logs && <p className="text-center text-slate-500">Nenhum evento ainda.</p>}
                      </div>
                   </ScrollArea>
              </TabsContent>
          </Tabs>
        </div>
      </div>
    </aside>
  );
}
