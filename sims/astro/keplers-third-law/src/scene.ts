// ========================================================================
// keplers-third-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 태양 · 행성 · 유령(body) ·
// 궤도 · 출발선 · 반지름 · 자취 · 띠 테두리(trajectory) · 시간 띠 칸(region) ·
// 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 대상마다 하나다 — 안쪽 행성과 그 시간 띠는 primary, **강조색은 바깥 행성 한 뜻에만**
// (행성 · 지나온 호 · 시간 띠 막대). 태양 · 궤도 · 출발선 · 유령은 배경 정보라 muted.
// 색은 어느 행성의 것인지를 잇는 데만 쓰고, 뜻(빠르다 · 느리다)은 칸 수와 길이가 말한다.
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
import { innerRadius, onCircle, readConstants, readOrbits } from './physics';
import { SCENE_BOUNDS, STRIP_LENGTH, STRIP_X, text } from './schema';
import type { KeplersThirdLawState } from './state';

// ---- 궤도 쪽 배치(월드) ----
/** 태양 반지름. */
const SUN_R = 0.17;
/** 행성 · 유령 반지름. 크기는 주장이 아니라 두 행성을 같게 둔다. */
const PLANET_R = 0.09;
/** 원 궤도 표본 수. */
const CIRCLE_SAMPLES = 144;
/** 자취 표본 간격(rad). 3°. */
const ARC_STEP = Math.PI / 60;
/** 출발선이 바깥 궤도 밖으로 나오는 길이. */
const START_LINE_OVERHANG = 0.3;
/** 반지름 선을 긋는 방향(rad). 안쪽은 왼쪽 위, 바깥은 왼쪽 아래 — 둘이 겹치지 않게. */
const INNER_RADIUS_DIR = (105 * Math.PI) / 180;
const OUTER_RADIUS_DIR = (215 * Math.PI) / 180;
/** 반지름 이름표를 선 가운데에서 비켜 두는 거리(화면 px). */
const RADIUS_LABEL_OFFSET = 12;
/** 유령 이름표를 궤도 바깥쪽으로 띄우는 거리(화면 px). */
const GHOST_LABEL_OUT = 16;
/** 유령 이름표를 더 위로 올리는 거리(화면 px) — 출발선에 멈췄을 때 선 위에 얹히지 않게. */
const GHOST_LABEL_LIFT = -10;
/** 이 값보다 오른쪽(왼쪽)을 향하면 이름표를 왼쪽(오른쪽) 정렬로 궤도 밖에 붙인다. */
const GHOST_LABEL_SIDE_COS = 0.3;

// ---- 시간 띠 배치(월드) ----
/** 띠 이름 · 두 줄의 높이. 안쪽 줄이 위, 바깥 줄이 아래. */
const STRIP_TITLE_Y = 1.95;
const INNER_ROW: readonly [number, number] = [1.05, 1.4];
const OUTER_ROW: readonly [number, number] = [0.3, 0.65];
/** 유령 선 높이 — 바깥 줄 바로 위. */
const GHOST_LINE_Y = 0.76;
/** 유령 선 끝 표지의 반높이. */
const GHOST_TICK_HALF = 0.08;
/** `T` 이름표 높이 — 안쪽 줄 위. `{p}T` 는 바깥 줄 아래. */
const T_LABEL_Y = 1.58;
const PT_LABEL_Y = 0.12;
/** 줄 이름을 띠 왼쪽 끝에서 비켜 두는 거리(화면 px). */
const ROW_LABEL_GAP = -8;
/** 칸 사이 틈의 절반(월드). */
const CELL_INSET = 0.025;

// ---- 선언 필드 값 ----
const ORBIT_WIDTH_PX = 1.25;
const GUIDE_WIDTH_PX = 1;
const OUTER_ARC_WIDTH_PX = 3;
const GHOST_LINE_WIDTH_PX = 1.5;
const FRAME_WIDTH_PX = 1;
/** 끝난 바퀴 칸 두 톤 — 이웃 칸 경계를 보이려는 것이지 뜻을 가르는 것이 아니다. */
const CELL_EVEN_FILL = 0.28;
const CELL_ODD_FILL = 0.42;
const OUTER_BAR_FILL = 0.85;
const SUN_OPACITY = 0.7;
const LABEL_PX = 13;
/** 유령 궤도 이름표 글자 크기(화면 px) — 본 이름표보다 한 단 작게. */
const GHOST_LABEL_PX = 12;
const SYMBOL_PX = 15;
const LAP_NUMBER_PX = 11;

function circle(r: number): Vec2[] {
  return Array.from({ length: CIRCLE_SAMPLES }, (_, i) => onCircle(r, (2 * Math.PI * i) / CIRCLE_SAMPLES));
}

function arc(r: number, to: number): Vec2[] {
  const n = Math.max(1, Math.ceil(to / ARC_STEP));
  return Array.from({ length: n + 1 }, (_, i) => onCircle(r, (to * i) / n));
}

/** 유령 이름표 자리 — 궤도 바깥쪽 법선 방향(화면 y 는 아래가 +). */
function ghostLabelOffset(theta: number): Vec2 {
  return [Math.cos(theta) * GHOST_LABEL_OUT, -Math.sin(theta) * GHOST_LABEL_OUT + GHOST_LABEL_LIFT];
}

function ghostLabelAlign(theta: number): 'left' | 'right' | 'center' {
  const c = Math.cos(theta);
  return c > GHOST_LABEL_SIDE_COS ? 'left' : c < -GHOST_LABEL_SIDE_COS ? 'right' : 'center';
}

function rect(x0: number, x1: number, [y0, y1]: readonly [number, number]): Vec2[] {
  return [
    [x0, y0],
    [x0, y1],
    [x1, y1],
    [x1, y0],
  ];
}

export function scene(params: {
  state: KeplersThirdLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('keplers-third-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const o = readOrbits(tl, c);
  const rIn = innerRadius(c);
  const rOut = c.outerRadius;
  const out: Primitive[] = [];

  /** 시간 띠와 유령 · 이름표가 함께 거둬진다. */
  const fade = 1 - tl.at('fade');
  /** 궤도 위 유령은 바깥 행성이 출발선에 닿으면(`meet`) 물러난다. 띠의 유령 선은 끝까지 남는다. */
  const ghostAlpha = 1 - tl.at('meet');
  const ghostLineAlpha = fade;

  // ================= 궤도 쪽 =================

  // ---- 궤도 ---- 두 원. 배경 정보다.
  for (const [id, r] of [
    ['orbit-inner', rIn],
    ['orbit-outer', rOut],
  ] as const) {
    out.push({
      type: 'trajectory',
      id,
      points: circle(r),
      closed: true,
      width: ORBIT_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });
  }

  // ---- 출발선 ---- 두 행성이 함께 떠나고 함께 돌아오는 자리. 실선이다 — 점선은 유령 한 뜻에만.
  out.push({
    type: 'trajectory',
    id: 'start-line',
    points: [
      [SUN_R, 0],
      [rOut + START_LINE_OVERHANG, 0],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 반지름 ---- a 와 {r}a. 수는 스테이지 상수 그대로 (S-piece 유효숫자).
  const radius = (id: string, r: number, dir: number): void => {
    out.push({
      type: 'trajectory',
      id,
      points: [onCircle(SUN_R, dir), onCircle(r, dir)],
      width: GUIDE_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  };
  radius('radius-inner', rIn, INNER_RADIUS_DIR);
  radius('radius-outer', rOut, OUTER_RADIUS_DIR);
  const normalOffset = (dir: number, side: number): Vec2 => [
    -Math.sin(dir) * RADIUS_LABEL_OFFSET * side,
    // 화면 y 는 아래가 + 라 뒤집는다.
    -Math.cos(dir) * RADIUS_LABEL_OFFSET * side,
  ];
  out.push({
    type: 'readout',
    id: 'label-a',
    anchor: { world: onCircle((SUN_R + rIn) / 2, INNER_RADIUS_DIR), offset: normalOffset(INNER_RADIUS_DIR, 1) },
    text: text('sym.a'),
    chip: false,
    italic: true,
    fontSize: SYMBOL_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'label-ra',
    anchor: { world: onCircle((SUN_R + rOut) / 2, OUTER_RADIUS_DIR), offset: normalOffset(OUTER_RADIUS_DIR, 1) },
    text: text('sym.ra'),
    vars: { r: String(c.radiusRatio) },
    chip: false,
    italic: true,
    fontSize: SYMBOL_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 바깥 행성이 지나온 호 ---- 「아직 여기까지밖에 못 왔다」.
  if (o.outerAngle > 0) {
    const done = o.outerProgress >= 1;
    out.push({
      type: 'trajectory',
      id: 'outer-arc',
      points: done ? circle(rOut) : arc(rOut, o.outerAngle),
      closed: done,
      width: OUTER_ARC_WIDTH_PX,
      opacity: fade,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 태양 ----
  out.push({
    type: 'body',
    id: 'sun',
    pos: [0, 0],
    shape: 'circle',
    size: SUN_R,
    outline: 'none',
    glow: false,
    opacity: SUN_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 유령 ---- 안쪽 행성의 빠르기로 바깥 궤도를 돈다. 한 바퀴를 마치면 출발선에 선다.
  if (ghostAlpha > 0) {
    const g = onCircle(rOut, o.ghostAngle);
    out.push({
      type: 'body',
      id: 'ghost',
      pos: g,
      shape: 'circle',
      size: PLANET_R,
      fill: 'none',
      outline: 'role',
      opacity: ghostAlpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'ghost-label',
      anchor: { world: g, offset: ghostLabelOffset(o.ghostAngle) },
      text: text('label.ghost'),
      chip: false,
      font: 'text',
      fontSize: GHOST_LABEL_PX,
      align: ghostLabelAlign(o.ghostAngle),
      clamp: true,
      opacity: ghostAlpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 두 행성 ----
  out.push({
    type: 'body',
    id: 'planet-inner',
    pos: onCircle(rIn, o.innerAngle),
    shape: 'circle',
    size: PLANET_R,
    outline: 'none',
    glow: false,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'planet-outer',
    pos: onCircle(rOut, o.outerAngle),
    shape: 'circle',
    size: PLANET_R,
    outline: 'none',
    glow: false,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ================= 시간 띠 =================
  // 가로 = 시간. 띠 전체 길이가 바깥 행성의 주기 하나다. 안쪽 줄은 바퀴마다 칸이 하나씩 차고,
  // 바깥 줄은 한 막대가 천천히 자란다. 바깥 막대가 끝에 닿을 때 안쪽 칸 수가 주기의 비다.

  const x0 = STRIP_X;
  const L = STRIP_LENGTH;
  const cell = L / c.periodRatio;

  out.push({
    type: 'readout',
    id: 'strip-title',
    anchor: { world: [x0, STRIP_TITLE_Y] },
    text: text('label.strip'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_PX,
    opacity: fade,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 줄 테두리 — 두 줄 다 바깥 주기 하나의 길이다.
  for (const [id, row] of [
    ['frame-inner', INNER_ROW],
    ['frame-outer', OUTER_ROW],
  ] as const) {
    out.push({
      type: 'trajectory',
      id,
      points: rect(x0, x0 + L, row),
      closed: true,
      width: FRAME_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });
  }

  // 줄 이름.
  for (const [id, row, label] of [
    ['row-inner', INNER_ROW, text('label.inner')],
    ['row-outer', OUTER_ROW, text('label.outer')],
  ] as const) {
    out.push({
      type: 'readout',
      id,
      anchor: { world: [x0, (row[0] + row[1]) / 2], offset: [ROW_LABEL_GAP, 0] },
      text: label,
      chip: false,
      font: 'text',
      align: 'right',
      fontSize: LABEL_PX,
      style: { colorRole: id === 'row-inner' ? 'primary' : 'accent', emphasis: 'strong' },
    });
  }

  // 안쪽 줄 — 끝난 바퀴 칸(두 톤) + 지금 바퀴 칸(짙게 자란다) + 칸 번호.
  const cellX = (k: number): [number, number] => [x0 + k * cell + CELL_INSET, x0 + (k + 1) * cell - CELL_INSET];
  for (let k = 0; k < o.innerLaps; k++) {
    const [a, b] = cellX(k);
    out.push({
      type: 'region',
      id: `lap-${k}`,
      points: rect(a, Math.min(b, x0 + L), INNER_ROW),
      fillOpacity: k % 2 === 0 ? CELL_EVEN_FILL : CELL_ODD_FILL,
      opaque: true,
      opacity: fade,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `lap-number-${k}`,
      anchor: { world: [(a + Math.min(b, x0 + L)) / 2, (INNER_ROW[0] + INNER_ROW[1]) / 2] },
      text: text('sym.lap'),
      vars: { n: String(k + 1) },
      chip: false,
      font: 'mono',
      align: 'center',
      fontSize: LAP_NUMBER_PX,
      opacity: fade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  if (o.innerLapProgress > 0 && o.outerProgress < 1) {
    const [a, b] = cellX(o.innerLaps);
    const end = Math.min(a + (b - a) * o.innerLapProgress, x0 + L);
    if (end > a) {
      out.push({
        type: 'region',
        id: 'lap-now',
        points: rect(a, end, INNER_ROW),
        fillOpacity: 1,
        opaque: true,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    }
  }
  // `T` — 첫 칸 하나가 안쪽 주기다.
  out.push({
    type: 'readout',
    id: 'label-T',
    anchor: { world: [x0 + cell / 2, T_LABEL_Y] },
    text: text('sym.T'),
    chip: false,
    italic: true,
    align: 'center',
    fontSize: SYMBOL_PX,
    opacity: fade,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // 바깥 줄 — 한 막대가 자란다.
  if (o.outerProgress > 0) {
    out.push({
      type: 'region',
      id: 'outer-bar',
      points: rect(x0, x0 + L * o.outerProgress, OUTER_ROW),
      fillOpacity: OUTER_BAR_FILL,
      opaque: true,
      opacity: fade,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 유령 선 — 안쪽 빠르기였다면 바깥 한 바퀴가 여기서 끝났다.
  if (ghostLineAlpha > 0 && o.ghostProgress > 0) {
    const gx = x0 + L * o.ghostProgress * (c.radiusRatio / c.periodRatio);
    out.push({
      type: 'trajectory',
      id: 'ghost-line',
      points: [
        [x0, GHOST_LINE_Y],
        [gx, GHOST_LINE_Y],
      ],
      width: GHOST_LINE_WIDTH_PX,
      opacity: ghostLineAlpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
    if (o.ghostDone) {
      out.push({
        type: 'trajectory',
        id: 'ghost-tick',
        points: [
          [gx, GHOST_LINE_Y - GHOST_TICK_HALF],
          [gx, GHOST_LINE_Y + GHOST_TICK_HALF],
        ],
        width: GHOST_LINE_WIDTH_PX,
        opacity: ghostLineAlpha,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
    }
  }

  // `{p}T` — 바깥 막대가 끝에 닿으면 그 길이의 이름이 선다.
  if (o.outerProgress >= 1) {
    out.push({
      type: 'readout',
      id: 'label-pT',
      anchor: { world: [x0 + L / 2, PT_LABEL_Y] },
      text: text('sym.pT'),
      vars: { p: String(c.periodRatio) },
      chip: false,
      italic: true,
      align: 'center',
      fontSize: SYMBOL_PX,
      opacity: fade,
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
