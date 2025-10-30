'use client';

import { useState, useEffect } from 'react';
import type { Player } from '@/lib/definitions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Dices, User, Check } from 'lucide-react';
import { totems } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { Avatar } from '../ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';

const playerColors: { [key: string]: string } = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
};

function DiceIcon({ value }: { value: number }) {
  const pipPatterns: { [key: number]: string[] } = {
    1: ['center'], 2: ['top-left', 'bottom-right'], 3: ['top-left', 'center', 'bottom-right'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'mid-left', 'mid-right', 'bottom-left', 'bottom-right'],
  };
  const pipGridAreas: { [key: string]: string } = {
    'top-left': '1 / 1', 'top-right': '1 / 3', 'mid-left': '2 / 1', 'center': '2 / 2',
    'mid-right': '2 / 3', 'bottom-left': '3 / 1', 'bottom-right': '3 / 3',
  };
  const currentPips = pipPatterns[value] || [];
  return (
    <div className="grid h-8 w-8 grid-cols-3 grid-rows-3 gap-0.5 rounded-md border bg-white p-0.5 shadow-sm">
      {currentPips.map((area) => ( <div key={area} className="w-full h-full rounded-full bg-black" style={{ gridArea: pipGridAreas[area] }}></div> ))}
    </div>
  );
}

interface RollToStartDialogProps {
  isOpen: boolean;
  players: Player[];
  rolls: Record<string, number>;
  onRoll: (playerId: string, roll: number) => void;
  localPlayerId?: string;
}

export function RollToStartDialog({ isOpen, players, rolls, onRoll, localPlayerId }: RollToStartDialogProps) {
  const [isRolling, setIsRolling] = useState(false);
  const localPlayer = players.find(p => p.userId === localPlayerId);
  const hasLocalPlayerRolled = localPlayer && rolls[localPlayer.id];

  const handleRoll = () => {
    if (!localPlayer || isRolling || hasLocalPlayerRolled) return;
    setIsRolling(true);
  };

  useEffect(() => {
    if (isRolling) {
      const stopTimeout = setTimeout(() => {
        setIsRolling(false);
        if (localPlayer) {
            const roll = Math.floor(Math.random() * 12) + 1;
            onRoll(localPlayer.id, roll);
        }
      }, 1000);
      return () => clearTimeout(stopTimeout);
    }
  }, [isRolling, onRoll, localPlayer]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Ordem de Início</DialogTitle>
          <DialogDescription className="text-center">
            Cada jogador rola os dados. O maior resultado começa!
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-3">
            <AnimatePresence>
            {players.map((player) => {
                const totemData = totems.find(t => t.id === player.totem);
                const TotemIcon = totemData?.icon;
                const roll = rolls[player.id];
                
                return (
                    <motion.div 
                        key={player.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between rounded-lg bg-muted p-3"
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className={cn("h-10 w-10 flex items-center justify-center", playerColors[player.color])}>
                                {TotemIcon && <TotemIcon className="h-6 w-6 text-white" />}
                            </Avatar>
                            <span className="font-semibold">{player.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                           {roll ? (
                                <span className="font-bold text-lg text-primary">{roll}</span>
                           ) : (
                                <Dices className="h-5 w-5 text-muted-foreground animate-pulse" />
                           )}
                        </div>
                    </motion.div>
                )
            })}
            </AnimatePresence>
        </div>

        <DialogFooter>
          <Button 
            className="w-full"
            onClick={handleRoll}
            disabled={isRolling || !!hasLocalPlayerRolled || !localPlayer}
          >
            {isRolling ? 'Rolando...' : (hasLocalPlayerRolled ? <><Check className="mr-2"/>Aguardando os outros</> : <><Dices className="mr-2"/>Rolar Dados</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
