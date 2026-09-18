// ========================================================================
// continuity-equation — 순수 물리
// ========================================================================
// 물은 줄지도 늘지도 않는다. 그래서 관 어디서나 1 초에 지나가는 양 Q = A·v 가 같고,
// 굵기 A(x) 인 곳의 빠르기는 v(x) = Q / A(x) 다 (단면에 고른 흐름 — 마찰 없는 이상 유체).
//
// 계산은 **부피 좌표** 하나로 한다. 관 입구부터 잰 부피 V(x) = ∫A dx 를 쓰면 물 알갱이의
// 부피 좌표는 시간에 대해 Q 로 곧게 늘어난다 — 굵은 곳이든 가는 곳이든. 알갱이의 자리는
// 그 부피 좌표를 x 로 되짚기만 하면 된다. 칠한 물도 같다: 문을 지난 시각의 부피 좌표가
// 지금까지 Q·경과만큼 밀려 있다.
//
// 옆에서 본 그림이라 관 굵기(세로 길이)가 곧 단면적을 대신한다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { AREA_RATIO, DOTS, PIPE, SPEED_WIDE, WIDE_HEIGHT } from './schema';
import type { ContinuityEquationState } from './state';

export interface ContinuityConstants {
  /** 굵은 곳의 유속(m/s). */
  speed: number;
  /** 굵은 곳의 관 굵기(m). */
  wideHeight: number;
  /** 가는 곳 단면 ÷ 굵은 곳 단면. */
  areaRatio: number;
}

export function readConstants(stage: StageDef): ContinuityConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    speed: c.speed ?? SPEED_WIDE,
    wideHeight: c.wideHeight ?? WIDE_HEIGHT,
    areaRatio: c.areaRatio ?? AREA_RATIO,
  };
}

// ------------------------------------------------------------------------
// 관의 모양
// ------------------------------------------------------------------------

/** 자리 x 의 관 굵기(m). 가늘어지는 구간은 코사인으로 매끈하게 잇는다. */
export function pipeHeight(x: number, c: ContinuityConstants): number {
  const wide = c.wideHeight;
  const narrow = c.wideHeight * c.areaRatio;
  if (x <= PIPE.taperStart) return wide;
  if (x >= PIPE.taperEnd) return narrow;
  const s = (x - PIPE.taperStart) / (PIPE.taperEnd - PIPE.taperStart);
  const k = 0.5 - 0.5 * Math.cos(Math.PI * s);
  return wide + (narrow - wide) * k;
}

/** 1 초에 한 단면을 지나는 양(옆 그림에서는 넓이, m²/s). 관 어디서나 같다. */
export function flowRate(c: ContinuityConstants): number {
  return c.speed * c.wideHeight;
}

/** 자리 x 의 유속 = Q / A(x). */
export function speedAt(x: number, c: ContinuityConstants): number {
  return flowRate(c) / pipeHeight(x, c);
}

/** 부피 좌표 표를 만드는 x 간격(m). 가늘어지는 구간(0.8 m)에 80 칸이 든다. */
const TABLE_DX = 0.01;

/**
 * 부피 좌표 표 — 관 입구부터 잰 부피 V(x). 한 번 만들어 두고 V → x 를 되짚는다.
 * 사다리꼴 적분이다.
 */
export interface VolumeTable {
  xs: number[];
  vs: number[];
  total: number;
}

export function volumeTable(c: ContinuityConstants): VolumeTable {
  const n = Math.ceil((PIPE.xOut - PIPE.xIn) / TABLE_DX);
  const xs: number[] = [PIPE.xIn];
  const vs: number[] = [0];
  let v = 0;
  let prevH = pipeHeight(PIPE.xIn, c);
  for (let i = 1; i <= n; i++) {
    const x = Math.min(PIPE.xIn + i * TABLE_DX, PIPE.xOut);
    const h = pipeHeight(x, c);
    v += ((prevH + h) / 2) * (x - xs[i - 1]!);
    xs.push(x);
    vs.push(v);
    prevH = h;
  }
  return { xs, vs, total: v };
}

/** x → 부피 좌표. */
export function volumeAt(x: number, t: VolumeTable): number {
  return interp(x, t.xs, t.vs);
}

/** 부피 좌표 → x. 관 밖으로 넘으면 양 끝에 붙인다. */
export function xAtVolume(v: number, t: VolumeTable): number {
  return interp(v, t.vs, t.xs);
}

/** 오름차순 표 `keys` 에서 `k` 를 찾아 `vals` 를 선형 보간한다. */
function interp(k: number, keys: readonly number[], vals: readonly number[]): number {
  const n = keys.length;
  if (k <= keys[0]!) return vals[0]!;
  if (k >= keys[n - 1]!) return vals[n - 1]!;
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (keys[mid]! <= k) lo = mid;
    else hi = mid;
  }
  const f = (k - keys[lo]!) / (keys[hi]! - keys[lo]!);
  return vals[lo]! + (vals[hi]! - vals[lo]!) * f;
}

// ------------------------------------------------------------------------
// 흐름 점
// ------------------------------------------------------------------------

export interface DotCloud {
  positions: Vec2[];
  velocities: Vec2[];
}

/**
 * 흐름 점. 부피 좌표로 **같은 간격**에 놓인 기둥들이 Q 로 함께 밀려 간다. 한 기둥 안의 점은
 * 관 굵기에 대한 비율(η)로 줄을 선다.
 *
 * 그래서 점 하나가 맡는 넓이가 어디서나 같다 — 가는 곳에서 기둥 간격이 두 배로 벌어지는 만큼
 * 줄 간격이 절반으로 좁아진다. 물이 눌리지 않는다는 것이 점의 짜임으로 보인다.
 *
 * 시각 `t` 는 조각 시계다. 이어지는 시계라 주기가 넘어가도 점이 튀지 않는다.
 */
export function dotCloud(t: number, c: ContinuityConstants, table: VolumeTable): DotCloud {
  const dv = c.wideHeight * DOTS.spacingWide;
  const columns = Math.floor(table.total / dv);
  const period = columns * dv;
  const q = flowRate(c);
  const shift = ((q * t) % period + period) % period;
  const positions: Vec2[] = [];
  const velocities: Vec2[] = [];
  for (let k = 0; k < columns; k++) {
    const v = (k * dv + shift) % period;
    const x = xAtVolume(v, table);
    const half = (pipeHeight(x, c) / 2) * DOTS.wallMargin;
    const vx = speedAt(x, c);
    // 굽는 벽을 따라 점도 비스듬히 움직인다: dy/dt = η · d(반 굵기)/dx · vx.
    const slope = ((pipeHeight(x + TABLE_DX, c) - pipeHeight(x - TABLE_DX, c)) / (2 * TABLE_DX)) / 2;
    // 기둥마다 줄을 반 칸 엇갈려 격자가 줄무늬로 읽히지 않게 한다.
    const stagger = k % 2 === 0 ? -0.25 : 0.25;
    for (let j = 0; j < DOTS.rows; j++) {
      const eta = ((j + 0.5 + stagger) / DOTS.rows) * 2 - 1;
      positions.push([x, eta * half]);
      velocities.push([vx, eta * slope * DOTS.wallMargin * vx]);
    }
  }
  return { positions, velocities };
}

// ------------------------------------------------------------------------
// 칠한 물
// ------------------------------------------------------------------------

export interface PaintReading {
  /** 칠이 시작됐는가. 아직이면 그리지 않는다. */
  started: boolean;
  /** 칠한 물의 뒤 · 앞 끝(x). 뒤가 문 쪽이다. */
  xBack: number;
  xFront: number;
  /** 칠한 물을 부피로 반 나눈 자리(x). 가는 쪽 칸 나눔선이 여기 선다. */
  xMid: number;
}

/**
 * 문 `gateX` 를 `count` 단계 동안 지난 물. **단계 경계는 선언이 정한다** — 칠하기 시작 ·
 * 길이를 `timeline` 에게 묻는다 (S-piece 「시간표는 선언이다」).
 *
 * 문을 시각 s 에 지난 물은 지금 부피 좌표가 V(문) + Q·(u − s) 다. 칠한 물은 s 가 칠하기
 * 구간 안에 드는 것 — 그 양은 두 문 모두 Q · (칠한 시간) 으로 **같다**.
 */
export function paintAt(
  gateX: number,
  tl: TimelineFrame,
  c: ContinuityConstants,
  table: VolumeTable,
): PaintReading {
  const elapsed = tl.u - tl.start('count');
  const painted = Math.min(Math.max(elapsed, 0), tl.duration('count'));
  const q = flowRate(c);
  const v0 = volumeAt(gateX, table);
  const vFront = v0 + q * Math.max(elapsed, 0);
  const vBack = vFront - q * painted;
  return {
    started: elapsed > 0,
    xBack: xAtVolume(vBack, table),
    xFront: xAtVolume(vFront, table),
    xMid: xAtVolume((vBack + vFront) / 2, table),
  };
}

/** 칸 나눔선 · 치수가 떠오른 정도 0~1. 옅어지는 단계에서 칠과 함께 사라진다. */
export function revealOpacity(tl: TimelineFrame): number {
  return tl.at('reveal') * (1 - tl.at('fade'));
}

/** 칠한 물의 불투명도 0~1. 마지막 단계에서 지우고 다음 주기로 넘어간다. */
export function paintOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ContinuityEquationState }): ContinuityEquationState {
  return params.state;
}
