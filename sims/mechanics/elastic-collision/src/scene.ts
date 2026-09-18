// ========================================================================
// elastic-collision — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 화면에 있는 것은 레일 · 같은 공 둘 · 공 아래 질량 표식 · 공 위 속도 화살표뿐이다.
// 화살표의 길이가 빠르기이고, 그 위 이름표(`v` · `½v`)가 **어느 속도인지** 를 말한다.
// 충돌 뒤 이름표가 주인을 바꿔 달고 있는 것이 이 조각의 주장이다.
//
// 색은 두 가지 뜻만 쓴다 — 물체(먹색)와 속도(주 색). 두 공은 같은 질량이라 같은
// 색 · 같은 크기다. 공을 색으로 가르면 「다른 공」 으로 읽혀 전제(같은 질량)가 흐려진다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LocalizedText,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  episodeOf,
  pairAt,
  readConstants,
  revealOf,
  type BallNow,
  type ElasticCollisionConstants,
} from './physics';
import {
  ARROW_PER_SPEED,
  ARROW_Y,
  BALL_R,
  RAIL_Y,
  SCENE_BOUNDS,
  text,
  type EpisodeDef,
} from './schema';
import type { ElasticCollisionState } from './state';

/** 레일 굵기(화면 px). 바닥은 안내선이라 가늘다. */
const RAIL_WIDTH_PX = 1.2;
/** 질량 표식이 레일 아래로 내려가는 거리(화면 px). */
const MASS_LABEL_OFFSET: Vec2 = [0, 16];
/** 표식 글자 크기(화면 px). */
const LABEL_FONT_PX = 14;
/** 빠르기 이름표가 화살표 가운데에서 위로 뜨는 거리(화면 px). */
const SPEED_LABEL_OFFSET: Vec2 = [0, -12];
/** 이보다 짧은 화살표(월드)는 두지 않는다 — 멈춘 공에 점 같은 촉이 남지 않게. */
const MIN_ARROW = 0.02;
/** 이름표를 고르는 문턱 — 지금 속도가 처음 속도 하나와 이만큼 가까우면 그 이름을 단다. */
const LABEL_MATCH = 1e-6;

/**
 * 지금 속도에 붙일 이름표. 처음 속도 둘 중 **값이 같은 쪽**의 이름을 단다.
 *
 * 충돌 뒤 「A 는 B 의 이름을 단다」 로 바꿔 쓰지 않는다 — 그러면 주장을 코드가 대신
 * 말한다. 값으로 고르므로 저작자가 질량을 바꿔 통째로 주고받지 않게 되면 이름표가
 * 거짓말을 하는 대신 사라진다.
 */
function labelFor(
  v: number,
  ep: EpisodeDef,
  c: ElasticCollisionConstants,
): LocalizedText | undefined {
  if (ep.labelA && Math.abs(v - c.units[ep.unitsA] * c.speed) < LABEL_MATCH) return text(ep.labelA);
  if (ep.labelB && Math.abs(v - c.units[ep.unitsB] * c.speed) < LABEL_MATCH) return text(ep.labelB);
  return undefined;
}

export function scene(params: {
  state: ElasticCollisionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) {
    throw new Error('elastic-collision: schema.timeline 이 선언되어야 한다');
  }
  const c = readConstants(stage);
  const ep = episodeOf(timeline.phase);
  const pair = pairAt(timeline, ep, c);
  const reveal = revealOf(timeline, ep);

  const g: Primitive[] = [];

  // ── 레일 ──
  // 나타나고 사라지는 것은 공과 화살표다. 레일은 늘 같은 자리에 있어야 갈아 끼우는
  // 순간이 깜빡이지 않는다.
  g.push({
    type: 'trajectory',
    id: 'rail',
    points: [
      [SCENE_BOUNDS.minX, RAIL_Y],
      [SCENE_BOUNDS.maxX, RAIL_Y],
    ],
    width: RAIL_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  const balls: readonly [string, BallNow][] = [
    ['a', pair.a],
    ['b', pair.b],
  ];

  for (const [id, ball] of balls) {
    // ── 공 ── 같은 질량이라 같은 크기 · 같은 색. 후광은 끈다 — 먹색 공에 번짐이
    // 붙으면 맞닿는 순간의 겹침이 흐려진다.
    g.push({
      type: 'body',
      id: `ball-${id}`,
      pos: [ball.x, RAIL_Y + BALL_R],
      shape: 'circle',
      size: BALL_R,
      glow: false,
      opacity: reveal,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ── 질량 표식 ── 「같은 질량」 이 이 조각의 조건이라 둘 다 같은 글자를 단다.
    g.push({
      type: 'readout',
      id: `mass-${id}`,
      anchor: { world: [ball.x, RAIL_Y], offset: MASS_LABEL_OFFSET },
      text: text('label.mass'),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: LABEL_FONT_PX,
      align: 'center',
      opacity: reveal,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // ── 속도 화살표 ── 공 중심 위에서 나가고, 길이가 빠르기다.
    const len = ball.v * ARROW_PER_SPEED;
    if (Math.abs(len) < MIN_ARROW) continue;
    g.push({
      type: 'vector',
      id: `velocity-${id}`,
      from: [ball.x, ARROW_Y],
      delta: [len, 0],
      opacity: reveal,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });

    // ── 빠르기 이름표 ── 화살표 가운데 위. `vector.label` 은 글자 크기를 고를 수 없어
    // `½v` 가 뭉개진다 (장부 G17) — 질량 표식과 같은 글꼴의 readout 으로 단다.
    // 맞닿은 동안에는 값이 계속 바뀌므로 달지 않는다 — 줄어드는 화살표에 `v` 가 붙어
    // 있으면 틀린다.
    const name = pair.phase === 'contact' ? undefined : labelFor(ball.v, ep, c);
    if (name) {
      g.push({
        type: 'readout',
        id: `speed-${id}`,
        anchor: { world: [ball.x + len / 2, ARROW_Y], offset: SPEED_LABEL_OFFSET },
        text: name,
        chip: false,
        font: 'text',
        italic: true,
        fontSize: LABEL_FONT_PX,
        align: 'center',
        opacity: reveal,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이다 — 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
