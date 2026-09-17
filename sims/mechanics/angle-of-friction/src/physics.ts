// ========================================================================
// angle-of-friction — 순수 계산
// ========================================================================
// 여기가 하는 일은 넷이다.
//
// 1. 시간표 진행도에서 **판의 기울기와 상자의 투명도**를 만든다 (scene 이 쓴다).
// 2. 판 위 좌표(경첩에서 판을 따라 s, 판에 수직으로 h)를 월드로 옮긴다.
// 3. 선언된 시간표를 자기 시계로 다시 읽어 지금 단계를 안다 (step 이 쓴다).
// 4. 미끄러지는 동안 두 상자를 적분하고, 회차가 넘어갈 때 기록과 더미 수를 갈아 끼운다.
// ========================================================================

import type { TimelineFrame, Vec2 } from '@aperi21/schema';

import {
  AUTO_SEQ,
  G,
  LAYOUT,
  MU_K,
  PX_PER_M,
  RECORD_MAX,
  START_DEG,
  THETA_S_DEG,
  angleOfFrictionSchema,
  toUnit,
} from './schema';
import type { AngleOfFrictionState } from './state';

// ------------------------------------------------------------------------
// 시간표 → 기울기 · 투명도
// ------------------------------------------------------------------------

/**
 * 판의 기울기(도). `tilt` 동안 12° → 마찰각으로 곧게 서고, `vanish` 시작부터 `lowered`
 * 끝까지 smooth 로 12° 로 눕는다. 그 밖에는 각 끝에 머문다.
 */
export function boardAngle(tl: TimelineFrame): number {
  const up = tl.at('tilt');
  const down = tl.span(tl.start('vanish'), tl.end('lowered'), 'smooth');
  return START_DEG + (THETA_S_DEG - START_DEG) * (up - down);
}

/** 상자의 투명도 — `vanish` 에서 사라지고 `appear` 에서 나타난다. */
export function boxAlpha(tl: TimelineFrame): number {
  return Math.min(1, Math.max(0, 1 - tl.at('vanish') + tl.at('appear')));
}

// ------------------------------------------------------------------------
// 판 위 좌표
// ------------------------------------------------------------------------

/** 판 위 자리 → 월드. `s` 는 경첩에서 판을 따라, `h` 는 판 윗면에서 바깥으로(원본 px). */
export function onBoard(sPx: number, hPx: number, rad: number): Vec2 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [toUnit(c * sPx - s * hPx), toUnit(s * sPx + c * hPx)];
}

// ------------------------------------------------------------------------
// 시계 → 단계 (step 전용)
// ------------------------------------------------------------------------

/**
 * 시계에서 회차 번호와 단계 id. **선언된 시간표를 읽는다** — 엔진의 `TimelineFrame` 과
 * 같은 규칙(주기 = 단계 길이의 합, 끝나면 처음으로)이다.
 */
export function phaseAt(clock: number): { cycle: number; phase: string } {
  const phases = angleOfFrictionSchema.timeline?.phases ?? [];
  const period = phases.reduce((sum, p) => sum + p.duration, 0);
  if (!(period > 0) || phases.length === 0) return { cycle: 0, phase: 'tilt' };
  const cycle = Math.floor(clock / period);
  const u = clock - cycle * period;
  let end = 0;
  for (const p of phases) {
    end += p.duration;
    if (u < end) return { cycle, phase: p.id };
  }
  return { cycle, phase: phases[phases.length - 1]!.id };
}

/** 회차 k 에 올릴 더미 수. 독자가 정한 수가 있으면 그것, 없으면 자동 순서. 원본 `nextN`. */
function nextN(userN: number | null, k: number): number {
  return userN ?? AUTO_SEQ[k % AUTO_SEQ.length]!;
}

// ------------------------------------------------------------------------
// 한 걸음
// ------------------------------------------------------------------------

/**
 * 원본 `step()` 과 같은 일을 시간표 단계 위에서 한다.
 *
 * - `tilt` → 다른 단계로 넘어가는 걸음: 이번 더미 수를 기록한다 (미끄러지기 시작한 순간).
 * - `slide`: 같은 가속도(질량과 무관)로 두 상자를 내리고, 턱 · 앞 상자에 닿으면 멈춘다.
 * - `appear`: 다음 회차의 더미 수로 갈아 끼우고 자리를 되돌린다.
 * - 회차가 넘어가면 자리를 되돌리고 그 회차의 더미 수를 올린다.
 * - 슬라이더를 잡고 값을 바꾸면 그 수가 독자의 수가 되고, 기울이는 중이면 바로 바꾼다.
 */
export function step(params: { state: AngleOfFrictionState; dt: number }): AngleOfFrictionState {
  const { state, dt } = params;
  const clock = state.clock + dt;
  const { cycle, phase } = phaseAt(clock);

  let { n, userN, sH, sL, vH, vL, records } = state;
  let slider = state.slider;

  // 독자의 수. 누르기만 하고 값을 바꾸지 않았으면 자동 순서를 끊지 않는다.
  if (state.held && slider !== (userN ?? n)) userN = slider;

  if (cycle !== state.cycle) {
    // 회차가 넘어갔다 — 처음 자리에서 그 회차의 더미로.
    n = nextN(userN, cycle);
    sH = LAYOUT.heavyS0Px;
    sL = LAYOUT.lightS0Px;
    vH = 0;
    vL = 0;
  } else if (state.phase === 'tilt' && phase !== 'tilt') {
    // 마찰각에 닿은 걸음 — 두 상자가 함께 미끄러지기 시작한다.
    records = [...records, n].slice(-RECORD_MAX);
  }

  if (phase === 'tilt' && state.held && userN !== null) {
    // 미끄러지기 전엔 아무 일도 달라지지 않으므로 지금 올려 둔 더미를 바로 바꾼다.
    n = userN;
  }

  if (phase === 'slide' && state.phase === 'slide') {
    const rad = (THETA_S_DEG * Math.PI) / 180;
    const a = G * (Math.sin(rad) - MU_K * Math.cos(rad)) * PX_PER_M; // 질량과 무관
    const heavyStop = LAYOUT.stopperPx + LAYOUT.boxPx / 2;
    if (vH >= 0 && sH > heavyStop) {
      vH += a * dt;
      sH -= vH * dt;
      if (sH <= heavyStop) {
        sH = heavyStop;
        vH = -1;
      }
    }
    const lightStop = (vH < 0 ? sH : heavyStop) + LAYOUT.boxPx;
    if (vL >= 0 && sL > lightStop) {
      vL += a * dt;
      sL -= vL * dt;
      if (sL <= lightStop) {
        sL = lightStop;
        vL = -1;
      }
    }
  }

  if (phase === 'appear') {
    const want = nextN(userN, cycle + 1);
    if (n !== want || sH !== LAYOUT.heavyS0Px) {
      n = want;
      sH = LAYOUT.heavyS0Px;
      sL = LAYOUT.lightS0Px;
      vH = 0;
      vL = 0;
    }
  }

  // 건드린 적 없으면 슬라이더가 화면의 더미 수를 따라간다.
  if (!state.held && userN === null) slider = n;

  return {
    clock,
    cycle,
    phase,
    n,
    userN,
    slider,
    held: state.held,
    sH,
    sL,
    vH,
    vL,
    records,
    stopped: phase === 'slide' && vH < 0 && vL < 0,
    nText: String(n),
    slipText: state.slipText,
  };
}
