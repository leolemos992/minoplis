'use client';
import type { Player } from '@/lib/definitions';
import { totems } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const playerBgColors: { [key: string]: string } = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};


export function PlayerToken({ player, size = 8 }: { player: Player, size?: number }) {
  const totem = totems.find((t) => t.id === player.totem);
  const TotemIcon = totem ? totem.icon : null;
  const bgColorClass = playerBgColors[player.color] || 'bg-gray-700';

  if (!TotemIcon) return null;

  const sizeClass = `h-${size} w-${size}`;
  const paddingClass = `p-${Math.floor(size / 4)}`;


  return (
    <motion.div
        layoutId={`player-token-${player.id}`}
        className={cn(
            "rounded-full flex items-center justify-center drop-shadow-lg", 
            sizeClass,
            bgColorClass
        )}
        initial={{ scale: 0.8, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        title={player.name}
    >
        <TotemIcon className={cn("h-full w-full text-white", paddingClass)} stroke="black" strokeWidth={0.5} />
    </motion.div>
  );
}
