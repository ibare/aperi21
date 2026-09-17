// ========================================================================
// gyroscopic-precession — 순수 물리 · 투영
// ========================================================================
// 빠른 팽이 근사: L 은 축 방향, 세차 각속도 Ω = τ / |L|. 끄덕임(장동)은 뺐다.
//
// 3 차원 점을 고정 시점으로 투영하는 수식은 원본 그대로다. 엔진에 3 차원 어휘가 없어
// 조각이 투영 평면 좌표(단위 = 세계 길이)를 계산해 월드 좌표로 넘긴다 (NOTES 「어휘 부족」).
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import { DEPOSIT, ELEV, SEED, SPIN_RATE, TAU, YAW } from './schema';
import type { GyroscopicPrecessionState } from './state';

export type Vec3 = readonly [number, number, number];

/** 고정 비스듬 시점 투영. 결과는 투영 평면 좌표 — y 가 위. */
export function project(p: Vec3): Vec2 {
  const xr = p[0] * Math.cos(YAW) - p[1] * Math.sin(YAW);
  const depth = p[0] * Math.sin(YAW) + p[1] * Math.cos(YAW);
  const yr = p[2] * Math.cos(ELEV) - depth * Math.sin(ELEV);
  return [xr, yr];
}

export const add3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul3 = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
/** 축 방향(수평). */
export const axis = (phi: number): Vec3 => [Math.cos(phi), Math.sin(phi), 0];
/** 축과 직각인 수평 방향 — 돌림힘 방향. */
export const side = (phi: number): Vec3 => [-Math.sin(phi), Math.cos(phi), 0];

/** 세차 한 바퀴 시간(초) = 2π|L| / τ. */
export function precessionPeriod(L: number): number {
  return (2 * Math.PI * L) / TAU;
}

/** 도착 시(또는 스핀을 바꾼 직후) 미리 쌓아 둘 토막 경계 — 같은 세차 각속도로 역산한다. */
export function seedTips(phi: number, L: number): number[] {
  const tips: number[] = [];
  for (let k = SEED; k >= 1; k--) tips.push(phi - (k * DEPOSIT * TAU) / L);
  tips.push(phi);
  return tips;
}

export function step(params: { state: GyroscopicPrecessionState; dt: number }): GyroscopicPrecessionState {
  const { dt } = params;
  let s = params.state;

  // 스핀을 바꾸면 토막을 비운다 — 옛 반지름의 토막이 새 원과 섞이면 「길이 그대로」가 거짓처럼 보인다.
  if (s.spin !== s.L) {
    s = { ...s, L: s.spin, since: 0, tips: seedTips(s.phi, s.spin) };
  }

  const omega = TAU / s.L;
  const phi = s.phi + omega * dt;
  const psi = s.psi + SPIN_RATE * s.L * dt;
  let since = s.since + dt;
  let tips = s.tips;
  if (since >= DEPOSIT - 1e-9) {
    since -= DEPOSIT;
    tips = [...tips, phi - (since * TAU) / s.L];
    const keep = Math.ceil((2 * Math.PI * s.L) / (DEPOSIT * TAU)) + 1;
    if (tips.length > keep) tips = tips.slice(tips.length - keep);
  }
  return { ...s, phi, psi, since, tips };
}
