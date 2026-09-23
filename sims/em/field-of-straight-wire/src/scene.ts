// ========================================================================
// field-of-straight-wire — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 바늘은 `body` 의 `customPath` 로 그리고 `orientation`
// 으로 돌린다 — 각도 상태가 그대로 화면의 방향이 된다. 고리는 바늘들이 이루는
// 무늬에서 읽혀야 하므로 장선을 깔아 주는 어휘를 쓰지 않는다.
//
// **표본점 배치는 어휘가 아니다.** `physics.deriveSamples()` 가 좌표만 내주고,
// 그 자리에 무엇이 어떤 모양으로 서는지는 여기서 전부 정한다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { deriveSamples } from './physics';
import {
  NEEDLE_HALF_WIDTH,
  NEEDLE_LENGTH,
  NORTH,
  PIVOT_RADIUS,
  SCENE_BOUNDS,
  SYMBOL_THRESHOLD,
  WIRE,
  WIRE_CROSS_ARM,
  WIRE_DOT_RADIUS,
  WIRE_RADIUS,
} from './schema';
import type { FieldOfStraightWireState } from './state';

/** S극 윤곽 삼각의 선 굵기(화면 px). 원본의 1 px 획. */
const OUTLINE_WIDTH_PX = 1;
/** 전선 원의 선 굵기(화면 px). */
const WIRE_WIDTH_PX = 2.4;
/** ⊗ 가위표의 선 굵기(화면 px). */
const CROSS_WIDTH_PX = 2.2;
/** 전선 원을 이루는 꼭짓점 수. 이 정도면 원으로 읽힌다. */
const WIRE_SEGMENTS = 48;
/** 전류가 0 일 때의 전선 진하기와, 세기가 더하는 몫. 세기는 이것으로만 비친다. */
const WIRE_ALPHA_BASE = 0.3;
const WIRE_ALPHA_SPAN = 0.7;

/**
 * N극 — 채운 삼각. `pos` 기준 월드 좌표이고 y 가 위다. 바늘이 +x 를 보는 자세로
 * 적고 `orientation` 이 돌린다.
 */
const NEEDLE_PATH = `M ${NEEDLE_LENGTH} 0 L 0 ${NEEDLE_HALF_WIDTH} L 0 ${-NEEDLE_HALF_WIDTH} Z`;

/** 채운 원. `customPath` 는 채움만 하므로 점은 이것으로 그린다. */
function discPath(r: number): string {
  return `M ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 Z`;
}

const PIVOT_PATH = discPath(PIVOT_RADIUS);
const WIRE_DOT_PATH = discPath(WIRE_DOT_RADIUS);

/** 바늘 자세의 국소 좌표를 월드로. */
function at(base: Vec2, local: Vec2, theta: number): Vec2 {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [base[0] + local[0] * c - local[1] * s, base[1] + local[0] * s + local[1] * c];
}

function circlePoints(center: Vec2, radius: number, segments: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i * 2 * Math.PI) / segments;
    pts.push([center[0] + radius * Math.cos(a), center[1] + radius * Math.sin(a)]);
  }
  return pts;
}

export function scene(params: {
  state: FieldOfStraightWireState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state } = params;
  const samples = deriveSamples();
  const out: Primitive[] = [];

  // ---- 나침반 ----
  // 전부 같은 대상이니 같은 색이다. N극과 S극은 색이 아니라 **채움 여부**로
  // 가른다 (S-piece: 색으로 설명하지 않는다).
  samples.forEach((sample, i) => {
    const theta = state.angles[i] ?? NORTH;

    const north: Body = {
      type: 'body',
      id: `needle-n-${i}`,
      pos: sample.pos,
      shape: 'custom',
      customPath: NEEDLE_PATH,
      orientation: theta,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(north);

    // S극 — 같은 삼각의 윤곽. 채움과 같은 꼭짓점을 반대편에 찍는다.
    const south: Trajectory = {
      type: 'trajectory',
      id: `needle-s-${i}`,
      points: [
        at(sample.pos, [-NEEDLE_LENGTH, 0], theta),
        at(sample.pos, [0, NEEDLE_HALF_WIDTH], theta),
        at(sample.pos, [0, -NEEDLE_HALF_WIDTH], theta),
      ],
      closed: true,
      width: OUTLINE_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(south);

    // 축. 나침반 케이스(바늘마다 원)를 두지 않는다 — 46개 원은 소음이고,
    // 점 하나로 "핀에 꽂힌 바늘" 이 읽힌다.
    const pivot: Body = {
      type: 'body',
      id: `pivot-${i}`,
      pos: sample.pos,
      shape: 'custom',
      customPath: PIVOT_PATH,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(pivot);
  });

  // ---- 전선 ----
  // 강조색을 쓰는 곳은 여기 하나뿐이다 — 전류의 근원이라는 한 가지 뜻이다.
  // 세기는 숫자도 눈금도 아니고 **진하기**로만 비친다.
  const current = state.current;
  const alpha = WIRE_ALPHA_BASE + WIRE_ALPHA_SPAN * Math.abs(current);

  const ring: Trajectory = {
    type: 'trajectory',
    id: 'wire-ring',
    points: circlePoints(WIRE, WIRE_RADIUS, WIRE_SEGMENTS),
    closed: true,
    width: WIRE_WIDTH_PX,
    opacity: alpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(ring);

  if (current > SYMBOL_THRESHOLD) {
    // ⊙ — 전류가 화면 밖으로 나온다.
    const dot: Body = {
      type: 'body',
      id: 'wire-out',
      pos: WIRE,
      shape: 'custom',
      customPath: WIRE_DOT_PATH,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(dot);
  } else if (current < -SYMBOL_THRESHOLD) {
    // ⊗ — 전류가 화면 안으로 들어간다.
    const d = WIRE_CROSS_ARM;
    const strokes: readonly (readonly [Vec2, Vec2])[] = [
      [
        [WIRE[0] - d, WIRE[1] - d],
        [WIRE[0] + d, WIRE[1] + d],
      ],
      [
        [WIRE[0] + d, WIRE[1] - d],
        [WIRE[0] - d, WIRE[1] + d],
      ],
    ];
    strokes.forEach(([from, to], i) => {
      const arm: Trajectory = {
        type: 'trajectory',
        id: `wire-in-${i}`,
        points: [from, to],
        width: CROSS_WIDTH_PX,
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      };
      out.push(arm);
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/**
 * 고정 경계. 원본 캔버스를 그대로 옮긴 프레이밍이다 — 자기력선도 북쪽 화살표도
 * 없는 화면에서 무엇이 보이는지는 주장의 일부다 (S-piece).
 */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
