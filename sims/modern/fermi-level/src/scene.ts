// ========================================================================
// fermi-level — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 띠(`region`) · 준위(`lineSet`) · 전자(`particleSystem`) ·
// 페르미 준위와 채워질 확률 곡선(`trajectory`) · 확대 창 테두리와 이음선(`lineSet`) ·
// 높이와 kT(`dimension` + `readout`) · 이름과 온도(`readout`) 가 모두 표준 어휘로 있다.
//
// 색: 띠는 두 그림에서 같은 보조색(같은 띠의 전체와 한 조각), 준위 선 · 축 · 치수선은 무채색,
// 전자와 곡선은 먹색. 강조색은 **페르미 준위** 한 가지 뜻에만 쓴다 — 두 그림을 가로지르는
// 같은 점선이 「채워진 데까지의 경계」 다.
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
  curveX,
  kTNow,
  kTOfMark,
  levelDE,
  levelsPerSide,
  occupancyCurve,
  readConstants,
  tempMark,
  wholeY,
  zoomElectrons,
  zoomY,
  type FermiLevelConstants,
} from './physics';
import {
  CURVE_X1,
  PANEL_BOTTOM_Y,
  PANEL_TOP_Y,
  SCENE_BOUNDS,
  WHOLE_HALF_W,
  WHOLE_X,
  ZOOM_LEFT_X,
  ZOOM_RIGHT_X,
  CURVE_X0,
  text,
} from './schema';
import type { FermiLevelState } from './state';

// ------------------------------------------------------------------------
// 모양 — 선 굵기 · 글자 크기 · 짙기 · 띄움 거리 (C2)
// ------------------------------------------------------------------------

/** 띠 채움 짙기. 준위 선과 전자가 그 위에서 읽혀야 한다. */
const BAND_FILL = 0.16;
/** 준위 선 굵기(화면 px) · 짙기. 빈 준위는 이 선만 남는다. */
const LEVEL_WIDTH_PX = 1;
const LEVEL_OPACITY = 0.7;
/** 확대 창 전자 점 반지름(화면 px) · 띠 전체 전자 점 반지름. */
const ELECTRON_PX = 3;
const SEA_ELECTRON_PX = 2;
/** 띠 전체 그림의 전자 줄 간격(월드) · 한 줄의 전자 수. 바다를 채운 모양일 뿐 준위 간격이 아니다. */
const SEA_ROW_PITCH = 0.2;
const SEA_COLS = 5;
/** 페르미 준위 점선 굵기(화면 px). */
const FERMI_WIDTH_PX = 2;
/** 채워질 확률 곡선 굵기(화면 px). */
const CURVE_WIDTH_PX = 2.5;
/** 축 · 창 테두리 · 이음선 굵기(화면 px) · 짙기. */
const GUIDE_WIDTH_PX = 1;
const GUIDE_OPACITY = 0.8;
/** 페르미 준위 점선이 곡선 판 오른쪽으로 더 뻗는 길이(월드). */
const FERMI_OVERHANG = 0.15;
/** kT 치수선을 곡선 판 오른쪽으로 띄우는 거리(월드). 점선 끝의 `E_F` 이름표 너머에 선다. */
const KT_DIM_DX = 0.75;
/** 띠 전체 높이 치수선을 띠 왼쪽으로 띄우는 거리(월드). */
const HEIGHT_DIM_DX = 0.18;

/** 이름표 글자 크기(화면 px) · 그림 이름 글자 크기 · 온도 글자 크기. */
const LABEL_PX = 12;
const TITLE_PX = 13;
const TEMP_PX = 14;
/** 그림 이름을 바닥 아래로 내리는 거리(화면 px). */
const TITLE_OFFSET: Vec2 = [0, 17];
/** 눈금 숫자(0 · 1)를 곡선 판 위로 올리는 거리(화면 px). */
const TICK_OFFSET: Vec2 = [0, -10];
/** 온도 글자를 확대 창 위로 올리는 거리(화면 px). */
const TEMP_OFFSET: Vec2 = [0, -12];
/** 값 글자를 치수선에서 띄우는 거리(화면 px) — 왼쪽(띠 전체) · 오른쪽(kT). */
const LEFT_LABEL_OFFSET: Vec2 = [-7, 0];
const RIGHT_LABEL_OFFSET: Vec2 = [8, 0];
/** 확대 창의 `E_F` 이름표를 점선 끝에서 띄우는 거리(화면 px). */
const FERMI_TAG_OFFSET: Vec2 = [6, 0];

const rect = (x0: number, x1: number, y0: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

/** 띠 전체의 전자 — 바닥에서 페르미 준위 바로 아래까지 빈틈없이. */
function seaElectrons(c: FermiLevelConstants): Vec2[] {
  const out: Vec2[] = [];
  const yF = wholeY(c, c.fermiEv);
  const pitchX = (2 * WHOLE_HALF_W) / SEA_COLS;
  for (let y = yF - SEA_ROW_PITCH / 2; y > PANEL_BOTTOM_Y; y -= SEA_ROW_PITCH) {
    for (let j = 0; j < SEA_COLS; j++) {
      out.push([WHOLE_X - WHOLE_HALF_W + (j + 0.5) * pitchX, y]);
    }
  }
  return out;
}

export function scene(params: {
  state: FermiLevelState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('fermi-level: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);

  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const band = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

  const g: Primitive[] = [];
  const kT = kTNow(tl, c);
  const mark = tempMark(tl);

  // ==== 왼쪽 — 띠 전체 ====
  const wx0 = WHOLE_X - WHOLE_HALF_W;
  const wx1 = WHOLE_X + WHOLE_HALF_W;
  const wyF = wholeY(c, c.fermiEv);
  g.push({
    type: 'region',
    id: 'whole-band',
    points: rect(wx0, wx1, PANEL_BOTTOM_Y, PANEL_TOP_Y),
    fillOpacity: BAND_FILL,
    style: band,
  });
  g.push({
    type: 'particleSystem',
    id: 'whole-electrons',
    positions: seaElectrons(c),
    sizes: SEA_ELECTRON_PX,
    style: ink,
  });

  // 확대 창이 띠 전체에서 차지하는 자리 — 페르미 준위 둘레의 얇은 띠.
  const winLo = wholeY(c, c.fermiEv - c.zoomHalfEv);
  const winHi = wholeY(c, c.fermiEv + c.zoomHalfEv);
  g.push({
    type: 'lineSet',
    id: 'zoom-window',
    lines: [
      [
        [wx0, winLo],
        [wx1, winLo],
        [wx1, winHi],
        [wx0, winHi],
        [wx0, winLo],
      ],
      // 이음선 — 얇은 띠가 가운데 그림 전체로 펴진다.
      [
        [wx1, winHi],
        [ZOOM_LEFT_X, PANEL_TOP_Y],
      ],
      [
        [wx1, winLo],
        [ZOOM_LEFT_X, PANEL_BOTTOM_Y],
      ],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY,
    style: muted,
  });

  // 띠 바닥에서 페르미 준위까지의 높이.
  const hx = wx0 - HEIGHT_DIM_DX;
  g.push({
    type: 'dimension',
    id: 'fermi-height',
    from: [hx, PANEL_BOTTOM_Y],
    to: [hx, wyF],
    style: muted,
  });
  g.push({
    type: 'readout',
    id: 'fermi-height-value',
    anchor: { world: [hx, (PANEL_BOTTOM_Y + wyF) / 2], offset: LEFT_LABEL_OFFSET },
    text: text('label.energy'),
    vars: { e: String(c.fermiEv) },
    chip: false,
    font: 'mono',
    fontSize: LABEL_PX,
    align: 'right',
    style: ink,
  });

  // ==== 가운데 — 페르미 준위 둘레 확대 ====
  g.push({
    type: 'region',
    id: 'zoom-band',
    points: rect(ZOOM_LEFT_X, ZOOM_RIGHT_X, PANEL_BOTTOM_Y, PANEL_TOP_Y),
    fillOpacity: BAND_FILL,
    style: band,
  });
  const n = levelsPerSide(c);
  const levels: Vec2[][] = [];
  for (let k = 0; k < n; k++) {
    for (const side of [-1, 1] as const) {
      const y = zoomY(c, levelDE(c, k, side));
      levels.push([
        [ZOOM_LEFT_X, y],
        [ZOOM_RIGHT_X, y],
      ]);
    }
  }
  g.push({
    type: 'lineSet',
    id: 'zoom-levels',
    lines: levels,
    width: LEVEL_WIDTH_PX,
    opacity: LEVEL_OPACITY,
    style: muted,
  });
  g.push({
    type: 'particleSystem',
    id: 'zoom-electrons',
    positions: zoomElectrons(tl, c),
    sizes: ELECTRON_PX,
    style: ink,
  });

  // ==== 오른쪽 — 채워질 확률 ====
  g.push({
    type: 'lineSet',
    id: 'curve-axes',
    lines: [
      [
        [CURVE_X0, PANEL_BOTTOM_Y],
        [CURVE_X0, PANEL_TOP_Y],
      ],
      [
        [CURVE_X1, PANEL_BOTTOM_Y],
        [CURVE_X1, PANEL_TOP_Y],
      ],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY,
    style: muted,
  });
  for (const [id, x, key] of [
    ['tick-zero', curveX(0), 'label.zero'],
    ['tick-one', curveX(1), 'label.one'],
  ] as const) {
    g.push({
      type: 'readout',
      id,
      anchor: { world: [x, PANEL_TOP_Y], offset: TICK_OFFSET },
      text: text(key),
      chip: false,
      font: 'mono',
      fontSize: LABEL_PX,
      align: 'center',
      style: muted,
    });
  }
  g.push({
    type: 'trajectory',
    id: 'occupancy',
    points: occupancyCurve(c, kT),
    width: CURVE_WIDTH_PX,
    style: ink,
  });

  // ==== 페르미 준위 — 두 그림을 가로지르는 같은 점선 ====
  const zyF = zoomY(c, 0);
  const fermiEnd = CURVE_X1 + FERMI_OVERHANG;
  g.push({
    type: 'trajectory',
    id: 'fermi-whole',
    points: [
      [wx0, wyF],
      [wx1, wyF],
    ],
    width: FERMI_WIDTH_PX,
    style: { ...accent, lineStyle: 'dashed' },
  });
  g.push({
    type: 'readout',
    id: 'fermi-whole-tag',
    anchor: { world: [hx, wyF], offset: LEFT_LABEL_OFFSET },
    text: text('label.fermi'),
    chip: false,
    font: 'mono',
    fontSize: LABEL_PX,
    align: 'right',
    style: accent,
  });
  g.push({
    type: 'trajectory',
    id: 'fermi-zoom',
    points: [
      [ZOOM_LEFT_X, zyF],
      [fermiEnd, zyF],
    ],
    width: FERMI_WIDTH_PX,
    style: { ...accent, lineStyle: 'dashed' },
  });
  g.push({
    type: 'readout',
    id: 'fermi-zoom-tag',
    anchor: { world: [fermiEnd, zyF], offset: FERMI_TAG_OFFSET },
    text: text('label.fermi'),
    chip: false,
    font: 'mono',
    fontSize: LABEL_PX,
    align: 'left',
    style: accent,
  });

  // ==== kT — 무뎌진 폭의 잣대 ====
  if (kT > 0) {
    const kx = CURVE_X1 + KT_DIM_DX;
    const top = zoomY(c, kT);
    g.push({
      type: 'dimension',
      id: 'kt',
      from: [kx, zyF],
      to: [kx, top],
      style: muted,
    });
    // 값 글자는 선언된 kT 에 닿은 만큼만 드러난다 — 옮겨 가는 동안 치수선 길이와 글자가 어긋나지 않게.
    // 식히는 동안(`zero`)은 치수선만 줄어들고 글자는 없다.
    const reached = mark === 'high' ? tl.at('hot') : mark === 'low' ? tl.at('warm') : 0;
    g.push({
      type: 'readout',
      id: 'kt-value',
      anchor: { world: [kx, (zyF + top) / 2], offset: RIGHT_LABEL_OFFSET },
      text: text('label.kT'),
      vars: { e: String(kTOfMark(c, mark)) },
      chip: false,
      font: 'mono',
      fontSize: LABEL_PX,
      align: 'left',
      opacity: reached,
      style: ink,
    });
  }

  // ==== 온도 ====
  g.push({
    type: 'readout',
    id: 'temperature',
    anchor: { world: [(ZOOM_LEFT_X + ZOOM_RIGHT_X) / 2, PANEL_TOP_Y], offset: TEMP_OFFSET },
    // 절대 0도는 선언값이 아니라 정의라 표식 문안 하나로 둔다.
    text: text(mark === 'zero' ? 'label.tempZero' : 'label.temp'),
    vars: { t: String(mark === 'high' ? c.tempHighK : c.tempLowK) },
    chip: false,
    font: 'mono',
    fontSize: TEMP_PX,
    weight: 'bold',
    align: 'center',
    style: ink,
  });

  // ==== 그림 이름 ====
  for (const [id, x, key] of [
    ['title-whole', WHOLE_X, 'label.whole'],
    ['title-zoom', (ZOOM_LEFT_X + ZOOM_RIGHT_X) / 2, 'label.zoom'],
    ['title-curve', (CURVE_X0 + CURVE_X1) / 2, 'label.occupancy'],
  ] as const) {
    g.push({
      type: 'readout',
      id,
      anchor: { world: [x, PANEL_BOTTOM_Y], offset: TITLE_OFFSET },
      text: text(key),
      chip: false,
      font: 'text',
      fontSize: TITLE_PX,
      weight: 'bold',
      align: 'center',
      style: ink,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
