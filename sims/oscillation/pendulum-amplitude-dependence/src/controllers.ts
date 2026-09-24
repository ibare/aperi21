import type { ControllerSpec } from '@aperi21/schema';
import { AMP_RANGE, text } from './schema';

/**
 * 조작기는 하나 — 흔들림 크기.
 *
 * 이 하나를 둔 이유는 질문이 거기서 나오기 때문이다. "더 크게 흔들어도?" 60° 로
 * 밀면 왕복마다 0.13 초씩 밀려 띠의 세로줄이 눈에 띄게 기울고 캡션이 말을 바꾼다.
 * 독자가 근사의 경계를 스스로 찾는다.
 *
 * 아무것도 누르지 않아도 박동은 이미 돌고 있다 — 슬라이더는 그와 별개로 남는
 * 하나뿐인 손잡이다 (S-piece).
 *
 * 잡고 있는 동안 `held` 가 참이 된다. 그동안에만 조각이 값을 받아 θ·ω 를 같은
 * 비율로 늘린다 — 위상을 보존해야 박자가 끊기지 않는다 (physics.ts `step`).
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'amplitude',
    type: 'slider',
    binds: { value: 'ampDeg' },
    heldPath: 'held',
    range: AMP_RANGE,
    unit: '°',
    label: text('control.amplitude'),
    // 진자가 닿지 않는 오른쪽 위. 자리는 저작 결정이라 선언이 말한다 (원칙 7 ③).
    at: { screen: 'top-right' },
  },
];
