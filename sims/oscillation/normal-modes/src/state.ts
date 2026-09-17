import type { Vec2 } from '@aperi21/schema';
import { HIST, LAYOUT, N, PLUCK_BEAD, PLUCK_Y } from './schema';
import { beadWorldY, captionFlags, grabKey, project } from './physics';

/** 구슬 하나를 끄는 손잡이 — `point-drag` 가 쓰고 읽는 자리. */
export interface BeadGrab {
  /** 손잡이 월드 자리. 놓여 있을 때는 `step` 이 구슬 자리로 맞춘다. */
  pos: Vec2;
  /** 잡혀 있는가. 러너가 적는다. */
  held: boolean;
}

/** 캡션 판정 불리언 — `schema.caption.cases` 가 가리킨다. */
export interface CaptionFlags {
  held: boolean;
  still: boolean;
  modes1: boolean;
  modes2: boolean;
  modes3: boolean;
  modes4: boolean;
}

export interface NormalModesState {
  /** 구슬 변위 y_j 와 속도. */
  y: readonly number[];
  v: readonly number[];
  /** 모드 좌표 q_n (사슬 변위를 모드 모양에 투영한 값) 과 진폭. */
  q: readonly number[];
  amp: readonly number[];
  /** 모드 크기 기록 — 고리 버퍼 `hist[n * HIST + k]`. `head` 는 다음에 쓸 칸. */
  hist: Float64Array;
  head: number;
  /** 고정 걸음으로 아직 쓰지 않은 시간(초). */
  acc: number;
  /** 구슬마다 끄는 손잡이. 경로 `grab.b0` … `grab.b4`. */
  grab: Record<string, BeadGrab>;
  caption: CaptionFlags;
}

/**
 * 첫 구슬을 당겨 놓은 순간. 기록은 놓기 전의 평평한 값으로 채운다 — 도착 시각
 * 1.7 초는 `schema.preroll` 이 걸음을 굴려 만든다.
 */
export function initialState(): NormalModesState {
  const y = new Array<number>(N).fill(0);
  const v = new Array<number>(N).fill(0);
  y[PLUCK_BEAD] = PLUCK_Y;
  const { q, amp, active } = project(y, v);
  const hist = new Float64Array(N * HIST);
  for (let n = 0; n < N; n++) hist.fill(q[n]!, n * HIST, (n + 1) * HIST);
  const grab: Record<string, BeadGrab> = {};
  for (let j = 0; j < N; j++) {
    grab[grabKey(j)] = { pos: [LAYOUT.bx[j]!, beadWorldY(y[j]!)], held: false };
  }
  return { y, v, q, amp, hist, head: 0, acc: 0, grab, caption: captionFlags(false, active) };
}
