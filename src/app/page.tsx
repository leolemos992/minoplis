import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Users } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl">
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
                  O clássico jogo de troca de propriedades, reinventado. Crie
                  seus próprios tabuleiros, escolha personagens únicos e leve seus
                  amigos à falência.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="group">
                  <Link href="/lobby">
                    <User className="mr-2 h-5 w-5" />
                    Jogo Solo
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" disabled>
                   <Users className="mr-2 h-5 w-5" />
                    Multiplayer
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
