// index.js (Node ESM)
import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // optional if Node <18; ok to keep

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Read API key from env
const OPENAI_KEY = process.env.OPENAI_KEY;
if(!OPENAI_KEY) {
  console.warn("⚠️ OPENAI_KEY not set in environment. Set OPENAI_KEY in .env or hosting provider env vars.");
}

app.post("/chat", async (req, res) => {
  try {
    const userMsg = (req.body && req.body.message) ? req.body.message : "Hello Dwiju!";
    // system prompt to define Dwiju persona (optional)
    const systemPrompt = `You are Dwiju, a friendly AI assistant. Answer concisely and politely.`;

    const payload = {
      model: "gpt-4o-mini", // adjust if your account supports different model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMsg }
      ],
      temperature: 0.7,
      max_tokens: 800
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.error) {
      console.error("OpenAI error:", data.error);
      return res.json({ reply: `⚠ Error from OpenAI: ${data.error.message}` });
    }
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, no reply.";
    return res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ reply: "Internal server error." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Dwiju Server Active & Connected to OpenAI!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Dwiju Server running on port ${PORT}`));
