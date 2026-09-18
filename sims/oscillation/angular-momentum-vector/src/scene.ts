// ========================================================================
// angular-momentum-vector — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 3 차원 장면을 고정 시점으로 투영한 좌표(physics.ts `project`)를 월드 좌표로 쓴다.
// 원은 점으로 표본한 폴리라인 · 다각형이다. 겹침은 scene 에 쓴 순서다
// (`drawOrder: 'scene'`) — 시선에서 먼 것부터:
//
//   뒤쪽 원호 · 뒤쪽 축 · 뒤쪽 굴대 · (먼 쪽을 향하면) L
//   → 바퀴 면 · 둘레 · 바큇살 · 표지 점
//   → 앞쪽 축 · 앞쪽 굴대 · (앞쪽을 향하면) L → 앞쪽 원호 · 화살촉
//
// 강조색(accent)은 한 뜻에만 쓴다 — 각운동량 L. 도는 방향 화살표(네 손가락)는 먹,
// 바퀴는 회색, 축(점선)은 옅은 회색.
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
  TOWARD_VIEWER,
  add3,
  derive,
  dot3,
  frameFor,
  mul3,
  onWheel,
  project,
  readConstants,
  type Frame3,
  type Vec3,
} from './physics';
import { AXIS_HALF, CURL_R, CURL_SPAN, HUB_HALF, L_LEN, SCENE_BOUNDS, WHEEL_R, text } from './schema';
import type { AngularMomentumVectorState } from './state';

/** 바퀴 둘레 · 원호의 표본 수. */
const RIM_SAMPLES = 72;
const CURL_SAMPLES = 90;
/** 원호 끝(화살촉 자리)을 바퀴의 가장 앞 지점보다 감는 쪽으로 더 보낸 각(rad). 촉이 앞에 온다. */
const CURL_LEAD = 0.55;
/** 원호 화살촉 — 길이 · 반너비(월드). */
const CURL_HEAD_LEN = 0.26;
const CURL_HEAD_HALF = 0.11;
/** 빠르기가 이보다 작으면 L · 원호를 그리지 않는다 — 머리만 남은 점이 방향처럼 읽힌다. */
const SPIN_VISIBLE = 0.05;
/** 이름표를 화살표 끝에서 바깥으로 미는 거리(화면 px). */
const LABEL_PUSH = 10;
/** L 이름표를 화살표 옆으로 비키는 거리(화면 px). */
const LABEL_SIDE = 13;
/** 축 이름표를 점선 끝에서 바깥으로 미는 거리(화면 px). */
const AXIS_LABEL_PUSH = 16;
/** 이름표 글자 크기(화면 px). */
const LABEL_FONT_PX = 15;
const AXIS_LABEL_FONT_PX = 13;
/** 바퀴 면 채움 불투명도 — 뒤의 축 · 원호가 비쳐 보이는 정도. */
const DISK_FILL_OPACITY = 0.22;

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
const muted = { colorRole: 'muted', emphasis: 'strong' } as const;

const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];

/**
 * 투영된 방향으로 화면 px 만큼 밀어낸 오프셋(화면은 아래가 +). `side` 를 주면 그 방향의
 * 오른쪽(화면 기준)으로 더 비킨다 — 이름표가 화살표 너머로 이어지는 점선 위에 얹히지 않게.
 */
function pushOut(dir: Vec2, px: number, side = 0): Vec2 {
  const len = Math.hypot(dir[0], dir[1]) || 1;
  const ux = dir[0] / len;
  const uy = -dir[1] / len;
  return [ux * px - uy * side, uy * px + ux * side];
}

/** 원호 표본을 시선 앞 · 뒤 연속 구간으로 나눈다. 구간 경계 점은 양쪽에 모두 넣어 끊기지 않게. */
function splitByDepth(points3: readonly Vec3[]): { front: Vec2[][]; back: Vec2[][] } {
  const front: Vec2[][] = [];
  const back: Vec2[][] = [];
  let run: Vec2[] = [];
  let runFront: boolean | null = null;
  for (const p of points3) {
    const isFront = dot3(p, TOWARD_VIEWER) >= 0;
    const q = project(p);
    if (runFront === null || isFront === runFront) {
      run.push(q);
    } else {
      run.push(q);
      (runFront ? front : back).push(run);
      run = [q];
    }
    runFront = isFront;
  }
  if (run.length > 1 && runFront !== null) (runFront ? front : back).push(run);
  return { front, back };
}

interface Curl {
  front: Vec2[][];
  back: Vec2[][];
  head: Vec2[];
  headFront: boolean;
}

/**
 * 도는 방향 화살표 — 바퀴 둘레 바로 바깥의 원호와 삼각형 촉. 교과서의 오른손 그림에서
 * 네 손가락이 하는 일이다. 쓸고 가는 각은 빠르기에 비례해, 뒤집히는 동안 줄어 사라졌다가
 * 반대쪽으로 다시 자란다.
 */
function curl(f: Frame3, spin: number): Curl {
  const sgn = spin >= 0 ? 1 : -1;
  const span = CURL_SPAN * Math.abs(spin);
  // 바퀴 면에서 가장 시선 쪽에 있는 각. 원호의 끝(촉)을 거기서 조금 지난 자리에 둔다.
  const front = Math.atan2(dot3(f.e2, TOWARD_VIEWER), dot3(f.e1, TOWARD_VIEWER));
  const end = front + sgn * CURL_LEAD;
  const start = end - sgn * span;
  const pts: Vec3[] = [];
  for (let i = 0; i <= CURL_SAMPLES; i++) {
    pts.push(onWheel(f, CURL_R, start + ((end - start) * i) / CURL_SAMPLES));
  }
  const { front: fr, back: bk } = splitByDepth(pts);

  const tip3 = onWheel(f, CURL_R, end);
  const tangent = mul3(add3(mul3(f.e1, -Math.sin(end)), mul3(f.e2, Math.cos(end))), sgn);
  const radial = onWheel(f, 1, end);
  const head: Vec2[] = [
    project(add3(tip3, mul3(tangent, CURL_HEAD_LEN))),
    project(add3(tip3, mul3(radial, CURL_HEAD_HALF))),
    project(add3(tip3, mul3(radial, -CURL_HEAD_HALF))),
  ];
  return { front: fr, back: bk, head, headFront: dot3(tip3, TOWARD_VIEWER) >= 0 };
}

export function scene(params: {
  state: AngularMomentumVectorState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('angular-momentum-vector: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const op = r.opacity;
  const f = frameFor(r.tilt);
  const a = f.axis;
  const origin: Vec2 = project([0, 0, 0]);
  const showSpin = Math.abs(r.spin) >= SPIN_VISIBLE;

  // 축의 두 끝 중 시선 쪽을 향하는 끝(+1 이면 a 쪽).
  const nearEnd = dot3(a, TOWARD_VIEWER) >= 0 ? 1 : -1;
  // L 이 향하는 쪽 — 감는 방향이 고른다.
  const lSide = r.spin >= 0 ? 1 : -1;
  const lFront = lSide === nearEnd;

  const back: Primitive[] = [];
  const front: Primitive[] = [];

  // ---- 축(점선) · 굴대(실선) — 앞 · 뒤 반으로 나눠 바퀴 면 앞뒤에 둔다 ----
  for (const side of [1, -1] as const) {
    const out = side === nearEnd ? front : back;
    const tag = side > 0 ? 'pos' : 'neg';
    out.push({
      type: 'trajectory',
      id: `axis-${tag}`,
      points: [origin, project(mul3(a, side * AXIS_HALF))],
      width: 1.2,
      opacity: op * 0.8,
      style: { ...muted, lineStyle: 'dashed' },
    });
    out.push({
      type: 'trajectory',
      id: `hub-${tag}`,
      points: [origin, project(mul3(a, side * HUB_HALF))],
      width: 4,
      opacity: op,
      style: ink,
    });
  }

  // ---- 각운동량 L — 축 위, 감는 방향이 고른 끝으로 ----
  if (showSpin) {
    const tip = project(mul3(a, r.spin * L_LEN));
    const delta = sub(tip, origin);
    const out = lFront ? front : back;
    out.push({
      type: 'vector',
      id: 'momentum',
      from: origin,
      delta,
      width: 3.5,
      headSize: 0.17,
      opacity: op,
      style: accent,
    });
    out.push({
      type: 'readout',
      id: 'momentum-label',
      anchor: { world: tip, offset: pushOut(delta, LABEL_PUSH, LABEL_SIDE) },
      text: text('label.momentum'),
      chip: false,
      font: 'text',
      fontSize: LABEL_FONT_PX,
      italic: true,
      weight: 'bold',
      align: 'center',
      opacity: op,
      style: accent,
    });
  }

  // ---- 축 이름 — L 이 없는 쪽 끝. 뒤집히는 동안 옅어졌다가 반대쪽 끝에서 다시 뜬다 ----
  const axisEnd = project(mul3(a, -lSide * AXIS_HALF));
  front.push({
    type: 'readout',
    id: 'axis-label',
    anchor: { world: axisEnd, offset: pushOut(sub(axisEnd, origin), AXIS_LABEL_PUSH) },
    text: text('label.axis'),
    chip: false,
    font: 'text',
    fontSize: AXIS_LABEL_FONT_PX,
    align: 'center',
    opacity: op * Math.min(1, Math.abs(r.spin) * 3),
    style: muted,
  });

  // ---- 도는 방향(원호 + 촉) ----
  let curlBack: Primitive[] = [];
  let curlFront: Primitive[] = [];
  if (showSpin) {
    const k = curl(f, r.spin);
    const line = (id: string, pts: Vec2[]): Primitive => ({
      type: 'trajectory',
      id,
      points: pts,
      width: 2.4,
      opacity: op,
      style: ink,
    });
    curlBack = k.back.map((pts, i) => line(`curl-back-${i}`, pts));
    curlFront = k.front.map((pts, i) => line(`curl-front-${i}`, pts));
    const headPrim: Primitive = {
      type: 'region',
      id: 'curl-head',
      points: k.head,
      fillOpacity: 1,
      opaque: true,
      opacity: op,
      style: ink,
    };
    (k.headFront ? curlFront : curlBack).push(headPrim);
  }

  // ---- 바퀴 ----
  const rim: Vec2[] = [];
  for (let i = 0; i <= RIM_SAMPLES; i++) rim.push(project(onWheel(f, WHEEL_R, (i / RIM_SAMPLES) * Math.PI * 2)));
  const wheel: Primitive[] = [
    {
      type: 'region',
      id: 'disk-fill',
      points: rim,
      fillOpacity: DISK_FILL_OPACITY,
      opacity: op,
      style: muted,
    },
    {
      type: 'trajectory',
      id: 'disk-rim',
      points: rim,
      closed: true,
      width: 1.6,
      opacity: op,
      style: ink,
    },
    {
      type: 'lineSet',
      id: 'spokes',
      lines: [0, 1, 2].map((k) => [origin, project(onWheel(f, WHEEL_R, r.angle + (k * 2 * Math.PI) / 3))]),
      width: 1.5,
      opacity: op,
      style: { colorRole: 'muted', emphasis: 'medium' },
    },
    // 둘레의 표지 점 — 바큇살 셋이 대칭이라 멈춘 화면에서도 어느 쪽으로 도는지 따라갈 자리.
    {
      type: 'body',
      id: 'rim-mark',
      pos: project(onWheel(f, WHEEL_R, r.angle)),
      shape: 'circle',
      size: 0.055,
      glow: false,
      opacity: op,
      style: ink,
    },
  ];

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return [...curlBack, ...back, ...wheel, ...front, ...curlFront];
}

/** 고정 경계 — 프레이밍이 흔들리면 축의 기울기와 시점의 회전이 섞인다. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
