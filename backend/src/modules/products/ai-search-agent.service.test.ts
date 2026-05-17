import { AiSearchAgentService } from './ai-search-agent.service';

describe('AiSearchAgentService', () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.OPENAI_MODEL;

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalApiKey;
    process.env.OPENAI_MODEL = originalModel;
    jest.restoreAllMocks();
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
