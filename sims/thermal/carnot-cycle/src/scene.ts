// ========================================================================
// carnot-cycle — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없이 표준 어휘만 쓴다.
//
//   축 · 0 K 바닥     trajectory(꺾은선) · readout(글자)
//   두 온도선         trajectory 점선 · readout(이름표)
//   받은 열           region 한 다각형 (차가운 쪽 위 몫 + 아직 쓸리지 않은 아래 몫)
//   빠져나간 자리     trajectory closed 점선
//   빠져나가는 열     lineSet — 3 px 기둥마다 세로선 하나, 선별 불투명도, clip 으로 바닥에서 자름
//   상태점의 경로     trajectory
//   기체의 상태점     trace dot
//   일 · 버린 열 몫   readout
//
// 겹침 순서는 scene 에 쓴 순서다 (`schema.drawOrder: 'scene'`).
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
import { clampTc, discardPercent, readConstants } from './physics';
import { PLOT, SCENE_BOUNDS, text } from './schema';
import type { CarnotCycleState } from './state';

/** 축 굵기(화면 px). 원본 1.2. */
const AXIS_WIDTH = 1.2;
/** 온도선 · 빠져나간 자리 테두리 굵기(화면 px). 원본 1. */
const GUIDE_WIDTH = 1;
/** 경로 굵기(화면 px). 원본 2.2. */
const PATH_WIDTH = 2.2;
/** 상태점 반지름(화면 px). 원본 5.5. */
const DOT_R = 5.5;
/** 받은 열 채움 불투명도. 원본 rgba(…, 0.20). */
const HEAT_FILL = 0.2;
/** 빠져나가는 기둥의 처음 불투명도 — 가라앉으며 절반까지 옅어진다. 원본 0.55 · (1 − k/2). */
const SINK_ALPHA = 0.55;
/** 빠져나간 자리 테두리 불투명도. 원본 0.9. */
const HOLE_ALPHA = 0.9;
/** 기둥 굵기(화면 px). 원본은 3 px 간격에 3.5 px 폭 사각형. */
const COLUMN_WIDTH = 3.5;
/** 글자 크기(화면 px). 원본 축 글자 12 · 온도 이름표와 몫 13. */
const AXIS_FONT = 12;
const LABEL_FONT = 13;
/** 이름표가 축에서 왼쪽으로 떨어진 거리(화면 px). 원본 padL − 8. */
const LABEL_GAP = 8;
/** 윗선 맞춤 글자의 가운데 — 원본 textBaseline 'top' 을 가운데 맞춤으로 옮긴 값(화면 px). */
const AXIS_TOP_DROP = AXIS_FONT / 2;
/** 「엔트로피 →」 는 바닥에서 8 px 아래가 윗선이다. */
const ENTROPY_DROP = 8 + AXIS_FONT / 2;

export function scene(params: {
  state: CarnotCycleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('carnot-cycle: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const tc = clampTc(state.tc);
  const discard = discardPercent(tc, c.th);

  const { x1, x2, floor } = PLOT;
  const yOf = (T: number): number => floor + (T / c.tTop) * (PLOT.top - floor);
  const yH = yOf(c.th);
  const yC = yOf(tc);
  const fade = 1 - tl.at('fade');

  // 받은 열이 채워진 오른쪽 끝, 차가운 쪽에서 쓸고 지나간 왼쪽 끝
  const xa = x1 + (x2 - x1) * tl.at('hot');
  const xs = x2 - (x2 - x1) * tl.at('cold');
  const coldStart = tl.start('cold');
  const coldDur = tl.duration('cold');
  const sweptTime = (x: number): number => coldStart + ((x2 - x) / (x2 - x1)) * coldDur;

  const out: Primitive[] = [];

  // ---- 절대 영도 바닥과 온도 축 ----
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [PLOT.axisX, PLOT.top],
      [PLOT.axisX, floor],
      [PLOT.right, floor],
    ],
    width: AXIS_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'label-floor',
    anchor: { world: [PLOT.axisX, floor], offset: [-LABEL_GAP, 0] },
    text: text('label.floor'),
    chip: false,
    font: 'text',
    fontSize: AXIS_FONT,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'label-temperature',
    anchor: { world: [PLOT.axisX, PLOT.top], offset: [6, AXIS_TOP_DROP] },
    text: text('label.temperature'),
    chip: false,
    font: 'text',
    fontSize: AXIS_FONT,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'label-entropy',
    anchor: { world: [PLOT.right, floor], offset: [0, ENTROPY_DROP] },
    text: text('label.entropy'),
    chip: false,
    font: 'text',
    fontSize: AXIS_FONT,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 두 열원의 온도선 ----
  for (const [id, y, label, t] of [
    ['hot', yH, text('label.hot'), c.th],
    ['cold', yC, text('label.cold'), tc],
  ] as const) {
    out.push({
      type: 'trajectory',
      id: `line-${id}`,
      points: [
        [PLOT.axisX, y],
        [PLOT.right, y],
      ],
      width: GUIDE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
    out.push({
      type: 'readout',
      id: `label-${id}`,
      anchor: { world: [PLOT.axisX, y], offset: [-LABEL_GAP, 0] },
      text: label,
      vars: { t },
      chip: false,
      font: 'text',
      fontSize: LABEL_FONT,
      align: 'right',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 받은 열 ----
  // 차가운 쪽 온도 위 몫은 받은 만큼 그대로 남고, 아래 몫은 아직 쓸리지 않은 부분만 남는다.
  // 원본의 두 사각형을 한 다각형으로 잇는다 — 붙은 두 면의 이음매가 보이지 않게.
  if (xa > x1) {
    const right = Math.min(xa, xs);
    const pts: Vec2[] =
      right > x1
        ? [
            [x1, floor],
            [right, floor],
            [right, yC],
            [xa, yC],
            [xa, yH],
            [x1, yH],
          ]
        : [
            [x1, yC],
            [xa, yC],
            [xa, yH],
            [x1, yH],
          ];
    out.push({
      type: 'region',
      id: 'heat-in',
      points: pts,
      fillOpacity: HEAT_FILL,
      opacity: fade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 빠져나간 자리 ----
  if (xs < x2) {
    out.push({
      type: 'trajectory',
      id: 'heat-out-hole',
      points: [
        [xs, yC],
        [x2, yC],
        [x2, floor],
        [xs, floor],
      ],
      closed: true,
      width: GUIDE_WIDTH,
      opacity: fade * HOLE_ALPHA,
      style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 빠져나가는 열 ----
  // 상태점이 지나간 기둥마다, 지나간 시각부터 `sinkSeconds` 동안 바닥 아래로 가라앉으며 옅어진다.
  if (xs < x2) {
    const colH = yC - floor;
    const lines: Vec2[][] = [];
    const opacities: number[] = [];
    const capInset = COLUMN_WIDTH / 2; // 둥근 끝이 기둥 위로 삐져나오지 않게(배율 ≈ 1 가정)
    for (let x = xs; x < x2; x += PLOT.columnStep) {
      const w = Math.min(PLOT.columnStep, x2 - x);
      const t0 = sweptTime(x + PLOT.columnStep / 2);
      const k = tl.span(t0, t0 + c.sinkSeconds);
      if (k >= 1) continue;
      const topY = yC - k * (colH + PLOT.sinkOvershoot) - capInset;
      if (topY <= floor) continue;
      const cx = x + w / 2;
      lines.push([
        [cx, floor - COLUMN_WIDTH],
        [cx, topY],
      ]);
      opacities.push(SINK_ALPHA * (1 - k * 0.5));
    }
    if (lines.length > 0) {
      out.push({
        type: 'lineSet',
        id: 'heat-out-columns',
        lines,
        opacities,
        width: COLUMN_WIDTH,
        opacity: fade,
        // 원본은 도표 사각형으로 잘랐다 — 바닥 아래로 내려간 몫이 사라진다.
        clip: { min: [x1, floor], max: [x2, PLOT.top] },
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // ---- 상태점의 경로 ----
  const pastHot = tl.u >= tl.start('expand');
  const pastExpand = tl.u >= tl.start('cold');
  const pastCold = tl.u >= tl.start('compress');
  const path: Vec2[] = [
    [x1, yH],
    [xa, yH],
  ];
  if (pastHot) path.push([x2, yH + (yC - yH) * tl.at('expand')]);
  if (pastExpand) path.push([xs, yC]);
  if (pastCold) path.push([x1, yC + (yH - yC) * tl.at('compress')]);
  out.push({
    type: 'trajectory',
    id: 'cycle-path',
    points: path,
    width: PATH_WIDTH,
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 기체의 상태점 ----
  out.push({
    type: 'trace',
    id: 'state-point',
    shape: 'dot',
    size: DOT_R,
    marks: [{ pos: path[path.length - 1]! }],
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 순환이 닫힌 뒤: 일로 남은 몫 · 버린 열의 몫 ----
  if (tl.u >= tl.start('hold')) {
    out.push({
      type: 'readout',
      id: 'share-work',
      anchor: { world: [(x1 + x2) / 2, (yH + yC) / 2] },
      text: text('label.work'),
      vars: { n: 100 - discard },
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: LABEL_FONT,
      align: 'center',
      opacity: fade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'share-discard',
      anchor: { world: [(x1 + x2) / 2, (yC + floor) / 2] },
      text: text('label.discard'),
      vars: { n: discard },
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: LABEL_FONT,
      align: 'center',
      opacity: fade,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
