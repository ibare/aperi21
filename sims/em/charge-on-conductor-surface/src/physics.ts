// ========================================================================
// charge-on-conductor-surface — 순수 계산
// ========================================================================
// 시간을 모른다. 스테이지 상수에서 한 번 —
//
//   1. 도체 모양: 두 원(뭉툭한 끝 · 뾰족한 끝)을 감싸는 볼록 다각형.
//   2. 처음 자리: 시드 결정적 난수로 도체 한가운데 작은 원 안에 흩뿌린다.
//   3. 이완: 알갱이끼리 단면의 쿨롱 힘(거리에 반비례)으로 밀고, 한 번에 옮기는 거리를
//      상한으로 자르고, 도체 밖으로 나가면 가장 가까운 겉면 점으로 되돌린다. 되풀이하는
//      동안 스냅숏을 남긴다 — 화면은 이것을 `spread` 진행도로 되감는다.
//   4. 견줄 두 호: 뭉툭한 끝 · 뾰족한 끝을 가운데로 같은 길이.
//   5. 장 화살표: 마지막 자리에서 겉면 바로 바깥의 장을 재서 바깥 법선 성분을 길이로.
//
// 단면의 힘을 고른 까닭: 거리 제곱에 반비례하는 힘을 평면에 가두면 도체 속에도 평형
// 자리가 생긴다. 단면의 쿨롱 힘은 전위가 조화 함수라 알갱이가 없는 곳에 안정한 평형이
// 없고(언쇼 정리), 알갱이가 모두 겉면으로 간다 — 긴 기둥 도체의 단면이 실제로 그렇다.
//
// 무거워서(알갱이 40 × 40 × 400 번) 매 프레임 풀지 않는다. `initialState` 가 한 번
// 불러 state 에 담는다 (장부 G189).
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  ARC_LENGTH,
  BLUNT_RADIUS,
  CENTER_GAP,
  CHARGE_COUNT,
  CLUSTER_RADIUS,
  CLUSTER_SHIFT,
  FIELD_ARROWS,
  FIELD_CAP,
  FIELD_PROBE,
  FIELD_SCALE,
  RELAX_GAIN,
  RELAX_STEPS,
  RELAX_STEP_CAP,
  SEED,
  TIP_RADIUS,
} from './schema';
import type { ChargeOnConductorSurfaceState } from './state';

/** 뾰족한 끝 원호를 나누는 꼭짓점 수. */
const TIP_ARC_SAMPLES = 24;
/** 뭉툭한 끝 원호를 나누는 꼭짓점 수. */
const BLUNT_ARC_SAMPLES = 144;
/** 이완 경로에서 남기는 스냅숏 수(처음과 끝 포함). */
const SNAPSHOTS = 81;
/** 두 알갱이가 겹칠 때 힘이 무한히 커지지 않게 더하는 작은 거리 제곱. */
const SOFTEN_SQ = 1e-4;
/** 호를 따라 긋는 선의 꼭짓점 수. */
const ARC_SAMPLES = 24;

export interface ConductorConstants {
  chargeCount: number;
  seed: number;
  bluntRadius: number;
  tipRadius: number;
  centerGap: number;
  clusterRadius: number;
  clusterShift: number;
  relaxSteps: number;
  relaxGain: number;
  relaxStepCap: number;
  arcLength: number;
  fieldArrows: number;
  fieldProbe: number;
  fieldScale: number;
  fieldCap: number;
}

export function readConstants(stage: StageDef): ConductorConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    chargeCount: c.chargeCount ?? CHARGE_COUNT,
    seed: c.seed ?? SEED,
    bluntRadius: c.bluntRadius ?? BLUNT_RADIUS,
    tipRadius: c.tipRadius ?? TIP_RADIUS,
    centerGap: c.centerGap ?? CENTER_GAP,
    clusterRadius: c.clusterRadius ?? CLUSTER_RADIUS,
    clusterShift: c.clusterShift ?? CLUSTER_SHIFT,
    relaxSteps: c.relaxSteps ?? RELAX_STEPS,
    relaxGain: c.relaxGain ?? RELAX_GAIN,
    relaxStepCap: c.relaxStepCap ?? RELAX_STEP_CAP,
    arcLength: c.arcLength ?? ARC_LENGTH,
    fieldArrows: c.fieldArrows ?? FIELD_ARROWS,
    fieldProbe: c.fieldProbe ?? FIELD_PROBE,
    fieldScale: c.fieldScale ?? FIELD_SCALE,
    fieldCap: c.fieldCap ?? FIELD_CAP,
  };
}

// ------------------------------------------------------------------------
// 난수 — 시드 결정적 (mulberry32)
// ------------------------------------------------------------------------

function seeded(seed: number): () => number {
  let a = Math.floor(seed) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------------
// 도체 모양
// ------------------------------------------------------------------------

export interface Outline {
  /** 반시계 방향 볼록 다각형. 첫 꼭짓점이 뾰족한 끝의 맨 끝이다. */
  points: Vec2[];
  /** 꼭짓점 i 까지의 겉면 길이. 길이는 points.length + 1 (마지막이 둘레). */
  cum: number[];
  /** 뭉툭한 끝의 맨 끝(왼쪽 끝)의 겉면 길이 자리. */
  bluntAt: number;
  bluntCenter: Vec2;
  tipCenter: Vec2;
}

/**
 * 두 원을 감싸는 볼록 물방울. 뭉툭한 원은 왼쪽(−x), 뾰족한 원은 오른쪽(+x).
 * 공통 접선이 원에 닿는 방향각 φ0 은 cos φ0 = (R − r) / d.
 */
export function outline(c: ConductorConstants): Outline {
  const R = Math.max(c.bluntRadius, c.tipRadius);
  const r = Math.min(c.bluntRadius, c.tipRadius);
  const d = Math.max(c.centerGap, R - r + 1e-6);
  const bluntCenter: Vec2 = [-d / 2, 0];
  const tipCenter: Vec2 = [d / 2, 0];
  const phi0 = Math.acos(Math.min(1, (R - r) / d));
  const points: Vec2[] = [];
  // 뾰족한 끝 — 맨 끝(φ=0)에서 시작해 위로 φ0 까지, 이어서 뭉툭한 끝, 마지막에 −φ0 에서 0 으로.
  const tipHalf = TIP_ARC_SAMPLES / 2;
  for (let i = 0; i < tipHalf; i++) {
    const f = (phi0 * i) / tipHalf;
    points.push([tipCenter[0] + r * Math.cos(f), r * Math.sin(f)]);
  }
  for (let i = 0; i < BLUNT_ARC_SAMPLES; i++) {
    const f = phi0 + ((2 * Math.PI - 2 * phi0) * i) / BLUNT_ARC_SAMPLES;
    points.push([bluntCenter[0] + R * Math.cos(f), R * Math.sin(f)]);
  }
  for (let i = 0; i < tipHalf; i++) {
    const f = -phi0 + (phi0 * i) / tipHalf;
    points.push([tipCenter[0] + r * Math.cos(f), r * Math.sin(f)]);
  }
  const cum = [0];
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!;
    const b = points[(i + 1) % points.length]!;
    cum.push(cum[i]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  // 뭉툭한 끝의 맨 끝(φ=π)은 뭉툭한 호의 가운데 꼭짓점이다.
  const bluntAt = cum[tipHalf + BLUNT_ARC_SAMPLES / 2]!;
  return { points, cum, bluntAt, bluntCenter, tipCenter };
}

function isInside(o: Outline, p: Vec2): boolean {
  const n = o.points.length;
  for (let i = 0; i < n; i++) {
    const a = o.points[i]!;
    const b = o.points[(i + 1) % n]!;
    if ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) < 0) return false;
  }
  return true;
}

/** 겉면에서 가장 가까운 점과 그 겉면 길이 자리. */
function nearestOnOutline(o: Outline, p: Vec2): { point: Vec2; s: number; dist: number } {
  const n = o.points.length;
  let best: { point: Vec2; s: number; dist: number } = { point: o.points[0]!, s: 0, dist: Infinity };
  for (let i = 0; i < n; i++) {
    const a = o.points[i]!;
    const b = o.points[(i + 1) % n]!;
    const vx = b[0] - a[0];
    const vy = b[1] - a[1];
    const len2 = vx * vx + vy * vy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / len2));
    const q: Vec2 = [a[0] + vx * t, a[1] + vy * t];
    const dist = Math.hypot(p[0] - q[0], p[1] - q[1]);
    if (dist < best.dist) best = { point: q, s: o.cum[i]! + t * (o.cum[i + 1]! - o.cum[i]!), dist };
  }
  return best;
}

/** 겉면 길이 자리 s 의 점과 바깥 법선. */
export function pointAt(o: Outline, s: number): { point: Vec2; normal: Vec2 } {
  const n = o.points.length;
  const per = o.cum[n]!;
  const ss = ((s % per) + per) % per;
  let i = 0;
  while (i < n - 1 && o.cum[i + 1]! <= ss) i++;
  const a = o.points[i]!;
  const b = o.points[(i + 1) % n]!;
  const seg = o.cum[i + 1]! - o.cum[i]!;
  const t = seg === 0 ? 0 : (ss - o.cum[i]!) / seg;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  // 반시계 다각형의 바깥 법선은 접선을 시계 방향으로 돌린 것이다.
  return { point: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], normal: [(b[1] - a[1]) / len, -(b[0] - a[0]) / len] };
}

// ------------------------------------------------------------------------
// 이완
// ------------------------------------------------------------------------

function scatter(c: ConductorConstants, o: Outline): Vec2[] {
  const rand = seeded(c.seed);
  const n = Math.max(0, Math.round(c.chargeCount));
  const cx = o.bluntCenter[0] + c.clusterShift;
  const out: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const a = 2 * Math.PI * rand();
    const rr = c.clusterRadius * Math.sqrt(rand());
    out.push([cx + rr * Math.cos(a), rr * Math.sin(a)]);
  }
  return out;
}

function relaxOnce(c: ConductorConstants, o: Outline, p: readonly Vec2[]): Vec2[] {
  return p.map((pi, i) => {
    let fx = 0;
    let fy = 0;
    for (let j = 0; j < p.length; j++) {
      if (j === i) continue;
      const pj = p[j]!;
      const dx = pi[0] - pj[0];
      const dy = pi[1] - pj[1];
      const d2 = dx * dx + dy * dy + SOFTEN_SQ;
      fx += dx / d2;
      fy += dy / d2;
    }
    let mx = c.relaxGain * fx;
    let my = c.relaxGain * fy;
    const m = Math.hypot(mx, my);
    if (m > c.relaxStepCap) {
      mx *= c.relaxStepCap / m;
      my *= c.relaxStepCap / m;
    }
    const q: Vec2 = [pi[0] + mx, pi[1] + my];
    return isInside(o, q) ? q : nearestOnOutline(o, q).point;
  });
}

/** 이완 경로의 스냅숏들. 첫째가 처음 한 줌, 마지막이 겉면에 멈춘 자리. */
export function relax(c: ConductorConstants, o: Outline): Vec2[][] {
  const steps = Math.max(1, Math.round(c.relaxSteps));
  let p = scatter(c, o);
  const frames: Vec2[][] = [p];
  let taken = 0;
  for (let k = 1; k < SNAPSHOTS; k++) {
    const until = Math.round((steps * k) / (SNAPSHOTS - 1));
    for (; taken < until; taken++) p = relaxOnce(c, o, p);
    frames.push(p);
  }
  return frames;
}

/** 스냅숏 사이를 진행도 0~1 로 잇는다. */
export function framesAt(frames: readonly (readonly Vec2[])[], progress: number): Vec2[] {
  const last = frames.length - 1;
  const x = Math.max(0, Math.min(1, progress)) * last;
  const k = Math.min(last - 1, Math.floor(x));
  if (last <= 0) return [...(frames[0] ?? [])];
  const s = x - k;
  const a = frames[k]!;
  const b = frames[k + 1]!;
  return a.map((pa, i) => {
    const pb = b[i] ?? pa;
    return [pa[0] + (pb[0] - pa[0]) * s, pa[1] + (pb[1] - pa[1]) * s];
  });
}

// ------------------------------------------------------------------------
// 견줄 두 호 · 장 화살표
// ------------------------------------------------------------------------

/** 겉면 길이 자리 s 를 가운데로 길이 len 인 호를, 겉면에서 gap 만큼 바깥으로 띄운 꺾은선. */
export function arcPath(o: Outline, s: number, len: number, gap: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i <= ARC_SAMPLES; i++) {
    const { point, normal } = pointAt(o, s - len / 2 + (len * i) / ARC_SAMPLES);
    out.push([point[0] + normal[0] * gap, point[1] + normal[1] * gap]);
  }
  return out;
}

export interface FieldArrow {
  from: Vec2;
  delta: Vec2;
}

/**
 * 겉면 바로 바깥(`fieldProbe`)의 장. 알갱이마다 단면의 쿨롱 장(거리에 반비례)을 더하고
 * 바깥 법선 성분만 길이로 쓴다. 겉면에서 장은 겉면에 수직이라 버리는 성분은 작다.
 */
export function fieldArrows(c: ConductorConstants, o: Outline, charges: readonly Vec2[]): FieldArrow[] {
  const n = Math.max(0, Math.round(c.fieldArrows));
  const per = o.cum[o.points.length]!;
  const out: FieldArrow[] = [];
  for (let k = 0; k < n; k++) {
    const { point, normal } = pointAt(o, (per * k) / n);
    const probe: Vec2 = [point[0] + normal[0] * c.fieldProbe, point[1] + normal[1] * c.fieldProbe];
    let ex = 0;
    let ey = 0;
    for (const q of charges) {
      const dx = probe[0] - q[0];
      const dy = probe[1] - q[1];
      const d2 = dx * dx + dy * dy + SOFTEN_SQ;
      ex += dx / d2;
      ey += dy / d2;
    }
    const en = Math.max(0, ex * normal[0] + ey * normal[1]);
    const len = Math.min(c.fieldCap, c.fieldScale * en);
    out.push({ from: point, delta: [normal[0] * len, normal[1] * len] });
  }
  return out;
}

export function step(params: { state: ChargeOnConductorSurfaceState }): ChargeOnConductorSurfaceState {
  return params.state;
}
