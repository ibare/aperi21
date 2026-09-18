// ========================================================================
// bohr-model — 순수 물리 · 배치 계산
// ========================================================================
// 쌓는 상태가 없다. 전자의 궤도 · 각 · 도약의 짙기, 빛 물결의 자리가 모두 시간표 시각과
// 스테이지 상수의 함수다. `step` 은 항등이다.
//
//   궤도 반지름   rₙ = n² a₀
//   각속도        ωₙ = ω₁ / n³
//   빛의 에너지   hf = E_위 − E_아래   (스테이지에 정박값으로 선언 — 1.89 eV · 10.2 eV)
//
// 빛의 색은 `@aperi21/plugin-optics` 의 파장 → 선형광 계산에서 얻는다. 가시광 밖은 색을 짓지 않는다.
// ========================================================================

import { VISIBLE_NM, wavelengthToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BOHR_RADIUS,
  E_INNER,
  E_MIDDLE,
  E_OUTER,
  JUMP_ANGLE,
  N_INNER,
  N_MIDDLE,
  N_OUTER,
  OMEGA_1,
  PACKET_AMPLITUDE,
  PACKET_LENGTH,
  PHOTON_INNER_EV,
  PHOTON_INNER_NM,
  PHOTON_OUTER_EV,
  PHOTON_OUTER_NM,
  PHOTON_SPEED,
  WAVE_SCALE,
} from './schema';
import type { BohrModelState } from './state';

/** 물결 한 파장을 몇 점으로 표본하는가. 촘촘한 자외선도 매끄럽게. */
const SAMPLES_PER_WAVE = 14;

export interface Level {
  /** 준위 번호. */
  n: number;
  /** 에너지의 크기(eV) — 화면에 `−{e} eV`. */
  e: number;
}

export interface Photon {
  /** 이 빛의 에너지(eV) · 파장(nm) 정박값. */
  ev: number;
  nm: number;
}

export interface BohrConstants {
  bohrRadius: number;
  /** 바깥 · 가운데 · 안쪽 준위. */
  outer: Level;
  middle: Level;
  inner: Level;
  /** 바깥 → 가운데, 가운데 → 안쪽 도약이 내는 빛. */
  photonOuter: Photon;
  photonInner: Photon;
  omega1: number;
  jumpAngle: number;
  waveScale: number;
  photonSpeed: number;
  packetLength: number;
  packetAmplitude: number;
}

export function readConstants(stage: StageDef): BohrConstants {
  const c = stage.constants ?? {};
  return {
    bohrRadius: c.bohrRadius ?? BOHR_RADIUS,
    outer: { n: c.nOuter ?? N_OUTER, e: c.eOuter ?? E_OUTER },
    middle: { n: c.nMiddle ?? N_MIDDLE, e: c.eMiddle ?? E_MIDDLE },
    inner: { n: c.nInner ?? N_INNER, e: c.eInner ?? E_INNER },
    photonOuter: { ev: c.photonOuterEv ?? PHOTON_OUTER_EV, nm: c.photonOuterNm ?? PHOTON_OUTER_NM },
    photonInner: { ev: c.photonInnerEv ?? PHOTON_INNER_EV, nm: c.photonInnerNm ?? PHOTON_INNER_NM },
    omega1: c.omega1 ?? OMEGA_1,
    jumpAngle: c.jumpAngle ?? JUMP_ANGLE,
    waveScale: c.waveScale ?? WAVE_SCALE,
    photonSpeed: c.photonSpeed ?? PHOTON_SPEED,
    packetLength: c.packetLength ?? PACKET_LENGTH,
    packetAmplitude: c.packetAmplitude ?? PACKET_AMPLITUDE,
  };
}

/** 궤도 반지름(월드) — rₙ = n² a₀. */
export const orbitRadius = (n: number, c: BohrConstants): number => n * n * c.bohrRadius;

/** 각속도(rad/s) — ωₙ = ω₁ / n³. */
export const orbitOmega = (n: number, c: BohrConstants): number => c.omega1 / (n * n * n);

/** 궤도 n 위 각 θ 의 자리. */
export const onOrbit = (n: number, theta: number, c: BohrConstants): Vec2 => [
  orbitRadius(n, c) * Math.cos(theta),
  orbitRadius(n, c) * Math.sin(theta),
];

/** 전자 하나의 모습 — 어느 궤도, 어느 각, 얼마나 짙게. 도약 중에는 둘이 겹친다(교차 페이드). */
export interface ElectronView {
  n: number;
  theta: number;
  alpha: number;
}

/** 한 도약 — 어디서 어디로, 어느 각에서, 얼마나 진행했는가. */
export interface Jump {
  from: Level;
  to: Level;
  photon: Photon;
  /** 건너뛴 자리의 각. */
  theta: number;
  /** 도약 단계 진행도 0~1 (전 0, 뒤 1). */
  progress: number;
  /** 도약이 시작된 뒤 흐른 시간(초). 시작 전이면 음수. */
  age: number;
  /** 도약 뒤 빛이 날아가는 단계의 진행도 0~1 — 자국이 옅어지는 정도. */
  after: number;
}

/**
 * 두 도약의 각. **단계 경계는 선언이 정한다** — 도약 시각 · 궤도를 도는 시간을 모두
 * 시간표에 묻는다 (S-piece). 첫 도약은 `jumpAngle` 에서 일어나고, 둘째는 가운데 궤도를
 * `flyOuter` 동안 돈 만큼 더 간 자리에서 일어난다.
 */
function jumpAngles(tl: TimelineFrame, c: BohrConstants): [number, number] {
  const first = c.jumpAngle;
  const second = first + orbitOmega(c.middle.n, c) * (tl.start('jumpInner') - tl.end('jumpOuter'));
  return [first, second];
}

export function readJumps(tl: TimelineFrame, c: BohrConstants): [Jump, Jump] {
  const [a1, a2] = jumpAngles(tl, c);
  return [
    {
      from: c.outer,
      to: c.middle,
      photon: c.photonOuter,
      theta: a1,
      progress: tl.at('jumpOuter'),
      age: tl.u - tl.start('jumpOuter'),
      after: tl.at('flyOuter'),
    },
    {
      from: c.middle,
      to: c.inner,
      photon: c.photonInner,
      theta: a2,
      progress: tl.at('jumpInner'),
      age: tl.u - tl.start('jumpInner'),
      after: tl.at('flyInner'),
    },
  ];
}

/**
 * 지금 전자의 모습. 각은 도약 자리에 맞춰 되짚는다 — 바깥 궤도에서는 첫 도약 자리에서
 * 거꾸로, 가운데 · 안쪽 궤도에서는 막 건너온 자리에서 앞으로 돈다. 도약 동안 각은 멈추고
 * 옛 궤도의 전자가 옅어지며 새 궤도의 전자가 짙어진다 — 사이를 지나가지 않는다.
 */
export function readElectron(tl: TimelineFrame, c: BohrConstants): ElectronView[] {
  const [a1, a2] = jumpAngles(tl, c);
  const show = tl.at('enter') * (1 - tl.at('fade'));
  const p1 = tl.at('jumpOuter');
  const p2 = tl.at('jumpInner');

  if (p1 < 1) {
    const theta = a1 - orbitOmega(c.outer.n, c) * Math.max(0, tl.start('jumpOuter') - tl.u);
    const out: ElectronView[] = [{ n: c.outer.n, theta, alpha: show * (1 - p1) }];
    if (p1 > 0) out.push({ n: c.middle.n, theta: a1, alpha: show * p1 });
    return out;
  }
  if (p2 === 0) {
    const theta = a1 + orbitOmega(c.middle.n, c) * (tl.u - tl.end('jumpOuter'));
    return [{ n: c.middle.n, theta, alpha: show }];
  }
  if (p2 < 1) {
    return [
      { n: c.middle.n, theta: a2, alpha: show * (1 - p2) },
      { n: c.inner.n, theta: a2, alpha: show * p2 },
    ];
  }
  const theta = a2 + orbitOmega(c.inner.n, c) * (tl.u - tl.end('jumpInner'));
  return [{ n: c.inner.n, theta, alpha: show }];
}

/** 이 빛이 눈에 보이는 빛인가 — 가시광 밖은 색을 짓지 않는다. */
export const isVisible = (nm: number): boolean => nm >= VISIBLE_NM.min && nm <= VISIBLE_NM.max;

/** 빛의 색(선형광). 가시광 밖에서는 부르지 않는다. */
export const photonLight = (nm: number): LinearRgb => wavelengthToLinearRgb(nm);

/** 날아가는 빛 물결 하나의 선언 재료. */
export interface PhotonWave {
  /** 물결 선 — 화면에 남은 부분만. 비었으면 그리지 않는다. */
  points: Vec2[];
  /** 이름표 자리 — 묶음 가운데 위. */
  labelAt: Vec2;
  /** 묶음이 나온 자리를 다 빠져나왔는가 — 그 전에는 이름표가 궤도선에 얹혀 붙이지 않는다. */
  emerged: boolean;
}

/**
 * 빛 물결 묶음. 도약 자리 `origin` 에서 +x 로 날아간다. 머리는 `origin + 속력 × 나이`, 묶음 길이는
 * `packetLength` 이고 물결 간격은 파장 × `waveScale` 이다. 나온 자리보다 뒤(원자 안쪽)는 그리지
 * 않아, 도약한 순간 그 자리에서 물결이 **자라 나오는** 것으로 보인다. 오른쪽 경계 `maxX` 밖도 뺀다.
 */
export function photonWave(origin: Vec2, age: number, photon: Photon, c: BohrConstants, maxX: number): PhotonWave {
  const head = origin[0] + c.photonSpeed * age;
  const tail = head - c.packetLength;
  const lambda = photon.nm * c.waveScale;
  const from = Math.max(origin[0], tail);
  const to = Math.min(head, maxX);
  const points: Vec2[] = [];
  if (to > from) {
    const steps = Math.max(2, Math.ceil(((to - from) / lambda) * SAMPLES_PER_WAVE));
    for (let i = 0; i <= steps; i++) {
      const x = from + ((to - from) * i) / steps;
      // 묶음 모양 — 양 끝이 0 인 sin 봉우리. 물결은 머리에 맞춰 흐른다.
      const env = Math.sin((Math.PI * (x - tail)) / c.packetLength);
      const y = origin[1] + c.packetAmplitude * env * Math.sin((2 * Math.PI * (x - head)) / lambda);
      points.push([x, y]);
    }
  }
  return {
    points,
    labelAt: [head - c.packetLength / 2, origin[1] + c.packetAmplitude],
    emerged: tail >= origin[0],
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: BohrModelState }): BohrModelState {
  return params.state;
}
