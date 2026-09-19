// ========================================================================
// magnetic-field-lines — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 겹침 순서가 판정 장치다(`drawOrder: 'scene'`) — 자석 면 → 자기력선 · 방향 표식 → 자석 윤곽 ·
// 자름선 · 극 표식 → 따라가는 선의 자취 · 점. 자석 면은 반투명이라 그 속을 지나는 선이 비친다.
// 「자석 속을 지난다」 는 이 비침으로 보인다.
//
// physics 는 자석 틀(x = 자석을 따라 S → N, y = 가로질러)로 계산한다. 자석은 세워 두어 N극이
// 위로 간다 — 고리가 자석 양옆으로 퍼지므로 가로로 넓은 임베드를 고리가 채운다. 틀 → 월드
// 돌림은 `toWorld` 하나가 한다.
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
  ViewDef,
} from '@aperi21/schema';
import { fieldPicture, pathUpTo, pointAt, readConstants, type FieldLoop, type MagnetPiece } from './physics';
import { SCENE_BOUNDS, text, type MagneticFieldLinesMessageKey } from './schema';
import type { MagneticFieldLinesState } from './state';

/** 자기력선 굵기(화면 px). */
const LINE_WIDTH_PX = 1.3;
/** 점이 지나온 자취의 굵기(화면 px). 다른 선보다 굵어 「이 한 가닥」 이 읽힌다. */
const TRACE_WIDTH_PX = 2.6;
/** 방향 표식(꺾쇠) 한 팔의 길이(월드). */
const CHEVRON_ARM = 0.075;
/** 꺾쇠 팔이 선에서 벌어지는 각(rad). */
const CHEVRON_SPREAD = 0.55;
/**
 * 자석 속 꺾쇠를 둘 자리 — 자석 속 구간을 0~1 로 잰 비율을 선마다 돌려 쓴다. 선 순서가
 * 위 · 아래 짝으로 나오므로 짝끼리는 같은 높이, 이웃 짝과는 어긋난다.
 */
const INSIDE_CHEVRON_STAGGER: readonly [number, ...number[]] = [0.3, 0.3, 0.5, 0.5, 0.7, 0.7];
/** 따라가는 점의 반지름(월드). */
const TRACER_RADIUS = 0.075;
/** 자석 면의 채움 불투명도 — 속을 지나는 선이 비칠 만큼 옅다. */
const MAGNET_FILL_OPACITY = 0.22;
/** 극 표식 글자 크기(화면 px). */
const POLE_LABEL_PX = 15;
/** 극 표식을 자석 끝면에서 안쪽으로 들이는 거리(월드). */
const POLE_LABEL_INSET = 0.22;
/** 자름선이 자석 위아래로 삐져나오는 길이(월드). */
const CUT_OVERHANG = 0.14;
/** 자름선 굵기(화면 px). */
const CUT_WIDTH_PX = 1.4;

export function scene(params: {
  state: MagneticFieldLinesState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const out: Primitive[] = [];

  // 틈 — `split` 동안 벌어지고 `rejoin` 동안 닫힌다.
  const gap = c.cutGap * tl.at('split') * (1 - tl.at('rejoin'));
  const pic = fieldPicture(c, gap);

  // ---- 자석 면 ----
  for (const [i, m] of pic.pieces.entries()) {
    const face: Region = {
      type: 'region',
      id: `magnet-face-${i}`,
      points: pieceCorners(m).map(toWorld),
      fillOpacity: MAGNET_FILL_OPACITY,
      style: { colorRole: 'muted', emphasis: 'medium' },
    };
    out.push(face);
  }

  // ---- 자기력선과 방향 표식 ----
  const lines: LineSet = {
    type: 'lineSet',
    id: 'field-lines',
    lines: pic.loops.map((l) => [...l.points, pointAt(l, 0).pos].map(toWorld)),
    width: LINE_WIDTH_PX,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
  out.push(lines);
  const chevrons: Vec2[][] = [];
  for (const [k, l] of pic.loops.entries()) {
    // 바깥 구간 한가운데에 하나, 자석 속 구간에 하나 — 바깥은 N → S, 속은 S → N.
    // 자석 속은 선이 빽빽해 한가운데에 모두 두면 꺾쇠가 한 덩이로 뭉친다. 선마다 자리를
    // 어긋나게 둔다(`INSIDE_CHEVRON_STAGGER`).
    chevrons.push(chevron(l, l.entryArc / 2));
    const stagger = INSIDE_CHEVRON_STAGGER[k % INSIDE_CHEVRON_STAGGER.length] ?? INSIDE_CHEVRON_STAGGER[0];
    chevrons.push(chevron(l, l.entryArc + (l.length - l.entryArc) * stagger));
  }
  const arrows: LineSet = {
    type: 'lineSet',
    id: 'field-directions',
    lines: chevrons,
    width: LINE_WIDTH_PX,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
  out.push(arrows);

  // ---- 자석 윤곽 ----
  // 맞붙어 있는 동안(틈 0)은 한 자석이다 — 반쪽 윤곽 둘을 그으면 자르기 전부터 금이 보인다.
  const outlines: MagnetPiece[] = gap > 0 ? pic.pieces : [wholeMagnet(pic.pieces)];
  for (const [i, m] of outlines.entries()) {
    const body: Body = {
      type: 'body',
      id: `magnet-${i}`,
      pos: toWorld([m.cx, 0]),
      shape: 'rect',
      size: [m.halfWidth * 2, m.halfLength * 2],
      fill: 'none',
      outline: 'role',
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(body);
  }

  // ---- 자름선 — 그어진 뒤 두 반쪽이 떨어지며 사라진다 ----
  const cutOpacity = tl.at('cut') * (1 - tl.at('split'));
  if (cutOpacity > 0) {
    const reach = c.magnetWidth / 2 + CUT_OVERHANG;
    const cut: Trajectory = {
      type: 'trajectory',
      id: 'cut-line',
      points: [toWorld([0, reach]), toWorld([0, -reach])],
      width: CUT_WIDTH_PX,
      opacity: cutOpacity,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    };
    out.push(cut);
  }

  // ---- 극 표식 ----
  // 바깥 두 끝은 늘 있다. 잘린 두 면의 새 극은 떨어지는 동안 떠오르고 다시 붙는 동안 사라진다.
  const [left, right] = pic.pieces;
  const newPoles = tl.at('split') * (1 - tl.at('rejoin'));
  out.push(pole('pole-s-outer', left.cx - left.halfLength + POLE_LABEL_INSET, 'label.south', 1));
  out.push(pole('pole-n-outer', right.cx + right.halfLength - POLE_LABEL_INSET, 'label.north', 1));
  if (newPoles > 0) {
    out.push(pole('pole-n-cut', left.cx + left.halfLength - POLE_LABEL_INSET, 'label.north', newPoles));
    out.push(pole('pole-s-cut', right.cx - right.halfLength + POLE_LABEL_INSET, 'label.south', newPoles));
  }

  // ---- 따라가는 한 가닥 ----
  // 온 자석: `outside` 동안 바깥을, `inside` 동안 자석 속을 지나 제자리로. `cut` 동안 사라진다.
  const whole = pic.upper[c.tracedLine] ?? null;
  if (whole) {
    const s = tl.at('outside') * whole.entryArc + tl.at('inside') * (whole.length - whole.entryArc);
    out.push(...tracer('whole', whole, s, 1 - tl.at('cut')));
  }
  // 잘린 뒤: 왼쪽 반쪽만 도는 선. 떨어지는 동안 새 N극 자리에 떠오르고, 다시 붙는 동안 사라진다.
  const piece = pic.upper[c.tracedLineCut] ?? null;
  if (piece && newPoles > 0) {
    const s = tl.at('outsideCut') * piece.entryArc + tl.at('insideCut') * (piece.length - piece.entryArc);
    out.push(...tracer('piece', piece, s, newPoles));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 맞붙은 두 반쪽을 한 자석으로. */
function wholeMagnet(pieces: readonly [MagnetPiece, MagnetPiece]): MagnetPiece {
  const [left, right] = pieces;
  return { cx: (left.cx + right.cx) / 2, halfLength: left.halfLength + right.halfLength, halfWidth: left.halfWidth };
}

/** 자석 틀 → 월드. 자석을 따라 가는 x 가 월드 위(+y)가 되도록 돌린다 — N극이 위다. */
function toWorld(p: Vec2): Vec2 {
  return [-p[1], p[0]];
}

function pieceCorners(m: MagnetPiece): Vec2[] {
  const x0 = m.cx - m.halfLength;
  const x1 = m.cx + m.halfLength;
  return [
    [x0, -m.halfWidth],
    [x1, -m.halfWidth],
    [x1, m.halfWidth],
    [x0, m.halfWidth],
  ];
}

/** 선 위 길이 `s` 자리에 진행 방향을 가리키는 꺾쇠 한 획. */
function chevron(loop: FieldLoop, s: number): Vec2[] {
  const { pos, dir } = pointAt(loop, s);
  const back = Math.atan2(-dir[1], -dir[0]);
  const arm = (a: number): Vec2 => [pos[0] + CHEVRON_ARM * Math.cos(a), pos[1] + CHEVRON_ARM * Math.sin(a)];
  return [arm(back + CHEVRON_SPREAD), pos, arm(back - CHEVRON_SPREAD)].map(toWorld);
}

function pole(id: string, x: number, label: MagneticFieldLinesMessageKey, opacity: number): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: toWorld([x, 0]) },
    text: text(label),
    chip: false,
    font: 'text',
    weight: 'bold',
    fontSize: POLE_LABEL_PX,
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

/**
 * 점이 첫 점(자석에서 나오는 자리)에서 `s` 만큼 온 자리와 그 자취. 한 바퀴를 다 돌면 자취가
 * 닫힌 고리가 된다.
 */
function tracer(id: string, loop: FieldLoop, s: number, opacity: number): Primitive[] {
  if (opacity <= 0) return [];
  const closed = s >= loop.length;
  const trail: Trajectory = {
    type: 'trajectory',
    id: `trace-${id}`,
    points: (closed ? loop.points : pathUpTo(loop, s)).map(toWorld),
    closed,
    width: TRACE_WIDTH_PX,
    opacity,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  const dot: Body = {
    type: 'body',
    id: `tracer-${id}`,
    pos: toWorld(pointAt(loop, closed ? 0 : s).pos),
    shape: 'circle',
    size: TRACER_RADIUS,
    outline: 'background',
    glow: false,
    opacity,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  return [trail, dot];
}

/** 고정 경계. 자석 둘레의 닫힌 선들과 캡션 줄 — 매 프레임 같은 값이다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
