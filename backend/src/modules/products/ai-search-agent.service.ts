import OpenAI from 'openai';
import { z } from 'zod';

const TOOL_NAME = 'interpretar_busca_produtos';

const SearchHintSchema = z.object({
  search: z.string().trim().min(1).max(255).optional(),
  category: z.string().trim().min(1).max(120).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  condition: z.enum(['NOVO', 'EXCELENTE', 'BOM', 'USADO']).optional(),
});

export type SearchHints = z.infer<typeof SearchHintSchema>;

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function inferHintsFromText(userMessage: string): SearchHints {
  const text = normalizeText(userMessage);

  const hints: SearchHints = {};

  if (/\b(usado|usados)\b/.test(text)) {
    hints.condition = 'USADO';
  } else if (/\b(novo|novos)\b/.test(text)) {
    hints.condition = 'NOVO';
  } else if (/\b(excelente|excelentes)\b/.test(text)) {
    hints.condition = 'EXCELENTE';
  } else if (/\b(bom|bons)\b/.test(text)) {
    hints.condition = 'BOM';
  }

  const categoryMap: Record<string, string> = {
    smartphone: 'Smartphones',
    smartphones: 'Smartphones',
    notebook: 'Notebooks',
    notebooks: 'Notebooks',
    game: 'Games',
    games: 'Games',
    tablet: 'Tablets',
    tablets: 'Tablets',
    audio: 'Áudio',
    cameras: 'Câmeras',
    camera: 'Câmeras',
    wearable: 'Wearables',
    wearables: 'Wearables',
    acessorios: 'Acessórios',
    acessorio: 'Acessórios',
  };

  for (const [needle, category] of Object.entries(categoryMap)) {
    if (text.includes(needle)) {
      hints.category = category;
      break;
    }
  }

  const maxPriceMatch = text.match(/\b(ate|até|menos de|abaixo de|por menos de)\s*(?:r\$?\s*)?(\d+(?:[.,]\d{1,2})?)/);
  if (maxPriceMatch?.[2]) {
    hints.maxPrice = Number(maxPriceMatch[2].replace(',', '.'));
  }

  const minPriceMatch = text.match(/\b(acima de|mais de|a partir de|por mais de)\s*(?:r\$?\s*)?(\d+(?:[.,]\d{1,2})?)/);
  if (minPriceMatch?.[2]) {
    hints.minPrice = Number(minPriceMatch[2].replace(',', '.'));
  }

  if (!hints.category && !hints.condition && !hints.minPrice && !hints.maxPrice) {
    hints.search = userMessage.trim();
  }

  return hints;
}

const SEARCH_HINT_TOOL = {
  type: 'function' as const,
  function: {
    name: TOOL_NAME,
    description:
      'Extrai filtros estruturados da intenção do usuário para busca de produtos. Use search para texto livre, category para categoria, minPrice/maxPrice para faixa de preço e condition para estado do produto.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        search: {
          type: 'string',
          description: 'Texto livre para busca por título ou descrição do produto.',
        },
        category: {
          type: 'string',
          description: 'Categoria do produto, como Smartphones, Notebooks, Games, Tablets, Áudio, Câmeras, Wearables ou Acessórios.',
        },
        minPrice: {
          type: 'number',
          description: 'Preço mínimo desejado.',
        },
        maxPrice: {
          type: 'number',
          description: 'Preço máximo desejado.',
        },
        condition: {
          type: 'string',
          enum: ['NOVO', 'EXCELENTE', 'BOM', 'USADO'],
          description: 'Condição do produto.',
        },
      },
    },
  },
} satisfies OpenAI.ChatCompletionTool;

function parseToolArguments(rawArguments: string): SearchHints {
  const parsed = JSON.parse(rawArguments) as unknown;
  return SearchHintSchema.parse(parsed);
}

export class AiSearchAgentService {
  private readonly client: OpenAI;

  constructor(client?: OpenAI) {
    this.client = client ?? new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async run(userMessage: string): Promise<SearchHints> {
    if (!process.env.OPENAI_API_KEY) {
      return inferHintsFromText(userMessage);
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0,
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente de busca de produtos. Extraia os filtros mais úteis da mensagem do usuário e chame a ferramenta interpretar_busca_produtos.',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        tools: [SEARCH_HINT_TOOL],
        tool_choice: 'required',
      });

      const toolCall = completion.choices[0]?.message.tool_calls?.[0];

      if (!toolCall || toolCall.type !== 'function' || toolCall.function.name !== TOOL_NAME) {
        return inferHintsFromText(userMessage);
      }

      try {
        return parseToolArguments(toolCall.function.arguments);
      } catch {
        return inferHintsFromText(userMessage);
      }
    } catch {
      return inferHintsFromText(userMessage);
    }
  }
}

export const aiSearchAgentService = new AiSearchAgentService();
