import { config } from '../config.js';

interface OpenAIChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function generateTerms(imageBase64: string): Promise<string[]> {
  const prompt = `You are a design terminology expert. Analyze this image and identify 5-10 specific design-related terminology keywords that describe the visual design elements, style, color palette, typography, layout, composition, or design techniques visible in this image.

Return ONLY a JSON array of strings, nothing else. Example: ["minimalism","grid layout","sans-serif","negative space","flat design"]

Generate 5-10 terms:`;

  const response = await fetch(`${config.omlxUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.omlxModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`oMLX API error: ${response.status} ${response.statusText} - ${errText}`);
  }

  const data: OpenAIChatResponse = await response.json();
  const raw = data.choices?.[0]?.message?.content || '';

  // Parse the JSON array from the response
  try {
    const cleaned = raw
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    const terms = JSON.parse(cleaned);
    if (Array.isArray(terms)) {
      return terms.slice(0, 10).map((t: string) => t.trim()).filter(Boolean);
    }
    return [];
  } catch {
    // Fallback: try to extract terms line by line
    return raw
      .split('\n')
      .map(line => line.replace(/^[\d.\-•*]+\s*/, '').replace(/["\[\],]/g, '').trim())
      .filter(line => line.length > 1 && line.length < 80)
      .slice(0, 10);
  }
}
