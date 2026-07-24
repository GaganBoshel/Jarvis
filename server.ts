import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

// Increase body payload limits for base64 images / PDF data
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MISSING_KEY",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// JARVIS System Prompt
const JARVIS_SYSTEM_PROMPT = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), an extraordinarily advanced AI assistant created by Tony Stark.
Key Behavioral Traits:
- Tone: Sophisticated, refined, articulate, witty, and polite with a slight British touch (e.g. "At your service, sir/ma'am", "Right away", "Initializing parameters...").
- Concise & Direct: Give clear, crisp, actionable answers. Avoid unnecessary fluff, but maintain a high-tech sci-fi atmosphere.
- Technical & Futuristic: Use subtle HUD, diagnostic, or tech-inspired vocabulary where appropriate (e.g., "Telemetry confirmed", "Analyzing data streams", "Optimal configuration achieved").
- Formatting: Use standard Markdown formatting for lists, code snippets, and bold text.
- Capabilities: Answer questions, assist with coding, analyze images, summarize text, assist with math, provide advice, and manage workspace tasks.`;

// API Routes
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({ error: "Message or image is required." });
    }

    const ai = getGeminiClient();

    // Build chat message format or multimodal content
    const contents: any[] = [];

    // Add prior history if present
    if (Array.isArray(history) && history.length > 0) {
      history.forEach((item: { role: string; text: string }) => {
        contents.push({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.text }],
        });
      });
    }

    // Current user request parts
    const currentParts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      currentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      });
    }

    if (message) {
      currentParts.push({ text: message });
    }

    contents.push({
      role: "user",
      parts: currentParts,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction: JARVIS_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const textOutput = response.text || "JARVIS: Unable to parse response telemetry.";
    res.json({ success: true, response: textOutput });
  } catch (err: any) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({
      success: false,
      error: err.message || "JARVIS core system error encountered.",
    });
  }
});

// Stream Chat Endpoint for fast response feel
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGeminiClient();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      history.forEach((item: { role: string; text: string }) => {
        contents.push({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.text }],
        });
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction: JARVIS_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error("Error in /api/chat/stream:", err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// Translation Endpoint
app.post("/api/translate", async (req, res) => {
  try {
    const { text, targetLang = "Spanish" } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required for translation." });

    const ai = getGeminiClient();
    const prompt = `Translate the following text accurately into ${targetLang}. Maintain tone and context. Provide only the translation unless notes are necessary:\n\n"${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are JARVIS Translation Subsystem. Provide clean, accurate translations.",
      },
    });

    res.json({ success: true, translation: response.text });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PDF Summarizer Endpoint
app.post("/api/pdf-summarize", async (req, res) => {
  try {
    const { text, title = "Document" } = req.body;
    if (!text) return res.status(400).json({ error: "PDF text content is required." });

    const ai = getGeminiClient();
    const prompt = `Analyze and summarize the following document titled "${title}":
Extract:
1. Executive Summary (2-3 crisp sentences)
2. Core Takeaways (3-5 bullet points)
3. Action Items or Next Steps (if applicable)

Document Content:
${text.substring(0, 30000)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are JARVIS Document Intelligence Subsystem.",
      },
    });

    res.json({ success: true, summary: response.text });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// News Digest Endpoint
app.post("/api/news", async (req, res) => {
  try {
    const { category = "Tech & AI" } = req.body;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Provide a sleek, futuristic JARVIS news briefing report on the top 5 latest developments in ${category}. Format with catchy headline, brief summary, impact level (High/Critical/Medium), and category tags.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are JARVIS News Intelligence Feed.",
      },
    });

    res.json({ success: true, news: response.text });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Weather Digest Endpoint
app.post("/api/weather", async (req, res) => {
  try {
    const { location = "New York" } = req.body;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Provide real-time or forecasted weather metrics for location "${location}".
Return a JSON object with keys:
- city (string)
- temp (number in Celsius)
- condition (string e.g. "Clear Sky", "Rainy", "Thunderstorm", "Partly Cloudy")
- humidity (number %)
- windSpeed (number km/h)
- uvIndex (number)
- recommendation (string from JARVIS e.g. "Optimal atmospheric conditions for outdoor activities, sir.")
- forecast (array of 3 items with day, temp, condition)`,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are JARVIS Meteorological Subsystem. Always output valid JSON.",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, weather: parsed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server & Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS v2 Core Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
