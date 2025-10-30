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
          <CardTitle className="text-2xl">Criar um Novo Jogo</CardTitle>
          <CardDescription>
            Comece um novo jogo com um tabuleiro personalizado e convide seus
            amigos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <Link href="/create-board">Criar Jogo</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
