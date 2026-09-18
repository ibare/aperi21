// ========================================================================
// spin — 순수 물리 · 배치 계산
// ========================================================================
// 쌓는 상태가 없다. 원자마다의 갈래 · 보낸 시각은 (시드, 주기 번호, 부)의 함수이고, 그 원자가 지금
// 어디 있는지는 보낸 뒤 흐른 시간의 함수다. `step` 은 항등이다.
//
// 장치마다 + 로 나오는 몫(비율)은 스테이지 상수다. 원자 하나하나는 무작위로 갈리지만, 한 장치에 들어간
// 원자 중 **정확히** 몫만큼이 + 로 나오도록 (시드, 주기)로 자리를 섞어 배정한다 — 「반반」 이라는 캡션이
// 어느 주기에서도 참이다(BRIEF: 무작위 결과에 기대는 문장은 결과를 보장한다).
//
// 원자는 도식 위의 꺾은선 길을 일정한 속력으로 간다 — 가마 → 장치 가운데에서 + · − 출구로 갈라짐 →
// 다음 장치 또는 통 · 막대. 장치 안에서 휘는 모양은 이웃 `stern-gerlach` 의 몫이라 그리지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ATOM_COUNT,
  ATOM_SPEED,
  BIN_ROWS,
  BIN_X,
  CROSS_AXIS_UP_RATIO,
  DOT_PITCH,
  FIRST_UP_RATIO,
  MID_BIN_X,
  MID_BIN_Y,
  MID_KNEE,
  OVEN_X,
  PORT_SPLIT,
  SAME_AXIS_UP_RATIO,
  SEED,
  SG1_X0,
  SG1_X1,
  SG1_Y,
  SG2_X0,
  SG2_X1,
  SG3_X0,
  SG3_X1,
  STOP_X,
} from './schema';
import type { SpinState } from './state';

/** 보내는 시각의 흔들림 — 고른 간격의 몇 분의 일까지 앞뒤로 흔드는가. 1 보다 작아 순서가 뒤집히지 않는다. */
const EMIT_JITTER = 0.6;
/** 주기 번호를 시드에 섞는 곱수(황금비 해시). */
const CYCLE_MIX = 0x9e3779b9;
/** 앞부 · 뒷부가 서로 다른 난수열을 쓰게 시드에 더하는 값. */
const CROSS_STREAM = 0x5bd1e995;
/** 가마 상자의 가로 반폭(월드) — 원자가 나오는 자리. scene 의 가마 크기와 같다. */
export const OVEN_HALF = 0.8;

export interface SpinConstants {
  seed: number;
  atomCount: number;
  atomSpeed: number;
  firstUpRatio: number;
  sameAxisUpRatio: number;
  crossAxisUpRatio: number;
}

export function readConstants(stage: StageDef): SpinConstants {
  const c = stage.constants ?? {};
  return {
    seed: c.seed ?? SEED,
    atomCount: Math.max(1, Math.round(c.atomCount ?? ATOM_COUNT)),
    atomSpeed: c.atomSpeed ?? ATOM_SPEED,
    firstUpRatio: c.firstUpRatio ?? FIRST_UP_RATIO,
    sameAxisUpRatio: c.sameAxisUpRatio ?? SAME_AXIS_UP_RATIO,
    crossAxisUpRatio: c.crossAxisUpRatio ?? CROSS_AXIS_UP_RATIO,
  };
}

// ------------------------------------------------------------------------
// 시드 난수 — 같은 (시드, 주기, 부)는 언제나 같은 원자들을 낸다
// ------------------------------------------------------------------------

/** 시드 난수(mulberry32). 상태를 닫아 둔 생성기를 돌려준다. */
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

/** n 개 중 정확히 round(n × ratio) 개가 참인 배열을 섞어 돌려준다. */
function exactSplit(rand: () => number, n: number, ratio: number): boolean[] {
  const ups = Math.min(n, Math.max(0, Math.round(n * ratio)));
  const out: boolean[] = [];
  for (let i = 0; i < n; i++) out.push(i < ups);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// ------------------------------------------------------------------------
// 원자와 길
// ------------------------------------------------------------------------

/** 한 주기의 두 부 — 가운데 장치가 z 인 앞부, x 인 뒷부. */
export type Part = 'same' | 'cross';

/** 원자가 끝나는 곳 — 첫 장치 − 출구의 막대, 또는 세 통 중 하나. */
export type Bin = 'mid' | 'up' | 'down';

export interface Atom {
  /** 보낸 시각(주기 안 시각, 초). */
  emit: number;
  /** 지나는 꺾은선(월드). 마지막 점이 막대 앞이거나 통 안 제 자리다. */
  path: Vec2[];
  /** 끝나는 통. 없으면 첫 장치에서 막힌 원자다. */
  bin?: Bin;
}

const SG2_Y = SG1_Y + PORT_SPLIT;
const SG3_Y = SG2_Y + PORT_SPLIT;

/** 통의 왼쪽 끝 가운데 높이. */
export function binOrigin(bin: Bin): Vec2 {
  if (bin === 'mid') return [MID_BIN_X, MID_BIN_Y];
  return [BIN_X, bin === 'up' ? SG3_Y + PORT_SPLIT : SG3_Y - PORT_SPLIT];
}

/** 가운데 장치 − 출구 길이 통으로 꺾이는 자리. */
function midKnee(): Vec2 {
  return [SG2_X1 + MID_KNEE, SG2_Y - PORT_SPLIT];
}

/** 통 안 j 번째 점의 자리 — 왼쪽 열부터 위 줄 → 아래 줄로 채운다. */
function slot(bin: Bin, j: number): Vec2 {
  const [x0, y0] = binOrigin(bin);
  const col = Math.floor(j / BIN_ROWS);
  const row = j % BIN_ROWS;
  return [x0 + DOT_PITCH * (col + 0.5), y0 + DOT_PITCH * ((BIN_ROWS - 1) / 2 - row)];
}

/** 장치 하나를 지나는 길 — 입구 → 가운데 → + 또는 − 출구. */
function through(x0: number, x1: number, y: number, up: boolean): Vec2[] {
  return [
    [x0, y],
    [(x0 + x1) / 2, y],
    [x1, y + (up ? PORT_SPLIT : -PORT_SPLIT)],
  ];
}

/**
 * 한 부의 원자들. `part` 단계 동안 고르게(흔들림 포함) 보낸다.
 * 앞부는 가운데 · 마지막 장치 모두 같은 축(z)이라 `sameAxisUpRatio`, 뒷부는 가운데 x · 마지막 z 가
 * 서로 수직이라 둘 다 `crossAxisUpRatio` 를 쓴다.
 */
export function atoms(tl: TimelineFrame, c: SpinConstants, part: Part): Atom[] {
  const stream = part === 'cross' ? CROSS_STREAM : 0;
  const rand = mulberry32((c.seed ^ stream ^ Math.imul(tl.cycle + 1, CYCLE_MIX)) >>> 0);
  const n = c.atomCount;
  const second = part === 'same' ? c.sameAxisUpRatio : c.crossAxisUpRatio;

  const start = tl.start(part);
  const len = tl.duration(part);
  const emits: number[] = [];
  for (let k = 0; k < n; k++) emits.push(start + (len * (k + 0.5 + (rand() - 0.5) * EMIT_JITTER)) / n);

  const first = exactSplit(rand, n, c.firstUpRatio);
  const passed1 = first.filter(Boolean).length;
  const mid = exactSplit(rand, passed1, second);
  const passed2 = mid.filter(Boolean).length;
  const last = exactSplit(rand, passed2, second);

  const filled: Record<Bin, number> = { mid: 0, up: 0, down: 0 };
  let i1 = 0;
  let i2 = 0;
  return emits.map((emit, k) => {
    const path: Vec2[] = [[OVEN_X + OVEN_HALF, SG1_Y], ...through(SG1_X0, SG1_X1, SG1_Y, first[k]!)];
    if (!first[k]) {
      path.push([STOP_X, SG1_Y - PORT_SPLIT]);
      return { emit, path };
    }
    const upMid = mid[i1++]!;
    path.push(...through(SG2_X0, SG2_X1, SG2_Y, upMid));
    let bin: Bin;
    if (!upMid) {
      path.push(midKnee());
      bin = 'mid';
    } else {
      const upLast = last[i2++]!;
      path.push(...through(SG3_X0, SG3_X1, SG3_Y, upLast));
      bin = upLast ? 'up' : 'down';
    }
    path.push(binOrigin(bin), slot(bin, filled[bin]++));
    return { emit, path, bin };
  });
}

/** 원자 하나의 지금 모습. */
export interface AtomView {
  atom: Atom;
  /** 가는 중이면 지금 자리. 아직 안 보냈거나 끝에 닿았으면 없다. */
  pos?: Vec2;
  /** 통에 닿았으면 통 안 제 자리. 막대에 닿은 원자는 없다. */
  rest?: Vec2;
}

/** 꺾은선 위 거리 d 의 자리. 끝을 넘으면 없다. */
function along(path: readonly Vec2[], d: number): Vec2 | undefined {
  let left = d;
  for (let i = 1; i < path.length; i++) {
    const [ax, ay] = path[i - 1]!;
    const [bx, by] = path[i]!;
    const seg = Math.hypot(bx - ax, by - ay);
    if (left <= seg) {
      const f = seg > 0 ? left / seg : 1;
      return [ax + (bx - ax) * f, ay + (by - ay) * f];
    }
    left -= seg;
  }
  return undefined;
}

/** 원자들의 지금 모습. 주기 안 시각 `tl.u` 의 함수다. */
export function readAtoms(list: readonly Atom[], tl: TimelineFrame, c: SpinConstants): AtomView[] {
  return list.map((atom) => {
    const age = tl.u - atom.emit;
    if (age < 0) return { atom };
    const pos = along(atom.path, c.atomSpeed * age);
    if (pos) return { atom, pos };
    return atom.bin ? { atom, rest: atom.path[atom.path.length - 1]! } : { atom };
  });
}

/** 도식에 늘 깔린 빔 길 — 원자가 갈 수 있는 모든 갈래. */
export function channels(): Vec2[][] {
  const ovenOut: Vec2 = [OVEN_X + OVEN_HALF, SG1_Y];
  const sg1Up = through(SG1_X0, SG1_X1, SG1_Y, true);
  const sg1Down = through(SG1_X0, SG1_X1, SG1_Y, false);
  const sg2Up = through(SG2_X0, SG2_X1, SG2_Y, true);
  const sg2Down = through(SG2_X0, SG2_X1, SG2_Y, false);
  const sg3Up = through(SG3_X0, SG3_X1, SG3_Y, true);
  const sg3Down = through(SG3_X0, SG3_X1, SG3_Y, false);
  return [
    [ovenOut, ...sg1Up, ...sg2Up, ...sg3Up, binOrigin('up')],
    [sg1Down[1]!, sg1Down[2]!, [STOP_X, SG1_Y - PORT_SPLIT]],
    [sg2Down[1]!, sg2Down[2]!, midKnee(), binOrigin('mid')],
    [sg3Down[1]!, sg3Down[2]!, binOrigin('down')],
  ];
}

export function step(params: { state: SpinState }): SpinState {
  return params.state;
}
