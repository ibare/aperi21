// ========================================================================
// lift-force — 순수 계산
// ========================================================================
// 주코프스키 대칭 날개 둘레의 퍼텐셜 흐름(쿠타 조건)과, 그 위에서 같은 순간 뿌린 연기
// 표지의 RK2 적분. 원본 index.html 의 식 · 상수를 그대로 옮겼다.
//
// 원 평면 ζ 에서 중심 μ=(−ε,0), 반지름 a=c+ε 인 원 둘레 흐름을 z = ζ + c²/ζ 로 옮긴다.
// 날개 좌표계에서 흐름은 받음각 α 로 들어오고, 화면에는 −α 만큼 돌려 흐름이 수평,
// 날개 앞전이 들린 모습이 된다. 좌표는 세계 단위(y 위로)다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';

import {
  AIRFOIL_SAMPLES,
  AOA,
  DT,
  FLOW,
  MAX_SUBSTEPS,
  PRESSURE,
  SCALE,
  SMOKE,
  VIEW,
  WARM_SECONDS,
  Y_HALF,
} from './schema';
import type { LiftForceState, SmokeLine } from './state';

const MU = -FLOW.EPS;
const A = FLOW.C + FLOW.EPS;

/** 받음각 하나에 묶인 흐름. 원본 `setAoa` 가 갱신하던 ca · sa · Γ/(2π). */
export interface Flow {
  ca: number;
  sa: number;
  gammaTerm: number;
}

export function flowOf(aoaDeg: number): Flow {
  const aoa = (aoaDeg * Math.PI) / 180;
  const ca = Math.cos(aoa);
  const sa = Math.sin(aoa);
  // Γ/(2π), Γ = 4πUa·sinα
  return { ca, sa, gammaTerm: 2 * FLOW.U * A * sa };
}

/** 한 점의 흐름. `inside` 면 날개 안 — 속도 0, `dr` · `di` 는 원 평면 중심 기준 자리. */
export interface FlowSample {
  u: number;
  v: number;
  inside: boolean;
  dr: number;
  di: number;
}

export function newSample(): FlowSample {
  return { u: 0, v: 0, inside: false, dr: 0, di: 0 };
}

/** 화면(세계) 좌표 (px, py) 의 흐름을 `out` 에 채운다. 원본 `flowAt`. */
export function flowAt(f: Flow, px: number, py: number, out: FlowSample): FlowSample {
  const { ca, sa, gammaTerm } = f;
  const C = FLOW.C;
  const U = FLOW.U;
  // 화면 → 날개 좌표: z = e^{iα} P
  const zr = px * ca - py * sa;
  const zi = px * sa + py * ca;
  // ζ = (z ± sqrt(z² − 4c²)) / 2
  const qr = zr * zr - zi * zi - 4 * C * C;
  const qi = 2 * zr * zi;
  const mod = Math.hypot(qr, qi);
  const sr = Math.sqrt(Math.max(0, (mod + qr) / 2));
  let si = Math.sqrt(Math.max(0, (mod - qr) / 2));
  if (qi < 0) si = -si;
  const z1r = (zr + sr) / 2;
  const z1i = (zi + si) / 2;
  const z2r = (zr - sr) / 2;
  const z2i = (zi - si) / 2;
  const d1 = Math.hypot(z1r - MU, z1i);
  const d2 = Math.hypot(z2r - MU, z2i);
  let er: number;
  let ei: number;
  let dmod: number;
  if (d1 >= d2) {
    er = z1r; ei = z1i; dmod = d1;
  } else {
    er = z2r; ei = z2i; dmod = d2;
  }
  const dr = er - MU;
  const di = ei;
  out.dr = dr;
  out.di = di;
  if (dmod < A) {
    out.inside = true;
    out.u = 0;
    out.v = 0;
    return out;
  }
  out.inside = false;
  // w_ζ = U(e^{-iα} − a² e^{iα}/d²) + iΓ/(2π d)
  const d2r = dr * dr - di * di;
  const d2i = 2 * dr * di;
  const dd = d2r * d2r + d2i * d2i;
  const t1r = (ca * d2r + sa * d2i) / dd;
  const t1i = (sa * d2r - ca * d2i) / dd;
  const dm2 = dr * dr + di * di;
  const t2r = di / dm2;
  const t2i = dr / dm2;
  const wr = U * (ca - A * A * t1r) + gammaTerm * t2r;
  const wi = U * (-sa - A * A * t1i) + gammaTerm * t2i;
  // dz/dζ = 1 − c²/ζ²
  const e2r = er * er - ei * ei;
  const e2i = 2 * er * ei;
  const ee = e2r * e2r + e2i * e2i;
  const jr = 1 - (C * C * e2r) / ee;
  const ji = (C * C * e2i) / ee;
  const jj = jr * jr + ji * ji;
  const wzr = (wr * jr + wi * ji) / jj;
  const wzi = (wi * jr - wr * ji) / jj;
  let u = wzr;
  let v = -wzi;
  const sp = Math.hypot(u, v);
  const cap = FLOW.speedCap * U;
  // 뒷전 뾰족점 근처의 수치 발산만 막는다
  if (sp > cap) {
    u *= cap / sp;
    v *= cap / sp;
  }
  // 날개 → 화면: e^{-iα}
  out.u = u * ca + v * sa;
  out.v = -u * sa + v * ca;
  return out;
}

/** 날개 안으로 들어간 점을 원 평면에서 둘레 바로 밖으로 밀어낸다. 원본 `pushOut`. */
function pushOut(f: Flow, dr: number, di: number): Vec2 {
  const C = FLOW.C;
  const m = Math.hypot(dr, di) || 1;
  const k = (A * FLOW.pushOut) / m;
  const er = MU + dr * k;
  const ei = di * k;
  const ee = er * er + ei * ei;
  const zr = er + (C * C * er) / ee;
  const zi = ei - (C * C * ei) / ee;
  return [zr * f.ca + zi * f.sa, -zr * f.sa + zi * f.ca];
}

// ------------------------------------------------------------------------
// 날개 윤곽
// ------------------------------------------------------------------------

/** 받음각만큼 앞전이 들린 날개 단면(닫힌 다각형). 원본 `airfoilPath`. */
export function airfoilPoints(aoaDeg: number): Vec2[] {
  const { ca, sa } = flowOf(aoaDeg);
  const C = FLOW.C;
  const pts: Vec2[] = [];
  for (let k = 0; k < AIRFOIL_SAMPLES; k++) {
    const th = (2 * Math.PI * k) / AIRFOIL_SAMPLES;
    const er = MU + A * Math.cos(th);
    const ei = A * Math.sin(th);
    const ee = er * er + ei * ei;
    const zr = er + (C * C * er) / ee;
    const zi = ei - (C * C * ei) / ee;
    pts.push([zr * ca + zi * sa, -zr * sa + zi * ca]);
  }
  return pts;
}

// ------------------------------------------------------------------------
// 압력장
// ------------------------------------------------------------------------

/** 압력장 격자 칸 수. 원본 캔버스를 2 px 마다 한 표본. */
export const FIELD_COLS = Math.ceil(VIEW.widthPx / PRESSURE.samplePx);
export const FIELD_ROWS = Math.ceil(VIEW.heightPx / PRESSURE.samplePx);

/**
 * Cp → 원본 색 한 줄에서의 어둡기(고압 끝 0). 원본 `pressureColor` 의 0.25 계단과 명도 간격을
 * 그대로 따른다. 색으로 바꾸는 것은 렌더러의 일이다.
 */
export function pressureDarkness(cp: number): number {
  const q = Math.round(cp / PRESSURE.band) * PRESSURE.band;
  const L = PRESSURE.lightness;
  const s = q >= 0
    ? L.free + (L.high - L.free) * Math.min(1, q)
    : L.free + (L.low - L.free) * Math.min(1, -q / PRESSURE.lowReach);
  return L.high - s;
}

/** 압력장 칸 값(행 우선, 첫 행이 위). 날개 안은 0(바탕) — 원본은 투명. 날개가 덮는다. 원본 `buildField`. */
export function buildField(aoaDeg: number): number[] {
  const f = flowOf(aoaDeg);
  const o = newSample();
  const H = VIEW.heightPx;
  const FS = PRESSURE.samplePx;
  const values: number[] = new Array(FIELD_COLS * FIELD_ROWS);
  for (let j = 0; j < FIELD_ROWS; j++) {
    const y = (H / 2 - (j + 0.5) * FS) / SCALE;
    for (let i = 0; i < FIELD_COLS; i++) {
      const x = VIEW.xMin + ((i + 0.5) * FS) / SCALE;
      flowAt(f, x, y, o);
      const idx = j * FIELD_COLS + i;
      if (o.inside) {
        values[idx] = 0;
        continue;
      }
      const cp = 1 - (o.u * o.u + o.v * o.v) / (FLOW.U * FLOW.U);
      values[idx] = pressureDarkness(cp);
    }
  }
  return values;
}

// ------------------------------------------------------------------------
// 연기 줄
// ------------------------------------------------------------------------

/** 날개 앞쪽에서 세로 한 줄로 뿌린다. 원본 `release`. */
function releaseLine(id: number): SmokeLine {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let k = 0; k < SMOKE.markers; k++) {
    const s = -1 + (2 * k) / (SMOKE.markers - 1);
    // 가운데(날개 높이)에 표지를 촘촘히 둔다
    xs.push(SMOKE.releaseX);
    ys.push(SMOKE.spread * Y_HALF * Math.sign(s) * Math.pow(Math.abs(s), SMOKE.power));
  }
  return { id, xs, ys, age: 0 };
}

/** 표지 하나를 RK2 로 옮긴다. 날개 안으로 들어가면 밀어낸다. 원본 `advance`. */
function advance(f: Flow, xs: number[], ys: number[], k: number, dt: number, va: FlowSample): void {
  const x0 = xs[k]!;
  const y0 = ys[k]!;
  flowAt(f, x0, y0, va);
  if (va.inside) {
    const p = pushOut(f, va.dr, va.di);
    xs[k] = p[0];
    ys[k] = p[1];
    return;
  }
  const mx = x0 + (va.u * dt) / 2;
  const my = y0 + (va.v * dt) / 2;
  flowAt(f, mx, my, va);
  let nx: number;
  let ny: number;
  if (va.inside) {
    nx = mx; ny = my;
  } else {
    nx = x0 + va.u * dt; ny = y0 + va.v * dt;
  }
  flowAt(f, nx, ny, va);
  if (va.inside) {
    const p = pushOut(f, va.dr, va.di);
    nx = p[0]; ny = p[1];
  }
  xs[k] = nx;
  ys[k] = ny;
}

/** 늘어난 구간에 표지를 넣는다. 원본 `refine`. */
function refine(f: Flow, xs: number[], ys: number[], probe: FlowSample): { xs: number[]; ys: number[] } {
  if (xs.length >= SMOKE.maxMarkers) return { xs, ys };
  const nx: number[] = [xs[0]!];
  const ny: number[] = [ys[0]!];
  for (let k = 1; k < xs.length; k++) {
    const dx = xs[k]! - xs[k - 1]!;
    const dy = ys[k]! - ys[k - 1]!;
    const gap = Math.hypot(dx, dy);
    if (gap > SMOKE.splitGap && gap < SMOKE.refineMaxGap && nx.length + (xs.length - k) < SMOKE.maxMarkers) {
      const mx = xs[k - 1]! + dx / 2;
      const my = ys[k - 1]! + dy / 2;
      if (!flowAt(f, mx, my, probe).inside) {
        nx.push(mx);
        ny.push(my);
      }
    }
    nx.push(xs[k]!);
    ny.push(ys[k]!);
  }
  return { xs: nx, ys: ny };
}

interface FlowWork {
  lines: SmokeLine[];
  releaseClock: number;
  releaseCount: number;
}

/** 고정 걸음 하나. 원본 `simStep`. 새 배열을 만들어 돌려준다. */
function simStep(f: Flow, w: FlowWork, dt: number): FlowWork {
  let releaseClock = w.releaseClock + dt;
  let releaseCount = w.releaseCount;
  const src = w.lines.slice();
  if (releaseClock >= SMOKE.releaseEvery) {
    releaseClock -= SMOKE.releaseEvery;
    src.push(releaseLine(releaseCount));
    releaseCount++;
  }
  const va = newSample();
  const probe = newSample();
  const next: SmokeLine[] = [];
  for (const line of src) {
    const xs = line.xs.slice();
    const ys = line.ys.slice();
    for (let k = 0; k < xs.length; k++) {
      if (xs[k]! > VIEW.xMax + SMOKE.cullPad) continue;
      advance(f, xs, ys, k, dt, va);
    }
    const r = refine(f, xs, ys, probe);
    const age = line.age + dt;
    if (age < SMOKE.maxAge && r.xs.some((x) => x < VIEW.xMax + SMOKE.alivePad)) {
      next.push({ id: line.id, xs: r.xs, ys: r.ys, age });
    }
  }
  return { lines: next, releaseClock, releaseCount };
}

/** 받음각에서 첫 줄 하나를 뿌린 상태. 원본 `resetFlow` 의 미리 진행 전까지. */
export function freshFlow(aoaDeg: number): LiftForceState {
  return {
    aoaDeg,
    flowAoaDeg: aoaDeg,
    lines: [releaseLine(0)],
    releaseClock: 0,
    releaseCount: 1,
    field: buildField(aoaDeg),
    acc: 0,
    flat: aoaDeg === 0,
  };
}

/**
 * 받음각이 바뀌면 연기를 새로 흘리고 원본처럼 7 초를 미리 진행한다 — 이전 받음각의 줄이
 * 남아 캡션과 어긋나지 않게. (엔진 `preroll` 은 마운트 때 한 번뿐이라 여기서 다시 걷는다.)
 */
function rewarm(aoaDeg: number): LiftForceState {
  const s = freshFlow(aoaDeg);
  const f = flowOf(aoaDeg);
  let w: FlowWork = { lines: s.lines.slice(), releaseClock: s.releaseClock, releaseCount: s.releaseCount };
  const n = Math.round(WARM_SECONDS / DT);
  for (let i = 0; i < n; i++) w = simStep(f, w, DT);
  return { ...s, lines: w.lines, releaseClock: w.releaseClock, releaseCount: w.releaseCount };
}

/** 슬라이더 값을 눈금에 붙이고 범위로 자른다. */
function snapAoa(v: number): number {
  const r = Math.round(v);
  return Math.max(AOA.min, Math.min(AOA.max, Number.isFinite(r) ? r : AOA.default));
}

/**
 * 한 걸음. 실시간 dt 는 가변이라 고정 걸음(1/60 초)으로 나눠 걷는다 — 원본 `PieceKit.loop` 과 같다.
 */
export function step(params: { state: LiftForceState; dt: number }): LiftForceState {
  const { dt } = params;
  let state = params.state;
  const aoaDeg = snapAoa(state.aoaDeg);
  if (aoaDeg !== state.flowAoaDeg) state = rewarm(aoaDeg);

  let acc = state.acc + dt;
  let n = 0;
  // 1/60 을 더해 온 부동소수 오차로 한 걸음을 놓치지 않게 아주 작은 여유를 둔다.
  while (acc >= DT - 1e-9 && n < MAX_SUBSTEPS) {
    acc -= DT;
    n++;
  }
  if (n === MAX_SUBSTEPS) acc = Math.min(acc, DT);
  if (n === 0) return { ...state, aoaDeg, acc };

  const f = flowOf(aoaDeg);
  let w: FlowWork = { lines: state.lines.slice(), releaseClock: state.releaseClock, releaseCount: state.releaseCount };
  for (let i = 0; i < n; i++) w = simStep(f, w, DT);
  return {
    ...state,
    aoaDeg,
    lines: w.lines,
    releaseClock: w.releaseClock,
    releaseCount: w.releaseCount,
    acc: Math.max(0, acc),
    flat: aoaDeg === 0,
  };
}

/**
 * 그릴 선으로 자른다. 멀리 벌어진 구간과 날개를 가로지르는 구간은 긋지 않는다 — 원본 `drawLine`
 * 의 펜 들기. 조각마다 끊긴 폴리라인 여러 개가 된다.
 */
export function splitForDrawing(aoaDeg: number, line: SmokeLine): Vec2[][] {
  const f = flowOf(aoaDeg);
  const probe = newSample();
  const out: Vec2[][] = [];
  let cur: Vec2[] = [];
  const { xs, ys } = line;
  for (let k = 0; k < xs.length; k++) {
    if (k > 0) {
      const dx = xs[k]! - xs[k - 1]!;
      const dy = ys[k]! - ys[k - 1]!;
      const far = Math.hypot(dx, dy) > SMOKE.drawBreak;
      const across = !far && flowAt(f, xs[k - 1]! + dx / 2, ys[k - 1]! + dy / 2, probe).inside;
      if (far || across) {
        if (cur.length >= 2) out.push(cur);
        cur = [];
      }
    }
    cur.push([xs[k]!, ys[k]!]);
  }
  if (cur.length >= 2) out.push(cur);
  return out;
}
