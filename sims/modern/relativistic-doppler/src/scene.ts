// ========================================================================
// relativistic-doppler — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 파면(lineSet, 빛 채널) · 길과 안내
// 점선(trajectory) · 광원과 관찰자(body) · 빠르기 화살표(vector) · 글자(readout)가 모두 표준
// 어휘로 있다.
//
// 색 — 파면은 빛 채널로만 칠한다(`light: { rgb }`, 방향마다 받는 파장에서 `wavelengthToLinearRgb`).
// 색이 곧 주장이라 역할색을 빌리지 않는다. 광원도 제 빛(540 nm)으로 칠한다 — 옆으로 간 파면과
// 한 화면에서 견주는 기준이다. 관찰자 셋은 지금 받는 빛의 색으로 칠한다 — 파면이 제 몸을
// 지나가는 자리의 색이 원판 크기로 읽힌다. 글자는 먹색, 길 · 안내 점선은 muted, 강조색은 광원의
// 빠르기 화살표 하나(「달린다」)에만 쓴다.
//
// 선마다 빛 색이 하나라(G101) 파면을 파장 칸(`COLOR_BIN_NM`)마다 한 `lineSet` 으로 나눠 선언한다.
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
  lightOfNm,
  movingSource,
  readConstants,
  receivedNmAt,
  sourceX,
  wavefronts,
  wavelengthNmAt,
  type MovingSource,
} from './physics';
import { LANE_Y, OBSERVER_X, SCENE_BOUNDS, SIDE_DIST, SIDE_X, WAVE_CLIP, text } from './schema';
import type { RelativisticDopplerState } from './state';

/** 파면 원 한 바퀴를 몇 토막으로 표본하나. */
const RING_SEGMENTS = 144;
/** 파면 색을 나누는 파장 칸(nm). 칸마다 `lineSet` 하나다(G101). */
const COLOR_BIN_NM = 5;
/** 파면을 찾을 때 반지름 상한(월드) — 화면 대각선보다 넉넉하다. 넘은 파면은 화면을 다 지났다. */
const RING_R_LIMIT = 24;
/** 시간표가 오지 않을 때(정지 미리보기) — 옆으로 간 빛이 닿는 시각으로 멈춰 세운다. */
const STILL_REACH_START = 6;

/**
 * 파면 굵기(화면 px). 그림에서 가장 먼저 읽혀야 하는 선이다. 짙기는 1 이다 — 옅게 하면 파장 칸이
 * 바뀌는 이음매마다 두 선의 끝이 겹쳐 점이 찍힌다.
 */
const RING_WIDTH_PX = 2.5;
/** 길 · 안내 점선 굵기(화면 px). */
const LANE_WIDTH_PX = 1;
const GUIDE_WIDTH_PX = 1.5;
/** 광원 원판 반지름 · 관찰자 원판 반지름 · 낸 자리 표지 반지름(월드). */
const SOURCE_R = 0.2;
const OBSERVER_R = 0.17;
const EMIT_MARK_R = 0.1;
/** 빠르기 화살표 길이(월드) · 광원 가장자리에서 띄우는 거리(월드). */
const VELOCITY_LEN = 0.85;
const VELOCITY_GAP = 0.08;
/** 안내 점선이 낸 자리 표지 · 관찰자와 떨어지는 틈(월드). */
const GUIDE_GAP = 0.16;
/** 글자 크기(화면 px) · 앵커에서 띄우는 거리(화면 px). */
const LABEL_PX = 12;
const NM_PX = 13;
const LABEL_GAP_PX = 14;
/** 「옆으로 간 빛」 글자를 점선 왼쪽으로 비키는 거리(화면 px). */
const SIDEWAYS_LABEL_DX_PX = 56;

type SceneParams = {
  state: RelativisticDopplerState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
};

const inClip = ([x, y]: Vec2): boolean =>
  x >= WAVE_CLIP.min[0] && x <= WAVE_CLIP.max[0] && y >= WAVE_CLIP.min[1] && y <= WAVE_CLIP.max[1];

/** 중심에서 사각형의 가장 먼 모서리까지 — 반지름이 이보다 크면 파면이 사각형을 다 지났다. */
function farCorner(cx: number, cy: number): number {
  const dx = Math.max(Math.abs(WAVE_CLIP.min[0] - cx), Math.abs(WAVE_CLIP.max[0] - cx));
  const dy = Math.max(Math.abs(WAVE_CLIP.min[1] - cy), Math.abs(WAVE_CLIP.max[1] - cy));
  return Math.hypot(dx, dy);
}

/**
 * 파면들을 파장 칸마다 묶은 선들로. 토막의 색은 토막 가운데 방향 φ 로 받는 파장의 칸이고,
 * 같은 칸이 이어지면 한 선으로 잇는다. 사각형 밖 토막은 뺀다.
 */
function binnedRings(s: MovingSource, tau: number): Map<number, Vec2[][]> {
  const bins = new Map<number, Vec2[][]>();
  for (const w of wavefronts(s, tau, RING_R_LIMIT)) {
    if (w.r > farCorner(w.cx, LANE_Y)) continue;
    let current: Vec2[] | null = null;
    let currentBin = Number.NaN;
    for (let i = 0; i < RING_SEGMENTS; i++) {
      const a0 = (2 * Math.PI * i) / RING_SEGMENTS;
      const a1 = (2 * Math.PI * (i + 1)) / RING_SEGMENTS;
      const pa: Vec2 = [w.cx + w.r * Math.cos(a0), LANE_Y + w.r * Math.sin(a0)];
      const pb: Vec2 = [w.cx + w.r * Math.cos(a1), LANE_Y + w.r * Math.sin(a1)];
      if (!inClip(pa) && !inClip(pb)) {
        current = null;
        continue;
      }
      const bin = Math.round(wavelengthNmAt(s, (a0 + a1) / 2) / COLOR_BIN_NM);
      if (current && bin === currentBin) {
        current.push(pb);
        continue;
      }
      current = [pa, pb];
      currentBin = bin;
      const lines = bins.get(bin) ?? [];
      lines.push(current);
      bins.set(bin, lines);
    }
  }
  return bins;
}

export function scene({ stage, timeline: tl }: SceneParams): SceneGraph {
  const k = readConstants(stage);
  const reachStart = tl ? tl.start('reach') : STILL_REACH_START;
  const s = movingSource(k, reachStart);

  // 옆으로 간 빛이 닿은 뒤로는 장면을 멈춰 세운다.
  const tau = tl ? Math.min(tl.u, reachStart) : reachStart;
  const shown = tl ? tl.at('appear') * (1 - tl.at('fade')) : 1;
  const reach = tl ? tl.at('reach') : 1;

  const srcX = sourceX(s, tau);
  const sideY = LANE_Y - SIDE_DIST;
  const out: Primitive[] = [];

  // ---- 파면 — 방향마다 받는 파장의 빛 색 ------------------------------------
  for (const [bin, lines] of binnedRings(s, tau)) {
    out.push({
      type: 'lineSet',
      id: `ring-${bin}`,
      lines,
      width: RING_WIDTH_PX,
      light: { rgb: lightOfNm(bin * COLOR_BIN_NM) },
      opacity: shown,
      clip: { min: [WAVE_CLIP.min[0], WAVE_CLIP.min[1]], max: [WAVE_CLIP.max[0], WAVE_CLIP.max[1]] },
    });
  }

  // ---- 광원이 달리는 길 -----------------------------------------------------
  out.push({
    type: 'trajectory',
    id: 'lane',
    points: [
      [-OBSERVER_X, LANE_Y],
      [OBSERVER_X, LANE_Y],
    ],
    width: LANE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // ---- 옆으로 간 빛 — 바로 위에서 낸 자리 → 옆 관찰자 -----------------------
  if (reach > 0) {
    const holdOpacity = reach * shown;
    out.push({
      type: 'trajectory',
      id: 'sideways-guide',
      points: [
        [SIDE_X, LANE_Y - EMIT_MARK_R - GUIDE_GAP],
        [SIDE_X, sideY + OBSERVER_R + GUIDE_GAP],
      ],
      width: GUIDE_WIDTH_PX,
      opacity: holdOpacity,
      style: { colorRole: 'ink', emphasis: 'medium', lineStyle: 'dotted' },
    });
    out.push({
      type: 'body',
      id: 'emit-mark',
      pos: [SIDE_X, LANE_Y],
      shape: 'circle',
      size: EMIT_MARK_R,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: holdOpacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'sideways-label',
      anchor: { world: [SIDE_X, LANE_Y - SIDE_DIST / 2], offset: [-SIDEWAYS_LABEL_DX_PX, 0] },
      text: text('label.sideways'),
      font: 'text',
      fontSize: LABEL_PX,
      opacity: holdOpacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'side-nm',
      anchor: { world: [SIDE_X, sideY - OBSERVER_R], offset: [0, LABEL_GAP_PX] },
      text: text('label.nm'),
      vars: { l: String(k.sideNm) },
      fontSize: NM_PX,
      opacity: holdOpacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 관찰자 셋 — 뒤 · 옆 · 앞. 지금 받는 빛의 색으로 칠한다 ---------------------
  const observers: readonly [string, Vec2][] = [
    ['observer-back', [-OBSERVER_X, LANE_Y]],
    ['observer-side', [SIDE_X, sideY]],
    ['observer-front', [OBSERVER_X, LANE_Y]],
  ];
  for (const [id, pos] of observers) {
    out.push({
      type: 'body',
      id,
      pos,
      shape: 'circle',
      size: OBSERVER_R,
      glow: false,
      outline: 'line',
      light: { rgb: lightOfNm(receivedNmAt(s, tau, pos[0], pos[1])) },
      opacity: shown,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'readout',
    id: 'back-nm',
    anchor: { world: [-OBSERVER_X, LANE_Y - OBSERVER_R], offset: [0, LABEL_GAP_PX] },
    text: text('label.nm'),
    vars: { l: String(k.backNm) },
    fontSize: NM_PX,
    opacity: shown,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'front-nm',
    anchor: { world: [OBSERVER_X, LANE_Y - OBSERVER_R], offset: [0, LABEL_GAP_PX] },
    text: text('label.nm'),
    vars: { l: String(k.frontNm) },
    fontSize: NM_PX,
    opacity: shown,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 광원 — 제 빛으로 칠하고, 달리는 방향에 화살표 --------------------------
  out.push({
    type: 'vector',
    id: 'velocity',
    from: [srcX + SOURCE_R + VELOCITY_GAP, LANE_Y],
    delta: [VELOCITY_LEN, 0],
    opacity: shown,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'speed',
    anchor: { world: [srcX + SOURCE_R + VELOCITY_GAP + VELOCITY_LEN / 2, LANE_Y], offset: [0, LABEL_GAP_PX] },
    text: text('label.speed'),
    vars: { b: String(k.beta) },
    fontSize: NM_PX,
    opacity: shown,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'source',
    pos: [srcX, LANE_Y],
    shape: 'circle',
    size: SOURCE_R,
    glow: false,
    light: { rgb: lightOfNm(k.sourceNm) },
    opacity: shown,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'source-label',
    anchor: { world: [srcX, LANE_Y + SOURCE_R], offset: [0, -LABEL_GAP_PX] },
    text: text('label.source'),
    vars: { l: String(k.sourceNm) },
    fontSize: NM_PX,
    opacity: shown,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
