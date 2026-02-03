import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { chartData, prompt } = await req.json();
    console.log("AI API Received:", { hasChartData: !!chartData, promptLength: prompt?.length });

    // 1. Construct the System Prompt
    const systemPrompt = `
You are an expert Vedic Astrologer (Jyotish Acharya) with deep knowledge of Parashara Hora Sastra.
Your role is to analyze the provided birth chart data and offer profound, empathetic, and actionable insights.

### Guidelines:
1.  **Data-Driven**: Base your entire analysis STRICTLY on the provided JSON chart data (Planets, Signs, Houses, Nakshatras). Do not hallucinate planetary positions.
2.  **Tone**: Empowering, identifying strengths and growth areas. Avoid fatalistic or fear-mongering language (e.g., do not predict death or unavoidable tragedy).
3.  **Structure**: Use clear Markdown headings.
4.  **Audience**: The user is likely a layperson. Explain technical terms (like "Ascendant" or "Dasha") simply when you use them.

### Analysis Framework:
-   **Ascendant (Lagna)**: Core personality, physical vitality, and general approach to life.
-   **Moon Sign (Rashi)**: Emotional nature and mind.
-   **Key Planetary Influences**: Highlight 1-2 planets that are particularly strong (Exalted, Own Sign, Dig Bala) or challenging (Debilitated, in Dusthana 6/8/12).
-   **Current Context**: If Dasha/Transit data is provided, mention the current time period's focus.

### Input Data Context:
The user will provide a JSON object containing:
-   Ascendant Sign & Degree
-   Planetary Positions (Sign, House, Nakshatra, Dignity)
-   (Optional) Current Dasha
`;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // 3. Check for API Key - Fallback to Mock if missing
    if (!apiKey) {
       console.warn("⚠️ No GOOGLE_GENERATIVE_AI_API_KEY found. Serving mock response.");
       
       const mockText = `
# ✨ Vedic Astrology Insights (Demo Mode)

**Overview**: 
This is a **simulated reading** because the AI service is currently running in demo mode. In production, this would be a deeply personalized analysis based on your specific birth chart data (Planets: ${chartData?.planets?.length || 0}, Ascendant: ${chartData?.ascendant || 0}°).

### 🔮 Your Planetary Signatures
- **Ascendant (Lagna)**: Represents your physical vitality and path in life.
- **Moon Sign (Rashi)**: Governance of your mind and emotions. 

### 🛡️ Strength & Dignity
The system analyzes *Shadbala* (planetary strength) and *Avasthas* (dignity) to identify your strongest allies in the chart.

> "The stars impel, they do not compel."

*Please provide a valid Google Gemini API Key to unlock full personalized interpretations.*
       `;

       const encoder = new TextEncoder();
       const stream = new ReadableStream({
         async start(controller) {
           const chunks = mockText.split(/(?=[#\n])/); // Split by lines/headers for chunking
           for (const chunk of chunks) {
             controller.enqueue(encoder.encode(chunk));
             await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate latency
           }
           controller.close();
         },
       });

       return new Response(stream, {
         headers: { 
            "Content-Type": "text/plain; charset=utf-8",
            "X-Vedic-Mock": "true" 
         },
       });
    }

    // 2. Stream the response (Real Mode - Gemini 1.5 Flash)
    console.log("🌟 Entering Real AI Mode. Key present:", !!apiKey);
    
    // Create custom provider instance to ensure key is used
    const google = createGoogleGenerativeAI({
        apiKey: apiKey,
    });

    const result = streamText({
      model: google("gemini-flash-latest"), 
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Here is the birth chart data:
\`\`\`json
${JSON.stringify(chartData, null, 2)}
\`\`\`

User Question/Focus: ${prompt || "Please provide a general overview of my birth chart, focusing on my core personality and major strengths."}`,
        },
      ],
      onError: (error) => {
        console.error("❌ Gemini Streaming Error:", error);
      },
      onFinish: (event) => {
        console.log("✅ Gemini Streaming Finished. Token usage:", event.usage);
        console.log("Refusing/Empty?", event.finishReason);
      }
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Interpretation Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate interpretation" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
