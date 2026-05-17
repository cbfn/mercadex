declare module 'openai' {
  export default class OpenAI {
    constructor(config?: { apiKey?: string });

    chat: {
      completions: {
        create(params: unknown): Promise<any>;
      };
    };
  }

  export namespace OpenAI {
    type ChatCompletionTool = any;
  }
}
