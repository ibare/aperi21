// ========================================================================
// superposition-quantum — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 우물 벽 · 바닥은 `surface` wall `rough`,
// 다이얼 테는 `surface` arc, 분포 곡선 · 점선 · 무게 중심 막대 · 눈금은 `trajectory`, 분포 아래
// 채움은 `region`, 위상 화살표는 `vector`, 위상 차는 `sector`, 무게 중심은 `body` point,
// 글자는 `readout` 이다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색은 뜻마다 하나다 — 분포(작은 상자 · 큰 상자 · 점선)는 모두 같은 대상(입자가 있을 곳)이라
// 먹색이고, 벽 · 다이얼 테 · 이름은 muted 다. 위상 화살표 둘도 먹색이고 이름표 `n = k` 와 빠르기로
// 가른다(S-piece — 역할색을 범례로 쓰지 않는다). 위상 차 부채꼴은 secondary.
// **강조색은 「분포의 치우침」 한 뜻에만** — 무게 중심 막대와 그 점.
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
  eitherDensity,
  meanPosition,
  readConstants,
  readEmphasis,
  readPhase,
  stationaryDensity,
  stationaryPeak,
  superposedDensity,
  superposedPeak,
} from './physics';
import {
  DIAL_GAP,
  DIAL_RADIUS,
  DIAL_Y,
  MEAN_TICK_HALF,
  MEAN_Y,
  MINI_FLOOR_A,
  MINI_FLOOR_B,
  MINI_HEIGHT,
  MINI_LEFT,
  MINI_OVERHANG,
  MINI_WIDTH,
  PROB_HEIGHT,
  SCENE_BOUNDS,
  WALL_OVERHANG,
  text,
} from './schema';
import type { SuperpositionQuantumState } from './state';

/** 분포 곡선 표본 수. */
const CURVE_SAMPLES = 200;
/** 곡선 굵기(화면 px) — 큰 상자 · 작은 상자 · 점선. */
const CURVE_WIDTH_PX = 2.5;
const MINI_CURVE_WIDTH_PX = 2;
const EITHER_WIDTH_PX = 2;
/** 분포 아래 채움의 짙기. */
const FILL_OPACITY = 0.14;
/** `alone` 동안 큰 상자가 물러선 짙기. */
const SUPERPOSED_DIM_OPACITY = 0.25;
/** 무게 중심 막대 · 가운데 눈금 · 가운데 세로 점선 굵기(화면 px). */
const MEAN_WIDTH_PX = 3;
const TICK_WIDTH_PX = 1.5;
const CENTER_WIDTH_PX = 1;
/** 위상 화살표 굵기(화면 px)와 머리 크기(월드). */
const ARROW_WIDTH_PX = 2.5;
const ARROW_HEAD = 0.45;
/** 위상 차 부채꼴의 반지름 비(다이얼 반지름 대비)와 짙기. */
const SECTOR_RATIO = 0.5;
const SECTOR_FILL_OPACITY = 0.3;
/** 글자 크기(화면 px). */
const LEVEL_LABEL_PX = 13;
const NAME_PX = 12;
/** 이름표 띄움 — 화살표 끝 너머(월드), 상자 왼쪽 · 위 · 다이얼 아래(화면 px). */
const ARROW_LABEL_GAP = 0.6;
/** 화살표 방향의 가로 성분이 이보다 크면 이름표를 옆으로 붙인다. */
const LABEL_SIDE_COS = 0.5;
const MINI_LABEL_GAP_PX = 10;
const NAME_GAP_PX = 12;
/** 다이얼 이름은 아래를 향한 화살표의 이름표보다 더 아래에 둔다(화면 px). */
const DIAL_LABEL_GAP_PX = 32;

type Density = (u: number) => number;

/** 상자 [x0, x0 + w] 바닥 y0 위에 분포를 `scale` 배로 그은 점들. */
function curve(x0: number, w: number, y0: number, scale: number, f: Density): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const u = i / CURVE_SAMPLES;
    pts.push([x0 + u * w, y0 + scale * f(u)]);
  }
  return pts;
}

/** 우물 — 끝없이 높은 벽 둘과 바닥. 결은 벽 바깥 · 바닥 아래로 난다(wall 의 결은 from→to 의 오른쪽). */
function well(id: string, x0: number, w: number, y0: number, top: number, out: Primitive[]): void {
  const style = { colorRole: 'muted', emphasis: 'strong' } as const;
  out.push({ type: 'surface', id: `${id}-wall-left`, geometry: { kind: 'wall', from: [x0, top], to: [x0, y0] }, material: 'rough', style });
  out.push({ type: 'surface', id: `${id}-wall-right`, geometry: { kind: 'wall', from: [x0 + w, y0], to: [x0 + w, top] }, material: 'rough', style });
  out.push({ type: 'surface', id: `${id}-floor`, geometry: { kind: 'wall', from: [x0, y0], to: [x0 + w, y0] }, material: 'rough', style });
}

export function scene(params: {
  state: SuperpositionQuantumState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('superposition-quantum: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const L = c.boxWidth;
  const phase = readPhase(tl, c);
  const emph = readEmphasis(tl);
  const out: Primitive[] = [];

  // ---- 왼쪽 — 정상 상태 하나씩. 분포가 멈춰 있다 ----
  const minis: readonly [number, number][] = [
    [c.levelA, MINI_FLOOR_A],
    [c.levelB, MINI_FLOOR_B],
  ];
  for (const [n, y0] of minis) {
    const id = `mini-${n}`;
    well(id, MINI_LEFT, MINI_WIDTH, y0, y0 + MINI_HEIGHT + MINI_OVERHANG, out);
    const peak = stationaryPeak(n);
    const scale = peak > 0 ? MINI_HEIGHT / peak : 0;
    out.push({
      type: 'trajectory',
      id: `${id}-density`,
      points: curve(MINI_LEFT, MINI_WIDTH, y0, scale, (u) => stationaryDensity(u, n)),
      width: MINI_CURVE_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `${id}-label`,
      anchor: { world: [MINI_LEFT, y0 + MINI_HEIGHT / 2], offset: [-MINI_LABEL_GAP_PX, 0] },
      text: text('label.n'),
      vars: { n: String(n) },
      chip: false,
      font: 'text',
      fontSize: LEVEL_LABEL_PX,
      italic: true,
      align: 'right',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 가운데 — 겹친 상태. 분포가 좌우로 출렁인다 ----
  const peak = superposedPeak(c);
  const scale = peak > 0 ? PROB_HEIGHT / peak : 0;
  const wallTop = PROB_HEIGHT + WALL_OVERHANG;
  const mainOpacity = SUPERPOSED_DIM_OPACITY + (1 - SUPERPOSED_DIM_OPACITY) * emph.superposed;
  well('main', 0, L, 0, wallTop, out);
  out.push({
    type: 'readout',
    id: 'main-label',
    anchor: { world: [L / 2, wallTop], offset: [0, -NAME_GAP_PX] },
    text: text('label.superposed'),
    chip: false,
    font: 'text',
    fontSize: NAME_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 가운데 세로 점선 — 치우침을 재는 기준. 출렁임이 이 선을 넘나든다.
  out.push({
    type: 'trajectory',
    id: 'center-line',
    points: [
      [L / 2, MEAN_Y - MEAN_TICK_HALF],
      [L / 2, PROB_HEIGHT],
    ],
    width: CENTER_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dotted' },
  });

  const now = curve(0, L, 0, scale, (u) => superposedDensity(u, phase.delta, c));
  out.push({
    type: 'region',
    id: 'main-fill',
    points: [[0, 0], ...now, [L, 0]],
    fillOpacity: FILL_OPACITY,
    opacity: mainOpacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'main-density',
    points: now,
    width: CURVE_WIDTH_PX,
    opacity: mainOpacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 「둘 중 하나로 정해져 있었다면」 — 두 분포의 가중 평균. 시각과 무관하게 멈춰 있다.
  if (emph.either > 0) {
    out.push({
      type: 'trajectory',
      id: 'either-density',
      points: curve(0, L, 0, scale, (u) => eitherDensity(u, c)),
      width: EITHER_WIDTH_PX,
      opacity: emph.either,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // 무게 중심 — 가운데 눈금에서 지금 무게 중심까지 막대. 출렁임이 좌우 치우침으로 읽힌다.
  const meanX = meanPosition(phase.delta, c) * L;
  out.push({
    type: 'trajectory',
    id: 'mean-tick',
    points: [
      [L / 2, MEAN_Y - MEAN_TICK_HALF],
      [L / 2, MEAN_Y + MEAN_TICK_HALF],
    ],
    width: TICK_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'mean-bar',
    points: [
      [L / 2, MEAN_Y],
      [meanX, MEAN_Y],
    ],
    width: MEAN_WIDTH_PX,
    opacity: mainOpacity,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'mean-point',
    pos: [meanX, MEAN_Y],
    shape: 'point',
    opacity: mainOpacity,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 오른쪽 — 위상 다이얼. 두 위상이 n² 빠르기로 시계 방향으로 돈다 ----
  const center: Vec2 = [L + DIAL_GAP, DIAL_Y];
  out.push({
    type: 'surface',
    id: 'dial-rim',
    geometry: { kind: 'arc', center, radius: DIAL_RADIUS, from: 0, to: 2 * Math.PI },
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 위상 차 — 화살표 n_a 에서 시계 방향으로 n_b 까지. 0 이 되는 순간(두 화살표가 겹침)과
  // 반 바퀴인 순간에 분포가 양 끝으로 치우친다.
  // 짧은 쪽 각(−π~π)으로 쓴다 — 분포는 cos Δ 만 보므로 두 쪽이 같고, 한 바퀴 가까이 찬 부채꼴이
  // 갑자기 사라지는 것보다 반원에서 반대쪽 반원으로 넘어가는 편이 덜 튄다.
  const twoPi = 2 * Math.PI;
  const wrapped = ((phase.delta % twoPi) + twoPi) % twoPi;
  const lag = wrapped > Math.PI ? wrapped - twoPi : wrapped;
  const angleA = -phase.thetaA;
  out.push({
    type: 'sector',
    id: 'dial-lag',
    center,
    radius: DIAL_RADIUS * SECTOR_RATIO,
    from: angleA,
    to: angleA - lag,
    fillOpacity: SECTOR_FILL_OPACITY,
    rimWidth: 0,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  const wa = Math.sqrt(Math.max(c.weightA, 0));
  const wb = Math.sqrt(Math.max(c.weightB, 0));
  const wMax = Math.max(wa, wb) || 1;
  const arrows: readonly [number, number, number][] = [
    [c.levelA, phase.thetaA, wa / wMax],
    [c.levelB, phase.thetaB, wb / wMax],
  ];
  for (const [n, theta, frac] of arrows) {
    const len = DIAL_RADIUS * frac;
    const dir: Vec2 = [Math.cos(-theta), Math.sin(-theta)];
    out.push({
      type: 'vector',
      id: `phasor-${n}`,
      from: center,
      delta: [dir[0] * len, dir[1] * len],
      width: ARROW_WIDTH_PX,
      headSize: ARROW_HEAD,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `phasor-${n}-label`,
      anchor: {
        world: [center[0] + dir[0] * (len + ARROW_LABEL_GAP), center[1] + dir[1] * (len + ARROW_LABEL_GAP)],
      },
      text: text('label.n'),
      vars: { n: String(n) },
      chip: false,
      font: 'text',
      fontSize: LEVEL_LABEL_PX,
      italic: true,
      // 화살표가 옆을 향하면 글자를 바깥쪽으로 붙인다 — 가운데 정렬이면 화살촉 위에 얹힌다.
      align: dir[0] > LABEL_SIDE_COS ? 'left' : dir[0] < -LABEL_SIDE_COS ? 'right' : 'center',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'readout',
    id: 'dial-label',
    anchor: { world: [center[0], center[1] - DIAL_RADIUS], offset: [0, DIAL_LABEL_GAP_PX] },
    text: text('label.phase'),
    chip: false,
    font: 'text',
    fontSize: NAME_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
