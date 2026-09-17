// ========================================================================
// tangential-normal-acceleration — 순수 물리
// ========================================================================
// 가속도를 방향부터 정하지 않고 두 몫(속력 몫 aT, 방향 몫 aN)을 대본으로 정해
// 속력·방향·위치를 적분한다. 화면의 움직임은 두 몫이 실제로 만든 결과다.
//
// 좌표는 원본과 같이 **화면식**(y 가 아래, 방향각이 늘면 화면에서 시계 방향)으로
// 적분하고, 월드(y 위)로 옮기는 것은 scene 이 한 곳에서 한다.
// ========================================================================

import type { TimelineFrame } from '@aperi21/schema';
import {
  ACCEL_LENGTH,
  HODO,
  HODO_FILL,
  SCRIPT,
  TABLE_FPS,
  TABLE_SUBSTEPS,
  TRACK,
  TRACK_PAD,
  VELOCITY_LENGTH,
  V_FAST,
  V_SLOW,
  tangentialNormalAccelerationSchema,
  type Leg,
} from './schema';
import type { TangentialNormalAccelerationState } from './state';

/** 쌓이는 것이 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: TangentialNormalAccelerationState }): TangentialNormalAccelerationState {
  return params.state;
}

/** 표의 한 칸 — 모델 좌표의 위치 · 방향각 · 속력. */
export interface Sample {
  x: number;
  y: number;
  h: number;
  v: number;
}

interface Table {
  samples: Sample[];
  /** 모든 칸 중 가장 큰 가속도 크기. 가속도 배율의 기준. */
  aMax: number;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

/** 단계 id 의 대본. 선언에 없는 단계면 던진다 — 조용히 멈춘 화면이 되지 않게. */
export function legOf(phaseId: string): Leg {
  const leg = SCRIPT[phaseId];
  if (!leg) throw new Error(`tangential-normal-acceleration: 단계 '${phaseId}' 의 대본이 없다`);
  return leg;
}

/**
 * 선언된 시간표의 단계 길이로 한 바퀴를 프레임 표로 적분한다.
 *
 * 속력·방향은 구간 안에서 정확히 선형이고 위치는 잘게 나눠 적분한다. 마지막에 적분
 * 오차로 남은 틈을 칸마다 고르게 나눠 없앤다 — 뒤 반 바퀴가 앞 반 바퀴의 180° 회전이라
 * 이론상 닫히지만 수치로는 미세하게 벌어진다.
 */
function buildTable(): Table {
  const phases = tangentialNormalAccelerationSchema.timeline?.phases ?? [];
  const samples: Sample[] = [];
  let aMax = 0;
  let x = 0;
  let y = 0;
  let h = 0;
  let v = V_SLOW;
  const dt = 1 / TABLE_FPS;
  for (const p of phases) {
    const leg = legOf(p.id);
    const frames = Math.round(p.duration * TABLE_FPS);
    const aT = leg.dv / p.duration;
    const w = leg.turn / p.duration;
    const v0 = v;
    for (let k = 0; k < frames; k++) {
      const vk = v0 + aT * (k * dt);
      samples.push({ x, y, h, v: vk });
      aMax = Math.max(aMax, Math.hypot(aT, vk * w));
      for (let s = 0; s < TABLE_SUBSTEPS; s++) {
        const tm = (k + (s + 0.5) / TABLE_SUBSTEPS) * dt;
        const vm = v0 + aT * tm;
        const hm = h + w * (tm - k * dt);
        const sub = dt / TABLE_SUBSTEPS;
        x += vm * Math.cos(hm) * sub;
        y += vm * Math.sin(hm) * sub;
      }
      h += w * dt;
    }
    v = v0 + leg.dv;
  }
  const n = samples.length;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  samples.forEach((s, j) => {
    s.x -= (x * j) / n;
    s.y -= (y * j) / n;
    minX = Math.min(minX, s.x);
    maxX = Math.max(maxX, s.x);
    minY = Math.min(minY, s.y);
    maxY = Math.max(maxY, s.y);
  });
  return { samples, aMax, bounds: { minX, maxX, minY, maxY } };
}

// 표는 선언만의 함수라 한 번 적분해 모든 인스턴스가 읽기만 한다 (인스턴스 상태가 아니다).
let cached: Table | undefined;
function table(): Table {
  return (cached ??= buildTable());
}

/** 주기 안 시각 `u`(초)의 위치·방향·속력. 이웃한 두 칸을 선형 보간한다. */
export function sampleAt(u: number): Sample {
  const { samples } = table();
  const n = samples.length;
  const f = u * TABLE_FPS;
  const i = Math.floor(f);
  const frac = f - i;
  const a = samples[((i % n) + n) % n]!;
  const b = samples[(((i + 1) % n) + n) % n]!;
  // 방향각은 한 바퀴를 넘어 누적되므로 표의 끝→처음 이음매에서 2π 만큼 튄다.
  let dh = b.h - a.h;
  if (dh > Math.PI) dh -= 2 * Math.PI;
  if (dh < -Math.PI) dh += 2 * Math.PI;
  return {
    x: a.x + (b.x - a.x) * frac,
    y: a.y + (b.y - a.y) * frac,
    h: a.h + dh * frac,
    v: a.v + (b.v - a.v) * frac,
  };
}

/** 지금 단계의 두 몫. 속력 몫은 구간 안에서 일정하고, 방향 몫은 v·ω 로 속력을 따라간다. */
export function partsAt(tl: TimelineFrame, v: number): { aT: number; aN: number } {
  const leg = legOf(tl.phase);
  const d = tl.duration(tl.phase);
  return { aT: leg.dv / d, aN: (v * leg.turn) / d };
}

/** 원본 px 로 잰 배치 — 길을 왼쪽 판에 맞추는 배율·원점과 화살 배율. */
export interface Layout {
  /** 모델 좌표 → 원본 px. */
  fit: number;
  ox: number;
  oy: number;
  /** 속도 → 길 위 화살 px. */
  velocityScale: number;
  /** 가속도 → 화살 px (두 판 공통). */
  accelScale: number;
  /** 속도 → 모음판 화살 px. */
  hodoScale: number;
}

let cachedLayout: Layout | undefined;
export function layout(): Layout {
  if (cachedLayout) return cachedLayout;
  const { aMax, bounds: b } = table();
  const fit = Math.min(
    (TRACK.x1 - TRACK.x0 - 2 * TRACK_PAD.x) / (b.maxX - b.minX),
    (TRACK.y1 - TRACK.y0 - 2 * TRACK_PAD.y) / (b.maxY - b.minY),
  );
  cachedLayout = {
    fit,
    ox: (TRACK.x0 + TRACK.x1) / 2 - (fit * (b.minX + b.maxX)) / 2,
    oy: (TRACK.y0 + TRACK.y1) / 2 - (fit * (b.minY + b.maxY)) / 2,
    velocityScale: VELOCITY_LENGTH / V_FAST,
    accelScale: ACCEL_LENGTH / aMax,
    hodoScale: (HODO.r / V_FAST) * HODO_FILL,
  };
  return cachedLayout;
}

/** 한 바퀴의 칸 수. 길을 그릴 때 쓴다. */
export function sampleCount(): number {
  return table().samples.length;
}

/** 표의 j 번째 칸. */
export function sampleIndex(j: number): Sample {
  const { samples } = table();
  const n = samples.length;
  return samples[((j % n) + n) % n]!;
}
