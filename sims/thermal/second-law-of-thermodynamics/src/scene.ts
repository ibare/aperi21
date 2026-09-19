// ========================================================================
// second-law-of-thermodynamics — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없이 표준 어휘만 쓴다.
//
//   상자            trajectory(닫힌 사각)
//   가운데선        trajectory 점선 — 「왼쪽 칸」 의 경계. 칸막이를 걷은 뒤에도 남는다
//   분자            particleSystem(꼬리 있음)
//   칸막이          trajectory 굵은 선 — 걷는 동안 오르며 옅어진다
//   그래프          trajectory(축 · N 줄 · N/2 점선 · 이력 곡선) · trace(지금 점) · readout(표식 · 축 이름)
//
// 겹침 순서는 scene 에 쓴 순서다 (`schema.drawOrder: 'scene'`).
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
import { leftCount, moleculeAt, readConstants } from './physics';
import { GRAPH, PARTITION_LIFT, SCENE_BOUNDS, text } from './schema';
import type { SecondLawOfThermodynamicsState } from './state';

/** 분자 점 반지름(화면 px). */
const MOLECULE_R = 3;
/** 분자 꼬리 — 길이 = 속도 × 이 시간(초), 불투명도. 움직이는 방향이 정지 화면에서도 읽힌다. */
const TRAIL_SECONDS = 0.1;
const TRAIL_OPACITY = 0.35;
/** 상자 벽 굵기(화면 px). */
const BOX_WIDTH_PX = 2;
/** 칸막이 굵기(화면 px). 벽보다 굵어 「막고 있다」 가 읽힌다. */
const PARTITION_WIDTH_PX = 4;
/** 안내선(가운데선 · N 줄 · N/2 점선) 굵기(화면 px). */
const GUIDE_WIDTH_PX = 1;
/** 그래프 축 굵기(화면 px). */
const AXIS_WIDTH_PX = 1.2;
/** 이력 곡선 굵기(화면 px). */
const CURVE_WIDTH_PX = 1.6;
/** 지금 점 반지름(화면 px). */
const DOT_R = 3.5;
/** 표식 · 축 이름 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 세로 눈금 표식을 축 왼쪽으로 띄우는 거리(화면 px). */
const LABEL_GAP = 6;
/** 축 이름을 축 끝에서 띄우는 거리(화면 px). 세로축은 위로, 가로축은 아래로. */
const AXIS_NAME_GAP = 12;
/** 세로축이 N 줄 위로 더 뻗는 길이(월드). N 줄이 축 끝과 겹쳐 보이지 않게 한다. */
const AXIS_OVERSHOOT = 0.14;

export function scene(params: {
  state: SecondLawOfThermodynamicsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('second-law-of-thermodynamics: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  // 분자가 가운데를 지날 수 있게 되는 순간 — 걷는 단계의 끝. 선언에서 읽는다.
  const tOpen = tl.end('open');
  const t = tl.u;
  // 주기 끝에서 분자를 왼쪽으로 모아 되돌리지 않고, 흐려졌다가 새로 나타난다.
  const shown = tl.at('appear') * (1 - tl.at('fade'));
  const lift = tl.at('open');

  const W = c.boxWidth;
  const H = c.boxHeight;
  const out: Primitive[] = [];

  // ---- 상자 ----
  out.push({
    type: 'trajectory',
    id: 'box',
    points: [
      [0, 0],
      [W, 0],
      [W, H],
      [0, H],
    ],
    closed: true,
    width: BOX_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 가운데선 — 칸막이가 있던 자리. 걷은 뒤에도 「왼쪽 칸」 이 어디까지인지 남긴다.
  out.push({
    type: 'trajectory',
    id: 'midline',
    points: [
      [W / 2, 0],
      [W / 2, H],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  });

  // ---- 분자 ----
  const positions: Vec2[] = [];
  const velocities: Vec2[] = [];
  for (const m of state.molecules) {
    const { pos, vel } = moleculeAt(m, t, tOpen, c);
    positions.push(pos);
    velocities.push(vel);
  }
  out.push({
    type: 'particleSystem',
    id: 'molecules',
    positions,
    velocities,
    trail: true,
    trailStyle: { seconds: TRAIL_SECONDS, opacity: TRAIL_OPACITY },
    sizes: MOLECULE_R,
    opacity: shown,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 칸막이 ----
  // 걷는 동안 들어 올리며 옅어진다. 다 걷힌 뒤에는 선언에서 뺀다.
  if (lift < 1) {
    const dy = lift * PARTITION_LIFT;
    out.push({
      type: 'trajectory',
      id: 'partition',
      points: [
        [W / 2, dy],
        [W / 2, H + dy],
      ],
      width: PARTITION_WIDTH_PX,
      opacity: (1 - lift) * tl.at('appear'),
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 그래프: 왼쪽 칸의 분자 수 ----
  const [ox, oy] = GRAPH.origin;
  const axisSeconds = tl.end('wait');
  const xOf = (s: number): number => ox + (s / axisSeconds) * GRAPH.width;
  const yOf = (n: number): number => oy + (n / c.count) * GRAPH.height;

  out.push({
    type: 'trajectory',
    id: 'graph-axes',
    points: [
      [ox, oy + GRAPH.height + AXIS_OVERSHOOT],
      [ox, oy],
      [ox + GRAPH.width, oy],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  // N 줄 — 처음에 곡선이 붙어 있던 높이. 되돌아오는지 견줄 기준이다.
  out.push({
    type: 'trajectory',
    id: 'line-full',
    points: [
      [ox, yOf(c.count)],
      [ox + GRAPH.width, yOf(c.count)],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  // N/2 점선 — 양쪽이 고르게 나뉜 높이.
  out.push({
    type: 'trajectory',
    id: 'line-half',
    points: [
      [ox, yOf(c.count / 2)],
      [ox + GRAPH.width, yOf(c.count / 2)],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'tick-full',
    anchor: { world: [ox, yOf(c.count)], offset: [-LABEL_GAP, 0] },
    text: text('label.full'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'tick-half',
    anchor: { world: [ox, yOf(c.count / 2)], offset: [-LABEL_GAP, 0] },
    text: text('label.half'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-count',
    anchor: { world: [ox, oy + GRAPH.height + AXIS_OVERSHOOT], offset: [0, -AXIS_NAME_GAP] },
    text: text('label.axisCount'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-time',
    anchor: { world: [ox + GRAPH.width, oy], offset: [0, AXIS_NAME_GAP] },
    text: text('label.axisTime'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 이력 곡선 — 주기 첫머리부터 지금까지 왼쪽 칸의 수. 흐려짐 단계에서는 끝에서 멈춘다.
  const now = Math.min(t, axisSeconds);
  const curve: Vec2[] = [];
  for (let s = 0; s < now; s += GRAPH.sampleSeconds) {
    curve.push([xOf(s), yOf(leftCount(state.molecules, s, tOpen, c))]);
  }
  const nNow = leftCount(state.molecules, now, tOpen, c);
  curve.push([xOf(now), yOf(nNow)]);
  if (curve.length >= 2) {
    out.push({
      type: 'trajectory',
      id: 'count-curve',
      points: curve,
      width: CURVE_WIDTH_PX,
      opacity: shown,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  // 지금 점 — 강조색은 이 한 뜻(지금 왼쪽 칸의 수)에만 쓴다.
  out.push({
    type: 'trace',
    id: 'count-now',
    shape: 'dot',
    size: DOT_R,
    marks: [{ pos: [xOf(now), yOf(nNow)] }],
    opacity: shown,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
