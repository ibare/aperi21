// ========================================================================
// shadow-umbra-penumbra — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 방은 빛 없음(`region` `light: 0`)이라 라이트 · 다크 모두 검다. 그 위의 빛 — 광원 · 빛이 지나는
// 부채 · 반그림자 쐐기 · 스크린의 밝기 — 은 빛 채널로 칠한다. 본그림자 쐐기와 스크린의 본그림자
// 칸은 빛 없음이라 방 바탕과 같다.
//
// 반그림자 쐐기는 가림판 가장자리에서 퍼지는 가는 부채 조각들로 칠한다 — 가장자리를 지나는 한
// 직선 위에서는 보이는 광원의 몫이 같으므로 조각마다 한 세기로 칠해도 참이다.
// 스크린은 가는 가로 띠들로 나눠 띠마다 그 높이에서 보이는 광원의 몫으로 칠한다.
//
// 빛이 아닌 것(스크린 테 · 가림판)은 고정 회색 빛으로 긋는다 (rectilinear-propagation N1 과 같은 까닭).
// 밝기 곡선 · 띠 치수선 · 이름표는 방 밖 테마 바탕에 둔다 (G222).
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { bands, ends, readConstants, sourceWidth, visibleFraction } from './physics';
import {
  BAND_DIM_GAP,
  BAND_LABEL_GAP,
  CURVE_GAP,
  CURVE_HEAD_GAP,
  CURVE_TICK_GAP,
  CURVE_WIDTH,
  NAME_Y,
  PLATE_THICK,
  ROOM,
  SCENE_BOUNDS,
  SCREEN_THICK,
  SOURCE_THICK,
  text,
  type ShadowUmbraPenumbraMessageKey,
} from './schema';
import type { ShadowUmbraPenumbraState } from './state';

/** 광원에서 스크린까지 빛이 지나는 부채의 옅은 빛 세기(광원이 다 보이는 자리). */
const FAN_LIGHT = 0.12;
/** 반그림자 쐐기 한쪽을 나누는 부채 조각 수와, 조각 사이 이음매가 비치지 않게 스크린 쪽에서 겹치는 몫(월드). */
const PENUMBRA_SLICES = 16;
const SLICE_OVERLAP = 0.02;
/** 스크린을 나누는 가로 띠 수와, 띠 사이 틈이 비치지 않게 겹치는 몫(월드). */
const SCREEN_STRIPS = 96;
const STRIP_OVERLAP = 0.01;
/** 밝기 곡선의 표본 수. */
const CURVE_SAMPLES = 181;
/** 네 선의 굵기(화면 px). 빛 세기는 가득 참(1). */
const EDGE_PX = 1.5;
/** 빛이 아닌 것(스크린 테 · 가림판)을 긋는 고정 회색 빛 — 두 테마에서 같은 회색이다. */
const EQUIP_LIGHT = 0.3;
const PLATE_LIGHT = 0.55;
/** 스크린 테 굵기 · 곡선 굵기 · 곡선 축 굵기(화면 px). */
const EQUIP_PX = 1.5;
const CURVE_PX = 2;
const AXIS_PX = 1;
/** 이름표 · 띠 이름표 · 눈금 글자 크기(화면 px). */
const NAME_PX = 12;
const BAND_PX = 13;
const TICK_PX = 11;

const rect = (x0: number, y0: number, x1: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

export function scene(params: {
  state: ShadowUmbraPenumbraState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('shadow-umbra-penumbra: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const w = sourceWidth(c, timeline);
  const e = ends(c, w);
  const b = bands(c, w);
  const sx = c.screenX;
  const back = sx + SCREEN_THICK;
  const S = c.screenHalf;
  const frac = (y: number): number => visibleFraction(c, w, [sx, y]);
  const out: Primitive[] = [];

  // ---- 어두운 방 — 빛 없음. 오른쪽 경계는 스크린 뒷면 ----
  out.push({ type: 'region', id: 'room', points: rect(ROOM.minX, ROOM.minY, back, ROOM.maxY), fillOpacity: 1, light: 0 });

  // ---- 광원에서 스크린까지 빛이 지나는 부채(광원이 다 보이는 세기) ----
  out.push({
    type: 'region',
    id: 'fan',
    points: [e.srcTop, [sx, S], [sx, -S], e.srcBottom],
    fillOpacity: 1,
    light: FAN_LIGHT,
  });

  // ---- 반그림자 쐐기 — 가림판 가장자리에서 퍼지는 조각. 조각마다 보이는 광원의 몫만큼 ----
  const slices = (id: string, apex: Vec2, from: number, to: number): void => {
    for (let i = 0; i < PENUMBRA_SLICES; i++) {
      const y0 = from + ((to - from) * i) / PENUMBRA_SLICES;
      const y1 = from + ((to - from) * (i + 1)) / PENUMBRA_SLICES;
      out.push({
        type: 'region',
        id: `${id}-${i}`,
        points: [apex, [sx, y0 - Math.sign(to - from) * SLICE_OVERLAP], [sx, y1 + Math.sign(to - from) * SLICE_OVERLAP]],
        fillOpacity: 1,
        light: FAN_LIGHT * frac((y0 + y1) / 2),
      });
    }
  };
  slices('penumbra-top', e.plateTop, b.umbraTop, b.outerTop);
  slices('penumbra-bottom', e.plateBottom, b.umbraBottom, b.outerBottom);

  // ---- 본그림자 쐐기 — 광원이 하나도 보이지 않는 자리 ----
  if (b.umbraTop > b.umbraBottom) {
    out.push({
      type: 'region',
      id: 'umbra-wedge',
      points: [e.plateTop, [sx, b.umbraTop], [sx, b.umbraBottom], e.plateBottom],
      fillOpacity: 1,
      light: 0,
    });
  }

  // ---- 네 선 — 광원 끝에서 가림판 가장자리를 스쳐 스크린까지 ----
  // 본그림자 경계(같은 쪽 끝 → 같은 쪽 가장자리)는 실선, 반그림자 바깥 경계(엇갈리는 두 선)는 점선.
  out.push({ type: 'trajectory', id: 'umbra-edge-top', points: [e.srcTop, [sx, b.umbraTop]], width: EDGE_PX, light: 1 });
  out.push({ type: 'trajectory', id: 'umbra-edge-bottom', points: [e.srcBottom, [sx, b.umbraBottom]], width: EDGE_PX, light: 1 });
  out.push({
    type: 'trajectory',
    id: 'outer-edge-top',
    points: [e.srcBottom, [sx, b.outerTop]],
    width: EDGE_PX,
    light: 1,
    style: { lineStyle: 'dashed' },
  });
  out.push({
    type: 'trajectory',
    id: 'outer-edge-bottom',
    points: [e.srcTop, [sx, b.outerBottom]],
    width: EDGE_PX,
    light: 1,
    style: { lineStyle: 'dashed' },
  });

  // ---- 가림판 ----
  out.push({
    type: 'body',
    id: 'plate',
    pos: [c.plateX, c.plateY],
    shape: 'rect',
    size: [PLATE_THICK, c.plateHeight],
    outline: 'none',
    light: PLATE_LIGHT,
  });

  // ---- 스크린 — 가로 띠마다 그 높이에서 보이는 광원의 몫만큼 밝다 ----
  for (let i = 0; i < SCREEN_STRIPS; i++) {
    const y0 = -S + (2 * S * i) / SCREEN_STRIPS;
    const y1 = -S + (2 * S * (i + 1)) / SCREEN_STRIPS;
    out.push({
      type: 'region',
      id: `screen-strip-${i}`,
      points: rect(sx, Math.max(-S, y0 - STRIP_OVERLAP), back, Math.min(S, y1 + STRIP_OVERLAP)),
      fillOpacity: 1,
      light: frac((y0 + y1) / 2),
    });
  }
  out.push({
    type: 'trajectory',
    id: 'screen-rim',
    points: rect(sx, -S, back, S),
    closed: true,
    width: EQUIP_PX,
    light: EQUIP_LIGHT,
  });

  // ---- 광원 — 세로 막대, 폭이 시간표를 따른다 ----
  out.push({
    type: 'body',
    id: 'source',
    pos: c.source,
    shape: 'rect',
    size: [SOURCE_THICK, w],
    outline: 'none',
    light: 1,
  });

  // ---- 방 밖 — 스크린 높이에 맞춘 밝기 곡선(가로 = 보이는 광원의 몫) ----
  const x0 = back + CURVE_GAP;
  const x1 = x0 + CURVE_WIDTH;
  out.push({
    type: 'trajectory',
    id: 'curve-axis-none',
    points: [[x0, -S], [x0, S]],
    width: AXIS_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'curve-axis-all',
    points: [[x1, -S], [x1, S]],
    width: AXIS_PX,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  });
  const curve: Vec2[] = [];
  for (let i = 0; i < CURVE_SAMPLES; i++) {
    const y = -S + (2 * S * i) / (CURVE_SAMPLES - 1);
    curve.push([x0 + CURVE_WIDTH * frac(y), y]);
  }
  out.push({
    type: 'trajectory',
    id: 'curve',
    points: curve,
    width: CURVE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  const label = (
    id: string,
    at: Vec2,
    k: ShadowUmbraPenumbraMessageKey,
    px: number,
    align: 'left' | 'center',
    role: 'ink' | 'muted',
  ): Primitive => ({
    type: 'readout',
    id,
    anchor: { world: at },
    text: text(k),
    chip: false,
    font: 'text',
    align,
    fontSize: px,
    style: { colorRole: role, emphasis: 'strong' },
  });
  out.push(label('curve-head', [(x0 + x1) / 2, S + CURVE_HEAD_GAP], 'label.curve', NAME_PX, 'center', 'muted'));
  out.push(label('tick-none', [x0, S + CURVE_TICK_GAP], 'tick.none', TICK_PX, 'center', 'muted'));
  out.push(label('tick-all', [x1, S + CURVE_TICK_GAP], 'tick.all', TICK_PX, 'center', 'muted'));

  // ---- 곡선 오른쪽 — 본그림자 · 반그림자 띠 치수선과 이름표 ----
  const dx = x1 + BAND_DIM_GAP;
  const top = Math.min(S, b.outerTop);
  const bottom = Math.max(-S, b.outerBottom);
  if (b.umbraTop > b.umbraBottom) {
    out.push({ type: 'dimension', id: 'umbra-band', from: [dx, b.umbraTop], to: [dx, b.umbraBottom], style: { colorRole: 'muted', emphasis: 'strong' } });
  }
  out.push({ type: 'dimension', id: 'penumbra-band-top', from: [dx, top], to: [dx, b.umbraTop], style: { colorRole: 'muted', emphasis: 'strong' } });
  out.push({ type: 'dimension', id: 'penumbra-band-bottom', from: [dx, b.umbraBottom], to: [dx, bottom], style: { colorRole: 'muted', emphasis: 'strong' } });
  out.push(label('name-umbra', [dx + BAND_LABEL_GAP, (b.umbraTop + b.umbraBottom) / 2], 'label.umbra', BAND_PX, 'left', 'ink'));
  out.push(label('name-penumbra', [dx + BAND_LABEL_GAP, (top + b.umbraTop) / 2], 'label.penumbra', BAND_PX, 'left', 'ink'));

  // ---- 방 아래 이름표 ----
  out.push(label('name-source', [c.source[0], NAME_Y], 'label.source', NAME_PX, 'center', 'muted'));
  out.push(label('name-plate', [c.plateX, NAME_Y], 'label.plate', NAME_PX, 'center', 'muted'));
  out.push(label('name-screen', [sx + SCREEN_THICK / 2, NAME_Y], 'label.screen', NAME_PX, 'center', 'muted'));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
