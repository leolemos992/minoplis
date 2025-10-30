import { characters } from '@/lib/game-data';
import { notFound } from 'next/navigation';
import { GameActions } from '@/components/game/game-actions';
import { PlayerHud } from '@/components/game/player-hud';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Zap, Train, Diamond } from 'lucide-react';

export default function GamePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { character?: string };
}) {
  const selectedCharacter = characters.find(
    (c) => c.id === searchParams.character
  );

  if (!selectedCharacter) {
    notFound();
  }

  const mockPlayer = {
    id: 'player-1',
    name: 'Player 1',
    character: selectedCharacter,
    money: 1500,
    properties: [],
    position: 0,
    color: 'bg-blue-500',
  };

  return (
    <div className="p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-bold mb-4">Game: Downtown Dash</h1>
        <Card className="aspect-square w-full flex items-center justify-center bg-muted/30">
            <div className="text-center text-muted-foreground">
                <Diamond className="mx-auto h-16 w-16 mb-4"/>
                <h2 className="text-2xl font-semibold">Game Board Area</h2>
                <p>The main game board will be rendered here.</p>
            </div>
        </Card>
      </div>
      <aside className="lg:col-span-1 space-y-8">
        <PlayerHud player={mockPlayer} />
        <GameActions />
      </aside>
    </div>
  );
}
