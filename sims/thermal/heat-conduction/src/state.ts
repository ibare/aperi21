// ========================================================================
// heat-conduction — 런타임 상태
// ========================================================================
// 온도 배열은 **쌓이는 값**이다. 시계만 앞당겨서는 화면이 비어 있으므로
// `schema.preroll` 이 마운트 전에 이 상태를 실제로 굴린다.
// ========================================================================

import {
  A_STEEL,
  A_WOOD,
  BEAD_COUNT,
  BEAD_SPACING_MM,
  N,
  px,
} from './schema';

/** 막대 밑면에 밀랍으로 붙인 구슬 하나. */
export interface Bead {
  /** 데운 끝에서의 거리(mm). */
  readonly xmm: number;
  /** 문턱을 넘었는가. **한 번 참이 되면 돌아오지 않는다.** */
  readonly released: boolean;
  /** 붙어 있던 자리에서 떨어진 깊이(월드). `FLOOR` 에서 멈춘다. */
  readonly y: number;
  /** 낙하 속도(월드/s). */
  readonly vy: number;
  /** 회전각(rad). */
  readonly rot: number;
  /** 회전 속도(rad/s). 구슬마다 다르다. */
  readonly vrot: number;
  /** 착지하며 옆으로 구르는 거리(월드). */
  readonly slide: number;
  /** 반지름(월드). */
  readonly r: number;
}

/** 막대 하나. 두 막대의 구조는 완전히 같고 `alpha` 만 다르다. */
export interface Rod {
  readonly id: 'steel' | 'wood';
  /** 열확산계수(mm²/s). */
  readonly alpha: number;
  /** 노드 N+1 개의 무차원 온도 θ. */
  readonly T: readonly number[];
  /** 60 ℃ 가 닿은 가장 먼 지점(mm). */
  readonly front: number;
  readonly beads: readonly Bead[];
}

export interface HeatConductionState {
  /** 조각 시계(초). 프리롤을 포함한다. */
  readonly t: number;
  /** 쇠 · 나무 순서. */
  readonly rods: readonly Rod[];
  /** 쇠막대 구슬이 모두 떨어졌는가. 캡션 슬롯의 `cases` 가 이 이름을 가리킨다. */
  readonly steelThrough: boolean;
  /** 나무막대 구슬이 하나라도 떨어졌는가. */
  readonly woodFell: boolean;
}

/**
 * 시드 난수 (mulberry32).
 *
 * 구슬의 크기·회전·구르는 거리는 하나씩 손으로 정할 값이 아니지만, 열 때마다
 * 달라져서도 안 된다 — `?t=` 로 찍은 화면과 실시간 화면이 갈린다. 그래서 시드를
 * 고정한다. `physics.step` 은 난수를 부르지 않는다 (S-sim: 순수 함수).
 */
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

function makeRod(id: Rod['id'], alpha: number, rand: () => number): Rod {
  const T = new Array<number>(N + 1).fill(0);
  // 데운 끝은 θ=1 (250 ℃) 로 고정한다.
  T[0] = 1;

  const beads: Bead[] = [];
  for (let j = 1; j <= BEAD_COUNT; j++) {
    beads.push({
      xmm: j * BEAD_SPACING_MM,
      released: false,
      y: 0,
      vy: 0,
      rot: 0,
      vrot: (rand() - 0.5) * 9,
      slide: px((rand() - 0.5) * 8),
      r: px(5.4 + rand() * 1.2),
    });
  }
  return { id, alpha, T, front: 0, beads };
}

/**
 * 초기 상태 — 아직 아무것도 데워지지 않은 순간.
 *
 * "도착한 순간 이미 진행 중" 을 만드는 것은 여기가 아니라 `schema.preroll` 이다
 * (원칙 2 — 시작 시점은 저작 결정이라 선언에 둔다).
 */
export function initialState(): HeatConductionState {
  const rand = mulberry32(1);
  return {
    t: 0,
    rods: [makeRod('steel', A_STEEL, rand), makeRod('wood', A_WOOD, rand)],
    steelThrough: false,
    woodFell: false,
  };
}
