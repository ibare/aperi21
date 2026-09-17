// ========================================================================
// energy-flow-diagram — 순수 계산
// ========================================================================
// 흐름값 → 띠 · 갈래의 모양, 알갱이의 자리. DOM · 캔버스 · 색을 모른다.
// 좌표는 원본 캔버스의 화면 좌표(y 아래)로 계산하고, 선언으로 넘길 때 `at` 이 뒤집는다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import { DOTS, FLOWS, LAYOUT, MIX_RATE } from './schema';
import type { EnergyFlowDiagramState } from './state';

export type Flows = { -readonly [K in keyof typeof FLOWS]: number };

export function readFlows(stage: StageDef): Flows {
  const c = stage.constants ?? {};
  return {
    plantHeat: c.plantHeat ?? FLOWS.plantHeat,
    lineHeat: c.lineHeat ?? FLOWS.lineHeat,
    atHome: c.atHome ?? FLOWS.atHome,
    lightIncandescent: c.lightIncandescent ?? FLOWS.lightIncandescent,
    lightLed: c.lightLed ?? FLOWS.lightLed,
  };
}

/** 원본 화면 좌표(y 아래) → 월드(y 위). */
export function at(x: number, y: number): Vec2 {
  return [x, -y];
}

export interface FlowReading {
  /** 빛 갈래 굵기의 원값(보간 중이면 소수). */
  lightRaw: number;
  /** 화면의 「빛 N」. */
  light: number;
  /** 화면의 전구 「열 N」 = 집에 닿는 전기 − 빛. 합이 늘 100 이 되게 반올림을 여기로 몬다. */
  bulbHeat: number;
}

/** 지금 전구 상태에서의 흐름값. `mix` 에 smoothstep 을 건다(원본 그대로). */
export function flowsAt(mix: number, f: Flows): FlowReading {
  const e = mix * mix * (3 - 2 * mix);
  const lightRaw = f.lightIncandescent + (f.lightLed - f.lightIncandescent) * e;
  const light = Math.round(lightRaw);
  return { lightRaw, light, bulbHeat: f.atHome - light };
}

// ------------------------------------------------------------------------
// 갈래
// ------------------------------------------------------------------------

type Cubic = readonly [Vec2, Vec2, Vec2, Vec2];

export interface Branch {
  /** 마디 x. */
  xs: number;
  /** 줄기 안에서 이 갈래가 차지하는 차선 [from, to) (흐름 단위, 위에서 0). */
  from: number;
  to: number;
  /** 굵기(월드). */
  w: number;
  /** 바깥 변 · 안쪽 변 3차 베지에 (화면 좌표). */
  outer: Cubic;
  inner: Cubic;
  /** 알갱이가 갈래 곡선을 지나는 길이. */
  len: number;
  /** 갈래 끝 「열 N」 값. */
  value: number;
}

export function bez(p: Cubic, s: number): Vec2 {
  const a = 1 - s;
  return [
    a * a * a * p[0][0] + 3 * a * a * s * p[1][0] + 3 * a * s * s * p[2][0] + s * s * s * p[3][0],
    a * a * a * p[0][1] + 3 * a * a * s * p[1][1] + 3 * a * s * s * p[2][1] + s * s * s * p[3][1],
  ];
}

/** 줄기 아래쪽 [from, to) 차선이 xs 에서 아래로 꺾여 나간다. */
function branch(xs: number, from: number, to: number, value: number): Branch {
  const { y0, unit, yEnd, bend: R } = LAYOUT;
  const ya = y0 + from * unit;
  const yb = y0 + to * unit;
  const w = yb - ya;
  const outer: Cubic = [
    [xs, ya],
    [xs + (R + w) * 0.55, ya],
    [xs + R + w, yEnd - (yEnd - ya) * 0.45],
    [xs + R + w, yEnd],
  ];
  const inner: Cubic = [
    [xs, yb],
    [xs + R * 0.55, yb],
    [xs + R, yEnd - (yEnd - yb) * 0.45],
    [xs + R, yEnd],
  ];
  const len = (R + w / 2) * 0.7 + (yEnd - (ya + yb) / 2);
  return { xs, from, to, w, outer, inner, len, value };
}

/** 발전소 · 송전선 · 전구 갈래. 앞 둘은 전구 종류와 무관하다. */
export function branchesOf(f: Flows, r: FlowReading): readonly [Branch, Branch, Branch] {
  const [plant, line, bulb] = LAYOUT.nodes as [number, number, number];
  return [
    branch(plant, f.atHome + f.lineHeat, 100, f.plantHeat),
    branch(line, f.atHome, f.atHome + f.lineHeat, f.lineHeat),
    branch(bulb, r.lightRaw, f.atHome, r.bulbHeat),
  ];
}

// ------------------------------------------------------------------------
// 알갱이
// ------------------------------------------------------------------------

export interface Dot {
  /** 차선(흐름 단위, 위에서 0). 어느 마디에서 빠질지가 여기서 정해진다. */
  u: number;
  /** 경로 위 위상(월드). */
  phase: number;
  /** 꼬리에서의 흔들림 위상. */
  wob: number;
}

/** mulberry32 — 원본 하네스와 같은 난수라 같은 시드면 같은 알갱이가 나온다. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeDots(count: number, seed: number): Dot[] {
  const random = rng(seed);
  const out: Dot[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      u: ((i + random()) / count) * 100,
      phase: random() * DOTS.period,
      wob: random() * 6.283,
    });
  }
  return out;
}

/**
 * 알갱이가 지금 있는 곳.
 * - `stream` 줄기 안 · `lightLane` 은 빛 차선(전구 마디 뒤에서 빛 갈래 색 위에 있다)
 * - `light` 빛 갈래 끝을 지나 사라지는 중
 * - `heat` 열 갈래 곡선 또는 꼬리
 */
export type DotKind = 'stream' | 'lightLane' | 'light' | 'heat';

export interface DotPlace {
  pos: Vec2;
  /** 0~1 불투명도. */
  alpha: number;
  kind: DotKind;
}

export function dotPlace(
  d: Dot,
  t: number,
  r: FlowReading,
  brs: readonly [Branch, Branch, Branch],
): DotPlace | null {
  const { x0, xEnd, y0, unit, yEnd, fade, bend: R, nodes } = LAYOUT;
  const g = (d.phase + t * DOTS.speed) % DOTS.period;
  if (d.u < r.lightRaw) {
    const lm = xEnd - x0;
    if (g < lm) {
      const x = x0 + g;
      return {
        pos: at(x, y0 + d.u * unit),
        alpha: Math.min(1, g / 20),
        kind: x >= nodes[2]! ? 'lightLane' : 'stream',
      };
    }
    const e = (g - lm) / 18;
    if (e > 1) return null;
    return { pos: at(xEnd + e * 18, y0 + d.u * unit), alpha: 1 - e, kind: 'light' };
  }
  let br = brs[2];
  if (d.u >= brs[0].from) br = brs[0];
  else if (d.u >= brs[1].from) br = brs[1];
  const lm = br.xs - x0;
  if (g < lm) {
    return { pos: at(x0 + g, y0 + d.u * unit), alpha: Math.min(1, g / 20), kind: 'stream' };
  }
  const lane = (d.u - br.from) / Math.max(1e-6, br.to - br.from);
  const s = (g - lm) / br.len;
  if (s <= 1) {
    const po = bez(br.outer, s);
    const pi = bez(br.inner, s);
    return {
      pos: at(po[0] + (pi[0] - po[0]) * lane, po[1] + (pi[1] - po[1]) * lane),
      alpha: 1,
      kind: 'heat',
    };
  }
  const e = (g - lm - br.len) / fade;
  if (e > 1) return null;
  const spread = tailSpread(br);
  const xStart = br.xs + R + br.w * (1 - lane);
  const x = xStart + (0.5 - lane) * 2 * spread * e + Math.sin(t * 2.3 + d.wob) * 4 * e;
  return { pos: at(x, yEnd + e * fade), alpha: 1 - e, kind: 'heat' };
}

/** 꼬리가 아래로 퍼지는 폭. 굵은 갈래일수록 넓게 흩어진다. */
export function tailSpread(br: Branch): number {
  return 8 + br.w * 0.35;
}

// ------------------------------------------------------------------------
// step
// ------------------------------------------------------------------------

/**
 * 전구를 바꾸면 `mix` 가 초당 `MIX_RATE` 로 따라간다. 캡션의 숫자도 여기서 같은
 * 반올림으로 만든다 — 화면의 「빛 N」 과 어긋나지 않는다.
 */
export function step(params: {
  state: EnergyFlowDiagramState;
  dt: number;
  stage: StageDef;
}): EnergyFlowDiagramState {
  const { state, dt, stage } = params;
  const k = dt * MIX_RATE;
  const mix = state.mix + Math.max(-k, Math.min(k, state.bulb - state.mix));
  if (mix === state.mix) return state;
  const r = flowsAt(mix, readFlows(stage));
  return { ...state, mix, lightText: String(r.light), restText: String(100 - r.light) };
}
