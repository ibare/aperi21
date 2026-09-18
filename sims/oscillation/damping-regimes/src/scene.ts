// ========================================================================
// damping-regimes — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 천장 보(`surface`) · 용수철(`constraint` spring) ·
// 추(`body`) · 평형선 · 시간 곡선 · 펜 끈 · 멎음 눈금(`trajectory`) · 이름표(`readout`)
// 가 모두 표준 어휘로 있다.
//
// 줄 셋은 같은 장치다 — 추 · 용수철 · 곡선이 모두 같은 먹색이다. 가르는 것은 줄
// 이름표(ζ)이지 색이 아니다 (S-piece). 강조색은 **멎은 때** 한 가지 뜻에만 쓴다.
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
import { clock, displacement, readConstants, settleTime, zetas } from './physics';
import {
  CEILING_HALF_W,
  CEILING_RISE,
  MASS_HALF_H,
  MASS_HALF_W,
  PLOT_X0,
  ROW_Y,
  SAMPLE_DT,
  SCENE_BOUNDS,
  SETTLE_TICK_HALF,
  TIME_SCALE,
  text,
  type DampingRegimesMessageKey,
} from './schema';
import type { DampingRegimesState } from './state';

/** 줄 이름표를 천장 높이에서 조금 내리는 거리(화면 px). */
const ROW_LABEL_OFFSET: Vec2 = [0, 4];
/**
 * 「멎음」 글자를 눈금 끝의 오른쪽 위에 둔다(화면 px). 눈금 바로 위 가운데에 두면
 * 임계가 멎은 시각의 세로 점선이 글자를 관통한다.
 */
const SETTLED_LABEL_OFFSET: Vec2 = [5, -4];
/** 펜 끝 점의 반지름(월드). */
const PEN_RADIUS = 0.028;

const ROW_KEYS: readonly DampingRegimesMessageKey[] = ['label.under', 'label.critical', 'label.over'];

export function scene(params: {
  state: DampingRegimesState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('damping-regimes: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const { tau, opacity: op } = clock(timeline, c);
  const zs = zetas(c);
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const plotEnd = PLOT_X0 + c.window * TIME_SCALE;
  const g: Primitive[] = [];

  const settles = zs.map((z) => settleTime(z, c));

  zs.forEach((zeta, i) => {
    const rowY = ROW_Y[i]!;
    const ceilY = rowY + CEILING_RISE;
    const x = displacement(zeta, tau, c);
    const massY = rowY + x;

    // ---- 평형선 — 곡선이 되돌아와야 하는 자리 ----
    g.push({
      type: 'trajectory',
      id: `rest-${i}`,
      points: [
        [PLOT_X0, rowY],
        [plotEnd, rowY],
      ],
      width: 1,
      opacity: op * 0.8,
      style: { ...muted, lineStyle: 'dashed' },
    });

    // ---- 천장 · 용수철 · 추 ----
    g.push({
      type: 'surface',
      id: `ceiling-${i}`,
      geometry: { kind: 'wall', from: [-CEILING_HALF_W, ceilY], to: [CEILING_HALF_W, ceilY] },
      material: 'solid',
      opacity: op,
    });
    g.push({
      type: 'constraint',
      id: `spring-${i}`,
      subtype: 'spring',
      from: [0, ceilY],
      to: [0, massY + MASS_HALF_H],
      coils: 5,
      opacity: op,
      style: ink,
    });
    g.push({
      type: 'body',
      id: `mass-${i}`,
      pos: [0, massY],
      shape: 'rect',
      size: [MASS_HALF_W * 2, MASS_HALF_H * 2],
      opacity: op,
      style: ink,
    });

    // ---- 시간 곡선 — 추가 펜이다 ----
    const pts: Vec2[] = [];
    const n = Math.floor(tau / SAMPLE_DT);
    for (let k = 0; k <= n; k++) {
      const t = k * SAMPLE_DT;
      pts.push([PLOT_X0 + t * TIME_SCALE, rowY + displacement(zeta, t, c)]);
    }
    const headX = PLOT_X0 + tau * TIME_SCALE;
    pts.push([headX, massY]);
    if (pts.length >= 2) {
      g.push({
        type: 'trajectory',
        id: `trace-${i}`,
        points: pts,
        width: 2,
        opacity: op,
        style: ink,
      });
    }
    // 추와 펜 끝을 잇는 끈 — 곡선의 높이가 곧 추의 높이라는 것을 잇는다.
    g.push({
      type: 'trajectory',
      id: `pen-link-${i}`,
      points: [
        [MASS_HALF_W, massY],
        [headX, massY],
      ],
      width: 1,
      opacity: op * 0.7,
      style: { ...muted, lineStyle: 'dotted' },
    });
    g.push({
      type: 'body',
      id: `pen-${i}`,
      pos: [headX, massY],
      shape: 'circle',
      size: PEN_RADIUS,
      glow: false,
      outline: 'none',
      opacity: op,
      style: ink,
    });

    // ---- 줄 이름표 ----
    g.push({
      type: 'readout',
      id: `row-label-${i}`,
      anchor: { world: [PLOT_X0, ceilY], offset: ROW_LABEL_OFFSET },
      text: text(ROW_KEYS[i]!),
      vars: { zeta: String(zeta) },
      chip: false,
      font: 'text',
      fontSize: 12,
      align: 'left',
      opacity: op,
      style: muted,
    });

    // ---- 멎은 때 — 강조색은 이 한 가지 뜻에만 ----
    const ts = settles[i];
    if (ts !== null && ts !== undefined && tau >= ts) {
      const sx = PLOT_X0 + ts * TIME_SCALE;
      g.push({
        type: 'trajectory',
        id: `settle-${i}`,
        points: [
          [sx, rowY - SETTLE_TICK_HALF],
          [sx, rowY + SETTLE_TICK_HALF],
        ],
        width: 2,
        opacity: op,
        style: accent,
      });
      g.push({
        type: 'readout',
        id: `settle-label-${i}`,
        anchor: { world: [sx, rowY + SETTLE_TICK_HALF], offset: SETTLED_LABEL_OFFSET },
        text: text('label.settled'),
        chip: false,
        font: 'text',
        fontSize: 11,
        align: 'left',
        opacity: op,
        style: accent,
      });
    }
  });

  // ---- 임계 감쇠가 멎은 시각 — 세 줄을 가로지르는 기준선 ----
  // 이 선을 지난 뒤에도 위아래 두 곡선이 아직 평형선을 떠나 있는 것이 「가장 빨리」 다.
  const tc = settles[1];
  if (tc !== null && tc !== undefined && tau >= tc) {
    const cx = PLOT_X0 + tc * TIME_SCALE;
    g.push({
      type: 'trajectory',
      id: 'critical-line',
      points: [
        [cx, ROW_Y[0] + CEILING_RISE - 0.12],
        [cx, ROW_Y[2] - CEILING_RISE + 0.1],
      ],
      width: 1,
      opacity: op * 0.8,
      style: { ...muted, lineStyle: 'dashed' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
