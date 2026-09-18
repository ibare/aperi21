// ========================================================================
// wave-basics — 조작기
// ========================================================================
// 슬라이더 둘 — 파장 · 진폭. 자동 진행만으로 주장은 끝나지만, 「파장을 늘여도 한 번
// 흔들리는 동안 마루는 여전히 꼭 한 파장을 간다(대신 더 빨리 간다)」 와 「진폭은 높이만
// 바꾸고 가는 거리는 바꾸지 않는다」 를 독자가 직접 해 볼 수 있게 둔다.
//
// 값을 바꾸면 `restart` 로 한 주기의 처음부터 다시 잰다 — 막대가 λ 를 반쯤 채운 채
// 파장이 바뀌면 「한 주기에 한 파장」 의 비교가 흐트러진다.
//
// 진동수는 두지 않는다. 한 번 흔들리는 시간은 시간표 `travel` 한 벌인데, 단계 길이가
// 조작값을 따라가지 못한다 (장부 G13).
//
// 범위는 정적 선언이다 (원칙 7). 상태로 계산하거나 조건부로 돌려주지 않는다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { AMPLITUDE_RANGE, WAVELENGTH_RANGE, text } from './schema';

/** 조작기 크기(화면 px). 둘을 아래 줄에 나란히 두려고 기본(220)보다 좁힌다. */
const SLIDER_SIZE: readonly [number, number] = [190, 44];
/** 두 번째 슬라이더를 첫 번째 오른쪽으로 옮기는 거리(화면 px). */
const SLIDER_ROW_GAP = 204;

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'wavelength',
    type: 'slider',
    binds: { value: 'wavelength' },
    range: [WAVELENGTH_RANGE.min, WAVELENGTH_RANGE.max],
    step: WAVELENGTH_RANGE.step,
    digits: 1,
    unit: 'm',
    label: text('label.wavelengthControl'),
    size: SLIDER_SIZE,
    at: { screen: 'bottom-left' },
    restart: true,
  },
  {
    id: 'amplitude',
    type: 'slider',
    binds: { value: 'amplitude' },
    range: [AMPLITUDE_RANGE.min, AMPLITUDE_RANGE.max],
    step: AMPLITUDE_RANGE.step,
    digits: 1,
    unit: 'm',
    label: text('label.amplitudeControl'),
    size: SLIDER_SIZE,
    at: { screen: 'bottom-left', offset: [SLIDER_ROW_GAP, 0] },
    restart: true,
  },
];
