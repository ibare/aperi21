// ========================================================================
// gyroscopic-precession — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 3 차원 장면을 원본과 같은 고정 시점으로 투영한 좌표(physics.ts `project`)를 월드 좌표로
// 쓴다. 원은 점으로 표본한 폴리라인 · 다각형이다. 겹침은 scene 에 쓴 순서다
// (`drawOrder: 'scene'`) — 원본의 그리기 순서 그대로.
//
// 강조색(accent)은 한 뜻에만 쓴다 — 돌림힘과, 돌림힘이 L 에 더한 몫(쌓인 토막).
// L 은 먹, 무게 · 받침대는 회색, 기준선(수평면 · 그림자)은 옅은 회색.
// ========================================================================

import type {
  Bounds,
  LineSet,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  Trajectory,
  Vec2,
  Vector,
} from '@aperi21/schema';
import { add3, axis, mul3, precessionPeriod, project, side, type Vec3 } from './physics';
import {
  AXLE,
  DEPOSIT,
  DISK_R,
  ELEV,
  L_DRAW,
  ORIGINAL_PX_PER_UNIT,
  POST_H,
  SCENE_BOUNDS,
  TAU,
  WEIGHT_LEN,
  text,
} from './schema';
import type { GyroscopicPrecessionState } from './state';

/** 원본에서 화면 px 로 정한 치수를 투영 평면 단위로. */
const px = (v: number): number => v / ORIGINAL_PX_PER_UNIT;

/** 수평면 점선 원 · 원판 둘레 · 받침 타원의 표본 수 (원본 96 · 64). */
const HORIZON_SAMPLES = 96;
const RIM_SAMPLES = 64;
const BASE_SAMPLES = 48;
/** 받침 타원의 가로 반지름(원본 22 px). */
const BASE_RX_PX = 22;
/** 원본 FAINT(#d6d6d6) 에 맞춘 옅은 기준선 짙기 — `muted subtle` 에 곱한다. */
const FAINT_OPACITY = 0.5;
/** 원본 원판 채움 rgba(160,160,160,0.28) 에 맞춘 불투명도 — `muted` 가 더 짙어 낮춘다. */
const DISK_FILL_OPACITY = 0.2;
/** 토막 화살촉 크기 상한(원본 8 px)과 길이 대비 비율, 날개 폭 비율. */
const TOKEN_HEAD_PX = 8;
const TOKEN_HEAD_RATIO = 0.6;
const TOKEN_WING = 0.45;
/** 토막이 옅어지는 규칙 — 가장 최근 0.9, 한 토막 오래될수록 0.06 씩, 바닥 0.18. */
const TOKEN_ALPHA = { newest: 0.9, perAge: 0.06, floor: 0.18 } as const;
/** 이름표 글자 크기(원본 13 px). */
const LABEL_FONT_PX = 13;

/**
 * 원본 `outward` — 이름표를 장면 중심에서 바깥쪽으로 밀어 원판 · 화살표와 겹치지 않게 한다.
 * 결과는 화면 px 오프셋이다(아래가 +). 세로를 2.2 배로 보고 방향을 정한 뒤 세로 거리는 0.6 배.
 */
function outward(p: Vec2, dist: number): Vec2 {
  const dx = p[0];
  const dy = -p[1] * 2.2;
  const len = Math.hypot(dx, dy) || 1;
  return [(dx / len) * dist, (dy / len) * dist * 0.6];
}

function faintLine(id: string, points: Vec2[], width: number, dashed: boolean): Trajectory {
  return {
    type: 'trajectory',
    id,
    points,
    width,
    opacity: FAINT_OPACITY,
    style: { colorRole: 'muted', emphasis: 'subtle', ...(dashed ? { lineStyle: 'dashed' as const } : {}) },
  };
}

function label(id: string, at: Vec2, offset: Vec2, key: 'label.momentum' | 'label.torque' | 'label.weight', role: 'ink' | 'accent' | 'muted', align: 'left' | 'center'): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    align,
    style: { colorRole: role, emphasis: 'strong' },
  };
}

/** 토막 묶음 — 토막마다 축 한 가닥 + 열린 화살촉 한 가닥, 지금 쌓이는 몫 한 가닥. */
function tokenLines(state: GyroscopicPrecessionState, rL: number, tipNow: Vec2): LineSet {
  const lines: Vec2[][] = [];
  const opacities: number[] = [];
  const tips = state.tips;
  const n = tips.length;
  for (let i = 1; i < n; i++) {
    const a = project(mul3(axis(tips[i - 1]!), rL));
    const b = project(mul3(axis(tips[i]!), rL));
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    if (len < px(0.5)) continue;
    const ux = dx / len;
    const uy = dy / len;
    const h = Math.min(px(TOKEN_HEAD_PX), len * TOKEN_HEAD_RATIO);
    const age = n - 1 - i;
    const alpha = Math.max(TOKEN_ALPHA.floor, TOKEN_ALPHA.newest - age * TOKEN_ALPHA.perAge);
    lines.push([a, b]);
    lines.push([
      [b[0] - ux * h - uy * h * TOKEN_WING, b[1] - uy * h + ux * h * TOKEN_WING],
      b,
      [b[0] - ux * h + uy * h * TOKEN_WING, b[1] - uy * h - ux * h * TOKEN_WING],
    ]);
    opacities.push(alpha, alpha);
  }
  // 지난 토막 끝 → 지금 L 끝: 지금 쌓이는 중인 몫.
  lines.push([project(mul3(axis(tips[n - 1]!), rL)), tipNow]);
  opacities.push(TOKEN_ALPHA.newest);
  return {
    type: 'lineSet',
    id: 'torque-tokens',
    lines,
    opacities,
    width: 2,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
}

export function scene(params: { state: GyroscopicPrecessionState }): SceneGraph {
  const { state } = params;
  const out: Primitive[] = [];
  const L = state.L;
  const rL = L * L_DRAW;
  const u = axis(state.phi);
  const pivot: Vec3 = [0, 0, 0];
  const floorZ = -POST_H;
  const floor: Vec3 = [0, 0, floorZ];

  // ---- L 끝이 도는 수평면 ----
  const horizon: Vec2[] = [];
  for (let i = 0; i <= HORIZON_SAMPLES; i++) {
    const a = (i / HORIZON_SAMPLES) * Math.PI * 2;
    horizon.push(project([rL * Math.cos(a), rL * Math.sin(a), 0]));
  }
  out.push(faintLine('horizon', horizon, 1, true));

  // ---- 바닥 그림자 ----
  out.push(faintLine('shadow', [project(floor), project(add3(floor, mul3(u, AXLE)))], 5, false));

  // ---- 받침대 ----
  out.push({
    type: 'trajectory',
    id: 'post',
    points: [project(floor), project(pivot)],
    width: 3,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  const baseC = project(floor);
  const rx = px(BASE_RX_PX);
  const ry = rx * Math.sin(ELEV);
  const basePts: Vec2[] = [];
  for (let i = 0; i < BASE_SAMPLES; i++) {
    const a = (i / BASE_SAMPLES) * Math.PI * 2;
    basePts.push([baseC[0] + rx * Math.cos(a), baseC[1] + ry * Math.sin(a)]);
  }
  const base: Region = {
    type: 'region',
    id: 'post-base',
    points: basePts,
    fillOpacity: 1,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(base);

  // ---- 돌림힘이 쌓은 토막 ----
  const tip3 = mul3(u, rL);
  const tip = project(tip3);
  out.push(tokenLines(state, rL, tip));

  // ---- 축과 원판 ----
  const c3 = mul3(u, AXLE);
  const c = project(c3);
  out.push({
    type: 'trajectory',
    id: 'axle',
    points: [project(pivot), c],
    width: 3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  const v = side(state.phi);
  const w: Vec3 = [0, 0, 1];
  const rim = (th: number): Vec2 =>
    project(add3(c3, add3(mul3(v, DISK_R * Math.cos(th)), mul3(w, DISK_R * Math.sin(th)))));
  const rimPts: Vec2[] = [];
  for (let i = 0; i <= RIM_SAMPLES; i++) rimPts.push(rim((i / RIM_SAMPLES) * Math.PI * 2));
  out.push({
    type: 'region',
    id: 'disk-fill',
    points: rimPts,
    fillOpacity: DISK_FILL_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'disk-rim',
    points: rimPts,
    closed: true,
    width: 1.5,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  // 원판이 제 축으로 도는 것을 보이는 바큇살 셋.
  const spokes: Vec2[][] = [0, 1, 2].map((k) => [c, rim(state.psi + (k * 2 * Math.PI) / 3)]);
  out.push({
    type: 'lineSet',
    id: 'spokes',
    lines: spokes,
    width: 1.5,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  out.push({
    type: 'body',
    id: 'pivot',
    pos: project(pivot),
    shape: 'point',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 무게 ----
  const weightEnd = project(add3(c3, [0, 0, -WEIGHT_LEN]));
  const weight: Vector = {
    type: 'vector',
    id: 'weight',
    from: c,
    delta: [weightEnd[0] - c[0], weightEnd[1] - c[1]],
    width: 2,
    headSize: px(8),
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(weight);
  out.push(label('weight-label', weightEnd, [8, 4], 'label.weight', 'muted', 'left'));

  // ---- 각운동량 L ----
  const pivot2 = project(pivot);
  out.push({
    type: 'vector',
    id: 'momentum',
    from: pivot2,
    delta: [tip[0] - pivot2[0], tip[1] - pivot2[1]],
    width: 3,
    headSize: px(12),
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  const lOff = outward(tip, 14);
  out.push(label('momentum-label', tip, [lOff[0], lOff[1] - 8], 'label.momentum', 'ink', 'center'));

  // ---- 돌림힘 ----
  // 길이 τ·1초 × L_DRAW — 쌓인 토막과 같은 배율이다.
  const torqueEnd = project(add3(tip3, mul3(side(state.phi), DEPOSIT * TAU * L_DRAW)));
  out.push({
    type: 'vector',
    id: 'torque',
    from: tip,
    delta: [torqueEnd[0] - tip[0], torqueEnd[1] - tip[1]],
    width: 3,
    headSize: px(11),
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push(label('torque-label', torqueEnd, outward(torqueEnd, 26), 'label.torque', 'accent', 'center'));

  // ---- 조절기 옆 한 바퀴 시간 ----
  // 계산식(2π|L|/τ)과 화면의 세차 속도가 같은 값에서 나온다. 캡션이 아니라 조절기의 출력이다.
  out.push({
    type: 'readout',
    id: 'period',
    anchor: { screen: 'bottom-right', offset: [-8, -14] },
    text: text('label.period'),
    vars: { T: precessionPeriod(L).toFixed(1) },
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    align: 'right',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 프레이밍이 흔들리면 축의 회전과 시점의 회전이 섞인다. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
