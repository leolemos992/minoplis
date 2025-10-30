import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, Gamepad } from 'lucide-react';
import { mockGames } from '@/lib/game-data';

export default function MultiplayerLobbyPage() {
  const ongoingGames = mockGames.slice(0, 2); // Mock data for now

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
            {ongoingGames.length > 0 ? (
              ongoingGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <Gamepad className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{game.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {game.players.length} jogadores | Status:{' '}
                        {game.status}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="secondary">
                    <Link href={`/game/${game.id}?multiplayer=true`}>
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
