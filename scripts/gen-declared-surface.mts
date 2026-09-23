/**
 * 선언된 표면 뽑기 — 장부의 주장을 맞댈 사실.
 *
 * 실행: pnpm surface:gen
 *
 * ## 왜
 *
 * 간극 장부(`tasks/topic-gaps/LEDGER.md`)의 「화면이 하는 것」은 사람이 조각 소스를
 * 읽어 쓴 것이다. 그 읽기가 틀리면 아무도 모른 채 주제 설명이 좁아진다. 실제로
 * `refrigerator-heat-pump` 에서 한 번 틀렸다 — 조각 NOTES 가 적어 둔 「못 한다」를
 * 사실로 옮겼는데, 선언을 열어 보니 스테이지가 이미 자기 label 을 갖고 있었다.
 *
 * 그래서 **다시 읽지 않고 기계가 뽑는다.** 화면에 뜨는 문자는 모두 선언된 문안 키를
 * 지나므로(C1), 「화면이 X 를 말하지 않는다」는 키 목록으로 판정된다.
 *
 * ## 이 보고서가 잡는 것과 못 잡는 것
 *
 * - 잡는다 — 화면에 무엇이 있고 없는가 (문안 · 조작기 · 노드 종류 · 스테이지 · 뷰)
 * - **못 잡는다** — 화면이 무슨 주장을 하는가(해석), 무엇을 더 할 수 있는가(가능성),
 *   그리고 실제로 그려진 결과(색 · 배치 · 읽힘). 앞의 둘은 사람이, 마지막은 눈이 본다
 *
 * ## 거짓 경보를 내지 않기 위해
 *
 * 조작기는 `schema.ts` 가 아니라 `controllers.ts` 에 있는 조각이 많다. 한 곳만 보고
 * 「조작기 없음」이라 적으면 장부가 맞는데 검사가 틀린 꼴이 된다 — 한 번 겪었다.
 * 그래서 **읽지 못한 자리는 「없음」이 아니라 「파싱 실패」로 적는다.**
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'tasks/topic-gaps/SURFACE.md');

type Topic = { id: string; name: string; sim?: string; domain: string };

const topics = (
  parse(readFileSync(join(ROOT, 'docs/topics/topics.yaml'), 'utf8')) as { topics: Topic[] }
).topics;

/** 장부가 다루는 주제만 뽑는다 — 441개 전부를 늘어놓으면 읽히지 않는다. */
const ledger = readFileSync(join(ROOT, 'tasks/topic-gaps/LEDGER.md'), 'utf8');
const rows = [...ledger.matchAll(/^### (T\d+) · `([^`]+)`/gm)].map((m) => ({ t: m[1], topic: m[2] }));

function simDir(simId: string): string | null {
  const name = simId.replace(/^aperi21:/, '');
  for (const cat of readdirSync(join(ROOT, 'sims'))) {
    const d = join(ROOT, 'sims', cat, name);
    if (existsSync(join(d, 'src'))) return d;
  }
  return null;
}

function readSrc(dir: string, file: string): string | null {
  const p = join(dir, 'src', file);
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
}

/** 문안 키와 ko 원문. 없으면 null(파싱 실패)과 빈 표를 가른다. */
function messages(schema: string): Map<string, string> | null | 'none' {
  // 문안 선언이 아예 없는 구세대 조각이 있다. 「못 읽었다」와 가른다 — 그쪽은 화면
  // 문자가 C1 3층 조회를 지나지 않는다는 뜻이고, 그 자체가 보고할 사실이다.
  if (!/LocalizedText/.test(schema)) return 'none';
  if (!/satisfies Record<string, LocalizedText>|defineMessages\(/.test(schema)) return null;
  const out = new Map<string, string>();
  for (const m of schema.matchAll(/'([a-z][\w]*\.[\w.]+)':\s*\{\s*ko:\s*'((?:[^'\\]|\\.)*)'/g)) {
    out.set(m[1], m[2]);
  }
  return out;
}

function controllers(dir: string, schema: string): string[] | null {
  const own = readSrc(dir, 'controllers.ts');
  const text = own ?? schema;
  // 조작기가 없는 조각이 많다 — 자동 진행만 한다. 빈 배열 선언을 눈으로 확인한
  // 경우에만 「없음」이라 적고, 그 밖에 못 읽은 자리는 파싱 실패로 남긴다.
  if (/controllers:\s*readonly ControllerSpec\[\]\s*=\s*\[\s*\]/.test(text)) return [];
  const blocks = [...text.matchAll(/\{\s*id:\s*'([^']+)',\s*type:\s*'([^']+)'([\s\S]{0,200}?)\}/g)];
  if (blocks.length === 0) {
    if (/parameters:\s*\[\s*\]/.test(schema) && own === null) return [];
    return null;
  }
  return blocks.map((b) => {
    const range = /range:\s*\[([^\]]+)\]/.exec(b[3]);
    return `${b[1]}(${b[2]}${range ? ` ${range[1].replace(/\s+/g, '')}` : ''})`;
  });
}

function nodeKinds(dir: string): string[] {
  const kinds = new Set<string>();
  for (const f of readdirSync(join(dir, 'src'))) {
    if (!f.endsWith('.ts')) continue;
    const t = readFileSync(join(dir, 'src', f), 'utf8');
    for (const m of t.matchAll(/type:\s*'([a-zA-Z]+)'/g)) kinds.add(m[1]);
  }
  return [...kinds].sort();
}

function listOf(schema: string, field: 'stages' | 'views'): string[] {
  const re = new RegExp(`${field}:\\s*\\[([\\s\\S]*?)\\n  \\]|${field}:\\s*\\[([^\\]]*)\\]`);
  const m = re.exec(schema);
  if (!m) return [];
  return [...(m[1] ?? m[2] ?? '').matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]);
}

function timeline(schema: string): string[] {
  return [...schema.matchAll(/\{\s*id:\s*'([^']+)',\s*duration:[^}]*?caption:\s*key\('([^']+)'\)/g)].map(
    (m) => `${m[1]}→${m[2]}`,
  );
}

const lines = [
  '# 선언된 표면 — 장부의 주장을 맞댈 사실',
  '',
  '자동 생성 — 직접 편집하지 말 것. 생성: `pnpm surface:gen` (scripts/gen-declared-surface.mts).',
  '',
  '`LEDGER.md` 의 「화면이 하는 것」은 **사람이 읽어 쓴 것**이고, 여기 있는 것은',
  '**기계가 선언에서 뽑은 것**이다. 둘을 나란히 놓고 어긋나는 데를 찾는다.',
  '',
  '화면에 뜨는 문자는 모두 선언된 문안 키를 지나므로(C1), 「화면이 X 를 말하지 않는다」는',
  '키 목록으로 판정된다. **못 잡는 것** — 화면이 무슨 주장을 하는가(해석), 무엇을 더',
  '할 수 있는가(가능성), 실제로 그려진 결과(색 · 배치 · 읽힘).',
  '',
  '`파싱 실패` 는 「없다」가 아니라 **못 읽었다**는 뜻이다. 그 자리는 사람이 연다.',
  '',
];

let failures = 0;
let legacy = 0;
for (const { t, topic } of rows) {
  const meta = topics.find((x) => x.id === topic);
  const dir = meta?.sim ? simDir(meta.sim) : null;
  lines.push(`### ${t} · \`${topic}\``, '');
  if (!dir) {
    lines.push(`- 조각을 찾지 못했다 (${meta?.sim ?? 'sim 없음'}) — **파싱 실패**`, '');
    failures++;
    continue;
  }
  const schema = readSrc(dir, 'schema.ts');
  if (!schema) {
    lines.push(`- \`${dir.replace(`${ROOT}/`, '')}\` 에 schema.ts 가 없다 — **파싱 실패**`, '');
    failures++;
    continue;
  }
  const msgs = messages(schema);
  const ctrls = controllers(dir, schema);
  lines.push(`- 조각 — \`${meta?.sim}\` · \`${dir.replace(`${ROOT}/`, '')}\``);
  if (msgs === 'none') {
    lines.push('- 문안 — **선언 없음.** 화면 문자가 C1 3층 조회를 지나지 않는 구세대 조각이다');
    legacy++;
  } else if (msgs === null) {
    lines.push('- 문안 — **파싱 실패** (messages 선언을 찾지 못했다)');
    failures++;
  } else if (msgs.size === 0) {
    lines.push('- 문안 — **키 0건.** 화면 문자가 있다면 C1 을 지나지 않는 것이다');
  } else {
    lines.push(`- 문안 ${msgs.size}건`);
    for (const [k, v] of msgs) lines.push(`  - \`${k}\` — ${v}`);
  }
  lines.push(
    ctrls === null
      ? '- 조작기 — **파싱 실패**'
      : `- 조작기 — ${ctrls.length === 0 ? '없음 (자동 진행)' : ctrls.join(' · ')}`,
  );
  if (ctrls === null) failures++;
  const stages = listOf(schema, 'stages');
  const views = listOf(schema, 'views');
  const tl = timeline(schema);
  lines.push(`- 스테이지 — ${stages.length ? stages.join(' · ') : '없음'}`);
  lines.push(`- 뷰 — ${views.length ? views.join(' · ') : '없음'}`);
  lines.push(`- 시간표 — ${tl.length ? tl.join(' · ') : '없음'}`);
  lines.push(`- 노드 종류 — ${nodeKinds(dir).join(' · ')}`, '');
}

lines.splice(
  12,
  0,
  `대상 ${rows.length}건 · 파싱 실패 ${failures}건 · 문안 선언이 없는 구세대 조각 ${legacy}건.`,
  '',
);

writeFileSync(OUT, lines.join('\n'), 'utf8');
process.stdout.write(
  `[surface] ${rows.length}건 → tasks/topic-gaps/SURFACE.md · 파싱 실패 ${failures}건 · 구세대 ${legacy}건\n`,
);
