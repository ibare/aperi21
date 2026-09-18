// ========================================================================
// stellar-spectral-class — 순수 계산
// ========================================================================
// 지금 온도 · 그 온도에서 선 무리마다의 짙기 · 흡수선이 새겨진 스펙트럼(파장별 투과 세기).
// DOM · 캔버스 · 테마 색을 모른다. 파장 → 색은 scene 이 `@aperi21/plugin-optics` 에 맡긴다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ABSORPTION_LINES,
  CLASS_IDS,
  CLASS_TEMPERATURE,
  LINE_GROUPS,
  LINE_PROFILE,
  LINE_STRENGTH,
  METAL_FOREST,
  MOLECULAR_BANDS,
  classTemperatureKey,
  strengthKey,
  type AbsorptionLine,
  type LineGroup,
  type SpectralClass,
} from './schema';
import type { StellarSpectralClassState } from './state';

export interface StellarSpectralClassConstants {
  /** 분광형마다 대표 표면 온도(K). */
  classT: Record<SpectralClass, number>;
  /** 선 무리마다 · 분광형마다 짙기(0~1). */
  strength: Record<LineGroup, Record<SpectralClass, number>>;
  /** 짙기가 0 일 때의 선 반폭 비율 — 짙어질수록 선이 넓어진다(A형의 넓은 발머선). */
  lineWidthFloor: number;
  /** 분자 띠 머리의 짧은 파장 쪽 가장자리 폭(nm). */
  bandEdgeNm: number;
}

export function readConstants(stage: StageDef): StellarSpectralClassConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const classT = {} as Record<SpectralClass, number>;
  for (const k of CLASS_IDS) classT[k] = c[classTemperatureKey(k)] ?? CLASS_TEMPERATURE[k];
  const strength = {} as Record<LineGroup, Record<SpectralClass, number>>;
  for (const g of LINE_GROUPS) {
    const row = {} as Record<SpectralClass, number>;
    for (const k of CLASS_IDS) row[k] = c[strengthKey(g, k)] ?? LINE_STRENGTH[g][k];
    strength[g] = row;
  }
  return {
    classT,
    strength,
    lineWidthFloor: c.lineWidthFloor ?? LINE_PROFILE.widthFloor,
    bandEdgeNm: c.bandEdgeNm ?? LINE_PROFILE.bandEdgeNm,
  };
}

// ------------------------------------------------------------------------
// 시간
// ------------------------------------------------------------------------

/**
 * 지금 표면 온도(K). **단계 경계는 선언이 정한다** — 단계 id 로 가르지 않고 식는 단계 ·
 * 돌아오는 단계의 진행도(`at`)를 로그 온도에 쌓는다. 머무는 단계에서는 앞 단계 `at` 이 1,
 * 뒤 단계 `at` 이 0 이라 분기가 없다. 저작자가 단계 길이를 바꿔도 따라간다.
 */
export function temperatureAt(tl: TimelineFrame, c: StellarSpectralClassConstants): number {
  const lO = Math.log(c.classT.O);
  const lA = Math.log(c.classT.A);
  const lG = Math.log(c.classT.G);
  const lM = Math.log(c.classT.M);
  const l =
    lO + (lA - lO) * tl.at('toA') + (lG - lA) * tl.at('toG') + (lM - lG) * tl.at('toM') - (lM - lO) * tl.at('back');
  return Math.exp(l);
}

/**
 * 머무는 단계라면 그 분광형, 식거나 데워지는 중이면 null. 화면의 온도 글자는 선언값만 쓴다 —
 * 도중의 값을 반올림해 띄우지 않는다 (S-piece 유효숫자).
 */
export function heldClass(tl: TimelineFrame): SpectralClass | null {
  const held: Record<string, SpectralClass> = { o: 'O', a: 'A', g: 'G', m: 'M' };
  return held[tl.phase] ?? null;
}

/** 지금 온도에 가장 가까운 분광형(로그 온도 거리). */
export function nearestClass(T: number, c: StellarSpectralClassConstants): SpectralClass {
  let best: SpectralClass = 'O';
  let bestD = Infinity;
  for (const k of CLASS_IDS) {
    const d = Math.abs(Math.log(T) - Math.log(c.classT[k]));
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  }
  return best;
}

// ------------------------------------------------------------------------
// 선 세기
// ------------------------------------------------------------------------

/**
 * 온도 T 에서 선 무리의 짙기(0~1). 분광형 온도 사이를 로그 온도로 이어 부드럽게(코사인) 보간한다 —
 * 표의 값이 분광형 자리에서 그대로 나온다. 표 밖 온도는 끝 값.
 */
export function groupStrength(group: LineGroup, T: number, c: StellarSpectralClassConstants): number {
  const row = c.strength[group];
  const lt = Math.log(T);
  // CLASS_IDS 는 뜨거운 쪽부터 — 로그 온도가 줄어드는 순서다.
  const first = CLASS_IDS[0]!;
  const last = CLASS_IDS[CLASS_IDS.length - 1]!;
  if (lt >= Math.log(c.classT[first])) return row[first];
  if (lt <= Math.log(c.classT[last])) return row[last];
  for (let i = 0; i < CLASS_IDS.length - 1; i++) {
    const a = CLASS_IDS[i]!;
    const b = CLASS_IDS[i + 1]!;
    const la = Math.log(c.classT[a]);
    const lb = Math.log(c.classT[b]);
    if (lt <= la && lt >= lb) {
      const u = (la - lt) / (la - lb);
      const s = (1 - Math.cos(Math.PI * u)) / 2;
      return row[a] + (row[b] - row[a]) * s;
    }
  }
  return row[last];
}

// ------------------------------------------------------------------------
// 흡수선 스펙트럼
// ------------------------------------------------------------------------

/** 시드를 받는 결정적 난수(mulberry32). 같은 시드는 언제나 같은 수열이다. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 이름 없는 약한 금속 선들 — 선언된 시드로 한 번 만든다(모듈 상태가 아니라 결정적 상수). */
export function metalForest(): readonly AbsorptionLine[] {
  const f = METAL_FOREST;
  const rnd = mulberry32(f.seed);
  return Array.from({ length: f.count }, () => ({
    nm: f.minNm + (f.maxNm - f.minNm) * rnd(),
    group: 'metals' as const,
    depth: f.depth[0] + (f.depth[1] - f.depth[0]) * rnd(),
    width: f.width[0] + (f.width[1] - f.width[0]) * rnd(),
  }));
}
const FOREST = metalForest();

/** 선 모양(로렌츠)을 자르는 거리 — 반폭의 배수. 이보다 먼 꼬리는 계산하지 않는다(계산 절약, 모양이 아니다). */
const PROFILE_CUTOFF = 10;

/**
 * 파장마다의 투과 세기(0~1) — 1 이면 연속 스펙트럼 그대로, 0 이면 완전히 흡수. 선마다 로렌츠 모양의
 * 흡수를 곱한다. 무리의 짙기 s 가 깊이(× s)와 폭(× (바닥 + (1 − 바닥) s))을 함께 키운다.
 */
export function transmission(
  nms: readonly number[],
  T: number,
  c: StellarSpectralClassConstants,
): number[] {
  const s: Record<LineGroup, number> = {} as Record<LineGroup, number>;
  for (const g of LINE_GROUPS) s[g] = groupStrength(g, T, c);
  const out = nms.map(() => 1);

  const addLine = (line: AbsorptionLine): void => {
    const k = s[line.group];
    if (k <= 0) return;
    const d = line.depth * k;
    const w = line.width * (c.lineWidthFloor + (1 - c.lineWidthFloor) * k);
    for (let i = 0; i < nms.length; i++) {
      const x = (nms[i]! - line.nm) / w;
      if (Math.abs(x) > PROFILE_CUTOFF) continue;
      out[i]! *= 1 - d / (1 + x * x);
    }
  };
  for (const line of ABSORPTION_LINES) addLine(line);
  for (const line of FOREST) addLine(line);

  const km = s.molecules;
  if (km > 0) {
    for (const band of MOLECULAR_BANDS) {
      const d = band.depth * km;
      for (let i = 0; i < nms.length; i++) {
        const dx = nms[i]! - band.head;
        // 머리에서 갑자기 어두워지고(짧은 파장 쪽 가장자리) 긴 파장 쪽으로 서서히 밝아진다.
        const a = dx < 0 ? Math.exp(dx / c.bandEdgeNm) : Math.exp(-dx / band.length);
        if (a < 1e-3) continue;
        out[i]! *= 1 - d * a;
      }
    }
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: StellarSpectralClassState }): StellarSpectralClassState {
  return params.state;
}
