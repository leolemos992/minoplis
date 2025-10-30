'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CharacterCard } from '@/components/character-card';
import { CharacterSuggestionForm } from '@/components/character-suggestion-form';
import { characters } from '@/lib/game-data';
import type { Character } from '@/lib/definitions';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CharacterSelectionPage() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId') || '123';

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleStartGame = () => {
    if (selectedCharacter) {
      router.push(`/game/${gameId}?character=${selectedCharacter.id}`);
    }
  };
  
  const aiSuggestedCharacter = (characterName: string) => {
    const foundCharacter = characters.find(c => c.name === characterName) || characters.find(c => characterName.includes(c.name));
    if (foundCharacter) {
        setSelectedCharacter(foundCharacter);
    }
  }

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Escolha Seu Personagem
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
          Selecione um personagem para te representar no tabuleiro. Cada um tem uma habilidade única.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {characters.map((character) => (
                    <CharacterCard
                        key={character.id}
                        character={character}
                        isSelected={selectedCharacter?.id === character.id}
                        onSelect={handleSelectCharacter}
                    />
                ))}
            </div>
        </div>
        
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Sugestão de Personagem por IA</CardTitle>
                    <CardDescription>Nos diga seu estilo de jogo, e nossa IA irá sugerir um personagem para você.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CharacterSuggestionForm onSuggestion={aiSuggestedCharacter} />
                </CardContent>
            </Card>

            <Card className={cn(
                "transition-all",
                !selectedCharacter ? "opacity-50" : ""
            )}>
                 <CardHeader>
                    <CardTitle>Pronto para Jogar?</CardTitle>
                    <CardDescription>
                        {selectedCharacter ? `Você selecionou ${selectedCharacter.name}.` : 'Selecione um personagem para começar.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        size="lg"
                        className="w-full group"
                        disabled={!selectedCharacter}
                        onClick={handleStartGame}
                        >
                        Começar Jogo
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
