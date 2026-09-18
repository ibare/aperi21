// ========================================================================
// gravitational-potential-energy-general — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 우물 곡선 · 0 선 · 에너지 선 · 궤도 ·
// 점선 원(trajectory), 공 · 행성 · 벽 닿는 점(body), 이름표(readout)가 모두 표준 어휘로 있다.
//
// 왼쪽 판: U(r) 우물. 가운데가 행성 중심, 양쪽 가로가 거리 r(같은 곡선의 두 방향).
// 오른쪽 판: 같은 가로 배율의 궤도 그림.
//
// 색은 뜻마다 하나다 — 곡선 · 공 · 물체는 먹색, 에너지 선과 그것이 정하는 벽(닿는 점 · 점선 원)은
// primary, 이번 샷이 지나간 자리(우물 위 구간 · 궤도 자취)는 secondary, 0 선 · 행성은 배경이라
// muted. 강조색은 쓰지 않는다 — 빠져나가는 샷을 강조색으로 칠하면 「벽에 닿지 않는다」 를 선이
// 아니라 색이 말한다 (S-piece MUST NOT 「색으로 설명하지 않는다」).
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
  frameAt,
  orbitPath,
  pointAt,
  potential,
  reachedRadius,
  readConstants,
  wallRadius,
  type GravitationalPotentialEnergyGeneralConstants,
  type Orbit,
} from './physics';
import {
  FLOOR_Y,
  ORBIT_CENTER,
  ORBIT_HALF,
  SCENE_BOUNDS,
  WELL_HALF,
  WELL_X,
  ZERO_Y,
  text,
} from './schema';
import type { GravitationalPotentialEnergyGeneralState } from './state';

/** 곡선 · 궤도 표본 수. */
const CURVE_SAMPLES = 120;
const ORBIT_SAMPLES = 160;
const CIRCLE_SAMPLES = 96;
/** 공 · 물체 반지름(월드). */
const BALL_R = 0.15;
const BODY_R = 0.13;
/** 벽 닿는 점 반지름(월드). */
const WALL_DOT_R = 0.09;
/** 선 굵기(화면 px). */
const ZERO_WIDTH_PX = 1;
const CURVE_WIDTH_PX = 2;
const ENERGY_WIDTH_PX = 2.5;
const REACH_WIDTH_PX = 6;
const TRAIL_WIDTH_PX = 2;
const CIRCLE_WIDTH_PX = 1.5;
/** 짙기. */
const ZERO_OPACITY = 0.8;
const PLANET_OPACITY = 0.55;
/** 올리기 단계 동안 남기는 지난 샷의 짙기. */
const PREVIOUS_OPACITY = 0.35;
const REACH_OPACITY = 0.8;
/** 이름표 크기(화면 px) · 띄움(화면 px). */
const LABEL_PX = 12;
const ENERGY_LABEL_GAP = 12;
const ZERO_LABEL_DROP = 12;
const CURVE_LABEL_GAP = 10;
/** 곡선 이름을 붙이는 거리(무차원) — 왼쪽 벽 위, 공이 오가지 않는 쪽. */
const CURVE_LABEL_R = 1.35;
/** 점선 원을 긋는 최대 반지름(판 반폭의 배수). 넘으면 판 밖이라 긋지 않는다. */
const CIRCLE_MAX = 3;

type C = GravitationalPotentialEnergyGeneralConstants;

/** 우물 판 · 궤도 판의 자르기 사각형. */
const WELL_CLIP = {
  min: [WELL_X - WELL_HALF, FLOOR_Y] as Vec2,
  max: [WELL_X + WELL_HALF, SCENE_BOUNDS.maxY] as Vec2,
};
const ORBIT_CLIP = {
  min: [ORBIT_CENTER[0] - ORBIT_HALF, ORBIT_CENTER[1] - ORBIT_HALF] as Vec2,
  max: [ORBIT_CENTER[0] + ORBIT_HALF, ORBIT_CENTER[1] + ORBIT_HALF] as Vec2,
};

/** 우물 판: (부호 있는 거리, 에너지) → 월드. */
function wellAt(c: C, r: number, energy: number): Vec2 {
  return [WELL_X + r * c.worldPerLength, ZERO_Y + energy * c.worldPerEnergy];
}

/** 궤도 판: 무차원 좌표 → 월드. */
function orbitAt(c: C, x: number, y: number): Vec2 {
  return [ORBIT_CENTER[0] + x * c.worldPerLength, ORBIT_CENTER[1] + y * c.worldPerLength];
}

/** 곡선의 한쪽 벽 — 바닥에서 판 끝까지. 가운데 가까이 촘촘하게 표본한다. */
function wallPoints(c: C, side: 1 | -1): Vec2[] {
  const rFloor = c.gm / ((ZERO_Y - FLOOR_Y) / c.worldPerEnergy);
  const rEnd = WELL_HALF / c.worldPerLength;
  const out: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const r = rFloor * Math.pow(rEnd / rFloor, i / CURVE_SAMPLES);
    out.push(wellAt(c, side * r, potential(c, r)));
  }
  return out;
}

/** 우물 위 한 구간 [r0, r1] (오른쪽 벽). */
function wallSegment(c: C, r0: number, r1: number): Vec2[] {
  const out: Vec2[] = [];
  const n = Math.max(2, Math.ceil(CURVE_SAMPLES * Math.min(1, (r1 - r0) / WELL_HALF)));
  for (let i = 0; i <= n; i++) {
    const r = r0 + ((r1 - r0) * i) / n;
    out.push(wellAt(c, r, potential(c, r)));
  }
  return out;
}

function orbitTrail(c: C, id: string, o: Orbit, anomaly: number, opacity: number): Primitive {
  return {
    type: 'trajectory',
    id,
    points: orbitPath(o, anomaly, ORBIT_SAMPLES).map((p) => orbitAt(c, p.x, p.y)),
    width: TRAIL_WIDTH_PX,
    opacity,
    clip: ORBIT_CLIP,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: GravitationalPotentialEnergyGeneralState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('gravitational-potential-energy-general: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const f = frameAt(c, tl);
  const out: Primitive[] = [];
  const wall = wallRadius(c, f.energy);

  // ================= 왼쪽 판 — 우물 =================

  // ---- 0 선 · 무한히 먼 곳 ----
  out.push({
    type: 'trajectory',
    id: 'zero-line',
    points: [wellAt(c, -WELL_HALF, 0), wellAt(c, WELL_HALF, 0)],
    width: ZERO_WIDTH_PX,
    opacity: ZERO_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'zero-label',
    anchor: { world: wellAt(c, WELL_HALF, 0), offset: [0, ZERO_LABEL_DROP] },
    text: text('label.zero'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 지난 샷이 우물에서 지나간 구간 (올리기 동안 옅게) ----
  if (f.previous?.bound) {
    const rp = pointAt(f.previous, 0).r;
    const ra = pointAt(f.previous, Math.PI).r;
    out.push({
      type: 'trajectory',
      id: 'reach-previous',
      points: wallSegment(c, rp, ra),
      width: REACH_WIDTH_PX,
      opacity: PREVIOUS_OPACITY * REACH_OPACITY,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }

  // ---- 이번 샷이 우물에서 지나간 구간 ----
  {
    const rp = pointAt(f.orbit, 0).r;
    const rNow = reachedRadius(f.orbit, f.anomaly);
    if (rNow - rp > 1e-3) {
      out.push({
        type: 'trajectory',
        id: 'reach',
        points: wallSegment(c, rp, Math.min(rNow, WELL_HALF / c.worldPerLength)),
        width: REACH_WIDTH_PX,
        opacity: REACH_OPACITY * f.fade,
        clip: WELL_CLIP,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
    }
  }

  // ---- 우물 곡선 U(r) = −GM/r, 두 방향 ----
  for (const side of [-1, 1] as const) {
    out.push({
      type: 'trajectory',
      id: side < 0 ? 'curve-left' : 'curve-right',
      points: wallPoints(c, side),
      width: CURVE_WIDTH_PX,
      clip: WELL_CLIP,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  const curveLabelAt = wellAt(c, -CURVE_LABEL_R, potential(c, CURVE_LABEL_R));
  out.push({
    type: 'readout',
    id: 'curve-label',
    anchor: { world: curveLabelAt, offset: [-CURVE_LABEL_GAP, 0] },
    text: text('label.curve'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 에너지 선 ----
  // 0 아래면 두 벽 사이에만 있다 — 벽에 닿아 끝난다. 0 위면 판 끝에서 끝까지 벽에 닿지 않는다.
  const reach = wall === null ? WELL_HALF / c.worldPerLength : Math.min(wall, WELL_HALF / c.worldPerLength);
  const left = wellAt(c, -reach, f.energy);
  out.push({
    type: 'trajectory',
    id: 'energy-line',
    points: [left, wellAt(c, reach, f.energy)],
    width: ENERGY_WIDTH_PX,
    opacity: f.fade,
    clip: WELL_CLIP,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'energy-label',
    // 선 위 우물 가운데. 선 끝(벽 닿는 점) 곁에 두면 벽 곡선이 글자를 지나간다.
    anchor: { world: wellAt(c, 0, f.energy), offset: [0, -ENERGY_LABEL_GAP] },
    text: text(f.energy < 0 ? 'label.energyNegative' : 'label.energyPositive'),
    chip: false,
    font: 'mono',
    italic: true,
    fontSize: LABEL_PX,
    align: 'center',
    opacity: f.fade,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  // 선이 벽에 닿는 두 점.
  if (wall !== null && wall < WELL_HALF / c.worldPerLength) {
    for (const side of [-1, 1] as const) {
      out.push({
        type: 'body',
        id: side < 0 ? 'wall-left' : 'wall-right',
        pos: wellAt(c, side * wall, f.energy),
        shape: 'circle',
        size: WALL_DOT_R,
        outline: 'none',
        glow: false,
        opacity: f.fade,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    }
  }

  // ---- 공 — 지금 거리의 곡선 위 ----
  if (f.present) {
    const r = pointAt(f.orbit, f.anomaly).r;
    out.push({
      type: 'body',
      id: 'ball',
      pos: wellAt(c, r, potential(c, r)),
      shape: 'circle',
      size: BALL_R,
      outline: 'background',
      glow: false,
      opacity: f.fade,
      clip: WELL_CLIP,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ================= 오른쪽 판 — 궤도 =================

  // ---- 점선 원: E 선이 벽에 닿는 반지름 ----
  if (wall !== null && wall * c.worldPerLength < ORBIT_HALF * CIRCLE_MAX) {
    const pts: Vec2[] = [];
    for (let i = 0; i < CIRCLE_SAMPLES; i++) {
      const a = (2 * Math.PI * i) / CIRCLE_SAMPLES;
      pts.push(orbitAt(c, wall * Math.cos(a), wall * Math.sin(a)));
    }
    out.push({
      type: 'trajectory',
      id: 'wall-circle',
      points: pts,
      closed: true,
      width: CIRCLE_WIDTH_PX,
      opacity: f.fade,
      clip: ORBIT_CLIP,
      style: { colorRole: 'primary', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 행성 ----
  out.push({
    type: 'body',
    id: 'planet',
    pos: orbitAt(c, 0, 0),
    shape: 'circle',
    size: c.planetRadius * c.worldPerLength,
    outline: 'none',
    glow: false,
    opacity: PLANET_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 궤도 자취 ----
  if (f.previous?.bound) {
    out.push(orbitTrail(c, 'trail-previous', f.previous, 2 * Math.PI, PREVIOUS_OPACITY));
  }
  if (f.anomaly > 1e-4) {
    out.push(orbitTrail(c, 'trail', f.orbit, f.anomaly, f.fade));
  }

  // ---- 물체 ----
  if (f.present) {
    const p = pointAt(f.orbit, f.anomaly);
    out.push({
      type: 'body',
      id: 'body',
      pos: orbitAt(c, p.x, p.y),
      shape: 'circle',
      size: BODY_R,
      outline: 'background',
      glow: false,
      opacity: f.fade,
      clip: ORBIT_CLIP,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
