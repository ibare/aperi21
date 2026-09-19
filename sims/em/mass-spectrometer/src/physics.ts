// ========================================================================
// mass-spectrometer — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 두 이온의 자리는 모두 발사 뒤 흐른 시간의 함수이고 `step` 은 항등이다.
//
// 이온은 이온원 (0, −L) 에서 +y 로 속력 v 로 떠나 L 만큼 곧게 와서 입구 (0, 0) 에 닿는다.
// 판 위(y > 0)는 종이 밖(⊙)의 균일 자기장 B 다. 양이온은 q v × B 로 오른쪽으로 휘며
// 반지름 r = m v / (q B) 의 원을 시계 방향으로 돈다. 중심이 (r, 0) 이라
//
//   θ = (호 길이) / r
//   x = r (1 − cos θ),  y = r sin θ
//
// θ = π 에서 입구 오른쪽 2r 자리의 판에 닿는다. 두 이온은 속력이 같아 **같은 호 길이**를
// 가지만 반지름이 달라 각이 벌어진다 — 가벼운 것이 먼저 더 가까이 떨어진다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  BEAM_LENGTH,
  CHARGE,
  FIELD_B,
  FIELD_MAX_X,
  FIELD_MAX_Y,
  FIELD_MIN_X,
  FIELD_MIN_Y,
  MASS_HEAVY,
  MASS_LIGHT,
  PLATE_LEFT,
  PLATE_RIGHT,
  SLIT_HALF,
  SPEED,
} from './schema';
import type { MassSpectrometerState } from './state';

/** 궤적 호 표본 간격(라디안). */
const ARC_STEP_RAD = Math.PI / 96;

export interface MassSpectrometerConstants {
  massLight: number;
  massHeavy: number;
  charge: number;
  speed: number;
  fieldB: number;
  beamLength: number;
  slitHalf: number;
  plateLeft: number;
  plateRight: number;
  fieldMinX: number;
  fieldMaxX: number;
  fieldMinY: number;
  fieldMaxY: number;
}

export function readConstants(stage: StageDef): MassSpectrometerConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    massLight: c.massLight ?? MASS_LIGHT,
    massHeavy: c.massHeavy ?? MASS_HEAVY,
    charge: c.charge ?? CHARGE,
    speed: c.speed ?? SPEED,
    fieldB: c.fieldB ?? FIELD_B,
    beamLength: c.beamLength ?? BEAM_LENGTH,
    slitHalf: c.slitHalf ?? SLIT_HALF,
    plateLeft: c.plateLeft ?? PLATE_LEFT,
    plateRight: c.plateRight ?? PLATE_RIGHT,
    fieldMinX: c.fieldMinX ?? FIELD_MIN_X,
    fieldMaxX: c.fieldMaxX ?? FIELD_MAX_X,
    fieldMinY: c.fieldMinY ?? FIELD_MIN_Y,
    fieldMaxY: c.fieldMaxY ?? FIELD_MAX_Y,
  };
}

export type IonId = 'light' | 'heavy';

/**
 * 함께 쏘는 두 이온. 질량 상수와 기호의 질량수 글자(state 경로)를 짝짓는다.
 * 목록 길이는 코드에 있다(스테이지 상수가 수 하나씩이라, NOTES c G105).
 */
export const IONS: readonly {
  id: IonId;
  mass: (c: MassSpectrometerConstants) => number;
  massText: (s: MassSpectrometerState) => string;
}[] = [
  { id: 'light', mass: (c) => c.massLight, massText: (s) => s.massLightText },
  { id: 'heavy', mass: (c) => c.massHeavy, massText: (s) => s.massHeavyText },
];

/** 자기장 속 원의 반지름(월드) — r = m v / (q B). */
export function radiusOf(c: MassSpectrometerConstants, mass: number): number {
  return (mass * c.speed) / (c.charge * c.fieldB);
}

export type IonPhase = 'beam' | 'field' | 'landed';

export interface IonAt {
  pos: Vec2;
  phase: IonPhase;
  /** 원 중심에서 이온을 향한 단위 벡터(월드, y 위). 빔 속에서는 입구에서의 값(−x). */
  radial: Vec2;
  /** 자기장 속에서 돈 각(라디안). 빔 속에서는 0, 떨어졌으면 π. */
  theta: number;
}

/** 발사 뒤 `tau` 초가 흐른 때 질량 `mass` 인 이온의 자리. */
export function ionAt(c: MassSpectrometerConstants, mass: number, tau: number): IonAt {
  const s = Math.max(0, tau) * c.speed;
  if (s < c.beamLength) {
    return { pos: [0, -c.beamLength + s], phase: 'beam', radial: [-1, 0], theta: 0 };
  }
  const r = radiusOf(c, mass);
  const theta = Math.min(Math.PI, (s - c.beamLength) / r);
  return {
    pos: [r * (1 - Math.cos(theta)), r * Math.sin(theta)],
    phase: theta >= Math.PI ? 'landed' : 'field',
    radial: [-Math.cos(theta), Math.sin(theta)],
    theta,
  };
}

/** 이온원에서 지금 자리까지 지나온 길. */
export function ionPath(c: MassSpectrometerConstants, mass: number, tau: number): Vec2[] {
  const now = ionAt(c, mass, tau);
  const pts: Vec2[] = [[0, -c.beamLength]];
  if (now.phase === 'beam') {
    pts.push(now.pos);
    return pts;
  }
  const r = radiusOf(c, mass);
  for (let a = 0; a < now.theta; a += ARC_STEP_RAD) {
    pts.push([r * (1 - Math.cos(a)), r * Math.sin(a)]);
  }
  pts.push(now.pos);
  return pts;
}

export function step(params: { state: MassSpectrometerState }): MassSpectrometerState {
  return params.state;
}
