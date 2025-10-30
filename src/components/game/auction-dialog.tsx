'use client';

import { useState, useMemo, useEffect } from 'react';
import type { AuctionState, Player, Property } from '@/lib/definitions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gavel, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PropertyCard } from './property-card';
import { Avatar } from '../ui/avatar';
import { totems } from '@/lib/game-data';

const playerColors: { [key: string]: { border: string; text: string; bg: string } } = {
    red: { border: 'border-red-500', text: 'text-red-500', bg: 'bg-red-500' },
    blue: { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500' },
    green: { border: 'border-green-500', text: 'text-green-500', bg: 'bg-green-500' },
    yellow: { border: 'border-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-500' },
    purple: { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500' },
    orange: { border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-500' },
};

interface AuctionDialogProps {
  isOpen: boolean;
  auctionState: AuctionState | null;
  players: Player[];
  humanPlayerId: string;
  onBid: (playerId: string, amount: number) => void;
  onPass: (playerId: string) => void;
}

export function AuctionDialog({
  isOpen,
  auctionState,
  players,
  humanPlayerId,
  onBid,
  onPass,
}: AuctionDialogProps) {
  const [bidAmount, setBidAmount] = useState(0);

  useEffect(() => {
    if (auctionState) {
      setBidAmount(auctionState.currentBid + 10);
    }
  }, [auctionState]);

  if (!auctionState) return null;

  const { property, currentBid, highestBidderId, playersInAuction, turnIndex } = auctionState;
  const humanPlayer = players.find(p => p.id === humanPlayerId);
  const highestBidder = players.find(p => p.id === highestBidderId);
  const currentPlayerForBid = players.find(p => p.id === playersInAuction[turnIndex]);
  
  const isMyTurnToBid = currentPlayerForBid?.id === humanPlayerId;

  const handleBid = () => {
    if (!humanPlayer) return;
    if (bidAmount <= currentBid) {
      // Maybe use a toast here in the future
      console.error(`Seu lance deve ser maior que R$${currentBid}.`);
      return;
    }
    if (humanPlayer.money < bidAmount) {
        console.error('Você não tem fundos para este lance.');
        return;
    }
    onBid(humanPlayer.id, bidAmount);
  };
  
  const handlePass = () => {
    onPass(humanPlayerId);
  }

  const TotemIcon = ({player}: {player: Player}) => {
    const totemData = totems.find(t => t.id === player.totem);
    if (!totemData) return null;
    const color = playerColors[player.color] || playerColors.blue;
    return (
        <Avatar className={cn("h-8 w-8 flex-shrink-0 flex items-center justify-center", color.bg)}>
            <totemData.icon className="h-5 w-5 text-white" />
        </Avatar>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl grid-cols-1 md:grid-cols-2">
        <div className="col-span-1 md:col-span-1 p-4">
             <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                    <Gavel /> Leilão em Andamento!
                </DialogTitle>
                <DialogDescription>
                    A propriedade {property.name} está sendo leiloada. Dê seu lance!
                </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-4">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-2">
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-medium text-muted-foreground">Lance Atual</span>
                        <span className="font-bold text-2xl text-primary">R$ {currentBid}</span>
                    </div>
                     {highestBidder && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Maior Lance</span>
                            <div className="flex items-center gap-2 font-semibold">
                                <TotemIcon player={highestBidder} />
                                <span>{highestBidder.name}</span>
                            </div>
                        </div>
                    )}
                </div>
                
                 {currentPlayerForBid && (
                     <div className="text-center p-2 rounded-md bg-accent">
                         <p className="font-semibold">É a vez de {currentPlayerForBid.name} dar um lance.</p>
                     </div>
                 )}

                <div className="space-y-2">
                    <Label htmlFor="bid-amount">Seu Lance</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="bid-amount"
                            type="number"
                            className="pl-8"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                            min={currentBid + 1}
                            step={10}
                            disabled={!isMyTurnToBid}
                        />
                    </div>
                </div>
            </div>

            <DialogFooter className="grid grid-cols-2 gap-2">
                <Button onClick={handlePass} variant="outline" disabled={!isMyTurnToBid}>Passar</Button>
                <Button onClick={handleBid} disabled={!isMyTurnToBid}>Dar Lance</Button>
            </DialogFooter>
        </div>

        <div className="col-span-1 hidden md:block">
            <div className="scale-90 transform">
              <PropertyCard space={property} player={humanPlayer!} />
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
