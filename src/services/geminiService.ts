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
  const cleanBook = book.trim();
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing!");
    return getFallback(cleanBook);
  }
  const ai = new GoogleGenAI({ apiKey });

  function getFallback(b: string): Question[] {
    console.log("Attempting fallback for:", b);
    // Case-insensitive lookup
    const bookKey = Object.keys(FALLBACK_QUESTIONS).find(
      key => key.toLowerCase() === b.toLowerCase()
    );
    
    if (bookKey && FALLBACK_QUESTIONS[bookKey]) {
      console.log("Found specific fallback for:", bookKey);
      return FALLBACK_QUESTIONS[bookKey].map((q, index) => ({
        ...q,
        id: `${b}-fallback-${index}-${Date.now()}`
      }));
    }
    
    console.log("No specific fallback found for:", b, ". Defaulting to Genesis.");
    return FALLBACK_QUESTIONS['Genesis'].map((q, index) => ({
      ...q,
      id: `genesis-fallback-${index}-${Date.now()}`
    }));
  }

  // Improved prompt to be more specific and demanding about the book/chapter
  const getPrompt = (b: string, c: number) => {
    const target = b === 'Daily' 
      ? 'randomly selected books and chapters' 
      : `the book of ${b}${c > 0 ? `, specifically chapter ${c}` : ''}`;
    
    return `Generate exactly ${count} multiple-choice Bible quiz questions based on ${target} using the ESV translation.
    
    CRITICAL RULES:
    1. You MUST ONLY use verses from ${b === 'Daily' ? 'various books' : b}. 
    2. If the requested book is ${b}, do NOT provide questions from Genesis or any other book.
    3. Each question must be unique and directly related to the text of ${b}.
    4. Ensure the JSON is perfectly formatted.
    
    Difficulty Level: ${difficulty}.
    - Easy: Basic facts and well-known stories.
    - Medium: More detailed questions about specific events or people.
    - Hard: Deep theological questions, specific phrasing, or lesser-known details.
    
    For each question, provide:
    1. The exact verse reference (e.g., ${b} ${c > 0 ? c : '1'}:1)
    2. The full text of the verse
    3. A clear quiz question based on that verse
    4. 4 distinct multiple-choice options
    5. The correct answer (must match one of the options exactly)
    6. A brief explanation of the answer and its context.
    
    Output MUST be a valid JSON array of objects.`;
  };

  const attemptGeneration = async (p: string, retries = 2) => {
    const models = ["gemini-3.1-flash-lite-preview", "gemini-3-flash-preview"];
    
    for (let i = 0; i <= retries; i++) {
      const modelToUse = models[i % models.length];
      try {
        console.log(`Attempting generation with ${modelToUse} for ${cleanBook}...`);
        const response = await ai.models.generateContent({
          model: modelToUse,
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
        
        if (response && response.text) {
          const questions = JSON.parse(response.text);
          if (Array.isArray(questions) && questions.length > 0) {
            // Validation: check if the first question's verse contains the book name (or part of it)
            const firstVerse = questions[0].verse.toLowerCase();
            const bookLower = cleanBook.toLowerCase();
            
            // Allow some flexibility (e.g. "1 Samuel" vs "1 Sam")
            const bookWords = bookLower.split(' ');
            const matchesBook = cleanBook === 'Daily' || bookWords.some(word => word.length > 2 && firstVerse.includes(word));

            if (!matchesBook && i < retries) {
              console.warn(`AI generated questions for wrong book. Expected ${cleanBook}, got ${firstVerse}. Retrying...`);
              continue;
            }
            return response.text;
          }
        }
      } catch (err) {
        console.error(`Attempt ${i + 1} with ${modelToUse} failed for ${cleanBook}:`, err);
        if (i === retries) return null;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return null;
  };

  try {
    let text = await attemptGeneration(getPrompt(cleanBook, chapter));
    
    if (!text) {
      console.log("AI failed completely for", cleanBook);
      return getFallback(cleanBook);
    }

    try {
      const questions = JSON.parse(text);
      return questions.map((q: any, index: number) => ({
        ...q,
        id: `${cleanBook}-${chapter}-${index}-${Date.now()}`
      }));
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return getFallback(cleanBook);
    }
  } catch (error) {
    console.error("Critical error in generateQuestions:", error);
    return getFallback(cleanBook);
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

export async function askBibleQuestion(question: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return "I'm sorry, I can't answer that right now. Please check your API key.";
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a helpful and knowledgeable Bible Study Assistant for the 'CaciousBibleQuiz' app. 
      Answer the following question about the Bible, theology, or Christian history in a clear, encouraging, and scholarly way.
      Keep the answer concise but informative.
      Question: ${question}`,
    });
    
    return response.text || "I'm sorry, I couldn't find an answer to that.";
  } catch (error) {
    console.error("Error asking Bible question:", error);
    return "An error occurred while trying to find an answer. Please try again.";
  }
}

export async function generateAdminMessage(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return "API key missing. Please check your configuration.";
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert community manager for a Bible Quiz app called 'CaciousBibleQuiz'. 
      Generate a professional, encouraging, and engaging message for the app's users based on the following request: ${prompt}.
      The message should be suitable for Email, WhatsApp, or SMS. 
      Use emojis where appropriate to make it friendly. 
      Keep it concise but impactful.`,
    });
    
    return response.text || "I couldn't generate a message at this time.";
  } catch (error) {
    console.error("Error generating admin message:", error);
    return "An error occurred while generating the message.";
  }
}
