#!/usr/bin/env node
/**
 * 조각 관성 계측기.
 *
 * 조각을 여러 개 한꺼번에 만들면 앞 조각의 골격이 복제된다. 눈으로는 안 잡힌다 —
 * FACET 이 두 번 겪었고 둘 다 실측으로 찾았다. 그 실측을 옮긴 것이다.
 * 원본: FACET `scripts/piece-inertia.mjs`.
 *
 * 우리 도메인에 맞춘 것 둘:
 *  - 그림 어휘는 SVG 원소가 아니라 **Canvas2D 호출 + 선언한 primitive 종류**다.
 *  - 자유 렌더 계층(`*-stage.ts`)이 없는 조각은 `scene.ts` 만으로 그림이 정해지므로
 *    "그림을 정하는 파일" 을 조각마다 모아서 잰다.
 *
 * 재는 것 넷:
 *   1. 코드 유사도 — 정규화(주석·문자열·숫자 제거) 후 토큰 3-gram 자카드
 *   2. 좌표 겹침   — 숫자 상수 집합의 자카드
 *   3. 그림 어휘   — 묶음 전체가 쓴 그리기 어휘의 종류 수
 *   4. 운동        — 위치/변형이 시간에 따라 바뀌는 조각 수. alpha 만으로는 운동이 아니다
 *
 * 사용: node scripts/piece-inertia.mjs sims/<category>/<name> ...
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { basename, join } from 'node:path';

/** Canvas2D 그리기 어휘 + 우리 primitive 어휘. */
const DRAW_VOCAB = [
  'arc', 'arcTo', 'rect', 'fillRect', 'strokeRect', 'moveTo', 'lineTo',
  'bezierCurveTo', 'quadraticCurveTo', 'ellipse', 'fillText', 'strokeText',
  'setLineDash', 'createLinearGradient', 'createRadialGradient', 'clip',
  'rotate', 'translate', 'scale', 'transform',
];
const PRIMITIVE_VOCAB = [
  'body', 'trajectory', 'vector', 'surface', 'marker', 'graph', 'event', 'gauge',
];

/**
 * 요소가 실제로 자리를 옮기거나 모양이 변하는 신호. **투명도만으로는 운동이 아니다.**
 * 시간/상태에 따라 좌표가 계산되는지를 본다.
 */
const MOTION = /\b(rotate|translate|transform)\s*\(|\b(pos|position|cx|cy|x1|y1|angle|theta|orientation)\s*[:=][^=]|state\.[a-zA-Z]+\s*\*|\bt\s*\*\s*|Math\.(sin|cos)\(/;

function normalize(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/(['"`])(?:\\.|(?!\1)[^\\])*\1/g, ' STR ')
    .replace(/\b\d+(\.\d+)?\b/g, ' NUM ')
    .replace(/\s+/g, ' ')
    .trim();
}

const ngrams = (s, n = 3) => {
  const t = s.split(' ').filter(Boolean);
  const out = new Set();
  for (let i = 0; i + n <= t.length; i++) out.add(t.slice(i, i + n).join(' '));
  return out;
};

const jaccard = (a, b) => {
  if (a.size === 0 && b.size === 0) return 1;
  let hit = 0;
  for (const x of a) if (b.has(x)) hit++;
  return hit / (a.size + b.size - hit);
};

/** 그림을 정하는 파일 — scene.ts 와 자유 렌더 계층(*-stage.ts). */
function pictureFiles(dir) {
  const src = join(dir, 'src');
  if (!existsSync(src)) return [];
  return readdirSync(src)
    .filter((f) => f === 'scene.ts' || f.endsWith('-stage.ts'))
    .map((f) => join(src, f));
}

const dirs = process.argv.slice(2);
if (dirs.length < 2) {
  console.error('조각 디렉터리를 둘 이상 넘겨야 한다.');
  process.exit(2);
}

const items = dirs.map((d) => {
  const files = pictureFiles(d);
  if (files.length === 0) throw new Error(`${d} 에 그림을 정하는 파일이 없다`);
  const src = files.map((f) => readFileSync(f, 'utf8')).join('\n');
  const vocab = new Set([
    ...DRAW_VOCAB.filter((e) => new RegExp(`\\.${e}\\s*\\(`).test(src)),
    ...PRIMITIVE_VOCAB.filter((e) => new RegExp(`type:\\s*['"]${e}['"]`).test(src)),
  ]);
  return {
    name: basename(d),
    files: files.length,
    grams: ngrams(normalize(src)),
    nums: new Set((src.match(/\b\d{2,}\b/g) ?? []).map(Number).filter((n) => n >= 10 && n <= 2000)),
    vocab,
    motion: MOTION.test(src),
  };
});

const pairs = [];
for (let i = 0; i < items.length; i++) {
  for (let j = i + 1; j < items.length; j++) {
    pairs.push({
      a: items[i].name,
      b: items[j].name,
      sim: jaccard(items[i].grams, items[j].grams),
      num: jaccard(items[i].nums, items[j].nums),
    });
  }
}

const worst = [...pairs].sort((x, y) => y.sim - x.sim);
const avgSim = pairs.reduce((s, p) => s + p.sim, 0) / pairs.length;
const worstSim = worst[0].sim;
const worstNum = Math.max(...pairs.map((p) => p.num));
const vocabAll = new Set(items.flatMap((i) => [...i.vocab]));
const moving = items.filter((i) => i.motion).length;

console.log(`조각 ${items.length}개 · 짝 ${pairs.length}개\n`);
console.log('조각별');
for (const i of items) {
  console.log(`  ${i.name.padEnd(30)} 파일 ${i.files} · 어휘 ${String(i.vocab.size).padStart(2)}종 · 운동 ${i.motion ? '있음' : '없음'}`);
}
console.log('\n짝별 (코드 유사도 / 좌표 겹침)');
for (const p of worst) {
  console.log(`  ${p.sim.toFixed(2)}  ${p.num.toFixed(2)}   ${p.a} ↔ ${p.b}`);
}
console.log(`\n평균 코드 유사도   ${avgSim.toFixed(2)}`);
console.log(`최고 코드 유사도   ${worstSim.toFixed(2)}`);
console.log(`최고 좌표 겹침     ${worstNum.toFixed(2)}`);
console.log(`그림 어휘          ${vocabAll.size}종  [${[...vocabAll].sort().join(' ')}]`);
console.log(`운동 있는 조각     ${moving}/${items.length}`);

/**
 * 임계는 FACET 의 값을 그대로 가져왔다. **우리 기준선은 아직 없다** — 이 배치가
 * 첫 데이터이고, 여기서 나온 수치가 앞으로의 기준선이 된다. 지금은 참고선이다.
 */
const THRESHOLD = { maxSim: 0.5, avgSim: 0.35, maxNum: 0.6, minVocab: 5, minMotionRatio: 0.7 };
const fail = [];
if (worstSim > THRESHOLD.maxSim) fail.push(`최고 코드 유사도 ${worstSim.toFixed(2)} > ${THRESHOLD.maxSim}`);
if (avgSim > THRESHOLD.avgSim) fail.push(`평균 코드 유사도 ${avgSim.toFixed(2)} > ${THRESHOLD.avgSim}`);
if (worstNum > THRESHOLD.maxNum) fail.push(`최고 좌표 겹침 ${worstNum.toFixed(2)} > ${THRESHOLD.maxNum}`);
if (vocabAll.size < THRESHOLD.minVocab) fail.push(`그림 어휘 ${vocabAll.size}종 < ${THRESHOLD.minVocab}`);
if (moving / items.length < THRESHOLD.minMotionRatio) fail.push(`운동 ${moving}/${items.length} < ${THRESHOLD.minMotionRatio}`);

console.log();
if (fail.length === 0) console.log('PASS — 관성 징후 없음');
else {
  console.log('FAIL — 관성 징후');
  for (const f of fail) console.log(`  · ${f}`);
  process.exitCode = 1;
}
