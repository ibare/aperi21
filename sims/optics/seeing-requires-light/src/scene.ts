// ========================================================================
// seeing-requires-light — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 방은 빛 없음(`region` `light: 0`)이라 라이트 · 다크 모두 검다. 그 위의 빛 —
// 등 · 줄기 · 사과 겉면 · 눈 옆 칸 — 은 모두 빛 채널로 칠하고 세기가 등 세기에
// 비례한다. 등이 꺼지면 사과는 빛 없음이 되어 방 바탕과 같아진다: **사라진다.**
//
// 빛이 아닌 것(탁자 · 전구 테 · 꼭지쇠 · 눈 · 어둠 속 사과 윤곽)은 고정 회색 빛
// (`EQUIP_LIGHT`)으로 긋는다. 역할 색 `muted` 는 라이트 테마에서 빛 없음 바탕과
// 거의 같은 짙기라 방 안에서 묻힌다 (NOTES (c) 새 부족).
//
// 방향은 줄기 위를 흐르는 꺾쇠가 말한다 — 등 → 사과 → 눈. 눈에서 나가는 것은 없다.
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
  appleOutlinePath,
  appleOutlinePoints,
  chevrons,
  circlePoints,
  lightsNow,
  polar,
  readConstants,
  switchedOn,
  type Beam,
  type Rgb,
} from './physics';
import {
  APPLE_CENTER,
  APPLE_HIT_R,
  APPLE_STEM,
  BULB_BASE,
  BULB_R,
  EYE_CENTER,
  EYE_HALF_H,
  EYE_HALF_W,
  INCIDENT_SPREAD,
  IRIS_R,
  IRIS_SHIFT,
  LAMP_SPRAY_ANGLES,
  LAMP_SPRAY_LEN,
  PUPIL_R,
  ROOM,
  SCATTER_ANGLES,
  SCATTER_LEN,
  SCENE_BOUNDS,
  TABLE_HALF,
  TABLE_Y,
  TILE_GAP,
  TILE_SIZE,
  text,
} from './schema';
import type { SeeingRequiresLightState } from './state';

/** 줄기 굵기 · 꺾쇠 굵기(화면 px). */
const BEAM_PX = 2;
const CHEVRON_PX = 2;
/** 꺾쇠 날개 길이 · 줄기 끝에서 비워 두는 거리(월드). */
const CHEVRON_SIZE = 0.09;
const CHEVRON_MARGIN = 0.12;
/** 빛이 아닌 것을 긋는 고정 회색 빛의 세기 — 두 테마에서 같은 회색이다. */
const EQUIP_LIGHT = 0.3;
/** 탁자 · 전구 테 · 눈꺼풀 · 홍채 굵기(화면 px). */
const EQUIP_PX = 1.5;
/** 어둠 속 사과 점선 윤곽 굵기(화면 px)와 베지어 조각마다 표본 수. */
const GHOST_PX = 1.5;
const GHOST_SAMPLES = 16;
/** 원 표본 수 — 전구 테 · 홍채. */
const CIRCLE_SAMPLES = 40;
/** 눈꺼풀 곡선 표본 수(위 · 아래 각각). */
const LID_SAMPLES = 24;
/** 눈 옆 칸 테 굵기(화면 px) · 이름표 글자 크기(화면 px) · 이름표를 칸 아래로 내린 거리(월드). */
const TILE_BORDER_PX = 1;
const TILE_LABEL_PX = 12;
const TILE_LABEL_DROP = 0.24;
/** 전구 꼭지쇠를 전구 아래로 내린 거리(월드). */
const BASE_DROP = 0.08;

function beamSet(id: string, beams: readonly Beam[], rgb: Rgb): LineSet {
  return { type: 'lineSet', id, lines: beams.map(([a, b]) => [a, b]), width: BEAM_PX, light: { rgb } };
}

function chevronSet(id: string, lines: Vec2[][], rgb: Rgb): LineSet {
  return { type: 'lineSet', id, lines, width: CHEVRON_PX, light: { rgb } };
}

function equipLine(id: string, points: readonly Vec2[], closed: boolean): Trajectory {
  return { type: 'trajectory', id, points, closed, width: EQUIP_PX, light: EQUIP_LIGHT };
}

/** 아몬드 모양 눈꺼풀 — 위 곡선을 왼쪽 → 오른쪽, 아래 곡선을 오른쪽 → 왼쪽으로 잇는다. */
function eyelid(): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i <= LID_SAMPLES; i++) {
    const x = -EYE_HALF_W + (2 * EYE_HALF_W * i) / LID_SAMPLES;
    const k = 1 - (x / EYE_HALF_W) ** 2;
    out.push([EYE_CENTER[0] + x, EYE_CENTER[1] + EYE_HALF_H * k]);
  }
  for (let i = LID_SAMPLES - 1; i > 0; i--) {
    const x = -EYE_HALF_W + (2 * EYE_HALF_W * i) / LID_SAMPLES;
    const k = 1 - (x / EYE_HALF_W) ** 2;
    out.push([EYE_CENTER[0] + x, EYE_CENTER[1] - EYE_HALF_H * k]);
  }
  return out;
}

export function scene(params: {
  state: SeeingRequiresLightState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('seeing-requires-light: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const on = switchedOn(timeline);
  const light = lightsNow(c, on);
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
    ),
  );

  // ---- 등에서 나가는 줄기 ----
  // 사과로 가는 줄기 셋 + 다른 쪽으로 나가는 짧은 줄기. 등은 사방으로 빛을 낸다.
  const toLamp = angleOf(APPLE_CENTER, lamp);
  const incident: Beam[] = INCIDENT_SPREAD.map((spread) => {
    const hit = polar(APPLE_CENTER, APPLE_HIT_R, toLamp + spread);
    return [polar(lamp, BULB_R, angleOf(lamp, hit)), hit] as const;
  });
  const spray: Beam[] = LAMP_SPRAY_ANGLES.map(
    (a) => [polar(lamp, BULB_R, a), polar(lamp, BULB_R + LAMP_SPRAY_LEN, a)] as const,
  );
  const lampBeams = [...incident, ...spray];
  // 완전히 꺼지면 줄기가 없다 — 빛 없음 선을 남기면 방 바탕 위에 흐릿한 자국이 된다.
  const lit = on > 0;
  if (lit) {
    out.push(beamSet('lamp-beams', lampBeams, light.lamp));
    out.push(chevronSet('lamp-flow', chevrons(lampBeams, timeline.t, c, CHEVRON_SIZE, CHEVRON_MARGIN), light.lamp));
  }

  // ---- 사과에서 튀어 나가는 줄기 ----
  // 사방으로 튀는 짧은 줄기 + 눈의 동공까지 가는 줄기 하나.
  const pupil: Vec2 = [EYE_CENTER[0] - IRIS_SHIFT, EYE_CENTER[1]];
  const toEye = angleOf(APPLE_CENTER, pupil);
  const eyeBeam: Beam = [polar(APPLE_CENTER, APPLE_HIT_R, toEye), polar(pupil, PUPIL_R, toEye + Math.PI)];
  const scatter: Beam[] = SCATTER_ANGLES.map(
    (a) => [polar(APPLE_CENTER, APPLE_HIT_R, a), polar(APPLE_CENTER, APPLE_HIT_R + SCATTER_LEN, a)] as const,
  );
  const appleBeams = [eyeBeam, ...scatter];
  if (lit) {
    out.push(beamSet('apple-beams', appleBeams, light.scattered));
    out.push(chevronSet('apple-flow', chevrons(appleBeams, timeline.t, c, CHEVRON_SIZE, CHEVRON_MARGIN), light.scattered));
  }

  // ---- 사과 — 겉면이 튀기는 빛의 색으로 칠한다. 등이 꺼지면 빛 없음이 되어 방과 같아진다 ----
  out.push({
    type: 'body',
    id: 'apple',
    pos: APPLE_CENTER,
    shape: 'custom',
    customPath: appleOutlinePath(APPLE_STEM),
    light: { rgb: light.appleSurface },
  });

  // 어둠 속 윤곽 — 사과가 그 자리에 있다는 도식 표지. 꺼진 정도만큼 나타난다.
  const dark = 1 - on;
  if (dark > 0) {
    out.push({
      type: 'trajectory',
      id: 'apple-ghost',
      points: appleOutlinePoints(APPLE_CENTER, GHOST_SAMPLES),
      closed: true,
      width: GHOST_PX,
      light: EQUIP_LIGHT,
      opacity: dark,
      style: { lineStyle: 'dashed' },
    });
  }

  // ---- 등 — 전구는 등 빛으로, 테 · 꼭지쇠는 회색 ----
  out.push({
    type: 'body',
    id: 'bulb',
    pos: lamp,
    shape: 'circle',
    size: BULB_R,
    outline: 'none',
    glow: lit,
    light: { rgb: light.lamp },
  });
  out.push(equipLine('bulb-rim', circlePoints(lamp, BULB_R, CIRCLE_SAMPLES), true));
  out.push({
    type: 'body',
    id: 'bulb-base',
    pos: [lamp[0], lamp[1] - BULB_R - BASE_DROP],
    shape: 'rect',
    size: BULB_BASE,
    outline: 'none',
    light: EQUIP_LIGHT,
  });

  // ---- 눈 ----
  out.push(equipLine('eyelid', eyelid(), true));
  out.push(equipLine('iris', circlePoints(pupil, IRIS_R, CIRCLE_SAMPLES), true));
  out.push({
    type: 'body',
    id: 'pupil',
    pos: pupil,
    shape: 'circle',
    size: PUPIL_R,
    outline: 'none',
    glow: false,
    light: EQUIP_LIGHT,
  });

  // ---- 눈 옆 칸 — 눈에 닿은 빛. 방 밖 테마 바탕 위에 테를 둘러 둔다 ----
  const x0 = ROOM.maxX + TILE_GAP;
  const x1 = x0 + TILE_SIZE;
  const y0 = EYE_CENTER[1] - TILE_SIZE / 2;
  const y1 = y0 + TILE_SIZE;
  const box: Vec2[] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
  out.push({ type: 'region', id: 'eye-tile', points: box, fillOpacity: 1, light: { rgb: light.scattered } });
  out.push({
    type: 'trajectory',
    id: 'eye-tile-border',
    points: box,
    closed: true,
    width: TILE_BORDER_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'eye-tile-label',
    anchor: { world: [(x0 + x1) / 2, y0 - TILE_LABEL_DROP] },
    text: text('label.tile'),
    chip: false,
    font: 'text',
    align: 'center',
    fontSize: TILE_LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
