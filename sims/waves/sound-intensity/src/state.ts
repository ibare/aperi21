import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 고리 · 귀 · 막대가 모두 시간표 선언(`schema.timeline`)에서 엔진이
 * `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 들고 있는 것은 캡션에 끼울 **스테이지 상수의 글자** 뿐이다. 캡션 `vars` 가 state 경로만
 * 가리킬 수 있어서(장부 G133) 상수를 여기로 옮겨 둔다. 값은 선언값 그대로다 —
 * `String(74)` 는 `"74"` 이고 자릿수를 줄이지 않는다 (S-piece 유효숫자).
 */
export interface SoundIntensityState {
  multiple2: string;
  multiple3: string;
  intensityRatio2: string;
  intensityRatio3: string;
  level1: string;
  level2: string;
  level3: string;
}

export function initialState(params: { stage: StageDef }): SoundIntensityState {
  const c = readConstants(params.stage);
  return {
    multiple2: String(c.multiple2),
    multiple3: String(c.multiple3),
    intensityRatio2: String(c.intensityRatio2),
    intensityRatio3: String(c.intensityRatio3),
    level1: String(c.level1),
    level2: String(c.level2),
    level3: String(c.level3),
  };
}
