// ========================================================================
// antimatter — 순수 계산
// ========================================================================
// 거의 멈춘 전자와 양전자가 만나 사라지면 처음 운동량이 0 이라, 나가는 두 광자의 운동량도
// 합해 0 이다 — 에너지가 같고 방향이 정반대다. 광자 하나의 에너지는 정지 에너지 mₑc² 다.
//
// 소멸 자리 S 에서 방향 d 로 나간 광자는 반지름 R 인 검출기 고리에
//
//   t = −(S·d) + √((S·d)² − |S|² + R²)
//
// 만큼 달려 닿는다. 두 광자는 같은 빠르기라 S 가 고리 가운데가 아니면 가까운 쪽이 먼저 닿는다.
// 두 검출 자리를 이은 선은 S 를 지난다 — 그래서 선들이 S 에서 만난다.
//
// 방향은 (시드, 주기 번호, 사건 번호)의 함수다. 모든 것이 주기 안 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  APPROACH_DISTANCE,
  CONTACT_DISTANCE,
  FIRST_ANGLE_DEG,
  PACKET_LENGTH,
  REST_ENERGY_KEV,
  RING_CELLS,
  RING_RADIUS,
  SEED,
  SHOWN_WAVELENGTH,
  SOURCE_X,
  SOURCE_Y,
} from './schema';
import type { AntimatterState } from './state';

/**
 * 이어지는 소멸의 방향을 반 바퀴에 고르게 나눈 칸 안에서 흔드는 몫(칸 너비 대비). 1 이면 칸 전체.
 * 선들이 한쪽으로 몰려 「한 점에서 만난다」 가 흐려지지 않게 칸을 나눈다.
 */
const ANGLE_JITTER_SHARE = 0.6;

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface AntimatterConstants {
  /** 정지 에너지(keV) — 입자와 광자 이름표에 그대로 띄운다. */
  restEnergy: number;
  seed: number;
  /** 첫 소멸의 광자 방향(라디안). */
  firstAngle: number;
  source: Vec2;
  ringRadius: number;
  ringCells: number;
  approachDistance: number;
  contactDistance: number;
  packetLength: number;
  wavelength: number;
}

export function readConstants(stage: StageDef): AntimatterConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    restEnergy: c.restEnergyKeV ?? REST_ENERGY_KEV,
    seed: c.seed ?? SEED,
    firstAngle: ((c.firstAngleDeg ?? FIRST_ANGLE_DEG) * Math.PI) / 180,
    source: [c.sourceX ?? SOURCE_X, c.sourceY ?? SOURCE_Y],
    ringRadius: c.ringRadius ?? RING_RADIUS,
    ringCells: Math.max(1, Math.round(c.ringCells ?? RING_CELLS)),
    approachDistance: c.approachDistance ?? APPROACH_DISTANCE,
    contactDistance: c.contactDistance ?? CONTACT_DISTANCE,
    packetLength: c.packetLength ?? PACKET_LENGTH,
    wavelength: c.shownWavelength ?? SHOWN_WAVELENGTH,
  };
}

// ------------------------------------------------------------------------
// 단계 → 사건
// ------------------------------------------------------------------------

/**
 * 소멸 사건마다 광자가 나는 단계(`fly`), 선이 들어서는 단계(`show`, 없으면 날기가 끝나는 순간 바로),
 * 켜진 검출기가 꺼지고 선이 옅어지는 단계(`dim`). 시간표 단계에 값을 실을 자리가 없어(장부 G13)
 * 짝을 여기 둔다. 길이 · 순서 · 캡션은 선언(`schema.timeline`)이 정한다.
 */
export const EVENTS: readonly { fly: string; show?: string; dim: string }[] = [
  { fly: 'fly', show: 'hit', dim: 'burst-1' },
  { fly: 'burst-1', dim: 'burst-2' },
  { fly: 'burst-2', dim: 'burst-3' },
  { fly: 'burst-3', dim: 'burst-4' },
  { fly: 'burst-4', dim: 'burst-5' },
  { fly: 'burst-5', dim: 'burst-6' },
  { fly: 'burst-6', dim: 'burst-7' },
  { fly: 'burst-7', dim: 'hold' },
];

export const APPROACH_PHASE = 'approach';
export const MEET_PHASE = 'meet';
/** 한 주기가 끝나며 모두 흐려지는 단계. */
export const FADE_PHASE = 'fade';

// ------------------------------------------------------------------------
// 결정적 난수
// ------------------------------------------------------------------------

/** (시드, 주기, 사건)에서 0~1 하나. 같은 입력은 언제나 같은 값이다 — `Math.random` 을 쓰지 않는다. */
export function draw(seed: number, cycle: number, k: number): number {
  let h = Math.imul(seed | 0, 0x27d4eb2d) ^ Math.imul(cycle | 0, 0x165667b1) ^ Math.imul(k | 0, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/**
 * 사건 k 의 광자 방향(라디안). 첫 사건은 선언한 방향. 이어지는 사건은 첫 방향에서 반 바퀴를
 * 사건 수로 고르게 나눈 칸 안에서 (시드, 주기, k) 로 흔든다 — 선은 방향이 반 바퀴마다 같다.
 */
export function eventAngle(k: number, cycle: number, c: AntimatterConstants): number {
  if (k === 0) return c.firstAngle;
  const n = EVENTS.length;
  const u = draw(c.seed, cycle, k) - 0.5;
  return c.firstAngle + (Math.PI * (k + u * ANGLE_JITTER_SHARE)) / n;
}

/** 자리 s 에서 방향 d 로 나간 광자가 고리에 닿기까지 달리는 거리. */
export function distanceToRing(s: Vec2, d: Vec2, radius: number): number {
  const b = s[0] * d[0] + s[1] * d[1];
  const q = s[0] * s[0] + s[1] * s[1] - radius * radius;
  return -b + Math.sqrt(Math.max(0, b * b - q));
}

/** 고리 위 점이 드는 검출기 칸 번호(+x 에서 반시계). */
export function cellIndex(p: Vec2, cells: number): number {
  const a = Math.atan2(p[1], p[0]);
  const turn = (a < 0 ? a + 2 * Math.PI : a) / (2 * Math.PI);
  return Math.min(cells - 1, Math.floor(turn * cells));
}

// ------------------------------------------------------------------------
// 지금 화면
// ------------------------------------------------------------------------

/** 입자 하나 — 자리와 짙기. */
export interface ParticleNow {
  pos: Vec2;
  opacity: number;
}

/** 날고 있는 광자 — 소멸 자리에서 방향 `dir` 로 [from, to] 구간, 물결 위상을 붙일 머리. */
export interface PhotonNow {
  event: number;
  dir: Vec2;
  from: number;
  to: number;
  head: number;
}

/** 광자를 받은 검출기 칸. */
export interface LitCell {
  index: number;
  opacity: number;
}

/** 두 검출 자리를 이은 선. `appear` 는 들어서는 진행도, `dim` 은 옅어지는 진행도(0~1). */
export interface ChordNow {
  event: number;
  a: Vec2;
  b: Vec2;
  appear: number;
  dim: number;
}

export interface Snapshot {
  electron?: ParticleNow;
  positron?: ParticleNow;
  /** 만나는 순간의 섬광 — 번지는 진행도 0~1. 만남 단계 동안만 있다. */
  flash?: number;
  /** 소멸 자리 표지의 짙기 — 만남이 끝나며 들어선다(0~1). 만나기 전에는 0. */
  site: number;
  photons: PhotonNow[];
  lit: LitCell[];
  chords: ChordNow[];
  /** 주기 끝의 흐려짐 — 쌓인 것 모두에 곱한다. */
  alpha: number;
}

export function snapshot(tl: TimelineFrame, c: AntimatterConstants): Snapshot {
  const alpha = 1 - tl.at(FADE_PHASE);
  const s = c.source;
  // 만남 진행도 — 입자가 옅어지는 만큼 소멸 자리 표지가 들어선다.
  const meet = tl.at(MEET_PHASE);
  const out: Snapshot = { site: meet, photons: [], lit: [], chords: [], alpha };

  // ── 다가옴 · 만남 — 전자는 자리에 있고 양전자가 왼쪽에서 다가온다 ──
  if (meet < 1) {
    const gap =
      tl.phase === MEET_PHASE
        ? c.contactDistance * (1 - meet)
        : c.contactDistance + (c.approachDistance - c.contactDistance) * (1 - tl.at(APPROACH_PHASE));
    out.electron = { pos: s, opacity: 1 - meet };
    out.positron = { pos: [s[0] - gap, s[1]], opacity: 1 - meet };
    if (tl.phase === MEET_PHASE) out.flash = meet;
  }

  // ── 사건마다 광자 둘 · 켜진 칸 · 선 ──
  for (let k = 0; k < EVENTS.length; k++) {
    const ev = EVENTS[k]!;
    const fly = tl.at(ev.fly);
    if (fly <= 0) continue;

    const a = eventAngle(k, tl.cycle, c);
    const dirs: [Vec2, Vec2] = [
      [Math.cos(a), Math.sin(a)],
      [-Math.cos(a), -Math.sin(a)],
    ];
    const dists = dirs.map((d) => distanceToRing(s, d, c.ringRadius));
    const far = Math.max(dists[0]!, dists[1]!);
    // 머리는 단계 끝에 먼 쪽 광자의 꼬리까지 고리에 들어가도록 달린다 — 두 광자는 같은 빠르기다.
    const head = fly * (far + c.packetLength);
    const dim = tl.at(ev.dim);

    for (let j = 0; j < 2; j++) {
      const d = dirs[j]!;
      const dist = dists[j]!;
      if (fly < 1) {
        const from = Math.max(0, head - c.packetLength);
        const to = Math.min(head, dist);
        if (to > from) out.photons.push({ event: k, dir: d, from, to, head });
      }
      if (head >= dist && dim < 1) {
        const p: Vec2 = [s[0] + d[0] * dist, s[1] + d[1] * dist];
        out.lit.push({ index: cellIndex(p, c.ringCells), opacity: 1 - dim });
      }
    }

    if (fly >= 1) {
      const appear = ev.show ? tl.at(ev.show) : 1;
      if (appear > 0) {
        const pa: Vec2 = [s[0] + dirs[0][0] * dists[0]!, s[1] + dirs[0][1] * dists[0]!];
        const pb: Vec2 = [s[0] + dirs[1][0] * dists[1]!, s[1] + dirs[1][1] * dists[1]!];
        out.chords.push({ event: k, a: pa, b: pb, appear, dim });
      }
    }
  }

  return out;
}

export function step(params: { state: AntimatterState }): AntimatterState {
  return params.state;
}
