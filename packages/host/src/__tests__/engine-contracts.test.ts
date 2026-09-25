/**
 * 01-broad 배치가 올린 계약 넷 — 프리롤 · 조작기 인계 · 상태 캡션 · 자국.
 *
 * 조각 아홉이 손으로 짜던 것들이라, 여기서 흔들리면 그 조각들이 전부 같이 흔들린다.
 */
import { describe, expect, it } from 'vitest';
import type { Bundle, BundleSchema, ControllerSpec, SceneGraph } from '@aperi21/schema';
import { captionPrimitive, markHeld, prerollState } from '../index';

const STAGE = { id: 'main', label: { en: 'Main' }, constants: {} };

interface CountState extends Record<string, unknown> {
  steps: number;
  held: boolean;
}

function bundleWith(preroll?: number): Bundle<CountState> {
  return {
    schema: {
      id: 'test',
      label: { en: 'T' },
      category: 'test',
      description: { en: 'T' },
      timeModel: 'linear',
      parameters: [],
      stages: [STAGE],
      environments: [],
      views: [{ id: 'v', label: { en: 'V' }, default: true }],
      ...(preroll === undefined ? {} : { preroll }),
    } as BundleSchema,
    initialState: () => ({ steps: 0, held: false }),
    // 걸음 수만 센다 — 프리롤이 실제로 `step` 을 불렀는지 세기 위해서다.
    step: ({ state }) => ({ ...state, steps: state.steps + 1 }),
    scene: (): SceneGraph => [],
    controllers: [],
  };
}

describe('preroll — 마운트 전에 step 을 미리 굴린다', () => {
  it('선언이 없으면 한 걸음도 굴리지 않는다', () => {
    const b = bundleWith();
    const s = prerollState(b, b.initialState({ values: {}, stage: STAGE, environments: [] }), STAGE, []);
    expect(s.steps).toBe(0);
  });

  it('선언한 초만큼 60fps 고정 걸음으로 굴린다', () => {
    const b = bundleWith(1);
    const s = prerollState(b, b.initialState({ values: {}, stage: STAGE, environments: [] }), STAGE, []);
    expect(s.steps).toBe(60);
  });

  it('같은 선언은 언제나 같은 초기 상태를 만든다 — 실시간 dt 를 쓰지 않는다', () => {
    const b = bundleWith(2);
    const a = prerollState(b, b.initialState({ values: {}, stage: STAGE, environments: [] }), STAGE, []);
    const c = prerollState(b, b.initialState({ values: {}, stage: STAGE, environments: [] }), STAGE, []);
    expect(a.steps).toBe(c.steps);
    expect(a.steps).toBe(120);
  });
});

describe('heldPath — 잡고 있다는 사실만 적는다', () => {
  const spec = (heldPath?: string): ControllerSpec => ({
    id: 'c',
    type: 'slider',
    binds: { value: 'v' },
    range: [0, 1],
    label: { en: 'C' },
    ...(heldPath ? { heldPath } : {}),
  });

  it('선언한 경로에 true/false 를 쓴다', () => {
    const refs = { state: { held: false } as Record<string, unknown> };
    markHeld(refs, spec('held'), true);
    expect(refs.state.held).toBe(true);
    markHeld(refs, spec('held'), false);
    expect(refs.state.held).toBe(false);
  });

  it('선언하지 않으면 상태를 건드리지 않는다', () => {
    const before = { held: false };
    const refs = { state: before as Record<string, unknown> };
    markHeld(refs, spec(), true);
    expect(refs.state).toBe(before);
  });

  it('중첩 경로를 쓴다', () => {
    const refs = { state: { drag: { on: false } } as Record<string, unknown> };
    markHeld(refs, spec('drag.on'), true);
    expect((refs.state.drag as { on: boolean }).on).toBe(true);
  });
});

describe('caption.cases — 시각이 아니라 상태로 고른다', () => {
  const schema = (cases?: readonly { when: string; text: string }[]): BundleSchema =>
    ({
      id: 't',
      label: { en: 'T' },
      category: 't',
      description: { en: 'T' },
      timeModel: 'linear',
      parameters: [],
      stages: [STAGE],
      environments: [],
      views: [{ id: 'v', label: { en: 'V' }, default: true }],
      caption: { anchor: { screen: 'bottom-left' }, text: 'base', ...(cases ? { cases } : {}) },
      messages: {
        base: { en: 'base' },
        broken: { en: 'broken' },
        landed: { en: 'landed' },
      },
    }) as BundleSchema;

  it('참인 첫 항목의 문안을 쓴다 — 위에서부터 훑는다', () => {
    const s = schema([
      { when: 'broken', text: 'broken' },
      { when: 'landed', text: 'landed' },
    ]);
    const c = captionPrimitive(s, undefined, { broken: true, landed: true });
    expect(c?.text).toEqual({ en: 'broken' });
  });

  it('아무것도 참이 아니면 기본 문안으로 떨어진다', () => {
    const s = schema([{ when: 'broken', text: 'broken' }]);
    const c = captionPrimitive(s, undefined, { broken: false });
    expect(c?.text).toEqual({ en: 'base' });
  });

  it('상태를 주지 않으면 cases 를 보지 않는다', () => {
    const s = schema([{ when: 'broken', text: 'broken' }]);
    expect(captionPrimitive(s)?.text).toEqual({ en: 'base' });
  });

  it('없는 경로는 거짓으로 친다 — 없는 자리를 참으로 치지 않는다', () => {
    const s = schema([{ when: 'nope.deep', text: 'broken' }]);
    expect(captionPrimitive(s, undefined, {})?.text).toEqual({ en: 'base' });
  });
});
