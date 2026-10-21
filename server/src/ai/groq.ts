import Groq from "groq-sdk";
import { JENNIE_SYSTEM_PROMPT } from "../character/jennie";
import { buildMemoryContext } from "../memory/memoryContext";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function chatWithJennie(messages: ChatMessage[]) {
  const memoryContext = buildMemoryContext();

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",

    messages: [
      {
        role: "system",
        content: `${JENNIE_SYSTEM_PROMPT}

${memoryContext}`,
      },
      ...messages,
    ],

    temperature: 0.8,
    max_completion_tokens: 500,
  });

  return completion.choices[0]?.message?.content ?? "";
}