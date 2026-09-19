// ========================================================================
// statistical-fluctuation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없이 표준 어휘만 쓴다.
//
//   상자 셋         trajectory(닫힌 사각) · 가운데 점선 · particleSystem · readout(N 표식)
//   그래프          trajectory(축 · 50% 선 · 곡선 셋 — 실선 · 파선 · 점선) · trace(지금 점)
//                   · readout(% 눈금 · 축 이름 · 곡선 머리 N 표식)
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
import { leftShare, particleAt, readConstants } from './physics';
import { BOX_GAP, GRAPH, SCENE_BOUNDS, text } from './schema';
import type { StatisticalFluctuationState } from './state';

/**
 * 상자마다 곡선의 선 모양(위 · 가운데 · 아래 상자 순). 곡선 셋을 색이 아니라 모양으로 가른다
 * (S-piece). 가장 크게 널뛰는 곡선이 실선이라 뛰는 모양이 끊기지 않는다.
 */
const CURVE_LINE_STYLES = ['solid', 'dashed', 'dotted'] as const;
/**
 * 상자마다 입자 점 반지름(화면 px). 입자가 많은 상자일수록 작게 — 같은 크기면 N = 1000 상자가
 * 한 덩이로 메워져 움직임이 안 보인다. 크기는 물리량이 아니다 (NOTES (b)).
 */
const PARTICLE_R_PX = [3, 2, 1.1] as const;
/** 상자 벽 굵기(화면 px). */
const BOX_WIDTH_PX = 1.6;
/** 안내선(가운데 점선 · 50% 선) 굵기(화면 px). */
const GUIDE_WIDTH_PX = 1;
/** 그래프 축 굵기(화면 px). */
const AXIS_WIDTH_PX = 1.2;
/**
 * 곡선 굵기(화면 px, 위 · 가운데 · 아래 상자 순). 점선은 점이 50% 선 위에서 묻히지 않게 굵게 준다.
 */
const CURVE_WIDTH_PX = [1.6, 1.6, 2.4] as const;
/** 지금 점 반지름(화면 px). */
const DOT_R = 3;
/** 표식 · 축 이름 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 상자 N 표식을 상자 왼쪽으로, 눈금 표식을 축 왼쪽으로 띄우는 거리(화면 px). */
const LABEL_GAP = 6;
/** 머리 표식 앞 선 모양 토막 — 지금 점에서 띄우는 거리 · 토막 길이(월드). */
const STUB_GAP = 0.08;
const STUB_LENGTH = 0.26;
/** 곡선 머리 N 표식을 토막 끝에서 띄우는 거리(화면 px). */
const HEAD_LABEL_GAP = 5;
/**
 * 곡선 머리 N 표식끼리 세로로 떨어뜨리는 가장 작은 간격(월드). 둘 이상이 50% 둘레에 몰려도
 * 글자가 겹치지 않게 한다 — 글자 한 줄 높이쯤이다.
 */
const HEAD_LABEL_MIN_DY = 0.17;
/** 축 이름을 축 끝에서 띄우는 거리(화면 px). 세로축은 위로, 가로축은 아래로. */
const AXIS_NAME_GAP = 12;
/** 세로축이 100% 위로 더 뻗는 길이(월드). 100% 표식이 축 끝과 겹쳐 보이지 않게 한다. */
const AXIS_OVERSHOOT = 0.1;

/**
 * 곡선 머리 표식의 세로 자리 — 원하는 높이(곡선 머리)를 지키되 서로 `HEAD_LABEL_MIN_DY`
 * 보다 가까우면 벌린다. 벌린 무리는 원하는 높이의 평균 둘레에 다시 가운데 맞춘다.
 * 조각의 배치 계산이다 (장부 G111 · G169 와 같은 모자람, NOTES (c)).
 */
function spreadLabels(wanted: readonly number[]): number[] {
  const order = wanted.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  // 무리마다 원하는 높이의 합을 들고, 가운데 = 평균, 무리 높이 = (개수 − 1) × 간격.
  const groups: { ids: number[]; sum: number }[] = [];
  const bottomOf = (g: { ids: number[]; sum: number }): number =>
    g.sum / g.ids.length - ((g.ids.length - 1) * HEAD_LABEL_MIN_DY) / 2;
  const topOf = (g: { ids: number[]; sum: number }): number =>
    bottomOf(g) + (g.ids.length - 1) * HEAD_LABEL_MIN_DY;
  // 아래에서부터 쌓으며, 바로 아래 무리와 간격이 모자라면 합친다.
  for (const { y, i } of order) {
    groups.push({ ids: [i], sum: y });
    while (groups.length >= 2) {
      const g = groups[groups.length - 1]!;
      const prev = groups[groups.length - 2]!;
      if (bottomOf(g) - topOf(prev) >= HEAD_LABEL_MIN_DY) break;
      groups.splice(groups.length - 2, 2, { ids: [...prev.ids, ...g.ids], sum: prev.sum + g.sum });
    }
  }
  const out = new Array<number>(wanted.length).fill(0);
  for (const g of groups) {
    const bottom = bottomOf(g);
    g.ids.forEach((id, k) => {
      out[id] = bottom + k * HEAD_LABEL_MIN_DY;
    });
  }
  return out;
}

export function scene(params: {
  state: StatisticalFluctuationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('statistical-fluctuation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const t = tl.u;
  // 주기 첫머리에 나타나고 끝에서 흐려진다.
  const shown = tl.at('appear') * (1 - tl.at('fade'));

  const W = c.boxWidth;
  const H = c.boxHeight;
  const out: Primitive[] = [];
  const nBoxes = state.boxes.length;
  /** 상자 i(위에서부터)의 왼쪽 아래 모서리 높이. */
  const boxY = (i: number): number => (nBoxes - 1 - i) * (H + BOX_GAP);

  // ---- 상자 셋 ----
  state.boxes.forEach((particles, i) => {
    const y0 = boxY(i);
    out.push({
      type: 'trajectory',
      id: `box-${i}`,
      points: [
        [0, y0],
        [W, y0],
        [W, y0 + H],
        [0, y0 + H],
      ],
      closed: true,
      width: BOX_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    // 가운데 점선 — 그래프가 세는 「왼쪽 칸」 이 어디까지인지.
    out.push({
      type: 'trajectory',
      id: `midline-${i}`,
      points: [
        [W / 2, y0],
        [W / 2, y0 + H],
      ],
      width: GUIDE_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
    });
    const positions: Vec2[] = particles.map((p) => {
      const [x, y] = particleAt(p, t, c);
      return [x, y0 + y];
    });
    out.push({
      type: 'particleSystem',
      id: `particles-${i}`,
      positions,
      sizes: PARTICLE_R_PX[i] ?? PARTICLE_R_PX[PARTICLE_R_PX.length - 1],
      opacity: shown,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `box-label-${i}`,
      anchor: { world: [0, y0 + H / 2], offset: [-LABEL_GAP, 0] },
      text: text('label.n'),
      vars: { n: state.countTexts[i] ?? '' },
      chip: false,
      font: 'text',
      italic: true,
      fontSize: LABEL_PX,
      align: 'right',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  });

  // ---- 그래프: 왼쪽 칸에 든 몫 ----
  const [ox, oy] = GRAPH.origin;
  const t0 = tl.start('draw');
  const axisSeconds = tl.end('compare') - t0;
  const xOf = (s: number): number => ox + (s / axisSeconds) * GRAPH.width;
  const yOf = (share: number): number => oy + share * GRAPH.height;

  out.push({
    type: 'trajectory',
    id: 'graph-axes',
    points: [
      [ox, oy + GRAPH.height + AXIS_OVERSHOOT],
      [ox, oy],
      [ox + GRAPH.width, oy],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  // 50% 선 — 고르게 나뉜 높이. 곡선이 이 선에서 얼마나 멀어지는지가 주장이다.
  out.push({
    type: 'trajectory',
    id: 'line-half',
    points: [
      [ox, yOf(0.5)],
      [ox + GRAPH.width, yOf(0.5)],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  // % 는 축 눈금에만 쓴다.
  const ticks = [
    { id: 'tick-0', share: 0, key: 'label.tick0' },
    { id: 'tick-50', share: 0.5, key: 'label.tick50' },
    { id: 'tick-100', share: 1, key: 'label.tick100' },
  ] as const;
  for (const tick of ticks) {
    out.push({
      type: 'readout',
      id: tick.id,
      anchor: { world: [ox, yOf(tick.share)], offset: [-LABEL_GAP, 0] },
      text: text(tick.key),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'right',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'readout',
    id: 'axis-share',
    anchor: { world: [ox, oy + GRAPH.height + AXIS_OVERSHOOT], offset: [0, -AXIS_NAME_GAP] },
    text: text('label.axisShare'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-time',
    anchor: { world: [ox + GRAPH.width, oy], offset: [0, AXIS_NAME_GAP] },
    text: text('label.axisTime'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 곡선 셋 — `draw` 시작부터 지금까지. 흐려짐 단계에서는 끝에서 멈춘다.
  const now = Math.min(Math.max(t - t0, 0), axisSeconds);
  const heads: Vec2[] = [];
  state.boxes.forEach((particles, i) => {
    const curve: Vec2[] = [];
    for (let s = 0; s < now; s += GRAPH.sampleSeconds) {
      curve.push([xOf(s), yOf(leftShare(particles, t0 + s, c))]);
    }
    const head: Vec2 = [xOf(now), yOf(leftShare(particles, t0 + now, c))];
    curve.push(head);
    heads.push(head);
    if (curve.length >= 2) {
      out.push({
        type: 'trajectory',
        id: `curve-${i}`,
        points: curve,
        width: CURVE_WIDTH_PX[i] ?? CURVE_WIDTH_PX[0],
        opacity: shown,
        style: {
          colorRole: 'ink',
          emphasis: 'strong',
          lineStyle: CURVE_LINE_STYLES[i] ?? 'solid',
        },
      });
    }
  });

  // 지금 점 — 강조색은 이 한 뜻(지금 왼쪽 칸의 몫)에만 쓴다.
  out.push({
    type: 'trace',
    id: 'share-now',
    shape: 'dot',
    size: DOT_R,
    marks: heads.map((pos) => ({ pos })),
    opacity: shown,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 곡선 머리 N 표식 — 어느 곡선이 어느 상자인지. 50% 둘레에 몰리면 세로로 벌리고, 벌려도
  // 어느 곡선의 것인지 읽히게 표식 앞에 그 곡선의 선 모양 토막을 둔다.
  const labelYs = spreadLabels(heads.map((h) => h[1]));
  heads.forEach((head, i) => {
    const y = labelYs[i]!;
    const x0 = head[0] + STUB_GAP;
    out.push({
      type: 'trajectory',
      id: `head-stub-${i}`,
      points: [
        [x0, y],
        [x0 + STUB_LENGTH, y],
      ],
      width: CURVE_WIDTH_PX[i] ?? CURVE_WIDTH_PX[0],
      opacity: shown,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: CURVE_LINE_STYLES[i] ?? 'solid' },
    });
    out.push({
      type: 'readout',
      id: `head-label-${i}`,
      anchor: { world: [x0 + STUB_LENGTH, y], offset: [HEAD_LABEL_GAP, 0] },
      text: text('label.n'),
      vars: { n: state.countTexts[i] ?? '' },
      chip: false,
      font: 'text',
      italic: true,
      fontSize: LABEL_PX,
      align: 'left',
      opacity: shown,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
