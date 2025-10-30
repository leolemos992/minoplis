'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Player, Property } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Wallet, Landmark, Shield, Home, Hotel, Gavel, Banknote } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { totems, boardSpaces } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { PlayerToken } from './player-token';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

const playerColors: { [key: string]: { border: string, text: string, bg: string } } = {
  red: { border: 'border-red-500', text: 'text-red-500', bg: 'bg-red-500' },
  blue: { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500' },
  green: { border: 'border-green-500', text: 'text-green-500', bg: 'bg-green-500' },
  yellow: { border: 'border-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-500' },
  purple: { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500' },
  orange: { border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-500' },
};


interface PlayerHudProps {
    player: Player;
}

const propertyColorClasses: { [key: string]: string } = {
  brown: 'bg-[#955436]',
  lightblue: 'bg-[#aae0fa]',
  pink: 'bg-[#d93a96]',
  orange: 'bg-[#f7941d]',
  red: 'bg-[#ed1b24]',
  yellow: 'bg-[#fef200]',
  green: 'bg-[#1fb25a]',
  darkblue: 'bg-[#0072bb]',
};

export function PlayerHud({ player }: PlayerHudProps) {
  const [formattedMoney, setFormattedMoney] = useState('');
  const totemData = totems.find(t => t.id === player.totem);
  const TotemIcon = totemData?.icon;


  useEffect(() => {
    // Format money on the client to avoid hydration mismatch
    setFormattedMoney(player.money.toLocaleString('pt-BR'));
  }, [player.money]);

  const color = playerColors[player.color] || { border: 'border-gray-500', text: 'text-gray-500', bg: 'bg-gray-500' };

  const HouseDisplay = ({ count }: { count: number}) => {
    if (count === 0) return null;
    if (count === 5) {
        return <Hotel className="w-4 h-4 text-red-700" />;
    }
    return (
        <div className="flex gap-px">
            {Array.from({ length: count }).map((_, i) => (
                <Home key={i} className="w-3 h-3 text-green-700" />
            ))}
        </div>
    )
  };

  const allPlayerProperties = useMemo(() => {
    return player.properties.map(id => {
      const property = boardSpaces.find(p => 'id' in p && p.id === id) as Property | undefined;
      const isMortgaged = player.mortgagedProperties.includes(id);
      return { ...property, id, isMortgaged };
    }).sort((a, b) => {
        if (!a.color || !b.color) return 0;
        if (a.color < b.color) return -1;
        if (a.color > b.color) return 1;
        return 0;
    });
  }, [player.properties, player.mortgagedProperties]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <div className={cn("relative h-16 w-16 rounded-full flex items-center justify-center p-1", color.bg)}>
                 {TotemIcon && <TotemIcon className="h-10 w-10 text-white drop-shadow-md" />}
                 {player.inJail && (
                     <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border-2 border-destructive">
                         <Gavel className="h-4 w-4 text-destructive"/>
                     </div>
                 )}
            </div>
            <div>
                <CardTitle>{player.name}</CardTitle>
                {player.inJail && <Badge variant="destructive" className="mt-1">Na Prisão</Badge>}
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-lg font-semibold">
            <div className="flex items-center gap-2 text-green-600">
                <Wallet className="h-5 w-5" />
                <span>Dinheiro</span>
            </div>
            <span>R${formattedMoney}</span>
        </div>
        
        {player.getOutOfJailFreeCards > 0 && (
             <>
             <Separator/>
                <div className="flex items-center justify-between text-sm font-semibold">
                    <div className="flex items-center gap-2 text-blue-600">
                        <Shield className="h-5 w-5" />
                        <span>Cartas "Sair da Prisão"</span>
                    </div>
                    <span>{player.getOutOfJailFreeCards}</span>
                </div>
            </>
        )}

        <Separator/>
        <div>
            <div className="flex items-center gap-2 font-semibold mb-2">
                <Landmark className="h-5 w-5 text-muted-foreground"/>
                <span>Propriedades ({player.properties.length})</span>
            </div>
            <ScrollArea className="h-48">
              {player.properties.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 bg-muted/50 rounded-md">Nenhuma propriedade ainda.</p>
              ) : (
                  <ul className="space-y-2 pr-4">
                    {allPlayerProperties.map(property => {
                      if (!property || !property.id) return null;
                      const houseCount = player.houses[property.id] || 0;

                      return (
                        <li key={property.id} className={cn("flex items-center justify-between text-sm p-2 rounded-md", property.isMortgaged ? "bg-destructive/10" : "bg-muted/50")}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-6 rounded-sm", property.color && propertyColorClasses[property.color])}></div>
                            <span className={cn("font-medium", property.isMortgaged && 'line-through')}>{property.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {property.isMortgaged && <Banknote className="h-4 w-4 text-destructive" title="Hipotecado" />}
                            <HouseDisplay count={houseCount} />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
              )}
            </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
