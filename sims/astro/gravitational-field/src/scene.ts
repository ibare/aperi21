// ========================================================================
// gravitational-field — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 행성 · 시험 질량(body) ·
// 장 화살표 · 받는 화살표(vector) · 지나온 길(trajectory)이 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 행성은 배경 쪽 회색(muted), 시험 질량은 먹색(ink), 깔린 장
// 화살표는 secondary, **강조색은 「시험 질량이 지금 받는 화살표」 한 가지 뜻에만** 쓴다.
// 받는 화살표와 깔린 화살표는 같은 함수(`fieldArrow`)로 길이 · 방향을 얻는다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  ViewDef,
} from '@aperi21/schema';
import { fallElapsed, fieldArrow, gridSpots, probeAt, probeOpacity, readConstants } from './physics';
import { SCENE_BOUNDS } from './schema';
import type { GravitationalFieldState } from './state';

/** 깔린 장 화살표의 굵기(화면 px). 받는 화살표(테마의 굵은 선)보다 가늘어 위계가 갈린다. */
const FIELD_ARROW_WIDTH = 1.5;
/** 지나온 길 점선의 굵기(화면 px). 안내선이라 가늘다. */
const TRAIL_WIDTH = 1;

export function scene(params: {
  state: GravitationalFieldState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const out: Primitive[] = [];

  // 1. 행성 — 장의 원천. 배경 쪽 회색 원, 후광 없음.
  out.push({
    type: 'body',
    id: 'planet',
    pos: [0, 0],
    shape: 'circle',
    size: c.planetRadius,
    glow: false,
    outline: 'none',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  const shown = probeOpacity(tl);
  const s = fallElapsed(tl);
  const probes = c.probes.map((start) => ({ start, ...probeAt(start, s, c) }));

  // 2. 지나온 길 — 놓인 자리에서 지금 자리까지. 격자 화살표 아래에 깔린다.
  probes.forEach((p, i) => {
    if (s <= 0 || shown <= 0) return;
    out.push({
      type: 'trajectory',
      id: `trail-${i}`,
      points: [p.start, p.pos],
      width: TRAIL_WIDTH,
      opacity: shown,
      style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dotted' },
    });
  });

  // 3. 깔린 장 — 모든 자리의 화살표. 질량이 오든 떠나든 그대로다.
  gridSpots(c).forEach((spot, i) => {
    out.push({
      type: 'vector',
      id: `field-${i}`,
      from: spot,
      delta: fieldArrow(spot, c),
      width: FIELD_ARROW_WIDTH,
      style: { colorRole: 'secondary', emphasis: 'medium' },
    });
  });

  if (shown <= 0) return out;

  // 4. 받는 화살표 — 시험 질량이 **지금 자리**에서 받는 화살표. 놓인 순간에는 그 자리의
  //    깔린 화살표와 꼭 겹친다. 표면에 닿으면 거둔다(떨어지는 동안의 이야기다).
  probes.forEach((p, i) => {
    if (p.landed) return;
    out.push({
      type: 'vector',
      id: `pull-${i}`,
      from: p.pos,
      delta: fieldArrow(p.pos, c),
      outline: 'background',
      opacity: shown,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  });

  // 5. 시험 질량 — 작은 먹색 공. 화살표 꼬리 위에 얹혀 「이 자리」 를 가리킨다.
  probes.forEach((p, i) => {
    out.push({
      type: 'body',
      id: `probe-${i}`,
      pos: p.pos,
      shape: 'circle',
      size: c.probeRadius,
      glow: false,
      outline: 'background',
      opacity: shown,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  });

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
