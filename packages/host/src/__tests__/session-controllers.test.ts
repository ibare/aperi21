// @vitest-environment jsdom
/**
 * 세션을 바꾸는 조작기 회귀 테스트.
 *
 * 뷰·스테이지·환경·파라미터는 조각의 `step` 이 다루는 상태가 아니라 **이 임베드가
 * 지금 무엇을 보고 있는가** 다. 예전에는 React 오버레이가 그 상태를 들고 있었고
 * 발행 경로에는 아예 없었다 — 같은 조각이 카탈로그와 외부 호스트에서 다르게 열렸다.
 *
 * 여기서 재는 것:
 *  1. 고를 것이 하나뿐이면 탭을 그리지 않는다 (S-piece).
 *  2. 탭을 누르면 화면이 바뀐다.
 *  3. 세션은 임베드마다 따로다 (C5 · 원칙 6).
 *  4. 조작기가 차지한 자리만큼 프레이밍이 비워진다.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type {
  Bundle,
  BundleSchema,
  ControllerSpec,
  SceneGraph,
  StageDef,
} from '@aperi21/schema';
import { createHost, runBundle, standardCapabilities } from '../index';

interface TestState {
  t: number;
}

const EARTH: StageDef = { id: 'earth', label: { en: 'Earth' }, constants: { g: 9.8 } };
const MOON: StageDef = { id: 'moon', label: { en: 'Moon' }, constants: { g: 1.6 } };

function schemaOf(over: Partial<BundleSchema> = {}): BundleSchema {
  return {
    id: 'test',
    label: { en: 'Test' },
    category: 'test',
    description: { en: 'Test' },
    timeModel: 'linear',
    parameters: [],
    stages: [EARTH],
    environments: [],
    views: [{ id: 'main', label: { en: 'Main' }, default: true }],
    ...over,
  };
}

/** scene 이 지금 뷰·스테이지를 좌표에 그대로 드러낸다 — 기록된 호출로 관찰한다. */
function bundleOf(
  schema: BundleSchema,
  controllers: readonly ControllerSpec[],
): Bundle<TestState> {
  return {
    schema,
    initialState: () => ({ t: 0 }),
    step: ({ state, dt }) => ({ t: state.t + dt }),
    scene: ({ view, stage }): SceneGraph =>
      [
        {
          type: 'body',
          id: `${view.id}:${stage.id}`,
          pos: [0, 0],
          shape: 'circle',
          size: 1,
        },
      ] as unknown as SceneGraph,
    controllers,
  };
}

interface Recorder {
  calls: string[];
}

function installCanvasStub(): Recorder {
  const rec: Recorder = { calls: [] };
  const ctx = new Proxy(
    {},
    {
      get(_t, prop: string | symbol) {
        // 글자 폭이 0 이면 칩이 전부 같은 자리에 겹쳐 히트테스트가 뜻을 잃는다.
        if (prop === 'measureText') {
          return (text: string) => ({ width: text.length * 6 });
        }
        if (typeof prop !== 'string') return undefined;
        if (prop.startsWith('create')) {
          return () => ({ addColorStop: () => undefined });
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
  (
    HTMLCanvasElement.prototype as unknown as { getContext: () => unknown }
  ).getContext = () => ctx;
  return rec;
}

interface RafHarness {
  tick(frames?: number): void;
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
  };
}

const VIEWPORT = { w: 600, h: 360 };

/** jsdom 은 레이아웃을 하지 않는다. 자리를 주지 않으면 뷰포트가 1×1 이 된다. */
function mountWith(bundle: Bundle<TestState>) {
  const host = createHost({ capabilities: standardCapabilities() });
  const mount = document.createElement('div');
  document.body.append(mount);
  const handle = runBundle(bundle, mount, { host });
  const canvas = mount.querySelector('canvas')!;
  canvas.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      width: VIEWPORT.w,
      height: VIEWPORT.h,
      top: 0,
      left: 0,
      right: VIEWPORT.w,
      bottom: VIEWPORT.h,
      toJSON() {},
    }) as DOMRect;
  return { handle, canvas };
}

function fire(canvas: HTMLCanvasElement, type: string, x: number, y: number): void {
  const ev = new Event(type, { bubbles: true });
  Object.assign(ev, { pointerId: 1, clientX: x, clientY: y, button: 0, buttons: 1 });
  canvas.dispatchEvent(ev);
}

/** 이 프레임에 글자를 몇 번 그렸나 — 칩이 떴는지를 여기서 센다. */
function textCalls(rec: Recorder): number {
  return rec.calls.filter((c) => c.startsWith('fillText(')).length;
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

describe('고를 것이 하나뿐인 탭', () => {
  it('선언해도 그리지 않는다 — 탭 하나는 조작기가 아니라 크롬이다 (S-piece)', () => {
    const one = bundleOf(schemaOf(), [{ id: 'views', type: 'view-tabs' }]);
    const a = mountWith(one);
    raf.tick(1);
    rec.calls.length = 0;
    raf.tick(1);
    const drawnWithOneView = textCalls(rec);
    a.handle.destroy();

    const two = bundleOf(
      schemaOf({
        views: [
          { id: 'main', label: { en: 'Main' }, default: true },
          { id: 'energy', label: { en: 'Energy' } },
        ],
      }),
      [{ id: 'views', type: 'view-tabs' }],
    );
    const b = mountWith(two);
    raf.tick(1);
    rec.calls.length = 0;
    raf.tick(1);
    const drawnWithTwoViews = textCalls(rec);
    b.handle.destroy();

    // 뷰가 하나면 칩 글자가 한 자도 나가지 않는다.
    expect(drawnWithOneView).toBe(0);
    expect(drawnWithTwoViews).toBe(2);
  });
});

describe('뷰 탭', () => {
  it('둘 이상이면 눌러서 화면을 바꾼다', () => {
    const schema = schemaOf({
      views: [
        { id: 'main', label: { en: 'Main' }, default: true },
        { id: 'energy', label: { en: 'Energy' } },
      ],
    });
    const seen: string[] = [];
    const bundle: Bundle<TestState> = {
      ...bundleOf(schema, [{ id: 'views', type: 'view-tabs' }]),
      scene: ({ view }): SceneGraph => {
        seen.push(view.id);
        return [] as unknown as SceneGraph;
      },
    };
    const { handle, canvas } = mountWith(bundle);
    raf.tick(2);
    expect(seen.at(-1)).toBe('main');

    // 칩 줄은 왼쪽 위(margin 12, pad 4)에 놓인다. 두 번째 칩을 누른다 —
    // 첫 칩 'Main'(4자 × 6 + 좌우 20 = 44) 다음.
    fire(canvas, 'pointerdown', 12 + 4 + 44 + 4 + 10, 12 + 15);
    raf.tick(2);

    expect(seen.at(-1)).toBe('energy');
    handle.destroy();
  });
});

describe('스테이지 탭', () => {
  it('바꾸면 상태가 그 스테이지의 초기값으로 돌아간다', () => {
    const schema = schemaOf({ stages: [EARTH, MOON] });
    const seen: string[] = [];
    const bundle: Bundle<TestState> = {
      ...bundleOf(schema, [{ id: 'stages', type: 'stage-tabs' }]),
      scene: ({ stage, state }): SceneGraph => {
        seen.push(`${stage.id}@${state.t.toFixed(2)}`);
        return [] as unknown as SceneGraph;
      },
    };
    const { handle, canvas } = mountWith(bundle);
    raf.tick(10);
    expect(seen.at(-1)!.startsWith('earth@')).toBe(true);
    // 시간이 흘렀다.
    expect(Number(seen.at(-1)!.split('@')[1])).toBeGreaterThan(0);

    // 위 가운데 줄. 이름표 'stage'(5자 × 6 + 6) 다음 두 번째 칩.
    const rowW = 4 * 2 + 36 + (5 * 6 + 20) + 4 + (4 * 6 + 20);
    const rowX = (VIEWPORT.w - rowW) / 2;
    fire(canvas, 'pointerdown', rowX + 4 + 36 + 50 + 4 + 10, 12 + 15);
    raf.tick(1);

    const before = Number(seen.at(-2)!.split('@')[1]);
    const after = seen.at(-1)!;
    expect(after.startsWith('moon@')).toBe(true);
    // 다시 만든 상태 위로 그 프레임의 한 걸음만 얹힌다 — 쌓아 온 시간이 사라진다.
    expect(Number(after.split('@')[1])).toBeLessThan(before);

    handle.destroy();
  });
});

describe('세션 독립', () => {
  it('두 임베드가 각자의 뷰를 갖는다 — 한쪽을 바꿔도 다른 쪽은 그대로다', () => {
    const schema = schemaOf({
      views: [
        { id: 'main', label: { en: 'Main' }, default: true },
        { id: 'energy', label: { en: 'Energy' } },
      ],
    });
    const seenA: string[] = [];
    const seenB: string[] = [];
    const make = (sink: string[]): Bundle<TestState> => ({
      ...bundleOf(schema, [{ id: 'views', type: 'view-tabs' }]),
      scene: ({ view }): SceneGraph => {
        sink.push(view.id);
        return [] as unknown as SceneGraph;
      },
    });

    const a = mountWith(make(seenA));
    const b = mountWith(make(seenB));
    raf.tick(2);

    fire(a.canvas, 'pointerdown', 12 + 4 + 44 + 4 + 10, 12 + 15);
    raf.tick(2);

    expect(seenA.at(-1)).toBe('energy');
    expect(seenB.at(-1)).toBe('main');

    a.handle.destroy();
    b.handle.destroy();
  });
});

describe('프레이밍 여백', () => {
  /**
   * 조작기가 차지한 자리만큼 그림을 비우되, **구석에 놓인 상자가 변 전체를 먹지
   * 않아야 한다.**
   *
   * 이 테스트가 없어서 놓쳤다 — 왼쪽 아래의 파라미터 상자가 「가장 가까운 변」
   * 규칙에 걸려 아래 변으로 갔고, 세로를 상한까지 먹어 `ray-tracing` ·
   * `dc-circuit` 이 눈에 띄게 작게 그려졌다. 임베드는 가로로 넓고 세로로 좁아
   * **세로가 비싸다** (S-piece).
   */
  function scaleOf(controllers: readonly ControllerSpec[]): number {
    const schema = schemaOf({
      parameters: [
        { id: 'a', label: { en: 'A' }, range: [0, 10], default: 5 },
        { id: 'b', label: { en: 'B' }, range: [0, 10], default: 5 },
        { id: 'c', label: { en: 'C' }, range: [0, 10], default: 5 },
      ],
    });
    let seen = 0;
    const bundle: Bundle<TestState> = {
      ...bundleOf(schema, controllers),
      boundsHint: () => ({ minX: -10, maxX: 10, minY: -5, maxY: 5 }),
      scene: (): SceneGraph => [] as unknown as SceneGraph,
    };
    // 렌더 컨텍스트의 배율은 조작기에게도 간다. 조작기 하나를 끼워 읽어 낸다.
    const host = createHost({
      capabilities: {
        ...standardCapabilities(),
        controllers: {
          ...standardCapabilities().controllers,
          'view-tabs': () => ({
            type: 'view-tabs' as const,
            render: (rc) => {
              seen = rc.scale;
            },
            hitTest: () => false,
            onPointerDown: () => null,
            onPointerMove: () => null,
            onPointerUp: () => null,
            isDragging: () => false,
          }),
        },
      },
    });
    const mount = document.createElement('div');
    document.body.append(mount);
    const handle = runBundle(bundle, mount, { host });
    const canvas = mount.querySelector('canvas')!;
    canvas.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 0,
        width: VIEWPORT.w,
        height: VIEWPORT.h,
        top: 0,
        left: 0,
        right: VIEWPORT.w,
        bottom: VIEWPORT.h,
        toJSON() {},
      }) as DOMRect;
    raf.tick(3);
    handle.destroy();
    return seen;
  }

  it('구석의 파라미터 상자가 그림을 절반 아래로 줄이지 않는다', () => {
    const bare = scaleOf([{ id: 'v', type: 'view-tabs' }]);
    const withPanel = scaleOf([
      { id: 'v', type: 'view-tabs' },
      { id: 'p', type: 'param-panel' },
    ]);

    expect(bare).toBeGreaterThan(0);
    expect(withPanel).toBeGreaterThan(0);
    // 상자는 왼쪽 아래 구석 200×126 이다. 그만큼 비우는 것은 맞지만, 세로를
    // 상한까지 먹으면 배율이 절반 밑으로 떨어진다 — 그것이 이 회귀였다.
    expect(withPanel).toBeGreaterThan(bare * 0.5);
  });
});
