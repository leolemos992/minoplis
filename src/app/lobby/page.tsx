import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, PlusCircle } from "lucide-react";
import { mockGames } from "@/lib/game-data";

export default function LobbyPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Lobby de Jogos</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Junte-se a um jogo existente ou crie o seu próprio para começar a jogar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Jogos Abertos</CardTitle>
                    <CardDescription>Junte-se a um jogo que está esperando por jogadores.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {mockGames.map((game) => (
                             <li key={game.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/10 transition-colors">
                                <div>
                                    <p className="font-semibold">{game.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {game.players.length} / 4 Jogadores - <span className={`${game.status === 'waiting' ? 'text-green-500' : 'text-yellow-500'}`}>{game.status === 'waiting' ? 'esperando' : 'ativo'}</span>
                                    </p>
                                </div>
                                <Button asChild variant="secondary">
                                    <Link href={`/character-selection?gameId=${game.id}`}>Entrar no Jogo</Link>
                                </Button>
                             </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
             <Card className="bg-primary/5 border-primary/20 h-full flex flex-col items-center justify-center text-center p-6">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <PlusCircle className="h-8 w-8 text-primary"/>
                    </div>
                    <CardTitle>Criar um Novo Jogo</CardTitle>
                    <CardDescription>Comece um novo jogo com um tabuleiro personalizado e convide seus amigos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild size="lg">
                        <Link href="/create-board">Criar Jogo</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
