import type { ControllerSpec } from '@aperi21/schema';
import { text } from './schema';

/**
 * 「지금 놓기」 하나.
 *
 * 자동 진행만으로 주장은 끝나지만 "내가 아무 때나 놓아도 접선인가" 는 독자가 직접
 * 해 봐야 믿는 부분이라 둔다 (원본 NOTES). 누르면 러너가 `pressed` 에 true 를 적고,
 * `step` 이 소비한 걸음에서 지운다. 이미 놓인 때 누르면 `step` 이 무시한다.
 *
 * 자리를 선언한다 — 원본은 캡션 줄 오른쪽 끝에 단추가 있었다. 선언한 자리는 프레이밍
 * 여백으로 세지 않아, 세로가 단추 몫만큼 줄어들지 않는다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'release',
    type: 'button',
    binds: { pressed: 'pressed' },
    label: text('label.release'),
    at: { screen: 'bottom-right', offset: [-4, -4] },
  },
];
