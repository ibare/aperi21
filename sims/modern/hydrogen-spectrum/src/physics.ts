// ========================================================================
// hydrogen-spectrum — 순수 계산
// ========================================================================
// 수소 준위 · 뤼드베리 파장 · 전자 운동 · 광자 비행 · 띠 누적. 원본 index.html 의 `advance` 를
// 같은 순서 · 같은 난수 호출로 옮겼다. 걸음 안에서는 복사본을 고쳐 새 상태로 돌려준다.
// 파장 → 빛의 색도 여기서 센다 — 원본 `lambdaRGB` 와 같은 색을 선형광 세 성분으로.
// ========================================================================

import { wavelengthToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import {
  DECAY_TAU,
  DT,
  HIT_SIGMA,
  IR_CONTROL,
  IR_X,
  LADDER,
  LAMBDA,
  MARK_LIFE,
  N_MAX,
  PHOTON_SPEED,
  SATURATION,
  STRIP,
  STRIP_BASE_ALPHA,
  STRIP_W,
  TIMING,
  UV_X,
  WAVELENGTH_COLOR,
} from './schema';
import type { Drop, Electron, Flash, HydrogenSpectrumState, Mark, Photon } from './state';

// ------------------------------------------------------------------------
// 난수 — mulberry32 (원본 하네스와 같은 식)
// ------------------------------------------------------------------------

/** 난수 하나와 다음 내부 상태. */
export function nextRandom(s0: number): [number, number] {
  const s = (s0 + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

// ------------------------------------------------------------------------
// 물리 · 배치
// ------------------------------------------------------------------------

/** 준위 에너지(eV). */
export const energy = (n: number): number => -13.6 / (n * n);

/** 방출 파장(nm) — 뤼드베리 식. */
export const wavelengthNm = (up: number, low: number): number =>
  91.1753 / (1 / (low * low) - 1 / (up * up));

/** 준위의 세로 자리(원본 픽셀, y 아래로). n=2 위쪽은 에너지에 비례하고 n=1 은 축을 끊고 아래에 둔다. */
export function levelY(n: number): number {
  if (n === 1) return LADDER.yN1;
  const e = energy(n);
  return LADDER.yN2 + ((e - energy(2)) / (0 - energy(2))) * (LADDER.yZero - LADDER.yN2);
}

export const lambdaToX = (l: number): number =>
  STRIP.x0 + ((l - LAMBDA.min) / (LAMBDA.max - LAMBDA.min)) * STRIP_W;

export const isVisible = (l: number): boolean => l >= LAMBDA.min && l <= LAMBDA.max;

/** 전자의 지금 세로 자리 — 오르내리는 동안 smoothstep 보간. */
export function electronY(e: Electron): number {
  if (e.phase === 'rise' || e.phase === 'fall') {
    const s = 1 - e.timer / e.dur;
    const ease = s * s * (3 - 2 * s);
    return levelY(e.from) + (levelY(e.to) - levelY(e.from)) * ease;
  }
  return levelY(e.n);
}

/** 광자 경로 위 한 점 — 2차 베지에. */
export function photonAt(p: Photon, s: number): [number, number] {
  const a = (1 - s) * (1 - s);
  const b = 2 * s * (1 - s);
  const c = s * s;
  return [a * p.x0 + b * p.cx + c * p.x1, a * p.y0 + b * p.cy + c * p.y1];
}

/** 가시광 밖 광자는 띠 밖으로 나가며 옅어진다. */
export function photonAlpha(p: Photon): number {
  return isVisible(p.l) ? 1 : Math.max(0, 1 - Math.max(0, p.s - 0.6) / 0.4);
}

/** 쌓인 양 → 선의 불투명도 0~1 (원본 1 − exp(−I / 1.2)). */
export const stripLight = (amount: number): number => 1 - Math.exp(-amount / SATURATION);

// ------------------------------------------------------------------------
// 빛의 색
// ------------------------------------------------------------------------

/** sRGB 전달 곡선 — 색 공간 변환의 수학 상수 (C2 예외). */
const toScreen = (v: number): number => {
  const c = Math.max(0, Math.min(1, v));
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
};
const toLinear = (c: number): number => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

/** 원본의 가시광 양 끝 어둡게(화면값 계수). */
export function edgeFactor(l: number): number {
  const w = WAVELENGTH_COLOR;
  if (l < w.blueEnd) return w.blueFloor + ((1 - w.blueFloor) * (l - LAMBDA.min)) / (w.blueEnd - LAMBDA.min);
  if (l > w.redStart) return w.redFloor + ((1 - w.redFloor) * (w.redEnd - l)) / (w.redEnd - w.redStart);
  return 1;
}

/**
 * 파장 `l` 의 빛 — 원본 `lambdaRGB` 의 색을 화면값 비율 `scale` 만큼 어두운 바탕에 얹은 것을 선형광으로.
 *
 * 색상은 `wavelengthToLinearRgb`(원본과 같은 구간 근사)에서 얻고, 원본이 더 한 양 끝 어둡게 · 지수 0.8 은
 * 여기서 화면값에 씌운다. 원본은 이 화면값 색에 불투명도를 곱해 어두운 바탕에 얹었는데 빛 채널은
 * 선형광으로 섞으므로, 화면값에서 곱한 뒤 선형광으로 되돌려 넘긴다 (장부 G98).
 */
export function wavelengthLight(l: number, scale = 1): LinearRgb {
  const rgb = wavelengthToLinearRgb(l);
  const f = edgeFactor(l);
  const one = (v: number): number =>
    toLinear(Math.pow(toScreen(v) * f, WAVELENGTH_COLOR.exponent) * Math.max(0, Math.min(1, scale)));
  return [one(rgb[0]), one(rgb[1]), one(rgb[2])];
}

/** 띠의 픽셀 열마다 가운데 파장(nm). */
export const stripWavelength = (i: number): number =>
  LAMBDA.min + ((i + 0.5) / STRIP_W) * (LAMBDA.max - LAMBDA.min);

/**
 * 띠의 칸 색(선형광, 열마다 세 성분). 원본은 어두운 바탕 위에 파장색 무지개를 불투명도 0.07 로,
 * 그 위에 쌓인 선을 불투명도 A 로 겹쳤다 — 같은 파장색 두 겹이라 화면값으로 색 × (0.07 + 0.93 A).
 */
export function stripColors(bins: readonly number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < STRIP_W; i++) {
    const a = stripLight(bins[i] ?? 0);
    const rgb = wavelengthLight(stripWavelength(i), STRIP_BASE_ALPHA + (1 - STRIP_BASE_ALPHA) * a);
    out.push(rgb[0], rgb[1], rgb[2]);
  }
  return out;
}

// ------------------------------------------------------------------------
// 한 걸음
// ------------------------------------------------------------------------

interface Work {
  electrons: Electron[];
  photons: Photon[];
  drops: Drop[];
  rises: Mark[];
  flashes: Flash[];
  bins: number[];
  rng: number;
}

function random(w: Work): number {
  const [r, next] = nextRandom(w.rng);
  w.rng = next;
  return r;
}

function startRise(w: Work, e: Electron): void {
  // 충돌로 들뜨는 위 준위 — n=2 는 드물게, 3~6 은 고르게
  const up = random(w) < 0.1 ? 2 : 3 + Math.floor(random(w) * (N_MAX - 2));
  e.phase = 'rise';
  e.from = e.n;
  e.to = up;
  e.timer = TIMING.rise;
  e.dur = TIMING.rise;
  w.rises.push({ x: e.x, y0: levelY(e.from), y1: levelY(up), age: 0 });
}

function startHold(w: Work, e: Electron): void {
  e.phase = 'hold';
  e.timer = TIMING.holdMin + random(w) * TIMING.holdSpan;
}

function startFall(w: Work, e: Electron): void {
  const low = 1 + Math.floor(random(w) * (e.n - 1));
  e.phase = 'fall';
  e.from = e.n;
  e.to = low;
  e.timer = TIMING.fall;
  e.dur = TIMING.fall;
}

function land(w: Work, e: Electron): void {
  const l = wavelengthNm(e.from, e.to);
  const x = e.x;
  const y = levelY(e.to);
  w.drops.push({ x, y0: levelY(e.from), y1: y, l, age: 0 });
  const ty = STRIP.y0 + 10 + random(w) * (STRIP.y1 - STRIP.y0 - 20);
  const tx = isVisible(l) ? lambdaToX(l) : l < LAMBDA.min ? UV_X : IR_X;
  // 적외선 광자는 가시광 띠를 가로지르지 않도록 띠 위로 휘어 오른쪽으로 나간다
  const ir = l > LAMBDA.max;
  const cx = ir ? IR_CONTROL.x : (x + tx) / 2;
  const cy = ir ? IR_CONTROL.y : (y + ty) / 2;
  const dist = ir
    ? Math.hypot(cx - x, cy - y) + Math.hypot(tx - cx, ty - cy)
    : Math.hypot(tx - x, ty - y);
  w.photons.push({ x0: x, y0: y, cx, cy, x1: tx, y1: ty, l, s: 0, dur: dist / PHOTON_SPEED });
  e.n = e.to;
  if (e.n === 1) {
    e.phase = 'rest';
    e.timer = TIMING.restMin + random(w) * TIMING.restSpan;
  } else {
    startHold(w, e);
  }
}

function hit(w: Work, p: Photon): void {
  if (!isVisible(p.l)) return;
  const cx = lambdaToX(p.l) - STRIP.x0;
  for (let i = Math.floor(cx) - 3; i <= Math.ceil(cx) + 3; i++) {
    if (i < 0 || i >= STRIP_W) continue;
    w.bins[i] = w.bins[i]! + Math.exp(-((i - cx) ** 2) / (2 * HIT_SIGMA * HIT_SIGMA));
  }
  w.flashes.push({ x: p.x1, y: p.y1, l: p.l, age: 0 });
}

function advance(w: Work, dt: number): void {
  for (const e of w.electrons) {
    e.timer -= dt;
    if (e.timer > 0) continue;
    if (e.phase === 'rest') startRise(w, e);
    else if (e.phase === 'rise') {
      e.n = e.to;
      startHold(w, e);
    } else if (e.phase === 'hold') startFall(w, e);
    else land(w, e);
  }
  for (let i = w.photons.length - 1; i >= 0; i--) {
    const p = w.photons[i]!;
    p.s += dt / p.dur;
    if (p.s >= 1) {
      hit(w, p);
      w.photons.splice(i, 1);
    }
  }
  for (const list of [w.drops, w.rises, w.flashes] as { age: number }[][]) {
    for (let i = list.length - 1; i >= 0; i--) {
      list[i]!.age += dt;
      if (list[i]!.age > MARK_LIFE) list.splice(i, 1);
    }
  }
  const k = Math.exp(-dt / DECAY_TAU);
  for (let i = 0; i < STRIP_W; i++) w.bins[i] = w.bins[i]! * k;
}

/** 걸음 경계 오차. 1/60 을 거듭 더하고 빼도 한 걸음을 놓치지 않게. */
const STEP_EPS = 1e-9;

/**
 * 가변 dt 를 고정 걸음(1/60 초)으로 나눠 원본 `advance` 를 그만큼 부른다.
 * 사건 순서가 걸음에 묶여 있어 걸음을 바꾸면 다른 난수열 화면이 된다.
 */
export function step(params: { state: HydrogenSpectrumState; dt: number }): HydrogenSpectrumState {
  const { state, dt } = params;
  let acc = state.acc + dt;
  if (acc + STEP_EPS < DT) return { ...state, acc };
  const w: Work = {
    electrons: state.electrons.map((e) => ({ ...e })),
    photons: state.photons.map((p) => ({ ...p })),
    drops: state.drops.map((m) => ({ ...m })),
    rises: state.rises.map((m) => ({ ...m })),
    flashes: state.flashes.map((f) => ({ ...f })),
    bins: state.bins.slice(),
    rng: state.rng,
  };
  while (acc + STEP_EPS >= DT) {
    advance(w, DT);
    acc -= DT;
  }
  return { ...w, acc: Math.max(0, acc) };
}
