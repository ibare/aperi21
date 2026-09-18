// ========================================================================
// quantum-harmonic-oscillator — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 우물 · 바닥선 · 준위 선 · ψ 는
// `trajectory`, 벽돌은 `region`, 마디는 `body` point, 글자는 `readout` 이다. 캡션은 선언의
// 캡션 슬롯이 그린다.
//
// 색은 뜻마다 하나다 — ψ 와 마디는 모두 같은 대상(우물 속 입자의 상태)이라 같은 먹색이고,
// 우물 · 바닥선 · 준위 선은 배경 정보라 muted 다. **강조색은 「준위 사이의 에너지 덩이」
// 한 뜻에만** 쓴다 — 벽돌과 그 `ħω` · `½ħω` 글자. 준위를 색으로 가르지 않는다 (S-piece).
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
  levelY,
  nodesOf,
  potentialY,
  psiSamples,
  readConstants,
  readLevel,
  wellHalfWidthAt,
} from './physics';
import { BRICK_SPAWN_Y, BRICK_WIDTH, BRICK_X, SCENE_BOUNDS, WELL_OVERHANG, text } from './schema';
import type { QuantumHarmonicOscillatorState } from './state';

/** ψ 표본 수 — 마디 넷(n = 4)에도 봉우리마다 표본이 50 개쯤 들어간다. */
const PSI_SAMPLES = 300;
/** 우물 포물선 표본 수. */
const WELL_SAMPLES = 120;
/** 선 굵기(화면 px). */
const PSI_WIDTH_PX = 2.5;
const WELL_WIDTH_PX = 2;
const LEVEL_WIDTH_PX = 1;
const FLOOR_WIDTH_PX = 1;
/** 벽돌 면의 채움 불투명도. 윤곽은 굵게 긋는다. */
const BRICK_FILL = 0.28;
/** 글자 크기(화면 px). */
const N_LABEL_PX = 12;
const BRICK_LABEL_PX = 14;
const WELL_LABEL_PX = 13;
/** 글자 띄움(화면 px). */
const N_LABEL_GAP_PX = 10;
const BRICK_LABEL_GAP_PX = 8;
const WELL_LABEL_GAP_PX = 6;

/** 벽돌 하나 — 아래 가장자리 `bottom`, 높이 `height` 인 사각형. 네 변을 모두 긋는다. */
function brick(bottom: number, height: number): Vec2[] {
  return [
    [BRICK_X, bottom],
    [BRICK_X + BRICK_WIDTH, bottom],
    [BRICK_X + BRICK_WIDTH, bottom + height],
    [BRICK_X, bottom + height],
  ];
}
const BRICK_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
] as const;

export function scene(params: {
  state: QuantumHarmonicOscillatorState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('quantum-harmonic-oscillator: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const N = c.levelCount;
  const psiLeft = -c.psiRange * c.xScale;
  const upperOpacity = 1 - fadeOut(tl);
  const out: Primitive[] = [];

  // ---- 바닥선 V = 0 — 우물 꼭짓점에서 벽돌 기둥 밑까지 ----
  // 반 벽돌이 이 선 위에 선다. 바닥 준위가 이 선에서 떠 있는 것이 영점 에너지다.
  out.push({
    type: 'trajectory',
    id: 'floor',
    points: [
      [0, 0],
      [BRICK_X + BRICK_WIDTH, 0],
    ],
    width: FLOOR_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // ---- 포물선 우물 ----
  const wellTop = levelY(N - 1, c) + c.psiHeight + WELL_OVERHANG;
  const wellHalf = wellHalfWidthAt(wellTop, c);
  const wellPts: Vec2[] = [];
  for (let i = 0; i <= WELL_SAMPLES; i++) {
    const x = -wellHalf + (2 * wellHalf * i) / WELL_SAMPLES;
    wellPts.push([x, potentialY(x, c)]);
  }
  out.push({
    type: 'trajectory',
    id: 'well',
    points: wellPts,
    width: WELL_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'well-label',
    anchor: { world: [wellHalf, wellTop], offset: [WELL_LABEL_GAP_PX, 0] },
    text: text('label.potential'),
    chip: false,
    font: 'text',
    fontSize: WELL_LABEL_PX,
    italic: true,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 준위마다 — 준위 선 · ψ · 마디 · 이름표 ----
  for (let n = 0; n < N; n++) {
    const { drop, grow } = readLevel(tl, n);
    if (drop < 1) continue; // 벽돌이 아직 얹히지 않았다 — 준위도 없다.
    const opacity = n === 0 ? 1 : upperOpacity;
    if (opacity <= 0) continue;
    const y = levelY(n, c);

    // 준위 선 — ψ 의 가로축이자 벽돌 윗면에서 뻗어 나온 높이.
    out.push({
      type: 'trajectory',
      id: `level-${n}`,
      points: [
        [psiLeft, y],
        [BRICK_X, y],
      ],
      width: LEVEL_WIDTH_PX,
      opacity,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // ψₙ — 준위 선 위에서 자라난다. 마디(축을 가로지르는 자리)는 n 개다.
    const samples = psiSamples(n, PSI_SAMPLES, c);
    out.push({
      type: 'trajectory',
      id: `psi-${n}`,
      points: samples.map((p): Vec2 => [p.x, y + grow * c.psiHeight * p.v]),
      width: PSI_WIDTH_PX,
      opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    nodesOf(samples).forEach((x, k) => {
      out.push({
        type: 'body',
        id: `node-${n}-${k}`,
        pos: [x, y],
        shape: 'point',
        opacity: opacity * grow,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    });

    out.push({
      type: 'readout',
      id: `n-label-${n}`,
      anchor: { world: [psiLeft, y], offset: [-N_LABEL_GAP_PX, 0] },
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
  }

  // ---- 벽돌 기둥 — 바닥의 반 벽돌 위에 같은 ħω 벽돌이 쌓인다 ----
  out.push({
    type: 'region',
    id: 'brick-half',
    points: brick(0, levelY(0, c)),
    fillOpacity: BRICK_FILL,
    outline: BRICK_EDGES,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'brick-half-label',
    anchor: { world: [BRICK_X + BRICK_WIDTH, levelY(0, c) / 2], offset: [BRICK_LABEL_GAP_PX, 0] },
    text: text('label.half'),
    chip: false,
    font: 'text',
    fontSize: BRICK_LABEL_PX,
    italic: true,
    align: 'left',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  for (let n = 1; n < N; n++) {
    const { drop } = readLevel(tl, n);
    if (drop <= 0 || upperOpacity <= 0) continue;
    // 위에서 내려와 맨 위 준위(n − 1)에 얹힌다. 얹히면 윗면이 준위 n 이다.
    const rest = levelY(n - 1, c);
    const bottom = BRICK_SPAWN_Y + (rest - BRICK_SPAWN_Y) * drop;
    out.push({
      type: 'region',
      id: `brick-${n}`,
      points: brick(bottom, c.quantum),
      fillOpacity: BRICK_FILL,
      outline: BRICK_EDGES,
      opacity: upperOpacity,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `brick-label-${n}`,
      anchor: { world: [BRICK_X + BRICK_WIDTH, bottom + c.quantum / 2], offset: [BRICK_LABEL_GAP_PX, 0] },
      text: text('label.quantum'),
      chip: false,
      font: 'text',
      fontSize: BRICK_LABEL_PX,
      italic: true,
      align: 'left',
      opacity: upperOpacity,
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
