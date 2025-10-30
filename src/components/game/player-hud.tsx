'use client';

import { useState, useEffect } from 'react';
import type { Player } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Wallet, Landmark } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { totems } from '@/lib/game-data';
import { cn } from '@/lib/utils';

const playerColors: { [key: string]: { border: string, text: string } } = {
  red: { border: 'border-red-500', text: 'text-red-500' },
  blue: { border: 'border-blue-500', text: 'text-blue-500' },
  green: { border: 'border-green-500', text: 'text-green-500' },
  yellow: { border: 'border-yellow-500', text: 'text-yellow-500' },
  purple: { border: 'border-purple-500', text: 'text-purple-500' },
  orange: { border: 'border-orange-500', text: 'text-orange-500' },
};


interface PlayerHudProps {
    player: Player;
}

export function PlayerHud({ player }: PlayerHudProps) {
  const [formattedMoney, setFormattedMoney] = useState('');

  useEffect(() => {
    // Format money on the client to avoid hydration mismatch
    setFormattedMoney(player.money.toLocaleString('pt-BR'));
  }, [player.money]);

  const totem = totems.find(t => t.id === player.totem);
  const TotemIcon = totem ? totem.icon : null;
  const color = playerColors[player.color] || { border: 'border-gray-500', text: 'text-gray-500' };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <Avatar className={cn("h-16 w-16 border-2", color.border)}>
                <div className={cn("h-full w-full flex items-center justify-center rounded-full bg-white dark:bg-zinc-800")}>
                    {TotemIcon && <TotemIcon className={cn("h-8 w-8", color.text)} />}
                </div>
            </Avatar>
            <div>
                <CardTitle>{player.name}</CardTitle>
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
        <Separator/>
        <div>
            <div className="flex items-center gap-2 font-semibold mb-2">
                <Landmark className="h-5 w-5 text-muted-foreground"/>
                <span>Propriedades ({player.properties.length})</span>
            </div>
            {player.properties.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 bg-muted/50 rounded-md">Nenhuma propriedade ainda.</p>
            ) : (
                <ul className="space-y-2">
                   {/* Lista de propriedades irá aqui */}
                </ul>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
