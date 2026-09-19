// ========================================================================
// loudspeaker-and-microphone — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 것이 시간표 시각(주기 안 u)의 함수이고 `step` 은 항등이다.
//
// 두 원천이 있다. 둘 다 진동판 자리(`CONE_RIM_X`)에서 잰 변위다.
//
//   스피커  S(τ) = A · e_s(τ) · sin(ω(τ − τ_speak-ramp))      코일 전류가 만든 진동판 떨림
//   마이크  M(τ) = A · e_m(τ) · sin(ω(τ − τ_listen-ramp))     들어온 소리가 진동판에 주는 떨림
//
// 공기 속 자리 s 의 알갱이 변위는 나가는 파동과 들어오는 파동의 합이다.
//
//   ξ(s, u) = S(u − (s − s_c)/c) + M(u + (s − s_c)/c)
//
// 전류(부호 포함, + 는 위 코일 가닥이 화면 안쪽 ⊗):
//
//   스피커  I ∝ S/A          — 힘 F = BIL 이 진동판을 민다. 공진보다 낮은 진동수(강성이 정하는
//                               구간)로 보고 변위를 힘과 같은 위상에 둔다.
//   마이크  I ∝ −dM/dt/(Aω)  — 유도 전압은 코일의 **속도**에 비례한다(1/4 주기 어긋남). 부호는 렌츠:
//                               오른쪽으로 움직이는 코일에는 그 움직임을 막는 쪽(⊙) 전류가 흐른다.
//
// 두 전류 모두 제 봉우리로 나눈 값(−1~1)이다. 마이크 전류가 스피커 전류보다 훨씬 작다는 것은
// 화면에 두지 않는다 — 기록지는 판마다 새로 시작한다 (NOTES (b)).
//
// 차오름(`speak-ramp` · `listen-ramp`) · 잦아듦(`stop` · `hush`)의 시각은 `tl.start` · `tl.duration` 이 준다 — 모듈 상수로 두지 않는다 (S-piece).
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  AIR_FAR,
  AIR_JITTER,
  AIR_NEAR,
  AMPLITUDE,
  CONE_RIM_X,
  FREQUENCY,
  RECORD_SECONDS,
  SEED,
  SOUND_SPEED,
  TRACE_HEIGHT,
} from './schema';
import type { LoudspeakerAndMicrophoneState } from './state';

/** 공기 알갱이 격자 간격(월드) — 가로 · 세로. */
const AIR_DX = 0.2;
const AIR_DY = 0.3;
/** 공기 알갱이가 차 있는 세로 반 폭(월드) — 진동판 가장자리 높이 안쪽. */
const AIR_HALF_HEIGHT = 1.62;
/** 기록지 한 폭의 표본 수. */
export const RECORD_SAMPLES = 200;
/** 마이크 전류(속도)를 얻는 중앙 차분 간격(초). */
const DERIV_H = 1e-3;

export interface LoudspeakerAndMicrophoneConstants {
  frequency: number;
  amplitude: number;
  soundSpeed: number;
  recordSeconds: number;
  traceHeight: number;
  seed: number;
  airJitter: number;
}

export function readConstants(stage: StageDef): LoudspeakerAndMicrophoneConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    frequency: c.frequency ?? FREQUENCY,
    amplitude: c.amplitude ?? AMPLITUDE,
    soundSpeed: c.soundSpeed ?? SOUND_SPEED,
    recordSeconds: c.recordSeconds ?? RECORD_SECONDS,
    traceHeight: c.traceHeight ?? TRACE_HEIGHT,
    seed: c.seed ?? SEED,
    airJitter: c.airJitter ?? AIR_JITTER,
  };
}

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

/** 단계 `id` 동안 0 → 1 로 차오르는 몫 — 임의 시각 τ 에서 잰다(파동은 지난 시각의 값을 싣는다). */
function riseAt(tau: number, id: string, tl: TimelineFrame): number {
  const d = tl.duration(id);
  return clamp01(d > 0 ? (tau - tl.start(id)) / d : tau >= tl.start(id) ? 1 : 0);
}

/** 단계 `id` 동안 1 → 0 으로 잦아드는 몫 — 임의 시각 τ 에서 잰다(파동은 지난 시각의 값을 싣는다). */
function dieAway(tau: number, id: string, tl: TimelineFrame): number {
  const d = tl.duration(id);
  return 1 - clamp01(d > 0 ? (tau - tl.start(id)) / d : tau >= tl.start(id) ? 1 : 0);
}

/** 스피커 원천 — 진동판 자리 변위(월드). */
export function speakerSource(tau: number, tl: TimelineFrame, c: LoudspeakerAndMicrophoneConstants): number {
  const t0 = tl.start('speak-ramp');
  const env = riseAt(tau, 'speak-ramp', tl) * dieAway(tau, 'stop', tl);
  if (env <= 0) return 0;
  return c.amplitude * env * Math.sin(2 * Math.PI * c.frequency * (tau - t0));
}

/** 마이크 원천 — 들어온 소리가 진동판 자리에 주는 변위(월드). */
export function microphoneSource(tau: number, tl: TimelineFrame, c: LoudspeakerAndMicrophoneConstants): number {
  const t0 = tl.start('listen-ramp');
  const env = riseAt(tau, 'listen-ramp', tl) * dieAway(tau, 'hush', tl);
  if (env <= 0) return 0;
  return c.amplitude * env * Math.sin(2 * Math.PI * c.frequency * (tau - t0));
}

/** 공기 자리 s(월드, 쉬는 자리)의 알갱이 가로 변위. */
export function airDisplacement(s: number, u: number, tl: TimelineFrame, c: LoudspeakerAndMicrophoneConstants): number {
  const lag = (s - CONE_RIM_X) / c.soundSpeed;
  return speakerSource(u - lag, tl, c) + microphoneSource(u + lag, tl, c);
}

/** 진동판 변위(월드, + 는 공기 쪽). */
export function coneDisplacement(u: number, tl: TimelineFrame, c: LoudspeakerAndMicrophoneConstants): number {
  return speakerSource(u, tl, c) + microphoneSource(u, tl, c);
}

/** 코일 전류(제 봉우리로 나눈 값 −1~1). + 는 위 가닥 ⊗ — 진동판을 공기 쪽으로 미는 쪽. */
export function coilCurrent(u: number, tl: TimelineFrame, c: LoudspeakerAndMicrophoneConstants): number {
  const a = c.amplitude > 0 ? c.amplitude : 1;
  const omega = 2 * Math.PI * c.frequency;
  const drive = speakerSource(u, tl, c) / a;
  const velocity = (microphoneSource(u + DERIV_H, tl, c) - microphoneSource(u - DERIV_H, tl, c)) / (2 * DERIV_H);
  const induced = omega > 0 ? -velocity / (a * omega) : 0;
  return drive + induced;
}

export interface RecordSample {
  /** 기록지 오른쪽 끝(펜)에서 거슬러 간 몫 0~1. 0 이 지금. */
  age: number;
  /** 전류(−1~1) · 진동판 변위(−1~1, 진폭으로 나눔). */
  current: number;
  displacement: number;
}

export interface Reading {
  /** 마이크 판인가(들어오는 소리 단계부터). */
  microphone: boolean;
  /** 진동판 변위(월드). */
  cone: number;
  /** 코일 전류(−1~1). */
  current: number;
  /** 지금 판의 기록 — 판이 시작한 시각부터 기록창만큼. */
  record: RecordSample[];
  /** 떠오르고 물러나는 정도. */
  opacity: number;
  /** 스피커 판 것(기록지 · 이름 · 흐름 화살표)의 짙기 — 조용한 단계 동안 물러난다. */
  speakerOpacity: number;
  /** 마이크 판 것의 짙기 — 들어오는 단계 동안 떠오른다. */
  microphoneOpacity: number;
}

/** 시간표 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다. */
export function derive(tl: TimelineFrame, c: LoudspeakerAndMicrophoneConstants): Reading {
  const u = tl.u;
  const microphone = u >= tl.start('arrive');
  const recStart = microphone ? tl.start('arrive') : 0;
  const a = c.amplitude > 0 ? c.amplitude : 1;
  const record: RecordSample[] = [];
  const w = c.recordSeconds > 0 ? c.recordSeconds : 1;
  for (let i = 0; i <= RECORD_SAMPLES; i++) {
    const age = i / RECORD_SAMPLES;
    const tt = u - age * w;
    if (tt < recStart) break;
    record.push({
      age,
      current: coilCurrent(tt, tl, c),
      displacement: coneDisplacement(tt, tl, c) / a,
    });
  }
  return {
    microphone,
    cone: coneDisplacement(u, tl, c),
    current: coilCurrent(u, tl, c),
    record,
    opacity: tl.at('appear') * (1 - tl.at('fade')),
    speakerOpacity: 1 - tl.at('quiet'),
    microphoneOpacity: tl.at('arrive'),
  };
}

/** 시드 결정적 난수 — mulberry32. 같은 시드는 언제나 같은 수열이다. */
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

/** 공기 알갱이의 쉬는 자리 — 격자에서 시드로 조금씩 흩는다. 시각과 무관하다. */
export function airRestPositions(c: LoudspeakerAndMicrophoneConstants): Vec2[] {
  const rand = mulberry32(c.seed);
  const jitter = Math.max(0, Math.min(0.5, c.airJitter));
  const out: Vec2[] = [];
  const cols = Math.floor((AIR_FAR - AIR_NEAR) / AIR_DX) + 1;
  const rows = Math.floor((2 * AIR_HALF_HEIGHT) / AIR_DY) + 1;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = AIR_NEAR + i * AIR_DX + (rand() * 2 - 1) * jitter * AIR_DX;
      const y = -AIR_HALF_HEIGHT + j * AIR_DY + (rand() * 2 - 1) * jitter * AIR_DY;
      out.push([Math.min(AIR_FAR, Math.max(AIR_NEAR, x)), y]);
    }
  }
  return out;
}

export function step(params: { state: LoudspeakerAndMicrophoneState }): LoudspeakerAndMicrophoneState {
  return params.state;
}
