import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for Gemini
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction, model = "gemini-3-flash-preview", apiKey: requestApiKey } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Use request-specific key or fallback to environment key
      let activeApiKey = (requestApiKey && typeof requestApiKey === 'string') 
        ? requestApiKey.trim() 
        : process.env.GEMINI_API_KEY;

      if (!activeApiKey || activeApiKey === "null" || activeApiKey === "undefined") {
        activeApiKey = process.env.GEMINI_API_KEY || "";
      }
      
      if (!activeApiKey) {
        return res.status(401).json({ error: "No API Key provided. Please enter an API key on the dashboard." });
      }

      const dynamicAI = new GoogleGenAI({
        apiKey: activeApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await dynamicAI.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are an expert education consultant specialized in Kurikulum Merdeka and Deep Learning pedagogy. Always format structured data using clean, standard Markdown tables. MANDATORY: Do NOT include any placeholder text like 'Sesuai Keputusan Menteri', 'Salinan Lampiran', or administrative footers. Focus strictly on the professional pedagogical content as if writing for a high-end educational publication. Use a dense, efficient layout for the content to ensure it fills the pages effectively.",
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
