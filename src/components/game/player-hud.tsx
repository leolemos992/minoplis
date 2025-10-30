'use client';

import { useState, useEffect } from 'react';
import type { Player } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Wallet, Landmark } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PlayerHudProps {
    player: Player;
}

export function PlayerHud({ player }: PlayerHudProps) {
  const [formattedMoney, setFormattedMoney] = useState(player.money.toString());

  useEffect(() => {
    setFormattedMoney(player.money.toLocaleString('pt-BR'));
  }, [player.money]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={player.character.image} alt={player.character.name} data-ai-hint={player.character.imageHint} />
                <AvatarFallback>{player.character.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle>{player.name}</CardTitle>
                <CardDescription>como {player.character.name}</CardDescription>
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
