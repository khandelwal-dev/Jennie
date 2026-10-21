type Memory = {
  id: number;
  text: string;
};

const memories: Memory[] = [];

let nextId = 1;

export function addMemory(text: string) {
  const cleanText = text.trim();

  if (!cleanText) return;

  // Don't store exact duplicates
  const alreadyExists = memories.some(
    (memory) =>
      memory.text.toLowerCase() === cleanText.toLowerCase()
  );

  if (alreadyExists) return;

  memories.push({
    id: nextId++,
    text: cleanText,
  });
}

export function getMemories() {
  return memories;
}

export function clearMemories() {
  memories.length = 0;
  nextId = 1;
}