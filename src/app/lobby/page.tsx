'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Game } from '@/lib/definitions';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export default function LobbyPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async () => {
    if (!user || !firestore) return;
    setIsCreating(true);
    try {
      const gameData: Omit<Game, 'id'> = {
        name: `Partida de ${user.displayName || 'Jogador'}`,
        status: 'waiting',
        hostId: user.uid,
        createdAt: serverTimestamp(),
        currentPlayerId: null,
        playerOrder: [],
      };
      const docRef = await addDoc(collection(firestore, 'games'), gameData);
      router.push(
        `/character-selection?gameId=${docRef.id}&gameName=${encodeURIComponent(gameData.name)}`
      );
    } catch (error) {
      console.error('Error creating game:', error);
      // TODO: Show a user-facing error message
      setIsCreating(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Lobby de Jogos</CardTitle>
          <CardDescription>
            Crie um novo jogo para começar a sua partida de MINOPOLIS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <p className="text-muted-foreground">
              De momento, a listagem de jogos está desativada.
            </p>
            <Button onClick={handleCreateGame} disabled={isCreating || !user}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {isCreating ? 'A Criar...' : 'Criar Novo Jogo'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
