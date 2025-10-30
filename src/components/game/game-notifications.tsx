import { AnimatePresence, motion } from 'framer-motion';
import type { Notification } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info } from 'lucide-react';

export function GameNotifications({
  notifications,
}: {
  notifications: Notification[];
}) {
  return (
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-4/5 h-1/3 flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'w-full max-w-md rounded-lg p-3 text-sm font-semibold shadow-lg text-center flex items-center justify-center gap-2',
              notification.variant === 'destructive'
                ? 'bg-red-500/90 text-white'
                : 'bg-black/70 text-white'
            )}
          >
            {notification.variant === 'destructive' ? (
                <AlertTriangle className="h-4 w-4" />
            ) : (
                <Info className="h-4 w-4" />
            )}
            <span>{notification.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
