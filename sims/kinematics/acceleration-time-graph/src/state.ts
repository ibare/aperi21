import { finalVelocityChange, formatValue } from './physics';

/**
 * 쌓는 상태가 없다. 모든 그림은 시간표(`schema.timeline`)에서 엔진이 `scene` 에
 * 넘겨 주는 시각의 함수다.
 *
 * `totalText` 하나만 둔다 — 마지막 캡션이 문장 안에 합(3 m/s)을 말하는데, 캡션 슬롯의
 * `vars` 는 state 경로만 가리킬 수 있다. 가속도 표에서 한 번 계산해 둔다.
 */
export interface AccelerationTimeGraphState {
  totalText: string;
}

export function initialState(): AccelerationTimeGraphState {
  return { totalText: formatValue(finalVelocityChange()) };
}
