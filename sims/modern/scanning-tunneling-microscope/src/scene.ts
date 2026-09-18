// ========================================================================
// scanning-tunneling-microscope — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 원자 · 탐침 끝은 `body` 원, 탐침 쐐기는
// `body` custom, 틈을 건너는 전자는 `particleSystem`, 기록지는 `region`, 기록 곡선 · 탐침과 펜을
// 잇는 점선은 `trajectory`, 펜은 `body` 점, 틈은 `dimension` + `readout` 이다. 캡션은 선언의
// 캡션 슬롯이 그린다.
//
// 색은 뜻마다 하나다 — 원자 · 탐침은 장치라 muted, 전자 점은 현상의 주 대상이라 primary.
// **강조색은 「기록」 한 가지에만** 쓴다(기록 곡선 · 펜 · 이름표). 원자와 기록 봉우리를 잇는 것은
// 색이 아니라 같은 가로 자리다.
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
  atomCenters,
  atomRadiusAt,
  contourHeight,
  declaredGap,
  electronPositions,
  heightAtGap,
  nearestAtom,
  readConstants,
  tipOpacity,
  tipPosition,
} from './physics';
import {
  RECORD_BASE,
  RECORD_PAPER_ABOVE,
  RECORD_PAPER_BELOW,
  RECORD_PAPER_MARGIN,
  SCENE_BOUNDS,
  SUBLAYER_DROP,
  TIP_HEIGHT,
  text,
} from './schema';
import type { ScanningTunnelingMicroscopeState } from './state';

/** 기록 곡선 표본 간격(nm). 원자 한 칸(0.5)에 25 표본. */
const RECORD_STEP = 0.02;
/** 탐침 쐐기 모양(nm) — 끝 원자 위 목의 반폭 · 높이, 윗변 반폭. */
const TIP_NECK_HALF = 0.075;
const TIP_NECK_Y = 0.06;
const TIP_TOP_HALF = 0.3;
/** 전자 점이 가운데에서 옆으로 비껴 가는 최대 폭(nm). */
const ELECTRON_SPREAD = 0.07;

/** 선 굵기(화면 px). */
const RECORD_WIDTH_PX = 2.5;
const LINK_WIDTH_PX = 1;
/** 전자 점 반지름(화면 px). */
const ELECTRON_PX = 2.6;
/** 불투명도. */
const SUBLAYER_OPACITY = 0.55;
const PAPER_FILL_OPACITY = 0.1;
const LINK_OPACITY = 0.7;
/** 글자 크기(화면 px). */
const GAP_LABEL_PX = 12;
const SYMBOL_PX = 13;
const RECORD_LABEL_PX = 12;
/** 글자 띄움(화면 px). */
const LABEL_GAP_PX = 16;

/** 탐침 쐐기 — 끝 원자 중심 기준, y 위 (body custom 규약). */
const TIP_PATH = [
  `M ${-TIP_NECK_HALF} ${TIP_NECK_Y}`,
  `L ${-TIP_TOP_HALF} ${TIP_HEIGHT}`,
  `L ${TIP_TOP_HALF} ${TIP_HEIGHT}`,
  `L ${TIP_NECK_HALF} ${TIP_NECK_Y}`,
  'Z',
].join(' ');

export function scene(params: {
  state: ScanningTunnelingMicroscopeState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('scanning-tunneling-microscope: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const atoms = atomCenters(c);
  const tip = tipPosition(tl, atoms, c);
  const opacity = tipOpacity(tl);
  const scanning = tl.at('scan') > 0;
  const recordOpacity = 1 - tl.at('fade');
  const h0 = heightAtGap(c.gapSet, c);
  const recordY = (h: number): number => RECORD_BASE + (h - h0) * c.recordGain;

  const out: Primitive[] = [];

  // ---- 기록지 — 훑기 구간 위의 옅은 띠. 늘 있다 ----
  const px0 = c.scanStart - RECORD_PAPER_MARGIN;
  const px1 = c.scanEnd + RECORD_PAPER_MARGIN;
  out.push({
    type: 'region',
    id: 'record-paper',
    points: [
      [px0, RECORD_BASE - RECORD_PAPER_BELOW],
      [px0, RECORD_BASE + RECORD_PAPER_ABOVE],
      [px1, RECORD_BASE + RECORD_PAPER_ABOVE],
      [px1, RECORD_BASE - RECORD_PAPER_BELOW],
    ],
    fillOpacity: PAPER_FILL_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'record-label',
    anchor: { world: [px0, RECORD_BASE + RECORD_PAPER_ABOVE], offset: [0, -LABEL_GAP_PX] },
    text: text('label.record'),
    vars: { gain: String(c.recordGain) },
    chip: false,
    font: 'text',
    fontSize: RECORD_LABEL_PX,
    align: 'left',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 표면 — 아랫줄(반 칸 어긋남, 옅게)과 윗줄 원자 ----
  atoms.slice(0, -1).forEach(([x], i) => {
    out.push({
      type: 'body',
      id: `sub-atom-${i}`,
      pos: [x + c.latticeSpacing / 2, -SUBLAYER_DROP],
      shape: 'circle',
      size: c.atomRadius,
      glow: false,
      opacity: SUBLAYER_OPACITY,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });
  });
  atoms.forEach((pos, i) => {
    out.push({
      type: 'body',
      id: `atom-${i}`,
      pos,
      shape: 'circle',
      size: atomRadiusAt(i, c),
      glow: false,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  });

  // ---- 탐침 — 쐐기와 끝 원자 ----
  if (opacity > 0) {
    out.push({
      type: 'body',
      id: 'tip-body',
      pos: tip,
      shape: 'custom',
      customPath: TIP_PATH,
      opacity,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });
    out.push({
      type: 'body',
      id: 'tip-apex',
      pos: tip,
      shape: 'circle',
      size: c.tipRadius,
      glow: false,
      opacity,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });

    // ---- 틈 — 가장 가까운 원자 겉면까지. 값은 지금 머문 단계의 선언값 ----
    const nearIndex = nearestAtom(tip, atoms, c);
    const near = atoms[nearIndex]!;
    const nearRadius = atomRadiusAt(nearIndex, c);
    const dx = near[0] - tip[0];
    const dy = near[1] - tip[1];
    const len = Math.hypot(dx, dy);
    const from: Vec2 = [tip[0] + (dx / len) * c.tipRadius, tip[1] + (dy / len) * c.tipRadius];
    const to: Vec2 = [near[0] - (dx / len) * nearRadius, near[1] - (dy / len) * nearRadius];
    const mid: Vec2 = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
    out.push({
      type: 'dimension',
      id: 'gap',
      from,
      to,
      opacity,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'gap-label',
      anchor: { world: mid, offset: [LABEL_GAP_PX, 0] },
      text: text('label.gap'),
      vars: { g: String(declaredGap(tl, c)) },
      chip: false,
      font: 'text',
      fontSize: GAP_LABEL_PX,
      align: 'left',
      opacity,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // ---- 전자 — 틈을 건너는 점. 잦기가 곧 전류다 ----
    out.push({
      type: 'particleSystem',
      id: 'electrons',
      positions: electronPositions(tl, tip, atoms, c, ELECTRON_SPREAD),
      sizes: ELECTRON_PX,
      opacity,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'electron-label',
      // 탐침 끝 원자 옆 — 틈 가운데 높이에 두면 옆 원자로 비스듬히 가는 점이 기호를 지나간다.
      anchor: { world: [tip[0] - c.tipRadius, tip[1]], offset: [-LABEL_GAP_PX, 0] },
      text: text('label.electron'),
      chip: false,
      font: 'text',
      fontSize: SYMBOL_PX,
      italic: true,
      align: 'right',
      opacity,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ---- 기록 — 훑기가 시작되면 탐침 높이가 기록지에 자란다 ----
  if (scanning && recordOpacity > 0) {
    const pts: Vec2[] = [];
    for (let x = c.scanStart; x < tip[0]; x += RECORD_STEP) {
      pts.push([x, recordY(contourHeight(x, atoms, c))]);
    }
    const pen: Vec2 = [tip[0], recordY(tip[1])];
    pts.push(pen);
    if (pts.length > 1) {
      out.push({
        type: 'trajectory',
        id: 'record',
        points: pts,
        width: RECORD_WIDTH_PX,
        opacity: recordOpacity,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
    if (opacity > 0) {
      // 탐침 윗변에서 펜까지 — 기록이 탐침 높이라는 것을 잇는다.
      out.push({
        type: 'trajectory',
        id: 'record-link',
        points: [[tip[0], tip[1] + TIP_HEIGHT], pen],
        width: LINK_WIDTH_PX,
        opacity: opacity * LINK_OPACITY,
        style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
      });
      out.push({
        type: 'body',
        id: 'record-pen',
        pos: pen,
        shape: 'point',
        opacity,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
