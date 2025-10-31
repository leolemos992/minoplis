import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Users } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center">
        <section className="w-full py-20 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-card px-3 py-1 text-sm">
                  Bem-vindo ao
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  <Logo />
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  O clássico jogo de tabuleiro, adaptado para a galera do Bahia
                  Palace. O verdadeiro e único MINOPOLIS
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="group">
                  <Link href="/lobby?solo=true">
                    <User className="mr-2 h-5 w-5" />
                    Jogo Solo
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/lobby">
                    <Users className="mr-2 h-5 w-5" />
                    Multiplayer
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>Versão 1.0.0</p>
        <p>
          Desenvolvido com ❤️ por{' '}
          <a
            href="https://instagram.com/leo.lemos992"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            @leo.lemos992
          </a>
        </p>
      </footer>
    </div>
  );
}
