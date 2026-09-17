// ========================================================================
// vertical-throw — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 공(body) · 섬광 도장(body 둘 + vector) · 거울 사본(body 둘 + vector) ·
// 짝 잇는 점선(trajectory) · 땅(trajectory) 이 모두 표준 어휘로 있다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { heightAt, readConstants, stampTimes, velocityAt } from './physics';
import {
  ARROW_M_PER_MS,
  BALL_R,
  COL_GAP,
  GROUND,
  LINK_FADE_IN,
  LINK_INSET,
  LINK_OPACITY,
  MIRROR,
  MIRROR_FADE_FROM,
  MIRROR_OPACITY,
  SCENE_BOUNDS,
  SLIDE,
  STAMP_FILL_OPACITY,
  STAMP_R,
} from './schema';
import type { VerticalThrowState } from './state';

/** 안내선 굵기(화면 px). 땅은 원본 1.5, 짝 잇는 점선은 1. */
const GROUND_WIDTH_PX = 1.5;
const LINK_WIDTH_PX = 1;
/** 원본의 경계 비교 여유. 부동소수 섬광 시각이 T_TOP 에 닿는지 가른다. */
const EPS = 1e-9;

/**
 * 섬광 도장 — 반투명 채움 + 또렷한 테두리. `opacity` 가 인스턴스 전체에 걸리므로
 * 채움과 테두리를 body 둘로 겹친다.
 */
function stamp(id: string, pos: Vec2, alpha: number): Body[] {
  return [
    {
      type: 'body',
      id: `${id}-fill`,
      pos,
      shape: 'circle',
      size: STAMP_R,
      glow: false,
      outline: 'none',
      opacity: alpha * STAMP_FILL_OPACITY,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    },
    {
      type: 'body',
      id: `${id}-ring`,
      pos,
      shape: 'circle',
      size: STAMP_R,
      fill: 'none',
      outline: 'role',
      opacity: alpha,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    },
  ];
}

/** 속도 화살표 — 위가 +. 척도는 조각 전체에서 하나다. */
function velocityArrow(id: string, from: Vec2, v: number, alpha: number): Vector {
  return {
    type: 'vector',
    id,
    from,
    delta: [0, v * ARROW_M_PER_MS],
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: VerticalThrowState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('vertical-throw: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const tFlight = tl.duration('flight');
  const tTop = tFlight / 2;
  const f0 = tl.start('flight');
  /** 던진 뒤 흐른 시간 — 받은 뒤에는 체공 시간에 멈춘다. */
  const s = tl.at('flight') * tFlight;
  /** 이번 주기 안에서 던진 뒤 흐른 시간(멈추지 않는다). 도장 시차 출발의 기준. */
  const since = tl.u - f0;
  const fade = 1 - tl.at('fade');
  const times = stampTimes(tFlight);
  const out: Primitive[] = [];

  // ---- 땅 ----
  const reach = COL_GAP + GROUND.overhang;
  out.push({
    type: 'trajectory',
    id: 'ground',
    points: [
      [-reach, GROUND.y],
      [reach, GROUND.y],
    ],
    width: GROUND_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 같은 높이 잇는 점선 — 거울 사본이 포개진 뒤에만 ----
  for (const ts of times) {
    if (ts <= tTop + EPS) continue;
    const from = ts + SLIDE + MIRROR;
    if (since < from) continue;
    const appear = tl.span(f0 + from, f0 + from + LINK_FADE_IN);
    const yy = heightAt(c, ts);
    out.push({
      type: 'trajectory',
      id: `link-${ts}`,
      points: [
        [-COL_GAP + LINK_INSET, yy],
        [COL_GAP - LINK_INSET, yy],
      ],
      width: LINK_WIDTH_PX,
      opacity: fade * appear * LINK_OPACITY,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 섬광 도장 — 올라갈 때는 왼쪽, 내려올 때는 오른쪽 칸으로 밀려난다 ----
  const slid = (ts: number, side: -1 | 1, tag: string): void => {
    const u = tl.span(f0 + ts, f0 + ts + SLIDE, 'smooth');
    const pos: Vec2 = [side * COL_GAP * u, heightAt(c, ts)];
    out.push(...stamp(`${tag}-${ts}`, pos, fade));
    out.push(velocityArrow(`${tag}-${ts}-v`, pos, velocityAt(c, ts), fade));
  };
  for (const ts of times) {
    if (ts >= tTop - EPS || since < ts) continue;
    slid(ts, -1, 'up');
  }

  // 꼭대기 — 속도 0 이라 화살표가 없다.
  if (since >= tTop) out.push(...stamp('top', [0, heightAt(c, tTop)], fade));

  for (const ts of times) {
    if (ts <= tTop + EPS || since < ts) continue;
    slid(ts, 1, 'down');
  }

  // ---- 거울 사본 — 올라갈 때 도장의 화살표가 뒤집히며 건너가 내려올 때 도장에 포개진다 ----
  for (const ts of times) {
    if (ts <= tTop + EPS) continue;
    const from = ts + SLIDE;
    if (since < from || since > from + MIRROR) continue;
    const u = tl.span(f0 + from, f0 + from + MIRROR, 'smooth');
    const twin = tFlight - ts; // 같은 높이의 올라갈 때 섬광 시각
    const pos: Vec2 = [-COL_GAP + 2 * COL_GAP * u, heightAt(c, twin)];
    const flipped = velocityAt(c, twin) * Math.cos(Math.PI * u); // +v → −v
    const alpha =
      fade *
      (u < MIRROR_FADE_FROM
        ? MIRROR_OPACITY
        : MIRROR_OPACITY * (1 - (u - MIRROR_FADE_FROM) / (1 - MIRROR_FADE_FROM)));
    out.push(...stamp(`mirror-${ts}`, pos, alpha));
    out.push(velocityArrow(`mirror-${ts}-v`, pos, flipped, alpha));
  }

  // ---- 공 — 가운데 칸에서 곧게 오르내린다 ----
  const ballY = Math.max(0, heightAt(c, s));
  out.push({
    type: 'body',
    id: 'ball',
    pos: [0, ballY],
    shape: 'circle',
    size: BALL_R,
    glow: false,
    outline: 'none',
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });
  if (tl.phase === 'flight') out.push(velocityArrow('ball-v', [0, ballY], velocityAt(c, s), 1));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 배율이 원본(최고점 234px)과 같아야 화살표 척도가 같다.
  return { ...SCENE_BOUNDS };
}
