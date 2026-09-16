// ========================================================================
// projectile-motion — 선언으로서의 장면
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 이 조각의 주장은 **물체 목록에 없다.** "세 공을 잇는 선이 수평이다" 는 물체들
// 사이의 관계이고, 화면에서 가장 중요한 요소가 그 관계선이다. 그래서 선은
// 물체에 딸린 장식이 아니라 제 몫의 선언으로 나온다 — 두 점짜리 `trajectory`.
//
// `dimension` 을 쓰지 않은 이유: 점선 + 끝점 원 + 얇은 선이 고정이라 "꿰는 굵은
// 선" 이 되지 않는다. 치수를 재는 그림이 아니라 셋이 한 줄에 있다는 그림이다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';

import { elapsed, posOf, splashAge, strobeTimes } from './physics';
import { BALL_R, GROUND_Y, MULTIPLIERS, SCENE_BOUNDS } from './schema';
import type { ProjectileMotionState } from './state';

/** 잔상 점의 반지름(화면 px). 원본 `ctx.arc(…, 3.1, …)`. */
const DOT_SIZE_PX = 3.1;
/** 잔상의 옅기. 원본 `rgba(43,43,51,0.24)`. */
const DOT_OPACITY = 0.24;

/** 지나간 높이선의 굵기(화면 px)와 옅기. 원본 `lineWidth 1` · `rgba(…,0.20)`. */
const RUNG_WIDTH_PX = 1;
const RUNG_OPACITY = 0.2;

/** 지금 높이선의 굵기(화면 px). 원본 `lineWidth 2`. */
const NOW_WIDTH_PX = 2;

/** 착지 파문 — 처음 반지름 · 퍼지는 끝 반지름 · 획 굵기(화면 px)와 처음 옅기. */
const SPLASH_SIZE_PX = 13;
const SPLASH_SPREAD_PX = 44;
const SPLASH_WIDTH_PX = 2;
const SPLASH_OPACITY = 0.6;
/** 파문이 사는 시간(초). 원본 SPLASH. */
const SPLASH_LIFE = 0.6;
/**
 * 파문이 도는 각도 범위 — 월드 x 축에서 반시계로 0 ~ π, 곧 **지면 위 반원**이다.
 * 온전한 원으로 그리면 땅 밑으로도 퍼진다.
 */
const SPLASH_ARC: readonly [number, number] = [0, Math.PI];

export function scene(params: {
  state: ProjectileMotionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('projectile-motion: schema.timeline 이 선언되어야 한다');

  const tau = elapsed(timeline);
  const v = state.v;
  const out: Primitive[] = [];

  /**
   * 사다리에 남은 기록. 빠르기를 다시 정하는 동안에는 비운다.
   *
   * 원본은 손잡이를 만질 때마다 다시 던지면서 잔상 목록을 비웠다. 여기서는
   * 시간표가 시계를 쥐고 있어 되돌릴 수 없으므로(NOTES 「어휘 부족」), **잡고
   * 있는 동안 기록을 비우는 쪽**만 옮겼다. 지나간 가로대가 새 빠르기로 다시
   * 그려져 있던 적 없는 과거를 주장하는 일은 그래서 일어나지 않는다.
   */
  const record = state.held ? [] : strobeTimes(tau);

  // ---- 지면 ----
  // 축이 아니라 사건의 무대다. 눈금은 없다 — 판정할 것은 "닿았다" 뿐이다.
  out.push({ type: 'surface', id: 'ground', geometry: { kind: 'ground', y: GROUND_Y } });

  // ---- 지나간 높이선 ----
  // 쌓이면 사다리가 된다. 세로 간격은 아래로 갈수록 벌어지는데 가로 간격은
  // 끝까지 일정하다 — 두 방향이 서로 다른 규칙으로, 서로를 건드리지 않고 간다.
  for (const s of record) {
    const rung: Trajectory = {
      type: 'trajectory',
      id: `rung-${s.toFixed(1)}`,
      points: [posOf(MULTIPLIERS[0]!, v, s), posOf(MULTIPLIERS[MULTIPLIERS.length - 1]!, v, s)],
      width: RUNG_WIDTH_PX,
      opacity: RUNG_OPACITY,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(rung);
  }

  // ---- 잔상 ----
  // 스트로브 사진이다. `age` 를 주지 않아 늙지 않는다 — 점 사이 간격이 곧
  // 속력이라 지우면 주장이 사라진다.
  const dots: Trace = {
    type: 'trace',
    id: 'strobe',
    marks: record.flatMap((s) => MULTIPLIERS.map((m) => ({ pos: posOf(m, v, s) }))),
    shape: 'dot',
    size: DOT_SIZE_PX,
    opacity: DOT_OPACITY,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(dots);

  // ---- 착지 파문 ----
  // 동시성은 한 순간의 사건이라 정지 화면으로는 잡히지 않는다. 퍼지는 반원이
  // 그 순간을 0.6 초 동안 붙들어 둔다. 처음 반지름을 공보다 크게 잡아야
  // 공에 가리지 않는다.
  const age = splashAge(timeline);
  if (age !== null) {
    const splash: Trace = {
      type: 'trace',
      id: 'splash',
      marks: MULTIPLIERS.map((m) => ({ pos: [posOf(m, v, tau)[0], GROUND_Y] as Vec2, age })),
      shape: 'ring',
      size: SPLASH_SIZE_PX,
      spreadTo: SPLASH_SPREAD_PX,
      arc: SPLASH_ARC,
      width: SPLASH_WIDTH_PX,
      life: SPLASH_LIFE,
      opacity: SPLASH_OPACITY,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(splash);
  }

  // ---- 지금 높이선 ----
  // 이 선분이 조각의 전부다. 두 성분이 독립이면 내려오는 내내 수평이고,
  // 독립이 깨지면 그 즉시 기울어진다. 유일한 강조색을 이 한 뜻에만 쓴다.
  const nowLine: Trajectory = {
    type: 'trajectory',
    id: 'level-now',
    points: [
      posOf(MULTIPLIERS[0]!, v, tau),
      posOf(MULTIPLIERS[MULTIPLIERS.length - 1]!, v, tau),
    ],
    width: NOW_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(nowLine);

  // ---- 공 ----
  // 셋은 같은 대상이라 같은 색·같은 크기다. 구분할 이름이 없으므로 범례도 없다.
  // 먹색으로 채우되 후광은 두지 않는다 — 번지면 세 원의 중심이 흐려지고,
  // 중심이 흐려지면 "같은 높이" 를 눈으로 판정할 수 없다.
  MULTIPLIERS.forEach((m, i) => {
    const ball: Body = {
      type: 'body',
      id: `ball-${i}`,
      pos: posOf(m, v, tau),
      shape: 'circle',
      size: BALL_R,
      fill: 'solid',
      outline: 'none',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(ball);
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 프레이밍. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
