'use client';

import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import type { Game } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Users, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function LobbyPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isCreating, setIsCreating] = useState(false);

  const waitingGamesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'games'), where('status', '==', 'waiting'));
  }, [firestore]);

  const { data: waitingGames, isLoading } = useCollection<Game>(waitingGamesQuery);

  const handleCreateGame = async () => {
    if (!user || !firestore) return;
    setIsCreating(true);

    const gameName = `Partida de ${user.displayName || 'Anfitrião'}`;
    const gameData: Omit<Game, 'id'> = {
      name: gameName,
      status: 'waiting',
      hostId: user.uid,
      createdAt: serverTimestamp(),
      currentPlayerId: '',
      playerOrder: [],
      turn: 0,
    };
    
    const gamesCollection = collection(firestore, 'games');
    
    addDoc(gamesCollection, gameData)
      .then(docRef => {
          router.push(`/character-selection?gameId=${docRef.id}`);
      })
      .catch(error => {
          const permissionError = new FirestorePermissionError({
              path: 'games',
              operation: 'create',
              requestResourceData: gameData,
          });
          errorEmitter.emit('permission-error', permissionError);
          setIsCreating(false);
      });
  };

  const handleJoinGame = (gameId: string) => {
    router.push(`/character-selection?gameId=${gameId}`);
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Lobby de Jogos</CardTitle>
          <CardDescription>Crie uma nova partida ou junte-se a uma existente.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button className="w-full" onClick={handleCreateGame} disabled={isCreating}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isCreating ? 'A Criar...' : 'Criar Novo Jogo'}
            </Button>
            <div className="mt-6">
                <h3 className="mb-4 text-lg font-medium text-center">Partidas a aguardar</h3>
                <ScrollArea className="h-60 w-full rounded-md border">
                    <div className="p-4">
                        {isLoading && <p>A carregar partidas...</p>}
                        {!isLoading && (!waitingGames || waitingGames.length === 0) && (
                             <p className="text-center text-muted-foreground">Não há partidas a aguardar. Crie uma!</p>
                        )}
                        {waitingGames && waitingGames.map((game) => (
                            <div key={game.id} className="mb-2 flex items-center justify-between rounded-lg p-3 bg-muted/50">
                                <div>
                                    <p className="font-semibold">{game.name}</p>
                                    <p className="text-sm text-muted-foreground">Jogadores: {game.playerOrder?.length || 0}</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleJoinGame(game.id)}>
                                    Entrar
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </CardContent>
         <CardFooter className="flex justify-end">
            <p className="text-xs text-muted-foreground">Atualizado em tempo real</p>
         </CardFooter>
      </Card>
    </div>
  );
}
