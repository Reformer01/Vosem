"use server";

import { summarizeSermon } from "@/ai/flows/sermon-summaries";
import { z } from "zod";

const SermonSummarySchema = z.object({
  sermonText: z
    .string()
    .min(100, "Sermon text must be at least 100 characters long.")
    .max(50000, "Sermon text cannot exceed 50,000 characters."),
});

type State = {
  summary?: string;
  message?: string;
  errors?: {
    sermonText?: string[];
  };
};

export async function summarizeSermonAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = SermonSummarySchema.safeParse({
    sermonText: formData.get("sermonText"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check your input.",
    };
  }

  try {
    const result = await summarizeSermon({
      sermonText: validatedFields.data.sermonText,
    });
    if (result.summary) {
      return { summary: result.summary, message: "Summary generated successfully." };
    }
    return { message: "Failed to generate summary from the provided text." };
  } catch (error) {
    console.error("Sermon summarization error:", error);
    return { message: "An unexpected error occurred. Please try again later." };
  }
}
