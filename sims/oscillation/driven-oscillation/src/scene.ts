// ========================================================================
// driven-oscillation — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 손(`body` rect) · 용수철(`constraint` spring) · 추
// (`body` rect) · 기록지 자국과 기준선(`trajectory`) · 손 꼭대기 표지(`trajectory`
// 점선 + `body` point) · 이름표(`readout`) 가 모두 표준 어휘로 있다.
//
// 색: 손과 손의 자국은 보조색(흔드는 쪽), 추 · 용수철 · 추의 자국은 먹색(흔들리는
// 쪽). 두 레인은 같은 색이다 — 같은 용수철, 같은 추이고 다른 것은 박자뿐이다.
// 강조색은 **손이 꼭대기에 온 순간** 한 가지 뜻에만 쓴다. 그 세로줄 끝에 추의
// 봉우리가 오는지 골이 오는지가 이 조각의 판정 장치다.
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
import { handAt, handCrests, massAt, readConstants, response, type Response } from './physics';
import {
  DIM_OPACITY,
  HAND_HALF_H,
  HAND_HALF_W,
  HAND_REST_Y,
  LANE_TITLE_Y,
  LANE_X,
  MASS_HALF_H,
  MASS_HALF_W,
  MASS_REST_Y,
  PAPER_GAP,
  PAPER_LENGTH,
  SCENE_BOUNDS,
  text,
  type DrivenOscillationMessageKey,
} from './schema';
import type { DrivenOscillationState } from './state';

/** 기록지 자국 한 줄의 표본 수. 빠른 레인의 물결 다섯 개가 매끈할 만큼. */
const TRACE_SAMPLES = 180;
/** 기록지 끝 이름표를 자국 끝에서 띄우는 거리(화면 px). */
const END_LABEL_OFFSET: Vec2 = [8, 0];
/** 용수철 감은 수. */
const SPRING_COILS = 7;

interface Lane {
  id: 'slow' | 'fast';
  x: number;
  title: DrivenOscillationMessageKey;
}

const LANES: readonly Lane[] = [
  { id: 'slow', x: LANE_X.slow, title: 'label.slowLane' },
  { id: 'fast', x: LANE_X.fast, title: 'label.fastLane' },
];

/**
 * 레인마다의 또렷함. 단계는 어디를 보라 만 정한다 — 흔들림은 단계와 무관하다.
 *
 * - 느린 레인: `to-fast` 동안 물러나고 `to-both` 동안 돌아온다.
 * - 빠른 레인: `to-fast` 동안 나서고 `to-slow` 동안 물러난다(주기 첫머리는 물러난 채).
 */
function laneWeights(tl: TimelineFrame): Record<Lane['id'], number> {
  const fall = 1 - DIM_OPACITY;
  return {
    slow: 1 - fall * tl.at('to-fast') + fall * tl.at('to-both'),
    fast: DIM_OPACITY + fall * tl.at('to-fast') - fall * tl.at('to-slow'),
  };
}

export function scene(params: {
  state: DrivenOscillationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('driven-oscillation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const t = timeline.t;
  const weights = laneWeights(timeline);
  const g: Primitive[] = [];

  for (const lane of LANES) {
    const r = response(lane.id === 'slow' ? c.slowFreq : c.fastFreq, c);
    pushLane(g, lane, r, t, c.paperSpeed, weights[lane.id]);
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

function pushLane(
  g: Primitive[],
  lane: Lane,
  r: Response,
  t: number,
  paperSpeed: number,
  op: number,
): void {
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const hand = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const id = (name: string): string => `${lane.id}-${name}`;

  const x0 = lane.x + PAPER_GAP;
  const x1 = x0 + PAPER_LENGTH;
  const window = PAPER_LENGTH / paperSpeed;
  /** 기록지 위 가로 자리 → 그 자국이 찍힌 시각. 새 자국이 왼쪽(물체 옆)이다. */
  const xAt = (when: number): number => x0 + (t - when) * paperSpeed;

  // ---- 기록지 기준선 — 손과 추가 쉬는 높이 ----
  for (const [name, y] of [
    ['hand-rest', HAND_REST_Y],
    ['mass-rest', MASS_REST_Y],
  ] as const) {
    g.push({
      type: 'trajectory',
      id: id(name),
      points: [
        [x0, y],
        [x1, y],
      ],
      width: 1,
      opacity: op * 0.5,
      style: { ...muted, lineStyle: 'dashed' },
    });
  }

  // ---- 손이 꼭대기에 온 순간 — 강조색은 이 한 가지 뜻에만 ----
  // 손 자국의 봉우리에서 추 자국까지 세로로 내린다. 끝이 추의 봉우리에 닿으면
  // 「같이」, 골에 닿으면 「반대로」 다.
  for (const [k, when] of handCrests(r, t - window, t).entries()) {
    const x = xAt(when);
    const handY = HAND_REST_Y + handAt(r, when);
    const massY = MASS_REST_Y + massAt(r, when);
    g.push({
      type: 'trajectory',
      id: id(`crest-line-${k}`),
      points: [
        [x, handY],
        [x, massY],
      ],
      width: 1.5,
      opacity: op,
      style: { ...accent, lineStyle: 'dashed' },
    });
    g.push({ type: 'body', id: id(`crest-hand-${k}`), pos: [x, handY], shape: 'point', opacity: op, style: accent });
    g.push({ type: 'body', id: id(`crest-mass-${k}`), pos: [x, massY], shape: 'point', opacity: op, style: accent });
  }

  // ---- 기록지 자국 ----
  const handTrace: Vec2[] = [];
  const massTrace: Vec2[] = [];
  for (let i = 0; i <= TRACE_SAMPLES; i++) {
    const when = t - (window * i) / TRACE_SAMPLES;
    const x = xAt(when);
    handTrace.push([x, HAND_REST_Y + handAt(r, when)]);
    massTrace.push([x, MASS_REST_Y + massAt(r, when)]);
  }
  g.push({ type: 'trajectory', id: id('hand-trace'), points: handTrace, width: 1.5, opacity: op, style: hand });
  g.push({ type: 'trajectory', id: id('mass-trace'), points: massTrace, width: 2, opacity: op, style: ink });

  // 자국 끝 이름표 — 무엇의 자국인지. 오른쪽 끝(오래된 쪽)에 둔다.
  for (const [name, y, key] of [
    ['hand-name', HAND_REST_Y, 'label.hand'],
    ['mass-name', MASS_REST_Y, 'label.mass'],
  ] as const) {
    g.push({
      type: 'readout',
      id: id(name),
      anchor: { world: [x1, y], offset: END_LABEL_OFFSET },
      text: text(key),
      chip: false,
      font: 'text',
      fontSize: 12,
      align: 'left',
      opacity: op,
      style: muted,
    });
  }

  // ---- 손 · 용수철 · 추 ----
  const handY = HAND_REST_Y + handAt(r, t);
  const massY = MASS_REST_Y + massAt(r, t);
  g.push({
    type: 'constraint',
    id: id('spring'),
    subtype: 'spring',
    from: [lane.x, handY - HAND_HALF_H],
    to: [lane.x, massY + MASS_HALF_H],
    coils: SPRING_COILS,
    opacity: op,
    style: ink,
  });
  g.push({
    type: 'body',
    id: id('hand'),
    pos: [lane.x, handY],
    shape: 'rect',
    size: [HAND_HALF_W * 2, HAND_HALF_H * 2],
    opacity: op,
    style: hand,
  });
  g.push({
    type: 'body',
    id: id('mass'),
    pos: [lane.x, massY],
    shape: 'rect',
    size: [MASS_HALF_W * 2, MASS_HALF_H * 2],
    opacity: op,
    style: ink,
  });

  // ---- 레인 이름 ----
  g.push({
    type: 'readout',
    id: id('title'),
    anchor: { world: [(lane.x - HAND_HALF_W + x1) / 2, LANE_TITLE_Y] },
    text: text(lane.title),
    chip: false,
    font: 'text',
    fontSize: 13,
    align: 'center',
    opacity: op,
    style: ink,
  });
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
