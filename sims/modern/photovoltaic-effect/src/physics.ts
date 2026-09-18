// ========================================================================
// photovoltaic-effect — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 모든 것이 (시드, 주기 번호, 주기 안 시각)의 함수이고 `step` 은 항등이다.
//
// 이 조각의 물리는 셋이다.
//
//   흡수     광자 에너지 E 가 띠 간격 Eg 보다 크면 공핍층에서 흡수되어 전자-양공 쌍이 된다.
//            E < Eg 면 흡수되지 않고 막대를 그대로 지나간다
//   가름     공핍층의 전기장(n → p)이 전자(음전하)는 n쪽으로, 양공(양전하)은 p쪽으로 민다
//   쌓임     갈라진 전하가 두 끝에 쌓여 n쪽이 −, p쪽이 + 가 된다 — 두 끝 사이의 전압.
//            쌓일 몫이 다 쌓이면 개방 전압에 서고, 그 뒤 온 운반자는 전극에 닿아 사라진다
//
// 나머지는 배치 계산이다 — 광자가 나는 자리, 운반자가 가는 길, 쌓이는 자리.
// ========================================================================

import { wavelengthToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BAND_GAP_EV,
  BAR_HALF_H,
  DEPLETION_HALF,
  DRIFT_SPEED,
  FLASH_LIFE,
  HALF_LEN,
  LAMBDA_IR_NM,
  LAMBDA_VISIBLE_NM,
  LAMP_Y,
  NEEDLE_SETTLE,
  OPEN_CIRCUIT_VOLTAGE,
  PHOTON_EV_IR,
  PHOTON_EV_VISIBLE,
  PHOTON_SPEED,
  RATE_IR,
  RATE_VISIBLE,
  SEED,
  STACK_CAP,
  WAVE_SCALE,
} from './schema';
import type { PhotovoltaicEffectState } from './state';

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: PhotovoltaicEffectState }): PhotovoltaicEffectState {
  return params.state;
}

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface PhotovoltaicConstants {
  bandGap: number;
  lambdaIr: number;
  lambdaVisible: number;
  photonEvIr: number;
  photonEvVisible: number;
  openCircuitVoltage: number;
  rateIr: number;
  rateVisible: number;
  photonSpeed: number;
  driftSpeed: number;
  waveScale: number;
  depletionHalf: number;
  stackCap: number;
  needleSettle: number;
  flashLife: number;
  seed: number;
}

export function readConstants(stage: StageDef): PhotovoltaicConstants {
  const c = stage.constants ?? {};
  return {
    bandGap: c.bandGap ?? BAND_GAP_EV,
    lambdaIr: c.lambdaIr ?? LAMBDA_IR_NM,
    lambdaVisible: c.lambdaVisible ?? LAMBDA_VISIBLE_NM,
    photonEvIr: c.photonEvIr ?? PHOTON_EV_IR,
    photonEvVisible: c.photonEvVisible ?? PHOTON_EV_VISIBLE,
    openCircuitVoltage: c.openCircuitVoltage ?? OPEN_CIRCUIT_VOLTAGE,
    rateIr: c.rateIr ?? RATE_IR,
    rateVisible: c.rateVisible ?? RATE_VISIBLE,
    photonSpeed: c.photonSpeed ?? PHOTON_SPEED,
    driftSpeed: c.driftSpeed ?? DRIFT_SPEED,
    waveScale: c.waveScale ?? WAVE_SCALE,
    depletionHalf: c.depletionHalf ?? DEPLETION_HALF,
    stackCap: Math.max(1, Math.round(c.stackCap ?? STACK_CAP)),
    needleSettle: c.needleSettle ?? NEEDLE_SETTLE,
    flashLife: c.flashLife ?? FLASH_LIFE,
    seed: Math.round(c.seed ?? SEED),
  };
}

// ------------------------------------------------------------------------
// 단계 → 빛
// ------------------------------------------------------------------------

export type LightKind = 'ir' | 'visible';

/**
 * 광자를 내보내는 단계와 그 단계의 빛. `leadIn` 단계(`switchIn`)는 램프가 바뀌는 동안이라 **그 단계 안에 닿는
 * 광자는 버린다** — 날아가는 초록 광자만 보이고, 쌍은 다음 단계(`pairs`) 캡션 아래서만 생긴다. 시간표 단계에 값을
 * 실을 자리가 없어 (장부 G13)
 * 단계 id 와의 짝을 여기 둔다. 길이 · 순서 · 캡션은 선언(`schema.timeline`)이 정한다.
 */
export const EMISSION: readonly { phase: string; light: LightKind; leadIn?: boolean }[] = [
  { phase: 'irIn', light: 'ir' },
  { phase: 'ir', light: 'ir' },
  { phase: 'switchIn', light: 'visible', leadIn: true },
  { phase: 'pairs', light: 'visible' },
  { phase: 'build', light: 'visible' },
  { phase: 'holdIn', light: 'visible' },
  { phase: 'hold', light: 'visible' },
];

export const lambdaOf = (k: LightKind, c: PhotovoltaicConstants): number =>
  k === 'ir' ? c.lambdaIr : c.lambdaVisible;
export const photonEvOf = (k: LightKind, c: PhotovoltaicConstants): number =>
  k === 'ir' ? c.photonEvIr : c.photonEvVisible;
/** 이 빛의 광자가 쌍을 만드는가 — 광자 에너지가 띠 간격보다 커야 한다. */
export const absorbs = (k: LightKind, c: PhotovoltaicConstants): boolean => photonEvOf(k, c) > c.bandGap;

/** 초록빛의 색(선형광). 적외선은 색을 지어내지 않는다 — 가시광 밖이라 scene 이 먹색으로 긋는다. */
export const visibleRgb = (c: PhotovoltaicConstants): LinearRgb => wavelengthToLinearRgb(c.lambdaVisible);

/** 램프 세기 0~1 — 적외선 · 초록빛. 켜짐과 바뀜은 시간표 단계가 정한다. */
export function lampWeights(tl: TimelineFrame): { ir: number; visible: number } {
  return { ir: tl.at('irIn') * (1 - tl.at('switchOut')), visible: tl.at('switchIn') * (1 - tl.at('fade')) };
}

/** 주기 첫머리에 나타나며 짙어지고, 끝에 옅어진다. */
export const fadeOpacity = (tl: TimelineFrame): number => tl.at('appear') * (1 - tl.at('fade'));

// ------------------------------------------------------------------------
// 결정적 난수 — (시드, 주기, 번호, 갈래)의 함수. 프레임마다 떨지 않는다.
// ------------------------------------------------------------------------

/** 0~1 난수 하나. mulberry32 의 섞기를 정수 네 개에 건다. */
export function hash01(seed: number, cycle: number, index: number, salt: number): number {
  let t =
    (Math.imul(seed | 0, 0x9e3779b1) ^
      Math.imul(cycle | 0, 0x85ebca6b) ^
      Math.imul(index | 0, 0xc2b2ae35) ^
      Math.imul(salt | 0, 0x27d4eb2f)) >>>
    0;
  t = (t + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** 발사 시각을 고른 간격에서 늦추는 폭(한 간격에 대한 비). 규칙적인 박자로 읽히지 않게. */
const EMIT_JITTER = 0.45;
/** 광자가 겨냥하는 자리 — 공핍층 반폭에서 들인 몫 · 막대 반높이에서 들인 몫(비). 가장자리에 붙지 않게. */
const AIM_INSET_X = 0.8;
const AIM_INSET_Y = 0.75;
/** 적외선 광자가 막대 아래로 빠져나가 옅어지는 거리(월드). 전압계에 닿기 전에 사라진다. */
export const IR_EXIT_FADE = 0.85;

// ------------------------------------------------------------------------
// 쌓이는 자리
// ------------------------------------------------------------------------

/** 한 열에 쌓이는 운반자 수 · 열 간격(월드) · 전극에서 첫 열까지(월드). */
const STACK_ROWS = 3;
const STACK_COL_GAP = 0.34;
const STACK_EDGE_GAP = 0.24;
/** 막대 반높이 안에서 쌓이는 줄의 높이 비. */
const STACK_ROW_SPAN = 0.6;

/** k 번째로 쌓이는 자리(n 쪽 기준, x > 0). p 쪽은 x 를 뒤집는다. */
export function stackSlot(k: number): Vec2 {
  const col = Math.floor(k / STACK_ROWS);
  const row = k % STACK_ROWS;
  const y = (row - (STACK_ROWS - 1) / 2) * ((2 * BAR_HALF_H * STACK_ROW_SPAN) / (STACK_ROWS - 1));
  return [HALF_LEN - STACK_EDGE_GAP - col * STACK_COL_GAP, y];
}

// ------------------------------------------------------------------------
// 한 주기의 광자 일정
// ------------------------------------------------------------------------

export interface PhotonEvent {
  light: LightKind;
  /** 램프를 떠난 · 막대 안 겨냥 자리에 닿는 주기 안 시각(초). */
  emit: number;
  hit: number;
  /** 겨냥 자리 — 초록빛이면 쌍이 생기는 자리. */
  at: Vec2;
  /** 쌍 번호 — 초록빛만. */
  pair?: number;
  /** 쌓이는 자리 번호 — 끝에 쌓이는 쌍만. 없으면 넘쳐 온 쌍이라 전극에 닿아 사라진다. */
  slot?: number;
}

export interface Schedule {
  events: PhotonEvent[];
  /** 끝에 쌓이는 쌍 수(`stackCap` 이하). 바늘은 이만큼이 다 도착했을 때 개방 전압에 선다. */
  stacked: number;
}

/** 램프 구멍. */
export const LAMP_AT: Vec2 = [0, LAMP_Y];

/**
 * 이번 주기의 광자 목록. 빛을 내는 단계마다 `rate × 길이` 개를 거의 고르게 내보내고, 공핍층 안
 * 한 자리를 겨냥한다. 주기 번호가 시드에 들어가 주기마다 자리가 다르지만 같은 시각은 언제나 같은 화면이다.
 *
 * 끝에 쌓이는 쌍은 쌍 순서대로 최대 `stackCap` 개인데, **`build` 단계가 끝나기 전에 두 운반자가 다 도착해
 * 바늘이 옮겨 가기를 마치는 쌍만** 쌓인다. 그래야 겨냥 자리 · 발사 시각이 주기마다 달라도 바늘이 `build` 안에서
 * 다 오르고, 「전압이 유지된다」(`holdIn` · `hold`) 동안 더 움직이지 않는다 (NOTES (c) G129).
 */
export function schedule(tl: TimelineFrame, c: PhotovoltaicConstants): Schedule {
  const out: PhotonEvent[] = [];
  let n = 0;
  let pair = 0;
  for (const e of EMISSION) {
    const rate = e.light === 'ir' ? c.rateIr : c.rateVisible;
    const t0 = tl.start(e.phase);
    const count = Math.floor(tl.duration(e.phase) * rate + 1e-9);
    for (let k = 0; k < count; k++, n++) {
      const emit = t0 + (k + EMIT_JITTER * hash01(c.seed, tl.cycle, n, 1)) / rate;
      const x = c.depletionHalf * AIM_INSET_X * (2 * hash01(c.seed, tl.cycle, n, 2) - 1);
      const y = BAR_HALF_H * AIM_INSET_Y * (2 * hash01(c.seed, tl.cycle, n, 3) - 1);
      const at: Vec2 = [x, y];
      const hit = emit + dist(LAMP_AT, at) / c.photonSpeed;
      if (e.leadIn && hit < tl.end(e.phase)) continue;
      const ev: PhotonEvent = { light: e.light, emit, hit, at };
      if (absorbs(e.light, c)) ev.pair = pair++;
      out.push(ev);
    }
  }
  const deadline = tl.end('build');
  let stacked = 0;
  for (const ev of out) {
    if (ev.pair === undefined || stacked >= c.stackCap) continue;
    const slot = stackSlot(stacked);
    const reach = Math.max(dist(ev.at, slot), dist(ev.at, [-slot[0], slot[1]]));
    if (ev.hit + reach / c.driftSpeed + c.needleSettle <= deadline) ev.slot = stacked++;
  }
  return { events: out, stacked };
}

const dist = (a: Vec2, b: Vec2): number => Math.hypot(b[0] - a[0], b[1] - a[1]);
const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

// ------------------------------------------------------------------------
// 지금 화면
// ------------------------------------------------------------------------

export interface FlyingPhoton {
  light: LightKind;
  pos: Vec2;
  /** 나는 방향(단위). */
  dir: Vec2;
  /** 0~1. 적외선이 막대 아래로 빠져나가며 옅어진다. */
  alpha: number;
  /** 램프를 떠나 날아온 거리(월드). 물결 뭉치가 램프 뒤로 삐져나오지 않게 뭉치 길이를 여기서 자른다. */
  travelled: number;
}

export interface Carrier {
  pos: Vec2;
  /** 0~1. 넘쳐 온 운반자가 전극에 닿으며 옅어진다. */
  weight: number;
  /** 움직이는 중이면 가는 방향(단위) · 없으면 멈춰 쌓인 것. */
  dir?: Vec2;
}

export interface Flash {
  pos: Vec2;
  /** 쌍이 생긴 뒤 흐른 시간(초). */
  age: number;
}

export interface Snapshot {
  photons: FlyingPhoton[];
  electrons: Carrier[];
  holes: Carrier[];
  flashes: Flash[];
  /** 끝에 쌓인 정도 0~1 — 바늘 · 전극 극성의 짙기. 1 이면 개방 전압. */
  charge: number;
}

/** 넘쳐 온 운반자가 전극 앞에서 옅어지는 구간(월드). */
const CONTACT_FADE = 0.35;

/**
 * 한 운반자가 `from` 에서 `to` 로 표류한 자리. 도착하면 멈춘다(쌓임) 또는 사라진다(넘침).
 * 돌려주는 `arrive` 는 도착 시각이다.
 */
function drift(
  from: Vec2,
  to: Vec2,
  t0: number,
  u: number,
  c: PhotovoltaicConstants,
): { pos: Vec2; moving: boolean; dir: Vec2; arrive: number } {
  const d = dist(from, to);
  const dir: Vec2 = d > 0 ? [(to[0] - from[0]) / d, (to[1] - from[1]) / d] : [0, 0];
  const arrive = t0 + d / c.driftSpeed;
  const s = Math.min(d, Math.max(0, (u - t0) * c.driftSpeed));
  return { pos: [from[0] + dir[0] * s, from[1] + dir[1] * s], moving: u < arrive, dir, arrive };
}

/**
 * 주기 안 시각 `u` 의 광자 · 운반자 · 쌍 표지 · 쌓인 정도.
 *
 * 초록빛 광자는 겨냥 자리에서 흡수되어 쌍이 된다. 쌓이는 쌍(`slot`)의 전자는 n쪽 끝의 쌓이는 자리로,
 * 양공은 p쪽 끝으로 가서 멈춘다. 넘쳐 온 쌍은 같은 높이로 전극까지 가서 사라진다.
 * 적외선 광자는 흡수되지 않고 같은 방향으로 막대를 지나 아래로 빠져나가며 옅어진다.
 */
export function snapshot(plan: Schedule, u: number, c: PhotovoltaicConstants): Snapshot {
  const { events, stacked: full } = plan;
  const photons: FlyingPhoton[] = [];
  const electrons: Carrier[] = [];
  const holes: Carrier[] = [];
  const flashes: Flash[] = [];
  let charge = 0;
  const exitY = -BAR_HALF_H - IR_EXIT_FADE;

  for (const e of events) {
    if (u < e.emit) continue;
    const d = dist(LAMP_AT, e.at);
    const dir: Vec2 = [(e.at[0] - LAMP_AT[0]) / d, (e.at[1] - LAMP_AT[1]) / d];
    const s = (u - e.emit) * c.photonSpeed;

    if (e.pair === undefined) {
      // 흡수되지 않는다 — 같은 방향으로 지나가 막대 아래에서 옅어진다.
      const pos: Vec2 = [LAMP_AT[0] + dir[0] * s, LAMP_AT[1] + dir[1] * s];
      const alpha = clamp01((pos[1] - exitY) / IR_EXIT_FADE);
      if (alpha > 0) photons.push({ light: e.light, pos, dir, alpha, travelled: s });
      continue;
    }

    if (u < e.hit) {
      photons.push({ light: e.light, pos: [LAMP_AT[0] + dir[0] * s, LAMP_AT[1] + dir[1] * s], dir, alpha: 1, travelled: s });
      continue;
    }

    // 쌍이 생겼다.
    const age = u - e.hit;
    if (age < c.flashLife) flashes.push({ pos: e.at, age });
    const stacked = e.slot !== undefined;
    const slot = stackSlot(e.slot ?? 0);
    const eTo: Vec2 = stacked ? slot : [HALF_LEN, e.at[1]];
    const hTo: Vec2 = stacked ? [-slot[0], slot[1]] : [-HALF_LEN, e.at[1]];
    for (const [to, list] of [
      [eTo, electrons],
      [hTo, holes],
    ] as const) {
      const m = drift(e.at, to, e.hit, u, c);
      if (stacked) {
        charge += clamp01((u - m.arrive) / c.needleSettle) / (2 * Math.max(1, full));
        list.push(m.moving ? { pos: m.pos, weight: 1, dir: m.dir } : { pos: m.pos, weight: 1 });
      } else if (m.moving) {
        const w = clamp01((HALF_LEN - Math.abs(m.pos[0])) / CONTACT_FADE);
        if (w > 0) list.push({ pos: m.pos, weight: w, dir: m.dir });
      }
    }
  }

  return { photons, electrons, holes, flashes, charge: Math.min(1, charge) };
}
