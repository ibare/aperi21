// ========================================================================
// inverse-square-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 알갱이(particleSystem) ·
// 구껍질 둘레와 창(trajectory) · 점 광원(body) · 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 알갱이는 모두 같은 대상이라 한 색(secondary), **강조색은
// 「기준 거리에서 창 하나에 들었던 몫」 한 가지 뜻에만** 쓴다. 창은 재는 틀이라 먹색,
// 지나온 둘레 · 반지름 이름표는 배경 정보라 muted.
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
import { grainDirections, growLegs, readConstants, readShell, sceneOpacity } from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { InverseSquareLawState } from './state';

/** 알갱이 반지름(화면 px). 3r 에서 창 안 넷이 또렷하고, r 에서 36 개가 뭉개지지 않는 크기. */
const GRAIN_PX = 2.3;
/** 원판 둘레 알갱이의 짙기 — 가운데(1)에서 둘레로 옅어져 평판이 아니라 공으로 읽힌다. */
const RIM_OPACITY = 0.35;
/** 퍼지는 동안의 꼬리 — 알갱이가 **나가고 있다** 는 것이 멈춘 화면과 갈린다. */
const TRAIL = { seconds: 0.22, width: 1.2, opacity: 0.45 } as const;
/** 둘레 원을 긋는 표본 수. */
const RING_SAMPLES = 120;
/** 지나온 둘레 · 지금 둘레의 굵기(화면 px). 안내선이라 가늘게. */
const RING_WIDTH = 1;
const RING_OPACITY = 0.55;
/** 창 테두리 굵기(화면 px). 재는 틀이 알갱이 사이에서 읽히게. */
const WINDOW_WIDTH = 1.8;
/** 반지름 이름표가 둘레에 붙는 방향(라디안) — 오른쪽 아래. 창 · 몫 이름표와 멀다. */
const RING_LABEL_ANGLE = -0.62;
/** 반지름 이름표를 둘레 밖으로 띄우는 거리(화면 px). */
const RING_LABEL_OFFSET: Vec2 = [14, 10];
/** 몫 이름표 — 창 오른쪽 위 모서리 바깥. */
const SHARE_LABEL_OFFSET: Vec2 = [20, -12];
const LABEL_PX = 12;
/** 몫 이름표 글자 크기(화면 px) — 본 이름표보다 한 단 크게. */
const SHARE_LABEL_PX = 13;
/** 점 광원의 크기(월드). 터지는 동안만 보인다. */
const SOURCE_SIZE = 0.09;
/** 멈춘 반지름으로 볼 여유 — 배수가 반지름에 도달했는가. */
const REACHED_EPS = 1e-6;

function circle(radius: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < RING_SAMPLES; i++) {
    const a = (i / RING_SAMPLES) * Math.PI * 2;
    out.push([radius * Math.cos(a), radius * Math.sin(a)]);
  }
  return out;
}

export function scene(params: {
  state: InverseSquareLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('inverse-square-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const shell = readShell(timeline, c);
  const R = shell.scale * c.radius;
  const out: Primitive[] = [];

  // ---- 둘레 — 지나온 거리와 지금 거리 ----
  // 멈췄던 반지름마다 점선 둘레가 남는다. 자란 원판 안에 r · 2r 둘레가 겹쳐 보여야
  // 「거리가 두 배 · 세 배」 가 둘레의 크기로 읽힌다.
  const legs = growLegs(c);
  legs.forEach((leg, i) => {
    const reached = shell.scale >= leg.to - REACHED_EPS;
    if (!reached) return;
    const isCurrent = Math.abs(shell.scale - leg.to) < REACHED_EPS;
    if (!isCurrent) {
      out.push({
        type: 'trajectory',
        id: `ring-${i + 1}`,
        points: circle(leg.to * c.radius),
        closed: true,
        width: RING_WIDTH,
        opacity: RING_OPACITY * alpha,
        style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
      });
    }
  });
  if (R > 0) {
    out.push({
      type: 'trajectory',
      id: 'shell-rim',
      points: circle(R),
      closed: true,
      width: RING_WIDTH,
      opacity: RING_OPACITY * alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 알갱이 ----
  // 자리 = 제 방향 × R. 방향이 바뀌지 않으므로 퍼지는 동안의 속도는 방향 × 빠르기다.
  const grains = grainDirections(c);
  const speed = shell.rate * c.radius;
  const groups: { id: string; tagged: boolean; role: 'secondary' | 'accent' }[] = [
    { id: 'grains', tagged: false, role: 'secondary' },
    { id: 'grains-window', tagged: true, role: 'accent' },
  ];
  for (const g of groups) {
    const members = grains.filter((d) => d.tagged === g.tagged);
    out.push({
      type: 'particleSystem',
      id: g.id,
      positions: members.map((d) => [d.p[0] * R, d.p[1] * R] as Vec2),
      velocities: members.map((d) => [d.p[0] * speed, d.p[1] * speed] as Vec2),
      opacities: members.map((d) => RIM_OPACITY + (1 - RIM_OPACITY) * d.depth),
      sizes: GRAIN_PX,
      trail: speed > 0,
      trailStyle: TRAIL,
      opacity: alpha,
      style: { colorRole: g.role, emphasis: 'strong' },
    });
  }

  // ---- 점 광원 — 터지는 동안만 ----
  const sourceAlpha = 1 - timeline.at('grow1');
  if (sourceAlpha > 0) {
    out.push({
      type: 'body',
      id: 'source',
      pos: [0, 0],
      shape: 'circle',
      size: SOURCE_SIZE,
      outline: 'none',
      opacity: sourceAlpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 고정 창 ----
  // 크기가 늘 같다. 구껍질이 커질수록 같은 창이 덮는 몫이 작아진다 — 그것이 주장이다.
  const w = (c.windowSide * c.radius) / 2;
  out.push({
    type: 'trajectory',
    id: 'window',
    points: [
      [-w, -w],
      [w, -w],
      [w, w],
      [-w, w],
    ],
    closed: true,
    width: WINDOW_WIDTH,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 이름표 ----
  // 반지름 이름표는 도달한 둘레마다 붙는다. 배수는 스테이지 상수 그대로 끼운다.
  const multiples = legs.map((leg) => leg.to);
  multiples.forEach((m, i) => {
    if (shell.scale < m - REACHED_EPS) return;
    const r = m * c.radius;
    out.push({
      type: 'readout',
      id: `radius-label-${i + 1}`,
      anchor: {
        world: [r * Math.cos(RING_LABEL_ANGLE), r * Math.sin(RING_LABEL_ANGLE)],
        offset: RING_LABEL_OFFSET,
      },
      text: i === 0 ? text('label.radiusBase') : text('label.radiusScaled'),
      vars: i === 0 ? undefined : { n: String(m) },
      chip: true,
      italic: true,
      fontSize: LABEL_PX,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  });

  // 몫 이름표는 구껍질이 멈춘 동안에만 — 자라는 동안에는 창 안 수가 바뀌는 중이다.
  const holds: { phase: string; multiple: number }[] = [
    { phase: 'hold1', multiple: 1 },
    { phase: 'hold2', multiple: c.multiple2 },
    { phase: 'hold3', multiple: c.multiple3 },
    { phase: 'fade', multiple: c.multiple3 },
  ];
  const hold = holds.find((h) => h.phase === timeline.phase);
  if (hold) {
    out.push({
      type: 'readout',
      id: 'share-label',
      anchor: { world: [w, w], offset: SHARE_LABEL_OFFSET },
      text: hold.multiple === 1 ? text('label.shareBase') : text('label.shareScaled'),
      vars: hold.multiple === 1 ? undefined : { n: String(hold.multiple) },
      chip: true,
      fontSize: SHARE_LABEL_PX,
      weight: 'bold',
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
