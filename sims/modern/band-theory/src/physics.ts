// ========================================================================
// band-theory — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 모든 자리가 시간표 진행도의 함수이고, `step` 은 항등이다.
//
// 이 조각의 물리는 셋이다.
//
//   띠   준위 하나가 원자 수만큼 갈라져 폭 W 의 띠가 된다
//   흐름 빈 자리가 바로 곁에 있는 전자만 전기장을 따라 옮겨 간다
//   넘음 빛 에너지 hν ≥ 띠틈 Eg 일 때만 전자가 위 띠로 올라간다
//
// 나머지는 배치 계산이다 — 세 그림의 자리, 준위의 높이, 칸의 가로 자리.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BAND_BASE_Y,
  BAND_HALF_W,
  BAND_WIDTH_EV,
  DRIFT_SPEED,
  EV_TO_WORLD,
  HOP_COUNT,
  INSULATOR_GAP_EV,
  LEVELS_PER_BAND,
  METAL_FILL,
  PHOTON_COUNT,
  PHOTON_EV,
  SEMICONDUCTOR_GAP_EV,
  SLOTS_PER_LEVEL,
} from './schema';
import type { BandTheoryState } from './state';

export function step(params: { state: BandTheoryState }): BandTheoryState {
  return params.state;
}

export interface BandTheoryConstants {
  bandWidthEv: number;
  insulatorGapEv: number;
  semiconductorGapEv: number;
  metalFill: number;
  photonEv: number;
  photonCount: number;
  hopCount: number;
  driftSpeed: number;
}

export function readConstants(stage: StageDef): BandTheoryConstants {
  const c = stage.constants ?? {};
  return {
    bandWidthEv: c.bandWidthEv ?? BAND_WIDTH_EV,
    insulatorGapEv: c.insulatorGapEv ?? INSULATOR_GAP_EV,
    semiconductorGapEv: c.semiconductorGapEv ?? SEMICONDUCTOR_GAP_EV,
    metalFill: c.metalFill ?? METAL_FILL,
    photonEv: c.photonEv ?? PHOTON_EV,
    photonCount: Math.round(c.photonCount ?? PHOTON_COUNT),
    hopCount: Math.round(c.hopCount ?? HOP_COUNT),
    driftSpeed: c.driftSpeed ?? DRIFT_SPEED,
  };
}

// ------------------------------------------------------------------------
// 띠 배치
// ------------------------------------------------------------------------

export interface Band {
  /** 월드 y. */
  bottom: number;
  top: number;
}

/** 아래 띠(세 그림 공통 자리). */
export function lowerBand(c: BandTheoryConstants): Band {
  return { bottom: BAND_BASE_Y, top: BAND_BASE_Y + c.bandWidthEv * EV_TO_WORLD };
}

/** 틈 `gapEv` 위에 놓이는 위 띠. */
export function upperBand(c: BandTheoryConstants, gapEv: number): Band {
  const bottom = lowerBand(c).top + gapEv * EV_TO_WORLD;
  return { bottom, top: bottom + c.bandWidthEv * EV_TO_WORLD };
}

/**
 * 준위 k 의 높이. `spread` 가 0 이면 모든 준위가 띠 가운데 한 줄(원자 하나의 준위)에
 * 모여 있고, 1 이면 띠 폭에 고르게 퍼진다.
 */
export function levelY(band: Band, k: number, spread: number): number {
  const mid = (band.bottom + band.top) / 2;
  const pitch = (band.top - band.bottom) / LEVELS_PER_BAND;
  const home = band.bottom + (k + 0.5) * pitch;
  return mid + (home - mid) * spread;
}

/** 띠가 보이는 두께의 반(월드). 퍼지는 동안 준위를 감쌀 만큼 자란다. */
export function bandHalfHeight(band: Band, spread: number): number {
  return ((band.top - band.bottom) / 2) * spread;
}

/** 도체 띠에서 전자가 앉은 준위 수. */
export function metalFilledLevels(c: BandTheoryConstants): number {
  return Math.max(1, Math.min(LEVELS_PER_BAND, Math.round(LEVELS_PER_BAND * c.metalFill)));
}

/** 칸 사이 간격(월드). */
export const SLOT_PITCH = (2 * BAND_HALF_W) / SLOTS_PER_LEVEL;

/** 칸 j 의 가로 자리. */
export function slotX(cx: number, j: number): number {
  return cx - BAND_HALF_W + (j + 0.5) * SLOT_PITCH;
}

/** 띠 안에서 감아 돈다 — 왼쪽으로 나간 전자가 오른쪽에서 들어온다(결정이 이어진다). */
export function wrapX(cx: number, x: number): number {
  const left = cx - BAND_HALF_W;
  const span = 2 * BAND_HALF_W;
  return left + ((((x - left) % span) + span) % span);
}

/** 띠 가장자리에서 옅어지는 정도 — 감아 도는 자리에서 전자가 뚝 끊기지 않게. */
export function edgeFade(cx: number, x: number, fadeWidth: number): number {
  const d = Math.min(x - (cx - BAND_HALF_W), cx + BAND_HALF_W - x);
  return Math.max(0, Math.min(1, d / fadeWidth));
}

// ------------------------------------------------------------------------
// 시간표 → 움직임
// ------------------------------------------------------------------------

/** 전기장이 걸린 뒤 흐른 시간(초). 전기장이 나타나기 전에는 0. */
export function timeSinceField(tl: TimelineFrame): number {
  return Math.max(0, tl.u - tl.start('fieldIn'));
}

/** 빛 화살표가 물러나기 시작한 뒤 흐른 시간(초) — 넘어간 전자가 흐른 시간. */
export function timeSinceFlow(tl: TimelineFrame): number {
  return Math.max(0, tl.u - tl.start('flowIn'));
}

/**
 * 빛 알갱이 i 의 진행도. 화살표가 자라며 전자가 끝까지 오르는 `rise-i`, 넘어간 전자가
 * 위 띠 바닥으로 내려앉는 `settle-i` — 길이 · 이징은 시간표 선언에 있다.
 */
export function photonProgress(tl: TimelineFrame, i: number): { rise: number; settle: number } {
  return { rise: tl.at(`rise-${i}`), settle: tl.at(`settle-${i}`) };
}

/** 빛을 받는 칸 — 맨 위 준위의 짝수 칸. */
export function photonSlot(i: number): number {
  return 2 * i;
}

/** 준위 사이 에너지 간격(eV). */
export function levelPitchEv(c: BandTheoryConstants): number {
  return c.bandWidthEv / LEVELS_PER_BAND;
}

/**
 * 맨 위 준위의 전자가 빛 에너지로 닿는 자리가 위 띠의 준위 하나에 이르는가.
 * 맨 위 준위는 띠 윗가장자리에서 반 칸 아래, 위 띠의 첫 준위는 아랫가장자리에서
 * 반 칸 위라 넘는 데 필요한 에너지는 띠틈 + 준위 간격 하나다.
 */
export function crossesGap(c: BandTheoryConstants, gapEv: number): boolean {
  return c.photonEv + 1e-9 >= gapEv + levelPitchEv(c);
}

/**
 * 틈을 넘은 전자가 앉는 위 띠의 준위. 빛이 올려 준 높이에서 위 띠의 바닥 준위로 내려앉는다 —
 * 들뜬 전자는 격자에 남는 에너지를 넘기고 띠 바닥으로 모인다. 못 넘으면 -1.
 */
export function landingLevel(c: BandTheoryConstants, gapEv: number): number {
  return crossesGap(c, gapEv) ? 0 : -1;
}

/**
 * 양공 건너기 — 다 건넌 횟수와 지금 건너는 중인 진행도(0~1). 건너기마다 `hopRest-k`(멈춤) ·
 * `hop-k`(건너기, 이징은 선언) 단계가 있다.
 */
export function hopState(tl: TimelineFrame, c: BandTheoryConstants): { done: number; move: number } {
  let done = 0;
  for (let k = 0; k < c.hopCount; k++) {
    const m = tl.at(`hop-${k}`);
    if (m >= 1) {
      done++;
      continue;
    }
    return { done, move: m };
  }
  return { done, move: 0 };
}

/** 물러나며 옅어지는 정도(1 이면 또렷하다). */
export function fadeOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}
