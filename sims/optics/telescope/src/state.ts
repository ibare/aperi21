// ========================================================================
// telescope — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface TelescopeState {
  /** 대물렌즈 초점 거리 글자(cm). */
  focalObjectiveCm: string;
  /** 긴 · 짧은 접안렌즈 초점 거리 글자(cm). */
  focalEyeLongCm: string;
  focalEyeShortCm: string;
  /** 짧은 접안일 때 두 렌즈 간격 글자(cm). */
  gapShortCm: string;
  /** 긴 · 짧은 접안일 때 나가는 각에 θ 가 들어가는 수. */
  magLong: string;
  magShort: string;
}

export function initialState(params: { stage: StageDef }): TelescopeState {
  const c = readConstants(params.stage);
  return {
    focalObjectiveCm: String(c.shownFocalObjectiveCm),
    focalEyeLongCm: String(c.shownFocalEyeLongCm),
    focalEyeShortCm: String(c.shownFocalEyeShortCm),
    gapShortCm: String(c.shownGapShortCm),
    magLong: String(c.shownMagLong),
    magShort: String(c.shownMagShort),
  };
}
