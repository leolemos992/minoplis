'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { useUser, useFirestore, FirestorePermissionError, errorEmitter } from '@/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import type { Player } from '@/lib/definitions';

const playerColors = [
  { id: 'red', name: 'Vermelho', class: 'bg-red-500' },
  { id: 'blue', name: 'Azul', class: 'bg-blue-500' },
  { id: 'green', name: 'Verde', class: 'bg-green-500' },
  { id: 'yellow', name: 'Amarelo', class: 'bg-yellow-500' },
  { id: 'purple', name: 'Roxo', class: 'bg-purple-500' },
  { id: 'orange', name: 'Laranja', class: 'bg-orange-500' },
];

export default function CharacterSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');
  const gameName = searchParams.get('gameName');

  const { user } = useUser();
  const firestore = useFirestore();

  const [playerName, setPlayerName] = useState('');
  const [selectedTotem, setSelectedTotem] = useState(totems[0].id);
  const [selectedColor, setSelectedColor] = useState(playerColors[0].id);

  // Pre-fill player name if available from Firebase Auth profile
  useEffect(() => {
      if (user?.displayName) {
          setPlayerName(user.displayName);
      }
  }, [user]);

  const totem = totems.find(t => t.id === selectedTotem);
  const TotemIcon = totem ? totem.icon : null;

  const handleJoinGame = async () => {
    if (!playerName.trim() || !gameId || !user || !firestore) {
      // Improve user feedback for missing info, though this state should be rare.
      console.error("Player name, game ID, user, or Firestore service is missing.");
      return;
    }

    const player: Omit<Player, 'id'> = {
      userId: user.uid,
      name: playerName.trim(),
      money: 1500,
      position: 0,
      color: selectedColor,
      totem: selectedTotem,
      inJail: false,
      // Initialize properties as empty arrays, crucial for type safety.
      properties: [],
      mortgagedProperties: [],
      houses: {},
      getOutOfJailFreeCards: 0,
    };
    
    // Use a write batch for atomicity
    const batch = writeBatch(firestore);

    // 1. Create the player document
    const playerRef = doc(firestore, 'games', gameId, 'players', user.uid);
    batch.set(playerRef, player);
      
    // 2. Update the game status to 'active'
    const gameRef = doc(firestore, 'games', gameId);
    const gameUpdates = { status: 'active' as const };
    batch.update(gameRef, gameUpdates);
      
    // Commit the batch and handle potential errors
    batch.commit()
      .then(() => {
        router.push(`/game/${gameId}`);
      })
      .catch((error) => {
        // Emit contextual errors for both operations in case of failure.
        const playerCreationError = new FirestorePermissionError({
          path: playerRef.path,
          operation: 'create',
          requestResourceData: player,
        });
        errorEmitter.emit('permission-error', playerCreationError);

        const gameUpdateError = new FirestorePermissionError({
            path: gameRef.path,
            operation: 'update',
            requestResourceData: gameUpdates,
        });
        errorEmitter.emit('permission-error', gameUpdateError);
      });
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Crie seu Jogador</CardTitle>
          <CardDescription>
            Escolha seu nome, totem e cor para iniciar o jogo a solo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Jogador</Label>
              <Input
                id="name"
                placeholder="Insira seu nome"
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
            <div className="relative h-24 w-24">
              {TotemIcon && (
                <TotemIcon
                  className={cn(
                    'h-full w-full transition-colors',
                    playerColors
                      .find((c) => c.id === selectedColor)
                      ?.class.replace('bg-', 'text-')
                  )}
                  style={{ color: playerColors.find(c => c.id === selectedColor)?.class.startsWith('bg-') ? undefined : `var(--${selectedColor})` }}
                />
              )}
            </div>
            <p className="text-xl font-semibold">{playerName.trim() || 'Seu Nome'}</p>
            <div className="space-y-2">
              <Label className="flex items-center justify-center gap-2">
                <Palette /> Cor do Jogador
              </Label>
                <div className="flex flex-wrap justify-center gap-2">
                  {playerColors.map((color) => (
                       <button
                          key={color.id}
                          onClick={() => setSelectedColor(color.id)}
                          className={cn(
                            'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                            color.class,
                            selectedColor === color.id
                              ? 'border-primary ring-2 ring-primary'
                              : 'border-transparent'
                          )}
                          aria-label={`Select ${color.name} color`}
                        />
                  ))}
                </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button className="group" disabled={!playerName.trim() || !gameId} onClick={handleJoinGame}>
                Iniciar Jogo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
