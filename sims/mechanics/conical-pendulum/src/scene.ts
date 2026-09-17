// ========================================================================
// conical-pendulum — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 비스듬히 내려다보는 3 차원 투영은 sim 이 좌표로 계산한다 — 수직축 y, 보는 쪽 +z 인
// 점을 월드 (X, Y) = (x, y·cos E − z·sin E) 로 옮긴다. 수평 원은 그래서 가로 r ·
// 세로 r·sin E 의 타원이 되고, 그것을 닫힌 `trajectory` 표본으로 선언한다. 뒤에서
// 앞으로의 순서는 z 로 정렬해 scene 에 쓴 순서로 둔다 (`drawOrder: 'scene'`).
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Region,
  SceneGraph,
  StageDef,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { bobs, depthOf, readConstants } from './physics';
import { PPM, SCENE_BOUNDS } from './schema';
import type { ConicalPendulumState } from './state';

/** 타원 표본 수. 가장 큰 평면(반지름 1.28 m ≈ 370 px)에서도 모서리가 보이지 않는 만큼. */
const ELLIPSE_SAMPLES = 96;

// ---- 원본이 화면 px 로 박은 치수 — 원본 배율(PPM)로 월드에 옮긴다 ----
/** 축 윗끝. 원본 캔버스 4 px, 매단 점은 115.2 px. */
const AXIS_TOP = (115.2 - 4) / PPM;
/** 손잡이가 붙는 높이. 원본 14 px. */
const HANDLE_Y = (115.2 - 14) / PPM;
/** 손잡이 길이. 원본 16 px. */
const HANDLE_LEN = 16 / PPM;
/** 매단 점 반지름. 원본 3.5 px. */
const PIVOT_R = 3.5 / PPM;
/** 추 반지름 — 원본 `7 + 1.2·(z / 1.2)` px. 앞쪽일수록 약간 크다. */
const BOB_R_BASE = 7;

// ---- 선 굵기(화면 px) — 원본 그대로 ----
const W_ORBIT = 1;
const W_AXIS = 3;
const W_HANDLE = 2;
const W_PLANE = 1.5;
const W_STRING = 1.5;

/**
 * 원본 `--faint`(#d9d5cc) 에 가까운 옅기. `muted` 를 `subtle`(0.45) 로 두고 인스턴스를 한 번 더
 * 흐려 바탕 위 약 0.25 가 되게 한다.
 */
const ORBIT_OPACITY = 0.55;
/** 공통 평면 채움 — 원본 `globalAlpha = 0.08`. */
const PLANE_FILL = 0.08;

function project(x: number, y: number, z: number, elev: number): Vec2 {
  return [x, y * Math.cos(elev) - z * Math.sin(elev)];
}

/** 높이 y 의 수평 원(반지름 r)을 비스듬히 본 타원 표본. 원본 `ctx.ellipse` 처럼 +x 에서 출발한다. */
function ellipse(r: number, y: number, elev: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < ELLIPSE_SAMPLES; i++) {
    const a = (i / ELLIPSE_SAMPLES) * Math.PI * 2;
    pts.push(project(r * Math.cos(a), y, r * Math.sin(a), elev));
  }
  return pts;
}

export function scene(params: {
  state: ConicalPendulumState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const { state, stage } = params;
  const c = readConstants(stage);
  const E = c.elevation;
  const h = depthOf(state.omega, c.g);
  const pivot: Vec2 = [0, 0];
  const center = project(0, -h, 0, E);
  const out: Primitive[] = [];

  const three = bobs(state, c.g);

  // ---- 추가 도는 길 — 연한 타원 셋, 중심 공유 ----
  three.forEach((b, i) => {
    const orbit: Trajectory = {
      type: 'trajectory',
      id: `orbit-${i}`,
      points: ellipse(b.r, -h, E),
      closed: true,
      width: W_ORBIT,
      opacity: ORBIT_OPACITY,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    };
    out.push(orbit);
  });

  // ---- 회전축 · 손잡이 · 매단 점 ----
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [[0, AXIS_TOP], pivot],
    width: W_AXIS,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  // 축과 함께 도는 손잡이 — 축이 돌고 있다는 표시. 세로 성분은 원본처럼 sin E 로 눌린다.
  out.push({
    type: 'trajectory',
    id: 'handle',
    points: [
      [0, HANDLE_Y],
      [HANDLE_LEN * Math.cos(state.phi), HANDLE_Y - HANDLE_LEN * Math.sin(state.phi) * Math.sin(E)],
    ],
    width: W_HANDLE,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const pivotDot: Body = {
    type: 'body',
    id: 'pivot',
    pos: pivot,
    shape: 'circle',
    size: PIVOT_R,
    glow: false,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(pivotDot);

  // ---- 세 추가 도는 높이 — 세 궤도를 모두 품는 평면 ----
  // 강조색은 여기에만 쓴다. 주장("한 높이")을 가리키는 유일한 표시다.
  const planePts = ellipse(c.planeRadius, -h, E);
  const plane: Region = {
    type: 'region',
    id: 'plane',
    points: planePts,
    fillOpacity: PLANE_FILL,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(plane);
  out.push({
    type: 'trajectory',
    id: 'plane-edge',
    points: planePts,
    closed: true,
    width: W_PLANE,
    style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
  });
  // 매단 점에서 평면까지 내린 축의 연장
  out.push({
    type: 'trajectory',
    id: 'depth',
    points: [pivot, center],
    width: W_PLANE,
    style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // ---- 줄 · 추 — 뒤에 있는 것부터 ----
  const order = three
    .map((b, i) => ({ ...b, i }))
    .sort((a, b) => a.z - b.z);

  for (const b of order) {
    out.push({
      type: 'trajectory',
      id: `string-${b.i}`,
      points: [pivot, project(b.x, b.y, b.z, E)],
      width: W_STRING,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  for (const b of order) {
    const bob: Body = {
      type: 'body',
      id: `bob-${b.i}`,
      pos: project(b.x, b.y, b.z, E),
      shape: 'circle',
      size: (BOB_R_BASE + b.z) / PPM,
      glow: false,
      outline: 'none',
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(bob);
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 매 프레임 같은 값이라 빠르기가 바뀌어도 카메라가 흔들리지 않는다.
  return { ...SCENE_BOUNDS };
}
