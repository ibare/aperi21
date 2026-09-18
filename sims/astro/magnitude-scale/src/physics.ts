// ========================================================================
// magnitude-scale — 순수 계산
// ========================================================================
// 등급 → 밝기(빛의 양), 1등성을 6등성 몫으로 나누는 시차 출발. DOM · 캔버스 · 테마를 모른다.
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { FACTOR, FACTOR_STEPS, FIRST_MAGNITUDE, STEP_RATIO } from './schema';
import type { MagnitudeScaleState } from './state';

export interface MagnitudeScaleConstants {
  /** 한 등급의 밝기 비 — 화면 표기용 선언값. */
  stepRatio: number;
  /** 등급 차 `factorSteps` 에 해당하는 밝기 비. */
  factor: number;
  /** `factor` 에 해당하는 등급 차. 사다리의 칸 수이기도 하다. */
  factorSteps: number;
  /** 사다리 맨 앞 별의 등급. */
  firstMagnitude: number;
}

export function readConstants(stage: StageDef): MagnitudeScaleConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    stepRatio: c.stepRatio ?? STEP_RATIO,
    factor: c.factor ?? FACTOR,
    factorSteps: c.factorSteps ?? FACTOR_STEPS,
    firstMagnitude: c.firstMagnitude ?? FIRST_MAGNITUDE,
  };
}

/**
 * 사다리 맨 앞 별보다 `dm` 등급 어두운 별의 밝기(맨 앞 = 1, 선형광).
 *
 * 등급 눈금의 정의 그대로 `factor^(−dm / factorSteps)` 다. 표기용 `stepRatio` 를 거듭제곱하지
 * 않는다 — 2.512⁵ 은 100.02 라 "다섯 칸이면 정확히 100" 이 어긋난다.
 */
export function brightness(dm: number, c: MagnitudeScaleConstants): number {
  return Math.pow(c.factor, -dm / c.factorSteps);
}

/**
 * 강조 고리가 선 사다리 자리(0 = 맨 앞 별, `factorSteps` = 맨 끝 별). 단계 id 로 가르지 않고
 * 칸마다의 진행도를 더한다 — 지난 칸은 1, 다가올 칸은 0 이라 분기가 없다.
 */
export function ladderPosition(tl: TimelineFrame, c: MagnitudeScaleConstants): number {
  let s = 0;
  for (let k = 1; k <= c.factorSteps; k++) s += tl.at(`step-${k}`);
  return s;
}

/** 사다리 칸 k(1부터)의 비 이름표가 켜진 정도. */
export function stepShown(tl: TimelineFrame, k: number): number {
  return tl.at(`step-${k}`);
}

// ------------------------------------------------------------------------
// 나눔 — 1등성 하나를 6등성 몫 `factor` 개로
// ------------------------------------------------------------------------

/** 떼어 내기 단계에서 출발 시각이 퍼지는 몫. 나머지가 한 몫이 격자까지 가는 시간이다. */
const SPLIT_SPREAD = 0.72;
/** 모으기 단계에서 돌아오기 시작하는 시각이 퍼지는 몫. */
const GATHER_SPREAD = 0.45;

export interface ShareDot {
  /** 격자에서의 자리(나눔 판 가운데 기준 월드 오프셋). */
  readonly home: readonly [number, number];
  /** 0 = 별 안(떠나지 않았거나 돌아왔다), 1 = 격자 자리. */
  readonly out: number;
}

/**
 * 격자 칸 `n` 개의 자리 — 가운데에서 가까운 순서. 가까운 칸이 먼저 떠나 별 둘레부터 채워진다.
 * `cols` 는 `n` 이 들어가는 가장 작은 정사각 격자의 한 변이다.
 */
export function shareHomes(n: number, pitch: number): [number, number][] {
  const cols = Math.ceil(Math.sqrt(n));
  const half = (cols - 1) / 2;
  const cells: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    cells.push([(col - half) * pitch, (half - row) * pitch]);
  }
  // 거리가 같은 칸끼리는 각도로 — 정렬이 결정적이라 같은 시각은 같은 화면이다.
  return cells.sort((a, b) => {
    const da = Math.hypot(a[0], a[1]);
    const db = Math.hypot(b[0], b[1]);
    if (Math.abs(da - db) > 1e-9) return da - db;
    return Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]);
  });
}

/**
 * 몫마다 지금 얼마나 나가 있는지. 떼어 내기 단계 안에서 k 번째 몫이 k/n 쯤에 떠나고,
 * 모으기 단계에서는 바깥 것부터 돌아온다. 단계의 시작 · 길이는 시간표 선언에서 읽는다.
 */
export function shareDots(tl: TimelineFrame, homes: readonly (readonly [number, number])[]): ShareDot[] {
  const n = homes.length;
  const s0 = tl.start('split');
  const sd = tl.duration('split');
  const g0 = tl.start('gather');
  const gd = tl.duration('gather');
  const travel = sd * (1 - SPLIT_SPREAD);
  const back = gd * (1 - GATHER_SPREAD);
  return homes.map((home, k) => {
    const leave = s0 + (k / n) * sd * SPLIT_SPREAD;
    const ret = g0 + ((n - 1 - k) / n) * gd * GATHER_SPREAD;
    const go = tl.span(leave, leave + travel, 'smooth');
    const come = tl.span(ret, ret + back, 'smooth');
    return { home, out: go * (1 - come) };
  });
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: MagnitudeScaleState }): MagnitudeScaleState {
  return params.state;
}
