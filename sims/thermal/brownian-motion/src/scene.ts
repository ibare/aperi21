// ========================================================================
// brownian-motion — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽 판은 보통 배율이다 — 물과 알갱이 점, 그 뒤로 끌리는 자취뿐이고 분자는 없다.
// 오른쪽 창은 알갱이 둘레의 확대다 — 창 안에서만 분자가 보인다(`clip`).
//
// 색은 뜻마다 하나다. 알갱이는 두 판에서 같은 색(같은 알갱이다), 분자는 muted,
// **강조색은 「알갱이가 맞았다」 한 뜻에만** — 충돌 섬광 · kick 칸에서 맞은 자리 ·
// 그 충돌들이 준 순 충격 화살표. 화살표가 같은 색인 것은 같은 충돌들의 합이기 때문이다.
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
import {
  moleculeAt,
  positionAt,
  readConstants,
  sampleAt,
  sampleCount,
  sampleTime,
  trackAt,
  walkCycle,
} from './physics';
import { LABEL_Y, PLAIN, PLAIN_GRAIN_R, SCENE_BOUNDS, ZOOM, text } from './schema';
import type { BrownianMotionState } from './state';

/** 판 테두리 굵기는 region 이 테마로 정한다. 물의 옅은 칠. */
const WATER_FILL_OPACITY = 0.07;
/** 자취 굵기(화면 px). */
const TRAIL_WIDTH_PX = 1.5;
/** 확대 표시 사각형 · 이음선 굵기(화면 px) · 짙기. */
const GUIDE_WIDTH_PX = 1;
const GUIDE_OPACITY = 0.6;
/** 분자 점 반지름(화면 px) · 꼬리 모양. */
const MOLECULE_PX = 3;
const MOLECULE_TRAIL = { seconds: 0.06, width: 1.5, opacity: 0.45 } as const;
/** 분자를 창에 그리는 시간 — 맞기 전후 이만큼(초). 창 밖에서 들어와 창 밖으로 나간다. */
const MOLECULE_LIFE = 0.5;
/** 분자 반지름(월드). 분자 중심이 알갱이 표면에서 이만큼 떨어진 자리에서 맞는다. */
const MOLECULE_R = 0.06;
/** 충돌 섬광 — 반지름(화면 px) · 퍼지는 끝 · 수명(초) · 굵기(화면 px). */
const FLASH_FROM_PX = 3;
const FLASH_TO_PX = 11;
const FLASH_LIFE = 0.3;
const FLASH_WIDTH_PX = 1.5;
/** kick 칸에서 맞은 자리 점 — 표면 바깥으로 띄우는 거리(월드) · 반지름(화면 px). */
const KICK_MARK_GAP = 0.14;
const KICK_MARK_PX = 3.5;
/** 많이 맞은 쪽과 적게 맞은 쪽을 가르는 선 — 반지름에 대한 길이 비 · 굵기(화면 px) · 짙기. */
const DIVIDE_SHARE = 1.45;
const DIVIDE_WIDTH_PX = 1;
const DIVIDE_OPACITY = 0.7;
/** kick 시작 순간 알갱이 자리의 잔상 — 점선 원의 표본 수 · 굵기(화면 px) · 짙기. */
const GHOST_SEGMENTS = 64;
const GHOST_WIDTH_PX = 1.5;
const GHOST_OPACITY = 0.8;
/** 순 충격 화살표 굵기(화면 px). */
const ARROW_WIDTH_PX = 3;
/** 판 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;

const PLAIN_CENTER: Vec2 = [(PLAIN.minX + PLAIN.maxX) / 2, (PLAIN.minY + PLAIN.maxY) / 2];
const ZOOM_CENTER: Vec2 = [(ZOOM.minX + ZOOM.maxX) / 2, (ZOOM.minY + ZOOM.maxY) / 2];
const ZOOM_CLIP = { min: [ZOOM.minX, ZOOM.minY] as Vec2, max: [ZOOM.maxX, ZOOM.maxY] as Vec2 };
const PLAIN_CLIP = { min: [PLAIN.minX, PLAIN.minY] as Vec2, max: [PLAIN.maxX, PLAIN.maxY] as Vec2 };

function box(b: { minX: number; maxX: number; minY: number; maxY: number }): Vec2[] {
  return [
    [b.minX, b.minY],
    [b.maxX, b.minY],
    [b.maxX, b.maxY],
    [b.minX, b.maxY],
  ];
}

export function scene(params: {
  state: BrownianMotionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('brownian-motion: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  const kickFrom = tl.start('kick');
  const kickTo = tl.end('kick');
  const checkTo = tl.end('push');
  const walk = walkCycle(c, tl.cycle, tl.period, kickFrom, kickTo, checkTo);
  const u = tl.u;
  const pos = positionAt(walk, u);

  /** 확대 창 — 열리며 짙어지고 닫히며 흐려진다. */
  const winAlpha = tl.at('open') * (1 - tl.at('close'));
  /** kick 칸의 흔적 — 다시 두드림이 시작되면 흐려진다. */
  const kickAlpha = 1 - tl.at('settle');

  // ---- 보통 배율 판 ----
  out.push({
    type: 'region',
    id: 'plain-water',
    points: box(PLAIN),
    fillOpacity: WATER_FILL_OPACITY,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  const toPlain = (p: Vec2): Vec2 => [PLAIN_CENTER[0] + c.pathScale * p[0], PLAIN_CENTER[1] + c.pathScale * p[1]];

  // 자취 — 지난 `trailSeconds` 초. 앞 주기의 꼬리를 이어 붙인다(주기 끝 자리가 0 이라 이어진다).
  const trail: Vec2[] = [];
  const from = u - c.trailSeconds;
  if (from < 0) {
    const prev = walkCycle(c, tl.cycle - 1, tl.period, kickFrom, kickTo, checkTo);
    for (let s = 0; s < sampleCount(prev); s++) {
      if (sampleTime(prev, s) - tl.period >= from) trail.push(toPlain(sampleAt(prev, s)));
    }
  }
  for (let s = 0; s < sampleCount(walk); s++) {
    const t = sampleTime(walk, s);
    if (t > u) break;
    if (t >= from) trail.push(toPlain(sampleAt(walk, s)));
  }
  const plainGrain = toPlain(pos);
  trail.push(plainGrain);
  out.push({
    type: 'trajectory',
    id: 'plain-trail',
    points: trail,
    width: TRAIL_WIDTH_PX,
    clip: PLAIN_CLIP,
    style: { colorRole: 'ink', emphasis: 'medium', fade: 'tail' },
  });
  out.push({
    type: 'body',
    id: 'plain-grain',
    pos: plainGrain,
    shape: 'circle',
    size: PLAIN_GRAIN_R,
    glow: false,
    clip: PLAIN_CLIP,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  out.push({
    type: 'readout',
    id: 'plain-label',
    anchor: { world: [PLAIN_CENTER[0], LABEL_Y] },
    text: text('label.plain'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  if (winAlpha <= 0) return out;

  // ---- 확대 표시 — 보통 배율 판의 작은 네모와 창을 잇는 선 ----
  const half = ((ZOOM.maxX - ZOOM.minX) / 2) * PLAIN_GRAIN_R;
  const [gx, gy] = plainGrain;
  out.push({
    type: 'lineSet',
    id: 'zoom-guide',
    lines: [
      [
        [gx - half, gy - half],
        [gx + half, gy - half],
        [gx + half, gy + half],
        [gx - half, gy + half],
        [gx - half, gy - half],
      ],
      [
        [gx + half, gy + half],
        [ZOOM.minX, ZOOM.maxY],
      ],
      [
        [gx + half, gy - half],
        [ZOOM.minX, ZOOM.minY],
      ],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY * winAlpha,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 확대 창 ----
  out.push({
    type: 'region',
    id: 'zoom-water',
    points: box(ZOOM),
    fillOpacity: WATER_FILL_OPACITY,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    opacity: winAlpha,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // 창은 알갱이의 느린 떠돌이를 따라가고, 빠른 튐은 창 안의 움직임으로 남는다.
  const track = trackAt(walk, u);
  const center: Vec2 = [ZOOM_CENTER[0] + pos[0] - track[0], ZOOM_CENTER[1] + pos[1] - track[1]];
  const at = (p: Vec2): Vec2 => [center[0] + p[0], center[1] + p[1]];

  out.push({
    type: 'body',
    id: 'zoom-grain',
    pos: center,
    shape: 'circle',
    size: 1,
    glow: false,
    opacity: winAlpha,
    clip: ZOOM_CLIP,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // 분자 — 맞기 전후 `MOLECULE_LIFE` 초 동안만. 창 밖에서 날아와 창 밖으로 나간다.
  const molPos: Vec2[] = [];
  const molVel: Vec2[] = [];
  for (const h of walk.hits) {
    if (Math.abs(u - h.t) > MOLECULE_LIFE) continue;
    const m = moleculeAt(h, u, c, 1 + MOLECULE_R);
    molPos.push(at(m.pos));
    molVel.push(m.vel);
  }
  out.push({
    type: 'particleSystem',
    id: 'molecules',
    positions: molPos,
    velocities: molVel,
    sizes: MOLECULE_PX,
    trail: true,
    trailStyle: MOLECULE_TRAIL,
    opacity: winAlpha,
    clip: ZOOM_CLIP,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 충돌 섬광 — 맞은 자리에서 퍼지는 작은 고리. 알갱이와 함께 움직인다.
  out.push({
    type: 'trace',
    id: 'hit-flash',
    marks: walk.hits
      .filter((h) => u >= h.t && u - h.t <= FLASH_LIFE)
      .map((h) => ({ pos: at([h.n[0], h.n[1]]), age: u - h.t })),
    life: FLASH_LIFE,
    shape: 'ring',
    size: FLASH_FROM_PX,
    spreadTo: FLASH_TO_PX,
    width: FLASH_WIDTH_PX,
    opacity: winAlpha,
    clip: ZOOM_CLIP,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- kick 칸 — 맞은 자리를 남겨 어느 쪽이 더 맞았는지 셀 수 있게 ----
  if (kickAlpha > 0 && u >= kickFrom) {
    const j = walk.kickJ;
    const jl = Math.hypot(j[0], j[1]) || 1;
    const jn: Vec2 = [j[0] / jl, j[1] / jl];
    const perp: Vec2 = [-jn[1], jn[0]];

    // 잔상 — kick 이 시작된 순간 알갱이가 있던 자리(지금 창 기준). 알갱이가 거기서 비켜난 만큼이 튐이다.
    const was = positionAt(walk, kickFrom);
    const ghostCenter: Vec2 = [ZOOM_CENTER[0] + was[0] - track[0], ZOOM_CENTER[1] + was[1] - track[1]];
    out.push({
      type: 'trajectory',
      id: 'kick-ghost',
      points: Array.from({ length: GHOST_SEGMENTS }, (_, i): Vec2 => {
        const a = (2 * Math.PI * i) / GHOST_SEGMENTS;
        return [ghostCenter[0] + Math.cos(a), ghostCenter[1] + Math.sin(a)];
      }),
      closed: true,
      width: GHOST_WIDTH_PX,
      opacity: GHOST_OPACITY * kickAlpha * winAlpha,
      clip: ZOOM_CLIP,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    });

    out.push({
      type: 'trajectory',
      id: 'kick-divide',
      points: [at([perp[0] * DIVIDE_SHARE, perp[1] * DIVIDE_SHARE]), at([-perp[0] * DIVIDE_SHARE, -perp[1] * DIVIDE_SHARE])],
      width: DIVIDE_WIDTH_PX,
      opacity: DIVIDE_OPACITY * tl.at('kick') * kickAlpha * winAlpha,
      clip: ZOOM_CLIP,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    });

    out.push({
      type: 'trace',
      id: 'kick-marks',
      marks: walk.kickHits
        .filter((h) => h.t <= u)
        .map((h) => ({ pos: at([h.n[0] * (1 + KICK_MARK_GAP), h.n[1] * (1 + KICK_MARK_GAP)]) })),
      shape: 'dot',
      size: KICK_MARK_PX,
      opacity: kickAlpha * winAlpha,
      clip: ZOOM_CLIP,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });

    const pushAlpha = tl.at('push') * kickAlpha * winAlpha;
    if (pushAlpha > 0) {
      out.push({
        type: 'vector',
        id: 'kick-push',
        from: center,
        delta: [j[0] * c.arrowScale, j[1] * c.arrowScale],
        width: ARROW_WIDTH_PX,
        outline: 'background',
        opacity: pushAlpha,
        clip: ZOOM_CLIP,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  out.push({
    type: 'readout',
    id: 'zoom-label',
    anchor: { world: [ZOOM_CENTER[0], LABEL_Y] },
    text: text('label.zoom'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    opacity: winAlpha,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
