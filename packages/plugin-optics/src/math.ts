import type { Vec2 } from '@aperi21/schema';

/** 2D 스칼라 곱. */
export const dot = (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1];

/** 길이. */
export const len = (v: Vec2): number => Math.hypot(v[0], v[1]);

/** 정규화. zero 벡터는 [0,0]. */
export function norm(v: Vec2): Vec2 {
  const L = len(v);
  if (L < 1e-12) return [0, 0];
  return [v[0] / L, v[1] / L];
}

/** 벡터 - 스칼라 곱. */
export const scale = (v: Vec2, k: number): Vec2 => [v[0] * k, v[1] * k];

/** 벡터 덧셈/뺄셈. */
export const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];

/** 반사: n 은 표면 법선(단위벡터). */
export function reflect(incident: Vec2, n: Vec2): Vec2 {
  const d = dot(incident, n);
  return sub(incident, scale(n, 2 * d));
}

/**
 * Snell 굴절. n 은 진행방향 반대쪽(입사 매질 방향) 법선이어야 한다.
 * eta = n1/n2. 전반사 발생 시 반사 벡터를 돌려준다 (반사 fallback).
 */
export function refract(incident: Vec2, n: Vec2, eta: number): Vec2 {
  const cosI = -dot(incident, n);
  const sinT2 = eta * eta * (1 - cosI * cosI);
  if (sinT2 > 1) {
    // 전반사
    return reflect(incident, n);
  }
  const cosT = Math.sqrt(1 - sinT2);
  // r = eta*I + (eta*cosI - cosT)*n
  return [
    eta * incident[0] + (eta * cosI - cosT) * n[0],
    eta * incident[1] + (eta * cosI - cosT) * n[1],
  ];
}
