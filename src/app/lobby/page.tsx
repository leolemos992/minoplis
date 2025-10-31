'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, getDocs, writeBatch, doc } from 'firebase/firestore';
import type { Game } from '@/lib/definitions';

import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Gamepad, Hourglass, RefreshCw, Trash2, AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const ADMIN_UID = 'EriuHWriY4hTNWKG5jC1buQn9Or2';

export default function LobbyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSolo = searchParams.get('solo') === 'true';

  const { user } = useUser();
  const firestore = useFirestore();

  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const isAdmin = user?.uid === ADMIN_UID;
  
  // Query for multiplayer games
  const gamesQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'games'), where('status', '==', 'waiting')) : null,
    [firestore]
  );
  const { data: waitingGames, isLoading, setData: setWaitingGames } = useCollection<Game>(gamesQuery);

  const handleCreateGame = async () => {
    if (!user || !firestore) return;
    setIsCreating(true);
    try {
      const gameData = {
        name: isSolo ? `Jogo de ${user.displayName || 'Jogador'}` : 'Nova Partida',
        status: 'waiting' as const,
        hostId: user.uid,
        createdAt: serverTimestamp(),
        currentPlayerId: null,
        playerOrder: [],
      };
      const docRef = await addDoc(collection(firestore, 'games'), gameData);
      router.push(`/character-selection?gameId=${docRef.id}&gameName=${encodeURIComponent(gameData.name)}`);
    } catch (error) {
      console.error("Error creating game:", error);
      setIsCreating(false);
    }
  };
  
  // Effect to handle solo game creation automatically
  useEffect(() => {
    if (isSolo && user && firestore && !isCreating) {
      handleCreateGame();
    }
  }, [isSolo, user, firestore, isCreating]);

  const handleRefresh = useCallback(async () => {
    if (!gamesQuery) return;
    setIsRefreshing(true);
    try {
      const snapshot = await getDocs(gamesQuery);
      const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Game }));
      setWaitingGames(games);
    } catch (error) {
      console.error("Error refreshing games:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [gamesQuery, setWaitingGames]);

  const handleDeleteAllGames = () => {
    if (!firestore || !isAdmin) return;
    setIsDeletingAll(true);

    const allGamesQuery = query(collection(firestore, 'games'));
    
    getDocs(allGamesQuery)
      .then(gamesSnapshot => {
        const batch = writeBatch(firestore);
        gamesSnapshot.docs.forEach(gameDoc => {
          batch.delete(gameDoc.ref);
        });
        return batch.commit();
      })
      .catch(error => {
        const permissionError = new FirestorePermissionError({
            path: 'games',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsDeletingAll(false);
      });
  };

  if (isSolo) {
    return (
        <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
            <Users className="h-16 w-16 mb-4 text-primary animate-pulse" />
            <h1 className="text-2xl font-bold">A criar o seu jogo solo...</h1>
            <p className="text-muted-foreground">Você será redirecionado em breve.</p>
        </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Lobby Multiplayer</h1>
        <div className="flex items-center gap-2">
           {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeletingAll}>
                  <Trash2 className="mr-2 h-4 w-4" />
                   {isDeletingAll ? 'Apagando...' : 'Apagar Salas'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle/>Tens a certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá apagar permanentemente todas as salas de jogo existentes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllGames} className={cn(buttonVariants({variant: "destructive"}))}>
                    Sim, apagar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            Atualizar
          </Button>
          <Button onClick={handleCreateGame} disabled={isCreating}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {isCreating ? 'A criar...' : 'Criar Novo Jogo'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jogos Disponíveis</CardTitle>
          <CardDescription>
            Entre num jogo que está a aguardar por jogadores ou crie o seu.
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
                        <span className='flex items-center gap-1'><Hourglass className="h-3 w-3" /> A aguardar jogadores</span>
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
