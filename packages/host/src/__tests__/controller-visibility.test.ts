/**
 * 조작기 선언은 데이터다 (원칙 7 ④). 상태에 따라 뜨고 지는 것은 선언이 **상태
 * 경로를 가리켜** 표현하고, 거르는 일은 러너가 한다.
 *
 * 여기서 지키는 것은 둘이다 — 가리킨 자리가 참일 때만 뜨는 것, 그리고 **거르기
 * 전 선언 순서로 slot 을 세는 것.** 거른 목록으로 다시 세면 숨었다 나타난
 * 조작기가 앞의 빈자리로 미끄러져, 저작자가 아무것도 바꾸지 않았는데 자리가
 * 움직인다.
 */
import { describe, expect, it } from 'vitest';
import type { ControllerSpec } from '@aperi21/schema';
import { visibleControllers } from '../index';

const slider = (id: string, visibleWhen?: string): ControllerSpec => ({
  id,
  type: 'slider',
  binds: { value: id },
  range: [0, 1],
  label: { en: id },
  ...(visibleWhen ? { visibleWhen } : {}),
});

describe('visibleControllers', () => {
  it('visibleWhen 이 없으면 언제나 보인다', () => {
    const out = visibleControllers([slider('a'), slider('b')], {});
    expect(out.map((e) => e.spec.id)).toEqual(['a', 'b']);
  });

  it('가리킨 자리가 참일 때만 보인다', () => {
    const specs = [slider('a', 'ready')];
    expect(visibleControllers(specs, { ready: false })).toHaveLength(0);
    expect(visibleControllers(specs, { ready: true })).toHaveLength(1);
  });

  it('중첩 경로를 읽는다', () => {
    const specs = [slider('a', 'sweep.done')];
    expect(visibleControllers(specs, { sweep: { done: true } })).toHaveLength(1);
    expect(visibleControllers(specs, { sweep: { done: false } })).toHaveLength(0);
  });

  it('경로가 없으면 숨는다 — 없는 자리를 참으로 치지 않는다', () => {
    expect(visibleControllers([slider('a', 'nope')], {})).toHaveLength(0);
  });

  it('slot 은 거르기 전 선언 순서다 — 숨은 것이 뒤의 자리를 당기지 않는다', () => {
    const specs = [slider('a', 'ready'), slider('b')];
    const out = visibleControllers(specs, { ready: false });
    expect(out.map((e) => e.spec.id)).toEqual(['b']);
    // a 가 숨어도 b 는 두 번째 자리에 머문다.
    expect(out[0]!.slot).toBe(1);
  });

  it('선언을 바꾸지 않는다 — 한 문서의 임베드들이 같은 객체를 본다 (C5 · 원칙 6)', () => {
    const spec = slider('a');
    const before = JSON.stringify(spec);
    visibleControllers([spec], {});
    expect(JSON.stringify(spec)).toBe(before);
  });
});
