// ========================================================================
// phase-diagram — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
//   상 영역      region ×3 (곡선을 표본한 다각형, 불투명)
//   상 경계선    trajectory ×2
//   글자         readout
//   삼중점 · 상태점  body
//   가열 경로    trajectory
//   상 띠        region(구간) · trajectory(테두리) · lineSet(경계 눈금)
//   시료 속 입자 particleSystem + trajectory(상자)
//   캡션         BundleSchema.caption 슬롯
// ========================================================================

import type {
  ColorRole,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  particlesAt,
  readModel,
  runFromElapsed,
  runFromTimeline,
  uMelt,
  vSub,
  vVap,
  type Phase,
  type PhaseModel,
  type RunFrame,
  type Segment,
} from './physics';
import {
  DIAGRAM,
  RUNS,
  SAMPLE_BOX,
  STRIP,
  text,
  type PhaseDiagramMessageKey,
  type RunDef,
} from './schema';
import type { PhaseDiagramState } from './state';

// ------------------------------------------------------------------------
// 좌표 — 원본 논리 좌표(y 아래)를 월드(y 위)로
// ------------------------------------------------------------------------

const W = (x: number, y: number): Vec2 => [x, -y];
const px = (u: number): number => DIAGRAM.x + u * DIAGRAM.w;
const py = (v: number): number => DIAGRAM.y + (1 - v) * DIAGRAM.h;
const at = (u: number, v: number): Vec2 => W(px(u), py(v));

/** 상마다 한 색. 영역과 띠의 같은 상은 같은 색이다. 강조색은 「지금 데우는 시료」 에만 남긴다. */
const PHASE_ROLE: Record<Phase, ColorRole> = { S: 'secondary', L: 'positive', G: 'muted' };
const PHASE_NAME: Record<Phase, PhaseDiagramMessageKey> = {
  S: 'label.solid',
  L: 'label.liquid',
  G: 'label.gas',
};
/** 상 면의 옅기. 원본의 옅은 파랑 · 초록 · 미색 면. */
const PHASE_FILL = 0.3;

/** 원본 선 굵기(화면 px). */
const BOUNDARY_WIDTH = 1.6;
const TRACE_PAST_WIDTH = 2;
const TRACE_NOW_WIDTH = 2.5;
const GUIDE_WIDTH = 1;
const STRIP_TICK_WIDTH = 1.4;
/** 삼중점 · 상태점 반지름(월드 = 원본 논리 px). */
const TRIPLE_R = 3.5;
const STATE_R = 6;
/** 입자 반지름(화면 px) = 상자 비율 반지름 × 상자 × 0.85 (원본). */
const PARTICLE_PX = 0.028 * SAMPLE_BOX.size * 0.85;
/** 곡선 표본 수. */
const CURVE_STEPS = 80;
/** 띠 구간 이름을 넣을 최소 폭(원본 논리 px). */
const STRIP_LABEL_MIN = 34;
/** 경로 이름 · 띠 이름이 그림 왼쪽에서 떨어지는 거리. */
const LEFT_GAP = 10;

function label(
  id: string,
  pos: Vec2,
  key: PhaseDiagramMessageKey,
  opt: { size: number; align?: Readout['align']; role?: ColorRole; bold?: boolean },
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: opt.size,
    align: opt.align ?? 'left',
    ...(opt.bold ? { weight: 'bold' as const } : {}),
    style: { colorRole: opt.role ?? 'ink', emphasis: 'strong' },
  };
}

// ------------------------------------------------------------------------
// 상 영역 · 경계선 (변하지 않는다)
// ------------------------------------------------------------------------

function sample(from: number, to: number, f: (u: number) => Vec2): Vec2[] {
  return Array.from({ length: CURVE_STEPS + 1 }, (_, i) => f(from + ((to - from) * i) / CURVE_STEPS));
}

/** 승화 곡선이 그림 아래 변(v=0)에 닿는 온도. */
function subFloorU(m: PhaseModel): number {
  let a = 0;
  let b = m.uT;
  for (let i = 0; i < 40; i++) {
    const mid = (a + b) / 2;
    if (vSub(m, mid) < 0) a = mid;
    else b = mid;
  }
  return b;
}

function phaseRegions(m: PhaseModel): Primitive[] {
  const uS0 = subFloorU(m);
  const meltTop = uMelt(m, 1);
  const subCurve = sample(uS0, m.uT, (u) => at(u, vSub(m, u)));
  // 증발 곡선은 임계점 너머 그림 오른쪽 끝까지 잇는다 — 면의 경계로만. 선은 임계점에서 끝난다.
  const vapCurve = sample(m.uT, 1, (u) => at(u, vVap(m, u)));

  const solid: Vec2[] = [at(0, 1), at(meltTop, 1), at(m.uT, m.vT), ...subCurve.slice().reverse(), at(0, 0)];
  const liquid: Vec2[] = [at(meltTop, 1), at(1, 1), ...vapCurve.slice().reverse()];
  const gas: Vec2[] = [...vapCurve, at(1, 0), at(uS0, 0), ...subCurve.slice(0, -1)];

  const face = (id: string, points: Vec2[], ph: Phase): Primitive => ({
    type: 'region',
    id,
    points,
    opaque: true,
    fillOpacity: PHASE_FILL,
    style: { colorRole: PHASE_ROLE[ph], emphasis: 'strong' },
  });
  return [face('field-solid', solid, 'S'), face('field-liquid', liquid, 'L'), face('field-gas', gas, 'G')];
}

function boundaries(m: PhaseModel): Primitive[] {
  const uS0 = subFloorU(m);
  return [
    {
      type: 'trajectory',
      id: 'boundary-sub-vap',
      points: [...sample(uS0, m.uT, (u) => at(u, vSub(m, u))), ...sample(m.uT, m.uC, (u) => at(u, vVap(m, u))).slice(1)],
      width: BOUNDARY_WIDTH,
      style: { colorRole: 'ink', emphasis: 'medium' },
    },
    {
      type: 'trajectory',
      id: 'boundary-melt',
      points: [at(m.uT, m.vT), at(uMelt(m, 1), 1)],
      width: BOUNDARY_WIDTH,
      style: { colorRole: 'ink', emphasis: 'medium' },
    },
  ];
}

// ------------------------------------------------------------------------
// 상 띠
// ------------------------------------------------------------------------

interface StripRow {
  label: PhaseDiagramMessageKey;
  v: number;
  segs: readonly Segment[];
}

function strips(rows: readonly (StripRow | null)[]): Primitive[] {
  const out: Primitive[] = [];
  const ticks: Vec2[][] = [];
  rows.forEach((row, k) => {
    const y = STRIP.y[k]!;
    out.push({
      type: 'trajectory',
      id: `strip-${k}-frame`,
      points: [W(DIAGRAM.x + 0.5, y + 0.5), W(DIAGRAM.x + DIAGRAM.w - 0.5, y + 0.5), W(DIAGRAM.x + DIAGRAM.w - 0.5, y + STRIP.h - 0.5), W(DIAGRAM.x + 0.5, y + STRIP.h - 0.5)],
      closed: true,
      width: GUIDE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    });
    if (!row) return;
    out.push(label(`strip-${k}-name`, W(DIAGRAM.x - LEFT_GAP, y + STRIP.h / 2), row.label, { size: 12, align: 'right', role: 'muted' }));
    row.segs.forEach((g, i) => {
      const x0 = px(g.u0);
      const x1 = px(g.u1);
      if (x1 - x0 <= 0) return;
      out.push({
        type: 'region',
        id: `strip-${k}-seg-${i}`,
        points: [W(x0, y), W(x1, y), W(x1, y + STRIP.h), W(x0, y + STRIP.h)],
        opaque: true,
        fillOpacity: PHASE_FILL,
        style: { colorRole: PHASE_ROLE[g.phase], emphasis: 'strong' },
      });
    });
    row.segs.forEach((g, i) => {
      const x0 = px(g.u0);
      const x1 = px(g.u1);
      if (x1 - x0 > STRIP_LABEL_MIN) {
        out.push(label(`strip-${k}-seg-${i}-name`, W((x0 + x1) / 2, y + STRIP.h / 2 + 0.5), PHASE_NAME[g.phase], { size: 11, align: 'center' }));
      }
      if (i > 0) ticks.push([W(x0, y), W(x0, y + STRIP.h)]);
    });
  });
  if (ticks.length > 0) {
    out.push({ type: 'lineSet', id: 'strip-ticks', lines: ticks, width: STRIP_TICK_WIDTH, style: { colorRole: 'ink', emphasis: 'medium' } });
  }
  return out;
}

// ------------------------------------------------------------------------
// 지금의 진행 — 자동이면 시간표, 고른 뒤면 상태
// ------------------------------------------------------------------------

interface Now {
  run: RunFrame;
  rows: [StripRow | null, StripRow | null];
  past: { v: number; u0: number; u1: number } | null;
}

/** 끝난 가열의 띠 — 끝까지 흐른 모습을 그대로 만든다. */
function fullRow(m: PhaseModel, def: RunDef): StripRow {
  const done = runFromElapsed({ ...m, u0Chosen: m[def.startKey] }, m[def.pressureKey], Number.POSITIVE_INFINITY);
  return { label: def.label, v: done.v, segs: done.segs };
}

function nowAuto(m: PhaseModel, tl: TimelineFrame): Now {
  const [high, low] = RUNS as [RunDef, RunDef];
  const inLow = tl.u >= tl.start(low.heats[0]!);
  if (!inLow) {
    const run = runFromTimeline(m, tl, high);
    return { run, rows: [{ label: high.label, v: run.v, segs: run.segs }, null], past: null };
  }
  const run = runFromTimeline(m, tl, low);
  return {
    run,
    rows: [fullRow(m, high), { label: low.label, v: run.v, segs: run.segs }],
    past: { v: m.vHigh, u0: m.u0High, u1: m.uEnd },
  };
}

function nowChosen(m: PhaseModel, s: PhaseDiagramState): Now {
  const [high] = RUNS as [RunDef];
  const run = runFromElapsed(m, s.pressure, s.manualT);
  return {
    run,
    rows: [fullRow(m, high), { label: 'label.pathChosen', v: run.v, segs: run.segs }],
    // 원본: 고르는 순간 높은 압력 경로가 지난 경로가 되고, 한 바퀴 돈 뒤로는 고른 압력의 경로가 된다.
    past: s.looped ? { v: s.pressure, u0: m.u0Chosen, u1: m.uEnd } : { v: m.vHigh, u0: m.u0High, u1: m.uEnd },
  };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: PhaseDiagramState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('phase-diagram: schema.timeline 이 선언되어야 한다');
  const m = readModel(stage);
  const now = state.manual ? nowChosen(m, state) : nowAuto(m, timeline);
  const { run } = now;
  const out: Primitive[] = [];

  // ---- 상 영역 · 경계선 · 이름 ----
  out.push(...phaseRegions(m));
  out.push(...boundaries(m));
  out.push(label('name-solid', at(0.14, 0.72), 'label.solid', { size: 14, bold: true }));
  out.push(label('name-liquid', at(0.62, 0.86), 'label.liquid', { size: 14, bold: true }));
  out.push(label('name-gas', at(0.7, 0.3), 'label.gas', { size: 14, bold: true }));

  // ---- 삼중점 ----
  out.push({
    type: 'body',
    id: 'triple-point',
    pos: at(m.uT, m.vT),
    shape: 'circle',
    size: TRIPLE_R,
    glow: false,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'medium' },
  });
  out.push(label('triple-point-name', W(px(m.uT) + 8, py(m.vT) + 11), 'label.triplePoint', { size: 12 }));

  // ---- 축 안내 ----
  out.push(label('axis-pressure', W(DIAGRAM.x - LEFT_GAP, DIAGRAM.y + 8), 'label.pressureAxis', { size: 12, align: 'right', role: 'muted' }));
  out.push(label('axis-temperature', W(DIAGRAM.x + DIAGRAM.w, 300), 'label.temperatureAxis', { size: 12, align: 'right', role: 'muted' }));

  // ---- 가열 경로 이름 (그림 왼쪽 여백, 경로 높이) ----
  const named = new Set<string>();
  now.rows.forEach((row, k) => {
    if (!row || named.has(row.label)) return;
    named.add(row.label);
    out.push(label(`path-name-${k}`, W(DIAGRAM.x - LEFT_GAP, py(row.v)), row.label, { size: 12, align: 'right', role: 'muted' }));
  });

  // ---- 지난 가열 경로 ----
  if (now.past) {
    out.push({
      type: 'trajectory',
      id: 'trace-past',
      points: [at(now.past.u0, now.past.v), at(now.past.u1, now.past.v)],
      width: TRACE_PAST_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 지금 가열 경로 · 상태점 — 강조색은 이 시료 하나에만 ----
  if (run.u > run.u0) {
    out.push({
      type: 'trajectory',
      id: 'trace-now',
      points: [at(run.u0, run.v), at(run.u, run.v)],
      width: TRACE_NOW_WIDTH,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'body',
    id: 'state-point',
    pos: at(run.u, run.v),
    shape: 'circle',
    size: STATE_R,
    glow: false,
    outline: 'background',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 상 띠 ----
  out.push(...strips(now.rows));

  // ---- 시료 속 입자 ----
  const { x: bx, y: by, size: bs } = SAMPLE_BOX;
  out.push({
    type: 'trajectory',
    id: 'sample-box',
    points: [W(bx + 0.5, by + 0.5), W(bx + bs - 0.5, by + 0.5), W(bx + bs - 0.5, by + bs - 0.5), W(bx + 0.5, by + bs - 0.5)],
    closed: true,
    width: GUIDE_WIDTH,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });
  out.push({
    type: 'particleSystem',
    id: 'sample-particles',
    positions: particlesAt(run).map(([x, y]) => W(bx + x * bs, by + y * bs)),
    sizes: PARTICLE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push(label('sample-name', W(bx + bs / 2, by + bs + 14), 'label.sample', { size: 12, align: 'center', role: 'muted' }));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 원본 캔버스(860×316) 아래로 캡션 · 조작기 두 줄. */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { minX: 4, maxX: 856, minY: -404, maxY: 2 };
}
