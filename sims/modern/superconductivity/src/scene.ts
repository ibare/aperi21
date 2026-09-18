// ========================================================================
// superconductivity — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음 — 축 · 눈금(lineSet) · 임계 온도 안내선과
// 곡선(trajectory) · 지금 점(body) · 잔류 저항 치수선(dimension) · 글자(readout).
//
// 색은 뜻마다 하나다 — 두 금속의 곡선과 점은 먹색(같은 종류의 대상, 가르는 것은
// 이름표). **강조색은 「저항 0」 한 뜻에만** — 수은이 수직으로 떨어진 선분과 그 뒤
// 가로축에 붙어 달리는 0 선. 축 · 눈금 · 안내선 · 이름표는 배경 정보라 muted.
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
  copperResistance,
  mercuryNormalResistance,
  readConstants,
  readCooling,
  type SuperconductivityConstants,
} from './physics';
import {
  AXIS_OVERHANG,
  AXIS_TOP,
  SCENE_BOUNDS,
  X_PER_K,
  Y_PER_R,
  text,
  type SuperconductivityMessageKey,
} from './schema';
import type { SuperconductivityState } from './state';

/** 곡선을 표본하는 간격(K). 판 전체(8 K)에 160 점 — 굽은 곳이 각지지 않을 만큼. */
const SAMPLE_DK = 0.05;
/** 곡선 굵기(화면 px). */
const CURVE_WIDTH = 2;
/** 「저항 0」 선분의 굵기(화면 px). 가로축 위에 덮여도 축과 갈려 보이게 곡선보다 굵다. */
const ZERO_WIDTH = 3.5;
/** 축 · 눈금 · 안내선 굵기(화면 px). 재는 선이라 가늘다. */
const AXIS_WIDTH = 1;
/** 지금 점의 반지름(월드). */
const DOT_R = 0.11;
/** 눈금선이 가로축 아래로 내려가는 길이(월드). */
const TICK_LEN = 0.14;
/** 잔류 저항 치수선이 세로축에서 떨어진 거리(월드). 구리 곡선의 왼쪽 끝 바로 옆. */
const RESIDUAL_DIM_X = 0.3;
/** 글자 크기(화면 px) — 눈금 · 축 이름 · 곡선 이름. */
const TICK_PX = 11;
const AXIS_LABEL_PX = 12;
const NAME_PX = 13;
/** 이름표를 앵커에서 띄우는 거리(화면 px). */
const TICK_LABEL_GAP = 16;
const AXIS_LABEL_GAP = 12;
const NAME_GAP = 10;
const ZERO_LABEL_GAP = 8;
/** 바닥 이름표를 선 위로 띄우는 거리(화면 px). */
const FLOOR_LABEL_LIFT = 12;
/** 임계 온도 안내선의 짙기. 곡선보다 뒤로 물러나 있어야 한다. */
const GUIDE_OPACITY = 0.7;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const GUIDE = { colorRole: 'muted', emphasis: 'strong' } as const;
const ZERO = { colorRole: 'accent', emphasis: 'strong' } as const;

const X = (T: number): number => T * X_PER_K;
const Y = (r: number): number => r * Y_PER_R;

/** T_max 에서 T 까지(내려가며) 정상 상태 곡선을 표본한다. */
function sampleDown(from: number, to: number, r: (T: number) => number): Vec2[] {
  const pts: Vec2[] = [[X(from), Y(r(from))]];
  for (let T = from - SAMPLE_DK; T > to; T -= SAMPLE_DK) pts.push([X(T), Y(r(T))]);
  pts.push([X(to), Y(r(to))]);
  return pts;
}

function label(
  id: string,
  key: SuperconductivityMessageKey,
  world: Vec2,
  offset: Vec2,
  align: 'left' | 'center' | 'right',
  fontSize: number,
  opacity: number,
  vars?: Record<string, string>,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world, offset },
    text: text(key),
    ...(vars ? { vars } : {}),
    chip: false,
    font: 'text',
    align,
    fontSize,
    opacity,
    style: GUIDE,
  };
}

function axes(c: SuperconductivityConstants): Primitive[] {
  const xEnd = X(c.tMax) + AXIS_OVERHANG;
  return [
    {
      type: 'lineSet',
      id: 'axes',
      lines: [
        [
          [0, Y(0)],
          [xEnd, Y(0)],
        ],
        [
          [0, Y(0)],
          [0, AXIS_TOP],
        ],
      ],
      width: AXIS_WIDTH,
      style: GUIDE,
    },
    {
      type: 'lineSet',
      id: 'ticks',
      lines: [0, c.tc, c.tMax].map((T): Vec2[] => [
        [X(T), 0],
        [X(T), -TICK_LEN],
      ]),
      width: AXIS_WIDTH,
      style: GUIDE,
    },
    // 임계 온도 안내선. 처음부터 있다 — 두 곡선이 같이 줄어드는 동안 「저기서 무언가
    // 일어난다」 는 자리를 미리 알려 두어야, 떨어지는 순간 눈이 그 자리에 가 있다.
    {
      type: 'trajectory',
      id: 'tc-guide',
      points: [
        [X(c.tc), 0],
        [X(c.tc), AXIS_TOP],
      ],
      width: AXIS_WIDTH,
      opacity: GUIDE_OPACITY,
      style: { ...GUIDE, lineStyle: 'dotted' },
    },
  ];
}

export function scene(params: {
  state: SuperconductivityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('superconductivity: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const now = readCooling(timeline, c);
  const a = now.alpha;
  const out: Primitive[] = [...axes(c)];

  // ---- 구리: 매끄럽게 줄다가 바닥에서 평평해진다 ----
  out.push({
    type: 'trajectory',
    id: 'copper-curve',
    points: sampleDown(c.tMax, now.T, (T) => copperResistance(T, c)),
    width: CURVE_WIDTH,
    opacity: a,
    style: INK,
  });

  // ---- 수은: T_c 까지는 같은 꼴로 줄어든다 ----
  const mercuryNormalEnd = Math.max(now.T, c.tc);
  out.push({
    type: 'trajectory',
    id: 'mercury-curve',
    points: sampleDown(c.tMax, mercuryNormalEnd, (T) => mercuryNormalResistance(T, c)),
    width: CURVE_WIDTH,
    opacity: a,
    style: INK,
  });

  // ---- 수은: T_c 에서 수직으로 떨어지고, 그 뒤로는 가로축에 붙어 달린다 ----
  // 떨어지는 동안 온도는 T_c 에 머물러 있으므로 선분의 가로 자리가 변하지 않는다 —
  // 이 선분이 수직인 것은 그려 넣은 모양이 아니라 온도가 움직이지 않은 결과다.
  if (now.drop > 0) {
    const zeroPath: Vec2[] = [
      [X(c.tc), Y(mercuryNormalResistance(c.tc, c))],
      [X(c.tc), Y(now.mercury)],
    ];
    if (now.below > 0) zeroPath.push([X(now.T), Y(0)]);
    out.push({
      type: 'trajectory',
      id: 'mercury-zero',
      points: zeroPath,
      width: ZERO_WIDTH,
      opacity: a,
      style: ZERO,
    });
  }

  // ---- 지금 점 ----
  // 둘은 언제나 같은 가로 자리(같은 온도)에 있다 — 한 통 안에서 함께 식힌다.
  out.push(
    {
      type: 'body',
      id: 'copper-now',
      shape: 'circle',
      pos: [X(now.T), Y(now.copper)],
      size: DOT_R,
      outline: 'background',
      glow: false,
      opacity: a,
      style: INK,
    },
    {
      type: 'body',
      id: 'mercury-now',
      shape: 'circle',
      pos: [X(now.drop > 0 && now.below === 0 ? c.tc : now.T), Y(now.mercury)],
      size: DOT_R,
      outline: 'background',
      glow: false,
      opacity: a,
      style: INK,
    },
  );

  // ---- 다 식힌 뒤: 구리는 바닥이 남고, 수은은 0 이다 ----
  // 더 식히는 동안 나타난다 — 구리의 곡선이 평평해지는 것이 보이기 시작할 때.
  const floor = now.below * a;
  if (floor > 0) {
    const residualTop = Y(copperResistance(c.tEnd, c));
    out.push({
      type: 'dimension',
      id: 'copper-residual',
      from: [RESIDUAL_DIM_X, 0],
      to: [RESIDUAL_DIM_X, residualTop],
      opacity: floor,
      style: GUIDE,
    });
    out.push(
      label('residual-label', 'label.residual', [RESIDUAL_DIM_X, residualTop / 2], [NAME_GAP, 0], 'left', TICK_PX, floor),
      label(
        'vanished-label',
        'label.vanished',
        [(X(c.tc) + X(c.tEnd)) / 2, 0],
        [0, -FLOOR_LABEL_LIFT],
        'center',
        TICK_PX,
        floor,
      ),
    );
  }

  // ---- 글자: 축 이름 · 눈금 · 곡선 이름 ----
  out.push(
    label('axis-r', 'label.axisR', [0, AXIS_TOP], [0, -AXIS_LABEL_GAP], 'left', AXIS_LABEL_PX, 1),
    label('axis-t', 'label.axisT', [X(c.tMax) + AXIS_OVERHANG, 0], [AXIS_LABEL_GAP, 0], 'left', AXIS_LABEL_PX, 1),
    label('zero-r', 'label.zero', [0, 0], [-ZERO_LABEL_GAP, 0], 'right', TICK_PX, 1),
    label('tick-zero', 'label.tick', [X(0), 0], [0, TICK_LABEL_GAP], 'center', TICK_PX, 1, { v: String(0) }),
    label('tick-tc', 'label.tc', [X(c.tc), 0], [0, TICK_LABEL_GAP], 'center', TICK_PX, 1, { v: String(c.tc) }),
    label('tick-max', 'label.tick', [X(c.tMax), 0], [0, TICK_LABEL_GAP], 'center', TICK_PX, 1, { v: String(c.tMax) }),
    label('name-copper', 'label.copper', [X(c.tMax), Y(c.copperTop)], [NAME_GAP, 0], 'left', NAME_PX, a),
    label('name-mercury', 'label.mercury', [X(c.tMax), Y(c.mercuryTop)], [NAME_GAP, 0], 'left', NAME_PX, a),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
