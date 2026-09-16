// ========================================================================
// projectile-motion — 순수 물리
// ========================================================================
// 수평과 연직을 한 함수 안에서도 **따로** 센다. x 는 시각에 비례하고 y 는
// 시각의 제곱으로 떨어지며, 둘은 서로의 인자가 아니다. 이 조각의 주장이
// 식에서 성립하는 방식이 그것이고, 화면에서 성립하는 방식이 「수평인 선」이다.
//
// 시각과 단계는 엔진이 시간표 선언(`schema.timeline`)에서 준다. 여기에 주기
// 경계나 단계 길이를 다시 두지 않는다.
// ========================================================================

import type { TimelineFrame, Vec2 } from '@aperi21/schema';

import { FALL, G, LAUNCH, STROBE } from './schema';
import type { ProjectileMotionState } from './state';

/**
 * 던져진 뒤 흐른 시간(초). 낙하가 끝나면 거기서 멈춘다 — 원본의
 * `tauOf(p) = p < T_FALL ? p : T_FALL`.
 *
 * 낙하 단계의 진행도로 잰다. 시간표가 그 단계를 끝내면 진행도는 1 에 머물러
 * 있으므로, 머무는 동안 공은 닿은 자리에 그대로 있다.
 */
export function elapsed(tl: TimelineFrame): number {
  return tl.at('fall') * FALL;
}

/** 배수 `mult` 인 공의 자리. x 는 시각에 비례, y 는 시각의 제곱으로 떨어진다. */
export function posOf(mult: number, v: number, tau: number): Vec2 {
  return [LAUNCH[0] + mult * v * tau, LAUNCH[1] - 0.5 * G * tau * tau];
}

/**
 * 잔상을 남긴 시각들 — 0, 0.2, 0.4 … 지금까지.
 *
 * 프레임 타이밍과 무관하게 **해석적으로** 낸다. 원본은 목록을 손으로 쌓으면서
 * 같은 것을 지켰다: 그러지 않으면 `?t=` 로 찍은 화면과 실제로 흐른 화면이 갈린다.
 */
export function strobeTimes(tau: number): number[] {
  const last = Math.floor(tau / STROBE + 1e-9);
  const out: number[] = [];
  for (let k = 0; k <= last; k++) out.push(k * STROBE);
  return out;
}

/**
 * 착지 파문의 나이(초). 아직 날고 있으면 `null`.
 *
 * 머무는 단계에 들어선 순간이 곧 착지 순간이다 — 낙하 시간이 수평 속도와
 * 무관하므로 그 경계는 빠르기를 바꿔도 움직이지 않는다.
 */
export function splashAge(tl: TimelineFrame): number | null {
  return tl.phase === 'rest' ? tl.u - tl.start('rest') : null;
}

/**
 * 쌓는 상태가 없다 — 공도 사다리도 파문도 시간표 시각의 함수다. 상태에 있는
 * 것은 독자가 미는 값(`v`)과 러너가 적는 사실(`held`)뿐이라 걸음마다 할 일이 없다.
 */
export function step(params: { state: ProjectileMotionState }): ProjectileMotionState {
  return params.state;
}
