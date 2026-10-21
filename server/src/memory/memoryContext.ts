import { getMemories } from "./memoryStore";

export function buildMemoryContext() {
  const memories = getMemories();

  if (memories.length === 0) {
    return "";
  }

  return `
IMPORTANT USER MEMORIES:

${memories.map((memory) => `- ${memory.text}`).join("\n")}

Use these memories naturally when relevant.
Do not mention the memory system unless the user asks about it.
`;
}