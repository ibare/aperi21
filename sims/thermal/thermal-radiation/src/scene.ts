// ========================================================================
// thermal-radiation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 상자 벽 · 물결(lineSet) ·
// 공기 알갱이(particleSystem) · 덩이 · 판 · 가리개(body) · 판의 옅은 채움과 온도
// 막대(region) · 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — **강조색은 「온도」 한 뜻에만**(덩이의 채움 · 판에 번지는 옅은 채움 ·
// 막대). 뜨거움 · 차가움을 두 역할로 가르지 않는다. 물결은 적외선이라 색을 지어내지 않고
// 먹색 선으로 긋는다 — 간격과 줄기 모양이 복사를 말한다. 벽 · 공기는 배경 정보라 muted.
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
  absorbed,
  airPositions,
  layout,
  plateTemp,
  readBeam,
  readConstants,
  shieldBottom,
  waveLine,
} from './physics';
import {
  BEAM_YS,
  BLOCK_SIZE,
  BLOCK_X,
  BOX,
  GAUGE_BOTTOM,
  GAUGE_OFFSET,
  GAUGE_TOP,
  GAUGE_W,
  LABEL_Y,
  PIPE_LEN,
  PLATE_SIZE,
  PORT_HALF,
  PORT_X,
  SCENE_BOUNDS,
  SHIELD_SIZE,
  VACUUM_LABEL,
  text,
} from './schema';
import type { ThermalRadiationState } from './state';

/** 상자 벽 굵기(화면 px). 그릇이라 물결보다 굵다. */
const WALL_PX = 3;
/** 물결 선 굵기(화면 px). */
const WAVE_PX = 1.6;
/** 물결 한 간격을 몇 점으로 표본할지. */
const SAMPLES_PER_WAVE = 14;
/** 공기 알갱이 반지름(화면 px). */
const AIR_DOT_PX = 2.5;
/** 공기 알갱이가 벽에서 떨어져 튀는 여백(월드). */
const AIR_MARGIN = 0.08;
/** 윗벽 틈이 가리개 두께보다 넓은 몫(월드, 한쪽). */
const SLOT_PAD = 0.04;
/** 판에 번지는 옅은 채움 — 처음 · 멈춘 온도에서의 짙기. 온도를 한 역할의 명암으로 보인다. */
const PLATE_TINT_COLD = 0.08;
const PLATE_TINT_HOT = 0.62;
/** 온도 막대 채움 짙기. */
const GAUGE_FILL = 0.85;
/** 막대 눈금이 막대 밖으로 나오는 길이(월드). */
const TICK_LEN = 0.07;
/** 눈금선 굵기(화면 px). */
const TICK_PX = 1.5;
/** 이름표 · 눈금 글자 크기(화면 px). */
const LABEL_PX = 11;
/** 눈금 글자를 막대 오른쪽으로 띄우는 거리(화면 px). */
const TICK_LABEL_DX = 22;
/** 가리개 이름표(위 끝 위) · 펌프 이름표(관 끝 아래)를 띄우는 거리(화면 px). */
const HANGING_LABEL_DY = 11;

export function scene(params: {
  state: ThermalRadiationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('thermal-radiation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const L = layout(c);
  const out: Primitive[] = [];

  const port: Vec2 = [PORT_X, BOX.minY];
  const plateX = L.plateFace + PLATE_SIZE[0] / 2;
  const gaugeX = L.plateFace + PLATE_SIZE[0] + GAUGE_OFFSET;

  // ---- 진공 상자 ----
  // 윗벽에는 가리개가 드나드는 틈, 아랫벽에는 펌프로 가는 관이 있다.
  const slotHalf = SHIELD_SIZE[0] / 2 + SLOT_PAD;
  out.push({
    type: 'lineSet',
    id: 'box',
    lines: [
      [
        [BOX.minX, BOX.minY],
        [BOX.minX, BOX.maxY],
      ],
      [
        [BOX.maxX, BOX.minY],
        [BOX.maxX, BOX.maxY],
      ],
      [
        [BOX.minX, BOX.maxY],
        [L.shieldX - slotHalf, BOX.maxY],
      ],
      [
        [L.shieldX + slotHalf, BOX.maxY],
        [BOX.maxX, BOX.maxY],
      ],
      [
        [BOX.minX, BOX.minY],
        [PORT_X - PORT_HALF, BOX.minY],
      ],
      [
        [PORT_X + PORT_HALF, BOX.minY],
        [BOX.maxX, BOX.minY],
      ],
      [
        [PORT_X - PORT_HALF, BOX.minY],
        [PORT_X - PORT_HALF, BOX.minY - PIPE_LEN],
      ],
      [
        [PORT_X + PORT_HALF, BOX.minY],
        [PORT_X + PORT_HALF, BOX.minY - PIPE_LEN],
      ],
    ],
    width: WALL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'pump-label',
    anchor: { world: [PORT_X, BOX.minY - PIPE_LEN], offset: [0, HANGING_LABEL_DY] },
    text: text('label.pump'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 공기 알갱이 ----
  // 펌프가 끄는 만큼 구멍으로 모이며 옅어진다. 다 빠진 뒤로는 상자 안에 아무것도 없다.
  const air = airPositions(tl, c, port, AIR_MARGIN);
  if (air.pull < 1) {
    out.push({
      type: 'particleSystem',
      id: 'air',
      positions: air.positions,
      sizes: AIR_DOT_PX,
      opacity: 1 - air.pull,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'readout',
    id: 'vacuum-label',
    anchor: { world: VACUUM_LABEL },
    text: text('label.vacuum'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    // 공기가 다 빠진 뒤(`lift` 부터) 나온다 — 알갱이가 남은 동안 「진공」 이라 쓰지 않는다.
    opacity: tl.at('lift') * (1 - tl.at('fade')),
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 뜨거운 덩이 ----
  out.push({
    type: 'body',
    id: 'block',
    pos: [BLOCK_X, 0],
    shape: 'rect',
    size: BLOCK_SIZE,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'block-label',
    anchor: { world: [BLOCK_X, LABEL_Y] },
    text: text('label.block'),
    vars: { t: String(c.blockTemp) },
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 물결 줄기 ----
  // 덩이 면에서 늘 나간다. 가리개가 내려와 있으면 그 면에서 끊기고, 걷히면 앞머리가
  // 판으로 건너간다. 다시 내려오면 이미 지난 물결의 꼬리가 판으로 빠져나간다.
  const beams = BEAM_YS.map((y) => ({ y, b: readBeam(tl, L, y, c) }));
  const waves: Vec2[][] = [];
  for (const { y, b } of beams) {
    const joined = b.front > L.shieldFace && b.tail <= L.shieldFace;
    if (joined) {
      waves.push(waveLine(L.blockFace, b.front, y, L.blockFace, tl.t, c, SAMPLES_PER_WAVE));
    } else {
      waves.push(waveLine(L.blockFace, L.shieldFace, y, L.blockFace, tl.t, c, SAMPLES_PER_WAVE));
      if (b.front > b.tail) {
        waves.push(waveLine(b.tail, b.front, y, L.blockFace, tl.t, c, SAMPLES_PER_WAVE));
      }
    }
  }
  out.push({
    type: 'lineSet',
    id: 'waves',
    lines: waves.filter((w) => w.length >= 2),
    width: WAVE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 판 ----
  // 받은 몫만큼 온도가 오르고, 그 온도가 판에 번지는 옅은 강조색으로도 보인다.
  const f = absorbed(
    tl,
    beams.map((x) => x.b),
  );
  const temp = plateTemp(c, f);
  const [pw, ph] = PLATE_SIZE;
  out.push({
    type: 'region',
    id: 'plate-tint',
    points: [
      [L.plateFace, -ph / 2],
      [L.plateFace + pw, -ph / 2],
      [L.plateFace + pw, ph / 2],
      [L.plateFace, ph / 2],
    ],
    fillOpacity: PLATE_TINT_COLD + (PLATE_TINT_HOT - PLATE_TINT_COLD) * f,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'plate',
    pos: [plateX, 0],
    shape: 'rect',
    size: PLATE_SIZE,
    fill: 'none',
    outline: 'role',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'plate-label',
    anchor: { world: [plateX, LABEL_Y] },
    text: text('label.plate'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 가리개 ----
  // 물결 위에 놓인다(drawOrder: scene). 윗벽 틈으로 오르내린다.
  const bottom = shieldBottom(tl, L);
  out.push({
    type: 'body',
    id: 'shield',
    pos: [L.shieldX, bottom + SHIELD_SIZE[1] / 2],
    shape: 'rect',
    size: SHIELD_SIZE,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'shield-label',
    // 위 끝 위에 단다 — 아래에 매달면 오르내리는 동안 물결 줄기를 가린다.
    anchor: { world: [L.shieldX, bottom + SHIELD_SIZE[1]], offset: [0, -HANGING_LABEL_DY] },
    text: text('label.shield'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 판의 온도 막대 ----
  const gh = GAUGE_TOP - GAUGE_BOTTOM;
  const yOf = (t: number): number =>
    GAUGE_BOTTOM + (gh * (t - c.gaugeMin)) / (c.gaugeMax - c.gaugeMin);
  const gl = gaugeX - GAUGE_W / 2;
  const gr = gaugeX + GAUGE_W / 2;
  out.push({
    type: 'region',
    id: 'gauge-fill',
    points: [
      [gl, GAUGE_BOTTOM],
      [gr, GAUGE_BOTTOM],
      [gr, yOf(temp)],
      [gl, yOf(temp)],
    ],
    fillOpacity: GAUGE_FILL,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'gauge-tube',
    pos: [gaugeX, (GAUGE_BOTTOM + GAUGE_TOP) / 2],
    shape: 'rect',
    size: [GAUGE_W, gh],
    fill: 'none',
    outline: 'role',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 눈금 — 처음 온도는 늘, 멈춘 온도는 막대가 거기서 멈춘 뒤에만 단다.
  const marks: { t: number; id: string }[] = [{ t: c.plateStart, id: 'start' }];
  if (tl.at('blocked') > 0) marks.push({ t: c.plateEnd, id: 'end' });
  out.push({
    type: 'lineSet',
    id: 'gauge-ticks',
    lines: marks.map((m) => [
      [gl - TICK_LEN, yOf(m.t)],
      [gr + TICK_LEN, yOf(m.t)],
    ]),
    width: TICK_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  for (const m of marks) {
    out.push({
      type: 'readout',
      id: `gauge-tick-${m.id}`,
      anchor: { world: [gr, yOf(m.t)], offset: [TICK_LABEL_DX, 0] },
      text: text('label.degC'),
      vars: { t: String(m.t) },
      chip: false,
      fontSize: LABEL_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'readout',
    id: 'gauge-label',
    anchor: { world: [gaugeX, LABEL_Y] },
    text: text('label.gauge'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
