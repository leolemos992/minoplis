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
import { Home, Hotel, Minus, Plus, Banknote, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ManagePropertiesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player;
  onBuild: (propertyId: string, amount: number) => void;
  onSell: (propertyId: string, amount: number) => void;
  onMortgage: (propertyId: string) => void;
  onUnmortgage: (propertyId: string) => void;
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
  onMortgage,
  onUnmortgage,
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
        if (space.type === 'property' && 'color' in space && typeof space.color === 'string') {
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

  const handleMortgageClick = (property: Property) => {
      const houseCount = player.houses[property.id] || 0;
      if (houseCount > 0) {
          toast({ variant: 'destructive', title: 'Venda as construções primeiro', description: 'Você deve vender todas as casas/hotéis antes de hipotecar.' });
          return;
      }
      onMortgage(property.id);
  };

  const handleUnmortgageClick = (property: Property) => {
      onUnmortgage(property.id);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Propriedades</DialogTitle>
          <DialogDescription>
            Construa, venda, e hipoteque suas propriedades.
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
                        const isMortgaged = player.mortgagedProperties.includes(prop.id);

                        const canBuild = ownedColorSets[color] && houseCount < 5 && player.money >= (prop.houseCost || 0) && !isMortgaged;
                        const canSell = houseCount > 0;
                        const canMortgage = houseCount === 0 && !isMortgaged;
                        const canUnmortgage = isMortgaged && player.money >= (prop.price / 2 * 1.1);

                        return (
                            <div key={prop.id} className={cn("flex items-center justify-between p-2 rounded-md bg-muted/50", isMortgaged && 'bg-destructive/10')}>
                                <div className="flex-1">
                                    <p className="font-medium">{prop.name}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {houseCount === 5 ? (
                                            <Hotel className="w-5 h-5 text-red-600" />
                                        ) : (
                                            Array.from({length: houseCount}).map((_, i) => <Home key={i} className="w-4 h-4 text-green-600" />)
                                        )}
                                        {isMortgaged && <Badge variant="destructive">Hipotecado</Badge>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     {!isMortgaged ? (
                                        <>
                                            <Button size="icon" variant="outline" className="h-7 w-7" disabled={!canSell} onClick={() => handleSellClick(prop)}>
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="outline" className="h-7 w-7" disabled={!canBuild} onClick={() => handleBuildClick(prop)}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="destructive-outline" className="h-7 w-7" disabled={!canMortgage} onClick={() => handleMortgageClick(prop)}>
                                                <Banknote className="h-4 w-4" />
                                            </Button>
                                        </>
                                     ) : (
                                        <Button size="icon" variant="outline" className="h-7 w-7" disabled={!canUnmortgage} onClick={() => handleUnmortgageClick(prop)}>
                                            <Landmark className="h-4 w-4" />
                                        </Button>
                                     )}
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
