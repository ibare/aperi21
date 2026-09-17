import type { ControllerSpec } from '@aperi21/schema';
import { CONTROL_Y, text } from './schema';

/**
 * 압력 고르기 하나.
 *
 * 자동 진행으로 두 압력 비교는 끝나지만 「삼중점 근처는 어떻게 되나」 는 독자가 직접 압력을
 * 옮겨 봐야 확인되는 질문이라 둔다(원본 NOTES). 잡는 순간 고른 압력의 가열이 처음부터 다시
 * 놓이고, 첫 띠에는 높은 압력의 결과가 비교용으로 남는다 — 그 전환은 `step` 이 `held` 로 알아챈다.
 *
 * 자리는 원본처럼 캡션 아래 왼쪽 줄. 월드 앵커는 상자 가운데라 반폭만큼 오른쪽으로 민다.
 */
const SIZE: [number, number] = [220, 44];

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'pressure',
    type: 'slider',
    binds: { value: 'pressure' },
    heldPath: 'held',
    range: [0.08, 0.75],
    step: 0.01,
    label: text('label.pressureControl'),
    at: { world: [12, -CONTROL_Y], offset: [SIZE[0] / 2, 0] },
    size: SIZE,
  },
];
