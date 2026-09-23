// ========================================================================
// thin-lens — 순수 물리
// ========================================================================
// 상 자리는 plugin-optics 의 `findImage` 한 곳에서만 나온다. 세 광선의 렌즈 뒤
// 부분도 **그 점을 지나도록** 이어 붙인다 — 광선을 `traceRay` 로 따로 쏘면
// 비스듬한 줄기에 1/cosθ 오차가 나서 셋이 만나는 자리가 상 점에서 미세하게
// 어긋난다. 이 조각의 주장이 바로 그 만남이므로 계산을 한쪽으로 통일한다.
//
// 그래도 작도는 성립한다 — 얇은 렌즈에서
//   · (0, h) 에서 상 끝으로 가는 선은 뒤쪽 초점 (f, 0) 을 지나고
//   · 물체 끝에서 앞쪽 초점 (−f, 0) 을 지나는 선은 렌즈를 상 높이에서 만난다
// 는 것이 결상식 1/v = 1/f − 1/u 와 같은 말이기 때문이다.
// ========================================================================

import type { OpticalElement, StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { findImage } from '@aperi21/plugin-optics';
import {
  AXIS_Y,
  FOCAL_LENGTH,
  LENS_SIZE,
  LENS_X,
  OBJECT_DISTANCE,
  OBJECT_HEIGHT,
  RAY_END_X,
} from './schema';
import type { ThinLensState } from './state';

export interface ThinLensConstants {
  /** 초점 거리 f(m). */
  focalLength: number;
  /** 물체 거리 u(m). 렌즈 앞쪽으로 잰다. */
  objectDistance: number;
  /** 물체 화살표의 높이(m). */
  objectHeight: number;
}

/** 주장이 기대는 물리량은 `stages[].constants` 에서 읽는다 (원칙 2). */
export function readConstants(stage: StageDef): ThinLensConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    focalLength: c.focalLength ?? FOCAL_LENGTH,
    objectDistance: c.objectDistance ?? OBJECT_DISTANCE,
    objectHeight: c.objectHeight ?? OBJECT_HEIGHT,
  };
}

/**
 * 렌즈 선언. 화면에 그리는 것과 `findImage` 에 넘기는 것이 **같은 하나**다 —
 * 둘을 따로 만들면 저작자가 초점 거리를 바꿨을 때 그림과 계산이 갈린다.
 *
 * `orientation` 은 표면 법선의 각이다. 0 이면 법선이 +x 를 향해 렌즈가 세로로 선다.
 */
export function buildLens(c: ThinLensConstants): OpticalElement {
  return {
    id: 'lens',
    type: 'opticalElement',
    subtype: 'lens-convex',
    pos: [LENS_X, AXIS_Y],
    orientation: 0,
    size: LENS_SIZE,
    focalLength: c.focalLength,
  };
}

export interface Construction {
  /** 물체 끝(광축 위). */
  objectTip: Vec2;
  /** 상 끝 — 세 광선이 만나는 점이다. */
  imageTip: Vec2;
  /** 상이 선 자리의 광축 위 점. */
  imageFoot: Vec2;
  /** 앞쪽 초점 F · 뒤쪽 초점 F′. */
  focusNear: Vec2;
  focusFar: Vec2;
  /** 세 표준 광선의 경로. 순서는 평행 · 가운데 · 초점. */
  rays: readonly Vec2[][];
}

/** 선분 a→b 를 이어 x = atX 인 자리까지 늘린 점. */
function extendToX(a: Vec2, b: Vec2, atX: number): Vec2 {
  const dx = b[0] - a[0];
  // 렌즈가 세로로 서 있고 물체가 축 위에 있으므로 dx 는 언제나 0 이 아니다.
  const k = (atX - a[0]) / dx;
  return [atX, a[1] + (b[1] - a[1]) * k];
}

/**
 * 한 시각의 작도 전체. 상 끝을 `findImage` 로 한 번 구하고, 세 광선의 렌즈 뒤
 * 부분을 모두 그 점에 꽂는다.
 */
export function buildConstruction(c: ThinLensConstants): Construction {
  const lens = buildLens(c);
  const objectTip: Vec2 = [LENS_X - c.objectDistance, AXIS_Y + c.objectHeight];
  const image = findImage(objectTip, lens);
  if (!image) {
    throw new Error('thin-lens: 물체가 초점 위에 있어 상이 맺히지 않는다 (objectDistance ≠ focalLength)');
  }
  const imageTip = image.position as Vec2;
  const imageFoot: Vec2 = [imageTip[0], AXIS_Y];
  const focusNear: Vec2 = [LENS_X - c.focalLength, AXIS_Y];
  const focusFar: Vec2 = [LENS_X + c.focalLength, AXIS_Y];

  // 축에 평행하게 가서 렌즈에서 꺾인다. 꺾인 뒤의 선은 상 끝을 지나는데, 그 선이
  // 곧 뒤쪽 초점 F′ 를 지나는 선이다.
  const lensHitParallel: Vec2 = [LENS_X, objectTip[1]];
  // 렌즈 한가운데를 곧게 지난다.
  const lensHitCenter: Vec2 = [LENS_X, AXIS_Y];
  // 앞쪽 초점 F 를 지나 와 렌즈를 상 높이에서 만나고, 거기서부터 축에 평행해진다.
  const lensHitFocal: Vec2 = [LENS_X, imageTip[1]];

  return {
    objectTip,
    imageTip,
    imageFoot,
    focusNear,
    focusFar,
    rays: [
      [objectTip, lensHitParallel, extendToX(lensHitParallel, imageTip, RAY_END_X)],
      [objectTip, lensHitCenter, extendToX(lensHitCenter, imageTip, RAY_END_X)],
      [objectTip, lensHitFocal, [RAY_END_X, imageTip[1]]],
    ],
  };
}

/**
 * 폴리라인을 앞에서부터 `frac`(0~1) 만큼만 남긴다. 광선이 물체 끝에서부터
 * 자라나는 것이 이 조각의 동사라, 자라는 길이는 **꺾인 마디가 아니라 길이**로
 * 잰다 — 마디로 나누면 짧은 마디에서 앞머리가 튄다.
 */
export function growPolyline(points: readonly Vec2[], frac: number): Vec2[] {
  if (frac <= 0 || points.length < 2) return [];
  if (frac >= 1) return points.map((p) => [p[0], p[1]] as Vec2);
  let total = 0;
  for (let i = 1; i < points.length; i++) total += Math.hypot(points[i]![0] - points[i - 1]![0], points[i]![1] - points[i - 1]![1]);
  const want = total * frac;
  const out: Vec2[] = [[points[0]![0], points[0]![1]]];
  let walked = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const segment = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (walked + segment >= want) {
      const k = segment > 0 ? (want - walked) / segment : 0;
      out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
      return out;
    }
    out.push([b[0], b[1]]);
    walked += segment;
  }
  return out;
}

/**
 * 광선 셋이 지금 어디까지 자랐는가(0~1). 그어지는 동안은 그 단계의 진행도이고,
 * 거두는 동안은 함께 0 으로 돌아간다.
 *
 * 광선을 옅게 지우지 못해 **거둔다** — plugin 의 `ray` 는 `opacity` 를 따르지
 * 않는다 (장부 G218). 나머지 그림은 `sceneOpacity` 로 옅어진다.
 */
export function rayFractions(tl: TimelineFrame): readonly number[] {
  const back = 1 - tl.at('fade');
  return [
    tl.at('draw-parallel') * back,
    tl.at('draw-center') * back,
    tl.at('draw-focal') * back,
  ];
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 다시 세운다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ThinLensState }): ThinLensState {
  return params.state;
}
