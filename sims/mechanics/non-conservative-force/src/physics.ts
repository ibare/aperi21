// ========================================================================
// non-conservative-force — 순수 물리
// ========================================================================
// 수평 바닥 위를 일정한 빠르기로 미는 상자 둘이다. 운동 마찰력 f 는 크기가 늘
// 같고 방향은 늘 움직임의 반대라, 마찰이 빼앗은 에너지는
//   W = f × (지나온 길)
// 이다. 변위가 아니라 **지나온 길**이다 — 되돌아오는 구간은 변위를 줄이지만 길을
// 줄이지 않는다. 그래서 같은 A → B 라도 B 를 지나쳤다 돌아온 상자는 L + 2D 만큼
// 잃는다. 바닥이 수평이라 중력은 일을 하지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { OVERSHOOT, POINT_A, SPAN_AB } from './schema';
import type { NonConservativeForceState } from './state';

export interface NonConservativeForceConstants {
  /** A 에서 B 까지 L(m). */
  span: number;
  /** 아래 상자가 B 를 지나쳐 더 가는 거리 D(m). */
  overshoot: number;
}

export function readConstants(stage: StageDef): NonConservativeForceConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return { span: c.span ?? SPAN_AB, overshoot: c.overshoot ?? OVERSHOOT };
}

export interface BoxReading {
  /** 상자 중심의 월드 x. */
  x: number;
  /** 지금까지 지나온 길(m). 되돌아와도 줄지 않는다 — 잃은 에너지 막대의 길이다. */
  path: number;
  /** 움직이는 방향 +1 · −1, 서 있으면 0. 마찰 화살표는 이것의 반대를 향한다. */
  dir: number;
  /** 제 여정을 마쳤는가 — 막대 끝 표식을 걸 조건이다. */
  done: boolean;
}

/**
 * 곧장 가는 상자. **단계 경계는 선언이 정한다** — 자리를 `at('go')` 로 읽으므로 저작자가
 * `go` 를 늘이면 더 천천히 갈 뿐 B 에 도착하는 것은 그대로다 (S-piece 「시간표는 선언이다」).
 */
export function readDirect(tl: TimelineFrame, c: NonConservativeForceConstants): BoxReading {
  const go = tl.at('go');
  const path = c.span * go;
  return {
    x: POINT_A + path,
    path,
    dir: go > 0 && go < 1 ? 1 : 0,
    done: go >= 1,
  };
}

/**
 * 지나쳤다 돌아오는 상자. A→B 는 위 상자와 같은 단계(`go`)를 함께 쓰므로 둘이 같은
 * 순간 같은 자리를 지난다. 그 뒤 `overshoot` 동안 B→C, `return` 동안 C→B.
 *
 * 자리는 나간 만큼 빼고 돌아온 만큼 빼지만, **길은 둘 다 더한다** — 이 한 줄의 차이가
 * 이 조각의 주장이다.
 */
export function readDetour(tl: TimelineFrame, c: NonConservativeForceConstants): BoxReading {
  const go = tl.at('go');
  const out = tl.at('overshoot');
  const back = tl.at('return');
  const moving = (p: number): boolean => p > 0 && p < 1;
  return {
    x: POINT_A + c.span * go + c.overshoot * out - c.overshoot * back,
    path: c.span * go + c.overshoot * out + c.overshoot * back,
    dir: moving(back) ? -1 : moving(go) || moving(out) ? 1 : 0,
    done: back >= 1,
  };
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 A 로 되돌린다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: NonConservativeForceState }): NonConservativeForceState {
  return params.state;
}
