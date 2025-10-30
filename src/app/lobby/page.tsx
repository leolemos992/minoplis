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
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';

export default function LobbyPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const handleCreateSoloGame = async () => {
    if (!user || !firestore) {
      console.error("Firestore or user not available");
      return;
    }
    
    setIsCreating(true);

    try {
      // 1. Create the game document
      const gameData = {
        name: "Jogo Solo",
        status: 'waiting' as const,
        hostId: user.uid,
        createdAt: serverTimestamp(),
        currentPlayerId: null,
      };
      const gamesCollection = collection(firestore, 'games');
      const docRef = await addDoc(gamesCollection, gameData);

      // 2. Redirect to character selection for the new game
      router.push(`/character-selection?gameId=${docRef.id}&gameName=${encodeURIComponent("Jogo Solo")}`);

    } catch (error) {
      console.error("Error creating solo game: ", error);
      setIsCreating(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <PlusCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Criar Jogo Solo</CardTitle>
          <CardDescription>
            Comece um novo jogo. Você pode jogar sozinho ou convidar amigos mais tarde.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" onClick={handleCreateSoloGame} disabled={isCreating}>
            {isCreating ? "Criando..." : "Criar Jogo"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
