'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '@/lib/definitions';
import { PlayerToken } from './player-token';
import { Badge } from '@/components/ui/badge';
import { Banknote } from 'lucide-react';

interface PlayerStatusProps {
  allPlayers: Player[];
  currentPlayerId: string;
}

export function PlayerStatus({ allPlayers, currentPlayerId }: PlayerStatusProps) {
  return (
    <div className="w-full max-w-xs space-y-2">
      <AnimatePresence>
        {allPlayers.map((player) => (
          <motion.div
            key={player.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${
              player.id === currentPlayerId ? 'bg-primary/20 border-primary/50 border-2 scale-105' : 'bg-background/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <PlayerToken player={player} size={8} />
              <span className="font-semibold">{player.name}</span>
            </div>
            <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-base">
                    <Banknote className="mr-1 h-4 w-4" />
                    R$ {player.money}
                </Badge>
                {player.inJail && <Badge variant="destructive">Na Prisão</Badge>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
