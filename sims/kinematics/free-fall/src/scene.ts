// ========================================================================
// free-fall — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더 계층을 쓰지 않는다. 땅(region) · 사다리(trajectory + trace) ·
// 잣대(trajectory) · 두 공(body) · 무게 딱지(readout) · 착지 울림(trace)이
// 모두 표준 어휘로 있다. 모자란 자리는 NOTES.md 「어휘 부족」에 적었다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';

import { landingAge } from './physics';
import { BALL_R, BALL_X, GROUND_BAND, M_LIGHT, SCENE_BOUNDS, text } from './schema';
import type { FreeFallState } from './state';

// ------------------------------------------------------------------------
// 원본의 표현 상수 — 화면 px 로 재는 것들
// ------------------------------------------------------------------------

/** 사다리 가로대 · 잔상 원의 획 굵기(화면 px). 원본 `lineWidth = 1.5`. */
const GHOST_WIDTH_PX = 1.5;
/** 잔상 원의 반지름(화면 px). 원본 `R = 13`. */
const GHOST_RING_PX = 13;
/** 나란함 잣대의 굵기(화면 px). 원본 `lineWidth = 2.5`. */
const GAUGE_WIDTH_PX = 2.5;
/** 착지 울림의 굵기(화면 px). 원본 `lineWidth = 2`. */
const RIPPLE_WIDTH_PX = 2;
/** 착지 울림이 시작하는 반지름(화면 px). 원본 `R + 5`. */
const RIPPLE_FROM_PX = 13 + 5;
/** 착지 울림이 다 퍼진 반지름(화면 px). 원본 `R + 5 + 26`. */
const RIPPLE_TO_PX = 13 + 5 + 26;
/** 착지 울림이 사라지기까지(초). 원본 `0.42`. */
const RIPPLE_LIFE = 0.42;
/** 착지 울림의 가장 짙은 세기. 원본 `(1 - k) * 0.85`. */
const RIPPLE_ALPHA = 0.85;
/**
 * 착지 울림이 도는 각도 범위(라디안, 월드 x 축에서 반시계).
 *
 * 원본은 캔버스 각으로 `π * 1.13 → π * 1.87` 이었다 — 캔버스는 y 가 아래라
 * 그 구간이 **위쪽**이다. 월드로 옮기면 부호가 뒤집혀 `0.13π → 0.87π` 가 된다.
 * 온전한 원으로 그리면 울림이 땅 밑으로도 퍼진다.
 */
const RIPPLE_ARC: readonly [number, number] = [0.13 * Math.PI, 0.87 * Math.PI];

/** 잔상 가로대의 진하기. 원본 `rgba(accent, 0.24)`. */
const RUNG_ALPHA = 0.24;
/** 잔상 원의 진하기. 원본 `rgba(ink, 0.22)`. */
const RING_ALPHA = 0.22;
/** 땅 선의 진하기. 원본 `rgba(ink, 0.55)`. */
const GROUND_LINE_ALPHA = 0.55;
/** 땅 띠의 진하기. 원본 `rgba(ink, 0.05)` — 선 알파에 곱해져 0.05 가 된다. */
const GROUND_BAND_ALPHA = 0.05 / GROUND_LINE_ALPHA;
/** 땅 띠가 가로로 뻗는 거리(m). 프레이밍 밖까지 나가 화면을 가로지른다. */
const GROUND_HALF_WIDTH = 40;

/** kg 딱지를 공 둘레에서 띄우는 거리(화면 px). 원본 `± 9`. */
const LABEL_GAP_PX = 9;
/** kg 딱지의 글자 크기(화면 px). 원본 `600 14px`. */
const LABEL_FONT_PX = 14;

/**
 * 무대가 걷혔다 드는 정도.
 *
 * 원본은 `tau` 로 갈랐지만 단계 경계는 시간표가 갖는다 — `fade` 가 도는 만큼 걷히고,
 * `appear` 가 도는 만큼 든다. 첫 주기에는 들지 않는다(원본 `st.appear === false`) —
 * 처음 도착한 독자에게는 이미 들려 있는 두 공이 첫 화면이다.
 */
function stageAlpha(timeline: TimelineFrame): number {
  const out = 1 - timeline.at('fade');
  const back = timeline.cycle > 0 ? timeline.at('appear') : 1;
  return Math.min(out, back);
}

export function scene(params: {
  state: FreeFallState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('free-fall: schema.timeline 이 선언되어야 한다');

  const alpha = stageAlpha(timeline);
  const xH = -BALL_X;
  const xL = BALL_X;
  const out: Primitive[] = [];

  // ---- 땅 ----
  // `surface` 의 `kind: 'ground'` 를 쓰지 않는다. 그것은 선 아래를 **뷰포트 끝까지**
  // 칠하는데, 원본은 캡션이 땅속에 묻혀서 그 칠을 10 px 띠로 줄였다 (NOTES 「어휘 부족」).
  const ground: Region = {
    type: 'region',
    id: 'ground',
    points: [
      [-GROUND_HALF_WIDTH, 0],
      [GROUND_HALF_WIDTH, 0],
      [GROUND_HALF_WIDTH, -GROUND_BAND],
      [-GROUND_HALF_WIDTH, -GROUND_BAND],
    ],
    style: { colorRole: 'ink', emphasis: 'strong' },
    opacity: GROUND_LINE_ALPHA,
    fillOpacity: GROUND_BAND_ALPHA,
    // 윗변만 굵게 — 낙하가 끝나는 높이다.
    outline: [[0, 1]],
  };
  out.push(ground);

  // ---- 낙하 사다리 ----
  // 칸이 모두 수평이라는 것이 "같은 시각에 같은 높이" 라는 뜻이고, 아래로 갈수록
  // 칸 간격이 벌어지는 것은 속도가 커진다는 뜻이다.
  state.rungs.forEach((r, i) => {
    const rung: Trajectory = {
      type: 'trajectory',
      id: `rung-${i}`,
      points: [
        [xH, r.yHeavy],
        [xL, r.yLight],
      ],
      style: { colorRole: 'accent', emphasis: 'strong' },
      opacity: RUNG_ALPHA * alpha,
      width: GHOST_WIDTH_PX,
    };
    out.push(rung);
  });

  const column = (id: string, x: number, pick: (r: { yHeavy: number; yLight: number }) => number): Trace => ({
    type: 'trace',
    id,
    // 나이를 주지 않는다 — 스트로보는 지나온 자리를 지우지 않는다. 지우면 칸 사이
    // 간격이 사라지고, 그 간격이 곧 "속도가 커진다" 이다.
    marks: state.rungs.map((r) => ({ pos: [x, pick(r)] as Vec2 })),
    shape: 'ring',
    size: GHOST_RING_PX,
    width: GHOST_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
    opacity: RING_ALPHA * alpha,
  });
  out.push(column('rings-heavy', xH, (r) => r.yHeavy));
  out.push(column('rings-light', xL, (r) => r.yLight));

  // ---- 나란함 잣대 ----
  // 상태가 없다. 매 프레임 두 공의 지금 높이를 잇기만 한다 — 수평은 그려 넣은 것이
  // 아니라 결과다. 한쪽이 앞서면 기울어야 한다.
  const gauge: Trajectory = {
    type: 'trajectory',
    id: 'gauge',
    points: [
      [xH, state.heavy.y],
      [xL, state.light.y],
    ],
    style: { colorRole: 'accent', emphasis: 'strong' },
    opacity: alpha,
    width: GAUGE_WIDTH_PX,
  };
  out.push(gauge);

  // ---- 두 공 ----
  // **크기가 같다.** 무게는 채움이 가른다 — 크기로 가르면 "큰 쪽이 공기를 더 받으니까"
  // 라는 의심이 붙어 주장이 그 자리에서 무너진다.
  const heavy: Body = {
    type: 'body',
    id: 'ball-heavy',
    pos: [xH, state.heavy.y],
    shape: 'circle',
    size: BALL_R,
    mass: state.heavyMass,
    fill: 'solid',
    // 원본은 채우기만 한다. 둘레를 켜면 없던 테가 생겨 가벼운 공과의 차이가 흐려진다.
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
    opacity: alpha,
  };
  const light: Body = {
    type: 'body',
    id: 'ball-light',
    pos: [xL, state.light.y],
    shape: 'circle',
    size: BALL_R,
    mass: M_LIGHT,
    // 속을 비운다. 같은 크기 · 다른 채움 — 이 한 쌍이 "공기 조건은 같다" 를 말없이 약속한다.
    //
    // 둘레는 **제 색**으로 긋는다. 테마의 선 색으로 고정하면 바탕과 대비가 모자라
    // 가벼운 공이 묻히고, 그러면 "둘이 나란히" 에서 한쪽이 사라진다.
    fill: 'none',
    outline: 'role',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
    opacity: alpha,
  };
  out.push(heavy, light);

  // ---- 무게 딱지 ----
  // 공을 따라 내려간다. 위에 고정해 두면 읽기는 쉽지만 "이 공의 무게" 라는 소속이 끊긴다.
  const tag = (id: string, x: number, y: number, m: number, side: 'left' | 'right'): Readout => ({
    type: 'readout',
    id,
    anchor: {
      world: [side === 'right' ? x - BALL_R : x + BALL_R, y],
      offset: [side === 'right' ? -LABEL_GAP_PX : LABEL_GAP_PX, 0],
    },
    text: text('label.mass'),
    vars: { m },
    chip: false,
    align: side,
    fontSize: LABEL_FONT_PX,
    weight: 'bold',
    style: { colorRole: 'ink', emphasis: 'strong' },
    opacity: alpha,
  });
  out.push(tag('tag-heavy', xH, state.heavy.y, state.heavyMass, 'right'));
  out.push(tag('tag-light', xL, state.light.y, M_LIGHT, 'left'));

  // ---- 착지 울림 ----
  // 각 공이 제 착지 시각을 기억하고 그 나이만큼 퍼진다. 둘의 호가 같은 크기로 같이
  // 퍼지는 것이 "동시에 닿았다" 를 숫자가 아니라 사건으로 만든다.
  const ages: { pos: Vec2; age: number }[] = [];
  const heavyAge = landingAge(state.heavy, state.tau);
  const lightAge = landingAge(state.light, state.tau);
  if (heavyAge !== null) ages.push({ pos: [xH, 0], age: heavyAge });
  if (lightAge !== null) ages.push({ pos: [xL, 0], age: lightAge });
  if (ages.length > 0) {
    const ripple: Trace = {
      type: 'trace',
      id: 'landing',
      marks: ages,
      shape: 'ring',
      size: RIPPLE_FROM_PX,
      spreadTo: RIPPLE_TO_PX,
      life: RIPPLE_LIFE,
      width: RIPPLE_WIDTH_PX,
      arc: RIPPLE_ARC,
      style: { colorRole: 'accent', emphasis: 'strong' },
      opacity: RIPPLE_ALPHA * alpha,
    };
    out.push(ripple);
  }

  // 캡션은 슬롯이 낸다 (`schema.caption`). scene 에 id `caption` 을 두지 않는다.
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return SCENE_BOUNDS;
}
