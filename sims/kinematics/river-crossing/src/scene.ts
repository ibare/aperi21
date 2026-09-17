// ========================================================================
// river-crossing — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 배를 둘 둔다. **흐린 배**는 물과 함께 움직이는 기준에서 본 배 — 뱃머리 방향
// 점선을 따라 간다. **진한 배**는 강둑에서 본 실제 배. 둘은 언제나 같은 높이에
// 있고, 그 사이를 강조색 가로 선분이 잇는다. 이 선분이 자라는 것이 "떠밀린다" 다.
//
// 배의 자리는 누적 상태 `tau` 에서, 줄무늬 자리는 `flowT` 에서 구한다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';

import { STREAKS, crossing, poseAt, simTime, streakXPx } from './physics';
import {
  BLEED,
  BOAT_PATH,
  PLAYBACK,
  PUSH_LINE_DROP_PX,
  PX,
  RIVER_WIDTH,
  SCENE_BOUNDS,
  STREAK_WRAP_PX,
  VIEW_BOTTOM,
  VIEW_LEFT,
  VIEW_RIGHT,
  VIEW_TOP,
  VIEW_W_PX,
  m,
  text,
  worldXFromPx,
  worldYFromPx,
} from './schema';
import type { RiverCrossingState } from './state';

/** 강둑 띠 · 물 바탕의 옅기. 원본의 모래색 · 옅은 물색에 맞춘다. */
const BANK_FILL = 0.2;
const WATER_FILL = 0.16;
/** 흐린 짝(점선 · 흐린 배)의 불투명도 — 원본 globalAlpha 0.35. */
const FAINT = 0.35;

/** 원본 선 굵기(px). */
const STREAK_WIDTH_PX = 2;
const TICK_WIDTH_PX = 1.5;
const DASH_WIDTH_PX = 1.5;
const PUSH_WIDTH_PX = 2.5;
const TRAIL_WIDTH_PX = 2;
/** '맞은편' 글자 크기(px) — 원본 12px. */
const OPPOSITE_FONT_PX = 12;

function band(id: string, y0: number, y1: number, fill: number, role: 'secondary' | 'muted'): Region {
  return {
    type: 'region',
    id,
    points: [
      [VIEW_LEFT - BLEED, y0],
      [VIEW_RIGHT + BLEED, y0],
      [VIEW_RIGHT + BLEED, y1],
      [VIEW_LEFT - BLEED, y1],
    ],
    opaque: true,
    fillOpacity: fill,
    style: { colorRole: role, emphasis: 'strong' },
  };
}

function segment(
  id: string,
  from: Vec2,
  to: Vec2,
  width: number,
  style: Trajectory['style'],
  extra: Partial<Trajectory> = {},
): Trajectory {
  return { type: 'trajectory', id, points: [from, to], width, style, ...extra };
}

export function scene(params: {
  state: RiverCrossingState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const { state } = params;
  const out: Primitive[] = [];

  const c = crossing(state.headingDeg);
  const pose = poseAt(c, simTime(c, state.tau));

  // ---- 강둑 ----
  // 위아래 두 줄의 모래색 띠. 위 띠는 카메라 여백까지 올려 캔버스 위끝이 비지 않게 한다.
  out.push(band('bank-far', RIVER_WIDTH, VIEW_TOP + BLEED, BANK_FILL, 'muted'));
  out.push(band('bank-near', VIEW_BOTTOM, 0, BANK_FILL, 'muted'));

  // ---- 물살 ----
  out.push(band('water', 0, RIVER_WIDTH, WATER_FILL, 'secondary'));
  // 흰 줄무늬가 하류로 흐른다. 원본 시계(도착한 순간 0)로 흘린다.
  const tOrig = state.flowT;
  const spanPx = VIEW_W_PX + STREAK_WRAP_PX;
  STREAKS.forEach((s, i) => {
    const xPx = streakXPx(s, tOrig, spanPx, PX, PLAYBACK);
    const y = worldYFromPx(s.yPx);
    out.push(
      segment(
        `streak-${i}`,
        [worldXFromPx(xPx), y],
        [worldXFromPx(xPx + s.lenPx), y],
        STREAK_WIDTH_PX,
        { colorRole: 'muted', emphasis: 'strong' },
        // 빛의 양 0 = 바탕색. 물 위의 흰 획을 달리 말할 길이 없다 (NOTES 「어휘 부족」).
        { luminance: 0 },
      ),
    );
  });

  // ---- 맞은편 지점 ----
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  out.push(segment('opposite-tick', [0, RIVER_WIDTH + m(12)], [0, RIVER_WIDTH - m(2)], TICK_WIDTH_PX, muted));
  const oppositeLabel: Readout = {
    type: 'readout',
    id: 'opposite-label',
    // 원본: 눈금 왼쪽 6 px, 물가 위 10 px 에 오른쪽 정렬(글자 바닥). 가운데 높이로 옮겨 4 px 더 올린다.
    anchor: { world: [0, RIVER_WIDTH], offset: [-6, -14] },
    text: text('label.opposite'),
    chip: false,
    font: 'text',
    align: 'right',
    fontSize: OPPOSITE_FONT_PX,
    style: muted,
  };
  out.push(oppositeLabel);

  // ---- 출발 지점 ----
  out.push(segment('start-tick', [0, m(2)], [0, -m(12)], TICK_WIDTH_PX, muted));

  // ---- 뱃머리만의 경로 ----
  // 물이 멈춰 있었다면 갔을 길. 배와 같은 색, 흐리게.
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const aimEndX = Math.tan(c.th) * RIVER_WIDTH;
  out.push(
    segment('aim-path', [0, 0], [aimEndX, RIVER_WIDTH], DASH_WIDTH_PX, { ...ink, lineStyle: 'dashed' }, {
      opacity: FAINT,
    }),
  );

  // ---- 물에 대한 배 ----
  // 원본은 화면에서 시계 방향으로 돌렸다(+ 하류). 월드 y 가 위라 부호가 뒤집힌다.
  const orientation = -c.th;
  const ghost: Body = {
    type: 'body',
    id: 'boat-ghost',
    pos: pose.ghost,
    shape: 'custom',
    customPath: BOAT_PATH,
    orientation,
    fill: 'none',
    outline: 'role',
    opacity: FAINT,
    style: ink,
  };
  out.push(ghost);

  // ---- 떠밀린 거리 ----
  // 흐린 배에서 실제 배까지. 조각의 유일한 강조색.
  if (pose.pushed > 0) {
    const y = pose.boat[1] - m(PUSH_LINE_DROP_PX);
    out.push(
      segment('pushed', [pose.ghost[0], y], [pose.boat[0], y], PUSH_WIDTH_PX, {
        colorRole: 'accent',
        emphasis: 'strong',
      }),
    );
  }

  // ---- 배의 자취 ----
  // 속도가 일정해 자취는 직선이다 — 출발점과 지금 자리 두 점이면 된다.
  out.push(segment('trail', [0, 0], pose.boat, TRAIL_WIDTH_PX, ink));

  // ---- 배 ----
  const boat: Body = {
    type: 'body',
    id: 'boat',
    pos: pose.boat,
    shape: 'custom',
    customPath: BOAT_PATH,
    orientation,
    style: ink,
  };
  out.push(boat);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 프레이밍은 주장의 일부다. 고정값이라야 카메라가 흔들리지 않는다 (S-piece). */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
