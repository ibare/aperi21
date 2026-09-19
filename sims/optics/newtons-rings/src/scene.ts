// ========================================================================
// newtons-rings — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
// - 위에서 본 무늬 — `scalarField` `colors: 'lightRgb'`. 칸마다 그 반지름의 반사 세기 × 단색광 색.
//   반원 밖 칸은 `NaN`(투명). 빛 채널이라 라이트 · 다크 모두 어두운 고리가 어둡다.
// - 옆에서 본 단면 — 평판 · 렌즈 유리는 `region`(muted), 렌즈 아랫면 곡선은 `trajectory`(ink).
// - 두께 눈금자 — 반 파장마다 눈금(`lineSet`)과 이름표(`readout`).
// - 안내선 — 눈금 m 에서 곡면까지 가로로, 거기서 무늬의 지름까지 세로로 내리는 한 줄(`trajectory`)과
//   곡면 위 점 · 지름 위 고리 표지(`body`). **강조색은 이 한 뜻에만** — 「반 파장 계단 ↔ 어두운 고리」.
//
// 가로 x 는 가운데에서 잰 반지름이고 단면과 무늬가 같은 축척으로 쓴다. 그래서 곡면 교점에서 곧장
// 내린 선이 무늬의 어두운 고리에 닿는다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  darkRingRadius,
  gapThickness,
  halfWaveThickness,
  readConstants,
  reflectedIntensity,
  sourceLight,
  type NewtonsRingsConstants,
} from './physics';
import {
  DISC_R,
  DISC_TOP,
  HALF_WAVE_LABELS,
  LENS_RIM,
  PLATE_OVERHANG,
  PLATE_THICK,
  PLATE_TOP,
  RULER_X,
  SCENE_BOUNDS,
  TITLE_X,
  ringPhaseId,
  text,
  type NewtonsRingsMessageKey,
} from './schema';
import type { NewtonsRingsState } from './state';

/** 무늬 격자 칸 수 — 월드 한 단위에 한 칸. 가장 바깥 고리 사이(약 16)에 어두운 띠가 여러 칸 든다. */
const DISC_COLS = 2 * DISC_R;
const DISC_ROWS = DISC_R;
/** 렌즈 곡면 표본 수(지름 전체). */
const CURVE_SAMPLES = 160;
/** 반원 테두리 표본 수. */
const RIM_SAMPLES = 96;

/** 렌즈 아랫면 곡선 굵기(화면 px). 이 그림의 주 대상이다. */
const CURVE_WIDTH_PX = 2;
/** 안내선 굵기(화면 px). */
const GUIDE_WIDTH_PX = 1.5;
/** 눈금자 · 테두리 같은 재는 선의 굵기(화면 px). */
const RULE_WIDTH_PX = 1;
/** 유리(평판 · 렌즈) 채움 짙기. 유리는 배경 정보라 옅다. */
const GLASS_FILL = 0.22;
/** 무늬 반원 테두리 짙기. 다크에서 어두운 바깥 고리와 바탕의 경계를 잡아 준다. */
const RIM_OPACITY = 0.6;
/** 눈금 길이(월드) — 눈금자에서 오른쪽으로. */
const TICK_LEN = 6;
/** 곡면 위 점 반지름 · 지름 위 고리 표지 반지름(월드). */
const CURVE_DOT_R = 3;
const RING_MARK_R = 4.5;
/** 글자 크기(화면 px) — 판 이름표 · 눈금 이름표. */
const TITLE_PX = 12;
const TICK_PX = 11;
/** 눈금 이름표를 눈금 끝에서 띄우는 거리(화면 px). */
const LABEL_GAP = 4;
/** 과장 배율 이름표를 눈금자 위 끝에서 띄우는 거리(화면 px, 위로). */
const EXAG_GAP = 12;
/** 「공기층」 이름표가 놓이는 자리 — 렌즈 가장자리까지의 비 · 그 자리 두께의 비. */
const AIR_LABEL_AT = 0.74;
const AIR_LABEL_HEIGHT = 0.42;

/** 칩 없는 월드 글자 한 줄. */
function label(
  id: string,
  world: Vec2,
  align: 'left' | 'center' | 'right',
  body: Pick<Readout, 'text' | 'vars'> & { offset?: Vec2; fontSize?: number },
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world, offset: body.offset },
    text: body.text,
    vars: body.vars,
    chip: false,
    align,
    font: 'text',
    fontSize: body.fontSize ?? TICK_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 꺾은선의 앞쪽 몫 `p`(0~1, 길이 비)만큼만 남긴다. 안내선이 눈금에서 고리 쪽으로 그어져 나간다. */
function partialPath(points: readonly Vec2[], p: number): Vec2[] {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1]!;
    const [bx, by] = points[i]!;
    const d = Math.hypot(bx - ax, by - ay);
    seg.push(d);
    total += d;
  }
  let left = Math.max(0, Math.min(1, p)) * total;
  const out: Vec2[] = [points[0]!];
  for (let i = 1; i < points.length; i++) {
    const d = seg[i - 1]!;
    const [ax, ay] = points[i - 1]!;
    const [bx, by] = points[i]!;
    if (left >= d) {
      out.push([bx, by]);
      left -= d;
      continue;
    }
    const f = d > 0 ? left / d : 0;
    out.push([ax + (bx - ax) * f, ay + (by - ay) * f]);
    break;
  }
  return out;
}

export function scene(params: {
  state: NewtonsRingsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('newtons-rings: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  /** 월드 가로 길이 ↔ mm. */
  const kx = DISC_R / c.viewRadius;
  /** 두께(mm) → 단면의 월드 높이. 세로만 과장 배율을 곱한다. */
  const thicknessY = (tMm: number): number => PLATE_TOP + tMm * kx * c.exaggeration;
  const gapY = (x: number): number => thicknessY(gapThickness(Math.abs(x) / kx, c));
  const rimY = gapY(DISC_R);

  // ---- 위에서 본 무늬 ---- (아래 반원. 지름이 위 변이고 가운데가 렌즈가 닿은 자리)
  out.push(ringPattern(c, kx));
  const rim: Vec2[] = [];
  for (let k = 0; k <= RIM_SAMPLES; k++) {
    const a = Math.PI + (Math.PI * k) / RIM_SAMPLES; // 왼쪽 → 아래 → 오른쪽
    rim.push([DISC_R * Math.cos(a), DISC_TOP + DISC_R * Math.sin(a)]);
  }
  out.push({
    type: 'trajectory',
    id: 'disc-rim',
    points: rim,
    closed: true,
    width: RULE_WIDTH_PX,
    opacity: RIM_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 옆에서 본 단면 ----
  // 평판. 렌즈보다 양옆으로 더 나가 「렌즈를 얹은 판」 으로 읽힌다.
  const plateL = -DISC_R - PLATE_OVERHANG;
  const plateR = DISC_R + PLATE_OVERHANG;
  out.push({
    type: 'region',
    id: 'plate',
    points: [
      [plateL, PLATE_TOP],
      [plateR, PLATE_TOP],
      [plateR, PLATE_TOP - PLATE_THICK],
      [plateL, PLATE_TOP - PLATE_THICK],
    ],
    fillOpacity: GLASS_FILL,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 렌즈 — 아랫면은 곡면, 윗면은 평평한 평볼록 렌즈. 곡면 아래 빈 자리가 공기층이다.
  const curve: Vec2[] = [];
  for (let k = 0; k <= CURVE_SAMPLES; k++) {
    const x = -DISC_R + (2 * DISC_R * k) / CURVE_SAMPLES;
    curve.push([x, gapY(x)]);
  }
  const lensTop = rimY + LENS_RIM;
  const n = curve.length;
  out.push({
    type: 'region',
    id: 'lens',
    points: [...curve, [DISC_R, lensTop], [-DISC_R, lensTop]],
    fillOpacity: GLASS_FILL,
    outline: [
      [n - 1, n],
      [n, n + 1],
      [n + 1, 0],
    ],
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'lens-surface',
    points: curve,
    width: CURVE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  const airX = -DISC_R * AIR_LABEL_AT;
  out.push(label('air-label', [airX, gapY(airX) * AIR_LABEL_HEIGHT], 'center', { text: text('label.air') }));

  // ---- 두께 눈금자 ---- 렌즈 가장자리 바로 바깥, 평판 윗면(두께 0)에서 가장자리 두께까지.
  out.push({
    type: 'trajectory',
    id: 'ruler',
    points: [
      [RULER_X, PLATE_TOP],
      [RULER_X, rimY],
    ],
    width: RULE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const ticks: Vec2[][] = [];
  for (let m = 1; m <= c.markedRings; m++) {
    const y = thicknessY(halfWaveThickness(m, c));
    ticks.push([
      [RULER_X, y],
      [RULER_X + TICK_LEN, y],
    ]);
    const key: NewtonsRingsMessageKey | undefined = HALF_WAVE_LABELS[m - 1];
    if (key) {
      out.push(label(`ruler-label-${m}`, [RULER_X + TICK_LEN, y], 'left', { text: text(key), offset: [LABEL_GAP, 0] }));
    }
  }
  out.push({
    type: 'lineSet',
    id: 'ruler-ticks',
    lines: ticks,
    width: RULE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  // 세로 과장 배율 — 선언값 그대로 (S-piece 유효숫자).
  out.push(
    label('exaggeration', [RULER_X - TICK_LEN, rimY], 'left', {
      text: text('label.exaggeration'),
      vars: { k: String(c.exaggeration) },
      offset: [0, -EXAG_GAP],
    }),
  );

  // ---- 판 이름표 ----
  out.push(label('side-title', [TITLE_X, rimY / 2], 'right', { text: text('label.side'), fontSize: TITLE_PX }));
  out.push(label('top-title', [TITLE_X, DISC_TOP - DISC_R / 2], 'right', { text: text('label.top'), fontSize: TITLE_PX }));

  // ---- 안내선 ---- 고리 m 마다 자기 단계(`ring-m`) 동안 그어지고, `fade` 에서 함께 흐려진다.
  const fade = 1 - timeline.at('fade');
  for (let m = 1; m <= c.markedRings; m++) {
    const p = timeline.at(ringPhaseId(m));
    if (p <= 0 || fade <= 0) continue;
    const y = thicknessY(halfWaveThickness(m, c));
    const x = darkRingRadius(m, c) * kx;
    const path: Vec2[] = [
      [RULER_X, y],
      [x, y],
      [x, DISC_TOP],
    ];
    out.push({
      type: 'trajectory',
      id: `guide-${m}`,
      points: partialPath(path, p),
      width: GUIDE_WIDTH_PX,
      opacity: fade,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: `curve-dot-${m}`,
      pos: [x, y],
      shape: 'circle',
      size: CURVE_DOT_R,
      outline: 'none',
      glow: false,
      opacity: p * fade,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: `ring-mark-${m}`,
      pos: [x, DISC_TOP],
      shape: 'circle',
      size: RING_MARK_R,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: p * fade,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 위에서 본 무늬 — 아래 반원. 칸마다 그 반지름의 반사 세기 × 단색광 색. */
function ringPattern(c: NewtonsRingsConstants, kx: number): Primitive {
  const light = sourceLight(c);
  const values = new Array<number>(DISC_COLS * DISC_ROWS * 3);
  for (let j = 0; j < DISC_ROWS; j++) {
    // 첫 행이 위 — 지름 바로 아래.
    const dy = ((j + 0.5) / DISC_ROWS) * DISC_R;
    for (let i = 0; i < DISC_COLS; i++) {
      const dx = -DISC_R + ((i + 0.5) / DISC_COLS) * 2 * DISC_R;
      const r = Math.hypot(dx, dy);
      const o = (j * DISC_COLS + i) * 3;
      if (r > DISC_R) {
        values[o] = Number.NaN;
        values[o + 1] = Number.NaN;
        values[o + 2] = Number.NaN;
        continue;
      }
      const s = reflectedIntensity(r / kx, c);
      values[o] = light[0] * s;
      values[o + 1] = light[1] * s;
      values[o + 2] = light[2] * s;
    }
  }
  return {
    type: 'scalarField',
    id: 'ring-pattern',
    min: [-DISC_R, DISC_TOP - DISC_R],
    max: [DISC_R, DISC_TOP],
    cols: DISC_COLS,
    rows: DISC_ROWS,
    values,
    range: [0, 1],
    colors: 'lightRgb',
  };
}

/** 고정 경계. 상태를 보지 않으므로 매 프레임 같다 — 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
