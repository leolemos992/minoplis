import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Users, SquarePlus, Star } from 'lucide-react';
import { Logo } from '@/components/logo';

const features = [
  {
    icon: <Users className="h-8 w-8 text-accent" />,
    title: 'Multiplayer Fun',
    description: 'Challenge your friends and family in exciting real-time matches.',
  },
  {
    icon: <SquarePlus className="h-8 w-8 text-accent" />,
    title: 'Custom Boards',
    description: 'Create unique game boards with your favorite locations and themes.',
  },
  {
    icon: <Star className="h-8 w-8 text-accent" />,
    title: 'Unique Characters',
    description: 'Choose from a diverse cast of characters, each with special abilities.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <section className="w-full py-20 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-card px-3 py-1 text-sm">
                  Welcome to
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  <Logo />
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  The classic property trading game, reimagined. Create your
                  own boards, choose unique characters, and bankrupt your
                  friends.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="group">
                  <Link href="/lobby">
                    Play Now <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full pb-20 md:pb-32 lg:pb-40">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
