// ========================================================================
// projectile-in-wind — 조작기
// ========================================================================
// 슬라이더 하나 — 바람 세기. 아무것도 누르지 않아도 한 주기 안에 주장이 끝나지만
// (S-piece), 「바람이 셀수록 더 벌어진다」 는 독자가 직접 끌어 봐야 하는 것이다.
// 무풍 레인과 기준선은 바람이 어떻게 바뀌어도 그 자리에 있어서, 움직이는 것은
// 바깥 두 자국뿐이라는 것이 눈에 남는다.
//
// 아래 끝은 0 이 아니라 3 m/s 다 — 0 이면 셋이 같은 자리에 떨어져 캡션의 「멀리 ·
// 가깝게」 가 화면과 어긋난다 (S-piece — 캡션은 모든 값에서 참이어야 한다).
//
// 캡션 줄과 겹치지 않도록 오른쪽 위에 둔다. 앞바람 레인의 궤적은 일찍 끝나서
// 그 구석이 비어 있다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { text, WIND } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'wind',
    type: 'slider',
    binds: { value: 'wind' },
    range: [WIND.min, WIND.max],
    step: WIND.step,
    digits: 1,
    unit: 'm/s',
    label: text('label.wind'),
    at: { screen: 'top-right' },
  },
];
