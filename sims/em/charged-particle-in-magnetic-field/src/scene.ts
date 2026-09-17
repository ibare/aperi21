// ========================================================================
// charged-particle-in-magnetic-field — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 자기장 ⊗ 무늬 → `lineSet` 하나(고리 표본 + 가위표 두 획).
// - 궤도 원 다섯 → `trajectory` closed (G28 표본).
// - 자취 → `trajectory` fade tail 다섯. 모든 전하에 같은 시간 창이라 길이가 곧 속력이다.
// - 같은 순간의 전하를 잇는 선 → `trajectory` 하나, 강조색은 여기에만.
// - 출발점 → `body` point.
// - 전하 → `body` circle(후광 없음) + `body` custom 의 + 두 획을 바탕색 둘레로 (G07 근사).
// ========================================================================

import type { Body, Bounds, LineSet, Primitive, SceneGraph, TimelineFrame, Trajectory, Vec2 } from '@aperi21/schema';
import { chargePosition, orbitCenter } from './physics';
import {
  CAPTION_BAND,
  CHARGE,
  FIELD,
  FRAME_DT,
  RADII,
  SAME_LINE_MIN,
  STAGE,
  START,
  TRAIL_FRAMES,
  TRAIL_OPACITY,
  WIDTHS,
} from './schema';
import type { ChargedParticleInMagneticFieldState } from './state';

/** 작은 원 고리를 다각형으로 표본하는 개수 (G28). */
const RING_SAMPLES = 16;
/** 궤도 원 표본 개수 (G28). */
const ORBIT_SAMPLES = 96;

function ring(c: Vec2, r: number, n: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k <= n; k++) {
    const a = (2 * Math.PI * k) / n;
    pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  return pts;
}

/** 원본 캔버스 좌표(y 아래) → 월드(y 위, 가운데 원점). */
function fromCanvas(x: number, y: number): Vec2 {
  return [x - STAGE.width / 2, STAGE.height - y];
}

/** 종이 뒤로 들어가는 균일한 자기장 — 같은 간격의 ⊗. 시각과 무관하다. */
function fieldStrokes(): Vec2[][] {
  const out: Vec2[][] = [];
  const { step, radius: r, armRatio } = FIELD;
  const d = r * armRatio;
  for (let y = step / 2; y < STAGE.height; y += step) {
    for (let x = step / 2; x < STAGE.width; x += step) {
      const c = fromCanvas(x, y);
      out.push(ring(c, r, RING_SAMPLES));
      out.push([
        [c[0] - d, c[1] + d],
        [c[0] + d, c[1] - d],
      ]);
      out.push([
        [c[0] + d, c[1] + d],
        [c[0] - d, c[1] - d],
      ]);
    }
  }
  return out;
}

/**
 * 전하에 새긴 + — 두 획을 바탕색 둘레로 긋는다. 좌표는 `pos` 기준 월드 단위, y 위.
 * 원본은 짙은 원판 위에 바탕색 글자 `+` 였다. 반전 글자 색이 없어(G07) 획으로 근사한다.
 */
function plusPath(): string {
  const a = CHARGE.plusArm;
  return `M ${-a} 0 L ${a} 0 M 0 ${-a} L 0 ${a}`;
}

export function scene(params: {
  state: ChargedParticleInMagneticFieldState;
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('charged-particle-in-magnetic-field: schema.timeline 이 선언되어야 한다');
  // 출발 뒤 흐른 시간. 조각 시계에 `startAt` 이 이미 들어 있다.
  const t = timeline.t;
  const period = timeline.period;
  const out: Primitive[] = [];

  // ---- 자기장 ⊗ 무늬 ----
  const field: LineSet = {
    type: 'lineSet',
    id: 'field',
    lines: fieldStrokes(),
    width: WIDTHS.field,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(field);

  // ---- 궤도 ----
  // 자기장 무늬보다 한 단 옅다(원본 위계). 반지름이 속력에 비례한다.
  RADII.forEach((r, i) => {
    const orbit: Trajectory = {
      type: 'trajectory',
      id: `orbit-${i}`,
      points: ring(orbitCenter(r), r, ORBIT_SAMPLES),
      closed: true,
      width: WIDTHS.orbit,
      opacity: 0.6,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    };
    out.push(orbit);
  });

  // ---- 자취 ----
  // 최근 36 프레임(0.6 초)의 위치. 머리 쪽이 짙고 꼬리로 갈수록 옅다.
  RADII.forEach((r, i) => {
    const points: Vec2[] = [];
    for (let j = TRAIL_FRAMES - 1; j >= 0; j--) {
      points.push(chargePosition(r, Math.max(0, t - j * FRAME_DT), period));
    }
    const trail: Trajectory = {
      type: 'trajectory',
      id: `trail-${i}`,
      points,
      width: WIDTHS.trail,
      opacity: TRAIL_OPACITY,
      style: { colorRole: 'ink', emphasis: 'strong', fade: 'tail' },
    };
    out.push(trail);
  });

  // ---- 같은 순간의 전하를 잇는 선 ----
  // 각속도가 같으므로 모든 전하가 출발점을 지나는 한 직선 위에 있다. 줄의 끝은 가장
  // 바깥 전하다. 모두 출발점에 겹친 순간 길이가 0 이 되어 사라진다.
  const positions = RADII.map((r) => chargePosition(r, t, period));
  const far = positions[positions.length - 1]!;
  if (Math.hypot(far[0] - START[0], far[1] - START[1]) >= SAME_LINE_MIN) {
    const sameLine: Trajectory = {
      type: 'trajectory',
      id: 'same-instant',
      points: [[START[0], START[1]], far],
      width: WIDTHS.sameLine,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(sameLine);
  }

  // ---- 출발점 ----
  const start: Body = {
    type: 'body',
    id: 'start',
    pos: [START[0], START[1]],
    shape: 'point',
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(start);

  // ---- 전하 ----
  // 다섯은 같은 대상이라 같은 색이다. 속력 차이를 색으로 나누지 않는다.
  // 원판(후광 없음) 위에 + 획을 바탕색으로 긋는다 — 강조선 위에 놓여도 + 가 바탕으로 읽힌다.
  const plus = plusPath();
  positions.forEach((pos, i) => {
    const charge: Body = {
      type: 'body',
      id: `charge-${i}`,
      pos,
      shape: 'circle',
      size: CHARGE.radius,
      glow: false,
      outline: 'none',
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    const sign: Body = {
      type: 'body',
      id: `charge-sign-${i}`,
      pos,
      shape: 'custom',
      customPath: plus,
      fill: 'none',
      outline: 'background',
    };
    out.push(charge, sign);
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). id 'caption' 을 두지 않는다.
  return out;
}

/** 고정 경계 — 원본 캔버스 전체와 그 아래 캡션 띠. 프레이밍이 흔들리지 않는다 (S-piece). */
export function boundsHint(): Bounds {
  return {
    minX: -STAGE.width / 2,
    maxX: STAGE.width / 2,
    minY: -CAPTION_BAND,
    maxY: STAGE.height,
  };
}
