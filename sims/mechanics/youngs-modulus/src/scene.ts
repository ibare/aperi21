// ========================================================================
// youngs-modulus — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 천장은 `body` rect + `trace` tick(빗금), 선 이름 · 추 글자 ·
// 늘어난 길이 · 배율 안내는 `readout`, 긴 강철선 눈금 높이는 `trajectory` dashed,
// 늘어나기 전 눈금 자리와 선의 눈금은 `trace` tick, 선은 `trajectory`, 추와 받침대는
// `body` rect. 캡션은 캡션 슬롯이 그린다.
//
// ---- 월드 = 원본 캔버스 ----
// **원본 캔버스 1px 을 월드 1 로** 두고 y 만 위로 뒤집는다. 배치 상수를 그대로 옮긴다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { loadShare, platformU, stretchMM } from './physics';
import { DIAMETER_MM, MARK_M, MASS, REFERENCE_WIRE, WIRES, text, type Material } from './schema';
import type { YoungsModulusState } from './state';

// ------------------------------------------------------------------------
// 배치 — 원본 index.html 의 상수 그대로
// ------------------------------------------------------------------------

/** 원본 캔버스(px). */
const W = 860;
const H = 430;
/** 캡션이 캔버스 안으로 들어오며 그림 아래 더 잡는 자리(원본 px). */
const CAPTION_ROOM = 40;

/** 원본 px(y 아래) → 월드(y 위). */
const at = (x: number, y: number): Vec2 => [x, H - y];

/** 받침대 기둥이 멈추는 높이 (그 아래는 배율 안내 자리). */
const FLOOR_Y = H - 28;
const CEIL_Y = 44;
/** 선 길이 배율(px/m). */
const PX_PER_M = 110;
/** 늘어난 길이 배율(px/mm) — 실제 배율보다 크게 부풀림. */
const PX_PER_MM_STRETCH = 80;
/** 부풀림 배율 — 안내 글자가 말하는 값. */
const EXAGGERATION = PX_PER_MM_STRETCH / (PX_PER_M / 1000);
const WIRE_X = [170, 430, 690] as const;

/** 천장 판 — 좌우 여백 · 두께, 빗금 시작 · 간격 · 한 획의 가로(=세로) 폭. */
const CEIL_MARGIN = 40;
const CEIL_T = 12;
const HATCH_X0 = 44;
const HATCH_DX = 14;
const HATCH_RUN = 10;
/** 선 이름이 천장 위로 뜬 거리(기준선). */
const NAME_DY = 28;
/** 점선의 좌우 여백. */
const GUIDE_MARGIN = 60;
/** 늘어나기 전 눈금 자리 — 선 왼쪽 34~22 px. */
const REST_TICK_X0 = 34;
const REST_TICK_X1 = 22;
/** 선의 눈금 반 길이. */
const TICK_HALF = 9;
/** 추 — 선 끝에서 걸이까지, 폭 · 높이, 글자 기준선. */
const HOOK = 4;
const WEIGHT_W = 40;
const WEIGHT_H = 32;
const WEIGHT_LABEL_DY = 25;
/** 받침대 — 추 윗면에서 판까지, 판 폭 · 두께, 기둥 반폭, 밑판 폭 · 두께. */
const PLATE_DY = 36;
const PLATE_W = 60;
const PLATE_T = 8;
const POST_HALF = 3;
const BASE_W = 44;
const BASE_T = 4;
/** u 가 1 을 넘은 만큼 받침대가 추에서 떨어지는 거리(px). */
const GAP_PX_PER_U = 60;
/** 늘어난 길이 글자 — 선에서 오른쪽, 선 끝에서 아래(기준선). */
const STRETCH_LABEL_DX = 30;
const STRETCH_LABEL_DY = 24;
/** 배율 안내 — 오른쪽 여백 · 아래 여백(기준선). */
const NOTE_RIGHT = 44;
const NOTE_BOTTOM = 10;

/**
 * 원본 캔버스 글자는 기준선(alphabetic)에 놓였고 readout 은 가운데(middle)에 놓는다.
 * 12~14px 글자에서 기준선과 가운데의 거리.
 */
const BASELINE_TO_MIDDLE = 5;

// ------------------------------------------------------------------------
// 굵기 · 글자 — 원본 px
// ------------------------------------------------------------------------

const NAME_FONT_PX = 14;
const STRETCH_FONT_PX = 13;
const SMALL_FONT_PX = 12;
const W_THIN = 1;
const W_LINE = 2;
const W_TICK = 3;
/**
 * 점선 굵기. 원본은 1px 을 반 픽셀에 맞춰(`round + 0.5`) 선명하게 그었다. 여기서는 월드가
 * 화면에 배율로 옮겨져 줄마다 걸리는 픽셀 위치가 달라, 1px 이면 반 픽셀에 걸린 줄만 두 칸으로
 * 번져 회색으로 옅어진다. 여덟 줄이 같은 진하기로 보이도록 조금 굵게 긋는다 (NOTES 「어휘 부족」).
 */
const W_GUIDE = 1.5;

// ------------------------------------------------------------------------
// 색 — 강조색(accent)은 긴 강철선 눈금의 지금 높이(점선) 하나에만.
// 강철 두 선은 같은 재료라 같은 색, 알루미늄은 옅은 먹. 나머지는 회색.
// ------------------------------------------------------------------------

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const GUIDE = { colorRole: 'accent', emphasis: 'strong' } as const;
/** 원본 점선 알파. 여덟 줄 모두 같은 진하기다 — 같은 뜻(긴 강철선 눈금 높이)이다. */
const GUIDE_OPACITY = 0.85;
/** 재료별 선 색 — 원본 강철은 짙은 회먹, 알루미늄은 옅은 회갈. */
const WIRE_STYLE: Record<Material, { style: typeof INK | typeof MUTED; opacity: number }> = {
  steel: { style: INK, opacity: 0.78 },
  aluminium: { style: MUTED, opacity: 0.7 },
};
/** 천장 판 · 빗금 · 옛 눈금 · 받침대 · 추의 옅기 — 원본의 옅은 회색 칠들. */
const CEIL_OPACITY = 0.3;
const HATCH_OPACITY = 0.45;
const REST_TICK_OPACITY = 0.35;
const PLATFORM_OPACITY = 0.22;
/** 추 — 원본은 짙은 갈색 칠에 바탕색 글자였다. 바탕색 글자 어휘가 없어 칠을 옅게 하고 먹 글자를 얹는다. */
const WEIGHT_OPACITY = 0.5;

function label(
  id: string,
  pos: Vec2,
  text_: Readout['text'],
  align: NonNullable<Readout['align']>,
  style: Readout['style'],
  fontSize: number,
  vars?: Readout['vars'],
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text_,
    vars,
    chip: false,
    align,
    font: 'text',
    fontSize,
    style,
  };
}

function rect(id: string, cx: number, cy: number, w: number, h: number, style: Body['style'], opacity: number): Body {
  return {
    type: 'body',
    id,
    shape: 'rect',
    pos: at(cx, cy),
    size: [w, h],
    outline: 'none',
    style,
    opacity,
  };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: YoungsModulusState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('youngs-modulus: schema.timeline 이 선언되어야 한다');

  const u = platformU(tl);
  const f = loadShare(u);
  const gapPx = Math.max(0, u - 1) * GAP_PX_PER_U;
  /** 선 위에서 천장으로부터 lengthM 인 물질 지점의 지금 높이(원본 px). */
  const yAt = (E: number, lengthM: number): number =>
    CEIL_Y + lengthM * PX_PER_M + stretchMM(E, f, lengthM) * PX_PER_MM_STRETCH;
  const out: Primitive[] = [];

  // ---- 천장 ----
  out.push(rect('ceiling', W / 2, CEIL_Y - CEIL_T / 2, W - CEIL_MARGIN * 2, CEIL_T, MUTED, CEIL_OPACITY));
  const hatch: Trace['marks'][number][] = [];
  for (let x = HATCH_X0; x < W - HATCH_X0; x += HATCH_DX) {
    // 원본 획: (x, CEIL_Y-12) → (x+10, CEIL_Y-22). 가운데와 방향으로 옮긴다.
    hatch.push({ pos: at(x + HATCH_RUN / 2, CEIL_Y - CEIL_T - HATCH_RUN / 2) });
  }
  const hatchTrace: Trace = {
    type: 'trace',
    id: 'ceiling-hatch',
    marks: hatch,
    shape: 'tick',
    size: Math.hypot(HATCH_RUN, HATCH_RUN),
    direction: [1, 1],
    width: W_THIN,
    style: MUTED,
    opacity: HATCH_OPACITY,
  };
  out.push(hatchTrace);

  // ---- 선 이름 ----
  WIRES.forEach((w, i) => {
    out.push(
      label(
        `name-${w.id}`,
        at(WIRE_X[i]!, CEIL_Y - NAME_DY - BASELINE_TO_MIDDLE),
        text(w.material === 'steel' ? 'label.wire.steel' : 'label.wire.aluminium'),
        'center',
        INK,
        NAME_FONT_PX,
        { l: w.lengthM },
      ),
    );
  });

  // ---- 긴 강철선 눈금 높이 ----
  // 가운데 긴 강철선의 눈금 높이를 가로로 끌어 온다 — 다른 선의 눈금이 그 높이에 오는지 본다.
  const ref = WIRES[REFERENCE_WIRE]!;
  const refMarks = Math.round(ref.lengthM / MARK_M);
  for (let k = 1; k <= refMarks; k++) {
    const y = yAt(ref.E, k * MARK_M);
    const guide: Trajectory = {
      type: 'trajectory',
      id: `guide-${k}`,
      points: [at(GUIDE_MARGIN, y), at(W - GUIDE_MARGIN, y)],
      width: W_GUIDE,
      style: { ...GUIDE, lineStyle: 'dashed' },
      opacity: GUIDE_OPACITY,
    };
    out.push(guide);
  }

  // ---- 늘어나기 전 눈금 자리 ----
  const rest: Trace['marks'][number][] = [];
  WIRES.forEach((w, i) => {
    const n = Math.round(w.lengthM / MARK_M);
    for (let k = 1; k <= n; k++) {
      rest.push({ pos: at(WIRE_X[i]! - (REST_TICK_X0 + REST_TICK_X1) / 2, CEIL_Y + k * MARK_M * PX_PER_M) });
    }
  });
  const restTrace: Trace = {
    type: 'trace',
    id: 'rest-marks',
    marks: rest,
    shape: 'tick',
    size: REST_TICK_X0 - REST_TICK_X1,
    direction: [1, 0],
    width: W_LINE,
    style: MUTED,
    opacity: REST_TICK_OPACITY,
  };
  out.push(restTrace);

  // ---- 선 ----
  WIRES.forEach((w, i) => {
    const look = WIRE_STYLE[w.material];
    const wire: Trajectory = {
      type: 'trajectory',
      id: `wire-${w.id}`,
      points: [at(WIRE_X[i]!, CEIL_Y), at(WIRE_X[i]!, yAt(w.E, w.lengthM))],
      width: W_LINE,
      style: look.style,
      opacity: look.opacity,
    };
    out.push(wire);
  });

  // ---- 선의 눈금 ----
  // 선의 같은 물질 지점 — 선이 늘면 함께 내려간다.
  WIRES.forEach((w, i) => {
    const look = WIRE_STYLE[w.material];
    const n = Math.round(w.lengthM / MARK_M);
    const marks: Trace['marks'][number][] = [];
    for (let k = 1; k <= n; k++) marks.push({ pos: at(WIRE_X[i]!, yAt(w.E, k * MARK_M)) });
    const ticks: Trace = {
      type: 'trace',
      id: `marks-${w.id}`,
      marks,
      shape: 'tick',
      size: TICK_HALF * 2,
      direction: [1, 0],
      width: W_TICK,
      style: look.style,
      opacity: look.opacity,
    };
    out.push(ticks);
  });

  // ---- 추 ----
  WIRES.forEach((w, i) => {
    const top = yAt(w.E, w.lengthM);
    const x = WIRE_X[i]!;
    out.push(rect(`weight-${w.id}`, x, top + HOOK + WEIGHT_H / 2, WEIGHT_W, WEIGHT_H, MUTED, WEIGHT_OPACITY));
    const hook: Trajectory = {
      type: 'trajectory',
      id: `hook-${w.id}`,
      points: [at(x, top), at(x, top + HOOK)],
      width: W_LINE,
      style: MUTED,
      opacity: WEIGHT_OPACITY,
    };
    out.push(hook);
    out.push(
      label(
        `mass-${w.id}`,
        at(x, top + WEIGHT_LABEL_DY - BASELINE_TO_MIDDLE),
        text('label.mass'),
        'center',
        INK,
        SMALL_FONT_PX,
        { m: MASS },
      ),
    );
  });

  // ---- 받침대 ----
  WIRES.forEach((w, i) => {
    const y = yAt(w.E, w.lengthM) + PLATE_DY + gapPx;
    const x = WIRE_X[i]!;
    out.push(rect(`plate-${w.id}`, x, y + PLATE_T / 2, PLATE_W, PLATE_T, MUTED, PLATFORM_OPACITY));
    const postH = Math.max(0, FLOOR_Y - y - PLATE_T);
    if (postH > 0) {
      out.push(rect(`post-${w.id}`, x, y + PLATE_T + postH / 2, POST_HALF * 2, postH, MUTED, PLATFORM_OPACITY));
    }
    out.push(rect(`base-${w.id}`, x, FLOOR_Y - BASE_T / 2, BASE_W, BASE_T, MUTED, PLATFORM_OPACITY));
  });

  // ---- 늘어난 길이 ----
  WIRES.forEach((w, i) => {
    const y = yAt(w.E, w.lengthM) + STRETCH_LABEL_DY;
    out.push(
      label(
        `stretch-${w.id}`,
        at(WIRE_X[i]! + STRETCH_LABEL_DX, y - BASELINE_TO_MIDDLE),
        text('label.stretch'),
        'left',
        INK,
        STRETCH_FONT_PX,
        { x: stretchMM(w.E, f, w.lengthM).toFixed(2) },
      ),
    );
  });

  // ---- 배율 안내 ----
  out.push(
    label(
      'scale-note',
      at(W - NOTE_RIGHT, H - NOTE_BOTTOM - BASELINE_TO_MIDDLE),
      text('label.scaleNote'),
      'right',
      MUTED,
      SMALL_FONT_PX,
      {
        k: Math.round(EXAGGERATION / 10) * 10,
        d: DIAMETER_MM.toFixed(1),
        c: MARK_M * 100,
      },
    ),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/**
 * 고정 경계. 원본 캔버스 한 장(860 × 430)을 그대로 담고, 아래로 캡션 자리를 더 잡는다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
 */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { minX: 0, maxX: W, minY: -CAPTION_ROOM, maxY: H };
}
