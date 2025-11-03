'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Game } from '@/lib/definitions';

// This page now acts as a silent creator and redirector.
export default function LobbyPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    // Wait for user and firestore to be available
    if (isUserLoading || !firestore) {
      return;
    }

    // If there's no user, something is wrong with anonymous auth, wait or handle error.
    if (!user) {
        // The FirebaseProvider should be handling anonymous sign-in.
        // We wait here until the user object is available.
        return; 
    }

    const createAndRedirect = async () => {
        const gameName = `Partida de ${user.displayName || 'Anfitrião'}`; // displayName might be null for anon
        const gameData: Omit<Game, 'id'> = {
            name: gameName,
            status: 'waiting',
            hostId: user.uid,
            createdAt: serverTimestamp(),
            currentPlayerId: '',
            playerOrder: [],
            turn: 0,
        };
        
        const gamesCollection = collection(firestore, 'games');
        
        try {
            const docRef = await addDoc(gamesCollection, gameData);
            // Redirect to character selection with the new game ID
            router.replace(`/character-selection?gameId=${docRef.id}`);
        } catch (error) {
            const permissionError = new FirestorePermissionError({
                path: 'games',
                operation: 'create',
                requestResourceData: gameData,
            });
            errorEmitter.emit('permission-error', permissionError);
            // Optionally, redirect to an error page or show a message
            router.replace('/?error=creation_failed');
        }
    };

    createAndRedirect();
    
  }, [user, isUserLoading, firestore, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <p className="mt-4 text-muted-foreground">A criar a sua sala, por favor aguarde...</p>
    </div>
  );
}
