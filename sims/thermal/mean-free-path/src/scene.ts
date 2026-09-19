// ========================================================================
// mean-free-path — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 위에 두 상자(밀도 n · k·n)를 나란히, 아래에 두 줄을 둔다. 줄은 상자 안 거리를 선언한
// 배율(`rowScale`)로 늘린 자다 — 두 줄이 같은 배율이라 비는 그대로다. 상자에서 한 구간을
// 끝낼 때마다(다음 분자에 부딪힐 때마다) 그 구간의 길이 자리에 눈금 하나가 서고, 끝난
// 구간들의 평균이 막대로 자란다.
//
// 색은 뜻마다 하나다. 표시 분자는 두 상자에서 같은 색(같은 분자다), 다른 분자는 muted,
// **강조색은 「부딪혔다」 한 뜻에만** — 상자 안 충돌 점. 평균 막대는 표시 분자의 것이라
// 그 분자의 색이다.
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
  freePathsUntil,
  images,
  mean,
  positionAt,
  readConstants,
  wrap,
  wrapSegment,
} from './physics';
import {
  BOX_H,
  BOX_LABEL_Y,
  BOX_ORIGINS,
  BOX_W,
  ROW_HEAD_Y,
  ROW_LABEL_X,
  ROW_Y,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { MeanFreePathState } from './state';

/** 상자 바탕의 옅은 칠. */
const BOX_FILL_OPACITY = 0.05;
/** 경로 꼬리 굵기(화면 px). */
const TRAIL_WIDTH_PX = 1.5;
/** 충돌 점 반지름(화면 px). */
const HIT_DOT_PX = 3;
/** 줄 바닥선 굵기(화면 px) · 짙기. */
const ROW_BASE_WIDTH_PX = 1;
const ROW_BASE_OPACITY = 0.5;
/** 줄이 뻗는 끝(월드, 줄 시작에서). 가장 긴 구간이 들어가도록 두 상자 너비만큼. */
const ROW_LENGTH = BOX_ORIGINS[1][0] + BOX_W;
/** 구간 눈금 길이(월드) · 굵기(화면 px). 막대보다 길어 막대 위에서도 보인다. */
const TICK_LEN = 0.44;
const TICK_WIDTH_PX = 1;
/** 평균 막대의 두께(월드) · 채움. */
const BAR_THICK = 0.26;
const BAR_FILL_OPACITY = 0.55;
/** 절반 자리 점선 굵기(화면 px) · 줄 위아래로 넘는 길이(월드). */
const MARK_WIDTH_PX = 2;
const MARK_OVERHANG = 0.3;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;
const HEAD_PX = 11;

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

const OUTLINE_ALL = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
] as const;

export function scene(params: {
  state: MeanFreePathState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('mean-free-path: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  // 두 분자가 가는 것은 `run` ~ `shorter` 동안이다. 그 뒤로는 끝난 자리에 멈춘다.
  const runFrom = tl.start('run');
  const runTo = tl.end('shorter');
  const e = Math.min(Math.max(tl.u - runFrom, 0), runTo - runFrom);
  /** 한 주기 끝에서 모두 흐려진다. */
  const live = 1 - tl.at('fade');
  /** 멈춘 뒤 절반 자리 표시가 나타난다. */
  const mark = tl.at('mark') * live;

  const means: number[] = [];

  state.runs.forEach((run, b) => {
    const [ox, oy] = BOX_ORIGINS[b]!;
    const clip = { min: [ox, oy] as Vec2, max: [ox + BOX_W, oy + BOX_H] as Vec2 };
    const at = (p: Vec2): Vec2 => [ox + p[0], oy + p[1]];

    // ---- 상자 ----
    out.push({
      type: 'region',
      id: `box-${b}`,
      points: rect(ox, oy, ox + BOX_W, oy + BOX_H),
      fillOpacity: BOX_FILL_OPACITY,
      outline: OUTLINE_ALL,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });

    // ---- 제자리의 다른 분자 — 경계에 걸치면 맞은편에도 그 몫이 보인다 ----
    run.molecules.forEach((m, i) => {
      images(m, c.radius).forEach((q, j) => {
        out.push({
          type: 'body',
          id: `mol-${b}-${i}-${j}`,
          pos: at(q),
          shape: 'circle',
          size: c.radius,
          glow: false,
          clip,
          style: { colorRole: 'muted', emphasis: 'strong' },
        });
      });
    });

    // ---- 경로 꼬리 — 지난 `trailSeconds` 초. 오래된 조각일수록 옅다 ----
    const from = Math.max(0, e - c.trailSeconds);
    const lines: Vec2[][] = [];
    const opacities: number[] = [];
    for (let k = 0; k < run.times.length && run.times[k]! < e; k++) {
      const t0 = Math.max(run.times[k]!, from);
      const t1 = Math.min(run.times[k + 1] ?? e, e);
      if (t1 <= t0) continue;
      // 구간 끝이 충돌 시각이면 positionAt 은 그 충돌 자리를 돌려준다(다음 구간의 첫 자리).
      for (const piece of wrapSegment(positionAt(run, t0, c.speed), positionAt(run, t1, c.speed))) {
        lines.push(piece.map(at));
        const age = e - (t0 + t1) / 2;
        opacities.push(Math.max(0, 1 - age / c.trailSeconds));
      }
    }
    out.push({
      type: 'lineSet',
      id: `trail-${b}`,
      lines,
      opacities,
      width: TRAIL_WIDTH_PX,
      opacity: live,
      clip,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });

    // ---- 충돌 점 — 부딪힌 자리. 꼬리와 같은 빠르기로 옅어진다 ----
    const hits: { pos: Vec2; age: number }[] = [];
    for (let k = 1; k < run.times.length && run.times[k]! <= e; k++) {
      const age = e - run.times[k]!;
      if (age > c.trailSeconds) continue;
      hits.push({ pos: at(wrap(run.points[k]!)), age });
    }
    out.push({
      type: 'trace',
      id: `hits-${b}`,
      marks: hits,
      life: c.trailSeconds,
      shape: 'dot',
      size: HIT_DOT_PX,
      opacity: live,
      clip,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });

    // ---- 표시 분자 ----
    images(wrap(positionAt(run, e, c.speed)), c.radius).forEach((q, j) => {
      out.push({
        type: 'body',
        id: `tracked-${b}-${j}`,
        pos: at(q),
        shape: 'circle',
        size: c.radius,
        glow: false,
        opacity: live,
        clip,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    });

    // ---- 상자 이름표 ----
    out.push({
      type: 'readout',
      id: `box-label-${b}`,
      anchor: { world: [ox + BOX_W / 2, BOX_LABEL_Y] },
      text: text(b === 0 ? 'label.boxSparse' : 'label.boxDense'),
      vars: { k: state.ratioText },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // ---- 아래 줄 — 충돌 사이 구간의 길이 ----
    const y = ROW_Y[b]!;
    const done = freePathsUntil(run, e, c.speed);
    const avg = mean(done);
    means.push(avg);

    out.push({
      type: 'trajectory',
      id: `row-base-${b}`,
      points: [
        [0, y],
        [ROW_LENGTH, y],
      ],
      width: ROW_BASE_WIDTH_PX,
      opacity: ROW_BASE_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    if (done.length > 0) {
      out.push({
        type: 'region',
        id: `row-bar-${b}`,
        points: rect(0, y - BAR_THICK / 2, avg * c.rowScale, y + BAR_THICK / 2),
        fillOpacity: BAR_FILL_OPACITY,
        outline: OUTLINE_ALL,
        opacity: live,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    }

    out.push({
      type: 'trace',
      id: `row-ticks-${b}`,
      marks: done.map((len) => ({ pos: [len * c.rowScale, y] as Vec2 })),
      shape: 'tick',
      size: TICK_LEN,
      width: TICK_WIDTH_PX,
      opacity: live,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });


    out.push({
      type: 'readout',
      id: `row-label-${b}`,
      anchor: { world: [ROW_LABEL_X, y] },
      text: text(b === 0 ? 'label.rowSparse' : 'label.rowDense'),
      vars: { k: state.ratioText },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'right',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  });

  out.push({
    type: 'readout',
    id: 'row-head',
    anchor: { world: [0, ROW_HEAD_Y] },
    text: text('label.rowHead'),
    vars: { s: state.rowScaleText },
    chip: false,
    font: 'text',
    fontSize: HEAD_PX,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 절반 자리 — 위 막대 끝을 선언한 밀도 배수로 나눈 자리에서 두 줄을 세로로 긋는다 ----
  const sparse = means[0] ?? 0;
  if (mark > 0 && sparse > 0) {
    const x = (sparse * c.rowScale) / c.densityRatio;
    out.push({
      type: 'trajectory',
      id: 'fraction-mark',
      points: [
        [x, ROW_Y[0] + MARK_OVERHANG],
        [x, ROW_Y[1] - MARK_OVERHANG],
      ],
      width: MARK_WIDTH_PX,
      opacity: mark,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
