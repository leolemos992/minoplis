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
} from "@/components/ui/alert-dialog"
import { PlusCircle, Gamepad, Hourglass, Users, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, doc, deleteDoc, getDocs, writeBatch, or } from 'firebase/firestore';
import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Game } from '@/lib/definitions';

export default function MultiplayerLobbyPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // This is a specific user ID to act as an admin for deleting stuck rooms.
  const ADMIN_USER_ID = 'EriuHWriY4hTNWKG5jC1buQn9Or2';

  const gamesQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'games'),
            or(
              where('status', '==', 'waiting'),
              where('status', '==', 'rolling-to-start'),
              where('hostId', '==', user.uid)
            )
          )
        : null,
    [firestore, user]
  );
  
  const { data: allGames, isLoading, setData: setOngoingGames } = useCollection<Game>(gamesQuery);

  const ongoingGames = useMemo(() => {
    if (!allGames) return [];
    if (!user) return allGames.filter(g => g.status === 'waiting' || g.status === 'rolling-to-start');
    
    // Show games that are joinable OR that the user hosts/is admin for
    return allGames.filter(g => (g.status === 'waiting' || g.status === 'rolling-to-start') || g.hostId === user.uid || user.uid === ADMIN_USER_ID);
  }, [allGames, user]);


  const handleRefresh = useCallback(async () => {
    if (!gamesQuery) return;
    setIsRefreshing(true);
    try {
      const snapshot = await getDocs(gamesQuery);
      const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOngoingGames(games as any);
    } catch (error) {
      console.error("Error refreshing games:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [gamesQuery, setOngoingGames]);

 const handleDeleteGame = (gameId: string) => {
    if (!firestore) return;

    const gameRef = doc(firestore, 'games', gameId);
    const playersRef = collection(firestore, 'games', gameId, 'players');
    const rollsRef = collection(firestore, 'games', gameId, 'rolls-to-start');

    const batch = writeBatch(firestore);

    // Chain the promises to ensure sequential deletion and proper error handling
    getDocs(playersRef)
      .catch(serverError => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: playersRef.path,
            operation: 'list',
          })
        );
        // Throw a specific error to stop the promise chain
        throw new Error('Permission denied while listing players.');
      })
      .then(playersSnapshot => {
        playersSnapshot.forEach(playerDoc => {
          batch.delete(playerDoc.ref);
        });

        // Continue to the next step: getting rolls-to-start
        return getDocs(rollsRef);
      })
      .catch(serverError => {
        // This will catch errors from getDocs(playersRef) or getDocs(rollsRef)
        if (serverError.message.includes('listing players')) {
            return Promise.reject(serverError); // Re-throw to stop
        }
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: rollsRef.path,
            operation: 'list',
          })
        );
        throw new Error('Permission denied while listing rolls-to-start.');
      })
      .then(rollsSnapshot => {
        rollsSnapshot.forEach(rollDoc => {
          batch.delete(rollDoc.ref);
        });

        // Finally, delete the main game doc
        batch.delete(gameRef);

        // Commit the batch
        return batch.commit();
      })
      .catch(serverError => {
         // This will catch errors from previous steps or the commit itself
         if (serverError.message.includes('listing')) {
            return; // Don't emit another error if it was already handled
         }
         errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: gameRef.path,
            operation: 'delete',
          })
        );
      })
      .then(() => {
        // Optimistically remove from UI on successful commit
        setOngoingGames(prev => prev?.filter(g => g.id !== gameId) || null);
      });
  };


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
            Entre em um jogo existente ou crie o seu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading && <p>Carregando jogos...</p>}

            {!isLoading && ongoingGames && ongoingGames.length > 0 ? (
              ongoingGames.map((game) => {
                const canDelete = user && (user.uid === game.hostId || user.uid === ADMIN_USER_ID);
                const canJoin = game.status === 'waiting' || game.status === 'rolling-to-start';

                return (
                  <div
                    key={game.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      {!canJoin && game.status !== 'finished'
                        ? <AlertTriangle className="h-8 w-8 text-orange-500" />
                        : <Gamepad className="h-8 w-8 text-primary" />
                      }
                      <div>
                        <h3 className="font-semibold">{game.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className='flex items-center gap-1'><Hourglass className="h-3 w-3" /> {game.status}</span>
                          {/* <span className='flex items-center gap-1'><Users className="h-3 w-3" /> {game.players?.length || 0} jogadores</span> */}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="secondary" disabled={!canJoin}>
                        <Link href={`/character-selection?gameId=${game.id}&gameName=${encodeURIComponent(game.name)}`}>
                          Entrar
                        </Link>
                      </Button>
                      {canDelete && (
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente a sala de jogo e todos os seus dados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteGame(game.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              !isLoading && (
                <div className="py-12 text-center text-muted-foreground">
                  <p>Nenhum jogo disponível no momento.</p>
                  <p>Seja o primeiro a criar um!</p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
