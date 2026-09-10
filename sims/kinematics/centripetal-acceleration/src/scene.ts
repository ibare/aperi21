// ========================================================================
// centripetal-acceleration — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 궤도(trajectory) · 중심과 공(body) · 속도와 Δv(vector) · 'Δv' 이름표(readout).
// 옅어지는 사본·잔상은 모두 `opacity` 로 선언한다. 캡션은 선언의 캡션 슬롯이
// 그린다 — 여기서 내지 않는다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { cycle, ease, lerp2, position, spokeAlpha, theta, velocity } from './physics';
import {
  BALL_RADIUS,
  HEAD_SIZE,
  KEPT_ALPHA,
  MIN_ALPHA,
  PAST_CYCLES,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { CentripetalAccelerationState } from './state';

/** 궤도 원을 이루는 점 개수. */
const ORBIT_SEGMENTS = 96;
/** 궤도 윤곽선 굵기(화면 px). 원본 1.5. */
const ORBIT_WIDTH_PX = 1.5;
/**
 * 궤도 윤곽선의 옅음. 원본은 배경에 가까운 옅은 회색(#d6d3cc)이라 muted 를
 * subtle 로 쓰고도 한 번 더 흐린다.
 */
const ORBIT_OPACITY = 0.6;
/** 'Δv' 이름표가 화살표에서 원 바깥쪽으로 비켜서는 거리(화면 px). 원본 15. */
const DV_LABEL_GAP_PX = 15;
/** 'Δv' 이름표 글자 크기. 원본 15 px. */
const DV_LABEL_FONT = 15;
/** Δv 가 이만큼 자란 뒤부터 이름표가 나타난다. */
const DV_LABEL_FROM = 0.6;
/** 화살표 굵기(화면 px). 원본 — 살아 있는 속도 · 남긴 속도 · 이번 Δv 3, 지난 Δv 2.5. */
const ARROW_WIDTH_PX = 3;
const PAST_ARROW_WIDTH_PX = 2.5;

const VELOCITY_STYLE = { colorRole: 'secondary', emphasis: 'strong' } as const;
const DV_STYLE = { colorRole: 'accent', emphasis: 'strong' } as const;

function arrow(
  id: string,
  from: Vec2,
  delta: Vec2,
  style: Vector['style'],
  opacity: number,
  width = ARROW_WIDTH_PX,
): Vector {
  return { type: 'vector', id, from, delta, headSize: HEAD_SIZE, style, opacity, width };
}

export function scene(params: {
  state: CentripetalAccelerationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('centripetal-acceleration: schema.timeline 이 선언되어야 한다');
  const s = tl.t;
  const { cycle: k, u } = tl;
  const cur = cycle(k, tl);
  const out: Primitive[] = [];

  // ---- 원 궤도 · 중심 ----
  const orbit: Trajectory = {
    type: 'trajectory',
    id: 'orbit',
    points: Array.from({ length: ORBIT_SEGMENTS }, (_, i) => position((i / ORBIT_SEGMENTS) * Math.PI * 2)),
    closed: true,
    width: ORBIT_WIDTH_PX,
    opacity: ORBIT_OPACITY,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(orbit);

  // 과녁. Δv 가 "중심을 향한다" 가 성립하려면 가리키는 곳이 보여야 한다.
  const center: Body = {
    type: 'body',
    id: 'center',
    pos: [0, 0],
    shape: 'point',
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(center);

  // ---- 지난 Δv ----
  // 쌓은 상태가 아니라 주기 번호에서 다시 계산한다 — 같은 시각은 언제나 같은 화면.
  for (let j = k - 1; j >= k - PAST_CYCLES; j--) {
    const c = cycle(j, tl);
    const a = spokeAlpha(s - c.done);
    if (a < MIN_ALPHA) break;
    out.push(arrow(`past-dv-${j}`, c.mid, c.dv, DV_STYLE, a, PAST_ARROW_WIDTH_PX));
  }

  // ---- 남겨 둔 두 속도 ----
  // Δv 가 옮겨지는 동안 **지운다**. Δv 는 남긴다 — 이 비대칭이 "남는 것은 변화" 다.
  const kept = KEPT_ALPHA * (1 - tl.at('move'));
  if (kept > 0.01) {
    // v1: 처음엔 제자리, 꼬리 맞대기 단계에서 v2 의 꼬리로 평행 이동한다.
    out.push(arrow('kept-v1', lerp2(cur.p1, cur.p2, tl.at('align')), cur.v1, VELOCITY_STYLE, kept));
    // v2: 공이 그 자리에 도착한 뒤부터.
    if (u >= tl.start('align')) out.push(arrow('kept-v2', cur.p2, cur.v2, VELOCITY_STYLE, kept));
  }

  // ---- 이번 주기의 Δv ----
  // v1 끝에서 v2 끝으로 자라난 뒤, 방향 그대로 호의 가운데로 옮긴다.
  if (u >= tl.start('grow')) {
    const g = tl.at('grow');
    const tip: Vec2 = [cur.p2[0] + cur.v1[0], cur.p2[1] + cur.v1[1]];
    const from = lerp2(tip, cur.mid, tl.at('move'));
    const a = u < tl.end('move') ? 1 : spokeAlpha(s - cur.done);
    const delta: Vec2 = [cur.dv[0] * g, cur.dv[1] * g];
    out.push(arrow('dv', from, delta, DV_STYLE, a));

    if (g > DV_LABEL_FROM) {
      // 화살표 옆, 중심에서 먼 쪽 법선으로 비켜선다.
      const len = Math.hypot(cur.dv[0], cur.dv[1]);
      let nx = -cur.dv[1] / len;
      let ny = cur.dv[0] / len;
      const mid: Vec2 = [from[0] + delta[0] * 0.5, from[1] + delta[1] * 0.5];
      if (mid[0] * nx + mid[1] * ny < 0) {
        nx = -nx;
        ny = -ny;
      }
      const label: Readout = {
        type: 'readout',
        id: 'dv-label',
        // offset 은 화면 픽셀 — y 가 아래로 뒤집힌다.
        anchor: { world: mid, offset: [nx * DV_LABEL_GAP_PX, -ny * DV_LABEL_GAP_PX] },
        text: text('label.dv'),
        chip: false,
        align: 'center',
        // 원본 — 기울임 굵은 15 px. 기호라 수식 글자로 읽혀야 한다.
        font: 'text',
        italic: true,
        weight: 'bold',
        fontSize: DV_LABEL_FONT,
        opacity: a * ease((g - DV_LABEL_FROM) / (1 - DV_LABEL_FROM)),
        style: DV_STYLE,
      };
      out.push(label);
    }
  }

  // ---- 공과 그 속도 ----
  const th = theta(s);
  const p = position(th);
  out.push(arrow('velocity', p, velocity(th), VELOCITY_STYLE, 1));
  const ball: Body = {
    type: 'body',
    id: 'ball',
    pos: p,
    shape: 'circle',
    size: BALL_RADIUS,
    // 원본의 공은 번짐 없는 먹색 채움 원이다.
    style: { colorRole: 'ink', emphasis: 'strong' },
    glow: false,
  };
  out.push(ball);

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
