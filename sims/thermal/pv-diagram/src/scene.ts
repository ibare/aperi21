// ========================================================================
// pv-diagram — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없이 표준 어휘만 쓴다.
//
//   P-V 축              vector 둘 · readout(`P` · `V`) · lineSet(추 한 개 간격 눈금)
//   A · B 상태점         body circle 속 빈 것 · readout(`A` · `B`)
//   지나온 길            trajectory (꺾은선)
//   칠해진 넓이          region (강조색 — 「기체가 한 일」 한 뜻) · lineSet(추 한 개 몫 띠 경계)
//   지금 상태점          body circle
//   앞 길의 잔상(b)       trajectory closed 점선 · lineSet(띠 경계, 옅게)
//   실린더 · 기체         trajectory(벽) · region(옅은 칠)
//   피스톤 · 막대 · 받침   body rect · trajectory
//   추                  body rect — 받침 위에 쌓였다가 하나씩 선반으로 옮겨 간다
//   선반                trajectory 셋(두 높이의 선반 + 기둥)
//   가열 · 식힘 판        region · readout
//
// 겹침 순서는 scene 에 쓴 순서다 (`schema.drawOrder: 'scene'`).
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
import { dropCount, readConstants, walkPath, type Leg } from './physics';
import { text } from './schema';
import type { PvDiagramState } from './state';

// ------------------------------------------------------------------------
// 배치 (월드 단위, y 위)
// ------------------------------------------------------------------------

/** P-V 그림 — 부피 1 L 의 가로 길이 · 추 하나(압력 한 칸)의 세로 길이. */
const PV_X_PER_L = 1.6;
const PV_Y_PER_BLOCK = 1.15;
/** 축이 가장 큰 부피 · 압력보다 더 뻗는 길이. */
const AXIS_OVERSHOOT = 0.7;
/** 축 머리 크기(월드). */
const AXIS_HEAD = 0.14;
/** 축 눈금 반 길이(월드). */
const TICK_HALF = 0.07;
/** 상태점 반지름(월드) — A · B 표지 · 지금 자리. */
const STATE_R = 0.07;
const NOW_R = 0.09;

/** 실린더 안쪽 좌우 · 바닥 · 벽 위 끝. */
const CYL = { left: 7.2, right: 8.6, bottom: 0, top: 1.95 } as const;
/** 부피 1 L 의 기체 기둥 높이. */
const GAS_H_PER_L = 0.55;
/** 피스톤 두께 · 벽과의 틈. */
const PISTON_H = 0.15;
const PISTON_GAP = 0.03;
/** 피스톤에서 받침까지 막대 길이 — 가장 낮은 받침도 실린더 벽 위로 나오게 한다. */
const ROD_LEN = 1.35;
/** 받침 폭 · 두께. */
const PLATFORM: Vec2 = [1.1, 0.1];
/** 추 크기. 쌓는 간격은 높이와 같다(맞닿는다). */
const BLOCK: Vec2 = [0.8, 0.3];
/** 추가 받침에서 선반으로 옮겨 갈 때 두 끝보다 위로 솟는 높이. */
const ARC_LIFT = 0.25;
/** 선반 — 왼쪽 끝 · 오른쪽 끝(기둥) · 첫 자리 x · 자리 간격. */
const SHELF = { left: 8.75, right: 10.75, slot0: 9.3, pitch: 0.9 } as const;
/** 가열 · 식힘 판. */
const PLATE = { left: 7.3, right: 8.5, bottom: -0.32, top: -0.1 } as const;

// ------------------------------------------------------------------------
// 굵기 · 글자 · 불투명도 (화면 px 또는 0~1)
// ------------------------------------------------------------------------

const AXIS_PX = 1.5;
const PATH_PX = 2.5;
const WALL_PX = 3;
const ROD_PX = 3;
const SHELF_PX = 2;
const GUIDE_PX = 1;
const BAND_PX = 1;
const AREA_FILL = 0.5;
const BAND_OPACITY = 0.45;
const GHOST_OPACITY = 0.7;
const GHOST_BAND_OPACITY = 0.35;
const GAS_FILL = 0.07;
const PLATE_IDLE = 0.15;
const PLATE_ON = 0.7;
const AXIS_LABEL_PX = 14;
const POINT_LABEL_PX = 14;
const WORK_LABEL_PX = 18;
const SMALL_PX = 12;
/** 축 이름 · 상태 이름을 앵커에서 띄우는 거리. */
const LABEL_GAP = 12;
/** 판 이름표와 판 사이 틈. */
const PLATE_LABEL_GAP = 6;
/** 작은 이름표를 앵커 아래로 내는 거리 — 틈 + 글자 반 높이. */
const SMALL_DROP = PLATE_LABEL_GAP + SMALL_PX / 2;

type Section = 'a' | 'b';

/** 추를 하나 내리는 단계 id — 시간표의 `a-drop1` … */
const dropPhase = (sec: Section, j: number): string => `${sec}-drop${j + 1}`;
const expandPhase = (sec: Section): string => `${sec}-expand`;

/** 부피 · 압력 → P-V 그림 위 자리. */
const pv = (v: number, p: number): Vec2 => [v * PV_X_PER_L, p * PV_Y_PER_BLOCK];

/** 부피 → 기체 기둥 위 끝 · 받침 윗면. */
const gasTopOf = (v: number): number => CYL.bottom + v * GAS_H_PER_L;
const platformTopOf = (v: number): number => gasTopOf(v) + PISTON_H + ROD_LEN + PLATFORM[1];

/** 단계가 시작하는 순서대로 다리를 늘어놓는다 — 길의 모양은 시간표 순서가 정한다. */
function legsOf(tl: TimelineFrame, sec: Section, drops: number): Leg[] {
  const ids: { id: string; kind: Leg['kind'] }[] = [{ id: expandPhase(sec), kind: 'expand' }];
  for (let j = 0; j < drops; j++) ids.push({ id: dropPhase(sec, j), kind: 'drop' });
  ids.sort((x, y) => tl.start(x.id) - tl.start(y.id));
  return ids.map(({ id, kind }) => ({ kind, progress: tl.at(id) }));
}

export function scene(params: {
  state: PvDiagramState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('pv-diagram: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const drops = dropCount(c);

  const sec: Section = tl.u >= tl.start('b-in') ? 'b' : 'a';
  const fade = tl.at(`${sec}-in`) * (1 - tl.at(`${sec}-out`));
  const path = walkPath(legsOf(tl, sec, drops), c);
  const holding = tl.u >= tl.start(`${sec}-hold`);

  const out: Primitive[] = [];

  // ================= P-V 그림 =================
  const [ax, ay] = pv(c.v1, c.blocksA);
  const [bx, by] = pv(c.v2, c.blocksB);
  const [fx] = pv(path.vFilled, 0);
  const areaTop = path.pExpand * PV_Y_PER_BLOCK;

  // ---- 앞 길의 잔상 (b): 넓이 윤곽 · 띠 경계 ----
  if (sec === 'b') {
    out.push({
      type: 'trajectory',
      id: 'ghost-area',
      points: [
        [ax, 0],
        [bx, 0],
        [bx, ay],
        [ax, ay],
      ],
      closed: true,
      width: GUIDE_PX,
      opacity: GHOST_OPACITY * fade,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
    const ghostBands = bandLines(ax, bx, c.blocksA);
    if (ghostBands.length > 0) {
      out.push({
        type: 'lineSet',
        id: 'ghost-bands',
        lines: ghostBands,
        width: BAND_PX,
        opacity: GHOST_BAND_OPACITY * fade,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
    }
  }

  // ---- 칠해진 넓이 — 부피가 늘어난 다리 아래 ----
  if (fx > ax) {
    out.push({
      type: 'region',
      id: 'area',
      points: [
        [ax, 0],
        [fx, 0],
        [fx, areaTop],
        [ax, areaTop],
      ],
      fillOpacity: AREA_FILL,
      opacity: fade,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    // 추 한 개 몫의 띠 경계 — 띠 수가 받침 위에서 올라가는 추 수와 같다.
    const bands = bandLines(ax, fx, path.pExpand);
    if (bands.length > 0) {
      out.push({
        type: 'lineSet',
        id: 'area-bands',
        lines: bands,
        width: BAND_PX,
        opacity: BAND_OPACITY * fade,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // ---- 축 ----
  const vAxisEnd = pv(c.v2, 0)[0] + AXIS_OVERSHOOT;
  const pAxisEnd = pv(0, c.blocksA)[1] + AXIS_OVERSHOOT;
  out.push({
    type: 'vector',
    id: 'axis-v',
    from: [0, 0],
    delta: [vAxisEnd, 0],
    width: AXIS_PX,
    headSize: AXIS_HEAD,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'axis-p',
    from: [0, 0],
    delta: [0, pAxisEnd],
    width: AXIS_PX,
    headSize: AXIS_HEAD,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  // P 축 눈금 — 추 한 개 간격
  const ticks: Vec2[][] = [];
  for (let k = 1; k <= c.blocksA; k++) {
    const y = k * PV_Y_PER_BLOCK;
    ticks.push([
      [-TICK_HALF, y],
      [TICK_HALF, y],
    ]);
  }
  out.push({
    type: 'lineSet',
    id: 'axis-p-ticks',
    lines: ticks,
    width: AXIS_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push(axisLabel('axis-v-label', [vAxisEnd, 0], [LABEL_GAP, 0], 'V'));
  out.push(axisLabel('axis-p-label', [0, pAxisEnd], [-LABEL_GAP, 0], 'P'));

  // ---- 지나온 길 · 넓이 이름 ----
  if (path.points.length > 1) {
    out.push({
      type: 'trajectory',
      id: 'path',
      points: path.points.map(([v, p]) => pv(v, p)),
      width: PATH_PX,
      opacity: fade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  if (holding && fx > ax) {
    out.push({
      type: 'readout',
      id: 'work-label',
      anchor: { world: [(ax + fx) / 2, areaTop / 2] },
      text: 'W',
      chip: false,
      font: 'text',
      italic: true,
      weight: 'bold',
      fontSize: WORK_LABEL_PX,
      opacity: fade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- A · B 표지 · 지금 상태점 ----
  for (const [id, pos, name, offset] of [
    ['state-a', [ax, ay], 'A', [-LABEL_GAP, -LABEL_GAP]],
    ['state-b', [bx, by], 'B', [LABEL_GAP, -LABEL_GAP]],
  ] as const) {
    out.push({
      type: 'body',
      id,
      shape: 'circle',
      pos,
      size: STATE_R,
      fill: 'none',
      outline: 'role',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `${id}-label`,
      anchor: { world: pos, offset },
      text: name,
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: POINT_LABEL_PX,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'body',
    id: 'state-now',
    shape: 'circle',
    pos: pv(path.v, path.p),
    size: NOW_R,
    glow: false,
    outline: 'background',
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ================= 실린더 =================
  const cx = (CYL.left + CYL.right) / 2;
  const gasTop = gasTopOf(path.v);
  const platTop = platformTopOf(path.v);

  // ---- 가열 · 식힘 판 ----
  const heating = tl.phase === expandPhase(sec);
  let cooling = false;
  for (let j = 0; j < drops; j++) if (tl.phase === dropPhase(sec, j)) cooling = true;
  out.push({
    type: 'region',
    id: 'plate',
    points: [
      [PLATE.left, PLATE.bottom],
      [PLATE.right, PLATE.bottom],
      [PLATE.right, PLATE.top],
      [PLATE.left, PLATE.top],
    ],
    fillOpacity: heating || cooling ? PLATE_ON : PLATE_IDLE,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  if (heating || cooling) {
    out.push({
      type: 'readout',
      id: 'plate-label',
      anchor: { world: [cx, PLATE.bottom], offset: [0, SMALL_DROP] },
      text: text(heating ? 'label.heat' : 'label.cool'),
      chip: false,
      font: 'text',
      fontSize: SMALL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 기체 ----
  out.push({
    type: 'region',
    id: 'gas',
    points: [
      [CYL.left, CYL.bottom],
      [CYL.right, CYL.bottom],
      [CYL.right, gasTop],
      [CYL.left, gasTop],
    ],
    fillOpacity: GAS_FILL,
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 피스톤 · 막대 · 받침 ----
  out.push({
    type: 'body',
    id: 'piston',
    shape: 'rect',
    pos: [cx, gasTop + PISTON_H / 2],
    size: [CYL.right - CYL.left - 2 * PISTON_GAP, PISTON_H],
    opacity: fade,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'rod',
    points: [
      [cx, gasTop + PISTON_H],
      [cx, platTop - PLATFORM[1]],
    ],
    width: ROD_PX,
    opacity: fade,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'platform',
    shape: 'rect',
    pos: [cx, platTop - PLATFORM[1] / 2],
    size: PLATFORM,
    opacity: fade,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 실린더 벽 (피스톤 위에 그어 가장자리가 먹선으로 남게) ----
  out.push({
    type: 'trajectory',
    id: 'cylinder',
    points: [
      [CYL.left, CYL.top],
      [CYL.left, CYL.bottom],
      [CYL.right, CYL.bottom],
      [CYL.right, CYL.top],
    ],
    width: WALL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 선반: 처음 받침 높이 · 끝 받침 높이, 오른쪽 기둥 ----
  const lowShelf = platformTopOf(c.v1);
  const highShelf = platformTopOf(c.v2);
  for (const [id, y] of [
    ['shelf-low', lowShelf],
    ['shelf-high', highShelf],
  ] as const) {
    out.push({
      type: 'trajectory',
      id,
      points: [
        [SHELF.left, y],
        [SHELF.right, y],
      ],
      width: SHELF_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'trajectory',
    id: 'shelf-post',
    points: [
      [SHELF.right, CYL.bottom],
      [SHELF.right, highShelf],
    ],
    width: SHELF_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 앞 길의 잔상 (b): a 에서 끝 높이 선반에 내려놓은 추 ----
  if (sec === 'b') {
    for (let j = 0; j < drops; j++) {
      const sx = SHELF.slot0 + j * SHELF.pitch;
      out.push({
        type: 'trajectory',
        id: `ghost-block-${j}`,
        points: [
          [sx - BLOCK[0] / 2, highShelf],
          [sx + BLOCK[0] / 2, highShelf],
          [sx + BLOCK[0] / 2, highShelf + BLOCK[1]],
          [sx - BLOCK[0] / 2, highShelf + BLOCK[1]],
        ],
        closed: true,
        width: GUIDE_PX,
        opacity: GHOST_OPACITY * fade,
        style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
      });
    }
  }

  // ---- 추: 받침 위에 쌓였다가 맨 위부터 하나씩 그때 높이의 선반으로 ----
  for (let i = 0; i < c.blocksA; i++) {
    const j = c.blocksA - 1 - i; // 이 추를 내리는 다리 순번
    const drop = j < drops ? path.drops[j] : undefined;
    let pos: Vec2;
    if (drop) {
      const top = platformTopOf(drop.v);
      const from: Vec2 = [cx, top + (i + 0.5) * BLOCK[1]];
      const to: Vec2 = [SHELF.slot0 + j * SHELF.pitch, top + BLOCK[1] / 2];
      pos = arc(from, to, drop.progress);
    } else {
      pos = [cx, platTop + (i + 0.5) * BLOCK[1]];
    }
    out.push({
      type: 'body',
      id: `block-${i}`,
      shape: 'rect',
      pos,
      size: BLOCK,
      outline: 'background',
      opacity: fade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 넓이 안의 가로 띠 경계 — 추 한 개 간격. 맨 아래(축)와 맨 위(길)는 빼고. */
function bandLines(x0: number, x1: number, height: number): Vec2[][] {
  const lines: Vec2[][] = [];
  for (let k = 1; k < height; k++) {
    const y = k * PV_Y_PER_BLOCK;
    lines.push([
      [x0, y],
      [x1, y],
    ]);
  }
  return lines;
}

/** 축 이름 — 물리 기호라 표식이다 (C1). */
function axisLabel(id: string, at: Vec2, offset: Vec2, sym: string): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: sym,
    chip: false,
    font: 'text',
    italic: true,
    fontSize: AXIS_LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 두 자리 사이를 위로 솟는 호로 잇는다(2차 베지에). p 는 단계 진행도(이징은 선언). */
function arc(a: Vec2, b: Vec2, p: number): Vec2 {
  const ctrl: Vec2 = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + ARC_LIFT];
  const q = 1 - p;
  return [
    q * q * a[0] + 2 * q * p * ctrl[0] + p * p * b[0],
    q * q * a[1] + 2 * q * p * ctrl[1] + p * p * b[1],
  ];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { minX: -0.7, maxX: 11.0, minY: -1.0, maxY: 4.35 };
}
