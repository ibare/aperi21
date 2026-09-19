// ========================================================================
// millikan-experiment — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 판(body rect) · 장선(lineSet) ·
// 부호 · 눈금 이름(readout) · 방울과 점(body) · 두 힘(vector) · 축(trajectory)이 모두
// 표준 어휘다.
//
// 색은 뜻마다 하나다 — 판 · 부호 · 축 · 무게는 먹, 장선은 secondary(배경 정보), 방울과
// 그 방울에서 잰 전하의 점은 primary(같은 대상 = 같은 색). **강조색은 「방울을 위로 끄는
// 전기력」 한 가지 뜻에만** 쓴다 — 전압을 올리는 것이 바꾸는 유일한 것이다.
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
  currentDrop,
  dotTarget,
  drawCycle,
  firstDropY,
  readConstants,
  recordProgress,
  voltageFraction,
  weightLength,
} from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { MillikanExperimentState } from './state';

/** 장선 굵기(화면 px) · 전압이 다 올랐을 때의 불투명도. 배경 정보라 가늘고 옅다. */
const FIELD_LINE_WIDTH = 1.2;
const FIELD_LINE_OPACITY = 0.6;
/** 두 힘 화살표의 굵기(화면 px) · 머리 크기(월드). */
const FORCE_WIDTH = 3.5;
const FORCE_HEAD = 0.16;
/** 판 부호 글자 크기(화면 px) · 판에서 띄우는 거리(화면 px). */
const PLATE_SIGN_PX = 18;
const PLATE_SIGN_GAP = 14;
/** 축 선 · 눈금 굵기(화면 px). */
const AXIS_WIDTH = 1.5;
const TICK_WIDTH = 1.5;
/** 눈금 선이 축 위아래로 뻗는 길이(월드). */
const TICK_HALF = 0.09;
/** 축 선이 0 눈금 왼쪽으로 조금 더 나가는 길이(월드). */
const AXIS_LEAD = 0.2;
/** 눈금 이름 글자 크기 · 축 아래로 띄우는 거리(화면 px). */
const TICK_LABEL_PX = 14;
const TICK_LABEL_GAP = 16;
/** 축 끝 `q` 표식을 끝에서 오른쪽으로 띄우는 거리(화면 px). */
const Q_LABEL_GAP = 10;
/** e 값 표식 글자 크기(화면 px). */
const E_VALUE_PX = 13;

export function scene(params: {
  state: MillikanExperimentState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const drops = drawCycle(c, tl.cycle);
  const out: Primitive[] = [];
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const top = c.plateGap / 2;
  const s = voltageFraction(tl);
  const fade = 1 - tl.at('clear');

  // 1. 장선 — 판 사이 곧은 세로선. 전압이 오르는 만큼 짙어진다.
  if (s > 0) {
    const inner = top - c.plateThickness / 2;
    const lines: Vec2[][] = [];
    const step = (c.plateRight - c.plateLeft) / (c.fieldLines + 1);
    for (let k = 1; k <= c.fieldLines; k++) {
      const x = c.plateLeft + step * k;
      lines.push([
        [x, inner],
        [x, -inner],
      ]);
    }
    out.push({
      type: 'lineSet',
      id: 'field-lines',
      lines,
      width: FIELD_LINE_WIDTH,
      opacity: FIELD_LINE_OPACITY * s,
      style: { colorRole: 'secondary', emphasis: 'medium' },
    });
  }

  // 2. 판 — 위 판은 가운데 구멍을 두고 둘로, 아래 판은 하나. 먹색 얇은 막대.
  const holeL = c.dropX - c.holeWidth / 2;
  const holeR = c.dropX + c.holeWidth / 2;
  const plates: [string, number, number, number][] = [
    ['plate-top-left', c.plateLeft, holeL, top],
    ['plate-top-right', holeR, c.plateRight, top],
    ['plate-bottom', c.plateLeft, c.plateRight, -top],
  ];
  plates.forEach(([id, x1, x2, y]) => {
    out.push({
      type: 'body',
      id,
      pos: [(x1 + x2) / 2, y],
      shape: 'rect',
      size: [x2 - x1, c.plateThickness],
      glow: false,
      outline: 'none',
      style: ink,
    });
  });

  // 판 부호 — 전압이 걸린 만큼만 보인다.
  if (s > 0) {
    const signX = (c.plateLeft + holeL) / 2;
    out.push({
      type: 'readout',
      id: 'plate-top-sign',
      anchor: { world: [signX, top], offset: [0, -PLATE_SIGN_GAP] },
      text: text('mark.plus'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: PLATE_SIGN_PX,
      opacity: s,
      style: ink,
    });
    out.push({
      type: 'readout',
      id: 'plate-bottom-sign',
      anchor: { world: [signX, -top], offset: [0, PLATE_SIGN_GAP] },
      text: text('mark.minus'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: PLATE_SIGN_PX,
      opacity: s,
      style: ink,
    });
  }

  // 3. 지금 떠 있는 방울과 두 힘. 첫 방울은 전압에 따라 느려지고, 나머지는 이미 균형이다.
  const now = currentDrop(tl, c);
  const drop = drops[now]!;
  const dropPos: Vec2 = [c.dropX, now === 0 ? firstDropY(tl, c) : c.hoverY];
  const weight = weightLength(drop.radius, c);
  const balance = now === 0 ? tl.at('raise') : 1;
  out.push({
    type: 'vector',
    id: 'weight',
    from: [dropPos[0], dropPos[1] - drop.radius],
    delta: [0, -weight],
    headSize: FORCE_HEAD,
    width: FORCE_WIDTH,
    label: text('mark.weight'),
    opacity: fade,
    style: ink,
  });
  out.push({
    type: 'vector',
    id: 'electric-force',
    from: [dropPos[0], dropPos[1] + drop.radius],
    delta: [0, weight * balance],
    headSize: FORCE_HEAD,
    width: FORCE_WIDTH,
    label: text('mark.electric'),
    opacity: fade,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'drop',
    pos: dropPos,
    shape: 'circle',
    size: drop.radius,
    glow: false,
    outline: 'none',
    opacity: fade,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // 4. 전하 축 — 0 · e · 2e … 눈금과 끝의 `q`.
  const axisEnd = c.axisOriginX + c.maxMultiple * c.axisUnit + c.axisOverhang;
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [c.axisOriginX - AXIS_LEAD, c.axisY],
      [axisEnd, c.axisY],
    ],
    width: AXIS_WIDTH,
    style: ink,
  });
  const ticks: Vec2[][] = [];
  for (let n = 0; n <= c.maxMultiple; n++) {
    const x = c.axisOriginX + n * c.axisUnit;
    ticks.push([
      [x, c.axisY - TICK_HALF],
      [x, c.axisY + TICK_HALF],
    ]);
    out.push({
      type: 'readout',
      id: `tick-label-${n}`,
      anchor: { world: [x, c.axisY], offset: [0, TICK_LABEL_GAP] },
      text: n === 0 ? text('mark.zero') : n === 1 ? text('mark.e') : text('mark.multiple'),
      vars: { n: String(n) },
      chip: false,
      font: 'text',
      italic: n > 0,
      fontSize: TICK_LABEL_PX,
      style: ink,
    });
  }
  out.push({
    type: 'lineSet',
    id: 'ticks',
    lines: ticks,
    width: TICK_WIDTH,
    style: ink,
  });
  out.push({
    type: 'readout',
    id: 'axis-q',
    anchor: { world: [axisEnd, c.axisY], offset: [Q_LABEL_GAP, 0] },
    text: text('mark.q'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: TICK_LABEL_PX,
    style: ink,
  });
  out.push({
    type: 'readout',
    id: 'e-value',
    anchor: { world: c.eLabel },
    text: text('label.eValue'),
    vars: { e: String(c.eMantissa) },
    chip: false,
    font: 'mono',
    fontSize: E_VALUE_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 5. 잰 전하의 점 — 방울에서 떠나 축 위 제 자리로 날아가 앉는다.
  drops.forEach((d, i) => {
    const p = recordProgress(i, tl);
    if (p <= 0) return;
    const from: Vec2 = [c.dropX, c.hoverY];
    const to = dotTarget(d, c);
    out.push({
      type: 'body',
      id: `dot-${i}`,
      pos: [from[0] + (to[0] - from[0]) * p, from[1] + (to[1] - from[1]) * p],
      shape: 'circle',
      size: c.dotRadius,
      glow: false,
      outline: 'background',
      opacity: fade,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
