// ========================================================================
// earth-revolution-constellations — 순수 물리 · 배치 계산
// ========================================================================
// 별자리는 무한히 멀다 — 그래서 별자리의 방향은 태양에서 보나 지구에서 보나 같은 황경이다.
// 고리 위 자리(각)가 곧 그 별자리의 방향이다.
//
// 태양에서 본 지구의 황경이 θ 이면, 지구에서 본 태양은 θ + 180° 쪽에 있다. 한밤의 관측자는
// 태양 반대쪽, 곧 θ 쪽을 본다 — 지구에서 궤도 바깥으로 곧게 뻗은 방향이다. 별자리가 태양에서
// 얼마나 떨어졌는지(각)가 그 별자리가 밤 하늘에 뜨는지를 정한다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  GLARE_DEG,
  NIGHT_SIDE_DEG,
  SPRING_START_DEG,
  STARS_PER_CONSTELLATION,
  STAR_SPREAD_DEG,
  WINDOW_HALF_DEG,
  ZODIAC,
} from './schema';
import type { EarthRevolutionConstellationsState } from './state';

export interface EarthRevolutionConstellationsConstants {
  springStartDeg: number;
  glareDeg: number;
  nightSideDeg: number;
  windowHalfDeg: number;
}

export function readConstants(stage: StageDef): EarthRevolutionConstellationsConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    springStartDeg: c.springStartDeg ?? SPRING_START_DEG,
    glareDeg: c.glareDeg ?? GLARE_DEG,
    nightSideDeg: c.nightSideDeg ?? NIGHT_SIDE_DEG,
    windowHalfDeg: c.windowHalfDeg ?? WINDOW_HALF_DEG,
  };
}

/** 한 해를 가른 계절 단계 id — 봄 → 여름 → 가을 → 겨울. */
export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type Season = (typeof SEASONS)[number];

/**
 * 이번 해에서 돈 몫 0~1. 봄의 첫날이 0, 다음 봄의 첫날이 1.
 * 계절마다 4 분의 1 바퀴다. 계절 길이는 시간표 선언이 정한다.
 */
export function yearFraction(tl: TimelineFrame): number {
  let sum = 0;
  for (const id of SEASONS) sum += tl.at(id);
  return sum / SEASONS.length;
}

/** 태양에서 본 지구의 황경(도). */
export function earthLongitude(f: number, c: EarthRevolutionConstellationsConstants): number {
  return c.springStartDeg + 360 * f;
}

/** 각(도)을 (−180, 180] 로 감는다. */
export function wrapDeg(a: number): number {
  const w = ((((a + 180) % 360) + 360) % 360) - 180;
  return w === -180 ? 180 : w;
}

export const DEG = Math.PI / 180;

/**
 * 별자리가 밤 하늘에 드러나는 정도 0~1. 태양에서 `glareDeg` 안쪽이면 0(낮 하늘에만 떠 햇빛에 묻힘),
 * `nightSideDeg` 넘게 떨어지면 1(밤 동안 온전히 뜸), 그 사이는 고르게 잇는다(초저녁 · 새벽에만 잠깐).
 */
export function nightVisibility(
  lon: number,
  earthLon: number,
  c: EarthRevolutionConstellationsConstants,
): number {
  const fromSun = Math.abs(wrapDeg(lon - (earthLon + 180)));
  if (fromSun <= c.glareDeg) return 0;
  if (fromSun >= c.nightSideDeg) return 1;
  return (fromSun - c.glareDeg) / (c.nightSideDeg - c.glareDeg);
}

/** 한밤 정남에 가장 가까운 별자리의 번호 — 지구의 황경과 가운데 자리가 가장 가까운 것. */
export function midnightIndex(earthLon: number): number {
  let best = 0;
  let bestD = Infinity;
  ZODIAC.forEach((z, i) => {
    const d = Math.abs(wrapDeg(z.lon - earthLon));
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

/**
 * 한밤 정남에서 본 별자리의 가로 어긋남(도). 남쪽을 보면 동쪽이 왼쪽이고, 황경은 동쪽으로 는다 —
 * 그래서 +는 동쪽(왼쪽)이다. 지구가 공전해 황경이 늘면 별자리가 서쪽(오른쪽)으로 흐른다.
 */
export function offsetFromMidnight(lon: number, earthLon: number): number {
  return wrapDeg(lon - earthLon);
}

/** 시드를 받는 결정적 난수 (mulberry32). `Math.random` 을 쓰지 않는다 — 같은 시드는 같은 별. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** 흩뿌린 별 하나 — 별자리 가운데에서의 황경 어긋남(도) · 세로 자리(−1~1) · 밝기(0~1). */
export interface ScatterStar {
  readonly dLon: number;
  readonly v: number;
  readonly bright: number;
}

/** 별자리마다 흩뿌린 별. 시드가 같으면 언제나 같다. */
export function scatterStars(seed: number): ScatterStar[][] {
  const rnd = mulberry32(seed);
  return ZODIAC.map(() => {
    const out: ScatterStar[] = [];
    for (let k = 0; k < STARS_PER_CONSTELLATION; k++) {
      out.push({ dLon: (rnd() * 2 - 1) * STAR_SPREAD_DEG, v: rnd() * 2 - 1, bright: rnd() });
    }
    return out;
  });
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: EarthRevolutionConstellationsState }): EarthRevolutionConstellationsState {
  return params.state;
}
