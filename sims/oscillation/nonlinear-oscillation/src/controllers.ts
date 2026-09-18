import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 진폭을 끌게 하면 한 레인만으로도 「진폭이 주기를 바꾼다」 를 보일 수 있지만, 그러면
 * 비교가 **기억 속**(아까 작게 했을 때)으로 넘어간다. 두 진폭을 나란히 두고 같은 시간축에
 * 적어야 한 화면에서 「위는 점선 그대로, 아래는 앞질러 간다」 가 동시에 보인다. 끄는 도중에는
 * 기록이 다시 적혀야 해서 캡션도 화면과 어긋난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
