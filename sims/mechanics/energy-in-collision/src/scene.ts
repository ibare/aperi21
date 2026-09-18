// ========================================================================
// energy-in-collision — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 레일 · 점선 테두리 · 끝 눈금(`trajectory`) · 수레(`body`) ·
// 운동 에너지 네모와 빗금(`region`) · 운동량 화살표(`vector`) · 이름표(`readout`) 가
// 모두 표준 어휘로 있다.
//
// 색: 수레와 운동량 화살표는 먹색, 운동 에너지 네모와 빗금은 같은 보조색(같은 대상의
// 다른 몫 — 가르는 것은 결이다). 강조색은 **운동량 끝 눈금** 한 가지 뜻에만 쓴다.
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
import { derive, readConstants, type LaneReading } from './physics';
import {
  ARROW_RISE,
  BAND_LABEL_MIN,
  BAND_LABEL_RAMP,
  CART_H,
  CART_LIFT,
  CART_W,
  KEPT_TICK_HALF,
  LANE_LABELS,
  LANE_LABEL_RISE,
  LANE_Y,
  LEDGER_BASE_RISE,
  LEDGER_SIDE,
  LEDGER_X,
  RAIL_X0,
  RAIL_X1,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { EnergyInCollisionState } from './state';

/** 이보다 짧은 변(월드)의 네모는 선언하지 않는다 — 점 하나가 남는다. */
const MIN_SIDE = 0.004;
/** 장부 이름을 네모 위로 올리는 거리(화면 px). */
const ENERGY_LABEL_OFFSET: Vec2 = [0, -12];
/** 운동량 이름을 끝 눈금 오른쪽으로 띄우는 거리(화면 px). */
const MOMENTUM_LABEL_OFFSET: Vec2 = [10, 0];

const rect = (x0: number, y0: number, x1: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

export function scene(params: {
  state: EnergyInCollisionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('energy-in-collision: schema.timeline 이 선언되어야 한다');
  const r = derive(timeline, readConstants(params.stage));
  const op = r.opacity;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const energy = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  r.lanes.forEach((lane: LaneReading, k) => {
    const y = LANE_Y[k]!;
    const id = (name: string): string => `${name}-${k}`;

    // ---- 레일 · 줄 이름 — 틀이라 옅어지지 않는다 ----
    g.push({
      type: 'trajectory',
      id: id('rail'),
      points: [
        [RAIL_X0, y],
        [RAIL_X1, y],
      ],
      width: 1,
      style: muted,
    });
    g.push({
      type: 'readout',
      id: id('lane-name'),
      anchor: { world: [RAIL_X0, y + LANE_LABEL_RISE] },
      text: text(LANE_LABELS[k]!),
      chip: false,
      font: 'text',
      fontSize: 13,
      align: 'left',
      style: ink,
    });

    // ---- 두 수레 — 같은 대상이라 같은 색 ----
    const cartY = y + CART_LIFT + CART_H / 2;
    g.push({
      type: 'body',
      id: id('cart-a'),
      pos: [lane.xA, cartY],
      shape: 'rect',
      size: [CART_W, CART_H],
      opacity: op,
      style: ink,
    });
    g.push({
      type: 'body',
      id: id('cart-b'),
      pos: [lane.xB, cartY],
      shape: 'rect',
      size: [CART_W, CART_H],
      opacity: op,
      style: ink,
    });

    // ---- 장부 ----
    const x0 = LEDGER_X;
    const L = LEDGER_SIDE;
    const yb = y + LEDGER_BASE_RISE;
    const sA = lane.uA * L;
    const sB = lane.uB * L;

    // 처음 운동 에너지의 자리 — 점선 테두리. 틀이라 옅어지지 않는다.
    g.push({
      type: 'trajectory',
      id: id('initial-outline'),
      points: rect(x0, yb, x0 + L, yb + L),
      closed: true,
      width: 1,
      style: { ...muted, lineStyle: 'dashed' },
    });

    // 빈자리 — 테두리 안에서 두 네모가 덮지 않은 곳. 두 밑변의 합이 언제나 L 이라
    // 오른쪽 끝이 늘 테두리에 닿는다. 눌리는 동안은 찌그러짐에 든 몫(빗금)이고,
    // 돌려받지 못한 것은 빗금이 걷혀 빈자리로 남는다.
    const top = Math.max(sA, sB);
    if (lane.missing > 0.002 && r.stored > 0) {
      g.push({
        type: 'region',
        id: id('stored'),
        points: [
          [x0, yb + sA],
          [x0 + sA, yb + sA],
          [x0 + sA, yb + sB],
          [x0 + L, yb + sB],
          [x0 + L, yb + L],
          [x0, yb + L],
        ],
        fill: 'hatch',
        fillOpacity: 0.5,
        opaque: true,
        opacity: op * r.stored,
        style: energy,
      });
    }

    // 두 수레의 운동 에너지 — 한 변이 속력인 네모. 왼쪽이 앞 수레, 오른쪽이 뒤 수레.
    // 네 변을 굵게 긋는다 — 같은 색 두 네모가 붙으면 한 덩어리로 읽힌다.
    const square = (name: string, left: number, side: number): void => {
      if (side < MIN_SIDE) return;
      g.push({
        type: 'region',
        id: id(name),
        points: rect(left, yb, left + side, yb + side),
        fillOpacity: 0.5,
        opaque: true,
        outline: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 0],
        ],
        opacity: op,
        style: energy,
      });
    };
    square('energy-a', x0, sA);
    square('energy-b', x0 + sA, sB);

    // 빈자리 이름 — 두 네모 위 띠가 글자를 담을 만큼 두꺼울 때만.
    const band = L - top;
    const bandFit = Math.max(0, Math.min(1, (band - BAND_LABEL_MIN) / BAND_LABEL_RAMP));
    const bandAnchor: Vec2 = [x0 + L / 2, yb + (top + L) / 2];
    if (bandFit > 0 && r.stored > 0) {
      g.push({
        type: 'readout',
        id: id('stored-name'),
        anchor: { world: bandAnchor },
        text: text('label.stored'),
        chip: false,
        font: 'text',
        fontSize: 12,
        align: 'center',
        opacity: op * r.stored * bandFit,
        style: ink,
      });
    }
    if (bandFit > 0 && r.lostLabel > 0) {
      g.push({
        type: 'readout',
        id: id('lost-name'),
        anchor: { world: bandAnchor },
        text: text('label.lost'),
        chip: false,
        font: 'text',
        fontSize: 12,
        align: 'center',
        opacity: op * r.lostLabel * bandFit,
        style: muted,
      });
    }

    // 운동량 — 네모 밑변을 따라 이은 화살표 둘. 길이가 곧 네모의 한 변이다.
    const ya = y + ARROW_RISE;
    if (sA >= MIN_SIDE) {
      g.push({
        type: 'vector',
        id: id('momentum-a'),
        from: [x0, ya],
        delta: [sA, 0],
        width: 2,
        opacity: op,
        style: ink,
      });
    }
    if (sB >= MIN_SIDE) {
      g.push({
        type: 'vector',
        id: id('momentum-b'),
        from: [x0 + sA, ya],
        delta: [sB, 0],
        width: 2,
        opacity: op,
        style: ink,
      });
    }
    // 끝 눈금 — 두 화살표를 이은 길이가 닿는 자리. 강조색은 이 한 뜻에만 쓴다.
    g.push({
      type: 'trajectory',
      id: id('momentum-end'),
      points: [
        [x0 + L, ya - KEPT_TICK_HALF],
        [x0 + L, ya + KEPT_TICK_HALF],
      ],
      width: 3,
      style: accent,
    });

    // 장부 이름 — 세 줄의 장부가 같은 모양이라 맨 위 줄에만 붙인다.
    if (k === 0) {
      g.push({
        type: 'readout',
        id: 'energy-name',
        anchor: { world: [x0 + L / 2, yb + L], offset: ENERGY_LABEL_OFFSET },
        text: text('label.energy'),
        chip: false,
        font: 'text',
        fontSize: 12,
        align: 'center',
        style: ink,
      });
      g.push({
        type: 'readout',
        id: 'momentum-name',
        anchor: { world: [x0 + L, ya], offset: MOMENTUM_LABEL_OFFSET },
        text: text('label.momentum'),
        chip: false,
        font: 'text',
        fontSize: 12,
        align: 'left',
        style: ink,
      });
    }
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
