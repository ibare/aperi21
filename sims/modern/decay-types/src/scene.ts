// ========================================================================
// decay-types — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
// - 원천 · 세 벽 — `region`(옅은 회색 면 + 양쪽 세로 변). 벽은 들어서며 짙어진다.
// - α — 큰 점, β — 작은 점. 둘 다 `particleSystem` 에 속도 꼬리(느린 α 는 짧고 빠른 β 는 길다).
// - γ — 짧은 물결(`lineSet`). 알갱이가 아니라 빛이라는 것을 모양이 말한다 (장부 G156).
// - 멈춘 α · β — 제자리에 남아 옅어지는 점(`particleSystem` + 입자별 불투명도).
// - 멈춘 자리 — 퍼지며 사라지는 고리(`trace` ring). γ 가 납에 흡수된 자리도 같다.
// - 줄 이름 α · β · γ · 원천 · 벽 이름표 — `readout`.
//
// 색 — 세 방사선 모두 먹(`ink`). 셋을 가르는 것은 색이 아니라 표식(α β γ) · 크기 · 모양
// (점 / 물결) · 꼬리 길이다 (S-piece). 벽 · 원천은 회색(`muted`). 강조색(`accent`)은
// 「여기서 멈췄다」 한 뜻에만 쓴다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { particlesAt, readConstants, wallOpacity, WALLS, type Particle, type Wall } from './physics';
import {
  EMIT_X,
  LANE_END_X,
  LANE_Y,
  SCENE_BOUNDS,
  SOURCE_LEFT,
  WALL_BOTTOM,
  WALL_LABEL_Y,
  WALL_TOP,
  WALL_W,
  WALL_X,
  text,
  type DecayTypesMessageKey,
} from './schema';
import type { DecayTypesState } from './state';

// ------------------------------------------------------------------------
// 위계 — 화면 px 이거나 월드 배치 거리
// ------------------------------------------------------------------------

/** α · β 점 반지름(화면 px). 무거운 α 가 크다. */
const ALPHA_PX = 4.5;
const BETA_PX = 2.2;
/** 속도 꼬리 길이 = 속도 × 이 시간(초) · 꼬리 굵기(화면 px) · 꼬리 불투명도. */
const TRAIL_SECONDS = 0.09;
const TRAIL_WIDTH_PX = 1.5;
const TRAIL_OPACITY = 0.45;
/** 멈춘 α 가 종이 앞면에서 물러나 앉는 거리(월드) — 점이 벽에 박혀 보이지 않게. */
const ALPHA_STOP_GAP = 0.07;
/** γ 물결 한 덩이의 길이(월드) · 물결 주기 수 · 진폭(월드) · 표본 수 · 굵기(화면 px). */
const GAMMA_LEN = 0.42;
const GAMMA_WAVES = 2.5;
const GAMMA_AMP = 0.07;
const GAMMA_SAMPLES = 16;
const GAMMA_WIDTH_PX = 1.6;
/** 멈춘 자리 고리 — 처음 반지름 · 퍼진 끝 반지름 · 굵기(화면 px). */
const RING_START_PX = 3;
const RING_END_PX = 13;
const RING_WIDTH_PX = 2;
/** 벽 · 원천 면의 채움 불투명도. 멈춘 β · γ 가 벽 안에서 비쳐 보이는 정도. */
const WALL_FILL = 0.3;
const SOURCE_FILL = 0.55;
/** 줄 이름(α β γ) 글자 크기 · 원천 오른쪽에서 띄우는 거리 · 줄 위로 올리는 거리(월드). */
const SYMBOL_PX = 18;
const SYMBOL_DX = 0.28;
const SYMBOL_DY = 0.45;
/** 벽 · 원천 이름표 글자 크기(화면 px). */
const NAME_PX = 13;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const WALL = { colorRole: 'muted', emphasis: 'strong' } as const;
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;

/** 날아가는 알갱이를 그리는 사각형 — 원천 오른쪽 가장자리부터 줄 끝까지. */
const LANE_CLIP = { min: [EMIT_X, WALL_BOTTOM] as Vec2, max: [LANE_END_X, WALL_TOP] as Vec2 };

/** 벽 이름표 문안 키와 끼울 값. */
function wallLabel(w: Wall, al: string, pb: string): { key: DecayTypesMessageKey; vars: Record<string, string> } {
  if (w === 'paper') return { key: 'label.paper', vars: {} };
  if (w === 'aluminium') return { key: 'label.aluminium', vars: { mm: al } };
  return { key: 'label.lead', vars: { cm: pb } };
}

function rect(x0: number, x1: number, y0: number, y1: number): Vec2[] {
  return [
    [x0, y1],
    [x0, y0],
    [x1, y0],
    [x1, y1],
  ];
}

function label(
  id: string,
  key: DecayTypesMessageKey,
  pos: Vec2,
  vars: Record<string, string | number>,
  fontSize: number,
  align: 'left' | 'center',
  opacity: number,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    vars,
    chip: false,
    font: 'text',
    align,
    fontSize,
    opacity,
    style: INK,
  };
}

/** γ 한 덩이의 물결 — 머리가 x, 꼬리는 원천 밖으로 나가지 않는다. 물결 무늬는 덩이와 함께 움직인다. */
function gammaWave(x: number, y: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k <= GAMMA_SAMPLES; k++) {
    const s = (k / GAMMA_SAMPLES) * GAMMA_LEN; // 머리에서 뒤로 잰 거리
    const px = x - s;
    if (px < EMIT_X) break;
    pts.push([px, y + GAMMA_AMP * Math.sin((2 * Math.PI * GAMMA_WAVES * s) / GAMMA_LEN)]);
  }
  return pts;
}

export function scene(params: {
  state: DecayTypesState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl, state } = params;
  if (!tl) throw new Error('decay-types: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const out: Primitive[] = [];

  // 원천
  const source: Region = {
    type: 'region',
    id: 'source',
    points: rect(SOURCE_LEFT, EMIT_X, WALL_BOTTOM, WALL_TOP),
    fillOpacity: SOURCE_FILL,
    outline: [[2, 3]],
    style: WALL,
  };
  out.push(source);
  out.push(label('source-label', 'label.source', [(SOURCE_LEFT + EMIT_X) / 2, WALL_LABEL_Y], {}, NAME_PX, 'center', 1));

  // 세 벽 — 지금 보이는 만큼
  const wallO: Record<Wall, number> = { paper: 0, aluminium: 0, lead: 0 };
  WALLS.forEach((w, k) => {
    const o = wallOpacity(tl, w);
    wallO[w] = o;
    if (o <= 0) return;
    const x0 = WALL_X[k]!;
    const x1 = x0 + WALL_W[k]!;
    const wall: Region = {
      type: 'region',
      id: `wall-${w}`,
      points: rect(x0, x1, WALL_BOTTOM, WALL_TOP),
      fillOpacity: WALL_FILL,
      outline: [
        [0, 1],
        [2, 3],
      ],
      opacity: o,
      style: WALL,
    };
    out.push(wall);
    const l = wallLabel(w, state.caption.al, state.caption.pb);
    out.push(label(`wall-${w}-label`, l.key, [(x0 + x1) / 2, WALL_LABEL_Y], l.vars, NAME_PX, 'center', o));
  });

  // 알갱이
  const ps = particlesAt(c, tl);
  const flying = (k: Particle['kind']): Particle[] => ps.filter((p) => p.moving && p.kind === k);

  const dots = (id: string, list: Particle[], size: number): ParticleSystem => ({
    type: 'particleSystem',
    id,
    positions: list.map((p): Vec2 => [p.x, p.y]),
    velocities: list.map((p): Vec2 => [c.speed[p.kind], 0]),
    sizes: size,
    trail: true,
    trailStyle: { seconds: TRAIL_SECONDS, width: TRAIL_WIDTH_PX, opacity: TRAIL_OPACITY },
    // 막 나온 알갱이의 꼬리가 원천 안으로 들어가지 않게 자른다.
    clip: LANE_CLIP,
    style: INK,
  });
  out.push(dots('alpha', flying('alpha'), ALPHA_PX));
  out.push(dots('beta', flying('beta'), BETA_PX));

  const gamma: LineSet = {
    type: 'lineSet',
    id: 'gamma',
    lines: flying('gamma')
      .map((p) => gammaWave(p.x, p.y))
      .filter((l) => l.length >= 2),
    width: GAMMA_WIDTH_PX,
    style: INK,
  };
  out.push(gamma);

  // 멈춘 α · β — 제자리에서 옅어진다. 벽이 물러나면 함께 물러난다.
  const stuck = ps.filter((p) => !p.moving && p.kind !== 'gamma' && p.stoppedAge < c.stuckLife);
  const stuckDots: ParticleSystem = {
    type: 'particleSystem',
    id: 'stuck',
    positions: stuck.map((p): Vec2 => [p.kind === 'alpha' ? p.x - ALPHA_STOP_GAP : p.x, p.y]),
    sizes: stuck.map((p) => (p.kind === 'alpha' ? ALPHA_PX : BETA_PX)),
    opacities: stuck.map((p) => (1 - p.stoppedAge / c.stuckLife) * (p.wall ? wallO[p.wall] : 1)),
    style: INK,
  };
  out.push(stuckDots);

  // 멈춘 자리 고리
  const rings: Trace = {
    type: 'trace',
    id: 'stops',
    marks: ps
      .filter((p) => !p.moving && p.stoppedAge < c.ringLife)
      .map((p) => ({ pos: [p.kind === 'alpha' ? p.x - ALPHA_STOP_GAP : p.x, p.y] as Vec2, age: p.stoppedAge })),
    life: c.ringLife,
    shape: 'ring',
    size: RING_START_PX,
    spreadTo: RING_END_PX,
    width: RING_WIDTH_PX,
    style: ACCENT,
  };
  out.push(rings);

  // 줄 이름 — 표식
  const symbols = ['α', 'β', 'γ'] as const;
  symbols.forEach((s, lane) => {
    out.push(label(`symbol-${lane}`, 'label.value', [EMIT_X + SYMBOL_DX, LANE_Y[lane]! + SYMBOL_DY], { v: s }, SYMBOL_PX, 'left', 1));
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
