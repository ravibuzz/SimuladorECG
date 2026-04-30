import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";

// Lazy initialize Gemini client
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images
  app.use(express.json({ limit: "50mb" }));

  // API Route for ECG analysis
  app.post("/api/analyze-ecg", async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Nenhuma imagem fornecida" });
      }

      const prompt = `Você é um cardiologista especialista. Analise a imagem de eletrocardiograma (ECG) fornecida.
Retorne um JSON estritamente com a seguinte interface:
{
  "diagnoses": [
    {
      "name": "Nome do Diagnóstico (ex: Taquicardia Sinusal, Fibrilação Atrial, IAM com Supra de ST)",
      "confidence": 95, // número inteiro de 0 a 100
      "reasoning": "Sua explicação detalhada do porquê deste diagnóstico"
    }
  ],
  "findings": ["Achado 1 (ex: Ausência de onda P)", "Achado 2 (ex: RR irregular)"],
  "rate": "Frequência Cardíaca Estimada (ex: Aproximadamente 150 bpm)"
}`;

      // Call Gemini vision
      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: imageBase64.split(",")[1], // Extract base64 part
                  mimeType: "image/jpeg", // Allow general image fallback
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const textResponse = response.text;
      const parsedData = JSON.parse(textResponse || "{}");
      res.json(parsedData);
    } catch (error) {
      console.error("Erro na análise do ECG:", error);
      if (error instanceof Error) {
        if (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID')) {
           return res.status(401).json({ error: "Erro de chave de API. A chave gratuita do AI Studio pode ter expirado ou o modelo está temporariamente indisponível." });
        }
      }
      res.status(500).json({ error: "Falha ao analisar o ECG com a IA. " + (error instanceof Error ? error.message : "") });
    }
  });

  // Vite middleware setup for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
