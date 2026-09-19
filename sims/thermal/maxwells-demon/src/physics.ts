// ========================================================================
// maxwells-demon — 순수 물리
// ========================================================================
// DOM · 캔버스 · 실시간을 모른다. 난수는 스테이지 상수의 시드에서만 나온다.
//
// 알갱이는 벽 · 칸막이에서만 튀고 서로 부딪히지 않는다. 그래서 칸을 옮기지 않는 동안의
// 자리는 처음 자리 · 속도와 시각의 **닫힌 식**이다. 칸을 옮기는 것은 도깨비가 문을 열어 줄
// 때뿐이고, 그 시각은 벽에 닿는 시각을 차례로 풀어 얻는다 — (시드, 도깨비가 일하는 구간)만
// 같으면 언제나 같은 판정 목록이 나온다. `step` 에 쌓지 않는다 (S-sim).
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import type { MaxwellsDemonState } from './state';

/**
 * 벽에서 알갱이 중심까지 띄우는 거리(월드). 점이 벽선 위에 반쯤 걸쳐 보이지 않게 한다.
 * 물리량이 아니라 그림의 여백이다. 문을 지나는 알갱이는 이 두 배만큼 건너뛴다.
 */
export const WALL_MARGIN = 0.03;

/** 한 알갱이가 한 번의 풀이에서 벽에 닿는 횟수의 상한. 느린 알갱이 몇십 번이면 끝나는 풀이의 안전 난간이다. */
const MAX_WALL_HITS = 4000;

export interface DemonConstants {
  perSide: number;
  seed: number;
  boxWidth: number;
  boxHeight: number;
  speedScale: number;
  speedThreshold: number;
  doorLow: number;
  doorHigh: number;
  doorOpenSeconds: number;
  doorSwingSeconds: number;
  ringSeconds: number;
  barScale: number;
}

export function readConstants(stage: StageDef): DemonConstants {
  const c = stage.constants ?? {};
  return {
    perSide: Math.max(1, Math.round(c.perSide ?? 18)),
    seed: c.seed ?? 6,
    boxWidth: c.boxWidth ?? 2.4,
    boxHeight: c.boxHeight ?? 1.2,
    speedScale: c.speedScale ?? 0.6,
    speedThreshold: c.speedThreshold ?? 0.7,
    doorLow: c.doorLow ?? 0.3,
    doorHigh: c.doorHigh ?? 0.9,
    doorOpenSeconds: c.doorOpenSeconds ?? 0.3,
    doorSwingSeconds: c.doorSwingSeconds ?? 0.15,
    ringSeconds: c.ringSeconds ?? 0.6,
    barScale: c.barScale ?? 0.5,
  };
}

/** 칸 — 0 왼쪽, 1 오른쪽. */
export type Side = 0 | 1;

/** 알갱이 하나의 처음(도깨비가 일을 시작하는 순간) 자리 · 속도. */
export interface Molecule {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly speed: number;
  readonly side: Side;
}

/** mulberry32 — 시드 결정적 난수. 다른 sim 의 것을 import 하지 않고 여기 둔다 (S-sim). */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** log(0) 을 피하는 가장 작은 균등 난수. */
const MIN_UNIFORM = 1e-9;

/**
 * 두 칸에 알갱이를 `perSide` 개씩. 속력은 2차원 맥스웰 분포(성분마다 정규분포 → 레일리)에서
 * 한 벌만 뽑아 **두 칸이 똑같이 나눠 가진다** — 처음 두 칸의 온도가 표본 잡음 없이 같다.
 * 자리와 방향은 칸마다 따로 뽑는다. 뽑는 순서까지 고정이라 같은 시드면 같은 기체다.
 */
export function sampleMolecules(c: DemonConstants): Molecule[] {
  const random = mulberry32(c.seed);
  const mid = c.boxWidth / 2;
  const speeds: number[] = [];
  for (let i = 0; i < c.perSide; i++) {
    speeds.push(c.speedScale * Math.sqrt(-2 * Math.log(Math.max(MIN_UNIFORM, random()))));
  }
  const out: Molecule[] = [];
  for (const side of [0, 1] as const) {
    const x0 = side === 0 ? WALL_MARGIN : mid + WALL_MARGIN;
    for (const speed of speeds) {
      const x = x0 + random() * (mid - 2 * WALL_MARGIN);
      const y = WALL_MARGIN + random() * (c.boxHeight - 2 * WALL_MARGIN);
      const a = 2 * Math.PI * random();
      out.push({ x, y, vx: speed * Math.cos(a), vy: speed * Math.sin(a), speed, side });
    }
  }
  return out;
}

/**
 * 두 벽 [lo, hi] 사이를 튀는 1차원 운동의 닫힌 식. 자리와 그때의 속도(부호가 뒤집힌 것)를 준다.
 * 펼친 좌표를 폭의 두 배로 접는다 — 반사가 몇 번이든, 시각이 음수여도 한 번에 계산된다.
 */
function bounce(x0: number, v: number, lo: number, hi: number, t: number): { x: number; v: number } {
  const span = hi - lo;
  const period = 2 * span;
  let s = (x0 - lo + v * t) % period;
  if (s < 0) s += period;
  return s <= span ? { x: lo + s, v } : { x: lo + period - s, v: -v };
}

/** 그 칸의 가로 벽 [안쪽 벽, 바깥 벽] — 칸막이 쪽도 여백만큼 띄운다. */
function sideWalls(side: Side, c: DemonConstants): readonly [number, number] {
  const mid = c.boxWidth / 2;
  return side === 0 ? [WALL_MARGIN, mid - WALL_MARGIN] : [mid + WALL_MARGIN, c.boxWidth - WALL_MARGIN];
}

/** 알갱이가 한 칸에 머무는 구간. `t0` 부터 다음 구간 시작까지 `bounce(x0, vx, 벽)` 으로 움직인다. */
interface Segment {
  readonly t0: number;
  readonly x0: number;
  readonly vx: number;
  readonly side: Side;
}

/** 도깨비의 판정 한 번 — 문 앞에 온 시각 · 높이, 문을 열었는지, 열었다면 가는 쪽(+1 오른쪽). */
export interface Judgment {
  readonly t: number;
  readonly y: number;
  readonly molecule: number;
  readonly pass: boolean;
  readonly dir: 1 | -1;
}

/** 도깨비가 일한 결과 — 알갱이마다 칸 구간 목록, 판정 목록(시각 순). */
export interface DemonRun {
  readonly segments: readonly (readonly Segment[])[];
  readonly judgments: readonly Judgment[];
}

/**
 * 도깨비가 시각 [0, `window`] 동안 문을 지킬 때의 알갱이 역사.
 *
 * 알갱이마다 가로 벽에 닿는 시각을 차례로 푼다. 칸막이 쪽 벽에 닿았는데 그 높이가 문 안이면
 * 도깨비가 속력을 잰다(판정 한 번). 왼쪽의 빠른 것 · 오른쪽의 느린 것이면 문을 열어 건너가고
 * (새 구간), 아니면 닫힌 문에 튄다. 시각 0 전과 `window` 뒤는 문이 닫혀 있어 닫힌 식 그대로다.
 * 세로 운동은 칸막이와 무관한 닫힌 식이다.
 */
export function runDemon(molecules: readonly Molecule[], window: number, c: DemonConstants): DemonRun {
  const segments: Segment[][] = [];
  const judgments: Judgment[] = [];
  const mid = c.boxWidth / 2;
  molecules.forEach((m, i) => {
    const segs: Segment[] = [{ t0: 0, x0: m.x, vx: m.vx, side: m.side }];
    let t = 0;
    let x = m.x;
    let vx = m.vx;
    let side: Side = m.side;
    for (let hit = 0; hit < MAX_WALL_HITS && vx !== 0; hit++) {
      const [lo, hi] = sideWalls(side, c);
      const wall = vx > 0 ? hi : lo;
      const th = t + (wall - x) / vx;
      if (th > window) break;
      t = th;
      x = wall;
      const towardPartition = side === 0 ? vx > 0 : vx < 0;
      if (towardPartition) {
        const y = bounce(m.y, m.vy, WALL_MARGIN, c.boxHeight - WALL_MARGIN, t).x;
        if (y >= c.doorLow && y <= c.doorHigh) {
          const pass = side === 0 ? m.speed > c.speedThreshold : m.speed < c.speedThreshold;
          const dir: 1 | -1 = side === 0 ? 1 : -1;
          judgments.push({ t, y, molecule: i, pass, dir });
          if (pass) {
            side = side === 0 ? 1 : 0;
            x = side === 0 ? mid - WALL_MARGIN : mid + WALL_MARGIN;
            segs.push({ t0: t, x0: x, vx, side });
            continue;
          }
        }
      }
      vx = -vx;
    }
    segments.push(segs);
  });
  judgments.sort((a, b) => a.t - b.t);
  return { segments, judgments };
}

/** 그 시각에 알갱이가 머무는 구간. 시각 0 전은 첫 구간이다(음의 시각도 닫힌 식이 받는다). */
function segmentAt(segs: readonly Segment[], t: number): Segment {
  let s = segs[0]!;
  for (const seg of segs) {
    if (seg.t0 <= t) s = seg;
    else break;
  }
  return s;
}

/** 시각 `t` 의 알갱이 자리 · 속도 · 칸. */
export function moleculeAt(
  m: Molecule,
  segs: readonly Segment[],
  t: number,
  c: DemonConstants,
): { pos: readonly [number, number]; vel: readonly [number, number]; side: Side } {
  const seg = segmentAt(segs, t);
  const [lo, hi] = sideWalls(seg.side, c);
  const xb = bounce(seg.x0, seg.vx, lo, hi, t - seg.t0);
  const yb = bounce(m.y, m.vy, WALL_MARGIN, c.boxHeight - WALL_MARGIN, t);
  return { pos: [xb.x, yb.x], vel: [xb.v, yb.v], side: seg.side };
}

/**
 * 시각 `t` 에 문이 열린 정도 0~1 과 열리는 쪽. 문을 여는 판정마다 그 시각을 가운데로
 * `doorOpenSeconds` 동안 활짝 열려 있고, 앞뒤 `doorSwingSeconds` 동안 여닫힌다.
 */
export function doorAt(judgments: readonly Judgment[], t: number, c: DemonConstants): { open: number; dir: 1 | -1 } {
  let open = 0;
  let dir: 1 | -1 = 1;
  const halfOpen = c.doorOpenSeconds / 2;
  for (const j of judgments) {
    if (!j.pass) continue;
    const a = Math.min(1, Math.max(0, (halfOpen + c.doorSwingSeconds - Math.abs(t - j.t)) / c.doorSwingSeconds));
    if (a > open) {
      open = a;
      dir = j.dir;
    }
  }
  return { open, dir };
}

/**
 * 상태가 쌓는 것이 없다 — 알갱이 자리는 시각의 함수이고, 시각은 엔진이 scene 에
 * `params.timeline` 으로 준다. 빈 걸음을 둔다 (S-sim 「상태가 시계뿐인 조각」).
 */
export function step(params: { state: MaxwellsDemonState }): MaxwellsDemonState {
  return params.state;
}
