// ========================================================================
// dielectric — 순수 물리
// ========================================================================
// 전지에서 뗀 판은 전하 Q 가 고정이다. 유전율 κ 인 판이 길이 비율 f 만큼 판 사이를
// 채우면(옆으로 나란히 채움), 두 판은 도체라 어디서나 전위차가 같고 장도 어디서나 같다 —
//   C = C₀ (1 + (κ − 1) f),  E = E₀ / (1 + (κ − 1) f)
// 다 채우면 E₀/κ 다. 같은 전위차를 두 구간이 나누므로 판의 자유 전하는 유전체 위에서
// κ 배 촘촘하다 — 표식 수(Q)는 그대로이고 자리만 유전체 쪽으로 몰린다.
//
// 분자 쌍극자는 장 밖에서 시드로 뽑은 무작위 방향이고, 판 가장자리를 지나며 장 방향
// (아래 — + 판에서 − 판으로)으로 돌아선다. 다 선 쌍극자는 유전체 윗면에 − 끝,
// 아랫면에 + 끝을 드러낸다(묶인 전하).
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  CHARGE_MARKS,
  FIELD_ARROW_LENGTH,
  FRINGE,
  KAPPA,
  MOLECULE_COLUMNS,
  MOLECULE_ROWS,
  PARK_GAP,
  PLATE_GAP,
  PLATE_LENGTH,
  PLATE_X0,
  SEED,
} from './schema';
import type { DielectricState } from './state';

export interface DielectricConstants {
  /** 유전율 κ. */
  kappa: number;
  /** 판 간격 · 판 길이(월드 단위). */
  plateGap: number;
  plateLength: number;
  /** 판 한 장의 자유 전하 표식 수. */
  chargeMarks: number;
  /** 분자 쌍극자 열 · 행 수. */
  moleculeColumns: number;
  moleculeRows: number;
  /** 쌍극자 무작위 방향의 시드. */
  seed: number;
  /** 표시 배율 — 장 E 의 화살표 길이(월드 단위). */
  fieldArrowLength: number;
  /** 판 가장자리 장의 폭(월드 단위). */
  fringe: number;
}

export function readConstants(stage: StageDef): DielectricConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    kappa: c.kappa ?? KAPPA,
    plateGap: c.plateGap ?? PLATE_GAP,
    plateLength: c.plateLength ?? PLATE_LENGTH,
    chargeMarks: c.chargeMarks ?? CHARGE_MARKS,
    moleculeColumns: c.moleculeColumns ?? MOLECULE_COLUMNS,
    moleculeRows: c.moleculeRows ?? MOLECULE_ROWS,
    seed: c.seed ?? SEED,
    fieldArrowLength: c.fieldArrowLength ?? FIELD_ARROW_LENGTH,
    fringe: c.fringe ?? FRINGE,
  };
}

/** 유전체가 멈춰 있는 두 그림. 장 이름표(E · E/κ)는 이때만 붙는다. */
export type Settled = 'empty' | 'filled';

export interface SlabReading {
  /** 유전체 판의 왼쪽 끝(월드). */
  slabLeft: number;
  /** 판 사이를 유전체가 채운 길이 비율 0~1. */
  filled: number;
  /** 지금 장 / 유전체 없는 장 — 1 에서 1/κ 까지. */
  fieldRatio: number;
  /** 유전체가 멈춰 있으면 그 그림, 움직이는 중이면 없다. */
  settled?: Settled;
}

/**
 * 유전체를 읽는다. **단계 경계는 선언이 정한다** — 들어간 정도를 시간표의 `at()` 에서
 * 읽는다(이징도 선언의 `smooth`). 밀어 넣기와 빼기가 서로 빼지는 꼴이라 분기 없이 한 식이다.
 */
export function readSlab(tl: TimelineFrame, c: DielectricConstants): SlabReading {
  const travel = tl.at('insert') - tl.at('withdraw');
  const plateRight = PLATE_X0 + c.plateLength;
  const parked = plateRight + PARK_GAP;
  const slabLeft = parked + (PLATE_X0 - parked) * travel;
  const filled = clamp01((plateRight - slabLeft) / c.plateLength);
  const settled: Settled | undefined =
    tl.phase === 'empty' || tl.phase === 'filled' ? tl.phase : undefined;
  return {
    slabLeft,
    filled,
    fieldRatio: 1 / (1 + (c.kappa - 1) * filled),
    settled,
  };
}

/**
 * 판 위 자유 전하 표식의 가로 자리(판 왼쪽 끝에서 잰 거리).
 *
 * 표식 i 는 전하 누적 몫 (i + ½)/n 에 놓인다. 유전체가 덮은 오른쪽 구간은 전하 밀도가
 * κ 배라 누적 몫이 κ 배 빨리 찬다 — 그 역함수로 자리를 얻는다. 덮은 길이가 바뀌면 자리가
 * 이어서 미끄러지고 튀지 않는다.
 */
export function markLayout(marks: number, length: number, filled: number, kappa: number): number[] {
  const bare = length * (1 - filled);
  const covered = length * filled;
  const total = bare + kappa * covered;
  const out: number[] = [];
  for (let i = 0; i < marks; i++) {
    const w = ((i + 0.5) / marks) * total;
    out.push(w <= bare ? w : bare + (w - bare) / kappa);
  }
  return out;
}

/** 쌍극자 하나 — 유전체 판 안의 자리(판 왼쪽 아래에서 잰 몫 0~1)와 장 밖 방향. */
export interface Molecule {
  /** 유전체 판 안의 가로 · 세로 몫(0~1). */
  u: number;
  v: number;
  /** 장 밖에서의 쌍극자 방향(라디안, − 에서 + 로). */
  rest: number;
}

/** 쌍극자 격자. 방향은 (시드, 번호)의 함수라 같은 시각은 언제나 같은 화면이다. */
export function molecules(c: DielectricConstants): Molecule[] {
  const out: Molecule[] = [];
  const cols = Math.max(1, Math.round(c.moleculeColumns));
  const rows = Math.max(1, Math.round(c.moleculeRows));
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const i = r * cols + k;
      out.push({
        u: (k + 0.5) / cols,
        v: (r + 0.5) / rows,
        rest: hash01(c.seed, i) * Math.PI * 2,
      });
    }
  }
  return out;
}

/** 장 방향 — + 판(위)에서 − 판(아래)으로. 선 쌍극자의 − 에서 + 로 향하는 방향이다. */
export const FIELD_ANGLE = -Math.PI / 2;

/**
 * 쌍극자가 장을 따라 선 정도 0~1. 판 가장자리(`plateRight`)를 중심으로 `fringe` 폭 안에서
 * 0 에서 1 로 오른다 — 판 사이 깊이 들어가 있으면 1, 판 밖이면 0.
 */
export function alignment(x: number, plateLeft: number, plateRight: number, fringe: number): number {
  const half = fringe / 2;
  const fromRight = clamp01((plateRight + half - x) / fringe);
  const fromLeft = clamp01((x - (plateLeft - half)) / fringe);
  return Math.min(fromRight, fromLeft);
}

/** 쉬던 방향에서 장 방향으로 짧은 쪽으로 `a` 만큼 돈 방향. */
export function dipoleAngle(rest: number, a: number): number {
  let d = FIELD_ANGLE - rest;
  d = Math.atan2(Math.sin(d), Math.cos(d));
  return rest + d * a;
}

/** (시드, 번호) → [0, 1). 결정적이다 — 같은 번호는 언제나 같은 값. */
function hash01(seed: number, i: number): number {
  let h = (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(i + 1, 0x85ebca6b)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: DielectricState }): DielectricState {
  return params.state;
}
