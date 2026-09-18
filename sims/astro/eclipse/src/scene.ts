// ========================================================================
// eclipse — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 옆에서 본 단면 — 왼쪽 해(body, 빛 세기) · 햇빛 획(lineSet) · 지구 공전면(점선) · 가운데 지구 ·
// 달 궤도의 투영(앞 반은 실선, 뒤 반은 점선) · 도는 달. 지구와 달은 늘 오른쪽으로 본그림자
// 원뿔(region, 빛 없음)을 드리운다. 원뿔이 다른 천체에 닿으면 가려진 자리가 어두워지고(region,
// 빛) 강조색 고리가 그 자리를 두른다.
//
// 밝기 — 해 · 천체의 낮 면 · 그림자 · 가려진 자리는 테마와 무관한 **빛의 세기**로 칠한다(밝고 어두움이
// 주장이다). 궤도 · 공전면 · 글자는 역할 색. 강조색은 「그림자가 다른 천체에 닿은 자리」 한 뜻에만 쓴다.
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
  EARTH_X,
  ECLIPTIC_LABEL,
  NOTE_ANCHOR,
  RAYS,
  SCENE_BOUNDS,
  SUN,
  SYZYGY_LABEL_Y,
  text,
} from './schema';
import {
  clipConvex,
  discPolygon,
  eclipseHits,
  halfMonths,
  moonOffset3,
  moonPhaseAngle,
  nodeAngle,
  projectMoon,
  readConstants,
  umbraTriangle,
  type EclipseConstants,
} from './physics';
import type { EclipseState } from './state';

/** 선 굵기(화면 px). 위계라 배율을 따르지 않는다. */
const ORBIT_WIDTH_PX = 1.2;
const PLANE_WIDTH_PX = 1;
const RAY_WIDTH_PX = 1;
const CONE_EDGE_WIDTH_PX = 1;
const OUTLINE_WIDTH_PX = 1;
const RING_WIDTH_PX = 2;
/** 글자 크기(화면 px). */
const LABEL_FONT_PX = 13;
const SMALL_FONT_PX = 12;
/** 궤도 표본 수. */
const ORBIT_SAMPLES = 120;
/** 밤 면의 빛 세기 — 0 이면 다크 바탕에 묻힌다(이웃 조각과 같은 값). 낮 면은 1. */
const NIGHT_LIGHT = 0.04;
/** 그림자 원뿔의 채움 — 빛 없음을 이만큼 덮는다. 달의 원뿔은 지구 앞을 지날 때 지구를 덮지 않게 옅게. */
const EARTH_CONE_FILL = 0.42;
const MOON_CONE_FILL = 0.3;
/**
 * 월식 중인 달의 빛 세기 — 지구 대기가 굴절시킨 흐린 빛. 밤 면보다 조금 밝게 두어 다크 바탕에서도 원판이 남는다.
 * 실제로는 붉지만 색을 손으로 고르지 않았다(C2) — 두지 않은 것은 NOTES (b).
 */
const LUNAR_ECLIPSE_LIGHT = 0.1;
/** 가려진 자리를 두르는 고리 반지름(월드) — 천체 반지름에 더하는 여유. */
const RING_PAD = 6;
/** 일식 자리 고리 반지름(월드). 자리가 작아 고정값으로 둘렀다. */
const SOLAR_RING_R = 10;
/** 공전면 선을 판 오른쪽 끝 너머로 늘이는 길이(월드) — 좁은 임베드에서 선이 판 안에서 끊겨 보이지 않게. */
const EXTEND_PAST_EDGE = 200;
/** 해 이름표의 가로 자리 — 해 반지름에 대한 비율(해 가운데에서 오른쪽으로). */
const SUN_LABEL_X_RATIO = 0.55;
/** 해 이름표를 해 꼭대기 위로 띄우는 거리(월드). */
const SUN_LABEL_RISE = 10;
/** 햇빛 이름표를 맨 위 햇빛 획 위로 띄우는 거리(월드). */
const SUNLIGHT_LABEL_RISE = 14;
/** 공전면 선이 해 가장자리에서 떨어져 시작하는 거리(월드). */
const ECLIPTIC_START_GAP = 6;
/** 지구 이름표를 지구 아래로 띄우는 거리(월드). */
const EARTH_LABEL_DROP = 16;
/** 달 이름표를 달 위로 띄우는 거리(월드). */
const MOON_LABEL_RISE = 13;
/** 일식 이름표를 일식 자리에서 왼쪽 · 위로 옮기는 거리(월드). */
const SOLAR_LABEL_SHIFT: Vec2 = [-34, 26];
/** 월식 이름표를 달에서 오른쪽 · 위로 옮기는 거리(월드) — 위쪽은 달 반지름에 더한다. */
const LUNAR_LABEL_SHIFT: Vec2 = [38, 20];

/** 천체 하나 — 밤 면 원판 · 해 쪽(왼쪽) 반원 · 둘레. */
function celestialBody(out: Primitive[], id: string, center: Vec2, r: number): void {
  out.push({
    type: 'sector',
    id: `${id}-night`,
    center,
    radius: r,
    from: 0,
    to: 2 * Math.PI,
    fillOpacity: 1,
    rimWidth: 0,
    light: NIGHT_LIGHT,
  });
  out.push({
    type: 'sector',
    id: `${id}-day`,
    center,
    radius: r,
    from: Math.PI / 2,
    to: (3 * Math.PI) / 2,
    fillOpacity: 1,
    rimWidth: 0,
    light: 1,
  });
  // 라이트 바탕에서 가득 찬 빛이 묻히지 않게 둘레를 역할 색으로 두른다 (G92).
  out.push({
    type: 'sector',
    id: `${id}-outline`,
    center,
    radius: r,
    from: 0,
    to: 2 * Math.PI,
    fillOpacity: 0,
    rimWidth: OUTLINE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
}

/** 본그림자 원뿔 — 빛 없음으로 옅게 덮고 두 변을 가는 선으로 긋는다(다크 바탕에서 채움이 묻힌다). */
function umbraCone(out: Primitive[], id: string, tri: Vec2[], fill: number): void {
  out.push({ type: 'region', id: `${id}-fill`, points: tri, fillOpacity: fill, light: 0 });
  out.push({
    type: 'lineSet',
    id: `${id}-edges`,
    lines: [
      [tri[0]!, tri[1]!],
      [tri[2]!, tri[1]!],
    ],
    width: CONE_EDGE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
}

/** 가려진 자리 — 다각형이 비었으면 두지 않는다. */
function shadowedPatch(out: Primitive[], id: string, pts: Vec2[], light: number): void {
  if (pts.length < 3) return;
  out.push({ type: 'region', id, points: pts, fillOpacity: 1, light });
}

/** 강조 고리 — 그림자가 다른 천체에 닿은 자리. */
function contactRing(out: Primitive[], id: string, center: Vec2, r: number): void {
  out.push({
    type: 'sector',
    id,
    center,
    radius: r,
    from: 0,
    to: 2 * Math.PI,
    fillOpacity: 0,
    rimWidth: RING_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
}

function label(
  out: Primitive[],
  id: string,
  at: Vec2,
  key: Parameters<typeof text>[0],
  role: 'muted' | 'accent' = 'muted',
  fontSize = LABEL_FONT_PX,
): void {
  out.push({
    type: 'readout',
    id,
    anchor: { world: at },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize,
    style: { colorRole: role, emphasis: 'strong' },
  });
}

/** 달 궤도의 투영 — 앞 반(y < 0)은 실선, 뒤 반은 점선. 지금 교점 각으로. */
function orbitHalves(omega: number, c: EclipseConstants): { front: Vec2[]; back: Vec2[] } {
  const front: Vec2[] = [];
  const back: Vec2[] = [];
  for (let k = 0; k <= ORBIT_SAMPLES / 2; k++) {
    // 뒤 반: φ ∈ [0, π] (y = d sin φ ≥ 0), 앞 반: φ ∈ [π, 2π].
    const phiBack = (Math.PI * k) / (ORBIT_SAMPLES / 2);
    back.push(projectMoon(moonOffset3(phiBack, omega, c)));
    front.push(projectMoon(moonOffset3(phiBack + Math.PI, omega, c)));
  }
  return { front, back };
}

export function scene(params: {
  state: EclipseState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('eclipse: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const h = halfMonths(timeline, c);
  const phi = moonPhaseAngle(h);
  const omega = nodeAngle(h, c);
  const o = moonOffset3(phi, omega, c);
  const moon = projectMoon(o);
  const earth: Vec2 = [EARTH_X, 0];
  const moonBehind = o[1] > 0;
  const hits = eclipseHits(o, c);

  const earthCone = umbraTriangle(earth, c.earthRadius, c);
  const moonCone = umbraTriangle(moon, c.moonRadius, c);

  const out: Primitive[] = [];

  // ---- 해 · 햇빛 ----
  out.push({
    type: 'body',
    id: 'sun',
    pos: [SUN.x, 0],
    shape: 'circle',
    size: SUN.r,
    glow: false,
    outline: 'line',
    light: 1,
  });
  label(out, 'sun-label', [SUN.x + SUN.r * SUN_LABEL_X_RATIO, SUN.r + SUN_LABEL_RISE], 'label.sun');
  out.push({
    type: 'lineSet',
    id: 'sunlight',
    lines: RAYS.ys.map((y): Vec2[] => [
      [RAYS.x0, y],
      [RAYS.x1, y],
    ]),
    width: RAY_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });
  label(out, 'sunlight-label', [(RAYS.x0 + RAYS.x1) / 2, RAYS.ys[RAYS.ys.length - 1]! + SUNLIGHT_LABEL_RISE], 'label.sunlight', 'muted', SMALL_FONT_PX);

  // ---- 지구 공전면 — 해 · 지구를 잇는 선. 그림자 축이 여기에 놓인다 ----
  out.push({
    type: 'trajectory',
    id: 'ecliptic',
    points: [
      [SUN.x + SUN.r + ECLIPTIC_START_GAP, 0],
      [SCENE_BOUNDS.maxX + EXTEND_PAST_EDGE, 0],
    ],
    width: PLANE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle', lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'ecliptic-label',
    anchor: { world: [ECLIPTIC_LABEL.x, ECLIPTIC_LABEL.y] },
    text: text('label.ecliptic'),
    chip: false,
    font: 'text',
    fontSize: SMALL_FONT_PX,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 삭 · 보름 자리 이름표 ----
  label(out, 'new-label', [EARTH_X - c.moonDistance, SYZYGY_LABEL_Y], 'label.newMoon', 'muted', SMALL_FONT_PX);
  label(out, 'full-label', [EARTH_X + c.moonDistance, SYZYGY_LABEL_Y], 'label.fullMoon', 'muted', SMALL_FONT_PX);

  // ---- 지구 그림자 — 늘 오른쪽으로 ----
  umbraCone(out, 'earth-umbra', earthCone, EARTH_CONE_FILL);

  // ---- 달 궤도 뒤 반 ----
  const orbit = orbitHalves(omega, c);
  out.push({
    type: 'trajectory',
    id: 'orbit-back',
    points: orbit.back,
    width: ORBIT_WIDTH_PX,
    style: { colorRole: 'secondary', emphasis: 'subtle', lineStyle: 'dashed' },
  });

  /** 달과 그 그림자 · 월식 자리. 달이 지구 뒤면 지구보다 먼저, 앞이면 나중에 선언한다. */
  const pushMoon = (): void => {
    umbraCone(out, 'moon-umbra', moonCone, MOON_CONE_FILL);
    celestialBody(out, 'moon', moon, c.moonRadius);
    if (hits.lunar) {
      shadowedPatch(out, 'lunar-patch', clipConvex(discPolygon(moon, c.moonRadius), earthCone), LUNAR_ECLIPSE_LIGHT);
    }
  };

  if (moonBehind) pushMoon();

  // ---- 지구 · 일식 자리 ----
  celestialBody(out, 'earth', earth, c.earthRadius);
  if (hits.solar) {
    shadowedPatch(out, 'solar-patch', clipConvex(discPolygon(earth, c.earthRadius), moonCone), 0);
  }
  label(out, 'earth-label', [EARTH_X, -c.earthRadius - EARTH_LABEL_DROP], 'label.earth');

  // ---- 달 궤도 앞 반 ----
  out.push({
    type: 'trajectory',
    id: 'orbit-front',
    points: orbit.front,
    width: ORBIT_WIDTH_PX,
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });

  if (!moonBehind) pushMoon();
  label(out, 'moon-label', [moon[0], moon[1] + c.moonRadius + MOON_LABEL_RISE], 'label.moon', 'muted', SMALL_FONT_PX);

  // ---- 닿은 자리 — 강조색 한 뜻 ----
  if (hits.solar) {
    contactRing(out, 'solar-ring', hits.solarSpot, SOLAR_RING_R);
    label(out, 'solar-label', [hits.solarSpot[0] + SOLAR_LABEL_SHIFT[0], hits.solarSpot[1] + SOLAR_LABEL_SHIFT[1]], 'label.solarEclipse', 'accent');
  }
  if (hits.lunar) {
    contactRing(out, 'lunar-ring', moon, c.moonRadius + RING_PAD);
    label(out, 'lunar-label', [moon[0] + LUNAR_LABEL_SHIFT[0], moon[1] + c.moonRadius + LUNAR_LABEL_SHIFT[1]], 'label.lunarEclipse', 'accent');
  }

  // ---- 과장 안내 ----
  out.push({
    type: 'readout',
    id: 'note',
    anchor: { world: [NOTE_ANCHOR.x, NOTE_ANCHOR.y] },
    text: text('label.note'),
    vars: { tilt: String(c.inclination), scale: String(c.inclinationScale) },
    chip: false,
    font: 'text',
    fontSize: SMALL_FONT_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
