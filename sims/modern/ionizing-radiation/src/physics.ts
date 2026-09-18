// ========================================================================
// ionizing-radiation — 순수 계산
// ========================================================================
// 광자 하나는 분자 하나에게 제 에너지 E 를 통째로 준다. 몫은 광자마다 따로다.
//
//   E < 문턱 — 결합이 E / 문턱 에 비례한 폭으로 늘었다 줄었다 흔들리다 잦아든다. 몫은
//              흩어지므로 다음 광자가 와도 쌓이지 않는다 — 흔들림은 마지막 광자의 것뿐이다.
//   E ≥ 문턱 — 결합이 끊어지고 두 원자가 벌어진다. 광자 하나에 결합 하나.
//
// 흔들림 폭은 E 에 **선형**이다. 전파 광자(1e-9 eV 무렵)는 문턱의 10⁻¹⁰ 배라 흔들림이 보이지
// 않는 것이 참이고, 조각이 그 작은 몫을 키우지 않는다.
//
// 모든 것이 (시드, 주기 번호, 주기 안 시각)의 함수다. 쌓는 상태가 없다.
// ========================================================================

import { wavelengthToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  AXIS_MAX_EV,
  AXIS_MIN_EV,
  BOND_LENGTH,
  FRAGMENT_GAP,
  FRAGMENT_SETTLE,
  HC_EV_NM,
  INFRARED_MIN_EV,
  MICROWAVE_MIN_EV,
  MOLECULES,
  PHOTON_SPEED,
  RATE_INFRARED,
  RATE_IONIZING,
  RATE_MICROWAVE,
  RATE_RADIO,
  RATE_ULTRAVIOLET,
  RATE_VISIBLE,
  SEED,
  SHAKE_AT_THRESHOLD,
  SHAKE_DECAY,
  SHAKE_HZ,
  SOURCE,
  THRESHOLD_EV,
  ULTRAVIOLET_MIN_EV,
  VISIBLE_MIN_EV,
  WAVE_COMPRESSION,
  WAVE_SPACING_AT_THRESHOLD,
  XRAY_MIN_EV,
} from './schema';
import type { IonizingRadiationState } from './state';

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface IonizingConstants {
  /** 결합을 끊는 문턱(eV). */
  thresholdEv: number;
  /** 에너지 축 양 끝(eV). */
  axisMinEv: number;
  axisMaxEv: number;
  /** 대역 경계(eV). */
  microwaveMinEv: number;
  infraredMinEv: number;
  visibleMinEv: number;
  ultravioletMinEv: number;
  xrayMinEv: number;
  /** hc(eV · nm). */
  hcEvNm: number;
  /** 대역마다 광자 수(개/초). */
  rateRadio: number;
  rateMicrowave: number;
  rateInfrared: number;
  rateVisible: number;
  rateUltraviolet: number;
  rateIonizing: number;
  /** 광자가 나는 빠르기(월드/초). */
  photonSpeed: number;
  /** 문턱 광자의 물결 간격(월드) · 압축 지수. */
  waveSpacingAtThreshold: number;
  waveCompression: number;
  /** 문턱 에너지를 받은 결합이 늘어나는 폭(월드). */
  shakeAtThreshold: number;
  /** 흔들림이 잦아드는 시간 상수(초) · 진동수(Hz). */
  shakeDecay: number;
  shakeHz: number;
  /** 끊어진 원자가 벌어지는 거리(월드) · 시간 상수(초). */
  fragmentGap: number;
  fragmentSettle: number;
  /** 일정 · 겨냥 시드. */
  seed: number;
}

export function readConstants(stage: StageDef): IonizingConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    thresholdEv: c.thresholdEv ?? THRESHOLD_EV,
    axisMinEv: c.axisMinEv ?? AXIS_MIN_EV,
    axisMaxEv: c.axisMaxEv ?? AXIS_MAX_EV,
    microwaveMinEv: c.microwaveMinEv ?? MICROWAVE_MIN_EV,
    infraredMinEv: c.infraredMinEv ?? INFRARED_MIN_EV,
    visibleMinEv: c.visibleMinEv ?? VISIBLE_MIN_EV,
    ultravioletMinEv: c.ultravioletMinEv ?? ULTRAVIOLET_MIN_EV,
    xrayMinEv: c.xrayMinEv ?? XRAY_MIN_EV,
    hcEvNm: c.hcEvNm ?? HC_EV_NM,
    rateRadio: c.rateRadio ?? RATE_RADIO,
    rateMicrowave: c.rateMicrowave ?? RATE_MICROWAVE,
    rateInfrared: c.rateInfrared ?? RATE_INFRARED,
    rateVisible: c.rateVisible ?? RATE_VISIBLE,
    rateUltraviolet: c.rateUltraviolet ?? RATE_ULTRAVIOLET,
    rateIonizing: c.rateIonizing ?? RATE_IONIZING,
    photonSpeed: c.photonSpeed ?? PHOTON_SPEED,
    waveSpacingAtThreshold: c.waveSpacingAtThreshold ?? WAVE_SPACING_AT_THRESHOLD,
    waveCompression: c.waveCompression ?? WAVE_COMPRESSION,
    shakeAtThreshold: c.shakeAtThreshold ?? SHAKE_AT_THRESHOLD,
    shakeDecay: c.shakeDecay ?? SHAKE_DECAY,
    shakeHz: c.shakeHz ?? SHAKE_HZ,
    fragmentGap: c.fragmentGap ?? FRAGMENT_GAP,
    fragmentSettle: c.fragmentSettle ?? FRAGMENT_SETTLE,
    seed: c.seed ?? SEED,
  };
}

// ------------------------------------------------------------------------
// 에너지 축 — 로그 자리
// ------------------------------------------------------------------------

/** 에너지 E(eV) 의 축 위 x(월드). 축은 로그 눈금이다 — 한 자릿수가 같은 너비. */
export function axisX(ev: number, c: IonizingConstants, x0: number, x1: number): number {
  const lo = Math.log10(c.axisMinEv);
  const hi = Math.log10(c.axisMaxEv);
  const f = (Math.log10(ev) - lo) / (hi - lo);
  return x0 + (x1 - x0) * Math.min(1, Math.max(0, f));
}

/** 가시광 경계 에너지의 빛 색(선형광) — 파장 = hc / E. 가시광 안에서만 쓴다. */
export const lightOfEv = (ev: number, c: IonizingConstants): LinearRgb => wavelengthToLinearRgb(c.hcEvNm / ev);

// ------------------------------------------------------------------------
// 단계 → 대역
// ------------------------------------------------------------------------

type EdgeKey = 'axisMinEv' | 'microwaveMinEv' | 'infraredMinEv' | 'visibleMinEv' | 'ultravioletMinEv' | 'thresholdEv' | 'xrayMinEv' | 'axisMaxEv';
type RateKey = 'rateRadio' | 'rateMicrowave' | 'rateInfrared' | 'rateVisible' | 'rateUltraviolet' | 'rateIonizing';

/**
 * 훑는 단계와 그 단계의 에너지 구간 · 광자 수. 시간표 단계에 값을 실을 자리가 없어 (장부 G13)
 * 단계 id 와의 짝을 여기 둔다. 길이 · 순서 · 캡션은 선언(`schema.timeline`)이 정한다.
 * 구간 끝은 스테이지 상수의 이름이다 — 값은 저작자가 스테이지에서 바꾼다.
 */
export const SWEEP: readonly { phase: string; from: EdgeKey; to: EdgeKey; rate: RateKey }[] = [
  { phase: 'radio', from: 'axisMinEv', to: 'microwaveMinEv', rate: 'rateRadio' },
  { phase: 'microwave', from: 'microwaveMinEv', to: 'infraredMinEv', rate: 'rateMicrowave' },
  { phase: 'infrared', from: 'infraredMinEv', to: 'visibleMinEv', rate: 'rateInfrared' },
  { phase: 'visible', from: 'visibleMinEv', to: 'ultravioletMinEv', rate: 'rateVisible' },
  { phase: 'ultraviolet', from: 'ultravioletMinEv', to: 'thresholdEv', rate: 'rateUltraviolet' },
  { phase: 'ionizing', from: 'thresholdEv', to: 'xrayMinEv', rate: 'rateIonizing' },
  { phase: 'xray', from: 'xrayMinEv', to: 'axisMaxEv', rate: 'rateIonizing' },
];

/**
 * 주기 안 시각 `u` 에 광원이 내는 광자 하나의 에너지(eV). 훑는 단계 안에서는 두 경계 사이를
 * 로그로 고르게 오르고, 첫 단계 전에는 축 왼쪽 끝, 마지막 단계 뒤에는 오른쪽 끝에 머문다.
 */
export function energyAt(tl: TimelineFrame, u: number, c: IonizingConstants): number {
  const first = SWEEP[0]!;
  if (u < tl.start(first.phase)) return c[first.from];
  for (const s of SWEEP) {
    const t0 = tl.start(s.phase);
    const t1 = tl.end(s.phase);
    if (u >= t0 && u < t1) {
      const f = (u - t0) / (t1 - t0);
      const lo = c[s.from];
      const hi = c[s.to];
      return lo * Math.pow(hi / lo, f);
    }
  }
  return c[SWEEP[SWEEP.length - 1]!.to];
}

/** 물결 간격(월드) — 문턱 광자의 간격에서 (문턱 / E)^지수 로 눌러 편다. */
export const waveSpacing = (ev: number, c: IonizingConstants): number =>
  c.waveSpacingAtThreshold * Math.pow(c.thresholdEv / ev, c.waveCompression);

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
// 분자 자리
// ------------------------------------------------------------------------

export const MOLECULE_COUNT = MOLECULES.cols * MOLECULES.rows;

/** 분자 i 의 가운데. 둘째 행은 반 칸 어긋난다. */
export function moleculeCenter(i: number): Vec2 {
  const row = Math.floor(i / MOLECULES.cols);
  const col = i % MOLECULES.cols;
  return [MOLECULES.x0 + col * MOLECULES.dx + row * MOLECULES.stagger, MOLECULES.y0 + row * MOLECULES.dy];
}

/** 분자 i 의 결합 방향(단위). 시드로 기울기를 뽑아 줄지어 선 무늬로 읽히지 않게 한다 — 주기와 무관. */
export function moleculeAxis(i: number, c: IonizingConstants): Vec2 {
  const a = Math.PI * hash01(c.seed, 0, i, 9);
  return [Math.cos(a), Math.sin(a)];
}

/** 광자가 분자에 닿는 거리 — 광원에서 분자 가운데까지에서 결합 반 길이만큼 모자란 곳. */
function travelTo(i: number): number {
  const [x, y] = moleculeCenter(i);
  return Math.hypot(x - SOURCE.x, y - SOURCE.y) - BOND_LENGTH / 2;
}

// ------------------------------------------------------------------------
// 한 주기의 광자 일정
// ------------------------------------------------------------------------

export interface PhotonEvent {
  /** 광원을 떠난 · 분자에 닿는 주기 안 시각(초). */
  emit: number;
  hit: number;
  /** 겨냥한 분자. */
  target: number;
  /** 광자 에너지(eV) — 떠난 순간의 표지 자리. */
  ev: number;
  /** 결합을 끊는가(E ≥ 문턱). */
  breaks: boolean;
}

/**
 * 이번 주기의 광자 목록. 단계마다 `rate × 길이` 개를 거의 고르게 내보낸다. 문턱 아래 광자는
 * 아무 분자나 겨냥하고, 문턱을 넘은 광자는 아직 끊기지 않은 분자를 겨냥한다 — 광자 하나 ·
 * 결합 하나. 끊을 분자가 남지 않았으면 아무 분자나 겨냥한다(이미 끊긴 조각은 그대로다).
 */
export function schedule(tl: TimelineFrame, c: IonizingConstants): PhotonEvent[] {
  const events: PhotonEvent[] = [];
  const intact = new Set<number>();
  for (let i = 0; i < MOLECULE_COUNT; i++) intact.add(i);
  let n = 0;
  for (const s of SWEEP) {
    const rate = c[s.rate];
    const t0 = tl.start(s.phase);
    const count = Math.floor(tl.duration(s.phase) * rate);
    for (let k = 0; k < count; k++, n++) {
      const emit = t0 + (k + 0.5 + EMIT_JITTER * (hash01(c.seed, tl.cycle, n, 1) - 0.5)) / rate;
      const ev = energyAt(tl, emit, c);
      const breaks = ev >= c.thresholdEv;
      const pool = breaks && intact.size > 0 ? [...intact] : Array.from({ length: MOLECULE_COUNT }, (_, i) => i);
      const target = pool[Math.floor(hash01(c.seed, tl.cycle, n, 2) * pool.length)]!;
      if (breaks) intact.delete(target);
      events.push({ emit, hit: emit + travelTo(target) / c.photonSpeed, target, ev, breaks });
    }
  }
  return events;
}

// ------------------------------------------------------------------------
// 지금 화면 — 광자 · 분자
// ------------------------------------------------------------------------

export interface FlyingPhoton {
  pos: Vec2;
  /** 나는 방향(단위). */
  dir: Vec2;
  ev: number;
}

export interface MoleculeNow {
  /** 두 원자 자리. */
  atoms: readonly [Vec2, Vec2];
  /** 결합이 끊겼는가. */
  broken: boolean;
}

export interface Snapshot {
  photons: FlyingPhoton[];
  molecules: MoleculeNow[];
}

/**
 * 주기 안 시각 `u` 의 광자 · 분자. 분자마다 가장 늦게 닿은 광자 하나만 본다 — 끊는 광자가 한 번
 * 닿았으면 그 뒤로는 끊긴 채다.
 */
export function snapshot(events: readonly PhotonEvent[], u: number, c: IonizingConstants): Snapshot {
  const photons: FlyingPhoton[] = [];
  const last = new Array<PhotonEvent | undefined>(MOLECULE_COUNT).fill(undefined);
  const breaker = new Array<PhotonEvent | undefined>(MOLECULE_COUNT).fill(undefined);

  for (const e of events) {
    if (u >= e.emit && u < e.hit) {
      const [tx, ty] = moleculeCenter(e.target);
      const len = Math.hypot(tx - SOURCE.x, ty - SOURCE.y);
      const dir: Vec2 = [(tx - SOURCE.x) / len, (ty - SOURCE.y) / len];
      const s = (u - e.emit) * c.photonSpeed;
      photons.push({ pos: [SOURCE.x + dir[0] * s, SOURCE.y + dir[1] * s], dir, ev: e.ev });
    }
    if (u >= e.hit) {
      const prev = last[e.target];
      if (!prev || e.hit >= prev.hit) last[e.target] = e;
      if (e.breaks && !breaker[e.target]) breaker[e.target] = e;
    }
  }

  const molecules: MoleculeNow[] = [];
  for (let i = 0; i < MOLECULE_COUNT; i++) {
    const [cx, cy] = moleculeCenter(i);
    const [ax, ay] = moleculeAxis(i, c);
    let half = BOND_LENGTH / 2;
    const b = breaker[i];
    if (b) {
      half += (c.fragmentGap / 2) * (1 - Math.exp(-(u - b.hit) / c.fragmentSettle));
    } else {
      const e = last[i];
      if (e) {
        const tau = u - e.hit;
        const amp = c.shakeAtThreshold * (e.ev / c.thresholdEv);
        half += (amp / 2) * Math.exp(-tau / c.shakeDecay) * Math.sin(2 * Math.PI * c.shakeHz * tau);
      }
    }
    molecules.push({
      atoms: [
        [cx - ax * half, cy - ay * half],
        [cx + ax * half, cy + ay * half],
      ],
      broken: !!b,
    });
  }
  return { photons, molecules };
}

/** 분자가 보이는 정도 — 처음 단계에서 나타나고 마지막 단계에서 흐려진다. */
export const moleculeAlpha = (tl: TimelineFrame): number => tl.at('appear') * (1 - tl.at('fade'));

/** 광자 · 표지가 보이는 정도 — 마지막 단계에서 흐려진다. */
export const fadeAlpha = (tl: TimelineFrame): number => 1 - tl.at('fade');

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: IonizingRadiationState }): IonizingRadiationState {
  return params.state;
}
