// ========================================================================
// color-addition — 순수 계산
// ========================================================================
// 빛의 자리 · 고리 자리에 닿는지 · 겹친 칸의 모양. 캔버스도 색도 모른다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import {
  CENTER,
  H,
  IN_D,
  LIGHTS,
  OUT_D,
  R,
  STAGE_W,
  STATES,
  colorAdditionSchema,
  comboKey,
  phaseIds,
  smooth,
} from './schema';
import type { ColorAdditionState } from './state';

/** 세 빛이 자리에 들어와 있는 정도(0~1)에서 원판 중심들. */
export function lightCenters(inside: readonly number[]): [Vec2, Vec2, Vec2] {
  const at = (i: number): Vec2 => {
    const d = OUT_D + (IN_D - OUT_D) * inside[i]!;
    const a = LIGHTS[i]!.ang;
    return [CENTER[0] + d * Math.cos(a), CENTER[1] + d * Math.sin(a)];
  };
  return [at(0), at(1), at(2)];
}

/**
 * 주기 안 구간 [from, to] 의 이징 진행도. **엔진 `TimelineFrame.span` 을 다시 짠 것이다.**
 *
 * `step` 이 시간표 프레임을 받지 못해(G01) 손잡이 자리를 채우려면 여기서 다시 세야 한다.
 * scene 은 이것을 쓰지 않고 엔진이 넘긴 `timeline.span` 을 쓴다.
 */
function phaseSpan(id: string): { start: number; end: number } {
  const phases = colorAdditionSchema.timeline!.phases;
  let t = 0;
  for (const p of phases) {
    if (p.id === id) return { start: t, end: t + p.duration };
    t += p.duration;
  }
  throw new Error(`color-addition: 없는 단계 ${id}`);
}

function period(): number {
  return colorAdditionSchema.timeline!.phases.reduce((s, p) => s + p.duration, 0);
}

/** 이동 구간 k 의 진행도를 주는 함수에서 세 빛의 들어온 정도. scene 과 physics 가 함께 쓴다. */
export function insideFrom(progress: (k: number) => number): number[] {
  const inside = [...STATES[0]!] as number[];
  for (let k = 0; k < STATES.length - 1; k++) {
    const p = progress(k);
    for (let i = 0; i < 3; i++) inside[i] = inside[i]! + (STATES[k + 1]![i]! - STATES[k]![i]!) * p;
  }
  return inside;
}

/** 조각 시계 → 자동 진행 자리. `step` 전용 (G01). */
export function autoPositions(clock: number): ColorAdditionState['pos'] {
  const T = period();
  const u = ((clock % T) + T) % T;
  const inside = insideFrom((k) => {
    const ids = phaseIds(k);
    const start = phaseSpan(ids.before).start;
    const end = phaseSpan(ids.after).end;
    return smooth((u - start) / (end - start));
  });
  const [r, g, b] = lightCenters(inside);
  return { r, g, b, probe: CENTER };
}

/** 고리 자리에 각 빛이 닿는지. 원판 경계는 날카롭다(0 또는 1). */
export function reach(lights: readonly Vec2[], probe: Vec2): number[] {
  return lights.map((p) => (Math.hypot(p[0] - probe[0], p[1] - probe[1]) <= R ? 1 : 0));
}

// ------------------------------------------------------------------------
// 겹친 칸 — 볼록 다각형 자르기
// ------------------------------------------------------------------------

/** 원을 볼록 다각형으로 표본한다(반시계). */
export function circlePolygon(c: Vec2, r: number, n = 96): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  return out;
}

/** 검은 막 사각형(반시계). */
export const STAGE_RECT: readonly Vec2[] = [
  [0, 0],
  [STAGE_W, 0],
  [STAGE_W, H],
  [0, H],
];

/** Sutherland–Hodgman. `clip` 은 반시계 볼록 다각형이다. */
export function clipConvex(subject: readonly Vec2[], clip: readonly Vec2[]): Vec2[] {
  let out: Vec2[] = [...subject];
  for (let i = 0; i < clip.length && out.length > 0; i++) {
    const a = clip[i]!;
    const b = clip[(i + 1) % clip.length]!;
    const side = (p: Vec2) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    const input = out;
    out = [];
    for (let j = 0; j < input.length; j++) {
      const p = input[j]!;
      const q = input[(j + 1) % input.length]!;
      const sp = side(p);
      const sq = side(q);
      if (sp >= 0) out.push(p);
      if (sp >= 0 !== sq >= 0) {
        const t = sp / (sp - sq);
        out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
      }
    }
  }
  return out;
}

/**
 * 겹친 칸. 아래에서 위로 칠할 순서 — 빛 하나 셋, 둘 겹침 셋, 셋 겹침 하나.
 * 위 칸이 아래 칸을 덮으므로 칠이 끝나면 일곱 조합이 제 자리에 남는다.
 */
export function overlapCells(lights: readonly Vec2[]): { combo: string; points: Vec2[] }[] {
  const discs = lights.map((p) => clipConvex(circlePolygon(p, R), STAGE_RECT));
  const cells: { combo: string; points: Vec2[] }[] = [];
  const push = (on: number[], points: Vec2[]) => {
    if (points.length >= 3) cells.push({ combo: comboKey(on), points });
  };
  push([1, 0, 0], discs[0]!);
  push([0, 1, 0], discs[1]!);
  push([0, 0, 1], discs[2]!);
  const rg = clipConvex(discs[0]!, discs[1]!);
  push([1, 1, 0], rg);
  push([0, 1, 1], clipConvex(discs[1]!, discs[2]!));
  push([1, 0, 1], clipConvex(discs[0]!, discs[2]!));
  push([1, 1, 1], clipConvex(rg, discs[2]!));
  return cells;
}

const clampStage = (p: Vec2): Vec2 => [
  Math.min(STAGE_W, Math.max(0, p[0])),
  Math.min(H, Math.max(0, p[1])),
];

/**
 * 자동 진행이면 자체 시계로 손잡이 자리를 채우고, 한 번이라도 잡히면 손으로 놓은
 * 자리를 유지한다. 잡은 순간 나머지 빛은 직전 자동 자리에 그대로 남는다 — 원본의
 * "누르는 순간 현재 자동 상태를 복사" 와 같다.
 */
export function step(params: { state: ColorAdditionState; dt: number }): ColorAdditionState {
  const { state, dt } = params;
  const clock = state.clock + dt;
  const anyHeld = state.held.r || state.held.g || state.held.b || state.held.probe;
  const manual = state.manual || anyHeld;

  if (!manual) return { ...state, clock, pos: autoPositions(clock) };

  const pos = {
    r: clampStage(state.pos.r),
    g: clampStage(state.pos.g),
    b: clampStage(state.pos.b),
    probe: clampStage(state.pos.probe),
  };
  const combo = comboKey(reach([pos.r, pos.g, pos.b], pos.probe));
  return { ...state, clock, manual, pos, manualCaption: { [`c${combo}`]: true } };
}
