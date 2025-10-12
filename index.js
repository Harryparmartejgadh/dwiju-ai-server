import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = "તમારી_OPENAI_API_KEY";

app.post("/chat", async (req, res) => {
  const userMsg = req.body.message || "Hello Dwiju!";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMsg }]
    })
  });

  const data = await response.json();
  res.json({ reply: data.choices[0].message.content });
});

app.get("/", (req, res) => res.send("✅ Dwiju Server Active"));
app.listen(10000, () => console.log("✅ Server running on port 10000"));
