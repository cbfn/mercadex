# Padrão: Few-Shot Learning

**Definição:** IA observa 2-3 exemplos bons do projeto e replica padrão para nova tarefa.

**Quando usar:** Geração de código, testes, componentes, quando padrão já existe no projeto.

**Efetividade:** 90%+ correto primeira vez (vs genérico 60%).

---

## 📋 Estrutura

```
Contexto: [projeto, stack, convenções]

Baseando-se nos exemplos abaixo, [TAREFA].

[EXEMPLO 1]
---
[código/teste/doc bom]
---

[EXEMPLO 2]
---
[outro exemplo]
---

Agora, [TAREFA ESPECÍFICA com padrão similar]

Restrições:
- Siga exatamente padrão dos exemplos
- Use mesma estrutura, naming, conventions
- Mantenha AAA pattern (Arrange/Act/Assert)
```

---

## 🎯 Exemplo Real: Geração de Testes

### ❌ Versão 1 (Genérica)

```
Escreva testes unitários para a função createOrder em Jest.
```

**Output:** Testes genéricos, sem padrão AAA, sem edge cases.

---

### ✅ Versão 2 (Com Few-Shot)

```
Stack: Node.js + TypeScript + Jest + Supertest

Baseando-se nos padrões abaixo, escreva testes para createOrder(dto, userId).

EXEMPLO 1 — Teste de criação bem-sucedida:
---
describe('OrderService.createOrder', () => {
  it('returns order with status PENDING_PIX when items and address are valid', async () => {
    // Arrange
    const mockDto = {
      items: [{ productId: 'uuid1', quantity: 2 }],
      shippingAddress: {
        cep: '01310100',
        street: 'Av. Paulista',
        number: '1000',
        city: 'São Paulo',
        state: 'SP',
      },
    };
    const userId = 'user-uuid';

    // Act
    const result = await orderService.createOrder(mockDto, userId);

    // Assert
    expect(result).toHaveProperty('id');
    expect(result.status).toBe('PENDING_PIX');
    expect(result.totalPrice).toBeGreaterThan(0);
  });
});
---

EXEMPLO 2 — Teste de erro (estoque insuficiente):
---
it('throws InsufficientStockError when product stock is less than quantity', async () => {
  // Arrange
  const mockDto = {
    items: [{ productId: 'product-low-stock', quantity: 999 }],
    shippingAddress: { /* ... */ },
  };
  const userId = 'user-uuid';

  // Act & Assert
  await expect(orderService.createOrder(mockDto, userId))
    .rejects.toThrow(InsufficientStockError);
});
---

Agora, escreva 3 testes adicionais com mesmo padrão:
1. Erro: Produto inexistente
2. Erro: Produto inativo
3. Sucesso: Múltiplos itens no carrinho

Restrições:
- Use padrão AAA exatamente (Arrange, Act, Assert com linhas em branco)
- Nomes de testes em frases completas
- Mock dados realistas
- Uma asserção principal por teste
```

**Output:** Testes seguindo padrão, com edge cases, cobertura 80%+.

---

## 🔑 Elementos Críticos Few-Shot

### 1. Exemplos Bons
✅ Bom: Código real do projeto, padrão consistente
❌ Ruim: Pseudocódigo genérico

### 2. 2-3 Exemplos Mínimo
✅ Bom: "Veja exemplo 1 (sucesso), exemplo 2 (erro)"
❌ Ruim: "Siga padrão" (sem mostrar)

### 3. Contexto Stack
✅ Bom: "Stack: Node + TypeScript + Jest + Supertest"
❌ Ruim: "Escreva um teste"

### 4. Tarefa Clara
✅ Bom: "Escreva 3 testes adicionais: erro X, erro Y, sucesso Z"
❌ Ruim: "Escreva mais testes"

---

## 📊 Exemplo Prático: Componente React

### Prompt Few-Shot

```
Stack: React 19 + TypeScript + shadcn-style + Tailwind CSS

Baseando-se nos componentes abaixo, crie ReviewCard:

EXEMPLO 1 — Button component (primitivo):
---
import { cn } from '@/shared/lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-semibold transition-colors',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  );
}
---

EXEMPLO 2 — Card component (container):
---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
}

export function Card({ variant = 'default', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg p-4 border',
        {
          'bg-white border-gray-200': variant === 'default',
          'bg-white border-none shadow-lg': variant === 'elevated',
        },
        className
      )}
      {...props}
    />
  );
}
---

Agora, crie ReviewCard component:
- Props: review (id, title, body, rating 1-5, author), onDelete
- Mostrar: título, rating em ⭐, corpo, nome autor
- Botão: deletar (se owner)
- Respeitar padrão de naming, TypeScript, Tailwind
```

**Output:** ReviewCard segue estrutura, tipos, padrão visual.

---

## 📈 Quando Few-Shot Funciona Melhor

| Cenário | Efetividade |
|---------|------------|
| Novo teste (padrão existe) | 95% ✅ |
| Novo componente (tipo já existe) | 90% ✅ |
| Nova função service (similar existe) | 85% ✅ |
| Refatoração (padrão novo) | 60% ⚠️ |
| Arquitetura (primeira vez) | 40% ❌ |

👉 Use Few-Shot quando **padrão já existe no codebase**.

---

## ✅ Checklist para Few-Shot

- [ ] 2-3 exemplos bons selecionados?
- [ ] Exemplos são do projeto real (não genéricos)?
- [ ] Stack explicitamente nomeado?
- [ ] Padrão claro em exemplos?
- [ ] Tarefa específica definida?
- [ ] Restrições/regras listadas?
- [ ] Output validado vs exemplos?

