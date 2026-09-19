// ========================================================================
// electromagnet — 순수 물리 · 배치
// ========================================================================
// 못이 자석인 것은 코일에 전류가 흐르는 동안뿐이다. 전류는 스위치 날이 닿는 순간
// (`close` 단계 끝) 흐르기 시작하고, 날이 들리기 시작하는 순간(`open` 단계 시작)
// 끊긴다. 그동안만 극이 있고, 클립은 그 사이에 날아올라 매달렸다가 끊긴 뒤 떨어진다.
//
// 판마다 매달리는 클립 수는 스테이지 상수다. 감은 수 × 전류로 클립 수를 계산하지
// 않는다 — 쇠의 자화는 포화하고 클립 무게 · 접촉에 달려 있어 식 하나로 세면 틀린 수를
// 화면에 단정하게 된다(NOTES (b)).
//
// 모든 것이 시각의 함수라 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ARROW_SCALE,
  CELLS_BASE,
  CELLS_MORE,
  CHAIN_X,
  CLIPS_BASE,
  CLIPS_CURRENT,
  CLIPS_TURNS,
  CLIP_HALF_WIDTH,
  CLIP_LENGTH,
  CURRENT_BASE,
  CURRENT_MORE,
  PILE_CLIPS,
  PILE_HALF_SPREAD,
  ROUNDS,
  SEED,
  TABLE_Y,
  TURNS_BASE,
  TURNS_MORE,
  type Round,
} from './schema';
import type { ElectromagnetState } from './state';

export interface ElectromagnetConstants {
  turnsBase: number;
  turnsMore: number;
  currentBase: number;
  currentMore: number;
  cellsBase: number;
  cellsMore: number;
  clipsBase: number;
  clipsTurns: number;
  clipsCurrent: number;
  pileClips: number;
  seed: number;
  arrowScale: number;
}

export function readConstants(stage: StageDef): ElectromagnetConstants {
  const c = stage.constants ?? {};
  return {
    turnsBase: c.turnsBase ?? TURNS_BASE,
    turnsMore: c.turnsMore ?? TURNS_MORE,
    currentBase: c.currentBase ?? CURRENT_BASE,
    currentMore: c.currentMore ?? CURRENT_MORE,
    cellsBase: c.cellsBase ?? CELLS_BASE,
    cellsMore: c.cellsMore ?? CELLS_MORE,
    clipsBase: c.clipsBase ?? CLIPS_BASE,
    clipsTurns: c.clipsTurns ?? CLIPS_TURNS,
    clipsCurrent: c.clipsCurrent ?? CLIPS_CURRENT,
    pileClips: c.pileClips ?? PILE_CLIPS,
    seed: c.seed ?? SEED,
    arrowScale: c.arrowScale ?? ARROW_SCALE,
  };
}

// ------------------------------------------------------------------------
// 판
// ------------------------------------------------------------------------

/** 한 판이 쓰는 값 — 스테이지 상수에서 판 목록이 가리키는 것을 꺼낸다. */
export interface RoundValues {
  turns: number;
  current: number;
  cells: number;
  clips: number;
}

export function roundValues(r: Round, c: ElectromagnetConstants): RoundValues {
  return { turns: c[r.turns], current: c[r.current], cells: c[r.cells], clips: c[r.clips] };
}

/** 지금 판과 판 안의 진행도. 모두 시간표 선언에서 읽는다 — 경계를 코드에 두지 않는다. */
export interface RoundFrame {
  round: Round;
  now: RoundValues;
  /** 바로 앞 판(첫째 판이면 셋째 판)의 값. 감기 단계가 여기서 지금 판으로 옮겨 간다. */
  prev: RoundValues;
  /** 감기 진행도 0~1 — 전지 · 감은 수가 앞 판에서 지금 판으로. */
  wind: number;
  /** 스위치 날이 닿은 정도 0~1. 1 이면 닫혀 있다. */
  closed: number;
  /** 전류가 흐르는가 — 날이 다 닿았고 아직 들리기 시작하지 않았다. */
  flowing: boolean;
  /** 클립이 탁자 자리에서 사슬 자리로 옮겨 간 정도 0~1. */
  lifted: number;
}

export function roundFrame(tl: TimelineFrame, c: ElectromagnetConstants): RoundFrame {
  const i = ROUNDS.findIndex((r) => tl.u >= tl.start(`${r.id}-wind`) && tl.u < tl.end(`${r.id}-after`));
  const index = i < 0 ? ROUNDS.length - 1 : i;
  const round = ROUNDS[index]!;
  const prevRound = ROUNDS[(index + ROUNDS.length - 1) % ROUNDS.length]!;
  const at = (phase: string) => tl.at(`${round.id}-${phase}`);
  const opening = at('open');
  return {
    round,
    now: roundValues(round, c),
    prev: roundValues(prevRound, c),
    wind: at('wind'),
    closed: at('close') * (1 - opening),
    flowing: at('close') >= 1 && opening <= 0,
    lifted: at('lift') * (1 - at('fall')),
  };
}

// ------------------------------------------------------------------------
// 탁자 위 더미
// ------------------------------------------------------------------------

/** 시드 결정적 난수 (mulberry32). 같은 시드는 언제나 같은 수열이다 (S-sim). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 누운 클립의 기울기 한도(라디안). 더미가 가지런히 줄 서 보이지 않을 만큼만. */
const PILE_TILT = 0.3;
/** 더미 칸 안에서 옆으로 흔드는 몫(칸 폭 대비). */
const PILE_JITTER = 0.3;

/** 탁자 위 클립 하나 — 가운데와 긴 축의 각(라디안). */
export interface ClipPose {
  pos: Vec2;
  angle: number;
}

/**
 * 끝마다 탁자 위 더미. **사슬 x 에 가까운 것부터** 늘어선다 — 매달리는 k 개는 앞의
 * k 개다. 누운 클립은 가장 낮은 점이 탁자에 닿는 높이에 놓인다.
 */
export function pileLayout(c: ElectromagnetConstants): ClipPose[][] {
  const next = rng(c.seed);
  const count = Math.max(0, Math.round(c.pileClips));
  const cell = count > 0 ? (2 * PILE_HALF_SPREAD) / count : 0;
  return CHAIN_X.map((cx) => {
    const spots: ClipPose[] = [];
    for (let k = 0; k < count; k++) {
      const x = cx - PILE_HALF_SPREAD + cell * (k + 0.5) + (next() - 0.5) * cell * PILE_JITTER;
      const angle = (next() - 0.5) * 2 * PILE_TILT;
      const lift = (CLIP_LENGTH / 2) * Math.abs(Math.sin(angle)) + CLIP_HALF_WIDTH * Math.cos(angle);
      spots.push({ pos: [x, TABLE_Y + lift], angle });
    }
    return spots.sort((a, b) => Math.abs(a.pos[0] - cx) - Math.abs(b.pos[0] - cx));
  });
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ElectromagnetState }): ElectromagnetState {
  return params.state;
}
