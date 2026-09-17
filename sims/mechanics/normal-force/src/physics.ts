// ========================================================================
// normal-force — 순수 물리
// ========================================================================
// 바닥은 밀 수만 있고 당길 수 없다. 닿아 있는 동안 수직항력은 "뚫리지 않으려면
// 밀어야 할 힘" W − F 이고, 그것이 0 이하가 되는 순간 접촉이 풀려 상자가 뜬다.
// 뜬 동안은 (F − W)/m 로 적분하다 바닥에 닿으면 즉시 멈춘다 (충격 스파이크 없음).
// ========================================================================

import type { StageDef, TimelineEase } from '@aperi21/schema';
import { DEFAULT_CONSTANTS, normalForceSchema } from './schema';
import type { NormalForceState } from './state';

/** 원본 고정 걸음(1/60 s). 러너의 가변 dt 를 이 크기 이하로 쪼개 원본과 같은 적분을 한다. */
const MAX_DT = 1 / 60;

export interface NormalForceConstants {
  g: number;
  mass: number;
  /** 무게(N). */
  weight: number;
}

type Constants = Record<string, number> | undefined;

function readNumber(c: Constants, k: keyof typeof DEFAULT_CONSTANTS): number {
  return c?.[k] ?? DEFAULT_CONSTANTS[k];
}

export function readConstants(c: Constants): NormalForceConstants {
  const g = readNumber(c, 'g');
  const mass = readNumber(c, 'mass');
  return { g, mass, weight: mass * g };
}

/** 단계 이징 — 엔진 시간표와 같은 곡선 (`smooth` = smoothstep). */
const EASES: Record<TimelineEase, (x: number) => number> = {
  linear: (x) => x,
  smooth: (x) => x * x * (3 - 2 * x),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};

/** 그 단계가 끝날 때의 막대 힘(N). 스테이지 상수 `rodForce.<id>`. */
function rodForceEnd(c: Constants, phaseId: string): number {
  const k = `rodForce.${phaseId}`;
  const v = c?.[k] ?? (DEFAULT_CONSTANTS as Record<string, number>)[k];
  if (v === undefined) throw new Error(`normal-force: 막대 힘을 모르는 단계 '${phaseId}'`);
  return v;
}

/**
 * 조각 시계 `t` 에서의 막대 힘(N, 위가 +).
 *
 * `step` 은 TimelineFrame 을 받지 못한다. 그래서 선언의 단계 길이 · 이징을 여기서 한 번 더
 * 훑는다 (NOTES 「어휘 부족」). 재생 속도 · `startAt` 을 쓰지 않는 시간표라 이 셈이 엔진과 같다.
 */
export function rodForceAt(t: number, c: Constants): number {
  const phases = normalForceSchema.timeline!.phases;
  const period = phases.reduce((sum, p) => sum + p.duration, 0);
  let u = ((t % period) + period) % period;
  let from = rodForceEnd(c, phases[phases.length - 1]!.id);
  for (const phase of phases) {
    const to = rodForceEnd(c, phase.id);
    if (u <= phase.duration) {
      const e = EASES[phase.ease ?? 'linear'](u / phase.duration);
      return from + (to - from) * e;
    }
    u -= phase.duration;
    from = to;
  }
  return from;
}

/**
 * 표시 값과 캡션 조건을 채운다. 막대 힘을 정수로 반올림하고 수직항력은 그 정수에서
 * 유도한다 — 반올림 때문에 세 숫자의 합이 어긋나는 프레임이 생기지 않게 (원본 `shown`).
 */
function withDisplay(s: NormalForceState, k: NormalForceConstants): NormalForceState {
  const Fd = Math.round(s.F) || 0; // −0 을 0 으로
  const Nd = s.contact ? Math.max(0, k.weight - Fd) : 0;
  return {
    ...s,
    Fd,
    Nd,
    floating: !s.contact && Fd >= k.weight,
    falling: !s.contact && Fd < k.weight,
    balanced: s.contact && Nd === 0,
    pulling: s.contact && Nd !== 0 && Fd > 0,
    pressing: s.contact && Nd !== 0 && Fd < 0,
  };
}

/** 지금 시계의 막대 힘으로 접촉 상태의 힘을 맞춘다. 초기 상태가 쓴다. */
export function settle(s: NormalForceState, c: Constants): NormalForceState {
  const k = readConstants(c);
  const F = rodForceAt(s.t, c);
  const N = s.contact ? Math.max(0, k.weight - F) : 0;
  return withDisplay({ ...s, F, N }, k);
}

/** 원본 `step(dt, t)` 한 걸음 — 힘은 걸음 시작 시각의 것. */
function advance(s: NormalForceState, dt: number, c: Constants, k: NormalForceConstants): NormalForceState {
  const F = rodForceAt(s.t, c);
  let { contact, h, v, N } = s;
  if (contact) {
    const need = k.weight - F; // 바닥이 뚫리지 않으려면 밀어야 할 힘
    if (need > 0) {
      N = need;
      h = 0;
      v = 0;
    } else {
      contact = false; // 바닥이 당길 수는 없다 → 뜬다
      N = 0;
    }
  }
  if (!contact) {
    const a = (F - k.weight) / k.mass;
    v += a * dt;
    h += v * dt;
    if (h <= 0) {
      h = 0;
      v = 0;
      contact = true;
      N = Math.max(0, k.weight - F);
    } else {
      N = 0;
    }
  }
  return { ...s, t: s.t + dt, F, contact, h, v, N };
}

/** 한 스텝 전진. 순수 함수 — DOM·캔버스·시간을 모른다. */
export function step(params: { state: NormalForceState; dt: number; stage: StageDef }): NormalForceState {
  const { state, dt, stage } = params;
  if (!(dt > 0)) return state;
  const c = stage.constants as Constants;
  const k = readConstants(c);
  const n = Math.ceil(dt / MAX_DT - 1e-9);
  const sub = dt / n;
  let s = state;
  for (let i = 0; i < n; i++) s = advance(s, sub, c, k);
  return withDisplay(s, k);
}
