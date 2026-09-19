// ========================================================================
// pinhole-camera — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽은 옆에서 본 어두운 방(`region` `light: 0`) — 촛불 · 앞벽의 바늘구멍 · 뒷벽. 촛불의
// 위 점(불꽃)과 아래 점(밑동)에서 줄기가 나가 구멍에서 엇갈리고, 뒷벽에 닿은 자리가 밝다.
// 오른쪽은 그 뒷벽을 정면에서 본 판 — 거꾸로 선 촛불 상이 맺힌다. 한 점의 빛이 번지는
// 원판 위에 상의 사본을 고르게 흩어 옅게 겹치므로, 구멍이 크면 윤곽이 번지고 빛이 많으면
// 밝다. 그 옆 막대가 들어오는 빛의 양이다.
//
// 빛이 아닌 것(상자 벽 · 판 테)은 고정 회색 빛으로 긋는다 — 역할 색 `muted` 는 라이트
// 테마에서 빛 없음 바탕과 거의 같은 짙기라 방 안에서 묻힌다 (NOTES (c)).
// 괄호 · 이름표는 방 밖 테마 바탕에 둔다 (G222).
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
import {
  blurDiameter,
  blurOffsets,
  fanRays,
  heightAt,
  holeEdges,
  holeWidth,
  imageBrightness,
  readConstants,
  shrinkRatio,
  toImage,
  wallPatch,
} from './physics';
import {
  BAR_HALF,
  BAR_X,
  DIM_GAP,
  FACE_HALF,
  FACE_X,
  FRONT_THICK,
  NAME_Y,
  ROOM,
  SCENE_BOUNDS,
  WALL_THICK,
  text,
  type PinholeCameraMessageKey,
} from './schema';
import type { PinholeCameraState } from './state';

/** 고르게 내보낸 줄기의 빛 세기 · 굵기(화면 px). */
const RAY_LIGHT = 0.4;
const RAY_PX = 1;
/** 구멍 가장자리를 스치는 두 선의 굵기(화면 px). 빛 세기는 가득 참(1). */
const EDGE_PX = 1.5;
/** 빛이 아닌 것(상자 윗 · 아랫벽 · 판 테)을 긋는 고정 회색 빛과, 앞벽을 칠하는 조금 밝은 회색 빛. */
const EQUIP_LIGHT = 0.3;
const FRONT_LIGHT = 0.55;
/** 상자 벽 · 판 테 굵기(화면 px). */
const EQUIP_PX = 1.5;
/** 뒷벽 조각의 빛 세기 — 한 점의 빛이 닿은 자리. */
const PATCH_LIGHT = 1;
/**
 * 정면 판에 겹치는 상 사본의 수와 사본 하나의 불투명도, 불꽃 둘레를 자르는 변의 수. 그림의 결이지 물리량이 아니다.
 * 사본을 빛으로 더하지(`blend: 'add'`) 않고 같은 빛을 옅게 덮는다 — 옅은 사본 수십 장을 더하면 성분마다
 * 반올림이 쌓여 다크에서 상이 초록빛으로 물들었다. 모두 겹친 자리는 사본 빛의 약 95% 에 이른다.
 */
const BLUR_SAMPLES = 60;
const COPY_OPACITY = 0.05;
const FLAME_SIDES = 20;
/** 막대의 채움을 칸 안쪽으로 들이는 폭(월드) — 가득 차도 빛 없음 테가 남아 빈 칸으로 읽히지 않는다 (G92). */
const BAR_INSET = 0.05;
/** 이름표 글자 크기(화면 px). */
const NAME_PX = 12;

const rect = (x0: number, y0: number, x1: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

const circle = (cx: number, cy: number, r: number): Vec2[] =>
  Array.from({ length: FLAME_SIDES }, (_, i): Vec2 => {
    const th = (2 * Math.PI * i) / FLAME_SIDES;
    return [cx + r * Math.cos(th), cy + r * Math.sin(th)];
  });

export function scene(params: {
  state: PinholeCameraState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('pinhole-camera: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const w = holeWidth(c, timeline);
  const edge = holeEdges(c, w);
  const back = c.wallX + WALL_THICK;
  const frontX = c.pinholeX - FRONT_THICK / 2;
  const points: readonly (readonly [string, number])[] = [
    ['flame', c.flameY],
    ['base', c.baseY],
  ];
  const out: Primitive[] = [];

  // ---- 어두운 방 — 빛 없음. 오른쪽 경계는 뒷벽 뒷면 ----
  out.push({ type: 'region', id: 'room', points: rect(ROOM.minX, ROOM.minY, back, ROOM.maxY), fillOpacity: 1, light: 0 });

  // ---- 두 점에서 고르게 내보낸 줄기 — 구멍을 지난 것만 뒷벽까지 ----
  for (const [id, y] of points) {
    out.push({
      type: 'lineSet',
      id: `rays-${id}`,
      lines: fanRays(c, y, w, frontX).map((r) => [r.from, r.to]),
      width: RAY_PX,
      light: RAY_LIGHT,
    });
  }

  // ---- 구멍 가장자리를 스치는 두 선 — 한 점의 빛이 뒷벽에 닿는 범위를 정한다 ----
  for (const [id, y] of points) {
    const p: Vec2 = [c.objectX, y];
    for (const [side, through] of [
      ['top', edge.top],
      ['bottom', edge.bottom],
    ] as const) {
      out.push({
        type: 'trajectory',
        id: `edge-${id}-${side}`,
        points: [p, [c.wallX, heightAt(p, through, c.wallX)]],
        width: EDGE_PX,
        light: 1,
      });
    }
  }

  // ---- 상자 — 앞벽(구멍 위 · 아래 두 조각)과 윗 · 아랫벽 ----
  out.push({
    type: 'region',
    id: 'front-upper',
    points: rect(frontX, edge.top[1], frontX + FRONT_THICK, c.boxHalf),
    fillOpacity: 1,
    light: FRONT_LIGHT,
  });
  out.push({
    type: 'region',
    id: 'front-lower',
    points: rect(frontX, -c.boxHalf, frontX + FRONT_THICK, edge.bottom[1]),
    fillOpacity: 1,
    light: FRONT_LIGHT,
  });
  for (const [id, y] of [
    ['box-top', c.boxHalf],
    ['box-bottom', -c.boxHalf],
  ] as const) {
    out.push({ type: 'trajectory', id, points: [[frontX, y], [back, y]], width: EQUIP_PX, light: EQUIP_LIGHT });
  }

  // ---- 촛불 — 몸통과 불꽃 ----
  out.push({
    type: 'region',
    id: 'candle',
    points: rect(c.objectX - c.candleHalfWidth, c.baseY, c.objectX + c.candleHalfWidth, c.candleTopY),
    fillOpacity: 1,
    light: c.candleLight,
  });
  out.push({
    type: 'body',
    id: 'flame',
    pos: [c.objectX, c.flameY],
    shape: 'circle',
    size: c.flameR,
    outline: 'none',
    glow: true,
    light: 1,
  });

  // ---- 뒷벽 — 두 점의 빛이 닿은 조각은 밝다 ----
  for (const [id, y] of points) {
    const patch = wallPatch(c, y, w);
    out.push({
      type: 'region',
      id: `patch-${id}`,
      points: rect(c.wallX, patch.lo, back, patch.hi),
      fillOpacity: 1,
      light: PATCH_LIGHT,
    });
  }
  out.push({
    type: 'trajectory',
    id: 'wall-rim',
    points: rect(c.wallX, -c.boxHalf, back, c.boxHalf),
    closed: true,
    width: EQUIP_PX,
    light: EQUIP_LIGHT,
  });

  // ---- 방 밖 — 불꽃 조각의 흐림 폭 괄호 ----
  const flamePatch = wallPatch(c, c.flameY, w);
  out.push({
    type: 'dimension',
    id: 'blur-width',
    from: [back + DIM_GAP, flamePatch.hi],
    to: [back + DIM_GAP, flamePatch.lo],
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 뒷벽을 정면에서 본 판 — 번짐 원판 위에 옅게 겹친 상 사본 ----
  out.push({
    type: 'region',
    id: 'face',
    points: rect(FACE_X - FACE_HALF, -c.boxHalf, FACE_X + FACE_HALF, c.boxHalf),
    fillOpacity: 1,
    light: 0,
  });
  const bright = imageBrightness(c, w);
  const m = shrinkRatio(c);
  const bodyLo = toImage(c, c.candleHalfWidth, c.candleTopY);
  const bodyHi = toImage(c, -c.candleHalfWidth, c.baseY);
  const flameAt = toImage(c, 0, c.flameY);
  const offsets = blurOffsets(blurDiameter(c, w), BLUR_SAMPLES);
  offsets.forEach(([ox, oy], i) => {
    const x = FACE_X + ox;
    out.push({
      type: 'region',
      id: `image-body-${i}`,
      points: rect(x + bodyLo[0], oy + bodyLo[1], x + bodyHi[0], oy + bodyHi[1]),
      fillOpacity: 1,
      light: bright * c.candleLight,
      opacity: COPY_OPACITY,
    });
    out.push({
      type: 'region',
      id: `image-flame-${i}`,
      points: circle(x + flameAt[0], oy + flameAt[1], c.flameR * m),
      fillOpacity: 1,
      light: bright,
      opacity: COPY_OPACITY,
    });
  });
  out.push({
    type: 'trajectory',
    id: 'face-rim',
    points: rect(FACE_X - FACE_HALF, -c.boxHalf, FACE_X + FACE_HALF, c.boxHalf),
    closed: true,
    width: EQUIP_PX,
    light: EQUIP_LIGHT,
  });

  // ---- 들어오는 빛 막대 — 빛 없음 칸에 빛이 차오른 높이 ----
  const barLo = -c.boxHalf;
  const fill = c.imageLight > 0 ? Math.min(1, bright / c.imageLight) : 0;
  out.push({
    type: 'region',
    id: 'bar-slot',
    points: rect(BAR_X - BAR_HALF, barLo, BAR_X + BAR_HALF, c.boxHalf),
    fillOpacity: 1,
    light: 0,
  });
  out.push({
    type: 'region',
    id: 'bar-fill',
    points: rect(
      BAR_X - BAR_HALF + BAR_INSET,
      barLo + BAR_INSET,
      BAR_X + BAR_HALF - BAR_INSET,
      barLo + BAR_INSET + (2 * c.boxHalf - 2 * BAR_INSET) * fill,
    ),
    fillOpacity: 1,
    light: 1,
  });
  out.push({
    type: 'trajectory',
    id: 'bar-rim',
    points: rect(BAR_X - BAR_HALF, barLo, BAR_X + BAR_HALF, c.boxHalf),
    closed: true,
    width: EQUIP_PX,
    light: EQUIP_LIGHT,
  });

  // ---- 방 아래 이름표 ----
  const name = (id: string, x: number, key: PinholeCameraMessageKey): Primitive => ({
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
  out.push(name('name-candle', c.objectX, 'label.candle'));
  out.push(name('name-pinhole', c.pinholeX, 'label.pinhole'));
  out.push(name('name-wall', c.wallX + WALL_THICK / 2, 'label.wall'));
  out.push(name('name-face', FACE_X, 'label.face'));
  out.push(name('name-bar', BAR_X, 'label.bar'));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
