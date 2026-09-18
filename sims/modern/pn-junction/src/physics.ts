// ========================================================================
// pn-junction — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 모든 자리가 시간표 진행도의 함수이고, `step` 은 항등이다.
//
// 이 조각의 물리는 셋이다.
//
//   만남     붙이는 순간 경계 가까이의 전자와 양공이 건너가 만나 함께 사라진다. 그 자리에
//            움직이지 못하는 이온만 남는다 — 공핍층. 반폭은 `zeroBiasCols` 열
//   폭       건 전압 V 에 따라 공핍층 폭이 w = w₀ · √((V_bi − V) / V_bi) 를 따른다.
//            순방향(V > 0)은 얇아지고 역방향(V < 0)은 넓어진다
//   흐름     순방향에서만 운반자가 경계를 건너 흐른다. 양공은 오른쪽, 전자는 왼쪽으로 가서
//            공핍층 안에서 만나 사라지고, 전극에서 새로 들어온다
//
// 나머지는 배치 계산이다 — 이온 · 운반자의 자리, 붙기 전 두 조각의 벌어짐.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  APART_GAP,
  BUILT_IN_VOLTAGE,
  COLS_PER_SIDE,
  FLOW_SPEED,
  FORWARD_VOLTAGE,
  JITTER,
  JITTER_HZ,
  REVERSE_VOLTAGE,
  ROW_GAP,
  ROWS,
  SEED,
  SPACING,
  ZERO_BIAS_COLS,
} from './schema';
import type { PnJunctionState } from './state';

export function step(params: { state: PnJunctionState }): PnJunctionState {
  return params.state;
}

export interface PnJunctionConstants {
  builtInVoltage: number;
  forwardVoltage: number;
  reverseVoltage: number;
  zeroBiasCols: number;
  flowSpeed: number;
  jitter: number;
  jitterHz: number;
  seed: number;
}

export function readConstants(stage: StageDef): PnJunctionConstants {
  const c = stage.constants ?? {};
  return {
    builtInVoltage: c.builtInVoltage ?? BUILT_IN_VOLTAGE,
    forwardVoltage: c.forwardVoltage ?? FORWARD_VOLTAGE,
    reverseVoltage: c.reverseVoltage ?? REVERSE_VOLTAGE,
    zeroBiasCols: Math.max(0, Math.round(c.zeroBiasCols ?? ZERO_BIAS_COLS)),
    flowSpeed: c.flowSpeed ?? FLOW_SPEED,
    jitter: c.jitter ?? JITTER,
    jitterHz: c.jitterHz ?? JITTER_HZ,
    seed: Math.round(c.seed ?? SEED),
  };
}

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/** 막대 반길이(월드). */
export const HALF_LEN = COLS_PER_SIDE * SPACING;

/** 이온 · 운반자 줄의 높이 — 가운데 줄이 y = 0. */
export function rowY(r: number): number {
  return (r - (ROWS - 1) / 2) * ROW_GAP;
}

/** 쪽 부호 — p 는 왼쪽(−), n 은 오른쪽(+). */
export type Side = 'p' | 'n';
export const SIDE_SIGN: Record<Side, number> = { p: -1, n: 1 };

/** 붙기 전 두 조각이 접합면에서 벌어진 거리(한쪽, 월드). `join` 동안 0 으로 준다. */
export function apartOffset(tl: TimelineFrame): number {
  return (APART_GAP / 2) * (1 - tl.at('join'));
}

// ------------------------------------------------------------------------
// 공핍층 폭
// ------------------------------------------------------------------------

/** 전압을 걸지 않았을 때 공핍층 반폭(월드). */
export function zeroBiasEdge(c: PnJunctionConstants): number {
  return c.zeroBiasCols * SPACING;
}

/** 건 전압 V(순방향 +)에서 공핍층 반폭. w ∝ √(V_bi − V). */
export function biasedEdge(c: PnJunctionConstants, volts: number): number {
  return zeroBiasEdge(c) * Math.sqrt(Math.max(0, c.builtInVoltage - volts) / c.builtInVoltage);
}

export interface Edges {
  /** 운반자가 비켜 선 경계(반폭, 월드). 전압에 따라 줄고 는다. */
  carrier: number;
  /** 이온이 드러난 경계(반폭, 월드). 붙은 뒤 만남이 끝나며 0 에서 자란다. */
  ion: number;
}

export function edges(tl: TimelineFrame, c: PnJunctionConstants): Edges {
  const e0 = zeroBiasEdge(c);
  const eF = biasedEdge(c, c.forwardVoltage);
  const eR = biasedEdge(c, -c.reverseVoltage);
  const fwd = tl.at('fwdIn') - tl.at('fwdOut');
  const rev = tl.at('revIn');
  const carrier = e0 + (eF - e0) * fwd + (eR - e0) * rev;
  return { carrier, ion: carrier - e0 * (1 - tl.at('recombine')) };
}

/** 전압 표시의 세기 0~1 — 순방향 · 역방향. */
export function biasWeights(tl: TimelineFrame): { forward: number; reverse: number } {
  return { forward: tl.at('fwdIn') - tl.at('fwdOut'), reverse: tl.at('revIn') };
}

// ------------------------------------------------------------------------
// 흐름 — 순방향 동안 운반자가 경계 쪽으로 간 거리
// ------------------------------------------------------------------------

/**
 * 흐른 거리(월드). `fwd` 동안 `flowSpeed` 로 흐르고, `fwdOut` 동안 다음 열 자리까지 마저 가
 * 운반자가 다시 이온 곁에 선다(열 간격의 배수). 역방향 동안은 그대로다.
 */
export function flowShift(tl: TimelineFrame, c: PnJunctionConstants): number {
  const full = c.flowSpeed * tl.duration('fwd');
  const settled = Math.ceil(full / SPACING - 1e-9) * SPACING;
  return full * tl.at('fwd') + (settled - full) * tl.at('fwdOut');
}

/**
 * 지금 흐르는 정도 0~1 — `fwd` 동안 1, 전압을 끄는 `fwdOut` 동안 잦아든다. 꼬리의 길이 · 짙기에 건다.
 * `fwdOut` 의 마저 가는 걸음은 한 열 간격보다 짧아 꼬리를 줄여 보인다.
 */
export function flowingNow(tl: TimelineFrame): number {
  const f = tl.at('fwd');
  return f > 0 ? 1 - tl.at('fwdOut') : 0;
}

/** 흐르는 운반자 수(한 줄, 한쪽) — 전극 너머에 대기하는 몫까지 넣어 가장 얇은 공핍층에서도 줄이 빈틈없이 찬다. */
export function carrierCount(c: PnJunctionConstants): number {
  const eMin = Math.min(zeroBiasEdge(c), biasedEdge(c, c.forwardVoltage));
  return Math.ceil((HALF_LEN - eMin) / SPACING) + 1;
}

// ------------------------------------------------------------------------
// 흔들림 — (시드, 시각)의 함수
// ------------------------------------------------------------------------

/** 시드 결정적 난수 0~1 (mulberry32 한 걸음). */
export function rand(seed: number, i: number): number {
  let t = (seed * 0x9e3779b1 + i * 0x85ebca6b) >>> 0;
  t = (t + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** 알갱이마다 흔들림 빠르기에 곱하는 배율의 범위 — 최소 · 폭. 모두 같은 박자로 흔들리면 격자가 통째로 떨린다. */
const JITTER_RATE_MIN = 0.7;
const JITTER_RATE_SPAN = 0.6;

/** 운반자 i 의 열 흔들림(월드). 가로 · 세로 위상과 빠르기를 알갱이마다 다르게 뽑는다. */
export function jitterAt(c: PnJunctionConstants, i: number, t: number): Vec2 {
  const w = 2 * Math.PI * c.jitterHz;
  const kx = JITTER_RATE_MIN + JITTER_RATE_SPAN * rand(c.seed, i * 4 + 2);
  const ky = JITTER_RATE_MIN + JITTER_RATE_SPAN * rand(c.seed, i * 4 + 3);
  return [
    c.jitter * Math.sin(w * kx * t + 2 * Math.PI * rand(c.seed, i * 4)),
    c.jitter * Math.sin(w * ky * t + 2 * Math.PI * rand(c.seed, i * 4 + 1)),
  ];
}

// ------------------------------------------------------------------------
// 운반자 자리
// ------------------------------------------------------------------------

export interface Carrier {
  pos: Vec2;
  /** 0~1. 전극 너머 · 공핍층 안에서 옅어진다. 운반자 모양의 크기에도 함께 건다. */
  weight: number;
  /** 흐르는 중이면 그 빠르기 비율 0~1 — 뒤로 꼬리를 끈다. */
  flowing: number;
}

/** 전극 쪽 끝에서 운반자가 들고 나는 구간(월드). */
export const CONTACT_FADE = 0.25;

const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

/**
 * 흐르는 운반자 — 붙은 뒤에도 남는 몫. 한 줄에 `carrierCount` 개가 경계에서 열 간격으로 선다.
 *
 * 경계에서 잰 거리 `d` 는 흐른 만큼 줄고, 경계를 넘은 운반자는 전극 너머로 다시 들어온다(감긴 좌표).
 * 경계를 넘은 몫은 **건너는 알갱이**로 따로 돌려준다 — 공핍층을 가로지르며 옅어지고, 건너편 운반자와
 * 가운데서 만나 사라진다. 건너는 알갱이는 전압을 끄는 `fwdOut` 동안 사라진다.
 */
export function flowingCarriers(
  tl: TimelineFrame,
  c: PnJunctionConstants,
  side: Side,
  cutoff: number,
): Carrier[] {
  const sg = SIDE_SIGN[side];
  const e = edges(tl, c).carrier;
  const s = flowShift(tl, c);
  const off = apartOffset(tl);
  const count = carrierCount(c);
  const loop = count * SPACING;
  const crossing = 1 - tl.at('fwdOut');
  const flowing = flowingNow(tl);
  const out: Carrier[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let j = 0; j < count; j++) {
      const id = (side === 'p' ? 0 : 1000) + r * 100 + j;
      const jit = jitterAt(c, id, tl.t);
      const y = rowY(r) + CARRIER_DY + jit[1];
      const du = (j + 0.5) * SPACING - s;
      const d = ((du % loop) + loop) % loop;
      // 전극 쪽 — 막대 끝을 넘으면 보이지 않는다.
      const w = clamp01((HALF_LEN - (e + d)) / CONTACT_FADE);
      if (w > cutoff) out.push({ pos: [sg * (e + d + off) + jit[0], y], weight: w, flowing });
      // 경계를 한 번이라도 넘은 알갱이만 건너는 몫이 있다.
      if (du < 0 && e > 0) {
        const dc = d - loop; // 경계를 넘어 간 거리(음수)
        const wc = clamp01(1 + dc / (2 * e)) * crossing;
        if (wc > cutoff) out.push({ pos: [sg * (e + dc + off) + jit[0], y], weight: wc, flowing });
      }
    }
  }
  return out;
}

/** 운반자가 이온 곁에서 비켜 앉는 높이(월드). 이온은 반대쪽으로 같은 만큼. */
export const CARRIER_DY = 0.14;
export const ION_DY = -0.14;

/**
 * 만나서 사라지는 운반자 — 붙기 전 경계 가까이(`zeroBiasCols` 열)에 있던 몫. `diffuse` 동안 접합면으로
 * 건너가고, `recombine` 동안 옅어지며 사라진다. 짝(같은 줄, 같은 열)끼리 같은 자리에서 만난다 —
 * 두 열의 짝이 한 점에 겹치지 않게 만남 높이를 열마다 운반자 줄 · 이온 줄로 엇갈린다.
 */
export function meetingCarriers(tl: TimelineFrame, c: PnJunctionConstants, side: Side): Carrier[] {
  const sg = SIDE_SIGN[side];
  const go = tl.at('diffuse');
  const w = 1 - tl.at('recombine');
  const off = apartOffset(tl);
  const out: Carrier[] = [];
  if (w <= 0) return out;
  for (let r = 0; r < ROWS; r++) {
    for (let k = 0; k < c.zeroBiasCols; k++) {
      const id = (side === 'p' ? 500 : 1500) + r * 10 + k;
      const jit = jitterAt(c, id, tl.t);
      const from: Vec2 = [sg * ((k + 0.5) * SPACING + off), rowY(r) + CARRIER_DY];
      const to = meetPoint(r, k);
      out.push({
        pos: [from[0] + (to[0] - from[0]) * go + jit[0], from[1] + (to[1] - from[1]) * go + jit[1]],
        weight: w,
        flowing: 0,
      });
    }
  }
  return out;
}

/** 줄 r, 열 k 의 짝이 만나는 자리 — 접합면 위. */
export function meetPoint(r: number, k: number): Vec2 {
  return [0, rowY(r) + (k % 2 === 0 ? CARRIER_DY : ION_DY)];
}

// ------------------------------------------------------------------------
// 이온 자리
// ------------------------------------------------------------------------

export interface Ion {
  pos: Vec2;
  /** 드러난 정도 0~1 — 곁의 운반자가 떠나 전하가 드러났으면 1. */
  exposed: number;
}

/** 이온 하나가 드러남으로 넘어가는 폭(월드). 경계가 움직일 때 이온이 한 번에 뒤집히지 않게. */
export const EXPOSE_RAMP = SPACING;

export function ions(tl: TimelineFrame, c: PnJunctionConstants, side: Side): Ion[] {
  const sg = SIDE_SIGN[side];
  const edge = edges(tl, c).ion;
  const off = apartOffset(tl);
  const out: Ion[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let k = 0; k < COLS_PER_SIDE; k++) {
      const x = (k + 0.5) * SPACING;
      out.push({
        pos: [sg * (x + off), rowY(r) + ION_DY],
        exposed: edge > 0 ? clamp01((edge - x) / EXPOSE_RAMP + 0.5) : 0,
      });
    }
  }
  return out;
}

/** 물러나며 옅어지는 정도(1 이면 또렷하다). 주기 첫머리에는 나타나며 짙어진다. */
export function fadeOpacity(tl: TimelineFrame): number {
  return tl.at('appear') * (1 - tl.at('fade'));
}
