// ========================================================================
// latent-heat — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface LatentHeatState {
  /** 선언한 질량(kg) · 처음 온도 · 녹는점 · 끓는점(℃)의 글자. */
  massText: string;
  startText: string;
  meltText: string;
  boilText: string;
}

export function initialState(params: { stage: StageDef }): LatentHeatState {
  const c = readConstants(params.stage);
  return {
    massText: String(c.massKg),
    startText: String(c.tStart),
    meltText: String(c.tMelt),
    boilText: String(c.tBoil),
  };
}
