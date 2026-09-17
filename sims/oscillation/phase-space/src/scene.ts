// ========================================================================
// phase-space — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 에너지 고리 · 넘어감 경계 · 잔상 · 추적 궤적 · 진자
// 원과 막대는 `trajectory`, 무리의 점은 `particleSystem`, 추적 점 · 추 · 받침은
// `body`, 축 이름은 `readout` 이다. 어휘가 모자라 근사한 자리는 NOTES 「어휘 부족」.
// ========================================================================

import type {
  Body,
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
  AXIS_LABELS,
  CLOSED_LOOP_FRACTIONS,
  CLOUD_COUNT,
  OPEN_CURVE_FRACTIONS,
  PENDULUM,
  SCENE_BOUNDS,
  TRACKED_DOT_RADIUS,
  TRAIL_TICKS,
  W0SQ,
  planePos,
  text,
} from './schema';
import type { PhaseSpaceState, PhaseState } from './state';

/** 옅은 고리 · 진자 원의 굵기(화면 px). */
const FAINT_WIDTH_PX = 1;
/** 넘어감 경계 점선 굵기(화면 px). */
const SEPARATRIX_WIDTH_PX = 1.2;
/** 무리 잔상 굵기와 짙기. */
const CLOUD_TRAIL_WIDTH_PX = 1.2;
const CLOUD_TRAIL_ALPHA = 0.35;
/** 무리 점 반지름(화면 px)과 짙기. */
const CLOUD_DOT_PX = 1.7;
const CLOUD_DOT_ALPHA = 0.8;
/** 추적 궤적 굵기와 짙기. */
const TRACKED_PATH_WIDTH_PX = 1.8;
const TRACKED_PATH_ALPHA = 0.85;
/** 진자 막대 굵기(화면 px). */
const ROD_WIDTH_PX = 2;
/** 축 이름 글자 크기(화면 px). */
const AXIS_FONT_PX = 12;
/** 고리 표본 수. 원본과 같다. */
const OPEN_SAMPLES = 240;
const CLOSED_SAMPLES = 160;
/** 진자 원 표본 수. */
const CIRCLE_SAMPLES = 96;

// ------------------------------------------------------------------------
// 에너지 고리 — 마찰이 없을 때 상태가 머무는 선 (배치 계산)
// ------------------------------------------------------------------------

/** E = ω²/2 − ω0² cosθ 의 한쪽 가지. 제곱근이 없는 곳에서 끊는다. */
function energyBranch(E: number, sign: 1 | -1): Vec2[][] {
  const segs: Vec2[][] = [];
  let seg: Vec2[] = [];
  for (let k = 0; k <= OPEN_SAMPLES; k++) {
    const a = -Math.PI + (2 * Math.PI * k) / OPEN_SAMPLES;
    const v = 2 * (E + W0SQ * Math.cos(a));
    if (v < 0) {
      if (seg.length > 1) segs.push(seg);
      seg = [];
      continue;
    }
    seg.push(planePos(a, sign * Math.sqrt(v)));
  }
  if (seg.length > 1) segs.push(seg);
  return segs;
}

/** −ω0² < E < ω0² : 가운데를 둘러싸는 닫힌 고리. */
function closedLoop(E: number): Vec2[] {
  const aMax = Math.acos(-E / W0SQ);
  const pts: Vec2[] = [];
  const omAt = (a: number): number => Math.sqrt(Math.max(0, 2 * (E + W0SQ * Math.cos(a))));
  for (let k = 0; k <= CLOSED_SAMPLES; k++) {
    const a = -aMax + (2 * aMax * k) / CLOSED_SAMPLES;
    pts.push(planePos(a, omAt(a)));
  }
  for (let k = CLOSED_SAMPLES; k >= 0; k--) {
    const a = -aMax + (2 * aMax * k) / CLOSED_SAMPLES;
    pts.push(planePos(a, -omAt(a)));
  }
  return pts;
}

/** 정적 선은 한 번만 계산한다. */
const CONTOURS: readonly Trajectory[] = (() => {
  const out: Trajectory[] = [];
  CLOSED_LOOP_FRACTIONS.forEach((f, i) => {
    out.push({
      type: 'trajectory',
      id: `loop-${i}`,
      points: closedLoop(f * W0SQ),
      closed: true,
      width: FAINT_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    });
  });
  OPEN_CURVE_FRACTIONS.forEach((f, i) => {
    for (const sign of [1, -1] as const) {
      energyBranch(f * W0SQ, sign).forEach((seg, j) => {
        out.push({
          type: 'trajectory',
          id: `wave-${i}-${sign > 0 ? 'up' : 'down'}-${j}`,
          points: seg,
          width: FAINT_WIDTH_PX,
          style: { colorRole: 'muted', emphasis: 'subtle' },
        });
      });
    }
  });
  // 넘어감 경계 — 꼭대기까지 겨우 올라가는 에너지. 안쪽은 흔들림, 바깥은 넘어감.
  for (const sign of [1, -1] as const) {
    energyBranch(W0SQ, sign).forEach((seg, j) => {
      out.push({
        type: 'trajectory',
        id: `separatrix-${sign > 0 ? 'up' : 'down'}-${j}`,
        points: seg,
        width: SEPARATRIX_WIDTH_PX,
        style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
      });
    });
  }
  return out;
})();

const PENDULUM_CIRCLE: Vec2[] = Array.from({ length: CIRCLE_SAMPLES }, (_, k) => {
  const a = (2 * Math.PI * k) / CIRCLE_SAMPLES;
  return [
    PENDULUM.pivot[0] + PENDULUM.length * Math.cos(a),
    PENDULUM.pivot[1] + PENDULUM.length * Math.sin(a),
  ] as Vec2;
});

// ------------------------------------------------------------------------
// 감기는 축에서 선 끊기
// ------------------------------------------------------------------------

/** (각도, 각속도) 열을 평면 좌표 조각들로 나눈다. 가장자리를 건너는 곳은 끊는다. */
function splitAtWrap(seq: readonly PhaseState[]): Vec2[][] {
  const out: Vec2[][] = [];
  let cur: Vec2[] = [];
  let prevTh: number | null = null;
  for (const p of seq) {
    if (prevTh !== null && Math.abs(p.th - prevTh) > Math.PI) {
      if (cur.length > 1) out.push(cur);
      cur = [];
    }
    cur.push(planePos(p.th, p.om));
    prevTh = p.th;
  }
  if (cur.length > 1) out.push(cur);
  return out;
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: PhaseSpaceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('phase-space: schema.timeline 이 선언되어야 한다');

  // 흩뿌린 직후 나타나고 다시 흩뿌리기 전에 흐려진다. 무리 · 추적 · 추가 함께.
  const alpha = Math.min(timeline.at('appear'), 1 - timeline.at('vanish'));
  const out: Primitive[] = [];

  // ---- 에너지 고리 · 넘어감 경계 ----
  out.push(...CONTOURS);

  // ---- 평면 축 이름 ----
  const axis = (id: string, pos: Vec2, key: Parameters<typeof text>[0], align: Readout['align']): Readout => ({
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    chip: false,
    font: 'text',
    align,
    fontSize: AXIS_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push(axis('axis-angle', AXIS_LABELS.angle, 'axis.angle', 'right'));
  out.push(axis('axis-inverted', AXIS_LABELS.inverted, 'axis.inverted', 'center'));
  out.push(axis('axis-bottom', [planePos(0, 0)[0], AXIS_LABELS.angle[1]], 'axis.bottom', 'center'));
  out.push(axis('axis-omega', AXIS_LABELS.angularVelocity, 'axis.angularVelocity', 'right'));

  if (alpha > 0) {
    // ---- 상태점 무리: 짧은 잔상 ----
    // 걸음마다 쌓인 고리 버퍼를 오래된 것부터 잇는다. 잔상은 머리 쪽이 짙다.
    const { histTh, histOm, histHead, histCount } = state;
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const seq: PhaseState[] = [];
      for (let k = histCount - 1; k >= 0; k--) {
        const idx = (((histHead - 1 - k) % TRAIL_TICKS) + TRAIL_TICKS) % TRAIL_TICKS;
        seq.push({ th: histTh[idx * CLOUD_COUNT + i]!, om: histOm[idx * CLOUD_COUNT + i]! });
      }
      splitAtWrap(seq).forEach((points, j) => {
        out.push({
          type: 'trajectory',
          id: `trail-${i}-${j}`,
          points,
          width: CLOUD_TRAIL_WIDTH_PX,
          opacity: CLOUD_TRAIL_ALPHA * alpha,
          style: { colorRole: 'ink', emphasis: 'strong', fade: 'tail' },
        });
      });
    }

    // ---- 상태점 무리: 점 ----
    const positions: Vec2[] = [];
    for (let i = 0; i < CLOUD_COUNT; i++) positions.push(planePos(state.th[i]!, state.om[i]!));
    const cloud: ParticleSystem = {
      type: 'particleSystem',
      id: 'cloud',
      positions,
      sizes: CLOUD_DOT_PX,
      opacity: CLOUD_DOT_ALPHA * alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(cloud);

    // ---- 추적 상태의 궤적 ----
    // 강조색은 「추적하는 한 진자」 한 뜻에만 쓴다 — 궤적, 위상 점, 진자 추.
    splitAtWrap(state.path).forEach((points, j) => {
      out.push({
        type: 'trajectory',
        id: `tracked-path-${j}`,
        points,
        width: TRACKED_PATH_WIDTH_PX,
        opacity: TRACKED_PATH_ALPHA * alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    });

    // ---- 추적 상태점 ----
    const dot: Body = {
      type: 'body',
      id: 'tracked-dot',
      pos: planePos(state.tracked.th, state.tracked.om),
      shape: 'circle',
      size: TRACKED_DOT_RADIUS,
      outline: 'background',
      glow: false,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(dot);
  }

  // ---- 진자 ----
  // 위상 평면의 점이 실제로 무엇인지 잇는 다리. 추적 상태 하나만 실물로 그린다.
  out.push({
    type: 'trajectory',
    id: 'pendulum-circle',
    points: PENDULUM_CIRCLE,
    closed: true,
    width: FAINT_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });
  out.push({
    type: 'body',
    id: 'pendulum-mount',
    pos: PENDULUM.pivot,
    shape: 'rect',
    size: PENDULUM.mount,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  if (alpha > 0) {
    // 원본은 각도 0 을 바닥으로 잰다 — 화면 아래가 θ=0, 오른쪽이 +θ.
    const th = state.tracked.th;
    const bob: Vec2 = [
      PENDULUM.pivot[0] + PENDULUM.length * Math.sin(th),
      PENDULUM.pivot[1] - PENDULUM.length * Math.cos(th),
    ];
    out.push({
      type: 'trajectory',
      id: 'pendulum-rod',
      points: [PENDULUM.pivot, bob],
      width: ROD_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: 'pendulum-bob',
      pos: bob,
      shape: 'circle',
      size: PENDULUM.bobRadius,
      outline: 'none',
      glow: false,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): Bounds {
  // 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다.
  return { ...SCENE_BOUNDS };
}
