// ========================================================================
// transverse-wave — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 줄 · 평형선 · 두 자취(trajectory),
// 구슬 무리(particleSystem), 강조 구슬 · 마루 표지(body), 직각 표시(lineSet) 가 모두 표준 어휘다.
//
// 색은 뜻마다 하나다 — 줄과 구슬은 먹색, **강조 구슬 셋과 그 자취는 primary**(「구슬이 간 길」),
// **강조색은 「마루가 간 길」 한 뜻에만**(마루 표지와 그 가로 자취). 평형선 · 직각 표시는 muted.
// 두 자취는 색이 아니라 **방향**으로 갈린다 — 세로선과 가로선.
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

import { crestX, displacement, markOpacity, readConstants, waveTime } from './physics';
import { BEAD_GAP, CREST_START_X, ROPE_END, ROPE_START, SCENE_BOUNDS, TAGGED_X } from './schema';
import type { TransverseWaveState } from './state';

// ---- 표본 수 — 상태로 계산하지 않는다 ----
/** 줄의 표본 수. 한 파장(3 m)에 약 90 점. */
const ROPE_SAMPLES = 300;
/** 구슬 자취 하나의 표본 수. 한 주기(travel 세 주기 동안)에 약 30 점. */
const TRAIL_SAMPLES = 150;

// ---- 선 굵기(화면 px) ----
const ROPE_WIDTH_PX = 2;
/** 구슬이 간 길. 줄보다 굵게 — 줄 뒤에 깔려도 띠로 읽혀야 한다. */
const BEAD_TRAIL_WIDTH_PX = 5;
/** 마루가 간 길. 구슬 자취와 같은 굵기 — 두 자취는 방향으로만 갈린다. */
const CREST_TRAIL_WIDTH_PX = 5;
const GUIDE_WIDTH_PX = 1;

// ---- 짙기 ----
/** 두 자취. 줄 · 구슬 뒤로 물러나 있되 멈춘 화면에서 먼저 읽혀야 한다. */
const TRAIL_OPACITY = 0.55;
/** 평형선. 가장 뒤. */
const GUIDE_OPACITY = 0.5;
/** 직각 표시. */
const RIGHT_ANGLE_OPACITY = 1;

// ---- 크기 ----
/** 구슬 무리 점 반지름(화면 px). */
const BEAD_PX = 3;
/** 강조 구슬 · 마루 표지 반지름(월드 m). */
const TAGGED_RADIUS = 0.13;
const CREST_RADIUS = 0.13;
/** 직각 표시 한 변(월드 m). 세로 자취와 가로 자취가 만나는 모서리 오른쪽 아래에 붙는다. */
const RIGHT_ANGLE_SIDE = 0.25;

export function scene(params: {
  state: TransverseWaveState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('transverse-wave: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const t = waveTime(timeline);
  const alpha = markOpacity(timeline);
  const A = c.amplitude;
  const out: Primitive[] = [];

  // ---- 평형선 ----
  // 줄이 쉬고 있을 자리. 구슬의 세로 자취가 이 선을 가운데 두고 위아래로 같다.
  out.push({
    type: 'trajectory',
    id: 'equilibrium',
    points: [
      [ROPE_START, 0],
      [ROPE_END, 0],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // ---- 구슬이 간 길 ----
  // 이번 주기 처음부터 지금까지의 자리를 그대로 잇는다 — x 가 바뀌지 않으니 세로선만 남는다.
  if (t > 0) {
    TAGGED_X.forEach((x, j) => {
      const pts: Vec2[] = [];
      for (let i = 0; i <= TRAIL_SAMPLES; i++) {
        const s = (t * i) / TRAIL_SAMPLES;
        pts.push([x, displacement(x, s, c)]);
      }
      out.push({
        type: 'trajectory',
        id: `bead-trail-${j}`,
        points: pts,
        width: BEAD_TRAIL_WIDTH_PX,
        opacity: TRAIL_OPACITY * alpha,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    });
  }

  // ---- 마루가 간 길 ----
  // 마루는 언제나 높이 A 에 있고 옆으로만 간다 — 가로선. 줄 끝을 넘으면 거기서 멈춘다.
  const xc = crestX(t, c);
  const trailEnd = Math.min(xc, ROPE_END);
  if (trailEnd > CREST_START_X) {
    out.push({
      type: 'trajectory',
      id: 'crest-trail',
      points: [
        [CREST_START_X, A],
        [trailEnd, A],
      ],
      width: CREST_TRAIL_WIDTH_PX,
      opacity: TRAIL_OPACITY * alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 직각 표시 ----
  // 마루가 지나간 구슬마다, 가로 자취와 세로 자취가 만나는 모서리에 작은 네모 귀퉁이.
  const corners: Vec2[][] = [];
  for (const x of TAGGED_X) {
    if (trailEnd < x) continue;
    corners.push([
      [x + RIGHT_ANGLE_SIDE, A],
      [x + RIGHT_ANGLE_SIDE, A - RIGHT_ANGLE_SIDE],
      [x, A - RIGHT_ANGLE_SIDE],
    ]);
  }
  if (corners.length > 0) {
    out.push({
      type: 'lineSet',
      id: 'right-angles',
      lines: corners,
      width: GUIDE_WIDTH_PX,
      opacity: RIGHT_ANGLE_OPACITY * alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 줄 ----
  const rope: Vec2[] = [];
  for (let i = 0; i <= ROPE_SAMPLES; i++) {
    const x = ROPE_START + ((ROPE_END - ROPE_START) * i) / ROPE_SAMPLES;
    rope.push([x, displacement(x, t, c)]);
  }
  out.push({
    type: 'trajectory',
    id: 'rope',
    points: rope,
    width: ROPE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 구슬 무리 ----
  // 줄에 꿴 구슬. 강조 구슬 자리는 비운다 — 같은 자리에 먹색 점이 겹치면 강조 구슬 둘레가 흐려진다.
  const beads: Vec2[] = [];
  const count = Math.round((ROPE_END - ROPE_START) / BEAD_GAP);
  for (let i = 0; i <= count; i++) {
    const x = ROPE_START + i * BEAD_GAP;
    if (TAGGED_X.some((tx) => Math.abs(tx - x) < BEAD_GAP / 2)) continue;
    beads.push([x, displacement(x, t, c)]);
  }
  out.push({
    type: 'particleSystem',
    id: 'beads',
    positions: beads,
    sizes: BEAD_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 강조 구슬 ----
  TAGGED_X.forEach((x, j) => {
    out.push({
      type: 'body',
      id: `tagged-${j}`,
      pos: [x, displacement(x, t, c)],
      shape: 'circle',
      size: TAGGED_RADIUS,
      outline: 'background',
      glow: false,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  });

  // ---- 마루 표지 ----
  // 줄의 꼭대기에 얹혀 오른쪽으로 간다. 줄 끝을 떠나면 사라진다.
  if (xc <= ROPE_END) {
    out.push({
      type: 'body',
      id: 'crest',
      pos: [xc, displacement(xc, t, c)],
      shape: 'circle',
      size: CREST_RADIUS,
      outline: 'background',
      glow: false,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
