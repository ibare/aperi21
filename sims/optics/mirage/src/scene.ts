// ========================================================================
// mirage — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 줄기는 역할 색 `ink` 로 긋는다. 주장은 빛의 **경로**(휘어 오름)와 **방향**이지 밝기가 아니다 —
// 빛 채널의 흰 줄기는 라이트 바탕에서 사라진다(G92).
//
// 색: 줄기 · 빛 알갱이 · 눈은 먹색. 뜨거운 공기층은 옅은 무채색 한 역할의 명암(길에 가까울수록
// 짙다 = 더 뜨겁다). 하늘 조각과 땅 아래 보이는 하늘은 **같은 대상**이라 같은 보조색이다.
// 강조색은 **눈이 거슬러 보는 방향**(점선 연장) 한 가지 뜻에만 쓴다.
//
// 겹침 순서는 scene 에 쓴 순서다(`drawOrder: 'scene'`) — 층 칠(region)이 기본 층에서는 줄기 위에
// 덮이므로, 길 · 층 · 하늘 조각을 먼저 깔고 줄기 · 점선 · 눈을 그 위에 둔다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { pathUpTo, readConstants, seenAt, tracePath } from './physics';
import {
  EYE_R,
  EYE_X,
  EYE_Y,
  LAYER_LABEL_X,
  PATCH_HALF_H,
  PATCH_HALF_W,
  ROAD_DEPTH,
  ROAD_HALF,
  SCENE_BOUNDS,
  text,
  type MirageMessageKey,
} from './schema';
import type { MirageState } from './state';

/** 선 굵기(화면 px) — 줄기 · 점선 연장 · 층 경계 · 줄기 위 화살표. */
const RAY_WIDTH_PX = 2.5;
const BACK_WIDTH_PX = 2;
const LAYER_LINE_PX = 1;
/** 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 이름표를 앵커에서 띄우는 거리(화면 px). */
const LABEL_GAP_PX = 10;
/** 아래로 매다는 이름표(길 · 보이는 하늘)의 띄움(화면 px) — 글자 높이만큼 더 내려야 선에 붙지 않는다. */
const LABEL_DROP_PX = 20;
/** 빛 알갱이 반지름(월드). */
const PULSE_R = 0.09;
/** 줄기 위 방향 화살표의 길이(월드)와 자리(그 토막 길이에 대한 몫). */
const ARROW_LEN = 0.42;
const ARROW_AT = 0.5;
/** 불투명도 — 가장 뜨거운 층의 칠 · 층 경계선 · 하늘 조각 칠 · 길 면 칠. */
const HOT_FILL_MAX = 0.5;
const LAYER_LINE_OPACITY = 0.6;
const PATCH_FILL = 0.55;
const ROAD_FILL = 0.12;

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const hot = { colorRole: 'muted', emphasis: 'strong' } as const;
const sky = { colorRole: 'secondary', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

function label(
  id: string,
  key: MirageMessageKey,
  world: Vec2,
  opts: { offset?: Vec2; align?: Readout['align']; opacity?: number; role?: 'ink' | 'muted' | 'secondary'; chip?: boolean },
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world, ...(opts.offset ? { offset: opts.offset } : {}) },
    text: text(key),
    chip: opts.chip ?? false,
    font: 'text',
    align: opts.align ?? 'left',
    fontSize: LABEL_PX,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    style: { colorRole: opts.role ?? 'ink', emphasis: 'strong' },
  };
}

function patch(id: string, center: Vec2, opacity: number): Primitive {
  const [cx, cy] = center;
  return {
    type: 'region',
    id,
    points: [
      [cx - PATCH_HALF_W, cy - PATCH_HALF_H],
      [cx + PATCH_HALF_W, cy - PATCH_HALF_H],
      [cx + PATCH_HALF_W, cy + PATCH_HALF_H],
      [cx - PATCH_HALF_W, cy + PATCH_HALF_H],
    ],
    fillOpacity: PATCH_FILL,
    opacity,
    style: sky,
  };
}

function arrowOn(id: string, a: Vec2, b: Vec2, opacity: number): Primitive {
  // 토막 a→b 의 가운데쯤에 진행 방향 화살표.
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const d: Vec2 = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  const mx = a[0] + (b[0] - a[0]) * ARROW_AT;
  const my = a[1] + (b[1] - a[1]) * ARROW_AT;
  return {
    type: 'vector',
    id,
    from: [mx - (d[0] * ARROW_LEN) / 2, my - (d[1] * ARROW_LEN) / 2],
    delta: [d[0] * ARROW_LEN, d[1] * ARROW_LEN],
    width: RAY_WIDTH_PX,
    opacity,
    style: ink,
  };
}

export function scene(params: {
  state: MirageState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('mirage: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const path = tracePath(c);
  const h = c.hotDepth / c.layers;
  const g: Primitive[] = [];

  // 주기 끝에서 줄기 · 점선 · 보이는 하늘이 함께 옅어진다.
  const fade = 1 - tl.at('reset');

  // ---- 길 면 · 길바닥 ----
  g.push({
    type: 'region',
    id: 'road',
    points: [
      [-ROAD_HALF, 0],
      [ROAD_HALF, 0],
      [ROAD_HALF, -ROAD_DEPTH],
      [-ROAD_HALF, -ROAD_DEPTH],
    ],
    fillOpacity: ROAD_FILL,
    style: ink,
  });
  g.push({
    type: 'trajectory',
    id: 'road-top',
    points: [
      [-ROAD_HALF, 0],
      [ROAD_HALF, 0],
    ],
    width: RAY_WIDTH_PX,
    style: ink,
  });

  // ---- 뜨거운 공기층 — 한 역할의 명암. 길에 가까운 층일수록 짙다(더 뜨겁고 묽다). ----
  for (let i = 0; i < c.layers; i++) {
    g.push({
      type: 'region',
      id: `layer-${i}`,
      points: [
        [-ROAD_HALF, i * h],
        [ROAD_HALF, i * h],
        [ROAD_HALF, (i + 1) * h],
        [-ROAD_HALF, (i + 1) * h],
      ],
      fillOpacity: (HOT_FILL_MAX * (c.layers - i)) / c.layers,
      opaque: true,
      style: hot,
    });
  }
  for (let i = 1; i <= c.layers; i++) {
    g.push({
      type: 'trajectory',
      id: `layer-line-${i}`,
      points: [
        [-ROAD_HALF, i * h],
        [ROAD_HALF, i * h],
      ],
      width: LAYER_LINE_PX,
      opacity: LAYER_LINE_OPACITY,
      style: { ...hot, lineStyle: 'dotted' },
    });
  }
  g.push(label('label-cool', 'label.cool', [LAYER_LABEL_X, c.hotDepth], { offset: [0, -LABEL_GAP_PX], align: 'right', role: 'muted' }));
  g.push(label('label-hot', 'label.hot', [LAYER_LABEL_X, c.hotDepth / 2], { align: 'right', role: 'muted', chip: true }));
  g.push(label('label-road', 'label.road', [LAYER_LABEL_X, 0], { offset: [0, LABEL_DROP_PX], align: 'right', role: 'muted' }));

  // ---- 하늘 조각 ----
  g.push(patch('sky', path.sky, 1));
  g.push(label('label-sky', 'label.sky', [path.sky[0], path.sky[1] + PATCH_HALF_H], { offset: [0, -LABEL_GAP_PX], align: 'center', role: 'secondary' }));

  // ---- 점선 연장 — 눈에서 들어온 방향을 곧게 거슬러. 강조색은 이 한 뜻뿐이다. ----
  const seen = seenAt(path);
  const grow = tl.at('extend');
  if (grow > 0) {
    const end: Vec2 = [EYE_X + (seen[0] - EYE_X) * grow, EYE_Y + (seen[1] - EYE_Y) * grow];
    g.push({
      type: 'trajectory',
      id: 'back-line',
      points: [[EYE_X, EYE_Y], end],
      width: BACK_WIDTH_PX,
      opacity: fade,
      style: { ...accent, lineStyle: 'dashed' },
    });
  }

  // ---- 땅 아래 보이는 하늘 — 하늘 조각과 같은 대상이라 같은 색 ----
  const shown = tl.at('appear') * fade;
  if (shown > 0) {
    g.push(patch('seen-sky', seen, shown));
    g.push(label('label-seen', 'label.seen', [seen[0], seen[1] - PATCH_HALF_H], { offset: [0, LABEL_DROP_PX], align: 'center', opacity: shown, role: 'secondary' }));
  }

  // ---- 꺾인 줄기 — 시간표를 따라 하늘에서 눈까지 자란다 ----
  const frac =
    path.entryFrac * tl.at('approach') +
    (path.turnFrac - path.entryFrac) * tl.at('descend') +
    (1 - path.turnFrac) * tl.at('rise');
  if (frac > 0) {
    const drawn = pathUpTo(path, frac);
    g.push({
      type: 'trajectory',
      id: 'ray',
      points: drawn.points,
      width: RAY_WIDTH_PX,
      opacity: fade,
      style: ink,
    });
    const pts = path.points;
    const n = pts.length;
    const firstEnd = (path.lengths[1] ?? path.total) / path.total;
    const [p0, p1, pa, pb] = [pts[0], pts[1], pts[n - 2], pts[n - 1]];
    if (p0 && p1 && frac >= firstEnd) g.push(arrowOn('arrow-down', p0, p1, fade));
    if (pa && pb && frac >= 1) g.push(arrowOn('arrow-up', pa, pb, fade));
    if (frac < 1) {
      g.push({
        type: 'body',
        id: 'pulse',
        pos: drawn.head,
        shape: 'circle',
        size: PULSE_R,
        glow: false,
        style: ink,
      });
    }
  }

  // ---- 눈 ----
  g.push({
    type: 'body',
    id: 'eye',
    pos: [EYE_X, EYE_Y],
    shape: 'circle',
    size: EYE_R,
    glow: false,
    style: ink,
  });
  g.push(label('label-eye', 'label.eye', [EYE_X, EYE_Y + EYE_R], { offset: [0, -LABEL_GAP_PX], align: 'center' }));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
