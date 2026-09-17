// ========================================================================
// keplers-second-law — 순수 계산
// ========================================================================
// 케플러 방정식 풀이 · 같은 시간 칸의 부채꼴 점열 · 신발끈 넓이.
// DOM · 캔버스 · 시계를 모른다. 좌표는 월드(원본 캔버스 px / 100, y 위).
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import type { KeplersSecondLawState } from './state';

/** 이심률. 근일점 거리 0.2a, 원일점 1.8a — 가까운 칸과 먼 칸의 모양 차이가 한눈에 보인다. */
export const ECCENTRICITY = 0.8;
/** 긴반지름(월드). 원본 240 px. */
export const SEMI_MAJOR = 2.4;
export const SEMI_MINOR = SEMI_MAJOR * Math.sqrt(1 - ECCENTRICITY * ECCENTRICITY);
/** 타원 중심(월드). 원본 (280, 160) px. */
export const ORBIT_CENTER: Vec2 = [2.8, 1.6];
/** 태양 — 왼쪽 초점. 근일점이 왼쪽 끝에 온다. */
export const SUN: Vec2 = [ORBIT_CENTER[0] - SEMI_MAJOR * ECCENTRICITY, ORBIT_CENTER[1]];

/** 한 바퀴를 나눈 칸 수. */
export const SLOT_COUNT = 12;
/** 한 칸의 길이(초). */
export const SLOT_SECONDS = 1.5;
/** 공전 주기(초). */
export const PERIOD = SLOT_COUNT * SLOT_SECONDS;

const TAU = 2 * Math.PI;
const SLOT_ANGLE = TAU / SLOT_COUNT;

/** 평균 근점 이각 M → 행성 위치. 케플러 방정식을 뉴턴법으로 푼다. */
export function positionAt(M: number): Vec2 {
  let E = M + ECCENTRICITY * Math.sin(M);
  for (let i = 0; i < 12; i++) {
    E -= (E - ECCENTRICITY * Math.sin(E) - M) / (1 - ECCENTRICITY * Math.cos(E));
  }
  return [ORBIT_CENTER[0] - SEMI_MAJOR * Math.cos(E), ORBIT_CENTER[1] + SEMI_MINOR * Math.sin(E)];
}

/** 칸 i 의 시작 경계. 근일점(M=0)을 칸 0 의 가운데에 두도록 반 칸 밀었다. */
export function slotStartM(i: number): number {
  return (i - 0.5) * SLOT_ANGLE;
}

/** 태양에서 궤도 조각 [M1, M2] 까지의 부채꼴 점열(궤도 위 점만). 넓이도 이것으로 직접 잰다. */
export function fanPoints(M1: number, M2: number): Vec2[] {
  const steps = Math.max(2, Math.ceil((Math.abs(M2 - M1) / TAU) * 360));
  const pts: Vec2[] = [];
  for (let k = 0; k <= steps; k++) pts.push(positionAt(M1 + ((M2 - M1) * k) / steps));
  return pts;
}

/** 신발끈 공식 — 태양을 꼭짓점으로 한 부채꼴 넓이. */
export function fanArea(pts: readonly Vec2[]): number {
  let s = 0;
  for (let k = 0; k < pts.length - 1; k++) {
    const p = pts[k]!;
    const q = pts[k + 1]!;
    s += (p[0] - SUN[0]) * (q[1] - SUN[1]) - (q[0] - SUN[0]) * (p[1] - SUN[1]);
  }
  return Math.abs(s) / 2;
}

/** 타원 넓이의 12분의 1 — 막대 기준선 높이가 가리키는 값. */
export const SLOT_AREA_IDEAL = (Math.PI * SEMI_MAJOR * SEMI_MINOR) / SLOT_COUNT;

export type SlotDistance = 'near' | 'far' | 'between';

export interface SlotReading {
  /** 궤도 위 점열. */
  points: Vec2[];
  /** 직접 잰 넓이. */
  area: number;
  /** 칸 가운데 시각의 태양–행성 거리가 어느 쪽인가 (0.9a 미만 가까이, 1.4a 초과 멀리). */
  distance: SlotDistance;
}

/** 끝난 칸은 매 주기 모양이 같으므로 한 번 재어 둔다. */
export const SLOTS: readonly SlotReading[] = Array.from({ length: SLOT_COUNT }, (_, i) => {
  const points = fanPoints(slotStartM(i), slotStartM(i + 1));
  const mid = positionAt((slotStartM(i) + slotStartM(i + 1)) / 2);
  const r = Math.hypot(mid[0] - SUN[0], mid[1] - SUN[1]);
  const distance: SlotDistance = r < 0.9 * SEMI_MAJOR ? 'near' : r > 1.4 * SEMI_MAJOR ? 'far' : 'between';
  return { points, area: fanArea(points), distance };
});

/** 지금 칸 k 를 진행도 frac(0~1) 만큼 쓸었을 때의 부채꼴과 행성 자리. */
export function sweepNow(k: number, frac: number): { points: Vec2[]; area: number; planet: Vec2 } {
  const M1 = slotStartM(k);
  const M = M1 + frac * SLOT_ANGLE;
  const points = fanPoints(M1, M);
  return { points, area: frac > 0 ? fanArea(points) : 0, planet: positionAt(M) };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: KeplersSecondLawState }): KeplersSecondLawState {
  return params.state;
}
