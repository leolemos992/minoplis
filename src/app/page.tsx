'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    // Redirect to the lobby page which will handle game creation
    router.push('/lobby');
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !firestore) {
      setError('Por favor, insira um código de sala válido.');
      return;
    }
    setError('');

    const gameRef = doc(firestore, 'games', roomCode.trim());
    try {
      const gameSnap = await getDoc(gameRef);
      if (gameSnap.exists()) {
        router.push(`/character-selection?gameId=${roomCode.trim()}`);
      } else {
        setError('Sala não encontrada. Verifique o código e tente novamente.');
      }
    } catch (e) {
      setError('Ocorreu um erro ao tentar entrar na sala.');
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Bem-vindo ao MINOPLIS!</CardTitle>
          <CardDescription>Crie uma sala ou junte-se a uma existente para começar a jogar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCreateRoom} className="w-full" size="lg" disabled={isUserLoading}>
            {isUserLoading ? 'A carregar...' : 'Criar Nova Sala'}
          </Button>
          <div className="flex items-center space-x-2">
            <hr className="flex-grow border-t" />
            <span className="text-xs text-muted-foreground">OU</span>
            <hr className="flex-grow border-t" />
          </div>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Insira o código da sala"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="text-center"
            />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button onClick={handleJoinRoom} variant="outline" className="w-full" disabled={isUserLoading || !roomCode.trim()}>
              Entrar na Sala
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
