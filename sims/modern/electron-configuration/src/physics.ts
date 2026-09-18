// ========================================================================
// electron-configuration — 순수 물리 · 배치 계산
// ========================================================================
// 쌓는 상태가 없다. 어느 원소 칸이 켜졌는지, 커서가 어디 있는지가 모두 시간표 시각과
// 스테이지 상수의 함수다. `step` 은 항등이다.
//
// 쌓음 원리 — 원자 번호 Z 의 원소는 Z-1 의 전자 배치에 전자 하나를 더한 것이고, 그 전자는
// 에너지가 가장 낮은 빈 부껍질로 간다. 36 번까지 그 순서는
//   1s(2) → 2s(2) → 2p(6) → 3s(2) → 3p(6) → 4s(2) → 3d(10) → 4p(6)
// 이다(괄호는 자리 수 — s 2 · p 6 · d 10). 원소를 이 순서로 늘어놓고, 바깥 껍질(ns · np)이
// 닫힐 때마다 줄을 바꾸면 주기율표의 칸 자리가 된다 —
//   s 부껍질의 k 번째 전자 → 1 + k 족,  d → 3 + k 족,  p → 13 + k 족,
//   줄(주기) = 그 줄에서 채우는 s 의 주양자수.
// 3d 는 4s 뒤에 차므로 넷째 줄에 놓인다. 헬륨은 1s 에 전자가 들지만 껍질이 닫힌 원소라
// 관례대로 18 족에 둔다.
//
// 크로뮴(24) · 구리(29)는 실제 바닥 상태가 4s¹ 3dⁿ⁺¹ 로 이 순서에서 벗어난다. 칸 자리는 같아서
// 이 조각의 주장(표의 모양)은 달라지지 않는다 — 배치 표기를 화면에 두지 않는다 (NOTES (b)).
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { ELEMENT_COUNT, ROW_PITCH } from './schema';
import type { ElectronConfigurationState } from './state';

/**
 * 원소 기호 — 원자 번호 1 ~ 36. 기호는 표식이다(번역하지 않는다, C1). 목록이 코드에 남는다
 * — 스테이지 상수는 수 하나씩이라 목록을 선언할 수 없다 (NOTES (c) G105).
 */
export const SYMBOLS = [
  'H', 'He',
  'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
  'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar',
  'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr',
] as const;

export type Block = 's' | 'p' | 'd';

/** 부껍질 하나 — 이름(표식), 놓이는 줄(주기), 블록. 자리 수는 블록이 정한다. */
export interface Subshell {
  id: string;
  row: number;
  block: Block;
}

/** 부껍질 하나의 자리 수 — 각운동량 l 에서 2(2l + 1). 물리라 선언값이 아니다. */
export const SEATS: Record<Block, number> = { s: 2, p: 6, d: 10 };

/** 블록이 시작하는 족. 표의 관례 — s 는 1 · 2 족, d 는 3 ~ 12 족, p 는 13 ~ 18 족. */
export const BLOCK_FIRST_GROUP: Record<Block, number> = { s: 1, d: 3, p: 13 };

/**
 * 쌓음 원리 순서(36 번까지). 시간표의 `fill-<id>-<k>` 단계와 같은 이름 · 같은 순서다.
 * 목록이 코드에 남는다 (NOTES (c) G105).
 */
export const AUFBAU: readonly Subshell[] = [
  { id: '1s', row: 1, block: 's' },
  { id: '2s', row: 2, block: 's' },
  { id: '2p', row: 2, block: 'p' },
  { id: '3s', row: 3, block: 's' },
  { id: '3p', row: 3, block: 'p' },
  { id: '4s', row: 4, block: 's' },
  { id: '3d', row: 4, block: 'd' },
  { id: '4p', row: 4, block: 'p' },
];

/** 18 족 — 껍질이 닫힌 원소의 자리. */
const LAST_GROUP = 18;

export interface ElectronConfigurationConstants {
  elementCount: number;
}

export function readConstants(stage: StageDef): ElectronConfigurationConstants {
  const c = stage.constants ?? {};
  const elementCount = c.elementCount ?? ELEMENT_COUNT;
  if (!Number.isInteger(elementCount) || elementCount < 1 || elementCount > SYMBOLS.length) {
    throw new Error(`electron-configuration: elementCount 는 1 ~ ${SYMBOLS.length} 의 정수여야 한다`);
  }
  return { elementCount };
}

/** 족 · 주기 → 칸 가운데(월드). 1 족 · 1 주기가 원점. */
export const cellPos = (group: number, row: number): Vec2 => [group - 1, -(row - 1) * ROW_PITCH];

/** 부껍질의 k 번째 자리(0 부터)가 놓이는 족. */
export function groupOf(s: Subshell, k: number): number {
  // 헬륨 — 1s 의 둘째 전자로 첫 껍질이 닫힌다. 닫힌 원소는 18 족에 선다.
  if (s.row === 1 && k === SEATS.s - 1) return LAST_GROUP;
  return BLOCK_FIRST_GROUP[s.block] + k;
}

/** 원소 칸 하나. */
export interface Cell {
  z: number;
  symbol: string;
  subshell: Subshell;
  group: number;
  row: number;
  pos: Vec2;
}

/** 쌓음 원리 순서대로 늘어놓은 원소 칸 — 원자 번호 순. */
export function cellsInOrder(c: ElectronConfigurationConstants): Cell[] {
  const out: Cell[] = [];
  for (const s of AUFBAU) {
    for (let k = 0; k < SEATS[s.block]; k++) {
      const z = out.length + 1;
      if (z > c.elementCount) return out;
      const group = groupOf(s, k);
      out.push({ z, symbol: SYMBOLS[z - 1]!, subshell: s, group, row: s.row, pos: cellPos(group, s.row) });
    }
  }
  return out;
}

/** 칸 하나의 지금 모습 — 얼마나 켜졌나(0~1). */
export interface CellView extends Cell {
  lit: number;
}

/**
 * 원소 칸의 켜짐 — 그 자리의 단계 `fill-<부껍질>-<k>` 의 진행도 그대로다. 전자 하나가 단계 하나라
 * 켜지는 구간은 시간표 선언이 정한다 (S-piece).
 */
export function readCells(tl: TimelineFrame, c: ElectronConfigurationConstants): CellView[] {
  return cellsInOrder(c).map((cell) => ({ ...cell, lit: tl.at(seatPhase(cell.subshell, seatIndex(cell))) }));
}

/** 부껍질의 k 번째 자리를 채우는 단계 id — schema `fill()` 과 같은 이름. */
export const seatPhase = (s: Subshell, k: number): string => `fill-${s.id}-${k}`;

/** 칸이 그 부껍질의 몇 번째 자리인가. */
function seatIndex(cell: Cell): number {
  if (cell.row === 1 && cell.group === LAST_GROUP) return SEATS.s - 1;
  return cell.group - BLOCK_FIRST_GROUP[cell.subshell.block];
}

/**
 * 커서 — 지금 들어오는 원소의 칸. 켜지는 중인 칸이 있으면 바로 앞 칸에서 그 칸으로
 * 켜짐만큼 옮겨 가 있고, 없으면 마지막으로 켜진 칸에 있다. 줄이 닫힌 뒤 다음 원소는
 * 다음 줄 맨 앞이라, 커서가 줄 끝에서 다음 줄 첫 칸으로 넘어간다.
 */
export function readCursor(cells: readonly CellView[]): Vec2 | null {
  let last = -1;
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]!;
    if (cell.lit <= 0) break;
    last = i;
    if (cell.lit < 1) {
      const from = i > 0 ? cells[i - 1]!.pos : cell.pos;
      return lerp(from, cell.pos, cell.lit);
    }
  }
  return last >= 0 ? cells[last]!.pos : null;
}

/** 지금 채우는 부껍질 — 지금 단계가 그 부껍질의 자리 단계 중 하나면 그 부껍질. 아니면 null. */
export function fillingSubshell(tl: TimelineFrame): Subshell | null {
  return AUFBAU.find((s) => tl.phase.startsWith(`fill-${s.id}-`)) ?? null;
}

/** 부껍질이 채우기 시작했는가 — 첫 자리 단계의 진행도가 0 보다 크다. */
export const hasStarted = (tl: TimelineFrame, s: Subshell): boolean => tl.at(seatPhase(s, 0)) > 0;

const lerp = (a: Vec2, b: Vec2, f: number): Vec2 => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];

export function step(params: { state: ElectronConfigurationState }): ElectronConfigurationState {
  return params.state;
}
