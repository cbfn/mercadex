import swaggerUi from 'swagger-ui-express';

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Mercadex API',
    version: '0.1.0',
    description:
      'API REST do marketplace de eletrônicos Mercadex.\n\n' +
      '## Autenticação\n' +
      'Endpoints protegidos exigem o header `Authorization: Bearer <accessToken>`.\n\n' +
      '## Roles\n' +
      '- **USER** — acesso padrão\n' +
      '- **ADMIN** — acesso a operações de escrita em produtos e categorias',
  },
  servers: [{ url: 'http://localhost:3001', description: 'Desenvolvimento' }],
  tags: [
    { name: 'Health', description: 'Verificação de disponibilidade da API' },
    { name: 'Auth', description: 'Registro, login, refresh e logout' },
    { name: 'Products', description: 'Catálogo de produtos' },
    { name: 'Categories', description: 'Categorias de produtos' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token JWT obtido via POST /api/auth/login',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          name: { type: 'string', example: 'João Silva' },
          email: { type: 'string', format: 'email', example: 'joao@email.com' },
          role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'email', 'role', 'createdAt'],
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
          name: { type: 'string', example: 'Smartphones' },
          description: { type: 'string', nullable: true, example: 'Celulares e acessórios' },
        },
        required: ['id', 'name'],
      },
      ProductCondition: {
        type: 'string',
        enum: ['NOVO', 'EXCELENTE', 'BOM', 'USADO'],
        example: 'NOVO',
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' },
          title: { type: 'string', example: 'iPhone 15 Pro 256GB' },
          description: { type: 'string', nullable: true, example: 'Produto em excelente estado' },
          price: { type: 'number', format: 'float', example: 4999.9 },
          condition: { $ref: '#/components/schemas/ProductCondition' },
          stock: { type: 'integer', minimum: 0, example: 5 },
          images: {
            type: 'array',
            items: { type: 'string', format: 'uri' },
            example: ['https://example.com/img1.jpg'],
          },
          categoryId: { type: 'string', format: 'uuid' },
          category: { $ref: '#/components/schemas/Category' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'title', 'price', 'condition', 'stock', 'images', 'categoryId', 'createdAt', 'updatedAt'],
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 150 },
          totalPages: { type: 'integer', example: 8 },
        },
        required: ['page', 'limit', 'total', 'totalPages'],
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: { $ref: '#/components/schemas/User' },
        },
        required: ['accessToken', 'user'],
      },
      ValidationErrorDetail: {
        type: 'object',
        properties: {
          field: { type: 'string', example: 'email' },
          message: { type: 'string', example: 'Email inválido' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Dados inválidos' },
              details: {
                type: 'array',
                items: { $ref: '#/components/schemas/ValidationErrorDetail' },
                nullable: true,
              },
            },
            required: ['code', 'message'],
          },
        },
        required: ['success', 'error'],
      },
    },
    responses: {
      Unauthorized: {
        description: 'Token JWT ausente ou inválido',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, error: { code: 'UNAUTHORIZED', message: 'Token inválido ou expirado' } },
          },
        },
      },
      Forbidden: {
        description: 'Sem permissão (role ADMIN necessário)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, error: { code: 'FORBIDDEN', message: 'Acesso negado' } },
          },
        },
      },
      NotFound: {
        description: 'Recurso não encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, error: { code: 'NOT_FOUND', message: 'Recurso não encontrado' } },
          },
        },
      },
      ValidationError: {
        description: 'Dados de entrada inválidos',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: [{ field: 'email', message: 'Email inválido' }] },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Verifica se a API está disponível.',
        operationId: 'healthCheck',
        responses: {
          200: {
            description: 'API disponível',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ──────────────────────── AUTH ────────────────────────
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar novo usuário',
        description: 'Cria uma conta de usuário com role USER.',
        operationId: 'authRegister',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 2, maxLength: 100, example: 'João Silva' },
                  email: { type: 'string', format: 'email', example: 'joao@email.com' },
                  password: { type: 'string', minLength: 8, maxLength: 100, example: 'senha@1234' },
                },
                required: ['name', 'email', 'password'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuário criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AuthTokens' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          409: {
            description: 'Email já cadastrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { success: false, error: { code: 'CONFLICT', message: 'Email já cadastrado' } },
              },
            },
          },
        },
      },
    },

    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autenticar usuário',
        description:
          'Autentica com email e senha. Retorna um `accessToken` JWT no corpo e define um cookie HTTP-only `refreshToken`.\n\n' +
          '**Rate limit:** 5 requisições por minuto por IP.',
        operationId: 'authLogin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email', example: 'joao@email.com' },
                  password: { type: 'string', minLength: 1, example: 'senha@1234' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login bem-sucedido',
            headers: {
              'Set-Cookie': {
                description: 'Cookie HTTP-only com o refreshToken (SameSite=Strict)',
                schema: { type: 'string' },
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AuthTokens' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email ou senha incorretos' } },
              },
            },
          },
          429: {
            description: 'Rate limit atingido (5 tentativas/min)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Muitas tentativas. Aguarde 1 minuto.' } },
              },
            },
          },
        },
      },
    },

    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Renovar access token',
        description:
          'Troca o `refreshToken` (cookie HTTP-only ou campo `refreshToken` no body) por um novo `accessToken`.',
        operationId: 'authRefresh',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: {
                    type: 'string',
                    description: 'Opcional quando enviado via cookie HTTP-only',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Token renovado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Encerrar sessão',
        description: 'Invalida o refreshToken e limpa o cookie. **Requer autenticação.**',
        operationId: 'authLogout',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Logout realizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', nullable: true, example: null },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ──────────────────────── PRODUCTS ────────────────────────
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Listar produtos',
        description: 'Retorna lista paginada de produtos com suporte a filtros e ordenação.',
        operationId: 'listProducts',
        parameters: [
          {
            name: 'category',
            in: 'query',
            description: 'Filtrar por nome ou ID da categoria',
            schema: { type: 'string' },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Busca textual no título e descrição',
            schema: { type: 'string' },
          },
          {
            name: 'minPrice',
            in: 'query',
            description: 'Preço mínimo',
            schema: { type: 'number', format: 'float' },
          },
          {
            name: 'maxPrice',
            in: 'query',
            description: 'Preço máximo',
            schema: { type: 'number', format: 'float' },
          },
          {
            name: 'condition',
            in: 'query',
            description: 'Condição do produto',
            schema: { $ref: '#/components/schemas/ProductCondition' },
          },
          {
            name: 'sort',
            in: 'query',
            description: 'Ordenação dos resultados',
            schema: { type: 'string', enum: ['price_asc', 'price_desc', 'newest'], default: 'newest' },
          },
          {
            name: 'page',
            in: 'query',
            description: 'Página atual (começa em 1)',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Itens por página (máximo 100)',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          200: {
            description: 'Lista de produtos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                        meta: { $ref: '#/components/schemas/PaginationMeta' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Criar produto',
        description: 'Cria um novo produto. **Requer role ADMIN.**',
        operationId: 'createProduct',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', minLength: 3, maxLength: 255, example: 'iPhone 15 Pro 256GB' },
                  description: { type: 'string', nullable: true, example: 'Produto em excelente estado, sem arranhões' },
                  price: { type: 'number', format: 'float', minimum: 0.01, example: 4999.9 },
                  condition: { $ref: '#/components/schemas/ProductCondition' },
                  categoryId: { type: 'string', format: 'uuid', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
                  stock: { type: 'integer', minimum: 0, default: 0, example: 10 },
                  images: {
                    type: 'array',
                    items: { type: 'string', format: 'uri' },
                    default: [],
                    example: ['https://example.com/img1.jpg'],
                  },
                },
                required: ['title', 'price', 'condition', 'categoryId'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Produto criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Product' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Buscar produto por ID',
        description: 'Retorna os detalhes completos de um produto.',
        operationId: 'getProductById',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'UUID do produto',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Produto encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Product' },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Products'],
        summary: 'Atualizar produto',
        description: 'Atualiza parcialmente ou totalmente um produto. **Requer role ADMIN.**',
        operationId: 'updateProduct',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'UUID do produto',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Todos os campos são opcionais (atualização parcial)',
                properties: {
                  title: { type: 'string', minLength: 3, maxLength: 255 },
                  description: { type: 'string', nullable: true },
                  price: { type: 'number', format: 'float', minimum: 0.01 },
                  condition: { $ref: '#/components/schemas/ProductCondition' },
                  categoryId: { type: 'string', format: 'uuid' },
                  stock: { type: 'integer', minimum: 0 },
                  images: { type: 'array', items: { type: 'string', format: 'uri' } },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Produto atualizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Product' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Deletar produto',
        description: 'Remove permanentemente um produto. **Requer role ADMIN.**',
        operationId: 'deleteProduct',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'UUID do produto',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Produto deletado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', nullable: true, example: null },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ──────────────────────── CATEGORIES ────────────────────────
    '/api/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Listar categorias',
        description: 'Retorna todas as categorias disponíveis.',
        operationId: 'listCategories',
        responses: {
          200: {
            description: 'Lista de categorias',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Criar categoria',
        description: 'Cria uma nova categoria. **Requer role ADMIN.**',
        operationId: 'createCategory',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 2, maxLength: 120, example: 'Smartphones' },
                  description: { type: 'string', nullable: true, example: 'Celulares e acessórios' },
                },
                required: ['name'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Categoria criada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Category' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
  },
};

export const swaggerUiMiddleware = [
  // Remove CSP definido pelo helmet para que o Swagger UI carregue corretamente
  (_req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    res.removeHeader('Content-Security-Policy');
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(spec, {
    customSiteTitle: 'Mercadex API Docs',
    swaggerOptions: { persistAuthorization: true },
  }),
] as import('express').RequestHandler[];
