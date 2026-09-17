// ========================================================================
// resonance — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 흔들림 폭 띠 · 진동자 막대는 `lineSet`, 추는 `particleSystem`, 구동대는 `trajectory`,
// 구동 진동수 표시는 `region` 삼각형 + `readout`, 진폭 이력 무늬는 `scalarField`, 무늬
// 읽는 법은 `readout` 셋. 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
//
// 강조색(`accent`)은 **구동** 하나에만 — 구동대 · 구동 진동수 표시. 진동자와 무늬는 모두
// 같은 먹색이다. 봉우리를 강조색으로 칠하면 답을 색으로 말하게 된다 (원본 NOTES (c)).
// ========================================================================

import type {
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  Region,
  ScalarField,
  SceneGraph,
  Trajectory,
  Vec2,
} from '@aperi21/schema';
import { amplitudeOf, baseOffset, driveIndex } from './physics';
import { HISTORY, LAYOUT, OSC, SCENE_BOUNDS, STROKE, colX, text, worldY } from './schema';
import type { ResonanceState } from './state';

export function scene(params: { state: ResonanceState }): SceneGraph {
  const s = params.state;
  const out: Primitive[] = [];
  const N = OSC.count;
  const base = LAYOUT.baseY + baseOffset(s);
  const restY = base - LAYOUT.rest;

  // ---- 흔들림 폭 ----
  // 각 진동자 정지 높이를 가운데로, 지금 진폭의 두 배 길이. 추는 순간 위치라 정지 화면에서는
  // 위상 곡선으로 읽히므로, 「얼마나 쌓였나」 는 이 띠의 길이가 맡는다.
  const bands: Vec2[][] = [];
  for (let i = 0; i < N; i++) {
    const amp = amplitudeOf(s, i);
    const x = colX(i);
    bands.push([
      [x, worldY(restY - amp)],
      [x, worldY(restY + amp)],
    ]);
  }
  const band: LineSet = {
    type: 'lineSet',
    id: 'swing-bands',
    lines: bands,
    width: STROKE.bandWidth,
    opacity: STROKE.bandOpacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(band);

  // ---- 진동자 막대 · 추 ----
  const rods: Vec2[][] = [];
  const bobs: Vec2[] = [];
  for (let i = 0; i < N; i++) {
    const x = colX(i);
    const top: Vec2 = [x, worldY(restY - s.z[i]!)];
    rods.push([[x, worldY(base)], top]);
    bobs.push(top);
  }
  const rod: LineSet = {
    type: 'lineSet',
    id: 'rods',
    lines: rods,
    width: STROKE.rodWidth,
    opacity: STROKE.rodOpacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(rod);
  const bob: ParticleSystem = {
    type: 'particleSystem',
    id: 'bobs',
    positions: bobs,
    sizes: STROKE.bobRadius,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(bob);

  // ---- 구동대 ----
  const bar: Trajectory = {
    type: 'trajectory',
    id: 'drive-bar',
    points: [
      // 원본 `colX(0) − pitch/2` ~ `colX(N−1) + pitch/2` — 곧 양옆 여백 안쪽 끝.
      [LAYOUT.side, worldY(base)],
      [LAYOUT.width - LAYOUT.side, worldY(base)],
    ],
    width: STROKE.barWidth,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(bar);

  // ---- 구동 진동수 표시 ----
  // 고유 진동수 축 위에서 구동 진동수와 같은 열 아래. 구동대의 흔들림을 따라가지 않는다 (원본).
  const mx = colX(driveIndex(s.driveHz));
  const mark: Region = {
    type: 'region',
    id: 'drive-mark',
    points: [
      [mx, worldY(LAYOUT.baseY + LAYOUT.markTip)],
      [mx - LAYOUT.markHalf, worldY(LAYOUT.baseY + LAYOUT.markBase)],
      [mx + LAYOUT.markHalf, worldY(LAYOUT.baseY + LAYOUT.markBase)],
    ],
    fillOpacity: 1,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(mark);
  // 원본은 글자가 오른쪽 끝을 넘으면 왼쪽으로 돌렸다. 조작 범위(54 번까지)에서는 언제나 오른쪽이다.
  const markLabel: Readout = {
    type: 'readout',
    id: 'drive-label',
    anchor: { world: [mx, worldY(LAYOUT.baseY + LAYOUT.markLabelY)], offset: [LAYOUT.markLabelGap, 0] },
    text: text('label.drive'),
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: STROKE.markLabelPx,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(markLabel);

  // ---- 진폭 이력 무늬 ----
  // 가로 = 진동자(위의 열과 같은 가로 위치), 세로 = 시간(위가 지금). 진할수록 그 순간 흔들림이 크다.
  const left = LAYOUT.side;
  const right = LAYOUT.width - LAYOUT.side;
  const wfTop = LAYOUT.waterfallTop;
  const wfBottom = LAYOUT.waterfallTop + LAYOUT.waterfallHeight;
  const waterfall: ScalarField = {
    type: 'scalarField',
    id: 'amplitude-history',
    min: [left, worldY(wfBottom)],
    max: [right, worldY(wfTop)],
    cols: N,
    rows: HISTORY.rows,
    values: s.history,
    range: [0, 1],
    colors: { high: 'ink' },
  };
  out.push(waterfall);
  const frame: Trajectory = {
    type: 'trajectory',
    id: 'history-frame',
    points: [
      [left + 0.5, worldY(wfTop + 0.5)],
      [right - 0.5, worldY(wfTop + 0.5)],
      [right - 0.5, worldY(wfBottom - 0.5)],
      [left + 0.5, worldY(wfBottom - 0.5)],
    ],
    closed: true,
    width: STROKE.frameWidth,
    opacity: STROKE.frameOpacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(frame);

  // ---- 무늬 읽는 법 ----
  // 원본은 글자 위 끝을 무늬 아래 4 px 에 맞췄다. readout 은 글자 가운데에 맞추므로 반 줄 내린다.
  const legendY = worldY(wfBottom + LAYOUT.legendGap + STROKE.legendPx / 2);
  const legend = (id: string, x: number, align: Readout['align'], t: Readout['text']): Readout => ({
    type: 'readout',
    id,
    anchor: { world: [x, legendY] },
    text: t,
    chip: false,
    align,
    font: 'text',
    fontSize: STROKE.legendPx,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push(legend('legend-low', left, 'left', text('label.lowFreq')));
  out.push(legend('legend-high', right, 'right', text('label.highFreq')));
  out.push(legend('legend-time', LAYOUT.width / 2, 'center', text('label.timeAxis')));

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
