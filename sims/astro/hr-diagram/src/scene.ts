// ========================================================================
// hr-diagram — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
// 축(trajectory · lineSet · readout) · 처음 띠(trajectory) · 떠나는 별의 꼬리(lineSet) ·
// 별 1000개(particleSystem) · 전향점 막대(trajectory). 겹침은 쓴 순서 그대로다
// (`drawOrder: 'scene'`).
// ========================================================================

import type {
  ColorRole,
  EnvironmentDef,
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  ageAtProgress,
  at,
  msLogL,
  msLogT,
  runProgressAt,
  starRadius,
  stateOf,
  sx,
  sy,
  turnoffMass,
  type StarState,
} from './physics';
import {
  CANVAS_H,
  CANVAS_W,
  CLUSTER,
  LUM_TICKS,
  PLOT,
  SCENE_BOUNDS,
  TEMP_TICKS,
  hrDiagramSchema,
  text,
  type HrDiagramMessageKey,
} from './schema';
import type { HrDiagramState } from './state';

/** 축 · 눈금 글자 크기(화면 px). 원본 12px. */
const AXIS_FONT_PX = 12;
/** 처음 띠 굵기(화면 px)와 짙기. 원본 10px · 0.22. */
const BAND_WIDTH_PX = 10;
const BAND_OPACITY = 0.22;
/** 전향점 막대 반길이(원본 px)와 굵기(화면 px). */
const TURNOFF_HALF = 16;
const TURNOFF_WIDTH_PX = 2.5;
/** 꼬리 굵기(화면 px) · 머리 짙기. 원본 1.2px · 0.55. */
const TRAIL_WIDTH_PX = 1.2;
const TRAIL_HEAD_ALPHA = 0.55;
/**
 * 꼬리 한 가닥을 나누는 토막 수. 원본은 투명 → 별색 그라디언트였다 — 토막마다 짙기를
 * 올려 근사한다 (NOTES 「어휘 부족」 G31).
 */
const TRAIL_PIECES = 3;
/** 이보다 짧은 꼬리(원본 px)는 긋지 않는다. */
const TRAIL_MIN = 2;
/** 별 짙기. 원본 0.9. */
const STAR_ALPHA = 0.9;

/**
 * 흑체색을 색 역할 셋으로 근사한다 (NOTES 「어휘 부족」 G32 · 빛 색 트랙).
 * 경계(log10 K): 8000 K 이상은 푸른 흰, 4500 K 미만은 주황 붉은, 그 사이는 흰.
 */
const COLOR_BINS: readonly { minLt: number; role: ColorRole }[] = [
  { minLt: Math.log10(8000), role: 'secondary' },
  { minLt: Math.log10(4500), role: 'ink' },
  { minLt: -Infinity, role: 'primary' },
];

function binOf(lt: number): number {
  return COLOR_BINS.findIndex((b) => lt >= b.minLt);
}

const TEMP_TICK_KEYS: Record<(typeof TEMP_TICKS)[number], HrDiagramMessageKey> = {
  30000: 'tick.t30000',
  10000: 'tick.t10000',
  6000: 'tick.t6000',
  3000: 'tick.t3000',
};
const LUM_TICK_KEYS: Record<(typeof LUM_TICKS)[number], HrDiagramMessageKey> = {
  4: 'tick.l4',
  0: 'tick.l0',
  [-3]: 'tick.l-3',
};

function label(
  id: string,
  pos: Vec2,
  key: HrDiagramMessageKey,
  align: Readout['align'],
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: AXIS_FONT_PX,
    align,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
}

export function scene(params: {
  state: HrDiagramState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('hr-diagram: schema.timeline 이 선언되어야 한다');

  const A = ageAtProgress(timeline.at('run'));
  // 꼬리의 출발점: 0.3 초 전 화면 시각. 주기 처음보다 앞으로 가지 않는다 (원본 cycleStart).
  const Aprev = ageAtProgress(
    runProgressAt(hrDiagramSchema.timeline!, Math.max(timeline.u - CLUSTER.trailSeconds, 0)),
  );
  const Mto = turnoffMass(A);

  const W = CANVAS_W;
  const H = CANVAS_H;
  const out: Primitive[] = [];

  // ---- 축과 눈금 ----
  const axis: Trajectory = {
    type: 'trajectory',
    id: 'axis',
    points: [at(PLOT.left, PLOT.top), at(PLOT.left, H - PLOT.bottom), at(W - PLOT.right, H - PLOT.bottom)],
    width: 1,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  const ticks: Vec2[][] = [];
  TEMP_TICKS.forEach((K) => {
    const x = sx(Math.log10(K));
    ticks.push([at(x, H - PLOT.bottom), at(x, H - PLOT.bottom + 4)]);
  });
  LUM_TICKS.forEach((ll) => {
    const y = sy(ll);
    ticks.push([at(PLOT.left - 4, y), at(PLOT.left, y)]);
  });
  const tickSet: LineSet = {
    type: 'lineSet',
    id: 'axis-ticks',
    lines: ticks,
    width: 1,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(axis, tickSet);
  // 원본 글자는 위 기준선(top)이다. readout 은 가운데 높이라 글자 반 높이만큼 내린다.
  const half = AXIS_FONT_PX / 2;
  TEMP_TICKS.forEach((K) => {
    const x = sx(Math.log10(K));
    out.push(label(`tick-t${K}`, at(x, H - PLOT.bottom + 6 + half), TEMP_TICK_KEYS[K], 'center'));
  });
  out.push(label('axis-temperature', at((PLOT.left + W - PLOT.right) / 2, H - PLOT.bottom + 24 + half), 'axis.temperature', 'center'));
  LUM_TICKS.forEach((ll) => {
    out.push(label(`tick-l${ll}`, at(PLOT.left - 7, sy(ll)), LUM_TICK_KEYS[ll], 'right'));
  });
  // 원본은 세로로 세운 글자다. readout 이 돌지 않아 가로로 둔다 (G16).
  out.push(label('axis-luminosity', at(14, (PLOT.top + H - PLOT.bottom) / 2), 'axis.luminosity', 'center'));

  // ---- 처음 띠 ----
  const bandPts: Vec2[] = [];
  for (let i = 0; i <= 60; i++) {
    const M = CLUSTER.mMin * Math.pow(CLUSTER.mMax / CLUSTER.mMin, i / 60);
    bandPts.push(at(sx(msLogT(M)), sy(msLogL(M) + 0.15)));
  }
  out.push({
    type: 'trajectory',
    id: 'main-sequence',
    points: bandPts,
    width: BAND_WIDTH_PX,
    opacity: BAND_OPACITY,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  out.push(label('main-sequence-name', at(sx(msLogT(0.6)) - 8, sy(msLogL(0.6)) + 26), 'label.mainSequence', 'right'));

  // ---- 떠나는 별의 꼬리 ----
  const trailLines: Vec2[][][] = COLOR_BINS.map(() => []);
  const trailAlphas: number[][] = COLOR_BINS.map(() => []);
  // ---- 별 ----
  const starPos: Vec2[][] = COLOR_BINS.map(() => []);
  const starSize: number[][] = COLOR_BINS.map(() => []);
  const starAlpha: number[][] = COLOR_BINS.map(() => []);

  for (const s of state.stars) {
    const now = stateOf(s, A);
    if (A > s.tau && now) {
      const was = stateOf(s, Aprev);
      if (was && now.kind !== 'wd' && was.kind !== 'wd') addTrail(was, now);
    }
    if (!now || now.alpha <= 0) continue;
    const y = sy(now.ll);
    if (y > H - PLOT.bottom - 2 || y < PLOT.top) continue;
    const b = binOf(now.lt);
    starPos[b]!.push(at(sx(now.lt), y));
    starSize[b]!.push(starRadius(now));
    starAlpha[b]!.push(STAR_ALPHA * now.alpha);
  }

  function addTrail(was: StarState, now: StarState): void {
    const x0 = sx(was.lt);
    const y0 = sy(was.ll);
    const x1 = sx(now.lt);
    const y1 = sy(now.ll);
    if (Math.hypot(x1 - x0, y1 - y0) < TRAIL_MIN) return;
    const b = binOf(now.lt);
    for (let k = 0; k < TRAIL_PIECES; k++) {
      const s0 = k / TRAIL_PIECES;
      const s1 = (k + 1) / TRAIL_PIECES;
      trailLines[b]!.push([
        at(x0 + (x1 - x0) * s0, y0 + (y1 - y0) * s0),
        at(x0 + (x1 - x0) * s1, y0 + (y1 - y0) * s1),
      ]);
      // 토막 가운데의 그라디언트 짙기.
      trailAlphas[b]!.push(TRAIL_HEAD_ALPHA * now.alpha * ((k + 0.5) / TRAIL_PIECES));
    }
  }

  COLOR_BINS.forEach((bin, b) => {
    const trail: LineSet = {
      type: 'lineSet',
      id: `trails-${bin.role}`,
      lines: trailLines[b]!,
      opacities: trailAlphas[b]!,
      width: TRAIL_WIDTH_PX,
      style: { colorRole: bin.role, emphasis: 'medium' },
    };
    out.push(trail);
  });
  COLOR_BINS.forEach((bin, b) => {
    const stars: ParticleSystem = {
      type: 'particleSystem',
      id: `stars-${bin.role}`,
      positions: starPos[b]!,
      sizes: starSize[b]!,
      opacities: starAlpha[b]!,
      style: { colorRole: bin.role, emphasis: 'medium' },
    };
    out.push(stars);
  });

  // ---- 꺾이는 점: 지금 막 띠를 떠나는 질량의 자리에 띠를 가로지르는 짧은 막대 ----
  const ltA = msLogT(Mto) - 0.03;
  const llA = msLogL(Mto) + 0.3;
  const dx = sx(msLogT(Mto * 1.05)) - sx(msLogT(Mto));
  const dy = sy(msLogL(Mto * 1.05)) - sy(msLogL(Mto));
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const cx = sx(ltA);
  const cy = sy(llA);
  out.push({
    type: 'trajectory',
    id: 'turnoff',
    points: [
      at(cx - nx * TURNOFF_HALF, cy - ny * TURNOFF_HALF),
      at(cx + nx * TURNOFF_HALF, cy + ny * TURNOFF_HALF),
    ],
    width: TURNOFF_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 프레이밍은 주장의 일부다 — 원본 캔버스 + 캡션 줄을 그대로 옮겼다.
  return { ...SCENE_BOUNDS };
}
