// ========================================================================
// irreversibility — 순수 물리
// ========================================================================
// DOM · 캔버스 · 실시간을 모른다. 난수는 스테이지 상수의 시드에서만 나온다.
//
// 모든 것이 **필름 시각**의 닫힌 식이다 — 공의 높이, 알갱이마다의 떨림 세기와 자리.
// 그래서 같은 식에 거꾸로 흐르는 시각을 넣으면 그대로 되감긴 장면이 된다. `step` 에
// 쌓지 않는다 (S-sim).
//
//   공      반발 계수 e 로 튀는 자유 낙하. 충돌 시각 · 충돌 직전 속력을 한 번 목록으로 만든다.
//   열      충돌마다 잃은 운동 에너지 (1 − e²)·½v² 가 충돌점에 모였다가 확산으로 번진다 —
//           알갱이 i 가 받는 몫은 충돌점과의 거리에 대한 가우스 가중(폭² = 처음 폭² + 2Dτ)을
//           모든 알갱이에 대해 1 로 맞춘 것. 오래 지나면 고르게 나뉜다.
//   명암    같은 몫을 바닥 격자 칸마다 읽어 한 역할(accent)의 명암으로 — 열이 모인 곳이 짙다.
//   떨림    알갱이마다 시드로 뽑은 진동수 · 위상의 흔들림. 진폭² = 잔떨림² + 배율² × (받은 몫).
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import type { IrreversibilityState } from './state';

/**
 * 충돌 목록을 끊는 체공 시간(초). 이보다 짧게 튀는 것은 화면에서 구별되지 않으므로
 * 마지막 충돌에서 남은 운동 에너지를 모두 바닥에 넘기고 공을 세운다. 수치 계산의 끝맺음이지
 * 물리량이 아니다.
 */
export const MIN_FLIGHT_S = 0.02;

export interface FloorConstants {
  /** 중력 가속도(m/s²). */
  gravity: number;
  /** 공 아랫면의 처음 높이(m). */
  dropHeight: number;
  /** 반발 계수 — 튄 뒤 속력 / 부딪히기 전 속력. */
  restitution: number;
  /** 공 반지름(m). */
  ballRadius: number;
  /** 알갱이 격자 가로 · 세로 수, 간격(m). */
  grainCols: number;
  grainRows: number;
  grainSpacing: number;
  /** 떨림 진동수 · 위상을 뽑는 시드. */
  seed: number;
  /** 떨림 각진동수의 가운데 값 · 퍼짐(rad/s). */
  jitterFreq: number;
  jitterFreqSpread: number;
  /** 처음 잔떨림 진폭(m) — 표시 배율. */
  baseJitter: number;
  /** 공의 처음 에너지를 알갱이 하나가 다 받았을 때의 진폭(m) — 표시 배율. */
  heatJitter: number;
  /** 부딪힌 순간 떨림이 모인 폭(m). */
  impactWidth: number;
  /** 떨림이 번지는 빠르기(m²/s). */
  diffusivity: number;
  /** 열 명암이 가득 차는 알갱이 하나의 몫(처음 에너지에 대한 비) — 표시 배율. */
  heatShadeFull: number;
}

export function readConstants(stage: StageDef): FloorConstants {
  const c = stage.constants ?? {};
  return {
    gravity: c.gravity ?? 9.8,
    dropHeight: c.dropHeight ?? 1,
    restitution: c.restitution ?? 0.7,
    ballRadius: c.ballRadius ?? 0.1,
    grainCols: Math.max(1, Math.round(c.grainCols ?? 25)),
    grainRows: Math.max(1, Math.round(c.grainRows ?? 4)),
    grainSpacing: c.grainSpacing ?? 0.13,
    seed: c.seed ?? 7,
    jitterFreq: c.jitterFreq ?? 22,
    jitterFreqSpread: c.jitterFreqSpread ?? 8,
    baseJitter: c.baseJitter ?? 0.004,
    heatJitter: c.heatJitter ?? 0.22,
    impactWidth: c.impactWidth ?? 0.07,
    diffusivity: c.diffusivity ?? 0.2,
    heatShadeFull: c.heatShadeFull ?? 0.04,
  };
}

// ------------------------------------------------------------------------
// 공
// ------------------------------------------------------------------------

/** 충돌 하나 — 시각(떨어뜨린 뒤 초)과 그때 바닥에 넘긴 에너지(처음 에너지에 대한 몫). */
export interface Impact {
  readonly t: number;
  /** 튀어 오르는 속력(m/s). 마지막 충돌은 0 — 공이 선다. */
  readonly upSpeed: number;
  /** 바닥이 받은 몫 0~1. 모든 충돌의 합이 1 이다. */
  readonly share: number;
}

/**
 * 충돌 목록. 떨어뜨린 순간(τ = 0)부터 공이 설 때까지.
 * 에너지는 단위 질량당으로 센다 — 처음 에너지 g·h₀ 에 대한 몫만 쓰므로 질량이 필요 없다.
 */
export function impactsOf(c: FloorConstants): Impact[] {
  const g = c.gravity;
  const e = c.restitution;
  const total = g * c.dropHeight;
  const out: Impact[] = [];
  let t = Math.sqrt((2 * c.dropHeight) / g);
  let v = Math.sqrt(2 * g * c.dropHeight);
  for (;;) {
    const up = e * v;
    const flight = (2 * up) / g;
    if (flight < MIN_FLIGHT_S || !(e > 0)) {
      // 남은 운동 에너지를 모두 넘기고 선다.
      out.push({ t, upSpeed: 0, share: (0.5 * v * v) / total });
      return out;
    }
    out.push({ t, upSpeed: up, share: ((1 - e * e) * 0.5 * v * v) / total });
    t += flight;
    v = up;
  }
}

/** 떨어뜨린 뒤 τ 초의 공 아랫면 높이(m). τ < 0 이면 처음 높이에 있다. */
export function ballHeight(c: FloorConstants, impacts: readonly Impact[], tau: number): number {
  const g = c.gravity;
  const first = impacts[0];
  if (tau <= 0 || !first) return c.dropHeight;
  if (tau < first.t) return c.dropHeight - 0.5 * g * tau * tau;
  for (let k = 0; k < impacts.length; k++) {
    const hit = impacts[k]!;
    const next = impacts[k + 1];
    if (!next || tau < next.t) {
      const dt = tau - hit.t;
      if (hit.upSpeed === 0) return 0;
      return Math.max(0, hit.upSpeed * dt - 0.5 * g * dt * dt);
    }
  }
  return 0;
}

// ------------------------------------------------------------------------
// 알갱이
// ------------------------------------------------------------------------

/** 알갱이 하나 — 쉬는 자리와 떨림의 진동수 · 위상(가로 · 세로 따로). */
export interface Grain {
  readonly x: number;
  readonly y: number;
  readonly wx: number;
  readonly wy: number;
  readonly px: number;
  readonly py: number;
}

/** mulberry32 — 시드 결정적 난수. 다른 sim 의 것을 import 하지 않고 여기 둔다 (S-sim). */
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

/**
 * 알갱이 격자. 윗줄 중심이 바닥 윗면(y = 0)에서 간격 반만큼 아래이고, 가로 가운데 알갱이가
 * 공 바로 밑(x = 0)에 온다. 진동수 · 위상은 뽑는 순서까지 고정이라 같은 시드면 같은 바닥이다.
 */
export function sampleGrains(c: FloorConstants): Grain[] {
  const random = mulberry32(c.seed);
  const out: Grain[] = [];
  const half = (c.grainCols - 1) / 2;
  const freq = (): number => c.jitterFreq + (random() * 2 - 1) * c.jitterFreqSpread;
  for (let j = 0; j < c.grainRows; j++) {
    for (let i = 0; i < c.grainCols; i++) {
      out.push({
        x: (i - half) * c.grainSpacing,
        y: -(j + 0.5) * c.grainSpacing,
        wx: freq(),
        wy: freq(),
        px: 2 * Math.PI * random(),
        py: 2 * Math.PI * random(),
      });
    }
  }
  return out;
}

/**
 * 떨어뜨린 뒤 τ 초에 자리 `points` 마다의 열의 몫(처음 에너지에 대한 비, **알갱이 하나의 자리당**).
 * 충돌점은 바닥 윗면 가운데(0, 0)다. 충돌마다 가우스 가중을 **알갱이 전체에 대해** 1 로 맞추므로,
 * 알갱이 자리에서 읽은 몫의 합은 지금까지 공이 잃은 에너지와 같다. 알갱이 사이의 자리(scalarField 칸)도
 * 같은 가중으로 읽어 그 둘레 알갱이 하나가 가질 몫을 준다.
 */
export function heatAt(
  c: FloorConstants,
  grains: readonly Grain[],
  impacts: readonly Impact[],
  tau: number,
  points: readonly Vec2[],
): number[] {
  const out = new Array<number>(points.length).fill(0);
  const grainD2 = grains.map((g) => g.x * g.x + g.y * g.y);
  const pointD2 = points.map(([x, y]) => x * x + y * y);
  const w0 = c.impactWidth * c.impactWidth;
  for (const hit of impacts) {
    if (tau < hit.t) break;
    const width2 = w0 + 2 * c.diffusivity * (tau - hit.t);
    let sum = 0;
    for (const d2 of grainD2) sum += Math.exp(-d2 / (2 * width2));
    if (sum <= 0) continue;
    for (let i = 0; i < points.length; i++) {
      out[i]! += (hit.share * Math.exp(-pointD2[i]! / (2 * width2))) / sum;
    }
  }
  return out;
}

/**
 * 필름 시각 s 의 알갱이 자리와 그 순간 속도(필름 시각에 대한 미분). 진폭은 떨어뜨린 뒤
 * τ 초의 열 몫에서 온다. 속도는 진폭이 변하는 몫을 빼고 흔들림만 미분한다 — 자취 획의
 * 방향 · 길이를 위한 것이라 그걸로 충분하다.
 */
export function grainsAt(
  c: FloorConstants,
  grains: readonly Grain[],
  impacts: readonly Impact[],
  s: number,
  tau: number,
): { positions: Vec2[]; velocities: Vec2[] } {
  const shares = heatAt(c, grains, impacts, tau, grains.map((g): Vec2 => [g.x, g.y]));
  const base2 = c.baseJitter * c.baseJitter;
  const heat2 = c.heatJitter * c.heatJitter;
  const positions: Vec2[] = [];
  const velocities: Vec2[] = [];
  for (let i = 0; i < grains.length; i++) {
    const g = grains[i]!;
    const a = Math.sqrt(base2 + heat2 * shares[i]!);
    const ax = g.wx * s + g.px;
    const ay = g.wy * s + g.py;
    positions.push([g.x + a * Math.cos(ax), g.y + a * Math.sin(ay)]);
    velocities.push([-a * g.wx * Math.sin(ax), a * g.wy * Math.cos(ay)]);
  }
  return { positions, velocities };
}

/**
 * 상태가 쌓는 것이 없다 — 모든 것이 필름 시각의 닫힌 식이고, 시각은 엔진이 scene 에
 * `params.timeline` 으로 준다. 빈 걸음을 둔다 (S-sim 「상태가 시계뿐인 조각」).
 */
export function step(params: { state: IrreversibilityState }): IrreversibilityState {
  return params.state;
}
