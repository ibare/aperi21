// ========================================================================
// radiation-pressure — 순수 물리
// ========================================================================
// 모든 움직임은 시각의 함수다 — 쌓는 것이 없어 `step` 은 항등이다.
// 여기 있는 것은 스테이지 상수 읽기, 두 판이 받는 힘과 밀린 거리, 광자 물결 묶음의 표본,
// 흐르는 광자의 세로 자리를 뽑는 시드 결정적 난수다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  BEAM_HALF,
  FORCE_ARROW_SCALE,
  INTENSITY,
  LANE_Y,
  LIGHT_SPEED,
  MOMENTUM_ARROW,
  PACKET_AMPLITUDE,
  PACKET_CYCLES,
  PACKET_LENGTH,
  PHOTON_RATE,
  PLATE_AREA,
  PLATE_HEIGHT,
  PLATE_MASS,
  PLATE_THICK,
  PLATE_X,
  PUSH_EXAGGERATION,
  SEED,
  SOURCE_X,
} from './schema';
import type { RadiationPressureState } from './state';

export function step(params: { state: RadiationPressureState }): RadiationPressureState {
  return params.state;
}

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface RadiationPressureConstants {
  intensity: number;
  lightSpeed: number;
  plateArea: number;
  plateMass: number;
  pushExaggeration: number;
  forceArrowScale: number;
  momentumArrow: number;
  laneY: number;
  beamHalf: number;
  sourceX: number;
  plateX: number;
  plateThick: number;
  plateHeight: number;
  packetLength: number;
  packetCycles: number;
  packetAmplitude: number;
  photonRate: number;
  seed: number;
}

/** 스테이지 상수를 기본값과 함께 읽는다. 선언에 없는 이름은 schema 의 기본값을 쓴다. */
export function readConstants(stage: StageDef): RadiationPressureConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    intensity: c.intensity ?? INTENSITY,
    lightSpeed: c.lightSpeed ?? LIGHT_SPEED,
    plateArea: c.plateArea ?? PLATE_AREA,
    plateMass: c.plateMass ?? PLATE_MASS,
    pushExaggeration: c.pushExaggeration ?? PUSH_EXAGGERATION,
    forceArrowScale: c.forceArrowScale ?? FORCE_ARROW_SCALE,
    momentumArrow: c.momentumArrow ?? MOMENTUM_ARROW,
    laneY: c.laneY ?? LANE_Y,
    beamHalf: c.beamHalf ?? BEAM_HALF,
    sourceX: c.sourceX ?? SOURCE_X,
    plateX: c.plateX ?? PLATE_X,
    plateThick: c.plateThick ?? PLATE_THICK,
    plateHeight: c.plateHeight ?? PLATE_HEIGHT,
    packetLength: c.packetLength ?? PACKET_LENGTH,
    packetCycles: c.packetCycles ?? PACKET_CYCLES,
    packetAmplitude: c.packetAmplitude ?? PACKET_AMPLITUDE,
    photonRate: c.photonRate ?? PHOTON_RATE,
    seed: c.seed ?? SEED,
  };
}

// ------------------------------------------------------------------------
// 힘과 밀린 거리
// ------------------------------------------------------------------------

/**
 * 광자 하나에서 판이 받는 운동량 몫의 수. 조절값이 아니라 두 판의 **정의**다 — 완전 흡수는 멈춰 세울 때
 * 한 번, 완전 반사는 멈춰 세울 때 한 번 · 되쏠 때 한 번. 화면의 p 화살표 수 · F 화살표 수가 이것이다.
 */
export const ABSORB_KICKS = 1;
export const REFLECT_KICKS = 2;

/**
 * 판이 받는 힘(N). 광자를 멈춰 세우면 운동량을 한 번(I·A/c), 되돌려 보내면 멈출 때 한 번 ·
 * 되쏠 때 한 번 받는다. `kicks` 는 광자 하나에서 받는 몫의 수 — 흡수 1, 완전 반사 2 다.
 */
export function plateForce(c: RadiationPressureConstants, kicks: number): number {
  return (kicks * c.intensity * c.plateArea) / c.lightSpeed;
}

/**
 * 정지에서 힘 F 를 τ 초 받은 판이 밀린 거리 — **과장 배율을 곱한 그림 거리**(m).
 * 실제 거리는 ½(F/m)τ² 이다. 배율은 스테이지 상수다 (원칙 2).
 */
export function pushedDistance(c: RadiationPressureConstants, force: number, tau: number): number {
  return 0.5 * (force / c.plateMass) * tau * tau * c.pushExaggeration;
}

// ------------------------------------------------------------------------
// 광자 물결 묶음
// ------------------------------------------------------------------------

/** 광자 물결 묶음을 표본하는 점 수 (G156). */
const PACKET_SAMPLES = 40;

/**
 * 광자 물결 묶음 하나의 폴리라인. `s` 는 **판이 없을 때** 묶음 가운데가 있을 x(오른쪽으로 곧게),
 * `face` 는 판 앞면 x 다.
 *
 * - 흡수(`reflect: false`): 앞면을 넘은 표본을 버린다 — 묶음이 판 속으로 사라진다.
 * - 반사(`reflect: true`): 앞면을 넘은 표본을 앞면에 대고 접는다 — 묶음이 거울에서 되접혀 돌아간다.
 *
 * 남는 점이 둘보다 적으면 빈 배열이다.
 */
export function packetLine(
  c: RadiationPressureConstants,
  s: number,
  y: number,
  face: number,
  reflect: boolean,
): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i <= PACKET_SAMPLES; i += 1) {
    const u = i / PACKET_SAMPLES;
    const xs = s - c.packetLength / 2 + u * c.packetLength;
    const dy = c.packetAmplitude * Math.sin(Math.PI * u) * Math.sin(2 * Math.PI * c.packetCycles * u);
    if (xs <= face) out.push([xs, y + dy]);
    else if (reflect) out.push([2 * face - xs, y + dy]);
  }
  return out.length >= 2 ? out : [];
}

/** 반사한 묶음의 가운데가 지금 있는 x. 앞면을 넘었으면 앞면에 대고 접는다. */
export function packetCenter(s: number, face: number): number {
  return s <= face ? s : 2 * face - s;
}

// ------------------------------------------------------------------------
// 시드 결정적 난수 — 흐르는 광자의 세로 자리
// ------------------------------------------------------------------------

/** (시드, 광자 번호) → 0~1. 같은 번호는 언제나 같은 값이다 (S-sim). */
export function hash01(seed: number, index: number): number {
  let h = (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(index | 0, 0x85ebca77)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

/** 광자 번호 k 의 빛줄기 안 세로 어긋남(m). 두 레인이 같은 값을 쓴다 — 같은 빛이다. */
export function photonOffset(c: RadiationPressureConstants, k: number): number {
  return (2 * hash01(c.seed, k) - 1) * (c.beamHalf - c.packetAmplitude);
}
