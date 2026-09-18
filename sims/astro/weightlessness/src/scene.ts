// ========================================================================
// weightlessness — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 지구 · 정거장 · 사람 · 저울(body) ·
// 궤도 · 선체 · 다리 · 받침 · 연결선(trajectory) · 중력(vector) · 눈금판(scale dial) ·
// 이름표(readout) 가 모두 표준 어휘로 있다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 왼쪽은 궤도, 오른쪽은 정거장 안을 확대한 판이다. 확대 판의 아래가 지구 쪽이다.
//
// 색은 뜻마다 하나 — **강조색은 「중력」 한 뜻에만**(사람 · 정거장에 걸린 중력 화살표,
// 궤도의 중력 화살표). 지상 기준 화살표는 같은 중력이지만 비교 기준이라 muted 점선이다.
// 사람 · 선체 · 정거장은 먹색, 궤도는 secondary, 지구 · 판 · 받침 · 유령은 배경 정보라 muted.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  Trajectory,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  footGap,
  gRatio,
  orbitAngle,
  orbitRatio,
  readConstants,
  scaleReading,
  stationDrop,
} from './physics';
import { text } from './schema';
import type { WeightlessnessState } from './state';

// ------------------------------------------------------------------------
// 궤도 판 — 월드 단위. 지구 중심이 원점이다.
// ------------------------------------------------------------------------

/** 지구 반지름(월드). 궤도 반지름은 이것에 선언의 고도 비를 곱한다 — 실제 비율 그대로다. */
const EARTH_R = 1.2;
/** 정거장 점 · 둘레 고리 반지름(월드). */
const STATION_R = 0.05;
const STATION_RING_R = 0.15;
/** 궤도 그림의 중력 화살표 길이(월드). 지구 중심을 향한다. */
const ORBIT_GRAVITY_ARROW = 0.42;
/** 붙잡는 순간 정거장이 있는 자리(도, 지구 중심에서 +x 반시계). 오른쪽 위 — 확대 판 쪽이다. */
const HOLD_ANGLE_DEG = 35;
/** 고도 이름표 자리(도). 궤도 꼭대기. */
const ALTITUDE_LABEL_DEG = 90;
/** 궤도 원 표본 수. */
const ORBIT_SAMPLES = 144;

// ------------------------------------------------------------------------
// 확대 판 — 월드 단위. 아래가 지구 쪽이다.
// ------------------------------------------------------------------------

/** 판 테두리. */
const PANEL = { minX: 1.8, maxX: 6.25, minY: -1.3, maxY: 1.4 } as const;
/** 선체 — 가운데 x, 폭, 높이, 처음 자리의 윗변. */
const HULL = { cx: 3.25, w: 2.3, h: 1.35, top: 1.12 } as const;
/** 선체가 `fall` · `release` 동안 내려가는 거리(월드). 등가속 꼴은 physics 가 준다. */
const FALL_DROP = 0.36;
const RELEASE_DROP = 0.24;
/** 저울 — 폭 · 높이, 선체 바닥 가운데에서 왼쪽으로 뗀 거리. */
const SCALE_W = 0.52;
const SCALE_H = 0.07;
const PERSON_DX = -0.6;
/** 사람 — 떠 있는 틈, 발 간격, 다리 길이, 몸통 폭 · 높이, 머리 반지름. */
const FLOAT_GAP = 0.13;
const FOOT_X = 0.07;
const LEG_LEN = 0.38;
const TORSO_W = 0.24;
const TORSO_H = 0.4;
const HEAD_R = 0.1;
/** 머리와 몸통 사이 틈(월드). */
const NECK = 0.02;
/** 지상 중력 화살표의 길이(월드). 여기 화살표는 이것의 `gPercent` % 다. */
const G_ARROW = 0.66;
/**
 * 지상 화살표의 가로 자리 — 사람 중심에서 오른쪽으로. 여기 화살표는 사람 몸통 가운데에서
 * 내려온다(사람에게 걸린 중력). 두 화살표는 같은 높이에서 출발해 길이로 견준다.
 */
const GROUND_ARROW_DX = 0.95;
/** 정거장 중력 화살표 — 선체 왼쪽 벽에서 바깥으로 뗀 거리. */
const HULL_ARROW_GAP = 0.13;
/**
 * 눈금판 — 중심, 반지름(월드), 범위 · 눈금 간격(지상 = 100). 중심 높이는 선체 바닥이 오가는
 * 높이의 가운데라, 저울에서 오는 점선이 이름표를 가로지르지 않고 바닥을 따라 온다.
 */
const DIAL = { cx: 5.45, cy: -0.4, r: 0.6, min: 0, max: 100, tick: 10 } as const;
/** 눈금 숫자를 붙이는 값(지상 = 100). */
const DIAL_LABELS: readonly number[] = [0, 50, 100];
/** 눈금판 글자 소수 자릿수. 붙잡힌 눈금은 선언된 정수 % 다. */
const DIAL_DIGITS = 0;

// ------------------------------------------------------------------------
// 그리기 치수 — 화면 px 와 짙기 (C2)
// ------------------------------------------------------------------------

const ORBIT_WIDTH_PX = 1.5;
const HULL_WIDTH_PX = 2.5;
const GHOST_WIDTH_PX = 1.5;
const PANEL_WIDTH_PX = 1;
const LEG_WIDTH_PX = 5;
const TOWER_WIDTH_PX = 6;
const LINK_WIDTH_PX = 1;
const ARROW_WIDTH_PX = 3;
const GROUND_ARROW_WIDTH_PX = 2;
const ORBIT_ARROW_WIDTH_PX = 2.5;
const LABEL_PX = 12;
const EARTH_LABEL_PX = 13;
/** 지구 원판의 짙기 — 배경 정보라 한 걸음 물린다. */
const EARTH_OPACITY = 0.2;
/** 받침 이름표를 받침 옆으로 띄우는 거리(화면 px). */
const TOWER_LABEL_GAP = 12;
/** 여기 화살표 이름표를 화살표 오른쪽으로 띄우는 거리(화면 px). 몸통을 비켜 간다. */
const HERE_LABEL_GAP = 16;
/** 지상 화살표 이름표를 화살표 오른쪽으로 띄우는 거리(화면 px). */
const GROUND_LABEL_GAP = 6;
/** 이름표를 기준점 위로 띄우는 거리(화면 px, 음수가 위). */
const LABEL_LIFT = -12;

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const faint = { colorRole: 'muted', emphasis: 'strong' } as const;
const gravity = { colorRole: 'accent', emphasis: 'strong' } as const;

function line(
  id: string,
  points: readonly Vec2[],
  width: number,
  style: Trajectory['style'],
  extra: Partial<Trajectory> = {},
): Trajectory {
  return { type: 'trajectory', id, points, width, style, ...extra };
}

function rectPoints(minX: number, minY: number, maxX: number, maxY: number): Vec2[] {
  return [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ];
}

function polar(r: number, theta: number): Vec2 {
  return [r * Math.cos(theta), r * Math.sin(theta)];
}

export function scene(params: {
  state: WeightlessnessState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('weightlessness: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  // ====================================================================
  // 궤도
  // ====================================================================
  const orbitR = EARTH_R * orbitRatio(c);

  out.push({
    type: 'body',
    id: 'earth',
    pos: [0, 0],
    shape: 'circle',
    size: EARTH_R,
    outline: 'none',
    glow: false,
    opacity: EARTH_OPACITY,
    style: faint,
  });
  out.push({
    type: 'readout',
    id: 'earth-label',
    anchor: { world: [0, 0] },
    text: text('label.earth'),
    chip: false,
    font: 'text',
    fontSize: EARTH_LABEL_PX,
    align: 'center',
    style: faint,
  });

  const ring: Vec2[] = [];
  for (let i = 0; i < ORBIT_SAMPLES; i++) ring.push(polar(orbitR, (2 * Math.PI * i) / ORBIT_SAMPLES));
  out.push(line('orbit', ring, ORBIT_WIDTH_PX, { colorRole: 'secondary', emphasis: 'strong' }, { closed: true }));

  // 고도 이름표 — 궤도가 지표에 거의 붙어 있다는 것이 그림의 비율로 보이고, 수는 선언값 그대로.
  out.push({
    type: 'readout',
    id: 'altitude-label',
    anchor: { world: polar(orbitR, (ALTITUDE_LABEL_DEG * Math.PI) / 180), offset: [0, LABEL_LIFT] },
    text: text('label.altitude'),
    vars: { h: String(c.altitudeKm) },
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: faint,
  });

  const theta = orbitAngle(tl, (HOLD_ANGLE_DEG * Math.PI) / 180);
  const station = polar(orbitR, theta);
  const inward: Vec2 = [-Math.cos(theta), -Math.sin(theta)];
  out.push({
    type: 'body',
    id: 'station-ring',
    pos: station,
    shape: 'circle',
    size: STATION_RING_R,
    fill: 'none',
    outline: 'role',
    style: faint,
  });
  out.push({
    type: 'body',
    id: 'station',
    pos: station,
    shape: 'circle',
    size: STATION_R,
    outline: 'none',
    glow: false,
    style: ink,
  });
  // 궤도에서도 중력은 늘 지구 중심을 향해 걸려 있다 — 멈춰 있든 돌든 같은 화살표다.
  out.push({
    type: 'vector',
    id: 'orbit-gravity',
    from: station,
    delta: [inward[0] * ORBIT_GRAVITY_ARROW, inward[1] * ORBIT_GRAVITY_ARROW],
    width: ORBIT_ARROW_WIDTH_PX,
    outline: 'background',
    style: gravity,
  });

  // ====================================================================
  // 확대 판 — 정거장 안
  // ====================================================================
  out.push(
    line('panel', rectPoints(PANEL.minX, PANEL.minY, PANEL.maxX, PANEL.maxY), PANEL_WIDTH_PX, {
      colorRole: 'muted',
      emphasis: 'subtle',
    }, { closed: true }),
  );
  out.push({
    type: 'readout',
    id: 'panel-label',
    anchor: { world: [PANEL.minX, PANEL.maxY], offset: [0, LABEL_LIFT] },
    text: text('label.inside'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'left',
    style: faint,
  });

  const hullLeft = HULL.cx - HULL.w / 2;
  const hullRight = HULL.cx + HULL.w / 2;

  // ---- 떨어지지 않았다면 — 처음 자리의 점선 선체 ----
  // `fall` 동안 또렷하고 붙잡는 동안 흐려진다. 함께 내려간 거리가 이 점선과의 틈이다.
  const ghostAlpha = tl.at('fall') > 0 ? 1 - tl.at('catch') : 0;
  if (ghostAlpha > 0) {
    out.push(
      line(
        'ghost-hull',
        rectPoints(hullLeft, HULL.top - HULL.h, hullRight, HULL.top),
        GHOST_WIDTH_PX,
        { ...faint, lineStyle: 'dashed' },
        { closed: true, opacity: ghostAlpha },
      ),
    );
    out.push({
      type: 'readout',
      id: 'ghost-label',
      anchor: { world: [hullRight, HULL.top], offset: [0, LABEL_LIFT] },
      text: text('label.ghost'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'right',
      opacity: ghostAlpha,
      style: faint,
    });
  }

  const drop = stationDrop(tl, FALL_DROP, RELEASE_DROP);
  const top = HULL.top - drop;
  const floor = top - HULL.h;

  // ---- 받침 — 붙잡아 둔다면 ----
  // 붙잡는 동안만 선다. 놓는 순간 사라진다.
  const held = tl.phase === 'catch' || tl.phase === 'held';
  if (held) {
    out.push(line('tower', [[HULL.cx, floor], [HULL.cx, PANEL.minY]], TOWER_WIDTH_PX, faint));
    out.push({
      type: 'readout',
      id: 'tower-label',
      anchor: { world: [HULL.cx, (floor + PANEL.minY) / 2], offset: [TOWER_LABEL_GAP, 0] },
      text: text('label.tower'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'left',
      style: faint,
    });
  }

  // ---- 선체 ----
  out.push(line('hull', rectPoints(hullLeft, floor, hullRight, top), HULL_WIDTH_PX, ink, { closed: true }));

  // ---- 저울 ----
  const scaleX = HULL.cx + PERSON_DX;
  const scaleTop = floor + SCALE_H;
  out.push({
    type: 'body',
    id: 'scale',
    pos: [scaleX, floor + SCALE_H / 2],
    shape: 'rect',
    size: [SCALE_W, SCALE_H],
    style: faint,
  });

  // ---- 사람 ----
  const feet = scaleTop + FLOAT_GAP * footGap(tl);
  const hip = feet + LEG_LEN;
  out.push(line('leg-left', [[scaleX - FOOT_X, feet], [scaleX - FOOT_X / 2, hip]], LEG_WIDTH_PX, ink));
  out.push(line('leg-right', [[scaleX + FOOT_X, feet], [scaleX + FOOT_X / 2, hip]], LEG_WIDTH_PX, ink));
  const torsoCy = hip + TORSO_H / 2;
  out.push({
    type: 'body',
    id: 'torso',
    pos: [scaleX, torsoCy],
    shape: 'rect',
    size: [TORSO_W, TORSO_H],
    outline: 'none',
    style: ink,
  });
  out.push({
    type: 'body',
    id: 'head',
    pos: [scaleX, hip + TORSO_H + NECK + HEAD_R],
    shape: 'circle',
    size: HEAD_R,
    outline: 'none',
    glow: false,
    style: ink,
  });

  // ---- 중력 — 여기 · 지상 ----
  // 사람에게 걸린 중력(가속도)을 지상의 것과 나란히 세운다. 길이 비가 선언된 % 다.
  const hereLen = G_ARROW * gRatio(c);
  out.push({
    type: 'vector',
    id: 'gravity-here',
    from: [scaleX, torsoCy],
    delta: [0, -hereLen],
    width: ARROW_WIDTH_PX,
    outline: 'background',
    style: gravity,
  });
  out.push({
    type: 'readout',
    id: 'gravity-here-label',
    anchor: { world: [scaleX, torsoCy - hereLen / 2], offset: [HERE_LABEL_GAP, 0] },
    text: text('label.gHere'),
    vars: { pct: String(c.gPercent) },
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'left',
    style: gravity,
  });
  const groundX = scaleX + GROUND_ARROW_DX;
  out.push({
    type: 'vector',
    id: 'gravity-ground',
    from: [groundX, torsoCy],
    delta: [0, -G_ARROW],
    width: GROUND_ARROW_WIDTH_PX,
    style: { ...faint, lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'gravity-ground-label',
    anchor: { world: [groundX, torsoCy - G_ARROW / 2], offset: [GROUND_LABEL_GAP, 0] },
    text: text('label.gGround'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'left',
    style: faint,
  });

  // ---- 정거장에 걸린 중력 ----
  // 함께 떨어지는 동안 선체에도 같은 길이의 화살표가 걸린다 — 같은 가속도.
  // 붙잡힌 동안은 받침이 떠받치므로 두지 않는다.
  const falling = tl.phase === 'fall' || tl.phase === 'release';
  if (falling) {
    const hx = hullLeft - HULL_ARROW_GAP;
    const hy = floor + HULL.h / 2 + hereLen / 2;
    out.push({
      type: 'vector',
      id: 'gravity-hull',
      from: [hx, hy],
      delta: [0, -hereLen],
      width: ARROW_WIDTH_PX,
      style: gravity,
    });
  }

  // ---- 눈금판 ----
  // 저울과 점선으로 잇는다. 함께 떨어지는 동안 0, 붙잡으면 오르고, 놓으면 곧바로 0.
  out.push(
    line(
      'link',
      [[scaleX + SCALE_W / 2, floor + SCALE_H / 2], [DIAL.cx - DIAL.r, DIAL.cy]],
      LINK_WIDTH_PX,
      { colorRole: 'muted', emphasis: 'subtle', lineStyle: 'dashed' },
    ),
  );
  const ticks: number[] = [];
  for (let v = DIAL.min; v <= DIAL.max; v += DIAL.tick) ticks.push(v);
  out.push({
    type: 'scale',
    id: 'dial',
    shape: 'dial',
    pos: [DIAL.cx, DIAL.cy],
    size: DIAL.r,
    range: [DIAL.min, DIAL.max],
    value: scaleReading(tl, c),
    tickAt: ticks,
    labelAt: DIAL_LABELS,
    label: text('label.scale'),
    unit: text('label.unit'),
    digits: DIAL_DIGITS,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/**
 * 고정 경계. 왼쪽은 궤도(고도 이름표 포함), 오른쪽은 확대 판, 아래는 캡션 줄.
 * 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6).
 */
export function boundsHint(): Bounds {
  return { minX: -1.5, maxX: 6.35, minY: -1.75, maxY: 1.72 };
}
