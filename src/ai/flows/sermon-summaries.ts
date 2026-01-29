'use server';

/**
 * @fileOverview A sermon summarization AI agent.
 *
 * - summarizeSermon - A function that handles the sermon summarization process.
 * - SummarizeSermonInput - The input type for the summarizeSermon function.
 * - SummarizeSermonOutput - The return type for the summarizeSermon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSermonInputSchema = z.object({
  sermonText: z
    .string()
    .describe('The text content of the sermon to be summarized.'),
});
export type SummarizeSermonInput = z.infer<typeof SummarizeSermonInputSchema>;

const SummarizeSermonOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the sermon.'),
});
export type SummarizeSermonOutput = z.infer<typeof SummarizeSermonOutputSchema>;

export async function summarizeSermon(input: SummarizeSermonInput): Promise<SummarizeSermonOutput> {
  return summarizeSermonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSermonPrompt',
  input: {schema: SummarizeSermonInputSchema},
  output: {schema: SummarizeSermonOutputSchema},
  prompt: `You are an expert sermon summarizer. Your goal is to provide a concise and informative summary of the given sermon text.

Sermon Text: {{{sermonText}}}

Summary:`, // Added Handlebars syntax
});

const summarizeSermonFlow = ai.defineFlow(
  {
    name: 'summarizeSermonFlow',
    inputSchema: SummarizeSermonInputSchema,
    outputSchema: SummarizeSermonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
