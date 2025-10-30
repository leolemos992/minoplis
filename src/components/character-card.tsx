'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Character } from '@/lib/definitions';

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: (character: Character) => void;
}

export function CharacterCard({
  character,
  isSelected,
  onSelect,
}: CharacterCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1',
        isSelected && 'ring-2 ring-primary shadow-2xl'
      )}
      onClick={() => onSelect(character)}
    >
      <CardHeader className="flex-row gap-4 items-start">
        <Image
          src={character.image}
          alt={character.name}
          width={80}
          height={80}
          className="rounded-lg border aspect-square object-cover"
          data-ai-hint={character.imageHint}
        />
        <div className="flex-1">
          <CardTitle>{character.name}</CardTitle>
          <CardDescription className="mt-1">{character.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{character.longDescription}</p>
      </CardContent>
    </Card>
  );
}
