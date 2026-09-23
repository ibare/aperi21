/**
 * 주제 ↔ 조각 간극 장부 모으기.
 *
 * 실행: pnpm gap:ledger
 *
 * `tasks/topic-gaps/entries/<분과>-<n>.md` 의 행을 모아 `tasks/topic-gaps/LEDGER.md`
 * 를 만든다. 묶음마다 자기 파일에 쓰게 한 이유는 병렬 배치 때문이다 — 여러 에이전트가
 * 한 장부에 쓰면 거기가 충돌 지점이 된다.
 *
 * 번호(T01…)는 여기서 붙는다. 순서는 `topics.yaml` 의 분과 순서, 그 안에서 주제 순서라
 * 다시 모아도 같은 번호가 나온다. 규약은 `tasks/topic-gaps/README.md`.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const entriesDir = join(repoRoot, 'tasks/topic-gaps/entries');
const out = join(repoRoot, 'tasks/topic-gaps/LEDGER.md');

const KIND = new Set(['설명', '조각', '엔진']);

type Row = { topic: string; promised: string; screen: string; handled: string; kind: string; file: string };

const topics = parse(readFileSync(join(repoRoot, 'docs/topics/topics.yaml'), 'utf8')) as {
  domains: { id: string }[];
  topics: { id: string; domain: string }[];
};
const order = new Map(topics.topics.map((t, i) => [t.id, i]));
const domainOf = new Map(topics.topics.map((t) => [t.id, t.domain]));

const rows: Row[] = [];
if (existsSync(entriesDir)) {
  for (const file of readdirSync(entriesDir).filter((f) => f.endsWith('.md')).sort()) {
    const text = readFileSync(join(entriesDir, file), 'utf8');
    for (const line of text.split('\n')) {
      const t = line.trim();
      if (!t.startsWith('|') || /^\|\s*-{2,}/.test(t)) continue;
      const cells = t.slice(1, t.endsWith('|') ? -1 : undefined).split('|').map((c) => c.trim());
      if (cells.length !== 5) throw new Error(`${file}: 칸이 ${cells.length}개다 (5개여야 한다)\n  ${t}`);
      const [topic, promised, screen, handled, kind] = cells as [string, string, string, string, string];
      if (topic === '주제' || topic === '') continue; // 머리글 행
      if (!order.has(topic)) throw new Error(`${file}: topics.yaml 에 없는 주제 '${topic}'`);
      if (!KIND.has(kind)) throw new Error(`${file}: 갈래가 '${kind}' 다 (설명 · 조각 · 엔진 중 하나)`);
      rows.push({ topic, promised, screen, handled, kind, file });
    }
  }
}

rows.sort((a, b) => (order.get(a.topic) ?? 0) - (order.get(b.topic) ?? 0));

const byKind = (k: string) => rows.filter((r) => r.kind === k).length;
const lines = [
  '# 주제 ↔ 조각 간극 장부',
  '',
  '자동 생성 — 직접 편집하지 말 것. 원본은 `entries/<분과>-<n>.md`, 규약은 `README.md`.',
  '',
  `생성: pnpm gap:ledger · 전체 ${rows.length}건 (설명 ${byKind('설명')} · 조각 ${byKind('조각')} · 엔진 ${byKind('엔진')})`,
  '',
  '갈래는 쓰는 사람이 본 **가장 그럴듯한 것**이고 판정이 아니다. 한 건씩 읽고 사람이 정한다.',
  '',
  '| id | 분과 | 주제 | 주제가 약속한 것 | 화면이 하는 것 | 개념에서 처리한 방식 | 갈래 |',
  '|---|---|---|---|---|---|---|',
  ...rows.map((r, i) => {
    const id = `T${String(i + 1).padStart(2, '0')}`;
    return `| ${id} | ${domainOf.get(r.topic)} | \`${r.topic}\` | ${r.promised} | ${r.screen} | ${r.handled} | ${r.kind} |`;
  }),
  '',
];

writeFileSync(out, lines.join('\n'), 'utf8');
process.stdout.write(`[gap] ${rows.length}건 → tasks/topic-gaps/LEDGER.md\n`);
