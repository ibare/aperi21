import type { StageDef } from '@aperi21/schema';
import { RATIO } from './schema';

/**
 * 쌓는 상태가 없다. 피스톤 높이 · 압력 화살표 · 옮겨 간 물이 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 들고 있는 것은 **캡션에 끼울 넓이 비 글자** 하나뿐이다. 캡션 슬롯의 `vars` 는 state 의
 * 경로만 가리키므로, 스테이지 상수 `ratio` 를 바꾼 저작자의 값이 캡션에도 그대로 나오게
 * 여기서 한 번 문자열로 만든다. 자릿수는 조각이 정한다 — 정수면 정수로, 아니면 그대로.
 *
 * 누적할 것이 없으므로 `preroll` 도 쓰지 않는다 — 도착한 순간 이미 진행 중인
 * 그림은 `startAt` 이 만든다.
 */
export interface PascalsPrincipleState {
  /** 캡션 `{n}` 자리의 넓이 비 글자. */
  ratioText: string;
}

/** 넓이 비를 화면 글자로. 유효숫자를 줄이지 않는다 — 선언한 값 그대로 쓴다. */
export function ratioLabel(ratio: number): string {
  return String(ratio);
}

export function initialState(params?: { stage?: StageDef }): PascalsPrincipleState {
  const ratio = (params?.stage?.constants as Record<string, number> | undefined)?.ratio ?? RATIO;
  return { ratioText: ratioLabel(ratio) };
}
