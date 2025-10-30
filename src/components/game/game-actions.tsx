'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, Handshake, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GameActionsProps {
  onDiceRoll: (dice1: number, dice2: number) => void;
}

function DiceIcon({ value }: { value: number }) {
  const pips = Array.from({ length: value }, (_, i) => i);

  const pipPatterns: { [key: number]: string[] } = {
    1: ['center'],
    2: ['top-left', 'bottom-right'],
    3: ['top-left', 'center', 'bottom-right'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: [
      'top-left',
      'top-right',
      'mid-left',
      'mid-right',
      'bottom-left',
      'bottom-right',
    ],
  };
  
  const pipGridAreas: { [key: string]: string } = {
    'top-left': '1 / 1',
    'top-right': '1 / 3',
    'mid-left': '2 / 1',
    'center': '2 / 2',
    'mid-right': '2 / 3',
    'bottom-left': '3 / 1',
    'bottom-right': '3 / 3',
    };

  const currentPips = pipPatterns[value] || [];

  return (
    <div className="grid h-12 w-12 grid-cols-3 grid-rows-3 gap-1 rounded-lg border-2 bg-white p-1 shadow-md">
      {currentPips.map((area) => (
        <div
          key={area}
          className={`w-full h-full rounded-full bg-black`}
          style={{ gridArea: pipGridAreas[area] }}
        ></div>
      ))}
    </div>
  );
}


export function GameActions({ onDiceRoll }: GameActionsProps) {
  const { toast } = useToast();
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
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
        const finalD1 = Math.floor(Math.random() * 6) + 1;
        const finalD2 = Math.floor(Math.random() * 6) + 1;
        setDice([finalD1, finalD2]);
        onDiceRoll(finalD1, finalD2);
        toast({
          title: 'Você Rolou!',
          description: `Você rolou um ${finalD1} e um ${finalD2} para um total de ${
            finalD1 + finalD2
          }.`,
        });
      }, 1000);

      return () => {
        clearInterval(rollInterval);
        clearTimeout(stopTimeout);
      };
    }
  }, [isRolling, onDiceRoll, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-20 items-center justify-center gap-4">
          <div className="flex gap-4 rounded-lg border bg-background p-4">
            <DiceIcon value={dice[0]} />
            <DiceIcon value={dice[1]} />
          </div>
        </div>
        <Button
          size="lg"
          className="group w-full"
          onClick={rollDice}
          disabled={isRolling}
        >
          <Dices className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
          {isRolling ? 'Rolando...' : 'Rolar Dados'}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="group w-full">
            <Handshake className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            Negociar
          </Button>
          <Button variant="outline" className="group w-full">
            <Building className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            Gerenciar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
