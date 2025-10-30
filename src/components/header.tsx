'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { Button } from './ui/button';
import { LogOut, PlusCircle } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const isGamePage = pathname.includes('/game/');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>

        {isGamePage && (
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/lobby">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Jogo
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
