// ========================================================================
// biot-savart-law — 순수 물리 · 배치
// ========================================================================
// 고리 좌표 (a, u, w) — a 는 고리 축(화면 오른쪽), u 는 위, w 는 보는 사람 쪽.
// 세 축은 오른손 계다: â × û = ŵ, û × ŵ = â, ŵ × â = û.
//
// 고리 위 각 φ 의 자리는 R(cos φ û + sin φ ŵ), 전류 방향은 φ 가 커지는 쪽
// dl̂ = −sin φ û + cos φ ŵ. 축 위 P = d â 까지의 r = P − 자리 이고, 한 조각의 몫은
//   dB = I dl (dl̂ × r) / |r|³ = I dl (R â + d cos φ û + d sin φ ŵ) / |r|³
// 이다(μ₀/4π 를 1 로 둔다). 축 몫 R 은 모든 조각이 같고, 옆 몫 d(cos φ, sin φ) 는 조각
// 자리를 따라 한 바퀴 돌아 합이 0 이 된다 — 이것이 이 조각의 주장이다.
//
// 화면 투영은 수직축 û 둘레로 β 만큼 돌린 직교 투영이다. 화면 가로 X = (cos β, 0, −sin β),
// 세로 Y = û, 보는 쪽 Z = (sin β, 0, cos β) 이고 X × Y = Z 라 거울상이 아니다 (장부 G120).
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  AXIAL_DISTANCE,
  CURRENT,
  FIELD_TO_LENGTH,
  PIECES,
  RING_RADIUS,
  START_ANGLE_DEG,
  VIEW_YAW_DEG,
} from './schema';
import type { BiotSavartLawState } from './state';

export interface BiotSavartLawConstants {
  /** 조각 수(정수로 내린다, 최소 2). */
  pieces: number;
  current: number;
  ringRadius: number;
  axialDistance: number;
  fieldToLength: number;
  /** 시점 각(라디안). */
  yaw: number;
  /** 첫 조각이 시작하는 고리 위 각(라디안). */
  startAngle: number;
}

const DEG = Math.PI / 180;

export function readConstants(stage: StageDef): BiotSavartLawConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    pieces: Math.max(2, Math.floor(c.pieces ?? PIECES)),
    current: c.current ?? CURRENT,
    ringRadius: c.ringRadius ?? RING_RADIUS,
    axialDistance: c.axialDistance ?? AXIAL_DISTANCE,
    fieldToLength: c.fieldToLength ?? FIELD_TO_LENGTH,
    yaw: (c.viewYawDeg ?? VIEW_YAW_DEG) * DEG,
    startAngle: (c.startAngleDeg ?? START_ANGLE_DEG) * DEG,
  };
}

/** 고리 좌표의 한 점 · 벡터 [a, u, w]. */
export type Vec3 = readonly [number, number, number];

/** 고리 좌표 → 화면 평면의 월드 좌표. 월드 → 화면 변환은 엔진이 한다 (원칙 1). */
export function project(p: Vec3, c: BiotSavartLawConstants): Vec2 {
  return [p[0] * Math.cos(c.yaw) - p[2] * Math.sin(c.yaw), p[1]];
}

/** 보는 사람 쪽으로의 깊이. 양수면 앞이다. */
export function depth(p: Vec3, c: BiotSavartLawConstants): number {
  return p[0] * Math.sin(c.yaw) + p[2] * Math.cos(c.yaw);
}

/** 고리 위 각 φ 의 자리. */
export function ringPoint(phi: number, c: BiotSavartLawConstants): Vec3 {
  return [0, c.ringRadius * Math.cos(phi), c.ringRadius * Math.sin(phi)];
}

/** 조각 i 의 시작 · 가운데 · 끝 각. */
export function pieceAngles(i: number, c: BiotSavartLawConstants): { from: number; mid: number; to: number } {
  const step = (2 * Math.PI) / c.pieces;
  const from = c.startAngle + i * step;
  return { from, mid: from + step / 2, to: from + step };
}

/** 관측점 P (축 위). */
export function observationPoint(c: BiotSavartLawConstants): Vec3 {
  return [c.axialDistance, 0, 0];
}

/**
 * 조각 i 가 P 에 만드는 장 dB 를 **화살표 월드 길이**로(배율 적용). 조각의 가운데 자리에서
 * 잰 한 조각 몫 — 조각 수가 늘수록 합은 고리 적분 2πR²I/|r|³ 에 다가간다.
 */
export function pieceField(i: number, c: BiotSavartLawConstants): Vec3 {
  const { mid } = pieceAngles(i, c);
  const dl = (2 * Math.PI * c.ringRadius) / c.pieces;
  const p = ringPoint(mid, c);
  const r: Vec3 = [c.axialDistance - p[0], -p[1], -p[2]];
  const rLen = Math.hypot(r[0], r[1], r[2]);
  // dl̂ = (0, −sin φ, cos φ). dl̂ × r 를 오른손 계에서 성분으로 편다.
  const t: Vec3 = [0, -Math.sin(mid), Math.cos(mid)];
  const cross: Vec3 = [
    t[1] * r[2] - t[2] * r[1],
    t[2] * r[0] - t[0] * r[2],
    t[0] * r[1] - t[1] * r[0],
  ];
  const k = (c.fieldToLength * c.current * dl) / (rLen * rLen * rLen);
  return [k * cross[0], k * cross[1], k * cross[2]];
}

/**
 * 머리-꼬리 사슬의 마디(고리 좌표). 0 번은 P, i+1 번은 조각 0..i 의 dB 를 이은 끝.
 */
export function chainNodes(c: BiotSavartLawConstants): Vec3[] {
  const nodes: Vec3[] = [observationPoint(c)];
  for (let i = 0; i < c.pieces; i++) {
    const prev = nodes[i]!;
    const f = pieceField(i, c);
    nodes.push([prev[0] + f[0], prev[1] + f[1], prev[2] + f[2]]);
  }
  return nodes;
}

/**
 * 조각 i 의 화살표가 자란 정도 0~1. 두 켜기 단계를 이어 조각 수로 고르게 나눈 자리에서
 * 자란다 — 조각마다 다른 시각은 단계로 풀 수 없어(조각 수가 스테이지 상수다) 여기서
 * 가른다 (장부 G13, NOTES (c)).
 */
export function pieceGrowth(i: number, tl: TimelineFrame, c: BiotSavartLawConstants): number {
  const s = tl.span(tl.start('add-upper'), tl.end('add-lower'));
  return Math.min(1, Math.max(0, s * c.pieces - i));
}

/** 지금 자라는 중인 조각 번호. 켜기 단계 밖이면 −1. */
export function activePiece(tl: TimelineFrame, c: BiotSavartLawConstants): number {
  for (let i = 0; i < c.pieces; i++) {
    const g = pieceGrowth(i, tl, c);
    if (g > 0 && g < 1) return i;
  }
  return -1;
}

/** 쌓는 상태가 없다 — 모든 것이 시각과 스테이지 상수의 함수다. */
export function step(params: { state: BiotSavartLawState }): BiotSavartLawState {
  return params.state;
}
