// ========================================================================
// electric-current — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 도선 띠(region) ·
// 전자 알갱이(particleSystem) · 단면 문(lineSet) · 센 수 네모(body) · 시간 막대
// (region + readout) · 방향 표식(vector) · 도선 기호(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 전자는 primary(세 도선에서 같은 대상이라 같은 색), **강조색은
// 「세었다」 한 가지 뜻에만**(열린 문 · 세어진 알갱이 · 쌓인 네모 · 차오르는 시간 막대).
// 도선 · 닫힌 문 · 기호는 배경 정보라 muted, 관례 전류 화살표는 ink.
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
  gateIsOpen,
  gateProgress,
  readConstants,
  readGate,
  readLane,
  tallyOpacity,
} from './physics';
import {
  CLOCK_HEIGHT,
  CLOCK_WIDTH,
  CLOCK_Y,
  CURRENT_ARROW_FROM,
  DIRECTION_ARROW_LEN,
  DIRECTION_Y,
  ELECTRON_ARROW_FROM,
  GATE_HALF,
  GATE_X,
  LANE_BASE_Y,
  LANE_DENSE_Y,
  LANE_FAST_Y,
  LANE_LABEL_X,
  SCENE_BOUNDS,
  TALLY_PITCH,
  TALLY_SIZE,
  TALLY_START_X,
  WIRE_EDGE_FADE,
  WIRE_LEFT,
  WIRE_RIGHT,
  WIRE_THICKNESS,
  text,
  type ElectricCurrentMessageKey,
} from './schema';
import type { ElectricCurrentState } from './state';

/** 전자 알갱이 반지름(화면 px). 세 도선이 같다 — 알갱이 하나가 같은 전하다. */
const CARRIER_PX = 4.5;
/** 도선 띠의 짙기. 알갱이가 그 위에서 또렷해야 해 옅다. */
const WIRE_FILL = 0.18;
/** 단면 문 선 굵기(화면 px). 닫혔을 때 · 열렸을 때. 열리면 굵어져 「지금 센다」 가 모양으로도 읽힌다. */
const GATE_CLOSED_PX = 1.5;
const GATE_OPEN_PX = 3;
/** 닫힌 문의 짙기. 흐름을 가로막는 것이 아니라 표시일 뿐이라 물러나 있다. */
const GATE_CLOSED_OPACITY = 0.6;
/** 시간 막대 바탕 틀의 짙기. */
const CLOCK_FRAME_FILL = 0.2;
/** 시간 막대 오른쪽 끝에서 이름표까지 띄움(화면 px). */
const CLOCK_LABEL_GAP_PX = 8;
/** 도선 기호 · 시간 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 방향 화살표 굵기(화면 px). 도선보다 앞에 나서지 않게 보통 굵기. */
const DIRECTION_ARROW_PX = 2;

/** 도선 한 줄의 선언 — 높이 · 속력 · 간격 · 기호와 기호에 끼울 선언값. */
interface Lane {
  id: string;
  y: number;
  speed: number;
  spacing: number;
  label: ElectricCurrentMessageKey;
  vars?: Record<string, string>;
}

export function scene(params: {
  state: ElectricCurrentState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('electric-current: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const gate = readGate(timeline);
  const open = gateIsOpen(timeline, gate);
  const alpha = tallyOpacity(timeline);
  const out: Primitive[] = [];

  // 도선 셋의 목록은 코드 표로 남는다 — 스테이지 상수가 수 하나씩뿐이다 (NOTES (c) G105).
  const lanes: Lane[] = [
    { id: 'base', y: LANE_BASE_Y, speed: c.speed, spacing: c.spacing, label: 'label.laneBase' },
    {
      id: 'fast',
      y: LANE_FAST_Y,
      speed: c.fastSpeed,
      spacing: c.spacing,
      label: 'label.laneFast',
      vars: { n: String(c.fastMultiple) },
    },
    {
      id: 'dense',
      y: LANE_DENSE_Y,
      speed: c.speed,
      spacing: c.denseSpacing,
      label: 'label.laneDense',
      vars: { n: String(c.denseDivisor) },
    },
  ];

  const half = WIRE_THICKNESS / 2;
  const gateLines: Vec2[][] = [];

  for (const lane of lanes) {
    // ---- 도선 ----
    // 위 · 아래 변만 긋는다. 양 끝을 막으면 잘린 도막으로 읽혀 「더 긴 도선의 한 단면」 이 흐려진다.
    out.push({
      type: 'region',
      id: `wire-${lane.id}`,
      points: [
        [WIRE_LEFT, lane.y + half],
        [WIRE_RIGHT, lane.y + half],
        [WIRE_RIGHT, lane.y - half],
        [WIRE_LEFT, lane.y - half],
      ],
      fillOpacity: WIRE_FILL,
      outline: [
        [0, 1],
        [2, 3],
      ],
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // ---- 전자 알갱이 ----
    // 모두 primary 로 한 벌, 그 위에 세어진 것만 강조색으로 한 벌 더 겹친다. 흐려짐 단계에서
    // 강조 벌만 옅어져 세어진 알갱이가 제 색으로 돌아간다 — 주기가 바뀌는 순간 색이 튀지 않는다.
    const reading = readLane(timeline, gate, lane.speed, lane.spacing, WIRE_LEFT, WIRE_RIGHT);
    const all: Vec2[] = [];
    const allOpacity: number[] = [];
    const counted: Vec2[] = [];
    const countedOpacity: number[] = [];
    for (const carrier of reading.carriers) {
      const pos: Vec2 = [carrier.x, lane.y];
      const edge = edgeOpacity(carrier.x);
      all.push(pos);
      allOpacity.push(edge);
      if (carrier.counted) {
        counted.push(pos);
        countedOpacity.push(edge);
      }
    }
    out.push({
      type: 'particleSystem',
      id: `carriers-${lane.id}`,
      positions: all,
      opacities: allOpacity,
      sizes: CARRIER_PX,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
    if (counted.length > 0) {
      out.push({
        type: 'particleSystem',
        id: `counted-${lane.id}`,
        positions: counted,
        opacities: countedOpacity,
        sizes: CARRIER_PX,
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    gateLines.push([
      [GATE_X, lane.y - GATE_HALF],
      [GATE_X, lane.y + GATE_HALF],
    ]);

    // ---- 센 수 ----
    // 알갱이가 문을 지날 때마다 문 옆에 네모가 하나씩 붙는다. 네모 크기가 세 도선에서
    // 같아 줄의 길이가 곧 센 수다 — 수를 띄우지 않아도 4 와 8 이 길이로 견줘진다.
    for (let i = 0; i < reading.count; i++) {
      out.push({
        type: 'body',
        id: `tally-${lane.id}-${i}`,
        pos: [TALLY_START_X + i * TALLY_PITCH, lane.y],
        shape: 'rect',
        size: [TALLY_SIZE, TALLY_SIZE],
        outline: 'none',
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    // ---- 도선 기호 ----
    out.push({
      type: 'readout',
      id: `lane-label-${lane.id}`,
      anchor: { world: [LANE_LABEL_X, lane.y] },
      text: text(lane.label),
      vars: lane.vars,
      chip: false,
      fontSize: LABEL_PX,
      italic: true,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 단면 문 ----
  // 세 도선의 문이 같은 x 에서 **함께** 열리고 닫힌다 — 같은 시간을 센다는 것이 전제다.
  out.push({
    type: 'lineSet',
    id: 'gates',
    lines: gateLines,
    width: open ? GATE_OPEN_PX : GATE_CLOSED_PX,
    opacity: open ? 1 : GATE_CLOSED_OPACITY,
    style: open ? { colorRole: 'accent', emphasis: 'strong' } : { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 세는 시간 막대 ----
  // 문 위에 걸려 문이 열린 동안 왼쪽에서 오른쪽으로 찬다. 다 차면 문이 닫힌다.
  const clockLeft = GATE_X - CLOCK_WIDTH / 2;
  const clockRight = GATE_X + CLOCK_WIDTH / 2;
  const clockTop = CLOCK_Y + CLOCK_HEIGHT / 2;
  const clockBottom = CLOCK_Y - CLOCK_HEIGHT / 2;
  out.push({
    type: 'region',
    id: 'clock-frame',
    points: [
      [clockLeft, clockTop],
      [clockRight, clockTop],
      [clockRight, clockBottom],
      [clockLeft, clockBottom],
    ],
    fillOpacity: CLOCK_FRAME_FILL,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const filled = gateProgress(timeline, gate);
  if (filled > 0) {
    const fillRight = clockLeft + CLOCK_WIDTH * filled;
    out.push({
      type: 'region',
      id: 'clock-fill',
      points: [
        [clockLeft, clockTop],
        [fillRight, clockTop],
        [fillRight, clockBottom],
        [clockLeft, clockBottom],
      ],
      fillOpacity: 1,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'readout',
    id: 'clock-label',
    anchor: { world: [clockRight, CLOCK_Y], offset: [CLOCK_LABEL_GAP_PX, 0] },
    text: text('label.countTime'),
    vars: { t: String(timeline.duration('count')) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 방향 표식 ----
  // 한 번만 둔다. 전자는 알갱이와 같은 색으로 왼쪽, 관례 전류는 먹색으로 오른쪽.
  out.push({
    type: 'vector',
    id: 'direction-electron',
    from: [ELECTRON_ARROW_FROM, DIRECTION_Y],
    delta: [-DIRECTION_ARROW_LEN, 0],
    label: text('label.electron'),
    labelSide: 'cw',
    width: DIRECTION_ARROW_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'direction-current',
    from: [CURRENT_ARROW_FROM, DIRECTION_Y],
    delta: [DIRECTION_ARROW_LEN, 0],
    label: text('label.current'),
    labelSide: 'ccw',
    width: DIRECTION_ARROW_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 도선 끝에서 알갱이가 흐려지며 들고 나는 정도 0~1. */
function edgeOpacity(x: number): number {
  const fromLeft = (x - WIRE_LEFT) / WIRE_EDGE_FADE;
  const fromRight = (WIRE_RIGHT - x) / WIRE_EDGE_FADE;
  return Math.max(0, Math.min(1, fromLeft, fromRight));
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
