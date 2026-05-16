#!/usr/bin/env node
/**
 * Gera o corpo do comentário de PR com métricas de cobertura Jest.
 *
 * Uso:
 *   node generate-comment.js \
 *     --summary=<path>/coverage-summary.json \
 *     --uncovered=<path>/uncovered.json \
 *     --project=frontend|backend \
 *     --outcome=success|failure \
 *     --run-id=<github_run_id> \
 *     --output=<path>/comment.md
 */
'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const result = {};
  for (const arg of argv) {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    result[key] = rest.join('=');
  }
  return result;
}

function readJsonSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch {
    // arquivo inválido ou ausente — retorna null para tratamento explícito
  }
  return null;
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Formatação de cobertura
// ---------------------------------------------------------------------------

const THRESHOLD = 80;

function formatPct(metric) {
  if (!metric || metric.pct == null) return '`N/A`';
  const pct = Number(metric.pct.toFixed(2));
  const ok = pct >= THRESHOLD;
  const icon = ok ? '✅' : '❌';
  return `${icon} **${pct}%**`;
}

function coverageRow(label, metric) {
  if (!metric || metric.pct == null) {
    return `| ${label} | \`N/A\` | 80% | — |`;
  }
  const pct = Number(metric.pct.toFixed(2));
  const delta = ''; // delta vs. anterior seria necessário armazenar histórico
  const ok = pct >= THRESHOLD ? '✅' : '❌';
  return `| ${label} | ${ok} ${pct}% | 80% | ${metric.covered}/${metric.total} |`;
}

// ---------------------------------------------------------------------------
// Seção de funções sem cobertura
// ---------------------------------------------------------------------------

function buildUncoveredSection(uncovered) {
  if (!Array.isArray(uncovered) || uncovered.length === 0) return '';

  const rows = uncovered
    .map(item => `| \`${item.file}\` | \`${item.name}\` | ${item.line} |`)
    .join('\n');

  return `
### ⚠️ Novos Métodos Sem Cobertura

> Estas funções foram adicionadas neste PR mas **não possuem testes**.
> Isso **não bloqueia** o merge automaticamente — apenas a cobertura global abaixo de 80% bloqueia.

| Arquivo | Função / Método | Linha |
|---------|----------------|-------|
${rows}

`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const args = parseArgs(process.argv.slice(2));
const summaryPath = args['summary'];
const uncoveredPath = args['uncovered'];
const project = args['project'] || 'frontend';
const outcome = args['outcome'] || 'failure';
const runId = args['run-id'] || '';
const outputPath = args['output'];

if (!outputPath) {
  console.error('❌ --output é obrigatório');
  process.exit(1);
}

const summary = readJsonSafe(summaryPath);
const uncovered = readJsonSafe(uncoveredPath) || [];

const total = summary?.total ?? {};
const passed = outcome === 'success';
const projectEmoji = project === 'frontend' ? '🎨' : '⚙️';
const projectLabel = project === 'frontend' ? 'Frontend' : 'Backend';
const statusBadge = passed
  ? '✅ **Passou** — cobertura ≥ 80%'
  : '❌ **Falhou** — cobertura abaixo de 80%';

const repo = process.env.GITHUB_REPOSITORY || 'owner/repo';
const runUrl = runId
  ? `https://github.com/${repo}/actions/runs/${runId}`
  : '';
const artifactName = `coverage-report-${project}`;

const body = `<!-- ci-${project}-coverage -->
## ${projectEmoji} ${projectLabel} — Cobertura de Testes

${statusBadge}

${total.lines ? `> Execução: [#${runId}](${runUrl})` : '> Dados de cobertura indisponíveis (possível falha anterior à geração do relatório).'}

| Métrica | Resultado | Threshold | Coberto/Total |
|---------|-----------|-----------|---------------|
${coverageRow('Statements', total.statements)}
${coverageRow('Branches', total.branches)}
${coverageRow('Functions', total.functions)}
${coverageRow('Lines', total.lines)}

${buildUncoveredSection(uncovered)}
---
📦 Relatório HTML: acesse **[${artifactName}](${runUrl})** nos Artefatos desta execução (disponível por 14 dias).
`;

ensureDir(outputPath);
fs.writeFileSync(outputPath, body, 'utf8');
console.log(`✅ Comentário gerado em: ${outputPath}`);
