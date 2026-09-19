// ========================================================================
// wheatstone-bridge — 순수 물리
// ========================================================================
// 전지(P 가 +, Q 가 −)에 두 가지가 나란히 걸려 있다. 위 가지 P —R₁— C —R₂— Q,
// 아래 가지 P —R₃— D —Rₓ— Q. C 와 D 사이에 내부 저항 r_G 인 검류계가 있다.
// 마디 전위는 plugin-circuit 의 `solveMna` 로 푼다(Q 가 기준 0 V). 검류계 전류는
// (V_D − V_C) / r_G 이고, 양수면 D 에서 C 로(도식에서 위로) 흐른다.
//
// R₁/R₂ = R₃/Rₓ 이면 두 가지가 전지 전압을 같은 비로 나누어 V_C = V_D 가 되고, 검류계로
// 전류가 흐르지 않는다 — 검류계 저항이 무엇이든 그렇다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import { solveMna, type MnaElement } from '@aperi21/plugin-circuit';
import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ARROW_MAX,
  ARROW_PER_MA,
  EMF,
  NEEDLE_DEG_PER_MA,
  NEEDLE_MAX_DEG,
  R1,
  R2,
  R3_HIGH,
  R3_LOW,
  R3_STEP,
  RG,
  PANEL_V_MAX,
  PANEL_V_MIN,
  RX,
} from './schema';
import type { WheatstoneBridgeState } from './state';

export interface WheatstoneBridgeConstants {
  /** 전지 전압(V). */
  emf: number;
  /** 비율 가지(Ω). */
  r1: number;
  r2: number;
  /** 모르는 저항(Ω). */
  rx: number;
  /** 검류계 내부 저항(Ω). */
  rg: number;
  /** 가변 저항 범위 · 한 칸(Ω). */
  r3Low: number;
  r3High: number;
  r3Step: number;
  /** 바늘 — 1 mA 당 기우는 각(도) · 끝(도). */
  needleDegPerMilliamp: number;
  needleMaxDeg: number;
  /** 전류 화살표 — 1 mA 당 길이(월드) · 상한(월드). */
  arrowPerMilliamp: number;
  arrowMax: number;
  /** 전위 판이 보이는 창의 아래 · 위 끝(V). */
  panelVMin: number;
  panelVMax: number;
}

export function readConstants(stage: StageDef): WheatstoneBridgeConstants {
  const c = stage.constants ?? {};
  return {
    emf: c.emf ?? EMF,
    r1: c.r1 ?? R1,
    r2: c.r2 ?? R2,
    rx: c.rx ?? RX,
    rg: c.rg ?? RG,
    r3Low: c.r3Low ?? R3_LOW,
    r3High: c.r3High ?? R3_HIGH,
    r3Step: c.r3Step ?? R3_STEP,
    needleDegPerMilliamp: c.needleDegPerMilliamp ?? NEEDLE_DEG_PER_MA,
    needleMaxDeg: c.needleMaxDeg ?? NEEDLE_MAX_DEG,
    arrowPerMilliamp: c.arrowPerMilliamp ?? ARROW_PER_MA,
    arrowMax: c.arrowMax ?? ARROW_MAX,
    panelVMin: c.panelVMin ?? PANEL_V_MIN,
    panelVMax: c.panelVMax ?? PANEL_V_MAX,
  };
}

/** 평형 자리의 R₃(Ω) — R₁/R₂ = R₃/Rₓ. 격자 위에 있도록 상수를 고른다(G143). */
export function balanceR3(c: WheatstoneBridgeConstants): number {
  return (c.rx * c.r1) / c.r2;
}

/**
 * 지금 R₃(Ω). 세 돌림 단계의 진행도를 차례로 더해 연속 자리를 얻고(멈춘 단계에서는 정박 자리 그대로),
 * 가변 저항의 한 칸 격자(`r3Low + k·r3Step`)로 딸깍 맞춘다 — 화면 글자가 늘 격자 값이다.
 */
export function r3Now(tl: TimelineFrame, c: WheatstoneBridgeConstants): number {
  const bal = balanceR3(c);
  const smooth =
    c.r3Low +
    (bal - c.r3Low) * tl.at('turn-up') +
    (c.r3High - bal) * tl.at('turn-over') +
    (c.r3Low - c.r3High) * tl.at('back');
  const k = Math.round((smooth - c.r3Low) / c.r3Step);
  return c.r3Low + k * c.r3Step;
}

export interface BridgeSolution {
  /** 두 가운데 마디의 전위(V). Q = 0 V. */
  vC: number;
  vD: number;
  /** 검류계 전류(A). 양수면 D → C. */
  iG: number;
}

/** 브리지를 푼다. */
export function solveBridge(r3: number, c: WheatstoneBridgeConstants): BridgeSolution {
  const mna: MnaElement[] = [
    { id: 'ground', kind: 'ground', a: 'Q' },
    { id: 'emf', kind: 'voltageSource', a: 'P', b: 'Q', value: c.emf },
    { id: 'r1', kind: 'resistor', a: 'P', b: 'C', value: c.r1 },
    { id: 'r2', kind: 'resistor', a: 'C', b: 'Q', value: c.r2 },
    { id: 'r3', kind: 'resistor', a: 'P', b: 'D', value: r3 },
    { id: 'rx', kind: 'resistor', a: 'D', b: 'Q', value: c.rx },
    { id: 'g', kind: 'resistor', a: 'D', b: 'C', value: c.rg },
  ];
  const sol = solveMna(mna);
  if (!sol) throw new Error('wheatstone-bridge: 브리지를 풀 수 없다(저항이 0 이하)');
  const vC = sol.nodeVoltages['C'] ?? 0;
  const vD = sol.nodeVoltages['D'] ?? 0;
  return { vC, vD, iG: (vD - vC) / c.rg };
}

/** 바늘이 0 에서 기운 각(라디안). 양수 = 오른쪽(시계 방향). 끝(`needleMaxDeg`)에서 멈춘다. */
export function needleTilt(iG: number, c: WheatstoneBridgeConstants): number {
  const deg = iG * 1000 * c.needleDegPerMilliamp;
  const clamped = Math.max(-c.needleMaxDeg, Math.min(c.needleMaxDeg, deg));
  return (clamped * Math.PI) / 180;
}

/** 전류 화살표 길이(월드). 상한(`arrowMax`)에서 비례가 끊긴다. */
export function arrowLength(iG: number, c: WheatstoneBridgeConstants): number {
  return Math.min(c.arrowMax, Math.abs(iG) * 1000 * c.arrowPerMilliamp);
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: WheatstoneBridgeState }): WheatstoneBridgeState {
  return params.state;
}
