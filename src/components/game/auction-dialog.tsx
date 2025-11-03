'use client';

import { useMemo, useState } from 'react';
import type { Player, Property, Auction, Game } from '@/lib/definitions';
import { boardSpaces } from '@/lib/game-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gavel, Minus, Plus } from 'lucide-react';
import { PropertyCard } from './property-card';
import { Badge } from '../ui/badge';

interface AuctionDialogProps {
  game: Game;
  allPlayers: Player[];
  loggedInPlayer: Player;
  onBid: (amount: number) => void;
  onPass: () => void;
}

const BID_INCREMENT = 10;

export function AuctionDialog({ game, allPlayers, loggedInPlayer, onBid, onPass }: AuctionDialogProps) {
  const auction = game.auction;
  const property = useMemo(() => {
    if (!auction?.propertyId) return null;
    return boardSpaces.find(p => 'id' in p && p.id === auction.propertyId) as Property | null;
  }, [auction?.propertyId]);

  const currentBidder = useMemo(() => {
      if (!auction?.currentBidderId) return null;
      return allPlayers.find(p => p.id === auction.currentBidderId);
  }, [auction?.currentBidderId, allPlayers]);
  
  const [nextBid, setNextBid] = useState(auction?.currentBid || 0);

  // Update nextBid if the auction's currentBid changes from an external source
  if (auction && auction.currentBid > nextBid) {
      setNextBid(auction.currentBid);
  }

  const handleIncreaseBid = () => {
    const newBid = nextBid + BID_INCREMENT;
    if (newBid <= loggedInPlayer.money) {
      setNextBid(newBid);
    }
  };

  const handleDecreaseBid = () => {
    setNextBid(Math.max(auction?.currentBid || 0, nextBid - BID_INCREMENT));
  };
  
  const handlePlaceBid = () => {
      onBid(nextBid);
  }

  const isParticipating = auction?.participatingPlayerIds.includes(loggedInPlayer.id) || false;
  const canBid = isParticipating && nextBid > (auction?.currentBid || 0) && nextBid <= loggedInPlayer.money;

  if (!auction || auction.status !== 'active' || !property) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel /> Leilão de Propriedade!
          </DialogTitle>
          <DialogDescription>A propriedade {property.name} está a ser leiloada.</DialogDescription>
        </DialogHeader>

        <div className="my-4">
            <PropertyCard space={property} player={loggedInPlayer} onBuy={() => {}} onClose={() => {}} isMyTurn={false} />
        </div>
        
        <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Lance Atual</p>
            <p className="text-3xl font-bold">R$ {auction.currentBid}</p>
            {currentBidder ? (
                 <Badge>Por: {currentBidder.name}</Badge>
            ) : (
                <Badge variant="outline">Ninguém deu um lance ainda</Badge>
            )}
        </div>

        {isParticipating ? (
             <div className="mt-6 space-y-4">
                <p className="text-center font-semibold">Sua Ação</p>
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" onClick={handleDecreaseBid} disabled={nextBid <= (auction?.currentBid || 0)}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-bold w-24 text-center">R$ {nextBid}</span>
                    <Button variant="outline" size="icon" onClick={handleIncreaseBid} disabled={nextBid + BID_INCREMENT > loggedInPlayer.money}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                 <div className="flex gap-2">
                    <Button className="flex-1" onClick={handlePlaceBid} disabled={!canBid}>Dar Lance</Button>
                    <Button className="flex-1" variant="destructive" onClick={onPass}>Desistir</Button>
                 </div>
            </div>
        ) : (
            <p className="mt-6 text-center text-muted-foreground">Você desistiu deste leilão.</p>
        )}

      </DialogContent>
    </Dialog>
  );
}
