'use server';
/**
 * @fileOverview Suggests a character based on the player's preferred playing style.
 *
 * - suggestCharacter - A function that suggests a character based on playing style.
 * - CharacterSuggestionInput - The input type for the suggestCharacter function.
 * - CharacterSuggestionOutput - The return type for the suggestCharacter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CharacterSuggestionInputSchema = z.object({
  playingStyle: z
    .string()
    .describe(
      'O estilo de jogo preferido do jogador. Exemplos incluem agressivo, estratégico, defensivo ou equilibrado.'
    ),
});
export type CharacterSuggestionInput = z.infer<typeof CharacterSuggestionInputSchema>;

const CharacterSuggestionOutputSchema = z.object({
  suggestedCharacter: z.string().describe('O personagem sugerido para o jogador.'),
  characterDescription: z.string().describe('Uma breve descrição do personagem sugerido.'),
});
export type CharacterSuggestionOutput = z.infer<typeof CharacterSuggestionOutputSchema>;

export async function suggestCharacter(input: CharacterSuggestionInput): Promise<CharacterSuggestionOutput> {
  return characterSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'characterSuggestionPrompt',
  input: {schema: CharacterSuggestionInputSchema},
  output: {schema: CharacterSuggestionOutputSchema},
  prompt: `Você é um mestre de jogo em um jogo de tabuleiro semelhante ao Monopoly, em português.

Você sugerirá um personagem ao jogador com base em seu estilo de jogo. O personagem deve ser adequado ao seu estilo de jogo.

Estilo de Jogo: {{{playingStyle}}}`,
});

const characterSuggestionFlow = ai.defineFlow(
  {
    name: 'characterSuggestionFlow',
    inputSchema: CharacterSuggestionInputSchema,
    outputSchema: CharacterSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
