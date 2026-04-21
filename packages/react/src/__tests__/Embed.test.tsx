import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { createHost } from '@aperi21/host';
import type { Bundle } from '@aperi21/schema';
import { Embed } from '../Embed';
import { HostProvider } from '../providers/HostProvider';
import { useHost } from '../hooks/useHost';

const mockBundle: Bundle = {
  schema: {
    id: 'test-bundle',
    label: { ko: '테스트', en: 'Test' },
    category: 'mechanics',
    operation: { ko: '테스트 조작', en: 'Test operation' },
    timeModel: 'linear',
    parameters: [],
    stages: [{ id: 'earth', label: { ko: '지구', en: 'Earth' }, constants: { g: 9.8 } }],
    environments: [],
    views: [{ id: 'trajectory', label: { ko: '궤적', en: 'Trajectory' }, default: true }],
  },
  initialState: () => ({}),
  step: ({ state }) => state,
  scene: () => [],
  controllers: () => [],
};

describe('Embed', () => {
  it('HostProvider 내부에서 canvas 를 렌더하고 스테이지·뷰 탭을 노출', () => {
    const host = createHost({ theme: 'light', lang: 'ko' });
    const { container, getByText } = render(
      <HostProvider host={host}>
        <Embed bundle={mockBundle} />
      </HostProvider>,
    );
    expect(container.querySelector('canvas')).toBeTruthy();
    expect(getByText('지구')).toBeTruthy();
    expect(getByText('궤적')).toBeTruthy();
  });

  it('테마 모드가 data-theme 속성으로 전달', () => {
    const host = createHost({ theme: 'dark', lang: 'ko' });
    const { container } = render(
      <HostProvider host={host}>
        <Embed bundle={mockBundle} />
      </HostProvider>,
    );
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
