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
      'The players preferred style of play. Examples include aggressive, strategic, defensive, or balanced.'
    ),
});
export type CharacterSuggestionInput = z.infer<typeof CharacterSuggestionInputSchema>;

const CharacterSuggestionOutputSchema = z.object({
  suggestedCharacter: z.string().describe('The character suggested for the player.'),
  characterDescription: z.string().describe('A short description of the suggested character.'),
});
export type CharacterSuggestionOutput = z.infer<typeof CharacterSuggestionOutputSchema>;

export async function suggestCharacter(input: CharacterSuggestionInput): Promise<CharacterSuggestionOutput> {
  return characterSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'characterSuggestionPrompt',
  input: {schema: CharacterSuggestionInputSchema},
  output: {schema: CharacterSuggestionOutputSchema},
  prompt: `You are a game master in a board game similar to Monopoly.

You will suggest a character to the player based on their playing style. The character should be well-suited to their playing style.

Playing Style: {{{playingStyle}}}`,
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
