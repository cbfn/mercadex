import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function resolveCompanyProfilePath() {
  const candidates = [
    path.resolve(process.cwd(), 'src/modules/products/company-profile.md'),
    path.resolve(process.cwd(), 'backend/src/modules/products/company-profile.md'),
    path.resolve(process.cwd(), 'dist/src/modules/products/company-profile.md'),
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
}

function parseSections(content: string) {
  const sections = new Map<string, string>();
  const lines = content.split(/\r?\n/);
  let currentTitle = '';
  let currentBody: string[] = [];

  const flush = () => {
    if (!currentTitle) return;
    const body = currentBody.join('\n').trim();
    if (body) {
      sections.set(currentTitle, body);
    }
  };

  for (const line of lines) {
    const headingMatch = /^##\s+(.+)$/.exec(line);

    if (headingMatch) {
      flush();
      currentTitle = headingMatch[1].trim();
      currentBody = [];
      continue;
    }

    if (/^#\s+/.test(line)) {
      continue;
    }

    if (currentTitle) {
      currentBody.push(line);
    }
  }

  flush();
  return sections;
}

function extractCategorySuggestions(sectionBody: string) {
  return sectionBody
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^-\s+/.test(line))
    .map((line) => line.replace(/^-\s+/, '').trim())
    .filter(Boolean)
    .slice(0, 3);
}

function pickSectionTitles(query: string) {
  const text = normalizeText(query);

  const picks: string[] = [];

  if (/\b(produto|produtos|categoria|categorias|catálogo|catalogo|vende|venda|itens|eletronicos|eletrônicos)\b/.test(text)) {
    picks.push('Produtos e categorias');
  }

  if (/\b(horario|horarios|funcionamento|abertura|aberto|fechado)\b/.test(text)) {
    picks.push('Horário de atendimento');
  }

  if (/\b(endereco|endereço|localizacao|localização|onde fica|onde vocês ficam|loja)\b/.test(text)) {
    picks.push('Endereço');
  }

  if (/\b(telefone|telefones|whatsapp|contato|celular)\b/.test(text)) {
    picks.push('Telefones');
  }

  if (/\b(email|e-mail|mail|suporte)\b/.test(text)) {
    picks.push('E-mail');
  }

  if (/\b(entrega|envio|retirada|troca|devolucao|devolução)\b/.test(text)) {
    picks.push('Entrega e retirada');
  }

  if (/\b(pagamento|pagamentos|pix|cartao|cartão|debito|débito|boleto)\b/.test(text)) {
    picks.push('Formas de pagamento');
  }

  if (/\b(garantia|garantias|troca|devolucao|devolução|reembolso|assistencia|assistência)\b/.test(text)) {
    picks.push('Trocas e garantia');
  }

  return [...new Set(picks)];
}

export class CompanyProfileService {
  private cachedContent: string | null = null;
  private cachedSections: Map<string, string> | null = null;

  private async loadSections() {
    if (this.cachedSections) {
      return this.cachedSections;
    }

    if (!this.cachedContent) {
      const filePath = resolveCompanyProfilePath();
      this.cachedContent = await readFile(filePath, 'utf8');
    }

    this.cachedSections = parseSections(this.cachedContent);
    return this.cachedSections;
  }

  async getAnswer(query: string) {
    const sections = await this.loadSections();
    const selectedTitles = pickSectionTitles(query);

    if (!selectedTitles.length) {
      const catalogSection = sections.get('Produtos e categorias');
      const suggestions = catalogSection ? extractCategorySuggestions(catalogSection) : [];
      const suggestionText = suggestions.length
        ? `Posso sugerir ${suggestions.join(', ')}.`
        : 'Posso sugerir categorias como Smartphones, Notebooks ou Acessórios.';

      return [
        'Claro! Não encontrei um produto específico.',
        `${suggestionText} Se quiser, me diga marca, faixa de preço ou condição para eu refinar a busca.`,
      ].join(' ');
    }

    const parts = selectedTitles
      .map((title) => {
        const section = sections.get(title);
        return section ? `${title}\n${section}` : null;
      })
      .filter((value): value is string => Boolean(value));

    return [
      'Claro! Aqui estão as informações da Mercadex:',
      ...parts,
    ].join('\n\n');
  }
}

export const companyProfileService = new CompanyProfileService();
