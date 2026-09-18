import type { ControllerSpec } from '@aperi21/schema';
import { BLOCK_MASS_OPTIONS, text } from './schema';

/**
 * 조작기는 하나 — 나무토막 질량을 고르는 칩 줄.
 *
 * 자동 진행만으로 주장은 끝난다(0.8 kg 한 번으로 두 단계를 다 보인다). 칩은 독자가
 * 직접 해 봐야 아는 것을 위한 것이다 — 토막이 무거울수록 **운동량 막대는 그대로인데
 * 에너지 막대만 더 낮아지고** 토막도 덜 올라간다. 남는 몫이 m/(m+M) 이라는 것이
 * 두 막대의 대비로 나온다.
 *
 * 고르면 처음부터 다시 날아온다 — `restart`. 이 조각은 상태를 쌓지 않으므로 엔진
 * 시계를 되돌리는 것으로 충분하다.
 *
 * 자리는 왼쪽 위 — 탄알이 날아오는 자리 위쪽이 비어 있고, 아래는 캡션 줄이다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'block-mass',
    type: 'param-chips',
    binds: { value: 'blockMass' },
    label: text('control.blockMass'),
    options: [
      { value: BLOCK_MASS_OPTIONS[0], label: text('option.mass08') },
      { value: BLOCK_MASS_OPTIONS[1], label: text('option.mass14') },
      { value: BLOCK_MASS_OPTIONS[2], label: text('option.mass24') },
    ],
    restart: true,
    at: { screen: 'top-left' },
  },
];
