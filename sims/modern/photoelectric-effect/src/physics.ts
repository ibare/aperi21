// ========================================================================
// photoelectric-effect — 순수 계산
// ========================================================================
// 광자 하나는 전자 하나에게 제 에너지 E 를 통째로 준다. 전자가 표면을 빠져나오려면 일함수
// W 만큼이 든다.
//
//   E < W — 전자는 튀어 오르다 표면에 못 미치고 되돌아간다. 광자가 몇 개가 와도 같다.
//   E > W — 전자는 표면을 넘고, 남은 E − W 를 운동 에너지로 들고 날아간다.
//
// 일함수를 「표면까지의 높이」 로 보인다: 깊이 D 에 있는 전자를 가상의 끌림 g 가 되끌어
// 당기면, E 를 받은 전자는 D · E / W 만큼 오른다. 표면에 닿는 빠르기는 √(2gD(E−W)/W) 라서
// 튀어나간 전자의 빠르기가 E − W 만 따른다 — 세기와 무관하다.
//
// 모든 것이 (시드, 주기 번호, 주기 안 시각)의 함수다. 쌓는 상태가 없다.
// ========================================================================

import { wavelengthToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BARRIER_PULL,
  BEAM_SITES,
  EJECT_TILT,
  ELECTRON_DEPTH,
  LAMBDA_RED_NM,
  LAMBDA_VIOLET_NM,
  LAMP,
  PHOTON_EV_RED,
  PHOTON_EV_VIOLET,
  PHOTON_SPEED,
  RATE_BRIGHT,
  RATE_DIM,
  REFILL_SECONDS,
  SEED,
  SITE_COUNT,
  SITE_GAP,
  WAVE_SCALE,
  WORK_FUNCTION_EV,
} from './schema';
import type { PhotoelectricEffectState } from './state';

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface PhotoelectricConstants {
  /** 일함수(eV). */
  workFunction: number;
  /** 빨간빛 · 보랏빛 파장(nm). */
  lambdaRed: number;
  lambdaViolet: number;
  /** 광자 하나의 에너지(eV) — 화면에 띄우는 정박값. */
  photonEvRed: number;
  photonEvViolet: number;
  /** 광자 수(개/초) — 약하게 · 세게. */
  rateDim: number;
  rateBright: number;
  /** 광자가 나는 빠르기(월드/초). */
  photonSpeed: number;
  /** 물결 간격 배율(월드/nm). */
  waveScale: number;
  /** 표면 쪽으로 되끌어 당기는 가상의 끌림(월드/초²). */
  barrierPull: number;
  /** 빈자리가 다시 채워지기까지(초). */
  refillSeconds: number;
  /** 일정 · 겨냥 시드. */
  seed: number;
}

export function readConstants(stage: StageDef): PhotoelectricConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    workFunction: c.workFunction ?? WORK_FUNCTION_EV,
    lambdaRed: c.lambdaRed ?? LAMBDA_RED_NM,
    lambdaViolet: c.lambdaViolet ?? LAMBDA_VIOLET_NM,
    photonEvRed: c.photonEvRed ?? PHOTON_EV_RED,
    photonEvViolet: c.photonEvViolet ?? PHOTON_EV_VIOLET,
    rateDim: c.rateDim ?? RATE_DIM,
    rateBright: c.rateBright ?? RATE_BRIGHT,
    photonSpeed: c.photonSpeed ?? PHOTON_SPEED,
    waveScale: c.waveScale ?? WAVE_SCALE,
    barrierPull: c.barrierPull ?? BARRIER_PULL,
    refillSeconds: c.refillSeconds ?? REFILL_SECONDS,
    seed: c.seed ?? SEED,
  };
}

// ------------------------------------------------------------------------
// 단계 → 빛
// ------------------------------------------------------------------------

export type LightKind = 'red' | 'violet';
export type Level = 'dim' | 'bright';

/**
 * 광자를 내보내는 단계와 그 단계의 빛 색 · 세기. 시간표 단계에 값을 실을 자리가 없어
 * (장부 G13) 단계 id 와의 짝을 여기 둔다. 길이 · 순서 · 캡션은 선언(`schema.timeline`)이 정한다.
 */
export const EMISSION: readonly { phase: string; light: LightKind; level: Level }[] = [
  { phase: 'red-dim', light: 'red', level: 'dim' },
  { phase: 'red-bright', light: 'red', level: 'bright' },
  { phase: 'violet-dim', light: 'violet', level: 'dim' },
  { phase: 'violet-bright', light: 'violet', level: 'bright' },
];

/** 지금 램프가 내는 빛. 내보내는 단계가 아니면(흐려짐) 마지막 단계의 빛을 그대로 쥔다. */
export function lampNow(tl: TimelineFrame): { light: LightKind; level: Level } {
  const hit = EMISSION.find((e) => e.phase === tl.phase);
  const last = EMISSION[EMISSION.length - 1]!;
  return hit ?? { light: last.light, level: last.level };
}

export const lambdaOf = (k: LightKind, c: PhotoelectricConstants): number =>
  k === 'red' ? c.lambdaRed : c.lambdaViolet;
export const photonEvOf = (k: LightKind, c: PhotoelectricConstants): number =>
  k === 'red' ? c.photonEvRed : c.photonEvViolet;

/** 파장의 빛 색(선형광). 가시광 밖이면 검정이 되므로 파장은 가시광 안에 둔다. */
export const lightOf = (k: LightKind, c: PhotoelectricConstants): LinearRgb =>
  wavelengthToLinearRgb(lambdaOf(k, c));

// ------------------------------------------------------------------------
// 결정적 난수 — (시드, 주기, 번호, 갈래)의 함수. 프레임마다 떨지 않는다.
// ------------------------------------------------------------------------

/** 0~1 난수 하나. mulberry32 의 섞기를 정수 네 개에 건다. */
export function hash01(seed: number, cycle: number, index: number, salt: number): number {
  let t = (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(cycle | 0, 0x85ebca6b) ^ Math.imul(index | 0, 0xc2b2ae35) ^ Math.imul(salt | 0, 0x27d4eb2f)) >>> 0;
  t = (t + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** 발사 시각의 흔들림 — 고른 간격에서 한 간격의 이만큼까지 앞뒤로. 규칙적인 박자로 읽히지 않게. */
const EMIT_JITTER = 0.8;

// ------------------------------------------------------------------------
// 자리
// ------------------------------------------------------------------------

/** 전자 자리 i 의 x. 자리들은 금속판 가운데를 중심으로 고르게 놓인다. */
export const siteX = (i: number): number => (i - (SITE_COUNT - 1) / 2) * SITE_GAP;
/** 전자가 쉬는 높이. */
export const SITE_Y = -ELECTRON_DEPTH;

const lampToSite = (i: number): number => Math.hypot(siteX(i) - LAMP.x, SITE_Y - LAMP.y);

// ------------------------------------------------------------------------
// 한 주기의 광자 일정
// ------------------------------------------------------------------------

export interface PhotonEvent {
  light: LightKind;
  /** 램프를 떠난 · 전자에 닿는 주기 안 시각(초). */
  emit: number;
  hit: number;
  /** 겨냥한 전자 자리. */
  site: number;
  /** 광자 에너지(eV). */
  ev: number;
  /** 튀어나간다면 기우는 각(연직에서, 라디안). */
  tilt: number;
}

/** 전자 하나가 광자를 받은 뒤의 운동 길이. 튀어 오름이면 되돌아올 때까지, 튀어나감이면 빈자리가 채워질 때까지. */
function busyFor(ev: number, c: PhotoelectricConstants): number {
  if (ev < c.workFunction) {
    const v0 = Math.sqrt((2 * c.barrierPull * ELECTRON_DEPTH * ev) / c.workFunction);
    return (2 * v0) / c.barrierPull;
  }
  return c.refillSeconds;
}

/**
 * 이번 주기의 광자 목록. 단계마다 `rate × 길이` 개를 거의 고르게 내보내고, 쉬고 있는 전자 중
 * 하나를 겨냥한다 — 광자 하나 · 전자 하나. 쉬는 전자가 없으면 가장 먼저 쉬게 될 전자를 겨냥한다.
 * 주기 번호가 시드에 들어가 주기마다 다른 일정이지만 같은 시각은 언제나 같은 화면이다.
 */
export function schedule(tl: TimelineFrame, c: PhotoelectricConstants): PhotonEvent[] {
  const events: PhotonEvent[] = [];
  const free = new Array<number>(SITE_COUNT).fill(-Infinity);
  let n = 0;
  for (const e of EMISSION) {
    const rate = e.level === 'dim' ? c.rateDim : c.rateBright;
    const t0 = tl.start(e.phase);
    const count = Math.floor(tl.duration(e.phase) * rate);
    const ev = photonEvOf(e.light, c);
    for (let k = 0; k < count; k++, n++) {
      const emit = t0 + (k + 0.5 + EMIT_JITTER * (hash01(c.seed, tl.cycle, n, 1) - 0.5)) / rate;
      const candidates: number[] = [];
      for (let i = BEAM_SITES.first; i <= BEAM_SITES.last; i++) {
        if (free[i]! <= emit + lampToSite(i) / c.photonSpeed) candidates.push(i);
      }
      let site: number;
      if (candidates.length > 0) {
        site = candidates[Math.floor(hash01(c.seed, tl.cycle, n, 2) * candidates.length)]!;
      } else {
        site = BEAM_SITES.first;
        for (let i = BEAM_SITES.first; i <= BEAM_SITES.last; i++) if (free[i]! < free[site]!) site = i;
      }
      const hit = emit + lampToSite(site) / c.photonSpeed;
      free[site] = hit + busyFor(ev, c);
      const tilt = EJECT_TILT.min + (EJECT_TILT.max - EJECT_TILT.min) * hash01(c.seed, tl.cycle, n, 3);
      events.push({ light: e.light, emit, hit, site, ev, tilt });
    }
  }
  return events;
}

// ------------------------------------------------------------------------
// 지금 화면 — 광자 · 전자
// ------------------------------------------------------------------------

export interface FlyingPhoton {
  light: LightKind;
  pos: Vec2;
  /** 나는 방향(단위). */
  dir: Vec2;
}

export interface BoundElectron {
  pos: Vec2;
  /** 빈자리가 다시 채워지며 나타나는 정도 0~1. */
  alpha: number;
  /** 움직이는 중이면 속도(월드/초). 쉬면 없다. */
  vel?: Vec2;
}

export interface FreeElectron {
  pos: Vec2;
  vel: Vec2;
}

export interface Snapshot {
  photons: FlyingPhoton[];
  /** 금속 안의 전자 — 쉬거나 튀어 오르다 되돌아가는 것. */
  bound: BoundElectron[];
  /** 표면을 넘었거나 넘는 중인 전자. */
  escaping: FreeElectron[];
}

/** 빈자리가 다시 채워질 때 나타나는 시간(초). 한순간에 뜨면 깜빡임으로 읽힌다. */
const REFILL_FADE = 0.25;

/**
 * 주기 안 시각 `u` 의 광자 · 전자. 전자 운동은 표면 아래에서 연직으로 오르며 끌림을 받고,
 * 표면을 넘으면 끌림이 사라져 그때의 빠르기로 기울어 곧게 난다.
 */
export function snapshot(events: readonly PhotonEvent[], u: number, c: PhotoelectricConstants): Snapshot {
  const photons: FlyingPhoton[] = [];
  const escaping: FreeElectron[] = [];
  /** 자리마다 지금 걸린 사건 — 가장 늦게 닿은 것. */
  const current = new Array<PhotonEvent | undefined>(SITE_COUNT).fill(undefined);
  const g = c.barrierPull;
  const D = ELECTRON_DEPTH;

  for (const e of events) {
    if (u >= e.emit && u < e.hit) {
      const tx = siteX(e.site);
      const len = Math.hypot(tx - LAMP.x, SITE_Y - LAMP.y);
      const dir: Vec2 = [(tx - LAMP.x) / len, (SITE_Y - LAMP.y) / len];
      const s = (u - e.emit) * c.photonSpeed;
      photons.push({ light: e.light, pos: [LAMP.x + dir[0] * s, LAMP.y + dir[1] * s], dir });
    }
    if (u >= e.hit) {
      const prev = current[e.site];
      if (!prev || e.hit >= prev.hit) current[e.site] = e;
      if (e.ev > c.workFunction) {
        const tau = u - e.hit;
        const v0 = Math.sqrt((2 * g * D * e.ev) / c.workFunction);
        const vs = Math.sqrt(Math.max(0, v0 * v0 - 2 * g * D));
        const ts = (v0 - vs) / g;
        const x = siteX(e.site);
        if (tau < ts) {
          escaping.push({ pos: [x, SITE_Y + v0 * tau - 0.5 * g * tau * tau], vel: [0, v0 - g * tau] });
        } else {
          const d: Vec2 = [Math.sin(e.tilt), Math.cos(e.tilt)];
          const s = vs * (tau - ts);
          escaping.push({ pos: [x + d[0] * s, d[1] * s], vel: [d[0] * vs, d[1] * vs] });
        }
      }
    }
  }

  const bound: BoundElectron[] = [];
  for (let i = 0; i < SITE_COUNT; i++) {
    const x = siteX(i);
    const e = current[i];
    if (!e) {
      bound.push({ pos: [x, SITE_Y], alpha: 1 });
      continue;
    }
    const tau = u - e.hit;
    if (e.ev > c.workFunction) {
      // 튀어나간 자리 — 비었다가 다시 채워진다.
      const back = tau - c.refillSeconds;
      if (back >= 0) bound.push({ pos: [x, SITE_Y], alpha: Math.min(1, back / REFILL_FADE) });
      continue;
    }
    const v0 = Math.sqrt((2 * g * D * e.ev) / c.workFunction);
    const T = (2 * v0) / g;
    if (tau >= T) {
      bound.push({ pos: [x, SITE_Y], alpha: 1 });
      continue;
    }
    bound.push({ pos: [x, SITE_Y + v0 * tau - 0.5 * g * tau * tau], alpha: 1, vel: [0, v0 - g * tau] });
  }

  return { photons, bound, escaping };
}

/** 이번 주기에서 흐려진 정도 — 마지막 단계에서 광자 · 튀어나간 전자 · 빛줄기를 지운다. */
export const fadeAlpha = (tl: TimelineFrame): number => 1 - tl.at('fade');

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: PhotoelectricEffectState }): PhotoelectricEffectState {
  return params.state;
}
