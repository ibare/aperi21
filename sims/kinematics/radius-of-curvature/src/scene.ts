// ========================================================================
// radius-of-curvature — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더 계층을 쓰지 않는다. 길·축폐선·반지름 선분은 `trajectory`, 두 점은
// `body`, 캡션은 선언의 슬롯이다. 원본이 96개 호 조각으로 쪼개 알파를 손으로
// 매기던 「얹힌 원」은 `trajectory` 의 `fade: 'focus'` + `focus` 가 대신한다 —
// 끝이 아니라 **경로 위 한 점을 중심으로** 양쪽으로 옅어지는 꼴이다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';

import { CURVE, deriveAt } from './physics';
import { SCENE_BOUNDS } from './schema';
import type { RadiusOfCurvatureState } from './state';

/** 길의 굵기(화면 px). 원본의 2.4 — 이 조각에서 가장 짙고 굵은 선이다. */
const PATH_WIDTH_PX = 2.4;
/** 축폐선의 굵기(화면 px). 원본의 1 — 미리 깔아 두는 안내선이라 가늘다. */
const EVOLUTE_WIDTH_PX = 1;
/** 축폐선의 옅기. 원본의 알파 0.17. 중심점이 그 위를 달리는 것만 보이면 된다. */
const EVOLUTE_OPACITY = 0.17;

/**
 * 얹힌 원을 몇 도막으로 끊을지. 원본과 같은 96 — 도막마다 알파가 갈리므로
 * 이 수가 곧 감쇠의 해상도다. 현의 처짐은 R=288 에서도 0.16px 라 눈에 닿지 않는다.
 */
const CIRCLE_SEGMENTS = 96;
/** 얹힌 원의 굵기(화면 px). 원본의 2.6 — **길보다 진해야 얹혀 있는 것으로 읽힌다.** */
const CIRCLE_WIDTH_PX = 2.6;
/** 접촉점에서의 짙기. 원본의 알파 상한 0.89. */
const CIRCLE_OPACITY = 0.89;
/**
 * 진한 구간의 폭(경로 길이의 비율). 원본은 접촉점 기준 각거리로 가우시안
 * (σ = 0.55 rad) 감쇠를 매겼고, 알파가 절반으로 떨어지는 자리가 0.648 rad 였다.
 * 원 한 바퀴가 경로 전체이므로 0.648 / 2π = 0.103 이 같은 자리다.
 *
 * **감쇠 폭은 엔진이 정하면 안 된다** — 얼마나 넓은 구간이 붙어 보이는가는
 * '국소적으로 닮았다' 의 일부이므로 조각이 낸다 (NOTES.md).
 */
const CIRCLE_FOCUS_WIDTH = 0.103;

/** 반지름 선분의 굵기(화면 px)와 옅기. 원본의 1.6 / 0.72. */
const RADIUS_WIDTH_PX = 1.6;
const RADIUS_OPACITY = 0.72;

/** 원의 중심을 찍는 점의 반지름(월드 단위 = 배율 1 에서 화면 px). 원본의 3.4. */
const CENTER_DOT = 3.4;
/** 달리는 점의 반지름. 원본의 6.2. */
const RUNNER_DOT = 6.2;

/**
 * 얹힌 원 — **접촉점을 한가운데 두고** 반 바퀴씩 양쪽으로 펼친다.
 *
 * 펼치는 자리가 곧 `focus.at = 0.5` 다. 끝에서 옅어지는 `tail` 로는 이 모양이
 * 나오지 않는다 — 접촉점이 경로의 끝이 아니라 한복판이기 때문이다.
 */
function osculatingCircle(center: Vec2, radius: number, phi: number): Trajectory {
  const points: Vec2[] = [];
  const stepAngle = (Math.PI * 2) / CIRCLE_SEGMENTS;
  for (let i = 0; i <= CIRCLE_SEGMENTS; i++) {
    const a = phi - Math.PI + stepAngle * i;
    points.push([center[0] + radius * Math.cos(a), center[1] + radius * Math.sin(a)]);
  }
  return {
    type: 'trajectory',
    id: 'osculating-circle',
    points,
    width: CIRCLE_WIDTH_PX,
    opacity: CIRCLE_OPACITY,
    style: { colorRole: 'primary', emphasis: 'strong', fade: 'focus' },
    focus: { at: 0.5, width: CIRCLE_FOCUS_WIDTH },
  };
}

export function scene(params: {
  state: RadiusOfCurvatureState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const d = deriveAt(params.state.arc);
  const out: Primitive[] = [];

  // 원의 중심이 훑고 지나가는 자리(축폐선). 자취를 실시간으로 쌓지 않고 전체를
  // 미리 깐다 — **도착한 순간 이미 관계가 보여야** 한다. 쌓는 방식이면 처음
  // 몇 초는 빈 별 모양을 기다리게 된다.
  out.push({
    type: 'trajectory',
    id: 'evolute',
    points: CURVE.evolute,
    closed: true,
    width: EVOLUTE_WIDTH_PX,
    opacity: EVOLUTE_OPACITY,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // 길. 강조색을 한 가지 뜻(*지금 이 자리의 원*)에만 쓰기 위해 먹색이다.
  out.push({
    type: 'trajectory',
    id: 'path',
    points: CURVE.points,
    closed: true,
    width: PATH_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  out.push(osculatingCircle(d.center, d.radius, d.phi));

  // 반지름 선분. 큰 원은 잘려 지름을 볼 수 없으므로, 이 선분이 남아
  // "이만큼 길어졌다" 를 대신한다. **숫자를 붙이지 않는다** — 선분의 길이가 값이다.
  out.push({
    type: 'trajectory',
    id: 'radius',
    points: [d.center, d.point],
    width: RADIUS_WIDTH_PX,
    opacity: RADIUS_OPACITY,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // 원의 중심 — 축폐선 위를 달린다. 작은 점이라 테두리도 후광도 두지 않는다.
  out.push({
    type: 'body',
    id: 'center',
    pos: d.center,
    shape: 'circle',
    size: CENTER_DOT,
    outline: 'none',
    glow: false,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // 달리는 점. 길과 원이 겹치는 자리에 놓이므로 바탕색 테두리로 제 경계를
  // 도려낸다.
  out.push({
    type: 'body',
    id: 'runner',
    pos: d.point,
    shape: 'circle',
    size: RUNNER_DOT,
    outline: 'background',
    glow: false,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  return out;
}

/**
 * **잘리는 것은 조각이 정한다.** 매 프레임 같은 고정값이라 카메라가 흔들리지
 * 않고, 가장 부푼 원이 화면을 넘치는 것이 그대로 남는다 (S-piece).
 */
export function boundsHint(): Bounds {
  return SCENE_BOUNDS;
}
