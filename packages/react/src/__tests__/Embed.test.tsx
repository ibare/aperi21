import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    stages: [{ id: 'earth', label: { ko: '지구' }, constants: { g: 9.8 } }],
    environments: [],
    views: [{ id: 'trajectory', label: { ko: '궤적' }, default: true }],
  },
  initialState: () => ({}),
  step: ({ state }) => state,
  scene: () => [],
  controllers: () => [],
};

describe('Embed', () => {
  it('HostProvider 내부에서 bundle 의 id/stage/view 를 렌더', () => {
    const host = createHost({ theme: 'light', lang: 'ko' });
    render(
      <HostProvider host={host}>
        <Embed bundle={mockBundle} />
      </HostProvider>,
    );

    expect(screen.getByText(/test-bundle/)).toBeTruthy();
    expect(screen.getByText(/earth/)).toBeTruthy();
    expect(screen.getByText(/trajectory/)).toBeTruthy();
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
    // render 대신 직접 훅 호출 — hook test 는 컴포넌트 안에서 throw 하면 Error boundary 없이 터진다.
    function Probe() {
      useHost();
      return null;
    }
    expect(() => render(<Probe />)).toThrow(/HostProvider/);
  });
});
