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

function isProductQuery(query: string) {
  const text = normalizeText(query);

  return [
    'produto',
    'produtos',
    'notebook',
    'laptop',
    'celular',
    'smartphone',
    'iphone',
    'android',
    'mouse',
    'teclado',
    'monitor',
    'console',
    'playstation',
    'ps5',
    'xbox',
    'nintendo',
    'camera',
    'câmera',
    'tablet',
    'watch',
    'fone',
    'headphone',
    'headset',
    'acessorio',
    'acessorio',
    'comprar',
    'vender',
    'oferta',
    'preco',
    'preço',
    'valor',
    'estoque',
    'usado',
    'novo',
    'excelente',
    'bom',
  ].some((keyword) => text.includes(keyword));
}

export class SearchProductsService {
  constructor(
    private readonly productsRepository = productsRepositoryInstance,
    private readonly searchAgent: Pick<AiSearchAgentService, 'run'> = aiSearchAgentService,
  ) {}

  async execute(input: SearchProductsInput) {
    if (!isProductQuery(input.q)) {
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
