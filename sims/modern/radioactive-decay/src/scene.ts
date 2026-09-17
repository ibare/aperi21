// ========================================================================
// radioactive-decay — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
// 원자 400개는 낱개로 선언하지 않는다 — 살아 있는 원자 · 잔광 점은 `particleSystem`,
// 빈자리 고리 · 퍼지는 고리는 원을 폴리라인으로 표본한 `lineSet` 이다. 곡선은
// `trajectory`, 목표선 · 괄호 · 축은 `lineSet`, 경계 점선은 `trajectory` 다섯, 글자는 `readout`.
//
// 색 — 먹(`ink`) = 남은 원자 하나(격자의 살아 있는 원자 · 곡선 · 지금 점).
// 주황(`accent`) = 「방금 붕괴함」 하나. 나머지는 회색(`muted`).
// ========================================================================

import type {
  Body,
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
import { atomCell, drawCycle, effective, intervalAt, survivorsAt } from './physics';
import {
  CANVAS_H,
  COLS,
  FLASH,
  GRID,
  HALF,
  N,
  PLOT,
  SCENE_BOUNDS,
  SEED,
  SPAN,
  text,
  type RadioactiveDecayMessageKey,
} from './schema';
import type { RadioactiveDecayState } from './state';

// ------------------------------------------------------------------------
// 원본 캔버스 좌표(px, y 아래) → 월드(y 위)
// ------------------------------------------------------------------------

const at = (x: number, y: number): Vec2 => [x, CANVAS_H - y];

const CELL = GRID.box / COLS;
const X = (s: number): number => PLOT.x0 + ((PLOT.x1 - PLOT.x0) * s) / (SPAN * HALF);
const Y = (n: number): number => PLOT.bottom - ((PLOT.bottom - PLOT.top) * n) / N;

// ------------------------------------------------------------------------
// 원본 조각이 정한 위계 (화면 px)
// ------------------------------------------------------------------------

/** 원자 반지름 — 원본 `cell * 0.32`. `particleSystem` 크기는 화면 px 이다 (장부 G79). */
const ATOM_R = CELL * 0.32;
/** 빈자리 고리 반지름 — 원본 `cell * 0.2`. 월드 단위 폴리라인. */
const GONE_R = CELL * 0.2;
/** 퍼지는 고리가 잔광 동안 더 벌어지는 반지름 — 원본 `cell * 0.35`. */
const RING_GROW = CELL * 0.35;
/** 원을 표본하는 꼭짓점 수. */
const CIRCLE_SEGMENTS = 14;
const GONE_W = 1;
const RING_W = 1.5;
const AXIS_W = 1;
const TARGET_W = 1.5;
const CURVE_W = 2;
const NOW_DOT_R = 4;
const LABEL_PX = 12;
/** 괄호 끝 가로 눈금 반폭 · 목표선이 구간 시작에서 떨어지는 거리(px). */
const TICK = 4;
/** 원본은 글자 윗변을 `py1 + 6` 에 맞췄다. readout 은 가운데에 맞추므로 반 줄 내린다. */
const TOP_TO_MIDDLE = LABEL_PX / 2 + 1;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const GUIDE = { colorRole: 'muted', emphasis: 'strong' } as const;
const GONE = { colorRole: 'muted', emphasis: 'subtle' } as const;
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;

function circle(cx: number, cy: number, r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k <= CIRCLE_SEGMENTS; k++) {
    const a = (k / CIRCLE_SEGMENTS) * Math.PI * 2;
    pts.push(at(cx + r * Math.cos(a), cy + r * Math.sin(a)));
  }
  return pts;
}

function label(
  id: string,
  key: RadioactiveDecayMessageKey,
  pos: Vec2,
  align: 'left' | 'center' | 'right',
  vars: Record<string, string | number>,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    vars,
    chip: false,
    font: 'text',
    align,
    fontSize: LABEL_PX,
    style: GUIDE,
  };
}

export function scene(params: {
  state: RadioactiveDecayState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('radioactive-decay: schema.timeline 이 선언되어야 한다');
  // 순환 경계의 한 프레임은 상태가 아직 앞 순환일 수 있다 — 시간표의 순환을 따른다.
  const draw = state.draw.cycle === timeline.cycle ? state.draw : drawCycle(SEED, timeline.cycle);
  const tau = timeline.u;
  const eff = effective(tau);
  const out: Primitive[] = [];

  // ── 왼쪽: 원자 격자 ─────────────────────────────────────────────
  const goneLines: Vec2[][] = [];
  const flashPos: Vec2[] = [];
  const flashAlpha: number[] = [];
  const ringLines: Vec2[][] = [];
  const alivePos: Vec2[] = [];
  for (let i = 0; i < N; i++) {
    const [c, r] = atomCell(draw, i);
    const x = GRID.x + c * CELL;
    const y = GRID.y + r * CELL;
    const life = draw.life[i]!;
    if (life > eff) {
      alivePos.push(at(x, y));
      continue;
    }
    // 멈춤 구간에도 잔광은 사라진다 — 나이는 멈추지 않은 순환 시각으로 잰다.
    const age = tau - life;
    if (age >= FLASH) {
      goneLines.push(circle(x, y, GONE_R));
    } else {
      const f = age / FLASH;
      flashPos.push(at(x, y));
      flashAlpha.push(1 - f);
      ringLines.push(circle(x, y, ATOM_R + RING_GROW * f));
    }
  }
  const gone: LineSet = { type: 'lineSet', id: 'decayed-atoms', lines: goneLines, width: GONE_W, style: GONE };
  out.push(gone);
  const flash: ParticleSystem = {
    type: 'particleSystem',
    id: 'just-decayed',
    positions: flashPos,
    opacities: flashAlpha,
    sizes: ATOM_R,
    style: ACCENT,
  };
  out.push(flash);
  const rings: LineSet = {
    type: 'lineSet',
    id: 'decay-rings',
    lines: ringLines,
    opacities: flashAlpha,
    width: RING_W,
    style: ACCENT,
  };
  out.push(rings);
  const alive: ParticleSystem = {
    type: 'particleSystem',
    id: 'live-atoms',
    positions: alivePos,
    sizes: ATOM_R,
    style: INK,
  };
  out.push(alive);

  // ── 오른쪽: 시간 축과 반감기 경계 ───────────────────────────────
  const axes: LineSet = {
    type: 'lineSet',
    id: 'axes',
    lines: [
      [at(PLOT.x0, PLOT.bottom), at(PLOT.x1, PLOT.bottom)],
      [at(PLOT.x0, PLOT.top), at(PLOT.x0, PLOT.bottom)],
    ],
    width: AXIS_W,
    style: GUIDE,
  };
  out.push(axes);
  for (let n = 1; n <= SPAN; n++) {
    // 점선 가닥은 `lineSet` 에 선 모양이 없어 낱개다 (장부 G68). 원본 무늬 [2, 4] 에 가장 가까운 dotted (G05).
    const boundary: Trajectory = {
      type: 'trajectory',
      id: `boundary-${n}`,
      points: [at(X(n * HALF), PLOT.top), at(X(n * HALF), PLOT.bottom)],
      width: AXIS_W,
      style: { ...GUIDE, lineStyle: 'dotted' },
    };
    out.push(boundary);
    out.push(label(`half-life-${n}`, 'label.halfLife', at(X(n * HALF), PLOT.bottom + 6 + TOP_TO_MIDDLE), 'center', { n }));
  }
  out.push(label('count-top', 'label.count', at(PLOT.x0 - 6, Y(N)), 'right', { v: N }));
  out.push(label('count-zero', 'label.count', at(PLOT.x0 - 6, Y(0)), 'right', { v: 0 }));

  // ── 구간마다 시작 수의 절반 목표선 ──────────────────────────────
  // 반감기 구간이 시작되면(시간표 단계에 들어서면) 그 구간의 목표선이 생긴다.
  const nowInterval = intervalAt(tau);
  const targets: Vec2[][] = [];
  for (let n = 1; n <= nowInterval; n++) {
    const start = survivorsAt(draw.sorted, (n - 1) * HALF);
    const target = start / 2;
    const xa = X((n - 1) * HALF);
    const xb = X(n * HALF);
    targets.push(
      [at(xa + TICK, Y(target)), at(xb, Y(target))],
      [at(xb, Y(start)), at(xb, Y(target))],
      [at(xb - TICK, Y(start)), at(xb + TICK, Y(start))],
    );
    if (n === 1) {
      out.push(label('half-of-start', 'label.halfOfStart', at(xa + 6, Y(target) + 4 + TOP_TO_MIDDLE), 'left', {}));
    }
  }
  out.push({ type: 'lineSet', id: 'half-targets', lines: targets, width: TARGET_W, style: GUIDE });

  // ── 남은 원자 수 곡선 — 붕괴 사건마다 한 칸 내려가는 계단 ─────────
  const curve: Vec2[] = [at(X(0), Y(N))];
  let prev = N;
  for (const s of draw.sorted) {
    if (s > eff) break;
    const n = prev - 1;
    curve.push(at(X(s), Y(prev)), at(X(s), Y(n)));
    prev = n;
  }
  const nowN = survivorsAt(draw.sorted, eff);
  curve.push(at(X(eff), Y(nowN)));
  const remaining: Trajectory = { type: 'trajectory', id: 'remaining-curve', points: curve, width: CURVE_W, style: INK };
  out.push(remaining);
  const nowDot: Body = {
    type: 'body',
    id: 'remaining-now',
    shape: 'circle',
    pos: at(X(eff), Y(nowN)),
    size: NOW_DOT_R,
    outline: 'none',
    glow: false,
    style: INK,
  };
  out.push(nowDot);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다.
  return { ...SCENE_BOUNDS };
}
