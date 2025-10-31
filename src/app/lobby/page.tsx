'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Game } from '@/lib/definitions';

// This page now acts as a redirect to create a new game immediately.
export default function LobbyPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    const createAndRedirect = async () => {
      if (!user || !firestore) return;

      try {
        const gameData: Omit<Game, 'id'> = {
          name: `Partida de ${user.displayName || 'Jogador'}`,
          status: 'waiting', // The game will start on the character selection screen
          hostId: user.uid,
          createdAt: serverTimestamp(),
          currentPlayerId: user.uid, // For single player, the user is always the current player
          playerOrder: [user.uid],
        };
        const docRef = await addDoc(collection(firestore, 'games'), gameData);
        router.replace(
          `/character-selection?gameId=${docRef.id}&gameName=${encodeURIComponent(gameData.name)}`
        );
      } catch (error) {
        console.error('Error creating game:', error);
        // If it fails, maybe redirect back to home
        router.replace('/');
      }
    };

    createAndRedirect();
  }, [user, firestore, router]);


  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold">A criar um novo jogo...</h2>
        <p className="text-muted-foreground">A preparar tudo para si. Aguarde um momento.</p>
      </div>
    </div>
  );
}
