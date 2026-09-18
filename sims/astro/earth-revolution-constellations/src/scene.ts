// ========================================================================
// earth-revolution-constellations — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽 — 북극 위에서 내려다본 태양(body, 빛 세기) · 공전 궤도(trajectory closed) · 낮 · 밤 반쪽
// 지구(sector 둘, 빛 세기) · 둘레의 황도 12 별자리 이름 고리(readout). 지구에서 궤도 바깥으로
// 뻗은 강조색 화살이 한밤에 보는 쪽이고, 태양 쪽 쐐기(sector) 안의 이름은 햇빛에 묻혀 옅다.
// 오른쪽 — 한밤에 남쪽을 본 하늘 창. 황도 띠를 황경으로 펴서 흩뿌린 별(particleSystem) ·
// 이름(readout)을 창 안에만 그린다(clip). 지구가 돌면 별자리가 서쪽(오른쪽)으로 흘러 창을 지난다.
// 캡션은 선언의 캡션 슬롯이 그린다.
//
// 강조색은 「한밤 정남 쪽」 한 뜻에만 쓴다 — 왼쪽 화살, 오른쪽 정남 선, 그리고 두 판에서 그 자리에
// 가장 가까운 별자리 이름. 두 판의 강조색 이름은 같은 대상이다.
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
  EARTH_R,
  GLARE_LABEL_OUTSET,
  ORBIT_R,
  RING_R,
  SCENE_BOUNDS,
  SIGHT,
  SKY,
  SKY_COMPASS_Y,
  SKY_EDGE_FADE_DEG,
  SKY_NAME_Y,
  SKY_STAR_SPREAD_Y,
  SKY_STAR_Y,
  SKY_TITLE_Y,
  STAR_SEED,
  SUN_R,
  TOP,
  ZODIAC,
  text,
  type EarthRevolutionConstellationsMessageKey,
} from './schema';
import {
  DEG,
  earthLongitude,
  midnightIndex,
  nightVisibility,
  offsetFromMidnight,
  readConstants,
  scatterStars,
  yearFraction,
  type Season,
} from './physics';
import type { EarthRevolutionConstellationsState } from './state';

/** 선 굵기(화면 px). 위계라 배율을 따르지 않는다. */
const ORBIT_WIDTH_PX = 1.2;
const OUTLINE_WIDTH_PX = 1;
const SUN_LINE_WIDTH_PX = 1.2;
const SIGHT_WIDTH_PX = 2.5;
const FRAME_WIDTH_PX = 1;
const HORIZON_WIDTH_PX = 2;
const MERIDIAN_WIDTH_PX = 1.5;
/** 글자 크기(화면 px). */
const NAME_FONT_PX = 12;
const LABEL_FONT_PX = 13;
/** 별 점 크기(화면 px) — 가장 어두운 별 · 가장 밝은 별. */
const STAR_MIN_PX = 1.4;
const STAR_MAX_PX = 3.4;
/** 햇빛에 묻힌 이름도 자리는 남긴다 — 사라지면 「고리가 끊긴 것」 으로 읽힌다. */
const HIDDEN_NAME_OPACITY = 0.2;
/** 햇빛 쐐기 채움 · 쐐기가 이름 바깥까지 덮는 여유(월드). */
const GLARE_FILL_OPACITY = 0.14;
const GLARE_OVERREACH = 22;
/** 그늘 반쪽의 빛 세기 — 이웃 조각(earth-rotation-day-night)과 같은 값. 햇빛 반쪽은 1. */
const NIGHT_LIGHT = 0.04;
/** 태양 이름표가 태양 둘레에서 떨어진 거리(월드). */
const SUN_LABEL_GAP = 14;

const HALF = Math.PI / 2;
/** 궤도 원을 표본하는 점 수. */
const ORBIT_SAMPLES = 120;

/** 창 이름표 — 계절(시간표 단계) → 문안 키. */
const SKY_TITLE: Record<Season, EarthRevolutionConstellationsMessageKey> = {
  spring: 'label.sky.spring',
  summer: 'label.sky.summer',
  autumn: 'label.sky.autumn',
  winter: 'label.sky.winter',
};

/** 흩뿌린 별 — 시드가 선언값이라 모듈 로드 때 한 번 만든다(같은 시드 = 같은 별). */
const STARS = scatterStars(STAR_SEED);

/** 왼쪽 판 중심에서 반지름 r · 각 a(라디안)의 점. */
function onTop(r: number, a: number): Vec2 {
  return [TOP.cx + r * Math.cos(a), TOP.cy + r * Math.sin(a)];
}

function isSeason(id: string): id is Season {
  return id in SKY_TITLE;
}

export function scene(params: {
  state: EarthRevolutionConstellationsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('earth-revolution-constellations: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const earthLon = earthLongitude(yearFraction(timeline), c);
  const theta = earthLon * DEG;
  const sunDir = theta + Math.PI; // 지구에서 본 태양 쪽
  const earth = onTop(ORBIT_R, theta);
  const now = midnightIndex(earthLon);
  const out: Primitive[] = [];

  // ================= 왼쪽 — 위에서 본 공전 =================

  // 햇빛 쐐기 — 지구에서 본 태양 쪽 ±glare. 별자리는 무한히 멀어 방향만 뜻이 있으므로
  // 태양을 꼭짓점으로 두면 고리 위 각이 곧 지구에서 본 방향이다 (physics 머리글).
  out.push({
    type: 'sector',
    id: 'glare',
    center: [TOP.cx, TOP.cy],
    radius: RING_R + GLARE_OVERREACH,
    from: sunDir - c.glareDeg * DEG,
    to: sunDir + c.glareDeg * DEG,
    fillOpacity: GLARE_FILL_OPACITY,
    rimWidth: 0,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 태양 쪽 시선 — 지구에서 태양까지. 그 너머는 쐐기가 말한다.
  out.push({
    type: 'trajectory',
    id: 'sun-line',
    points: [onTop(ORBIT_R - EARTH_R - SIGHT.gap, theta), [TOP.cx, TOP.cy]],
    width: SUN_LINE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
  });

  // 공전 궤도.
  const orbit: Vec2[] = [];
  for (let k = 0; k < ORBIT_SAMPLES; k++) orbit.push(onTop(ORBIT_R, (k / ORBIT_SAMPLES) * 2 * Math.PI));
  out.push({
    type: 'trajectory',
    id: 'orbit',
    points: orbit,
    closed: true,
    width: ORBIT_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // 태양 — 빛 세기. 라이트 바탕에 묻히지 않게 둘레를 긋는다 (G92).
  out.push({
    type: 'body',
    id: 'sun',
    pos: [TOP.cx, TOP.cy],
    shape: 'circle',
    size: SUN_R,
    glow: false,
    outline: 'line',
    light: 1,
  });
  out.push({
    type: 'readout',
    id: 'sun-label',
    // 지구 반대편(쐐기 안)에 둔다 — 지구 · 점선과 겹치지 않는 자리는 태양 너머뿐이다.
    anchor: { world: onTop(SUN_R + SUN_LABEL_GAP, sunDir) },
    text: text('label.sun'),
    chip: false,
    font: 'text',
    fontSize: NAME_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 지구 — 태양 쪽 반이 낮, 반대쪽 반이 밤.
  out.push({
    type: 'sector',
    id: 'earth-night',
    center: earth,
    radius: EARTH_R,
    from: sunDir + HALF,
    to: sunDir + 3 * HALF,
    fillOpacity: 1,
    rimWidth: 0,
    light: NIGHT_LIGHT,
  });
  out.push({
    type: 'sector',
    id: 'earth-day',
    center: earth,
    radius: EARTH_R,
    from: sunDir - HALF,
    to: sunDir + HALF,
    fillOpacity: 1,
    rimWidth: 0,
    light: 1,
  });
  out.push({
    type: 'sector',
    id: 'earth-outline',
    center: earth,
    radius: EARTH_R,
    from: 0,
    to: 2 * Math.PI,
    fillOpacity: 0,
    rimWidth: OUTLINE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 한밤에 보는 쪽 — 밤 반쪽 한가운데에서 궤도 바깥으로.
  const sightFrom = onTop(ORBIT_R + EARTH_R + SIGHT.gap, theta);
  const sightTo = onTop(RING_R - SIGHT.stopBeforeRing, theta);
  out.push({
    type: 'vector',
    id: 'midnight-sight',
    from: sightFrom,
    delta: [sightTo[0] - sightFrom[0], sightTo[1] - sightFrom[1]],
    width: SIGHT_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 황도 12 별자리 고리 — 태양에 가까울수록 옅다(햇빛에 묻힘). 한밤 정남 쪽 하나는 강조색.
  ZODIAC.forEach((z, i) => {
    const vis = nightVisibility(z.lon, earthLon, c);
    out.push({
      type: 'readout',
      id: `ring-${z.key}`,
      anchor: { world: onTop(RING_R, z.lon * DEG) },
      text: text(z.key),
      chip: false,
      font: 'text',
      fontSize: NAME_FONT_PX,
      weight: i === now ? 'bold' : 'normal',
      opacity: HIDDEN_NAME_OPACITY + (1 - HIDDEN_NAME_OPACITY) * vis,
      style: i === now ? { colorRole: 'accent', emphasis: 'strong' } : { colorRole: 'ink', emphasis: 'medium' },
    });
  });
  out.push({
    type: 'readout',
    id: 'glare-label',
    anchor: { world: onTop(RING_R + GLARE_LABEL_OUTSET, sunDir) },
    text: text('label.glare'),
    chip: false,
    font: 'text',
    fontSize: NAME_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ================= 오른쪽 — 한밤의 남쪽 하늘 =================

  const midX = (SKY.x0 + SKY.x1) / 2;
  const pxPerDeg = (SKY.x1 - SKY.x0) / 2 / c.windowHalfDeg;
  const clip = { min: [SKY.x0, SKY.y0] as Vec2, max: [SKY.x1, SKY.y1] as Vec2 };
  /** 창 가장자리로 갈수록 옅게 — 경계에서 뚝 끊기지 않게. */
  const edgeFade = (d: number): number =>
    Math.max(0, Math.min(1, (c.windowHalfDeg - Math.abs(d)) / SKY_EDGE_FADE_DEG));

  out.push({
    type: 'trajectory',
    id: 'sky-frame',
    points: [
      [SKY.x0, SKY.y0],
      [SKY.x1, SKY.y0],
      [SKY.x1, SKY.y1],
      [SKY.x0, SKY.y1],
    ],
    closed: true,
    width: FRAME_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // 별 — 남쪽을 보면 동쪽이 왼쪽. 황경이 큰(동쪽) 별자리가 왼쪽이다.
  const positions: Vec2[] = [];
  const sizes: number[] = [];
  const opacities: number[] = [];
  ZODIAC.forEach((z, i) => {
    for (const s of STARS[i]!) {
      const d = offsetFromMidnight(z.lon + s.dLon, earthLon);
      if (Math.abs(d) > c.windowHalfDeg) continue;
      positions.push([midX - d * pxPerDeg, SKY_STAR_Y + s.v * SKY_STAR_SPREAD_Y]);
      sizes.push(STAR_MIN_PX + (STAR_MAX_PX - STAR_MIN_PX) * s.bright);
      opacities.push(edgeFade(d));
    }
  });
  out.push({
    type: 'particleSystem',
    id: 'sky-stars',
    positions,
    sizes,
    opacities,
    clip,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 정남 선 — 한밤에 이 선 위에 오는 것이 태양 정반대 쪽이다.
  out.push({
    type: 'trajectory',
    id: 'sky-meridian',
    points: [
      [midX, SKY.y0],
      [midX, SKY.y1],
    ],
    width: MERIDIAN_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'medium', lineStyle: 'dashed' },
  });

  // 별자리 이름 — 창 안에 드는 것만.
  ZODIAC.forEach((z, i) => {
    const d = offsetFromMidnight(z.lon, earthLon);
    if (Math.abs(d) > c.windowHalfDeg) return;
    out.push({
      type: 'readout',
      id: `sky-${z.key}`,
      anchor: { world: [midX - d * pxPerDeg, SKY_NAME_Y] },
      text: text(z.key),
      chip: false,
      font: 'text',
      fontSize: NAME_FONT_PX,
      weight: i === now ? 'bold' : 'normal',
      opacity: edgeFade(d),
      clip,
      style: i === now ? { colorRole: 'accent', emphasis: 'strong' } : { colorRole: 'ink', emphasis: 'medium' },
    });
  });

  // 지평선 — 창의 아래 변.
  out.push({
    type: 'trajectory',
    id: 'sky-horizon',
    points: [
      [SKY.x0, SKY.y0],
      [SKY.x1, SKY.y0],
    ],
    width: HORIZON_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });
  const compass: { x: number; key: EarthRevolutionConstellationsMessageKey; accent: boolean }[] = [
    { x: SKY.x0, key: 'label.east', accent: false },
    { x: midX, key: 'label.south', accent: true },
    { x: SKY.x1, key: 'label.west', accent: false },
  ];
  for (const k of compass) {
    out.push({
      type: 'readout',
      id: `sky-compass-${k.key}`,
      anchor: { world: [k.x, SKY_COMPASS_Y] },
      text: text(k.key),
      chip: false,
      font: 'text',
      fontSize: NAME_FONT_PX,
      style: k.accent ? { colorRole: 'accent', emphasis: 'strong' } : { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 창 이름 — 지금 계절의 한밤 하늘. 같은 자리에서 문안만 갈아 끼운다 (G109).
  if (isSeason(timeline.phase)) {
    out.push({
      type: 'readout',
      id: 'sky-title',
      anchor: { world: [midX, SKY_TITLE_Y] },
      text: text(SKY_TITLE[timeline.phase]),
      chip: false,
      font: 'text',
      fontSize: LABEL_FONT_PX,
      weight: 'bold',
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
