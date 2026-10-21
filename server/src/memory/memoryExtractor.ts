import Groq from "groq-sdk";
import { addMemory } from "./memoryStore";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function extractMemories(
  userMessage: string
) {
  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: `
You are Jennie's memory extraction system.

Your job is to identify IMPORTANT, LONG-TERM information about the user.

Remember things such as:
- Name
- Important personal preferences
- Likes and dislikes
- Important relationships
- Hobbies
- Skills
- Long-term goals
- Projects
- Important life circumstances
- Things the user explicitly asks Jennie to remember

DO NOT remember:
- Random small talk
- Temporary emotions
- One-time questions
- Things that are obviously irrelevant later
- Information about other people unless it is important to the user's life

If there is nothing worth remembering, return exactly:

NONE

Otherwise return ONLY the memories, one per line.

Do not explain your reasoning.
          `,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],

      temperature: 0,
      max_completion_tokens: 200,
    });

    const result =
      completion.choices[0]?.message?.content?.trim() || "";

    if (!result || result === "NONE") {
      return [];
    }

    const memories = result
      .split("\n")
      .map((memory) => memory.trim())
      .filter(Boolean);

    for (const memory of memories) {
      addMemory(memory);
    }

    return memories;
  } catch (error) {
    console.error("Memory extraction failed:", error);

    return [];
  }
}