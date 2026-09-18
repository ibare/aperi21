// ========================================================================
// center-of-mass-motion — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 미리 그어 둔 포물선 · 질량 중심의 자취 · 두 덩어리의
// 자취(`trajectory`), 용수철(`constraint`), 두 덩어리와 질량 중심 점(`body`),
// 떼어 미는 힘 쌍(`vector`), 이름표(`readout`)가 모두 표준 어휘로 있다.
//
// 색: 두 덩어리와 용수철은 먹색(같은 물체의 두 몫), 두 덩어리의 자취는 무채색(배경
// 정보), 떼어 미는 힘 쌍은 보조색. 강조색은 **질량 중심 하나** — 점과 그 자취 — 에만
// 쓴다. 강조색이 점선 위를 덮어 가는 것 자체가 주장이다.
//
// 겹침 순서는 scene 에 쓴 순서다(`drawOrder: 'scene'`) — 질량 중심 점이 용수철과
// 덩어리 **위**에 와야 「둘 사이의 그 점」 으로 읽힌다.
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
import { centerOfMass, derive, flightTime, parabola, readConstants, type Reading } from './physics';
import {
  CM_RADIUS,
  HEAVY_RADIUS,
  LIGHT_RADIUS,
  PUSH_OPTIONS,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { CenterOfMassMotionState } from './state';

/**
 * 질량 중심 이름표 — 점을 따라다니지 않고 **자취가 시작하는 자리(던지는 곳)** 왼쪽에
 * 박아 둔다. 점 둘레 반 m 안은 두 덩어리가 도는 자리라 따라다니는 이름표는 덩어리를
 * 가린다. 점 · 자취 · 이름표가 같은 강조색이라 이름은 점에게 닿는다.
 */
const CM_LABEL_OFFSET: Vec2 = [-10, -2];
/** 가장 센 힘 화살표의 길이(월드). 힘은 세기에 비례하고, 두 화살표는 언제나 같은 길이다. */
const FORCE_FULL = 0.55;

export function scene(params: {
  state: CenterOfMassMotionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('center-of-mass-motion: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const push = params.state.push;
  const r: Reading = derive(timeline, c, push);
  const op = r.opacity;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const force = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  // ---- 던질 때 정해진 길 ----
  // 던진 순간의 자리 · 속도만으로 끝까지 정해진다. 처음부터 끝까지 미리 그어 둔다 —
  // 질량 중심이 그 위를 **나중에** 지나가야 「벗어나지 않는다」 가 보인다.
  // 이름표는 두지 않는다 — 캡션이 「던질 때 정해진 점선 포물선」 이라 부르고, 선 곁 어디에
  // 붙여도 갈라진 두 덩어리 · 그 둘을 잇는 점선이 한 번은 지나간다.
  const path = parabola(flightTime(timeline), c);
  g.push({
    type: 'trajectory',
    id: 'fixed-path',
    points: path,
    width: 1.5,
    opacity: op * 0.9,
    style: { ...muted, lineStyle: 'dashed' },
  });

  // ---- 두 덩어리의 자취 ----
  // 돌고 출렁이는 동안 고리를 그린다. 질량 중심의 매끈한 자취와 나란히 놓여야
  // 「속에서 무슨 일이 나든」 이 눈에 들어온다. 배경 정보라 가늘고 옅다.
  for (const [id, trail] of [
    ['heavy-trail', r.heavyTrail],
    ['light-trail', r.lightTrail],
  ] as const) {
    g.push({
      type: 'trajectory',
      id,
      points: trail,
      width: 1,
      opacity: op * 0.55,
      style: muted,
    });
  }

  // ---- 질량 중심의 자취 — 점선 위를 덮어 간다 ----
  g.push({
    type: 'trajectory',
    id: 'cm-trail',
    points: r.cmTrail,
    width: 2.5,
    opacity: op,
    style: accent,
  });

  // ---- 용수철 / 갈라진 뒤 둘을 잇는 선 ----
  if (r.joined) {
    g.push({
      type: 'constraint',
      id: 'spring',
      subtype: 'spring',
      from: r.heavy,
      to: r.light,
      coils: 5,
      opacity: op,
      style: ink,
    });
  } else {
    // 이어져 있지 않다. 그래도 질량 중심은 **둘을 잇는 선 위, 1 : 2 자리**에 있다 —
    // 떨어진 두 덩어리의 「가운데」 가 어디인지 가늠하게 하는 안내선이다.
    g.push({
      type: 'trajectory',
      id: 'pair-line',
      points: [r.heavy, r.light],
      width: 1,
      opacity: op * 0.8,
      style: { ...muted, lineStyle: 'dotted' },
    });
  }

  // ---- 두 덩어리 ----
  // 같은 물체의 두 몫이라 같은 먹색이다. 무게는 크기가 말한다 (넓이 2 : 1).
  g.push({
    type: 'body',
    id: 'heavy',
    pos: r.heavy,
    shape: 'circle',
    size: HEAVY_RADIUS,
    glow: false,
    opacity: op,
    style: ink,
  });
  g.push({
    type: 'body',
    id: 'light',
    pos: r.light,
    shape: 'circle',
    size: LIGHT_RADIUS,
    glow: false,
    opacity: op,
    style: ink,
  });

  // ---- 떼어 미는 힘 쌍 ----
  // 갈라지는 단계 동안만. 같은 길이, 반대 방향 — 둘을 더하면 0 이다. 미는 힘이 없는
  // 칩(「없음」)에서는 화살표도 없다.
  const pushing = timeline.phase === 'split' && push > 0;
  if (pushing) {
    const len = FORCE_FULL * (push / Math.max(...PUSH_OPTIONS));
    const d = r.pushDir;
    const fop = op * (1 - 0.7 * timeline.at('split'));
    g.push({
      type: 'vector',
      id: 'force-on-light',
      from: r.light,
      delta: [d[0] * len, d[1] * len],
      label: text('label.forceOnLight'),
      opacity: fop,
      style: force,
    });
    g.push({
      type: 'vector',
      id: 'force-on-heavy',
      from: r.heavy,
      delta: [-d[0] * len, -d[1] * len],
      label: text('label.forceOnHeavy'),
      opacity: fop,
      style: force,
    });
  }

  // ---- 질량 중심 ----
  // 강조색 점. 바탕색 테로 둘레를 떼어 용수철 · 자취 위에서도 제 점으로 읽힌다.
  g.push({
    type: 'body',
    id: 'cm',
    pos: r.cm,
    shape: 'circle',
    size: CM_RADIUS,
    glow: false,
    outline: 'background',
    opacity: op,
    style: accent,
  });
  g.push({
    type: 'readout',
    id: 'cm-name',
    anchor: { world: centerOfMass(0, c), offset: CM_LABEL_OFFSET },
    text: text('label.cm'),
    chip: false,
    font: 'text',
    fontSize: 12,
    align: 'right',
    opacity: op,
    style: accent,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
