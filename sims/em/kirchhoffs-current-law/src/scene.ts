// ========================================================================
// kirchhoffs-current-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 아래에서 위로 —
//   전선(lineSet) → 전지 두 판(lineSet) → 저항 기호(circuitElement, 선언만) → 마디
//   (terminal junction) → 문(lineSet) → 알갱이 꼬리(lineSet) · 알갱이(particleSystem) →
//   세는 판의 네모(particleSystem) → 같음 선(lineSet) → 이름표(readout) · 방향 표식(vector).
//
// 색은 뜻마다 하나다 — 전선 · 전지 · 저항 · 마디 · 문은 먹색(장치), 알갱이와 판의 네모와
// `e⁻` 표식은 primary(전자 — 네모는 센 알갱이 그 자체다), **강조색은 「같다」 한 가지
// 뜻에만** — 포갠 더미와 들어온 더미의 꼭대기를 잇는 선. 가지는 색이 아니라 자리와 표식
// `R₁` · `R₂` · `R₃` 으로 가른다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LocalizedText,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  WIRES,
  arrangementOf,
  branchResistances,
  carrierArcs,
  carrierSpeed,
  mainArcAtLeftY,
  pointAt,
  readConstants,
  spanWithout,
  subPath,
  tallyNow,
} from './physics';
import {
  BATTERY_LONG_HALF,
  BATTERY_PLATE_GAP,
  BATTERY_SHORT_HALF,
  BATTERY_Y,
  BRANCH_Y,
  IN_COL_X,
  LOOP_LEFT,
  NODE_A,
  NODE_B,
  OUT_COL_X,
  RESISTOR_X,
  SCENE_BOUNDS,
  TALLY_BASE_Y,
  TALLY_PITCH,
  text,
} from './schema';
import type { KirchhoffsCurrentLawState } from './state';

/** 전선 굵기(화면 px). */
const WIRE_PX = 2.5;
/** 전지 두 판의 굵기(화면 px). 짧은 판(−)을 더 굵게 긋는 관례를 따른다. */
const BATTERY_LONG_PX = 2.5;
const BATTERY_SHORT_PX = 4.5;
/** 알갱이 반지름 · 꼬리 굵기(화면 px) · 꼬리 불투명도. */
const CARRIER_PX = 3.2;
const TRAIL_PX = 2.2;
const TRAIL_OPACITY = 0.45;
/** 알갱이를 숨기는 여유(월드) — 전지 두 판 사이 · 마디 점 위를 지날 때. */
const HIDE_MARGIN = 0.14;
const NODE_HIDE = 0.12;

/** 문 — 도선을 가로지르는 짧은 막대의 반 길이(월드) · 굵기(화면 px) · 닫혀 있을 때 불투명도. */
const GATE_HALF = 0.24;
const GATE_PX = 2.5;
const GATE_IDLE_OPACITY = 0.35;

/** 판의 네모 반변(화면 px). */
const TALLY_SQUARE_PX = 5;
/** 같음 선 — 더미 바깥으로 내미는 길이(월드) · 굵기(화면 px). */
const EQUAL_OVERHANG = 0.32;
const EQUAL_PX = 2.5;
/** 가지 이름표를 그 무리 오른쪽으로 띄우는 거리(월드). 무리와 함께 움직여 포개는 동안 다른 네모와 엇갈리지 않는다. */
const TALLY_TAG_SIDE = 0.32;
/** 판 이름표를 바닥 아래로 내리는 거리(월드). */
const TALLY_LABEL_DROP = 0.42;

/** 이름표 글자 크기(화면 px) · 대상에서 띄우는 거리(월드). */
const LABEL_PX = 13;
const TAG_PX = 13;
const SIGN_PX = 15;
const RESISTOR_TAG_RISE = 0.34;
const BATTERY_LABEL_GAP = 0.6;
const SIGN_GAP = 0.3;
const SIGN_RISE = 0.16;
const NODE_LABEL_OFFSET: Vec2 = [-0.14, -0.42];

/** 전자 방향 표식 — 들어오는 본선 위 높이, 화살표 꼬리 x · 길이, 기호를 화살표에서 띄우는 거리(월드). */
const ELECTRON_MARK_RISE = 0.42;
const ELECTRON_ARROW_FROM = -4.1;
const ELECTRON_ARROW_LEN = 0.7;
const ELECTRON_LABEL_GAP = 0.14;

const BRANCH_TAGS = ['label.r1', 'label.r2', 'label.r3'] as const;

export function scene(params: {
  state: KirchhoffsCurrentLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('kirchhoffs-current-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const arr = arrangementOf(tl.phase);
  const tally = tallyNow(tl, c);
  const out: Primitive[] = [];

  const batteryArc = mainArcAtLeftY(BATTERY_Y);
  const batteryGap: [number, number] = [batteryArc - BATTERY_PLATE_GAP / 2, batteryArc + BATTERY_PLATE_GAP / 2];

  // ---- 전선 — 전지 두 판 사이를 비우고 긋는다 ----
  out.push({
    type: 'lineSet',
    id: 'wires',
    lines: WIRES.flatMap((w, i) => {
      const total = w.lengths[w.lengths.length - 1]!;
      return spanWithout(0, total, i === 0 ? [batteryGap] : []).map(([a, b]) => subPath(w.path, w.lengths, a, b));
    }),
    width: WIRE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 전지 — 짧은 판(−)이 위, 긴 판(+)이 아래. 전자는 − 극에서 나와 마디 A 로 간다 (G178) ----
  const minusY = BATTERY_Y + BATTERY_PLATE_GAP / 2;
  const plusY = BATTERY_Y - BATTERY_PLATE_GAP / 2;
  out.push({
    type: 'lineSet',
    id: 'battery-plus',
    lines: [[[LOOP_LEFT - BATTERY_LONG_HALF, plusY], [LOOP_LEFT + BATTERY_LONG_HALF, plusY]]],
    width: BATTERY_LONG_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: 'battery-minus',
    lines: [[[LOOP_LEFT - BATTERY_SHORT_HALF, minusY], [LOOP_LEFT + BATTERY_SHORT_HALF, minusY]]],
    width: BATTERY_SHORT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 저항 — 값은 선언한 스테이지 상수 그대로. 아래 가지는 지금 배치의 값 ----
  const resistances = branchResistances(c, arr);
  BRANCH_Y.forEach((y, k) => {
    out.push({
      type: 'circuitElement',
      id: `resistor-${k + 1}`,
      subtype: 'resistor',
      pos: [RESISTOR_X, y],
      rotation: 0,
      value: resistances[k]!,
      unit: 'Ω',
    });
  });

  // ---- 마디 ----
  out.push({ type: 'terminal', id: 'node-a', pos: [NODE_A[0], NODE_A[1]], kind: 'junction' });
  out.push({ type: 'terminal', id: 'node-b', pos: [NODE_B[0], NODE_B[1]], kind: 'junction' });

  // ---- 문 — 세는 동안만 짙다 ----
  out.push({
    type: 'lineSet',
    id: 'gates',
    lines: WIRES.map((w) => {
      const g = pointAt(w.path, w.lengths, w.gate);
      const n: Vec2 = [-g.dir[1], g.dir[0]];
      return [
        [g.pos[0] - n[0] * GATE_HALF, g.pos[1] - n[1] * GATE_HALF],
        [g.pos[0] + n[0] * GATE_HALF, g.pos[1] + n[1] * GATE_HALF],
      ];
    }),
    width: GATE_PX,
    opacity: tally?.counting ? 1 : GATE_IDLE_OPACITY,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 알갱이 — 도선마다 전류에 비례한 빠르기. 꼬리는 길을 따라 (G181) ----
  const positions: Vec2[] = [];
  const trails: Vec2[][] = [];
  WIRES.forEach((w, i) => {
    const total = w.lengths[w.lengths.length - 1]!;
    const hidden: [number, number][] = [
      [-1, NODE_HIDE],
      [total - NODE_HIDE, total + 1],
      ...(i === 0 ? [[batteryGap[0] - HIDE_MARGIN, batteryGap[1] + HIDE_MARGIN] as [number, number]] : []),
    ];
    const trailLength = carrierSpeed(c, arr, i) * c.trailSeconds;
    for (const s of carrierArcs(tl, c, i)) {
      if (hidden.some(([a, b]) => s >= a && s <= b)) continue;
      positions.push(pointAt(w.path, w.lengths, s).pos);
      for (const [a, b] of spanWithout(Math.max(0, s - trailLength), s, hidden)) {
        trails.push(subPath(w.path, w.lengths, a, b));
      }
    }
  });
  out.push({
    type: 'lineSet',
    id: 'carrier-trails',
    lines: trails,
    width: TRAIL_PX,
    opacity: TRAIL_OPACITY,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'particleSystem',
    id: 'carriers',
    positions,
    sizes: CARRIER_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 세는 판 — 들어온 더미 하나, 나간 더미 셋. 포개면 셋이 한 줄이 된다 ----
  const squares: Vec2[] = [];
  if (tally) {
    const [nIn, ...nOut] = tally.counts as [number, ...number[]];
    for (let j = 0; j < nIn; j++) squares.push([IN_COL_X, TALLY_BASE_Y + j * TALLY_PITCH]);
    let below = 0;
    nOut.forEach((n, k) => {
      const x = lerp(OUT_COL_X[k]!, OUT_COL_X[0], tally.stacked);
      for (let j = 0; j < n; j++) {
        squares.push([x, TALLY_BASE_Y + (j + below * tally.stacked) * TALLY_PITCH]);
      }
      // 가지 이름표 — 그 무리의 오른쪽 가운데. 무리와 함께 포개진다. 아직 하나도 없으면 바닥 옆.
      const mid = Math.max(n - 1, 0) / 2 + below * tally.stacked;
      out.push(tagLabel(`tally-tag-${k + 1}`, [x + TALLY_TAG_SIDE, TALLY_BASE_Y + mid * TALLY_PITCH], text(BRANCH_TAGS[k]!), 'center'));
      below += n;
    });
    out.push({
      type: 'particleSystem',
      id: 'tally',
      positions: squares,
      sizes: TALLY_SQUARE_PX,
      shape: 'square',
      style: { colorRole: 'primary', emphasis: 'strong' },
    });

    // ---- 같음 — 포갠 더미 꼭대기와 들어온 더미 꼭대기를 잇는다. 강조색은 이 뜻 하나 ----
    if (tally.holding) {
      const top = TALLY_BASE_Y + (nIn - 0.5) * TALLY_PITCH;
      out.push({
        type: 'lineSet',
        id: 'equal-line',
        lines: [[[IN_COL_X - EQUAL_OVERHANG, top], [OUT_COL_X[0] + EQUAL_OVERHANG, top]]],
        width: EQUAL_PX,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // ---- 이름표 ----
  const labelY = TALLY_BASE_Y - TALLY_LABEL_DROP;
  out.push(nameLabel('tally-in-label', [IN_COL_X, labelY], text('label.in'), 'center'));
  out.push(nameLabel('tally-out-label', [(OUT_COL_X[0] + OUT_COL_X[2]) / 2, labelY], text('label.out'), 'center'));
  BRANCH_Y.forEach((y, k) => {
    out.push(tagLabel(`resistor-tag-${k + 1}`, [RESISTOR_X, y + RESISTOR_TAG_RISE], text(BRANCH_TAGS[k]!), 'center'));
  });
  out.push(nameLabel('node-label', [NODE_A[0] + NODE_LABEL_OFFSET[0], NODE_A[1] + NODE_LABEL_OFFSET[1]], text('label.node'), 'right'));
  out.push({
    type: 'readout',
    id: 'battery-label',
    anchor: { world: [LOOP_LEFT - BATTERY_LABEL_GAP, BATTERY_Y] },
    text: text('label.emf'),
    vars: { v: String(c.emf) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push(signLabel('battery-plus-sign', [LOOP_LEFT + SIGN_GAP, plusY - SIGN_RISE], text('label.plus')));
  out.push(signLabel('battery-minus-sign', [LOOP_LEFT + SIGN_GAP, minusY + SIGN_RISE], text('label.minus')));

  // ---- 전자 방향 표식 — 알갱이가 무엇이고 어느 쪽으로 가는지 한 번 ----
  const markY = NODE_A[1] + ELECTRON_MARK_RISE;
  out.push({
    type: 'vector',
    id: 'electron-direction',
    from: [ELECTRON_ARROW_FROM, markY],
    delta: [ELECTRON_ARROW_LEN, 0],
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'electron-label',
    anchor: { world: [ELECTRON_ARROW_FROM - ELECTRON_LABEL_GAP, markY] },
    text: text('label.electron'),
    chip: false,
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function nameLabel(id: string, at: Vec2, label: LocalizedText, align: 'left' | 'center' | 'right'): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

function tagLabel(id: string, at: Vec2, label: LocalizedText, align: 'left' | 'center' | 'right'): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    fontSize: TAG_PX,
    italic: true,
    align,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

function signLabel(id: string, at: Vec2, label: LocalizedText): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    fontSize: SIGN_PX,
    weight: 'bold',
    align: 'left',
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}
