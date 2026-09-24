// ========================================================================
// pendulum-amplitude-dependence — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 이 조각은 자유 렌더 계층을 쓰지 않는다. 매단 줄(constraint) · 잔상과 기준선
// (trajectory) · 추와 피벗(body) · 바닥 통과 섬광과 박자 기록띠(trace) ·
// 진폭 이름표(readout) 가 모두 표준 어휘로 있다.
//
// 쓰는 순서가 곧 겹치는 순서다 (`schema.drawOrder: 'scene'`).
// ========================================================================

import type {
  Body,
  Bounds,
  Constraint,
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
import { bobPos, readConstants } from './physics';
import {
  BAND,
  BASELINE_BOTTOM,
  BASELINE_TOP,
  BOB_RADIUS,
  LABEL_X,
  PIVOT,
  PIVOT_RADIUS,
  RATIO,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { PendulumAmplitudeDependenceState } from './state';

/** 기준선 — 옅은 점선 하나(원본 1 px · 불투명도 0.18). */
const BASELINE_WIDTH_PX = 1;
const BASELINE_ALPHA = 0.18;

/**
 * 잔상 — 원본은 최신 구간일수록 굵고(1→6.5 px) 진하다(0→0.30).
 * 농도는 `fade: 'tail'` × `opacity` 로 그대로 나오지만 굵기는 선 하나에 하나뿐이라
 * 중간값을 준다 (NOTES 「어휘 부족」).
 */
const TRAIL_WIDTH_PX = 4;
const TRAIL_ALPHA = 0.3;

/** 매단 줄 — 렌더러가 0.55 를 곱하므로 여기 0.55 를 주면 원본의 0.30 이 된다. */
const STRING_ALPHA = 0.55;

/** 바닥 통과 섬광 — 반지름 8 에서 34 로 퍼지며 0.28 초 만에 사라진다. */
const FLASH_FROM_PX = 8;
const FLASH_TO_PX = 34;
const FLASH_LIFE = 0.28;
const FLASH_WIDTH_PX = 1.5;
const FLASH_ALPHA = 0.85;

/** 박자 획 — 원본은 2×10 px 의 채운 직사각형이다. */
const BAND_STROKE_PX = 2;
const BAND_ALPHA = 0.88;

/** 진폭 이름표 글자 크기(화면 px). */
const LABEL_FONT_PX = 11;

export function scene(params: {
  state: PendulumAmplitudeDependenceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage } = params;
  const c = readConstants(stage);
  const now = state.t;
  const out: Primitive[] = [];

  // ---- 최하점 기준선 ----
  // 주장이 "바닥을 동시에 지난다" 이므로 바닥이 어디인지 화면에 있어야 한다.
  // 진자가 겹쳐 있지 않은 순간에도 기준이 남는다.
  const baseline: Trajectory = {
    type: 'trajectory',
    id: 'floor-line',
    points: [BASELINE_TOP, BASELINE_BOTTOM],
    width: BASELINE_WIDTH_PX,
    opacity: BASELINE_ALPHA,
    style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
  };
  out.push(baseline);

  // ---- 속도 잔상 ----
  // 같은 시간 동안 지나온 호라 잔상 길이가 곧 속력이다. 바닥에서 가장 큰 진자의
  // 잔상은 가장 작은 진자의 다섯 배쯤 된다 — 거리가 다섯 배인데 속도도 다섯
  // 배라 시간이 같다는 것이 화면에서 두 눈금으로 동시에 보인다.
  state.bobs.forEach((b, i) => {
    if (b.trail.length < 2) return;
    const trail: Trajectory = {
      type: 'trajectory',
      id: `trail-${i}`,
      points: b.trail.map((s) => bobPos(s.th, c.length)),
      width: TRAIL_WIDTH_PX,
      opacity: TRAIL_ALPHA,
      style: { colorRole: 'ink', emphasis: 'strong', fade: 'tail' },
    };
    out.push(trail);
  });

  // ---- 매단 줄 ----
  // `to` 에 추의 id 를 준다. 추가 움직이면 줄이 따라간다 — 좌표를 두 곳에 두면
  // 언젠가 한쪽만 고쳐져 줄이 추에서 떨어진다.
  state.bobs.forEach((_, i) => {
    const string: Constraint = {
      type: 'constraint',
      id: `string-${i}`,
      subtype: 'string',
      from: PIVOT,
      to: `bob-${i}`,
      opacity: STRING_ALPHA,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(string);
  });

  // ---- 추 다섯과 피벗 ----
  // 다섯이 모두 같은 잉크색이다. 다섯은 같은 대상이고 진폭만 다르다 — 색을
  // 나누면 "다섯 종류" 가 되어 버린다 (S-piece: 색으로 설명하지 않는다).
  state.bobs.forEach((b, i) => {
    const bob: Body = {
      type: 'body',
      id: `bob-${i}`,
      pos: bobPos(b.th, c.length),
      shape: 'circle',
      size: BOB_RADIUS,
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(bob);
  });
  const pivot: Body = {
    type: 'body',
    id: 'pivot',
    pos: PIVOT,
    shape: 'circle',
    size: PIVOT_RADIUS,
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(pivot);

  // ---- 바닥 통과 섬광 ----
  // 링끼리의 반지름 차가 곧 통과 시각의 차이다. 강조색은 오직 "바닥을 지나는
  // 순간" 한 뜻에만 쓴다 — 섬광과 띠 획이 같은 사건이다.
  const floor = bobPos(0, c.length);
  const flashes = state.bobs
    .map((b) => b.crossings[b.crossings.length - 1])
    .filter((tc): tc is number => tc !== undefined && now - tc >= 0 && now - tc < FLASH_LIFE)
    .map((tc) => ({ pos: floor, age: now - tc }));
  if (flashes.length > 0) {
    const flash: Trace = {
      type: 'trace',
      id: 'floor-flash',
      marks: flashes,
      life: FLASH_LIFE,
      shape: 'ring',
      size: FLASH_FROM_PX,
      spreadTo: FLASH_TO_PX,
      width: FLASH_WIDTH_PX,
      opacity: FLASH_ALPHA,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(flash);
  }

  // ---- 박자 기록띠 ----
  // 통과 시각을 가로 시간축에 쌓는다. 순간의 일치가 지속하는 무늬로 바뀌어서,
  // 어느 시각에 화면을 멈춰도 최근 8.4 초의 증거가 남아 있다.
  //
  // 창 밖으로 나간 자국을 버리는 것은 조각의 일이다 — 렌더러는 받은 자리를
  // 그릴 뿐이다 (S-render).
  const marks: { pos: Vec2 }[] = [];
  state.bobs.forEach((b, i) => {
    const y = BAND.rowY[i];
    if (y === undefined) return;
    for (const tc of b.crossings) {
      const x = BAND.x1 - (now - tc) * BAND.perSecond;
      if (x < BAND.x0 || x > BAND.x1) continue;
      marks.push({ pos: [x, y] });
    }
  });
  if (marks.length > 0) {
    const band: Trace = {
      type: 'trace',
      id: 'beat-band',
      marks,
      // 나이를 주지 않는다. 획은 늙어 옅어지는 것이 아니라 창을 벗어나면
      // 사라진다 — 지금 남아 있는 것은 모두 같은 세기의 증거다.
      shape: 'tick',
      size: BAND.tick,
      width: BAND_STROKE_PX,
      opacity: BAND_ALPHA,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(band);
  }

  // ---- 진폭 이름표 ----
  // "진폭이 다르다" 가 주장의 전제다. 전제가 화면에 없으면 "같은 것 다섯 개가
  // 같이 움직인다" 는 시시한 그림이 된다.
  RATIO.forEach((r, i) => {
    const y = BAND.rowY[i];
    if (y === undefined) return;
    const label: Readout = {
      type: 'readout',
      id: `amp-${i}`,
      anchor: { world: [LABEL_X, y] },
      text: text('label.amplitude'),
      vars: { deg: (state.ampDeg * r).toFixed(1) },
      chip: false,
      align: 'right',
      fontSize: LABEL_FONT_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    out.push(label);
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
