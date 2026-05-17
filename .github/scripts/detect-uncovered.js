#!/usr/bin/env node
/**
 * Detecta funções adicionadas no PR que não possuem cobertura de testes.
 *
 * Estratégia:
 *   1. Obtém os arquivos TypeScript alterados via `git diff --name-only origin/BASE...HEAD`
 *   2. Lê coverage-final.json gerado pelo Jest (formato Istanbul)
 *   3. Para cada arquivo alterado, identifica funções com contador de execução = 0
 *   4. Filtra apenas funções cujas linhas foram adicionadas no diff do PR
 *
 * Uso:
 *   node detect-uncovered.js \
 *     --coverage=<path>/coverage-final.json \
 *     --base=develop \
 *     --project=frontend|backend \
 *     --output=<path>/uncovered.json
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Obter arquivos TypeScript alterados no PR
// ---------------------------------------------------------------------------

function getChangedFiles(base) {
  const ref = `origin/${base}`;
  const raw = exec(`git diff --name-only ${ref}...HEAD`);
  if (!raw) return [];
  return raw
    .split('\n')
    .map(f => f.trim())
    .filter(f => /\.(ts|tsx)$/.test(f) && !f.endsWith('.test.ts') && !f.endsWith('.test.tsx') && !f.endsWith('.d.ts'));
}

// ---------------------------------------------------------------------------
// Obter linhas adicionadas no diff para um arquivo específico
// ---------------------------------------------------------------------------

function getAddedLines(base, filePath) {
  const ref = `origin/${base}`;
  const diff = exec(`git diff ${ref}...HEAD -- "${filePath}"`);
  const added = new Set();
  let currentLine = 0;
  for (const line of diff.split('\n')) {
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      currentLine = parseInt(hunkMatch[1], 10);
      continue;
    }
    if (line.startsWith('+') && !line.startsWith('+++')) {
      added.add(currentLine);
      currentLine++;
    } else if (!line.startsWith('-')) {
      currentLine++;
    }
  }
  return added;
}

// ---------------------------------------------------------------------------
// Extrair funções sem cobertura de um arquivo no coverage-final.json
// ---------------------------------------------------------------------------

function getUncoveredFunctions(coverageEntry, relativeFilePath, addedLines) {
  const uncovered = [];
  const fnMap = coverageEntry.fnMap || {};
  const fnCounts = coverageEntry.f || {};

  for (const [id, count] of Object.entries(fnCounts)) {
    if (count !== 0) continue;

    const fnInfo = fnMap[id];
    if (!fnInfo) continue;

    const declLine = fnInfo.decl?.start?.line ?? fnInfo.loc?.start?.line ?? 0;

    // Reporta se a função foi adicionada neste PR (linha no diff) ou se
    // addedLines está vazio (push sem contexto de PR — reporta todos descobertos).
    if (addedLines.size > 0 && !addedLines.has(declLine)) continue;

    uncovered.push({
      file: relativeFilePath,
      name: fnInfo.name || '(anônima)',
      line: declLine,
      type: 'function',
    });
  }

  return uncovered;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const args = parseArgs(process.argv.slice(2));
const coveragePath = args['coverage'];
const base = args['base'] || 'develop';
const project = args['project'] || 'frontend';
const outputPath = args['output'];

if (!outputPath) {
  console.error('❌ --output é obrigatório');
  process.exit(1);
}

const coverage = readJsonSafe(coveragePath);
if (!coverage) {
  console.warn(`⚠️  coverage-final.json não encontrado em: ${coveragePath}`);
  ensureDir(outputPath);
  fs.writeFileSync(outputPath, '[]', 'utf8');
  process.exit(0);
}

const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
const changedFiles = getChangedFiles(base);

if (changedFiles.length === 0) {
  console.info('ℹ️  Nenhum arquivo TypeScript alterado detectado.');
  ensureDir(outputPath);
  fs.writeFileSync(outputPath, '[]', 'utf8');
  process.exit(0);
}

const results = [];

for (const relFile of changedFiles) {
  // coverage-final.json usa caminhos absolutos
  const absFile = path.resolve(workspace, relFile);

  const entry = coverage[absFile];
  if (!entry) continue;

  const addedLines = getAddedLines(base, relFile);
  const uncovered = getUncoveredFunctions(entry, relFile, addedLines);
  results.push(...uncovered);
}

ensureDir(outputPath);
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');

if (results.length > 0) {
  console.warn(`⚠️  ${results.length} função(ões) sem cobertura em arquivos alterados no PR [${project}]:`);
  for (const item of results) {
    console.warn(`   • ${item.file}:${item.line} — ${item.name}`);
  }
} else {
  console.info(`✅ Nenhuma função descoberta sem cobertura em arquivos alterados [${project}].`);
}
