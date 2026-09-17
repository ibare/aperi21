// ========================================================================
// moment-of-inertia — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 바퀴 테(trajectory closed) · 살(lineSet) · 축(body) · 알갱이(particleSystem) ·
// 잔상 원호(굵기 단계마다 lineSet, 선별 opacities) · 돌림힘(trajectory 원호 + region 머리) ·
// 자리 표시와 그래프 글자(readout) · 그래프 축과 눈금(lineSet) · 돈 각 곡선(trajectory) +
// 머리 점(body). 캡션은 선언의 캡션 슬롯이 그린다.
//
// 배치는 원본 캔버스 px 를 그대로 가져와 `px()` 한 곳에서 월드로 옮긴다.
// ========================================================================

import type {
  Body,
  ColorRole,
  EnvironmentDef,
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';

import {
  THETA_MAX,
  angleAt,
  baseAngles,
  manualMoment,
  rText,
  wheelAngles,
  type TrialMoment,
} from './physics';
import {
  CANVAS_PX,
  GRAPH,
  LEFT_C,
  N_MASSES,
  RIGHT_C,
  RPX,
  RUN,
  R_LEFT,
  SCENE_BOUNDS,
  TRAIL_SECONDS,
  TRIALS,
  text,
  type TrialId,
} from './schema';
import type { MomentOfInertiaState } from './state';

// ---- 원본 그리기 치수 (px) ------------------------------------------------

/** 테 굵기 · 살 굵기. */
const RIM_PX = 2;
const SPOKE_PX = 1.5;
/** 축 원 반지름. */
const AXLE_PX = 5;
/** 알갱이 반지름. */
const MASS_PX = 4.5;
/** 잔상 — 원호를 10 토막으로 나눠 뒤로 갈수록 옅고 가늘게. */
const TRAIL_STEPS = 10;
const TRAIL_ALPHA = 0.35;
const TRAIL_WIDTH_PX = 6;
const TRAIL_THIN = 0.7;
/**
 * 잔상 굵기 단계 수. `lineSet` 은 인스턴스 하나에 굵기 하나라(장부 G74) 토막 두 개씩 묶어
 * 다섯 단계로 나눈다. 투명도는 토막마다 `opacities` 로 그대로 준다.
 */
const TRAIL_BANDS = 5;
/** 한 토막 원호의 점 수. */
const ARC_POINTS = 4;
/** 돌림힘 화살표. */
const TORQUE = { rr: 16, a0: -Math.PI * 0.85, a1: Math.PI * 0.35, width: 2, tip: 7, half: 4.5 } as const;
/** 자리 표시 — 바퀴 테 아래로 떨어진 거리. */
const LABEL_BELOW_PX = 30;
/** 원본 fillText 는 글자 기준선이 좌표에 온다. readout 은 가운데라 그만큼 올린다 (장부 G16). */
const BASELINE_SHIFT_PX = -4;
/** 그래프. */
const AXIS_PX = 1.5;
const LEFT_CURVE_PX = 6;
const RIGHT_CURVE_PX = 2.5;
const HEAD_PX = 4.5;
const CURVE_STEPS = 90;

// ---- 좌표 ---------------------------------------------------------------

/** 원본 캔버스 px → 월드. 캔버스 가운데가 원점, 1R = RPX px = 월드 1, y 는 위. */
function px(x: number, y: number): Vec2 {
  return [(x - CANVAS_PX.w / 2) / RPX, (CANVAS_PX.h / 2 - y) / RPX];
}

/** 바퀴 중심 c 에서 화면 시계방향 각 a, 반지름 r(R 단위)인 자리. */
function onWheel(c: { x: number; y: number }, r: number, a: number): Vec2 {
  return px(c.x + Math.cos(a) * r * RPX, c.y + Math.sin(a) * r * RPX);
}

const TWO_PI = Math.PI * 2;

// ---- 한 바퀴 ------------------------------------------------------------

function wheel(
  out: Primitive[],
  side: 'left' | 'right',
  c: { x: number; y: number },
  r: number,
  theta: number,
  role: ColorRole,
  m: TrialMoment,
  rTrial: number,
): void {
  // 틀 — 두 바퀴 같은 옅은 선. 살이 회전각을 보여 준다.
  const rim: Trajectory = {
    type: 'trajectory',
    id: `${side}-rim`,
    points: Array.from({ length: 96 }, (_, i) => onWheel(c, 1, (i / 96) * TWO_PI)),
    closed: true,
    width: RIM_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(rim);
  const spokes: LineSet = {
    type: 'lineSet',
    id: `${side}-spokes`,
    lines: [0, 1, 2].map((i) => {
      const a = theta + (i * TWO_PI) / 3;
      return [onWheel(c, 0, a), onWheel(c, 1, a)];
    }),
    width: SPOKE_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(spokes);
  const axle: Body = {
    type: 'body',
    id: `${side}-axle`,
    pos: px(c.x, c.y),
    shape: 'circle',
    size: AXLE_PX / RPX,
    outline: 'none',
    glow: false,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(axle);

  // 잔상 — 지난 0.3초 동안 각 알갱이가 지나간 원호. 길이가 곧 알갱이가 움직인 거리.
  const back = m.moving ? 0 : angleAt(rTrial, m.s) - angleAt(rTrial, m.s - TRAIL_SECONDS);
  if (back > 1e-4) {
    const per = TRAIL_STEPS / TRAIL_BANDS;
    for (let b = 0; b < TRAIL_BANDS; b++) {
      const lines: Vec2[][] = [];
      const opacities: number[] = [];
      for (let j = b * per; j < (b + 1) * per; j++) {
        const f0 = j / TRAIL_STEPS;
        const f1 = (j + 1) / TRAIL_STEPS;
        for (let i = 0; i < N_MASSES; i++) {
          const a1 = theta + (i * TWO_PI) / N_MASSES;
          lines.push(
            Array.from({ length: ARC_POINTS }, (_, q) => {
              const f = f1 + ((f0 - f1) * q) / (ARC_POINTS - 1);
              return onWheel(c, r, a1 - back * f);
            }),
          );
          opacities.push(TRAIL_ALPHA * (1 - f0));
        }
      }
      const fMid = (b * per + (per - 1) / 2) / TRAIL_STEPS;
      const band: LineSet = {
        type: 'lineSet',
        id: `${side}-trail-${b}`,
        lines,
        opacities,
        width: TRAIL_WIDTH_PX * (1 - fMid * TRAIL_THIN),
        style: { colorRole: role, emphasis: 'strong' },
      };
      out.push(band);
    }
  }

  // 알갱이 — 같은 질량 12개.
  const masses: ParticleSystem = {
    type: 'particleSystem',
    id: `${side}-masses`,
    positions: Array.from({ length: N_MASSES }, (_, i) => onWheel(c, r, theta + (i * TWO_PI) / N_MASSES)),
    sizes: MASS_PX,
    style: { colorRole: role, emphasis: 'strong' },
  };
  out.push(masses);
}

/** 두 바퀴에 거는 같은 돌림힘 — 축 둘레의 굽은 화살표. 회전하지 않는다. */
function torque(out: Primitive[], side: 'left' | 'right', c: { x: number; y: number }): void {
  const { rr, a0, a1 } = TORQUE;
  const arc: Trajectory = {
    type: 'trajectory',
    id: `${side}-torque-arc`,
    points: Array.from({ length: 25 }, (_, i) => {
      const a = a0 + ((a1 - a0) * i) / 24;
      return px(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr);
    }),
    width: TORQUE.width,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(arc);
  const hx = c.x + Math.cos(a1) * rr;
  const hy = c.y + Math.sin(a1) * rr;
  const tx = -Math.sin(a1);
  const ty = Math.cos(a1);
  const head: Region = {
    type: 'region',
    id: `${side}-torque-head`,
    points: [
      px(hx + tx * TORQUE.tip, hy + ty * TORQUE.tip),
      px(hx - ty * TORQUE.half, hy + tx * TORQUE.half),
      px(hx + ty * TORQUE.half, hy - tx * TORQUE.half),
    ],
    fillOpacity: 1,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(head);
}

function massLabel(out: Primitive[], side: 'left' | 'right', c: { x: number; y: number }, r: number): void {
  const label: Readout = {
    type: 'readout',
    id: `${side}-label`,
    anchor: { world: px(c.x, c.y + RPX + LABEL_BELOW_PX), offset: [0, BASELINE_SHIFT_PX] },
    text: text('label.masses'),
    vars: { n: N_MASSES, r: rText(r) },
    chip: false,
    font: 'text',
    fontSize: 13,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(label);
}

// ---- 그래프 -------------------------------------------------------------

const gx = (s: number): number => GRAPH.x0 + (s / RUN) * (GRAPH.x1 - GRAPH.x0);
const gy = (th: number): number => GRAPH.y0 - (th / THETA_MAX) * (GRAPH.y0 - GRAPH.y1);

function graphAxes(out: Primitive[]): void {
  // 격자 · 숫자 눈금 · 시간 값은 두지 않는다 — 기준선 두 개와 1·2·3바퀴 눈금만 (원본 NOTES (c)).
  const ticks = [1, 2, 3].map((n) => gy(n * TWO_PI));
  const axes: LineSet = {
    type: 'lineSet',
    id: 'graph-axes',
    lines: [
      [px(GRAPH.x0, GRAPH.y1 - 6), px(GRAPH.x0, GRAPH.y0), px(GRAPH.x1 + 8, GRAPH.y0)],
      ...ticks.map((y) => [px(GRAPH.x0 - 4, y), px(GRAPH.x0, y)]),
    ],
    width: AXIS_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(axes);
  ticks.forEach((y, i) => {
    const tick: Readout = {
      type: 'readout',
      id: `graph-turns-${i + 1}`,
      anchor: { world: px(GRAPH.x0 - 8, y) },
      text: text('label.turns'),
      vars: { n: i + 1 },
      chip: false,
      font: 'text',
      fontSize: 12,
      align: 'right',
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    out.push(tick);
  });
  const common = { chip: false, font: 'text', fontSize: 12, style: { colorRole: 'muted', emphasis: 'strong' } } as const;
  out.push({
    type: 'readout',
    id: 'graph-angle',
    anchor: { world: px(GRAPH.x0 + 6, GRAPH.y1 - 2), offset: [0, BASELINE_SHIFT_PX] },
    text: text('label.angle'),
    align: 'left',
    ...common,
  });
  out.push({
    type: 'readout',
    id: 'graph-time',
    anchor: { world: px(GRAPH.x1 + 8, GRAPH.y0 + 20), offset: [0, BASELINE_SHIFT_PX] },
    text: text('label.time'),
    align: 'right',
    ...common,
  });
}

function curve(out: Primitive[], side: 'left' | 'right', r: number, sEnd: number, role: ColorRole, width: number): void {
  const line: Trajectory = {
    type: 'trajectory',
    id: `${side}-curve`,
    points: Array.from({ length: CURVE_STEPS + 1 }, (_, i) => {
      const s = (sEnd * i) / CURVE_STEPS;
      return px(gx(s), gy(angleAt(r, s)));
    }),
    width,
    style: { colorRole: role, emphasis: 'strong' },
  };
  out.push(line);
  const head: Body = {
    type: 'body',
    id: `${side}-curve-head`,
    pos: px(gx(sEnd), gy(angleAt(r, sEnd))),
    shape: 'circle',
    size: HEAD_PX / RPX,
    outline: 'none',
    glow: false,
    style: { colorRole: role, emphasis: 'strong' },
  };
  out.push(head);
}

// ---- 지금 순간 ----------------------------------------------------------

/** 시간표 프레임에서 자동 진행의 순간을 읽는다. 단계 경계는 선언이 정한다. */
function autoMoment(tl: TimelineFrame): TrialMoment {
  const [kind, trialId] = tl.phase.split('-') as ['run' | 'hold' | 'move', TrialId];
  const index = TRIALS.findIndex((tr) => tr.id === trialId);
  if (index < 0) throw new Error(`moment-of-inertia: 모르는 단계 ${tl.phase}`);
  const rTrial = TRIALS[index]!.r;
  const rNext = TRIALS[(index + 1) % TRIALS.length]!.r;
  return {
    s: tl.u - tl.start(`run-${trialId}`),
    rTrial,
    rDisp: rTrial + (rNext - rTrial) * tl.at(`move-${trialId}`),
    moving: kind === 'move',
    ...baseAngles(tl.cycle, index),
  };
}

export function scene(params: {
  state: MomentOfInertiaState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline: tl } = params;
  if (!tl) throw new Error('moment-of-inertia: schema.timeline 이 선언되어야 한다');

  // 독자가 만진 뒤로는 그 반지름으로 돌림 + 멈춤을 반복한다. 러너의 `restart` 가 조각 시계를
  // 0 으로 되돌렸으므로 `tl.t` 가 곧 수동 시행 시작 뒤 시각이다.
  const m = state.manual
    ? manualMoment(state, tl.t, tl.duration('run-far') + tl.duration('hold-far'))
    : autoMoment(tl);
  const { thL, thR } = wheelAngles(m);
  const out: Primitive[] = [];

  // 강조색 하나 = 「자리를 바꾸는 질량」. 왼쪽(기준)은 먹색, 틀과 돌림힘은 두 바퀴 같은 회색.
  wheel(out, 'left', LEFT_C, R_LEFT, thL, 'ink', m, R_LEFT);
  wheel(out, 'right', RIGHT_C, m.rDisp, thR, 'accent', m, m.rTrial);
  torque(out, 'left', LEFT_C);
  torque(out, 'right', RIGHT_C);
  massLabel(out, 'left', LEFT_C, R_LEFT);
  massLabel(out, 'right', RIGHT_C, m.rDisp);

  graphAxes(out);
  // 질량을 옮기는 동안은 곡선을 지우고 다음 시행을 기다린다.
  if (!m.moving) {
    const sEnd = Math.min(m.s, RUN);
    // 왼쪽을 굵게 먼저 깔고 오른쪽을 가늘게 위에 — 같은 거리에서 겹쳐도 두 선이 다 보인다.
    curve(out, 'left', R_LEFT, sEnd, 'ink', LEFT_CURVE_PX);
    curve(out, 'right', m.rTrial, sEnd, 'accent', RIGHT_CURVE_PX);
  }

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
