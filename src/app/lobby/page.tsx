'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Game } from '@/lib/definitions';

// This page acts as an automatic redirector to create a new solo game.
export default function LobbyPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    const createAndRedirect = () => {
      // Wait until both user and firestore are available.
      if (!user || !firestore) return;

      const gameName = `Partida de ${user.displayName || 'Jogador'}`;
      const gameData: Omit<Game, 'id'> = {
        name: gameName,
        status: 'waiting', // The game status will be updated on the character selection screen.
        hostId: user.uid,
        createdAt: serverTimestamp(),
        currentPlayerId: user.uid, // For a solo game, the creator is always the current player.
      };
      
      const gamesCollection = collection(firestore, 'games');
      
      // Use .catch() for permission error handling as per architecture.
      addDoc(gamesCollection, gameData)
        .then(docRef => {
            // Redirect to character selection, passing the new game's ID and name.
            router.replace(
              `/character-selection?gameId=${docRef.id}&gameName=${encodeURIComponent(gameName)}`
            );
        })
        .catch(error => {
            const permissionError = new FirestorePermissionError({
                path: 'games',
                operation: 'create',
                requestResourceData: gameData,
            });
            errorEmitter.emit('permission-error', permissionError);
            
            // Fallback for non-permission errors or if the redirect fails.
            console.error('Error creating game:', error); 
            router.replace('/');
        });
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
