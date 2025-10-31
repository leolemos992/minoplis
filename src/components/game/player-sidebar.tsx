'use client';

import { Logo } from '@/components/logo';
import type { Player } from '@/lib/definitions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Banknote, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';


const playerBgColors: { [key: string]: string } = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500 text-black',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};


export function PlayerSidebar({ allPlayers, loggedInPlayerId }: { allPlayers: Player[], loggedInPlayerId: string }) {
    
  return (
    <aside className="w-72 flex-col border-r bg-slate-800 text-white hidden md:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-700 px-6">
        <Logo className="text-white" />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="px-2 text-sm font-semibold text-slate-400">Jogadores</h3>
        <Accordion type="single" collapsible defaultValue={loggedInPlayerId} className="w-full mt-2">
            {allPlayers.map(player => (
                <AccordionItem key={player.id} value={player.id} className="border-slate-700">
                    <AccordionTrigger className="w-full text-left hover:no-underline hover:bg-slate-700/50 rounded-md p-2">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback className={cn("font-bold", playerBgColors[player.color])}>
                                    {player.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold">{player.name}</p>
                                <div className="flex items-center text-xs text-slate-400">
                                    <Banknote className="mr-1 h-3 w-3" />
                                    <span>R$ {player.money}</span>
                                </div>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-2 text-slate-300 bg-slate-900/50 rounded-b-md">
                        {player.properties.length > 0 ? (
                            // TODO: List properties
                            "Propriedades aqui"
                        ): (
                            "Nenhuma propriedade ainda."
                        )}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </div>
      <div className="mt-auto border-t border-slate-700 p-4">
        <div className="flex items-center gap-3">
             <Avatar>
                <AvatarFallback className="font-bold bg-slate-600">
                    {allPlayers.find(p => p.id === loggedInPlayerId)?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="font-semibold">{allPlayers.find(p => p.id === loggedInPlayerId)?.name}</p>
                 <a href="#" className="text-xs text-slate-400 hover:text-white">Ver Perfil</a>
            </div>
        </div>
      </div>
    </aside>
  );
}
