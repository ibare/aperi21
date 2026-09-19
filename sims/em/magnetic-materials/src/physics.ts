// ========================================================================
// magnetic-materials — 순수 계산
// ========================================================================
// 모든 것이 「자석이 얼마나 다가왔나」(시간표 `approach` 진행도 f, 0~1) 하나의 함수다.
//
// - 자석 N 끝면은 f 에 따라 `approachTravel` 만큼 곧게 다가온다.
// - 약한 자성체의 기울기: tanθ = k · χ · (f · B dB/dx) / (μ₀ ρ g), k = 과장 배율.
//   χ > 0(상자성)이면 자석 쪽(+x)으로, χ < 0(반자성)이면 반대쪽으로 기운다.
// - 강자성은 f 에 따라 자석 면에 닿는 기울기까지 간다 — 닿으면 붙는다.
// - 쌍극자: 자석 N극이 막대 오른쪽에 있으므로 막대 자리의 B 는 −x 쪽이다.
//   강자성은 구역째 B 쪽으로 모두 돌고, 상자성은 열 흔들림 속에 `paraAlign` 만큼만 돌고,
//   반자성은 영구 쌍극자가 없다가 B 반대(+x)쪽 유도 쌍극자가 f 만큼 자란다.
//
// 열 흔들림은 (시드, 조각 시계)의 함수라 쌓는 상태가 없다 — 같은 시각은 같은 화면이다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  ALUMINUM_CHI,
  ALUMINUM_DENSITY,
  APPROACH_TRAVEL,
  BAR_HEIGHT,
  BAR_WIDTH,
  BISMUTH_CHI,
  BISMUTH_DENSITY,
  B_GRAD_B,
  DIA_DIPOLE_LENGTH,
  DIA_X,
  DIPOLE_GAP_X,
  DIPOLE_GAP_Y,
  DIPOLE_LENGTH,
  FERRO_X,
  GRAVITY,
  MAGNET_GAP,
  MAGNET_LENGTH,
  MAGNET_THICKNESS,
  MAGNET_Y,
  MU0,
  PARA_ALIGN,
  PARA_X,
  PENDULUM_LENGTH,
  PIVOT_Y,
  SEED,
  THERMAL_HZ,
  THERMAL_WOBBLE_DEG,
  WEAK_EXAGGERATION,
} from './schema';
import type { MagneticMaterialsState } from './state';

/** 막대 안 쌍극자 격자의 칸 수 — 가로 · 세로. 목록 길이라 코드에 남는다 (장부 G105). */
const DIPOLE_COLS = 3;
const DIPOLE_ROWS = 3;
/** 강자성 닿는 기울기를 푸는 되풀이 횟수. 고정점이 빠르게 모인다. */
const CONTACT_ITERATIONS = 12;
/** 막대 자리의 B 방향 — 자석 N극이 오른쪽에 있어 −x 다. */
const FIELD_ANGLE = Math.PI;

export type MaterialKind = 'ferro' | 'para' | 'dia';

export interface MagneticMaterialsConstants {
  mu0: number;
  gravity: number;
  bGradB: number;
  aluminumChi: number;
  aluminumDensity: number;
  bismuthChi: number;
  bismuthDensity: number;
  weakExaggeration: number;
  x: Record<MaterialKind, number>;
  pivotY: number;
  pendulumLength: number;
  barWidth: number;
  barHeight: number;
  dipoleGapX: number;
  dipoleGapY: number;
  dipoleLength: number;
  diaDipoleLength: number;
  magnetLength: number;
  magnetThickness: number;
  magnetY: number;
  magnetGap: number;
  approachTravel: number;
  paraAlign: number;
  thermalWobbleDeg: number;
  thermalHz: number;
  seed: number;
}

export function readConstants(stage: StageDef): MagneticMaterialsConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    mu0: c.mu0 ?? MU0,
    gravity: c.gravity ?? GRAVITY,
    bGradB: c.bGradB ?? B_GRAD_B,
    aluminumChi: c.aluminumChi ?? ALUMINUM_CHI,
    aluminumDensity: c.aluminumDensity ?? ALUMINUM_DENSITY,
    bismuthChi: c.bismuthChi ?? BISMUTH_CHI,
    bismuthDensity: c.bismuthDensity ?? BISMUTH_DENSITY,
    weakExaggeration: c.weakExaggeration ?? WEAK_EXAGGERATION,
    x: {
      ferro: c.ferroX ?? FERRO_X,
      para: c.paraX ?? PARA_X,
      dia: c.diaX ?? DIA_X,
    },
    pivotY: c.pivotY ?? PIVOT_Y,
    pendulumLength: c.pendulumLength ?? PENDULUM_LENGTH,
    barWidth: c.barWidth ?? BAR_WIDTH,
    barHeight: c.barHeight ?? BAR_HEIGHT,
    dipoleGapX: c.dipoleGapX ?? DIPOLE_GAP_X,
    dipoleGapY: c.dipoleGapY ?? DIPOLE_GAP_Y,
    dipoleLength: c.dipoleLength ?? DIPOLE_LENGTH,
    diaDipoleLength: c.diaDipoleLength ?? DIA_DIPOLE_LENGTH,
    magnetLength: c.magnetLength ?? MAGNET_LENGTH,
    magnetThickness: c.magnetThickness ?? MAGNET_THICKNESS,
    magnetY: c.magnetY ?? MAGNET_Y,
    magnetGap: c.magnetGap ?? MAGNET_GAP,
    approachTravel: c.approachTravel ?? APPROACH_TRAVEL,
    paraAlign: c.paraAlign ?? PARA_ALIGN,
    thermalWobbleDeg: c.thermalWobbleDeg ?? THERMAL_WOBBLE_DEG,
    thermalHz: c.thermalHz ?? THERMAL_HZ,
    seed: c.seed ?? SEED,
  };
}

// ------------------------------------------------------------------------
// 자석
// ------------------------------------------------------------------------

/** 자석 N 끝면(왼쪽 면)의 x. f = 0 이면 `approachTravel` 만큼 더 멀다. */
export function magnetFaceX(c: MagneticMaterialsConstants, kind: MaterialKind, f: number): number {
  return c.x[kind] + c.barWidth / 2 + c.magnetGap + c.approachTravel * (1 - f);
}

/** 자석 가운데. */
export function magnetCenter(c: MagneticMaterialsConstants, kind: MaterialKind, f: number): Vec2 {
  return [magnetFaceX(c, kind, f) + c.magnetLength / 2, c.magnetY];
}

// ------------------------------------------------------------------------
// 기울기
// ------------------------------------------------------------------------

/**
 * 약한 자성체가 받는 자기력 / 무게 = χ · B dB/dx / (μ₀ ρ g). 과장 배율은 곱하지 않은 실제 값.
 * f 는 자석이 다가온 정도 — B dB/dx 가 그만큼 자란다.
 */
export function weakForceRatio(c: MagneticMaterialsConstants, kind: 'para' | 'dia', f: number): number {
  const chi = kind === 'para' ? c.aluminumChi : c.bismuthChi;
  const rho = kind === 'para' ? c.aluminumDensity : c.bismuthDensity;
  return (chi * c.bGradB * f) / (c.mu0 * rho * c.gravity);
}

/**
 * 강자성이 자석 면에 닿는 기울기. 기운 막대에서 가장 오른쪽인 아래 모서리가 다가온 자석
 * 면에 닿는다: (L + h/2) sinθ + (w/2) cosθ = w/2 + gap.
 */
export function ferroContactTilt(c: MagneticMaterialsConstants): number {
  const target = c.barWidth / 2 + c.magnetGap;
  let theta = 0;
  for (let i = 0; i < CONTACT_ITERATIONS; i++) {
    const s = (target - (c.barWidth / 2) * Math.cos(theta)) / (c.pendulumLength + c.barHeight / 2);
    theta = Math.asin(Math.min(1, Math.max(-1, s)));
  }
  return theta;
}

/** 기울기(라디안). + 는 자석 쪽(+x)으로 기운 것. */
export function tilt(c: MagneticMaterialsConstants, kind: MaterialKind, f: number): number {
  if (kind === 'ferro') return ferroContactTilt(c) * f;
  return Math.atan(c.weakExaggeration * weakForceRatio(c, kind, f));
}

export interface BarPose {
  /** 막대 가운데. */
  center: Vec2;
  /** 막대 윗면 가운데 — 실이 매인 자리. */
  top: Vec2;
  /** 반시계 회전(라디안). 기울기와 같다. */
  angle: number;
}

export function barPose(c: MagneticMaterialsConstants, kind: MaterialKind, f: number): BarPose {
  const th = tilt(c, kind, f);
  const s = Math.sin(th);
  const co = Math.cos(th);
  const x0 = c.x[kind];
  const center: Vec2 = [x0 + c.pendulumLength * s, c.pivotY - c.pendulumLength * co];
  const top: Vec2 = [center[0] - (c.barHeight / 2) * s, center[1] + (c.barHeight / 2) * co];
  return { center, top, angle: th };
}

/** 막대 안 좌표(가로 · 세로) → 월드. 막대와 함께 돈다. */
export function barToWorld(pose: BarPose, local: Vec2): Vec2 {
  const s = Math.sin(pose.angle);
  const co = Math.cos(pose.angle);
  return [pose.center[0] + local[0] * co - local[1] * s, pose.center[1] + local[0] * s + local[1] * co];
}

// ------------------------------------------------------------------------
// 쌍극자
// ------------------------------------------------------------------------

/** 시드 결정적 난수 (mulberry32). 다른 sim 의 것을 가져오지 않는다 (S-sim · C3). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** a 에서 b 로 짧은 쪽으로 몫 w 만큼 돈 각. */
function turnToward(a: number, b: number, w: number): number {
  let d = (b - a) % (2 * Math.PI);
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return a + d * w;
}

export interface Dipole {
  /** 격자 자리(월드). 화살표는 이 자리를 가운데로 둔다. */
  site: Vec2;
  /** 화살표(S → N) 시작점과 벡터(월드). 길이 0 이면 없다. */
  from: Vec2;
  delta: Vec2;
}

/** 격자 칸의 막대 안 좌표. 행 j = 0 이 위. */
function latticeLocal(c: MagneticMaterialsConstants, i: number, j: number): Vec2 {
  return [(i - (DIPOLE_COLS - 1) / 2) * c.dipoleGapX, ((DIPOLE_ROWS - 1) / 2 - j) * c.dipoleGapY];
}

/**
 * 막대 안 쌍극자. `t` 는 조각 시계(초) — 상자성의 열 흔들림에만 쓴다.
 *
 * - 강자성: 한 행이 한 구역이다. 구역의 처음 방향은 시드에서 뽑은 각 + 행마다 120° 라
 *   셋의 합이 0 이다(자석이 멀 때 막대 전체는 자석이 아니다). f 만큼 B 쪽으로 돈다.
 * - 상자성: 칸마다 시드에서 뽑은 방향 + 흔들림. `paraAlign · f` 만큼만 B 쪽으로 돈다.
 * - 반자성: B 반대쪽 유도 쌍극자, 길이가 f 에 비례한다.
 */
export function dipoles(
  c: MagneticMaterialsConstants,
  kind: MaterialKind,
  pose: BarPose,
  f: number,
  t: number,
): Dipole[] {
  const rand = rng(c.seed + (kind === 'ferro' ? 0 : kind === 'para' ? 1 : 2));
  const domainBase = rand() * 2 * Math.PI;
  const wobble = (c.thermalWobbleDeg * Math.PI) / 180;
  const out: Dipole[] = [];
  for (let j = 0; j < DIPOLE_ROWS; j++) {
    for (let i = 0; i < DIPOLE_COLS; i++) {
      const site = barToWorld(pose, latticeLocal(c, i, j));
      let angle: number;
      let len: number;
      if (kind === 'ferro') {
        angle = turnToward(domainBase + (j * 2 * Math.PI) / DIPOLE_ROWS, FIELD_ANGLE, f);
        len = c.dipoleLength;
      } else if (kind === 'para') {
        const base = rand() * 2 * Math.PI;
        const phase = rand() * 2 * Math.PI;
        const jiggle = wobble * Math.sin(2 * Math.PI * c.thermalHz * t + phase);
        angle = turnToward(base + jiggle, FIELD_ANGLE, c.paraAlign * f);
        len = c.dipoleLength;
      } else {
        angle = FIELD_ANGLE - Math.PI;
        len = c.diaDipoleLength * f;
      }
      const d: Vec2 = [Math.cos(angle) * len, Math.sin(angle) * len];
      out.push({ site, from: [site[0] - d[0] / 2, site[1] - d[1] / 2], delta: d });
    }
  }
  return out;
}

/** 강자성 구역 경계 — 행 사이의 가로선 양 끝(월드). */
export function domainWalls(c: MagneticMaterialsConstants, pose: BarPose): [Vec2, Vec2][] {
  const walls: [Vec2, Vec2][] = [];
  for (let j = 1; j < DIPOLE_ROWS; j++) {
    const y = ((DIPOLE_ROWS - 1) / 2 - j + 0.5) * c.dipoleGapY;
    walls.push([barToWorld(pose, [-c.barWidth / 2, y]), barToWorld(pose, [c.barWidth / 2, y])]);
  }
  return walls;
}

/** 상태는 캡션 글자뿐이다 — 항등 걸음 (S-sim). */
export function step(params: { state: MagneticMaterialsState }): MagneticMaterialsState {
  return params.state;
}
