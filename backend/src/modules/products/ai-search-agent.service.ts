import { z } from 'zod';

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      tool_calls?: Array<{
        type?: string;
        function?: {
          name?: string;
          arguments?: string;
        };
      }>;
    };
  }>;
};

type AiClient = {
  chat: {
    completions: {
      create(payload: unknown): Promise<ChatCompletionResponse>;
    };
  };
};

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

function buildFallbackSearchQuery(userMessage: string) {
  const stopwords = new Set([
    'a',
    'agora',
    'algo',
    'algum',
    'alguma',
    'alguns',
    'algumas',
    'ao',
    'aos',
    'as',
    'com',
    'da',
    'das',
    'de',
    'do',
    'dos',
    'e',
    'em',
    'entre',
    'eu',
    'gostaria',
    'me',
    'mes',
    'meu',
    'minha',
    'na',
    'nas',
    'no',
    'nos',
    'o',
    'os',
    'ou',
    'para',
    'por',
    'pra',
    'preciso',
    'pro',
    'quais',
    'qual',
    'quero',
    'quais',
    'queria',
    'quero',
    'ser',
    'sobre',
    'tem',
    'um',
    'uma',
    'uns',
    'umas',
    'ver',
    'voc',
    'voce',
    'voces',
    'vocês',
  ]);

  const tokens = normalizeText(userMessage)
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !stopwords.has(token));

  if (!tokens.length) {
    return userMessage.trim();
  }

  return tokens.join(' ');
}

function buildQualifiedProductSearchQuery(userMessage: string, matchedProductTerm: string) {
  const text = normalizeText(userMessage);

  // Usa o texto original do usuário como base para preservar modelos e números
  // (ex: "iPhone 14", "Galaxy S23 Ultra"), removendo apenas stopwords e verbos de intenção.
  const intentPrefixes = /^(tem|quero|preciso de|procuro|busco|gostaria de|queria|me mostra|mostra|ver|veja|qual|quais)\s+/i;
  const cleanedOriginal = userMessage.trim().replace(intentPrefixes, '').trim();
  const fragments = [cleanedOriginal || matchedProductTerm];

  const qualifiers: Record<string, string[]> = {
    mouse: ['gamer', 'sem fio', 'semfio', 'wireless', 'bluetooth', 'ergonomico', 'ergonomica', 'vertical'],
    fone: ['bluetooth', 'wireless', 'sem fio', 'semfio', 'gamer', 'gaming', 'noise cancelling', 'cancelamento de ruido'],
    fones: ['bluetooth', 'wireless', 'sem fio', 'semfio', 'gamer', 'gaming', 'noise cancelling', 'cancelamento de ruido'],
    headset: ['bluetooth', 'wireless', 'sem fio', 'semfio', 'gamer', 'gaming', 'noise cancelling', 'cancelamento de ruido'],
    headphone: ['bluetooth', 'wireless', 'sem fio', 'semfio', 'gamer', 'gaming', 'noise cancelling', 'cancelamento de ruido'],
    headphones: ['bluetooth', 'wireless', 'sem fio', 'semfio', 'gamer', 'gaming', 'noise cancelling', 'cancelamento de ruido'],
    carregador: ['usb-c', 'usbc', 'rapido', 'rápido', 'wireless', 'turbo', 'magsafe', 'portatil', 'portátil'],
    cabo: ['usb-c', 'usbc', 'hdmi', 'tipo c', 'type c', 'usb a', 'usb-c', 'lightning'],
    teclado: ['mecanico', 'mecânico', 'sem fio', 'semfio', 'wireless', 'bluetooth', 'gamer', 'compacto', 'rgb'],
  };

  const candidateQualifiers = qualifiers[matchedProductTerm] ?? [];

  for (const qualifier of candidateQualifiers) {
    const normalizedQualifier = normalizeText(qualifier);
    if (
      text.includes(normalizedQualifier) &&
      !fragments.some((fragment) => normalizeText(fragment).includes(normalizedQualifier))
    ) {
      fragments.push(qualifier);
    }
  }

  return fragments.join(' ');
}

function inferHintsFromText(userMessage: string): SearchHints {
  const text = normalizeText(userMessage);

  const hints: SearchHints = {};
  let matchedProductTerm: string | null = null;

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
    celular: 'Smartphones',
    celulares: 'Smartphones',
    iphone: 'Smartphones',
    android: 'Smartphones',
    notebook: 'Notebooks',
    notebooks: 'Notebooks',
    laptop: 'Notebooks',
    laptops: 'Notebooks',
    tablet: 'Tablets',
    tablets: 'Tablets',
    audio: 'Áudio',
    audiofones: 'Áudio',
    fone: 'Áudio',
    fones: 'Áudio',
    headphone: 'Áudio',
    headphones: 'Áudio',
    headset: 'Áudio',
    airpods: 'Áudio',
    cameras: 'Câmeras',
    camera: 'Câmeras',
    wearable: 'Wearables',
    wearables: 'Wearables',
    smartwatch: 'Wearables',
    relogio: 'Wearables',
    relógio: 'Wearables',
    xiaomi: 'Wearables',
    'mi band': 'Wearables',
    miband: 'Wearables',
    fitbit: 'Wearables',
    garmin: 'Wearables',
    acessorios: 'Acessórios',
    acessorio: 'Acessórios',
    mouse: 'Acessórios',
    teclado: 'Acessórios',
    carregador: 'Acessórios',
    cabo: 'Acessórios',
    game: 'Games',
    games: 'Games',
    console: 'Games',
    playstation: 'Games',
    ps5: 'Games',
    xbox: 'Games',
    nintendo: 'Games',
  };

  for (const [needle, category] of Object.entries(categoryMap)) {
    if (text.includes(needle)) {
      hints.category = category;
      matchedProductTerm = needle;
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

  if (matchedProductTerm && !hints.search) {
    // Usa o texto original do usuário como base para preservar modelos e números
    // (ex: "iPhone 14", "Galaxy S23"), mas enriquece com qualificadores detectados.
    hints.search = buildQualifiedProductSearchQuery(userMessage, matchedProductTerm);
  }

  if (!hints.category && !hints.condition && !hints.minPrice && !hints.maxPrice && !hints.search) {
    hints.search = buildFallbackSearchQuery(userMessage);
  }

  return hints;
}

function hasStructuredHints(hints: SearchHints) {
  return Boolean(hints.category || hints.condition || hints.minPrice || hints.maxPrice);
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
};

function parseToolArguments(rawArguments: string): SearchHints {
  const parsed = JSON.parse(rawArguments) as unknown;
  return SearchHintSchema.parse(parsed);
}

export class AiSearchAgentService {
  private readonly client?: AiClient;
  private readonly cache = new Map<string, { expiresAt: number; hints: SearchHints }>();
  private readonly cacheTtlMs = 5 * 60 * 1000;
  private readonly cacheLimit = 100;

  constructor(client?: AiClient) {
    if (client) {
      this.client = client;
      return;
    }

    if (process.env.OPENAI_API_KEY) {
      // O provider LLM e opcional no backend. O import dinamico evita
      // bloquear `npm ci` quando a dependencia nao estiver instalada.
      this.client = this.createOptionalClient(process.env.OPENAI_API_KEY);
    }
  }

  private getCacheKey(userMessage: string) {
    return normalizeText(userMessage).trim();
  }

  private getCachedHints(userMessage: string) {
    const key = this.getCacheKey(userMessage);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    if (cached.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return cached.hints;
  }

  private setCachedHints(userMessage: string, hints: SearchHints) {
    const key = this.getCacheKey(userMessage);

    if (this.cache.size >= this.cacheLimit && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value as string | undefined;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      expiresAt: Date.now() + this.cacheTtlMs,
      hints,
    });
  }

  private createOptionalClient(apiKey: string): AiClient | undefined {
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const dynamicRequire = (Function('return require')() as (id: string) => unknown);
      const openaiModule = dynamicRequire('openai') as {
        default?: new (config: { apiKey: string }) => AiClient;
      };
      const OpenAIClient = openaiModule.default;

      if (!OpenAIClient) {
        return undefined;
      }

      return new OpenAIClient({ apiKey });
    } catch {
      return undefined;
    }
  }

  async run(userMessage: string): Promise<SearchHints> {
    const cached = this.getCachedHints(userMessage);
    if (cached) {
      return cached;
    }

    const localHints = inferHintsFromText(userMessage);

    if (!process.env.OPENAI_API_KEY || !this.client) {
      this.setCachedHints(userMessage, localHints);
      return localHints;
    }

    if (hasStructuredHints(localHints)) {
      this.setCachedHints(userMessage, localHints);
      return localHints;
    }

    try {
      // Timeout de 3 segundos para fallback rápido caso a API esteja lenta
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('OpenAI timeout')), 3000);
      });

      const completion = await Promise.race([
        this.client.chat.completions.create({
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
        }),
        timeoutPromise,
      ]);

      const toolCall = completion.choices?.[0]?.message?.tool_calls?.[0];
      const functionName = toolCall?.function?.name;
      const functionArguments = toolCall?.function?.arguments;

      if (!toolCall || toolCall.type !== 'function' || functionName !== TOOL_NAME || !functionArguments) {
        this.setCachedHints(userMessage, localHints);
        return localHints;
      }

      try {
        const parsedHints = parseToolArguments(functionArguments);
        this.setCachedHints(userMessage, parsedHints);
        return parsedHints;
      } catch {
        this.setCachedHints(userMessage, localHints);
        return localHints;
      }
    } catch {
      this.setCachedHints(userMessage, localHints);
      return localHints;
    }
  }
}

export const aiSearchAgentService = new AiSearchAgentService();
