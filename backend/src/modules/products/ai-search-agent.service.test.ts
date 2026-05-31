import { AiSearchAgentService } from './ai-search-agent.service';

describe('AiSearchAgentService', () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.OPENAI_MODEL;

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalApiKey;
    process.env.OPENAI_MODEL = originalModel;
    jest.restoreAllMocks();
  });

  it('usa heuristica local sem chamar a OpenAI quando a busca ja e estruturada', async () => {
    process.env.OPENAI_API_KEY = 'test-key';

    const client = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };

    const service = new AiSearchAgentService(client);
    const result = await service.run('notebooks usados abaixo de 3000');

    expect(result).toEqual({
      category: 'Notebooks',
      condition: 'USADO',
      maxPrice: 3000,
      search: 'notebooks usados abaixo de 3000',
    });
    expect(client.chat.completions.create).not.toHaveBeenCalled();
  });

  it('reconhece sinonimos comuns de smartphone e notebook', async () => {
    const service = new AiSearchAgentService();

    await expect(service.run('quero um celular usado')).resolves.toEqual({
      category: 'Smartphones',
      condition: 'USADO',
      search: 'um celular usado',
    });

    await expect(service.run('preciso de um laptop')).resolves.toEqual({
      category: 'Notebooks',
      search: 'um laptop',
    });
  });

  it('mantem o termo do produto quando a consulta pede um item especifico', async () => {
    const service = new AiSearchAgentService();

    await expect(service.run('tem mouse')).resolves.toEqual({
      category: 'Acessórios',
      search: 'mouse',
    });
  });

  it('busca por marca nao mapeada removendo prefixo de intencao', async () => {
    const service = new AiSearchAgentService();

    await expect(service.run('tem xiaomi')).resolves.toEqual({
      category: 'Wearables',
      search: 'xiaomi',
    });
  });

  it('enriquece a busca de mouse com qualificadores uteis', async () => {
    const service = new AiSearchAgentService();

    await expect(service.run('tem mouse gamer sem fio bluetooth')).resolves.toEqual({
      category: 'Acessórios',
      search: 'mouse gamer sem fio bluetooth',
    });
  });

  it('enriquece a busca de fone com qualificadores uteis', async () => {
    const service = new AiSearchAgentService();

    await expect(service.run('tem fone bluetooth com cancelamento de ruido')).resolves.toEqual({
      category: 'Áudio',
      search: 'fone bluetooth com cancelamento de ruido',
    });
  });

  it('enriquece a busca de carregador com qualificadores uteis', async () => {
    const service = new AiSearchAgentService();

    await expect(service.run('tem carregador usb-c rapido')).resolves.toEqual({
      category: 'Acessórios',
      search: 'carregador usb-c rapido',
    });
  });

  it('enriquece a busca de teclado com qualificadores uteis', async () => {
    const service = new AiSearchAgentService();

    await expect(service.run('tem teclado mecanico sem fio rgb')).resolves.toEqual({
      category: 'Acessórios',
      search: 'teclado mecanico sem fio rgb',
    });
  });

  it('limpa a consulta bruta quando nao encontra filtros estruturados', async () => {
    const service = new AiSearchAgentService();

    await expect(service.run('quero algo barato')).resolves.toEqual({
      search: 'barato',
    });
  });

  it('reaproveita cache para a mesma consulta', async () => {
    process.env.OPENAI_API_KEY = 'test-key';

    const client = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  tool_calls: [
                    {
                      type: 'function',
                      function: {
                        name: 'interpretar_busca_produtos',
                        arguments: JSON.stringify({ search: 'notebook' }),
                      },
                    },
                  ],
                },
              },
            ],
          }),
        },
      },
    };

    const service = new AiSearchAgentService(client);

    await service.run('melhor oferta');
    await service.run('melhor oferta');

    expect(client.chat.completions.create).toHaveBeenCalledTimes(1);
  });

  it('cai para heuristica local quando a chamada da OpenAI falha', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.OPENAI_MODEL = 'gpt-4o-mini';

    const client = {
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('rate limit')),
        },
      },
    } as never;

    const service = new AiSearchAgentService(client);
    const result = await service.run('produtos usados abaixo de 1000');

    expect(result).toEqual({
      condition: 'USADO',
      maxPrice: 1000,
    });
  });
});
