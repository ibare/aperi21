// ========================================================================
// phase-diagram — 순수 물리
// ========================================================================
// 상 판정 · 경계 교차 · 가열 한 번의 지금 모습 · 시료 속 입자 자리.
// DOM · 캔버스 · 시간을 모른다. 시각은 인자로 받는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import type { RunDef } from './schema';
import { noCaption, type CaptionName, type PhaseDiagramState } from './state';

export type Phase = 'S' | 'L' | 'G';

export interface PhaseModel {
  uT: number;
  vT: number;
  uC: number;
  bVap: number;
  bSub: number;
  kMelt: number;
  uEnd: number;
  vHigh: number;
  vLow: number;
  u0High: number;
  u0Low: number;
  u0Chosen: number;
  rate: number;
  pause: number;
  hold: number;
}

const MODEL_KEYS: readonly (keyof PhaseModel)[] = [
  'uT', 'vT', 'uC', 'bVap', 'bSub', 'kMelt', 'uEnd', 'vHigh', 'vLow',
  'u0High', 'u0Low', 'u0Chosen', 'rate', 'pause', 'hold',
];

/** 스테이지 상수에서 모형을 읽는다. 빠진 이름이 있으면 던진다 — 0 으로 넘어가면 그림이 조용히 틀린다. */
export function readModel(stage: StageDef): PhaseModel {
  const c = stage.constants;
  const out = {} as PhaseModel;
  for (const k of MODEL_KEYS) {
    const v = c[k];
    if (typeof v !== 'number') throw new Error(`phase-diagram: stage.constants.${k} 가 없다`);
    out[k] = v;
  }
  return out;
}

// ------------------------------------------------------------------------
// 상평형 모형 (무차원 도식)
// ------------------------------------------------------------------------

/** 도식 온도. 0 을 피해 1/T 꼴이 성립하게 민다. */
export const temp = (u: number): number => 0.5 + u;

/** 증발 곡선 — 클라우지우스-클라페이롱 꼴. */
export const vVap = (m: PhaseModel, u: number): number =>
  m.vT + m.bVap * (1 / temp(m.uT) - 1 / temp(u));

/** 승화 곡선 — 증발보다 가파르다(승화열이 더 크다). */
export const vSub = (m: PhaseModel, u: number): number =>
  m.vT + m.bSub * (1 / temp(m.uT) - 1 / temp(u));

/** 융해 곡선 — 양의 기울기를 가진 거의 수직인 직선(일반 물질). */
export const uMelt = (m: PhaseModel, v: number): number => m.uT + m.kMelt * (v - m.vT);

export function phaseAt(m: PhaseModel, u: number, v: number): Phase {
  if (v >= m.vT) {
    if (u < uMelt(m, v)) return 'S';
    return v >= vVap(m, u) ? 'L' : 'G';
  }
  if (u < m.uT && v >= vSub(m, u)) return 'S';
  return 'G';
}

/** 경계선 위치를 이분법으로 찾는다. `ua` 는 상 `ph` 안, `ub` 는 밖. */
function boundary(m: PhaseModel, ua: number, ub: number, v: number, ph: Phase): number {
  let a = ua;
  let b = ub;
  for (let i = 0; i < 30; i++) {
    const mid = (a + b) / 2;
    if (phaseAt(m, mid, v) === ph) a = mid;
    else b = mid;
  }
  return a;
}

export interface Crossing {
  u: number;
  from: Phase;
  to: Phase;
}

/** 압력 `v` 에서 `u0` 부터 `uEnd` 까지 데울 때 만나는 경계선들. */
export function crossings(m: PhaseModel, v: number, u0: number): Crossing[] {
  const out: Crossing[] = [];
  const n = 400;
  let ph = phaseAt(m, u0, v);
  for (let i = 1; i <= n; i++) {
    const u = u0 + ((m.uEnd - u0) * i) / n;
    const p = phaseAt(m, u, v);
    if (p !== ph) {
      out.push({ u: boundary(m, u - (m.uEnd - u0) / n, u, v, ph), from: ph, to: p });
      ph = p;
    }
  }
  return out;
}

// ------------------------------------------------------------------------
// 가열 한 번의 지금 모습
// ------------------------------------------------------------------------

export interface Segment {
  u0: number;
  u1: number;
  phase: Phase;
}

export interface RunFrame {
  /** 로그 압력. */
  v: number;
  /** 시작 온도. */
  u0: number;
  /** 지금 온도. */
  u: number;
  status: 'heat' | 'trans' | 'hold';
  /** 지금 상. 경계선에서 멈춘 동안은 앞 상. */
  phase: Phase;
  /** 멈춘 동안 옮겨 가는 두 상과 그 진행도(0~1). */
  from: Phase;
  to: Phase;
  transK: number;
  /** 상 띠에 채워질 구간들. 경계선을 지나 멈춤이 끝나야 다음 구간이 생긴다(원본과 같다). */
  segs: Segment[];
  hadLiquid: boolean;
  /** 가열이 시작된 뒤 흐른 시간(초). 입자의 움직임이 이것을 쓴다. */
  elapsed: number;
}

function lerp(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

/** 경계로 나뉜 구간의 시작 · 끝 온도와 상. */
function legsOf(m: PhaseModel, v: number, u0: number, cs: readonly Crossing[]) {
  const starts = [u0, ...cs.map((c) => c.u)];
  const ends = [...cs.map((c) => c.u), m.uEnd];
  const phases: Phase[] = [phaseAt(m, u0, v), ...cs.map((c) => c.to)];
  return { starts, ends, phases };
}

/**
 * 자동 진행의 가열 하나를 시간표에서 읽는다. 온도는 가열 단계의 진행도로 그 구간을
 * 보간한다 — 단계 경계 상수를 두지 않는다.
 */
export function runFromTimeline(m: PhaseModel, tl: TimelineFrame, run: RunDef): RunFrame {
  const v = m[run.pressureKey];
  const u0 = m[run.startKey];
  const cs = crossings(m, v, u0);
  if (cs.length !== run.crosses.length || run.heats.length !== cs.length + 1) {
    throw new Error(
      `phase-diagram: '${run.id}' 가열은 경계선 ${cs.length} 개를 만나는데 시간표 멈춤 단계는 ${run.crosses.length} 개다`,
    );
  }
  const { starts, ends, phases } = legsOf(m, v, u0, cs);

  let u = u0;
  let leg = 0;
  const segs: Segment[] = [{ u0, u1: u0, phase: phases[0]! }];
  for (let j = 0; j < run.heats.length; j++) {
    if (j > 0) {
      if (tl.at(run.crosses[j - 1]!) < 1) break;
      segs.push({ u0: starts[j]!, u1: starts[j]!, phase: phases[j]! });
    }
    leg = j;
    u = lerp(starts[j]!, ends[j]!, tl.at(run.heats[j]!));
    segs[segs.length - 1]!.u1 = u;
  }

  const crossIdx = run.crosses.indexOf(tl.phase);
  const status = crossIdx >= 0 ? 'trans' : tl.phase === run.hold ? 'hold' : 'heat';
  const from = phases[leg]!;
  const to = crossIdx >= 0 ? phases[crossIdx + 1]! : from;
  return {
    v,
    u0,
    u,
    status,
    phase: from,
    from,
    to,
    transK: crossIdx >= 0 ? tl.progress : 0,
    segs,
    hadLiquid: segs.some((s) => s.phase === 'L'),
    elapsed: Math.max(0, tl.u - tl.start(run.heats[0]!)),
  };
}

/** 고른 가열 한 바퀴의 길이(초) — 가열 · 멈춤 · 머묾. */
export function chosenPeriod(m: PhaseModel, v: number): number {
  const u0 = m.u0Chosen;
  const cs = crossings(m, v, u0);
  return (m.uEnd - u0) / m.rate + cs.length * m.pause + m.hold;
}

/** 독자가 고른 압력의 가열을 흐른 시간에서 읽는다. 길이는 스테이지 상수가 정한다. */
export function runFromElapsed(m: PhaseModel, v: number, elapsed: number): RunFrame {
  const u0 = m.u0Chosen;
  const cs = crossings(m, v, u0);
  const { starts, ends, phases } = legsOf(m, v, u0, cs);
  const segs: Segment[] = [{ u0, u1: u0, phase: phases[0]! }];
  let left = elapsed;
  const base = { v, u0, elapsed, transK: 0 };

  for (let j = 0; j < phases.length; j++) {
    if (j > 0) segs.push({ u0: starts[j]!, u1: starts[j]!, phase: phases[j]! });
    const heatT = (ends[j]! - starts[j]!) / m.rate;
    const last = segs[segs.length - 1]!;
    if (left < heatT) {
      last.u1 = starts[j]! + m.rate * left;
      const ph = phases[j]!;
      return { ...base, u: last.u1, status: 'heat', phase: ph, from: ph, to: ph, segs, hadLiquid: segs.some((s) => s.phase === 'L') };
    }
    left -= heatT;
    last.u1 = ends[j]!;
    if (j < cs.length) {
      if (left < m.pause) {
        const ph = phases[j]!;
        return {
          ...base,
          u: ends[j]!,
          status: 'trans',
          phase: ph,
          from: ph,
          to: phases[j + 1]!,
          transK: left / m.pause,
          segs,
          hadLiquid: segs.some((s) => s.phase === 'L'),
        };
      }
      left -= m.pause;
    }
  }
  const ph = phases[phases.length - 1]!;
  return { ...base, u: m.uEnd, status: 'hold', phase: ph, from: ph, to: ph, segs, hadLiquid: segs.some((s) => s.phase === 'L') };
}

/** 지금 화면에서 벌어지는 일에 맞는 캡션 이름 (원본 `captionText` 와 같은 갈래). */
export function captionOf(m: PhaseModel, r: RunFrame): CaptionName {
  if (r.status === 'trans') {
    if (r.from === 'S' && r.to === 'L') return 'melt';
    if (r.from === 'L' && r.to === 'G') return 'boil';
    if (r.from === 'S' && r.to === 'G') return 'sublimate';
  }
  if (r.phase === 'S') return r.v < m.vT ? 'heatSolidLow' : 'heatSolidHigh';
  if (r.phase === 'L') return 'heatLiquid';
  return r.hadLiquid ? 'twoCrossings' : 'skipped';
}

// ------------------------------------------------------------------------
// 시료 속 입자 — 상자 좌표 0~1, y 아래
// ------------------------------------------------------------------------
//
// 원본은 입자 30개를 힘으로 적분했다(격자 용수철 · 중력과 끌림 · 무작위 걷기를 상 가중치로
// 섞음). 여기서는 같은 세 행동을 **시각의 닫힌 식**으로 두고 가중치로 섞는다 — 가중치가
// 시간표 진행도에서 오는데 `step` 은 시간표를 받지 못한다(NOTES G01).
//   고체: 격자 자리에서 온도에 따라 떤다
//   액체: 바닥에 퍼져 뭉친 채 느리게 헤맨다
//   기체: 상자 전체를 곧게 날며 벽에서 튄다

const COLS = 6;
const ROWS = 5;
/** 격자 간격 · 입자 반지름(상자 비율). 원본 값. */
const SP = 0.085;
export const PARTICLE_R = 0.028;
/** 시드. 같은 시각은 언제나 같은 화면이다. */
const SEED = 1;
/** 고체 떨림 폭(√T 배). 원본 격자 용수철 · 감쇠 · 열 걷기의 정상 흔들림 크기. */
const SOLID_JITTER = 0.0095;
/** 액체가 바닥에서 쌓이는 줄 수와 한 줄의 입자 수. 원본 액체 스냅숏(t=3.2)의 퍼짐. */
const LIQUID_ROWS = 3;
const LIQUID_PER_ROW = 10;
/** 액체의 헤맴 폭. */
const LIQUID_WANDER: Vec2 = [0.045, 0.05];
/** 기체 빠르기(상자/초). 원본 1.1·√T 의 가열 구간 평균. */
const GAS_SPEED = 1.2;

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface ParticleSeed {
  home: Vec2;
  slot: Vec2;
  gas0: Vec2;
  gasDir: number;
  ph: readonly number[];
  om: readonly number[];
}

/** 입자마다의 고정값. 시드에서 한 번 뽑는 상수라 인스턴스 상태가 아니다. */
const SEEDS: readonly ParticleSeed[] = (() => {
  const rnd = mulberry32(SEED);
  const n = COLS * ROWS;
  const slots: Vec2[] = [];
  for (let r = 0; r < LIQUID_ROWS; r++) {
    for (let c = 0; c < LIQUID_PER_ROW; c++) {
      const x = 0.08 + (c + (r % 2) * 0.5) * ((0.84) / (LIQUID_PER_ROW - 0.5));
      slots.push([x + (rnd() - 0.5) * 0.04, 1 - PARTICLE_R - r * 0.07 - rnd() * 0.03]);
    }
  }
  // 격자 자리와 바닥 자리를 섞어 잇는다 — 순서대로 이으면 격자가 통째로 미끄러져 「녹는다」 로 읽히지 않는다.
  const order = slots.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  const out: ParticleSeed[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      out.push({
        home: [0.5 + (c - (COLS - 1) / 2) * SP, 0.92 - PARTICLE_R - r * SP],
        slot: slots[order[i]!]!,
        gas0: [PARTICLE_R + rnd() * (1 - 2 * PARTICLE_R), PARTICLE_R + rnd() * (1 - 2 * PARTICLE_R)],
        gasDir: rnd() * Math.PI * 2,
        ph: Array.from({ length: 6 }, () => rnd() * Math.PI * 2),
        om: [11 + rnd() * 4, 13 + rnd() * 4, 1.2 + rnd() * 1.4, 1.6 + rnd() * 1.4, 2.0 + rnd() * 1.5, 0],
      });
    }
  }
  if (out.length !== n) throw new Error('phase-diagram: 입자 수');
  return out;
})();

/** 벽 사이를 오가는 직선 운동을 접어 상자 안 자리로. */
function bounce(x: number): number {
  const lo = PARTICLE_R;
  const span = 1 - 2 * PARTICLE_R;
  const y = (((x - lo) % (2 * span)) + 2 * span) % (2 * span);
  return lo + (y <= span ? y : 2 * span - y);
}

/** 멈춘 동안 앞 상에서 뒤 상으로 옮겨 가는 가중치 (원본 `phaseWeights`). */
export function phaseWeights(r: RunFrame): Record<Phase, number> {
  const w: Record<Phase, number> = { S: 0, L: 0, G: 0 };
  if (r.status === 'trans') {
    const k = Math.min(1, r.transK / 0.8);
    const s = k * k * (3 - 2 * k);
    w[r.from] += 1 - s;
    w[r.to] += s;
  } else {
    w[r.phase] = 1;
  }
  return w;
}

/** 입자 자리(상자 좌표). */
export function particlesAt(r: RunFrame): Vec2[] {
  const w = phaseWeights(r);
  const t = r.elapsed;
  const amp = SOLID_JITTER * Math.sqrt(temp(r.u));
  return SEEDS.map((p) => {
    let x = 0;
    let y = 0;
    if (w.S > 0) {
      x += w.S * (p.home[0] + amp * (0.6 * Math.sin(p.om[0]! * t + p.ph[0]!) + 0.4 * Math.sin(p.om[1]! * t + p.ph[1]!)));
      y += w.S * (p.home[1] + amp * (0.6 * Math.sin(p.om[1]! * t + p.ph[2]!) + 0.4 * Math.sin(p.om[0]! * t + p.ph[3]!)));
    }
    if (w.L > 0) {
      const lx = p.slot[0] + LIQUID_WANDER[0] * Math.sin(p.om[2]! * t + p.ph[4]!);
      const ly = p.slot[1] - LIQUID_WANDER[1] * Math.abs(Math.sin(p.om[3]! * t + p.ph[5]!)) * Math.abs(Math.sin(p.om[4]! * t));
      x += w.L * Math.min(1 - PARTICLE_R, Math.max(PARTICLE_R, lx));
      y += w.L * Math.min(1 - PARTICLE_R, Math.max(PARTICLE_R, ly));
    }
    if (w.G > 0) {
      x += w.G * bounce(p.gas0[0] + Math.cos(p.gasDir) * GAS_SPEED * t);
      y += w.G * bounce(p.gas0[1] + Math.sin(p.gasDir) * GAS_SPEED * t);
    }
    return [x, y] as Vec2;
  });
}

// ------------------------------------------------------------------------
// step — 고른 가열만 쌓는다
// ------------------------------------------------------------------------

export function step(params: { state: PhaseDiagramState; dt: number; stage: StageDef }): PhaseDiagramState {
  const { state, dt, stage } = params;
  if (state.held) {
    // 잡고 있는 동안은 원본처럼 고른 압력의 가열을 처음부터 다시 놓는다.
    const m = readModel(stage);
    const r = runFromElapsed(m, state.pressure, 0);
    return { ...state, manual: true, manualT: 0, looped: false, cap: flag(captionOf(m, r)) };
  }
  if (!state.manual) return state;

  const m = readModel(stage);
  const period = chosenPeriod(m, state.pressure);
  let manualT = state.manualT + dt;
  let looped = state.looped;
  if (manualT >= period) {
    manualT -= period;
    looped = true;
  }
  const r = runFromElapsed(m, state.pressure, manualT);
  return { ...state, manualT, looped, cap: flag(captionOf(m, r)) };
}

function flag(name: CaptionName): PhaseDiagramState['cap'] {
  const cap = noCaption();
  cap[name] = true;
  return cap;
}
