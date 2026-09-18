// ========================================================================
// gravitational-redshift — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 별 · 받는 곳(body) · 빛의 길과
// 우물 곡선 · 안내선(trajectory) · 물결(lineSet, 빛 채널) · 이름표와 파장 글자(readout)가
// 모두 표준 어휘로 있다.
//
// 색 — 빛은 빛 채널로만 칠한다(`light: { rgb }`, 파장에서 `wavelengthToLinearRgb`). 색이 곧
// 주장의 절반이라(초록으로 떠나 붉게 받힌다) 역할색을 빌리지 않는다. 별 · 받는 곳 · 곡선 ·
// 글자는 먹색, 빛의 길 · 안내선은 muted. 강조색은 쓰지 않는다 — 강조할 것은 빛의 색 하나다.
//
// 선마다 빛 색이 하나라(G101) 물결을 파장 칸(`COLOR_BIN_NM`)마다 한 `lineSet` 으로 나눠 선언한다.
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
  depthAt,
  lightOfNm,
  lightPath,
  packetBack,
  packetSamples,
  readConstants,
  type LightPath,
  type WaveSample,
} from './physics';
import {
  GHOST_RISE,
  LANE_Y,
  OBSERVER_X,
  SCENE_BOUNDS,
  STAR_R,
  STAR_X,
  WAVE_AMP,
  WELL_DEPTH,
  WELL_LEFT_X,
  WELL_TOP_Y,
  text,
} from './schema';
import type { GravitationalRedshiftState } from './state';

/** 물결 한 사이클을 몇 점으로 표본하나. */
const SAMPLES_PER_CYCLE = 28;
/** 물결 색을 나누는 파장 칸(nm). 칸마다 `lineSet` 하나다(G101). */
const COLOR_BIN_NM = 4;
/** 우물 곡선 표본 수. */
const WELL_SAMPLES = 160;
/** 시간표가 오지 않을 때(정지 미리보기) 묶음 앞이 놓이는 길 위 자리 u. */
const STILL_FRONT_U = 0.5;

/** 물결 굵기(화면 px). 그림에서 가장 먼저 읽혀야 하는 선이다. */
const WAVE_WIDTH_PX = 2.5;
/** 견줌 물결(떠날 때 모습)의 짙기. 받은 물결보다 한 단 옅다. */
const GHOST_OPACITY = 0.8;
/** 빛의 길 · 안내선 · 우물 곡선 굵기(화면 px). */
const LANE_WIDTH_PX = 1;
const GUIDE_WIDTH_PX = 1;
const WELL_WIDTH_PX = 2;
/** 우물 곡선 위에서 묶음을 따라가는 점의 반지름(월드). */
const WELL_DOT_R = 0.07;
/** 받는 곳 표지 — 선 막대의 폭 · 높이(월드). */
const OBSERVER_W = 0.1;
const OBSERVER_H = 0.7;
/** 받는 곳 표지를 길 끝에서 띄우는 거리(월드). */
const OBSERVER_GAP = 0.14;
/** 퍼텐셜 이름표를 놓는 길 위 자리 u. 묶음이 머무는 오른쪽 끝 · 가파른 왼쪽을 피한다. */
const WELL_LABEL_U = 0.55;
/** 이름표 글자 크기(화면 px) · 앵커에서 띄우는 거리(화면 px). */
const LABEL_PX = 12;
const NM_PX = 13;
const LABEL_GAP_PX = 12;
/** 우물 곡선 아래 이름표의 띄움(화면 px) — 곡선 위 점과 겹치지 않게 조금 더 띄운다. */
const WELL_LABEL_GAP_PX = 18;
/** 안내 점선이 물결 · 곡선 점과 떨어지는 틈(월드). */
const GUIDE_GAP = 0.12;

type SceneParams = {
  state: GravitationalRedshiftState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
};

/** 표면 x · 길 길이(월드). 길 위 자리 u 는 0(표면) ~ 1(먼 곳). */
const PATH_X0 = STAR_X + STAR_R;
const PATH_LEN = OBSERVER_X - PATH_X0;
const xOfU = (u: number): number => PATH_X0 + PATH_LEN * u;

/**
 * 우물 곡선의 높이. 별 밖은 깊이 R/r = (1 − u)² — 길과 같이 눌러 그린 −GM/r 이다. 왼쪽은
 * 거울상. 별 안은 표면에서 기울기가 이어지는 얕은 바닥이다. 깊이는 그림 배치다 — 모양이
 * 말하는 것은 「표면 가까이가 깊고 가파르며, 멀어질수록 평평하다」 이다.
 */
function wellY(x: number): number {
  const d = Math.abs(x - STAR_X);
  if (d >= STAR_R) return WELL_TOP_Y - WELL_DEPTH * depthAt((d - STAR_R) / PATH_LEN);
  const rho = d / STAR_R;
  return WELL_TOP_Y - WELL_DEPTH * (1 + (STAR_R / PATH_LEN) * (1 - rho * rho));
}

function wellCurve(): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= WELL_SAMPLES; i++) {
    const x = WELL_LEFT_X + ((OBSERVER_X - WELL_LEFT_X) * i) / WELL_SAMPLES;
    pts.push([x, wellY(x)]);
  }
  return pts;
}

/**
 * 물결 표본을 파장 칸마다 묶은 선들로. 이웃 표본 둘을 잇는 토막의 색은 두 점 가운데 파장의
 * 칸이고, 같은 칸이 이어지면 한 선으로 잇는다.
 */
function binnedWave(
  samples: readonly WaveSample[],
  baseY: number,
): Map<number, Vec2[][]> {
  const bins = new Map<number, Vec2[][]>();
  let current: Vec2[] | null = null;
  let currentBin = Number.NaN;
  for (let i = 0; i + 1 < samples.length; i++) {
    const a = samples[i]!;
    const b = samples[i + 1]!;
    const bin = Math.round((a.nm + b.nm) / 2 / COLOR_BIN_NM);
    const pa: Vec2 = [xOfU(a.u), baseY + WAVE_AMP * a.y];
    const pb: Vec2 = [xOfU(b.u), baseY + WAVE_AMP * b.y];
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
  return bins;
}

function waveSets(id: string, bins: Map<number, Vec2[][]>, opacity: number): Primitive[] {
  const out: Primitive[] = [];
  for (const [bin, lines] of bins) {
    out.push({
      type: 'lineSet',
      id: `${id}-${bin}`,
      lines,
      width: WAVE_WIDTH_PX,
      light: { rgb: lightOfNm(bin * COLOR_BIN_NM) },
      opacity,
    });
  }
  return out;
}

/**
 * 떠날 때 모습 — 간격이 λ_e 그대로인 물결 `cycles` 개. 뒤끝이 받은 묶음의 뒤끝과 맞는다.
 * 자리 u 는 x 를 되짚은 값이다(색은 낸 파장 하나).
 */
function ghostSamples(p: LightPath, backU: number, cycles: number): WaveSample[] {
  const count = Math.ceil(cycles * SAMPLES_PER_CYCLE) + 1;
  const out: WaveSample[] = [];
  for (let i = 0; i < count; i++) {
    const k = (cycles * i) / (count - 1);
    out.push({ u: backU + (k * p.emitWorld) / p.length, y: Math.sin(2 * Math.PI * (cycles - k)), nm: p.emitNm });
  }
  return out;
}

export function scene({ stage, timeline: tl }: SceneParams): SceneGraph {
  const c = readConstants(stage);
  const p = lightPath(c, PATH_LEN);

  const travel = tl ? tl.span(tl.start('emit'), tl.end('climb')) : STILL_FRONT_U;
  const arrive = tl ? tl.at('arrive') : 0;
  const fadeOut = tl ? 1 - tl.at('fade') : 1;

  const frontU = travel;
  const samples = packetSamples(p, frontU, c.waveCycles, SAMPLES_PER_CYCLE);
  const backU = packetBack(p, frontU, c.waveCycles);
  const midX = xOfU((frontU + backU) / 2);

  const out: Primitive[] = [];

  // ---- 아래 칸: 퍼텐셜 우물 -------------------------------------------------
  out.push({
    type: 'trajectory',
    id: 'well',
    points: wellCurve(),
    width: WELL_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });
  out.push({
    type: 'readout',
    id: 'well-label',
    anchor: { world: [xOfU(WELL_LABEL_U), wellY(xOfU(WELL_LABEL_U))], offset: [0, WELL_LABEL_GAP_PX] },
    text: text('label.potential'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 위 칸: 빛의 길 ------------------------------------------------------
  out.push({
    type: 'trajectory',
    id: 'lane',
    points: [
      [STAR_X + STAR_R, LANE_Y],
      [OBSERVER_X, LANE_Y],
    ],
    width: LANE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // 묶음 가운데에서 우물 곡선으로 내리는 안내 점선 — 「지금 이 빛이 있는 깊이」.
  out.push({
    type: 'trajectory',
    id: 'depth-guide',
    points: [
      [midX, LANE_Y - WAVE_AMP - GUIDE_GAP],
      [midX, wellY(midX) + GUIDE_GAP],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: fadeOut,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
  });
  out.push({
    type: 'body',
    id: 'well-dot',
    pos: [midX, wellY(midX)],
    shape: 'circle',
    size: WELL_DOT_R,
    glow: false,
    opacity: fadeOut,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 별 · 받는 곳.
  out.push({
    type: 'body',
    id: 'star',
    pos: [STAR_X, LANE_Y],
    shape: 'circle',
    size: STAR_R,
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'star-label',
    anchor: { world: [STAR_X, LANE_Y + STAR_R], offset: [0, -LABEL_GAP_PX] },
    text: text('label.star'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  const obsX = OBSERVER_X + OBSERVER_GAP;
  out.push({
    type: 'body',
    id: 'observer',
    pos: [obsX, LANE_Y],
    shape: 'rect',
    size: [OBSERVER_W, OBSERVER_H],
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'observer-label',
    anchor: { world: [obsX, LANE_Y + OBSERVER_H / 2], offset: [0, -LABEL_GAP_PX] },
    text: text('label.observer'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 파장 글자 — 선언값 그대로(S-piece 유효숫자). 낸 파장은 별 아래에 늘, 받은 파장은 받는 곳
  // 아래에 받은 뒤에. 묶음 밑에 두면 깊이 안내선과 겹친다.
  out.push({
    type: 'readout',
    id: 'emit-nm',
    anchor: { world: [STAR_X, LANE_Y - STAR_R], offset: [0, LABEL_GAP_PX] },
    text: text('label.nm'),
    vars: { l: String(c.emitNm) },
    chip: false,
    fontSize: NM_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'received-nm',
    anchor: { world: [obsX, LANE_Y - OBSERVER_H / 2], offset: [0, LABEL_GAP_PX] },
    text: text('label.nm'),
    vars: { l: String(c.receivedNm) },
    chip: false,
    fontSize: NM_PX,
    opacity: arrive * fadeOut,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 견줌 — 떠날 때 모습을 받은 묶음 위에 뒤끝을 맞춰 띄운다.
  if (arrive > 0) {
    const ghostY = LANE_Y + GHOST_RISE;
    const ghost = ghostSamples(p, backU, c.waveCycles);
    out.push(...waveSets('ghost', binnedWave(ghost, ghostY), GHOST_OPACITY * arrive * fadeOut));
    const ghostMid = xOfU(backU) + (c.waveCycles * p.emitWorld) / 2;
    out.push({
      type: 'readout',
      id: 'ghost-label',
      anchor: { world: [ghostMid, ghostY + WAVE_AMP], offset: [0, -LABEL_GAP_PX] },
      text: text('label.ghost'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      opacity: arrive * fadeOut,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 받은(또는 올라오는) 물결 — 제자리 파장의 빛 색.
  out.push(...waveSets('wave', binnedWave(samples, LANE_Y), fadeOut));

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
