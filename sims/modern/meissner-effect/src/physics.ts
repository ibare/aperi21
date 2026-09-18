// ========================================================================
// meissner-effect — 순수 물리
// ========================================================================
// 옆에서 본 **2차원 단면**으로 푼다. 막대자석은 자극 한 쌍(N 은 샘, S 는 빨림)이고,
// 시료는 납작한 타원 단면이다.
//
// - 보통 상태: 시료는 자기장에 아무 일도 하지 않는다 — 자극 쌍의 장 그대로다.
// - 초전도 상태: 시료 안의 장이 0 이고 겉면에서 장의 수직 성분이 0 이다(B·n = 0).
//   자기력선은 시료에 들어가지 못하고 겉면을 따라 휘돌아 간다. 이 장은 2차원
//   퍼텐셜 흐름이 원기둥을 비켜 가는 것과 같은 문제라 닫힌 꼴로 풀린다 —
//   타원 바깥을 원 바깥으로 펴는 주코프스키 사상 z = ζ + c²/ζ 위에서 밀른-톰슨의
//   원 정리(각 자극의 거울상 R²/ζ̄₀ 에 같은 부호 자극)를 쓴다.
//
// 밀어내는 동안은 두 장을 s 로 섞는다: 바깥 = 보통 + s·(초전도 − 보통),
// 안 = (1 − s)·보통. 두 장 모두 겉면에서 수직 성분이 이어지므로(바깥 수직 성분이
// (1 − s)·보통의 수직 성분) 섞은 장도 자속이 새지 않는 장이다. 그래서 자극에서 같은
// 각 간격으로 뿌린 선 가운데 시료에 들어가는 선의 수가 저절로 (1 − s) 에 비례해 줄어든다.
//
// 자석이 뜨는 높이는 밀어낸 정도 s 에 비례한다 — 거울상 자극이 같은 부호라 자석을 민다.
// 힘의 균형을 푸는 대신 비례로 둔 것은 근사다 (NOTES (b)).
//
// 모든 것이 시간표 시각의 함수다 — 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  HOVER_GAP,
  LINE_COUNT,
  MAGNET_HEIGHT,
  MAGNET_WIDTH,
  POLE_INSET,
  SAMPLE_HALF_THICKNESS,
  SAMPLE_HALF_WIDTH,
} from './schema';
import type { MeissnerEffectState } from './state';

// ------------------------------------------------------------------------
// 추적 — 수치 계산의 손잡이. 물리량이 아니라 선을 긋는 해상도다.
// ------------------------------------------------------------------------

/** 자극 둘레에서 선을 뿌리기 시작하는 반지름(월드). */
const SEED_RADIUS = 0.04;
/** 선이 S 극에 이만큼 가까워지면 S 에 닿은 것으로 끝낸다(월드). 자석 몸 안이라 보이지 않는다. */
const END_RADIUS = 0.08;
/** 기본 걸음(월드). 자극 · 시료 가까이의 굽은 곳이 각지지 않을 만큼. */
const STEP = 0.025;
/** 멀어질수록 걸음을 늘리는 거리 척도(월드) — 걸음 = STEP · (1 + 거리/척도). */
const STEP_GROWTH = 1.2;
/** 선 하나의 최대 걸음 수. 화면 밖으로 크게 돌아 나가는 선도 S 로 돌아올 만큼. */
const MAX_STEPS = 2600;
/** 추적 상자(월드). 화면보다 넓다 — 밖으로 나갔다 돌아오는 선을 끊지 않게. */
const TRACE_BOX = { minX: -16, maxX: 16, minY: -14, maxY: 16 } as const;
/**
 * 안쪽 장이 이 몫보다 작으면 시료 안으로 들어간 걸음을 겉면으로 되돌린다. 다 밀어낸
 * 상태에서 수치 오차로 겉면을 살짝 넘은 선이 시료를 가로지르지 않게 하는 문턱이다.
 */
const INSIDE_EPS = 0.02;
/** 겉면으로 되돌릴 때 원 반지름에 곱하는 여유. 겉면 바로 밖에 놓는다. */
const SURFACE_PAD = 1.0005;

// ------------------------------------------------------------------------
// 상수
// ------------------------------------------------------------------------

export interface MeissnerConstants {
  /** 시료 단면의 반너비 · 반두께(월드). */
  sampleHalfWidth: number;
  sampleHalfThickness: number;
  /** 자석의 너비 · 높이(월드). */
  magnetWidth: number;
  magnetHeight: number;
  /** 자극이 자석 끝면에서 안으로 들어간 깊이(월드). */
  poleInset: number;
  /** 다 밀어냈을 때 떠오른 틈(월드). */
  hoverGap: number;
  /** 자기력선 수(N 극 아래 반원에서 뿌리는 수). */
  lineCount: number;
}

export function readConstants(stage: StageDef): MeissnerConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    sampleHalfWidth: c.sampleHalfWidth ?? SAMPLE_HALF_WIDTH,
    sampleHalfThickness: c.sampleHalfThickness ?? SAMPLE_HALF_THICKNESS,
    magnetWidth: c.magnetWidth ?? MAGNET_WIDTH,
    magnetHeight: c.magnetHeight ?? MAGNET_HEIGHT,
    poleInset: c.poleInset ?? POLE_INSET,
    hoverGap: c.hoverGap ?? HOVER_GAP,
    lineCount: Math.max(2, Math.round(c.lineCount ?? LINE_COUNT)),
  };
}

// ------------------------------------------------------------------------
// 시간표 읽기
// ------------------------------------------------------------------------

export interface MeissnerReading {
  /** 밀어낸 정도 0~1. 0 은 보통 상태, 1 은 다 밀어낸 초전도 상태. */
  expelled: number;
  /** 자석 밑면과 시료 윗면 사이의 틈(월드). */
  gap: number;
  /** 온도 이름표 `T > Tc` · `T < Tc` 의 짙기. */
  warmLabel: number;
  coldLabel: number;
}

/**
 * 지금 시각의 상태를 읽는다. **단계 경계는 선언이 정한다** — 경계 시각을 모듈 상수와
 * 견주지 않고 `at()` 으로 묻는다 (S-piece 「시간표는 선언이다」). 각 값이 두 단계의
 * 진행도 차라 분기가 없다: 앞 단계가 1 로 올리고 뒤 단계가 0 으로 내린다.
 */
export function readPhase(tl: TimelineFrame, c: MeissnerConstants): MeissnerReading {
  const expelled = tl.at('expel') - tl.at('settle');
  return {
    expelled,
    gap: c.hoverGap * expelled,
    warmLabel: 1 - tl.at('cool-out') + tl.at('heat-in'),
    coldLabel: tl.at('cool-in') - tl.at('heat-out'),
  };
}

// ------------------------------------------------------------------------
// 배치 — 자석과 자극의 자리
// ------------------------------------------------------------------------

export interface MagnetPlacement {
  /** 자석 밑면 높이(월드). */
  bottom: number;
  /** N 극 · S 극 자리. */
  north: Vec2;
  south: Vec2;
}

export function placeMagnet(c: MeissnerConstants, gap: number): MagnetPlacement {
  const bottom = c.sampleHalfThickness + gap;
  return {
    bottom,
    north: [0, bottom + c.poleInset],
    south: [0, bottom + c.magnetHeight - c.poleInset],
  };
}

/** 시료 단면(타원) 안인가. */
export function insideSample(p: Vec2, c: MeissnerConstants): boolean {
  const u = p[0] / c.sampleHalfWidth;
  const v = p[1] / c.sampleHalfThickness;
  return u * u + v * v < 1;
}

/** 시료 단면의 윤곽을 n 점으로 표본한다(반시계, 오른쪽 끝에서 출발). */
export function sampleOutline(c: MeissnerConstants, n: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([c.sampleHalfWidth * Math.cos(a), c.sampleHalfThickness * Math.sin(a)]);
  }
  return out;
}

// ------------------------------------------------------------------------
// 복소수 — [실수부, 허수부]
// ------------------------------------------------------------------------

type C = readonly [number, number];

const add = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]];
const sub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]];
const mul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const scale = (a: C, k: number): C => [a[0] * k, a[1] * k];
const abs2 = (a: C): number => a[0] * a[0] + a[1] * a[1];
function div(a: C, b: C): C {
  const d = abs2(b);
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
}
function inv(a: C): C {
  const d = abs2(a);
  return [a[0] / d, -a[1] / d];
}
function csqrt(a: C): C {
  const r = Math.sqrt(Math.sqrt(abs2(a)));
  const t = Math.atan2(a[1], a[0]) / 2;
  return [r * Math.cos(t), r * Math.sin(t)];
}

// ------------------------------------------------------------------------
// 주코프스키 사상 — 타원 바깥 ↔ 반지름 R 원 바깥
// ------------------------------------------------------------------------

interface Joukowski {
  /** 원 반지름 R = (a + b)/2. */
  R: number;
  /** c² = (a² − b²)/4. z = ζ + c²/ζ 가 |ζ| = R 을 반축 (a, b) 타원으로 보낸다. */
  c2: number;
}

function joukowski(c: MeissnerConstants): Joukowski {
  const a = c.sampleHalfWidth;
  const b = c.sampleHalfThickness;
  return { R: (a + b) / 2, c2: (a * a - b * b) / 4 };
}

/** z 를 ζ 로 되돌린다 — ζ² − zζ + c² = 0 의 두 근 가운데 크기가 큰 쪽(바깥 가지). */
function toZeta(z: C, j: Joukowski): C {
  const root = csqrt(sub(mul(z, z), [4 * j.c2, 0]));
  const p = scale(add(z, root), 0.5);
  const q = scale(sub(z, root), 0.5);
  return abs2(p) >= abs2(q) ? p : q;
}

function fromZeta(zeta: C, j: Joukowski): C {
  return add(zeta, scale(inv(zeta), j.c2));
}

// ------------------------------------------------------------------------
// 장 — 복소 퍼텐셜의 미분 W′ 에서 장 벡터는 (Re W′, −Im W′) 이다.
// 자극 세기는 둘이 같아 방향만 쓰는 추적에서는 약분된다.
// ------------------------------------------------------------------------

interface FieldSetup {
  j: Joukowski;
  north: C;
  south: C;
  /** ζ 평면의 두 자극과 그 거울상. */
  zN: C;
  zS: C;
  zNi: C;
  zSi: C;
}

function setupField(c: MeissnerConstants, m: MagnetPlacement): FieldSetup {
  const j = joukowski(c);
  const zN = toZeta(m.north, j);
  const zS = toZeta(m.south, j);
  const mirror = (q: C): C => scale(q, (j.R * j.R) / abs2(q));
  return { j, north: m.north, south: m.south, zN, zS, zNi: mirror(zN), zSi: mirror(zS) };
}

/** 보통 상태 — 자극 쌍 그대로. */
function freeW(z: C, f: FieldSetup): C {
  return sub(inv(sub(z, f.north)), inv(sub(z, f.south)));
}

/** 초전도 상태(시료 바깥) — ζ 평면에서 거울상을 더하고 dz/dζ 로 나눈다. */
function expelledW(z: C, f: FieldSetup): C {
  const zeta = toZeta(z, f.j);
  const wz = add(
    sub(inv(sub(zeta, f.zN)), inv(sub(zeta, f.zS))),
    sub(inv(sub(zeta, f.zNi)), inv(sub(zeta, f.zSi))),
  );
  const dz = sub([1, 0], scale(inv(mul(zeta, zeta)), f.j.c2));
  return div(wz, dz);
}

/** 섞은 장의 방향(단위 벡터). 크기가 0 이면 null. */
function direction(p: Vec2, s: number, f: FieldSetup, c: MeissnerConstants): Vec2 | null {
  const z: C = [p[0], p[1]];
  const free = freeW(z, f);
  const w = insideSample(p, c) ? scale(free, 1 - s) : add(scale(free, 1 - s), scale(expelledW(z, f), s));
  const bx = w[0];
  const by = -w[1];
  const len = Math.hypot(bx, by);
  if (!(len > 1e-9)) return null;
  return [bx / len, by / len];
}

/** 시료 안으로 들어간 점을 겉면 바로 밖으로 되돌린다 — ζ 를 원 위로 늘린다. */
function pushToSurface(p: Vec2, f: FieldSetup): Vec2 {
  const zeta = toZeta([p[0], p[1]], f.j);
  const k = (f.j.R * SURFACE_PAD) / Math.sqrt(abs2(zeta));
  const z = fromZeta(scale(zeta, k), f.j);
  return [z[0], z[1]];
}

// ------------------------------------------------------------------------
// 자기력선 추적
// ------------------------------------------------------------------------

/**
 * N 극 둘레의 **아래 반원**(시료 쪽)에서 같은 각 간격으로 뿌린 선을 장을 따라 긋는다.
 * 샘 가까이에서는 같은 각 간격이 같은 자속이라, 선의 몰림이 곧 장의 세기다. 위 반원은
 * 자석 몸 안에서 곧장 S 로 가거나 자석 옆에 작은 고리를 만들 뿐 시료와 상관이 없어
 * 뿌리지 않는다 — 그 고리가 화면을 채우면 시료를 지나는 선이 묻힌다.
 *
 * 뿌리는 각을 반 칸 비켜 곧장 아래(대칭축)를 피한다 — 다 밀어낸 상태에서 축 위의
 * 시료 꼭대기는 장이 0 인 정체점이라 그 선은 멈춰 버린다.
 */
export function traceFieldLines(c: MeissnerConstants, m: MagnetPlacement, expelled: number): Vec2[][] {
  const f = setupField(c, m);
  const s = Math.min(1, Math.max(0, expelled));
  const lines: Vec2[][] = [];
  const endR2 = END_RADIUS * END_RADIUS;

  for (let k = 0; k < c.lineCount; k++) {
    const a = -Math.PI + ((k + 0.5) / c.lineCount) * Math.PI;
    let p: Vec2 = [m.north[0] + SEED_RADIUS * Math.cos(a), m.north[1] + SEED_RADIUS * Math.sin(a)];
    const line: Vec2[] = [m.north, p];

    for (let i = 0; i < MAX_STEPS; i++) {
      const h = STEP * (1 + Math.hypot(p[0], p[1] - m.bottom) / STEP_GROWTH);
      // 중점법 — 방향만 쓴다.
      const d1 = direction(p, s, f, c);
      if (!d1) break;
      const mid: Vec2 = [p[0] + d1[0] * h * 0.5, p[1] + d1[1] * h * 0.5];
      const d2 = direction(mid, s, f, c) ?? d1;
      let next: Vec2 = [p[0] + d2[0] * h, p[1] + d2[1] * h];
      if (1 - s < INSIDE_EPS && insideSample(next, c)) next = pushToSurface(next, f);
      p = next;
      line.push(p);

      const dx = p[0] - m.south[0];
      const dy = p[1] - m.south[1];
      if (dx * dx + dy * dy < endR2) {
        line.push(m.south);
        break;
      }
      if (p[0] < TRACE_BOX.minX || p[0] > TRACE_BOX.maxX || p[1] < TRACE_BOX.minY || p[1] > TRACE_BOX.maxY) break;
    }
    lines.push(line);
  }
  return lines;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: MeissnerEffectState }): MeissnerEffectState {
  return params.state;
}
