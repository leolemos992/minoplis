'use client';
import type { Player } from '@/lib/definitions';
import { totems } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const playerColors: { [key: string]: string } = {
  red: 'text-red-500',
  blue: 'text-blue-500',
  green: 'text-green-500',
  yellow: 'text-yellow-500',
  purple: 'text-purple-500',
  orange: 'text-orange-500',
};


export function PlayerToken({ player, size = 8 }: { player: Player, size?: number }) {
  const totem = totems.find((t) => t.id === player.totem);
  const TotemIcon = totem ? totem.icon : null;
  const colorClass = playerColors[player.color] || 'text-black';

  if (!TotemIcon) return null;

  return (
    <motion.div
        layoutId={`player-token-${player.id}`}
        className={cn(`h-${size} w-${size} transform transition-all duration-500 ease-in-out`, colorClass)}
        initial={{ scale: 0.8, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        title={player.name}
    >
        <TotemIcon className="h-full w-full drop-shadow-lg" />
    </motion.div>
  );
}
