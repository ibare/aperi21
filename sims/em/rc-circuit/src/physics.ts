// ========================================================================
// rc-circuit — 순수 물리
// ========================================================================
// 전지 전압을 1 로 둔 무차원. 충전은 1 을 향해, 방전은 0 을 향해 τ 로 다가간다.
// 원본은 τ 경계에서 끊어 가며 정확한 지수 갱신으로 전진했다. 여기서는 주기 첫머리
// 전압과 주기 위치의 해석해를 쓴다 — dt 크기와 상관없이 τ 막대의 비가 0.368 이다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import { CHARGE_SPAN, CYCLE, DEFAULT_R, DOT_GAP, FLOW_GAIN, TAUS, TAU_DEFAULT } from './schema';
import type { RcCircuitState } from './state';

type Core = Pick<RcCircuitState, 'r' | 'shownR' | 'held' | 'u' | 'v0' | 'flow'>;

/** 저항 단의 τ(초). 없는 단이면 기본. */
export function tauOf(r: number): number {
  return TAUS[r] ?? TAUS[DEFAULT_R]!;
}

export const isCharging = (u: number): boolean => u < CHARGE_SPAN;

/** 가려는 값(충전: 1, 방전: 0)까지 남은 전압. */
export const gapOf = (v: number, charging: boolean): number => (charging ? 1 - v : v);

/** 주기 첫머리 전압 `v0` 에서 출발해 주기 위치 `u`(τ) 에 이른 축전기 전압. */
export function vAt(v0: number, u: number): number {
  const charged = (w: number): number => 1 + (v0 - 1) * Math.exp(-w);
  if (u <= CHARGE_SPAN) return charged(u);
  return charged(CHARGE_SPAN) * Math.exp(-(u - CHARGE_SPAN));
}

/** 캡션 · 글자가 읽는 값을 채운다. */
export function derive(core: Core): RcCircuitState {
  const charging = isCharging(core.u);
  return {
    ...core,
    charging,
    discharging: !charging,
    tauText: tauOf(core.shownR).toFixed(1),
  };
}

/** 저항을 바꾸면 충전부터 다시 시작한다 — τ 단위 그래프가 섞이지 않게. */
function restartFrom(r: number, held: boolean): RcCircuitState {
  return derive({ r, shownR: r, held, u: 0, v0: 0, flow: 0 });
}

export function step(params: { state: RcCircuitState; dt: number }): RcCircuitState {
  const s = params.state;
  if (s.held || s.r !== s.shownR) return restartFrom(s.r, false);

  const T = tauOf(s.shownR);
  const gapBefore = gapOf(vAt(s.v0, s.u), isCharging(s.u));
  let u = s.u + params.dt / T;
  let v0 = s.v0;
  // 한 주기(10τ)가 끝나면 그래프를 비우고 그 순간 전압에서 다시 충전한다.
  while (u >= CYCLE) {
    v0 = vAt(v0, CYCLE);
    u -= CYCLE;
  }
  const gapAfter = gapOf(vAt(v0, u), isCharging(u));
  // 흐름의 세기 ∝ 남은 차이 / R  (R ∝ τ)
  const current = 0.5 * (gapBefore + gapAfter) * (TAU_DEFAULT / T);
  const flow = (s.flow + FLOW_GAIN * current * params.dt) % DOT_GAP;
  return derive({ r: s.r, shownR: s.shownR, held: false, u, v0, flow });
}

/** 곡선 표본 간격(τ). 원본은 프레임마다 점을 쌓았다 — 해석해를 이 간격으로 뽑는다. */
const CURVE_STEP = 0.04;

/** 이번 주기의 축전기 전압 궤적 `(u, v)` — 0 에서 지금까지. */
export function voltageTrace(v0: number, u: number): Vec2[] {
  const out: Vec2[] = [];
  for (let w = 0; w < u; w += CURVE_STEP) out.push([w, vAt(v0, w)]);
  out.push([u, vAt(v0, u)]);
  return out;
}

export interface TauMark {
  /** τ 눈금 번호. */
  k: number;
  /** 그 순간의 축전기 전압. */
  v: number;
  /** 그 순간의 구간 — 막대가 향하는 값(충전 1 · 방전 0)이 여기서 정해진다. */
  charging: boolean;
}

/** 지나온 τ 눈금마다 남긴 남은 차이 — 0τ 부터 지금 위치 이하의 눈금까지. */
export function tauMarks(v0: number, u: number): TauMark[] {
  const out: TauMark[] = [];
  for (let k = 0; k <= Math.floor(u + 1e-9) && k < CYCLE; k++) {
    out.push({ k, v: vAt(v0, k), charging: isCharging(k) });
  }
  return out;
}
