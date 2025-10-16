// ✅ index.js — Final Render-ready version
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

// 🔹 Try to load dotenv safely (no crash if not installed)
try {
  const dotenv = await import("dotenv");
  dotenv.config();
  console.log("✅ dotenv loaded successfully");
} catch (err) {
  console.warn("⚠ dotenv not found, continuing without it");
}

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Read API key from Render Environment Variable
const OPENAI_KEY = process.env.OPENAI_KEY;
if (!OPENAI_KEY) {
  console.error("❌ Missing OPENAI_KEY environment variable!");
}

app.get("/", (req, res) => {
  res.send("✅ Dwiju Server Active & Connected to OpenAI!");
});

// 🔹 Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMsg = req.body.message || "Hello Dwiju!";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userMsg }],
        temperature: 0.8
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("❌ OpenAI Error:", data.error);
      return res.json({
        reply: "⚠️ Error from OpenAI: " + data.error.message
      });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn’t generate a reply.";
    res.json({ reply });

  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).json({ reply: "Internal server error." });
  }
});

// 🌐 Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Dwiju Server running on port ${PORT}`));
