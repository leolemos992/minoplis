'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dices, Handshake, Building, Gavel, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameActionsProps {
  onDiceRoll: (dice1: number, dice2: number) => void;
  onPayBail?: () => void;
  onEndTurn: () => void;
  onTrade: () => void;
  isPlayerInJail: boolean;
  canPayBail: boolean;
  onManageProperties: () => void;
  playerHasProperties: boolean;
  isTurnActive: boolean;
  hasRolled: boolean;
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


export function GameActions({ onDiceRoll, onPayBail, onEndTurn, onTrade, isPlayerInJail, canPayBail, onManageProperties, playerHasProperties, isTurnActive, hasRolled }: GameActionsProps) {
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
      }, 1000);

      return () => {
        clearInterval(rollInterval);
        clearTimeout(stopTimeout);
      };
    }
  }, [isRolling, onDiceRoll, isPlayerInJail]);

  const canEndTurn = isTurnActive && hasRolled;

  return (
    <div className="p-4 rounded-lg bg-card/80 backdrop-blur-sm">
      <div className="space-y-2">
        <div className="flex h-20 items-center justify-center gap-4">
          <div className="flex gap-4 rounded-lg border bg-background p-2">
            <DiceIcon value={dice[0]} />
            <DiceIcon value={dice[1]} />
          </div>
        </div>
        <Button
          size="lg"
          className="group w-full"
          onClick={rollDice}
          disabled={!isTurnActive || isRolling || hasRolled}
        >
          <Dices className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
          {isRolling ? 'Rolando...' : (isPlayerInJail ? 'Tentar Rolar Duplos' : 'Rolar Dados')}
        </Button>
        {isPlayerInJail && (
          <Button
            size="lg"
            variant="outline"
            className="group w-full"
            onClick={onPayBail}
            disabled={!isTurnActive || !canPayBail || isRolling || hasRolled}
          >
            <Gavel className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            Pagar Fiança (R$50)
          </Button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            className="group w-full" 
            disabled={!isTurnActive || isRolling}
            onClick={onTrade}
          >
            <Handshake className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            Negociar
          </Button>
          <Button 
            variant="outline" 
            className="group w-full" 
            disabled={!isTurnActive || isRolling || !playerHasProperties}
            onClick={onManageProperties}
          >
            <Building className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            Gerenciar
          </Button>
        </div>
        <Button
            size="lg"
            variant={canEndTurn ? 'default' : 'secondary'}
            className={cn("w-full", canEndTurn && "animate-pulse")}
            onClick={onEndTurn}
            disabled={!isTurnActive || isRolling || !hasRolled}
        >
            <CheckSquare className="mr-2 h-5 w-5" />
            Encerrar Turno
        </Button>
      </div>
    </div>
  );
}
