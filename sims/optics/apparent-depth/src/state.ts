import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 줄기 · 점선 · 보이는 동전이 모두 시간표 진행도의 함수다.
 *
 * 들고 있는 것은 **화면에 뜨는 수의 문자열**뿐이다 — 스테이지 상수(정박값)를 `String()` 으로
 * 한 번 적어 둔다. 캡션 `vars` 가 state 경로만 가리키므로 여기에 둔다 (G133 우회,
 * `time-dilation` 선례). 계산한 교점 깊이를 반올림한 것이 아니다.
 */
export interface ApparentDepthState {
  depthText: string;
  waterApparentText: string;
  glassApparentText: string;
  /** 매질 이름 줄에 끼울 굴절률. */
  waterIndexText: string;
  glassIndexText: string;
}

export function initialState(params?: { stage?: StageDef }): ApparentDepthState {
  const c = readConstants(params?.stage);
  return {
    depthText: String(c.depthCm),
    waterApparentText: String(c.waterApparentCm),
    glassApparentText: String(c.glassApparentCm),
    waterIndexText: String(c.nWater),
    glassIndexText: String(c.nGlass),
  };
}
