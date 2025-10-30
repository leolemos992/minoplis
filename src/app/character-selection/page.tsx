'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
import { ArrowRight, Palette, Users, Ban } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import type { Player } from '@/lib/definitions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
  const isHost = searchParams.get('host') === 'true';

  const { user } = useUser();
  const firestore = useFirestore();

  // Fetch existing players to check for used totems/colors
  const playersRef = useMemoFirebase(() => 
    firestore && gameId && gameId !== 'solo-game' 
      ? collection(firestore, 'games', gameId, 'players') 
      : null,
    [firestore, gameId]
  );
  const { data: existingPlayers } = useCollection<Player>(playersRef);
  
  const usedTotems = useMemo(() => new Set(existingPlayers?.map(p => p.totem) || []), [existingPlayers]);
  const usedColors = useMemo(() => new Set(existingPlayers?.map(p => p.color) || []), [existingPlayers]);

  const firstAvailableTotem = totems.find(t => !usedTotems.has(t.id))?.id || '';
  const firstAvailableColor = playerColors.find(c => !usedColors.has(c.id))?.id || '';
  
  const [playerName, setPlayerName] = useState('');
  const [selectedTotem, setSelectedTotem] = useState(firstAvailableTotem);
  const [selectedColor, setSelectedColor] = useState(firstAvailableColor);
  const [numOpponents, setNumOpponents] = useState('1'); // Only used for solo

  // Update selection if the first available option changes (e.g., due to another player joining)
  useEffect(() => {
    if (firstAvailableTotem) setSelectedTotem(firstAvailableTotem);
  }, [firstAvailableTotem]);

  useEffect(() => {
    if (firstAvailableColor) setSelectedColor(firstAvailableColor);
  }, [firstAvailableColor]);


  const totem = totems.find(t => t.id === selectedTotem);
  const TotemIcon = totem ? totem.icon : null;

  const handleJoinGame = async () => {
    if (!playerName || !gameId || !user || !firestore || usedTotems.has(selectedTotem) || usedColors.has(selectedColor)) {
      console.error("Missing required data or selection is already taken.");
      // TODO: Show an error to the user
      return;
    }

    const player: Omit<Player, 'id'> = {
      userId: user.uid,
      name: playerName,
      money: 1500,
      properties: [],
      mortgagedProperties: [],
      houses: {},
      position: 0,
      color: selectedColor,
      totem: selectedTotem,
      getOutOfJailFreeCards: 0,
      inJail: false,
    };

    try {
      const playerRef = doc(collection(firestore, 'games', gameId, 'players'), user.uid);
      await setDoc(playerRef, player);
      
      router.push(`/game/${gameId}?gameName=${encodeURIComponent(gameName || 'MINOPOLIS')}`);

    } catch (error) {
      console.error("Error adding player to game: ", error);
      // TODO: Show error toast
    }
  };
  
  const soloGameHref = isHost ? `/game/${gameId}?playerName=${encodeURIComponent(
      playerName
    )}&totem=${selectedTotem}&color=${selectedColor}&numOpponents=${numOpponents}&gameName=${encodeURIComponent(
      gameName || 'MINOPOLIS'
    )}` : '#';

  const isCurrentSelectionValid = !usedTotems.has(selectedTotem) && !usedColors.has(selectedColor);

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Crie seu Jogador</CardTitle>
          <CardDescription>
            Escolha seu nome, totem e cor para entrar no jogo '{gameName}'.
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
              <TooltipProvider>
                <RadioGroup
                  value={selectedTotem}
                  onValueChange={setSelectedTotem}
                  className="grid grid-cols-3 gap-4"
                >
                  {totems.map((totem) => {
                    const isUsed = usedTotems.has(totem.id);
                    return (
                      <Tooltip key={totem.id}>
                        <TooltipTrigger asChild>
                          <div className={cn(isUsed && "cursor-not-allowed")}>
                            <RadioGroupItem
                              value={totem.id}
                              id={totem.id}
                              className="peer sr-only"
                              disabled={isUsed}
                            />
                            <Label
                              htmlFor={totem.id}
                              className={cn(
                                "flex relative cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                                isUsed && "bg-muted/50 text-muted-foreground opacity-50 pointer-events-none"
                              )}
                            >
                               {isUsed && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                                  <Ban className="h-8 w-8 text-white" />
                                </div>
                              )}
                              <totem.icon className="mb-2 h-8 w-8" />
                              {totem.name}
                            </Label>
                          </div>
                        </TooltipTrigger>
                        {isUsed && (
                           <TooltipContent>
                             <p>Totem já escolhido</p>
                           </TooltipContent>
                        )}
                      </Tooltip>
                    )
                  })}
                </RadioGroup>
              </TooltipProvider>
            </div>
            
            {isHost && (
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Users /> Oponentes (IA)
                </Label>
                <RadioGroup
                  value={numOpponents}
                  onValueChange={setNumOpponents}
                  className="flex gap-4"
                >
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(num)} id={`opponents-${num}`} />
                      <Label htmlFor={`opponents-${num}`}>{num}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

          </div>

          <div className="flex flex-col items-center justify-center space-y-6 rounded-lg bg-muted/50 p-8">
            <h3 className="text-lg font-medium">Sua Pré-visualização</h3>
            <div className="relative">
              {TotemIcon && (
                <TotemIcon
                  className={cn(
                    'h-24 w-24',
                    playerColors
                      .find((c) => c.id === selectedColor)
                      ?.class.replace('bg-', 'text-')
                  )}
                />
              )}
            </div>
            <p className="text-xl font-semibold">{playerName || 'Seu Nome'}</p>
            <div className="space-y-2">
              <Label className="flex items-center justify-center gap-2">
                <Palette /> Cor do Jogador
              </Label>
              <TooltipProvider>
                <div className="flex flex-wrap justify-center gap-2">
                  {playerColors.map((color) => {
                    const isUsed = usedColors.has(color.id);
                    return (
                       <Tooltip key={color.id}>
                         <TooltipTrigger asChild>
                            <button
                              onClick={() => !isUsed && setSelectedColor(color.id)}
                              className={cn(
                                'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                                color.class,
                                selectedColor === color.id
                                  ? 'border-primary ring-2 ring-primary'
                                  : 'border-transparent',
                                isUsed && "opacity-50 cursor-not-allowed"
                              )}
                              aria-label={`Select ${color.name} color`}
                              disabled={isUsed}
                            >
                              {isUsed && <Ban className="h-5 w-5 text-white/80 mx-auto" />}
                            </button>
                         </TooltipTrigger>
                         {isUsed && (
                            <TooltipContent>
                              <p>Cor já escolhida</p>
                            </TooltipContent>
                         )}
                       </Tooltip>
                    )
                  })}
                </div>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            {isHost ? (
                 <Button asChild className="group" disabled={!playerName}>
                    <Link href={soloGameHref}>
                        Iniciar Jogo Solo
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                 </Button>
            ) : (
                <Button className="group" disabled={!playerName || !gameId || !isCurrentSelectionValid} onClick={handleJoinGame}>
                    Entrar no Jogo
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
