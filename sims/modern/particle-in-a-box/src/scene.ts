// ========================================================================
// particle-in-a-box — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 우물 벽 · 바닥은 `surface` wall
// `rough`, 준위 선 · ψ · 눈금자 · 오르는 가로대는 `trajectory`, 간격은 `dimension`,
// 가로대 머리는 `body` point, 글자는 `readout` 이다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색은 뜻마다 하나다 — ψ 는 모두 같은 대상(우물 속 입자의 상태)이라 같은 먹색이고, 준위 선 ·
// 벽 · 눈금자는 배경 정보라 muted 다. **강조색은 「준위 사이 간격」 한 뜻에만** 쓴다 —
// 오르는 가로대와 간격 치수선 · 그 글자. 준위를 색으로 가르지 않는다 (S-piece).
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
  fadeOut,
  gapMultiple,
  levelMultiple,
  levelY,
  psi,
  readConstants,
  readLevel,
  type ParticleInABoxConstants,
} from './physics';
import { GAP_DIM_OFFSET, RULER_GAP, SCENE_BOUNDS, WALL_OVERHANG, text } from './schema';
import type { ParticleInABoxState } from './state';

/** ψ 표본 수 — 반파장 넷(n = 4)에도 반파장마다 표본이 60 개쯤 들어간다. */
const PSI_SAMPLES = 240;
/** ψ 굵기 · 준위 선 굵기 · 오르는 가로대 굵기(화면 px). */
const PSI_WIDTH_PX = 2.5;
const LEVEL_WIDTH_PX = 1;
const CLIMB_WIDTH_PX = 1.5;
/** 눈금자 축 · 눈금 굵기(화면 px). */
const RULER_WIDTH_PX = 1;
/** E₁ 눈금 길이(월드). 준위 자리 눈금은 이 배만큼 길다. */
const TICK_LEN = 0.35;
const LEVEL_TICK_SCALE = 2;
/** 눈금자가 가장 높은 준위 위로 더 뻗는 길이(월드). */
const RULER_OVERHANG = 1.0;
/** 글자 크기(화면 px). */
const LEVEL_LABEL_PX = 13;
const N_LABEL_PX = 12;
const GAP_LABEL_PX = 13;
const AXIS_LABEL_PX = 12;
/** 글자 띄움(화면 px). */
const LEVEL_LABEL_GAP_PX = 14;
const N_LABEL_GAP_PX = 12;
const GAP_LABEL_GAP_PX = 8;
const AXIS_LABEL_GAP_PX = 10;

/** 준위 n 에 얹힌 ψ — 준위 선이 가로축이다. `scale` 이 0 이면 평평한 선이다. */
function psiCurve(n: number, scale: number, c: ParticleInABoxConstants): Vec2[] {
  const base = levelY(n, c);
  const pts: Vec2[] = [];
  for (let i = 0; i <= PSI_SAMPLES; i++) {
    const x = (c.boxWidth * i) / PSI_SAMPLES;
    pts.push([x, base + scale * c.psiHeight * psi(x, n, c)]);
  }
  return pts;
}

export function scene(params: {
  state: ParticleInABoxState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('particle-in-a-box: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const L = c.boxWidth;
  const N = c.levelCount;
  const topY = levelY(N, c) + c.psiHeight;
  const rulerX = L + RULER_GAP;
  const dimX = rulerX + GAP_DIM_OFFSET;
  const upperOpacity = 1 - fadeOut(tl);
  const out: Primitive[] = [];

  // ---- 우물 — 끝없이 높은 벽 둘과 바닥 ----
  // 결은 벽 바깥(입자가 들어갈 수 없는 쪽)과 바닥 아래로 긋는다 — wall 의 결은 월드에서
  // from→to 의 오른쪽이다.
  const wallTop = topY + WALL_OVERHANG;
  out.push({
    type: 'surface',
    id: 'wall-left',
    geometry: { kind: 'wall', from: [0, wallTop], to: [0, 0] },
    material: 'rough',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'surface',
    id: 'wall-right',
    geometry: { kind: 'wall', from: [L, 0], to: [L, wallTop] },
    material: 'rough',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'surface',
    id: 'floor',
    geometry: { kind: 'wall', from: [0, 0], to: [L, 0] },
    material: 'rough',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 에너지 눈금자 — E₁ 한 칸마다 눈금 ----
  // 오르는 칸 수를 세게 하는 자다. 숫자는 준위 자리에만 붙인다.
  const rulerTop = levelY(N, c) + RULER_OVERHANG;
  out.push({
    type: 'trajectory',
    id: 'ruler',
    points: [
      [rulerX, 0],
      [rulerX, rulerTop],
    ],
    width: RULER_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  for (let k = 1; k <= levelMultiple(N); k++) {
    out.push({
      type: 'trajectory',
      id: `ruler-tick-${k}`,
      points: [
        [rulerX, k * c.energyUnit],
        [rulerX + TICK_LEN, k * c.energyUnit],
      ],
      width: RULER_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });
  }
  out.push({
    type: 'readout',
    id: 'ruler-label',
    anchor: { world: [rulerX, rulerTop], offset: [0, -AXIS_LABEL_GAP_PX] },
    text: text('label.energy'),
    chip: false,
    font: 'text',
    fontSize: AXIS_LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 준위마다 — 오름 · 준위 선 · ψ · 이름표 · 간격 ----
  for (let n = 1; n <= N; n++) {
    const { climb, grow } = readLevel(tl, n);
    const opacity = n === 1 ? 1 : upperOpacity;
    const lowY = levelY(n - 1, c);
    const y = levelY(n, c);

    // 오르는 중 — 아래 준위에서 같은 빠르기로 올라가는 점선 가로대와 자라는 간격 치수선.
    if (climb > 0 && climb < 1) {
      const yNow = lowY + climb * (y - lowY);
      out.push({
        type: 'trajectory',
        id: `climb-rung-${n}`,
        points: [
          [0, yNow],
          [rulerX, yNow],
        ],
        width: CLIMB_WIDTH_PX,
        style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
      });
      out.push({
        type: 'body',
        id: `climb-head-${n}`,
        pos: [rulerX, yNow],
        shape: 'point',
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
      out.push({
        type: 'dimension',
        id: `gap-${n}`,
        from: [dimX, lowY],
        to: [dimX, yNow],
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
      continue;
    }
    if (climb <= 0 || opacity <= 0) continue;

    // 닿았다 — 준위 선은 우물 안에서 눈금자까지 잇는다.
    out.push({
      type: 'trajectory',
      id: `level-${n}`,
      points: [
        [0, y],
        [rulerX, y],
      ],
      width: LEVEL_WIDTH_PX,
      opacity,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'trajectory',
      id: `level-tick-${n}`,
      points: [
        [rulerX, y],
        [rulerX + TICK_LEN * LEVEL_TICK_SCALE, y],
      ],
      width: RULER_WIDTH_PX,
      opacity,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // ψₙ — 준위 선 위에서 자라난다. 양 벽에서 언제나 0 이다.
    out.push({
      type: 'trajectory',
      id: `psi-${n}`,
      points: psiCurve(n, grow, c),
      width: PSI_WIDTH_PX,
      opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // 이름표 — 왼쪽에 준위 번호, 눈금자 옆에 에너지(E₁ 의 n² 배, 정수라 그대로 쓴다).
    out.push({
      type: 'readout',
      id: `n-label-${n}`,
      anchor: { world: [0, y], offset: [-N_LABEL_GAP_PX, 0] },
      text: text('label.n'),
      vars: { n: String(n) },
      chip: false,
      font: 'text',
      fontSize: N_LABEL_PX,
      italic: true,
      align: 'right',
      opacity,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `level-label-${n}`,
      anchor: { world: [rulerX, y], offset: [LEVEL_LABEL_GAP_PX, 0] },
      text: n === 1 ? text('label.levelOne') : text('label.level'),
      vars: { k: String(levelMultiple(n)) },
      chip: false,
      font: 'text',
      fontSize: LEVEL_LABEL_PX,
      italic: true,
      align: 'left',
      opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // 간격 — 다 오른 뒤에도 남아, 셋이 쌓이면 길이가 3 · 5 · 7 칸으로 견줘진다.
    // 세로 치수선의 글자는 선 위 끝 너머에 붙어 위 준위 선에 얹히므로(장부 G127),
    // 글자 없는 치수선 옆 가운데에 따로 붙인다.
    if (n >= 2) {
      out.push({
        type: 'dimension',
        id: `gap-${n}`,
        from: [dimX, lowY],
        to: [dimX, y],
        opacity,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
      out.push({
        type: 'readout',
        id: `gap-label-${n}`,
        anchor: { world: [dimX, (lowY + y) / 2], offset: [GAP_LABEL_GAP_PX, 0] },
        text: text('label.gap'),
        vars: { g: String(gapMultiple(n)) },
        chip: false,
        font: 'text',
        fontSize: GAP_LABEL_PX,
        italic: true,
        align: 'left',
        opacity,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
