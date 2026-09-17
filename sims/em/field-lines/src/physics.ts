// ========================================================================
// field-lines — 순수 물리
// ========================================================================
// DOM · 캔버스 · 색을 모른다. 난수는 상태에 든 시드에서만 뽑는다 (S-sim).
// 모든 식과 상수는 원본(tasks/piece-lab/field-lines/index.html) 그대로다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import {
  DRAG_MARGIN,
  FOLLOW_TAU,
  GRAINS,
  LINES_PER_Q,
  MINUS_Q,
  MIN_APART,
  ORBIT,
  PLUS,
  STAGE,
  TRACE,
} from './schema';
import type { FieldLinesState } from './state';

/** 알갱이 하나(px, 초). */
export interface Grain {
  readonly x: number;
  readonly y: number;
  readonly age: number;
  readonly life: number;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

// ------------------------------------------------------------------------
// 좌표 — 원본 px(y 아래) ↔ 월드(y 위)
// ------------------------------------------------------------------------

export function toWorld(x: number, y: number): Vec2 {
  return [x, STAGE.height - y];
}

export function fromWorld(p: Vec2): Point {
  return { x: p[0], y: STAGE.height - p[1] };
}

// ------------------------------------------------------------------------
// 시드 난수 — mulberry32. 원본 PieceKit 과 같은 수열이다.
// ------------------------------------------------------------------------

function rngFrom(seedState: number): { next: () => number; state: () => number } {
  let s = seedState >>> 0;
  return {
    next: (): number => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    state: (): number => s,
  };
}

function spawn(rand: () => number): Grain {
  const x = rand() * STAGE.width;
  const y = rand() * STAGE.height;
  const life = GRAINS.lifeMin + rand() * GRAINS.lifeSpan;
  return { x, y, life, age: 0 };
}

/** 알갱이 무리를 만든다. **도착한 순간 이미 흐르는 중** — 나이를 수명 안에서 뽑는다. */
export function createGrains(seed: number): { grains: Grain[]; rng: number } {
  const r = rngFrom(seed);
  const grains: Grain[] = [];
  for (let i = 0; i < GRAINS.count; i++) {
    const g = spawn(r.next);
    grains.push({ ...g, age: r.next() * g.life });
  }
  return { grains, rng: r.state() };
}

// ------------------------------------------------------------------------
// 장
// ------------------------------------------------------------------------

/** 음전하 자동 경로 — 양전하 둘레를 느리게 돈다. */
export function autoPath(t: number): Point {
  const a = ORBIT.phase + (2 * Math.PI * t) / ORBIT.period;
  return { x: ORBIT.cx + ORBIT.rx * Math.cos(a), y: ORBIT.cy + ORBIT.ry * Math.sin(a) };
}

/** 2차원 장(1/r). 상수는 하나로 묶는다 — 세기의 절대값은 주장과 무관하다. */
export function field(minus: Point, x: number, y: number): { ex: number; ey: number } {
  let ex = 0;
  let ey = 0;
  for (const c of [
    { x: PLUS.x, y: PLUS.y, q: PLUS.q },
    { x: minus.x, y: minus.y, q: MINUS_Q },
  ]) {
    const dx = x - c.x;
    const dy = y - c.y;
    const r2 = dx * dx + dy * dy + 1e-6;
    ex += (c.q * dx) / r2;
    ey += (c.q * dy) / r2;
  }
  return { ex, ey };
}

/** 알갱이 속도(px/s) — 끈적한 매질 속 종단 속도라 장에 비례한다. */
export function grainVelocity(minus: Point, x: number, y: number): { vx: number; vy: number } {
  const { ex, ey } = field(minus, x, y);
  let vx = GRAINS.mobility * ex;
  let vy = GRAINS.mobility * ey;
  const s = Math.hypot(vx, vy);
  if (s > GRAINS.maxSpeed) {
    vx *= GRAINS.maxSpeed / s;
    vy *= GRAINS.maxSpeed / s;
  }
  return { vx, vy };
}

/** 음전하가 양전하에 겹치지 않게 (원본 식 그대로). */
export function keepApart(p: Point): Point {
  const dx = p.x - PLUS.x;
  const dy = p.y - PLUS.y;
  const d = Math.hypot(dx, dy);
  if (d < MIN_APART) {
    const k = MIN_APART / (d || 1);
    return { x: PLUS.x + (d ? dx : MIN_APART) * (d ? k : 1), y: PLUS.y + (d ? dy * k : 0) };
  }
  return p;
}

/**
 * 전기력선을 추적한다 — 양전하 둘레에서 고른 각도로 출발해 장 방향을 따라 2단
 * 룽게-쿠타로 걷는다. 음전하에 닿거나 화면 밖으로 나가면 멈춘다. 반환은 px 점열.
 */
export function traceFieldLines(minus: Point): Point[][] {
  const n = Math.round(PLUS.q * LINES_PER_Q);
  const lines: Point[][] = [];
  const W = STAGE.width;
  const H = STAGE.height;
  const M = TRACE.outMargin;
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * (i + 0.5)) / n;
    let x = PLUS.x + TRACE.startR * Math.cos(a);
    let y = PLUS.y + TRACE.startR * Math.sin(a);
    const pts: Point[] = [{ x, y }];
    for (let s = 0; s < TRACE.maxSteps; s++) {
      let f = field(minus, x, y);
      let m = Math.hypot(f.ex, f.ey) || 1;
      const mx = x + (0.5 * TRACE.step * f.ex) / m;
      const my = y + (0.5 * TRACE.step * f.ey) / m;
      f = field(minus, mx, my);
      m = Math.hypot(f.ex, f.ey) || 1;
      x += (TRACE.step * f.ex) / m;
      y += (TRACE.step * f.ey) / m;
      pts.push({ x, y });
      if (Math.hypot(x - minus.x, y - minus.y) < TRACE.sinkR) {
        pts.push({ x: minus.x, y: minus.y });
        break;
      }
      if (x < -M || x > W + M || y < -M || y > H + M) break;
    }
    lines.push(pts);
  }
  return lines;
}

// ------------------------------------------------------------------------
// 한 걸음
// ------------------------------------------------------------------------

export function step(params: { state: FieldLinesState; dt: number }): FieldLinesState {
  const { state, dt } = params;
  const W = STAGE.width;
  const H = STAGE.height;

  // ---- 음전하 ----
  // 잡혀 있으면 포인터 자리 그대로, 아니면 자동 경로를 시상수로 따라간다.
  let minus: Point;
  if (state.drag.held) {
    const p = fromWorld(state.drag.pos);
    minus = keepApart({
      x: Math.min(W - DRAG_MARGIN, Math.max(DRAG_MARGIN, p.x)),
      y: Math.min(H - DRAG_MARGIN, Math.max(DRAG_MARGIN, p.y)),
    });
  } else {
    const target = autoPath(state.t);
    const k = 1 - Math.exp(-dt / FOLLOW_TAU);
    minus = keepApart({
      x: state.minus.x + (target.x - state.minus.x) * k,
      y: state.minus.y + (target.y - state.minus.y) * k,
    });
  }

  // ---- 알갱이 ----
  const r = rngFrom(state.rng);
  const grains: Grain[] = new Array(state.grains.length);
  for (let i = 0; i < state.grains.length; i++) {
    const g = state.grains[i]!;
    const v1 = grainVelocity(minus, g.x, g.y);
    const v2 = grainVelocity(minus, g.x + 0.5 * dt * v1.vx, g.y + 0.5 * dt * v1.vy);
    const x = g.x + dt * v2.vx;
    const y = g.y + dt * v2.vy;
    const age = g.age + dt;
    const intoSink = Math.hypot(x - minus.x, y - minus.y) < GRAINS.sinkR;
    const M = GRAINS.outMargin;
    const out = x < -M || x > W + M || y < -M || y > H + M;
    grains[i] = age > g.life || intoSink || out ? spawn(r.next) : { x, y, age, life: g.life };
  }

  return {
    t: state.t + dt,
    rng: r.state(),
    grains,
    minus,
    drag: state.drag.held ? state.drag : { pos: toWorld(minus.x, minus.y), held: false },
  };
}
