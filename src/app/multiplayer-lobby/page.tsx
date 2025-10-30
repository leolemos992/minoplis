'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, Gamepad, Hourglass, RefreshCw, Users } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Game } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

export default function MultiplayerLobbyPage() {
  const firestore = useFirestore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Query for games that are waiting for players
  const gamesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'games'), where('status', '==', 'waiting'))
        : null,
    [firestore]
  );
  
  const { data: waitingGames, isLoading, setData: setWaitingGames } = useCollection<Game>(gamesQuery);

  const handleRefresh = useCallback(async () => {
    if (!gamesQuery) return;
    setIsRefreshing(true);
    try {
      const snapshot = await getDocs(gamesQuery);
      const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Game }));
      setWaitingGames(games);
    } catch (error) {
      console.error("Error refreshing games:", error);
      // TODO: Show a toast notification for the error
    } finally {
      setIsRefreshing(false);
    }
  }, [gamesQuery, setWaitingGames]);

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Lobby Multiplayer</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            Atualizar
          </Button>
          <Button asChild>
            <Link href="/create-board">
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Novo Jogo
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jogos Disponíveis</CardTitle>
          <CardDescription>
            Entre em um jogo que está aguardando jogadores ou crie o seu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : waitingGames && waitingGames.length > 0 ? (
              waitingGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <Gamepad className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{game.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className='flex items-center gap-1'><Hourglass className="h-3 w-3" /> {game.status}</span>
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="secondary">
                    <Link href={`/character-selection?gameId=${game.id}&gameName=${encodeURIComponent(game.name)}`}>
                      Entrar
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p>Nenhum jogo disponível no momento.</p>
                <p>Seja o primeiro a criar um!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
