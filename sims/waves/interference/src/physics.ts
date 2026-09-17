// ========================================================================
// interference — 순수 물리
// ========================================================================
// 수면 높이장 h(x, y, t) = 첫째 파원 물결 + 둘째 파원 물결(앞머리와 꼬리 사이에서만).
// 둘은 진동수 · 위상이 같다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import { WAVELENGTH, WAVE_SPEED } from './schema';
import type { InterferenceState } from './state';

const K = (2 * Math.PI) / WAVELENGTH;
const OMEGA = (2 * Math.PI * WAVE_SPEED) / WAVELENGTH;

/** 거리에 따라 약하게 줄어드는 진폭. 1/√r 그대로면 멀리서 무늬가 어두워진다. */
export function amplitudeAt(r: number): number {
  return 1 / Math.sqrt(1 + r / 40);
}

/** 물결 앞머리 · 꼬리를 반 파장에 걸쳐 부드럽게. `d` 는 경계까지 남은 거리. */
export function edge(d: number): number {
  const u = Math.min(1, Math.max(0, d / (WAVELENGTH * 0.5) + 0.5));
  return u * u * (3 - 2 * u);
}

/**
 * 한 자리의 수면 높이.
 *
 * @param r1 첫째 파원까지 거리
 * @param r2 둘째 파원까지 거리
 * @param t 조각 시계(초) — 위상은 주기로 끊지 않고 이어진다
 * @param front 둘째 물결 앞머리 반지름. 켜지기 전이면 `null`
 * @param tail 둘째 물결 꼬리 반지름. 꺼지기 전이면 `null`
 */
export function heightAt(
  r1: number,
  r2: number,
  t: number,
  front: number | null,
  tail: number | null,
): number {
  const phase = OMEGA * t;
  let h = amplitudeAt(r1) * Math.sin(K * r1 - phase);
  if (front !== null) {
    const covered = edge(front - r2) * (tail !== null ? 1 - edge(tail - r2) : 1);
    if (covered > 0) h += covered * amplitudeAt(r2) * Math.sin(K * r2 - phase);
  }
  return h;
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: InterferenceState }): InterferenceState {
  return params.state;
}
