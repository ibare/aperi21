/**
 * 개념 선언 감사기.
 *
 * 실행: pnpm concept:audit
 *
 * 로드 시 검증(`validateConcepts`)이 잡는 것은 **구조**다 — id 중복, 없는 sim,
 * 미선언 참조. 여기서 보는 것은 **문장**이라 기계가 판정할 수 없고, 후보를 뽑아
 * 사람에게 보인다. 낱말이 걸렸다고 위반인 것은 아니다.
 *
 * 보는 것 다섯.
 *
 *  1. **definition 이 서로 닮음** — 검색은 definition 으로 후보를 가린다. 이웃 개념의
 *     definition 이 같은 낱말로 덮이면 두 점이 붙어 어느 쪽인지 답할 수 없다.
 *     묶어서 쓰는 이유가 이것이라, 묶음 안에서 갈렸는지를 여기서 다시 잰다.
 *  2. **useWhen 되풀이** — 개념마다 다른 문장이어야 한다. 같은 말이 되풀이되면 분류
 *     필드에 말을 입힌 것이고, 소비자는 그 분류를 알 이유가 없다.
 *  3. **글의 구성에 관여** — "한 문단을 채워라" 류. 우리는 재료를 줄 뿐이다.
 *  4. **내부 어휘 누출** — piece · bundle · sim · aperi21 · renderer 같은 우리 사정.
 *     소비자는 여러 제공자를 함께 다루므로 이쪽 구조를 알 이유가 없다.
 *  5. **빈 필드 · 한국어 혼입** — definition 과 briefing 은 영어 단일이다 (C1 아님,
 *     concept-types.ts 의 규정).
 */

import { getAperi21Concepts } from '../packages/authoring/src/index.js';

const concepts = getAperi21Concepts();
let flagged = 0;

const norm = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** 낱말 겹침 비율. 짧은 쪽 기준이라 한쪽이 길어도 포함 관계를 잡는다. */
function overlap(a: string, b: string): number {
  const STOP = new Set('the a an of in on to and or is are it its that which with by for at as from'.split(' '));
  const words = (s: string) => new Set(norm(s).split(' ').filter((w) => w.length > 2 && !STOP.has(w)));
  const x = words(a);
  const y = words(b);
  let hit = 0;
  for (const w of x) if (y.has(w)) hit += 1;
  return hit / Math.max(1, Math.min(x.size, y.size));
}

function report(kind: string, lines: string[]): void {
  if (lines.length === 0) return;
  flagged += lines.length;
  process.stdout.write(`\n## ${kind} (${lines.length})\n`);
  for (const l of lines) process.stdout.write(`  ${l}\n`);
}

// 1 · 2 — 쌍 비교. 같은 분야 안에서만 본다. 분야가 다르면 낱말이 겹쳐도 검색이 갈린다.
const defs: string[] = [];
const uses: string[] = [];
for (let i = 0; i < concepts.length; i += 1) {
  for (let j = i + 1; j < concepts.length; j += 1) {
    const a = concepts[i]!;
    const b = concepts[j]!;
    if (a.domain !== b.domain) continue;
    const d = overlap(a.surface.definition, b.surface.definition);
    if (d >= 0.6) defs.push(`${a.id} ↔ ${b.id} — definition 낱말 겹침 ${(d * 100) | 0}%`);
    for (const ua of a.briefing.useWhen) {
      for (const ub of b.briefing.useWhen) {
        if (overlap(ua, ub) >= 0.7) uses.push(`${a.id} ↔ ${b.id} — useWhen 되풀이: "${ua.slice(0, 60)}…"`);
      }
    }
  }
}
report('definition 이 이웃과 닮았다 — 검색이 갈리지 않는다', defs);
report('useWhen 이 되풀이된다 — 개념마다 다른 문장이어야 한다', uses);

// 3 — 글의 분량·자리를 가리키는 말. 화면이 세는 것("how many rows")은 분량이 아니므로
// 글의 단위 명사와 붙어 있을 때만 잡는다.
// 'sentence' 를 뺀다 — 화면 캡션을 가리키는 "One sentence stands below" 가 정상 문장인데
// 전부 걸렸다(실측 3건). 글의 분량을 뜻하는 단위는 문단 이상이다.
const UNIT = '(paragraph|section|article|post|chapter|intro|introduction|conclusion)';
// 수량·자리를 매기는 말만 잡는다. "The article has claimed…" 처럼 글을 **가리키는** 것은
// 재료를 주는 정상 문장이라 걸리면 안 된다 (관사·지시사를 넣었다가 정상 문장이 전부
// 걸렸다). 잡는 것은 "one paragraph" 같은 분량과 "the article should" 같은 지시다.
const CONSTRUCTION = new RegExp(
  `\\b(one|two|three|four|five|each|every|per|half|most|several)\\s+${UNIT}\\b` +
    // 작문을 지시하는 동사가 붙을 때만. "The article needs to break the habit" 은 글의
    // 목적을 말하는 정상 문장이라 동사를 가리지 않으면 걸린다(실측 2건).
    `|\\b${UNIT}s?\\s+(should|must|needs? to|has to)\\s+(mention|include|contain|open|close|begin|end|introduce|cover|spend)\\b`,
  'i',
);
const construction: string[] = [];
for (const c of concepts) {
  for (const [field, items] of [
    ['useWhen', c.briefing.useWhen],
    ['observable', c.briefing.observable],
    ['affordances', c.briefing.screen.affordances],
  ] as const) {
    for (const item of items) {
      if (CONSTRUCTION.test(item)) construction.push(`${c.id}.${field}: "${item.slice(0, 70)}…"`);
    }
  }
}
report('글의 구성에 관여한다 — 재료만 준다', construction);

// 4 — 내부 어휘. 소비자가 알 이유가 없는 우리 구조의 말.
// 우리 구조의 말만 남긴다. `piece`(부분) · `stage`(단계)는 평범한 영어로도 쓰여 오검출이
// 여섯 건 났다. 조작기 이름은 두 낱말로 붙어 나오므로 그 꼴로 잡는다 — projectile-range 의
// "Three stage tabs" 가 실제 누출이었다.
const INTERNAL =
  // `bundle of light` 는 평범한 영어다(빛다발). 광학 쪽에서 되풀이될 표현이라 예외로 둔다 —
  // 우리 뜻의 `bundle` 은 뒤에 of 를 달지 않는다.
  /\b(aperi21|renderer|primitive|schema)\b|\bbundles?\b(?! of )|\b(stage|view|param|env) (tabs|panel|chips|toggles)\b|\b(point|scale) drag\b|\bpress area\b/i;
const internal: string[] = [];
for (const c of concepts) {
  const fields: [string, string][] = [
    ['definition', c.surface.definition],
    ...c.surface.exemplarKeywords.map((k): [string, string] => ['keyword', k]),
    ...c.briefing.observable.map((o): [string, string] => ['observable', o]),
    ...c.briefing.screen.affordances.map((a): [string, string] => ['affordances', a]),
    ...c.briefing.useWhen.map((u): [string, string] => ['useWhen', u]),
    ...c.briefing.avoidWhen.map((a): [string, string] => ['avoidWhen', a]),
    ...c.briefing.contrastWith.map((x): [string, string] => ['contrastWith', x.note]),
  ];
  for (const [field, text] of fields) {
    const m = INTERNAL.exec(text);
    if (m) internal.push(`${c.id}.${field}: "${m[0]}" — "${text.slice(0, 60)}…"`);
  }
}
report('내부 어휘가 새어 나갔다', internal);

// 5 — 비어 있거나 영어가 아닌 것.
const shape: string[] = [];
for (const c of concepts) {
  const b = c.briefing;
  if (c.surface.definition.split(' ').length < 12) shape.push(`${c.id}: definition 이 짧다`);
  if (c.surface.exemplarKeywords.length < 5) shape.push(`${c.id}: exemplarKeywords 가 ${c.surface.exemplarKeywords.length}개`);
  if (b.observable.length < 3) shape.push(`${c.id}: observable 이 ${b.observable.length}개`);
  if (b.screen.affordances.length === 0) shape.push(`${c.id}: affordances 가 비었다`);
  if (b.useWhen.length === 0) shape.push(`${c.id}: useWhen 이 비었다`);
  if (b.avoidWhen.length < 2) shape.push(`${c.id}: avoidWhen 이 ${b.avoidWhen.length}개 — 오검출을 되돌리는 유일한 장치다`);
  if (b.contrastWith.length === 0) shape.push(`${c.id}: contrastWith 가 비었다`);
  const all = [c.surface.definition, ...c.surface.exemplarKeywords, ...b.observable, ...b.useWhen, ...b.avoidWhen];
  if (all.some((t) => /[가-힣]/.test(t))) shape.push(`${c.id}: 한국어가 섞였다 — 영어 단일이다`);
}
report('모양이 비었거나 어긋난다', shape);

process.stdout.write(
  `\n[concept] 개념 ${concepts.length}개 · 살펴볼 것 ${flagged}건` +
    (flagged ? ' — 위 목록은 후보이지 판정이 아니다. 읽고 사람이 정한다.\n' : '\n'),
);
