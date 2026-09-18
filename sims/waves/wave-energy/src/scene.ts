// ========================================================================
// wave-energy — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 줄 · 평형선(trajectory),
// 손잡이 · 끝 고리(body), 고리 속도(vector), 고리 기둥 · 막대 눈금(lineSet),
// 막대 틀 · 쌓인 에너지(region), 진폭 치수선(dimension), 기호(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 줄과 손잡이는 먹색(두 줄이 같은 대상이라 같은 색), 끝 고리와 그
// 속도는 primary(같은 점의 두 모습), **강조색은 「끝에 닿은 에너지」 한 뜻에만**(막대).
// 평형선 · 치수선 · 기둥 · 막대 틀 · 눈금 · 기호는 배경 정보라 muted.
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
  barOpacity,
  displacement,
  readConstants,
  ropeEndX,
  storedCells,
  velocity,
} from './physics';
import {
  AMPLITUDE_DIM_X,
  BAR_START,
  BAR_THICKNESS,
  CELL,
  LANE_BOTTOM_Y,
  LANE_TOP_Y,
  ROPE_START,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { WaveEnergyState } from './state';

// ---- 표본 수 — 상태로 계산하지 않는다 ----
/** 줄의 표본 수. 한 파장(2 m)에 약 80 점. */
const ROPE_SAMPLES = 240;

/** 배수² 가 부동소수 오차로 정수를 살짝 넘을 때 칸이 하나 더 생기지 않게 깎는 몫. */
const CELL_COUNT_EPSILON = 1e-9;

// ---- 선 굵기(화면 px) ----
const ROPE_WIDTH_PX = 2.5;
const GUIDE_WIDTH_PX = 1;
const VELOCITY_WIDTH_PX = 2;

// ---- 짙기 ----
/** 평형선 · 고리 기둥 · 막대 눈금. 줄보다 뒤로 물러나 있어야 한다. */
const GUIDE_OPACITY = 0.5;
/** 막대 눈금. 차오른 강조색 위를 지나가도 칸이 셀 수 있어야 해서 안내선보다 짙다. */
const TICK_OPACITY = 0.8;
/** 빈 막대 틀의 채움. 다 찰 자리가 보일 만큼만. */
const TRACK_FILL = 0.12;
/** 쌓인 에너지의 채움. 다크 바탕에서도 틀과 또렷이 갈려야 한다. */
const STORED_FILL = 0.8;

// ---- 크기(월드 m) ----
/** 흔드는 손잡이 [가로, 세로]. */
const HANDLE_SIZE: readonly [number, number] = [0.16, 0.3];
/** 손잡이를 줄 왼쪽 끝에서 바깥으로 물린 거리. */
const HANDLE_INSET = 0.08;
const RING_RADIUS = 0.1;
/** 고리 기둥이 가장 큰 흔들림 너머로 나가는 길이. */
const ROD_OVERRUN = 0.15;
/**
 * 고리 속도 → 화살표 길이 배율(m per m/s). 아래 고리의 최대 속력 3.1 m/s 가 약 0.8 m 가 되어,
 * 평형 자리를 지날 때(속력이 가장 클 때) 화살표가 위 고리 기둥의 아래 끝(1.1 m)에 닿지 않는다.
 * 0.13 으로 시작했더니 화살촉만 남아 두 배가 읽히지 않았다.
 */
const VELOCITY_SCALE = 0.25;
/** 화살표가 이 길이(월드 m)보다 짧으면 그리지 않는다 — 머리만 남은 점이 된다. */
const VELOCITY_MIN_LEN = 0.04;

// ---- 글자 ----
const SYMBOL_PX = 15;
const TICK_LABEL_PX = 12;
/** 기호 · 이름표를 대상에서 띄우는 거리(월드 m). */
const AMPLITUDE_LABEL_GAP = 0.24;
const TICK_LABEL_GAP = 0.2;
/** 눈금선이 막대 바깥으로 나가는 길이(월드 m). */
const TICK_OVERRUN = 0.08;

/** 한 줄의 선언 — 평형 높이와 진폭, 치수선에 붙는 기호. */
interface Lane {
  id: string;
  y: number;
  amplitude: number;
  label: Primitive['label'];
  labelVars?: Record<string, string>;
}

export function scene(params: {
  state: WaveEnergyState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('wave-energy: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const t = timeline.t;
  const ropeEnd = ropeEndX(c);
  const alpha = barOpacity(timeline);
  const out: Primitive[] = [];

  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;

  const lanes: Lane[] = [
    { id: 'top', y: LANE_TOP_Y, amplitude: c.amplitude, label: text('label.amplitude') },
    {
      id: 'bottom',
      y: LANE_BOTTOM_Y,
      amplitude: c.amplitude * c.amplitudeRatio,
      label: text('label.amplitudeScaled'),
      // 화면의 배수는 선언값 그대로다 (S-piece 유효숫자).
      labelVars: { k: String(c.amplitudeRatio) },
    },
  ];

  // 막대 칸 수 — 아래 막대가 다 차는 자리(배수²)까지 센다.
  const cellCount = Math.max(1, Math.ceil(c.amplitudeRatio * c.amplitudeRatio - CELL_COUNT_EPSILON));
  const barEnd = BAR_START + cellCount * CELL;

  for (const lane of lanes) {
    const a = lane.amplitude;

    // ---- 평형선 ----
    out.push({
      type: 'trajectory',
      id: `equilibrium-${lane.id}`,
      points: [
        [ROPE_START, lane.y],
        [ropeEnd, lane.y],
      ],
      width: GUIDE_WIDTH_PX,
      opacity: GUIDE_OPACITY,
      style: { ...muted, lineStyle: 'dashed' },
    });

    // ---- 진폭 치수선 ----
    // 손잡이 바깥에 평형선에서 마루 높이까지. 두 줄에서 다른 것은 이 길이 하나다.
    out.push({
      type: 'dimension',
      id: `amplitude-dim-${lane.id}`,
      from: [AMPLITUDE_DIM_X, lane.y],
      to: [AMPLITUDE_DIM_X, lane.y + a],
      style: muted,
    });
    out.push({
      type: 'readout',
      id: `amplitude-label-${lane.id}`,
      anchor: { world: [AMPLITUDE_DIM_X - AMPLITUDE_LABEL_GAP, lane.y + a / 2] },
      text: lane.label ?? text('label.amplitude'),
      vars: lane.labelVars,
      chip: false,
      fontSize: SYMBOL_PX,
      font: 'text',
      italic: true,
      style: muted,
    });

    // ---- 고리 기둥 ----
    // 끝 고리는 이 세로 기둥을 따라서만 움직인다 — 받는 것은 옆으로 가는 물결이 아니라
    // 오르내림이 하는 일이다.
    out.push({
      type: 'lineSet',
      id: `rod-${lane.id}`,
      lines: [
        [
          [ropeEnd, lane.y - a - ROD_OVERRUN],
          [ropeEnd, lane.y + a + ROD_OVERRUN],
        ],
      ],
      width: GUIDE_WIDTH_PX,
      opacity: GUIDE_OPACITY,
      style: muted,
    });

    // ---- 줄 ----
    const rope: Vec2[] = [];
    for (let i = 0; i <= ROPE_SAMPLES; i++) {
      const x = ROPE_START + ((ropeEnd - ROPE_START) * i) / ROPE_SAMPLES;
      rope.push([x, lane.y + displacement(x, t, a, c)]);
    }
    out.push({
      type: 'trajectory',
      id: `rope-${lane.id}`,
      points: rope,
      width: ROPE_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ---- 흔드는 손잡이 ----
    // 두 손잡이가 같은 박자로 오르내린다 — 같은 진동수라는 것이 이 조각의 전제다.
    out.push({
      type: 'body',
      id: `handle-${lane.id}`,
      pos: [ROPE_START - HANDLE_INSET, lane.y + displacement(ROPE_START, t, a, c)],
      shape: 'rect',
      size: HANDLE_SIZE,
      outline: 'none',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ---- 끝 고리의 속도 ----
    // 길이가 속력에 비례한다. 두 고리는 같은 순간 평형을 지나고, 그때 아래 화살표가
    // 위의 두 배다. 막대는 이 화살표가 길 때 빨리 찬다.
    const endY = lane.y + displacement(ropeEnd, t, a, c);
    const vy = velocity(ropeEnd, t, a, c) * VELOCITY_SCALE;
    if (Math.abs(vy) > VELOCITY_MIN_LEN) {
      out.push({
        type: 'vector',
        id: `ring-velocity-${lane.id}`,
        from: [ropeEnd, endY],
        delta: [0, vy],
        width: VELOCITY_WIDTH_PX,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    }

    // ---- 끝 고리 ----
    out.push({
      type: 'body',
      id: `ring-${lane.id}`,
      pos: [ropeEnd, endY],
      shape: 'circle',
      size: RING_RADIUS,
      outline: 'background',
      glow: false,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });

    // ---- 에너지 막대 ----
    // 빈 틀은 두 줄이 같다(칸 수가 같다). 차오르는 몫만 다르다.
    const barBottom = lane.y - BAR_THICKNESS / 2;
    const barTop = lane.y + BAR_THICKNESS / 2;
    out.push({
      type: 'region',
      id: `bar-track-${lane.id}`,
      points: [
        [BAR_START, barBottom],
        [barEnd, barBottom],
        [barEnd, barTop],
        [BAR_START, barTop],
      ],
      fillOpacity: TRACK_FILL,
      outline: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ],
      style: muted,
    });

    const stored = storedCells(timeline, a, c);
    if (stored > 0) {
      const fillEnd = BAR_START + Math.min(stored, cellCount) * CELL;
      out.push({
        type: 'region',
        id: `bar-stored-${lane.id}`,
        points: [
          [BAR_START, barBottom],
          [fillEnd, barBottom],
          [fillEnd, barTop],
          [BAR_START, barTop],
        ],
        fillOpacity: STORED_FILL,
        opaque: true,
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // ---- 막대 눈금 ----
  // 한 칸 = 위 줄이 채운 양 E. 두 막대를 세로로 꿰어야 「위가 한 칸일 때 아래는 몇 칸인가」
  // 를 눈으로 셀 수 있다.
  const tickTop = LANE_TOP_Y + BAR_THICKNESS / 2 + TICK_OVERRUN;
  const tickBottom = LANE_BOTTOM_Y - BAR_THICKNESS / 2 - TICK_OVERRUN;
  const ticks: Vec2[][] = [];
  for (let i = 1; i < cellCount; i++) {
    const x = BAR_START + i * CELL;
    ticks.push([
      [x, tickBottom],
      [x, tickTop],
    ]);
  }
  if (ticks.length > 0) {
    out.push({
      type: 'lineSet',
      id: 'bar-ticks',
      lines: ticks,
      width: GUIDE_WIDTH_PX,
      opacity: TICK_OPACITY,
      style: muted,
    });
  }
  for (let i = 1; i <= cellCount; i++) {
    out.push({
      type: 'readout',
      id: `bar-tick-label-${i}`,
      anchor: { world: [BAR_START + i * CELL, tickBottom - TICK_LABEL_GAP] },
      text: i === 1 ? text('label.energyUnit') : text('label.energyMultiple'),
      vars: i === 1 ? undefined : { n: i },
      chip: false,
      fontSize: TICK_LABEL_PX,
      font: 'text',
      italic: true,
      align: 'center',
      style: muted,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
