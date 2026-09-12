import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다. 관측자를 끌게 하면 거리 2.5 에서 알갱이는 4개인데 1/d² 은
 * 5.76 을 요구한다 — **셀 수 있다는 것이 이 조각의 유일한 증거**라 그걸 깨면서
 * 얻는 조작은 손해다 (원본 NOTES).
 */
export const controllers: readonly ControllerSpec[] = [];
