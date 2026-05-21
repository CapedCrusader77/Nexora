/**
 * Gemini AI Metadata Assistant Service
 * Provides client-side automated generation of NFT descriptions and tags.
 */

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

interface GenerateMetadataResponse {
  description: string;
  tags: string[];
  rarityScore: number;
}

export class GeminiService {
  /**
   * Generates cyberpunk-style descriptions and tags based on name, category, and traits
   */
  public static async generateNFTMetadata(
    name: string,
    category: string,
    traits: Array<{ trait_type: string; value: string }>
  ): Promise<GenerateMetadataResponse> {
    const traitsStr = traits.map(t => `${t.trait_type}: ${t.value}`).join(", ");
    
    if (GEMINI_API_KEY && GEMINI_API_KEY !== "") {
      try {
        console.log(`[Gemini Service] Sending API request for: ${name}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const prompt = `You are an elite creative writer for a premium, futuristic cyberpunk NFT marketplace.
Generate metadata for a digital asset with the following properties:
Asset Name: "${name}"
Category: "${category}"
Traits: ${traitsStr || "None"}

Please output a JSON object containing exactly three fields:
1. "description": A highly engaging, poetic, and vivid 2-3 sentence description in cyberpunk / sci-fi tone. Keep it under 250 characters.
2. "tags": An array of 4-5 relevant neon-cyberpunk hashtags/keywords (without the # symbol, e.g. ["cyberspace", "quantum", "neon"]).
3. "rarityScore": A generated numerical rarity score between 1.0 and 99.9 (where higher means more rare).

Ensure output is valid JSON and contains only the JSON object. Do not include markdown formatting or backticks.`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text.trim());
          return {
            description: parsed.description || this.getFallbackDescription(name, category),
            tags: parsed.tags || this.getFallbackTags(category),
            rarityScore: parsed.rarityScore || parseFloat((40 + Math.random() * 59.9).toFixed(1)),
          };
        }
      } catch (err) {
        console.warn("[Gemini Service] API call failed, falling back to local generator", err);
      }
    }

    // Rule-based deterministic generator fallback
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          description: this.getFallbackDescription(name, category),
          tags: this.getFallbackTags(category),
          rarityScore: parseFloat((40 + Math.random() * 58).toFixed(1)),
        });
      }, 600);
    });
  }

  private static getFallbackDescription(name: string, category: string): string {
    const prefixes = [
      "A high-fidelity digital artifact forged in the quantum grids of the metaverse.",
      "An elite cybernetic fragment representing the peak of decentralized sovereign systems.",
      "A rare neon-infused visual algorithm synthesized directly from real-time blockchain telemetry.",
    ];
    const bodies = [
      `This visual entity is tailored for the high-end metaverse traveler under the ${category} classification.`,
      `Engineered for optimal interface loading, it embodies the spirit of ${name}.`,
      "Featuring high-exposure infrared textures, it stands as the vanguard of digital collectibles.",
    ];
    const suffix = "Fully compatible with modern Next.js 14 and Amoy standard smart contracts.";

    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const b = bodies[Math.floor(Math.random() * bodies.length)];
    return `${p} ${b} ${suffix}`;
  }

  private static getFallbackTags(category: string): string[] {
    const defaultTags = ["neon", "cyberpunk", "decentralized", "solidity", "amoy", "polygon"];
    const categoryTags: Record<string, string[]> = {
      Art: ["generative", "creative", "vector", "render"],
      Music: ["waveform", "synth", "audio-visual", "ambient"],
      Gaming: ["avatar", "asset", "unreal", "unity", "tactical"],
      Photography: ["infrared", "tokyo", "landscape", "lens"],
      "Virtual Worlds": ["metaverse", "simulation", "sandbox", "procedural"],
    };

    const specific = categoryTags[category] || ["digital-asset"];
    // return combined tags up to 5 elements
    return [...new Set([...specific, ...defaultTags])].slice(0, 5);
  }
}
