// ========================================================================
// standing-wave — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 성분 · 합 곡선은 `trajectory`, 마디는 `marker`,
// 시간 자취 무늬(가로 = 위치, 세로 = 시간)는 **`scalarField` 하나**, 세로축 양 끝
// 글자는 `readout` 이다. 캡션은 선언의 캡션 슬롯이 그린다.
// ========================================================================

import type {
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { isStanding, leftAmpAt, leftAmpNow, leftWave, rightWave } from './physics';
import {
  AMP,
  HISTORY,
  NODE_COUNT,
  NODE_SHIFT,
  PLOT_LEFT,
  PLOT_RIGHT,
  SCENE_BOUNDS,
  STRING_Y,
  TRACE_BOTTOM,
  TRACE_COLS,
  TRACE_ROWS,
  TRACE_TOP,
  WAVELENGTHS,
  text,
} from './schema';
import type { StandingWaveState } from './state';

/** 곡선 표본 간격(월드). 원본 2 px. */
const SAMPLE_STEP = 2;
/** 성분 곡선 굵기 · 합쳐진 줄 굵기(화면 px). 원본 1.25 · 2.5. */
const COMPONENT_WIDTH = 1.25;
const STRING_WIDTH = 2.5;
/** 반대 방향 진폭이 이보다 작으면 점선을 두지 않는다. 원본 0.001. */
const HIDE_BELOW = 0.001;
/** 시간 눈금 글자가 무늬 왼쪽 끝에서 떨어지는 거리(화면 px). 원본 8. */
const TICK_GAP_PX = 8;
/** 시간 눈금 글자 크기(화면 px). 원본 12. */
const TICK_FONT_PX = 12;
/**
 * 시간 눈금을 무늬 위 · 아래 끝선에 붙이는 세로 이동(화면 px). 원본은 기준선 top · bottom
 * 이었는데 월드 앵커 readout 은 가운데 정렬뿐이라 글자 반 높이만큼 옮긴다 (장부 G16).
 */
const TICK_HALF_PX = 7;

const plotW = PLOT_RIGHT - PLOT_LEFT;
const xOf = (u: number): number => PLOT_LEFT + (u / WAVELENGTHS) * plotW;

/** 같은 가로 표본에 곡선 하나를 뽑는다. */
function curve(fn: (u: number) => number): Vec2[] {
  const pts: Vec2[] = [];
  for (let px = 0; px <= plotW; px += SAMPLE_STEP) {
    const u = (px / plotW) * WAVELENGTHS;
    pts.push([PLOT_LEFT + px, STRING_Y + AMP * fn(u)]);
  }
  return pts;
}

export function scene(params: {
  state: StandingWaveState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('standing-wave: schema.timeline 이 선언되어야 한다');
  const t = tl.t;
  const aL = leftAmpNow(tl);
  const out: Primitive[] = [];

  // ---- 성분 파동 ----
  // 두 성분은 같은 부류라 같은 색이다. 오른쪽 = 실선, 왼쪽 = 점선.
  const right: Trajectory = {
    type: 'trajectory',
    id: 'wave-right',
    points: curve((u) => rightWave(u, t)),
    width: COMPONENT_WIDTH,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'solid' },
  };
  out.push(right);

  if (aL > HIDE_BELOW) {
    out.push({
      type: 'trajectory',
      id: 'wave-left',
      points: curve((u) => aL * leftWave(u, t)),
      width: COMPONENT_WIDTH,
      style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
    });
  }

  // ---- 합쳐진 줄 ----
  out.push({
    type: 'trajectory',
    id: 'string',
    points: curve((u) => rightWave(u, t) + aL * leftWave(u, t)),
    width: STRING_WIDTH,
    style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'solid' },
  });

  // ---- 마디 ----
  // 강조색은 「마디 위치」 한 뜻에만. 반대 방향 진폭이 정확히 같은 구간에만 켠다 —
  // 캡션도 같은 단계에서 나오므로 점과 「마디는 제자리에」 가 어긋나지 않는다.
  if (isStanding(tl)) {
    for (let m = 0; m < NODE_COUNT; m++) {
      out.push({
        type: 'marker',
        id: `node-${m}`,
        kind: 'pin',
        pos: [xOf(NODE_SHIFT + m * 0.5), STRING_Y],
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // ---- 시간 자취 무늬 ----
  // 가로 = 위치, 세로 = 시간(맨 위 행 = 지금, 맨 아래 행 = HISTORY 초 전). 과거 행도
  // 시각 t' 의 함수로 다시 계산한다. 값은 두 성분 합의 절반 — 파랑 +, 붉은 −, 0 은 바탕.
  // 0 이 바탕이라 마디 자리는 「세로 빈 줄」 로 보인다.
  const values = new Array<number>(TRACE_COLS * TRACE_ROWS);
  for (let r = 0; r < TRACE_ROWS; r++) {
    const tt = t - (HISTORY * r) / (TRACE_ROWS - 1);
    const a = leftAmpAt(tl, tt);
    for (let c = 0; c < TRACE_COLS; c++) {
      const u = (c / (TRACE_COLS - 1)) * WAVELENGTHS;
      values[r * TRACE_COLS + c] = (rightWave(u, tt) + a * leftWave(u, tt)) / 2;
    }
  }
  out.push({
    type: 'scalarField',
    id: 'time-trace',
    min: [PLOT_LEFT, TRACE_BOTTOM],
    max: [PLOT_RIGHT, TRACE_TOP],
    cols: TRACE_COLS,
    rows: TRACE_ROWS,
    values,
    range: [-1, 1],
    colors: { low: 'negative', high: 'secondary' },
  });

  // ---- 시간 눈금 ----
  // 세로축이 시간이라는 것이 주장의 전제다. 양 끝만 글자로 둔다.
  out.push({
    type: 'readout',
    id: 'tick-now',
    anchor: { world: [PLOT_LEFT, TRACE_TOP], offset: [-TICK_GAP_PX, TICK_HALF_PX] },
    text: text('label.now'),
    chip: false,
    align: 'right',
    font: 'text',
    fontSize: TICK_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'tick-past',
    anchor: { world: [PLOT_LEFT, TRACE_BOTTOM], offset: [-TICK_GAP_PX, -TICK_HALF_PX] },
    text: text('label.past'),
    vars: { s: HISTORY },
    chip: false,
    align: 'right',
    font: 'text',
    fontSize: TICK_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
