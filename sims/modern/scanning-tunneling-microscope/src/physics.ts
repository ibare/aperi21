// ========================================================================
// scanning-tunneling-microscope — 순수 물리
// ========================================================================
// 터널 전류 — 탐침 끝 원자와 표면 원자 i 사이 틈(겉면 사이 거리) gᵢ 에 대해
//   I = Σᵢ 10^(−gᵢ / decadeGap)
// 틈이 `decadeGap` 좁아질 때마다 한 원자의 몫이 10 배가 된다. 맞춤 전류는 원자 하나 위에서 틈이
// `gapSet` 일 때의 값 10^(−gapSet / decadeGap) 이다.
//
// 되먹임 — 훑는 동안 탐침은 전류가 맞춤값인 높이에 있다(되먹임이 완벽하다고 둔다). 그 높이
// h(x) 를 이분법으로 푼다. 원자 바로 위에서 가장 높고, 원자 사이에서는 두 원자의 몫이 더해져도
// 거리가 멀어 조금 내려간다 — 그 오르내림이 기록이다.
//
// 전자 점 — 전류는 틈을 건너는 전자 점의 잦기로 보인다. 누적 방출 수 N(u) = ∫ 방출률 du 를 주기
// 안 시각의 표로 만들고, k 번째 점은 N 이 k + (시드로 뽑은 어긋남)을 지나는 순간 태어난다. 태어난
// 시각 · 떨어질 원자 · 옆 흔들림이 모두 (`seed`, 주기 번호, k)의 함수라 같은 시각은 언제나 같은
// 화면이다 — 상태를 쌓지 않는다 (S-sim).
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ATOM_COUNT,
  ATOM_RADIUS,
  CROSS_TIME,
  DECADE_GAP,
  ELECTRON_RATE,
  GAP_FAR,
  GAP_MID,
  GAP_SET,
  IMPURITY_INDEX,
  IMPURITY_RADIUS,
  LATTICE_SPACING,
  RECORD_GAIN,
  SCAN_END,
  SCAN_START,
  SEED,
  TIP_RADIUS,
} from './schema';
import type { ScanningTunnelingMicroscopeState } from './state';

/** 누적 방출 표의 시각 간격(초). */
const EMIT_DT = 0.01;
/** 등전류 높이를 푸는 이분법 반복 수와 찾는 높이 폭(nm, 맞닿은 높이 위로). */
const CONTOUR_ITERATIONS = 40;
const CONTOUR_SEARCH = 2;
/**
 * 방출 어긋남의 폭 — k 번째 점은 N = k + 이 값 × (0~1 난수)에서 태어난다. 1 보다 작아야
 * 태어나는 순서가 번호 순서와 같다.
 */
const EMIT_SPREAD = 0.9;

export interface ScanningTunnelingMicroscopeConstants {
  latticeSpacing: number;
  atomRadius: number;
  tipRadius: number;
  atomCount: number;
  decadeGap: number;
  gapFar: number;
  gapMid: number;
  gapSet: number;
  electronRate: number;
  crossTime: number;
  scanStart: number;
  scanEnd: number;
  impurityIndex: number;
  impurityRadius: number;
  recordGain: number;
  seed: number;
}

export function readConstants(stage: StageDef): ScanningTunnelingMicroscopeConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    latticeSpacing: c.latticeSpacing ?? LATTICE_SPACING,
    atomRadius: c.atomRadius ?? ATOM_RADIUS,
    tipRadius: c.tipRadius ?? TIP_RADIUS,
    atomCount: c.atomCount ?? ATOM_COUNT,
    decadeGap: c.decadeGap ?? DECADE_GAP,
    gapFar: c.gapFar ?? GAP_FAR,
    gapMid: c.gapMid ?? GAP_MID,
    gapSet: c.gapSet ?? GAP_SET,
    electronRate: c.electronRate ?? ELECTRON_RATE,
    crossTime: c.crossTime ?? CROSS_TIME,
    scanStart: c.scanStart ?? SCAN_START,
    scanEnd: c.scanEnd ?? SCAN_END,
    impurityIndex: c.impurityIndex ?? IMPURITY_INDEX,
    impurityRadius: c.impurityRadius ?? IMPURITY_RADIUS,
    recordGain: c.recordGain ?? RECORD_GAIN,
    seed: c.seed ?? SEED,
  };
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

// ------------------------------------------------------------------------
// 표면 · 전류
// ------------------------------------------------------------------------

/** 윗줄 원자 중심. 가운데가 x = 0, 중심 높이 y = 0. */
export function atomCenters(c: ScanningTunnelingMicroscopeConstants): Vec2[] {
  const out: Vec2[] = [];
  const n = Math.max(1, Math.round(c.atomCount));
  for (let i = 0; i < n; i++) out.push([(i - (n - 1) / 2) * c.latticeSpacing, 0]);
  return out;
}

/** 윗줄 원자 i 의 반지름 — 크기가 다른 원자 하나만 `impurityRadius`. */
export function atomRadiusAt(i: number, c: ScanningTunnelingMicroscopeConstants): number {
  return i === Math.round(c.impurityIndex) ? c.impurityRadius : c.atomRadius;
}

/** 탐침 끝 원자 중심이 `p` 일 때 원자 i 와의 틈(겉면 사이 거리). */
function gapTo(p: Vec2, atom: Vec2, i: number, c: ScanningTunnelingMicroscopeConstants): number {
  return Math.hypot(p[0] - atom[0], p[1] - atom[1]) - atomRadiusAt(i, c) - c.tipRadius;
}

/** 원자마다의 전류 몫. 합이 터널 전류다. */
export function currentShares(
  p: Vec2,
  atoms: readonly Vec2[],
  c: ScanningTunnelingMicroscopeConstants,
): number[] {
  return atoms.map((a, i) => Math.pow(10, -gapTo(p, a, i, c) / c.decadeGap));
}

/** 되먹임이 맞추는 전류 — 원자 하나 위에서 틈이 `gapSet` 일 때. */
function setpoint(c: ScanningTunnelingMicroscopeConstants): number {
  return Math.pow(10, -c.gapSet / c.decadeGap);
}

/** 원자 바로 위, 틈 `gap` 인 탐침 끝 원자 중심 높이. */
export function heightAtGap(gap: number, c: ScanningTunnelingMicroscopeConstants): number {
  return c.atomRadius + c.tipRadius + gap;
}

/** 자리 x 에서 전류가 맞춤값인 탐침 끝 원자 중심 높이 — 되먹임이 탐침을 두는 곳. */
export function contourHeight(
  x: number,
  atoms: readonly Vec2[],
  c: ScanningTunnelingMicroscopeConstants,
): number {
  const target = setpoint(c);
  let lo = c.atomRadius + c.tipRadius;
  let hi = lo + CONTOUR_SEARCH;
  for (let i = 0; i < CONTOUR_ITERATIONS; i++) {
    const mid = (lo + hi) / 2;
    const sum = currentShares([x, mid], atoms, c).reduce((s, v) => s + v, 0);
    // 전류는 높을수록 준다 — 맞춤값보다 크면 더 올라가야 한다.
    if (sum > target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** 틈이 가장 좁은 원자의 번호. */
export function nearestAtom(
  p: Vec2,
  atoms: readonly Vec2[],
  c: ScanningTunnelingMicroscopeConstants,
): number {
  let best = 0;
  let bestD = Infinity;
  atoms.forEach((a, i) => {
    const d = gapTo(p, a, i, c);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

// ------------------------------------------------------------------------
// 시간표 — 탐침 자리
// ------------------------------------------------------------------------

/**
 * 주기 안 시각 `u` 의 접근 틈. `step1` · `step2` 동안 한 칸씩 곧게 내려간다.
 *
 * 누적 방출 표가 지난 시각의 틈을 물어야 하는데 `TimelineFrame` 은 지금 시각의 진행도만 준다
 * (장부 G59). 그래서 선언된 단계 시작 · 길이로 곧은(linear) 진행도를 다시 셈한다 — 두 단계의
 * 이징을 선언에서 바꾸면 지금 탐침 자리(`tl.at`)와 방출 표가 조금 어긋난다.
 */
function approachGapAt(u: number, tl: TimelineFrame, c: ScanningTunnelingMicroscopeConstants): number {
  const s1 = clamp01((u - tl.start('step1')) / tl.duration('step1'));
  const s2 = clamp01((u - tl.start('step2')) / tl.duration('step2'));
  return c.gapFar + (c.gapMid - c.gapFar) * s1 + (c.gapSet - c.gapMid) * s2;
}

/** 지금 탐침 끝 원자 중심. 훑기 전에는 첫 원자 위에서 내려오고, 훑는 동안은 등전류 높이를 탄다. */
export function tipPosition(
  tl: TimelineFrame,
  atoms: readonly Vec2[],
  c: ScanningTunnelingMicroscopeConstants,
): Vec2 {
  const scan = tl.at('scan');
  if (scan <= 0) {
    const gap = c.gapFar + (c.gapMid - c.gapFar) * tl.at('step1') + (c.gapSet - c.gapMid) * tl.at('step2');
    return [c.scanStart, heightAtGap(gap, c)];
  }
  const x = c.scanStart + (c.scanEnd - c.scanStart) * scan;
  return [x, contourHeight(x, atoms, c)];
}

/** 틈 이름표에 띄울 선언값 — 지금 머문 단계의 틈. 내려가는 동안은 앞 값을 둔다. */
export function declaredGap(tl: TimelineFrame, c: ScanningTunnelingMicroscopeConstants): number {
  if (tl.at('step2') >= 1) return c.gapSet;
  if (tl.at('step1') >= 1) return c.gapMid;
  return c.gapFar;
}

/** 탐침 · 틈 표시의 불투명도 — 주기 이음매에서만 흐려진다. */
export function tipOpacity(tl: TimelineFrame): number {
  return tl.at('enter') * (1 - tl.at('fade'));
}

// ------------------------------------------------------------------------
// 전자 점
// ------------------------------------------------------------------------

/** (시드, 주기, 번호, 쓰임)에서 뽑는 0~1 결정적 난수. */
function hash01(seed: number, cycle: number, k: number, salt: number): number {
  let h = (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(cycle | 0, 0x85ebca6b)) >>> 0;
  h = (h ^ Math.imul(k | 0, 0xc2b2ae35) ^ Math.imul(salt | 0, 0x27d4eb2f)) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** 주기 안 누적 방출 수 표 — i 번째 칸이 시각 i × `EMIT_DT` 까지 태어난 점 수. */
function emissionTable(tl: TimelineFrame, c: ScanningTunnelingMicroscopeConstants): number[] {
  const n = Math.ceil(tl.period / EMIT_DT);
  const cum = [0];
  for (let i = 0; i < n; i++) {
    const gap = approachGapAt((i + 0.5) * EMIT_DT, tl, c);
    const rate = c.electronRate * Math.pow(10, -(gap - c.gapSet) / c.decadeGap);
    cum.push(cum[i]! + rate * EMIT_DT);
  }
  return cum;
}

function cumAt(cum: readonly number[], u: number): number {
  const f = Math.max(0, u) / EMIT_DT;
  const i = Math.min(cum.length - 2, Math.floor(f));
  const w = Math.min(1, f - i);
  return cum[i]! + (cum[i + 1]! - cum[i]!) * w;
}

/** 누적 수가 `n` 을 지나는 시각. */
function birthTime(cum: readonly number[], n: number): number {
  let lo = 0;
  let hi = cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid]! < n) lo = mid;
    else hi = mid;
  }
  const span = cum[hi]! - cum[lo]!;
  const w = span > 0 ? (n - cum[lo]!) / span : 0;
  return (lo + w) * EMIT_DT;
}

/**
 * 지금 틈을 건너는 중인 전자 점 자리. 탐침 끝 원자 겉면에서 나와, 몫에 비례해 뽑힌 표면 원자
 * 겉면으로 곧게 간다. `spread` 는 가운데가 부풀게 옆으로 비껴 가는 최대 폭(nm).
 */
export function electronPositions(
  tl: TimelineFrame,
  tip: Vec2,
  atoms: readonly Vec2[],
  c: ScanningTunnelingMicroscopeConstants,
  spread: number,
): Vec2[] {
  const cum = emissionTable(tl, c);
  const u = tl.u;
  const lo = cumAt(cum, u - c.crossTime);
  const hi = cumAt(cum, u);
  const shares = currentShares(tip, atoms, c);
  const total = shares.reduce((s, v) => s + v, 0);
  const out: Vec2[] = [];
  for (let k = Math.max(0, Math.floor(lo) - 1); k <= Math.ceil(hi); k++) {
    const nk = k + EMIT_SPREAD * hash01(c.seed, tl.cycle, k, 0);
    if (nk <= lo || nk > hi) continue;
    const f = clamp01((u - birthTime(cum, nk)) / c.crossTime);
    // 떨어질 원자 — 몫에 비례해 뽑는다.
    let pick = hash01(c.seed, tl.cycle, k, 1) * total;
    let target = 0;
    for (let i = 0; i < shares.length; i++) {
      pick -= shares[i]!;
      if (pick <= 0) {
        target = i;
        break;
      }
    }
    const atom = atoms[target]!;
    const dx = atom[0] - tip[0];
    const dy = atom[1] - tip[1];
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const sx = tip[0] + ux * c.tipRadius;
    const sy = tip[1] + uy * c.tipRadius;
    const r = atomRadiusAt(target, c);
    const ex = atom[0] - ux * r;
    const ey = atom[1] - uy * r;
    const side = (hash01(c.seed, tl.cycle, k, 2) - 0.5) * spread * Math.sin(Math.PI * f);
    out.push([sx + (ex - sx) * f - uy * side, sy + (ey - sy) * f + ux * side]);
  }
  return out;
}

/** 쌓는 상태가 없다(캡션 글자만) — 항등 step (S-sim). */
export function step(params: { state: ScanningTunnelingMicroscopeState }): ScanningTunnelingMicroscopeState {
  return params.state;
}
