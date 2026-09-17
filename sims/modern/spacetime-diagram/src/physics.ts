// ========================================================================
// spacetime-diagram — 순수 계산
// ========================================================================
// 캔버스 · DOM 을 모른다. 시간표 읽기(`PhaseReader`)와 상태만 받는다.
// ========================================================================

import type { TimelineEase, TimelineFrame, TimelinePhase } from '@aperi21/schema';
import {
  EVENTS,
  MANUAL_REST,
  SCENES,
  SPEED_FOLLOW,
  spacetimeDiagramSchema,
} from './schema';
import type { SpacetimeDiagramState } from './state';

/** 시간표에서 이 조각이 읽는 것. 엔진의 `TimelineFrame` 이 그대로 맞는다. */
export type PhaseReader = Pick<TimelineFrame, 'u' | 'start' | 'end' | 'at' | 'span' | 'duration'>;

export const lerp = (a: number, b: number, u: number): number => a + (b - a) * u;

/** |β| < 0.005 는 정지로 본다. 순서 판정 · 캡션 · 조작기 표시가 같은 값을 쓴다. */
export const quant = (b: number): number => (Math.abs(b) < 0.005 ? 0 : b);

/** 훑는 폭: 지금 선이 x = 0 을 지나는 높이(c0)의 범위. */
export const sweepRange = (beta: number): number => Math.abs(beta) * 2.4 + 0.7;

/** 한 순간의 훑기 — 속도, 지금 선의 절편, 속도 바뀌는 중인지, 훑는 중인지. */
export interface Sweep {
  beta: number;
  c0: number;
  changing: boolean;
  sweeping: boolean;
}

/**
 * 자동 진행의 훑기. 단계 경계는 선언(`schema.timeline`)이 정한다.
 *
 * 장면 i 의 '앞 장면' 은 i − 1 이고, 첫 장면의 앞은 마지막 장면이다(주기).
 */
export function autoSweep(tl: PhaseReader): Sweep {
  const n = SCENES.length;
  let i = SCENES.findIndex((s) => tl.u < tl.end(`${s.id}-hold`));
  if (i < 0) i = n - 1;
  const cur = SCENES[i]!;
  const prev = SCENES[(i - 1 + n) % n]!;
  const id = cur.id;
  const rCur = sweepRange(cur.beta);

  if (tl.u < tl.end(`${id}-turn`)) {
    // 속도를 바꾸는 동안 지금 선은 원점으로 내려온다 — 두 선이 같은 원점에서 함께 기운다.
    return {
      beta: lerp(prev.beta, cur.beta, tl.span(tl.start(`${id}-lower`), tl.end(`${id}-turn`), 'smooth')),
      c0: lerp(sweepRange(prev.beta), 0, tl.at(`${id}-lower`)),
      changing: prev.beta !== cur.beta,
      sweeping: false,
    };
  }
  if (tl.u < tl.end(`${id}-drop`)) {
    return { beta: cur.beta, c0: lerp(0, -rCur, tl.at(`${id}-drop`)), changing: false, sweeping: false };
  }
  if (tl.u < tl.end(`${id}-sweep`)) {
    return { beta: cur.beta, c0: lerp(-rCur, rCur, tl.at(`${id}-sweep`)), changing: false, sweeping: true };
  }
  return { beta: cur.beta, c0: rCur, changing: false, sweeping: false };
}

/**
 * 조작 모드의 훑기. 훑는 시간은 자동 진행의 훑기 단계와 같고, 그 뒤 `MANUAL_REST` 머문다.
 * 시간표는 조작 모드를 모르므로 조각이 제 시계로 센다 (NOTES 「어휘 부족」).
 */
export function manualSweep(state: SpacetimeDiagramState, sweepDuration: number): Sweep {
  const period = sweepDuration + MANUAL_REST;
  const u = (((state.clock - state.since) % period) + period) % period;
  const r = sweepRange(state.beta);
  const sweeping = u < sweepDuration;
  return {
    beta: state.beta,
    c0: sweeping ? lerp(-r, r, u / sweepDuration) : r,
    changing: state.beta !== state.target,
    sweeping,
  };
}

/** 사건마다: 지금 선이 지나갔는지, 지난 뒤 흐른 양(ct), 관찰자에게 몇 번째인지. */
export function eventReadings(sweep: Sweep): { x: number; lit: boolean; since: number; order: number }[] {
  const q = quant(sweep.beta);
  return EVENTS.map((e) => {
    const since = sweep.c0 + q * e.x;
    // 관찰자 시각의 순서를 정하는 값 (γ 배는 순서에 무관)
    const te = -q * e.x;
    const order = 1 + EVENTS.filter((o) => -q * o.x < te - 1e-9).length;
    return { x: e.x, lit: since >= -1e-9, since, order };
  });
}

/** 관찰자 위치: 세계선 x = β·ct 와 지금 선 ct = c0 + β x 의 교점. */
export function observerAt(sweep: Sweep): { x: number; ct: number } {
  const g2 = 1 / (1 - sweep.beta * sweep.beta);
  const ct = sweep.c0 * g2;
  return { x: sweep.beta * ct, ct };
}

// ------------------------------------------------------------------------
// step 이 쓰는 시간표 읽기
// ------------------------------------------------------------------------
//
// `step` 은 엔진의 `TimelineFrame` 을 받지 못한다(장부 G01). 조작기 표시와 캡션 값이
// 자동 속도를 따라가야 하고, 조작을 시작한 순간의 속도도 알아야 해서 같은 선언에서
// 같은 셈을 다시 한다.

const EASE: Record<TimelineEase, (x: number) => number> = {
  linear: (x) => x,
  smooth: (x) => x * x * (3 - 2 * x),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};
const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

export function readPhases(clock: number): PhaseReader {
  const phases: readonly TimelinePhase[] = spacetimeDiagramSchema.timeline!.phases;
  const starts = new Map<string, TimelinePhase & { start: number }>();
  let acc = 0;
  for (const p of phases) {
    starts.set(p.id, { ...p, start: acc });
    acc += p.duration;
  }
  const period = acc;
  const u = ((clock % period) + period) % period;
  const get = (id: string): TimelinePhase & { start: number } => {
    const p = starts.get(id);
    if (!p) throw new Error(`spacetime-diagram: 시간표에 없는 단계 '${id}'`);
    return p;
  };
  return {
    u,
    start: (id) => get(id).start,
    end: (id) => get(id).start + get(id).duration,
    duration: (id) => get(id).duration,
    at: (id) => {
      const p = get(id);
      return EASE[p.ease ?? 'linear'](clamp01((u - p.start) / p.duration));
    },
    span: (from, to, ease) => EASE[ease ?? 'linear'](clamp01((u - from) / (to - from))),
  };
}

// ------------------------------------------------------------------------
// 상태
// ------------------------------------------------------------------------

export function derive(s: Omit<SpacetimeDiagramState, 'speedText' | 'manualCaption'>): SpacetimeDiagramState {
  const q = quant(s.beta);
  const changing = s.manual && s.beta !== s.target;
  const still = s.manual && !changing;
  return {
    ...s,
    slider: s.manual ? s.slider : Number(q.toFixed(2)),
    speedText: Math.abs(q).toFixed(2),
    manualCaption: {
      changing,
      rest: still && q === 0,
      right: still && q > 0,
      left: still && q < 0,
    },
  };
}

export function step(params: { state: SpacetimeDiagramState; dt: number }): SpacetimeDiagramState {
  const { state: s, dt } = params;
  const clock = s.clock + dt;
  let { manual, beta, target, since } = s;

  if (s.held && !manual) {
    // 처음 잡은 순간 — 자동 순환을 멈추고 지금 속도에서 출발한다.
    manual = true;
    beta = autoSweep(readPhases(s.clock)).beta;
    since = s.clock;
  }

  if (manual) {
    target = s.slider;
    beta += (target - beta) * Math.min(1, dt * SPEED_FOLLOW);
    if (Math.abs(target - beta) < 0.002) beta = target;
  } else {
    beta = autoSweep(readPhases(clock)).beta;
    target = beta;
  }

  return derive({ ...s, clock, manual, beta, target, since });
}
