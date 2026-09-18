// ========================================================================
// conservative-force — 순수 물리
// ========================================================================
// 중력은 크기 mg 로 늘 아래를 향한다. 그 힘이 한 일은 변위의 **세로 성분**만 센다:
//   W = mg · (y_A − y)
// 그래서 막대 높이를 W / mg 로 두면 막대는 곧 「출발점보다 얼마나 내려왔는가」 이고,
// 길의 가로 모양 · 길이는 막대에 들어갈 자리가 없다.
//
// 길은 두 반쪽 코사인으로 잇는다 — A 에서 도는 자리까지, 도는 자리에서 B 까지.
// 끝과 도는 자리에서 기울기가 0 이라 거기서는 막대가 멎는다(가로로 옮기면 일이 없다).
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { A_Y, B_X, B_Y, PATH_SAMPLES, PEAK_Y, TROUGH_Y, TURN_X } from './schema';
import type { ConservativeForceState } from './state';

export interface ConservativeForceConstants {
  aY: number;
  bX: number;
  bY: number;
  turnX: number;
  peakY: number;
  troughY: number;
}

export function readConstants(stage: StageDef): ConservativeForceConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    aY: c.aY ?? A_Y,
    bX: c.bX ?? B_X,
    bY: c.bY ?? B_Y,
    turnX: c.turnX ?? TURN_X,
    peakY: c.peakY ?? PEAK_Y,
    troughY: c.troughY ?? TROUGH_Y,
  };
}

/** 길 하나 — 도는 자리의 높이(`turnY`)만 다르다. 위 길은 꼭대기, 아래 길은 바닥. */
export interface PathShape {
  turnY: number;
}

/** 두 끝 사이를 반쪽 코사인으로 잇는 높이와 기울기. `s` 는 0~1. */
function halfCosine(s: number, y0: number, y1: number, width: number): { y: number; slope: number } {
  const k = (1 - Math.cos(Math.PI * s)) / 2;
  const dk = (Math.PI / 2) * Math.sin(Math.PI * s);
  return { y: y0 + (y1 - y0) * k, slope: ((y1 - y0) * dk) / width };
}

/** 길 위 가로 자리 `x`(0 ~ bX)의 높이와 기울기. */
export function pathAt(x: number, path: PathShape, c: ConservativeForceConstants): { y: number; slope: number } {
  if (x <= c.turnX) return halfCosine(x / c.turnX, c.aY, path.turnY, c.turnX);
  const w = c.bX - c.turnX;
  return halfCosine((x - c.turnX) / w, path.turnY, c.bY, w);
}

/** 길 전체를 점으로 표본한다. 곡선 어휘가 없어 폴리라인으로 긋는다 (G28). */
export function samplePath(path: PathShape, c: ConservativeForceConstants): Vec2[] {
  // 반쪽마다 따로 나눈다 — 도는 자리를 정확히 지나야 꼭대기 · 바닥이 납작해지지 않는다.
  const out: Vec2[] = [];
  for (let i = 0; i <= PATH_SAMPLES; i++) {
    const x = (c.turnX * i) / PATH_SAMPLES;
    out.push([x, pathAt(x, path, c).y]);
  }
  for (let i = 1; i <= PATH_SAMPLES; i++) {
    const x = c.turnX + ((c.bX - c.turnX) * i) / PATH_SAMPLES;
    out.push([x, pathAt(x, path, c).y]);
  }
  return out;
}

export interface BoxReading {
  /** 상자가 얹힌 길 위의 자리. */
  foot: Vec2;
  /** 그 자리의 길 기울기 각(라디안). 상자를 길에 맞춰 눕힌다. */
  angle: number;
  /** 지금까지 중력이 한 일 ÷ mg (m). 출발점보다 내려온 높이다. 음이면 올라와 있다. */
  workOverMg: number;
}

/**
 * 상자 하나를 읽는다. **단계 경계는 선언이 정한다** — 떠나는 동안은 `at('out')`,
 * 돌아오는 동안은 `at('back')` 이 가로 자리를 민다. 두 진행도를 더하므로 분기가 없다:
 * `out` 동안은 `back` 이 0 이고, `back` 동안은 `out` 이 1 이다.
 *
 * 두 상자는 같은 가로 자리에 있다 — 같은 순간 도는 자리에 닿으므로 「한쪽은 가장
 * 깎이고 한쪽은 가장 넘친 순간」 이 한 화면에 선다.
 */
export function readBox(tl: TimelineFrame, path: PathShape, c: ConservativeForceConstants): BoxReading {
  const x = c.turnX * tl.at('out') + (c.bX - c.turnX) * tl.at('back');
  const { y, slope } = pathAt(x, path, c);
  return { foot: [x, y], angle: Math.atan(slope), workOverMg: c.aY - y };
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 상자 · 막대를 지우고 다시 떠난다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ConservativeForceState }): ConservativeForceState {
  return params.state;
}
