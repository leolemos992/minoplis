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
import { PlusCircle, Gamepad, Hourglass, Users, User } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function MultiplayerLobbyPage() {
  const firestore = useFirestore();

  const gamesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'games'), where('status', '==', 'waiting'))
        : null,
    [firestore]
  );
  
  const { data: ongoingGames, isLoading } = useCollection(gamesQuery);

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Lobby Multiplayer</h1>
        <Button asChild>
          <Link href="/create-board">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Novo Jogo
          </Link>
        </Button>
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
              ongoingGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <Gamepad className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{game.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className='flex items-center gap-1'><Hourglass className="h-3 w-3" /> {game.status}</span>
                        {/* <span className='flex items-center gap-1'><Users className="h-3 w-3" /> {game.players?.length || 0} jogadores</span> */}
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
