import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

/**
 * 상태는 캡션에 끼울 글자 하나뿐이다 — 캡션 `vars` 가 state 경로만 받아서, 스테이지 상수
 * `decadeGap` 을 캡션 「틈이 {gap} nm 좁아질 때마다」 에 잇는 우회로다 (장부 G133).
 * 선언값을 `String` 으로 그대로 옮긴다 — 반올림하지 않는다 (S-piece 유효숫자).
 */
export interface ScanningTunnelingMicroscopeState {
  decadeGap: string;
}

export function initialState(params: { stage: StageDef }): ScanningTunnelingMicroscopeState {
  return { decadeGap: String(readConstants(params.stage).decadeGap) };
}
