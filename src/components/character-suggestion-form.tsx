'use client';

import { useState } from 'react';
import {
  suggestCharacter,
  type CharacterSuggestionOutput,
} from '@/ai/flows/character-suggestion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, LoaderCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CharacterSuggestionFormProps {
  onSuggestion: (characterName: string) => void;
}

export function CharacterSuggestionForm({ onSuggestion }: CharacterSuggestionFormProps) {
  const [suggestion, setSuggestion] =
    useState<CharacterSuggestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setSuggestion(null);

    const formData = new FormData(event.currentTarget);
    const playingStyle = formData.get('playingStyle') as string;

    if (!playingStyle.trim()) {
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Por favor, descreva seu estilo de jogo.",
        });
        setIsLoading(false);
        return;
    }

    try {
      const result = await suggestCharacter({ playingStyle });
      setSuggestion(result);
      onSuggestion(result.suggestedCharacter);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Falha na Sugestão da IA",
        description: "Não foi possível obter uma sugestão no momento. Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="playing-style">Descreva seu estilo de jogo</Label>
          <Textarea
            id="playing-style"
            name="playingStyle"
            placeholder="ex: 'Gosto de jogar agressivamente e correr riscos' or 'Prefiro uma estratégia defensiva, acumulando meus ativos lentamente.'"
            className="min-h-[100px]"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          Obter Sugestão
        </Button>
      </form>

      {suggestion && (
        <Alert className="border-accent bg-accent/10 text-accent-foreground">
            <CheckCircle className="h-4 w-4 !text-accent" />
          <AlertTitle className="font-semibold">Sugestão da IA: {suggestion.suggestedCharacter}</AlertTitle>
          <AlertDescription>
            {suggestion.characterDescription}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
