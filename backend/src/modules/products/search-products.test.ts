import type { AiSearchAgentService } from './ai-search-agent.service';
import { companyProfileService } from './company-profile.service';
import { SearchProductsService } from './search-products.service';

jest.mock('./company-profile.service', () => ({
  companyProfileService: {
    getAnswer: jest.fn(),
  },
}));

describe('SearchProductsService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('executa busca com q e filtros', async () => {
    const mockedRepo = {
      findMany: jest.fn().mockResolvedValue({
        items: [
          {
            id: 1,
            price: 7499.9,
            seller: { id: 1, name: 'Admin', email: 'admin@test.com', avatarUrl: null },
            category: { id: 3, name: 'Notebooks', description: null },
          },
        ],
        total: 1,
      }),
    };

    const mockedAgent = {
      run: jest.fn().mockResolvedValue({
        search: 'notebook',
        category: 'Notebooks',
      }),
    } satisfies Pick<AiSearchAgentService, 'run'>;

    const service = new SearchProductsService(mockedRepo as never, mockedAgent);

    const result = await service.execute({
      q: 'notebook',
      page: 1,
      limit: 20,
    } as never);

    expect(mockedAgent.run).toHaveBeenCalledWith('notebook');
    expect(mockedRepo.findMany).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 20 }));
    expect(result.found).toBe(true);
    expect(result.total).toBe(1);
    expect(result.query).toBe('notebook');
    expect(result.message).toContain('Encontrei 1 produto');
    expect(result.items[0]?.price).toBe(7499.9);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
    expect(result.filtersApplied).toEqual({
      search: 'notebook',
      category: 'Notebooks',
      minPrice: null,
      maxPrice: null,
      condition: null,
    });
  });

  it('usa o q quando a IA nao retorna filtros extras', async () => {
    const mockedRepo = {
      findMany: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
      }),
    };

    const mockedAgent = {
      run: jest.fn().mockResolvedValue({}),
    } satisfies Pick<AiSearchAgentService, 'run'>;

    const service = new SearchProductsService(mockedRepo as never, mockedAgent);

    await service.execute({
      q: 'gaming laptop',
      page: 1,
      limit: 20,
    } as never);

    expect(mockedRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
      }),
    );
  });

  it('interpreta produtos usados como condition USADO', async () => {
    const mockedRepo = {
      findMany: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
      }),
    };

    const mockedAgent = {
      run: jest.fn().mockResolvedValue({
        condition: 'USADO',
      }),
    } satisfies Pick<AiSearchAgentService, 'run'>;

    const service = new SearchProductsService(mockedRepo as never, mockedAgent);

    await service.execute({
      q: 'produtos usados',
      page: 1,
      limit: 20,
    } as never);

    expect(mockedRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        condition: 'USADO',
      }),
    );
  });

  it('responde com o perfil da empresa quando a pergunta nao for de produto', async () => {
    const mockedRepo = {
      findMany: jest.fn(),
    };

    const mockedAgent = {
      run: jest.fn(),
    } satisfies Pick<AiSearchAgentService, 'run'>;

    (companyProfileService.getAnswer as jest.Mock).mockResolvedValueOnce(
      'Claro! Aqui estão as informações da Mercadex:\n\nHorário de atendimento\nSegunda a sexta: 9h às 18h',
    );

    const service = new SearchProductsService(mockedRepo as never, mockedAgent);

    const result = await service.execute({
      q: 'qual o horario de funcionamento?',
      page: 1,
      limit: 20,
    } as never);

    expect(companyProfileService.getAnswer).toHaveBeenCalledWith('qual o horario de funcionamento?');
    expect(mockedAgent.run).not.toHaveBeenCalled();
    expect(mockedRepo.findMany).not.toHaveBeenCalled();
    expect(result.found).toBe(false);
    expect(result.total).toBe(0);
    expect(result.message).toContain('Horário de atendimento');
    expect(result.items).toEqual([]);
  });
});
