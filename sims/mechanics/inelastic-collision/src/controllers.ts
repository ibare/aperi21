import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기 없음.
 *
 * 독자가 해 볼 만한 것은 「더 튀는 공이면?」 인데, 반발 계수를 바꾸면 꼭짓점의 비가 바뀔 뿐
 * 주장(매번 같은 비율로 낮아진다 — 그만큼 사라진다)은 그대로다. 한 공이 여러 번 튀는 것만으로
 * 비율이 되풀이되는 것이 화면에 선다. 반발 계수는 스테이지 상수(`restitution`)라 저작자가 바꾼다.
 */
export const controllers: readonly ControllerSpec[] = [];
