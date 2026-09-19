// ========================================================================
// greenhouse-effect — 순수 물리
// ========================================================================
// 지표 1 m² 와 그 위의 한 층 (0 차원 한 층 모형):
//   햇빛      Pin  = S(1−a)/4           — 층을 그대로 지나 지표에 닿는다. 온도와 무관하다
//   지표 나감 Pout = σTs⁴               — 적외선. 층이 그 가운데 ε 만큼 먹는다
//   층        먹은 εσTs⁴ 를 위아래로 반씩 다시 낸다 → 아래로 돌아옴 Pback = (ε/2)σTs⁴
//   지표      C dTs/dt = Pin + Pback − Pout
// 층은 얇아 곧바로 제 평형에 선다고 둔다(층의 열용량 무시). 지표만 움직인다.
// 층이 없으면(Pback = 0) Ts = (Pin/σ)^¼ ≈ 254.6 K, 층이 있으면 Ts = 그 × (2/(2−ε))^¼ ≈ 288.1 K.
//
// 닫힌 식 대신 고정 걸음 RK4 로 푼다 — 걸음이 시각에서 정해지고 상태를 쌓지 않으므로 같은 시각은
// 언제나 같은 값이다. `step` 은 항등이다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  ALBEDO,
  AXIS_MAX,
  AXIS_MIN,
  BAR_SCALE,
  EMISSIVITY,
  HEAT_CAPACITY,
  IR_WAVE_LENGTH,
  RIPPLE_SPEED,
  SIGMA,
  SOLAR_CONSTANT,
  SUN_WAVE_LENGTH,
  TIME_SCALE,
  T_EQ,
  T_START,
  WAVE_AMP,
} from './schema';
import type { GreenhouseEffectState } from './state';

export interface GreenhouseEffectConstants {
  /** 태양 상수 S (W/m²). */
  solarConstant: number;
  /** 반사율 a. */
  albedo: number;
  /** σ (W/m²K⁴). */
  sigma: number;
  /** 층의 적외선 흡수율 ε. */
  emissivity: number;
  /** 지표 면적당 열용량 (J/m²K). */
  heatCapacity: number;
  /** 화면 1 초가 지표의 몇 초인가 (표시 배율). */
  timeScale: number;
  /** 층 없을 때 · 층 넣은 뒤의 지표 온도 글자 정박값(K). */
  tStart: number;
  tEq: number;
  /** 온도 판 세로축 끝(K). */
  axisMin: number;
  axisMax: number;
  /** 1 W/m² 의 막대 높이(월드). */
  barScale: number;
  /** 물결 간격 · 흔들림 폭(월드), 흐르는 빠르기(월드/초) — 표시 배율. */
  sunWaveLength: number;
  irWaveLength: number;
  waveAmp: number;
  rippleSpeed: number;
}

export function readConstants(stage: StageDef): GreenhouseEffectConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    solarConstant: c.solarConstant ?? SOLAR_CONSTANT,
    albedo: c.albedo ?? ALBEDO,
    sigma: c.sigma ?? SIGMA,
    emissivity: c.emissivity ?? EMISSIVITY,
    heatCapacity: c.heatCapacity ?? HEAT_CAPACITY,
    timeScale: c.timeScale ?? TIME_SCALE,
    tStart: c.tStart ?? T_START,
    tEq: c.tEq ?? T_EQ,
    axisMin: c.axisMin ?? AXIS_MIN,
    axisMax: c.axisMax ?? AXIS_MAX,
    barScale: c.barScale ?? BAR_SCALE,
    sunWaveLength: c.sunWaveLength ?? SUN_WAVE_LENGTH,
    irWaveLength: c.irWaveLength ?? IR_WAVE_LENGTH,
    waveAmp: c.waveAmp ?? WAVE_AMP,
    rippleSpeed: c.rippleSpeed ?? RIPPLE_SPEED,
  };
}

/** 햇빛 몫(W/m²) = S(1−a)/4. 층과 무관하게 같다. */
export function absorbedSun(c: GreenhouseEffectConstants): number {
  return (c.solarConstant * (1 - c.albedo)) / 4;
}

/** 지표가 내는 적외선(W/m²) = σTs⁴. */
export function emitted(c: GreenhouseEffectConstants, temp: number): number {
  return c.sigma * temp ** 4;
}

/**
 * 층이 아래로 되돌리는 적외선(W/m²) = layer · (ε/2)σTs⁴. `layer` 는 층이 있는 정도 0~1 —
 * 층이 들어오는 단계의 진행도다.
 */
export function backRadiation(c: GreenhouseEffectConstants, temp: number, layer: number): number {
  return layer * (c.emissivity / 2) * emitted(c, temp);
}

/** 층이 없을 때의 지표 평형 온도(K) — 곡선 출발 · 255 K 눈금의 자리. 글자는 정박값 `tStart`. */
export function bareTemp(c: GreenhouseEffectConstants): number {
  return (absorbedSun(c) / c.sigma) ** 0.25;
}

/** 층이 있을 때의 지표 평형 온도(K) — 288 K 점선의 자리. 글자는 정박값 `tEq`. */
export function layeredTemp(c: GreenhouseEffectConstants): number {
  return bareTemp(c) * (2 / (2 - c.emissivity)) ** 0.25;
}

/** 층이 다 들어온 뒤 화면 1 초당 지표 온도 변화(K/s). */
function rate(c: GreenhouseEffectConstants, pin: number, temp: number): number {
  const net = pin + backRadiation(c, temp, 1) - emitted(c, temp);
  return (net / c.heatCapacity) * c.timeScale;
}

function rk4(c: GreenhouseEffectConstants, pin: number, temp: number, dt: number): number {
  const k1 = rate(c, pin, temp);
  const k2 = rate(c, pin, temp + (dt / 2) * k1);
  const k3 = rate(c, pin, temp + (dt / 2) * k2);
  const k4 = rate(c, pin, temp + dt * k3);
  return temp + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
}

/**
 * 데워지기 시작한 뒤 흐른 화면 시간 `upto` 초까지의 지표 온도 표본 `[s, T]`. 층 없는 평형에서 출발한다.
 *
 * 걸음은 `span / samples` 로 고정이라 `upto` 가 어디든 앞쪽 표본이 같다 — 곡선이 자라며 떨지 않는다.
 * 마지막 표본은 `upto` 까지의 짧은 한 걸음이다.
 */
export function warmPath(
  c: GreenhouseEffectConstants,
  upto: number,
  span: number,
  samples: number,
): [number, number][] {
  const pin = absorbedSun(c);
  const dt = span / samples;
  let temp = bareTemp(c);
  const out: [number, number][] = [[0, temp]];
  const whole = Math.min(samples, Math.floor(upto / dt));
  for (let i = 1; i <= whole; i++) {
    temp = rk4(c, pin, temp, dt);
    out.push([i * dt, temp]);
  }
  const rest = upto - whole * dt;
  if (rest > 0) out.push([upto, rk4(c, pin, temp, rest)]);
  return out;
}

/**
 * 세로로 흐르는 물결 한 줄기의 표본 — x0 에서 좌우로 흔들리며 `yFrom` 에서 `yTo` 로 간다.
 *
 * 위상은 `origin`(물결이 나온 자리)에서 잰 거리와 시계 `t` 의 함수라, 같은 시각은 같은 모양이고
 * 물결이 `yFrom → yTo` 쪽으로 흐른다. 같은 `origin` 을 쓰는 두 토막은 이음매 없이 이어진다.
 */
export function waveLine(
  x0: number,
  yFrom: number,
  yTo: number,
  origin: number,
  waveLength: number,
  amp: number,
  speed: number,
  t: number,
  samplesPerWave: number,
): Vec2[] {
  const dir = yTo >= yFrom ? 1 : -1;
  const len = Math.abs(yTo - yFrom);
  const n = Math.max(2, Math.ceil((len / waveLength) * samplesPerWave) + 1);
  const k = (2 * Math.PI) / waveLength;
  const pts: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const y = yFrom + (dir * len * i) / (n - 1);
    const s = Math.abs(y - origin);
    pts.push([x0 + amp * Math.sin(k * (s - speed * t)), y]);
  }
  return pts;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: GreenhouseEffectState }): GreenhouseEffectState {
  return params.state;
}
