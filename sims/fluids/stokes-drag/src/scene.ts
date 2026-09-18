// ========================================================================
// stokes-drag — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 관 속 액체(region) ·
// 구(body) · 자국 사다리(trace tick) · 잰 거리(dimension + readout) · 반지름 기호
// (readout) 가 모두 표준 어휘로 있다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색은 뜻마다 하나다 — 두 구는 먹색(같은 재료의 같은 대상이라 같은 색), 두 관의
// 액체는 같은 옅은 칠(같은 액체), 자국은 배경 정보라 회색. **강조색은 「같은 시간에
// 내려온 거리」 한 가지 뜻에만** — 큰 구가 닿은 순간의 두 치수선과 그 기호.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  ViewDef,
} from '@aperi21/schema';
import { readConstants, readSink, sceneOpacity, type SphereReading } from './physics';
import {
  LIQUID_TOP,
  MEASURE_GAP,
  RELEASE_Y,
  SCENE_BOUNDS,
  TICK_LEN,
  TUBE_BIG_X,
  TUBE_BOTTOM,
  TUBE_SMALL_X,
  TUBE_TOP,
  TUBE_W,
  text,
  type StokesDragMessageKey,
} from './schema';
import type { StokesDragState } from './state';

/** 액체 칠의 짙기. 잠긴 구와 자국이 비쳐 보여야 한다. */
const LIQUID_FILL = 0.22;
/** 자국 획 굵기(화면 px) · 짙기. 구보다 뒤로 물러나 있어야 한다. */
const TICK_WIDTH = 1.5;
const TICK_OPACITY = 0.7;
/** 반지름 기호가 관 입구 위로 뜬 높이(월드) · 글자 크기(화면 px). */
const RADIUS_LABEL_DY = 16;
const SYMBOL_PX = 14;
/** 잰 거리 기호가 치수선에서 떨어진 거리(월드). */
const DEPTH_LABEL_DX = 12;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const MEASURE = { colorRole: 'accent', emphasis: 'strong' } as const;

/** 한 관의 선언 — 자리 · 구 반지름 · 기호 · 치수선을 둘 쪽. */
interface Tube {
  id: string;
  x: number;
  radius: number;
  radiusLabel: StokesDragMessageKey;
  depthLabel: StokesDragMessageKey;
  /** 치수선을 관의 어느 쪽 바깥에 둘지 — 작은 관은 왼쪽(−1), 큰 관은 오른쪽(+1). */
  side: -1 | 1;
}

function tubePrimitives(tube: Tube): Primitive[] {
  const l = tube.x - TUBE_W / 2;
  const r = tube.x + TUBE_W / 2;
  return [
    // 액체. 두 관이 같은 칠이다 — 같은 액체라는 것이 이 조각의 전제다.
    {
      type: 'region',
      id: `liquid-${tube.id}`,
      points: [
        [l, TUBE_BOTTOM],
        [r, TUBE_BOTTOM],
        [r, LIQUID_TOP],
        [l, LIQUID_TOP],
      ],
      fillOpacity: LIQUID_FILL,
      style: { colorRole: 'secondary', emphasis: 'medium' },
    },
    // 관 벽과 바닥. 입구는 열어 둔다.
    {
      type: 'trajectory',
      id: `wall-${tube.id}`,
      points: [
        [l, TUBE_TOP],
        [l, TUBE_BOTTOM],
        [r, TUBE_BOTTOM],
        [r, TUBE_TOP],
      ],
      width: 1.5,
      style: MUTED,
    },
    // 반지름 기호. 두 구를 가르는 것은 이 기호와 크기뿐이다.
    {
      type: 'readout',
      id: `radius-${tube.id}`,
      anchor: { world: [tube.x, TUBE_TOP + RADIUS_LABEL_DY] },
      text: text(tube.radiusLabel),
      chip: false,
      align: 'center',
      font: 'text',
      italic: true,
      fontSize: SYMBOL_PX,
      style: INK,
    },
  ];
}

function spherePrimitives(tube: Tube, s: SphereReading, alpha: number): Primitive[] {
  const out: Primitive[] = [];
  // 자국 사다리. 늙지 않는다 — 간격이 곧 속력이라 지우면 주장이 사라진다.
  out.push({
    type: 'trace',
    id: `marks-${tube.id}`,
    marks: s.marks.map((y) => ({ pos: [tube.x, y] as const })),
    shape: 'tick',
    direction: [1, 0],
    size: TICK_LEN,
    width: TICK_WIDTH,
    opacity: TICK_OPACITY * alpha,
    style: MUTED,
  });
  // 구. 같은 재료라 같은 색 — 다른 것은 반지름뿐이다.
  out.push({
    type: 'body',
    id: `sphere-${tube.id}`,
    pos: [tube.x, s.y],
    shape: 'circle',
    size: tube.radius,
    outline: 'none',
    glow: false,
    opacity: alpha,
    style: INK,
  });
  return out;
}

/** 놓은 자리에서 `depth` 만큼 내려온 거리를 관 바깥에 잰다. */
function measurePrimitives(tube: Tube, depth: number, alpha: number): Primitive[] {
  const x = tube.x + tube.side * (TUBE_W / 2 + MEASURE_GAP);
  const mid = RELEASE_Y - depth / 2;
  return [
    {
      type: 'dimension',
      id: `measure-${tube.id}`,
      from: [x, RELEASE_Y],
      to: [x, RELEASE_Y - depth],
      opacity: alpha,
      style: MEASURE,
    },
    // 세로 치수선의 글자는 위 끝 너머에 붙는다(장부 G127) — 기호를 가운데 옆에 따로 둔다.
    {
      type: 'readout',
      id: `measure-label-${tube.id}`,
      anchor: { world: [x + tube.side * DEPTH_LABEL_DX, mid] },
      text: text(tube.depthLabel),
      chip: false,
      align: tube.side < 0 ? 'right' : 'left',
      font: 'text',
      italic: true,
      fontSize: SYMBOL_PX,
      opacity: alpha,
      style: MEASURE,
    },
  ];
}

export function scene(params: {
  state: StokesDragState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('stokes-drag: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const sink = readSink(timeline, c);

  const small: Tube = {
    id: 'small',
    x: TUBE_SMALL_X,
    radius: c.radiusSmall,
    radiusLabel: 'label.radiusSmall',
    depthLabel: 'label.depthSmall',
    side: -1,
  };
  const big: Tube = {
    id: 'big',
    x: TUBE_BIG_X,
    radius: c.radiusBig,
    radiusLabel: 'label.radiusBig',
    depthLabel: 'label.depthBig',
    side: 1,
  };

  const out: Primitive[] = [];
  out.push(...tubePrimitives(small), ...tubePrimitives(big));
  out.push(...spherePrimitives(small, sink.small, alpha), ...spherePrimitives(big, sink.big, alpha));

  // 큰 구가 닿은 순간 두 구가 내려와 있던 거리. 그 뒤로 작은 구는 계속 가라앉지만
  // 치수선은 **그 순간**에 붙박여 있다 — 「같은 시간에 d 와 4d」 가 남는다.
  if (sink.smallDepthAtArrival !== undefined) {
    out.push(...measurePrimitives(small, sink.smallDepthAtArrival, alpha));
    out.push(...measurePrimitives(big, sink.big.depth, alpha));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
