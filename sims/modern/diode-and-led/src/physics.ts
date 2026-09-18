// ========================================================================
// diode-and-led — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 모든 자리가 시간표 진행도의 함수이고, `step` 은 항등이다.
//
// 이 조각의 물리는 셋이다.
//
//   곡선     전류 I(V) = I_t · (e^((V − V_t)/w) − e^(−V_t/w)). 역방향(V < 0)에서는 거의 0,
//            순방향 문턱 V_t 까지도 작다가 넘으면 치솟는다. 꼭대기(그래프 높이)에서 자른다
//   떨어짐   흐르는 동안 전자가 전도띠에서 원자가띠의 양공으로 떨어진다. 1 초에 떨어지는 수는
//            전류에 비례한다 — 칸마다 그때의 전류 비를 쌓아 정수를 넘을 때마다 하나
//   빛       LED 에서는 떨어질 때마다 띠 간격만큼의 빛 알갱이 하나가 나간다. 파장은 스테이지
//            상수이고 색은 plugin-optics 의 `wavelengthToLinearRgb` 로 얻는다
//
// 나머지는 배치 계산이다 — 곡선 표본, 곡선을 따라 같은 빠르기로 가는 점의 자리, 띠의 높이.
// ========================================================================

import { wavelengthToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BAND_X0,
  BAND_X1,
  BAND_Y0,
  BLUE_GAP_EV,
  BLUE_NM,
  BLUE_THRESHOLD,
  DROP_MARGIN,
  DROP_RATE,
  DWELL_S,
  EV_Y,
  FALL_S,
  GRAPH_H,
  KNEE_WIDTH,
  PACKET_AMP,
  PACKET_LEN,
  PHOTON_LIFE,
  PHOTON_SPEED,
  RED_GAP_EV,
  RED_NM,
  RED_THRESHOLD,
  REVERSE_VOLTAGE,
  SEED,
  SI_GAP_EV,
  SI_THRESHOLD,
  THRESHOLD_CURRENT,
  VOLT_X,
  WAVE_SCALE,
} from './schema';
import type { DiodeAndLedState } from './state';

export function step(params: { state: DiodeAndLedState }): DiodeAndLedState {
  return params.state;
}

export interface DiodeAndLedConstants {
  reverseVoltage: number;
  siThreshold: number;
  siGap: number;
  redThreshold: number;
  redGap: number;
  redNm: number;
  blueThreshold: number;
  blueGap: number;
  blueNm: number;
  thresholdCurrent: number;
  kneeWidth: number;
  dropRate: number;
  dwell: number;
  fall: number;
  photonSpeed: number;
  photonLife: number;
  waveScale: number;
  seed: number;
}

export function readConstants(stage: StageDef): DiodeAndLedConstants {
  const c = stage.constants ?? {};
  return {
    reverseVoltage: c.reverseVoltage ?? REVERSE_VOLTAGE,
    siThreshold: c.siThreshold ?? SI_THRESHOLD,
    siGap: c.siGap ?? SI_GAP_EV,
    redThreshold: c.redThreshold ?? RED_THRESHOLD,
    redGap: c.redGap ?? RED_GAP_EV,
    redNm: c.redNm ?? RED_NM,
    blueThreshold: c.blueThreshold ?? BLUE_THRESHOLD,
    blueGap: c.blueGap ?? BLUE_GAP_EV,
    blueNm: c.blueNm ?? BLUE_NM,
    thresholdCurrent: c.thresholdCurrent ?? THRESHOLD_CURRENT,
    kneeWidth: c.kneeWidth ?? KNEE_WIDTH,
    dropRate: c.dropRate ?? DROP_RATE,
    dwell: c.dwell ?? DWELL_S,
    fall: c.fall ?? FALL_S,
    photonSpeed: c.photonSpeed ?? PHOTON_SPEED,
    photonLife: c.photonLife ?? PHOTON_LIFE,
    waveScale: c.waveScale ?? WAVE_SCALE,
    seed: Math.round(c.seed ?? SEED),
  };
}

// ------------------------------------------------------------------------
// 소자 — 단계 id 와의 짝 (시간표 단계에 값을 실을 수 없어 여기 둔다, NOTES c G13)
// ------------------------------------------------------------------------

export type DeviceId = 'si' | 'red' | 'blue';

export interface DeviceDef {
  id: DeviceId;
  /** 역방향으로 걸기 · 0 으로 되돌리기 · 문턱까지 올리기 · 곡선 타고 오르기 · 가득 흐르기. */
  rev: string;
  back: string;
  fwd: string;
  rise: string;
  hold: string;
  /** 이 소자가 들어오는 단계(없으면 주기 처음부터) · 물러나는 단계(없으면 주기 끝까지). */
  enter?: string;
  exit?: string;
}

export const DEVICES: readonly DeviceDef[] = [
  { id: 'si', rev: 'siRev', back: 'siBack', fwd: 'siFwd', rise: 'siRise', hold: 'siHold', exit: 'toRed' },
  {
    id: 'red',
    rev: 'redRev',
    back: 'redBack',
    fwd: 'redFwd',
    rise: 'redRise',
    hold: 'redHold',
    enter: 'toRed',
    exit: 'toBlue',
  },
  { id: 'blue', rev: 'blueRev', back: 'blueBack', fwd: 'blueFwd', rise: 'blueRise', hold: 'blueHold', enter: 'toBlue' },
];

export interface DeviceSpec {
  threshold: number;
  gap: number;
  /** 빛의 파장(nm). 실리콘은 빛을 내지 않아 없다. */
  nm?: number;
}

export function deviceSpec(c: DiodeAndLedConstants, d: DeviceId): DeviceSpec {
  if (d === 'si') return { threshold: c.siThreshold, gap: c.siGap };
  if (d === 'red') return { threshold: c.redThreshold, gap: c.redGap, nm: c.redNm };
  return { threshold: c.blueThreshold, gap: c.blueGap, nm: c.blueNm };
}

/** LED 빛의 색 — 선형광 세 성분. 온도 · 파장 → 색 표를 손으로 만들지 않는다 (C2). */
export const lightRgb = (nm: number): LinearRgb => wavelengthToLinearRgb(nm);

/** 들어온 정도 0~1 · 물러난 정도 0~1. */
export function presence(tl: TimelineFrame, d: DeviceDef): { entered: number; exited: number } {
  return { entered: d.enter ? tl.at(d.enter) : 1, exited: d.exit ? tl.at(d.exit) : 0 };
}

/** 지금 띠 간격(eV) — 소자가 들어오는 동안 앞 소자의 간격에서 자란다. */
export function gapNow(tl: TimelineFrame, c: DiodeAndLedConstants): number {
  let g = deviceSpec(c, DEVICES[0]!.id).gap;
  for (let k = 1; k < DEVICES.length; k++) {
    const d = DEVICES[k]!;
    const prev = deviceSpec(c, DEVICES[k - 1]!.id).gap;
    g += (deviceSpec(c, d.id).gap - prev) * presence(tl, d).entered;
  }
  return g;
}

/** 주기 첫머리에 나타나며 짙어지고, 끝에 옅어진다. */
export function fadeOpacity(tl: TimelineFrame): number {
  return tl.at('appear') * (1 - tl.at('fade'));
}

// ------------------------------------------------------------------------
// 곡선
// ------------------------------------------------------------------------

/** 전류 비(그래프 꼭대기가 1). 꼭대기 위는 자른다. */
export function current(c: DiodeAndLedConstants, spec: DeviceSpec, v: number): number {
  const w = c.kneeWidth;
  const i = c.thresholdCurrent * (Math.exp((v - spec.threshold) / w) - Math.exp(-spec.threshold / w));
  return Math.min(1, i);
}

/** 전류가 꼭대기에 닿는 전압(V). */
export function topVoltage(c: DiodeAndLedConstants, spec: DeviceSpec): number {
  const w = c.kneeWidth;
  return spec.threshold + w * Math.log(1 / c.thresholdCurrent + Math.exp(-spec.threshold / w));
}

/** 그래프 위 자리(월드). */
export function graphPoint(v: number, i: number): Vec2 {
  return [v * VOLT_X, i * GRAPH_H];
}

/** 곡선 표본 수 — 역방향 · 문턱까지 · 문턱 위. 문턱 위는 가파라서 촘촘히. */
const REV_SAMPLES = 12;
const FWD_SAMPLES = 40;
const RISE_SAMPLES = 160;

interface Sample {
  v: number;
  pos: Vec2;
}

/** 역방향 끝에서 꼭대기까지, 전압 순으로. */
export function fullCurve(c: DiodeAndLedConstants, spec: DeviceSpec): Sample[] {
  const out: Sample[] = [];
  const push = (v: number): void => {
    out.push({ v, pos: graphPoint(v, current(c, spec, v)) });
  };
  for (let k = 0; k < REV_SAMPLES; k++) push(-c.reverseVoltage * (1 - k / REV_SAMPLES));
  for (let k = 0; k < FWD_SAMPLES; k++) push(spec.threshold * (k / FWD_SAMPLES));
  for (const s of riseCurve(c, spec)) out.push(s);
  return out;
}

/** 문턱에서 꼭대기까지의 표본과 누적 길이(월드). */
function riseCurve(c: DiodeAndLedConstants, spec: DeviceSpec): (Sample & { arc: number })[] {
  const v0 = spec.threshold;
  const v1 = topVoltage(c, spec);
  const out: (Sample & { arc: number })[] = [];
  let arc = 0;
  for (let k = 0; k <= RISE_SAMPLES; k++) {
    const v = v0 + ((v1 - v0) * k) / RISE_SAMPLES;
    const pos = graphPoint(v, current(c, spec, v));
    if (out.length > 0) {
      const p = out[out.length - 1]!.pos;
      arc += Math.hypot(pos[0] - p[0], pos[1] - p[1]);
    }
    out.push({ v, pos, arc });
  }
  return out;
}

/** 문턱 위 곡선을 길이 비 `frac` 만큼 간 자리의 전압 — 점이 곡선을 따라 같은 빠르기로 간다. */
export function riseVoltage(c: DiodeAndLedConstants, spec: DeviceSpec, frac: number): number {
  const rc = riseCurve(c, spec);
  const total = rc[rc.length - 1]!.arc;
  const target = Math.max(0, Math.min(1, frac)) * total;
  for (let k = 1; k < rc.length; k++) {
    const a = rc[k - 1]!;
    const b = rc[k]!;
    if (b.arc >= target) {
      const s = b.arc > a.arc ? (target - a.arc) / (b.arc - a.arc) : 0;
      return a.v + (b.v - a.v) * s;
    }
  }
  return rc[rc.length - 1]!.v;
}

/** 지금 점의 전압과 곡선이 그려진 전압 범위. */
export function sweep(
  tl: TimelineFrame,
  c: DiodeAndLedConstants,
  d: DeviceDef,
): { v: number; lo: number; hi: number } {
  const spec = deviceSpec(c, d.id);
  const lo = -c.reverseVoltage * tl.at(d.rev);
  let v: number;
  if (tl.at(d.rise) > 0) v = riseVoltage(c, spec, tl.at(d.rise));
  else if (tl.at(d.fwd) > 0) v = spec.threshold * tl.at(d.fwd);
  else if (tl.at(d.back) > 0) v = -c.reverseVoltage * (1 - tl.at(d.back));
  else v = lo;
  return { v, lo, hi: Math.max(0, v) };
}

/** 그려진 몫의 곡선 — 역방향으로 간 끝에서 순방향으로 간 끝까지. */
export function drawnCurve(c: DiodeAndLedConstants, spec: DeviceSpec, lo: number, hi: number): Vec2[] {
  const pts: Vec2[] = [graphPoint(lo, current(c, spec, lo))];
  for (const s of fullCurve(c, spec)) if (s.v > lo && s.v < hi) pts.push(s.pos);
  pts.push(graphPoint(hi, current(c, spec, hi)));
  return pts;
}

// ------------------------------------------------------------------------
// 떨어짐 · 빛 — (시드, 주기, 칸 번호)의 함수
// ------------------------------------------------------------------------

/** 시드 결정적 난수 0~1 (mulberry32 한 걸음). */
export function rand(seed: number, i: number): number {
  let t = (seed * 0x9e3779b1 + i * 0x85ebca6b) >>> 0;
  t = (t + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** 칸 번호를 주기 · 소자마다 벌리는 간격. 한 주기의 칸 수보다 넉넉히 크다. */
const CYCLE_STRIDE = 10007;
const DEVICE_STRIDE = 1009;
/** 빛 알갱이가 띠 사이 가운데에서 위아래로 흩어지는 폭 — 띠 간격 높이에 대한 비. 여럿이 한 줄에 겹치지 않게. */
const PHOTON_Y_SPREAD = 0.5;

export interface Drop {
  /** 떨어지는 가로 자리(월드). */
  x: number;
  /** 태어난 뒤 흐른 시간(초). */
  age: number;
  /** 빛 알갱이가 나는 높이 — 띠 사이 가운데에서 벗어난 몫(−½~½, 띠 간격 높이에 대한 비). */
  lift: number;
}

/**
 * 지금까지 태어난 떨어짐 — 오르기(`rise`) 시작부터 가득 흐르기(`hold`) 끝까지 `dropRate` 칸마다 그 칸의
 * 전류 비를 쌓고, 쌓인 몫이 정수를 넘을 때마다 하나가 태어난다. 몇 개가 태어나는지가 전류의 적분을 따르므로
 * 오르는 동안에도 주기마다 같은 수 무렵이 떨어진다(뽑아서 받아들이면 어떤 주기는 0 개였다).
 *
 * 전류 비는 **그 칸의 시각**에서 센다 — 오르기 단계가 이징 없이 선언되어 있어 진행도가
 * (시각 − 시작) / 길이 다 (schema 주석, NOTES c G13). 칸 안의 자리 · 떨어지는 가로 자리 · 쌓기의 출발값은
 * (시드, 주기, 칸)에서 뽑는다.
 */
export function drops(tl: TimelineFrame, c: DiodeAndLedConstants, d: DeviceDef, index: number): Drop[] {
  const spec = deviceSpec(c, d.id);
  const t0 = tl.start(d.rise);
  const riseLen = tl.duration(d.rise);
  const t1 = tl.end(d.hold);
  const out: Drop[] = [];
  if (tl.u < t0 || c.dropRate <= 0) return out;
  const base = tl.cycle * CYCLE_STRIDE + index * DEVICE_STRIDE;
  const slots = Math.ceil((t1 - t0) * c.dropRate);
  let pile = rand(c.seed, base);
  for (let k = 0; k < slots; k++) {
    const key = base + (k + 1) * 4;
    const born = t0 + (k + rand(c.seed, key)) / c.dropRate;
    if (born > t1 || born > tl.u) break;
    const frac = (born - t0) / riseLen;
    pile += frac >= 1 ? 1 : current(c, spec, riseVoltage(c, spec, frac));
    if (pile < 1) continue;
    pile -= 1;
    out.push({
      x: BAND_X0 + DROP_MARGIN + (BAND_X1 - BAND_X0 - 2 * DROP_MARGIN) * rand(c.seed, key + 2),
      age: tl.u - born,
      lift: PHOTON_Y_SPREAD * (rand(c.seed, key + 3) - 0.5),
    });
  }
  return out;
}

/** 원자가띠 · 전도띠 높이(월드). */
export function bandLevels(gapEv: number): { valence: number; conduction: number } {
  return { valence: BAND_Y0, conduction: BAND_Y0 + gapEv * EV_Y };
}

export interface Carrier {
  pos: Vec2;
  /** 0~1. 나타나며 짙어진다. */
  weight: number;
}

export interface PhotonPacket {
  /** 물결 폴리라인(월드). */
  line: Vec2[];
  alpha: number;
}

/** 빛 알갱이 한 덩이의 표본 수. */
const PACKET_SAMPLES = 36;

/**
 * 떨어짐 하나의 지금 모습 — 전자(전도띠에 나타나 머물다 떨어진다) · 양공(원자가띠에서 기다린다) ·
 * 빛 알갱이(LED 에서만, 만난 뒤 오른쪽으로 난다).
 */
export function dropView(
  c: DiodeAndLedConstants,
  spec: DeviceSpec,
  drop: Drop,
  gapEv: number,
): { electron?: Carrier; hole?: Carrier; photon?: PhotonPacket } {
  const { valence, conduction } = bandLevels(gapEv);
  const meet = c.dwell + c.fall;
  if (drop.age < meet) {
    const weight = Math.min(1, drop.age / c.dwell);
    const s = Math.max(0, (drop.age - c.dwell) / c.fall);
    return {
      electron: { pos: [drop.x, conduction + (valence - conduction) * s], weight },
      hole: { pos: [drop.x, valence], weight },
    };
  }
  if (spec.nm === undefined) return {};
  const age = drop.age - meet;
  if (age >= c.photonLife) return {};
  const y = (valence + conduction) / 2 + drop.lift * (conduction - valence);
  const head = drop.x + c.photonSpeed * age;
  const tail = Math.max(drop.x, head - PACKET_LEN);
  if (head - tail <= 0) return {};
  const lambda = spec.nm * c.waveScale;
  const line: Vec2[] = [];
  for (let k = 0; k <= PACKET_SAMPLES; k++) {
    const x = tail + ((head - tail) * k) / PACKET_SAMPLES;
    line.push([x, y + PACKET_AMP * Math.sin((2 * Math.PI * (head - x)) / lambda)]);
  }
  return { photon: { line, alpha: 1 - age / c.photonLife } };
}
