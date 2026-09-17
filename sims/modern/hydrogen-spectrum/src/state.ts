// ========================================================================
// hydrogen-spectrum — 상태
// ========================================================================
// 사건(들뜸 · 낙하 · 광자 도착)이 난수로 이어지고 띠에 빛이 쌓이므로 상태를 누적한다.
// 좌표는 모두 원본 캔버스 픽셀(y 아래로)이다 — 월드로 뒤집는 것은 scene 의 일.
// ========================================================================

import { ELECTRON_COUNT, LADDER, SEED, STRIP_W, TIMING } from './schema';
import { nextRandom } from './physics';

export type ElectronPhase = 'rest' | 'rise' | 'hold' | 'fall';

/** 서로 다른 수소 원자 여섯 개의 전자 — 한 준위도에 겹쳐 그린다. */
export interface Electron {
  x: number;
  n: number;
  from: number;
  to: number;
  phase: ElectronPhase;
  timer: number;
  dur: number;
}

/** 날아가는 광자 — 2차 베지에(적외선만 실제로 휜다). `s` 는 진행률 0~1, `l` 은 파장(nm). */
export interface Photon {
  x0: number;
  y0: number;
  cx: number;
  cy: number;
  x1: number;
  y1: number;
  l: number;
  s: number;
  dur: number;
}

/** 세로 자국 — 들뜸(점선) · 낙차(굵은 선). */
export interface Mark {
  x: number;
  y0: number;
  y1: number;
  age: number;
}

/** 낙차 자국 — 그 낙차가 낸 광자의 파장 `l`(nm)을 들고 있어 같은 색으로 칠한다. */
export interface Drop extends Mark {
  l: number;
}

/** 띠에 닿은 순간의 섬광 — 닿은 광자의 파장 `l`(nm). */
export interface Flash {
  x: number;
  y: number;
  l: number;
  age: number;
}

/**
 * - `bins` — 띠의 픽셀 열마다 쌓인 빛의 양.
 * - `rng` — mulberry32 내부 상태. 원본 하네스와 같은 난수열을 같은 순서로 뽑는다.
 * - `acc` — 고정 걸음(1/60 초)을 맞추는 누적기. 실시간 dt 는 가변이다 (장부 G39).
 */
export interface HydrogenSpectrumState {
  electrons: readonly Electron[];
  photons: readonly Photon[];
  drops: readonly Drop[];
  rises: readonly Mark[];
  flashes: readonly Flash[];
  bins: readonly number[];
  rng: number;
  acc: number;
}

export function initialState(): HydrogenSpectrumState {
  let rng = SEED >>> 0;
  const electrons: Electron[] = [];
  for (let i = 0; i < ELECTRON_COUNT; i++) {
    const [r, next] = nextRandom(rng);
    rng = next;
    electrons.push({
      x: 84 + i * ((LADDER.x1 - 40 - 84) / (ELECTRON_COUNT - 1)),
      n: 1,
      from: 1,
      to: 1,
      phase: 'rest',
      timer: TIMING.firstRestMin + r * TIMING.firstRestSpan,
      dur: 0,
    });
  }
  return {
    electrons,
    photons: [],
    drops: [],
    rises: [],
    flashes: [],
    bins: new Array<number>(STRIP_W).fill(0),
    rng,
    acc: 0,
  };
}
