'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, PlusCircle } from 'lucide-react';

export function GameControls() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Controles do Jogo</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <Button asChild variant="outline" className="group w-full">
          <Link href="/lobby">
            <PlusCircle className="mr-2 h-5 w-5" />
            Novo Jogo
          </Link>
        </Button>
        <Button asChild variant="destructive-outline" className="group w-full">
          <Link href="/">
            <LogOut className="mr-2 h-5 w-5" />
            Sair
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
