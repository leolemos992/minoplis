'use client';

import { useMemo, useState } from 'react';
import type { Player, Property, GameLog } from '@/lib/definitions';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Wallet,
  Landmark,
  Shield,
  Home,
  Hotel,
  Users,
  MessageCircle,
  ClipboardList,
  Banknote,
  Minus,
  Plus,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { totems, boardSpaces } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const playerColors: { [key: string]: { border: string; text: string; bg: string } } = {
    red: { border: 'border-red-500', text: 'text-red-500', bg: 'bg-red-500' },
    blue: { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500' },
    green: { border: 'border-green-500', text: 'text-green-500', bg: 'bg-green-500' },
    yellow: { border: 'border-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-500' },
    purple: { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500' },
    orange: { border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-500' },
};

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

function HouseDisplay({ count }: { count: number }) {
  if (count === 0) return null;
  if (count === 5) {
    return <Hotel className="w-4 h-4 text-red-700" />;
  }
  return (
    <div className="flex gap-px">
      {Array.from({ length: count }).map((_, i) => (
        <Home key={i} className="w-3 h-3 text-green-700" />
      ))}
    </div>
  );
}

function PlayerAssets({ player, onBuild, onSell, onMortgage, onUnmortgage }: { 
    player: Player;
    onBuild: (propertyId: string, amount: number) => void;
    onSell: (propertyId: string, amount: number) => void;
    onMortgage: (propertyId: string) => void;
    onUnmortgage: (propertyId: string) => void;
}) {
    const { toast } = useToast();
    const allPlayerProperties = useMemo(() => {
        return player.properties
        .map(id => {
            const property = boardSpaces.find(p => 'id' in p && p.id === id) as Property | undefined;
            const isMortgaged = player.mortgagedProperties.includes(id);
            return { ...property, id, isMortgaged };
        })
        .sort((a, b) => {
            if (!a.color || !b.color) return 0;
            if (a.color < b.color) return -1;
            if (a.color > b.color) return 1;
            return 0;
        });
    }, [player.properties, player.mortgagedProperties]);

    const groupedProperties = useMemo(() => {
        const groups: { [color: string]: (Property & { isMortgaged: boolean })[] } = {};
        allPlayerProperties.forEach(prop => {
        if (prop && prop.type === 'property' && prop.color) {
            if (!groups[prop.color]) {
            groups[prop.color] = [];
            }
            groups[prop.color].push(prop as Property & { isMortgaged: boolean });
        }
        });
        return groups;
    }, [allPlayerProperties]);

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
  
  return (
    <CardContent className="p-0">
      <div className="flex items-center justify-between p-4 text-lg font-semibold bg-muted/50">
        <div className="flex items-center gap-2 text-green-600">
          <Wallet className="h-5 w-5" />
          <span>Dinheiro</span>
        </div>
        <span>R${player.money.toLocaleString('pt-BR')}</span>
      </div>

      {player.getOutOfJailFreeCards > 0 && (
        <>
          <Separator />
          <div className="flex items-center justify-between p-4 text-sm font-semibold">
            <div className="flex items-center gap-2 text-blue-600">
              <Shield className="h-5 w-5" />
              <span>Cartas "Sair da Prisão"</span>
            </div>
            <span>{player.getOutOfJailFreeCards}</span>
          </div>
        </>
      )}

      <Separator />
      <div className="p-4">
        <div className="flex items-center gap-2 font-semibold mb-2">
          <Landmark className="h-5 w-5 text-muted-foreground" />
          <span>Propriedades ({player.properties.length})</span>
        </div>
        <ScrollArea className="h-64">
          {player.properties.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4 bg-muted/50 rounded-md">
              Nenhuma propriedade ainda.
            </p>
          ) : (
             <div className="space-y-4 pr-4">
              {Object.entries(groupedProperties).map(([color, props]) => (
                <div key={color}>
                  <div className="flex items-center gap-2 mb-2">
                     <div className={cn("w-3 h-6 rounded-sm", propertyColorClasses[color])}></div>
                     <h3 className="font-semibold capitalize">{props[0].color}</h3>
                     {ownedColorSets[color] && <Badge>Conjunto</Badge>}
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
                            <div key={prop.id} className={cn("flex items-center justify-between p-2 rounded-md", isMortgaged ? "bg-destructive/10" : "bg-muted/50")}>
                                <div className="flex-1">
                                    <p className="font-medium">{prop.name}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <HouseDisplay count={houseCount} />
                                        {isMortgaged && <Badge variant="destructive" className="ml-1">Hipotecado</Badge>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                     {!isMortgaged ? (
                                        <>
                                            <Button size="icon" variant="outline" className="h-6 w-6" disabled={!canSell} onClick={() => onSell(prop.id, 1)}>
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <Button size="icon" variant="outline" className="h-6 w-6" disabled={!canBuild} onClick={() => onBuild(prop.id, 1)}>
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                            <Button size="icon" variant="destructive-outline" className="h-6 w-6" disabled={!canMortgage} onClick={() => onMortgage(prop.id)}>
                                                <Banknote className="h-3 w-3" />
                                            </Button>
                                        </>
                                     ) : (
                                        <Button size="icon" variant="outline" className="h-6 w-6" disabled={!canUnmortgage} onClick={() => onUnmortgage(prop.id)}>
                                            <Landmark className="h-3 w-3" />
                                        </Button>
                                     )}
                                </div>
                            </div>
                        )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </CardContent>
  );
}

function PlayerList({ allPlayers, currentPlayerId }: { allPlayers: Player[], currentPlayerId: string }) {
    return (
        <CardContent>
            <ScrollArea className="h-96">
                <div className="space-y-2">
                    {allPlayers.map(p => {
                        const totemData = totems.find(t => t.id === p.totem);
                        const TotemIcon = totemData?.icon;
                        const color = playerColors[p.color] || playerColors.blue;
                        return (
                            <div key={p.id} className={cn("flex items-center justify-between p-2 rounded-md", p.id === currentPlayerId ? "bg-primary/10 border border-primary" : "bg-muted/50")}>
                                <div className="flex items-center gap-3">
                                    <Avatar className={cn("h-10 w-10", color.bg)}>
                                        {TotemIcon && <TotemIcon className="h-6 w-6 text-white" />}
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{p.name} {p.id === currentPlayerId && '(Você)'}</p>
                                        <p className="text-sm text-green-600 font-medium">R${p.money.toLocaleString('pt-BR')}</p>
                                    </div>
                                </div>
                                 {p.inJail && <Badge variant="destructive">Preso</Badge>}
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
        </CardContent>
    )
}

function GameChat() {
     return (
        <CardContent className="flex flex-col h-96">
           <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4 text-sm">
                    {/* Placeholder chat messages */}
                    <div className="flex items-start gap-2">
                        <Avatar className="h-8 w-8 bg-red-500">
                             <div className="text-white font-bold">O</div>
                        </Avatar>
                        <div>
                            <p className="font-semibold">Oponente</p>
                            <p className="p-2 rounded-md bg-muted">Boa sorte! Que vença o melhor.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-2 flex-row-reverse">
                        <Avatar className="h-8 w-8 bg-blue-500">
                             <div className="text-white font-bold">J</div>
                        </Avatar>
                        <div className="text-right">
                            <p className="font-semibold">Você</p>
                            <p className="p-2 rounded-md bg-primary text-primary-foreground">Para você também!</p>
                        </div>
                    </div>
                </div>
           </ScrollArea>
           <div className="flex gap-2">
                <Input placeholder="Digite sua mensagem..."/>
                <Button>Enviar</Button>
           </div>
        </CardContent>
    )
}

function EventLog({ log }: { log: GameLog[] }) {
    return (
        <CardContent>
            <ScrollArea className="h-96">
                <div className="space-y-3">
                    {log.map((entry, index) => (
                        <div key={index} className="flex items-start gap-3 text-sm">
                            <div className="text-muted-foreground pt-0.5">
                                {formatDistanceToNow(entry.timestamp, { addSuffix: true, locale: ptBR })}
                            </div>
                            <p className="flex-1">{entry.message}</p>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </CardContent>
    )
}


interface MultiplayerPanelProps {
  player: Player;
  allPlayers: Player[];
  gameLog: GameLog[];
  onBuild: (propertyId: string, amount: number) => void;
  onSell: (propertyId: string, amount: number) => void;
  onMortgage: (propertyId: string) => void;
  onUnmortgage: (propertyId: string) => void;
}

export function MultiplayerPanel({ player, allPlayers, gameLog, ...assetActions }: MultiplayerPanelProps) {
  return (
    <Card>
      <Tabs defaultValue="assets">
        <CardHeader className="p-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assets" className="h-auto">
              <Landmark className="h-4 w-4 mb-1" /> Ativos
            </TabsTrigger>
            <TabsTrigger value="players" className="h-auto">
              <Users className="h-4 w-4 mb-1" /> Jogadores
            </TabsTrigger>
            <TabsTrigger value="chat" className="h-auto">
              <MessageCircle className="h-4 w-4 mb-1" /> Chat
            </TabsTrigger>
            <TabsTrigger value="log" className="h-auto">
              <ClipboardList className="h-4 w-4 mb-1" /> Eventos
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <TabsContent value="assets">
            <PlayerAssets player={player} {...assetActions} />
        </TabsContent>
        <TabsContent value="players">
            <PlayerList allPlayers={allPlayers} currentPlayerId={player.id} />
        </TabsContent>
        <TabsContent value="chat">
            <GameChat />
        </TabsContent>
        <TabsContent value="log">
            <EventLog log={gameLog} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
