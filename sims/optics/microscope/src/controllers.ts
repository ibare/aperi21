import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 대물렌즈가 키우고 접안렌즈가 한 번 더 키우는 두 확대를 자동 진행으로 차례로 보이면 할 말이
 * 끝난다. 시료나 렌즈를 끌게 하면 실상이 접안렌즈 초점 밖으로 나가(허상이 아니게 된다) 이 조각이
 * 말하지 않는 그림이 되고, 선언한 배율 정박값(`×4` · `×3` · `×12`)도 쓸 수 없게 된다.
 */
export const controllers: readonly ControllerSpec[] = [];
