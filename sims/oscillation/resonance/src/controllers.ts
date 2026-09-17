// ========================================================================
// resonance — 조작기
// ========================================================================
// 슬라이더 하나 — 구동 진동수. 자동 진행만으로 주장은 끝나지만, 「봉우리가 특정 진동자의
// 성질」 이라는 오해를 독자가 직접 깰 수 있게 둔다. 옮기면 이전 봉우리는 줄고 새 열에
// 다시 쌓인다 (원본 NOTES (c)).
//
// 원본은 진동자 번호(6~54)를 값으로 삼고 숫자를 보이지 않았다. 슬라이더 값 표시를 끌 수
// 없어(장부 G22) 뜻 없는 번호 대신 구동 진동수(Hz)를 값으로 둔다. 원본은 캡션 오른쪽에 두었다.
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';

import { DRIVE, OSC, naturalHz, text } from './schema';

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'drive',
    type: 'slider',
    binds: { value: 'driveHz' },
    range: [naturalHz(DRIVE.minIdx), naturalHz(DRIVE.maxIdx)],
    step: OSC.df,
    digits: 2,
    unit: 'Hz',
    label: text('label.drive'),
    at: { screen: 'bottom-right' },
  },
];
