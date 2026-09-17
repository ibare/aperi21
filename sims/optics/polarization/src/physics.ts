// ========================================================================
// polarization — 순수 계산
// ========================================================================
// 진행파의 전기장 E(z, t). 판마다 진동이 그 판의 축 위로 투영되어 방향이 바뀌고 크기가 줄어든다.
// 첫 판 앞은 짧은 묶음마다 방향이 제각각(편광되지 않은 빛)이고, 묶음마다 cos α 만큼 남는 것도
// 그대로 계산한다 — 평균으로 뭉개지 않는다(원본 NOTES (b)).
//
// 3 차원 점을 고정 비스듬 시점으로 투영하는 수식은 원본 그대로다. 엔진에 3 차원 어휘가 없어
// 조각이 투영 평면 좌표(단위 = 세계 길이, y 위)를 계산해 월드 좌표로 넘긴다 (NOTES 「어휘 부족」).
// ========================================================================

import type { TimelineEase, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  DIM_BELOW,
  DX,
  DY,
  FIELD_DZ,
  FIELD_FADE_IN,
  GLOW_MID,
  GLOW_RADIUS,
  HALF,
  LAMBDA,
  MOVE_SECONDS,
  PACKET,
  PACKET_COUNT,
  PACKET_SEED,
  REVIVED_FROM,
  SCREEN_GRID,
  SPEED,
  Z,
  polarizationSchema,
} from './schema';
import type { PolarizationState } from './state';

const D2R = Math.PI / 180;
const K = (2 * Math.PI) / LAMBDA;

/** 고정 비스듬 시점 투영. (x 가로, y 세로, z 진행) → 투영 평면(y 위). */
export function project(x: number, y: number, z: number): Vec2 {
  return [z + x * DX, y - x * DY];
}

// ------------------------------------------------------------------------
// 편광되지 않은 빛 — 묶음 방향 표
// ------------------------------------------------------------------------

/** 시드 난수(mulberry32). 원본 하니스와 같은 수열이라 같은 시드면 같은 묶음 방향이 나온다. */
export function packetAngles(seed: number, count: number): number[] {
  let s = seed >>> 0;
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    out.push((((t ^ (t >>> 14)) >>> 0) / 4294967296) * Math.PI);
  }
  return out;
}

/** 선언(시드 · 개수)에서 한 번 만든 표. 값이 선언에서만 오므로 임베드마다 같다. */
const PACKETS = packetAngles(PACKET_SEED, PACKET_COUNT);

// ------------------------------------------------------------------------
// 가운데 판의 자세
// ------------------------------------------------------------------------

export interface Pose {
  /** 끼워진 정도 0~1. */
  inserted: number;
  /** 축 각도(도). 첫 판 세로 축에서 잰 값. */
  thetaDeg: number;
  /** +1 끼우는 중, −1 빼는 중, 0 멈춤. */
  dir: -1 | 0 | 1;
}

/** 단계 진행도(`at`)에서 자세를 만든다. 시간표를 scene 이 읽든 step 이 다시 세든 같은 식이다. */
export function poseFromPhases(at: (id: string) => number): Pose {
  const inAt = at('insert');
  const outAt = at('remove');
  const inserted = inAt - outAt;
  const thetaDeg = 45 + 45 * at('turn90') + 90 * at('turn180') + 45 * at('reset');
  let dir: -1 | 0 | 1 = 0;
  if (inAt > 0 && inAt < 1) dir = 1;
  else if (outAt > 0 && outAt < 1) dir = -1;
  if (inserted <= 0 || inserted >= 1) dir = 0;
  return { inserted, thetaDeg, dir };
}

/** 지금 화면의 자세 — 조작했으면 상태, 아니면 시간표에서. */
export function currentPose(state: PolarizationState, tl: TimelineFrame): Pose {
  if (state.manual) return { inserted: state.inserted, thetaDeg: state.thetaDeg, dir: state.dir };
  return poseFromPhases((id) => tl.at(id));
}

/** 완전히 끼워졌을 때만 물리를 적용한다(원본 `inserted()`). */
export const isInserted = (p: Pose): boolean => p.inserted >= 1;

/** 마지막 판을 지난 평균 세기 — 최댓값(45°)을 1 로 맞춘 상대 세기. */
export function relIntensity(p: Pose): number {
  if (!isInserted(p)) return 0;
  const v = Math.sin(2 * p.thetaDeg * D2R);
  return v * v;
}

/** 각도 표식에 쓰는 0~179 정수 도. */
export function degLabel(thetaDeg: number): number {
  const d = Math.round(thetaDeg) % 180;
  return d < 0 ? d + 180 : d;
}

// ------------------------------------------------------------------------
// 진동 — 진행 축을 따라 표본
// ------------------------------------------------------------------------

export interface FieldSample {
  z: number;
  /** 진동 끝점(투영 평면). */
  tip: Vec2;
  /** 진행 축 위 발(투영 평면). */
  foot: Vec2;
  /** 구간 · 묶음 번호. 바뀌는 자리에서 곡선과 띠를 끊는다. */
  key: number;
}

/** 위치 z 에서의 전기장 (x, y) 와 구간 · 묶음 번호 — 원본 `field` 그대로. */
function fieldAt(z: number, t: number, pose: Pose): { ex: number; ey: number; key: number } {
  const u = z - SPEED * t;
  const idx = ((Math.floor(u / PACKET) % PACKET_COUNT) + PACKET_COUNT) % PACKET_COUNT;
  const a0 = PACKETS[idx]!;
  const ph = Math.cos(K * u);
  const th = pose.thetaDeg * D2R;
  const on = isInserted(pose);
  let phi: number;
  let amp: number;
  let region: number;
  if (z < Z.p1) {
    phi = a0;
    amp = 1;
    region = 0;
  } else if (z < Z.p2) {
    phi = 0;
    amp = Math.cos(a0);
    region = 1;
  } else if (z < Z.p3) {
    region = 2;
    if (on) {
      phi = th;
      amp = Math.cos(a0) * Math.cos(th);
    } else {
      phi = 0;
      amp = Math.cos(a0);
    }
  } else {
    region = 3;
    phi = Math.PI / 2;
    amp = on ? Math.cos(a0) * Math.cos(th) * Math.sin(th) : 0;
  }
  const e = amp * ph;
  return { ex: e * Math.sin(phi), ey: e * Math.cos(phi), key: region * 100 + idx };
}

export function fieldSamples(t: number, pose: Pose): FieldSample[] {
  const out: FieldSample[] = [];
  for (let z = Z.start; z <= Z.screen - 0.02; z += FIELD_DZ) {
    const f = fieldAt(z, t, pose);
    const fade = Math.min(1, (z - Z.start) / FIELD_FADE_IN);
    out.push({ z, tip: project(f.ex * fade, f.ey * fade, z), foot: project(0, 0, z), key: f.key });
  }
  return out;
}

// ------------------------------------------------------------------------
// 판 — 결 · 축선을 판 사각형으로 자른다
// ------------------------------------------------------------------------

/** 판 좌표 선분 a→b 를 [−HALF, HALF]² 로 자른다(리앙-바스키). 밖이면 null. */
export function clipToPlate(a: Vec2, b: Vec2): [Vec2, Vec2] | null {
  const d: Vec2 = [b[0] - a[0], b[1] - a[1]];
  let t0 = 0;
  let t1 = 1;
  const edges: [number, number][] = [
    [-d[0], a[0] + HALF],
    [d[0], HALF - a[0]],
    [-d[1], a[1] + HALF],
    [d[1], HALF - a[1]],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }
    const r = q / p;
    if (p < 0) t0 = Math.max(t0, r);
    else t1 = Math.min(t1, r);
    if (t0 > t1) return null;
  }
  return [
    [a[0] + d[0] * t0, a[1] + d[1] * t0],
    [a[0] + d[0] * t1, a[1] + d[1] * t1],
  ];
}

// ------------------------------------------------------------------------
// 스크린 밝기 — 격자 값
// ------------------------------------------------------------------------

/** 원본 방사형 그라데이션의 세기(0~1) — 자리 0 에서 1, 0.45 에서 0.55, 1 에서 0, 사이는 직선. */
function glowLevel(s: number): number {
  if (s >= 1) return 0;
  if (s <= GLOW_MID.at) return 1 + ((GLOW_MID.level - 1) * s) / GLOW_MID.at;
  return GLOW_MID.level * (1 - (s - GLOW_MID.at) / (1 - GLOW_MID.at));
}

/** 스크린 격자가 덮는 투영 평면 사각형. */
export function screenBox(): { min: Vec2; max: Vec2 } {
  const w = HALF * Math.abs(DX);
  const h = HALF + HALF * DY;
  return { min: [Z.screen - w, -h], max: [Z.screen + w, h] };
}

/**
 * 스크린 칸 값 — 테마와 무관한 빛의 세기. 판 안은 0(빛 없음, 원본의 검은 판)에서 번짐 세기
 * r × 그라데이션까지, 판 밖은 `NaN`(칠하지 않음). 원본은 검은 판 위에 흰 번짐을 그 불투명도로 얹는다.
 */
export function screenValues(r: number): number[] {
  const { min, max } = screenBox();
  const { cols, rows } = SCREEN_GRID;
  const cw = (max[0] - min[0]) / cols;
  const rh = (max[1] - min[1]) / rows;
  const values: number[] = new Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    const Y = max[1] - (j + 0.5) * rh;
    for (let i = 0; i < cols; i++) {
      const X = min[0] + (i + 0.5) * cw;
      // 투영의 역 — 스크린 평면(z 고정) 위 (x, y).
      const x = (X - Z.screen) / DX;
      const y = Y + x * DY;
      let v = Number.NaN;
      if (Math.abs(x) <= HALF && Math.abs(y) <= HALF) {
        const s = Math.hypot(X - Z.screen, Y) / GLOW_RADIUS;
        v = r * glowLevel(s);
      }
      values[j * cols + i] = v;
    }
  }
  return values;
}

// ------------------------------------------------------------------------
// 한 걸음 — 조작 인계 · 캡션 판정
// ------------------------------------------------------------------------

const EASES: Record<TimelineEase, (x: number) => number> = {
  linear: (x) => x,
  smooth: (x) => x * x * (3 - 2 * x),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};

/**
 * 조각 시계로 선언된 시간표를 다시 센다 — `step` 은 `TimelineFrame` 을 받지 못한다(NOTES 「어휘 부족」).
 * 단계 길이 · 이징은 선언에서 읽는다. 돌려주는 것은 지금 단계 id 와 단계별 진행도 조회.
 */
function phasesAt(clock: number): { phase: string; at: (id: string) => number } {
  const phases = polarizationSchema.timeline!.phases;
  const period = phases.reduce((acc, p) => acc + p.duration, 0);
  const u = ((clock % period) + period) % period;
  const table = new Map<string, number>();
  let start = 0;
  let phase = phases[phases.length - 1]!.id;
  for (const p of phases) {
    const end = start + p.duration;
    const raw = u < start ? 0 : u >= end ? 1 : (u - start) / p.duration;
    table.set(p.id, EASES[p.ease ?? 'linear'](raw));
    if (u >= start && u < end) phase = p.id;
    start = end;
  }
  return { phase, at: (id) => table.get(id) ?? 0 };
}

/** 원본 `captionText` 의 갈래를 불리언 하나로. */
function captionFlags(p: Pose, on: boolean): Pick<
  PolarizationState,
  'capBlocked' | 'capInserting' | 'capRemoving' | 'capParallel' | 'capCrossed' | 'capDim' | 'capRevived'
> {
  const f = {
    capBlocked: false,
    capInserting: false,
    capRemoving: false,
    capParallel: false,
    capCrossed: false,
    capDim: false,
    capRevived: false,
  };
  if (!on) return f;
  if (p.inserted <= 0) f.capBlocked = true;
  else if (p.inserted < 1) {
    if (p.dir < 0) f.capRemoving = true;
    else f.capInserting = true;
  } else {
    const r = relIntensity(p);
    const c = Math.cos(p.thetaDeg * D2R);
    if (r < DIM_BELOW) {
      if (c * c > 0.5) f.capParallel = true;
      else f.capCrossed = true;
    } else if (r < REVIVED_FROM) f.capDim = true;
    else f.capRevived = true;
  }
  return f;
}

/**
 * 한 걸음. 손대기 전에는 시간표의 자세를 적어 손잡이 · 단추 문안이 화면을 따라가게 하고,
 * 슬라이더를 잡거나 단추를 누르는 순간 자동 진행을 끊고 지금 값을 넘겨받는다(원본 `goManual`).
 */
export function step(params: { state: PolarizationState; dt: number }): PolarizationState {
  const { dt } = params;
  const s = params.state;
  const clock = s.clock + dt;

  if (!s.manual && !s.angleHeld && !s.togglePressed) {
    const { phase, at } = phasesAt(clock);
    const pose = poseFromPhases(at);
    const btnTarget = pose.dir !== 0 ? (pose.dir > 0 ? 1 : 0) : isInserted(pose) ? 1 : 0;
    // 판을 돌리는 단계만 값으로 캡션이 갈린다. 나머지 단계는 시간표의 단계 캡션이 말한다.
    const valueDriven = phase === 'turn90' || phase === 'turn180';
    return {
      ...s,
      clock,
      inserted: pose.inserted,
      thetaDeg: pose.thetaDeg,
      dir: pose.dir,
      angleDeg: degLabel(pose.thetaDeg),
      showRemove: btnTarget === 1,
      showInsert: btnTarget === 0,
      ...captionFlags(pose, valueDriven),
    };
  }

  // 조작 — 처음 손대는 순간 지금 끼워진 정도에서 목표를 정한다.
  let target = s.target;
  let thetaDeg = s.thetaDeg;
  if (!s.manual) target = s.inserted >= 0.5 ? 1 : 0;
  if (s.angleHeld) thetaDeg = s.angleDeg;
  if (s.togglePressed) target = target === 1 ? 0 : 1;

  let inserted = s.inserted;
  let dir: -1 | 0 | 1 = 0;
  if (inserted !== target) {
    dir = target > inserted ? 1 : -1;
    inserted = Math.min(1, Math.max(0, inserted + (dir * dt) / MOVE_SECONDS));
  }
  if (inserted === 0 || inserted === 1) dir = 0;
  const pose: Pose = { inserted, thetaDeg, dir };

  return {
    ...s,
    clock,
    manual: true,
    target,
    inserted,
    thetaDeg,
    dir,
    angleDeg: s.angleHeld ? s.angleDeg : degLabel(thetaDeg),
    togglePressed: false,
    showRemove: target === 1,
    showInsert: target === 0,
    ...captionFlags(pose, true),
  };
}
