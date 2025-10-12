// ✅ Dwiju AI Server - Fully Verified Version
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 OpenAI API Key
const OPENAI_KEY = "sk-proj-rgLlxCRNssoR9GVt36RsvK-tPGdxwoRhjRR6basOHQWJbWyVQPObeyI2bicvnxPaoKKhjsbTgRT3BlbkFJD7O-Yp38_5xXohB_qS1x3Zn2nSvQozD7v-BnHY30C4OZa2apRPjAjBmBm3AJ0rJmtNUA"; // અહીં તમારો સાચો OpenAI key મુકો

// 🧠 Chat route
app.post("/chat", async (req, res) => {
  try {
    const userMsg = req.body.message || "Hello Dwiju!";
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": Bearer ${OPENAI_KEY}
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userMsg }]
      })
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "⚠ No valid reply from OpenAI.";
    console.log("✅ User:", userMsg, "\n🤖 Dwiju:", reply);
    res.json({ reply });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ reply: "❌ Error connecting to OpenAI API." });
  }
});

// 🌍 Root route (status check)
app.get("/", (req, res) => {
  res.send("✅ Dwiju Server Active and Ready for AI Chat!");
});

// 🟢 Dynamic Port (Render requirement)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(🚀 Dwiju Server running on port ${PORT}));
