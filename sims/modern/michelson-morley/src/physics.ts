// ========================================================================
// michelson-morley — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 시각의 함수이고, `step` 은 항등이다.
//
// 에테르 가설의 예측 — 바람 v 를 따라 놓인 팔(길이 L)의 왕복 시간은
// 2L/c · 1/(1−β²), 가로지른 팔은 2L/c · 1/√(1−β²) (β = v/c). 둘의 차이는
// 길이로 L·β² 쯤이고, 팔이 바람과 θ 를 이룰 때 두 팔의 경로차는 L·β²·cos 2θ 에
// 비례한다. θ 를 0 → 90° 로 돌리면 경로차가 2L·β² 만큼 바뀌어, 무늬가
//
//     ΔN = 2L·β² / λ        (L = 11 m, λ = 500 nm, v = 30 km/s → 0.44)
//
// 무늬 밀린다. 돌린 각 θ 에서의 밀림은 ΔN · (1 − cos 2θ)/2 다.
//
// 관측 — 밀림이 없다. 에테르가 없으면(빛의 속력이 방향과 무관하면) 두 팔의
// 왕복 시간은 돌려도 바뀌지 않는다. 관측 띠는 이 조각에서 언제나 0 이다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ARM_LENGTH_M,
  ETHER_SPEED_KMS,
  FRINGE_PERIOD,
  LIGHT_SPEED_KMS,
  PREDICTED_SHIFT_LABEL,
  STRIP_X0,
  STRIP_X1,
  TURN_DEGREES,
  WAVELENGTH_NM,
  WIND_MAX,
  WIND_MIN,
  WIND_SEED,
} from './schema';
import type { MichelsonMorleyState } from './state';

/** 무늬 띠를 표본하는 가로 칸 수 · 세로 칸 수. 세로로는 같은 값이라 두 줄이면 된다. */
export const FRINGE_COLS = 216;
export const FRINGE_ROWS = 2;
/** 에테르 바람 줄무늬의 개수와 흐르는 빠르기(월드/초). 빠르기는 그림의 결이지 30 km/s 의 축척이 아니다. */
export const WIND_COUNT = 30;
export const WIND_FLOW = 0.9;
/** 줄무늬마다 빠르기를 조금씩 달리한다 — 가장 느린 배수와 그 위로 벌어지는 폭. */
export const WIND_PACE_MIN = 0.85;
export const WIND_PACE_SPREAD = 0.3;
/** 줄무늬가 바람 영역 가장자리에서 옅어지는 폭(월드). */
export const WIND_EDGE_FADE = 0.6;
/** 줄무늬의 가장 짙은 불투명도 — 가정한 것이라 옅게 둔다. */
export const WIND_OPACITY = 0.55;

export interface MichelsonMorleyConstants {
  /** 팔 길이(m). */
  armLengthM: number;
  /** 파장(nm). */
  wavelengthNm: number;
  /** 가정한 에테르 바람의 속력(km/s). */
  etherSpeedKms: number;
  /** 빛의 속력(km/s). */
  lightSpeedKms: number;
  /** 화면에 띄우는 예측 밀림의 정박값(무늬). */
  predictedShiftLabel: number;
  /** 돌리는 각(도). */
  turnDegrees: number;
  /** 바람 줄무늬 시드. */
  seed: number;
}

export function readConstants(stage: StageDef): MichelsonMorleyConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    armLengthM: c.armLengthM ?? ARM_LENGTH_M,
    wavelengthNm: c.wavelengthNm ?? WAVELENGTH_NM,
    etherSpeedKms: c.etherSpeedKms ?? ETHER_SPEED_KMS,
    lightSpeedKms: c.lightSpeedKms ?? LIGHT_SPEED_KMS,
    predictedShiftLabel: c.predictedShiftLabel ?? PREDICTED_SHIFT_LABEL,
    turnDegrees: c.turnDegrees ?? TURN_DEGREES,
    seed: c.seed ?? WIND_SEED,
  };
}

/** 에테르 가설이 90° 회전에 대해 예측하는 무늬 밀림 2L·β²/λ (무늬 수). */
export function fullPredictedShift(c: MichelsonMorleyConstants): number {
  const beta = c.etherSpeedKms / c.lightSpeedKms;
  return (2 * c.armLengthM * beta * beta) / (c.wavelengthNm * 1e-9);
}

export interface Reading {
  /** 간섭계가 처음 방향에서 돈 각(rad, 반시계). */
  angle: number;
  /** 돌리는 각의 끝값(rad). */
  turnAngle: number;
  /** 에테르 가설이 지금 각에서 예측하는 밀림(무늬 수). */
  predictedShift: number;
  /** 관측된 밀림(무늬 수). 언제나 0 이다. */
  observedShift: number;
  /** 다 돌린 뒤 견주는 단계의 진행 — 치수선 · 각 글자를 켤지. 0 이면 끈다. */
  settled: number;
  /** 돌리기 앞머리(`turnIn`)의 진행도 — 처음 방향 점선이 짙어지고 팔 길이 치수선이 걷힌다. */
  turnIn: number;
}

/**
 * 지금 화면의 값. 단계 경계는 선언이 정한다 — 돌린 정도는 `turnIn`~`turn` 구간의 진행도에서
 * `return` 의 진행도를 뺀 것이다. 두 단계 사이(견주기)에는 1, 돌기 전과 되돌린 뒤에는 0.
 */
export function derive(tl: TimelineFrame, c: MichelsonMorleyConstants): Reading {
  // 돌리기는 `turnIn` · `turn` 두 단계에 걸친 한 번의 회전이다.
  const turned = tl.span(tl.start('turnIn'), tl.end('turn'), 'smooth') - tl.at('return');
  const turnAngle = (c.turnDegrees * Math.PI) / 180;
  const angle = turnAngle * turned;
  const predictedShift = (fullPredictedShift(c) * (1 - Math.cos(2 * angle))) / 2;
  // 견주는 단계에 들어선 뒤, 되돌리기가 시작되면 곧바로 끈다.
  const settled = tl.at('compare') > 0 && tl.at('return') === 0 ? 1 : 0;
  return { angle, turnAngle, predictedShift, observedShift: 0, settled, turnIn: tl.at('turnIn') };
}

/** 무늬 띠의 밝기(0~1). 밝은 무늬 하나가 띠 가운데 + `shift` 무늬에 온다. */
export function fringeValues(shift: number): number[] {
  const xc = (STRIP_X0 + STRIP_X1) / 2;
  const values: number[] = [];
  for (let r = 0; r < FRINGE_ROWS; r++) {
    for (let i = 0; i < FRINGE_COLS; i++) {
      const x = STRIP_X0 + ((i + 0.5) / FRINGE_COLS) * (STRIP_X1 - STRIP_X0);
      const ph = Math.PI * ((x - xc) / FRINGE_PERIOD - shift);
      const cs = Math.cos(ph);
      values.push(cs * cs);
    }
  }
  return values;
}

/** 시드를 받는 결정적 난수(mulberry32). 같은 시드는 언제나 같은 수열이다. */
function makeRandom(seed: number): () => number {
  let a = Math.floor(seed) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface WindStreaks {
  positions: Vec2[];
  velocities: Vec2[];
  opacities: number[];
}

/**
 * 가정한 에테르 바람 — 오른쪽에서 왼쪽으로 흐르는 줄무늬. 자리는 (시드, 조각 시계)의
 * 함수다. 주기 안 시각이 아니라 이어지는 시계 `t` 를 써서 주기가 바뀔 때 튀지 않는다.
 */
export function windStreaks(t: number, c: MichelsonMorleyConstants): WindStreaks {
  const rand = makeRandom(c.seed);
  const width = WIND_MAX[0] - WIND_MIN[0];
  const positions: Vec2[] = [];
  const velocities: Vec2[] = [];
  const opacities: number[] = [];
  for (let i = 0; i < WIND_COUNT; i++) {
    // 세로는 층을 고르게 나눠 흩는다 — 한쪽에 몰리지 않게.
    const y = WIND_MIN[1] + ((i + rand()) / WIND_COUNT) * (WIND_MAX[1] - WIND_MIN[1]);
    const x0 = rand() * width;
    const pace = WIND_FLOW * (WIND_PACE_MIN + WIND_PACE_SPREAD * rand());
    const travelled = (((x0 + pace * t) % width) + width) % width;
    const x = WIND_MAX[0] - travelled;
    const edge = Math.min(x - WIND_MIN[0], WIND_MAX[0] - x);
    const fade = Math.max(0, Math.min(1, edge / WIND_EDGE_FADE));
    positions.push([x, y]);
    velocities.push([-pace, 0]);
    opacities.push(WIND_OPACITY * fade);
  }
  return { positions, velocities, opacities };
}

export function step(params: { state: MichelsonMorleyState }): MichelsonMorleyState {
  return params.state;
}
