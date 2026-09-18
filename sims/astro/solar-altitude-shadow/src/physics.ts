// ========================================================================
// solar-altitude-shadow — 순수 물리 · 배치 계산
// ========================================================================
// 햇빛은 평행하게 고도 α 로 들어온다. 태양 쪽 방향(땅에서 태양을 향하는 단위 벡터)은
// d = (−cos α, sin α) — 태양이 왼쪽 위에 있다.
//
// - 막대(높이 H) 그림자 길이 = H / tan α. 막대 끝을 스치는 빛줄기가 땅에 닿는 자리가 그림자 끝이다.
// - 다발에 수직으로 잰 폭 W 의 햇빛이 땅에 닿는 길이 = W / sin α.
// - 같은 빛이 그만큼 넓게 퍼지므로 땅 한 칸이 받는 빛(넓이당)은 해가 머리 위일 때의 sin α 배다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { ALT_HIGH_DEG, ALT_LOW_DEG, ALT_MID_DEG, BEAM_WIDTH, STICK_HEIGHT } from './schema';
import type { SolarAltitudeShadowState } from './state';

export interface SolarAltitudeShadowConstants {
  /** 정박 고도(도) — 낮게 · 중간 · 높게. */
  altLow: number;
  altMid: number;
  altHigh: number;
  /** 막대 높이(월드). */
  stickHeight: number;
  /** 햇빛 다발의 폭(월드, 다발에 수직). */
  beamWidth: number;
}

export function readConstants(stage: StageDef): SolarAltitudeShadowConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    altLow: c.altLow ?? ALT_LOW_DEG,
    altMid: c.altMid ?? ALT_MID_DEG,
    altHigh: c.altHigh ?? ALT_HIGH_DEG,
    stickHeight: c.stickHeight ?? STICK_HEIGHT,
    beamWidth: c.beamWidth ?? BEAM_WIDTH,
  };
}

const DEG = Math.PI / 180;

/**
 * 지금 태양 고도(도). 오름 두 단계와 내림 단계의 진행도로 정박값 사이를 옮겨 간다 —
 * 단계 길이 · 이징은 시간표 선언이 정한다.
 */
export function altitudeNow(tl: TimelineFrame, c: SolarAltitudeShadowConstants): number {
  return (
    c.altLow +
    (c.altMid - c.altLow) * tl.at('riseMid') +
    (c.altHigh - c.altMid) * tl.at('riseHigh') -
    (c.altHigh - c.altLow) * tl.at('fall')
  );
}

/** 정박 고도 하나 — 어느 머묾 단계의 값인가. */
export interface AltitudeAnchor {
  phase: 'low' | 'mid' | 'high';
  deg: number;
}

/** 세 정박 고도. 머묾 단계 id 와 짝지어 둔다. */
export function anchors(c: SolarAltitudeShadowConstants): AltitudeAnchor[] {
  return [
    { phase: 'low', deg: c.altLow },
    { phase: 'mid', deg: c.altMid },
    { phase: 'high', deg: c.altHigh },
  ];
}

/** 이번 주기에 이미 도착한 정박 고도인가 — 그 머묾 단계가 시작된 뒤면 참. */
export function reached(tl: TimelineFrame, a: AltitudeAnchor): boolean {
  return tl.u >= tl.start(a.phase);
}

/** 지금 머물고 있는 정박 고도. 옮겨 가는 중이면 없다. */
export function holding(tl: TimelineFrame, c: SolarAltitudeShadowConstants): AltitudeAnchor | undefined {
  return anchors(c).find((a) => tl.phase === a.phase);
}

/** 땅에서 태양을 향하는 단위 벡터 — 태양은 왼쪽 위. */
export function sunDirection(altDeg: number): readonly [number, number] {
  return [-Math.cos(altDeg * DEG), Math.sin(altDeg * DEG)];
}

/** 막대 그림자 길이 = H / tan α. */
export function shadowLength(altDeg: number, stickHeight: number): number {
  return stickHeight / Math.tan(altDeg * DEG);
}

/** 폭 W 의 다발이 땅에 닿는 길이 = W / sin α. */
export function footprintLength(altDeg: number, beamWidth: number): number {
  return beamWidth / Math.sin(altDeg * DEG);
}

/** 땅 한 칸이 받는 빛 — 해가 머리 위일 때를 1 로 둔 몫 = sin α. */
export function lightPerArea(altDeg: number): number {
  return Math.sin(altDeg * DEG);
}

/** 상태가 시계뿐이라 걸음은 항등이다 (S-sim 「상태가 시계뿐인 조각」). */
export function step(params: { state: SolarAltitudeShadowState }): SolarAltitudeShadowState {
  return params.state;
}
