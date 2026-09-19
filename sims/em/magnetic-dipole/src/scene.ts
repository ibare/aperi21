// ========================================================================
// magnetic-dipole — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 같은 축척의 두 판 — 왼쪽 고리 전류, 오른쪽 막대자석. 축은 세로(N 이 위)다. 겹침 순서가
// 판정 장치라(`drawOrder: 'scene'`) 쓴 순서대로 그린다 — 자석 면 → 장선 → 자석 윤곽 · 고리 ·
// 도선 기호 · 방향 꺾쇠 → 겹쳐 본 자석의 선(점선) → 극 표식.
//
// - 장선 — 판마다 `lineSet` 하나. 원천 중심에서 배율 s 로 줄인다(state 의 선은 s = 1).
//   s 는 `zoomOut` 동안 1 → `farScale`, `reset` 동안 되돌아온다.
// - 겹쳐 본 선 — 자석의 선을 고리 판에 같은 배율로 옮긴 점선 `trajectory`. `ghostIn` 동안 떠오른다.
// - 고리 — 옅은 가로 타원(조금 위에서 본 고리), 왼쪽 도선 ⊙(화면 밖으로) · 오른쪽 ⊗(안으로),
//   타원 앞쪽 전류 화살표. 강조색은 한 뜻(전류)에만 쓴다.
// - 극 — 자석은 늘 N · S, 고리는 `poleIn` 동안 떠오른다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { levelReach, readConstants, type DipoleConstants, type FieldLine } from './physics';
import { PANEL_CENTER_X, PANEL_HALF_H, PANEL_HALF_W, SCENE_BOUNDS, text, type MagneticDipoleMessageKey } from './schema';
import type { MagneticDipoleState } from './state';

/** 장선 굵기(화면 px). */
const FIELD_LINE_PX = 1.4;
/** 겹쳐 본 자석 선(점선)의 굵기(화면 px). 실선과 겹쳤을 때 대시가 양옆으로 비어져 나와 읽힌다. */
const GHOST_LINE_PX = 1.6;
/** 판 가름선 굵기(화면 px)와 불투명도. 배경 정보라 옅다. */
const DIVIDER_PX = 1;
const DIVIDER_OPACITY = 0.5;
/** 고리 윤곽 굵기(화면 px)와 불투명도. */
const LOOP_OUTLINE_PX = 1.2;
const LOOP_OUTLINE_OPACITY = 0.7;
/** 자석 면의 채움 불투명도 — 속을 지나는 선이 비칠 만큼 옅다. */
const MAGNET_FILL_OPACITY = 0.22;
/** ⊗ 가위표 굵기(화면 px). */
const CROSS_PX = 1.6;
/** ⊙ 가운데 점의 반지름 · ⊗ 가위표 팔 길이 — 기호 원 반지름에 대한 비. */
const DOT_RATIO = 0.36;
const CROSS_RATIO = 0.62;
/** 고리 윤곽 타원을 이루는 꼭짓점 수. */
const LOOP_SEGMENTS = 48;
/** 방향 꺾쇠 한 팔의 길이(월드)와 선에서 벌어지는 각(rad). */
const CHEVRON_ARM = 0.08;
const CHEVRON_SPREAD = 0.55;
/** 타원 앞쪽 전류 화살표의 길이 — 고리 반지름에 대한 비 — 와 굵기(화면 px). */
const CURRENT_ARROW_RATIO = 0.55;
const CURRENT_ARROW_PX = 2;
/** 극 표식 글자 크기와 원천 중심에서 위 · 아래로 띄우는 거리(화면 px). */
const POLE_LABEL_PX = 15;
const POLE_OFFSET_PX = 34;
/** 이보다 옅은 것은 선언하지 않는다. */
const MIN_OPACITY = 0.01;

export function scene(params: {
  state: MagneticDipoleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) return [];
  const c = readConstants(stage);
  const out: Primitive[] = [];

  // 멀리 물러난 정도 — 0 가까이, 1 멀리.
  const away = tl.at('zoomOut') - tl.at('reset');
  const s = 1 - (1 - c.farScale) * away;
  const ghost = tl.at('ghostIn') - tl.at('reset');
  const loopPoles = tl.at('poleIn') - tl.at('reset');

  const loopC: Vec2 = [-PANEL_CENTER_X, 0];
  const magC: Vec2 = [PANEL_CENTER_X, 0];
  const place = (center: Vec2, p: Vec2): Vec2 => [center[0] + s * p[0], center[1] + s * p[1]];
  const clipOf = (center: Vec2): { min: Vec2; max: Vec2 } => ({
    min: [center[0] - PANEL_HALF_W, -PANEL_HALF_H],
    max: [center[0] + PANEL_HALF_W, PANEL_HALF_H],
  });

  // ---- 판 가름선 ----
  const divider: LineSet = {
    type: 'lineSet',
    id: 'divider',
    lines: [
      [
        [0, -PANEL_HALF_H],
        [0, PANEL_HALF_H],
      ],
    ],
    width: DIVIDER_PX,
    opacity: DIVIDER_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(divider);

  // ---- 자석 면 ----
  const hw = (c.magnetWidth / 2) * s;
  const hl = (c.magnetLength / 2) * s;
  const face: Region = {
    type: 'region',
    id: 'magnet-face',
    points: [
      [magC[0] - hw, -hl],
      [magC[0] + hw, -hl],
      [magC[0] + hw, hl],
      [magC[0] - hw, hl],
    ],
    fillOpacity: MAGNET_FILL_OPACITY,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(face);

  // ---- 장선 ----
  // 같은 대상(자기장)이라 두 판이 같은 색이다. 배율을 줄여 한 점으로 뭉치는 작은 선은 옅게.
  out.push(fieldLineSet('lines-loop', state.loopLines, loopC, place, clipOf(loopC), s, c));
  out.push(fieldLineSet('lines-magnet', state.magnetLines, magC, place, clipOf(magC), s, c));

  // ---- 자석 윤곽 ----
  const magnet: Body = {
    type: 'body',
    id: 'magnet',
    pos: magC,
    shape: 'rect',
    size: [hw * 2, hl * 2],
    fill: 'none',
    outline: 'role',
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(magnet);

  // ---- 고리 ----
  const a = c.loopRadius * s;
  const tilt = c.loopTilt * s;
  const ellipse: Vec2[] = [];
  for (let i = 0; i <= LOOP_SEGMENTS; i++) {
    const th = (i * 2 * Math.PI) / LOOP_SEGMENTS;
    ellipse.push([loopC[0] + a * Math.cos(th), tilt * Math.sin(th)]);
  }
  const outline: LineSet = {
    type: 'lineSet',
    id: 'loop-outline',
    lines: [ellipse],
    width: LOOP_OUTLINE_PX,
    opacity: LOOP_OUTLINE_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(outline);

  // 앞쪽(아래) 가장자리의 전류 — 왼쪽 ⊙ 에서 나와 앞을 지나 오른쪽 ⊗ 로 들어간다.
  // 멀리 물러나면 고리가 작아져 화살표가 기호 사이에 끼므로 함께 옅어진다.
  const arrowOpacity = 1 - away;
  if (arrowOpacity > MIN_OPACITY) {
    const len = c.loopRadius * CURRENT_ARROW_RATIO * s;
    const current: Vector = {
      type: 'vector',
      id: 'loop-current',
      from: [loopC[0] - len / 2, -tilt],
      delta: [len, 0],
      width: CURRENT_ARROW_PX,
      opacity: arrowOpacity,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(current);
  }

  // ⊙ 왼쪽(화면 밖으로) · ⊗ 오른쪽(안으로). 기호는 표식이라 배율을 따라가지 않는다.
  const outPos: Vec2 = [loopC[0] - a, 0];
  const inPos: Vec2 = [loopC[0] + a, 0];
  for (const [id, pos] of [
    ['wire-out', outPos],
    ['wire-in', inPos],
  ] as const) {
    const ring: Body = {
      type: 'body',
      id,
      pos,
      shape: 'circle',
      size: c.wireMark,
      fill: 'none',
      outline: 'role',
      glow: false,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(ring);
  }
  const dot: Body = {
    type: 'body',
    id: 'wire-out-dot',
    pos: outPos,
    shape: 'circle',
    size: c.wireMark * DOT_RATIO,
    outline: 'none',
    glow: false,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(dot);
  const arm = c.wireMark * CROSS_RATIO * Math.SQRT1_2;
  const cross: LineSet = {
    type: 'lineSet',
    id: 'wire-in-cross',
    lines: [
      [
        [inPos[0] - arm, -arm],
        [inPos[0] + arm, arm],
      ],
      [
        [inPos[0] - arm, arm],
        [inPos[0] + arm, -arm],
      ],
    ],
    width: CROSS_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(cross);

  // ---- 방향 꺾쇠 ----
  // 선마다 적도면 바깥(씨앗)에서 — 바깥에서는 아래(N → S)를 가리킨다.
  const chevrons: Vec2[][] = [];
  const chevronOpacity: number[] = [];
  for (const [center, lines] of [
    [loopC, state.loopLines],
    [magC, state.magnetLines],
  ] as const) {
    for (const l of lines) {
      const o = reachOpacity(l.level, s, c);
      for (const side of [1, -1]) {
        const tip = place(center, [side * l.seed, 0]);
        if (Math.abs(tip[0] - center[0]) > PANEL_HALF_W - CHEVRON_ARM) continue;
        chevrons.push(chevronDown(tip));
        chevronOpacity.push(o);
      }
    }
  }
  const arrows: LineSet = {
    type: 'lineSet',
    id: 'field-directions',
    lines: chevrons,
    opacities: chevronOpacity,
    width: FIELD_LINE_PX,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
  out.push(arrows);

  // ---- 겹쳐 본 자석의 선 — 고리 판에 같은 배율로 옮긴 점선 ----
  if (ghost > MIN_OPACITY) {
    const clip = clipOf(loopC);
    for (const l of state.magnetLines) {
      const o = ghost * reachOpacity(l.level, s, c);
      if (o < MIN_OPACITY) continue;
      for (const [side, pts] of [
        ['r', l.right],
        ['l', l.left],
      ] as const) {
        const line: Trajectory = {
          type: 'trajectory',
          id: `ghost-${l.level}-${side}`,
          points: pts.map((p) => place(loopC, p)),
          width: GHOST_LINE_PX,
          opacity: o,
          clip,
          style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
        };
        out.push(line);
      }
    }
    const ghostMagnet: Trajectory = {
      type: 'trajectory',
      id: 'ghost-magnet',
      points: [
        [loopC[0] - hw, -hl],
        [loopC[0] + hw, -hl],
        [loopC[0] + hw, hl],
        [loopC[0] - hw, hl],
      ],
      closed: true,
      width: GHOST_LINE_PX,
      opacity: ghost,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    };
    out.push(ghostMagnet);
  }

  // ---- 극 표식 ----
  out.push(pole('magnet-n', magC, -POLE_OFFSET_PX, 'label.north', 1));
  out.push(pole('magnet-s', magC, POLE_OFFSET_PX, 'label.south', 1));
  if (loopPoles > MIN_OPACITY) {
    out.push(pole('loop-n', loopC, -POLE_OFFSET_PX, 'label.north', loopPoles));
    out.push(pole('loop-s', loopC, POLE_OFFSET_PX, 'label.south', loopPoles));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 배율 s 에서 준위 k 선의 화면 도달 거리로 정한 옅기 — 한 점으로 뭉치는 작은 선을 흐린다. */
function reachOpacity(level: number, s: number, c: DipoleConstants): number {
  const r = levelReach(level, c) * s;
  const o = (r - c.fadeReachFrom) / (c.fadeReachTo - c.fadeReachFrom);
  return Math.min(1, Math.max(0, o));
}

function fieldLineSet(
  id: string,
  lines: readonly FieldLine[],
  center: Vec2,
  place: (center: Vec2, p: Vec2) => Vec2,
  clip: { min: Vec2; max: Vec2 },
  s: number,
  c: DipoleConstants,
): LineSet {
  const pts: Vec2[][] = [];
  const opacities: number[] = [];
  // 축 위의 선 — 곧게 위로 지나 판 밖으로 나간다.
  pts.push([
    [center[0], -PANEL_HALF_H],
    [center[0], PANEL_HALF_H],
  ]);
  opacities.push(1);
  for (const l of lines) {
    const o = reachOpacity(l.level, s, c);
    pts.push(l.right.map((p) => place(center, p)), l.left.map((p) => place(center, p)));
    opacities.push(o, o);
  }
  return {
    type: 'lineSet',
    id,
    lines: pts,
    opacities,
    width: FIELD_LINE_PX,
    clip,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
}

/** 아래를 가리키는 꺾쇠 한 획 — 꼭짓점이 `tip`. */
function chevronDown(tip: Vec2): Vec2[] {
  const back = Math.PI / 2;
  const armAt = (ang: number): Vec2 => [tip[0] + CHEVRON_ARM * Math.cos(ang), tip[1] + CHEVRON_ARM * Math.sin(ang)];
  return [armAt(back + CHEVRON_SPREAD), tip, armAt(back - CHEVRON_SPREAD)];
}

function pole(id: string, center: Vec2, offsetPx: number, label: MagneticDipoleMessageKey, opacity: number): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: center, offset: [0, offsetPx] },
    text: text(label),
    chip: false,
    font: 'text',
    weight: 'bold',
    fontSize: POLE_LABEL_PX,
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

/** 고정 경계. 두 판과 캡션 줄 — 매 프레임 같은 값이다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
