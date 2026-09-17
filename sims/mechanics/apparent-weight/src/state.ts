import { DEFAULT_CONSTANTS } from './schema';

/**
 * 쌓는 상태는 바늘 하나뿐이다.
 *
 * 칸의 위치·속도·캡션은 시간표에서 엔진이 `scene` 에 넘겨 주는 값의 함수다. 바늘은
 * 목표 눈금을 감쇠 스프링으로 따라가는 **누적 적분**이라 `step` 이 쌓는다.
 *
 * `t` 는 조각 시계의 사본이다. `step` 은 TimelineFrame 을 받지 못해 지금 가속도를
 * 알려면 제 시계가 필요하다 (NOTES 「어휘 부족」). 시계를 앞당기지 않고 재생 속도도
 * 바꾸지 않으므로 엔진 시계와 같은 값으로 흐른다.
 */
export interface ApparentWeightState {
  /** 조각 시계(초). */
  t: number;
  /** 바늘이 가리키는 눈금(kg). */
  needle: number;
  /** 바늘의 변화율(kg/s). */
  needleRate: number;
}

/** 원본처럼 바늘이 평소 눈금에 멈춘 채 출발한다. */
export function initialState(params?: { stage?: { constants?: Record<string, number> } }): ApparentWeightState {
  const mass = params?.stage?.constants?.mass ?? DEFAULT_CONSTANTS.mass;
  return { t: 0, needle: mass, needleRate: 0 };
}
