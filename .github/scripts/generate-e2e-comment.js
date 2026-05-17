#!/usr/bin/env node
/**
 * Gera o resumo de cobertura E2E (Playwright) para o Job Summary e comentário de PR.
 *
 * Uso:
 *   node generate-e2e-comment.js \
 *     --results=<path>/playwright-report/results.json \
 *     --project=frontend \
 *     --outcome=success|failure \
 *     --run-id=<github_run_id> \
 *     --output=<path>/e2e-comment.md
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
    // arquivo ausente ou corrompido
  }
  return null;
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function fmtDuration(ms) {
  if (ms == null || ms < 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ---------------------------------------------------------------------------
// Extração de suites e specs do relatório Playwright
// ---------------------------------------------------------------------------

/**
 * Percorre a árvore de suites do JSON do Playwright e coleta dados por arquivo.
 * @param {object[]} suites - raiz de `report.suites`
 * @returns {{ file: string, total: number, passed: number, failed: number, skipped: number, flaky: number, duration: number }[]}
 */
function collectSuites(suites) {
  const byFile = {};

  function walk(suite, currentFile) {
    const file = suite.file || currentFile || suite.title || '(desconhecido)';

    if (!byFile[file]) {
      byFile[file] = { file, total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0, duration: 0 };
    }

    for (const spec of suite.specs ?? []) {
      byFile[file].total++;
      let specPassed = false;
      let specFailed = false;
      let specSkipped = false;
      let specFlaky = false;
      let specDuration = 0;

      for (const test of spec.tests ?? []) {
        specDuration += test.duration ?? 0;
        // status: "expected" | "unexpected" | "skipped" | "flaky"
        if (test.status === 'expected') specPassed = true;
        if (test.status === 'unexpected') specFailed = true;
        if (test.status === 'skipped') specSkipped = true;
        if (test.status === 'flaky') specFlaky = true;
      }

      byFile[file].duration += specDuration;
      if (specFlaky) byFile[file].flaky++;
      else if (specFailed) byFile[file].failed++;
      else if (specSkipped) byFile[file].skipped++;
      else if (specPassed) byFile[file].passed++;
    }

    for (const child of suite.suites ?? []) {
      walk(child, file);
    }
  }

  for (const suite of suites ?? []) {
    walk(suite, suite.file || suite.title);
  }

  return Object.values(byFile);
}

// ---------------------------------------------------------------------------
// Montagem do markdown
// ---------------------------------------------------------------------------

function buildReport(results, project, outcome, runId) {
  const repo = process.env.GITHUB_REPOSITORY || 'owner/repo';
  const runUrl = runId ? `https://github.com/${repo}/actions/runs/${runId}` : '';
  const artifactName = `playwright-report-${project}`;
  const projectLabel = project === 'frontend' ? 'Frontend' : 'Backend';

  // Dados globais de stats (campo `stats` do JSON do Playwright)
  const stats = results?.stats ?? {};
  const expected   = stats.expected   ?? 0;
  const unexpected = stats.unexpected ?? 0;
  const skipped    = stats.skipped    ?? 0;
  const flaky      = stats.flaky      ?? 0;
  const total      = expected + unexpected + skipped + flaky;
  const durationMs = stats.duration   ?? 0;

  const passed = outcome === 'success';
  const statusBadge = passed
    ? '✅ **Passou** — todos os testes E2E concluídos com sucesso'
    : '❌ **Falhou** — um ou mais testes E2E falharam';

  // Linha de totais globais
  const totalsRow =
    `| **Total** | **${total}** | **${expected}** | ` +
    `**${unexpected}** | **${skipped}** | **${flaky}** | **${fmtDuration(durationMs)}** |`;

  // Linhas por arquivo de spec
  const suites = collectSuites(results?.suites ?? []);
  const suiteRows = suites.length
    ? suites
        .map(s => {
          const fileShort = s.file.replace(/^tests\/e2e\//, '');
          const flakyCol = s.flaky > 0 ? `⚠️ ${s.flaky}` : '—';
          return (
            `| \`${fileShort}\` | ${s.total} | ${s.passed} | ` +
            `${s.failed} | ${s.skipped} | ${flakyCol} | ${fmtDuration(s.duration)} |`
          );
        })
        .join('\n')
    : '| — | — | — | — | — | — | — |';

  // Seção de erros (se houver)
  let errorsSection = '';
  const errors = results?.errors ?? [];
  if (errors.length > 0) {
    const errorList = errors
      .slice(0, 5)
      .map(e => `- \`${e.message ?? JSON.stringify(e)}\``)
      .join('\n');
    const extra = errors.length > 5 ? `\n_… e mais ${errors.length - 5} erros._` : '';
    errorsSection = `\n### ❌ Erros de execução\n\n${errorList}${extra}\n`;
  }

  return `<!-- ci-${project}-e2e -->
## 🎭 ${projectLabel} — Testes E2E (Playwright)

${statusBadge}

${runUrl ? `> Execução: [#${runId}](${runUrl})` : '> Dados de execução indisponíveis.'}

| Arquivo de spec | Testes | ✅ Passou | ❌ Falhou | ⏭️ Pulado | ⚠️ Flaky | Duração |
|-----------------|-------:|----------:|----------:|----------:|----------:|---------|
${suiteRows}
${totalsRow}
${errorsSection}
---
📦 Relatório HTML: acesse **[${artifactName}](${runUrl})** nos Artefatos desta execução (disponível por 7 dias).
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const args = parseArgs(process.argv.slice(2));
const resultsPath = args['results'];
const project     = args['project']  || 'frontend';
const outcome     = args['outcome']  || 'failure';
const runId       = args['run-id']   || '';
const outputPath  = args['output'];

if (!outputPath) {
  console.error('❌ --output é obrigatório');
  process.exit(1);
}

const results = readJsonSafe(resultsPath);
if (!results) {
  console.warn(`⚠️  results.json não encontrado em: ${resultsPath}`);
}

const body = buildReport(results, project, outcome, runId);
ensureDir(outputPath);
fs.writeFileSync(outputPath, body, 'utf8');
console.log(`✅ Relatório E2E gerado em: ${outputPath}`);
