"use server";

import { ai } from "@/ai/genkit";

export async function generateSermonSummary(title: string, speaker: string): Promise<string> {
  if (!title || title.length > 200) throw new Error("Invalid sermon title.");
  if (!process.env.GEMINI_API_KEY) throw new Error("AI summaries are not configured on this deployment.");

  const { text } = await ai.generate({
    prompt: `Write a 60-word summary of a church sermon titled "${title}" by ${speaker}.
Only use the title and speaker — do not invent scripture references, quotes, or specific claims.
Write in warm, clear language for someone deciding whether to watch.`,
  });
  return text.trim();
}
