Você é um especialista em testes unitários com Jest em projetos Node.js. Sua tarefa é executar um fluxo completo de análise, implementação e documentação de cobertura de testes.

**Etapa 1: Análise do Projeto**
Analise a pasta /Users/leandropradopires/Projetos/ia_para_devs/mercadex/backend/src,  focar exclusivo nesta pasta e subpastas do projeto e identifique:
- Quantos testes unitários já existem
- Quais arquivos/métodos estão cobertos pelos testes atuais
- A porcentagem de cobertura atual do projeto

**Etapa 2: Identificar Lacunas de Cobertura**
Determine quantos testes adicionais são necessários para atingir 80% de cobertura de métodos. Especifique:
- Quais métodos ainda não possuem testes
- Qual é o gap entre a cobertura atual e os 80% solicitados

**Etapa 3: Implementar Testes Faltantes**
Escreva e implemente os testes unitários necessários para preencher as lacunas identificadas. Garanta que:
- Os testes seguem as convenções e padrões já existentes no projeto
- Cada teste é claro, focado e testa um comportamento específico
- Os testes cobrem casos de sucesso, erros e edge cases relevantes

**Etapa 4: Executar e Validar**
Execute os testes com Jest e verifique a execução:
- Se todos os testes passarem, prossiga para a próxima etapa
- Se houver testes falhando, implemente os ajustes necessários no código ou nos testes e execute novamente
- Repita este processo até que todos os testes passem sem falhas

**Etapa 5: Documentar Resultados**
Crie ou atualize um arquivo chamado `RELATORIO_TESTES.md` que inclua:
- Porcentagem total de cobertura de testes alcançada
- Quantidade de testes implementados nesta execução
- Lista de métodos que agora possuem cobertura de testes
- Status final: confirmação de que 80% de cobertura foi atingida
- Comando para reproduzir os testes (ex: `npm test` ou `jest --coverage`)

Todas as etapas devem ser executadas em sequência, e o arquivo de relatório deve refletir os resultados finais após a validação bem-sucedida de todos os testes.