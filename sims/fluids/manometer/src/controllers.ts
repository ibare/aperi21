import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 압력 차를 끌게 하면 독자가 두 관을 번갈아 보느라 「같은 압력 차」 라는 조건을 놓친다.
 * 두 관이 한 기체 통에 이어져 있어 같은 순간 같은 압력 차를 받는 것이 이 조각의 장치이고,
 * 그 비교는 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
