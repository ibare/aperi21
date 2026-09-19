// ========================================================================
// prism — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 스테이지 상수와 시간표 진행도의 함수이고 `step` 은 항등이다.
//
// 줄기마다 두 면을 차례로 `refract`(plugin-optics 순수 함수)로 꺾는다. `traceRay` 의 `prism` 은
// 한 번만 굴절하므로 쓰지 않는다. `refract` 는 전반사 때 말없이 반사 벡터를 돌려주므로 둘째 면에서
// 임계각을 직접 비교해 판정하고, 새지 못한 줄기는 스크린에 닿지 않은 것으로 둔다.
//
// 굴절률 n(λ) 은 세 정박점을 x = 1/λ² 에 대한 이차식으로 잇는다(코시 식 앞 세 항과 같은 꼴).
// 화면에 쓰는 굴절률은 빨강에서 벗어난 몫만 `indexGain` 배 키운 값이다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { refract } from '@aperi21/plugin-optics';
import {
  APEX,
  APEX_DEG,
  HIT_FRACTION,
  INCIDENT_DEG,
  INDEX_GAIN,
  N_AIR,
  N_BLUE,
  N_RED,
  N_VIOLET,
  NM_BLUE,
  NM_RED,
  NM_VIOLET,
  RAY_COUNT,
  SCREEN_X,
  SIDE_LEN,
} from './schema';
import type { PrismState } from './state';

export const DEG = Math.PI / 180;

export interface PrismConstants {
  nAir: number;
  apexDeg: number;
  incidentDeg: number;
  nmRed: number;
  nRed: number;
  nmBlue: number;
  nBlue: number;
  nmViolet: number;
  nViolet: number;
  rayCount: number;
  indexGain: number;
}

export function readConstants(stage?: StageDef): PrismConstants {
  const c = (stage?.constants ?? {}) as Record<string, number | undefined>;
  return {
    nAir: c.nAir ?? N_AIR,
    apexDeg: c.apexDeg ?? APEX_DEG,
    incidentDeg: c.incidentDeg ?? INCIDENT_DEG,
    nmRed: c.nmRed ?? NM_RED,
    nRed: c.nRed ?? N_RED,
    nmBlue: c.nmBlue ?? NM_BLUE,
    nBlue: c.nBlue ?? N_BLUE,
    nmViolet: c.nmViolet ?? NM_VIOLET,
    nViolet: c.nViolet ?? N_VIOLET,
    rayCount: c.rayCount ?? RAY_COUNT,
    indexGain: c.indexGain ?? INDEX_GAIN,
  };
}

/**
 * 유리의 굴절률 n(λ). 세 정박점을 x = 1/λ² 에 대해 라그랑주 이차 보간한다.
 * 정박점 셋이 목록이 아니라 이름으로 흩어져 있다 (NOTES (c) G105).
 */
export function indexAt(c: PrismConstants, nm: number): number {
  const xs = [c.nmRed, c.nmBlue, c.nmViolet].map((l) => 1 / (l * l));
  const ns = [c.nRed, c.nBlue, c.nViolet];
  const x = 1 / (nm * nm);
  let n = 0;
  for (let i = 0; i < 3; i++) {
    let term = ns[i]!;
    for (let j = 0; j < 3; j++) {
      if (j !== i) term *= (x - xs[j]!) / (xs[i]! - xs[j]!);
    }
    n += term;
  }
  return n;
}

/** 화면에 쓰는 굴절률 — 빨강은 그대로, 다른 색이 빨강에서 벗어난 몫만 `indexGain` 배. */
export function shownIndex(c: PrismConstants, nm: number): number {
  return c.nRed + c.indexGain * (indexAt(c, nm) - c.nRed);
}

/** 줄기 파장 — 빨강 정박점에서 보라 정박점까지 고르게(0 이 빨강). */
export function rayWavelengths(c: PrismConstants): number[] {
  const count = Math.max(2, Math.round(c.rayCount));
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(c.nmRed + ((c.nmViolet - c.nmRed) * i) / (count - 1));
  return out;
}

const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Vec2, k: number): Vec2 => [a[0] * k, a[1] * k];
const cross = (a: Vec2, b: Vec2): number => a[0] * b[1] - a[1] * b[0];

/** 프리즘 모양 — 꼭지 · 왼쪽 밑 · 오른쪽 밑과 두 옆면의 바깥 법선. */
export interface PrismShape {
  apex: Vec2;
  baseLeft: Vec2;
  baseRight: Vec2;
  /** 꼭지에서 옆면을 따라 내려가는 단위 방향. */
  leftDir: Vec2;
  rightDir: Vec2;
  /** 옆면의 바깥 법선(프리즘 밖을 향한다). */
  leftOut: Vec2;
  rightOut: Vec2;
}

export function prismShape(c: PrismConstants): PrismShape {
  const h = (c.apexDeg * DEG) / 2;
  const leftDir: Vec2 = [-Math.sin(h), -Math.cos(h)];
  const rightDir: Vec2 = [Math.sin(h), -Math.cos(h)];
  return {
    apex: APEX,
    baseLeft: add(APEX, mul(leftDir, SIDE_LEN)),
    baseRight: add(APEX, mul(rightDir, SIDE_LEN)),
    leftDir,
    rightDir,
    leftOut: [-Math.cos(h), Math.sin(h)],
    rightOut: [Math.cos(h), Math.sin(h)],
  };
}

/** 흰 줄기가 첫 면에 닿는 자리와 들어오는 방향. 안쪽 법선을 위로 `incidentDeg` 만큼 돌린 방향이다. */
export function incoming(c: PrismConstants, s: PrismShape): { hit: Vec2; dir: Vec2 } {
  const inward: Vec2 = [-s.leftOut[0], -s.leftOut[1]];
  const i = c.incidentDeg * DEG;
  const dir: Vec2 = [
    inward[0] * Math.cos(i) - inward[1] * Math.sin(i),
    inward[0] * Math.sin(i) + inward[1] * Math.cos(i),
  ];
  return { hit: add(s.apex, mul(s.leftDir, SIDE_LEN * HIT_FRACTION)), dir };
}

/** 한 색 줄기의 길 — 첫 면 뒤 방향, 둘째 면 자리, 둘째 면 뒤 방향, 스크린 자리. */
export interface ColorPath {
  nm: number;
  /** 첫 면을 지난 방향(유리 속). */
  insideDir: Vec2;
  /** 둘째 면에 닿는 자리. */
  exitAt: Vec2;
  /** 둘째 면을 지난 방향. 전반사면 없다. */
  outDir?: Vec2;
  /** 스크린에 닿는 자리. 전반사면 없다. */
  screenAt?: Vec2;
}

export function tracePaths(c: PrismConstants, s: PrismShape): ColorPath[] {
  const { hit, dir } = incoming(c, s);
  return rayWavelengths(c).map((nm) => {
    const n = shownIndex(c, nm);
    // 첫 면 — 법선은 들어오는 쪽(바깥)을 향한다. eta = n₁ / n₂.
    const insideDir = refract(dir, s.leftOut, c.nAir / n);
    // 둘째 면(꼭지에서 rightDir 로 뻗은 선)과 만나는 자리.
    const rel: Vec2 = [s.apex[0] - hit[0], s.apex[1] - hit[1]];
    const t = cross(rel, s.rightDir) / cross(insideDir, s.rightDir);
    const exitAt = add(hit, mul(insideDir, t));
    // 둘째 면 — 법선은 들어오는 쪽(유리 속)을 향한다. 전반사는 직접 판정한다.
    const inNormal: Vec2 = [-s.rightOut[0], -s.rightOut[1]];
    const cosI = -(insideDir[0] * inNormal[0] + insideDir[1] * inNormal[1]);
    const eta = n / c.nAir;
    if (eta * eta * (1 - cosI * cosI) > 1) return { nm, insideDir, exitAt };
    const outDir = refract(insideDir, inNormal, eta);
    const k = (SCREEN_X - exitAt[0]) / outDir[0];
    return { nm, insideDir, exitAt, outDir, screenAt: add(exitAt, mul(outDir, k)) };
  });
}

/** 두 직선(점 + 방향)의 교점. 나란하면 첫 점. 둘째 면 뒤 괄호의 꼭짓점을 찾는 데 쓴다. */
export function lineMeet(p: Vec2, u: Vec2, q: Vec2, v: Vec2): Vec2 {
  const d = cross(u, v);
  if (Math.abs(d) < 1e-9) return p;
  const t = cross([q[0] - p[0], q[1] - p[1]], v) / d;
  return add(p, mul(u, t));
}

export interface Reading {
  /** 흰 줄기가 첫 면까지 자란 몫 0~1. */
  beamIn: number;
  /** 색 줄기가 유리 속으로 자란 몫 0~1. */
  inside: number;
  /** 첫 면 뒤 괄호의 짙기 0~1. */
  bracketIn: number;
  /** 색 줄기가 둘째 면에서 스크린까지 자란 몫 0~1. */
  exit: number;
  /** 스크린 띠의 짙기 0~1. */
  band: number;
  /** 둘째 면 뒤 괄호의 짙기 0~1. */
  bracketOut: number;
  /** 전체 짙기 0~1 — 주기 끝에 옅어진다. */
  visible: number;
}

/**
 * 시간표 진행도 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다.
 * 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` 가 그 단계 앞에서 0, 지난 뒤 1 이다.
 */
export function derive(tl: TimelineFrame): Reading {
  return {
    beamIn: tl.at('enter'),
    inside: tl.at('inside'),
    bracketIn: tl.at('bracketIn'),
    exit: tl.at('exit'),
    band: tl.at('band'),
    bracketOut: tl.at('bracketOut'),
    visible: 1 - tl.at('fade'),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: PrismState }): PrismState {
  return params.state;
}
