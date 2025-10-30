import type { Player, Property } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Zap, Building, Train, Gem, Hotel, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DialogHeader, DialogTitle } from '../ui/dialog';

const colorClasses: { [key: string]: string } = {
  brown: 'bg-[#955436]',
  lightblue: 'bg-[#aae0fa]',
  pink: 'bg-[#d93a96]',
  orange: 'bg-[#f7941d]',
  red: 'bg-[#ed1b24]',
  yellow: 'bg-[#fef200]',
  green: 'bg-[#1fb25a]',
  darkblue: 'bg-[#0072bb]',
};

const getIcon = (space: any) => {
  switch (space.type) {
    case 'go':
      return <Home className="h-6 w-6" />;
    case 'jail':
      return <Building className="h-6 w-6" />;
    case 'railroad':
      return <Train className="h-6 w-6" />;
    case 'utility':
      if (space.name.includes('CELESC')) return <Zap className="h-6 w-6" />;
      if (space.name.includes('SAMAE')) return <Gem className="h-6 w-6" />;
      return <Gem className="h-6 w-6" />;
    default:
      return null;
  }
};

interface PropertyCardProps {
  space: Property | { type: string; name: string };
  player: Player;
  onBuy?: (property: Property) => void;
  onClose: () => void;
}

export function PropertyCard({ space, player, onBuy, onClose }: PropertyCardProps) {
  if (!space) return null;

  const isProperty = 'price' in space;
  const property = isProperty ? (space as Property) : null;
  const isOwnedByCurrentPlayer = property && player.properties.includes(property.id);
  // In a real multiplayer game, you'd check against all players.
  // For now, we assume if it's not the current player's, it could be someone else's or unowned.
  const isOwned = property && (player.properties.includes(property.id)); // Simplified for now

  const handleBuy = () => {
    if (property && onBuy) {
      onBuy(property);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <DialogHeader>
         <DialogTitle className="sr-only">{space.name}</DialogTitle>
      </DialogHeader>
      <CardHeader className="p-4">
        {property && property.color && (
          <div
            className={cn(
              'h-16 w-full rounded-t-md flex items-center justify-center',
              colorClasses[property.color] || 'bg-gray-200'
            )}
          >
            <div className="text-black">{getIcon(property)}</div>
          </div>
        )}
        <div className="pt-4">
          <CardTitle className="text-2xl">{space.name}</CardTitle>
          {isProperty && (
            <CardDescription className="text-lg font-bold">
              R$ {property?.price}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {property && property.type === 'property' && (
          <div className="space-y-2 text-sm">
            <h4 className="font-bold">Aluguel</h4>
            <div className="flex justify-between">
              <span>Aluguel</span>
              <span>R$ {property.rent[0]}</span>
            </div>
             <div className="flex items-center justify-between">
                <span className="flex items-center"><Home className="mr-1 h-4 w-4" /> Com 1 casa</span>
                <span>R$ {property.rent[1]}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="flex items-center"><Home className="mr-1 h-4 w-4" /><Home className="mr-1 h-4 w-4" /> Com 2 casas</span>
                <span>R$ {property.rent[2]}</span>
            </div>
            <div className="flex items-center justify-between">
                 <span className="flex items-center"><Home className="mr-1 h-4 w-4" /><Home className="mr-1 h-4 w-4" /><Home className="mr-1 h-4 w-4" /> Com 3 casas</span>
                <span>R$ {property.rent[3]}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="flex items-center"><Home className="mr-1 h-4 w-4" /><Home className="mr-1 h-4 w-4" /><Home className="mr-1 h-4 w-4" /><Home className="mr-1 h-4 w-4" /> Com 4 casas</span>
                <span>R$ {property.rent[4]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center"><Hotel className="mr-1 h-5 w-5" /> Com HOTEL</span>
              <span>R$ {property.rent[5]}</span>
            </div>
          </div>
        )}
         {property && (property.type === 'railroad' || property.type === 'utility') && (
             <p className="text-sm text-muted-foreground">O aluguel depende do número de propriedades do mesmo tipo que o proprietário possui.</p>
         )}

         {!isProperty && space.type !== 'go' && (
            <p className="text-sm text-muted-foreground text-center py-8">Este é um espaço de ação. Siga as instruções ao parar aqui.</p>
         )}

      </CardContent>
      <CardFooter className="flex flex-col gap-2 p-4">
        {isProperty && !isOwned && player.money >= (property?.price || Infinity) && (
          <Button className="w-full" onClick={handleBuy}>Comprar Propriedade</Button>
        )}
        {isOwnedByCurrentPlayer && (
             <div className="w-full text-center p-2 bg-green-100 text-green-800 rounded-md text-sm font-medium flex items-center justify-center gap-2">
                <User className="h-4 w-4" />
                <span>Proprietário: {player.name}</span>
             </div>
         )}
         {isProperty && !isOwnedByCurrentPlayer && player.money < (property?.price || Infinity) && (
            <Button className="w-full" disabled>Dinheiro insuficiente</Button>
         )}

        <Button variant="ghost" className="w-full" onClick={onClose}>
          Fechar
        </Button>
      </CardFooter>
    </Card>
  );
}
