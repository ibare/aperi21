// ========================================================================
// field-lines — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 떠밀리는 알갱이 950개 → 알갱이마다 두 점 `trajectory`(꼬리). 수명 페이드는 `opacity`.
// - 전기력선 24가닥 → `trajectory`. 매 프레임 음전하 자리에서 다시 추적한다.
// - 양전하 → `body` 원 + 바탕색 십자(`region` opaque).
// - 음전하 → 바탕색 원(`region` opaque) + 먹색 고리 · 가로선(`trajectory`).
//
// 원본이 손으로 긋던 것과 다른 자리는 NOTES.md 「원본과 달라진 점」 · 「어휘 부족」.
// ========================================================================

import type {
  Body,
  Bounds,
  Primitive,
  Region,
  SceneGraph,
  Trajectory,
  Vec2,
} from '@aperi21/schema';
import { grainVelocity, toWorld, traceFieldLines } from './physics';
import { GRAINS, PLUS, STAGE } from './schema';
import type { FieldLinesState } from './state';

/** 전기력선 굵기(화면 px)와 불투명도. */
const LINE_WIDTH = 1.15;
const LINE_OPACITY = 0.9;
/** 양전하 반지름 · 십자 반길이 · 십자 굵기(px). */
const PLUS_R = 11;
const PLUS_ARM = 5;
const PLUS_STROKE = 2;
/** 음전하 반지름 · 가로선 반길이 · 테두리 굵기(px). */
const MINUS_R = 9;
const MINUS_ARM = 4.5;
const MINUS_STROKE = 2;
/** 원을 다각형으로 표본하는 개수. */
const CIRCLE_SAMPLES = 40;
/** 알갱이 꼬리 굵기(화면 px). 둥근 끝이라 길이 0 이면 반지름 0.8 의 점이 된다 — 원본의 점과 같다. */
const GRAIN_WIDTH = 1.6;
/** 꼬리가 이보다 짧으면 점으로 그린다(px) — 원본 그대로. */
const DOT_BELOW = 1.2;
/** 캡션 띠(px). 원본 figcaption 이 캔버스 아래 따로 있던 자리다. */
const CAPTION_BAND = 40;

/** 원본 캔버스 사각형. 선과 알갱이는 이 밖으로 나가지 않는다 — 캡션 띠를 밟지 않게. */
const STAGE_CLIP = { min: [0, 0] as Vec2, max: [STAGE.width, STAGE.height] as Vec2 };

function circle(cx: number, cy: number, r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < CIRCLE_SAMPLES; i++) {
    const a = (2 * Math.PI * i) / CIRCLE_SAMPLES;
    pts.push(toWorld(cx + r * Math.cos(a), cy + r * Math.sin(a)));
  }
  return pts;
}

function rect(cx: number, cy: number, w: number, h: number): Vec2[] {
  return [
    toWorld(cx - w / 2, cy - h / 2),
    toWorld(cx + w / 2, cy - h / 2),
    toWorld(cx + w / 2, cy + h / 2),
    toWorld(cx - w / 2, cy + h / 2),
  ];
}

/** 바탕색을 불투명하게 깐다 — 종이색 칠. */
function paper(id: string, points: Vec2[]): Region {
  return { type: 'region', id, points, opaque: true, fillOpacity: 0, style: { colorRole: 'ink' } };
}

export function scene(params: { state: FieldLinesState }): SceneGraph {
  const { state } = params;
  const { minus } = state;
  const out: Primitive[] = [];

  // ---- 떠밀리는 알갱이 ----
  // 빠르기가 곧 그 자리의 세기다. 꼬리 길이로 빠르기를 새겨 정지 화면에서도 읽힌다.
  //
  // 알갱이 하나가 두 점짜리 `trajectory` 하나다. 무리 어휘 `particleSystem` 은 꼬리의
  // 알파(0.3) · 굵기(1px) · 길이(속도 × 0.085초)가 고정이고 입자마다 알파가 없으며
  // 머리 점을 늘 짙게 찍어, 빠른 꼬리는 사라지고 느린 점이 더 짙게 남았다 — 주장이
  // 뒤집혀 보였다 (NOTES.md 「어휘 부족」).
  state.grains.forEach((g, i) => {
    const fadeIn = Math.min(1, g.age / GRAINS.fade);
    const fadeOut = Math.min(1, (g.life - g.age) / GRAINS.fade);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
    if (alpha <= 0) return;
    const { vx, vy } = grainVelocity(minus, g.x, g.y);
    const s = Math.hypot(vx, vy) || 1;
    const len = Math.min(GRAINS.streakMax, Math.hypot(vx, vy) * GRAINS.streakTime);
    const head = toWorld(g.x, g.y);
    const tail = len < DOT_BELOW ? head : toWorld(g.x - (vx / s) * len, g.y - (vy / s) * len);
    const streak: Trajectory = {
      type: 'trajectory',
      id: `grain-${i}`,
      points: [tail, head],
      width: GRAIN_WIDTH,
      opacity: GRAINS.alpha * alpha,
      clip: STAGE_CLIP,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(streak);
  });

  // ---- 전기력선 ----
  // 방향 화살촉은 두지 않는다 — 방향은 알갱이 흐름이 보여 주고, 주장은 촘촘함이다.
  traceFieldLines(minus).forEach((pts, i) => {
    const line: Trajectory = {
      type: 'trajectory',
      id: `field-line-${i}`,
      points: pts.map((p) => toWorld(p.x, p.y)),
      width: LINE_WIDTH,
      opacity: LINE_OPACITY,
      clip: STAGE_CLIP,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(line);
  });

  // ---- 양전하 ----
  const plus: Body = {
    type: 'body',
    id: 'plus',
    pos: toWorld(PLUS.x, PLUS.y),
    shape: 'circle',
    size: PLUS_R,
    fill: 'solid',
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(plus);
  out.push(paper('plus-bar-h', rect(PLUS.x, PLUS.y, PLUS_ARM * 2, PLUS_STROKE)));
  out.push(paper('plus-bar-v', rect(PLUS.x, PLUS.y, PLUS_STROKE, PLUS_ARM * 2)));

  // ---- 음전하 ----
  out.push(paper('minus-face', circle(minus.x, minus.y, MINUS_R)));
  const ring: Trajectory = {
    type: 'trajectory',
    id: 'minus-ring',
    points: circle(minus.x, minus.y, MINUS_R),
    closed: true,
    width: MINUS_STROKE,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(ring);
  const bar: Trajectory = {
    type: 'trajectory',
    id: 'minus-bar',
    points: [toWorld(minus.x - MINUS_ARM, minus.y), toWorld(minus.x + MINUS_ARM, minus.y)],
    width: MINUS_STROKE,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(bar);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). id 'caption' 을 두지 않는다.
  return out;
}

/** 고정 경계 — 원본 캔버스 그대로에 아래 캡션 띠를 더한다. 매 프레임 같은 값 (S-piece). */
export function boundsHint(): Bounds {
  return { minX: 0, maxX: STAGE.width, minY: -CAPTION_BAND, maxY: STAGE.height };
}
