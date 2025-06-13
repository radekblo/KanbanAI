'use server';

/**
 * @fileOverview This file contains the Genkit flow for suggesting task priorities based on deadlines.
 *
 * - suggestTaskPriority - A function that suggests task priorities.
 * - SuggestTaskPriorityInput - The input type for the suggestTaskPriority function.
 * - SuggestTaskPriorityOutput - The return type for the suggestTaskPriority function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskPriorityInputSchema = z.object({
  taskDescription: z.string().describe('The description of the task.'),
  deadline: z.string().describe('The deadline for the task in ISO format (YYYY-MM-DD).'),
  currentDate: z.string().describe('The current date in ISO format (YYYY-MM-DD).'),
});
export type SuggestTaskPriorityInput = z.infer<typeof SuggestTaskPriorityInputSchema>;

const SuggestTaskPriorityOutputSchema = z.object({
  prioritySuggestion: z
    .string()    
    .describe(
      'The suggested priority for the task (e.g., High, Medium, Low) along with a brief explanation.'
    ),
});
export type SuggestTaskPriorityOutput = z.infer<typeof SuggestTaskPriorityOutputSchema>;

export async function suggestTaskPriority(input: SuggestTaskPriorityInput): Promise<SuggestTaskPriorityOutput> {
  return suggestTaskPriorityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskPriorityPrompt',
  input: {schema: SuggestTaskPriorityInputSchema},
  output: {schema: SuggestTaskPriorityOutputSchema},
  prompt: `You are an AI assistant helping project managers prioritize tasks. Consider the task description and deadline to suggest a priority (High, Medium, or Low).

Task Description: {{{taskDescription}}}
Deadline: {{{deadline}}}
Current Date: {{{currentDate}}}

Based on the provided information, suggest a priority for this task and briefly explain your reasoning. Ensure the response contains the priority (High, Medium, or Low) as the first word.`,
});

const suggestTaskPriorityFlow = ai.defineFlow(
  {
    name: 'suggestTaskPriorityFlow',
    inputSchema: SuggestTaskPriorityInputSchema,
    outputSchema: SuggestTaskPriorityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
