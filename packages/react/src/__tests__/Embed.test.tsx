import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { createHost, standardCapabilities } from '@aperi21/host';
import type { Bundle, BundleSchema } from '@aperi21/schema';
import { Embed } from '../Embed';
import { HostProvider } from '../providers/HostProvider';
import { useHost } from '../hooks/useHost';

/**
 * 이 컴포넌트는 `runBundle` 을 감싸기만 한다. 조작기·프레이밍·시간의 동작은
 * `packages/host/src/__tests__/embed-runtime.test.ts` 가 잰다 — 두 곳에서 같은 것을
 * 재면 복제가 다시 자란다.
 *
 * 여기서 확인하는 것은 **잇는 일**뿐이다. 자리를 만들고, 넘기고, 거두는가.
 */
const EARTH = { id: 'earth', label: { ko: '지구', en: 'Earth' }, constants: { g: 9.8 } };
const TRAJECTORY = { id: 'trajectory', label: { ko: '궤적', en: 'Trajectory' }, default: true };

function bundleOf(schema: Partial<BundleSchema> = {}): Bundle {
  return {
    schema: {
      id: 'test-bundle',
      label: { ko: '테스트', en: 'Test' },
      category: 'mechanics',
      description: { ko: '테스트 설명', en: 'Test description' },
      timeModel: 'linear',
      parameters: [],
      stages: [EARTH],
      environments: [],
      views: [TRAJECTORY],
      ...schema,
    },
    initialState: () => ({}),
    step: ({ state }) => state,
    scene: () => [],
    controllers: [],
  };
}

function mount(bundle: Bundle, theme: 'light' | 'dark' = 'light') {
  const host = createHost({ theme, lang: 'ko', capabilities: standardCapabilities() });
  return render(
    <HostProvider host={host}>
      <Embed bundle={bundle} />
    </HostProvider>,
  );
}

describe('Embed', () => {
  afterEach(cleanup);

  it('HostProvider 내부에서 캔버스를 붙인다', () => {
    const { container } = mount(bundleOf());
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('언마운트하면 붙인 DOM 을 거둔다 — 뒷일을 남기지 않는다 (C5)', () => {
    const { container, unmount } = mount(bundleOf());
    expect(container.querySelector('canvas')).toBeTruthy();
    unmount();
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('선언하지 않은 조작기는 DOM 에 아무것도 남기지 않는다 — 크롬은 켜야 나온다 (S-piece)', () => {
    const { container } = mount(bundleOf());
    // 오버레이가 조작기로 옮겨 갔으므로 캔버스 말고는 아무 자식도 없다.
    const wrapper = container.querySelector('.aperi21-runbundle');
    expect(wrapper?.children).toHaveLength(1);
    expect(wrapper?.firstElementChild?.tagName).toBe('CANVAS');
  });

  it('테마 모드를 data-theme 으로 전달한다', () => {
    const { container } = mount(bundleOf(), 'dark');
    expect(container.querySelector('.aperi21-embed')?.getAttribute('data-theme')).toBe('dark');
  });

  it('HostProvider 없이 useHost 를 호출하면 에러', () => {
    function Probe() {
      useHost();
      return null;
    }
    expect(() => render(<Probe />)).toThrow(/HostProvider/);
  });
});
