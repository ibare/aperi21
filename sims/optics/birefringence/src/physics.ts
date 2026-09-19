// ========================================================================
// birefringence — 순수 물리
// ========================================================================
// 수직으로 들어온 빛 가운데 정상광 o 는 곧게 지나고, 이상광 e 는 갈라짐 각만큼 비스듬히 지나
// 결정 윗면에서 두께 × tan(각) 만큼 옆으로 밀린 자리로 나간다. 위에서 보면 그 거리만큼 떨어진
// 상 둘이 보인다. 결정을 φ 만큼 돌리면 e 상은 o 상을 중심으로 그 반지름의 원 위를 φ 만큼 돈다.
//
// o 는 두 상을 잇는 선(주 단면)에 수직으로, e 는 그 선을 따라 떨린다. 결이 그 선에서 ψ 기운 편광판을
// 지나면 e 상은 cos²ψ, o 상은 sin²ψ 만큼 남는다.
//
// 모든 것이 시간표 단계의 진행도로만 움직인다 — 단계 경계를 코드 상수로 두지 않는다 (S-piece).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  EXAGGERATION,
  N_E,
  N_O,
  POL_DEG_A,
  POL_DEG_B,
  THICKNESS,
  TURN_DEG,
  WALK_OFF_DEG,
} from './schema';
import type { BirefringenceState } from './state';

export interface BirefringenceConstants {
  nO: number;
  nE: number;
  walkOffDeg: number;
  exaggeration: number;
  thickness: number;
  turnDeg: number;
  polDegA: number;
  polDegB: number;
}

export function readConstants(stage: StageDef): BirefringenceConstants {
  const c = (stage.constants ?? {}) as Record<string, number | undefined>;
  return {
    nO: c.nO ?? N_O,
    nE: c.nE ?? N_E,
    walkOffDeg: c.walkOffDeg ?? WALK_OFF_DEG,
    exaggeration: c.exaggeration ?? EXAGGERATION,
    thickness: c.thickness ?? THICKNESS,
    turnDeg: c.turnDeg ?? TURN_DEG,
    polDegA: c.polDegA ?? POL_DEG_A,
    polDegB: c.polDegB ?? POL_DEG_B,
  };
}

const RAD = Math.PI / 180;

/** 그림에 그리는 갈라짐 각(라디안) — 선언한 각에 과장 배율을 곱한다. */
export function drawnWalkOff(c: BirefringenceConstants): number {
  return c.walkOffDeg * c.exaggeration * RAD;
}

/** 결정 윗면에서 두 줄기가 벌어진 거리(월드) = 두 상 사이 거리. */
export function separation(c: BirefringenceConstants): number {
  return c.thickness * Math.tan(drawnWalkOff(c));
}

/** 지금 결정이 처음 자리에서 돈 각(라디안). `rotate` 단계에서만 돈다. */
export function crystalAngle(tl: TimelineFrame, c: BirefringenceConstants): number {
  return c.turnDeg * RAD * tl.at('rotate');
}

/** 편광판이 얹혀 있는 정도 0 → 1 → 0. 얹는 단계에 나타나고 걷는 단계에 사라진다. */
export function polarizerPresence(tl: TimelineFrame): number {
  return tl.at('polIn') - tl.at('polOut');
}

/** 편광판 결이 두 상을 잇는 선에서 기운 각(라디안). 돌림 단계에서 A → B. */
export function polarizerAngle(tl: TimelineFrame, c: BirefringenceConstants): number {
  return (c.polDegA + (c.polDegB - c.polDegA) * tl.at('polTurn')) * RAD;
}

/**
 * 두 상의 남은 밝기 몫. 편광판이 없으면 둘 다 1, 얹히면 e 는 cos²ψ · o 는 sin²ψ 로 옮겨 간다.
 * 얹히는 동안은 두 값 사이를 잇는다(판이 미끄러져 들어오는 것의 근사).
 */
export function imageShares(tl: TimelineFrame, c: BirefringenceConstants): { o: number; e: number } {
  const p = polarizerPresence(tl);
  const psi = polarizerAngle(tl, c);
  const cos2 = Math.cos(psi) ** 2;
  const sin2 = 1 - cos2;
  return { o: 1 - p + p * sin2, e: 1 - p + p * cos2 };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: BirefringenceState }): BirefringenceState {
  return params.state;
}
