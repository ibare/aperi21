// ========================================================================
// resonance — 순수 물리
// ========================================================================
// 원본 index.html 의 `stepPhysics` · `pushRow` 를 그대로 옮겼다. 반암시적 오일러를
// 한 걸음(1/60 초)에 8 번 잘게 나눠 돈다.
// ========================================================================

import { A_REF, DRIVE, DT, HISTORY, MAX_SUBSTEPS, OSC, naturalHz } from './schema';
import type { ResonanceState } from './state';

/** 진동자 i 의 각진동수. */
export function omegaOf(i: number): number {
  return 2 * Math.PI * naturalHz(i);
}

/** 슬라이더 값(Hz) → 가장 가까운 진동자 번호. 조작 범위 밖은 끝으로 자른다. */
export function driveIndex(driveHz: number): number {
  const i = Math.round((driveHz - OSC.f0) / OSC.df);
  return Math.max(DRIVE.minIdx, Math.min(DRIVE.maxIdx, Number.isFinite(i) ? i : DRIVE.defaultIdx));
}

/** 진동자 i 의 순간 진폭 sqrt(z² + (v/ω)²). */
export function amplitudeOf(s: ResonanceState, i: number): number {
  const w = omegaOf(i);
  const z = s.z[i]!;
  const vw = s.v[i]! / w;
  return Math.sqrt(z * z + vw * vw);
}

/** 구동대 변위(원본 px, 아래가 양). 원본 `baseOff = −B cos φ`. */
export function baseOffset(s: ResonanceState): number {
  return -OSC.drive * Math.cos(s.phase);
}

interface Work {
  z: number[];
  v: number[];
  phase: number;
  frames: number;
  history: readonly number[];
}

/** 고정 걸음 하나. 원본 `stepPhysics(dt)`. */
function stepOnce(w: Work, idx: number, dt: number): void {
  const Om = omegaOf(idx);
  const h = dt / OSC.substeps;
  const g2 = 2 * OSC.gamma;
  for (let s = 0; s < OSC.substeps; s++) {
    const force = Om * Om * OSC.drive * Math.cos(w.phase);
    for (let i = 0; i < OSC.count; i++) {
      const om = omegaOf(i);
      w.v[i] = w.v[i]! + (force - g2 * w.v[i]! - om * om * w.z[i]!) * h;
      w.z[i] = w.z[i]! + w.v[i]! * h;
    }
    w.phase += Om * h;
  }
  w.frames++;
  if (w.frames % HISTORY.rowEvery === 0) w.history = pushRow(w);
}

/** 기존 줄을 한 칸 아래로 밀고 맨 위에 지금 진폭을 쓴다. 원본 `pushRow`. */
function pushRow(w: Work): number[] {
  const n = OSC.count;
  const next = new Array<number>(n * HISTORY.rows);
  for (let i = 0; i < n; i++) {
    const om = omegaOf(i);
    const vw = w.v[i]! / om;
    const amp = Math.sqrt(w.z[i]! * w.z[i]! + vw * vw);
    next[i] = Math.min(1, amp / A_REF);
  }
  for (let k = n; k < n * HISTORY.rows; k++) next[k] = w.history[k - n]!;
  return next;
}

export function step(params: { state: ResonanceState; dt: number }): ResonanceState {
  const { state, dt } = params;
  let acc = state.acc + dt;
  let n = 0;
  // 1/60 을 더해 온 부동소수 오차로 한 걸음을 놓치지 않게 아주 작은 여유를 둔다.
  while (acc >= DT - 1e-9 && n < MAX_SUBSTEPS) {
    acc -= DT;
    n++;
  }
  if (n === MAX_SUBSTEPS) acc = Math.min(acc, DT);
  if (n === 0) return { ...state, acc };

  const idx = driveIndex(state.driveHz);
  const w: Work = {
    z: state.z.slice(),
    v: state.v.slice(),
    phase: state.phase,
    frames: state.frames,
    history: state.history,
  };
  for (let k = 0; k < n; k++) stepOnce(w, idx, DT);
  return { ...state, ...w, acc: Math.max(0, acc) };
}
