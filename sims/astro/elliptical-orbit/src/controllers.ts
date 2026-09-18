import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다. 시간표가 원(e = 0)에서 가장 길쭉한 타원까지 정박 이심률을 차례로 훑고 원으로
 * 되돌아오므로, 독자가 초점을 끌어 새로 알게 되는 것이 없다. 이심률 슬라이더를 두면 시간표가 벌리는
 * 값과 독자가 고른 값이 한 화면에서 다투게 된다 (NOTES 「두지 않은 것」).
 */
export const controllers: readonly ControllerSpec[] = [];
