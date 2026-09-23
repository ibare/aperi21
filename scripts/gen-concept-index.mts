/**
 * 개념 선언 목록 생성기.
 *
 * 실행: pnpm concept:index
 *
 * `packages/authoring/src/concepts/<id>.ts` 를 훑어 `index.ts` 의 `CONCEPT_SOURCES`
 * 를 다시 쓴다. 손으로 유지하지 않는 이유는 **배치 때문이다** — 여러 에이전트가
 * 동시에 개념을 쓰면 목록 파일 한 곳에 모두 손대게 되고, 그 자리가 충돌 지점이 된다.
 * 각자 자기 파일만 쓰고 목록은 여기서 만든다.
 *
 * 파일마다 개념 선언 **하나**를 export 한다. 이름은 상관없고(`<id>Concept` 관행),
 * export 가 둘 이상이거나 없으면 이름을 지목해 멈춘다 — 조용히 하나를 고르면 등록되지
 * 않은 개념이 파일로만 남는다.
 *
 * 순서는 파일 이름순이다. 공개 조회가 이 순서를 그대로 내보낸다.
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(repoRoot, 'packages/authoring/src/concepts');

const EXPORT = /^export const ([A-Za-z0-9_]+)\s*:\s*Aperi21ConceptSource\b/gm;

const entries: { file: string; symbol: string }[] = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts') && f !== 'index.ts').sort()) {
  const symbols = [...readFileSync(join(dir, file), 'utf8').matchAll(EXPORT)].map((m) => m[1]!);
  if (symbols.length !== 1) {
    throw new Error(
      `concepts/${file}: Aperi21ConceptSource export 가 ${symbols.length}개다 (정확히 하나여야 한다)`,
    );
  }
  entries.push({ file: file.replace(/\.ts$/, ''), symbol: symbols[0]! });
}

const text = [
  '/**',
  ' * 개념 선언 목록 — 자동 생성. 직접 편집하지 말 것.',
  ' *',
  ' * 생성: pnpm concept:index  (scripts/gen-concept-index.mts)',
  ' * 출처: concepts/<id>.ts 의 Aperi21ConceptSource export.',
  ' *',
  ' * 선언 순서(파일 이름순)가 공개 조회의 순서다.',
  ' */',
  '',
  "import type { Aperi21ConceptSource } from '../concept-types.js';",
  ...entries.map((e) => `import { ${e.symbol} } from './${e.file}.js';`),
  '',
  'export const CONCEPT_SOURCES: readonly Aperi21ConceptSource[] = [',
  ...entries.map((e) => `  ${e.symbol},`),
  '];',
  '',
].join('\n');

writeFileSync(join(dir, 'index.ts'), text, 'utf8');
process.stdout.write(`[concept] ${entries.length}개 → packages/authoring/src/concepts/index.ts\n`);
