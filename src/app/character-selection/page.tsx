'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { totems } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { ArrowRight, Palette } from 'lucide-react';

const playerColors = [
  { id: 'red', name: 'Vermelho', class: 'bg-red-500' },
  { id: 'blue', name: 'Azul', class: 'bg-blue-500' },
  { id: 'green', name: 'Verde', class: 'bg-green-500' },
  { id: 'yellow', name: 'Amarelo', class: 'bg-yellow-500' },
  { id: 'purple', name: 'Roxo', class: 'bg-purple-500' },
  { id: 'orange', name: 'Laranja', class: 'bg-orange-500' },
];

export default function CharacterSelectionPage() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');
  const gameName = searchParams.get('gameName');

  const [playerName, setPlayerName] = useState('');
  const [selectedTotem, setSelectedTotem] = useState(totems[0].id);
  const [selectedColor, setSelectedColor] = useState(playerColors[0].id);

  const totem = totems.find(t => t.id === selectedTotem);
  const TotemIcon = totem ? totem.icon : null;

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Crie seu Jogador</CardTitle>
          <CardDescription>
            Escolha seu nome, totem e cor para entrar no jogo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Jogador</Label>
              <Input
                id="name"
                placeholder="Ex: 'Jogador Audacioso'"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <Label>Escolha seu Totem</Label>
              <RadioGroup
                value={selectedTotem}
                onValueChange={setSelectedTotem}
                className="grid grid-cols-3 gap-4"
              >
                {totems.map((totem) => (
                  <div key={totem.id}>
                    <RadioGroupItem
                      value={totem.id}
                      id={totem.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={totem.id}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <totem.icon className="mb-2 h-8 w-8" />
                      {totem.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-6 rounded-lg bg-muted/50 p-8">
             <h3 className="text-lg font-medium">Sua Pré-visualização</h3>
             <div className="relative">
                {TotemIcon && <TotemIcon className={cn("h-24 w-24", playerColors.find(c => c.id === selectedColor)?.class.replace('bg-', 'text-'))} />}
             </div>
             <p className="text-xl font-semibold">{playerName || "Seu Nome"}</p>
             <div className="space-y-2">
                <Label className="flex items-center gap-2"><Palette/> Cor do Jogador</Label>
                <div className="flex flex-wrap justify-center gap-2">
                    {playerColors.map(color => (
                        <button key={color.id} onClick={() => setSelectedColor(color.id)} className={cn("h-8 w-8 rounded-full border-2 transition-transform hover:scale-110", color.class, selectedColor === color.id ? 'border-primary ring-2 ring-primary' : 'border-transparent' )} aria-label={`Select ${color.name} color`}/>
                    ))}
                </div>
             </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild className="group" disabled={!playerName}>
            <Link
              href={`/game/${gameId}?playerName=${encodeURIComponent(
                playerName
              )}&totem=${selectedTotem}&color=${selectedColor}&gameName=${encodeURIComponent(
                gameName || 'MINOPOLIS'
              )}`}
            >
              Entrar no Jogo
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
