// ========================================================================
// shock-wave — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 강조색은 「음원」 한 뜻에만 쓴다 — 몸체 · 속도 화살표. 파면 · 원뿔 선 · 삼각형은
// 모두 먹색이다. 원뿔은 색으로 칠해 세우지 않는다 — 파면이 스스로 모여 선을 이루는
// 것이 주장이고, 멈춰 세운 장면에서만 그 선을 점선으로 덧긋는다.
//
// 파면은 `trace` ring 이 아니라 `trajectory` 닫힌 원으로 긋는다. ring 의 반지름은
// 화면 px 라 배율이 바뀌면 파면 반지름과 음원이 간 거리의 비가 깨지는데, 원뿔의
// 벌어짐이 바로 그 비다 (이웃 `doppler-effect` NOTES 「어휘 부족」 1).
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  Sector,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { derive, readConstants } from './physics';
import {
  ARROW_RISE,
  ARROW_UNIT,
  AXIS_Y,
  CIRCLE_SEGMENTS,
  CONE_WIDTH_PX,
  FRONT_HOLD_DIM,
  FRONT_OPACITY,
  FRONT_WIDTH_PX,
  LABEL_GAP_PX,
  LABEL_PX,
  MARK_WIDTH_PX,
  PANEL_FILL_OPACITY,
  PANEL_MAX,
  PANEL_MIN,
  RIGHT_MARK,
  SCENE_BOUNDS,
  SOURCE_PATH,
  SYMBOL_PX,
  THETA_FILL_OPACITY,
  THETA_LABEL_R,
  THETA_RADIUS,
  THETA_RIM_PX,
  TRIANGLE_WIDTH_PX,
  text,
} from './schema';
import type { ShockWaveState } from './state';

/** 축 위 한 점을 중심으로 한 원의 표본. */
function circle(cx: number, cy: number, r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < CIRCLE_SEGMENTS; i++) {
    const a = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

export function scene(params: {
  state: ShockWaveState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('shock-wave: schema.timeline 이 선언되어야 한다');

  const c = readConstants(stage);
  const r = derive(timeline, c);
  const alpha = r.opacity;
  const clip = { min: PANEL_MIN as Vec2, max: PANEL_MAX as Vec2 };
  const out: Primitive[] = [];

  // ---- 판 바탕 ---- 파면이 어디까지 그려지는지만 가른다. 아래 띠는 캡션 자리다.
  const panel: Region = {
    type: 'region',
    id: 'panel',
    points: [
      [PANEL_MIN[0], PANEL_MIN[1]],
      [PANEL_MAX[0], PANEL_MIN[1]],
      [PANEL_MAX[0], PANEL_MAX[1]],
      [PANEL_MIN[0], PANEL_MAX[1]],
    ],
    fillOpacity: PANEL_FILL_OPACITY,
    opacity: alpha,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(panel);

  // ---- 파면 ---- 나온 자리를 중심으로 소리 빠르기로 퍼지는 원.
  const dim = r.construction ? FRONT_HOLD_DIM : 1;
  r.fronts.forEach((f, i) => {
    if (f.r <= 0 || f.opacity <= 0) return;
    const front: Trajectory = {
      type: 'trajectory',
      id: `front-${i}`,
      points: circle(f.cx, AXIS_Y, f.r),
      closed: true,
      width: FRONT_WIDTH_PX,
      opacity: FRONT_OPACITY * f.opacity * dim * alpha,
      clip,
      style: { colorRole: 'ink', emphasis: 'medium' },
    };
    out.push(front);
  });

  // ---- 작도 ---- 멈춰 세운 장면에서만: 원뿔 선 · 직각삼각형 · θ.
  const k = r.construction;
  if (k) {
    const S: Vec2 = [k.sx, AXIS_Y];
    const P: Vec2 = [k.px, AXIS_Y];
    const Q: Vec2 = [k.q[0], AXIS_Y + k.q[1]];
    const back: Vec2 = [-Math.cos(k.theta), Math.sin(k.theta)];

    // 원뿔 선 둘 — 위 · 아래. 파면이 스스로 모인 자리를 덧긋는다.
    for (const side of [1, -1] as const) {
      const cone: Trajectory = {
        type: 'trajectory',
        id: side > 0 ? 'cone-upper' : 'cone-lower',
        points: [S, [S[0] + back[0] * k.coneLength, AXIS_Y + side * back[1] * k.coneLength]],
        width: CONE_WIDTH_PX,
        opacity: alpha,
        clip,
        style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
      };
      out.push(cone);
    }

    // 삼각형 — P→Q(파면이 퍼진 거리) · P→S(음원이 간 거리).
    const radius: Trajectory = {
      type: 'trajectory',
      id: 'tri-vt',
      points: [P, Q],
      width: TRIANGLE_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    const travel: Trajectory = {
      type: 'trajectory',
      id: 'tri-ut',
      points: [P, S],
      width: TRIANGLE_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    const centre: Body = {
      type: 'body',
      id: 'tri-p',
      pos: P,
      shape: 'point',
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(radius, travel, centre);

    // 직각 표시 — Q 에서 P 쪽 · S 쪽으로 한 변씩.
    const toP = unit([P[0] - Q[0], P[1] - Q[1]]);
    const toS = unit([S[0] - Q[0], S[1] - Q[1]]);
    const a: Vec2 = [Q[0] + toP[0] * RIGHT_MARK, Q[1] + toP[1] * RIGHT_MARK];
    const b: Vec2 = [a[0] + toS[0] * RIGHT_MARK, a[1] + toS[1] * RIGHT_MARK];
    const e: Vec2 = [Q[0] + toS[0] * RIGHT_MARK, Q[1] + toS[1] * RIGHT_MARK];
    const mark: Trajectory = {
      type: 'trajectory',
      id: 'tri-right',
      points: [a, b, e],
      width: MARK_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(mark);

    // θ — 꼭짓점에서 축(뒤쪽)과 원뿔 선 사이.
    const theta: Sector = {
      type: 'sector',
      id: 'theta',
      center: S,
      radius: THETA_RADIUS,
      from: Math.PI - k.theta,
      to: Math.PI,
      fillOpacity: THETA_FILL_OPACITY,
      rimWidth: THETA_RIM_PX,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'medium' },
    };
    const mid = Math.PI - k.theta / 2;
    out.push(theta, symbol('theta-label', [S[0] + Math.cos(mid) * THETA_LABEL_R, S[1] + Math.sin(mid) * THETA_LABEL_R], 'label.theta', alpha));

    // 변 이름 — 변의 가운데에 칩으로.
    out.push(
      symbol('vt-label', [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], 'label.vt', alpha),
      symbol('ut-label', [(P[0] + S[0]) / 2, AXIS_Y], 'label.ut', alpha),
    );
  }

  // ---- 음원 ---- 강조색. 코끝이 원뿔의 꼭짓점이다.
  const source: Body = {
    type: 'body',
    id: 'source',
    pos: [r.sourceX, AXIS_Y],
    shape: 'custom',
    customPath: SOURCE_PATH,
    opacity: alpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(source);

  // ---- 속도 화살표 ---- 길이는 u/v 에 비례. 칩은 빠르기가 선언값일 때만 — 오르는 동안의
  // 중간값은 계산값이라 띄우지 않는다 (S-piece 유효숫자).
  if (!r.frozen) {
    const len = ARROW_UNIT * r.speedRatio;
    const tail: Vec2 = [r.sourceX - len, AXIS_Y + ARROW_RISE];
    const arrow: Vector = {
      type: 'vector',
      id: 'velocity',
      from: tail,
      delta: [len, 0],
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(arrow);
    if (r.regime !== 'accel') {
      const speed: Readout = {
        type: 'readout',
        id: 'speed',
        anchor: { world: [r.sourceX - len / 2, AXIS_Y + ARROW_RISE], offset: [0, -LABEL_GAP_PX] },
        text: text(r.regime === 'sonic' ? 'label.speedSonic' : 'label.speed'),
        vars: r.regime === 'sonic' ? { v: String(c.soundSpeed) } : { u: String(c.sourceSpeed) },
        fontSize: LABEL_PX,
        opacity: alpha,
        style: { colorRole: 'muted', emphasis: 'strong' },
      };
      out.push(speed);
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

function unit(v: Vec2): Vec2 {
  const n = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / n, v[1] / n];
}

/** 기울인 기호 칩 하나(vt · ut · θ). */
function symbol(id: string, at: Vec2, key: 'label.vt' | 'label.ut' | 'label.theta', alpha: number): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: text(key),
    font: 'text',
    italic: true,
    fontSize: SYMBOL_PX,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

/** 고정 경계. 상태를 보지 않으므로 매 프레임 같은 값이다 (원칙 6 · S-piece). */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
