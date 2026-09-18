// ========================================================================
// stellar-parallax — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 한 판. 왼쪽에 태양(body, 빛 세기) · 공전 궤도(trajectory closed) · 지구(body). 오른쪽으로
// 가까운 별(1 pc)과 두 배 먼 별(2 pc). 별마다 뒤에 **별을 중심으로 한** 배경 원호(surface arc)와
// 흩뿌린 배경 별(particleSystem)이 있다. 지구에서 별을 지나 원호에 닿는 시선(trajectory)의 끝점이
// 배경 별 사이에서 그 별이 보이는 자리다(강조색 점). 원호가 별 중심이라 점이 오가는 폭이 각에
// 정확히 비례한다.
//
// 첫 해(`sweep`) — 지구가 돌며 두 점이 원호 위를 오가고, 쓸고 지나간 범위(강조색 굵은 호)가 자란다.
// 둘째 해(`measure`) — 한 해 동안의 두 시선 쐐기(sector)와, 별에서 1 AU 가 보이는 각 p(sector) ·
// 「d pc · p″」 이름표가 별에 매달린다.
//
// 강조색은 「지구에서 본 시선과 그 시선이 배경에 닿는 자리」 한 뜻에만 쓴다.
// 캡션은 선언의 캡션 슬롯이 그린다.
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
  BG_R,
  BG_SEED,
  EARTH_R,
  IMAGE_R,
  ORBIT_R,
  SCENE_BOUNDS,
  STAR_R,
  SUN,
  SUN_R,
  text,
} from './schema';
import {
  apparentOffset,
  arcHalf,
  backgroundStarPos,
  earthAngle,
  farStar,
  fullSwing,
  nearStar,
  onBackground,
  onOrbit,
  orbitTurns,
  perpendicularEarth,
  readConstants,
  scatterBackground,
  sweptRange,
  type StarGeom,
} from './physics';
import type { StellarParallaxState } from './state';

/** 선 굵기(화면 px). 위계라 배율을 따르지 않는다. */
const ORBIT_WIDTH_PX = 1.2;
const SIGHT_WIDTH_PX = 1.6;
const SWEPT_WIDTH_PX = 5;
const GUIDE_WIDTH_PX = 1;
const P_RIM_WIDTH_PX = 1.5;
/** 글자 크기(화면 px). */
const LABEL_FONT_PX = 12;
const STAR_FONT_PX = 13;
const NOTE_FONT_PX = 11;
/** 배경 별 점 크기(화면 px) — 가장 어두운 별 · 가장 밝은 별. */
const BG_STAR_MIN_PX = 1.2;
const BG_STAR_MAX_PX = 2.8;
/** 쓸고 지나간 범위 호의 불투명도 — 점과 배경 별이 그 위에서 읽혀야 한다. */
const SWEPT_OPACITY = 0.3;
/** 두 시선 쐐기의 채움 불투명도. */
const WEDGE_FILL_OPACITY = 0.1;
/** p 부채꼴의 채움 불투명도 · 반지름(월드). */
const P_FILL_OPACITY = 0.25;
const P_SECTOR_R = 90;
/** 둘째 해 표지가 떠오르는 폭(단계 진행도 몫). */
const MEASURE_FADE_SPAN = 0.1;
/** 쓸린 범위를 찾는 표본 수 · 궤도 원을 표본하는 점 수. */
const SWEEP_SAMPLES = 90;
const ORBIT_SAMPLES = 120;
/** 궤도 위 p 기준점(1 AU 가 수직으로 보이는 자리)의 점 크기(월드). */
const PERP_MARK_R = 2.5;

/** 이름표 자리(월드) — 시선 · 쐐기 · 원호가 한 해 동안 지나가지 않는 곳 (첫 촬영으로 잡았다). */
const NEAR_LABEL_AT: Vec2 = [330, 286];
const FAR_LABEL_AT: Vec2 = [600, 84];
const BACKGROUND_LABEL_AT: Vec2 = [562, 292];
/** 태양 · 궤도 이름표가 둘레에서 떨어진 거리(월드). */
const SUN_LABEL_GAP = 12;
const ORBIT_LABEL_GAP = 30;
/** 과장 배율 문구 — 화면 오른쪽 위 모서리에서 띄운 거리(화면 px). */
const NOTE_OFFSET: Vec2 = [-16, 12];

/** 흩뿌린 배경 별 — 시드가 선언값이라 모듈 로드 때 한 번 만든다(같은 시드 = 같은 별). */
const BACKGROUND = scatterBackground(BG_SEED);

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/** 점 p 에서 q 를 향한 각(라디안). */
function angleTo(p: Vec2, q: Vec2): number {
  return Math.atan2(q[1] - p[1], q[0] - p[0]);
}

/** p 에서 q 쪽으로 d 만큼 나아간 점. */
function toward(p: Vec2, q: Vec2, d: number): Vec2 {
  const a = angleTo(p, q);
  return [p[0] + d * Math.cos(a), p[1] + d * Math.sin(a)];
}

export function scene(params: {
  state: StellarParallaxState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('stellar-parallax: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const turns = orbitTurns(timeline);
  const a = earthAngle(turns);
  const earth = onOrbit(a);
  const firstYear = timeline.at('sweep');
  const measure = clamp01(timeline.at('measure') / MEASURE_FADE_SPAN);

  const stars: { id: string; s: StarGeom; d: number; p: number; labelAt: Vec2 }[] = [
    { id: 'near', s: nearStar(c), d: c.nearDistancePc, p: c.nearParallaxArcsec, labelAt: NEAR_LABEL_AT },
    { id: 'far', s: farStar(c), d: c.farDistancePc, p: c.farParallaxArcsec, labelAt: FAR_LABEL_AT },
  ];

  const out: Primitive[] = [];

  // 공전 궤도.
  const orbit: Vec2[] = [];
  for (let k = 0; k < ORBIT_SAMPLES; k++) orbit.push(onOrbit((k / ORBIT_SAMPLES) * 2 * Math.PI));
  out.push({
    type: 'trajectory',
    id: 'orbit',
    points: orbit,
    closed: true,
    width: ORBIT_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // ---- 둘째 해 — 두 시선 쐐기 · 태양 쪽 선 · p 부채꼴 (시선 아래에 깐다) ----
  if (measure > 0) {
    for (const { id, s } of stars) {
      const swing = fullSwing(s);
      out.push({
        type: 'sector',
        id: `${id}-wedge`,
        center: s.pos,
        radius: BG_R,
        from: s.dir - swing,
        to: s.dir + swing,
        fillOpacity: WEDGE_FILL_OPACITY,
        rimWidth: 0,
        opacity: measure,
        style: { colorRole: 'accent', emphasis: 'medium' },
      });

      const sunEdge = toward([SUN.x, SUN.y], s.pos, SUN_R);
      const perp = perpendicularEarth(s);
      out.push({
        type: 'trajectory',
        id: `${id}-sun-line`,
        points: [toward(s.pos, sunEdge, STAR_R), sunEdge],
        width: GUIDE_WIDTH_PX,
        opacity: measure,
        style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
      });
      out.push({
        type: 'trajectory',
        id: `${id}-au-line`,
        points: [toward(s.pos, perp, STAR_R), perp],
        width: GUIDE_WIDTH_PX,
        opacity: measure,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
      out.push({
        type: 'body',
        id: `${id}-au-mark`,
        pos: perp,
        shape: 'circle',
        size: PERP_MARK_R,
        glow: false,
        outline: 'none',
        opacity: measure,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });

      // p — 별에서 태양–지구(1 AU)가 보이는 각.
      const toSun = angleTo(s.pos, [SUN.x, SUN.y]);
      const toPerp = angleTo(s.pos, perp);
      out.push({
        type: 'sector',
        id: `${id}-p`,
        center: s.pos,
        radius: P_SECTOR_R,
        from: toSun,
        to: toSun + Math.atan2(Math.sin(toPerp - toSun), Math.cos(toPerp - toSun)),
        fillOpacity: P_FILL_OPACITY,
        rimWidth: P_RIM_WIDTH_PX,
        opacity: measure,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
    }
  }

  // ---- 배경 원호 · 배경 별 ----
  for (const { id, s } of stars) {
    const half = arcHalf(s);
    out.push({
      type: 'surface',
      id: `${id}-background-arc`,
      geometry: { kind: 'arc', center: s.pos, radius: BG_R, from: s.dir - half, to: s.dir + half },
      material: 'transparent',
      style: { colorRole: 'muted', emphasis: 'medium' },
    });
  }
  const bgPositions: Vec2[] = [];
  const bgSizes: number[] = [];
  stars.forEach(({ s }, i) => {
    for (const b of BACKGROUND[i]!) {
      bgPositions.push(backgroundStarPos(s, b));
      bgSizes.push(BG_STAR_MIN_PX + (BG_STAR_MAX_PX - BG_STAR_MIN_PX) * b.bright);
    }
  });
  out.push({
    type: 'particleSystem',
    id: 'background-stars',
    positions: bgPositions,
    sizes: bgSizes,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });

  // ---- 쓸고 지나간 범위 · 시선 · 별 · 보이는 자리 ----
  for (const { id, s } of stars) {
    const [lo, hi] = firstYear < 1 ? sweptRange(s, firstYear, SWEEP_SAMPLES) : [-fullSwing(s), fullSwing(s)];
    if (hi > lo) {
      // 채움 없이 테두리 호만 — `sector` 는 곧은 두 변을 긋지 않으므로 굵은 원호가 된다.
      out.push({
        type: 'sector',
        id: `${id}-swept`,
        center: s.pos,
        radius: BG_R,
        from: s.dir + lo,
        to: s.dir + hi,
        fillOpacity: 0,
        rimWidth: SWEPT_WIDTH_PX,
        opacity: SWEPT_OPACITY,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    const image = onBackground(s, apparentOffset(s, a));
    out.push({
      type: 'trajectory',
      id: `${id}-sight`,
      points: [toward(earth, s.pos, EARTH_R), toward(image, s.pos, IMAGE_R)],
      width: SIGHT_WIDTH_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: `${id}-star`,
      pos: s.pos,
      shape: 'circle',
      size: STAR_R,
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: `${id}-image`,
      pos: image,
      shape: 'circle',
      size: IMAGE_R,
      glow: false,
      outline: 'background',
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 태양 · 지구 ----
  out.push({
    type: 'body',
    id: 'sun',
    pos: [SUN.x, SUN.y],
    shape: 'circle',
    size: SUN_R,
    glow: false,
    outline: 'line',
    light: 1,
  });
  out.push({
    type: 'readout',
    id: 'sun-label',
    anchor: { world: [SUN.x, SUN.y - SUN_R - SUN_LABEL_GAP] },
    text: text('label.sun'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'orbit-label',
    anchor: { world: [SUN.x, SUN.y - ORBIT_R - ORBIT_LABEL_GAP] },
    text: text('label.orbit'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'earth',
    pos: earth,
    shape: 'circle',
    size: EARTH_R,
    glow: false,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 이름표 ----
  // 별 이름표 — 거리 · p 는 스테이지 상수를 그대로 띄운다(유효숫자를 계산으로 줄이지 않는다).
  for (const { id, d, p, labelAt } of stars) {
    out.push({
      type: 'readout',
      id: `${id}-label`,
      anchor: { world: labelAt },
      text: text('label.star'),
      vars: { d: String(d), p: String(p) },
      chip: false,
      font: 'text',
      fontSize: STAR_FONT_PX,
      weight: 'bold',
      opacity: measure,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'readout',
    id: 'background-label',
    anchor: { world: BACKGROUND_LABEL_AT },
    text: text('label.background'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'exaggeration-note',
    anchor: { screen: 'top-right', offset: NOTE_OFFSET },
    text: text('label.exaggeration'),
    vars: { k: String(c.angleExaggeration) },
    chip: false,
    font: 'text',
    fontSize: NOTE_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
