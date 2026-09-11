import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { createHost } from '@aperi21/host';
import type { Bundle, BundleSchema } from '@aperi21/schema';
import { Embed } from '../Embed';
import { HostProvider } from '../providers/HostProvider';
import { useHost } from '../hooks/useHost';

const EARTH = { id: 'earth', label: { ko: '지구', en: 'Earth' }, constants: { g: 9.8 } };
const MOON = { id: 'moon', label: { ko: '달', en: 'Moon' }, constants: { g: 1.6 } };
const TRAJECTORY = { id: 'trajectory', label: { ko: '궤적', en: 'Trajectory' }, default: true };
const ENERGY = { id: 'energy', label: { ko: '에너지', en: 'Energy' } };

function bundleOf(schema: Partial<BundleSchema>): Bundle {
  return {
    schema: {
      id: 'test-bundle',
      label: { ko: '테스트', en: 'Test' },
      category: 'mechanics',
      operation: { ko: '테스트 조작', en: 'Test operation' },
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
  const host = createHost({ theme, lang: 'ko' });
  return render(
    <HostProvider host={host}>
      <Embed bundle={bundle} />
    </HostProvider>,
  );
}

describe('Embed', () => {
  // 앞 테스트가 붙인 DOM 이 남으면 "없다" 를 확인하는 테스트가 그것을 찾는다.
  afterEach(cleanup);

  it('HostProvider 내부에서 canvas 를 렌더한다', () => {
    const { container } = mount(bundleOf({}));
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('고를 것이 있으면 스테이지·뷰 탭을 노출한다', () => {
    const { getByText } = mount(bundleOf({ stages: [EARTH, MOON], views: [TRAJECTORY, ENERGY] }));
    expect(getByText('지구')).toBeTruthy();
    expect(getByText('달')).toBeTruthy();
    expect(getByText('궤적')).toBeTruthy();
    expect(getByText('에너지')).toBeTruthy();
  });

  it('고를 것이 없으면 탭도 배지도 없다 — 크롬은 켜야 나온다 (S-piece)', () => {
    const { queryByText } = mount(bundleOf({}));
    expect(queryByText('지구')).toBeNull();
    expect(queryByText('궤적')).toBeNull();
    expect(queryByText(/g=/)).toBeNull();
  });

  it('chrome.stageBadge 를 켜면 스테이지·중력 배지가 나온다', () => {
    const { getByText } = mount(bundleOf({ chrome: { stageBadge: true } }));
    expect(getByText(/지구 · g=9\.8/)).toBeTruthy();
  });

  it('테마 모드가 data-theme 속성으로 전달', () => {
    const { container } = mount(bundleOf({}), 'dark');
    const root = container.querySelector('.aperi21-embed');
    expect(root?.getAttribute('data-theme')).toBe('dark');
  });

  it('HostProvider 없이 useHost 를 호출하면 에러', () => {
    function Probe() {
      useHost();
      return null;
    }
    expect(() => render(<Probe />)).toThrow(/HostProvider/);
  });
});
