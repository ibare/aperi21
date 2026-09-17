// ========================================================================
// net-force — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자리 점(trace) · 물체(body) · 세 힘(vector) ·
// 알짜힘(vector) 이 모두 표준 어휘다. 캡션은 선언의 캡션 슬롯이 그린다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { offset, positionAt, prepare, strobeDots } from './physics';
import {
  BODY_RADIUS,
  DOT_RADIUS_PX,
  FORCE_RECEDE,
  FORCE_WIDTH_PX,
  HEAD_SIZE,
  NET_WIDTH_PX,
  SCENE_BOUNDS,
} from './schema';
import type { NetForceState } from './state';

export function scene(params: {
  state: NetForceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('net-force: schema.timeline 이 선언되어야 한다');

  // 주기마다 조합을 바꾼다. 이동 시간은 풀려난 순간부터 주기 끝까지.
  const release = tl.start('move');
  const set = prepare(tl.cycle, tl.period - release);
  const tau = tl.u - release;
  const origin = positionAt(set, tau);

  // 다음 조합으로 넘어가기 전 전체가 흐려진다.
  const whole = 1 - tl.at('fade');
  const out: Primitive[] = [];

  // ---- 지나온 자리 점 ----
  const dots: Trace = {
    type: 'trace',
    id: 'strobe',
    marks: strobeDots(set, tau).map((pos) => ({ pos })),
    shape: 'dot',
    size: DOT_RADIUS_PX,
    opacity: whole,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(dots);

  // ---- 물체 ----
  const body: Body = {
    type: 'body',
    id: 'body',
    pos: origin,
    shape: 'circle',
    size: BODY_RADIUS,
    outline: 'none',
    glow: false,
    opacity: whole,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(body);

  // ---- 작용하는 세 힘 ----
  // 첫째는 제자리, 둘째·셋째는 앞 힘의 끝으로 미끄러져 간다. 알짜힘이 드러난
  // 뒤에는 색은 그대로 두고 진하기만 낮춰 물러난다.
  const [f1, f2, f3] = set.forces;
  const tails: Vec2[] = [
    origin,
    offset(origin, f1, tl.at('slide2')),
    offset(origin, offset(f1, f2), tl.at('slide3')),
  ];
  const back = 1 - FORCE_RECEDE * tl.at('grow');
  [f1, f2, f3].forEach((f, i) => {
    const arrow: Vector = {
      type: 'vector',
      id: `force-${i + 1}`,
      from: tails[i]!,
      delta: f,
      headSize: HEAD_SIZE,
      width: FORCE_WIDTH_PX,
      opacity: back * whole,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    };
    out.push(arrow);
  });

  // ---- 알짜힘 ----
  // 사슬의 처음에서 끝으로 뻗어 나온다. 강조색은 이것 하나에만.
  const g = tl.at('grow');
  if (g > 0) {
    const net: Vector = {
      type: 'vector',
      id: 'net',
      from: origin,
      delta: [set.net[0] * g, set.net[1] * g],
      headSize: HEAD_SIZE,
      width: NET_WIDTH_PX,
      opacity: whole,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(net);
  }

  return out;
}

/** 고정 경계. 1 N = 1.6 px 가 되도록 잡았다 (`SCENE_BOUNDS`). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
