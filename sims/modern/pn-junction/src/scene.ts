// ========================================================================
// pn-junction — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 막대 두 조각(`region`) · 전극(`body` rect) · 이온 전하 `−` `+`(`lineSet` 둘 —
// 가려진 것 · 드러난 것) · 전자(`particleSystem` 점) · 양공(`trace` 고리) · 만남 고리(`trace` 퍼지는 고리) ·
// 공핍층(`region` 칠 + `dimension`) · 내부 전기장(`vector`) · 이름표 · 극성 · 전압(`readout`) 이 모두
// 표준 어휘로 있다.
//
// 색: 전자 · 양공은 먹색 하나 — 가르는 것은 채운 점 · 빈 고리의 모양과 움직이는 방향이다. 막대 · 전극 ·
// 곁에 운반자가 있는 이온은 무채색, 공핍층 칠은 보조색. 강조색은 **드러난 이온 전하** 한 뜻에만 쓴다 —
// 공핍층이 무엇으로 이루어졌는지(운반자는 없고 전하만 남은 곳)가 그것 하나다.
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
  apartOffset,
  biasWeights,
  edges,
  fadeOpacity,
  flowingCarriers,
  HALF_LEN,
  ions,
  meetingCarriers,
  meetPoint,
  readConstants,
  SIDE_SIGN,
  type Carrier,
  type PnJunctionConstants,
  type Side,
} from './physics';
import { BAR_HALF_H, PLATE_W, ROWS, SCENE_BOUNDS, text, type PnJunctionMessageKey } from './schema';
import type { PnJunctionState } from './state';

// ------------------------------------------------------------------------
// 모양 — 선 굵기 · 글자 크기 · 짙기 · 띄움 거리 (C2)
// ------------------------------------------------------------------------

/** 막대 칠 짙기 · 테두리. */
const BAR_FILL = 0.06;
/** 공핍층 칠 짙기. */
const DEPLETION_FILL = 0.2;
/** 이온 기호 반길이(월드) · 획 굵기(화면 px). */
const ION_HALF = 0.075;
const ION_WIDTH_PX = 1.6;
/** 가려진 이온(곁에 운반자가 있는)의 짙기 — 드러난 이온보다 물러서 있다. */
const ION_COVERED_OPACITY = 0.6;
/** 전자 점 반지름 · 양공 고리 반지름(화면 px) · 고리 굵기(화면 px). 둘이 같은 크기로 보이게. */
const ELECTRON_PX = 3.4;
const HOLE_PX = 3.4;
const HOLE_WIDTH_PX = 1.6;
/** 흐르는 운반자의 꼬리 — 길이(초 × 속력) · 굵기(화면 px) · 짙기. 멈춘 화면에서도 흐르는 방향이 읽히게. */
const TRAIL_SECONDS = 0.35;
const TRAIL_WIDTH_PX = 1.6;
const TRAIL_OPACITY = 0.45;
/** 이보다 옅은 알갱이는 선언하지 않는다 — `trace` 는 최소 알파로 남기고 `particleSystem` 은 1/16 미만을 버린다. */
const WEIGHT_CUTOFF = 0.06;
/** 만남 고리 — 처음 · 끝 반지름(화면 px) · 수명(초, 퍼지는 비율의 분모) · 굵기(화면 px). */
const MEET_RING_PX = 3;
const MEET_RING_TO_PX = 13;
const MEET_RING_LIFE = 1;
const MEET_RING_WIDTH_PX = 1.4;

/** 내부 전기장 화살표 — 막대 위로 띄우는 높이(월드) · 굵기(화면 px). */
const FIELD_GAP = 0.32;
const FIELD_WIDTH_PX = 2;
/** 공핍층 치수선 — 막대 아래로 띄우는 거리(월드). 이름표는 그 아래(화면 px). */
const DIM_GAP = 0.28;
const DEPLETION_LABEL_OFFSET: Vec2 = [0, 13];
/** 전압 이름표 높이(막대 위, 월드). */
const BIAS_ROW = 0.95;

/** 이름표 · 전압 글자 크기 · 극성 글자 크기(화면 px). */
const LABEL_PX = 13;
const SIGN_PX = 17;
/** 조각 이름 · 극성을 막대 위 끝에서 올리는 거리(화면 px). */
const ABOVE_BAR: Vec2 = [0, -13];

const TYPE_KEY: Record<Side, PnJunctionMessageKey> = { p: 'label.pType', n: 'label.nType' };

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
const band = { colorRole: 'secondary', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

const rect = (x0: number, x1: number, y0: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];
const BOX_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
] as const;

export function scene(params: {
  state: PnJunctionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('pn-junction: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const op = fadeOpacity(tl);
  const off = apartOffset(tl);
  const edge = edges(tl, c).ion;
  const shown = tl.at('fieldIn');
  const g: Primitive[] = [];

  // ================= 막대 두 조각 · 전극 =================
  for (const side of ['p', 'n'] as const) {
    const sg = SIDE_SIGN[side];
    const inner = sg * off;
    const outer = sg * (HALF_LEN + off);
    g.push({
      type: 'region',
      id: `${side}-bar`,
      points: rect(Math.min(inner, outer), Math.max(inner, outer), -BAR_HALF_H, BAR_HALF_H),
      fillOpacity: BAR_FILL,
      outline: BOX_EDGES,
      opacity: op,
      style: muted,
    });
    g.push({
      type: 'body',
      id: `${side}-plate`,
      pos: [sg * (HALF_LEN + off + PLATE_W / 2), 0],
      shape: 'rect',
      size: [PLATE_W, 2 * BAR_HALF_H],
      opacity: op,
      style: muted,
    });
  }

  // ================= 공핍층 칠 =================
  if (edge > 0 && shown > 0) {
    g.push({
      type: 'region',
      id: 'depletion',
      points: rect(-edge, edge, -BAR_HALF_H, BAR_HALF_H),
      fillOpacity: DEPLETION_FILL,
      opacity: op * shown,
      style: band,
    });
  }

  // ================= 이온 전하 =================
  for (const side of ['p', 'n'] as const) ionSigns(g, side, tl, c, op);

  // ================= 운반자 =================
  for (const side of ['p', 'n'] as const) {
    const list = [...flowingCarriers(tl, c, side, WEIGHT_CUTOFF), ...meetingCarriers(tl, c, side)].filter(
      (k) => k.weight > WEIGHT_CUTOFF,
    );
    trails(g, side, list, c, op);
    g.push(side === 'n' ? electrons(list, op) : holes(list, op));
  }

  // ---- 만남 고리 — 짝이 사라지는 자리에서 한 번 퍼진다 ----
  const meet = tl.at('recombine');
  if (meet > 0 && meet < 1) {
    const marks: { pos: Vec2; age: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let k = 0; k < c.zeroBiasCols; k++) marks.push({ pos: meetPoint(r, k), age: meet * MEET_RING_LIFE });
    }
    g.push({
      type: 'trace',
      id: 'meet-rings',
      marks,
      life: MEET_RING_LIFE,
      shape: 'ring',
      size: MEET_RING_PX,
      spreadTo: MEET_RING_TO_PX,
      width: MEET_RING_WIDTH_PX,
      opacity: op,
      style: ink,
    });
  }

  // ================= 공핍층 표지 — 내부 전기장 · 치수선 · 이름 =================
  if (edge > 0 && shown > 0) {
    g.push({
      type: 'vector',
      id: 'field',
      from: [edge, BAR_HALF_H + FIELD_GAP],
      delta: [-2 * edge, 0],
      label: text('label.field'),
      labelSide: 'cw',
      width: FIELD_WIDTH_PX,
      opacity: op * shown,
      style: ink,
    });
    const y = -BAR_HALF_H - DIM_GAP;
    g.push({
      type: 'dimension',
      id: 'depletion-width',
      from: [-edge, y],
      to: [edge, y],
      opacity: op * shown,
      style: muted,
    });
    g.push({
      type: 'readout',
      id: 'depletion-label',
      anchor: { world: [0, y], offset: DEPLETION_LABEL_OFFSET },
      text: text('label.depletion'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: op * shown,
      style: muted,
    });
  }

  // ================= 이름표 · 극성 · 전압 =================
  const bias = biasWeights(tl);
  for (const side of ['p', 'n'] as const) {
    const sg = SIDE_SIGN[side];
    g.push(label(`${side}-name`, [sg * (HALF_LEN / 2 + off), BAR_HALF_H], ABOVE_BAR, text(TYPE_KEY[side]), op, LABEL_PX));
    const plate: Vec2 = [sg * (HALF_LEN + off + PLATE_W / 2), BAR_HALF_H];
    // 순방향은 p 에 + · n 에 −, 역방향은 그 반대.
    const fwdSign: PnJunctionMessageKey = side === 'p' ? 'label.plus' : 'label.minus';
    const revSign: PnJunctionMessageKey = side === 'p' ? 'label.minus' : 'label.plus';
    if (bias.forward > 0) g.push(sign(`${side}-sign-fwd`, plate, fwdSign, op * bias.forward));
    if (bias.reverse > 0) g.push(sign(`${side}-sign-rev`, plate, revSign, op * bias.reverse));
  }
  const biasAt: Vec2 = [0, BAR_HALF_H + BIAS_ROW];
  if (bias.forward > 0) {
    g.push({
      ...label('bias-fwd', biasAt, [0, 0], text('label.forward'), op * bias.forward, LABEL_PX),
      vars: { v: String(c.forwardVoltage) },
    });
  }
  if (bias.reverse > 0) {
    g.push({
      ...label('bias-rev', biasAt, [0, 0], text('label.reverse'), op * bias.reverse, LABEL_PX),
      vars: { v: String(c.reverseVoltage) },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 이온 전하 기호 — p 쪽 `−`, n 쪽 `+`. 곁의 운반자가 떠나 드러난 몫은 강조색으로 옮겨 칠한다. */
function ionSigns(g: Primitive[], side: Side, tl: TimelineFrame, c: PnJunctionConstants, op: number): void {
  const list = ions(tl, c, side);
  const lines: Vec2[][] = [];
  const covered: number[] = [];
  const exposed: number[] = [];
  for (const ion of list) {
    const [x, y] = ion.pos;
    lines.push([
      [x - ION_HALF, y],
      [x + ION_HALF, y],
    ]);
    covered.push(1 - ion.exposed);
    exposed.push(ion.exposed);
    if (side === 'n') {
      lines.push([
        [x, y - ION_HALF],
        [x, y + ION_HALF],
      ]);
      covered.push(1 - ion.exposed);
      exposed.push(ion.exposed);
    }
  }
  g.push({
    type: 'lineSet',
    id: `${side}-ions`,
    lines,
    opacities: covered,
    width: ION_WIDTH_PX,
    opacity: op * ION_COVERED_OPACITY,
    style: muted,
  });
  g.push({
    type: 'lineSet',
    id: `${side}-ions-exposed`,
    lines,
    opacities: exposed,
    width: ION_WIDTH_PX,
    opacity: op,
    style: accent,
  });
}

/**
 * 흐르는 운반자의 꼬리 — 온 쪽(전극 쪽)으로 짧은 획. 양공은 `trace` 고리라 속도 꼬리가 없어서 두 운반자
 * 모두 `lineSet` 으로 같게 긋는다.
 */
function trails(g: Primitive[], side: Side, list: readonly Carrier[], c: PnJunctionConstants, op: number): void {
  const sg = SIDE_SIGN[side];
  const moving = list.filter((k) => k.flowing > 0);
  if (moving.length === 0) return;
  g.push({
    type: 'lineSet',
    id: `${side}-trails`,
    lines: moving.map((k): Vec2[] => {
      const len = TRAIL_SECONDS * c.flowSpeed * k.flowing;
      return [k.pos, [k.pos[0] + sg * len, k.pos[1]]];
    }),
    opacities: moving.map((k) => k.weight),
    width: TRAIL_WIDTH_PX,
    opacity: op * TRAIL_OPACITY,
    style: ink,
  });
}

function electrons(list: readonly Carrier[], op: number): Primitive {
  return {
    type: 'particleSystem',
    id: 'electrons',
    positions: list.map((k) => k.pos),
    sizes: list.map((k) => ELECTRON_PX * k.weight),
    opacities: list.map((k) => k.weight),
    opacity: op,
    style: ink,
  };
}

/** 양공 — 속 빈 고리. `trace` 의 세기가 반지름과 짙기에 함께 걸려 사라질 때 전자 점처럼 작아진다. */
function holes(list: readonly Carrier[], op: number): Primitive {
  return {
    type: 'trace',
    id: 'holes',
    marks: list.map((k) => ({ pos: k.pos, strength: k.weight })),
    shape: 'ring',
    size: HOLE_PX,
    width: HOLE_WIDTH_PX,
    opacity: op,
    style: ink,
  };
}

function label(
  id: string,
  at: Vec2,
  offset: Vec2,
  msg: ReturnType<typeof text>,
  opacity: number,
  px: number,
): Extract<Primitive, { type: 'readout' }> {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: msg,
    chip: false,
    font: 'text',
    fontSize: px,
    weight: 'bold',
    align: 'center',
    opacity,
    style: ink,
  };
}

function sign(id: string, at: Vec2, key: PnJunctionMessageKey, opacity: number): Primitive {
  return label(id, at, ABOVE_BAR, text(key), opacity, SIGN_PX);
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
