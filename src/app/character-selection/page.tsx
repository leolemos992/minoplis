'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { totems } from '@/lib/game-data.tsx';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Palette, User as UserIcon, Copy } from 'lucide-react';
import { useUser, useFirestore, FirestorePermissionError, errorEmitter, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, writeBatch, arrayUnion, updateDoc, collection } from 'firebase/firestore';
import type { Player, Game } from '@/lib/definitions';
import { PlayerToken } from '@/components/game/player-token';
import { useToast } from '@/hooks/use-toast';


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
  const { toast } = useToast();

  const { user } = useUser();
  const firestore = useFirestore();

  const gameRef = useMemoFirebase(() => gameId && firestore ? doc(firestore, 'games', gameId) : null, [gameId, firestore]);
  const { data: game, isLoading: isGameLoading } = useDoc<Game>(gameRef);
  
  const playersRef = useMemoFirebase(() => gameId && firestore && user ? doc(firestore, 'games', gameId, 'players', user.uid) : null, [gameId, firestore, user]);
  const { data: playerDoc } = useDoc<Player>(playersRef);

  const allPlayersRef = useMemoFirebase(() => gameId && firestore ? collection(firestore, 'games', gameId, 'players') : null, [gameId, firestore]);
  const { data: allPlayers } = useCollection<Player>(allPlayersRef);

  const [playerName, setPlayerName] = useState('');
  const [selectedTotem, setSelectedTotem] = useState(totems[0].id);
  const [selectedColor, setSelectedColor] = useState(playerColors[0].id);

  const isHost = useMemo(() => game?.hostId === user?.uid, [game, user]);
  const hasJoined = useMemo(() => !!playerDoc, [playerDoc]);
  
  useEffect(() => {
    if (game?.status === 'active') {
        router.replace(`/game/${gameId}`);
    }
  }, [game, gameId, router]);


  useEffect(() => {
      if (user?.displayName && !playerName) {
          setPlayerName(user.displayName);
      }
  }, [user, playerName]);
  
  const availableColors = useMemo(() => playerColors.filter(c => !allPlayers?.some(p => p.color === c.id)), [allPlayers]);
  const availableTotems = useMemo(() => totems.filter(t => !allPlayers?.some(p => p.totem === t.id)), [allPlayers]);

  useEffect(() => {
      if (availableColors.length > 0 && !availableColors.find(c => c.id === selectedColor)) {
          setSelectedColor(availableColors[0].id);
      }
      if (availableTotems.length > 0 && !availableTotems.find(t => t.id === selectedTotem)) {
          setSelectedTotem(availableTotems[0].id);
      }
  }, [availableColors, availableTotems, selectedColor, selectedTotem]);

  const totem = totems.find(t => t.id === selectedTotem);
  const TotemIcon = totem ? totem.icon : null;

  const handleJoinGame = async () => {
    if (!playerName.trim() || !gameId || !user || !firestore || !gameRef) {
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
      properties: [],
      mortgagedProperties: [],
      houses: {},
      getOutOfJailFreeCards: 0,
    };
    
    const batch = writeBatch(firestore);

    const playerRef = doc(firestore, 'games', gameId, 'players', user.uid);
    batch.set(playerRef, player);
    
    const gameUpdates = { playerOrder: arrayUnion(user.uid) };
    batch.update(gameRef, gameUpdates);
      
    batch.commit()
      .catch((error) => {
        const playerCreationError = new FirestorePermissionError({ path: playerRef.path, operation: 'create', requestResourceData: player });
        errorEmitter.emit('permission-error', playerCreationError);
        const gameUpdateError = new FirestorePermissionError({ path: gameRef.path, operation: 'update', requestResourceData: gameUpdates });
        errorEmitter.emit('permission-error', gameUpdateError);
      });
  };

  const handleStartGame = async () => {
      if (!gameRef || !isHost || !allPlayers || allPlayers.length < 1) return;
      
      const gameUpdates = { 
          status: 'active' as const,
          currentPlayerId: game?.playerOrder[0] || ''
      };
      
      updateDoc(gameRef, gameUpdates)
        .catch(error => {
            const gameUpdateError = new FirestorePermissionError({ path: gameRef.path, operation: 'update', requestResourceData: gameUpdates });
            errorEmitter.emit('permission-error', gameUpdateError);
        });
  }

  const copyGameId = () => {
    if (gameId) {
        navigator.clipboard.writeText(gameId);
        toast({
            title: "Código da Sala Copiado!",
            description: "Partilhe o código com os seus amigos.",
        });
    }
  }

  if (isGameLoading) {
      return <div className="container flex min-h-screen items-center justify-center"><p>A Carregar Sala...</p></div>
  }

  return (
    <div className="container grid md:grid-cols-3 gap-8 min-h-[calc(100vh-4rem)] items-center py-12">
        <div className="md:col-span-2">
            <Card className="w-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">Crie o seu Jogador</CardTitle>
                            <CardDescription>
                                {hasJoined ? "Você entrou no jogo! Aguarde o anfitrião iniciar a partida." : "Escolha o seu nome, totem e cor para entrar no jogo."}
                            </CardDescription>
                        </div>
                         {gameId && (
                            <div className="text-right">
                                <Label className="text-xs text-muted-foreground">Código da Sala</Label>
                                <div className="flex items-center gap-2 rounded-md bg-muted p-2">
                                    <span className="font-mono text-sm">{gameId}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyGameId}>
                                        <Copy className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                    <div className="space-y-2">
                    <Label htmlFor="name">Nome do Jogador</Label>
                    <Input
                        id="name"
                        placeholder="Insira o seu nome"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        disabled={hasJoined}
                    />
                    </div>

                    <div className="space-y-4">
                    <Label>Escolha o seu Totem</Label>
                        <RadioGroup
                        value={selectedTotem}
                        onValueChange={setSelectedTotem}
                        className="grid grid-cols-3 gap-4"
                        disabled={hasJoined}
                        >
                        {totems.map((t) => (
                            <div key={t.id}>
                                <RadioGroupItem
                                value={t.id}
                                id={t.id}
                                className="peer sr-only"
                                disabled={hasJoined || !availableTotems.some(at => at.id === t.id)}
                                />
                                <Label
                                htmlFor={t.id}
                                className={cn(
                                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                                    !availableTotems.some(at => at.id === t.id) && "opacity-50 cursor-not-allowed",
                                    "peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                )}
                                >
                                <t.icon className="mb-2 h-8 w-8" />
                                {t.name}
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
                        <PlayerToken player={{ color: selectedColor, totem: selectedTotem } as Player} size={24} />
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
                                onClick={() => !hasJoined && setSelectedColor(color.id)}
                                className={cn(
                                    'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                                    color.class,
                                    selectedColor === color.id
                                    ? 'border-primary ring-2 ring-primary'
                                    : 'border-transparent',
                                    (!availableColors.some(ac => ac.id === color.id) && selectedColor !== color.id || hasJoined) && 'opacity-50 cursor-not-allowed'
                                )}
                                aria-label={`Selecione a cor ${color.name}`}
                                disabled={hasJoined || (!availableColors.some(ac => ac.id === color.id) && selectedColor !== color.id)}
                                />
                        ))}
                        </div>
                    </div>
                </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <Button variant="outline" onClick={() => router.push('/')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                    <div className="flex justify-end gap-4">
                        {!hasJoined ? (
                            <Button className="group" disabled={!playerName.trim() || !gameId} onClick={handleJoinGame}>
                                Entrar no Jogo
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        ) : (
                            isHost && (
                                <Button className="group" disabled={!allPlayers || allPlayers.length < 1} onClick={handleStartGame}>
                                    Iniciar Jogo para Todos
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            )
                        )}
                    </div>
                </CardFooter>
            </Card>
      </div>
       <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Jogadores na Sala</CardTitle>
                    <CardDescription>({allPlayers?.length || 0}) jogadores</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {allPlayers && allPlayers.map(p => {
                         return (
                            <div key={p.id} className="flex items-center gap-4">
                                <PlayerToken player={p} size={10} />
                                <span className="font-medium">{p.name} {p.userId === game?.hostId ? "(Anfitrião)" : ""}</span>
                            </div>
                        )
                    })}
                     {!allPlayers && <p className="text-sm text-muted-foreground">Aguardando jogadores...</p>}
                </CardContent>
            </Card>
      </div>
    </div>
  );
}
