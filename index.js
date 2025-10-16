// index.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_KEY;
if(!OPENAI_KEY) {
  console.error("❌ OPENAI_KEY missing. Set environment variable OPENAI_KEY");
}

app.post("/chat", async (req, res) => {
  try {
    const userMsg = (req.body.message || "").toString().slice(0, 2000) || "Hello Dwiju!";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: userMsg }],
        max_tokens: 500
      }),
      timeout: 60000
    });

    const data = await response.json();
    if(response.status >= 400) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ reply: "⚠️ Error from OpenAI: " + (data.error?.message || response.statusText) });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    return res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ reply: "Internal server error." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Dwiju Server Active & Connected");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Dwiju Server running on port ${PORT}`));
