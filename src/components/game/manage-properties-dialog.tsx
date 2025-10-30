'use client';

import { useMemo } from 'react';
import type { Player, Property } from '@/lib/definitions';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, Hotel, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ManagePropertiesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player;
  onBuild: (propertyId: string, amount: number) => void;
  onSell: (propertyId: string, amount: number) => void;
}

const propertyColorClasses: { [key: string]: string } = {
  brown: 'bg-[#955436]',
  lightblue: 'bg-[#aae0fa]',
  pink: 'bg-[#d93a96]',
  orange: 'bg-[#f7941d]',
  red: 'bg-[#ed1b24]',
  yellow: 'bg-[#fef200]',
  green: 'bg-[#1fb25a]',
  darkblue: 'bg-[#0072bb]',
};

export function ManagePropertiesDialog({
  isOpen,
  onOpenChange,
  player,
  onBuild,
  onSell,
}: ManagePropertiesDialogProps) {
  const { toast } = useToast();

  const groupedProperties = useMemo(() => {
    const groups: { [color: string]: Property[] } = {};
    player.properties.forEach(id => {
      const prop = boardSpaces.find(p => 'id' in p && p.id === id) as Property | undefined;
      if (prop && prop.type === 'property' && prop.color) {
        if (!groups[prop.color]) {
          groups[prop.color] = [];
        }
        groups[prop.color].push(prop);
      }
    });
    return groups;
  }, [player.properties]);

  const ownedColorSets = useMemo(() => {
    const sets: { [color: string]: boolean } = {};
    const totalInSets = boardSpaces.reduce((acc, space) => {
        if ('color' in space && space.type === 'property' && 'color' in space && typeof space.color === 'string') {
            acc[space.color] = (acc[space.color] || 0) + 1;
        }
        return acc;
    }, {} as {[key: string]: number});

    for (const color in groupedProperties) {
      if (groupedProperties[color].length === totalInSets[color]) {
        sets[color] = true;
      }
    }
    return sets;
  }, [groupedProperties]);


  const handleBuildClick = (property: Property) => {
    const currentHouses = player.houses[property.id] || 0;
    
    if (currentHouses >= 5) {
        toast({ variant: 'destructive', title: 'Limite Atingido', description: 'Você já construiu um hotel nesta propriedade.' });
        return;
    }
    if (player.money < (property.houseCost || 0)) {
        toast({ variant: 'destructive', title: 'Dinheiro Insuficiente', description: 'Você não tem dinheiro para construir.' });
        return;
    }
    // Simplified build logic: doesn't enforce even building yet.
    onBuild(property.id, 1);
  };
  
  const handleSellClick = (property: Property) => {
      const currentHouses = player.houses[property.id] || 0;
      if (currentHouses === 0) {
          toast({ variant: 'destructive', title: 'Sem construções', description: 'Não há nada para vender nesta propriedade.' });
          return;
      }
      onSell(property.id, 1);
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Propriedades</DialogTitle>
          <DialogDescription>
            Construa casas e hotéis para aumentar o valor dos seus aluguéis.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {Object.keys(groupedProperties).length > 0 ? (
              Object.entries(groupedProperties).map(([color, props]) => (
                <div key={color}>
                  <div className="flex items-center gap-2 mb-2">
                     <div className={cn("w-3 h-6 rounded-sm", propertyColorClasses[color])}></div>
                     <h3 className="font-semibold capitalize">{color}</h3>
                     {ownedColorSets[color] && <Badge>Conjunto Completo</Badge>}
                  </div>
                  <div className="space-y-2 pl-5">
                    {props.map(prop => {
                        const houseCount = player.houses[prop.id] || 0;
                        const canBuild = ownedColorSets[color] && houseCount < 5;
                        const canSell = houseCount > 0;
                        return (
                            <div key={prop.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                <div className="flex-1">
                                    <p className="font-medium">{prop.name}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {houseCount === 5 ? (
                                            <Hotel className="w-5 h-5 text-red-600" />
                                        ) : (
                                            Array.from({length: houseCount}).map((_, i) => <Home key={i} className="w-4 h-4 text-green-600" />)
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button size="icon" variant="outline" className="h-7 w-7" disabled={!canSell} onClick={() => handleSellClick(prop)}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="h-7 w-7" disabled={!canBuild} onClick={() => handleBuildClick(prop)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Você não possui nenhuma propriedade para gerenciar.
              </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
