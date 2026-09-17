// ========================================================================
// maxwell-boltzmann-distribution — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없이 표준 어휘만 쓴다.
//
//   속력 축        trajectory(선) · trace(tick 눈금) · readout(숫자 · 축 이름)
//   300 K 곡선     trajectory 점선
//   분자 더미      particleSystem
//   지금 곡선      trajectory 실선
//   따라가는 분자  particleSystem (강조색)
//   이동선         trajectory + trace(ring: 300 K 때 · dot: 지금)
//
// 겹침 순서는 scene 에 쓴 순서다 (`schema.drawOrder: 'scene'`).
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  ParticleSystem,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  autoTemp,
  mostProbableSpeed,
  readConstants,
  relativeDensity,
  speedFactor,
  trackedIndices,
} from './physics';
import { PLOT, SCENE_BOUNDS, TRACKED_QUANTILES, text } from './schema';
import type { MaxwellBoltzmannDistributionState } from './state';

/** 분자 점 반지름(화면 px). 원본 r = 2.4. */
const MOLECULE_R = 2.4;
/** 따라가는 분자 반지름(화면 px). 원본 r + 0.8. */
const TRACKED_R = 3.2;
/** 곡선 굵기(화면 px). 원본 점선 1.2 · 실선 1.4. */
const GHOST_WIDTH = 1.2;
const CURVE_WIDTH = 1.4;
/** 축 · 눈금 굵기(화면 px). */
const AXIS_WIDTH = 1;
/** 이동선 굵기(화면 px). 원본 1.5, 속 빈 원의 테두리 1.2. */
const STRIP_WIDTH = 1.5;
const RING_WIDTH = 1.2;
/** 이동선 양 끝 원 반지름(화면 px). 원본 3 · 3.2. */
const RING_R = 3;
const DOT_R = 3.2;
/** 눈금 글자 크기(화면 px). 원본 11 px. */
const TICK_FONT = 11;

export function scene(params: {
  state: MaxwellBoltzmannDistributionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('maxwell-boltzmann-distribution: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  // 자동 진행이면 시간표가, 독자가 잡은 뒤면 상태가 온도를 정한다.
  const temp = state.manual ? state.temp : autoTemp(timeline.at('heat'), timeline.at('cool'), c);
  const s = speedFactor(temp, c.t0);
  const vp0 = mostProbableSpeed(c.t0, c.massU);
  const vp = vp0 * s;

  const xOf = (v: number): number => (Math.min(c.vMax, v) / c.vMax) * PLOT.width;
  const heightOf = (v: number, vpc: number): number => PLOT.peak * relativeDensity(Math.min(c.vMax, v), vpc, vp0);

  const out: Primitive[] = [];

  // ---- 속력 축 ----
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [0, 0],
      [PLOT.width, 0],
    ],
    width: AXIS_WIDTH,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trace',
    id: 'axis-ticks',
    shape: 'tick',
    size: PLOT.tickLength,
    width: AXIS_WIDTH,
    marks: PLOT.ticks.map((v) => ({ pos: [xOf(v), -PLOT.tickLength / 2] as Vec2 })),
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  PLOT.ticks.forEach((v, i) => {
    const label: Readout = {
      type: 'readout',
      id: `tick-${v}`,
      anchor: { world: [xOf(v), 0], offset: [0, PLOT.tickLabelDrop] },
      text: text('label.tick'),
      vars: { v },
      chip: false,
      font: 'text',
      fontSize: TICK_FONT,
      // 0 은 원본처럼 왼쪽에 붙인다 — 축 끝 밖으로 나가지 않게.
      align: i === 0 ? 'left' : 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    out.push(label);
  });
  out.push({
    type: 'readout',
    id: 'axis-name',
    anchor: { world: [PLOT.width, 0], offset: [0, PLOT.tickLabelDrop] },
    text: text('label.axis'),
    chip: false,
    font: 'text',
    fontSize: TICK_FONT,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 곡선 ----
  const curve = (vpc: number): Vec2[] => {
    const pts: Vec2[] = [];
    for (let px = 0; px <= PLOT.width; px += PLOT.curveStep) {
      pts.push([px, heightOf((px / PLOT.width) * c.vMax, vpc)]);
    }
    return pts;
  };

  // 300 K — 비교 기준. "낮아졌다" 는 견줄 것이 화면에 있어야 성립한다.
  const ghost: Trajectory = {
    type: 'trajectory',
    id: 'ghost-curve',
    points: curve(vp0),
    width: GHOST_WIDTH,
    style: { colorRole: 'muted', emphasis: 'subtle', lineStyle: 'dashed' },
  };
  out.push(ghost);

  // ---- 분자 더미 ----
  // 가로 = 그 분자의 속력(모두 같은 배율), 세로 = 고정 비율 × 그 속력에서의 곡선 높이.
  // 곡선이 낮아지는 만큼 점도 함께 내려앉는다.
  const tracked = trackedIndices(state.baseSpeeds.length, TRACKED_QUANTILES);
  const isTracked = new Set(tracked);
  const molPos = (i: number): Vec2 => {
    const v = state.baseSpeeds[i]! * s;
    return [xOf(v), state.heightFracs[i]! * heightOf(v, vp)];
  };
  const pile: Vec2[] = [];
  for (let i = 0; i < state.baseSpeeds.length; i++) {
    if (!isTracked.has(i)) pile.push(molPos(i));
  }
  const molecules: ParticleSystem = {
    type: 'particleSystem',
    id: 'molecules',
    positions: pile,
    sizes: MOLECULE_R,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(molecules);

  // 지금 온도의 곡선 — 점들이 채우는 영역의 윤곽.
  out.push({
    type: 'trajectory',
    id: 'curve',
    points: curve(vp),
    width: CURVE_WIDTH,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 따라가는 분자 ----
  // 강조색은 이 한 뜻뿐이다. 더미 안의 점과 축 아래 이동선이 같은 분자라 같은 색이다.
  out.push({
    type: 'particleSystem',
    id: 'tracked',
    positions: tracked.map(molPos),
    sizes: TRACKED_R,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 이동선: 300 K 때 속력 → 지금 속력 ----
  // 선 길이가 원래 속력에 비례한다 — "빠른 분자일수록 더 멀리".
  const starts: Vec2[] = [];
  const ends: Vec2[] = [];
  tracked.forEach((i, k) => {
    const y = PLOT.stripTop - k * PLOT.stripGap;
    const x0 = xOf(state.baseSpeeds[i]!);
    const x1 = xOf(state.baseSpeeds[i]! * s);
    starts.push([x0, y]);
    ends.push([x1, y]);
    // 속 빈 원 안으로 선이 비치지 않게 원 둘레에서 출발한다 — 원본은 바탕색으로 원 속을 칠했다.
    const from = x0 + (x1 >= x0 ? RING_R : -RING_R);
    if (Math.abs(x1 - x0) > RING_R) {
      out.push({
        type: 'trajectory',
        id: `strip-${k}`,
        points: [
          [from, y],
          [x1, y],
        ],
        width: STRIP_WIDTH,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  });
  out.push({
    type: 'trace',
    id: 'strip-from',
    shape: 'ring',
    size: RING_R,
    width: RING_WIDTH,
    marks: starts.map((pos) => ({ pos })),
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'trace',
    id: 'strip-to',
    shape: 'dot',
    size: DOT_R,
    marks: ends.map((pos) => ({ pos })),
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
