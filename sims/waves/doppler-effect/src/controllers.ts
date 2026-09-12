import type { ControllerSpec } from '@aperi21/schema';
import { MAX_VC, text } from './schema';

/**
 * 조작기 선언은 데이터다 (원칙 7 ④).
 *
 * 원천 속도 하나. 자동 진행은 v/c = 0.60 한 점만 보여 주므로, 0 으로 내려
 * 동심원으로 되돌리는 것과 0.85 로 올려 앞쪽이 뒤쪽의 1/12 이 되는 것은 손이
 * 해야 하는 일이다 — 독자가 주장의 반례를 직접 만들 수 있어야 한다.
 *
 * `heldPath` 가 인계 규약이다. 잡기 전에는 `step` 이 자동 값을 `ui.vc` 에 따라
 * 적어 조작기가 화면과 어긋나지 않고, 잡는 순간 러너가 `ui.held` 를 적으면
 * 조각이 값을 넘겨받는다. 무엇으로 돌아갈지는 조각이 안다 — 이 조각은 돌아가지
 * 않는다 (physics.ts).
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'source-speed',
    type: 'slider',
    binds: { value: 'ui.vc' },
    heldPath: 'ui.held',
    range: [0, MAX_VC],
    label: text('label.speed'),
    // 수식 표기라 번역 대상이 아니다 (C1 판정 3).
    unit: 'v/c',
  },
];
