/**
 * DSL `{aperi21:<id>}` — 토큰 파싱과, 호스트가 넘기는 HTML 자리표시 읽기.
 *
 * DSL 은 호스트가 보는 유일한 표면이다 (원칙 2). 호스트는 제 마크다운 파이프라인에서
 * 토큰을 `<span data-aperi21="true" data-aperi21-id="…">` 로 바꿔 넘긴다 — 그 모양이
 * 어댑터와 호스트 사이의 계약이다. 여기서 잘못 읽으면 글 속 임베드가 통째로 사라진다.
 */
import { describe, expect, it } from 'vitest';
import { Node, generateJSON, type JSONContent } from '@tiptap/core';
import { BundleExtension, parseBundleRaw } from '../index';

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

// 문서 뼈대. starter-kit 에 기대지 않고 필요한 셋만 둔다.
const Doc = Node.create({ name: 'doc', topNode: true, content: 'block+' });
const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'p' }],
  renderHTML: () => ['p', 0],
});
const Text = Node.create({ name: 'text', group: 'inline' });

function bundleNodes(html: string): JSONContent[] {
  const json: JSONContent = generateJSON(html, [Doc, Paragraph, Text, BundleExtension]);
  return (json.content ?? [])
    .flatMap((p: JSONContent) => p.content ?? [])
    .filter((n: JSONContent) => n.type === 'aperi21');
}

describe('BundleExtension.parseHTML — 호스트가 넘기는 자리표시', () => {
  it('span[data-aperi21] 를 노드로 읽고 id 를 가져간다', () => {
    const nodes = bundleNodes(
      '<p>떨어지는 공 <span data-aperi21="true" data-aperi21-id="aperi21:free-fall"></span> 끝.</p>',
    );
    expect(nodes).toEqual([{ type: 'aperi21', attrs: { id: 'aperi21:free-fall' } }]);
  });

  it('한 문단의 여러 자리표시를 각각 읽는다', () => {
    const nodes = bundleNodes(
      '<p><span data-aperi21="true" data-aperi21-id="aperi21:thin-lens"></span> 와 ' +
        '<span data-aperi21="true" data-aperi21-id="aperi21:focal-length"></span></p>',
    );
    expect(nodes.map((n) => n.attrs?.['id'])).toEqual(['aperi21:thin-lens', 'aperi21:focal-length']);
  });

  it('id 가 없거나 표지가 없는 span 은 노드가 되지 않는다', () => {
    expect(bundleNodes('<p><span data-aperi21="true"></span></p>')).toEqual([]);
    expect(bundleNodes('<p><span data-aperi21-id="aperi21:free-fall"></span></p>')).toEqual([]);
  });

  it('토큰 글자 그대로는 노드가 아니다 — 치환은 호스트의 일이다', () => {
    expect(bundleNodes('<p>{aperi21:free-fall}</p>')).toEqual([]);
  });
});
