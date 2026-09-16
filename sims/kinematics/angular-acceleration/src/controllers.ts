// ========================================================================
// angular-acceleration — 조작기 선언
// ========================================================================
// 조작기 선언은 **데이터**다 (원칙 7 ④).
//
// 슬라이더 둘. α 를 0 까지 내려 눈금 간격이 완전히 고르게 되는 것을 보는 것이 이
// 주장의 반례 확인이고, ω₀ 는 그 대조항이다 — 올리면 간격 전체가 넓어지지만 벌어지는
// 비율은 그대로여서 ω 와 α 가 화면에서 하는 일이 다르다는 것이 드러난다.
//
// `heldPath` 를 선언하지 않는다. 잡았다는 사실을 쓸 자리가 없다 — 이 조각에는 두 값을
// 미는 자동 진행이 아예 없어서 양보할 것이 없고, 놓은 뒤 돌아갈 값도 없다. 선언만 하고
// 아무도 읽지 않으면 저작자에게 거짓말이 된다 (S-render).
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { ALPHA_RANGE, OMEGA0_RANGE, text } from './schema';

/** 슬라이더 상자 크기(화면 px). 원본의 트랙 148 px + 이름표 + 값 자리. */
const SLIDER_SIZE: [number, number] = [212, 40];

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'omega0',
    type: 'slider',
    binds: { value: 'omega0' },
    range: OMEGA0_RANGE,
    label: text('control.omega0'),
    unit: 'rad/s',
    // 원본은 캔버스 아래 한 줄에 둘을 나란히 두었다. 캡션이 가운데를 쓰므로 양 끝이다.
    at: { screen: 'bottom-left' },
    size: SLIDER_SIZE,
  },
  {
    id: 'alpha',
    type: 'slider',
    binds: { value: 'alpha' },
    range: ALPHA_RANGE,
    label: text('control.alpha'),
    unit: 'rad/s²',
    at: { screen: 'bottom-right' },
    size: SLIDER_SIZE,
  },
];
