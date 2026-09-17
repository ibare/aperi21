// ========================================================================
// thermal-convection — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 온도장(scalarField) · 바닥 · 천장 띠(scalarField 1 칸) · 이름표(readout) · 흐름 입자(particleSystem)
// · 덩어리 자취(lineSet 굵기 세 벌) · 덩어리 속(body, 지닌 온도만큼의 빛) · 덩어리 고리(trajectory).
// 겹침은 원본의 그리는 순서 그대로다 (`drawOrder: 'scene'`). 캡션은 슬롯이 그린다.
//
// **색은 온도 하나만 뜻한다.** 장 · 띠 · 덩어리 속이 모두 같은 사상(온도^`TEMP_CURVE` → 바탕~`primary`, 선형광)을 쓴다.
// 강조색은 따라가는 덩어리 하나(고리 · 자취)에만.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  Vec2,
  StageDef,
  ViewDef,
} from '@aperi21/schema';

import { NX, NY, T_COLD, T_HOT, velocity } from './physics';
import {
  BOX_W,
  PARCEL_STYLE,
  PX,
  SCENE_BOUNDS,
  TEMP_CURVE,
  TRACER_STYLE,
  WALL,
  WALL_LABEL,
  X_STRETCH,
  text,
} from './schema';
import type { ThermalConvectionState } from './state';

/** 원본 좌표 → 월드. */
const world = (p: Vec2): Vec2 => [p[0] * X_STRETCH, p[1]];

/** 온도 → 색 사상. 장 · 띠 · 덩어리 속이 모두 이것 하나를 쓴다. */
const TEMP_COLORS = { high: 'primary' } as const;
const TEMP_RANGE: [number, number] = [T_COLD, T_HOT];
/** 온도 → 칠하는 값. 장 · 띠 · 덩어리 속이 같은 곡선을 지난다 (`TEMP_CURVE`). */
const shade = (temp: number): number => Math.pow(Math.max(0, Math.min(1, temp)), TEMP_CURVE);

export function scene(params: {
  state: ThermalConvectionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const { state } = params;
  const out: Primitive[] = [];
  const box = { min: [0, 0] as Vec2, max: [BOX_W, 1] as Vec2 };

  // ---- 온도장 ----
  // 렌더러는 첫 행이 위다. 상태는 첫 행이 바닥이므로 뒤집는다.
  const values: number[] = new Array(NX * NY);
  for (let j = 0; j < NY; j++) {
    const src = (NY - 1 - j) * NX;
    for (let i = 0; i < NX; i++) values[j * NX + i] = shade(state.field[src + i]!);
  }
  out.push({
    type: 'scalarField',
    id: 'temperature',
    min: box.min,
    max: box.max,
    cols: NX,
    rows: NY,
    values,
    range: TEMP_RANGE,
    colors: TEMP_COLORS,
  });

  // ---- 뜨거운 바닥 · 차가운 천장 ----
  // 온도 색 띠의 양 끝. 장과 같은 사상으로 칠하려고 칸 하나짜리 장으로 둔다.
  out.push({
    type: 'scalarField',
    id: 'hot-floor',
    min: [0, -WALL],
    max: [BOX_W, 0],
    cols: 1,
    rows: 1,
    values: [shade(T_HOT)],
    range: TEMP_RANGE,
    colors: TEMP_COLORS,
  });
  out.push({
    type: 'readout',
    id: 'hot-floor-label',
    anchor: { world: [WALL_LABEL.insetPx / PX, -WALL / 2] },
    text: text('label.hotFloor'),
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: WALL_LABEL.fontPx,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'scalarField',
    id: 'cold-ceiling',
    min: [0, 1],
    max: [BOX_W, 1 + WALL],
    cols: 1,
    rows: 1,
    values: [shade(T_COLD)],
    range: TEMP_RANGE,
    colors: TEMP_COLORS,
  });
  out.push({
    type: 'readout',
    id: 'cold-ceiling-label',
    anchor: { world: [WALL_LABEL.insetPx / PX, 1 + WALL / 2] },
    text: text('label.coldCeiling'),
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: WALL_LABEL.fontPx,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 흐름 표시 입자 ----
  // 속도 방향으로 짧은 꼬리. 꼬리가 1 px 보다 짧으면 원본은 2 px 점만 찍는다 — 점을 늘 두면
  // 꼬리 끝의 둥근 마개와 겹쳐 같은 모양이 된다.
  out.push({
    type: 'particleSystem',
    id: 'tracers',
    positions: state.tracers.map(world),
    velocities: state.tracers.map((p) => {
      const v = velocity(state.amp, p[0], p[1], state.t);
      return [v[0] * X_STRETCH, v[1]] as Vec2;
    }),
    sizes: TRACER_STYLE.dotRadiusPx,
    trail: true,
    trailStyle: { seconds: TRACER_STYLE.seconds, width: TRACER_STYLE.width, opacity: 1 },
    opacity: TRACER_STYLE.opacity,
    clip: box,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 따라가는 덩어리의 자취 ----
  // 원본은 선분마다 굵기(1 + 1.5a)와 짙기(0.05 + 0.55a)가 다르다. 선 묶음은 굵기가 하나라
  // 굵기를 세 벌로 나누고, 짙기는 선분별 `opacities` 로 둔다.
  const tr = state.trail;
  const bands = PARCEL_STYLE.trailWidthBands;
  const bandLines: Vec2[][][] = Array.from({ length: bands }, () => []);
  const bandAlphas: number[][] = Array.from({ length: bands }, () => []);
  for (let k = 1; k < tr.length; k++) {
    const a = k / tr.length;
    const b = Math.min(bands - 1, Math.floor(a * bands));
    bandLines[b]!.push([world(tr[k - 1]!), world(tr[k]!)]);
    bandAlphas[b]!.push(PARCEL_STYLE.trailAlphaMin + PARCEL_STYLE.trailAlphaGain * a);
  }
  for (let b = 0; b < bands; b++) {
    out.push({
      type: 'lineSet',
      id: `parcel-trail-${b}`,
      lines: bandLines[b]!,
      opacities: bandAlphas[b]!,
      width: PARCEL_STYLE.trailWidthMin + (PARCEL_STYLE.trailWidthGain * (b + 0.5)) / bands,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 따라가는 덩어리 ----
  // 속은 덩어리가 지닌 온도 — 장과 같은 사상(바탕과 `primary` 를 선형광으로 섞음)이라 `luminance` 로 둔다.
  const center = world(state.parcel);
  const r = PARCEL_STYLE.radiusPx / PX;
  out.push({
    type: 'body',
    id: 'parcel',
    pos: center,
    shape: 'circle',
    size: r,
    outline: 'none',
    glow: false,
    luminance: shade(state.parcelTemp),
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  // 고리. `body` 둘레는 굵기를 고를 수 없어 닫힌 궤적으로 긋는다.
  const ring: Vec2[] = [];
  for (let k = 0; k < PARCEL_STYLE.ringSegments; k++) {
    const th = (k / PARCEL_STYLE.ringSegments) * Math.PI * 2;
    ring.push([center[0] + r * Math.cos(th), center[1] + r * Math.sin(th)]);
  }
  out.push({
    type: 'trajectory',
    id: 'parcel-ring',
    points: ring,
    closed: true,
    width: PARCEL_STYLE.ringWidth,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): Bounds {
  // 고정 경계 — 원본 캔버스 + 캡션 · 조작기 줄. 매 프레임 같은 값이다.
  return { ...SCENE_BOUNDS };
}
