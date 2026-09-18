// ========================================================================
// wave-vs-particle-transport — 순수 물리
// ========================================================================
// 오른쪽으로 가는 가우스 펄스 하나.
//   p(x, τ) = A · exp(−(x − x_c(τ))² / (2 σ²)),   x_c(τ) = x_0 + v τ
// τ 는 이번 주기 `travel` 시작부터 흐른 시간이다. 줄 위 한 자리 x 는 세로로만 움직이고
// (가로 자리는 늘 x), 펄스가 지나가면 높이가 0 으로 돌아온다 — 그 조각은 제자리다.
//
// 줄 끝의 추는 용수철에 매달려 있고 줄 끝에 매여 있다. 줄 끝이 끌어 올리는 만큼 추가
// 따라가는 감쇠 진동자로 둔다.
//   y'' = ω₀² (p(x_끝, τ) − y) − 2γ y'
// 펄스가 지나간 뒤에도 추는 받은 에너지로 몇 번 오르내리다 잦아든다. 이 적분은 매 프레임
// 처음부터 다시 한다 — 같은 시각은 언제나 같은 화면이다 (쌓는 상태가 없다).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';

import {
  AMPLITUDE,
  PULSE_LAUNCH_X,
  PULSE_WIDTH,
  RECEIVER_DAMPING,
  RECEIVER_PERIOD,
  ROPE_END,
  WAVE_SPEED,
} from './schema';
import type { WaveVsParticleTransportState } from './state';

/** 추 적분의 고정 걸음(s). 상태로 계산하지 않는다. */
const RECEIVER_DT = 1 / 240;
/** 추 높이에 겹쳐 더하는 펄스 수(이번 주기 + 앞 주기들). 셋째 앞 주기의 몫은 1 mm 안팎이다. */
const RECEIVER_CYCLES = 3;

export interface WaveVsParticleTransportConstants {
  /** 펄스 높이 A(m). */
  amplitude: number;
  /** 펄스 폭 σ(m). */
  pulseWidth: number;
  /** 파속 v(m/s). */
  waveSpeed: number;
  /** 끝 추의 고유 주기(s). */
  receiverPeriod: number;
  /** 끝 추의 감쇠율 γ(1/s). */
  receiverDamping: number;
  /** 줄의 오른쪽 끝 · 추에 매인 자리 x(m). */
  ropeEnd: number;
  /** 펄스가 출발하는 중심 자리 x(m). */
  launchX: number;
}

export function readConstants(stage: StageDef): WaveVsParticleTransportConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    amplitude: c.amplitude ?? AMPLITUDE,
    pulseWidth: c.pulseWidth ?? PULSE_WIDTH,
    waveSpeed: c.waveSpeed ?? WAVE_SPEED,
    receiverPeriod: c.receiverPeriod ?? RECEIVER_PERIOD,
    receiverDamping: c.receiverDamping ?? RECEIVER_DAMPING,
    ropeEnd: c.ropeEnd ?? ROPE_END,
    launchX: c.launchX ?? PULSE_LAUNCH_X,
  };
}

/** 이번 주기 `travel` 이 시작한 뒤 흐른 시간(s). 단계 시작 자리는 시간표에게 묻는다. */
export function sinceLaunch(tl: TimelineFrame): number {
  return Math.max(0, tl.u - tl.start('travel'));
}

/** τ 초에 펄스 중심의 x(m). */
export function pulseCenter(tau: number, c: WaveVsParticleTransportConstants): number {
  return c.launchX + c.waveSpeed * tau;
}

/** τ 초에 줄 위 x 자리의 펄스 높이(m). 가로 자리는 x 그대로다. */
export function pulseHeight(x: number, tau: number, c: WaveVsParticleTransportConstants): number {
  const d = x - pulseCenter(tau, c);
  return c.amplitude * Math.exp(-(d * d) / (2 * c.pulseWidth * c.pulseWidth));
}

/**
 * τ 초에 끝 추의 평형에서 잰 높이(m).
 *
 * 펄스 하나에 대한 응답 r(τ) 는 멈춰 있던 추를 줄 끝이 끌어 올리는 감쇠 진동자를 τ = 0 부터
 * 고정 걸음으로 적분한 것이다. 추는 선형계라 주기마다 들어오는 펄스의 응답이 그대로 겹친다 —
 * 지금 높이 = r(τ) + r(τ + P) + r(τ + 2P) … (P 는 시간표 한 주기). 앞 주기들의 잔흔들림까지 더해야
 * 주기가 넘어가는 순간 추가 튀지 않는다.
 */
export function receiverHeight(
  tau: number,
  cyclePeriod: number,
  c: WaveVsParticleTransportConstants,
): number {
  const omega = (2 * Math.PI) / c.receiverPeriod;
  const k = omega * omega;
  // 겹칠 표본 시각 — 오름차순이다.
  const samples: number[] = [];
  for (let n = 0; n < RECEIVER_CYCLES; n++) samples.push(tau + n * cyclePeriod);
  const steps = Math.floor(samples[samples.length - 1]! / RECEIVER_DT);
  let y = 0;
  let vy = 0;
  let sum = 0;
  let next = 0;
  for (let i = 0; i <= steps && next < samples.length; i++) {
    while (next < samples.length && samples[next]! < (i + 1) * RECEIVER_DT) {
      sum += y;
      next++;
    }
    const p = pulseHeight(c.ropeEnd, i * RECEIVER_DT, c);
    const a = k * (p - y) - 2 * c.receiverDamping * vy;
    vy += a * RECEIVER_DT;
    y += vy * RECEIVER_DT;
  }
  return sum;
}

/** 쌓는 상태가 없다. */
export function step(params: { state: WaveVsParticleTransportState }): WaveVsParticleTransportState {
  return params.state;
}
