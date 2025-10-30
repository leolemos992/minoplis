'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, Handshake, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function GameActions() {
  const { toast } = useToast();
  const [dice, setDice] = useState<[number, number]>([0, 0]);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    //
  };

  useEffect(() => {
    if (isRolling) {
      const rollInterval = setInterval(() => {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setDice([d1, d2]);
      }, 50);

      const stopTimeout = setTimeout(() => {
        clearInterval(rollInterval);
        setIsRolling(false);
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setDice([d1, d2]);
        toast({
          title: "Você Rolou!",
          description: `Você rolou um ${d1} e um ${d2} para um total de ${d1 + d2}.`,
        });
      }, 1000);

      return () => {
        clearInterval(rollInterval);
        clearTimeout(stopTimeout);
      };
    }
  }, [isRolling, toast]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center items-center gap-4 h-20">
            {dice[0] > 0 && (
                <div className="flex gap-4 p-4 border rounded-lg bg-background">
                    <DiceIcon value={dice[0]} />
                    <DiceIcon value={dice[1]} />
                </div>
            )}
        </div>
        <Button size="lg" className="w-full group" onClick={rollDice} disabled={isRolling}>
          <Dices className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
          {isRolling ? 'Rolando...' : 'Rolar Dados'}
        </Button>
        <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full group">
                <Handshake className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Negociar
            </Button>
            <Button variant="outline" className="w-full group">
                <Building className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Gerenciar
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}


function DiceIcon({ value }: { value: number }) {
    const pips = Array.from({ length: value }, (_, i) => i);
    const pipClasses = [
        "row-start-2 col-start-2", // 1
        "row-start-1 col-start-1", "row-start-3 col-start-3", // 2
        "row-start-1 col-start-1", "row-start-2 col-start-2", "row-start-3 col-start-3", // 3
        "row-start-1 col-start-1", "row-start-1 col-start-3", "row-start-3 col-start-1", "row-start-3 col-start-3", // 4
        "row-start-1 col-start-1", "row-start-1 col-start-3", "row-start-2 col-start-2", "row-start-3 col-start-1", "row-start-3 col-start-3", // 5
        "row-start-1 col-start-1", "row-start-1 col-start-3", "row-start-2 col-start-1", "row-start-2 col-start-3", "row-start-3 col-start-1", "row-start-3 col-start-3", // 6
    ]

    return (
        <div className="w-10 h-10 rounded-md border-2 bg-white grid grid-cols-3 grid-rows-3 p-1">
            {pips.map(i => (
                <div key={i} className={`w-2 h-2 rounded-full bg-black ${pipClasses[i]}`}></div>
            ))}
        </div>
    );
}
