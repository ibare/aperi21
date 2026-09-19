// ========================================================================
// first-law-of-thermodynamics — 순수 물리
// ========================================================================
// DOM · 캔버스 · 실시간을 모른다. 모든 것이 (주기 안 시각, 선언값)의 함수라 쌓는 것이 없다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import type { FirstLawOfThermodynamicsState } from './state';

export interface FirstLawConstants {
  /** 넣은 열(J). */
  q: number;
  /** 몰수. */
  n: number;
  /** 처음 온도(K). */
  t0: number;
  /** 자유 피스톤(등압)의 온도 상승(K). */
  dTFree: number;
  /** 고정 피스톤(등적)의 온도 상승(K). */
  dTLocked: number;
  /** 열 알갱이 수 — 시간표의 알갱이 단계 수와 같다. */
  grains: number;
  /** 자유 피스톤에서 기체에 남는 알갱이 수. */
  uPart: number;
  /** 자유 피스톤에서 피스톤을 미는 알갱이 수. */
  wPart: number;
  /** 분자 수. */
  molecules: number;
  /** 분자 자리의 시드. */
  seed: number;
  /** 처음 온도에서 분자가 한 초에 가는 거리(상자 폭 = 1). */
  molSpeed: number;
}

export function readConstants(stage: StageDef): FirstLawConstants {
  const c = stage.constants ?? {};
  return {
    q: c.q ?? 750,
    n: c.n ?? 0.4,
    t0: c.t0 ?? 300,
    dTFree: c.dTFree ?? 90,
    dTLocked: c.dTLocked ?? 150,
    grains: c.grains ?? 5,
    uPart: c.uPart ?? 3,
    wPart: c.wPart ?? 2,
    molecules: c.molecules ?? 22,
    seed: c.seed ?? 11,
    molSpeed: c.molSpeed ?? 0.55,
  };
}

/**
 * 자유 피스톤에서 i 번째 알갱이(0 부터)가 피스톤으로 가는가.
 * 몫의 비를 앞에서부터 고르게 나눠, 몇 개를 보냈든 두 더미가 비에 가장 가깝게 한다 — 3 : 2 면 U U W U W.
 */
export function goesToWork(i: number, c: FirstLawConstants): boolean {
  const total = c.uPart + c.wPart;
  if (total <= 0) return false;
  return Math.floor(((i + 1) * c.wPart) / total) > Math.floor((i * c.wPart) / total);
}

/** 온도가 한 구간에서 직선으로 바뀐다 — 주기 안 시각 [from, to] 동안 tFrom → tTo. */
export interface TempSegment {
  from: number;
  to: number;
  tFrom: number;
  tTo: number;
}

/**
 * 분자가 지금까지 간 거리(상자 폭 = 1). 속력은 √(T/t0) 에 비례하고, 온도가 구간마다 직선이라
 * ∫√(a + b·x) dx 를 닫힌 식으로 더한다 — 같은 시각은 언제나 같은 거리다.
 */
export function travelled(u: number, segments: readonly TempSegment[], c: FirstLawConstants): number {
  let s = 0;
  for (const g of segments) {
    if (u <= g.from) break;
    const end = Math.min(u, g.to);
    const len = end - g.from;
    if (len <= 0) continue;
    const a = g.tFrom / c.t0;
    const slope = (g.tTo - g.tFrom) / c.t0 / (g.to - g.from);
    if (Math.abs(slope) < 1e-9) {
      s += Math.sqrt(a) * len;
    } else {
      const b = a + slope * len;
      s += ((2 / (3 * slope)) * (Math.pow(b, 1.5) - Math.pow(a, 1.5)));
    }
  }
  return s * c.molSpeed;
}

/** 시드 결정적 난수 (mulberry32). `Math.random` 을 쓰지 않는다 — 같은 시각은 같은 화면. */
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

/** 분자 하나의 처음 자리(0~1)와 방향(단위 벡터). */
export interface Molecule {
  x0: number;
  y0: number;
  dx: number;
  dy: number;
}

export function molecules(c: FirstLawConstants): Molecule[] {
  const r = rng(c.seed);
  const out: Molecule[] = [];
  for (let j = 0; j < c.molecules; j++) {
    const ang = r() * Math.PI * 2;
    out.push({ x0: r(), y0: r(), dx: Math.cos(ang), dy: Math.sin(ang) });
  }
  return out;
}

/** 벽에서 튀는 움직임 — 0~1 사이를 오가는 삼각파. 자리와 지금 방향 부호를 돌려준다. */
export function bounce(x: number): [number, number] {
  const m = ((x % 2) + 2) % 2;
  return m <= 1 ? [m, 1] : [2 - m, -1];
}

/** 캡션 `vars` 가 가리킬 선언값의 글자. 계산해 줄이지 않는다. */
export function deriveTexts(c: FirstLawConstants): FirstLawOfThermodynamicsState {
  return {
    t0Text: String(c.t0),
    grainsText: String(c.grains),
    uText: String(c.uPart),
    wText: String(c.wPart),
    dTFreeText: String(c.dTFree),
    dTLockedText: String(c.dTLocked),
  };
}

/** 쌓는 것이 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: FirstLawOfThermodynamicsState }): FirstLawOfThermodynamicsState {
  return params.state;
}
