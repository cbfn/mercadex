Você é um arquiteto de DevOps especializado em CI/CD e garantia de qualidade de código.
Sua tarefa é desenvolver uma estratégia completa de integração contínua que automatize a validação de cobertura de testes Jest,
criando um ciclo contínuo de qualidade que complementa o fluxo manual de análise, implementação e documentação já estabelecido.


**Estrutura do Repositório**

O repositório Mercadex possui dois projetos independentes dentro do mesmo monorepo, cada um com sua própria suite Jest:

```
mercadex/
├── frontend/   # Next.js 16.2 + React 19 + TypeScript — testes com Jest 30 + React Testing Library
└── backend/    # Node.js 20 + Express + TypeScript — testes com Jest
```

Ambos os projetos têm configuração Jest própria, `package.json` independente e threshold de cobertura de **80%** (lines, functions, branches, statements).


**Objetivo Final**

Implementar dois fluxos CI/CD paralelos e independentes — um para `frontend/` e outro para `backend/` — garantindo automaticamente que nenhum código com cobertura abaixo de 80% seja mesclado ao repositório, com visibilidade total e separada para cada projeto através de relatórios, comentários no PR e notificações.


**Requisitos Técnicos**

1. **Dois Workflows GitHub Actions Independentes**

   Crie dois workflows separados (ou dois jobs paralelos em um único arquivo YAML), um para cada projeto:

   - **`ci-frontend.yml`** — responsável por tudo relacionado a `frontend/`
   - **`ci-backend.yml`** — responsável por tudo relacionado a `backend/`

   Cada workflow deve:
   - Executar apenas quando houver mudanças no caminho correspondente (`paths: frontend/**` ou `paths: backend/**`)
   - Executar os testes Jest com flag de cobertura (`npm run test:coverage` ou equivalente)
   - Calcular a cobertura em tempo real e registrar os resultados
   - Ser completamente independente: a falha de um não deve bloquear a execução do outro

   Gatilhos para ambos:
   - `push` para as branches `main` e `develop`
   - `pull_request` para as branches `main` e `develop`
   - Usar `paths` para evitar execuções desnecessárias quando apenas um projeto sofrer alterações

2. **Bloqueio de Pull Requests por Projeto**

   - Configure duas status checks separadas no GitHub (`ci-frontend` e `ci-backend`) como obrigatórias para merge
   - Cada check deve falhar explicitamente com mensagem clara identificando qual projeto está abaixo do threshold
   - Um PR que altere apenas `backend/` não deve ser bloqueado por falha no `frontend/`, e vice-versa
   - Crie exceções ou override apenas quando absolutamente necessário, com justificativa documentada no próprio PR

3. **Relatórios e Feedback no PR — Separados por Projeto**

   - Gere relatórios de cobertura em formato HTML como artefatos do workflow, nomeados por projeto:
     - Artefato: `coverage-report-frontend`
     - Artefato: `coverage-report-backend`
   - Adicione um único comentário consolidado no PR (ou dois comentários distintos) mostrando:
     - Seção **Frontend**: porcentagem de cobertura atual, delta em relação à execução anterior, arquivos/métodos sem cobertura
     - Seção **Backend**: as mesmas informações para o contexto do backend
   - O comentário deve ser atualizado a cada novo push no PR (não duplicar comentários)
   - Inclua link direto para cada artefato HTML de cobertura no comentário

4. **Integração com RELATORIO_TESTES.md**

   Configure cada workflow para atualizar automaticamente o arquivo `RELATORIO_TESTES.md` após cada execução bem-sucedida.
   O arquivo deve ter uma seção por projeto e registrar:

   ```markdown
   ## Frontend — <data e hora da execução>
   - Cobertura: XX%
   - Total de testes: N
   - Status: sucesso | falha
   - Métodos recém-cobertos: [lista]
   - Métodos descobertos sem cobertura: [lista]

   ## Backend — <data e hora da execução>
   - Cobertura: XX%
   - Total de testes: N
   - Status: sucesso | falha
   - Métodos recém-cobertos: [lista]
   - Métodos descobertos sem cobertura: [lista]
   ```

   - Faça commit automático das atualizações ao repositório (via `git push` no próprio workflow com token)
   - Ou abra um PR automático para revisão, caso o commit direto no `develop` não seja permitido pelas regras do repositório

5. **Alertas para Novos Métodos Sem Cobertura — Por Projeto**

   Para cada workflow, implemente detecção que:
   - Identifique métodos ou funções adicionados nos commits do PR que não possuem testes correspondentes
   - Gere alerta explícito na seção do projeto correspondente no comentário do PR
   - Crie uma subseção "⚠️ Novos Métodos Descobertos sem Cobertura" com nome do arquivo, nome do método e linha

   O alerta não deve bloquear o merge por si só (apenas a cobertura global abaixo de 80% bloqueia), mas deve ser visível e rastreável.


**Contexto de Integração**

Esta automação complementa o fluxo manual existente (análise → implementação → documentação). O pipeline CI/CD deve:
- Executar continuamente em paralelo para `frontend/` e `backend/` sem interferência entre os dois
- Manter o arquivo `RELATORIO_TESTES.md` atualizado como fonte única da verdade para ambos os projetos
- Fornecer feedback imediato e separado por contexto, acelerando iterações sem ambiguidade sobre qual projeto falhou
- Garantir que 80% de cobertura seja um requisito obrigatório e independente para cada projeto
- Não substituir processos manuais deliberados, apenas automatizar a validação contínua


**Entregáveis**

Forneça:
1. Arquivo `ci-frontend.yml` — configuração completa do workflow para o frontend
2. Arquivo `ci-backend.yml` — configuração completa do workflow para o backend
3. Scripts auxiliares necessários (bash, Node.js ou Python) para:
   - Gerar o comentário consolidado no PR com seções separadas por projeto
   - Detectar novos métodos sem cobertura comparando com a base da branch
   - Atualizar o `RELATORIO_TESTES.md` com os dados de cobertura de cada projeto
4. Instruções de setup passo a passo para ativar ambos os pipelines, incluindo:
   - Configuração das branch protection rules com as duas status checks obrigatórias
   - Secrets e permissões necessárias (ex: `GITHUB_TOKEN` para comentários no PR)
5. Exemplos de comportamento em cenários comuns:
   - PR que altera apenas `frontend/` com cobertura acima de 80% → apenas `ci-frontend` executa e aprova
   - PR que altera apenas `backend/` com cobertura abaixo de 80% → apenas `ci-backend` executa e bloqueia
   - PR que altera ambos os projetos → ambos executam em paralelo; falha em um bloqueia o merge independentemente do outro
   - Novos métodos adicionados sem testes → alerta no PR sem bloqueio automático
6. Guia de troubleshooting para problemas comuns e ajustes futuros, cobrindo ambos os projetos
