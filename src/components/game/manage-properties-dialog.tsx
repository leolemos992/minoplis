'use client';

import { useMemo } from 'react';
import type { Player, Property } from '@/lib/definitions';
import { boardSpaces } from '@/lib/game-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, Hotel, Minus, Plus, Banknote, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ManagePropertiesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player;
  allPlayers: Player[];
  onBuild: (propertyId: string, amount: number) => void;
  onSell: (propertyId: string, amount: number) => void;
  onMortgage: (propertyId: string, isMortgaging: boolean) => void;
}

const propertyColorClasses: { [key: string]: string } = {
  brown: 'bg-[#955436]', lightblue: 'bg-[#aae0fa]', pink: 'bg-[#d93a96]',
  orange: 'bg-[#f7941d]', red: 'bg-[#ed1b24]', yellow: 'bg-[#fef200]',
  green: 'bg-[#1fb25a]', darkblue: 'bg-[#0072bb]',
};

export function ManagePropertiesDialog({ isOpen, onOpenChange, player, allPlayers, onBuild, onSell, onMortgage }: ManagePropertiesDialogProps) {
  const ownedProperties = useMemo(() => {
    return boardSpaces.filter(p => 'id' in p && player.properties.includes(p.id)) as Property[];
  }, [player.properties]);

  const groupedProperties = useMemo(() => {
    const groups: { [color: string]: Property[] } = {};
    ownedProperties.forEach(prop => {
      if (prop.type === 'property' && prop.color) {
        if (!groups[prop.color]) groups[prop.color] = [];
        groups[prop.color].push(prop);
      }
    });
    return groups;
  }, [ownedProperties]);

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
          // Check if any property in the set is mortgaged
          const isAnyMortgaged = groupedProperties[color].some(p => player.mortgagedProperties.includes(p.id));
          if (!isAnyMortgaged) {
            sets[color] = true;
          }
      }
    }
    return sets;
  }, [groupedProperties, player.mortgagedProperties]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Propriedades</DialogTitle>
          <DialogDescription>Construa, venda e hipoteque suas propriedades. Lembre-se da regra de construção uniforme.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        
                        const canBuild = ownedColorSets[color] && houseCount < 5 && player.money >= (prop.houseCost || 0);
                        const canSell = houseCount > 0;
                        const canMortgage = houseCount === 0 && !isMortgaged;
                        const canUnmortgage = isMortgaged && player.money >= (prop.price / 2 * 1.1);

                        return (
                            <div key={prop.id} className={cn("flex items-center justify-between p-2 rounded-md bg-muted/50", isMortgaged && 'bg-destructive/10')}>
                                <div className="flex-1">
                                    <p className="font-medium">{prop.name}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {houseCount === 5 ? <Hotel className="w-5 h-5 text-red-600" /> : Array.from({length: houseCount}).map((_, i) => <Home key={i} className="w-4 h-4 text-green-600" />)}
                                        {isMortgaged && <Badge variant="destructive">Hipotecado</Badge>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     {!isMortgaged ? (<>
                                        <Button size="icon" variant="outline" className="h-7 w-7" disabled={!canSell} onClick={() => onSell(prop.id, 1)}><Minus className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="outline" className="h-7 w-7" disabled={!canBuild} onClick={() => onBuild(prop.id, 1)}><Plus className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="destructive-outline" className="h-7 w-7" disabled={!canMortgage} onClick={() => onMortgage(prop.id, true)}><Banknote className="h-4 w-4" /></Button>
                                     </>) : (
                                        <Button size="icon" variant="outline" className="h-7 w-7" disabled={!canUnmortgage} onClick={() => onMortgage(prop.id, false)}><Landmark className="h-4 w-4" /></Button>
                                     )}
                                </div>
                            </div>
                        )
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8 col-span-2">Você não possui nenhuma propriedade para gerenciar.</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter><Button onClick={() => onOpenChange(false)}>Fechar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    