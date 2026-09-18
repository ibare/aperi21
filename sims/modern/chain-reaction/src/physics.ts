// ========================================================================
// chain-reaction — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 핵 배치 · 세대마다 쪼개지는 핵 · 중성자가 가는 곳은 모두 스테이지
// 상수와 시드의 함수이고, 화면의 움직임은 시간표 진행도의 함수다. `step` 은 항등이다.
//
// 세대의 규칙 — g 세대 분열이 N_g 개면 나온 중성자는 ν·N_g 개이고, 그중
// N_{g+1} = ⌊k·N_g⌋ 개가 이웃 핵에 닿아 다음 세대를 쪼갠다. 나머지는 빠져나가 사라진다.
// 알갱이는 정수라 평균 k 를 내림으로 옮긴다 — k = 0.5 에서 2 → 1 → 0 으로 꺼진다.
//
// 닿는 중성자의 과녁 — 부모 핵에서 가장 가까운, 아직 쪼개지지도 과녁이 되지도 않은 핵.
// 그래서 분열이 한 점에서 바깥으로 번진다. 어느 부모의 어느 중성자가 닿는지 · 빠지는
// 중성자의 방향은 (시드, 판)으로 뽑는다 — 같은 선언은 언제나 같은 연쇄를 만든다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  GENERATIONS,
  K_CRITICAL,
  K_SUB,
  K_SUPER,
  LATTICE_COLS,
  LATTICE_JITTER,
  LATTICE_ROWS,
  LATTICE_SPACING,
  LOST_FLIGHT,
  NEUTRONS_PER_FISSION,
  SEED,
  START_FISSIONS,
} from './schema';
import type { ChainReactionState } from './state';

export interface ChainReactionConstants {
  /** 세 판의 k — 왼쪽 · 가운데 · 오른쪽. */
  ks: readonly [number, number, number];
  startFissions: number;
  neutronsPerFission: number;
  generations: number;
  seed: number;
}

/**
 * 스테이지 상수를 기본값과 함께 읽는다 (원칙 2).
 *
 * k 가 ν 를 넘으면 던진다 — 나온 중성자가 모두 닿아도 ν 개라 그 k 는 화면에서 일어날 수 없다.
 */
export function readConstants(stage: StageDef): ChainReactionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const k: ChainReactionConstants = {
    ks: [c.kSuper ?? K_SUPER, c.kCritical ?? K_CRITICAL, c.kSub ?? K_SUB],
    startFissions: c.startFissions ?? START_FISSIONS,
    neutronsPerFission: c.neutronsPerFission ?? NEUTRONS_PER_FISSION,
    generations: c.generations ?? GENERATIONS,
    seed: c.seed ?? SEED,
  };
  for (const kv of k.ks) {
    if (kv < 0 || kv > k.neutronsPerFission) {
      throw new Error('chain-reaction: k 는 0 이상 neutronsPerFission 이하여야 한다');
    }
  }
  return k;
}

/** 캡션 `vars` 가 가리킬 문자열 — 선언된 정수를 그대로 쓴다 (장부 G133). */
export function captionOf(k: ChainReactionConstants): ChainReactionState['caption'] {
  return { n0: String(k.startFissions), nu: String(k.neutronsPerFission) };
}

// ------------------------------------------------------------------------
// 시드 결정적 난수
// ------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = s;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** 시드를 흩는 소수 — 판마다 · 쓰임마다 다른 난수열을 뽑는다. */
const SALT_LATTICE = 7919;
const SALT_PANEL = 104729;

// ------------------------------------------------------------------------
// 연료 — 흔들린 육각 격자. 격자 중심이 원점이다.
// ------------------------------------------------------------------------

/** 핵 자리들(판 안 좌표). 시드만의 함수라 세 판이 같은 연료를 갖는다. */
export function latticeOf(seed: number): Vec2[] {
  const rand = mulberry32(seed * SALT_LATTICE);
  const dy = (LATTICE_SPACING * Math.sqrt(3)) / 2;
  const x0 = -((LATTICE_COLS - 1) * LATTICE_SPACING) / 2 - LATTICE_SPACING / 4;
  const y0 = -((LATTICE_ROWS - 1) * dy) / 2;
  const out: Vec2[] = [];
  for (let r = 0; r < LATTICE_ROWS; r++) {
    for (let c = 0; c < LATTICE_COLS; c++) {
      const x = x0 + c * LATTICE_SPACING + (r % 2) * (LATTICE_SPACING / 2);
      const y = y0 + r * dy;
      out.push([x + (rand() * 2 - 1) * LATTICE_JITTER, y + (rand() * 2 - 1) * LATTICE_JITTER]);
    }
  }
  return out;
}

// ------------------------------------------------------------------------
// 연쇄 — 세대마다 쪼개지는 핵과 중성자
// ------------------------------------------------------------------------

/** 분열 하나가 내놓은 중성자 하나. */
export interface NeutronPlan {
  /** 부모 핵(격자 번호). */
  from: number;
  /** 날아가는 방향(단위 벡터) — 튀어나오는 자리를 정한다. */
  dir: Vec2;
  /** 닿는 핵(격자 번호). 빠져나가는 중성자는 없다. */
  target?: number;
  /** 빠져나가는 중성자가 이 세대 동안 가서 사라지는 자리. */
  lostTo?: Vec2;
}

export interface ChainPlan {
  /** 세대마다 쪼개지는 핵(격자 번호). 길이 = generations. 꺼진 뒤 세대는 빈 목록. */
  fissions: number[][];
  /** g 세대 분열이 내놓은 중성자들. 마지막 세대는 비운다 — 주기가 거기서 끝난다. */
  neutrons: NeutronPlan[][];
  /** 격자 번호 → 쪼개지는 세대(쪼개지지 않으면 없음). */
  splitAt: Map<number, number>;
}

const dist2 = (a: Vec2, b: Vec2): number => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

function unit(a: Vec2, b: Vec2): Vec2 {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  return [dx / l, dy / l];
}

/** 빠지는 중성자 방향의 흩어짐 — 바깥을 향한 방향에서 좌우로 이만큼(라디안)까지. */
const LOST_SPREAD = Math.PI * 0.45;

/**
 * 한 판의 연쇄를 짠다. 판 번호 `panel` 이 시드에 섞여 판마다 다른 부모 · 방향을 뽑되,
 * 연료(격자)와 0 세대는 세 판이 같다.
 */
export function planChain(nuclei: readonly Vec2[], k: number, K: ChainReactionConstants, panel: number): ChainPlan {
  const rand = mulberry32(K.seed * SALT_LATTICE + (panel + 1) * SALT_PANEL);
  const used = new Set<number>();
  const splitAt = new Map<number, number>();

  const nearest = (p: Vec2): number | undefined => {
    let best: number | undefined;
    let bestD = Infinity;
    nuclei.forEach((q, i) => {
      if (used.has(i)) return;
      const d = dist2(p, q);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  // 0 세대 — 격자 중심에 가장 가까운 핵들.
  const gen0: number[] = [];
  for (let i = 0; i < K.startFissions; i++) {
    const n = nearest([0, 0]);
    if (n === undefined) break;
    used.add(n);
    gen0.push(n);
  }

  const fissions: number[][] = [gen0];
  const neutrons: NeutronPlan[][] = [];
  for (let g = 0; g < K.generations; g++) {
    const parents = fissions[g]!;
    parents.forEach((i) => splitAt.set(i, g));
    if (g === K.generations - 1) {
      neutrons.push([]);
      break;
    }
    // 닿는 중성자 수 — 평균 k 를 내림. 부동소수 오차로 1 이 0.999… 가 되지 않게 조금 더한다.
    const hits = Math.floor(k * parents.length + 1e-9);
    // 어느 부모가 먼저 닿는 중성자를 받는지 섞는다. 부모마다 ν 개 칸이 있고, 닿는 것을 돌아가며 나눈다.
    const order = parents.slice();
    for (let a = order.length - 1; a > 0; a--) {
      const b = Math.floor(rand() * (a + 1));
      [order[a], order[b]] = [order[b]!, order[a]!];
    }
    const hitCount = new Map<number, number>();
    for (let h = 0; h < hits; h++) {
      const p = order[h % order.length]!;
      hitCount.set(p, (hitCount.get(p) ?? 0) + 1);
    }

    const out: NeutronPlan[] = [];
    const next: number[] = [];
    for (const p of order) {
      const pp = nuclei[p]!;
      const nh = hitCount.get(p) ?? 0;
      for (let s = 0; s < K.neutronsPerFission; s++) {
        const target = s < nh ? nearest(pp) : undefined;
        if (target !== undefined) {
          used.add(target);
          next.push(target);
          out.push({ from: p, dir: unit(pp, nuclei[target]!), target });
          continue;
        }
        // 빠져나간다 — 판 바깥을 향한 방향 둘레에서 뽑는다.
        const r = Math.hypot(pp[0], pp[1]);
        const base = r > 1e-6 ? Math.atan2(pp[1], pp[0]) : rand() * Math.PI * 2;
        const a = base + (s % 2 === 0 ? 1 : -1) * rand() * LOST_SPREAD;
        const dir: Vec2 = [Math.cos(a), Math.sin(a)];
        out.push({ from: p, dir, lostTo: [pp[0] + dir[0] * LOST_FLIGHT, pp[1] + dir[1] * LOST_FLIGHT] });
      }
    }
    neutrons.push(out);
    fissions.push(next);
  }
  return { fissions, neutrons, splitAt };
}

export function step(params: { state: ChainReactionState }): ChainReactionState {
  return params.state;
}
