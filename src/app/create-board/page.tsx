'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function CreateBoardPage() {
  const router = useRouter();
  const [gameName, setGameName] = useState('MINOPOLIS');
  const [isCreating, setIsCreating] = useState(false);

  const { user } = useUser();
  const firestore = useFirestore();

  const handleCreateGame = async () => {
    if (!gameName || !user || !firestore) {
      // TODO: Show an error toast
      console.error('Game name is missing or user not authenticated.');
      return;
    }

    setIsCreating(true);

    try {
      const gameData = {
        name: gameName,
        status: 'waiting' as const,
        hostId: user.uid,
        createdAt: serverTimestamp(),
        currentPlayerId: null,
      };

      const gamesCollection = collection(firestore, 'games');
      const docRef = await addDoc(gamesCollection, gameData);
      
      router.push(`/character-selection?gameId=${docRef.id}&gameName=${encodeURIComponent(gameName)}`);

    } catch (error) {
      console.error("Error creating game: ", error);
      // TODO: Show error toast
      setIsCreating(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Crie Seu Jogo Multiplayer</CardTitle>
          <CardDescription>
            Dê um nome ao seu novo jogo. Outros jogadores poderão entrar no seu jogo a partir do lobby.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateGame(); }}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Nome do Jogo</Label>
                <Input
                  id="name"
                  placeholder="ex: 'Meu Jogo Incrível'"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            className="group" 
            disabled={!gameName || isCreating}
            onClick={handleCreateGame}
          >
            {isCreating ? 'Criando...' : 'Próximo: Escolher Personagem'}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
