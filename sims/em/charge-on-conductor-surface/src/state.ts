// ========================================================================
// charge-on-conductor-surface — 상태
// ========================================================================
// 쌓는 것이 없다. 화면은 시간표 진행도의 함수다. state 에 두는 것은 스테이지 상수에서
// **한 번만** 푸는 무거운 배치다 — 도체 모양, 이완 경로의 스냅숏, 견줄 두 호, 장 화살표.
// 매 프레임 풀면 알갱이 40 × 40 × 400 번을 되풀이하게 된다 (장부 G189).
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import { arcPath, fieldArrows, outline, readConstants, relax, type FieldArrow } from './physics';

/** 호를 겉면에서 바깥으로 띄우는 거리(월드). 알갱이 십자와 겹치지 않게. */
const ARC_GAP = 0.13;

export interface ChargeOnConductorSurfaceState {
  /** 도체 겉면 — 반시계 볼록 다각형. */
  outline: Vec2[];
  /** 이완 경로의 스냅숏. 첫째가 처음 한 줌, 마지막이 겉면에 멈춘 자리. */
  frames: Vec2[][];
  /** 견줄 두 호 — 겉면에서 조금 띄운 꺾은선. */
  tipArc: Vec2[];
  bluntArc: Vec2[];
  /** 겉면 바로 바깥의 장 화살표 — 마지막 자리에서 잰다. */
  arrows: FieldArrow[];
}

export function initialState(params: { stage: StageDef }): ChargeOnConductorSurfaceState {
  const c = readConstants(params.stage);
  const o = outline(c);
  const frames = relax(c, o);
  const settled = frames[frames.length - 1] ?? [];
  const tipArc = arcPath(o, 0, c.arcLength, ARC_GAP);
  const bluntArc = arcPath(o, o.bluntAt, c.arcLength, ARC_GAP);
  return {
    outline: o.points,
    frames,
    tipArc,
    bluntArc,
    arrows: fieldArrows(c, o, settled),
  };
}
