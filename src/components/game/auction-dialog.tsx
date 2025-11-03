'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Player, Property, Auction, Game } from '@/lib/definitions';
import { boardSpaces } from '@/lib/game-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  
  const [nextBid, setNextBid] = useState(auction?.currentBid ? auction.currentBid + BID_INCREMENT : BID_INCREMENT);

  useEffect(() => {
    if (auction && auction.currentBid >= nextBid) {
      setNextBid(auction.currentBid + BID_INCREMENT);
    }
  }, [auction, nextBid]);


  const handleIncreaseBid = () => {
    const newBid = nextBid + BID_INCREMENT;
    if (newBid <= loggedInPlayer.money) {
      setNextBid(newBid);
    }
  };

  const handleDecreaseBid = () => {
    setNextBid(Math.max((auction?.currentBid || 0) + BID_INCREMENT, nextBid - BID_INCREMENT));
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel /> Leilão de Propriedade!
          </DialogTitle>
          <DialogDescription>A propriedade {property.name} está a ser leiloada.</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
            {/* Column 1: Property Info */}
            <div>
                <PropertyCard space={property} player={loggedInPlayer} allPlayers={allPlayers} onBuy={() => {}} onClose={() => {}} isMyTurn={false} />
            </div>

            {/* Column 2: Bidding Info & Actions */}
            <div className="flex flex-col justify-center space-y-6">
                <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Lance Atual</p>
                    <p className="text-4xl font-bold">R$ {auction.currentBid}</p>
                    {currentBidder ? (
                        <Badge>Por: {currentBidder.name}</Badge>
                    ) : (
                        <Badge variant="outline">Nenhum lance ainda</Badge>
                    )}
                </div>

                {isParticipating ? (
                    <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                        <p className="text-center font-semibold">Sua Ação</p>
                        <div className="flex items-center justify-center gap-2">
                            <Button variant="outline" size="icon" onClick={handleDecreaseBid} disabled={nextBid <= ((auction?.currentBid || 0) + BID_INCREMENT)}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-2xl font-bold w-28 text-center">R$ {nextBid}</span>
                            <Button variant="outline" size="icon" onClick={handleIncreaseBid} disabled={nextBid + BID_INCREMENT > loggedInPlayer.money}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button onClick={handlePlaceBid} disabled={!canBid}>Dar Lance (R$ {nextBid})</Button>
                            <Button variant="destructive-outline" onClick={onPass}>Desistir</Button>
                        </div>
                    </div>
                ) : (
                    <p className="mt-6 text-center text-muted-foreground">Você desistiu deste leilão.</p>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}