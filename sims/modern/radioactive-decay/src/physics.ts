// ========================================================================
// radioactive-decay — 순수 물리
// ========================================================================
// 원자마다 지수 분포 수명을 미리 뽑고, 「시각 s 에 이 원자는 붕괴했는가」 를 수명과
// 견줘 판정한다. 확률 과정인데도 같은 시각은 언제나 같은 화면이다.
//
// 난수 순서는 원본과 같다 — 시드 난수(mulberry32)로 자리 흔들림 2 × 400 개를 먼저,
// 이어 순환마다 수명 400 개. 그래서 원본과 같은 원자가 같은 순간에 붕괴한다.
// ========================================================================

import { COLS, HALF, HOLD, N, SEED, SPAN } from './schema';
import type { RadioactiveDecayState } from './state';

/** 한 순환의 난수. */
export interface CycleDraw {
  cycle: number;
  /** 원자별 자리 흔들림(칸 단위) — [x0, y0, x1, y1, …]. 순환이 바뀌어도 같다. */
  jitter: readonly number[];
  /** 원자별 수명(초, 순환 시작부터). */
  life: readonly number[];
  /** 수명 오름차순. N(t) 를 이분 탐색으로 뽑는다. */
  sorted: readonly number[];
}

/** 원본 조각 도구의 시드 난수(mulberry32). 상태를 닫아 둔 생성기를 돌려준다. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 순환 `cycle` 의 난수를 뽑는다. 순수 함수 — 시드와 순환 번호만으로 정해진다. */
export function drawCycle(seed: number, cycle: number): CycleDraw {
  const rand = mulberry32(seed);
  const jitter: number[] = [];
  for (let i = 0; i < N * 2; i++) jitter.push((rand() - 0.5) * 0.3);
  // 앞선 순환이 쓴 수명만큼 건너뛴다.
  for (let i = 0; i < cycle * N; i++) rand();
  const life: number[] = [];
  for (let i = 0; i < N; i++) {
    const u = 1 - rand();
    // 수명은 지수 분포 — 원자는 나이를 기억하지 않는다.
    life.push((-HALF / Math.LN2) * Math.log(u));
  }
  const sorted = [...life].sort((a, b) => a - b);
  return { cycle, jitter, life, sorted };
}

/** 한 순환의 길이(초). 시간표 단계 합과 같다. */
export const CYCLE = SPAN * HALF + HOLD;

/** 수명이 `s` 보다 긴 원자의 수 = 순환 시작 뒤 `s` 초에 남은 원자 수. */
export function survivorsAt(sorted: readonly number[], s: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (sorted[m]! <= s) lo = m + 1;
    else hi = m;
  }
  return N - lo;
}

/** 원자 `i` 의 격자 자리(칸 단위, 열 · 행 — 행은 아래로). */
export function atomCell(draw: CycleDraw, i: number): [number, number] {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  return [c + 0.5 + draw.jitter[2 * i]!, r + 0.5 + draw.jitter[2 * i + 1]!];
}

/** 순환 안 시각 `u` 에서 붕괴 판정에 쓰는 시각 — 멈춤 구간에는 다섯 반감기 끝에 멈춘다. */
export function effective(u: number): number {
  return Math.min(u, SPAN * HALF);
}

/** 지금 진행 중인(또는 마지막) 반감기 번호 1~SPAN. */
export function intervalAt(u: number): number {
  return Math.min(SPAN, Math.floor(effective(u) / HALF) + 1);
}

/** 캡션 값 — 화면에 그려진 수를 그대로 쓴다. */
export function captionOf(draw: CycleDraw, t: number): RadioactiveDecayState['caption'] {
  const u = t - Math.floor(t / CYCLE) * CYCLE;
  const n = intervalAt(u);
  const counts: number[] = [];
  for (let k = 0; k <= SPAN; k++) counts.push(survivorsAt(draw.sorted, k * HALF));
  return {
    n: String(n),
    start: String(survivorsAt(draw.sorted, (n - 1) * HALF)),
    now: String(survivorsAt(draw.sorted, effective(u))),
    counts: counts.join(' → '),
  };
}

/** 시계를 밀고, 순환이 바뀌면 새 수명을 뽑는다. */
export function step(params: { state: RadioactiveDecayState; dt: number }): RadioactiveDecayState {
  const t = params.state.t + params.dt;
  const cycle = Math.floor(t / CYCLE);
  const draw = cycle === params.state.draw.cycle ? params.state.draw : drawCycle(SEED, cycle);
  return { t, draw, caption: captionOf(draw, t) };
}
