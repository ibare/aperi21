// @vitest-environment jsdom
/**
 * 임베드 런타임 회귀 테스트.
 *
 * 여기 있는 것들은 **타입도 통과하고 예외도 나지 않는** 종류의 위반이라 테스트로만
 * 잡힌다 (원칙 6, S-render, C5). 규칙 문서가 말로 금지하는 것을 실제로 재는 자리다.
 *
 *  1. 마운트 후 캔버스 세로 불변 — 글에 박힌 그림의 높이가 변하면 위아래 문단이 밀린다.
 *  2. 임베드 인스턴스 독립 — 한 문서에 여러 개가 살아도 서로 간섭하지 않는다 (fae3f35).
 *  3. destroy 뒷정리 — RAF 루프와 리스너를 남기지 않는다.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type {
  Bundle,
  BundleSchema,
  ControllerSpec,
  SceneGraph,
  StageDef,
} from '@aperi21/schema';
import { createHost, runBundle, type ControllerImpl } from '../index';

// ── fixture ────────────────────────────────────────────────────────────────
// sim 패키지를 끌어오지 않는다 (S-sim: 다른 패키지 import 금지 / C7 경계).
// 런타임이 요구하는 최소 표면만 가진 번들을 여기서 만든다.

interface TestState { t: number }

const STAGE: StageDef = { id: 'flat', label: { en: 'Flat' }, constants: { g: 9.8 } };

const SCHEMA: BundleSchema = {
  id: 'test',
  label: { en: 'Test' },
  category: 'test',
  operation: { en: 'Test' },
  timeModel: 'linear',
  parameters: [],
  stages: [STAGE],
  environments: [],
  views: [{ id: 'main', label: { en: 'Main' }, default: true }],
};

function makeBundle(): Bundle<TestState> {
  return {
    schema: SCHEMA,
    initialState: () => ({ t: 0 }),
    step: ({ state, dt }) => ({ t: state.t + dt }),
    // 상태가 좌표에 그대로 드러나게 해서, 기록된 그리기 호출로 진행을 관찰한다.
    scene: ({ state }): SceneGraph => [
      { type: 'body', id: 'b', pos: [state.t, 0], shape: 'circle', size: 1 },
    ] as unknown as SceneGraph,
    controllers: [] as readonly ControllerSpec[],
  };
}

// ── 2D 컨텍스트 스텁 ───────────────────────────────────────────────────────
// jsdom 은 2D 컨텍스트를 주지 않는다(native canvas 미설치). 없으면 runBundle 이
// 조기 반환하므로 RAF 루프까지 가지 못한다. 호출을 기록하는 스텁을 끼워
// 실제 프레임 경로를 태운다.

interface Recorder { calls: string[] }

function installCanvasStub(): Recorder {
  const rec: Recorder = { calls: [] };
  const ctx = new Proxy(
    {},
    {
      get(_t, prop: string | symbol) {
        if (prop === 'measureText') return () => ({ width: 0 });
        if (typeof prop !== 'string') return undefined;
        // 그라디언트 팩토리는 addColorStop 을 가진 객체를 돌려줘야 한다.
        if (prop.startsWith('create')) {
          return (...args: unknown[]) => {
            rec.calls.push(`${prop}(${args.join(',')})`);
            return { addColorStop: () => undefined };
          };
        }
        return (...args: unknown[]) => {
          rec.calls.push(`${prop}(${args.join(',')})`);
        };
      },
      set() {
        return true;
      },
    },
  );
  (HTMLCanvasElement.prototype as unknown as {
    getContext: () => unknown;
  }).getContext = () => ctx;
  return rec;
}

// ── RAF 수동 구동 ──────────────────────────────────────────────────────────
// 프레임을 우리가 돌려야 결정적이다.

interface RafHarness {
  tick(frames?: number): void;
  pending(): number;
}

function installRaf(): RafHarness {
  let seq = 1;
  let now = 0;
  const queue = new Map<number, FrameRequestCallback>();
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
    const id = seq++;
    queue.set(id, cb);
    return id;
  };
  globalThis.cancelAnimationFrame = (id: number) => {
    queue.delete(id);
  };
  return {
    tick(frames = 1) {
      for (let i = 0; i < frames; i++) {
        now += 16;
        const due = [...queue.entries()];
        queue.clear();
        for (const [, cb] of due) cb(now);
      }
    },
    pending: () => queue.size,
  };
}

let raf: RafHarness;
let rec: Recorder;

beforeEach(() => {
  rec = installCanvasStub();
  raf = installRaf();
});

afterEach(() => {
  document.body.innerHTML = '';
});

// ── 1. 마운트 후 세로 불변 (원칙 6, S-render) ──────────────────────────────

describe('임베드 높이', () => {
  it('마운트 후 프레임이 흘러도 컨테이너 세로가 바뀌지 않는다', () => {
    const mount = document.createElement('div');
    document.body.appendChild(mount);

    const handle = runBundle(makeBundle(), mount);
    const wrapper = mount.querySelector('.aperi21-runbundle') as HTMLElement;
    expect(wrapper).toBeTruthy();

    const heightAtMount = wrapper.style.height;
    const minHeightAtMount = wrapper.style.minHeight;
    expect(heightAtMount).not.toBe('');

    const drawnBefore = rec.calls.length;
    raf.tick(60);
    // 프레임이 실제로 돌았는지 먼저 확인한다 — 안 돌면 이 테스트는 공허하다.
    expect(rec.calls.length).toBeGreaterThan(drawnBefore);

    // 글 안에 박힌 그림의 높이가 재생 중에 변하면 위아래 문단이 밀린다.
    expect(wrapper.style.height).toBe(heightAtMount);
    expect(wrapper.style.minHeight).toBe(minHeightAtMount);

    handle.destroy();
  });
});

// ── 2. 인스턴스 독립 (원칙 6, fae3f35 재발 방지) ───────────────────────────

describe('임베드 인스턴스 독립', () => {
  it('두 인스턴스가 각자의 DOM 과 프레임 루프를 갖는다', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    document.body.append(a, b);

    const ha = runBundle(makeBundle(), a);
    const hb = runBundle(makeBundle(), b);

    const wa = a.querySelector('.aperi21-runbundle');
    const wb = b.querySelector('.aperi21-runbundle');
    expect(wa).toBeTruthy();
    expect(wb).toBeTruthy();
    expect(wa).not.toBe(wb);

    // 각자 자기 RAF 루프를 예약한다. 하나로 합쳐져 있으면 1이 된다.
    expect(raf.pending()).toBe(2);

    ha.destroy();
    hb.destroy();
  });

  it('한 인스턴스를 destroy 해도 다른 인스턴스는 계속 그린다', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    document.body.append(a, b);

    const ha = runBundle(makeBundle(), a);
    const hb = runBundle(makeBundle(), b);
    raf.tick(2);

    ha.destroy();

    // A 의 컨테이너는 비고 B 는 남는다.
    expect(a.querySelector('.aperi21-runbundle')).toBeNull();
    expect(b.querySelector('.aperi21-runbundle')).toBeTruthy();

    // B 의 루프는 살아 있고 계속 그린다 — 카메라·시간 엔진이 공유돼 있으면 여기서 죽는다.
    expect(raf.pending()).toBe(1);
    const drawnBefore = rec.calls.length;
    raf.tick(5);
    expect(rec.calls.length).toBeGreaterThan(drawnBefore);
    expect(raf.pending()).toBe(1);

    hb.destroy();
  });

  it('host 를 함께 쓰는 두 임베드가 조작기를 따로 만든다 — 드래그 상태가 섞이지 않는다', () => {
    // host 는 문서 전체가 공유한다. 조작기 인스턴스가 host 에 있으면 A 의 발사대를
    // 당길 때 B 의 발사대도 당겨진 모습으로 그려졌다.
    const made: ControllerImpl[] = [];
    const host = createHost({
      capabilities: {
        controllers: {
          slider: () => {
            const impl: ControllerImpl = {
              type: 'slider',
              render: () => undefined,
              hitTest: () => false,
              onPointerDown: () => null,
              onPointerMove: () => null,
              onPointerUp: () => null,
              isDragging: () => false,
            };
            made.push(impl);
            return impl;
          },
        },
      },
    });
    const bundle: Bundle<TestState> = {
      ...makeBundle(),
      controllers: [
        { id: 't', type: 'slider', binds: { value: 't' }, range: [0, 1], label: { en: 'T' } },
      ] as readonly ControllerSpec[],
    };
    const a = document.createElement('div');
    const b = document.createElement('div');
    document.body.append(a, b);

    const ha = runBundle(bundle, a, { host });
    const hb = runBundle(bundle, b, { host });
    raf.tick(3);

    // 임베드마다 하나, 프레임이 흘러도 더 만들지 않는다.
    expect(made).toHaveLength(2);
    expect(made[0]).not.toBe(made[1]);

    ha.destroy();
    hb.destroy();
  });

  it('두 손가락이 두 조작기를 동시에 끈다 — 두 번째 손가락이 첫 번째를 가로채지 않는다', () => {
    // 한 조각에 같은 종류를 둘 선언한다. 왼쪽 반(px < 100)은 a, 오른쪽 반은 b 가 잡는다.
    const moves: string[] = [];
    const ups: string[] = [];
    const host = createHost({
      capabilities: {
        controllers: {
          slider: (): ControllerImpl => ({
            type: 'slider',
            render: () => undefined,
            hitTest: (input, _ctx, spec) => (spec.id === 'a') === input.px < 100,
            onPointerDown: () => null,
            onPointerMove: (_input, _ctx, spec) => {
              moves.push(spec.id);
              return null;
            },
            onPointerUp: (_input, _ctx, spec) => {
              ups.push(spec.id);
              return null;
            },
            isDragging: () => false,
          }),
        },
      },
    });
    const bundle: Bundle<TestState> = {
      ...makeBundle(),
      controllers: [
        { id: 'a', type: 'slider', binds: { value: 'a' }, range: [0, 1], label: { en: 'A' } },
        { id: 'b', type: 'slider', binds: { value: 'b' }, range: [0, 1], label: { en: 'B' } },
      ] as readonly ControllerSpec[],
    };
    const mount = document.createElement('div');
    document.body.append(mount);
    const handle = runBundle(bundle, mount, { host });
    const canvas = mount.querySelector('canvas')!;
    const fire = (type: string, pointerId: number, x: number): void => {
      const ev = new Event(type, { bubbles: true });
      Object.assign(ev, { pointerId, clientX: x, clientY: 10, button: 0, buttons: 1 });
      canvas.dispatchEvent(ev);
    };

    fire('pointerdown', 1, 50); // 손가락 1 → a
    fire('pointerdown', 2, 150); // 손가락 2 → b. 예전에는 여기서 a 의 드래그를 가로챘다
    fire('pointermove', 1, 60);
    fire('pointermove', 2, 160);
    fire('pointerup', 2, 160); // b 를 놓아도 a 는 계속 잡혀 있다
    fire('pointermove', 1, 70);

    expect(moves).toEqual(['a', 'b', 'a']);
    expect(ups).toEqual(['b']);

    handle.destroy();
  });
});

// ── 3. destroy 뒷정리 (C5) ─────────────────────────────────────────────────

// ── 4. 끝난 뒤 다시 시작하기 (시간 엔진 · 러너) ────────────────────────────

describe('종료된 조각을 되살리면 시계가 다시 흐른다', () => {
  it('조작기가 상태를 되돌리면 step 이 다시 불린다', () => {
    // 엔진 쪽 계약은 `time-resume.test.ts` 가 잠근다. 여기서 재는 것은 **러너가
    // 실제로 되살리는가** 다.
    //
    // 조각이 `isTerminated` 로 「끝났다」고 하면 러너가 시계를 세운다. 세워진 시계의
    // `tick()` 은 0 을 돌려주므로 **`bundle.step` 이 아예 안 불린다.** 그래서 발사대를
    // 다시 당기거나 스테이지·환경을 바꿔도 상태만 갱신되고 화면은 멎어 있었다 —
    // 예외도 안 나고 타입도 통과한다.
    const steps: number[] = [];
    const bundle: Bundle<TestState> = {
      ...makeBundle(),
      step: ({ state, dt }) => {
        steps.push(state.t);
        return { t: state.t + dt };
      },
      isTerminated: (s) => s.t >= 0.05,
      // 누르면 처음으로 되돌린다 — 발사대의 재장전과 같은 모양이다.
      controllers: [
        { id: 'r', type: 'slider', binds: { value: 't' }, range: [0, 1], label: { en: 'R' } },
      ] as readonly ControllerSpec[],
    };
    const host = createHost({
      capabilities: {
        controllers: {
          slider: () => ({
            type: 'slider',
            render: () => undefined,
            hitTest: () => true,
            onPointerDown: (_i, _c, _s, state) => ({ ...(state as TestState), t: 0 }),
            onPointerMove: () => null,
            onPointerUp: () => null,
            isDragging: () => false,
          }) as ControllerImpl,
        },
      },
    });

    const mount = document.createElement('div');
    document.body.append(mount);
    const handle = runBundle(bundle, mount, { host });

    raf.tick(30);
    const afterTerminated = steps.length;
    // 끝났으니 더 이상 전진하지 않는다.
    raf.tick(10);
    expect(steps.length).toBe(afterTerminated);

    // 되돌린다.
    const canvas = mount.querySelector('canvas')!;
    const ev = new Event('pointerdown', { bubbles: true });
    Object.assign(ev, { pointerId: 1, clientX: 20, clientY: 20, button: 0, buttons: 1 });
    canvas.dispatchEvent(ev);

    raf.tick(10);
    // 여기가 이 테스트의 전부다 — 시계를 풀지 않으면 step 이 영영 안 불린다.
    expect(steps.length).toBeGreaterThan(afterTerminated);

    handle.destroy();
  });
});

describe('destroy 뒷정리', () => {
  it('RAF 루프를 멈추고 컨테이너에서 자기 DOM 을 걷어낸다', () => {
    const mount = document.createElement('div');
    document.body.appendChild(mount);

    const handle = runBundle(makeBundle(), mount);
    raf.tick(3);
    expect(raf.pending()).toBe(1);

    handle.destroy();

    expect(raf.pending()).toBe(0);
    expect(mount.querySelector('.aperi21-runbundle')).toBeNull();

    // 두 번 불러도 안전해야 한다.
    expect(() => handle.destroy()).not.toThrow();
  });
});

describe('검사 시각은 선언의 앞당김 위에 놓인다', () => {
  it('inspectAt 은 startAt 을 지우지 않는다 — 시간표는 startAt + inspectAt 시각을 본다', () => {
    // 자유 구현본의 `?t=` 는 도착한 뒤 흐른 시간이다. 러너가 시계를 inspectAt 으로
    // 덮어쓰면 sims 스크린샷이 startAt 만큼 이른 장면이 된다 — 예외도 안 난다.
    const seen: number[] = [];
    const bundle: Bundle<TestState> = {
      ...makeBundle(),
      schema: {
        ...SCHEMA,
        timeModel: 'periodic',
        startAt: 1.5,
        timeline: { phases: [{ id: 'all', duration: 100 }] },
      },
      scene: ({ timeline }): SceneGraph => {
        if (timeline) seen.push(timeline.t);
        return [];
      },
    };
    const mount = document.createElement('div');
    document.body.append(mount);
    const handle = runBundle(bundle, mount, { inspectAt: 2 });
    raf.tick(3);
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.at(-1)).toBeCloseTo(3.5, 6);
    handle.destroy();
  });
});
