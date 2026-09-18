// ========================================================================
// scale-of-universe — 순수 계산 · 배치
// ========================================================================
// 틀 한 변이 10^z m 이다. 지름이 10^e m 인 대상은 틀 × 10^(e − z) 크기로 그려진다 — 이 한 줄이
// 전부다. z 가 1 오르면 틀 속 모든 것이 10분의 1이 된다.
//
// z 는 시간표에서 나온다. 대상 i 로 물러나는 단계의 진행도 at(approach_i) 에 두 대상의 지수 차를
// 곱해 더하면, 단계 전에는 0 · 뒤에는 1 이라 경계를 상수로 가르지 않고도 지금 z 가 된다.
// 물러나는 단계는 linear 라 z 가 시간에 비례해 오른다 — 한 칸마다 같은 박자다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ATOM_CLOUD_COUNT,
  EXP_ATOM,
  EXP_CELL,
  EXP_EARTH,
  EXP_GALAXY,
  EXP_PERSON,
  EXP_SOLAR,
  EXP_UNIVERSE,
  GALAXY_STAR_COUNT,
  NUCLEUS_SHARE,
  ORBIT_EARTH_AU,
  ORBIT_JUPITER_AU,
  ORBIT_NEPTUNE_AU,
  ORBIT_SATURN_AU,
  ORBIT_URANUS_AU,
  SEED,
  SUN_SHARE,
  UNIVERSE_GALAXY_COUNT,
  type ScaleOfUniverseMessageKey,
} from './schema';
import type { ScaleOfUniverseState } from './state';

export interface ScaleOfUniverseConstants {
  expAtom: number;
  expCell: number;
  expPerson: number;
  expEarth: number;
  expSolar: number;
  expGalaxy: number;
  expUniverse: number;
  /** 태양계 그림의 궤도 반지름(AU) — 안쪽부터. */
  orbitsAu: readonly number[];
  /** 원자핵 · 태양 반지름을 대상 반지름에 대한 비로 키운 배율 — 실제로는 보이지 않는다. */
  nucleusShare: number;
  sunShare: number;
  seed: number;
  atomCloudCount: number;
  galaxyStarCount: number;
  universeGalaxyCount: number;
}

export function readConstants(stage: StageDef): ScaleOfUniverseConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    expAtom: c.expAtom ?? EXP_ATOM,
    expCell: c.expCell ?? EXP_CELL,
    expPerson: c.expPerson ?? EXP_PERSON,
    expEarth: c.expEarth ?? EXP_EARTH,
    expSolar: c.expSolar ?? EXP_SOLAR,
    expGalaxy: c.expGalaxy ?? EXP_GALAXY,
    expUniverse: c.expUniverse ?? EXP_UNIVERSE,
    orbitsAu: [
      c.orbitEarthAu ?? ORBIT_EARTH_AU,
      c.orbitJupiterAu ?? ORBIT_JUPITER_AU,
      c.orbitSaturnAu ?? ORBIT_SATURN_AU,
      c.orbitUranusAu ?? ORBIT_URANUS_AU,
      c.orbitNeptuneAu ?? ORBIT_NEPTUNE_AU,
    ],
    nucleusShare: c.nucleusShare ?? NUCLEUS_SHARE,
    sunShare: c.sunShare ?? SUN_SHARE,
    seed: c.seed ?? SEED,
    atomCloudCount: c.atomCloudCount ?? ATOM_CLOUD_COUNT,
    galaxyStarCount: c.galaxyStarCount ?? GALAXY_STAR_COUNT,
    universeGalaxyCount: c.universeGalaxyCount ?? UNIVERSE_GALAXY_COUNT,
  };
}

// ------------------------------------------------------------------------
// 사다리의 단 — 대상 일곱
// ------------------------------------------------------------------------

export type RungId = 'atom' | 'cell' | 'person' | 'earth' | 'solar' | 'galaxy' | 'universe';

export interface Rung {
  id: RungId;
  /** 지름(m)의 10 지수. */
  exp: number;
  /** 이 대상에 머무는 시간표 단계 id. */
  hold: string;
  /** 이 대상으로 물러나는 시간표 단계 id. 첫 대상(원자)은 없다. */
  approach?: string;
  name: ScaleOfUniverseMessageKey;
  size: ScaleOfUniverseMessageKey;
}

/**
 * 단 목록. 단 수 · 순서 · 단계 id 는 코드에 있고 지수만 스테이지 상수다 — 스테이지 상수가 수
 * 하나씩이라 목록을 선언할 수 없다 (장부 G105).
 */
export function rungs(c: ScaleOfUniverseConstants): readonly Rung[] {
  return [
    { id: 'atom', exp: c.expAtom, hold: 'atom', name: 'name.atom', size: 'size.atom' },
    { id: 'cell', exp: c.expCell, hold: 'cell', approach: 'toCell', name: 'name.cell', size: 'size.cell' },
    { id: 'person', exp: c.expPerson, hold: 'person', approach: 'toPerson', name: 'name.person', size: 'size.person' },
    { id: 'earth', exp: c.expEarth, hold: 'earth', approach: 'toEarth', name: 'name.earth', size: 'size.earth' },
    { id: 'solar', exp: c.expSolar, hold: 'solar', approach: 'toSolar', name: 'name.solar', size: 'size.solar' },
    { id: 'galaxy', exp: c.expGalaxy, hold: 'galaxy', approach: 'toGalaxy', name: 'name.galaxy', size: 'size.galaxy' },
    {
      id: 'universe',
      exp: c.expUniverse,
      hold: 'universe',
      approach: 'toUniverse',
      name: 'name.universe',
      size: 'size.universe',
    },
  ];
}

// ------------------------------------------------------------------------
// 시각 → 틀의 지수
// ------------------------------------------------------------------------

/** 지금 틀 한 변의 10 지수 z. 단계 경계는 선언이 정한다 — 진행도(`at`)만 읽는다. */
export function frameExponent(tl: TimelineFrame, list: readonly Rung[]): number {
  let z = list[0]!.exp;
  for (let i = 1; i < list.length; i++) {
    const r = list[i]!;
    if (r.approach) z += tl.at(r.approach) * (r.exp - list[i - 1]!.exp);
  }
  return z;
}

/** 그림 전체의 불투명도 0~1. 주기 처음에 나타나고 끝에 흐려진다. */
export function overallAlpha(tl: TimelineFrame): number {
  return tl.at('appear') * (1 - tl.at('fade'));
}

/** 대상의 지름 ÷ 틀 한 변 = 10^(e − z). */
export function relativeSize(exp: number, z: number): number {
  return Math.pow(10, exp - z);
}

// ------------------------------------------------------------------------
// 흩뿌림 — 단위 원(반지름 1) 안의 자리. scene 이 대상 반지름을 곱한다.
// ------------------------------------------------------------------------

/** 씨앗을 받는 결정적 난수(mulberry32). `Math.random` 을 쓰지 않는다 (S-sim). */
function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 대상마다 씨앗을 갈라 쓴다 — 같은 씨앗에서 뽑으면 구름 · 은하 · 우주가 같은 무늬를 갖는다. */
const SEED_OFFSET = { atom: 1, galaxy: 2, universe: 3 } as const;

/** 전자 구름이 시작하는 반지름 · 퍼진 폭(반지름 비). 핵 자리는 비운다. */
const ATOM_CLOUD_INNER = 0.12;
const ATOM_CLOUD_SPAN = 0.86;

/** 전자 구름 — 가운데가 짙고 바깥으로 옅어진다. 반지름은 두 난수의 곱(가운데 쏠림). */
export function atomCloud(c: ScaleOfUniverseConstants): Vec2[] {
  const rand = seededRandom(c.seed + SEED_OFFSET.atom);
  const out: Vec2[] = [];
  for (let n = 0; n < c.atomCloudCount; n++) {
    const r = ATOM_CLOUD_INNER + ATOM_CLOUD_SPAN * Math.sqrt(rand() * rand());
    const a = 2 * Math.PI * rand();
    out.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return out;
}

/** 나선 은하 모양 — 팔 둘을 따라 감기는 별과 가운데 팽대부. */
const GALAXY_ARMS = 2;
/** 팔이 바깥으로 가며 감기는 각(라디안) — 반지름 1 당. */
const GALAXY_WIND = 4.4;
/** 별이 팔에서 흩어지는 폭(반지름 비). */
const GALAXY_ARM_SPREAD = 0.09;
/** 팽대부에 드는 별의 몫 · 팽대부 반지름. */
const GALAXY_BULGE_SHARE = 0.18;
const GALAXY_BULGE_RADIUS = 0.16;
/** 팔이 시작하는 · 끝나는 반지름. 흩어지는 폭을 더해도 대상 반지름(1) 안에 들도록 끝을 당긴다. */
const GALAXY_ARM_START = 0.12;
const GALAXY_ARM_END = 0.9;

export function galaxyStars(c: ScaleOfUniverseConstants): Vec2[] {
  const rand = seededRandom(c.seed + SEED_OFFSET.galaxy);
  const out: Vec2[] = [];
  for (let n = 0; n < c.galaxyStarCount; n++) {
    if (rand() < GALAXY_BULGE_SHARE) {
      const r = GALAXY_BULGE_RADIUS * Math.sqrt(rand());
      const a = 2 * Math.PI * rand();
      out.push([r * Math.cos(a), r * Math.sin(a)]);
      continue;
    }
    const arm = Math.floor(rand() * GALAXY_ARMS);
    const r = GALAXY_ARM_START + (GALAXY_ARM_END - GALAXY_ARM_START) * Math.sqrt(rand());
    const a = (arm * 2 * Math.PI) / GALAXY_ARMS + GALAXY_WIND * r;
    const jx = (rand() - 0.5) * 2 * GALAXY_ARM_SPREAD;
    const jy = (rand() - 0.5) * 2 * GALAXY_ARM_SPREAD;
    out.push([r * Math.cos(a) + jx, r * Math.sin(a) + jy]);
  }
  return out;
}

/** 관측 가능한 우주 — 은하가 고르게 흩어져 있다(넓이에 고르게). */
export function universeGalaxies(c: ScaleOfUniverseConstants): Vec2[] {
  const rand = seededRandom(c.seed + SEED_OFFSET.universe);
  const out: Vec2[] = [];
  for (let n = 0; n < c.universeGalaxyCount; n++) {
    const r = Math.sqrt(rand());
    const a = 2 * Math.PI * rand();
    out.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ScaleOfUniverseState }): ScaleOfUniverseState {
  return params.state;
}
