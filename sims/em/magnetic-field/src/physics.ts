// ========================================================================
// magnetic-field — 순수 물리
// ========================================================================
// 장 — 막대자석을 **극면 자하 모형**으로 본다. 고르게 자화된 막대는 양 끝면에 자극이
// 퍼져 있는 것과 같은 장을 만든다: N 끝면에 +m, S 끝면에 −m 을 폭 방향으로 나눠 두고
// 각 점이 역제곱 장을 낸다. 합한 장은 N극에서 나와 S극으로 휘어 든다.
//
// 쇳가루 — 머리 없는 막대다(θ 와 θ+π 가 같은 쇳가루). 장을 따라 도는 식은
//   δ' = −(k|B|/2)·sin 2δ    (δ = 쇳가루 각 − 장의 각, k = 정렬 배율)
// 이고, 닫힌 꼴의 해가 있다:
//   tan δ(τ) = tan δ₀ · exp(−k|B|τ)    (τ = 자석을 놓은 뒤 흐른 시간)
// `@aperi21/plugin-em` 의 `followAngle` 은 이 식을 한 걸음씩 적분하는 도구인데,
// 여기서는 닫힌 꼴이 있어 쌓는 상태가 필요 없다 — 같은 시각은 언제나 같은 화면이다.
//
// 돌아서는 빠르기가 |B| 에 비례하므로 극 가까이는 순식간에, 먼 곳은 몇 초가 지나도 덜
// 돈다. 쇳가루는 **옮겨 가지 않는다** — 자리는 흩뿌린 그대로이고 각만 바뀐다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  ALIGN_RATE,
  FILING_COUNT,
  FILING_LENGTH,
  FILING_LENGTH_SPREAD,
  MAGNET_CLEARANCE,
  MAGNET_LENGTH,
  MAGNET_WIDTH,
  PAPER,
  POLE_STRENGTH,
  SEED,
} from './schema';
import type { MagneticFieldState } from './state';

/** 극면 하나를 폭 방향으로 나누는 점 수. 끝면에 퍼진 자극을 이만큼의 점으로 근사한다. */
const POLE_FACE_SAMPLES = 7;
/** 장이 0 에 가까운 자리에서 각을 정하지 않는 문턱. */
const FIELD_EPSILON = 1e-9;
/** 흩뿌린 자리가 자석 위에 떨어지면 다시 뽑는 최대 횟수. */
const MAX_REDRAW = 32;

export interface MagneticFieldConstants {
  /** 막대자석 길이 · 폭(월드). */
  magnetLength: number;
  magnetWidth: number;
  /** 자극 세기(무차원). */
  poleStrength: number;
  /** 정렬 배율(1/s per 세기 단위). */
  alignRate: number;
  /** 쇳가루 수. */
  filingCount: number;
  /** 흩뿌림 시드. */
  seed: number;
}

export function readConstants(stage: StageDef): MagneticFieldConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    magnetLength: c.magnetLength ?? MAGNET_LENGTH,
    magnetWidth: c.magnetWidth ?? MAGNET_WIDTH,
    poleStrength: c.poleStrength ?? POLE_STRENGTH,
    alignRate: c.alignRate ?? ALIGN_RATE,
    filingCount: Math.max(0, Math.round(c.filingCount ?? FILING_COUNT)),
    seed: c.seed ?? SEED,
  };
}

/** 시드 결정적 난수(mulberry32). `Math.random` 을 쓰지 않는다 (S-sim). */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Filing {
  /** 흩뿌린 자리(월드). 끝까지 바뀌지 않는다. */
  pos: Vec2;
  /** 흩뿌렸을 때의 각(rad). 머리가 없으므로 0~π 로 충분하다. */
  angle0: number;
  /** 길이(월드). */
  length: number;
}

function insideMagnet(c: MagneticFieldConstants, x: number, y: number): boolean {
  return (
    Math.abs(x) < c.magnetLength / 2 + MAGNET_CLEARANCE &&
    Math.abs(y) < c.magnetWidth / 2 + MAGNET_CLEARANCE
  );
}

/**
 * 흩뿌린 쇳가루 — (시드, 수)의 함수다. 종이 위에 고르게 떨어지고 자석 위에 떨어진 것은
 * 다시 뽑는다. 처음 각은 제각각이다.
 */
export function deriveFilings(c: MagneticFieldConstants): Filing[] {
  const rnd = makeRng(c.seed);
  const [lenMin, lenMax] = FILING_LENGTH_SPREAD;
  const out: Filing[] = [];
  for (let i = 0; i < c.filingCount; i++) {
    let x = 0;
    let y = 0;
    for (let k = 0; k < MAX_REDRAW; k++) {
      x = PAPER.minX + rnd() * (PAPER.maxX - PAPER.minX);
      y = PAPER.minY + rnd() * (PAPER.maxY - PAPER.minY);
      if (!insideMagnet(c, x, y)) break;
    }
    if (insideMagnet(c, x, y)) continue;
    const angle0 = rnd() * Math.PI;
    const length = FILING_LENGTH * (lenMin + rnd() * (lenMax - lenMin));
    out.push({ pos: [x, y], angle0, length });
  }
  return out;
}

/**
 * 한 자리의 자기장 [Bx, By]. N 끝면(+x)에 +m, S 끝면(−x)에 −m 을 폭 방향으로 고르게
 * 나눠 두고 역제곱 장을 더한다.
 */
export function fieldAt(c: MagneticFieldConstants, p: Vec2): Vec2 {
  const half = c.magnetLength / 2;
  const q = c.poleStrength / POLE_FACE_SAMPLES;
  let bx = 0;
  let by = 0;
  for (let j = 0; j < POLE_FACE_SAMPLES; j++) {
    const s = POLE_FACE_SAMPLES > 1 ? j / (POLE_FACE_SAMPLES - 1) - 0.5 : 0;
    const yj = s * c.magnetWidth;
    for (const [px, sign] of [
      [half, 1],
      [-half, -1],
    ] as const) {
      const dx = p[0] - px;
      const dy = p[1] - yj;
      const r2 = dx * dx + dy * dy;
      const r3 = r2 * Math.sqrt(r2);
      if (r3 < FIELD_EPSILON) continue;
      bx += (sign * q * dx) / r3;
      by += (sign * q * dy) / r3;
    }
  }
  return [bx, by];
}

/**
 * 자석을 놓은 뒤 `tau` 초가 흐른 때의 쇳가루 각(rad).
 *
 * `tan δ = tan δ₀ · exp(−k|B|τ)` — 머리 없는 막대라 δ₀ 를 (−π/2, π/2] 로 접는다.
 * 그래야 쇳가루가 가까운 쪽으로 돈다(반 바퀴 넘게 돌지 않는다).
 */
export function filingAngle(
  c: MagneticFieldConstants,
  filing: Filing,
  field: Vec2,
  tau: number,
): number {
  const b = Math.hypot(field[0], field[1]);
  if (tau <= 0 || b < FIELD_EPSILON) return filing.angle0;
  const phi = Math.atan2(field[1], field[0]);
  let d0 = filing.angle0 - phi;
  d0 -= Math.PI * Math.round(d0 / Math.PI);
  const d = Math.atan(Math.tan(d0) * Math.exp(-c.alignRate * b * tau));
  return phi + d;
}

/** 상태가 시계뿐인 조각이다 — 모든 것이 시간표 시각의 함수라 항등이다. */
export function step(params: { state: MagneticFieldState }): MagneticFieldState {
  return params.state;
}
