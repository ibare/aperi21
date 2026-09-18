// ========================================================================
// rutherford-scattering — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 나간 방향 고리(trajectory closed) ·
// 90° 눈금(lineSet + readout) · 지나온 길(trajectory) · 금 원자핵(body) · 날아가는 알파 입자와
// 방향마다 쌓인 점(particleSystem) · 점이 쌓이는 순간(trace ring)이 모두 표준 어휘로 있다.
//
// 색 — 고리 · 길 · 글자는 무채색 역할(muted), 핵 · 입자 · 쌓인 점은 먹(ink). 강조색은 쓰지 않는다.
// 크게 꺾인 입자도 같은 색이다 — 드문 것은 색이 아니라 **길의 모양**과 **쌓인 점의 수**로 보인다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { pointAt, readConstants, readShots, type ShotView } from './physics';
import { RING_RADIUS, SCENE_BOUNDS, text, type RutherfordScatteringMessageKey } from './schema';
import type { RutherfordScatteringState } from './state';

/** 고리 원을 몇 점으로 표본하는가(장부 G28 — 원 어휘가 없다). */
const RING_SAMPLES = 144;
/** 고리 굵기(화면 px) · 짙기. 대상이 아니라 방향을 읽는 자리라 가늘고 옅게. */
const RING_WIDTH = 1.2;
const RING_OPACITY = 0.6;
/** 90° 눈금 — 고리를 가로지르는 길이(월드) · 굵기(화면 px). */
const TICK_LENGTH = 0.8;
const TICK_WIDTH = 1.4;
/** 지나온 길을 몇 점으로 표본하는가. ξ 에 고르게 놓으면 핵 곁(꺾이는 곳)에 점이 몰린다. */
const TRAIL_SAMPLES = 64;
/** 지나온 길 굵기(화면 px). */
const TRAIL_WIDTH = 1.3;
/** 날아가는 중인 입자의 길 짙기 · 고리에 닿은 뒤 남은 길의 짙기. */
const TRAIL_LIVE_OPACITY = 0.85;
const TRAIL_REST_OPACITY = 0.22;
/** 금 원자핵 반지름(월드). 표적 배율로 키운 크기(약 0.03)보다 크게 그렸다 — NOTES (b). */
const NUCLEUS_RADIUS = 0.1;
/** 알파 입자 점 크기(화면 px). */
const ALPHA_PX = 2.4;
/** 점이 막 쌓인 순간의 고리 표시 — 시작 · 끝 반지름(화면 px), 수명(초), 굵기(화면 px). */
const FLASH_PX = 3;
const FLASH_SPREAD_PX = 14;
const FLASH_LIFE = 0.6;
const FLASH_WIDTH = 1.2;
/** 나간 방향 칸 — 칸 폭(도). 칸마다 고리 바깥으로 점이 쌓인다. */
const BIN_DEG = 10;
/** 쌓인 점 — 고리에서 첫 점까지 띄우는 거리 · 점 사이 간격(월드), 점 크기(화면 px). */
const STACK_GAP = 0.55;
const STACK_STEP = 0.42;
const STACK_PX = 2.6;
/** 글자 크기(화면 px). */
const LABEL_PX = 12;
const SMALL_PX = 11;
/** 90° 이름표를 고리 안쪽으로 띄우는 거리(화면 px). */
const ANGLE_LABEL_GAP = 14;
/** 핵 이름표를 핵 아래로 띄우는 거리(화면 px) — 빔 아래 끝보다 아래, 길이 거의 지나가지 않는 자리. */
const NUCLEUS_LABEL_DROP = 36;
/** α 이름표 자리 — 빔 위 끝 위로 띄우는 거리(화면 px), 가로 자리(월드). */
const ALPHA_LABEL_GAP = 12;
const ALPHA_LABEL_X = -12;

function label(
  id: string,
  key: RutherfordScatteringMessageKey,
  pos: Vec2,
  align: Readout['align'],
  opts: { size?: number; offset?: Vec2; vars?: Record<string, string> } = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor: opts.offset ? { world: pos, offset: opts.offset } : { world: pos },
    text: text(key),
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: false,
    font: 'text',
    fontSize: opts.size ?? LABEL_PX,
    align,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 지나온 길 — ξ 범위를 고르게 표본한다. */
function trailPoints(v: ShotView, range: readonly [number, number]): Vec2[] {
  const [from, to] = range;
  const pts: Vec2[] = [];
  for (let k = 0; k <= TRAIL_SAMPLES; k++) pts.push(pointAt(v.orbit, from + ((to - from) * k) / TRAIL_SAMPLES));
  return pts;
}

/** 쌓인 점 하나 — 자리와, 쌓인 뒤 흐른 시간(초). */
interface StackDot {
  pos: Vec2;
  age: number;
}

/**
 * 고리를 지나 나간 입자들을 **나아가던 방향**의 칸마다 지난 차례로 쌓는다. 고리를 지난 자리가 아니라
 * 방향으로 가르는 이유는 `RING_RADIUS` 의 글에 있다.
 */
function stackDots(views: readonly ShotView[]): StackDot[] {
  const bin = (BIN_DEG * Math.PI) / 180;
  const hits = views
    .flatMap((v) => (v.hit ? [v.hit] : []))
    .sort((p, q) => p.at - q.at);
  const counts = new Map<number, number>();
  return hits.map((h) => {
    const j = Math.round(h.heading / bin);
    const k = counts.get(j) ?? 0;
    counts.set(j, k + 1);
    const r = RING_RADIUS + STACK_GAP + k * STACK_STEP;
    return { pos: [r * Math.cos(j * bin), r * Math.sin(j * bin)] as Vec2, age: h.age };
  });
}

export function scene(params: {
  state: RutherfordScatteringState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('rutherford-scattering: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const views = readShots(tl, c);
  /** 주기 끝에서 지나온 길 · 쌓인 점이 함께 흐려진다. */
  const keep = 1 - tl.at('fade');
  const out: Primitive[] = [];

  // ── 나간 방향 고리 ─────────────────────────────────
  const ring: Vec2[] = [];
  for (let k = 0; k < RING_SAMPLES; k++) {
    const a = (2 * Math.PI * k) / RING_SAMPLES;
    ring.push([RING_RADIUS * Math.cos(a), RING_RADIUS * Math.sin(a)]);
  }
  out.push({
    type: 'trajectory',
    id: 'ring',
    points: ring,
    closed: true,
    width: RING_WIDTH,
    opacity: RING_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'solid' },
  } satisfies Trajectory);

  // ── 90° 눈금 — 이것을 넘겨 꺾인 입자는 왔던 쪽으로 되튄 것이다 ──
  const mark = (c.angleMarkDeg * Math.PI) / 180;
  const tickDirs: Vec2[] = [
    [Math.cos(mark), Math.sin(mark)],
    [Math.cos(-mark), Math.sin(-mark)],
  ];
  out.push({
    type: 'lineSet',
    id: 'angle-ticks',
    lines: tickDirs.map((d) => [
      [(RING_RADIUS - TICK_LENGTH / 2) * d[0], (RING_RADIUS - TICK_LENGTH / 2) * d[1]] as Vec2,
      [(RING_RADIUS + TICK_LENGTH / 2) * d[0], (RING_RADIUS + TICK_LENGTH / 2) * d[1]] as Vec2,
    ]),
    width: TICK_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies LineSet);
  tickDirs.forEach((d, i) => {
    const inward = d[1] > 0 ? ANGLE_LABEL_GAP : -ANGLE_LABEL_GAP;
    out.push(
      label(`angle-${i}`, 'label.angle', [RING_RADIUS * d[0], RING_RADIUS * d[1]], 'center', {
        size: SMALL_PX,
        offset: [0, inward],
        vars: { deg: String(c.angleMarkDeg) },
      }),
    );
  });

  // ── 지나온 길 — 고리 안쪽만. 날아가는 중이면 짙게, 닿은 뒤에는 옅게 남는다 ──
  views.forEach((v, i) => {
    if (!v.trail || keep <= 0) return;
    const live = !v.hit;
    out.push({
      type: 'trajectory',
      id: `trail-${i}`,
      points: trailPoints(v, v.trail),
      width: TRAIL_WIDTH,
      opacity: (live ? TRAIL_LIVE_OPACITY : TRAIL_REST_OPACITY) * keep,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'solid', fade: live ? 'tail' : 'none' },
    } satisfies Trajectory);
  });

  // ── 금 원자핵 ────────────────────────────────────
  out.push({
    type: 'body',
    id: 'nucleus',
    pos: [0, 0],
    shape: 'circle',
    size: NUCLEUS_RADIUS,
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies Body);

  // ── 날아가는 알파 입자 ───────────────────────────────
  const flying = views.flatMap((v) => (v.pos ? [v.pos] : []));
  if (flying.length > 0) {
    out.push({
      type: 'particleSystem',
      id: 'alphas',
      positions: flying,
      sizes: ALPHA_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies ParticleSystem);
  }

  // ── 나간 방향마다 쌓인 점 — 빈도는 쌓인 높이로 ─────────────
  const dots = stackDots(views);
  if (dots.length > 0 && keep > 0) {
    out.push({
      type: 'particleSystem',
      id: 'tally',
      positions: dots.map((d) => d.pos),
      sizes: STACK_PX,
      opacity: keep,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies ParticleSystem);
  }

  // ── 점이 막 쌓인 순간 — 그 자리에서 고리가 퍼진다 ─────────────
  const flashes = dots.filter((d) => d.age < FLASH_LIFE);
  if (flashes.length > 0) {
    out.push({
      type: 'trace',
      id: 'tally-flashes',
      marks: flashes,
      life: FLASH_LIFE,
      shape: 'ring',
      size: FLASH_PX,
      spreadTo: FLASH_SPREAD_PX,
      width: FLASH_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong' },
    } satisfies Trace);
  }

  // ── 이름표 ──────────────────────────────────────
  out.push(label('nucleus-label', 'label.nucleus', [0, 0], 'center', { offset: [0, NUCLEUS_LABEL_DROP] }));
  out.push(
    label('alpha-label', 'label.alpha', [ALPHA_LABEL_X, c.beamHalfWidth], 'center', {
      offset: [0, -ALPHA_LABEL_GAP],
    }),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
