/**
 * DSL `{aperi21:<id>}` — 토큰 파싱과 마크다운 치환.
 *
 * DSL 은 호스트가 보는 유일한 표면이다 (원칙 2). 여기서 잘못 읽으면 글 속 임베드가
 * 통째로 사라지거나, 코드 예시 안의 토큰까지 시각화로 바뀐다.
 */
import { describe, expect, it } from 'vitest';
import { parseBundleRaw, renderBundleMarkdown } from '../index';

describe('parseBundleRaw', () => {
  it('등록 키 전체를 돌려준다', () => {
    expect(parseBundleRaw('{aperi21:free-fall}')).toBe('aperi21:free-fall');
    expect(parseBundleRaw('  {aperi21:free-fall}  ')).toBe('aperi21:free-fall');
  });

  it('형식이 어긋나면 null', () => {
    for (const raw of [
      'aperi21:free-fall',
      '{facet:array}',
      '{aperi21:}',
      '{aperi21:1st}',
      '{aperi21:free fall}',
      '{aperi21:free-fall} 뒤에 글',
    ]) {
      expect(parseBundleRaw(raw), raw).toBeNull();
    }
  });
});

describe('renderBundleMarkdown', () => {
  it('본문의 토큰을 자리표시 span 으로 바꾼다', () => {
    const html = renderBundleMarkdown('떨어지는 공을 보자 {aperi21:free-fall} 그리고 끝.');
    expect(html).toContain('<span data-aperi21="true" data-aperi21-id="aperi21:free-fall"></span>');
    expect(html).not.toContain('{aperi21:');
  });

  it('한 문단의 여러 토큰을 각각 바꾼다', () => {
    const html = renderBundleMarkdown('{aperi21:thin-lens} 와 {aperi21:focal-length}');
    expect(html.match(/data-aperi21-id=/g)).toHaveLength(2);
  });

  it('인라인 코드와 펜스 안의 토큰은 글자 그대로 둔다', () => {
    const html = renderBundleMarkdown(
      ['`{aperi21:free-fall}` 처럼 쓴다.', '', '```', '{aperi21:thin-lens}', '```'].join('\n'),
    );
    expect(html).not.toContain('data-aperi21-id');
    expect(html).toContain('{aperi21:free-fall}');
    expect(html).toContain('{aperi21:thin-lens}');
  });

  it('형식이 어긋난 토큰은 바꾸지 않는다', () => {
    expect(renderBundleMarkdown('{aperi21:}')).not.toContain('data-aperi21-id');
  });
});
