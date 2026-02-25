import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/monitoring/logger";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface InterpretRequestBody {
  chartData: Record<string, unknown>;
  prompt?: string;
}

function isValidRequestBody(body: unknown): body is InterpretRequestBody {
  if (typeof body !== "object" || body === null) return false;
  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.chartData === "object" &&
    candidate.chartData !== null &&
    (candidate.prompt === undefined || typeof candidate.prompt === "string")
  );
}

// eslint-disable-next-line max-lines-per-function
export async function POST(req: NextRequest): Promise<Response> {
  try {
    // 1. Auth: require logged-in user
    const user = await requireAuth();

    // 2. Rate limit: 30 requests per minute per user
    const rateLimitResponse = await rateLimit(req, {
      limit: 30,
      window: 60 * 1000,
      identifier: () => `ai:${user.id}`,
    });
    if (rateLimitResponse) return rateLimitResponse;

    // 3. Parse and validate input
    const body: unknown = await req.json();
    if (!isValidRequestBody(body)) {
      return NextResponse.json(
        { error: "Invalid request body", required: ["chartData"], optional: ["prompt"] },
        { status: 400 },
      );
    }

    const { chartData, prompt } = body;

    logger.info("AI interpret request", {
      userId: user.id,
      hasChartData: !!chartData,
      promptLength: prompt?.length,
    });

    // 4. Construct the System Prompt
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

    // 5. Check for API Key - Fallback to Mock if missing
    if (!apiKey) {
       logger.warn("No GOOGLE_GENERATIVE_AI_API_KEY found — serving mock response");
       
       const mockText = `
# ✨ Vedic Astrology Insights (Demo Mode)

**Overview**: 
This is a **simulated reading** because the AI service is currently running in demo mode. In production, this would be a deeply personalized analysis based on your specific birth chart data (Planets: ${(chartData as { planets?: unknown[] })?.planets?.length || 0}, Ascendant: ${(chartData as { ascendant?: number })?.ascendant || 0}°).

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
           const chunks = mockText.split(/(?=[#\n])/);
           for (const chunk of chunks) {
             controller.enqueue(encoder.encode(chunk));
             await new Promise((resolve) => setTimeout(resolve, 100));
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

    // 6. Stream the response (Real Mode - Gemini 1.5 Flash)
    logger.info("AI interpret — real mode", { userId: user.id });
    
    const google = createGoogleGenerativeAI({
        apiKey: apiKey,
    });

    const result = streamText({
      model: google("gemini-flash-latest"), 
      system: systemPrompt,
      temperature: 0,
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
        logger.error("Gemini streaming error", error);
      },
      onFinish: (event) => {
        logger.info("Gemini streaming finished", {
          userId: user.id,
          usage: event.usage,
          finishReason: event.finishReason,
        });
      }
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode },
      );
    }
    logger.error("AI interpretation error", error);
    return new Response(JSON.stringify({ error: "Failed to generate interpretation" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
