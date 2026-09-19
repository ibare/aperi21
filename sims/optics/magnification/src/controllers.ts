import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 물체를 먼 자리 → 가운데 → 가까운 자리로 옮기는 것으로 「물체가 다가가면 상이 멀어지며
 * 커진다」 가 자동 진행으로 끝난다. 물체를 끌게 하면 초점 안쪽(허상)이나 초점 위(상이 무한히
 * 멀다)로 들어가 이 조각이 말하지 않는 그림이 되고, 멈춤 자리마다 선언한 배율 정박값도
 * 쓸 수 없게 된다.
 */
export const controllers: readonly ControllerSpec[] = [];
