// ========================================================================
// rectilinear-propagation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 방은 빛 없음(`region` `light: 0`)이라 라이트 · 다크 모두 검다. 그 위의 빛 — 광원 ·
// 줄기 · 빛이 지나는 부채 · 스크린의 밝은 칸 — 은 빛 채널로 칠한다. 가림판 뒤 쐐기와
// 스크린의 그림자 칸은 빛 없음이라 방 바탕과 같다: 빛이 들어가지 않은 자리다.
//
// 빛이 아닌 것(스크린 테 · 가림판)은 고정 회색 빛으로 긋는다 — 역할 색 `muted` 는
// 라이트 테마에서 빛 없음 바탕과 거의 같은 짙기라 방 안에서 묻힌다 (NOTES (c)).
// 치수선 · 비 글자 · 이름표는 방 밖 테마 바탕에 둔다 (G222).
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
import { fanRays, plateEdges, plateX, readConstants, shadowEnds, towardSource } from './physics';
import {
  DIM_GAP,
  NAME_Y,
  PLATE_THICK,
  RATIO_GAP,
  ROOM,
  SCENE_BOUNDS,
  SCREEN_THICK,
  SOURCE_R,
  text,
} from './schema';
import type { RectilinearPropagationState } from './state';

/** 광원에서 스크린까지 빛이 지나는 부채의 옅은 빛 세기. */
const FAN_LIGHT = 0.1;
/** 고르게 내보낸 줄기의 빛 세기 · 굵기(화면 px). */
const RAY_LIGHT = 0.45;
const RAY_PX = 1;
/** 가장자리를 스치는 두 선의 굵기(화면 px). 빛 세기는 가득 참(1). */
const EDGE_PX = 2;
/** 빛이 아닌 것(스크린 테 · 가림판)을 긋는 고정 회색 빛 — 두 테마에서 같은 회색이다. */
const EQUIP_LIGHT = 0.3;
const PLATE_LIGHT = 0.55;
/** 스크린 테 굵기(화면 px). */
const EQUIP_PX = 1.5;
/** 이름표 · 비 글자 크기(화면 px). */
const NAME_PX = 12;
const RATIO_PX = 13;

const rect = (x0: number, y0: number, x1: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

export function scene(params: {
  state: RectilinearPropagationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('rectilinear-propagation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const px = plateX(c, towardSource(timeline));
  const edge = plateEdges(c, px);
  const shadow = shadowEnds(c, px);
  const sx = c.screenX;
  const back = sx + SCREEN_THICK;
  const out: Primitive[] = [];

  // ---- 어두운 방 — 빛 없음. 오른쪽 경계는 스크린 뒷면 ----
  out.push({ type: 'region', id: 'room', points: rect(ROOM.minX, ROOM.minY, back, ROOM.maxY), fillOpacity: 1, light: 0 });

  // ---- 광원에서 스크린까지 빛이 지나는 부채 ----
  out.push({
    type: 'region',
    id: 'fan',
    points: [c.source, [sx, c.screenHalf], [sx, -c.screenHalf]],
    fillOpacity: 1,
    light: FAN_LIGHT,
  });

  // ---- 가림판 뒤 쐐기 — 빛이 들어가지 않은 자리. 가장자리를 스친 두 선 사이 ----
  out.push({
    type: 'region',
    id: 'shadow-wedge',
    points: [edge.top, [sx, shadow.top], [sx, shadow.bottom], edge.bottom],
    fillOpacity: 1,
    light: 0,
  });

  // ---- 고르게 내보낸 줄기 — 가림판에 걸린 것은 거기서 끝난다 ----
  const rays = fanRays(c, px, PLATE_THICK);
  out.push({
    type: 'lineSet',
    id: 'rays',
    lines: rays.map((r) => [r.from, r.to]),
    width: RAY_PX,
    light: RAY_LIGHT,
  });

  // ---- 가장자리를 스치는 두 곧은 선 — 스크린에서 그림자 끝을 정한다 ----
  out.push({ type: 'trajectory', id: 'edge-top', points: [c.source, [sx, shadow.top]], width: EDGE_PX, light: 1 });
  out.push({ type: 'trajectory', id: 'edge-bottom', points: [c.source, [sx, shadow.bottom]], width: EDGE_PX, light: 1 });

  // ---- 가림판 ----
  out.push({
    type: 'body',
    id: 'plate',
    pos: [px, c.plateY],
    shape: 'rect',
    size: [PLATE_THICK, c.plateHeight],
    outline: 'none',
    light: PLATE_LIGHT,
  });

  // ---- 스크린 — 빛이 닿은 칸은 밝고, 그림자 칸은 빛 없음 ----
  const hi = Math.min(c.screenHalf, shadow.top);
  const lo = Math.max(-c.screenHalf, shadow.bottom);
  if (hi < c.screenHalf) {
    out.push({ type: 'region', id: 'screen-lit-top', points: rect(sx, hi, back, c.screenHalf), fillOpacity: 1, light: 1 });
  }
  if (lo > -c.screenHalf) {
    out.push({ type: 'region', id: 'screen-lit-bottom', points: rect(sx, -c.screenHalf, back, lo), fillOpacity: 1, light: 1 });
  }
  out.push({
    type: 'trajectory',
    id: 'screen-rim',
    points: rect(sx, -c.screenHalf, back, c.screenHalf),
    closed: true,
    width: EQUIP_PX,
    light: EQUIP_LIGHT,
  });

  // ---- 점광원 ----
  out.push({ type: 'body', id: 'source', pos: c.source, shape: 'circle', size: SOURCE_R, outline: 'none', glow: true, light: 1 });

  // ---- 방 밖 — 그림자 치수선과 비 글자 ----
  const dimX = back + DIM_GAP;
  out.push({
    type: 'dimension',
    id: 'shadow-size',
    from: [dimX, shadow.top],
    to: [dimX, shadow.bottom],
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  // 비는 멈춘 두 자리에서만 띄운다 — 옮기는 동안의 비는 선언값이 아니다 (S-piece 유효숫자).
  const k = timeline.phase === 'far' ? state.kFar : timeline.phase === 'near' ? state.kNear : undefined;
  if (k !== undefined) {
    out.push({
      type: 'readout',
      id: 'shadow-ratio',
      anchor: { world: [dimX + RATIO_GAP, (shadow.top + shadow.bottom) / 2] },
      text: text('label.ratio'),
      vars: { k },
      chip: false,
      font: 'text',
      align: 'left',
      fontSize: RATIO_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 방 아래 이름표 ----
  const name = (id: string, x: number, key: 'label.source' | 'label.plate' | 'label.screen'): Primitive => ({
    type: 'readout',
    id,
    anchor: { world: [x, NAME_Y] },
    text: text(key),
    chip: false,
    font: 'text',
    align: 'center',
    fontSize: NAME_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push(name('name-source', c.source[0], 'label.source'));
  out.push(name('name-plate', px, 'label.plate'));
  out.push(name('name-screen', sx + SCREEN_THICK / 2, 'label.screen'));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
