/**
 * 시간표 — `BundleSchema.timeline` 을 시각에서 푸는 규칙.
 *
 * 조각이 손으로 짜던 경계 처리를 한 곳으로 모은 것이라, 여기서 경계가 흔들리면
 * 시간표를 쓰는 조각 전부가 같이 흔들린다.
 */
import { describe, expect, it } from 'vitest';
import type { BundleSchema, TimelineDef } from '@aperi21/schema';
import { CAPTION_ID, captionPrimitive, evaluateTimeline, withCaption } from '../index';

const DEF: TimelineDef = {
  startAt: 0.5,
  phases: [
    { id: 'a', duration: 1, caption: 'c.one' },
    { id: 'b', duration: 2, ease: 'smooth', caption: 'c.two' },
    { id: 'c', duration: 1, caption: 'c.two' },
  ],
};

const SCHEMA: BundleSchema = {
  id: 'test',
  label: { en: 'Test' },
  category: 'test',
  operation: { en: 'Test' },
  timeModel: 'linear',
  parameters: [],
  stages: [{ id: 'main', label: { en: 'Main' }, constants: {} }],
  environments: [],
  views: [{ id: 'main', label: { en: 'Main' }, default: true }],
  timeline: DEF,
  caption: { anchor: { screen: 'bottom-left' }, fade: 1, text: 'c.fixed' },
  messages: {
    'c.one': { en: 'one' },
    'c.two': { en: 'two' },
    'c.fixed': { en: 'fixed' },
  },
};

describe('evaluateTimeline', () => {
  it('흐른 시간에 startAt 을 더하고 주기로 나눈다', () => {
    const f = evaluateTimeline(DEF, 4);
    expect(f.t).toBe(4.5);
    expect(f.period).toBe(4);
    expect(f.cycle).toBe(1);
    expect(f.u).toBe(0.5);
    expect(f.phase).toBe('a');
  });

  it('경계에 선 순간은 다음 단계의 시작이다', () => {
    const f = evaluateTimeline(DEF, 0.5); // u = 1
    expect(f.phase).toBe('b');
    expect(f.progress).toBe(0);
  });

  it('at 은 전에 0, 뒤에 1, 동안은 선언한 이징을 건다', () => {
    const f = evaluateTimeline(DEF, 1); // u = 1.5, b 의 1/4
    expect(f.at('a')).toBe(1);
    expect(f.at('c')).toBe(0);
    expect(f.at('b')).toBeCloseTo(0.15625); // smoothstep(0.25)
    expect(f.progress).toBeCloseTo(0.15625);
  });

  it('start · end · duration 은 주기 안 시각이다', () => {
    const f = evaluateTimeline(DEF, 0);
    expect(f.start('b')).toBe(1);
    expect(f.end('b')).toBe(3);
    expect(f.duration('c')).toBe(1);
  });

  it('span 은 주기 안 임의 구간의 진행도다', () => {
    const f = evaluateTimeline(DEF, 1.5); // u = 2
    expect(f.span(1, 3)).toBe(0.5);
    expect(f.span(3, 4)).toBe(0);
    expect(f.span(0, 1)).toBe(1);
  });

  it('같은 캡션이 이어지는 단계는 한 문장이다 — 나이는 그 첫 단계부터', () => {
    const f = evaluateTimeline(DEF, 3); // u = 3.5, 단계 c
    expect(f.phase).toBe('c');
    expect(f.caption).toBe('c.two');
    expect(f.captionAge).toBe(2.5);
  });

  it('없는 단계를 부르면 던진다 — 빈 값으로 넘어가면 화면이 조용히 틀린다', () => {
    const f = evaluateTimeline(DEF, 0);
    expect(() => f.at('nope')).toThrow();
  });

  it('선언이 틀리면 던진다', () => {
    expect(() => evaluateTimeline({ phases: [] }, 0)).toThrow();
    expect(() => evaluateTimeline({ phases: [{ id: 'a', duration: 0 }] }, 0)).toThrow();
    expect(() =>
      evaluateTimeline({ phases: [{ id: 'a', duration: 1 }, { id: 'a', duration: 1 }] }, 0),
    ).toThrow();
  });
});

describe('캡션 슬롯', () => {
  it('지금 단계의 캡션을 LocalizedText 로 싣고, 문장이 바뀐 순간부터 페이드 인 한다', () => {
    const start = captionPrimitive(SCHEMA, evaluateTimeline(DEF, 0.5)); // b 시작
    expect(start?.text).toEqual({ en: 'two' });
    expect(start?.opacity).toBe(0);
    const later = captionPrimitive(SCHEMA, evaluateTimeline(DEF, 2.5)); // c 안, 같은 문장
    expect(later?.opacity).toBe(1);
  });

  it('시간표가 없으면 고정 문안을 그대로 쓴다', () => {
    const c = captionPrimitive(SCHEMA);
    expect(c?.text).toEqual({ en: 'fixed' });
    expect(c?.opacity).toBe(1);
  });

  it('messages 에 없는 키는 던진다', () => {
    expect(() => captionPrimitive({ ...SCHEMA, messages: {} })).toThrow();
  });

  it('슬롯이 없으면 scene 을 그대로 돌려준다', () => {
    const scene = [{ type: 'marker', kind: 'pin', pos: [0, 0] }] as const;
    expect(withCaption(scene, { ...SCHEMA, caption: undefined })).toBe(scene);
  });

  it('scene 이 캡션 id 를 쓰면 던진다 — 캡션이 둘이 된다', () => {
    const scene = [{ type: 'marker', id: CAPTION_ID, kind: 'pin', pos: [0, 0] }] as const;
    expect(() => withCaption(scene, SCHEMA)).toThrow();
  });
});
