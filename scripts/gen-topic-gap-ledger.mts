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
const byDomain = new Map<string, number>();
for (const r of rows) byDomain.set(domainOf.get(r.topic)!, (byDomain.get(domainOf.get(r.topic)!) ?? 0) + 1);

/** 갈래마다 무엇을 해야 하는지. 읽는 사람이 목록을 보기 전에 알아야 한다. */
const KIND_NOTE: Record<string, string> = {
  조각: '조각이 덜 보여 준다 — **조각을 보강한다.** 보강하면 그 개념 메타를 다시 쓴다(definitionHash 가 바뀌어 호스트가 그 개념만 다시 임베딩한다).',
  엔진: '덜 보여 준 까닭이 엔진 어휘다 — `tasks/engine-requirements/gap-ledger.md`(G) 로 넘긴다.',
  설명: '주제 설명이 실제보다 넓거나 어긋난다 — **`docs/topics/topics.yaml` 의 `desc` · `visualNote` 를 화면에 맞춘다.**',
};

/** 손이 가는 순서 — 조각이 가장 무겁고, 설명이 가장 가볍다. */
const KIND_ORDER = ['조각', '엔진', '설명'];

const id = (i: number) => `T${String(i + 1).padStart(2, '0')}`;
const idOf = new Map(rows.map((r, i) => [r, id(i)]));

const lines = [
  '# 주제 ↔ 조각 간극 장부',
  '',
  '자동 생성 — 직접 편집하지 말 것. 원본은 `entries/<분과>-<n>.md`, 규약은 `README.md`.',
  '',
  `생성: \`pnpm gap:ledger\` · **전체 ${rows.length}건** — 조각 ${byKind('조각')} · 엔진 ${byKind('엔진')} · 설명 ${byKind('설명')}`,
  '',
  '갈래는 쓴 사람이 본 **가장 그럴듯한 것**이고 판정이 아니다. 한 건씩 읽고 사람이 정한다.',
  '',
  '분과별: ' +
    topics.domains
      .filter((d) => byDomain.has(d.id))
      .map((d) => `${d.id} ${byDomain.get(d.id)}`)
      .join(' · '),
  '',
  '## 한눈에',
  '',
  '| id | 분과 | 주제 | 갈래 |',
  '|---|---|---|---|',
  ...rows.map((r) => `| [${idOf.get(r)}](#${idOf.get(r)!.toLowerCase()}) | ${domainOf.get(r.topic)} | \`${r.topic}\` | ${r.kind} |`),
  '',
];

for (const kind of KIND_ORDER) {
  const ofKind = rows.filter((r) => r.kind === kind);
  if (ofKind.length === 0) continue;
  lines.push(`## ${kind} — ${ofKind.length}건`, '', KIND_NOTE[kind] ?? '', '');
  for (const r of ofKind) {
    lines.push(
      `### ${idOf.get(r)} · \`${r.topic}\``,
      '',
      `\`${domainOf.get(r.topic)}\` · 원본 \`entries/${r.file}\``,
      '',
      `- **주제가 약속한 것** — ${r.promised}`,
      `- **화면이 하는 것** — ${r.screen}`,
      `- **개념에서 처리한 방식** — ${r.handled}`,
      '',
    );
  }
}

writeFileSync(out, lines.join('\n'), 'utf8');
process.stdout.write(`[gap] ${rows.length}건 → tasks/topic-gaps/LEDGER.md\n`);
