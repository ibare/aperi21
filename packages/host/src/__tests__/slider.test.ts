/**
 * 슬라이더 값 다듬기 — 간격이 있으면 `lo` 를 기준으로 붙이고, 없으면 연속이다.
 *
 * 기준점이 0 이 아니라 `lo` 라는 것이 요점이다. `ParamDef.step` 은 0 을 기준으로
 * 붙으므로, 같은 이름을 보고 같은 동작을 기대하면 `[1, 10]` 간격 2 에서 답이 갈린다.
 */
import { describe, expect, it } from 'vitest';
import { sliderValue } from '../controller/slider';

describe('sliderValue', () => {
  it('step 이 없으면 연속이다 — 픽셀 잡음만 소수 셋째 자리에서 걷는다', () => {
    expect(sliderValue(12.34567, { range: [-45, 45] })).toBe(12.346);
  });

  it('step 은 range[0] 을 기준으로 붙는다', () => {
    expect(sliderValue(-31.9, { range: [-45, 45], step: 5 })).toBe(-30);
    expect(sliderValue(4.2, { range: [1, 10], step: 2 })).toBe(5);
  });

  it('붙인 값에 부동소수 꼬리가 남지 않는다', () => {
    expect(sliderValue(0.31, { range: [0, 1], step: 0.1 })).toBe(0.3);
  });

  it('마지막 칸이 range 밖으로 나가지 않는다', () => {
    expect(sliderValue(10, { range: [0, 10], step: 3 })).toBe(9);
    expect(sliderValue(45, { range: [-45, 45], step: 5 })).toBe(45);
    // 끝이 칸 위에 없으면 범위 안 마지막 칸이다 — 칸 밖의 끝값을 돌려주지 않는다.
    expect(sliderValue(10, { range: [0, 10], step: 4 })).toBe(8);
    expect(sliderValue(-99, { range: [0, 10], step: 4 })).toBe(0);
  });
});
