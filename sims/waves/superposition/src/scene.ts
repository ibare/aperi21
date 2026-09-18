// ========================================================================
// superposition — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 평형선 · 각 펄스 · 줄은
// `trajectory`, 펄스 이름은 `readout`, 겹친 한 점의 더하기는 `vector` 둘이다.
// 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색은 뜻마다 하나다 — 줄(두 펄스의 합)은 먹색 굵은 선, 각 펄스는 무채색 가는
// 점선(A · B 가 같은 부류라 같은 색 · 같은 모양이다. 둘을 가르는 것은 모양과 이름),
// 더하기 화살표는 둘 다 `secondary`. 두 줄(위 · 위 / 위 · 아래)도 색으로 가르지 않는다 —
// 다른 것은 B 가 솟았는지 꺼졌는지이고, 그것은 모양이 말한다 (S-piece).
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
  components,
  readConstants,
  readPulses,
  sceneOpacity,
  type PulsePositions,
  type SuperpositionConstants,
} from './physics';
import {
  LANE_OPPOSITE_Y,
  LANE_SAME_Y,
  SCENE_BOUNDS,
  STRING_HALF,
  text,
} from './schema';
import type { SuperpositionState } from './state';

/** 곡선 표본 간격(월드 칸). 좁은 펄스(1.3 칸)에도 표본이 30 개 넘게 걸린다. */
const SAMPLE_STEP = 0.04;
/** 줄(합) 굵기 · 각 펄스 점선 굵기 · 평형선 굵기(화면 px). 합이 주인공이라 가장 굵다. */
const STRING_WIDTH = 2.5;
const COMPONENT_WIDTH = 1.25;
const REST_WIDTH = 1;
/** 더하기 화살표 굵기(화면 px). 줄보다 가늘어야 줄 모양을 가리지 않는다. */
const ARROW_WIDTH = 2;
/**
 * 두 화살표를 좌우로 벌리는 거리(월드 칸). 한 세로선에 겹쳐 세우면 아래 줄에서 B 가
 * A 의 몸통을 거슬러 내려와 둘이 한 줄로 뭉친다 (장부 G108).
 */
const ARROW_GAP = 0.16;
/**
 * 더하기 화살표를 세우는 문턱(월드 칸). 가운데에서 두 변위가 **둘 다** 이만큼은 되어야
 * 세운다 — 겹침이 막 시작하거나 끝날 때는 한쪽 화살표만 남아 「더하기」 가 아니게 된다.
 */
const ARROW_MIN = 0.12;
/** 펄스 이름표 글자 크기(화면 px)와 펄스 꼭대기에서 띄우는 거리(화면 px). */
const LABEL_PX = 12;
const LABEL_GAP_PX = 11;

/** 한 줄의 선언 — 평형 높이와 B 의 방향. */
interface Lane {
  id: string;
  y: number;
  /** B 가 위로 솟으면 +1, 아래로 꺼지면 −1. */
  sign: number;
}

const LANES: readonly Lane[] = [
  { id: 'same', y: LANE_SAME_Y, sign: 1 },
  { id: 'opposite', y: LANE_OPPOSITE_Y, sign: -1 },
];

/** [from, to] 구간을 줄 끝 안쪽에서 표본해 곡선 하나를 뽑는다. */
function curve(from: number, to: number, y0: number, fn: (x: number) => number): Vec2[] {
  const a = Math.max(-STRING_HALF, from);
  const b = Math.min(STRING_HALF, to);
  const pts: Vec2[] = [];
  if (b <= a) return pts;
  const n = Math.max(1, Math.ceil((b - a) / SAMPLE_STEP));
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    pts.push([x, y0 + fn(x)]);
  }
  return pts;
}

function laneScene(
  lane: Lane,
  p: PulsePositions,
  c: SuperpositionConstants,
  alpha: number,
): Primitive[] {
  const out: Primitive[] = [];
  const at = (x: number) => components(x, p, c, lane.sign);

  // ---- 평형선 ----
  // 줄이 쉬는 자리. 줄이 평평한 곳에서는 줄에 가려 보이지 않고, 펄스 아래에서만
  // 드러나 「얼마나 솟았나 · 꺼졌나」 의 기준이 된다.
  out.push({
    type: 'trajectory',
    id: `rest-${lane.id}`,
    points: [
      [-STRING_HALF, lane.y],
      [STRING_HALF, lane.y],
    ],
    width: REST_WIDTH,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });

  // ---- 각 펄스 ----
  // 겹치지 않는 동안은 줄에 가려 하나로 보이고, 겹치는 동안에만 줄에서 떨어져 나와
  // **각자 제 모양 그대로 지나가는 것** 이 보인다. 밑변 구간에만 긋는다 — 줄 전체에
  // 그으면 평평한 점선이 줄과 겹쳐 결이 생긴다.
  const halfA = c.widthA / 2;
  const halfB = c.widthB / 2;
  const pieces: { id: string; from: number; to: number; fn: (x: number) => number }[] = [
    { id: 'a', from: p.xA - halfA, to: p.xA + halfA, fn: (x) => at(x).a },
    { id: 'b', from: p.xB - halfB, to: p.xB + halfB, fn: (x) => at(x).b },
  ];
  for (const piece of pieces) {
    const points = curve(piece.from, piece.to, lane.y, piece.fn);
    if (points.length < 2) continue;
    out.push({
      type: 'trajectory',
      id: `pulse-${piece.id}-${lane.id}`,
      points,
      width: COMPONENT_WIDTH,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 줄 = 두 펄스의 합 ----
  out.push({
    type: 'trajectory',
    id: `string-${lane.id}`,
    points: curve(-STRING_HALF, STRING_HALF, lane.y, (x) => {
      const v = at(x);
      return v.a + v.b;
    }),
    width: STRING_WIDTH,
    // 주기 끝에서는 줄째 흐려져 평형선만 남았다가 다시 나타난다. 진폭을 줄여 지우면
    // 펄스가 잦아드는 것으로 읽혀 「처음 모양 그대로」 와 어긋난다.
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'solid' },
  });

  // 두 펄스가 만나는 가운데(대칭이라 x = 0)의 두 변위.
  const mid = at(0);
  if (p.overlapping) {
    // ---- 한 점의 더하기 ----
    // 가운데에서 A 의 변위를 세우고, 그 끝에서 B 의 변위를 잇는다. 둘째 화살표의 끝이
    // 곧 줄이다 — 「점마다 더해진다」 를 한 점에서 편다.
    if (Math.abs(mid.a) < ARROW_MIN || Math.abs(mid.b) < ARROW_MIN) return out;
    out.push({
      type: 'vector',
      id: `add-a-${lane.id}`,
      from: [-ARROW_GAP, lane.y],
      delta: [0, mid.a],
      label: text('label.pulseA'),
      labelSide: 'ccw',
      labelChip: true,
      width: ARROW_WIDTH,
      opacity: alpha,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
    out.push({
      type: 'vector',
      id: `add-b-${lane.id}`,
      from: [ARROW_GAP, lane.y + mid.a],
      delta: [0, mid.b],
      label: text('label.pulseB'),
      labelSide: lane.sign > 0 ? 'cw' : 'ccw',
      labelChip: true,
      width: ARROW_WIDTH,
      opacity: alpha,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  } else {
    // ---- 펄스 이름 ----
    // 겹치지 않는 동안만 붙인다. 겹치는 동안은 더하기 화살표가 같은 이름을 이어받는다 —
    // 이름표가 두 펄스를 따라 가운데로 모이면 서로 겹친다.
    out.push({
      type: 'readout',
      id: `name-a-${lane.id}`,
      anchor: { world: [p.xA, lane.y + c.ampA], offset: [0, -LABEL_GAP_PX] },
      text: text('label.pulseA'),
      chip: false,
      fontSize: LABEL_PX,
      font: 'text',
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `name-b-${lane.id}`,
      anchor: {
        world: [p.xB, lane.y + lane.sign * c.ampB],
        offset: [0, -lane.sign * LABEL_GAP_PX],
      },
      text: text('label.pulseB'),
      chip: false,
      fontSize: LABEL_PX,
      font: 'text',
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  return out;
}

export function scene(params: {
  state: SuperpositionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('superposition: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const p = readPulses(timeline, c);
  const alpha = sceneOpacity(timeline);
  const out: Primitive[] = [];
  for (const lane of LANES) out.push(...laneScene(lane, p, c, alpha));
  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
