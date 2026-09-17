// ========================================================================
// normal-modes — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 원본의 일곱 묶음을 순서 그대로 선언한다 (`schema.drawOrder: 'scene'`).
//   구슬 칸 안내선 · 사슬 · 더하기 기호 · 모드 모양의 폭 · 모드 모양의 지금 크기 ·
//   모드 크기 기록 · 모드 크기 지금 점
//
// 강조색은 한 뜻 — 「그 모양이 지금 얼마만큼 들어 있는가」 (모드 줄의 꺾은선 · 점,
// 기록 선의 지금 점). 사슬 구슬은 먹색, 폭 · 기록은 회색.
// ========================================================================

import type {
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  SceneGraph,
  Trajectory,
  Vec2,
} from '@aperi21/schema';
import { ACTIVE_EPS, DISP_PX, HIST, LAYOUT, N, Q_PX, SCENE_BOUNDS, text } from './schema';
import { SHAPE, grabKey } from './physics';
import type { NormalModesState } from './state';

/** 원본 선 굵기(화면 px) — 원본 index.html 의 `lineWidth` 값이다. */
const WIDTH = {
  guide: 1,
  mainWall: 2.5,
  chain: 1.5,
  envelope: 1,
  rowWall: 1.5,
  mode: 2,
  histBase: 1,
  hist: 1.5,
} as const;

/** 원본 점 반지름(화면 px). */
const RADIUS = { bead: 8, beadHeld: 9.5, modeDot: 3.5, nowDot: 4 } as const;

/** 더하기 기호 글자 크기(화면 px). */
const SIGN_FONT_PX = 20;

/** 양 끝 고정점을 포함한 꺾은선 — 벽 · 구슬 다섯 · 벽. */
function chainLine(cy: number, disp: (j: number) => number): Vec2[] {
  const pts: Vec2[] = [[LAYOUT.x0, cy]];
  for (let j = 0; j < N; j++) pts.push([LAYOUT.bx[j]!, cy + disp(j) * DISP_PX]);
  pts.push([LAYOUT.x1, cy]);
  return pts;
}

function wallTicks(cy: number, half: number): Vec2[][] {
  return [
    [
      [LAYOUT.x0, cy - half],
      [LAYOUT.x0, cy + half],
    ],
    [
      [LAYOUT.x1, cy - half],
      [LAYOUT.x1, cy + half],
    ],
  ];
}

export function scene(params: { state: NormalModesState }): SceneGraph {
  const s = params.state;
  const out: Primitive[] = [];
  const L = LAYOUT;

  // ---- 구슬 칸 안내선 ----
  const guides: LineSet = {
    type: 'lineSet',
    id: 'guides',
    lines: L.bx.map((x) => [
      [x, L.guideTop],
      [x, L.guideBottom],
    ]),
    width: WIDTH.guide,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(guides);

  // ---- 사슬 ----
  out.push({
    type: 'lineSet',
    id: 'chain-walls',
    lines: wallTicks(L.mainY, L.mainTick),
    width: WIDTH.mainWall,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies LineSet);
  out.push({
    type: 'lineSet',
    id: 'chain-string',
    lines: [chainLine(L.mainY, (j) => s.y[j]!)],
    width: WIDTH.chain,
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies LineSet);
  const beads: ParticleSystem = {
    type: 'particleSystem',
    id: 'beads',
    positions: L.bx.map((x, j): Vec2 => [x, L.mainY + s.y[j]! * DISP_PX]),
    sizes: L.bx.map((_, j) => (s.grab[grabKey(j)]?.held ? RADIUS.beadHeld : RADIUS.bead)),
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(beads);

  // ---- 더하기 기호 ----
  // 캡션에 공식을 쓰지 않고 합의 관계를 그림 안에 둔다.
  L.rowY.forEach((cy, n) => {
    const sign: Readout = {
      type: 'readout',
      id: `sign-${n}`,
      anchor: { world: [L.signX, cy] },
      text: n === 0 ? text('label.equals') : text('label.plus'),
      chip: false,
      font: 'text',
      fontSize: SIGN_FONT_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    out.push(sign);
  });

  // ---- 모드 모양의 폭 ----
  // 그 모양이 오갈 수 있는 위 · 아래 한계. 놓은 뒤에는 일정하다.
  for (let n = 0; n < N; n++) {
    const A = s.amp[n]!;
    if (A < ACTIVE_EPS) continue;
    const cy = L.rowY[n]!;
    for (const sign of [1, -1] as const) {
      const env: Trajectory = {
        type: 'trajectory',
        id: `envelope-${n}-${sign > 0 ? 'up' : 'down'}`,
        points: chainLine(cy, (j) => sign * SHAPE[n]![j]! * A),
        width: WIDTH.envelope,
        style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
      };
      out.push(env);
    }
  }
  out.push({
    type: 'lineSet',
    id: 'row-walls',
    lines: L.rowY.flatMap((cy) => wallTicks(cy, L.rowTick)),
    width: WIDTH.rowWall,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies LineSet);

  // ---- 모드 모양의 지금 크기 ----
  // 사슬 변위를 모양에 투영한 q_n × s_n. 사슬과 같은 세로 눈금 — 구슬 칸마다 다섯 줄을
  // 더하면 위 사슬과 같다.
  out.push({
    type: 'lineSet',
    id: 'mode-shapes',
    lines: L.rowY.map((cy, n) => chainLine(cy, (j) => SHAPE[n]![j]! * s.q[n]!)),
    width: WIDTH.mode,
    style: { colorRole: 'accent', emphasis: 'strong' },
  } satisfies LineSet);
  const modeDots: Vec2[] = [];
  L.rowY.forEach((cy, n) => {
    for (let j = 0; j < N; j++) modeDots.push([L.bx[j]!, cy + SHAPE[n]![j]! * s.q[n]! * DISP_PX]);
  });
  out.push({
    type: 'particleSystem',
    id: 'mode-dots',
    positions: modeDots,
    sizes: RADIUS.modeDot,
    style: { colorRole: 'accent', emphasis: 'strong' },
  } satisfies ParticleSystem);

  // ---- 모드 크기 기록 ----
  // 가장 새 값이 왼쪽(모드 줄 쪽), 오래된 값이 오른쪽으로 흘러간다.
  out.push({
    type: 'lineSet',
    id: 'history-base',
    lines: L.rowY.map((cy): Vec2[] => [
      [L.tx0, cy],
      [L.tx1, cy],
    ]),
    width: WIDTH.histBase,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  } satisfies LineSet);
  const span = L.tx1 - L.tx0;
  out.push({
    type: 'lineSet',
    id: 'history',
    lines: L.rowY.map((cy, n) => {
      const pts: Vec2[] = [];
      for (let k = 0; k < HIST; k++) {
        const idx = (s.head - 1 - k + HIST * 2) % HIST;
        pts.push([L.tx0 + (span * k) / (HIST - 1), cy + s.hist[n * HIST + idx]! * Q_PX]);
      }
      return pts;
    }),
    width: WIDTH.hist,
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies LineSet);

  // ---- 모드 크기 지금 점 ----
  out.push({
    type: 'particleSystem',
    id: 'now-dots',
    positions: L.rowY.map((cy, n): Vec2 => [L.tx0, cy + s.q[n]! * Q_PX]),
    sizes: RADIUS.nowDot,
    style: { colorRole: 'accent', emphasis: 'strong' },
  } satisfies ParticleSystem);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 원본 캔버스와 그 아래 캡션 자리.
  return { ...SCENE_BOUNDS };
}
