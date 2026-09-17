// ========================================================================
// stress-strain-curve — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 벽·막대·손잡이는 `body` rect, 빗금·처음 길이 점선·괄호·
// 곡선 축·자취·남은 선분은 `trajectory`, 당기는 힘은 `vector`, 지금 상태 점은 `body`
// circle, 글자는 `readout`. 캡션은 선언의 캡션 슬롯이 그린다.
//
// ---- 월드 = 원본 캔버스 ----
// 원본은 860 × 300 캔버스 한 장에 막대(왼쪽)와 곡선 판(오른쪽)을 나란히 놓았다.
// **원본 캔버스 1px 을 월드 1 로** 두고 y 만 위로 뒤집는다. 곡선 판은 화면 카드
// (`graph`)가 아니라 막대와 같은 월드에 긋는다 — 막대와 점이 한 판에서 같은 시각에
// 움직여야 둘이 한 대상으로 읽힌다. 선 굵기 · 글자 크기는 화면 px 그대로다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { materialAt, revealAt, sceneOpacityAt } from './physics';
import { REVEAL_FADE, text } from './schema';
import type { StressStrainCurveState } from './state';

// ------------------------------------------------------------------------
// 배치 — 원본 index.html 의 상수 그대로
// ------------------------------------------------------------------------

/** 원본 캔버스(px). */
const W = 860;
const H = 300;

/** 원본 px(y 아래) → 월드(y 위). */
const at = (x: number, y: number): Vec2 => [x, H - y];

const WALL_X = 40;
const BAR_Y = 150;
const REST_LENGTH = 170;
/** 변형률 1 당 막대가 늘어나는 길이(과장). */
const PX_PER_STRAIN = 30;
const BAR_THICKNESS = 26;
/** 늘어날수록 가늘어지는 정도 — 두께 = 26 / √(1 + 0.12 e). */
const THINNING = 0.12;
/** 벽 판 — 폭과 반높이. 빗금 6 줄, 18 px 간격, 12 px 기울기. */
const WALL_W = 10;
const WALL_HALF = 50;
const HATCH_COUNT = 6;
const HATCH_GAP = 18;
const HATCH_RUN = 12;
/** 처음 길이 점선의 반길이와 글자 자리. */
const REST_MARK_HALF = 44;
const REST_LABEL_DY = 58;
/** 손잡이. */
const GRIP_W = 12;
const GRIP_HALF = 20;
/** 힘 화살표 — 손잡이에서 띄운 틈, 최대 응력 때 길이, 촉 여유, 그리지 않는 문턱. */
const FORCE_GAP = 16;
const FORCE_LENGTH = 55;
const FORCE_HEAD_ROOM = 10;
const FORCE_MIN = 3;
/** 남은 늘어남 괄호 — 막대 위 높이, 다리 길이, 글자 높이. */
const BRACKET_DY = 40;
const BRACKET_LEG = 8;
const BRACKET_LABEL_DY = 14;

/** 곡선 판. 원점(x0, y0) · 너비 · 높이 · 축이 담는 최대 변형률 · 최대 응력. */
const PLOT = { x0: 470, y0: 250, width: 360, height: 190, eMax: 5.6, sMax: 2.1 } as const;
/** 축선이 판 너머로 나가는 길이. */
const AXIS_OVERHANG = 12;
const cx = (e: number): number => PLOT.x0 + (e / PLOT.eMax) * PLOT.width;
const cy = (s: number): number => PLOT.y0 - (s / PLOT.sMax) * PLOT.height;
const onPlot = ([e, s]: Vec2): Vec2 => at(cx(e), cy(s));

// ------------------------------------------------------------------------
// 굵기 · 글자 — 원본 px
// ------------------------------------------------------------------------

const FONT_PX = 14;
const W_HATCH = 1;
const W_REST_MARK = 1;
const W_FORCE = 2.5;
const FORCE_HEAD = 12;
const W_BRACKET = 3;
const W_AXIS = 1.2;
const W_TRAIL = 2.5;
const W_RESIDUAL = 5;
const DOT_R = 6.5;

// ------------------------------------------------------------------------
// 색 — 원본의 다섯 색을 역할로
// ------------------------------------------------------------------------
// 막대와 지금 상태 점은 **같은 색**이다 — 한 대상의 두 모습. 강조색은 한 뜻,
// '힘을 빼도 남은 늘어남' 에만 쓴다 (막대 괄호와 축 위 선분이 같은 양).

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 원본의 흐린먹 — 빗금 · 점선 · 축과 그 글자가 한 색이다. */
const FAINT = { colorRole: 'muted', emphasis: 'medium' } as const;
const BAR = { colorRole: 'secondary', emphasis: 'strong' } as const;
const RESIDUAL = { colorRole: 'accent', emphasis: 'strong' } as const;

function line(
  id: string,
  points: readonly Vec2[],
  width: number,
  style: Trajectory['style'],
  opacity?: number,
): Trajectory {
  return { type: 'trajectory', id, points, width, style, ...(opacity !== undefined ? { opacity } : {}) };
}

function rect(id: string, x: number, y: number, w: number, h: number, style: Body['style'], opacity: number): Body {
  return {
    type: 'body',
    id,
    shape: 'rect',
    pos: at(x + w / 2, y + h / 2),
    size: [w, h],
    outline: 'none',
    style,
    opacity,
  };
}

function label(
  id: string,
  pos: Vec2,
  text_: Readout['text'],
  align: NonNullable<Readout['align']>,
  style: Readout['style'],
  opacity?: number,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text_,
    chip: false,
    align,
    font: 'text',
    fontSize: FONT_PX,
    style,
    ...(opacity !== undefined ? { opacity } : {}),
  };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: StressStrainCurveState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('stress-strain-curve: schema.timeline 이 선언되어야 한다');
  const m = materialAt(tl);
  const a = sceneOpacityAt(tl);
  const reveal = revealAt(tl, REVEAL_FADE);
  const out: Primitive[] = [];

  const barLength = REST_LENGTH + m.e * PX_PER_STRAIN;
  const endX = WALL_X + barLength;
  const thickness = BAR_THICKNESS / Math.sqrt(1 + THINNING * m.e);
  const restX = WALL_X + REST_LENGTH;

  // ---- 벽 ---- (흐려지지 않는다)
  out.push(rect('wall', WALL_X - WALL_W, BAR_Y - WALL_HALF, WALL_W, WALL_HALF * 2, INK, 1));
  for (let i = 0; i < HATCH_COUNT; i++) {
    const y = BAR_Y - WALL_HALF + i * HATCH_GAP;
    out.push(
      line(`wall-hatch-${i}`, [at(WALL_X - WALL_W, y + HATCH_RUN), at(WALL_X - WALL_W - HATCH_RUN, y)], W_HATCH, FAINT),
    );
  }

  // ---- 처음 길이 ---- (흐려지지 않는다 — 새 막대의 기준이기도 하다)
  out.push(
    line('rest-length', [at(restX, BAR_Y - REST_MARK_HALF), at(restX, BAR_Y + REST_MARK_HALF)], W_REST_MARK, {
      ...FAINT,
      lineStyle: 'dashed',
    }),
  );
  out.push(label('rest-length-label', at(restX, BAR_Y + REST_LABEL_DY), text('label.initialLength'), 'center', FAINT));

  // ---- 막대와 손잡이 ----
  out.push(rect('bar', WALL_X, BAR_Y - thickness / 2, barLength, thickness, BAR, a));
  out.push(rect('grip', endX, BAR_Y - GRIP_HALF, GRIP_W, GRIP_HALF * 2, BAR, a));

  // ---- 당기는 힘 ----
  // 길이가 응력에 비례한다. 놓아 힘이 0 이면 사라진다 — 화살표가 없는데 막대가
  // 긴 것이 이 조각의 핵심 장면이다.
  const forceLength = (m.s / PLOT.sMax) * FORCE_LENGTH;
  if (forceLength >= FORCE_MIN) {
    const force: Vector = {
      type: 'vector',
      id: 'force',
      from: at(endX + FORCE_GAP, BAR_Y),
      delta: [forceLength + FORCE_HEAD_ROOM, 0],
      width: W_FORCE,
      headSize: FORCE_HEAD,
      style: INK,
      opacity: a,
    };
    out.push(force);
  }

  // ---- 남은 늘어남 (막대) ----
  if (reveal > 0) {
    const y = BAR_Y - BRACKET_DY;
    out.push(
      line(
        'residual-bracket',
        [at(restX, y + BRACKET_LEG), at(restX, y), at(endX, y), at(endX, y + BRACKET_LEG)],
        W_BRACKET,
        RESIDUAL,
        a * reveal,
      ),
    );
    out.push(
      label('residual-label', at((restX + endX) / 2, y - BRACKET_LABEL_DY), text('label.residual'), 'center', RESIDUAL, a * reveal),
    );
  }

  // ---- 곡선 축 ---- (흐려지지 않는다)
  out.push(
    line(
      'axes',
      [at(PLOT.x0, PLOT.y0 - PLOT.height - AXIS_OVERHANG), at(PLOT.x0, PLOT.y0), at(PLOT.x0 + PLOT.width + AXIS_OVERHANG, PLOT.y0)],
      W_AXIS,
      FAINT,
    ),
  );
  out.push(label('axis-stress', at(PLOT.x0 + 8, PLOT.y0 - PLOT.height - 8), text('label.stress'), 'left', FAINT));
  out.push(label('axis-strain', at(PLOT.x0 + PLOT.width + AXIS_OVERHANG, PLOT.y0 + 18), text('label.strain'), 'right', FAINT));
  out.push(label('axis-origin', at(PLOT.x0 - 10, PLOT.y0 + 12), text('label.origin'), 'center', FAINT));

  // ---- 지나온 곡선 ----
  if (m.trail.length >= 2) out.push(line('trail', m.trail.map(onPlot), W_TRAIL, INK, a));

  // ---- 남은 늘어남 (곡선) ----
  if (reveal > 0 && m.residual > 0) {
    out.push(line('residual-strain', [onPlot([0, 0]), onPlot([m.residual, 0])], W_RESIDUAL, RESIDUAL, a * reveal));
  }

  // ---- 지금 상태 점 ----
  const dot: Body = {
    type: 'body',
    id: 'state-dot',
    shape: 'circle',
    pos: onPlot([m.e, m.s]),
    size: DOT_R,
    glow: false,
    outline: 'none',
    style: BAR,
    opacity: a,
  };
  out.push(dot);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/**
 * 고정 경계. 원본 캔버스 한 장(860 × 300, 캡션 포함)을 그대로 담는다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
 */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { minX: 0, maxX: W, minY: 0, maxY: H };
}
