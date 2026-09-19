// ========================================================================
// millikan-experiment — 순수 물리
// ========================================================================
// 방울은 공기 속에서 곧 종단 속력에 이른다. 저항이 속력에 비례하므로(스토크스) 속력은
// 방울에 걸린 알짜 힘에 비례한다 —
//
//   v = v₀ · (1 − qE / mg)
//
// 전압을 0 에서 균형 전압까지 곧게 올리면 qE/mg = s 가 0 → 1 로 곧게 자라고, 방울의
// 높이는 해석해로 떨어진다(p 는 `raise` 진행도, D 는 그 길이):
//
//   y = y_fall_end − v₀ · D · (p − p²/2)
//
// 모든 것이 시각의 함수라 쌓는 것이 없다. `step` 은 항등이다.
//
// 측정 결과(방울마다 전하 배수 · 반지름 · 잰 값의 흩어짐)는 **(seed, 주기 번호)** 의
// 함수로 뽑는다 (`radioactive-decay` 의 `drawCycle` 선례). 같은 시각은 언제나 같은 화면이다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  AXIS_ORIGIN_X,
  AXIS_OVERHANG,
  AXIS_UNIT,
  AXIS_Y,
  DOT_RADIUS,
  DOT_SPACING,
  DROP_COUNT,
  DROP_RADIUS_MAX,
  DROP_RADIUS_MIN,
  DROP_X,
  E_LABEL_AT,
  E_MANTISSA,
  FALL_SPEED,
  FIELD_LINES,
  GUARANTEED_MULTIPLES,
  HOLE_WIDTH,
  HOVER_Y,
  MAX_MULTIPLE,
  MULTIPLE_WEIGHTS,
  PLATE_GAP,
  PLATE_LEFT,
  PLATE_RIGHT,
  PLATE_THICKNESS,
  SEED,
  SPREAD,
  WEIGHT_REF_LENGTH,
  WEIGHT_REF_RADIUS,
  dropPhaseId,
} from './schema';
import type { MillikanExperimentState } from './state';

export interface MillikanConstants {
  seed: number;
  /** 한 주기에 재는 방울 수 — 시간표의 `drop1` … 단계 수 + 1. */
  dropCount: number;
  /** 눈금을 새기는 가장 큰 배수 · 주기마다 반드시 나오는 배수(1 … 이 값). */
  maxMultiple: number;
  guaranteedMultiples: number;
  /** 배수마다 뽑힐 비중(1e 부터). */
  weights: readonly number[];
  /** 잰 전하의 흩어짐 폭(표준편차, e 단위). */
  spread: number;
  /** e 의 가수 — 화면 글자에 그대로 끼운다. */
  eMantissa: number;
  plateLeft: number;
  plateRight: number;
  plateGap: number;
  plateThickness: number;
  holeWidth: number;
  fieldLines: number;
  dropX: number;
  hoverY: number;
  fallSpeed: number;
  dropRadiusMin: number;
  dropRadiusMax: number;
  weightRefRadius: number;
  weightRefLength: number;
  axisOriginX: number;
  axisY: number;
  axisUnit: number;
  dotRadius: number;
  dotSpacing: number;
  axisOverhang: number;
  eLabel: Vec2;
}

/**
 * 스테이지 상수를 기본값과 함께 읽는다. 배수 비중 목록의 **길이**는 `maxMultiple` 에서
 * 온다 — 스테이지 상수가 수 하나씩뿐이라 목록을 선언할 수 없다 (장부 G105).
 */
export function readConstants(stage: StageDef): MillikanConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const maxMultiple = c.maxMultiple ?? MAX_MULTIPLE;
  const weights: number[] = [];
  for (let n = 1; n <= maxMultiple; n++) weights.push(c[`weight${n}`] ?? MULTIPLE_WEIGHTS[n - 1] ?? 1);
  return {
    seed: c.seed ?? SEED,
    dropCount: c.dropCount ?? DROP_COUNT,
    maxMultiple,
    guaranteedMultiples: Math.min(c.guaranteedMultiples ?? GUARANTEED_MULTIPLES, maxMultiple),
    weights,
    spread: c.spread ?? SPREAD,
    eMantissa: c.eMantissa ?? E_MANTISSA,
    plateLeft: c.plateLeft ?? PLATE_LEFT,
    plateRight: c.plateRight ?? PLATE_RIGHT,
    plateGap: c.plateGap ?? PLATE_GAP,
    plateThickness: c.plateThickness ?? PLATE_THICKNESS,
    holeWidth: c.holeWidth ?? HOLE_WIDTH,
    fieldLines: c.fieldLines ?? FIELD_LINES,
    dropX: c.dropX ?? DROP_X,
    hoverY: c.hoverY ?? HOVER_Y,
    fallSpeed: c.fallSpeed ?? FALL_SPEED,
    dropRadiusMin: c.dropRadiusMin ?? DROP_RADIUS_MIN,
    dropRadiusMax: c.dropRadiusMax ?? DROP_RADIUS_MAX,
    weightRefRadius: c.weightRefRadius ?? WEIGHT_REF_RADIUS,
    weightRefLength: c.weightRefLength ?? WEIGHT_REF_LENGTH,
    axisOriginX: c.axisOriginX ?? AXIS_ORIGIN_X,
    axisY: c.axisY ?? AXIS_Y,
    axisUnit: c.axisUnit ?? AXIS_UNIT,
    dotRadius: c.dotRadius ?? DOT_RADIUS,
    dotSpacing: c.dotSpacing ?? DOT_SPACING,
    axisOverhang: c.axisOverhang ?? AXIS_OVERHANG,
    eLabel: [c.eLabelX ?? E_LABEL_AT[0], c.eLabelY ?? E_LABEL_AT[1]],
  };
}

// ------------------------------------------------------------------------
// 측정 — (seed, 주기) 의 함수
// ------------------------------------------------------------------------

/** 시드를 받는 결정적 난수(mulberry32). 다른 sim 의 것을 가져오지 않는다 (S-sim). */
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

/** 주기 번호를 시드에 섞는 곱수 — 이웃 주기의 난수열이 겹치지 않게 한다. */
const CYCLE_MIX = 0x9e3779b1;

/** 방울 하나의 측정. */
export interface DropDraw {
  /** 방울에 붙은 전하의 배수 n (진짜 전하 = n·e). */
  multiple: number;
  /** 잰 전하(e 단위) = n + 측정 오차. */
  measured: number;
  /** 방울 반지름(월드). */
  radius: number;
  /** 같은 배수 기둥에서 몇 번째로 쌓이는가(0 부터). */
  stack: number;
}

/** 표준 정규 난수 하나(박스-뮐러). */
function gaussian(rand: () => number): number {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** 비중 목록에서 배수 하나(1 부터)를 뽑는다. */
function weightedMultiple(rand: () => number, weights: readonly number[]): number {
  const total = weights.reduce((s, w) => s + Math.max(0, w), 0);
  let r = rand() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= Math.max(0, weights[i]!);
    if (r < 0) return i + 1;
  }
  return weights.length;
}

/**
 * 한 주기의 측정 — 방울마다 배수 · 반지름 · 잰 값. `guaranteedMultiples` 까지의 배수는
 * 반드시 하나씩 들어간다(캡션 「e · 2e · 3e … 자리」 가 모든 주기에서 참이게). 나머지는
 * 비중에서 뽑고, 전체 순서를 섞는다.
 */
export function drawCycle(c: MillikanConstants, cycle: number): DropDraw[] {
  const rand = mulberry32((c.seed ^ Math.imul(cycle + 1, CYCLE_MIX)) >>> 0);
  const multiples: number[] = [];
  for (let n = 1; n <= c.guaranteedMultiples && multiples.length < c.dropCount; n++) multiples.push(n);
  while (multiples.length < c.dropCount) multiples.push(weightedMultiple(rand, c.weights));
  // 피셔-예이츠로 섞는다.
  for (let i = multiples.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [multiples[i], multiples[j]] = [multiples[j]!, multiples[i]!];
  }
  const counts = new Map<number, number>();
  return multiples.map((n) => {
    const stack = counts.get(n) ?? 0;
    counts.set(n, stack + 1);
    return {
      multiple: n,
      measured: n + c.spread * gaussian(rand),
      radius: c.dropRadiusMin + rand() * (c.dropRadiusMax - c.dropRadiusMin),
      stack,
    };
  });
}

// ------------------------------------------------------------------------
// 시간표 → 장치
// ------------------------------------------------------------------------

/** 전압 비율 s = qE/mg (0 → 1). `raise` 동안 곧게 오르고, `clear` 동안 내려간다. */
export function voltageFraction(tl: TimelineFrame): number {
  return tl.at('raise') * (1 - tl.at('clear'));
}

/**
 * 첫 방울의 높이. `fall` 동안 종단 속력 v₀ 로, `raise` 동안 v₀(1 − s) 로 내려와 균형
 * 높이에서 멈춘다. 시작 높이는 멈추는 자리가 `hoverY` 가 되도록 거꾸로 정한다.
 */
export function firstDropY(tl: TimelineFrame, c: MillikanConstants): number {
  const fall = tl.duration('fall');
  const raise = tl.duration('raise');
  const p = tl.at('raise');
  const start = c.hoverY + c.fallSpeed * (fall + raise / 2);
  return start - c.fallSpeed * (fall * tl.at('fall') + raise * (p - (p * p) / 2));
}

/** 무게 화살표 길이(월드) — 반지름의 세제곱에 비례한다. */
export function weightLength(radius: number, c: MillikanConstants): number {
  return c.weightRefLength * (radius / c.weightRefRadius) ** 3;
}

/** 방울 i 의 점이 축으로 날아가는 진행도 0~1. 첫 방울은 `record`, 나머지는 `drop{i}`. */
export function recordProgress(i: number, tl: TimelineFrame): number {
  return i === 0 ? tl.at('record') : tl.at(dropPhaseId(i));
}

/** 지금 장치에 떠 있는 방울 번호 — 점을 찍기 시작한 가장 늦은 방울(아직 없으면 첫 방울). */
export function currentDrop(tl: TimelineFrame, c: MillikanConstants): number {
  let current = 0;
  for (let i = 1; i < c.dropCount; i++) {
    if (tl.u >= tl.start(dropPhaseId(i))) current = i;
  }
  return current;
}

/** 기둥의 첫 점을 축에서 띄우는 몫 — 칸 높이의 반. 점이 축 선에 걸치지 않고 칸 한가운데 앉는다. */
const FIRST_DOT_CELL = 0.5;

/** 잰 전하가 축 위에 앉는 자리 — 가로는 잰 값, 세로는 같은 배수 기둥에서의 순번. */
export function dotTarget(d: DropDraw, c: MillikanConstants): Vec2 {
  return [c.axisOriginX + d.measured * c.axisUnit, c.axisY + c.dotSpacing * (d.stack + FIRST_DOT_CELL)];
}

/** 모든 것이 시각의 함수라 쌓는 것이 없다. */
export function step(params: { state: MillikanExperimentState }): MillikanExperimentState {
  return params.state;
}
