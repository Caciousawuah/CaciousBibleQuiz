import { GoogleGenAI, Type } from "@google/genai";
import { FALLBACK_QUESTIONS } from "../data/fallbackQuestions";

export interface Question {
  id: string;
  verse: string;
  text: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export async function generateQuestions(book: string, chapter: number, difficulty: string = 'Medium', count: number = 5, seed?: number): Promise<Question[]> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing!");
    return FALLBACK_QUESTIONS[book] || FALLBACK_QUESTIONS['Genesis'];
  }
  const ai = new GoogleGenAI({ apiKey });

  const getPrompt = (b: string, c: number) => `Generate ${count} multiple-choice Bible quiz questions based on ${b === 'Daily' ? 'randomly selected books and chapters' : `${b} ${c > 0 ? `chapter ${c}` : 'randomly selected chapters'}`} (ESV). 
  Difficulty Level: ${difficulty}.
  - Easy: Basic facts and well-known stories.
  - Medium: More detailed questions about specific events or people.
  - Hard: Deep theological questions, specific phrasing, or lesser-known details.
  
  For each question, provide:
  1. The verse reference (e.g., Genesis 1:1)
  2. The text of the verse
  3. The quiz question
  4. 4 multiple-choice options
  5. The correct answer (must be EXACTLY one of the options)
  6. A brief explanation of why the answer is correct and its biblical context.
  
  Ensure the questions are challenging but fair for the ${difficulty} level.
  Output MUST be a valid JSON array of objects.`;

  const attemptGeneration = async (p: string, retries = 1) => {
    for (let i = 0; i <= retries; i++) {
      try {
        // Use a controller to timeout the request if it takes too long
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview", // Faster model
          contents: p,
          config: {
            seed: seed,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  verse: { type: Type.STRING },
                  text: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING }
                  },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["verse", "text", "question", "options", "answer", "explanation"]
              }
            }
          }
        });
        
        clearTimeout(timeoutId);

        if (response && response.text) {
          return response.text;
        }
      } catch (err) {
        console.error(`Attempt ${i + 1} failed:`, err);
        if (i === retries) return null;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return null;
  };

  try {
    // Try AI generation first
    let text = await attemptGeneration(getPrompt(book, chapter));
    
    if (!text) {
      console.log("AI failed or timed out. Using fallback questions for", book);
      return FALLBACK_QUESTIONS[book] || FALLBACK_QUESTIONS['Genesis'];
    }

    try {
      const questions = JSON.parse(text);
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Invalid format from AI");
      }
      return questions.map((q: any, index: number) => ({
        ...q,
        id: `${book}-${chapter}-${index}-${Date.now()}`
      }));
    } catch (parseError) {
      console.error("Error parsing AI response, using fallbacks:", parseError);
      return FALLBACK_QUESTIONS[book] || FALLBACK_QUESTIONS['Genesis'];
    }
  } catch (error) {
    console.error("Critical error in generateQuestions, using fallbacks:", error);
    return FALLBACK_QUESTIONS[book] || FALLBACK_QUESTIONS['Genesis'];
  }
}

export async function generateSpeech(text: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return null;
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this Bible verse clearly: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/mp3;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
}

export async function generateFlyer(style: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return null;
  
  const ai = new GoogleGenAI({ apiKey });
  
  const prompts: Record<string, string> = {
    modern: "A high-quality, modern promotional flyer for a mobile app called 'CaciousBibleQuiz'. The design features a sleek smartphone floating in the center, displaying a vibrant quiz interface with a Bible verse and multiple-choice buttons. Surrounding the phone are 3D icons of a golden trophy, a glowing open Bible, and a musical note. The background is a clean, deep blue and gold gradient with subtle geometric patterns. Professional typography at the top says 'CaciousBibleQuiz' and 'Test Your Knowledge, Grow Your Faith'. 8k resolution, cinematic lighting, ultra-modern aesthetic.",
    social: "An energetic and colorful flyer design for 'CaciousBibleQuiz'. The image shows a diverse group of young adults laughing and looking at their phones together in a modern cafe setting. In the foreground, there is a large, stylized text overlay that reads 'DAILY CHALLENGE IS HERE!' with a 'Play Now' button graphic. The color palette is bright oranges, teals, and whites. Include small floating UI elements like 'Level Up', 'New High Score', and 'Listen to the Word'. High energy, photorealistic, commercial photography style.",
    elegant: "A serene and elegant flyer for 'CaciousBibleQuiz'. The background is a beautiful, soft-focus image of an open Bible on a wooden table with warm morning sunlight streaming through a window. Overlaid on the image is a clean, semi-transparent glassmorphism card containing the app name 'CaciousBibleQuiz' in a sophisticated serif font. Below it, bullet points read: 'AI-Powered Questions', 'Daily Challenges', and 'Audio Bible Verses'. The overall mood is peaceful, scholarly, and inspiring. Minimalist design, 4k, high contrast."
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompts[style] || prompts.modern,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating flyer:", error);
    return null;
  }
}

export async function generateLogo(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            text: `Create a professional, modern app logo for a Bible Quiz app. 
            The logo should feature a stylized Bible, maybe a cross or a flame, and look great as a mobile app icon. 
            Style: Minimalist, vibrant colors (blue/gold), clean lines. 
            Additional details: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating logo:", error);
    return null;
  }
}
