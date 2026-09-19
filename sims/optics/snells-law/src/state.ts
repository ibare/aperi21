import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 줄기 · 호 · 막대가 모두 시간표 진행도의 함수다.
 *
 * 들고 있는 것은 **화면에 뜨는 수의 문자열**뿐이다 — 스테이지 상수(정박값)를 선언한
 * 자릿수로 한 번 적어 둔다. 캡션 `vars` 가 state 경로만 가리키므로 여기에 둔다
 * (G133 우회, `time-dilation` 선례). 계산한 각을 반올림한 것이 아니다.
 */
export interface SnellsLawState {
  incidentText: string;
  waterText: string;
  glassText: string;
  diamondText: string;
  /** 매질 이름 줄에 끼울 굴절률. */
  airIndexText: string;
  waterIndexText: string;
  glassIndexText: string;
  diamondIndexText: string;
}

export function initialState(params?: { stage?: StageDef }): SnellsLawState {
  const c = readConstants(params?.stage);
  const deg = (v: number): string => v.toFixed(c.angleDigits);
  const idx = (v: number): string => v.toFixed(c.indexDigits);
  return {
    incidentText: String(c.incidentDeg),
    waterText: deg(c.waterDeg),
    glassText: deg(c.glassDeg),
    diamondText: deg(c.diamondDeg),
    airIndexText: idx(c.nAir),
    waterIndexText: idx(c.nWater),
    glassIndexText: idx(c.nGlass),
    diamondIndexText: idx(c.nDiamond),
  };
}
