// index.js (improved)
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "200kb" })); // protect payload size

const OPENAI_KEY = process.env.OPENAI_KEY || "";
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

if (!OPENAI_KEY) {
  console.error("❌ OPENAI_KEY not set. Set env var OPENAI_KEY.");
}

// simple helper: fetch with timeout & retry
async function fetchWithTimeout(url, opts = {}, timeout = 20000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

app.get("/health", (req, res) => {
  const ok = !!OPENAI_KEY;
  res.json({
    status: ok ? "ok" : "missing_api_key",
    openai_connected: ok
  });
});

app.post("/chat", async (req, res) => {
  try {
    const message = (req.body && req.body.message) ? String(req.body.message).trim() : "";
    if (!message) return res.status(400).json({ error: "empty_message" });

    // construct request payload
    const payload = {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
      max_tokens: 800,
      temperature: 0.6
    };

    const response = await fetchWithTimeout(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    }, 25000);

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI non-OK:", response.status, text);
      // try to parse json message
      let errJson;
      try { errJson = JSON.parse(text); } catch(e){ errJson = { raw: text }; }
      return res.status(502).json({ error: "openai_error", status: response.status, details: errJson });
    }

    const data = await response.json();
    const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
      ? data.choices[0].message.content
      : "";

    return res.json({ reply, meta: { model: payload.model } });
  } catch (err) {
    console.error("Server /chat error:", err && err.message ? err.message : err);
    if (err.name === "AbortError") return res.status(504).json({ error: "timeout" });
    return res.status(500).json({ error: "server_error", message: String(err) });
  }
});

/* === placeholders for advanced features === */
app.post("/synthesize", async (req, res) => {
  // expects { text: "...", voice: "harish" }
  // This is a placeholder. Integrate ElevenLabs / Google TTS etc. here.
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: "empty_text" });
  // Example response: client will synthesize using Web Speech API or fetch tts audio url from provider
  return res.json({ audio_url: null, note: "integrate real TTS provider (elevenlabs/google) and return hosted audio URL" });
});

app.post("/image", async (req, res) => {
  // placeholder for text->image (DALL·E / Stable Diffusion)
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "empty_prompt" });
  return res.json({ image_url: null, note: "integrate image generation provider and return URL" });
});

app.post("/voice-clone", (req, res) => {
  // placeholder for uploading voice sample for cloning; return voice-id
  res.json({ voice_id: null, note: "implement voice-clone provider API (ElevenLabs/Replica) here" });
});

/* Root */
app.get("/", (req, res) => {
  res.send("✅ Dwiju Server Active & Connected");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Dwiju Server running on port ${PORT}`));
