// ========================================================================
// bohr-model — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 준위 사다리(lineSet + readout) ·
// 궤도(trajectory closed) · 핵과 전자(body) · 도약 점선(trajectory dotted) · 도약 순간의
// 고리(trace ring) · 빛 물결(lineSet) 이 모두 표준 어휘로 있다.
//
// 색 — 궤도 · 사다리 · 글자는 무채색 역할(muted), 핵 · 전자는 먹(ink). 강조색은 쓰지 않는다.
// **빛만 빛의 색이다** — 3→2 의 물결과 사다리 위 그 낙차 자국은 656 nm 의 색을 빛 채널로
// 칠한다(같은 도약 = 같은 색). 2→1 의 자외선은 색을 짓지 않고 muted 로, 파장은 물결 간격으로 보인다.
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
import {
  isVisible,
  onOrbit,
  orbitRadius,
  photonLight,
  photonWave,
  readConstants,
  readElectron,
  readJumps,
  type BohrConstants,
  type Level,
} from './physics';
import { LADDER, SCENE_BOUNDS, text, type BohrModelMessageKey } from './schema';
import type { BohrModelState } from './state';

/** 궤도 원을 몇 점으로 표본하는가(장부 G28 — 원 어휘가 없다). */
const ORBIT_SAMPLES = 120;
/** 궤도선 굵기(화면 px) · 짙기. 허용된 자리이지 대상이 아니라 가늘게. */
const ORBIT_WIDTH = 1.4;
const ORBIT_OPACITY = 0.75;
/** 사다리 준위선 굵기(화면 px). */
const LEVEL_WIDTH = 1.6;
/** 사다리 위 낙차 자국 굵기(화면 px) — 빛의 색이 읽히도록 굵게. */
const DROP_WIDTH = 5;
/** 낙차 자국이 서는 사다리 위 가로 자리(월드) — 사다리 가운데. */
const DROP_X = (LADDER.x0 + LADDER.x1) / 2;
/** 사다리 위 전자 표지의 가로 자리(월드) — 낙차 자국과 겹치지 않게 오른쪽 끝 가까이. */
const LADDER_DOT_X = LADDER.x1 - 0.9;
/** 사다리 위 전자 표지 크기(화면 px). */
const LADDER_DOT_PX = 4;
/** 핵 · 전자 반지름(월드). */
const NUCLEUS_RADIUS = 0.34;
const ELECTRON_RADIUS = 0.42;
/** 도약 점선 굵기(화면 px). */
const JUMP_WIDTH = 1.4;
/** 빛 물결 굵기(화면 px). */
const WAVE_WIDTH = 2.4;
/** 도약 순간의 고리 — 시작 · 끝 반지름(화면 px), 수명(초), 굵기(화면 px). */
const RING_PX = 4;
const RING_SPREAD_PX = 20;
const RING_LIFE = 0.7;
const RING_WIDTH = 1.4;
/** 글자 크기(화면 px). */
const LABEL_PX = 12;
const SMALL_PX = 11;
/** 사다리 이름표를 선 끝에서 띄우는 거리(월드). */
const LADDER_LABEL_GAP = 0.5;
/** 궤도 이름표를 궤도 교차점에서 왼쪽 · 위아래로 띄우는 거리(화면 px) — 궤도선 바깥 빈자리에 선다. */
const ORBIT_LABEL_GAP = 4;
const ORBIT_LABEL_OFFSET = 8;
/**
 * 빛 물결을 그리는 오른쪽 끝(월드). 프레이밍 경계보다 넉넉히 멀다 — 경계에서 자르면 뷰포트가
 * 경계보다 넓을 때 물결이 허공에서 끊겨 보인다. 캔버스 밖으로 날아가 사라지게 둔다.
 */
const PHOTON_RUNWAY_X = SCENE_BOUNDS.maxX + 20;
/** 빛 이름표를 물결 위로 띄우는 거리(화면 px). */
const PHOTON_LABEL_OFFSET = 12;

/** 사다리 위 높이 — 0 eV 가 `yZero`, 가장 깊은 준위가 `yInner`. 에너지에 비례한다. */
function ladderY(level: Level, c: BohrConstants): number {
  return LADDER.yInner + (1 - level.e / c.inner.e) * (LADDER.yZero - LADDER.yInner);
}

function label(
  id: string,
  key: BohrModelMessageKey,
  vars: Record<string, string>,
  pos: Vec2,
  align: Readout['align'],
  opts: { size?: number; offset?: Vec2; opacity?: number } = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor: opts.offset ? { world: pos, offset: opts.offset } : { world: pos },
    text: text(key),
    vars,
    chip: false,
    font: 'text',
    fontSize: opts.size ?? LABEL_PX,
    align,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: BohrModelState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('bohr-model: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const levels: Level[] = [c.inner, c.middle, c.outer];
  const jumps = readJumps(tl, c);
  const electrons = readElectron(tl, c);
  const out: Primitive[] = [];

  // ── 에너지 사다리 ─────────────────────────────────
  out.push({
    type: 'lineSet',
    id: 'levels',
    lines: levels.map((l) => [
      [LADDER.x0, ladderY(l, c)],
      [LADDER.x1, ladderY(l, c)],
    ]),
    width: LEVEL_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies LineSet);
  for (const l of levels) {
    const y = ladderY(l, c);
    out.push(label(`level-n-${l.n}`, 'label.level', { n: String(l.n) }, [LADDER.x0 - LADDER_LABEL_GAP, y], 'right'));
    out.push(
      label(`level-e-${l.n}`, 'label.energy', { e: String(l.e) }, [LADDER.x1 + LADDER_LABEL_GAP, y], 'left', {
        size: SMALL_PX,
      }),
    );
  }

  // ── 사다리 위 낙차 자국 — 빛의 에너지 = 두 준위의 차. 색은 그 빛의 색 ──
  jumps.forEach((j, i) => {
    if (j.progress <= 0 || j.after >= 1) return;
    const vis = isVisible(j.photon.nm);
    out.push({
      type: 'lineSet',
      id: `drop-${i}`,
      lines: [
        [
          [DROP_X, ladderY(j.from, c)],
          [DROP_X, ladderY(j.to, c)],
        ],
      ],
      width: DROP_WIDTH,
      opacity: j.progress * (1 - j.after),
      ...(vis ? { light: { rgb: photonLight(j.photon.nm) } } : { style: { colorRole: 'muted', emphasis: 'strong' } }),
    } satisfies LineSet);
  });

  // ── 사다리 위 전자 표지 — 지금 전자가 있는 준위 ────────
  electrons.forEach((e, i) => {
    const level = levels.find((l) => l.n === e.n);
    if (!level || e.alpha <= 0) return;
    out.push({
      type: 'particleSystem',
      id: `ladder-electron-${i}`,
      positions: [[LADDER_DOT_X, ladderY(level, c)]],
      sizes: LADDER_DOT_PX,
      opacity: e.alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies ParticleSystem);
  });

  // ── 허용된 궤도 — 반지름 n²a₀ ──────────────────────
  for (const l of levels) {
    const r = orbitRadius(l.n, c);
    const pts: Vec2[] = [];
    for (let k = 0; k < ORBIT_SAMPLES; k++) {
      const a = (2 * Math.PI * k) / ORBIT_SAMPLES;
      pts.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    out.push({
      type: 'trajectory',
      id: `orbit-${l.n}`,
      points: pts,
      closed: true,
      width: ORBIT_WIDTH,
      opacity: ORBIT_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'solid' },
    } satisfies Trajectory);
  }

  // ── 궤도 이름표 — 왼쪽 가로축과 만나는 자리의 바깥쪽. 위에 번호, 아래에 반지름 ──
  for (const l of levels) {
    const at: Vec2 = [-orbitRadius(l.n, c), 0];
    out.push(label(`orbit-n-${l.n}`, 'label.level', { n: String(l.n) }, at, 'right', {
      size: SMALL_PX,
      offset: [-ORBIT_LABEL_GAP, -ORBIT_LABEL_OFFSET],
    }));
    out.push(label(`orbit-r-${l.n}`, 'label.radius', { k: String(l.n * l.n) }, at, 'right', {
      size: SMALL_PX,
      offset: [-ORBIT_LABEL_GAP, ORBIT_LABEL_OFFSET],
    }));
  }

  // ── 핵 ──────────────────────────────────────────
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

  // ── 도약 점선 · 고리 — 사이를 지나가지 않고 건너뛴다 ──────
  jumps.forEach((j, i) => {
    if (j.progress <= 0 || j.after >= 1) return;
    out.push({
      type: 'trajectory',
      id: `jump-${i}`,
      points: [onOrbit(j.from.n, j.theta, c), onOrbit(j.to.n, j.theta, c)],
      width: JUMP_WIDTH,
      opacity: 1 - j.after,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
    } satisfies Trajectory);
  });
  const rings = jumps
    .filter((j) => j.age >= 0 && j.age < RING_LIFE)
    .map((j) => ({ pos: onOrbit(j.from.n, j.theta, c), age: j.age }));
  if (rings.length > 0) {
    out.push({
      type: 'trace',
      id: 'jump-rings',
      marks: rings,
      life: RING_LIFE,
      shape: 'ring',
      size: RING_PX,
      spreadTo: RING_SPREAD_PX,
      width: RING_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong' },
    } satisfies Trace);
  }

  // ── 전자 ─────────────────────────────────────────
  electrons.forEach((e, i) => {
    if (e.alpha <= 0) return;
    out.push({
      type: 'body',
      id: `electron-${i}`,
      pos: onOrbit(e.n, e.theta, c),
      shape: 'circle',
      size: ELECTRON_RADIUS,
      outline: 'none',
      glow: false,
      opacity: e.alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies Body);
  });

  // ── 빛 — 도약 자리에서 오른쪽으로 날아가는 물결 묶음 ────────
  jumps.forEach((j, i) => {
    if (j.age < 0) return;
    const w = photonWave(onOrbit(j.from.n, j.theta, c), j.age, j.photon, c, PHOTON_RUNWAY_X);
    if (w.points.length < 2) return;
    const vis = isVisible(j.photon.nm);
    out.push({
      type: 'lineSet',
      id: `photon-${i}`,
      lines: [w.points],
      width: WAVE_WIDTH,
      ...(vis ? { light: { rgb: photonLight(j.photon.nm) } } : { style: { colorRole: 'muted', emphasis: 'strong' } }),
    } satisfies LineSet);
    if (w.emerged && w.labelAt[0] < PHOTON_RUNWAY_X) {
      out.push(
        label(
          `photon-label-${i}`,
          vis ? 'label.photon' : 'label.photonUv',
          { e: String(j.photon.ev), nm: String(j.photon.nm) },
          w.labelAt,
          'center',
          { size: SMALL_PX, offset: [0, -PHOTON_LABEL_OFFSET] },
        ),
      );
    }
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
