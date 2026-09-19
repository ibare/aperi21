import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 물체를 초점 밖(스크린에 상이 맺힘)에서 초점 안(스크린에 흐린 빛만)으로 옮기는 것을
 * 자동 진행으로 보인다. 물체를 끌게 하면 초점 위에서 상이 무한히 멀어져 고정 경계에 담기지
 * 않고, 스크린이 상 거리에 서 있지 않은 자리에서는 흐린 빛이 실상인지 허상인지 가려지지 않는다.
 */
export const controllers: readonly ControllerSpec[] = [];
