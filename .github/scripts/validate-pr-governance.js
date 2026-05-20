#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

function readEventPayload() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    throw new Error('GITHUB_EVENT_PATH nao encontrado.');
  }

  return JSON.parse(fs.readFileSync(eventPath, 'utf8'));
}

function getPrData(payload) {
  const pr = payload.pull_request;
  if (!pr) {
    throw new Error('Evento atual nao possui pull_request.');
  }

  return {
    body: String(pr.body || ''),
    baseSha: String(pr.base?.sha || '').trim(),
    headSha: String(pr.head?.sha || '').trim(),
  };
}

function validatePrTemplateBody(body) {
  const errors = [];

  const requiredHeadings = [
    '## Summary',
    '## Context',
    '## Scope',
    '## What changed',
    '## ADR Alignment',
    '## Validation',
    '## Risks',
  ];

  for (const heading of requiredHeadings) {
    if (!body.includes(heading)) {
      errors.push(`Secao obrigatoria ausente: "${heading}"`);
    }
  }

  const criticalEmptyPatterns = [
    /- Included:\s*\n- Excluded:/m,
    /- Main risks:\s*\n- Mitigations:/m,
    /^Commands executed:\s*\n\s*```\s*\n\s*# paste commands here \(for example\)/m,
  ];

  for (const pattern of criticalEmptyPatterns) {
    if (pattern.test(body)) {
      errors.push('Campos criticos do template estao sem preenchimento completo.');
      break;
    }
  }

  if (body.length < 250) {
    errors.push('Descricao da PR muito curta. Preencha contexto, escopo, validacao e riscos.');
  }

  return errors;
}

function getCommitSubjects(baseSha, headSha) {
  if (!baseSha || !headSha) {
    throw new Error('Nao foi possivel determinar base/head sha da PR.');
  }

  const output = execSync(`git log --format=%s ${baseSha}..${headSha}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function validateCommitMessages(subjects) {
  const errors = [];

  const semanticPattern = /^(feat|fix|docs|refactor|test|chore|build|ci|perf)(\([a-z0-9._\/-]+\))?: .+/;

  const invalidSubjects = subjects.filter((subject) => {
    if (subject.startsWith('Merge ')) return false;
    if (subject.startsWith('Revert "')) return false;
    return !semanticPattern.test(subject);
  });

  if (invalidSubjects.length > 0) {
    errors.push(
      `Commits fora do padrao semantic commit: ${invalidSubjects
        .map((s) => `"${s}"`)
        .join(', ')}`,
    );
  }

  return errors;
}

function main() {
  const payload = readEventPayload();
  const { body, baseSha, headSha } = getPrData(payload);

  const templateErrors = validatePrTemplateBody(body);
  const commitSubjects = getCommitSubjects(baseSha, headSha);
  const commitErrors = validateCommitMessages(commitSubjects);

  const allErrors = [...templateErrors, ...commitErrors];

  if (allErrors.length > 0) {
    for (const message of allErrors) {
      console.error(`::error title=Governanca de PR::${message}`);
    }
    process.exit(1);
  }

  console.log('Governanca de PR validada com sucesso.');
}

main();
