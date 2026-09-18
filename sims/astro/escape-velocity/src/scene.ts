// ========================================================================
// escape-velocity — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 행성 · 물체(body) · 레인 선 ·
// 자취 · 꼭대기 눈금(trajectory) · 속도(vector) · 속도 글자 · 레인 이름(readout)이 모두
// 표준 어휘로 있다.
//
// 행성은 왼쪽, 곧장 위(행성 바깥쪽)는 화면 오른쪽이다. 세로가 비싸서 가로로 쏜다.
//
// 색은 뜻마다 하나다 — 물체는 먹색, 속도는 primary, 실제 중력 레인의 자취 · 꼭대기 눈금 ·
// 속도 글자는 secondary(한 샷이 남긴 것), 「중력이 줄지 않는다면」 레인 · 행성 · 레인 선은
// 배경 정보라 muted. 강조색은 쓰지 않는다 — 문턱을 색으로 칠하면 「돌아오지 않는다」 가
// 움직임이 아니라 색으로 설명된다 (S-piece MUST NOT 「색으로 설명하지 않는다」).
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
  currentShot,
  launchSpeed,
  markOpacity,
  readConstants,
  realAt,
  shotWindow,
  speedUnit,
  uniformAt,
  type EscapeVelocityConstants,
} from './physics';
import { LANE_REAL_Y, LANE_UNIFORM_Y, SCENE_BOUNDS, text } from './schema';
import type { EscapeVelocityState } from './state';

/** 물체 반지름(월드). 실제 레인 · 비교 레인. */
const BODY_R = 0.09;
const UNIFORM_BODY_R = 0.07;
/** 꼭대기 눈금의 반높이(월드). */
const TICK_HALF = 0.13;
/** 속도 글자를 레인 아래로 내리는 거리(화면 px). */
const SPEED_LABEL_DROP = 18;
/** 레인 이름을 레인 아래로 내리는 거리(화면 px). */
const LANE_LABEL_DROP = 16;
/** 돌아오지 않는 물체가 「화면을 벗어났다」 로 치는 자리 — 오른쪽 끝에서 이만큼 더(월드). */
const EXIT_MARGIN = 0.3;
/**
 * 속도 글자가 따라 나갈 수 있는 가장 오른쪽(월드) — 화면 끝에서 이만큼 안쪽. 돌아오지 않는 샷의
 * 글자가 물체를 따라 화면 밖으로 나가지 않고 끝에 멈춘다. `readout.clamp` 는 끝에 붙이며 글자를
 * 줄여 11.2 km/s 가 다른 샷 글자보다 작아졌다.
 */
const SPEED_LABEL_EDGE = 0.5;
/** 비교 레인 이름표를 가장 높은 눈금 너머로 띄우는 거리(월드). */
const LANE_LABEL_GAP = 0.3;
/** 화살표가 이보다 짧으면(월드) 그리지 않는다 — 꼭대기의 속도 0. */
const MIN_ARROW = 0.01;
/** 속도 글자 · 비교 레인 이름표 크기(화면 px). */
const SPEED_LABEL_PX = 11;
const LANE_LABEL_PX = 12;
/** 행성 · 레인 선의 짙기 — 배경이라 물린다. */
const PLANET_OPACITY = 0.55;
const LANE_OPACITY = 0.6;
/** 레인 선 · 눈금 · 자취 · 속도 화살표 굵기(화면 px). */
const LANE_WIDTH_PX = 1;
const UNIFORM_TICK_WIDTH_PX = 1.5;
const REAL_TICK_WIDTH_PX = 2;
const TRAIL_WIDTH_PX = 2.5;
const ARROW_WIDTH_PX = 3;

/** 레인 y 에서 행성 표면이 닿는 x. 행성 중심은 (−K, 0), 반지름 K 다. */
function launchX(c: EscapeVelocityConstants, laneY: number): number {
  const k = c.worldPerRadius;
  return -k + Math.sqrt(Math.max(0, k * k - laneY * laneY));
}

/** 표면 위 높이(행성 반지름 단위) → 레인 위 x. */
function laneX(c: EscapeVelocityConstants, laneY: number, height: number): number {
  return launchX(c, laneY) + height * c.worldPerRadius;
}

function tick(id: string, x: number, y: number, width: number, opacity: number, role: 'secondary' | 'muted'): Primitive {
  return {
    type: 'trajectory',
    id,
    points: [
      [x, y - TICK_HALF],
      [x, y + TICK_HALF],
    ],
    width,
    opacity,
    style: { colorRole: role, emphasis: 'strong' },
  };
}

function speedLabel(id: string, x: number, kms: number, opacity: number): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: [Math.min(x, SCENE_BOUNDS.maxX - SPEED_LABEL_EDGE), LANE_REAL_Y], offset: [0, SPEED_LABEL_DROP] },
    text: text('label.speed'),
    // 선언값 그대로 — 계산해서 줄이지 않는다 (S-piece 유효숫자).
    vars: { v: String(kms) },
    chip: false,
    font: 'mono',
    fontSize: SPEED_LABEL_PX,
    align: 'center',
    opacity,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: EscapeVelocityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('escape-velocity: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const k = c.worldPerRadius;
  const out: Primitive[] = [];
  const fade = markOpacity(tl);
  const { index, progress } = currentShot(tl);

  const realX0 = launchX(c, LANE_REAL_Y);
  const exitR = 1 + (SCENE_BOUNDS.maxX + EXIT_MARGIN - realX0) / k;

  // ---- 행성 ----
  // 중력의 원천. 배경 정보라 muted — 주장은 행성이 아니라 레인 위 높이에 있다.
  out.push({
    type: 'body',
    id: 'planet',
    pos: [-k, 0],
    shape: 'circle',
    size: k,
    outline: 'none',
    glow: false,
    opacity: PLANET_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 레인 선 ----
  // 곧장 위로 가는 길. 표면에서 화면 끝 너머까지.
  for (const [id, y] of [
    ['lane-real', LANE_REAL_Y],
    ['lane-uniform', LANE_UNIFORM_Y],
  ] as const) {
    out.push({
      type: 'trajectory',
      id,
      points: [
        [launchX(c, y), y],
        [SCENE_BOUNDS.maxX + 1, y],
      ],
      width: LANE_WIDTH_PX,
      opacity: LANE_OPACITY,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });
  }

  // ---- 「중력이 줄지 않는다면」 레인 ----
  // 같은 샷 · 같은 처음 속도 · 같은 물리 시계. 표면의 중력이 높이와 무관하게 그대로다.
  // 이름표는 가장 빠른 샷의 꼭대기 너머에 둔다 — 눈금이 모이는 자리를 가리지 않는다.
  const fastest = launchSpeed(c, Math.max(...c.speeds));
  const labelX = laneX(c, LANE_UNIFORM_Y, (fastest * fastest) / 2) + LANE_LABEL_GAP;
  out.push({
    type: 'readout',
    id: 'uniform-label',
    anchor: { world: [labelX, LANE_UNIFORM_Y], offset: [0, LANE_LABEL_DROP] },
    text: text('label.uniform'),
    chip: false,
    font: 'text',
    fontSize: LANE_LABEL_PX,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  const vUnit = speedUnit(c);
  let uniformNow = 0;
  for (let j = 0; j <= index; j++) {
    const v0 = launchSpeed(c, c.speeds[j]!);
    const window = shotWindow(c, v0, exitR);
    const s = j < index ? window : progress * window;
    const u = uniformAt(v0, s);
    if (u.peak !== null) {
      out.push(tick(`uniform-peak-${j}`, laneX(c, LANE_UNIFORM_Y, u.peak), LANE_UNIFORM_Y, UNIFORM_TICK_WIDTH_PX, fade, 'muted'));
    }
    if (j === index) uniformNow = u.h;
  }
  out.push({
    type: 'body',
    id: 'uniform-body',
    pos: [laneX(c, LANE_UNIFORM_Y, uniformNow), LANE_UNIFORM_Y],
    shape: 'circle',
    size: UNIFORM_BODY_R,
    outline: 'none',
    glow: false,
    opacity: fade,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 실제 중력 레인 — 지난 샷의 꼭대기 ----
  // 돌아온 샷마다 눈금 하나와 쏜 속도를 남긴다. 속도는 같은 만큼씩 올랐는데 눈금 사이는
  // 점점 벌어진다.
  for (let j = 0; j < index; j++) {
    const v0 = launchSpeed(c, c.speeds[j]!);
    const r = realAt(v0, shotWindow(c, v0, exitR));
    if (r.peak === null) continue;
    const x = laneX(c, LANE_REAL_Y, r.peak - 1);
    out.push(tick(`real-peak-${j}`, x, LANE_REAL_Y, REAL_TICK_WIDTH_PX, fade, 'secondary'));
    out.push(speedLabel(`real-speed-${j}`, x, c.speeds[j]!, fade));
  }

  // ---- 실제 중력 레인 — 지금 샷 ----
  const v0 = launchSpeed(c, c.speeds[index]!);
  const now = realAt(v0, progress * shotWindow(c, v0, exitR));
  const reachX = laneX(c, LANE_REAL_Y, now.reach - 1);
  const bodyX = laneX(c, LANE_REAL_Y, now.r - 1);

  // 자취 — 이번 샷이 닿은 가장 먼 곳까지. 돌아오는 동안에도 꼭대기에 남는다.
  if (reachX - realX0 > 1e-3) {
    out.push({
      type: 'trajectory',
      id: 'reach',
      points: [
        [realX0, LANE_REAL_Y],
        [reachX, LANE_REAL_Y],
      ],
      width: TRAIL_WIDTH_PX,
      opacity: fade,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }
  if (now.peak !== null) {
    out.push(tick('real-peak-now', reachX, LANE_REAL_Y, REAL_TICK_WIDTH_PX, fade, 'secondary'));
  }
  // 쏜 속도 — 자취 끝을 따라 나가 꼭대기에 남는다. 돌아오지 않는 샷은 화면 오른쪽 끝 안쪽에 멈춘다.
  out.push(speedLabel('real-speed-now', reachX, c.speeds[index]!, fade));

  // 물체와 속도. 화살표 길이가 곧 빠르기다 — 올라갈수록 짧아지고, 돌아오는 샷은 꼭대기에서
  // 0 이 됐다가 뒤집히며, 돌아오지 않는 샷은 짧아지기만 하고 사라지지 않는다.
  const pos: Vec2 = [bodyX, LANE_REAL_Y];
  out.push({
    type: 'body',
    id: 'body',
    pos,
    shape: 'circle',
    size: BODY_R,
    outline: 'none',
    glow: false,
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  const arrow = now.v * vUnit * c.arrowPerKms;
  if (Math.abs(arrow) > MIN_ARROW) {
    out.push({
      type: 'vector',
      id: 'velocity',
      from: pos,
      delta: [arrow, 0],
      width: ARROW_WIDTH_PX,
      label: text('label.velocity'),
      opacity: fade,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
