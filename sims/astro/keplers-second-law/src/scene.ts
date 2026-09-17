// ========================================================================
// keplers-second-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
// 부채꼴 · 막대 = region, 궤도 · 동경 · 기준선 = trajectory, 태양 · 행성 = body,
// 막대 이름 = readout, 캡션 = 선언의 캡션 슬롯.
// ========================================================================

import type {
  EnvironmentDef,
  Primitive,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  ORBIT_CENTER,
  SEMI_MAJOR,
  SEMI_MINOR,
  SLOTS,
  SLOT_AREA_IDEAL,
  SLOT_COUNT,
  SUN,
  positionAt,
  slotStartM,
  sweepNow,
} from './physics';
import { SCENE_BOUNDS, SLOT_PHASE_IDS, text } from './schema';
import type { KeplersSecondLawState } from './state';

// ---- 배치(월드 = 원본 px / 100, y 위) ----
/** 막대 영역. 원본 BAR_LEFT 604 · BAR_RIGHT 844 · BAR_BASE 262 · BAR_FULL 190 px. */
const BAR_LEFT = 6.04;
const BAR_RIGHT = 8.44;
const BAR_BASE = (320 - 262) / 100;
const BAR_FULL = 1.9;
const BAR_PITCH = (BAR_RIGHT - BAR_LEFT) / SLOT_COUNT;
/** 막대 사이 틈의 절반(원본 3 px). */
const BAR_INSET = 0.03;
/** 기준선이 막대 양옆으로 나오는 길이(원본 4 px). */
const RULE_OVERHANG = 0.04;
/** 막대 이름 자리 — 바닥선 아래 24 px. */
const BAR_LABEL_Y = BAR_BASE - 0.24;
/** 칸 경계 선의 반폭(원본 굵기 1.5 px). */
const SEAM_HALF_WIDTH = 0.0075;
/** 태양 · 행성 반지름(원본 9 · 5.5 px). */
const SUN_RADIUS = 0.09;
const PLANET_RADIUS = 0.055;
/** 궤도 타원 표본 수. */
const ORBIT_SAMPLES = 180;

// ---- 선언 필드 값(원본 선 굵기 · 톤) ----
/** 끝난 칸 두 톤의 채움 불투명도 — 짝 칸 옅게, 홀 칸 한 단 짙게. */
const TONE_EVEN_FILL = 0.22;
const TONE_ODD_FILL = 0.36;
/** 원본 궤도 · 동경 굵기 1.2 px, 기준선 1 px. */
const ORBIT_WIDTH_PX = 1.2;
const RADIUS_LINE_WIDTH_PX = 1.2;
const RULE_WIDTH_PX = 1;
/** 막대 이름 글자(원본 13 px). */
const BAR_LABEL_FONT_PX = 13;

/**
 * 태양을 꼭짓점으로 하는 부채꼴 여러 개를 **한 region** 으로 잇는다. 부채꼴마다 태양으로
 * 돌아왔다가 다음 부채꼴로 나가므로 떨어진 면이 태양 한 점에서만 닿는다 (면 묶음 부족, NOTES).
 */
function fansPolygon(indices: readonly number[]): Vec2[] {
  const out: Vec2[] = [];
  for (const i of indices) {
    out.push(SUN);
    out.push(...SLOTS[i]!.points);
  }
  return out;
}

/** 막대 여러 개를 바닥선을 따라 이은 한 다각형. 사이 틈은 넓이 0 인 바닥 변이다. */
function barsPolygon(bars: readonly { i: number; area: number }[]): Vec2[] {
  const out: Vec2[] = [];
  for (const { i, area } of bars) {
    const h = (area / SLOT_AREA_IDEAL) * BAR_FULL;
    const x0 = BAR_LEFT + i * BAR_PITCH + BAR_INSET;
    const x1 = BAR_LEFT + (i + 1) * BAR_PITCH - BAR_INSET;
    out.push([x0, BAR_BASE], [x0, BAR_BASE + h], [x1, BAR_BASE + h], [x1, BAR_BASE]);
  }
  return out;
}

/**
 * 칸 경계 12개를 한 다각형으로. 태양에서 경계점까지 일정한 폭의 띠를 같은 방향으로 돌아
 * 잇는다. 이음 부분은 태양 원판 안(반폭 크기)에 들어가 가려진다.
 */
function seamsPolygon(): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < SLOT_COUNT; i++) {
    const p = positionAt(slotStartM(i));
    const dx = p[0] - SUN[0];
    const dy = p[1] - SUN[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * SEAM_HALF_WIDTH;
    const ny = (dx / len) * SEAM_HALF_WIDTH;
    out.push(
      [SUN[0] + nx, SUN[1] + ny],
      [p[0] + nx, p[1] + ny],
      [p[0] - nx, p[1] - ny],
      [SUN[0] - nx, SUN[1] - ny],
    );
  }
  return out;
}

function orbitPoints(): Vec2[] {
  return Array.from({ length: ORBIT_SAMPLES }, (_, k) => {
    const E = (k / ORBIT_SAMPLES) * 2 * Math.PI;
    return [ORBIT_CENTER[0] + SEMI_MAJOR * Math.cos(E), ORBIT_CENTER[1] + SEMI_MINOR * Math.sin(E)] as Vec2;
  });
}

export function scene(params: {
  state: KeplersSecondLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('keplers-second-law: schema.timeline 이 선언되어야 한다');

  // 지금 칸 = 지금 단계, 쓸고 간 몫 = 단계 진행도.
  const k = SLOT_PHASE_IDS.indexOf(timeline.phase);
  if (k < 0) throw new Error(`keplers-second-law: 모르는 단계 ${timeline.phase}`);
  const now = sweepNow(k, timeline.progress);

  const others = Array.from({ length: SLOT_COUNT }, (_, i) => i).filter((i) => i !== k);
  const even = others.filter((i) => i % 2 === 0);
  const odd = others.filter((i) => i % 2 === 1);

  const out: Primitive[] = [];

  // ---- 끝난 부채꼴 ---- 짝 · 홀 두 톤. 색으로 뜻을 가르는 것이 아니라 이웃 칸의 경계를 보이려는 것.
  const tone = (id: string, points: Vec2[], fillOpacity: number): Region => ({
    type: 'region',
    id,
    points,
    fillOpacity,
    opaque: true,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });
  out.push(tone('fans-even', fansPolygon(even), TONE_EVEN_FILL));
  out.push(tone('fans-odd', fansPolygon(odd), TONE_ODD_FILL));

  // ---- 지금 쓸고 있는 부채꼴 ---- 강조색은 "지금 쓸고 있는 넓이" 하나에만.
  if (now.area > 0) {
    out.push({
      type: 'region',
      id: 'fan-now',
      points: [SUN, ...now.points],
      fillOpacity: 1,
      opaque: true,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 칸 경계 ---- 바탕색 이음매. 선에 바탕색 역할이 없어 바탕을 까는 면으로 근사한다.
  out.push({
    type: 'region',
    id: 'seams',
    points: seamsPolygon(),
    fillOpacity: 0,
    opaque: true,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });

  // ---- 궤도 ----
  const orbit: Trajectory = {
    type: 'trajectory',
    id: 'orbit',
    points: orbitPoints(),
    closed: true,
    width: ORBIT_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(orbit);

  // ---- 태양–행성 선 ----
  out.push({
    type: 'trajectory',
    id: 'radius-line',
    points: [SUN, now.planet],
    width: RADIUS_LINE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 태양 · 행성 ----
  out.push({
    type: 'body',
    id: 'sun',
    shape: 'circle',
    pos: SUN,
    size: SUN_RADIUS,
    glow: false,
    outline: 'none',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'planet',
    shape: 'circle',
    pos: now.planet,
    size: PLANET_RADIUS,
    glow: false,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 넓이 막대 ---- 끝난 칸은 부채꼴과 같은 톤 · 같은 순서, 지금 칸은 강조색으로 자란다.
  const bar = (i: number): { i: number; area: number } => ({ i, area: SLOTS[i]!.area });
  out.push(tone('bars-even', barsPolygon(even.map(bar)), TONE_EVEN_FILL));
  out.push(tone('bars-odd', barsPolygon(odd.map(bar)), TONE_ODD_FILL));
  if (now.area > 0) {
    out.push({
      type: 'region',
      id: 'bar-now',
      points: barsPolygon([{ i: k, area: now.area }]),
      fillOpacity: 1,
      opaque: true,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 같은 높이 기준선 ---- 타원 넓이의 12분의 1. 눈금 · 숫자는 두지 않는다.
  out.push({
    type: 'trajectory',
    id: 'equal-height',
    points: [
      [BAR_LEFT - RULE_OVERHANG, BAR_BASE + BAR_FULL],
      [BAR_RIGHT + RULE_OVERHANG, BAR_BASE + BAR_FULL],
    ],
    width: RULE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'trajectory',
    id: 'bar-floor',
    points: [
      [BAR_LEFT - RULE_OVERHANG, BAR_BASE],
      [BAR_RIGHT + RULE_OVERHANG, BAR_BASE],
    ],
    width: RULE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // ---- 막대 이름 ----
  out.push({
    type: 'readout',
    id: 'bars-label',
    anchor: { world: [(BAR_LEFT + BAR_RIGHT) / 2, BAR_LABEL_Y] },
    text: text('label.bars'),
    chip: false,
    font: 'text',
    align: 'center',
    fontSize: BAR_LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다.
  return { ...SCENE_BOUNDS };
}
