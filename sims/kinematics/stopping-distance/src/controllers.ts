import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 속력 슬라이더를 달면 독자는 한 번에 한 속력만 보게 되고 비교는 기억에 맡겨진다.
 * 이 주장은 *두 구간이 속력을 다르게 먹는다* 는 대비라서, 세 결과가 동시에 화면에
 * 있어야 성립한다. 아무것도 누르지 않아도 조각은 할 말을 마친다.
 */
export const controllers: readonly ControllerSpec[] = [];
