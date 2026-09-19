// ========================================================================
// object-color — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 방은 빛 없음(`region` `light: 0`)이라 라이트 · 다크 모두 검다. 그 위의 빛 —
// 등 · 줄기 · 사과 겉면 · 잎 — 은 모두 빛 채널로 칠한다. 사과 · 잎의 색은
// physics 가 「비추는 빛 × 반사 스펙트럼」 에서 얻는다: 파란빛만 받으면 사과가
// 되쏠 것이 거의 없어 방 바탕에 가까운 검정이 된다.
//
// 빛이 아닌 것(탁자 · 전구 테 · 꼭지쇠 · 사과 · 잎 윤곽)은 고정 회색 빛
// (`EQUIP_LIGHT`)으로 긋는다 — 역할 색 `muted` 는 라이트 테마에서 빛 없음 바탕과
// 거의 같은 짙기라 방 안에서 묻힌다(seeing-requires-light 와 같은 처리).
// 윤곽이 있어 검게 된 사과가 「사라진 것」 이 아니라 「검은 사과」 로 읽힌다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  angleOf,
  bandLevels,
  bezierPath,
  bezierPoints,
  chevrons,
  circlePoints,
  lightsNow,
  polar,
  readConstants,
  type Beam,
  type Rgb,
} from './physics';
import {
  APPLE_CENTER,
  APPLE_HIT_R,
  APPLE_OUTLINE,
  APPLE_STEM,
  BULB_BASE,
  BULB_R,
  INCIDENT_SPREAD,
  LEAF_AT,
  LEAF_OUTLINE,
  OUT_ANGLE,
  OUT_LEN,
  ROOM,
  SCENE_BOUNDS,
  TABLE_HALF,
  TABLE_Y,
} from './schema';
import type { ObjectColorState } from './state';

/** 줄기 굵기 · 꺾쇠 굵기(화면 px). */
const BEAM_PX = 2;
const CHEVRON_PX = 2;
/** 꺾쇠 날개 길이 · 줄기 끝에서 비워 두는 거리(월드). */
const CHEVRON_SIZE = 0.08;
const CHEVRON_MARGIN = 0.12;
/** 빛이 아닌 것을 긋는 고정 회색 빛의 세기 — 두 테마에서 같은 회색이다. */
const EQUIP_LIGHT = 0.3;
/** 탁자 · 전구 테 · 윤곽 굵기(화면 px). */
const EQUIP_PX = 1.5;
const OUTLINE_PX = 1;
/** 윤곽 베지어 조각마다 표본 수 · 전구 테 원 표본 수. */
const OUTLINE_SAMPLES = 16;
const CIRCLE_SAMPLES = 40;
/** 전구 꼭지쇠를 전구 아래로 내린 거리(월드). */
const BASE_DROP = 0.08;

const BAND_IDS = ['blue', 'green', 'red'] as const;

function beamSet(id: string, beam: Beam, rgb: Rgb): LineSet {
  return { type: 'lineSet', id, lines: [[beam[0], beam[1]]], width: BEAM_PX, light: { rgb } };
}

function chevronSet(id: string, lines: Vec2[][], rgb: Rgb): LineSet {
  return { type: 'lineSet', id, lines, width: CHEVRON_PX, light: { rgb } };
}

function equipLine(id: string, points: readonly Vec2[], closed: boolean, width: number): Trajectory {
  return { type: 'trajectory', id, points, closed, width, light: EQUIP_LIGHT };
}

export function scene(params: {
  state: ObjectColorState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('object-color: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const light = lightsNow(c, bandLevels(c, timeline));
  const lamp = c.lamp;
  const out: Primitive[] = [];

  // ---- 어두운 방 — 빛 없음 ----
  out.push({
    type: 'region',
    id: 'room',
    points: [
      [ROOM.minX, ROOM.minY],
      [ROOM.maxX, ROOM.minY],
      [ROOM.maxX, ROOM.maxY],
      [ROOM.minX, ROOM.maxY],
    ],
    fillOpacity: 1,
    light: 0,
  });

  // ---- 탁자 ----
  out.push(
    equipLine(
      'table',
      [
        [APPLE_CENTER[0] - TABLE_HALF, TABLE_Y],
        [APPLE_CENTER[0] + TABLE_HALF, TABLE_Y],
      ],
      false,
      EQUIP_PX,
    ),
  );

  // ---- 줄기 — 띠마다 하나씩 사과로 들어오고, 사과가 되쏘는 몫만큼 같은 자리에서 나간다 ----
  // 켜진 정도가 0 인 띠는 줄기를 긋지 않는다 — 빛 없음 선을 남기면 방 바탕 위에 흐릿한 자국이 된다.
  const toLamp = angleOf(APPLE_CENTER, lamp);
  BAND_IDS.forEach((band, i) => {
    const hit = polar(APPLE_CENTER, APPLE_HIT_R, toLamp + INCIDENT_SPREAD[i]!);
    const incoming: Beam = [polar(lamp, BULB_R, angleOf(lamp, hit)), hit];
    const outgoing: Beam = [hit, polar(hit, OUT_LEN, OUT_ANGLE)];
    if (light.levels[i]! > 0) {
      out.push(beamSet(`in-${band}`, incoming, light.incoming[i]!));
      out.push(chevronSet(`in-${band}-flow`, chevrons(incoming, timeline.t, c, CHEVRON_SIZE, CHEVRON_MARGIN), light.incoming[i]!));
    }
    if (light.outLevels[i]! > 0) {
      out.push(beamSet(`out-${band}`, outgoing, light.outgoing[i]!));
      out.push(chevronSet(`out-${band}-flow`, chevrons(outgoing, timeline.t, c, CHEVRON_SIZE, CHEVRON_MARGIN), light.outgoing[i]!));
    }
  });

  // ---- 사과 — 겉면이 되쏘는 빛의 색으로 칠한다 ----
  out.push({
    type: 'body',
    id: 'apple',
    pos: APPLE_CENTER,
    shape: 'custom',
    customPath: bezierPath(APPLE_OUTLINE, APPLE_STEM),
    light: { rgb: light.apple },
  });
  out.push(equipLine('apple-outline', bezierPoints(APPLE_OUTLINE, APPLE_CENTER, OUTLINE_SAMPLES), true, OUTLINE_PX));

  // ---- 잎 ----
  const leafPos: Vec2 = [APPLE_CENTER[0] + LEAF_AT[0], APPLE_CENTER[1] + LEAF_AT[1]];
  out.push({
    type: 'body',
    id: 'leaf',
    pos: leafPos,
    shape: 'custom',
    customPath: bezierPath(LEAF_OUTLINE),
    light: { rgb: light.leaf },
  });
  out.push(equipLine('leaf-outline', bezierPoints(LEAF_OUTLINE, leafPos, OUTLINE_SAMPLES), true, OUTLINE_PX));

  // ---- 등 — 전구는 비추는 빛의 색으로, 테 · 꼭지쇠는 회색 ----
  out.push({
    type: 'body',
    id: 'bulb',
    pos: lamp,
    shape: 'circle',
    size: BULB_R,
    outline: 'none',
    glow: true,
    light: { rgb: light.lamp },
    // 후광이 방 밖 테마 바탕으로 번지지 않게 방 안에만 그린다.
    clip: { min: [ROOM.minX, ROOM.minY], max: [ROOM.maxX, ROOM.maxY] },
  });
  out.push(equipLine('bulb-rim', circlePoints(lamp, BULB_R, CIRCLE_SAMPLES), true, EQUIP_PX));
  out.push({
    type: 'body',
    id: 'bulb-base',
    pos: [lamp[0], lamp[1] - BULB_R - BASE_DROP],
    shape: 'rect',
    size: BULB_BASE,
    outline: 'none',
    light: EQUIP_LIGHT,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
