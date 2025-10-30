'use client';

import { useState, useMemo } from 'react';
import type { Player, Property, TradeOffer } from '@/lib/definitions';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player;
  otherPlayers: Player[];
  onProposeTrade: (offer: TradeOffer) => void;
}

const propertyColorClasses: { [key: string]: string } = {
  brown: 'border-l-4 border-[#955436]',
  lightblue: 'border-l-4 border-[#aae0fa]',
  pink: 'border-l-4 border-[#d93a96]',
  orange: 'border-l-4 border-[#f7941d]',
  red: 'border-l-4 border-[#ed1b24]',
  yellow: 'border-l-4 border-[#fef200]',
  green: 'border-l-4 border-[#1fb25a]',
  darkblue: 'border-l-4 border-[#0072bb]',
};

const AssetList = ({ player, selected, onToggle, title }: { player: Player, selected: string[], onToggle: (id: string) => void, title: string }) => {
  const properties = useMemo(() => player.properties
    .map(id => boardSpaces.find(p => 'id' in p && p.id === id) as Property)
    .filter(p => p) // Filter out undefined
    .sort((a,b) => (a.color || '').localeCompare(b.color || '')), [player]);

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">{title}</h4>
      <ScrollArea className="h-48 rounded-md border p-2">
        {properties.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-4">Sem propriedades</p>
        ) : (
          properties.map(prop => {
            const isMortgaged = player.mortgagedProperties.includes(prop.id);
            if (isMortgaged) return null; // Can't trade mortgaged properties

            return (
              <div
                key={prop.id}
                className={cn("flex items-center gap-3 p-2 rounded-md cursor-pointer", propertyColorClasses[prop.color], selected.includes(prop.id) && 'bg-accent')}
                onClick={() => onToggle(prop.id)}
              >
                <Checkbox checked={selected.includes(prop.id)} onCheckedChange={() => onToggle(prop.id)} />
                <Label htmlFor={prop.id} className="flex-1 cursor-pointer">{prop.name}</Label>
              </div>
            )
          })
        )}
      </ScrollArea>
    </div>
  )
};


export function TradeDialog({
  isOpen,
  onOpenChange,
  player,
  otherPlayers,
  onProposeTrade,
}: TradeDialogProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>(otherPlayers[0]?.id);
  
  const [playerOffer, setPlayerOffer] = useState<{ properties: string[], money: number }>({ properties: [], money: 0 });
  const [opponentOffer, setOpponentOffer] = useState<{ properties: string[], money: number }>({ properties: [], money: 0 });

  const selectedPlayer = useMemo(() => otherPlayers.find(p => p.id === selectedPlayerId), [selectedPlayerId, otherPlayers]);

  const handlePropose = () => {
    if (!selectedPlayer) {
        console.error('Nenhum jogador selecionado');
        return;
    }
    
    if (playerOffer.properties.length === 0 && opponentOffer.properties.length === 0 && playerOffer.money === 0 && opponentOffer.money === 0) {
        console.error('Oferta vazia');
        return;
    }

    onProposeTrade({
        fromId: player.id,
        toId: selectedPlayer.id,
        propertiesTo: playerOffer.properties,
        propertiesFrom: opponentOffer.properties,
        moneyTo: playerOffer.money,
        moneyFrom: opponentOffer.money
    });

    // Reset state after proposing
    setPlayerOffer({ properties: [], money: 0 });
    setOpponentOffer({ properties: [], money: 0 });
  };

  const togglePlayerProperty = (id: string) => {
    setPlayerOffer(prev => ({ ...prev, properties: prev.properties.includes(id) ? prev.properties.filter(p => p !== id) : [...prev.properties, id] }));
  }

  const toggleOpponentProperty = (id: string) => {
    setOpponentOffer(prev => ({ ...prev, properties: prev.properties.includes(id) ? prev.properties.filter(p => p !== id) : [...prev.properties, id] }));
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Propor uma Negociação</DialogTitle>
          <DialogDescription>
            Selecione propriedades e dinheiro para trocar com outro jogador. Propriedades hipotecadas não podem ser negociadas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center py-4">
            <div className="col-span-1 sm:col-span-3">
                <Label htmlFor="trade-partner">Negociar com:</Label>
                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                    <SelectTrigger id="trade-partner">
                        <SelectValue placeholder="Selecione um jogador" />
                    </SelectTrigger>
                    <SelectContent>
                        {otherPlayers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            
            {selectedPlayer && (
                <>
                    <div className="col-span-1">
                        <AssetList player={player} selected={playerOffer.properties} onToggle={togglePlayerProperty} title="Suas Propriedades" />
                        <div className="mt-2 space-y-1">
                            <Label htmlFor="your-money">Dinheiro para Oferecer</Label>
                            <Input id="your-money" type="number" min="0" max={player.money} value={playerOffer.money} onChange={e => setPlayerOffer(p => ({...p, money: parseInt(e.target.value) || 0}))} />
                        </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                        <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
                    </div>
                     <div className="col-span-1">
                        <AssetList player={selectedPlayer} selected={opponentOffer.properties} onToggle={toggleOpponentProperty} title={`Propriedades de ${selectedPlayer.name}`} />
                        <div className="mt-2 space-y-1">
                            <Label htmlFor="their-money">Dinheiro para Pedir</Label>
                            <Input id="their-money" type="number" min="0" max={selectedPlayer.money} value={opponentOffer.money} onChange={e => setOpponentOffer(p => ({...p, money: parseInt(e.target.value) || 0}))} />
                        </div>
                    </div>
                </>
            )}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handlePropose} disabled={!selectedPlayerId}>Propor Troca</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
