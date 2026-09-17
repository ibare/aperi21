// ========================================================================
// double-slit-with-electrons — 모형 (도메인 헬퍼, index 에서 re-export 하지 않는다)
// ========================================================================
// 원본(tasks/piece-lab/double-slit-with-electrons/index.html)의 상수를 그대로 옮겼다.
// 원본 화면 px 를 월드 단위로 쓰고, y 만 위로 뒤집었다 (월드 y = 316 − 화면 y).
//
// 모든 것이 시각의 함수다 — 도착 시각은 간격 함수의 누적합이고, 전자 하나하나의 자리는
// 원본과 같은 시드 난수(mulberry32, 시드 1)를 같은 순서로 소비해 미리 뽑는다.
// 그래서 같은 시각은 언제나 같은 화면이고, 원본과 같은 점이 같은 자리에 찍힌다.
// ========================================================================

// ---- 화면 배치 (월드 = 원본 화면 px, y 위) ----

/** 원본 캔버스 폭 · 높이. */
export const W = 860;
export const H = 316;
/** 장치 중심선. 원본 화면 y 150. */
export const CY = H - 150;
/** 전자원 · 슬릿 벽 · 검출 화면 왼쪽 가장자리. */
export const X_SRC = 30;
export const X_WALL = 240;
export const X_PLATE = 470;
export const PLATE_W = 300;
/** 검출 화면 위 · 아래 끝. 원본 화면 y 14 · 286. */
export const PLATE_TOP = H - 14;
export const PLATE_BOT = H - 286;
/** 개수 막대 시작 x · 최대 길이. */
export const X_BARS = 780;
export const BAR_MAX = 64;
/** 막대 구간 높이. */
export const BIN_H = 4;
export const NBINS = Math.ceil((PLATE_TOP - PLATE_BOT) / BIN_H);
/** 이름표 줄 높이. 원본은 화면 y 305 에 글자 기준선(alphabetic)이었다 — 가운데 높이로 옮겼다. */
export const LABEL_Y = H - 300;

// ---- 물리 매개변수 (화면 px 단위 모형) ----

/** 슬릿 간격의 절반 (d = 40). */
export const SLIT_HALF_SEP = 20;
/** 슬릿 폭 a. */
export const SLIT_WIDTH = 9;
/** 드브로이 파장. */
export const LAMBDA = 7;
const K = (2 * Math.PI) / LAMBDA;
/** 슬릿-화면 거리 230. */
export const L = X_PLATE - X_WALL;
/** 파동 묶음 두께. */
export const PACKET_W = 22;
/** 파동 격자 칸 크기. */
export const CELL = 5;

// ---- 도착 일정 ----

/** 이 시각 이후로는 새 전자를 보내지 않는다. */
export const EMIT_END = 26;
/** 점이 사라지기 시작하는 시각 · 한 주기 끝. */
export const FADE_START = 30;
export const CYCLE_END = 31.5;
/** 도착한 순간 이미 진행 중 — 원본은 내부 시각을 2.5 초 앞당겨 열었다. */
export const START_AT = 2.5;
/** 한 주기에 쌓는 점의 상한. */
export const CAP = 8000;
/** 원본 `?seed` 기본값. */
export const SEED = 1;
/** 캡션 단계 경계 — 누적 개수. 무늬가 눈에 보이기 시작하는 개수라 조각의 판단이다. */
export const COUNT_RANDOM = 30;
export const COUNT_STRIPES = 250;

/** n 번째 전자가 도착한 뒤 다음 전자까지의 간격(초). */
export function interval(n: number): number {
  return Math.max(0.005, 0.85 * Math.pow(0.88, n));
}

function sinc(b: number): number {
  return Math.abs(b) < 1e-6 ? 1 : Math.sin(b) / b;
}

/** 중심선에서 dy 떨어진 화면 자리의 도착 확률 밀도 (두 슬릿 간섭 × 슬릿 하나 회절 포락선). */
export function screenIntensity(dy: number): number {
  const r1 = Math.hypot(L, dy + SLIT_HALF_SEP);
  const r2 = Math.hypot(L, dy - SLIT_HALF_SEP);
  const sinT = dy / Math.hypot(L, dy);
  const env = sinc((K * SLIT_WIDTH * sinT) / 2);
  return (1 + Math.cos(K * (r1 - r2))) * env * env;
}

/** mulberry32 — 원본 PieceKit.random 과 같은 수열. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 한 주기에 도착하는 전자들. 순서대로 도착 시각 · 자리 · 막대 구간. */
export interface Electrons {
  readonly count: number;
  /** k 번째(0부터) 전자의 도착 시각. */
  readonly times: Float64Array;
  readonly xs: Float32Array;
  readonly ys: Float32Array;
  readonly bins: Int32Array;
}

/**
 * 원본 `advance` 와 같은 순서로 난수를 소비해 도착 목록을 만든다.
 * 도착 시각은 원본처럼 간격을 하나씩 더해 간다 — 부동소수 누적 순서까지 같게.
 */
export function buildElectrons(seed: number): Electrons {
  const random = mulberry32(seed);
  const plateSpan = 286 - 14; // 원본 화면 y 범위
  let imax = 0;
  for (let y = 14; y <= 286; y += 0.25) imax = Math.max(imax, screenIntensity(y - 150));

  const times = new Float64Array(CAP);
  const xs = new Float32Array(CAP);
  const ys = new Float32Array(CAP);
  const bins = new Int32Array(CAP);
  let n = 0;
  let next = interval(0);
  while (next < EMIT_END && n < CAP) {
    let yScreen = 150;
    for (let i = 0; i < 1000; i++) {
      const y = 14 + random() * plateSpan;
      if (random() * imax <= screenIntensity(y - 150)) {
        yScreen = y;
        break;
      }
    }
    times[n] = next;
    xs[n] = X_PLATE + 6 + random() * (PLATE_W - 12);
    ys[n] = H - yScreen;
    bins[n] = Math.min(NBINS - 1, Math.floor((yScreen - 14) / BIN_H));
    n++;
    next += interval(n);
  }
  return { count: n, times, xs, ys, bins };
}

/** 시각 u 까지 도착한 전자 수 (도착 시각 ≤ u). */
export function arrivedBy(e: Electrons, u: number): number {
  let lo = 0;
  let hi = e.count;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (e.times[mid]! <= u) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** 누적 개수가 `count` 가 되는 시각 — 캡션 단계 경계. */
export function timeOfCount(e: Electrons, count: number): number {
  return e.times[count - 1]!;
}

/**
 * 날아가는 전자 하나의 |ψ|² 격자 장. 행 우선, 첫 행이 월드 위쪽.
 * `s` 는 전자원에서 묶음 앞머리까지의 경로 길이, `vis` 는 흐림 계수.
 * 원본처럼 0.02 미만 칸은 비우고 0.85 에서 자른다.
 */
export const WAVE_COLS = Math.round((X_PLATE - X_SRC) / CELL);
export const WAVE_ROWS = Math.floor((286 - 14 - CELL / 2) / CELL) + 1;
/** 파동 장 월드 사각형. 칸 가운데가 원본 격자 자리에 오도록. */
export const WAVE_MIN: readonly [number, number] = [X_SRC, H - (14 + CELL * WAVE_ROWS)];
export const WAVE_MAX: readonly [number, number] = [X_PLATE, PLATE_TOP];

export function waveField(s: number, vis: number): number[] {
  const out = new Array<number>(WAVE_COLS * WAVE_ROWS).fill(0);
  const sAfter = s - (X_WALL - X_SRC);
  for (let j = 0; j < WAVE_ROWS; j++) {
    const dy = 14 + CELL / 2 + j * CELL - 150; // 원본 화면 y 기준 중심선에서의 거리
    for (let i = 0; i < WAVE_COLS; i++) {
      const x = X_SRC + CELL / 2 + i * CELL;
      let I: number;
      if (x < X_WALL) {
        const r = Math.hypot(x - X_SRC, dy);
        const g = Math.exp(-Math.pow((r - s) / PACKET_W, 2));
        I = g * g;
      } else {
        if (sAfter <= 0) continue;
        const r1 = Math.hypot(x - X_WALL, dy + SLIT_HALF_SEP);
        const r2 = Math.hypot(x - X_WALL, dy - SLIT_HALF_SEP);
        const e1 = sinc((K * SLIT_WIDTH * ((dy + SLIT_HALF_SEP) / r1)) / 2);
        const e2 = sinc((K * SLIT_WIDTH * ((dy - SLIT_HALF_SEP) / r2)) / 2);
        const a1 = Math.exp(-Math.pow((r1 - sAfter) / PACKET_W, 2)) * e1;
        const a2 = Math.exp(-Math.pow((r2 - sAfter) / PACKET_W, 2)) * e2;
        I = (a1 * a1 + a2 * a2 + 2 * a1 * a2 * Math.cos(K * (r1 - r2))) / 2.2;
      }
      if (I < 0.02) continue;
      out[j * WAVE_COLS + i] = Math.min(0.85, I * 0.85 * vis);
    }
  }
  return out;
}

/**
 * 지금 날아가는 전자의 경로 진행 — 없으면 null.
 * 한 번에 전자 하나만 날아간다 (날아가는 시간 = 다음 도착까지 간격보다 짧게).
 * 간격이 0.38 초 아래로 줄면 흐려지고 0.08 초 아래에서 지운다.
 */
export function flight(e: Electrons, u: number): { s: number; vis: number } | null {
  const n = arrivedBy(e, u);
  if (n >= e.count) return null;
  const next = e.times[n]!;
  if (next >= EMIT_END) return null;
  const last = n === 0 ? 0 : e.times[n - 1]!;
  const gap = next - last;
  const fly = Math.min(0.7, gap * 0.95);
  const p = (u - (next - fly)) / fly;
  if (p < 0 || p >= 1) return null;
  const vis = Math.max(0, Math.min(1, (gap - 0.08) / 0.3));
  if (vis <= 0) return null;
  return { s: p * (X_WALL - X_SRC + L), vis };
}
