// ========================================================================
// compton-scattering — 순수 계산
// ========================================================================
// 광자 운동량 p = h/λ. 멈춰 있던 전자와 부딪혀 각 θ 로 튕겨 나간 광자의 파장은
//
//   λ' = λ + λc (1 − cos θ)          λc = h/mc (콤프턴 파장)
//
// 이고, 전자는 둘의 운동량 차 p_e = p − p' 를 받아 되튄다. 운동량을 h 로 나눠 1/λ 로 센다 —
// 받은 운동량의 **비**만 화면에 쓰므로 h 는 필요 없다.
//
// 모든 것이 주기 안 시각의 함수다. 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ANGLES_DEG,
  COMPTON_PM,
  INCIDENT_PM,
  PACKET_CYCLES,
  PARK_RADIUS,
  PHOTON_SPEED,
  RECOIL_SPEED,
  SHIFTS_PM,
  WAVE_SCALE,
} from './schema';
import type { ComptonScatteringState } from './state';

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface ComptonConstants {
  /** 들어오는 광자의 파장(pm). */
  incidentWavelength: number;
  /** 전자의 콤프턴 파장 h/mc(pm). */
  comptonWavelength: number;
  /** 발마다 튕겨 나가는 각(도). */
  angles: readonly number[];
  /** 발마다 화면에 띄우는 파장 증가(pm) — 정박값. */
  shifts: readonly number[];
  /** 뭉치 하나의 물결 수. */
  packetCycles: number;
  /** 물결 간격 배율(월드/pm). */
  waveScale: number;
  /** 광자가 나는 빠르기(월드/초). */
  photonSpeed: number;
  /** 되튄 전자의 빠르기 배율(월드/초, 들어온 광자 운동량 하나당). */
  recoilSpeed: number;
}

export function readConstants(stage: StageDef): ComptonConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    incidentWavelength: c.incidentWavelength ?? INCIDENT_PM,
    comptonWavelength: c.comptonWavelength ?? COMPTON_PM,
    angles: [
      c.angle1 ?? ANGLES_DEG[0],
      c.angle2 ?? ANGLES_DEG[1],
      c.angle3 ?? ANGLES_DEG[2],
      c.angle4 ?? ANGLES_DEG[3],
      c.angle5 ?? ANGLES_DEG[4],
    ],
    shifts: [
      c.shift1 ?? SHIFTS_PM[0],
      c.shift2 ?? SHIFTS_PM[1],
      c.shift3 ?? SHIFTS_PM[2],
      c.shift4 ?? SHIFTS_PM[3],
      c.shift5 ?? SHIFTS_PM[4],
    ],
    packetCycles: c.packetCycles ?? PACKET_CYCLES,
    waveScale: c.waveScale ?? WAVE_SCALE,
    photonSpeed: c.photonSpeed ?? PHOTON_SPEED,
    recoilSpeed: c.recoilSpeed ?? RECOIL_SPEED,
  };
}

// ------------------------------------------------------------------------
// 단계 → 발
// ------------------------------------------------------------------------

/**
 * 발마다 들어옴 · 튕겨 나감 단계 id. 시간표 단계에 값을 실을 자리가 없어(장부 G13) 몇 번째
 * 각인지와의 짝을 여기 둔다. 길이 · 순서 · 캡션은 선언(`schema.timeline`)이 정한다.
 * 발 수는 스테이지 상수 각의 수와 같다 (장부 G105).
 */
export const SHOTS: readonly { in: string; out: string }[] = [
  { in: 'in-1', out: 'out-1' },
  { in: 'in-2', out: 'out-2' },
  { in: 'in-3', out: 'out-3' },
  { in: 'in-4', out: 'out-4' },
  { in: 'in-5', out: 'out-5' },
];

/** 한 주기가 끝나며 모두 흐려지는 단계. */
export const FADE_PHASE = 'fade';

// ------------------------------------------------------------------------
// 산란
// ------------------------------------------------------------------------

/** 각 θ(도)로 튕겨 나간 광자의 파장(pm). */
export function scatteredWavelength(thetaDeg: number, c: ComptonConstants): number {
  const th = (thetaDeg * Math.PI) / 180;
  return c.incidentWavelength + c.comptonWavelength * (1 - Math.cos(th));
}

/** 튕겨 나가는 방향(단위). 월드 +x 에서 반시계 — 위쪽 반원에 부채꼴로 펼친다. */
export function scatterDir(thetaDeg: number): Vec2 {
  const th = (thetaDeg * Math.PI) / 180;
  return [Math.cos(th), Math.sin(th)];
}

/**
 * 되튄 전자의 속도(월드/초). 운동량 p_e = p − p' 를 1/λ 로 세고, 들어온 광자 운동량(1/λ)을
 * 1 로 두어 `recoilSpeed` 를 곱한다. 광자가 위로 꺾이면 전자는 아래로 밀린다.
 */
export function recoilVelocity(thetaDeg: number, c: ComptonConstants): Vec2 {
  const [dx, dy] = scatterDir(thetaDeg);
  const ratio = c.incidentWavelength / scatteredWavelength(thetaDeg, c);
  return [(1 - ratio * dx) * c.recoilSpeed, -ratio * dy * c.recoilSpeed];
}

/** 파장(pm)의 뭉치 길이(월드). 물결 수가 같아 파장에 비례한다. */
export const packetLength = (lambdaPm: number, c: ComptonConstants): number =>
  c.packetCycles * lambdaPm * c.waveScale;

/** 튕겨 나간 광자가 멈춰 서는 머리 반지름(월드) — 꼬리가 `PARK_RADIUS` 에 온다. */
export const parkHead = (lambdaPm: number, c: ComptonConstants): number =>
  PARK_RADIUS + packetLength(lambdaPm, c);

// ------------------------------------------------------------------------
// 지금 화면
// ------------------------------------------------------------------------

/** 지금 날고 있는 들어오는 광자 — x 축 위, 머리 x 와 길이. 머리가 원점을 넘은 몫은 흡수됐다. */
export interface IncomingNow {
  head: number;
  length: number;
  lambda: number;
}

/** 튕겨 나간 광자 하나 — 방향 · 머리 반지름 · 파장 · 멈췄는지. */
export interface OutgoingNow {
  shot: number;
  dir: Vec2;
  head: number;
  length: number;
  lambda: number;
  parked: boolean;
}

/** 전자 하나 — 자리 · 속도(자취용) · 불투명도 · 지금 발의 전자인지. */
export interface ElectronNow {
  pos: Vec2;
  vel: Vec2;
  alpha: number;
  active: boolean;
}

export interface Snapshot {
  incoming?: IncomingNow;
  outgoing: OutgoingNow[];
  electrons: ElectronNow[];
  /** 주기 끝의 흐려짐 — 쌓인 것 모두에 곱한다. */
  alpha: number;
}

/** 단계 안에서 흐른 시간(초). 들어옴 · 튕겨 나감 단계는 이징이 없다(linear). */
const elapsed = (tl: TimelineFrame, id: string): number => tl.at(id) * tl.duration(id);

export function snapshot(tl: TimelineFrame, c: ComptonConstants): Snapshot {
  const alpha = 1 - tl.at(FADE_PHASE);
  const lambda0 = c.incidentWavelength;
  const len0 = packetLength(lambda0, c);
  const outgoing: OutgoingNow[] = [];
  const electrons: ElectronNow[] = [];
  let incoming: IncomingNow | undefined;

  const shots = Math.min(SHOTS.length, c.angles.length);
  for (let k = 0; k < shots; k++) {
    const ids = SHOTS[k]!;
    const theta = c.angles[k]!;

    // 들어옴 — 꼬리가 멈춘 뭉치들과 같은 반지름(PARK_RADIUS + 길이)에서 출발해 전자로 빨려 든다.
    if (tl.phase === ids.in) {
      incoming = { head: -PARK_RADIUS + c.photonSpeed * elapsed(tl, ids.in), length: len0, lambda: lambda0 };
      // 이번 발을 기다리는 전자가 가운데 쉰다.
      electrons.push({ pos: [0, 0], vel: [0, 0], alpha: 1, active: true });
    }

    const out = tl.at(ids.out);
    if (out <= 0) continue;

    // 튕겨 나감 — 원점에서 나와 멈춰 설 자리까지 같은 빠르기로 날고 그 뒤 멈춰 남는다.
    const lambda = scatteredWavelength(theta, c);
    const stop = parkHead(lambda, c);
    const head = Math.min(c.photonSpeed * elapsed(tl, ids.out), stop);
    outgoing.push({
      shot: k,
      dir: scatterDir(theta),
      head,
      length: packetLength(lambda, c),
      lambda,
      parked: head >= stop,
    });

    // 되튄 전자 — 이번 발 동안 날고, 다음 발이 들어오는 동안 흐려져 사라진다.
    const v = recoilVelocity(theta, c);
    const s = elapsed(tl, ids.out);
    const next = SHOTS[k + 1];
    const gone = next ? tl.at(next.in) : tl.at(FADE_PHASE);
    if (gone >= 1) continue;
    const active = tl.phase === ids.out;
    electrons.push({
      pos: [v[0] * s, v[1] * s],
      vel: active ? v : [0, 0],
      alpha: 1 - gone,
      active,
    });
  }

  return { incoming, outgoing, electrons, alpha };
}

export function step(params: { state: ComptonScatteringState }): ComptonScatteringState {
  return params.state;
}
