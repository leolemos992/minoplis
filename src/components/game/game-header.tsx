'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dices, Landmark, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameHeaderProps {
  currentPlayerName: string;
  onDiceRoll: (dice1: number, dice2: number) => void;
  onEndTurn: () => void;
  onManageProperties: () => void;
  onPayBail: () => void;
  isTurnActive: boolean;
  hasRolled: boolean;
  diceValue: [number, number];
  playerInJail: boolean;
}

function DiceIcon({ value }: { value: number }) {
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
    'top-left': '1 / 1', 'top-right': '1 / 3', 'mid-left': '2 / 1',
    'center': '2 / 2', 'mid-right': '2 / 3', 'bottom-left': '3 / 1',
    'bottom-right': '3 / 3',
  };

  const currentPips = pipPatterns[value] || [];

  return (
    <div className="grid h-8 w-8 grid-cols-3 grid-rows-3 gap-0.5 rounded-md border bg-white p-0.5 shadow-sm">
      {currentPips.map((area) => (
        <div key={area} className={`w-full h-full rounded-full bg-black`} style={{ gridArea: pipGridAreas[area] }} />
      ))}
    </div>
  );
}

export function GameHeader({ currentPlayerName, onDiceRoll, onEndTurn, onManageProperties, onPayBail, isTurnActive, hasRolled, diceValue, playerInJail }: GameHeaderProps) {
  const [dice, setDice] = useState<[number, number]>(diceValue);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    setDice(diceValue);
  }, [diceValue]);

  const rollDice = () => {
    if (!isTurnActive || isRolling || hasRolled) return;
    setIsRolling(true);
  };

  useEffect(() => {
    if (isRolling) {
      const rollInterval = setInterval(() => {
        setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
      }, 50);

      const stopTimeout = setTimeout(() => {
        clearInterval(rollInterval);
        setIsRolling(false);
        const finalD1 = Math.floor(Math.random() * 6) + 1;
        const finalD2 = Math.floor(Math.random() * 6) + 1;
        setDice([finalD1, finalD2]);
        onDiceRoll(finalD1, finalD2);
      }, 1000);

      return () => {
        clearInterval(rollInterval);
        clearTimeout(stopTimeout);
      };
    }
  }, [isRolling, onDiceRoll]);
  
  const canRoll = isTurnActive && !hasRolled && !isRolling;
  const canEndTurn = isTurnActive && hasRolled && !isRolling;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Turno de: <span className="text-primary">{currentPlayerName}</span>
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-md border bg-slate-100 p-2">
           <DiceIcon value={dice[0]} />
           <span className="font-bold text-slate-600">+</span>
           <DiceIcon value={dice[1]} />
        </div>
        <Button onClick={onManageProperties} variant="outline">
            <Wallet className="mr-2 h-4 w-4" /> Gerir
        </Button>
        {playerInJail ? (
             <Button onClick={onPayBail} disabled={!isTurnActive} className="w-32 bg-amber-600 hover:bg-amber-700">Pagar Fiança (R$50)</Button>
        ) : (
             <Button onClick={rollDice} disabled={!canRoll} className="w-32">
                {isRolling ? 'Rolando...' : 'Rolar Dados'}
             </Button>
        )}
        <Button variant="outline" onClick={onEndTurn} disabled={!canEndTurn}>
          Terminar Turno
        </Button>
      </div>
    </header>
  );
}
