// ========================================================================
// electric-current — 순수 물리
// ========================================================================
// 한 도선 위 전자 알갱이는 간격 d 로 줄지어 속력 v 로 왼쪽으로 간다. 단면 하나를
// 지나는 알갱이는 d/v 초마다 하나이므로, 문이 T 초 열려 있으면 v·T/d 개를 센다.
// 빨라져도(v) 촘촘해져도(1/d) 같은 시간에 센 수가 그만큼 는다.
//
// 모든 것이 주기 안 시각 u 의 함수다. 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { DENSE_DIVISOR, FAST_MULTIPLE, GATE_X, SPACING, SPEED } from './schema';
import type { ElectricCurrentState } from './state';

export interface ElectricCurrentConstants {
  /** 기준 도선의 속력(월드/초) · 간격(월드). */
  speed: number;
  spacing: number;
  /** 가운데 도선의 속력 배수 · 아래 도선의 간격 나눗수 (선언값). */
  fastMultiple: number;
  denseDivisor: number;
  /** 가운데 도선의 속력 = speed × fastMultiple. 간격은 기준과 같다. */
  fastSpeed: number;
  /** 아래 도선의 간격 = spacing ÷ denseDivisor. 속력은 기준과 같다. */
  denseSpacing: number;
}

export function readConstants(stage: StageDef): ElectricCurrentConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const speed = c.speed ?? SPEED;
  const spacing = c.spacing ?? SPACING;
  const fastMultiple = c.fastMultiple ?? FAST_MULTIPLE;
  const denseDivisor = c.denseDivisor ?? DENSE_DIVISOR;
  return {
    speed,
    spacing,
    fastMultiple,
    denseDivisor,
    fastSpeed: speed * fastMultiple,
    denseSpacing: spacing / denseDivisor,
  };
}

/** 문이 열린 창 — 주기 안 시각. `count` 단계가 시작할 때 열리고 끝날 때 닫힌다 (시간표 선언). */
export interface GateWindow {
  open: number;
  close: number;
}

export function readGate(tl: TimelineFrame): GateWindow {
  return { open: tl.start('count'), close: tl.end('count') };
}

/** 문이 지금 열려 있는가. */
export function gateIsOpen(tl: TimelineFrame, gate: GateWindow): boolean {
  return tl.u >= gate.open && tl.u < gate.close;
}

/** 세는 시간 중 지난 몫 0~1 — 시간 막대가 차오르는 정도. */
export function gateProgress(tl: TimelineFrame, gate: GateWindow): number {
  const span = gate.close - gate.open;
  if (span <= 0) return 0;
  return Math.min(1, Math.max(0, (tl.u - gate.open) / span));
}

/** 알갱이 하나 — 월드 x 와, 이번 주기에 문을 지나며 세어졌는지. */
export interface Carrier {
  x: number;
  counted: boolean;
}

export interface LaneReading {
  carriers: Carrier[];
  /** 지금까지 센 수. 문이 닫힌 뒤에는 이번 주기의 몫 전부다. */
  count: number;
}

/**
 * 도선 한 줄을 읽는다.
 *
 * 알갱이 k 의 자리는 `GATE_X − v·(u − tFirst) + k·d` 이고, 알갱이 k 는 `tFirst + k·d/v`
 * 에 문을 지난다. **첫 통과를 문이 열린 뒤 반 간격(d/2v)에 둔다** — 통과 시각이 창의
 * 경계와 겹치지 않아, 창 안에 드는 알갱이가 매 주기 정확히 `v·T/d` 개(정수일 때)다.
 * 경계에 걸린 알갱이를 셀지 말지가 부동소수로 갈리면 4 가 3 이 되는 주기가 생긴다.
 *
 * 센 수는 알갱이 번호에서 곧바로 나온다 — 창 안에서 문을 지난 번호 0 ~ n−1 이 세어진
 * 알갱이다. 그래서 문 옆 네모의 수와 강조된 알갱이의 수가 어긋날 수 없다.
 */
export function readLane(
  tl: TimelineFrame,
  gate: GateWindow,
  speed: number,
  spacing: number,
  wireLeft: number,
  wireRight: number,
): LaneReading {
  const interval = spacing / speed;
  const tFirst = gate.open + interval / 2;
  // 창 안에서 문을 지날 알갱이 수. 통과 시각이 창 경계와 반 간격 떨어져 있어 반올림이 정확하다.
  const total = Math.max(0, Math.floor((gate.close - gate.open) / interval + 0.5));
  // 지금까지 지난 수 — 번호 0 부터 (u − tFirst)/간격 까지.
  const passed = Math.floor((Math.min(tl.u, gate.close) - tFirst) / interval) + 1;
  const count = Math.min(total, Math.max(0, passed));

  // 도선 위에 보이는 번호 범위. x_k = GATE_X − v(u − tFirst) + k·d.
  const shift = GATE_X - speed * (tl.u - tFirst);
  const kMin = Math.ceil((wireLeft - shift) / spacing);
  const kMax = Math.floor((wireRight - shift) / spacing);
  const carriers: Carrier[] = [];
  for (let k = kMin; k <= kMax; k++) {
    carriers.push({ x: shift + k * spacing, counted: k >= 0 && k < count });
  }
  return { carriers, count };
}

/** 이번 주기에서 세어 쌓인 것이 흐려진 정도 0~1. 마지막 단계에서 지우고 다시 센다. */
export function tallyOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ElectricCurrentState }): ElectricCurrentState {
  return params.state;
}
