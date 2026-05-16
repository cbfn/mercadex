#!/usr/bin/env node
/**
 * Atualiza RELATORIO_TESTES.md com entrada gerada automaticamente pelo CI.
 *
 * Uma nova seção é inserida no início do arquivo (após o título H1, se existir)
 * para que o histórico mais recente apareça primeiro.
 *
 * Uso:
 *   node update-report.js \
 *     --summary=<path>/coverage-summary.json \
 *     --report=<path>/RELATORIO_TESTES.md \
 *     --project=frontend|backend \
 *     --outcome=success|failure \
 *     --run-url=https://github.com/.../actions/runs/123
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
    // arquivo corrompido ou ausente
  }
  return null;
}

function formatPct(metric) {
  if (!metric || metric.pct == null) return 'N/A';
  return `${Number(metric.pct.toFixed(2))}%`;
}

function statusIcon(outcome) {
  return outcome === 'success' ? '✅ sucesso' : '❌ falha';
}

// ---------------------------------------------------------------------------
// Gerar nova entrada de CI
// ---------------------------------------------------------------------------

function buildEntry(summary, project, outcome, runUrl, timestamp) {
  const total = summary?.total ?? {};
  const projectLabel = project === 'frontend' ? 'Frontend' : 'Backend';

  // Cobertura global: usamos "lines" como métrica principal resumida
  const overallPct = total.lines?.pct != null
    ? `${Number(total.lines.pct.toFixed(2))}%`
    : 'N/A';

  const totalTests = total.statements?.total != null
    ? String(total.statements.total)
    : 'N/A';

  const runLink = runUrl ? ` — [ver execução](${runUrl})` : '';

  return `
---
<!-- ci-auto-entry-start: ${project} -->
## ${projectLabel} — ${timestamp}${runLink}

- **Cobertura (lines):** ${overallPct}
- **Total de testes (statements):** ${totalTests}
- **Status:** ${statusIcon(outcome)}

| Métrica     | Cobertura | Threshold |
|-------------|-----------|-----------|
| Statements  | ${formatPct(total.statements)} | 80% |
| Branches    | ${formatPct(total.branches)} | 80% |
| Functions   | ${formatPct(total.functions)} | 80% |
| Lines       | ${formatPct(total.lines)} | 80% |

> _Entrada gerada automaticamente pelo CI. Para análise detalhada, veja o artefato \`coverage-report-${project}\`._
<!-- ci-auto-entry-end: ${project} -->
`;
}

// ---------------------------------------------------------------------------
// Inserção no arquivo de relatório
// ---------------------------------------------------------------------------

function insertEntry(reportPath, newEntry, project) {
  let existing = '';
  if (fs.existsSync(reportPath)) {
    existing = fs.readFileSync(reportPath, 'utf8');
  }

  // Remove entrada automática anterior do mesmo projeto (para não acumular)
  const startMarker = `<!-- ci-auto-entry-start: ${project} -->`;
  const endMarker = `<!-- ci-auto-entry-end: ${project} -->`;
  const markerRegex = new RegExp(
    `\\n?---\\n${escapeRegex(startMarker)}[\\s\\S]*?${escapeRegex(endMarker)}\\n?`,
    'g'
  );
  const cleaned = existing.replace(markerRegex, '');

  // Insere após o primeiro título H1 (se existir) ou no início
  const h1Match = cleaned.match(/^(#[^\n]*\n)/);
  let updated;
  if (h1Match) {
    const afterTitle = cleaned.indexOf(h1Match[0]) + h1Match[0].length;
    updated = cleaned.slice(0, afterTitle) + newEntry + cleaned.slice(afterTitle);
  } else {
    updated = newEntry + cleaned;
  }

  const dir = path.dirname(reportPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(reportPath, updated.trimStart() + '\n', 'utf8');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const args = parseArgs(process.argv.slice(2));
const summaryPath = args['summary'];
const reportPath = args['report'];
const project = args['project'] || 'frontend';
const outcome = args['outcome'] || 'failure';
const runUrl = args['run-url'] || '';

if (!reportPath) {
  console.error('❌ --report é obrigatório');
  process.exit(1);
}

const summary = readJsonSafe(summaryPath);
if (!summary) {
  console.warn(`⚠️  coverage-summary.json não encontrado em: ${summaryPath} — relatório não atualizado.`);
  process.exit(0);
}

// Timestamp no fuso UTC para consistência em CI distribuído
const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

const entry = buildEntry(summary, project, outcome, runUrl, timestamp);
insertEntry(reportPath, entry, project);

console.log(`✅ ${reportPath} atualizado com entrada de ${timestamp} [${project}]`);
