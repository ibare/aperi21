// ========================================================================
// axial-tilt-seasons — 순수 물리 · 배치 계산
// ========================================================================
// 3 차원 좌표 — X 오른쪽, Y 궤도면의 수직(북쪽), Z 보는 사람 쪽. 오른손 좌표다
// (X × Y = Z). 태양은 원점, 지구는 궤도면(Y = 0) 위 반지름 R 의 원을 북쪽에서 보아
// 반시계로 돈다 — 자리 P(θ) = R(cos θ, 0, −sin θ).
//
// 자전축은 공전하는 내내 같은 방향 a = (sin τ, cos τ, 0) 을 가리킨다(τ = 기울기).
// 지구에서 본 태양 방향은 s = −P/|P|. 축이 태양 쪽으로 기운 정도가 태양의 적위
// δ = asin(a · s) = asin(−sin τ · cos θ) 다. θ = 180°(태양의 왼쪽)에서 δ = +τ — 북반구 여름.
//
// 북반구가 받는 햇빛의 몫 — 태양에서 본 지구 원판 중 적도 북쪽 넓이의 비다. 적도가
// 원판 위에 납작한 반타원(짧은 반지름 sin δ)으로 비치므로 몫 = (1 + sin δ) / 2.
// τ = 0 이면 δ 가 언제나 0 이라 몫이 어디서나 1/2 이다.
//
// 화면 — 궤도면 위 높이각 e 에서 비스듬히 보는 정사영. 오른쪽 = (1, 0, 0),
// 위 = (0, cos e, −sin e), 보는 사람 쪽 = (0, sin e, cos e). 오른쪽 × 위 = 보는 쪽이라
// 거울상이 아니다 (장부 G120).
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { FLAT_TILT_DEG, NIGHT_LIGHT, TERMINATOR_SOFT, TILT_DEG, VIEW_ELEVATION } from './schema';
import type { AxialTiltSeasonsState } from './state';

type Vec3 = readonly [number, number, number];

export interface AxialTiltSeasonsConstants {
  /** 자전축 기울기(도). */
  tilt: number;
  /** 견주는 기울기(도). */
  flatTilt: number;
}

export function readConstants(stage: StageDef): AxialTiltSeasonsConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return { tilt: c.tilt ?? TILT_DEG, flatTilt: c.flatTilt ?? FLAT_TILT_DEG };
}

const DEG = Math.PI / 180;

/** 기운 해의 네 토막 — 여름 · 옆 · 겨울 · 옆. 토막마다 4 분의 1 바퀴. */
const TILTED_YEAR = ['toward', 'sideA', 'away', 'sideB'] as const;
/** 기울기 0 인 해의 두 토막. 토막마다 반 바퀴. */
const FLAT_YEAR = ['flatA', 'flatB'] as const;

/**
 * 기운 해 · 기울기 0 인 해 각각에서 돈 몫 0~1. 각 해의 첫머리가 0, 끝이 1.
 * 토막 길이는 시간표 선언이 정한다 — 저작자가 한 토막을 늘이면 그 토막 동안 천천히 돈다.
 */
export function yearFractions(tl: TimelineFrame): { tilted: number; flat: number } {
  let tilted = 0;
  for (const id of TILTED_YEAR) tilted += tl.at(id);
  let flat = 0;
  for (const id of FLAT_YEAR) flat += tl.at(id);
  return { tilted: tilted / TILTED_YEAR.length, flat: flat / FLAT_YEAR.length };
}

/** 지금이 기울기 0 인 해 쪽(축을 세운 뒤 ~ 다시 기울이기)인가. */
export function inFlatPart(tl: TimelineFrame): boolean {
  return tl.u >= tl.start('flatA');
}

/** 지금의 자전축 기울기(도) — 세우는 · 다시 기울이는 동안 두 값 사이를 옮겨 간다. */
export function tiltNow(tl: TimelineFrame, c: AxialTiltSeasonsConstants): number {
  const d = c.flatTilt - c.tilt;
  return c.tilt + d * tl.at('straighten') - d * tl.at('retilt');
}

/**
 * 한 해의 첫머리 궤도각(라디안). 첫 토막(여름)의 가운데가 θ = 180° 에 오도록 8 분의 1 바퀴
 * 앞에서 시작한다 — 토막마다 4 분의 1 바퀴이므로.
 */
export const YEAR_START_ANGLE = Math.PI - Math.PI / 4;

/** 한 해에서 몫 f 만큼 돈 지구의 궤도각. 북쪽에서 보아 반시계. */
export function orbitAngle(f: number): number {
  return YEAR_START_ANGLE + 2 * Math.PI * f;
}

/** 궤도각 θ 에 지구가 오는 한 해의 몫 0~1 — `orbitAngle` 의 역. */
export function fractionAt(theta: number): number {
  const f = (theta - YEAR_START_ANGLE) / (2 * Math.PI);
  return f - Math.floor(f);
}

/** 지금 지구의 궤도각 — 두 해의 몫을 더한다(한 해를 다 돌면 같은 자리라 이어진다). */
export function orbitAngleNow(tl: TimelineFrame): number {
  const f = yearFractions(tl);
  return orbitAngle(f.tilted + f.flat);
}

/** 궤도각 θ 에서 태양의 적위(라디안) — 축이 태양 쪽으로 기운 정도. */
export function declination(theta: number, tiltDeg: number): number {
  return Math.asin(-Math.sin(tiltDeg * DEG) * Math.cos(theta));
}

/** 북반구가 받는 햇빛의 몫 (1 + sin δ)/2. */
export function northShare(theta: number, tiltDeg: number): number {
  return (1 + Math.sin(declination(theta, tiltDeg))) / 2;
}

// ------------------------------------------------------------------------
// 투영
// ------------------------------------------------------------------------

const SIN_E = Math.sin(VIEW_ELEVATION);
const COS_E = Math.cos(VIEW_ELEVATION);
/** 화면 위 방향(3 차원). */
const UP: Vec3 = [0, COS_E, -SIN_E];
/** 보는 사람 쪽(3 차원). */
const TOWARD_VIEWER: Vec3 = [0, SIN_E, COS_E];

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** 3 차원 벡터를 화면 평면(오른쪽 · 위)으로 — 정사영. */
export function project(v: Vec3): Vec2 {
  return [v[0], dot(v, UP)];
}

/** 궤도각 θ 의 지구 자리(3 차원, 궤도 반지름 R). */
export function earthPosition3(theta: number, R: number): Vec3 {
  return [R * Math.cos(theta), 0, -R * Math.sin(theta)];
}

/** 자전축 방향(3 차원, 단위) — 기울기 τ 만큼 +X 쪽으로 기운다. 공전해도 바뀌지 않는다. */
export function axisDirection(tiltDeg: number): Vec3 {
  return [Math.sin(tiltDeg * DEG), Math.cos(tiltDeg * DEG), 0];
}

/**
 * 적도 가운데 보는 사람 쪽 반원(화면 오프셋, 지구 반지름 1 기준).
 * 적도는 축에 수직인 대원 — 두 바탕 벡터 (cos τ, −sin τ, 0) · (0, 0, 1).
 */
export function frontEquator(tiltDeg: number, samples: number): Vec2[][] {
  const t = tiltDeg * DEG;
  const e1: Vec3 = [Math.cos(t), -Math.sin(t), 0];
  const e2: Vec3 = [0, 0, 1];
  const runs: Vec2[][] = [];
  let run: Vec2[] = [];
  for (let k = 0; k <= samples; k++) {
    const phi = (2 * Math.PI * k) / samples;
    const p: Vec3 = [
      Math.cos(phi) * e1[0] + Math.sin(phi) * e2[0],
      Math.cos(phi) * e1[1] + Math.sin(phi) * e2[1],
      Math.cos(phi) * e1[2] + Math.sin(phi) * e2[2],
    ];
    if (dot(p, TOWARD_VIEWER) >= 0) {
      run.push(project(p));
    } else if (run.length > 0) {
      runs.push(run);
      run = [];
    }
  }
  if (run.length > 0) runs.push(run);
  // 표본이 한 바퀴를 돌며 앞쪽 반원이 처음과 끝으로 갈렸으면 잇는다.
  if (runs.length > 1) {
    const last = runs.pop()!;
    runs[0] = [...last, ...runs[0]!];
  }
  return runs.filter((r) => r.length > 1);
}

/**
 * 지구 원판의 명암 칸 값 — 행 우선, 첫 행이 위. 원판 밖은 `NaN`.
 * 칸의 화면 자리에서 구의 법선을 되살려 태양 방향과의 내적으로 밝기를 정한다 (장부 G69).
 */
export function earthShade(theta: number, cells: number): number[] {
  const s: Vec3 = [-Math.cos(theta), 0, Math.sin(theta)]; // 지구 → 태양(단위)
  const out = new Array<number>(cells * cells);
  for (let j = 0; j < cells; j++) {
    const sy = 1 - ((j + 0.5) / cells) * 2;
    for (let i = 0; i < cells; i++) {
      const sx = ((i + 0.5) / cells) * 2 - 1;
      const rr = sx * sx + sy * sy;
      if (rr > 1) {
        out[j * cells + i] = Number.NaN;
        continue;
      }
      const nz = Math.sqrt(1 - rr);
      // 법선 = 오른쪽 · sx + 위 · sy + 보는 쪽 · nz.
      const n: Vec3 = [sx, sy * UP[1] + nz * TOWARD_VIEWER[1], sy * UP[2] + nz * TOWARD_VIEWER[2]];
      const k = dot(n, s);
      const u = Math.max(0, Math.min(1, (k + TERMINATOR_SOFT) / (2 * TERMINATOR_SOFT)));
      const smooth = u * u * (3 - 2 * u);
      out[j * cells + i] = NIGHT_LIGHT + (1 - NIGHT_LIGHT) * smooth;
    }
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: AxialTiltSeasonsState }): AxialTiltSeasonsState {
  return params.state;
}
