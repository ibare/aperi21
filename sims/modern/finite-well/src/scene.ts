// ========================================================================
// finite-well — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 벽 몸은 `region`, 퍼텐셜 모양 선 ·
// 준위 선 · 무한 우물 준위 점선 · ψ 는 `trajectory`, 가라앉은 거리는 `dimension`, 글자는
// `readout` 이다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색은 뜻마다 하나다 — ψ 는 모두 같은 대상(우물 속 입자의 상태)이라 같은 먹색이고, 벽 ·
// 준위 선 · 점선은 배경 정보라 muted 다. 꼬리를 색으로 가르지 않는다 — 옅게 칠한 벽 몸
// 안으로 먹색 곡선이 들어가 있는 것이 「샌다」 이다. **강조색은 「무한 우물 준위에서 가라앉은
// 거리」 한 뜻에만** 쓴다 (S-piece).
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
  levelY,
  lowered,
  psi,
  readConstants,
  solveState,
  wallHeightNow,
  type BoundState,
  type FiniteWellConstants,
} from './physics';
import { DROP_DIM_GAP, SCENE_BOUNDS, WALL_CAP, WALL_THICKNESS, text } from './schema';
import type { FiniteWellState } from './state';

/** ψ 표본 간격(월드). 우물 안 반파장(최소 L/2)에 표본이 50 개 넘게 들어간다. */
const SAMPLE_STEP = 0.1;
/**
 * 벽 속 꼬리를 긋는 가장 작은 |ψ|(우물 안 최댓값 = 1). 이보다 작은 꼬리는 준위 선 위에 누워
 * 「벽 끝까지 이어진 굵은 선」 으로 읽히므로 긋지 않는다 — 벽이 끝없이 높으면 벽 속 곡선이
 * 아예 없고, 꼬리가 길어지는 것이 곡선이 벽 속으로 뻗는 길이로 보인다.
 */
const TAIL_VISIBLE_MIN = 0.04;
/** ψ · 퍼텐셜 선 · 준위 선 · 점선 굵기(화면 px). */
const PSI_WIDTH_PX = 2.5;
const POTENTIAL_WIDTH_PX = 1.5;
const LEVEL_WIDTH_PX = 1;
const GHOST_WIDTH_PX = 1;
/** 벽 몸 칠의 불투명도 — 꼬리가 그 위에서 읽혀야 한다. */
const WALL_FILL_OPACITY = 0.2;
/** 가라앉은 거리가 이보다 짧으면(월드) 치수선을 긋지 않는다 — 길이 0 인 화살표를 피한다. */
const DROP_DIM_MIN = 0.12;
/** 글자 크기(화면 px). */
const N_LABEL_PX = 12;
const WALL_LABEL_PX = 13;
const GHOST_LABEL_PX = 12;
/** 글자 띄움(화면 px). */
const N_LABEL_GAP_PX = 10;
const WALL_LABEL_GAP_PX = 8;
const GHOST_LABEL_GAP_PX = 10;

/**
 * 준위에 얹힌 ψ — 준위 선이 가로축이다. 벽 면 ±a 에 표본을 꼭 둔다(곡선이 거기서 꺾인다).
 * 꼬리는 벽 면에서 멀어질수록 단조롭게 줄어 보이는 구간이 한 덩이라 한 선으로 이어진다.
 */
function psiCurve(s: BoundState, c: FiniteWellConstants, xOut: number): Vec2[] {
  const a = c.wellWidth / 2;
  const base = levelY(s.energy, c);
  const xs: number[] = [];
  for (let x = -xOut; x < -a; x += SAMPLE_STEP) xs.push(x);
  for (let x = -a; x < a; x += SAMPLE_STEP) xs.push(x);
  for (let x = a; x < xOut; x += SAMPLE_STEP) xs.push(x);
  xs.push(xOut);
  return xs
    .map((x) => ({ x, p: psi(x, s, c) }))
    .filter(({ x, p }) => Math.abs(x) <= a || Math.abs(p) >= TAIL_VISIBLE_MIN)
    .map(({ x, p }) => [x, base + c.psiHeight * p] as Vec2);
}

export function scene(params: {
  state: FiniteWellState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('finite-well: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const a = c.wellWidth / 2;
  const xOut = a + WALL_THICKNESS;
  const xDim = xOut + DROP_DIM_GAP;
  const V = wallHeightNow(lowered(tl), c);
  const wallTop = Math.min(levelY(V, c), WALL_CAP);
  const out: Primitive[] = [];

  // ---- 벽 — 옅게 칠한 몸 둘과 퍼텐셜 모양 선. 끝없이 높으면 고정 경계 위까지 뻗는다 ----
  for (const [id, x0, x1] of [
    ['wall-left', -xOut, -a],
    ['wall-right', a, xOut],
  ] as const) {
    out.push({
      type: 'region',
      id,
      points: [
        [x0, 0],
        [x0, wallTop],
        [x1, wallTop],
        [x1, 0],
      ],
      fillOpacity: WALL_FILL_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'trajectory',
    id: 'potential',
    points: [
      [-xOut, wallTop],
      [-a, wallTop],
      [-a, 0],
      [a, 0],
      [a, wallTop],
      [xOut, wallTop],
    ],
    width: POTENTIAL_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'wall-label',
    anchor: { world: [-xOut, wallTop], offset: [-WALL_LABEL_GAP_PX, 0] },
    text: text('label.wall'),
    chip: false,
    font: 'text',
    fontSize: WALL_LABEL_PX,
    italic: true,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 상태마다 — 무한 우물 준위 점선 · 준위 선 · ψ · 가라앉은 거리 ----
  for (let n = 1; n <= c.stateCount; n++) {
    const ghost = solveState(n, Infinity)!;
    const ghostY = levelY(ghost.energy, c);
    const s = solveState(n, V);

    // 무한 우물의 준위 — 늘 같은 자리. 벽이 끝없이 높을 때는 준위 선과 겹쳐 있다.
    out.push({
      type: 'trajectory',
      id: `ghost-${n}`,
      points: [
        [-a, ghostY],
        [xDim, ghostY],
      ],
      width: GHOST_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
    });
    if (n === c.stateCount) {
      out.push({
        type: 'readout',
        id: 'ghost-label',
        anchor: { world: [xDim, ghostY], offset: [GHOST_LABEL_GAP_PX, 0] },
        text: text('label.infiniteLevel'),
        chip: false,
        font: 'text',
        fontSize: GHOST_LABEL_PX,
        align: 'left',
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
    }
    if (!s) continue;

    const y = levelY(s.energy, c);
    out.push({
      type: 'trajectory',
      id: `level-${n}`,
      points: [
        [-xOut, y],
        [xDim, y],
      ],
      width: LEVEL_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'trajectory',
      id: `psi-${n}`,
      points: psiCurve(s, c, xOut),
      width: PSI_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `n-label-${n}`,
      anchor: { world: [-xOut, y], offset: [-N_LABEL_GAP_PX, 0] },
      text: text('label.n'),
      vars: { n: String(n) },
      chip: false,
      font: 'text',
      fontSize: N_LABEL_PX,
      italic: true,
      align: 'right',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // 가라앉은 거리 — 점선(무한 우물)에서 지금 준위까지.
    if (ghostY - y > DROP_DIM_MIN) {
      out.push({
        type: 'dimension',
        id: `drop-${n}`,
        from: [xDim, ghostY],
        to: [xDim, y],
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
