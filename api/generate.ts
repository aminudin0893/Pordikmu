import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, systemInstruction, model = "gemini-3-flash-preview", apiKey: requestApiKey } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const activeApiKey = requestApiKey || process.env.GEMINI_API_KEY;
    
    if (!activeApiKey) {
      return res.status(401).json({ error: "No API Key provided." });
    }

    const ai = new GoogleGenAI({
      apiKey: activeApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are an expert education consultant specialized in Kurikulum Merdeka and Deep Learning pedagogy.",
        temperature: 0.7,
      },
    });

    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate content" });
  }
}
