'use client';
import type { Player } from '@/lib/definitions';
import { totems } from '@/lib/game-data.tsx';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const playerBgColors: { [key: string]: string } = {
  red: 'bg-red-500 border-red-700',
  blue: 'bg-blue-500 border-blue-700',
  green: 'bg-green-500 border-green-700',
  yellow: 'bg-yellow-400 border-yellow-600',
  purple: 'bg-purple-500 border-purple-700',
  orange: 'bg-orange-500 border-orange-700',
};


export function PlayerToken({ player, size = 8 }: { player: Player, size?: number }) {
  const totem = totems.find((t) => t.id === player.totem);
  const TotemIcon = totem ? totem.icon : null;
  const bgColorClass = playerBgColors[player.color] || 'bg-gray-700 border-gray-900';

  if (!TotemIcon) return null;

  const sizeClass = `h-${size} w-${size}`;
  const paddingClass = `p-${Math.floor(size / 5)}`;


  return (
    <motion.div
        layoutId={`player-token-${player.id}`}
        className={cn(
            "rounded-full flex items-center justify-center drop-shadow-lg border-2", 
            sizeClass,
            bgColorClass
        )}
        initial={{ scale: 0.8, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        title={player.name}
    >
        <TotemIcon className={cn("h-full w-full text-white", paddingClass)} stroke="black" strokeWidth={1} />
    </motion.div>
  );
}
