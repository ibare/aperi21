// ========================================================================
// light-through-materials — 순수 계산
// ========================================================================
// 줄기 하나는 폭을 나눈 가는 줄 여러 개다. 판이 어떤 줄을 가리는지는 판 자리의 함수이고,
// 판 자리는 시간표의 함수다. 가려진 줄은 재료에 따라 셋으로 갈린다.
//
//   유리   — 곧게 지난다. 세기 × 투과율.
//   간유리 — 판 아래에서 시드로 뽑은 여러 방향으로 흩어진다. 세기 × 투과율을 방향들이 나눠 갖는다.
//   나무판 — 투과율 0. 판 아래로 아무것도 없다.
//
// 스크린 밝기는 그 줄들이 스크린에 떨어뜨린 빛의 합이다 — 곧은 줄은 제 폭만큼 네모로,
// 흩어진 줄은 떨어진 자리마다 작은 종 모양으로 더한다. 캔버스도 테마 색도 모른다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BEAM_HALF,
  BEAM_INTENSITY,
  BEAM_LINES,
  COLUMN_X,
  FROSTED_FILL,
  FROSTED_LOOK,
  GLASS_FILL,
  GLASS_LOOK,
  PLATE_HALF_T,
  PLATE_HALF_W,
  PLATE_REST_SHIFT,
  PLATE_Y,
  SCATTER_MAX,
  SCATTER_RAY_SHARE,
  SCATTER_SPREAD,
  SCREEN_Y1,
  SEED,
  TRANSMIT_FROSTED,
  TRANSMIT_GLASS,
  TRANSMIT_WOOD,
  WOOD_FILL,
  WOOD_LOOK,
} from './schema';
import type { LightThroughMaterialsState } from './state';

/** 재료가 빛을 어떻게 보내는가 — 곧게(`clear`) 또는 흩어서(`diffuse`). */
export type Passage = 'clear' | 'diffuse';

export interface Material {
  passage: Passage;
  /** 통과시키는 몫 0~1. */
  transmit: number;
  /** 판의 겉모습 — 빛 세기(무채색) 0~1 · 채움 불투명도 0~1. */
  look: number;
  fill: number;
}

export interface LightThroughMaterialsConstants {
  /** 흰빛 줄기의 세기 0~1. */
  beamIntensity: number;
  /** 왼쪽부터 유리 · 간유리 · 나무판. `COLUMN_X` 와 같은 순서. */
  materials: readonly [Material, Material, Material];
  scatterSpread: number;
  scatterMax: number;
  seed: number;
  scatterRayShare: number;
}

export function readConstants(stage: StageDef): LightThroughMaterialsConstants {
  const c = stage.constants ?? {};
  return {
    beamIntensity: c.beamIntensity ?? BEAM_INTENSITY,
    materials: [
      {
        passage: 'clear',
        transmit: c.transmitGlass ?? TRANSMIT_GLASS,
        look: c.glassLook ?? GLASS_LOOK,
        fill: c.glassFill ?? GLASS_FILL,
      },
      {
        passage: 'diffuse',
        transmit: c.transmitFrosted ?? TRANSMIT_FROSTED,
        look: c.frostedLook ?? FROSTED_LOOK,
        fill: c.frostedFill ?? FROSTED_FILL,
      },
      {
        passage: 'clear',
        transmit: c.transmitWood ?? TRANSMIT_WOOD,
        look: c.woodLook ?? WOOD_LOOK,
        fill: c.woodFill ?? WOOD_FILL,
      },
    ],
    scatterSpread: c.scatterSpread ?? SCATTER_SPREAD,
    scatterMax: c.scatterMax ?? SCATTER_MAX,
    seed: c.seed ?? SEED,
    scatterRayShare: c.scatterRayShare ?? SCATTER_RAY_SHARE,
  };
}

// ------------------------------------------------------------------------
// 시드 결정적 난수 — 같은 (시드, 줄기, 줄) 은 언제나 같은 방향들이다
// ------------------------------------------------------------------------

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

/**
 * 간유리를 지난 한 줄이 흩어지는 방향들(연직에서 잰 각, 라디안). 종 모양(표준편차 `scatterSpread`)으로
 * 뽑고 `scatterMax` 에서 자른다. 앞의 몇 개가 그려 보이는 줄기이고, 전부가 스크린 밝기를 만든다 —
 * 그림과 밝기가 한 표본에서 나온다.
 */
export function scatterAngles(c: LightThroughMaterialsConstants, column: number, line: number, count: number): number[] {
  const rnd = mulberry32(Math.imul(c.seed, 1000003) + column * 7919 + line * 104729);
  const out: number[] = [];
  for (let k = 0; k < count; k++) {
    const u1 = Math.max(rnd(), Number.EPSILON);
    const u2 = rnd();
    const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    out.push(Math.max(-c.scatterMax, Math.min(c.scatterMax, g * c.scatterSpread)));
  }
  return out;
}

// ------------------------------------------------------------------------
// 판 자리와 줄
// ------------------------------------------------------------------------

/**
 * 판이 줄기 안으로 들어간 정도 0~1. 넣는 단계에서 0 → 1, 빼는 단계에서 1 → 0.
 * 두 단계의 이징은 선언이 정한다. 주기 처음(판 없음)과 끝(다시 판 없음) 모두 0 이다.
 */
export function insertion(tl: TimelineFrame): number {
  return tl.at('slide-in') - tl.at('slide-out');
}

/** 판 가운데 x — 줄기 가운데에서 `PLATE_REST_SHIFT` 만큼 옆에서 쉬다가 들어온다. */
export function plateCenterX(column: number, s: number): number {
  return COLUMN_X[column]! + PLATE_REST_SHIFT * (1 - s);
}

export const PLATE_TOP = PLATE_Y + PLATE_HALF_T;
export const PLATE_BOTTOM = PLATE_Y - PLATE_HALF_T;

/** 한 줄기를 나눈 줄들의 x — 폭을 `BEAM_LINES` 칸으로 나눈 칸 가운데. */
export function lineXs(column: number): number[] {
  const cx = COLUMN_X[column]!;
  const out: number[] = [];
  for (let i = 0; i < BEAM_LINES; i++) out.push(cx - BEAM_HALF + (BEAM_HALF * 2 * (i + 0.5)) / BEAM_LINES);
  return out;
}

/** 줄 하나가 맡은 폭. */
export const LINE_PITCH = (BEAM_HALF * 2) / BEAM_LINES;

export function covers(plateX: number, x: number): boolean {
  return Math.abs(x - plateX) <= PLATE_HALF_W;
}

/** 흩어진 줄 하나 — 판 아래에서 떠나 스크린 윗면에 닿는다. */
export function scatterRay(x: number, angle: number): readonly [Vec2, Vec2] {
  const drop = PLATE_BOTTOM - SCREEN_Y1;
  return [
    [x, PLATE_BOTTOM],
    [x + drop * Math.tan(angle), SCREEN_Y1],
  ];
}

// ------------------------------------------------------------------------
// 스크린 밝기
// ------------------------------------------------------------------------

export interface ScreenGrid {
  minX: number;
  maxX: number;
  cols: number;
  /** 흩어진 빛이 떨어진 자리 하나를 퍼뜨리는 종의 폭(월드). 표본이 알갱이로 보이지 않게 고른다. */
  kernel: number;
  /** 흩어진 줄 하나에서 뽑는 방향 수. */
  samples: number;
}

/**
 * 스크린 칸마다 닿은 빛의 세기(줄기 세기 1 이 가득). 판이 `s` 만큼 들어온 때.
 * 곧은 줄은 제 폭만큼 네모로, 흩어진 줄은 떨어진 자리마다 넓이가 (세기 × 투과율 × 줄 폭 / 표본 수) 인 종으로 더한다.
 */
export function screenIrradiance(c: LightThroughMaterialsConstants, s: number, g: ScreenGrid): number[] {
  const out = new Array<number>(g.cols).fill(0);
  const dx = (g.maxX - g.minX) / g.cols;
  const colX = (k: number): number => g.minX + (k + 0.5) * dx;
  const addBox = (x: number, value: number): void => {
    if (value <= 0) return;
    const k0 = Math.max(0, Math.floor((x - LINE_PITCH / 2 - g.minX) / dx));
    const k1 = Math.min(g.cols - 1, Math.floor((x + LINE_PITCH / 2 - g.minX) / dx));
    for (let k = k0; k <= k1; k++) if (Math.abs(colX(k) - x) <= LINE_PITCH / 2) out[k]! += value;
  };
  const norm = 1 / (g.kernel * Math.sqrt(2 * Math.PI));
  const addBell = (x: number, area: number): void => {
    const reach = g.kernel * 4;
    const k0 = Math.max(0, Math.floor((x - reach - g.minX) / dx));
    const k1 = Math.min(g.cols - 1, Math.floor((x + reach - g.minX) / dx));
    for (let k = k0; k <= k1; k++) {
      const d = (colX(k) - x) / g.kernel;
      out[k]! += area * norm * Math.exp(-0.5 * d * d);
    }
  };

  for (let j = 0; j < COLUMN_X.length; j++) {
    const m = c.materials[j]!;
    const plateX = plateCenterX(j, s);
    lineXs(j).forEach((x, i) => {
      if (!covers(plateX, x)) {
        addBox(x, c.beamIntensity);
        return;
      }
      const passed = c.beamIntensity * m.transmit;
      if (m.passage === 'clear') {
        addBox(x, passed);
        return;
      }
      const area = (passed * LINE_PITCH) / g.samples;
      for (const a of scatterAngles(c, j, i, g.samples)) addBell(scatterRay(x, a)[1][0], area);
    });
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: LightThroughMaterialsState }): LightThroughMaterialsState {
  return params.state;
}
