// ========================================================================
// measurement-collapse — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 분포 곡선 · 축 · 결과 줄 · 섬광은
// `trajectory`, 분포 아래 채움은 `region`, 측정 결과는 `body`, 판 기호 · 줄 이름은
// `readout` 이다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 판과 결과 두 줄이 같은 x 를 쓴다 — 한 세로줄이 한 자리다.
//
// 색은 뜻마다 하나다. 분포(재기 전 · 직후 모두 같은 입자의 있을 곳)는 먹색 곡선과 primary
// 채움, 축 · 줄 · 이름 · 재기 전 모양의 잔상은 muted. **강조색은 「측정 결과」 한 뜻에만** —
// 섬광과 결과 원.
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
  collapsedDensity,
  collapsedPeak,
  drawCycle,
  readConstants,
  spreadDensity,
} from './physics';
import {
  FLASH_TOP,
  LABEL_GAP,
  NARROW_PEAK_H,
  ROW_AGAIN_Y,
  ROW_FIRST_Y,
  SCENE_BOUNDS,
  X_HALF,
  X_SCALE,
  text,
  type MeasurementCollapseMessageKey,
} from './schema';
import type { MeasurementCollapseState } from './state';

/** 곡선 표본 수 — 좁은 묶음(폭 0.3)에도 스무 점 넘게 걸린다. */
const CURVE_SAMPLES = 400;
/** 곡선 · 축 · 줄 · 섬광 · 잔상 굵기(화면 px). */
const CURVE_WIDTH_PX = 2.5;
const AXIS_WIDTH_PX = 1;
const ROW_WIDTH_PX = 1;
const FLASH_WIDTH_PX = 1.5;
const GHOST_WIDTH_PX = 1.5;
/** 분포 아래 채움의 짙기. */
const FILL_OPACITY = 0.3;
/** 결과 원의 반지름(월드). */
const RESULT_SIZE = 0.28;
/** 판 기호 · 줄 이름 글자 크기(화면 px). */
const SYMBOL_PX = 16;
const NAME_PX = 12;

export function scene(params: {
  state: MeasurementCollapseState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('measurement-collapse: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const peak = collapsedPeak(c);
  const scale = peak > 0 ? NARROW_PEAK_H / peak : 0;
  const left = -X_HALF * X_SCALE;
  const right = X_HALF * X_SCALE;
  const wx = (x: number): number => x * X_SCALE;
  const { first, again } = drawCycle(c, tl.cycle);
  const out: Primitive[] = [];

  const shown = 1 - tl.at('clear');
  const measured = tl.at('measure');
  const collapsed = tl.at('collapse');
  const remeasured = tl.at('remeasure');

  const line = (id: string, y: number, width: number): Primitive => ({
    type: 'trajectory',
    id,
    points: [
      [left, y],
      [right, y],
    ],
    width,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const name = (
    id: string,
    y: number,
    k: MeasurementCollapseMessageKey,
    px: number,
    role: 'ink' | 'muted',
  ): Primitive => ({
    type: 'readout',
    id,
    anchor: { world: [left - LABEL_GAP, y] },
    text: text(k),
    chip: false,
    font: 'text',
    fontSize: px,
    align: 'right',
    style: { colorRole: role, emphasis: 'strong' },
  });

  // ---- 판 — 축과 기호 ----
  out.push(line('axis', 0, AXIS_WIDTH_PX));
  // `|ψ|²` 를 기울이면 절댓값 막대가 빗금처럼 누워 읽히지 않는다 — 곧게 세운다 (`wave-function`).
  out.push(name('prob-label', 0, 'label.prob', SYMBOL_PX, 'ink'));

  // ---- 재기 전 모양의 잔상 — 붕괴하는 동안 떠올라, 무엇이 모였는지 남긴다 ----
  const curveOf = (density: (x: number) => number): Vec2[] => {
    const pts: Vec2[] = [];
    for (let i = 0; i <= CURVE_SAMPLES; i++) {
      const x = -X_HALF + (2 * X_HALF * i) / CURVE_SAMPLES;
      pts.push([wx(x), scale * density(x)]);
    }
    return pts;
  };
  if (collapsed > 0 && shown > 0) {
    out.push({
      type: 'trajectory',
      id: 'before',
      points: curveOf((x) => spreadDensity(x, c)),
      width: GHOST_WIDTH_PX,
      opacity: collapsed * shown,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 분포 — 재기 전 모양에서 측정 직후 묶음으로, 넓이를 지키며 섞는다 ----
  const fade = tl.at('prepare') * shown;
  if (fade > 0) {
    const pts = curveOf(
      (x) => (1 - collapsed) * spreadDensity(x, c) + collapsed * collapsedDensity(x, first, c),
    );
    out.push({
      type: 'region',
      id: 'fill',
      points: [[left, 0], ...pts, [right, 0]],
      fillOpacity: FILL_OPACITY,
      opacity: fade,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
    out.push({
      type: 'trajectory',
      id: 'density',
      points: pts,
      width: CURVE_WIDTH_PX,
      opacity: fade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 결과 두 줄 ----
  out.push(line('row-first', ROW_FIRST_Y, ROW_WIDTH_PX));
  out.push(name('row-first-label', ROW_FIRST_Y, 'label.first', NAME_PX, 'muted'));
  out.push(line('row-again', ROW_AGAIN_Y, ROW_WIDTH_PX));
  out.push(name('row-again-label', ROW_AGAIN_Y, 'label.again', NAME_PX, 'muted'));

  // ---- 측정 — 섬광이 결과 자리로 떨어지고, 그 줄에 결과 원이 선다 ----
  const flash = (id: string, x: number, toY: number, grow: number, opacity: number): Primitive => ({
    type: 'trajectory',
    id,
    points: [
      [wx(x), FLASH_TOP],
      [wx(x), FLASH_TOP - (FLASH_TOP - toY) * grow],
    ],
    width: FLASH_WIDTH_PX,
    opacity,
    style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
  });
  const result = (id: string, x: number, y: number, opacity: number): Primitive => ({
    type: 'body',
    id,
    pos: [wx(x), y],
    shape: 'circle',
    size: RESULT_SIZE,
    glow: false,
    outline: 'background',
    opacity,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 첫 섬광은 두 번째 섬광이 떨어지는 동안 걷힌다 — 한 세로줄에 두 섬광이 겹치지 않게.
  const firstFlash = (1 - remeasured) * shown;
  if (measured > 0 && firstFlash > 0) {
    out.push(flash('flash-first', first, ROW_FIRST_Y, measured, firstFlash));
  }
  if (remeasured > 0 && shown > 0) {
    out.push(flash('flash-again', again, ROW_AGAIN_Y, remeasured, shown));
  }
  if (measured > 0 && shown > 0) {
    out.push(result('result-first', first, ROW_FIRST_Y, measured * shown));
  }
  if (remeasured > 0 && shown > 0) {
    out.push(result('result-again', again, ROW_AGAIN_Y, remeasured * shown));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
