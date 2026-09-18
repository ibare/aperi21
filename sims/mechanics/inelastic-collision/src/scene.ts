// ========================================================================
// inelastic-collision — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 레일(`trajectory`) · 수레(`body`) · 속도(`vector`) ·
// 벌어진 틈(`dimension`) · 남은 에너지(`region`) · 사라진 몫의 자리(`trajectory`
// 닫힌 점선) · 표식과 이름표(`readout`) 가 모두 표준 어휘로 있다.
//
// 색: 수레는 먹색(여섯 대가 같은 수레다), 막대는 보조색, 레일 · 이름표는 무채색.
// 강조색은 **벌어진 틈** 한 가지 뜻에만 쓴다 — 줄마다 다른 것이 그것 하나이고,
// 막대의 사라진 칸은 강조가 아니라 비워 둔 자리(점선)로 말한다.
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
import { derive, readConstants, type Reading } from './physics';
import {
  ARROW_LIFT,
  ARROW_MIN,
  ARROW_SCALE,
  BAR_FULL,
  BAR_HALF_H,
  BAR_X0,
  CART_HALF_H,
  CART_HALF_W,
  LANE_GAP,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { InelasticCollisionState } from './state';

/** 레일 좌우 끝(월드). 달려오는 자리부터 멀어져 간 자리까지. */
const RAIL_FROM = -2.8;
const RAIL_TO = 2.65;
/** 반발 계수 표식 자리(월드 x). 레일 왼쪽 끝 바깥. */
const RESTITUTION_X = -2.95;
/** 막대 머리 이름을 첫 줄 막대 위로 올리는 거리(화면 px). */
const HEAD_OFFSET: Vec2 = [0, -16];
/** 「사라진 몫」 이름을 마지막 줄 막대 아래로 내리는 거리(화면 px). */
const LOST_OFFSET: Vec2 = [0, 15];
/** 틈 이름을 띠 윗변 위로 올리는 거리(화면 px). 띠 안에 두면 점선과 겹친다. */
const GAP_LABEL_OFFSET: Vec2 = [0, -22];
/** 이보다 좁은 틈은 재지 않는다(월드). 끝점 표시끼리 겹친다 (G103). */
const GAP_MIN = 0.06;

const rect = (x0: number, x1: number, cy: number, halfH: number): Vec2[] => [
  [x0, cy - halfH],
  [x1, cy - halfH],
  [x1, cy + halfH],
  [x0, cy + halfH],
];

/** 줄 i 의 수레 중심 높이. 위 줄이 0. */
const laneY = (i: number): number => LANE_GAP * (1 - i);

export function scene(params: {
  state: InelasticCollisionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('inelastic-collision: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r: Reading = derive(timeline, c);
  const op = r.opacity;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const bar = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  r.lanes.forEach((lane, i) => {
    const y = laneY(i);
    const railY = y - CART_HALF_H;

    // ---- 레일과 반발 계수 ----
    // 가는 무채색 선. `surface` wall 은 가장 굵은 먹색 선이라 세 줄이 겹겹이 서면
    // 레일이 수레만큼 짙어진다 — 레일은 어디에 놓였는지만 말하면 된다.
    g.push({
      type: 'trajectory',
      id: `rail-${i}`,
      points: [
        [RAIL_FROM, railY],
        [RAIL_TO, railY],
      ],
      width: 1.5,
      opacity: op,
      style: muted,
    });
    g.push({
      type: 'readout',
      id: `restitution-${i}`,
      anchor: { world: [RESTITUTION_X, y] },
      text: text('label.restitution'),
      vars: { e: String(lane.e) },
      chip: false,
      font: 'mono',
      fontSize: 13,
      align: 'right',
      opacity: op,
      style: muted,
    });

    // ---- 두 수레 ----
    for (const [who, x] of [
      ['a', lane.xA],
      ['b', lane.xB],
    ] as const) {
      g.push({
        type: 'body',
        id: `cart-${who}-${i}`,
        pos: [x, y],
        shape: 'rect',
        size: [CART_HALF_W * 2, CART_HALF_H * 2],
        opacity: op,
        style: ink,
      });
    }

    // ---- 속도 ----
    // 움직이는 동안만. 멈춰 세운 비교 화면에 화살표가 남으면 「아직 달린다」 와
    // 「여기서 견줘라」 가 한 화면에서 다툰다.
    if (r.moving) {
      for (const [who, x, v] of [
        ['a', lane.xA, lane.vA],
        ['b', lane.xB, lane.vB],
      ] as const) {
        const len = v * ARROW_SCALE;
        if (len < ARROW_MIN) continue;
        g.push({
          type: 'vector',
          id: `velocity-${who}-${i}`,
          from: [x - len / 2, y + CART_HALF_H + ARROW_LIFT],
          delta: [len, 0],
          width: 2,
          opacity: op,
          style: muted,
        });
      }
    }

    // ---- 벌어진 틈 ----
    // 강조색은 이것 하나. 줄마다 다른 빠르기로 자라고, 멈춘 뒤 줄마다 다른 길이로 남는다.
    const gapFrom = lane.xA + CART_HALF_W;
    const gapTo = lane.xB - CART_HALF_W;
    if (r.separating && gapTo - gapFrom > GAP_MIN) {
      // 틈을 수레 높이의 옅은 띠로 먼저 깐다. 치수선은 점선뿐이라(G19) 혼자서는
      // 줄마다 다른 길이가 한눈에 견줘지지 않는다 — 띠가 「비어 있는 자리」 를 면으로 만든다.
      g.push({
        type: 'region',
        id: `gap-band-${i}`,
        points: rect(gapFrom, gapTo, y, CART_HALF_H),
        fillOpacity: 0.22,
        opacity: op,
        style: accent,
      });
      g.push({
        type: 'dimension',
        id: `gap-${i}`,
        from: [gapFrom, y],
        to: [gapTo, y],
        opacity: op,
        style: accent,
      });
      // 이름은 가장 넓은 첫 줄에만. 셋 다 붙이면 좁은 틈에서 글자가 수레를 덮는다.
      if (i === 0) {
        g.push({
          type: 'readout',
          id: 'gap-name',
          anchor: { world: [(gapFrom + gapTo) / 2, y], offset: GAP_LABEL_OFFSET },
          text: text('label.gap'),
          chip: false,
          font: 'text',
          fontSize: 12,
          align: 'center',
          opacity: op,
          style: accent,
        });
      }
    }

    // ---- 운동 에너지 막대 ----
    // 남은 몫은 채움, 사라진 몫은 비워 둔 자리(점선 테두리). 채우면 아직 있는 에너지로 읽힌다.
    const keptEnd = BAR_X0 + BAR_FULL * lane.kept;
    g.push({
      type: 'region',
      id: `energy-${i}`,
      points: rect(BAR_X0, keptEnd, y, BAR_HALF_H),
      fillOpacity: 0.5,
      opaque: true,
      opacity: op,
      style: bar,
    });
    const fullEnd = BAR_X0 + BAR_FULL;
    if (fullEnd - keptEnd > 0.01) {
      g.push({
        type: 'trajectory',
        id: `lost-${i}`,
        points: rect(keptEnd, fullEnd, y, BAR_HALF_H),
        closed: true,
        width: 1,
        opacity: op * 0.85 * r.lostShown,
        style: { ...muted, lineStyle: 'dashed' },
      });
    }
  });

  // ---- 막대 줄의 이름 ----
  const topY = laneY(0);
  const bottomY = laneY(r.lanes.length - 1);
  g.push({
    type: 'readout',
    id: 'energy-name',
    anchor: { world: [BAR_X0 + BAR_FULL / 2, topY + BAR_HALF_H], offset: HEAD_OFFSET },
    text: text('label.energy'),
    chip: false,
    font: 'text',
    fontSize: 13,
    align: 'center',
    opacity: op,
    style: ink,
  });
  // 「사라진 몫」 은 가장 긴 마지막 줄 칸 아래에 한 번만.
  const last = r.lanes[r.lanes.length - 1];
  if (last && r.lostShown > 0.5) {
    const from = BAR_X0 + BAR_FULL * last.keptFinal;
    g.push({
      type: 'readout',
      id: 'lost-name',
      anchor: { world: [(from + BAR_X0 + BAR_FULL) / 2, bottomY - BAR_HALF_H], offset: LOST_OFFSET },
      text: text('label.lost'),
      chip: false,
      font: 'text',
      fontSize: 12,
      align: 'center',
      opacity: op * Math.min(1, (r.lostShown - 0.5) * 2),
      style: muted,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
