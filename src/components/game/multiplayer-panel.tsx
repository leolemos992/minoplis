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
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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
        if (!player) return [];
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
    }, [player]);

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
  
    if (!player) return <CardContent><p className="text-center text-muted-foreground">Selecione um jogador</p></CardContent>;

  return (
    <div>
      <div className="flex items-center justify-between p-3 text-base font-semibold bg-muted/50">
        <div className="flex items-center gap-2 text-green-600">
          <Wallet className="h-5 w-5" />
          <span>Dinheiro</span>
        </div>
        <span>R${player.money.toLocaleString('pt-BR')}</span>
      </div>

      {player.getOutOfJailFreeCards > 0 && (
        <>
          <Separator />
          <div className="flex items-center justify-between p-3 text-sm font-semibold">
            <div className="flex items-center gap-2 text-blue-600">
              <Shield className="h-5 w-5" />
              <span>Cartas "Sair da Prisão"</span>
            </div>
            <span>{player.getOutOfJailFreeCards}</span>
          </div>
        </>
      )}

      <Separator />
      <div className="p-3">
        <div className="flex items-center gap-2 font-semibold mb-2 text-sm">
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
                     <div className={cn("w-3 h-5 rounded-sm", propertyColorClasses[color])}></div>
                     <h3 className="font-semibold capitalize text-sm">{props[0].color}</h3>
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
                            <div key={prop.id} className={cn("flex items-center justify-between p-2 rounded-md text-sm", isMortgaged ? "bg-destructive/10" : "bg-muted/50")}>
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
    </div>
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
                        const isCurrentTurn = p.id === currentPlayerId;
                        return (
                            <div key={p.id} className={cn("flex items-center justify-between p-2 rounded-md", isCurrentTurn ? "bg-primary/10 border border-primary" : "bg-muted/50")}>
                                <div className="flex items-center gap-3">
                                    <Avatar className={cn("h-10 w-10", color.bg)}>
                                        {TotemIcon && <TotemIcon className="h-6 w-6 text-white" />}
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{p.name} {p.id === 'player-1' && '(Você)'}</p>
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

type ChatMessage = {
    playerId: string;
    message: string;
};

function GameChat({ allPlayers }: { allPlayers: Player[] }) {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { playerId: 'player-2', message: 'Boa sorte! Que vença o melhor.' },
        { playerId: 'player-1', message: 'Para você também!' },
    ]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() === '') return;

        const humanPlayer = allPlayers.find(p => p.id === 'player-1');
        if (humanPlayer) {
            setChatHistory(prev => [...prev, { playerId: humanPlayer.id, message }]);
            setMessage('');
        }
    };

    const ChatAvatar = ({ player }: { player?: Player }) => {
        if (!player) return null;
        const totemData = totems.find(t => t.id === player.totem);
        const TotemIcon = totemData?.icon;
        const color = playerColors[player.color] || playerColors.blue;
        return (
            <Avatar className={cn("h-8 w-8 flex-shrink-0 flex items-center justify-center", color.bg)}>
                {TotemIcon && <TotemIcon className="h-5 w-5 text-white" />}
            </Avatar>
        )
    }

    return (
        <CardContent className="flex flex-col h-96">
            <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4 text-xs pr-2">
                    {chatHistory.map((chat, index) => {
                        const player = allPlayers.find(p => p.id === chat.playerId);
                        const isHuman = player?.id === 'player-1';

                        if (isHuman) {
                            return (
                                <div key={index} className="flex items-start gap-2.5 justify-end">
                                    <div className="flex flex-col gap-1 w-full max-w-[320px] items-end">
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <span className="font-semibold text-gray-900 dark:text-white">Você</span>
                                        </div>
                                        <div className="leading-snug p-2 rounded-s-lg rounded-ee-lg bg-primary text-primary-foreground">
                                            <p>{chat.message}</p>
                                        </div>
                                    </div>
                                    <ChatAvatar player={player} />
                                </div>
                            );
                        } else {
                            return (
                                <div key={index} className="flex items-start gap-2.5">
                                    <ChatAvatar player={player} />
                                    <div className="flex flex-col gap-1 w-full max-w-[320px]">
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <span className="font-semibold text-gray-900 dark:text-white">{player?.name}</span>
                                        </div>
                                        <div className="leading-snug p-2 rounded-e-lg rounded-es-lg bg-muted">
                                            <p>{chat.message}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <Button type="submit">Enviar</Button>
            </form>
        </CardContent>
    )
}

function EventLog({ log }: { log: GameLog[] }) {
    return (
        <CardContent>
            <ScrollArea className="h-96">
                <div className="space-y-3 font-mono text-[11px]">
                    {log.map((entry, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="text-muted-foreground/80 pt-px">
                                {entry.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
  currentPlayerId: string;
  gameLog: GameLog[];
  onBuild: (propertyId: string, amount: number) => void;
  onSell: (propertyId: string, amount: number) => void;
  onMortgage: (propertyId: string) => void;
  onUnmortgage: (propertyId: string) => void;
}

export function MultiplayerPanel({ player, allPlayers, currentPlayerId, gameLog, ...assetActions }: MultiplayerPanelProps) {
  return (
    <Card className="font-sans">
      <PlayerAssets player={player} {...assetActions} />
      <Separator />
      <Tabs defaultValue="players" className="pt-2">
        <TooltipProvider>
            <TabsList className="grid w-full grid-cols-3 mx-auto max-w-xs">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <TabsTrigger value="players">
                            <Users className="h-5 w-5" />
                            <span className="sr-only">Jogadores</span>
                        </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Jogadores</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <TabsTrigger value="chat">
                            <MessageCircle className="h-5 w-5" />
                            <span className="sr-only">Chat</span>
                        </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Chat</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <TabsTrigger value="log">
                            <ClipboardList className="h-5 w-5" />
                            <span className="sr-only">Eventos</span>
                        </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Eventos</TooltipContent>
                </Tooltip>
            </TabsList>
        </TooltipProvider>
        
        <TabsContent value="players">
            <PlayerList allPlayers={allPlayers} currentPlayerId={currentPlayerId} />
        </TabsContent>
        <TabsContent value="chat">
            <GameChat allPlayers={allPlayers} />
        </TabsContent>
        <TabsContent value="log">
            <EventLog log={gameLog} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
