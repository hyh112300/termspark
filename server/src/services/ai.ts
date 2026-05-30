import { config } from '../config.js';

interface OpenAIChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function generateTerms(imageBase64: string): Promise<string[]> {
  const prompt = `你是一名设计术语专家。分析这张图片，识别出 5-10 个与视觉设计元素、风格、配色、排版、布局、构图或设计手法相关的专业设计术语关键词。

只返回一个 JSON 字符串数组，不要其他内容。示例：["极简主义","网格布局","无衬线字体","负空间","扁平设计"]

生成 5-10 个中文术语：`;

  // 根据配置选择 AI 服务
  const isOpencode = config.aiProvider === 'opencode';
  const baseUrl = isOpencode ? config.opencodeBaseUrl : config.omlxUrl;
  const apiKey = isOpencode ? config.opencodeApiKey : config.omlxApiKey;
  const model = isOpencode ? config.opencodeModel : config.omlxModel;
  const providerName = isOpencode ? 'OpenCode' : 'oMLX';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
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
    throw new Error(`${providerName} API error: ${response.status} ${response.statusText} - ${errText}`);
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
