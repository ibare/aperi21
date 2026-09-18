// ========================================================================
// sound-source-vibration — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 소리 고리(`trajectory` closed) · 책상 면(`surface` ground) · 받침(`body` rect) ·
// 소리굽쇠(`trajectory` 굵은 선) · 떨림 폭 잔상(`lineSet`) · 망치(`body` + `trajectory`) ·
// 손(`region`) · 손 이름표(`readout`) 가 모두 표준 어휘로 있다.
//
// 색: 소리굽쇠는 먹색, 받침 · 잔상은 보조 무채색, 망치 · 손은 보조색. 강조색은 **소리**
// 한 가지 뜻에만 쓴다 — 고리가 강조색이고, 그 밖의 어떤 것도 강조색이 아니다.
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
import { envelopeAt, prongDisplacement, readConstants, rings } from './physics';
import {
  HAND_AWAY_Y,
  HAND_FINGER_LEN,
  HAND_HALF_W,
  HAND_HOLD_Y,
  HAND_INNER_HALF_W,
  HAND_PALM_H,
  MALLET_HANDLE,
  MALLET_HIT_Y,
  MALLET_R,
  MALLET_START,
  PRONG_BASE_Y,
  PRONG_GAP,
  PRONG_TOP_Y,
  RING_CENTER,
  RING_MAX_R,
  SCENE_BOUNDS,
  STAND_HALF_H,
  STAND_HALF_W,
  STAND_Y,
  STEM_BOTTOM_Y,
  TABLE_Y,
  text,
} from './schema';
import type { SoundSourceVibrationState } from './state';

/** 소리 고리 한 바퀴의 표본 수. 원 어휘가 없어 점으로 표본한다 (G28). */
const RING_SAMPLES = 120;
/** 소리 고리 굵기(화면 px). */
const RING_WIDTH_PX = 2;
/** 가장 센 고리의 불투명도. 나온 순간의 떨림 크기를 곱한다. */
const RING_OPACITY = 0.9;
/** 소리굽쇠 선 굵기(화면 px). 쇠막대의 두께로 읽혀야 한다. */
const FORK_WIDTH_PX = 7;
/** 가지 하나의 표본 수 — 휘는 모양을 그린다. */
const PRONG_SAMPLES = 16;
/** U 자 바닥 반원의 표본 수. */
const BEND_SAMPLES = 14;
/** 떨림 폭 잔상의 굵기(화면 px)와 불투명도. */
const GHOST_WIDTH_PX = 3;
const GHOST_OPACITY = 0.45;
/** 망치 자루 굵기(화면 px). */
const MALLET_HANDLE_PX = 4;
/** 망치가 나타나는 속도 — `swing` 진행도의 이 몫 안에 다 나타난다. */
const MALLET_FADE_IN_SHARE = 0.25;
/** 망치가 가지 바깥 면에 닿을 때 가지 중심선에서 떨어진 거리(월드) — 가지 선 굵기의 반. */
const PRONG_HALF_THICK = 0.06;
/** 손 둥근 모서리 반지름(월드)과 표본 수. `rect` 둥글림이 없어 다각형으로 깎는다 (G06). */
const HAND_CORNER_R = 0.22;
const HAND_CORNER_SAMPLES = 6;
/** 손 채움 불투명도. 뒤의 고리를 가려야 「쥐었다」 로 읽힌다(`opaque`). */
const HAND_FILL_OPACITY = 0.55;
/** 손 이름표 글자 크기(화면 px)와 손에서 띄우는 거리(화면 px). */
const LABEL_PX = 13;
const LABEL_GAP: Vec2 = [8, 10];

const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

/**
 * 가지 하나의 중심선. 뿌리는 고정이고 끝이 가장 크게 벌어진다 — 외팔보가 휘는 꼴
 * `(h²(3 − h))/2` 로 옮긴다. `side` 는 −1(왼쪽) · +1(오른쪽). `d` 는 바깥으로 벌어진 끝 거리.
 */
function prong(side: -1 | 1, d: number): Vec2[] {
  const pts: Vec2[] = [];
  const len = PRONG_TOP_Y - PRONG_BASE_Y;
  for (let i = 0; i <= PRONG_SAMPLES; i++) {
    const h = i / PRONG_SAMPLES;
    const bend = (h * h * (3 - h)) / 2;
    pts.push([side * (PRONG_GAP + d * bend), PRONG_BASE_Y + len * h]);
  }
  return pts;
}

/** 소리굽쇠 전체 — 왼쪽 가지 끝 → 뿌리 → U 자 바닥 → 오른쪽 뿌리 → 끝. */
function forkOutline(d: number): Vec2[] {
  const left = prong(-1, d).reverse();
  const bend: Vec2[] = [];
  for (let i = 1; i < BEND_SAMPLES; i++) {
    const a = Math.PI + (Math.PI * i) / BEND_SAMPLES;
    bend.push([PRONG_GAP * Math.cos(a), PRONG_BASE_Y + PRONG_GAP * Math.sin(a)]);
  }
  return [...left, ...bend, ...prong(1, d)];
}

function circle(center: readonly [number, number], r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < RING_SAMPLES; i++) {
    const a = (2 * Math.PI * i) / RING_SAMPLES;
    pts.push([center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)]);
  }
  return pts;
}

/** 둥근 모서리 한 곳 — 중심 `c`, 각 `from` → `to`(라디안). 끝점은 넣지 않는다. */
function corner(c: Vec2, from: number, to: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < HAND_CORNER_SAMPLES; i++) {
    const a = from + ((to - from) * i) / HAND_CORNER_SAMPLES;
    pts.push([c[0] + HAND_CORNER_R * Math.cos(a), c[1] + HAND_CORNER_R * Math.sin(a)]);
  }
  return pts;
}

/**
 * 손 — 위에서 가지 끝을 감싸 쥐는 ∩ 모양. `yb` 는 손가락 끝 높이.
 * 두 손가락 안쪽이 두 가지의 바깥 면에 닿는다.
 */
function handShape(yb: number): Vec2[] {
  const W = HAND_HALF_W;
  const Wi = HAND_INNER_HALF_W;
  const top = yb + HAND_FINGER_LEN + HAND_PALM_H;
  const crotch = yb + HAND_FINGER_LEN;
  const r = HAND_CORNER_R;
  return [
    [-W, yb],
    ...corner([-W + r, top - r], Math.PI, Math.PI / 2),
    ...corner([W - r, top - r], Math.PI / 2, 0),
    [W, top - r],
    [W, yb],
    [Wi, yb],
    [Wi, crotch],
    [-Wi, crotch],
    [-Wi, yb],
  ];
}

export function scene(params: {
  state: SoundSourceVibrationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('sound-source-vibration: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const tool = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const sound = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  // ---- 소리 고리 ----
  // 가장 먼저 선언해 소리굽쇠 · 손 아래에 깔린다. 짙기는 나온 순간의 떨림 크기 —
  // 쥐는 동안 나온 고리는 옅고, 쥔 뒤로는 하나도 나오지 않는다. 책상 면 위로만 그린다.
  const ringClip = {
    min: [-RING_MAX_R, TABLE_Y] as Vec2,
    max: [RING_MAX_R, RING_CENTER[1] + RING_MAX_R] as Vec2,
  };
  for (const ring of rings(tl, c)) {
    if (ring.radius <= 0) continue;
    g.push({
      type: 'trajectory',
      id: `ring-${ring.index}`,
      points: circle(RING_CENTER, ring.radius),
      closed: true,
      width: RING_WIDTH_PX,
      opacity: RING_OPACITY * ring.strength,
      clip: ringClip,
      style: sound,
    });
  }

  // ---- 책상 면 ----
  g.push({
    type: 'surface',
    id: 'table',
    geometry: { kind: 'ground', y: TABLE_Y },
    material: 'solid',
    style: muted,
  });

  // ---- 받침 ----
  g.push({
    type: 'body',
    id: 'stand',
    pos: [0, STAND_Y],
    shape: 'rect',
    size: [STAND_HALF_W * 2, STAND_HALF_H * 2],
    glow: false,
    style: muted,
  });

  // ---- 떨림 폭 잔상 ----
  // 가지가 오가는 양 끝 자리. 떨리는 동안에만 있고, 떨림이 줄면 함께 좁아진다 —
  // 멈춘 사진 한 장에서도 「떨고 있다」 가 읽힌다.
  const env = envelopeAt(tl, tl.u, c);
  if (env > 0) {
    g.push({
      type: 'lineSet',
      id: 'swing-range',
      lines: [prong(-1, env), prong(-1, -env), prong(1, env), prong(1, -env)],
      width: GHOST_WIDTH_PX,
      opacity: GHOST_OPACITY,
      style: muted,
    });
  }

  // ---- 소리굽쇠 ----
  g.push({
    type: 'trajectory',
    id: 'fork',
    points: forkOutline(prongDisplacement(tl, c)),
    width: FORK_WIDTH_PX,
    style: ink,
  });
  g.push({
    type: 'trajectory',
    id: 'stem',
    points: [
      [0, PRONG_BASE_Y - PRONG_GAP],
      [0, STEM_BOTTOM_Y],
    ],
    width: FORK_WIDTH_PX,
    style: ink,
  });

  // ---- 망치 ----
  // `swing` 동안 다가와 오른쪽 가지를 치고, `hit` 동안 튕겨 나가며 사라진다.
  // 떨림은 `hit` 이 시작하는 순간(닿는 순간)부터다.
  const swing = tl.at('swing');
  const hit = tl.at('hit');
  if (hit < 1) {
    const contact: Vec2 = [PRONG_GAP + PRONG_HALF_THICK + MALLET_R, MALLET_HIT_Y];
    const k = swing * swing; // 휘두르는 끝에서 가장 빠르다
    const head: Vec2 =
      hit > 0
        ? [lerp(contact[0], MALLET_START[0], hit), lerp(contact[1], MALLET_START[1], hit)]
        : [lerp(MALLET_START[0], contact[0], k), lerp(MALLET_START[1], contact[1], k)];
    const opacity = Math.min(1, swing / MALLET_FADE_IN_SHARE) * (1 - hit);
    const hl = Math.hypot(MALLET_HANDLE[0], MALLET_HANDLE[1]);
    g.push({
      type: 'trajectory',
      id: 'mallet-handle',
      points: [
        [head[0] + (MALLET_HANDLE[0] / hl) * MALLET_R, head[1] + (MALLET_HANDLE[1] / hl) * MALLET_R],
        [head[0] + MALLET_HANDLE[0], head[1] + MALLET_HANDLE[1]],
      ],
      width: MALLET_HANDLE_PX,
      opacity,
      style: tool,
    });
    g.push({
      type: 'body',
      id: 'mallet-head',
      pos: head,
      shape: 'circle',
      size: MALLET_R,
      glow: false,
      opacity,
      style: tool,
    });
  }

  // ---- 손 ----
  // `reach` 동안 위에서 내려와 가지 끝을 감싸고, `release` 동안 올라가 떠난다.
  const reach = tl.at('reach');
  const release = tl.at('release');
  if (reach > 0 && release < 1) {
    const yb = lerp(lerp(HAND_AWAY_Y, HAND_HOLD_Y, reach), HAND_AWAY_Y, release);
    const shape = handShape(yb);
    g.push({
      type: 'region',
      id: 'hand',
      points: shape,
      fillOpacity: HAND_FILL_OPACITY,
      opaque: true,
      outline: shape.map((_, i) => [i, (i + 1) % shape.length] as const),
      style: tool,
    });
    g.push({
      type: 'readout',
      id: 'hand-label',
      anchor: { world: [HAND_HALF_W, yb + HAND_FINGER_LEN + HAND_PALM_H], offset: LABEL_GAP },
      text: text('label.hand'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'left',
      style: tool,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 상태를 보지 않으므로 매 프레임 같다 — 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
