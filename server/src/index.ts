import "dotenv/config";
import express from "express";
import cors from "cors";

import { chatWithJennie, ChatMessage } from "./ai/groq";

import { addMemory, getMemories, clearMemories } from "./memory/memoryStore";

import { extractMemories } from "./memory/memoryExtractor";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "Jennie API",
    status: "running",
  });
});

/*
  CHAT
*/

app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.messages as ChatMessage[];

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "messages must be an array",
      });
    }

    const latestUserMessage = messages[messages.length - 1];

    if (latestUserMessage && latestUserMessage.role === "user") {
      await extractMemories(latestUserMessage.content);
    }

    const reply = await chatWithJennie(messages);

    res.json({
      reply,
    });
  } catch (error) {
    console.error("Jennie API error:", error);

    res.status(500).json({
      error: "Something went wrong while talking to Jennie.",
    });
  }
});

/*
  ADD MEMORY
*/

app.post("/memory", (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        error: "Memory text is required.",
      });
    }

    addMemory(text);

    res.json({
      success: true,
      memories: getMemories(),
    });
  } catch (error) {
    console.error("Memory error:", error);

    res.status(500).json({
      error: "Could not save memory.",
    });
  }
});

/*
  GET MEMORIES
*/

app.get("/memory", (_req, res) => {
  res.json({
    memories: getMemories(),
  });
});

/*
  CLEAR MEMORIES
*/

app.delete("/memory", (_req, res) => {
  clearMemories();

  res.json({
    success: true,
    memories: [],
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`❤️ Jennie server running on http://localhost:${PORT}`);
});
