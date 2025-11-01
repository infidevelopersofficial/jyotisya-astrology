import {
  AstrologyProvider,
  DailyHoroscopeRequest,
  DailyHoroscopeResult,
  PanchangRequest,
  PanchangResult
} from "../types";

interface JyotishApiConfig {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
}

export class JyotishApiProvider implements AstrologyProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(config: JyotishApiConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs ?? 8000;
  }

  async getDailyHoroscope(input: DailyHoroscopeRequest): Promise<DailyHoroscopeResult> {
    const response = await this.request("horoscope/daily", {
      sunSign: input.sunSign,
      date: input.date,
      timezone: input.timezone,
      locale: input.locale,
      system: input.system
    });

    return {
      source: "jyotish_api",
      metadata: {
        provider: "jyotish_api",
        generatedAt: response.generatedAt ?? new Date().toISOString(),
        timezone: input.timezone,
        raw: response
      },
      summary: {
        date: response.date ?? input.date ?? new Date().toISOString(),
        sunSign: input.sunSign,
        guidance: response.guidance,
        mood: response.mood,
        luckyNumber: response.luckyNumber,
        luckyColor: response.luckyColor
      }
    };
  }

  async getPanchang(input: PanchangRequest): Promise<PanchangResult> {
    const response = await this.request("panchang/today", {
      date: input.date,
      locale: input.locale,
      timezone: input.timezone
    });

    return {
      source: "jyotish_api",
      metadata: {
        provider: "jyotish_api",
        generatedAt: response.generatedAt ?? new Date().toISOString(),
        timezone: input.timezone,
        raw: response
      },
      details: {
        date: response.date,
        tithi: response.tithi,
        nakshatra: response.nakshatra,
        yoga: response.yoga,
        karana: response.karana,
        sunrise: response.sunrise,
        sunset: response.sunset
      }
    };
  }

  private async request(path: string, query: Record<string, string | undefined>) {
    const url = new URL(`${this.baseUrl}/${path}`);
    for (const [key, value] of Object.entries(query)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        signal: controller.signal
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Jyotish API error (${response.status}): ${text}`);
      }

      return response.json();
    } finally {
      clearTimeout(timeout);
    }
  }
}
