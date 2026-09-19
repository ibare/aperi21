// ========================================================================
// cyclic-process — 순수 물리
// ========================================================================
// DOM · 캔버스 · 실시간을 모른다. 시간표도 모른다 — scene 이 네 다리의 진행도를 읽어
// 넘기면, 여기서 직사각형을 차례로 따라가 지나온 길 · 지금 상태 · 온도를 낸다.
// 모든 것이 (다리 진행도, 선언값)의 함수라 쌓는 것이 없다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import type { CyclicProcessState } from './state';

export interface CyclicProcessConstants {
  /** 팽창하는 쪽(A–B) 압력. */
  pHigh: number;
  /** 압축하는 쪽(C–D) 압력. */
  pLow: number;
  /** 작은 부피(A · D). */
  v1: number;
  /** 큰 부피(B · C). */
  v2: number;
}

export function readConstants(stage: StageDef): CyclicProcessConstants {
  const c = stage.constants ?? {};
  return {
    pHigh: c.pHigh ?? 3,
    pLow: c.pLow ?? 1,
    v1: c.v1 ?? 1,
    v2: c.v2 ?? 4,
  };
}

/** 네 다리의 진행도(0~1). 시간표의 같은 이름 단계에서 온다. */
export interface LegProgress {
  expand: number;
  cool: number;
  compress: number;
  heat: number;
}

/** 지나온 길과 지금 상태. 좌표는 (부피, 압력). */
export interface CycleNow {
  /** A 에서 지금 자리까지 꺾은선. */
  points: readonly (readonly [number, number])[];
  v: number;
  p: number;
  /** 팽창으로 칠해진 넓이의 오른쪽 끝(부피). */
  vFilled: number;
  /** 압축으로 빗금이 된 넓이의 왼쪽 끝(부피). 압축 전이면 v2. */
  vSwept: number;
}

/**
 * 직사각형을 시계 방향으로 따라간다 — A(v1, pHigh) → B(v2, pHigh) → C(v2, pLow) →
 * D(v1, pLow) → A. 앞 다리가 끝나지 않았으면 뒤 다리는 보지 않는다.
 */
export function walkCycle(leg: LegProgress, c: CyclicProcessConstants): CycleNow {
  const dv = c.v2 - c.v1;
  const dp = c.pHigh - c.pLow;
  let v = c.v1;
  let p = c.pHigh;
  const points: [number, number][] = [[v, p]];
  const steps: { progress: number; move: (k: number) => void }[] = [
    { progress: leg.expand, move: (k) => (v = c.v1 + dv * k) },
    { progress: leg.cool, move: (k) => (p = c.pHigh - dp * k) },
    { progress: leg.compress, move: (k) => (v = c.v2 - dv * k) },
    { progress: leg.heat, move: (k) => (p = c.pLow + dp * k) },
  ];
  for (const s of steps) {
    if (s.progress <= 0) break;
    s.move(s.progress);
    points.push([v, p]);
    if (s.progress < 1) break;
  }
  return {
    points,
    v,
    p,
    vFilled: c.v1 + dv * leg.expand,
    vSwept: c.v2 - dv * leg.compress,
  };
}

/**
 * 온도 — P·V 에 비례한다(이상 기체, 물질량 고정). 비례 상수는 온도계 눈금이 정하므로
 * 여기서는 곱만 낸다. 한 바퀴 돌면 (v1, pHigh) 로 돌아와 처음 값이 된다.
 */
export function temperatureOf(v: number, p: number): number {
  return p * v;
}

/** 순환 중 가장 높은 온도 — B(v2, pHigh). 온도계 눈금의 위 끝이 된다. */
export function maxTemperature(c: CyclicProcessConstants): number {
  return temperatureOf(c.v2, c.pHigh);
}

/** 쌓는 것이 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: CyclicProcessState }): CyclicProcessState {
  return params.state;
}
