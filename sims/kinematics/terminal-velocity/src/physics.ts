// ========================================================================
// terminal-velocity — 순수 물리
// ========================================================================
// `a = g − k·v²` 를 고정 걸음으로 적분한다. **종단 속도는 상수가 아니라 이
// 적분이 도착하는 곳**이다 — 그래서 슬라이더로 k 를 바꾸면 물리가 알아서 다른
// 종단 속도에 이르고, 어느 값으로 놓아도 결국 따라잡힌다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import {
  G,
  GRAVITY_LEN,
  HOLD,
  LEVEL_RANGE,
  RATIO_CAUGHT,
  RATIO_START,
  STROBE,
  VT_AT_ZERO,
  VT_PER_LEVEL,
  Y_FLOOR,
  Y_START,
} from './schema';
import type { TerminalVelocityState } from './state';

export interface TerminalVelocityConstants {
  /** 화면 좌표에서 직접 세운 중력 가속도. */
  g: number;
  /** 다 떨어진 장면을 붙잡아 두는 시간(초). */
  hold: number;
}

export function readConstants(stage: StageDef): TerminalVelocityConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return { g: c.g ?? G, hold: c.hold ?? HOLD };
}

function clampLevel(level: number): number {
  const [lo, hi] = LEVEL_RANGE;
  return Math.max(lo, Math.min(hi, level));
}

/** 저항 세기에서 종단 속도로. 원본 `vt = 120 − value·8`. */
export function terminalSpeed(level: number): number {
  return VT_AT_ZERO - clampLevel(level) * VT_PER_LEVEL;
}

/** 저항 계수 — `mg = k·vt²` 가 되도록. 두 힘이 종단 속도에서 정확히 같아진다. */
export function dragCoefficient(level: number, g: number): number {
  const vt = terminalSpeed(level);
  return g / (vt * vt);
}

/**
 * 지금 속도에서 잰 저항 화살표의 길이.
 *
 * 중력은 `mg` 로 고정(`GRAVITY_LEN`)이고 저항은 `k·v²` 다. `mg = k·vt²` 이므로
 * 같은 자 위에서 저항은 `mg·(v/vt)²` — **두 화살표가 같은 자로 재어진다**는 것이
 * 이 조각의 주장 그 자체다. 엔진이 길이를 보기 좋게 정규화하면 균형이 영원히
 * 보이지 않는다 (`vector` 는 `delta` 를 그대로 쓴다).
 */
export function dragLength(state: TerminalVelocityState): number {
  const ratio = speedRatio(state);
  return GRAVITY_LEN * ratio * ratio;
}

/** 지금 속도가 종단 속도의 몇 배인가. 캡션과 저항 길이가 함께 읽는 값이다. */
export function speedRatio(state: TerminalVelocityState): number {
  return state.v / terminalSpeed(state.appliedLevel);
}

/** 사이클을 처음으로. 자국도 함께 비운다 — 사다리는 이번 낙하의 기록이다. */
function rewound(state: TerminalVelocityState, level: number): TerminalVelocityState {
  return {
    ...state,
    y: Y_START,
    v: 0,
    marks: [Y_START],
    sinceMark: 0,
    hold: -1,
    level,
    appliedLevel: level,
    caught: false,
    justStarted: true,
  };
}

/**
 * 한 스텝 전진. 순수 함수.
 *
 * 슬라이더는 **잡고 있는 동안에만** 값을 민다 (`held`). 원본은 9 단 눈금이었으므로
 * 받은 값을 정수 눈금으로 스냅해 되돌려 쓰고, 손을 떼면 조각이 쥐고 있던 값으로
 * 돌아간다 — 눈금이 가리키는 값과 실제 물리가 갈라지지 않게. 놓은 뒤 무엇으로
 * 돌아갈지는 조각이 안다 (`ControllerInstance.heldPath`).
 *
 * 세기가 바뀌면 처음부터 다시 떨어진다 (원본은 슬라이더 `input` 마다 `reset()`).
 * 주장이 특정 숫자의 우연이 아님을 독자가 처음부터 다시 보게 하는 자리다.
 */
export function step(params: {
  state: TerminalVelocityState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): TerminalVelocityState {
  const { state, dt, stage } = params;
  if (!(dt > 0)) return state;
  const { g, hold: holdFor } = readConstants(stage);

  const wanted = state.held ? clampLevel(Math.round(state.level)) : state.appliedLevel;
  if (wanted !== state.appliedLevel) return rewound(state, wanted);

  const base = { ...state, level: wanted, appliedLevel: wanted };

  // 다 떨어진 장면을 붙잡아 둔다. 그 장면이 이 조각의 결론이다 — 위는 촘촘하고
  // 아래는 일정한 사다리가 한 화면에 남아 있는 프레임.
  if (state.hold >= 0) {
    const hold = state.hold + dt;
    if (hold >= holdFor) return rewound(base, wanted);
    return { ...base, hold, caught: true, justStarted: false };
  }

  const k = dragCoefficient(wanted, g);
  const a = g - k * state.v * state.v;
  const v = state.v + a * dt;
  let y = state.y - v * dt;

  // 자국은 **일정한 시간 간격**으로 남는다. 그래야 이웃 자국의 간격이 곧 그
  // 0.2 초 동안의 속도가 되고, "더 빨라지지 않는다" 가 "가로대가 균일해진다"
  // 로 눈에 들어온다.
  let sinceMark = state.sinceMark + dt;
  const marks = [...state.marks];
  if (sinceMark >= STROBE) {
    sinceMark -= STROBE;
    marks.push(y);
  }

  let hold = -1;
  if (y <= Y_FLOOR) {
    y = Y_FLOOR;
    hold = 0;
  }

  const ratio = v / terminalSpeed(wanted);
  return {
    ...base,
    y,
    v,
    marks,
    sinceMark,
    hold,
    // 원본의 캡션 분기 그대로 — 붙잡는 중이거나 저항이 거의 따라잡았으면 결론,
    // 아직 거의 서 있으면 시작, 그 사이는 자라는 중.
    caught: hold >= 0 || ratio >= RATIO_CAUGHT,
    justStarted: ratio < RATIO_START,
  };
}
