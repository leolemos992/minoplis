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

export default function LobbyPage() {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <PlusCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Criar Jogo Solo</CardTitle>
          <CardDescription>
            Comece um novo jogo contra oponentes controlados por IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <Link href="/character-selection?gameId=solo-game&gameName=Jogo%20Solo&host=true">Criar Jogo Solo</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
