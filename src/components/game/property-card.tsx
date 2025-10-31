import type { Player, Property } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Zap, Hotel, User, Bus } from 'lucide-react';
import { cn } from '@/lib/utils';

const colorClasses: { [key: string]: string } = {
  brown: 'bg-[#955436]', lightblue: 'bg-[#aae0fa]', pink: 'bg-[#d93a96]',
  orange: 'bg-[#f7941d]', red: 'bg-[#ed1b24]', yellow: 'bg-[#fef200]',
  green: 'bg-[#1fb25a]', darkblue: 'bg-[#0072bb]',
};

const getIcon = (space: any) => {
  switch (space.type) {
    case 'railroad': return <Bus className="h-8 w-8" />;
    case 'utility': return <Zap className="h-8 w-8" />;
    default: return null;
  }
};

interface PropertyCardProps {
  space: Property;
  player: Player;
  allPlayers?: Player[];
  onBuy: (property: Property) => void;
  onClose: () => void;
  isMyTurn: boolean;
}

export function PropertyCard({ space, player, allPlayers, onBuy, onClose, isMyTurn }: PropertyCardProps) {
  const owner = allPlayers?.find(p => p.properties.includes(space.id));

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="p-0">
        <div
          className={cn(
            'h-24 w-full rounded-t-md flex flex-col items-center justify-center p-4 text-center',
            space.color && colorClasses[space.color] ? colorClasses[space.color] : 'bg-gray-200'
          )}
        >
          { (space.type === 'railroad' || space.type === 'utility') && <div className="text-black">{getIcon(space)}</div> }
          <CardTitle className={cn("text-xl", (space.color === 'lightblue' || space.color === 'yellow') ? 'text-black' : 'text-white')}>{space.name}</CardTitle>
        </div>
        <div className="p-4">
          <CardDescription className="text-lg font-bold text-center">Preço: R$ {space.price}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {space.type === 'property' && space.rent && (
          <div className="space-y-2 text-sm">
            <h4 className="font-bold">Aluguel</h4>
            <div className="flex justify-between"><span>Aluguel</span><span>R$ {space.rent[0]}</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center"><Home className="mr-1 h-4 w-4" /> Com 1 casa</span><span>R$ {space.rent[1]}</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center"><Home className="mr-1 h-4 w-4" /><Home className="mr-1 h-4 w-4" /> Com 2 casas</span><span>R$ {space.rent[2]}</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center"><Home className="mr-1 h-4 w-4" /><Home className="mr-1 h-4 w-4" /><Home className="mr-1 h-4 w-4" /> Com 3 casas</span><span>R$ {space.rent[3]}</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center"><Home className="mr-1 h-4 w-4" /><Home className="mr-1 h-4 w-4" /><Home className="mr-1 h-4 w-4" /><Home className="mr-1 h-4 w-4" /> Com 4 casas</span><span>R$ {space.rent[4]}</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center"><Hotel className="mr-1 h-5 w-5" /> Com HOTEL</span><span>R$ {space.rent[5]}</span></div>
          </div>
        )}
         {(space.type === 'railroad' || space.type === 'utility') && (
             <p className="text-sm text-muted-foreground text-center">O aluguel depende do número de propriedades do mesmo tipo que o proprietário possui.</p>
         )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 p-4">
        {!owner && isMyTurn && player.money >= space.price && (
            <Button className="w-full" onClick={() => onBuy(space)}>Comprar Propriedade</Button>
        )}
         {owner && (
             <div className="w-full text-center p-2 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium flex items-center justify-center gap-2">
                <User className="h-4 w-4" /><span>Proprietário: {owner.id === player.id ? "Você" : owner.name}</span>
             </div>
         )}
         {!owner && isMyTurn && player.money < space.price && (
            <Button className="w-full" disabled>Dinheiro insuficiente</Button>
         )}
        <Button variant="ghost" className="w-full" onClick={onClose}>
          { !owner && isMyTurn ? "Não comprar" : "Fechar" }
        </Button>
      </CardFooter>
    </Card>
  );
}
