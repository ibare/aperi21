// ========================================================================
// maxwells-demon — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없이 표준 어휘만 쓴다.
//
//   상자 · 칸막이   trajectory(닫힌 사각 · 문 위아래 두 토막)
//   문             trajectory — 윗끝 경첩에서 건너가는 쪽으로 돈다
//   도깨비          body custom(뿔 달린 머리) · readout(이름표)
//   알갱이          particleSystem — 빠른 것은 크게, 꼬리 길이는 속력
//   잰 자리         trace ring — 판정마다 문 앞에서 번진다
//   온도 막대       region 둘 · trajectory 점선(처음 높이) · readout(이름)
//   공책            region(종이) · lineSet(적힌 줄) · lineSet(방금 적은 줄) · readout(제목)
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
import { doorAt, moleculeAt, mulberry32, readConstants, runDemon } from './physics';
import { BARS, DEMON_PATH, DEMON_POS, NOTEBOOK, SCENE_BOUNDS, text } from './schema';
import type { MaxwellsDemonState } from './state';

/** 느린 · 빠른 알갱이 반지름(화면 px). 속력의 문턱이 크기의 두 단으로 보인다. */
const SLOW_R = 2.4;
const FAST_R = 4.4;
/** 알갱이 꼬리 — 길이 = 속도 × 이 시간(초), 불투명도. 빠른 것이 길게 끈다. */
const TRAIL_SECONDS = 0.08;
const TRAIL_OPACITY = 0.4;
/** 상자 벽 · 칸막이 굵기(화면 px). */
const WALL_WIDTH_PX = 2;
/** 문 굵기(화면 px). 칸막이보다 굵어 「여기가 문」 이 읽힌다. */
const DOOR_WIDTH_PX = 4;
/** 문이 활짝 열렸을 때 돈 각(라디안). 건너가는 쪽으로 돈다. */
const DOOR_SWING_RAD = (70 * Math.PI) / 180;
/** 잰 자리 고리 — 처음 · 끝 반지름(화면 px), 굵기. */
const RING_FROM_PX = 5;
const RING_TO_PX = 16;
const RING_WIDTH_PX = 1.6;
/** 막대 채움 불투명도. */
const BAR_FILL = 0.55;
/** 안내선(처음 높이 점선) 굵기(화면 px). */
const GUIDE_WIDTH_PX = 1;
/** 공책 종이 채움 불투명도 · 적힌 줄 굵기 · 방금 적은 줄 굵기(화면 px). */
const PAPER_FILL = 0.12;
const LINE_WIDTH_PX = 1.4;
const NEW_LINE_WIDTH_PX = 2.4;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 도깨비 이름표를 머리 가운데에서 오른쪽으로 띄우는 거리(화면 px). 뿔을 피한다. */
const DEMON_LABEL_GAP = 16;
/** 막대 이름을 바닥선에서 아래로 내리는 거리(화면 px). */
const BAR_NAME_DROP = 12;
/** 「처음」 이름을 점선 끝에서 띄우는 거리(화면 px). */
const GUIDE_LABEL_GAP = 4;
/** 제목(온도 · 공책)을 윗변에서 띄우는 거리(화면 px). */
const TITLE_GAP = 12;
/** 공책 줄 길이를 흩는 시드 — 알갱이 시드에 더한다. 줄 모양만 바꾸는 그림의 결이다. */
const NOTE_SEED_SHIFT = 101;

export function scene(params: {
  state: MaxwellsDemonState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('maxwells-demon: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  // 도깨비가 일하는 구간 — `sort` 시작부터 `sorted` 끝. 시각 0 은 그 시작이다.
  const t0 = tl.start('sort');
  const window = tl.end('sorted') - t0;
  const tau = tl.u - t0;
  const shown = tl.at('appear') * (1 - tl.at('fade'));

  const W = c.boxWidth;
  const H = c.boxHeight;
  const mid = W / 2;
  const run = runDemon(state.molecules, window, c);
  const out: Primitive[] = [];

  // ---- 상자 · 칸막이 ----
  out.push({
    type: 'trajectory',
    id: 'box',
    points: [
      [0, 0],
      [W, 0],
      [W, H],
      [0, H],
    ],
    closed: true,
    width: WALL_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'partition-low',
    points: [
      [mid, 0],
      [mid, c.doorLow],
    ],
    width: WALL_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'partition-high',
    points: [
      [mid, c.doorHigh],
      [mid, H],
    ],
    width: WALL_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 문 — 윗끝 경첩에서 건너가는 쪽으로 돈다 ----
  const door = tau >= 0 && tau <= window ? doorAt(run.judgments, tau, c) : { open: 0, dir: 1 as const };
  const doorLength = c.doorHigh - c.doorLow;
  const swing = door.open * DOOR_SWING_RAD * door.dir;
  out.push({
    type: 'trajectory',
    id: 'door',
    points: [
      [mid, c.doorHigh],
      [mid + doorLength * Math.sin(swing), c.doorHigh - doorLength * Math.cos(swing)],
    ],
    width: DOOR_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 도깨비 ----
  out.push({
    type: 'body',
    id: 'demon',
    pos: DEMON_POS,
    shape: 'custom',
    customPath: DEMON_PATH,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'demon-label',
    anchor: { world: DEMON_POS, offset: [DEMON_LABEL_GAP, 0] },
    text: text('label.demon'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 알갱이 ----
  const positions: Vec2[] = [];
  const velocities: Vec2[] = [];
  const sizes: number[] = [];
  const sum: [number, number] = [0, 0];
  const count: [number, number] = [0, 0];
  let startSum = 0;
  state.molecules.forEach((m, i) => {
    const at = moleculeAt(m, run.segments[i]!, tau, c);
    positions.push(at.pos);
    velocities.push(at.vel);
    sizes.push(m.speed > c.speedThreshold ? FAST_R : SLOW_R);
    sum[at.side] += m.speed * m.speed;
    count[at.side] += 1;
    startSum += m.speed * m.speed;
  });
  out.push({
    type: 'particleSystem',
    id: 'molecules',
    positions,
    velocities,
    sizes,
    trail: true,
    trailStyle: { seconds: TRAIL_SECONDS, opacity: TRAIL_OPACITY },
    opacity: shown,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 잰 자리 — 방금 판정한 알갱이마다 문 앞에서 고리가 번진다 ----
  // 강조색은 한 뜻 — 「방금 잰 것」(이 고리와 공책의 새 줄)에만 쓴다.
  const recent = run.judgments.filter((j) => tau >= j.t && tau - j.t < c.ringSeconds);
  if (recent.length > 0) {
    out.push({
      type: 'trace',
      id: 'measure-rings',
      shape: 'ring',
      size: RING_FROM_PX,
      spreadTo: RING_TO_PX,
      width: RING_WIDTH_PX,
      life: c.ringSeconds,
      marks: recent.map((j) => ({ pos: [mid, j.y] as Vec2, age: tau - j.t })),
      opacity: shown,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 온도 막대 — 칸마다 속력 제곱의 평균, 처음 값이 `barScale` 높이 ----
  const startMean = startSum / Math.max(1, state.molecules.length);
  const half = BARS.width / 2;
  ([0, 1] as const).forEach((side) => {
    const ratio = count[side] > 0 && startMean > 0 ? sum[side] / count[side] / startMean : 0;
    const h = c.barScale * ratio;
    const cx = BARS.centers[side];
    out.push({
      type: 'region',
      id: side === 0 ? 'bar-left' : 'bar-right',
      points: [
        [cx - half, 0],
        [cx + half, 0],
        [cx + half, h],
        [cx - half, h],
      ],
      fillOpacity: BAR_FILL,
      outline: [[2, 3]],
      opacity: shown,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: side === 0 ? 'bar-left-name' : 'bar-right-name',
      anchor: { world: [cx, 0], offset: [0, BAR_NAME_DROP] },
      text: text(side === 0 ? 'label.left' : 'label.right'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  });
  const guideL = BARS.centers[0] - half - BARS.guideOvershoot;
  const guideR = BARS.centers[1] + half + BARS.guideOvershoot;
  out.push({
    type: 'trajectory',
    id: 'bar-start',
    points: [
      [guideL, c.barScale],
      [guideR, c.barScale],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'bar-start-name',
    anchor: { world: [guideR, c.barScale], offset: [GUIDE_LABEL_GAP, 0] },
    text: text('label.start'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'bar-title',
    anchor: { world: [(BARS.centers[0] + BARS.centers[1]) / 2, H], offset: [0, -TITLE_GAP] },
    text: text('label.temperature'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 공책 — 판정 한 번에 한 줄 ----
  const [nx0, ny0] = NOTEBOOK.min;
  const [nx1, ny1] = NOTEBOOK.max;
  out.push({
    type: 'region',
    id: 'notebook',
    points: [
      [nx0, ny0],
      [nx1, ny0],
      [nx1, ny1],
      [nx0, ny1],
    ],
    fillOpacity: PAPER_FILL,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'notebook-title',
    anchor: { world: [(nx0 + nx1) / 2, ny1], offset: [0, -TITLE_GAP] },
    text: text('label.notebook'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  const colWidth = (nx1 - nx0 - 2 * NOTEBOOK.pad - (NOTEBOOK.cols - 1) * NOTEBOOK.gutter) / NOTEBOOK.cols;
  const rowHeight = (ny1 - ny0 - 2 * NOTEBOOK.pad) / NOTEBOOK.rows;
  const capacity = NOTEBOOK.rows * NOTEBOOK.cols;
  const lengthRandom = mulberry32(c.seed + NOTE_SEED_SHIFT);
  const lengths: number[] = [];
  for (let k = 0; k < capacity; k++) {
    lengths.push(colWidth * (NOTEBOOK.minLength + (1 - NOTEBOOK.minLength) * lengthRandom()));
  }
  const written: Vec2[][] = [];
  const fresh: Vec2[][] = [];
  let k = 0;
  for (const j of run.judgments) {
    if (j.t > tau || k >= capacity) break;
    const col = Math.floor(k / NOTEBOOK.rows);
    const row = k % NOTEBOOK.rows;
    const x = nx0 + NOTEBOOK.pad + col * (colWidth + NOTEBOOK.gutter);
    const y = ny1 - NOTEBOOK.pad - (row + 0.5) * rowHeight;
    const line: Vec2[] = [
      [x, y],
      [x + lengths[k]!, y],
    ];
    (tau - j.t < c.ringSeconds ? fresh : written).push(line);
    k++;
  }
  if (written.length > 0) {
    out.push({
      type: 'lineSet',
      id: 'notes',
      lines: written,
      width: LINE_WIDTH_PX,
      opacity: shown,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  if (fresh.length > 0) {
    out.push({
      type: 'lineSet',
      id: 'notes-fresh',
      lines: fresh,
      width: NEW_LINE_WIDTH_PX,
      opacity: shown,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
