'use client';

import { Logo } from '@/components/logo';
import type { Player, UserProfile } from '@/lib/definitions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Banknote, Award, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';


const playerBgColors: { [key: string]: string } = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500 text-black',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};


export function PlayerSidebar({ allPlayers, loggedInPlayerId }: { allPlayers: Player[], loggedInPlayerId: string }) {
    const firestore = useFirestore();
    const userIds = useMemo(() => allPlayers.map(p => p.userId), [allPlayers]);
    
    // In a real app, you might want a more efficient way to fetch profiles if userIds change frequently.
    const usersRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: userProfiles } = useCollection<UserProfile>(usersRef);

    const getPlayerProfile = (userId: string) => {
        return userProfiles?.find(p => p.uid === userId);
    }
    
  return (
    <aside className="w-72 flex-col border-r bg-slate-800 text-white hidden md:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-700 px-6">
        <Logo className="text-white" />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="px-2 text-sm font-semibold text-slate-400">Jogadores</h3>
        <Accordion type="single" collapsible defaultValue={loggedInPlayerId} className="w-full mt-2">
            {allPlayers.map(player => {
                const profile = getPlayerProfile(player.userId);
                return (
                 <AccordionItem key={player.id} value={player.id} className="border-slate-700">
                    <AccordionTrigger className="w-full text-left hover:no-underline hover:bg-slate-700/50 rounded-md p-2">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback className={cn("font-bold", playerBgColors[player.color])}>
                                    {player.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                                <p className="font-semibold flex items-center gap-2">{player.name} {profile && <span className="flex items-center text-xs text-yellow-400"><Star className="w-3 h-3 mr-1" /> Nv. {profile.level}</span>}</p>
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
                )
            })}
        </Accordion>
      </div>
      <div className="mt-auto border-t border-slate-700 p-4">
         {/* Could show logged-in user's global stats here */}
      </div>
    </aside>
  );
}
