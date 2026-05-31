import { aiSearchAgentService, type SearchHints, AiSearchAgentService } from './ai-search-agent.service';
import { companyProfileService } from './company-profile.service';
import type { ProductFiltersInput } from './products.dto';
import { productsRepository as productsRepositoryInstance } from './products.repository';
import type { SearchProductsInput } from './search-products.dto';

function toNumber(value: unknown) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return Number((value as { toNumber: () => number }).toNumber());
  }

  return Number(value);
}

function mapToRepositoryFilters(input: SearchProductsInput, hints: SearchHints): ProductFiltersInput {
  return {
    category: hints.category,
    search: hints.search,
    minPrice: hints.minPrice,
    maxPrice: hints.maxPrice,
    condition: hints.condition,
    sort: 'newest',
    page: input.page,
    limit: input.limit,
  };
}

function buildMessage(total: number, filters: SearchHints, query: string) {
  if (total > 0) {
    return `Sim! Encontrei ${total} produto${total === 1 ? '' : 's'}.`;
  }

  return query.trim() ? `Não encontrei produtos para "${query.trim()}".` : 'Não encontrei produtos.';
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Palavras que indicam claramente uma pergunta institucional sobre a loja,
// não uma busca por produto. Termos ambíguos como "troca", "envio", "pix"
// foram removidos para não bloquear buscas legítimas de produtos.
const COMPANY_QUERY_PATTERNS = [
  /\b(horario|horarios|funcionamento|abertura|aberto|fechado)\b/,
  /\b(endereco|enderecos|localizacao|onde fica|onde voces ficam)\b/,
  /\b(telefone|telefones|whatsapp)\b/,
  /\b(qual (o |o seu |seu )?(email|e-mail|contato))\b/,
  /\b(como (entrar em contato|falar com|falo com))\b/,
  /\b(formas? de pagamento|aceita(m)? (pix|cartao|boleto))\b/,
  /\b(politica de (troca|devolucao|garantia)|como (trocar|devolver))\b/,
  /\b(prazo de (entrega|envio)|como (funciona a entrega|e a entrega))\b/,
  /\b(quem (e|sao) voces|sobre a (loja|empresa|mercadex))\b/,
];

function isCompanyQuery(query: string) {
  const text = normalizeText(query);
  return COMPANY_QUERY_PATTERNS.some((pattern) => pattern.test(text));
}

export class SearchProductsService {
  constructor(
    private readonly productsRepository = productsRepositoryInstance,
    private readonly searchAgent: Pick<AiSearchAgentService, 'run'> = aiSearchAgentService,
  ) { }

  async execute(input: SearchProductsInput) {
    if (isCompanyQuery(input.q)) {
      const message = await companyProfileService.getAnswer(input.q);

      return {
        query: input.q,
        found: false,
        total: 0,
        message,
        items: [],
        pagination: {
          page: input.page,
          limit: input.limit,
          total: 0,
          totalPages: 1,
        },
        filtersApplied: {
          search: null,
          category: null,
          minPrice: null,
          maxPrice: null,
          condition: null,
        },
      };
    }

    const hints = await this.searchAgent.run(input.q);
    const repositoryFilters = mapToRepositoryFilters(input, hints);
    const result = await this.productsRepository.findMany(repositoryFilters);
    const totalPages = Math.max(1, Math.ceil(result.total / input.limit));

    // Se a busca com faixa de preço não retornou nada, tentar novamente
    // sem o filtro de preço para não perder resultados relevantes.
    if (result.total === 0 && (repositoryFilters.minPrice !== undefined || repositoryFilters.maxPrice !== undefined)) {
      const relaxedFilters = { ...repositoryFilters, minPrice: undefined, maxPrice: undefined } as ProductFiltersInput;
      const relaxedResult = await this.productsRepository.findMany(relaxedFilters);

      if (relaxedResult.total > 0) {
        const relaxedTotalPages = Math.max(1, Math.ceil(relaxedResult.total / input.limit));

        return {
          query: input.q,
          found: relaxedResult.total > 0,
          total: relaxedResult.total,
          message: `Nenhum produto dentro da faixa de preço. Mostrando resultados sem filtro de preço.`,
          items: relaxedResult.items.map((product: (typeof relaxedResult.items)[number]) => ({
            ...product,
            price: toNumber(product.price),
          })),
          pagination: {
            page: input.page,
            limit: input.limit,
            total: relaxedResult.total,
            totalPages: relaxedTotalPages,
          },
          filtersApplied: {
            search: relaxedFilters.search ?? null,
            category: relaxedFilters.category ?? null,
            minPrice: null,
            maxPrice: null,
            condition: relaxedFilters.condition ?? null,
          },
        };
      }
    }

    return {
      query: input.q,
      found: result.total > 0,
      total: result.total,
      message: buildMessage(result.total, hints, input.q),
      items: result.items.map((product: (typeof result.items)[number]) => ({
        ...product,
        price: toNumber(product.price),
      })),
      pagination: {
        page: input.page,
        limit: input.limit,
        total: result.total,
        totalPages,
      },
      filtersApplied: {
        search: repositoryFilters.search ?? null,
        category: repositoryFilters.category ?? null,
        minPrice: repositoryFilters.minPrice ?? null,
        maxPrice: repositoryFilters.maxPrice ?? null,
        condition: repositoryFilters.condition ?? null,
      },
    };
  }
}

export const searchProductsService = new SearchProductsService();
