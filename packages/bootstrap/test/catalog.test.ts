/**
 * aperi21 카탈로그 ↔ loader 정합성.
 *
 * getAperi21Catalog() 는 빌드타임 codegen(pnpm catalog:gen) 산출물이다.
 * 번들을 추가/삭제하고 카탈로그를 재생성하지 않으면 loader 집합과 어긋나는데,
 * 이 테스트가 그 신선도(freshness)를 가드한다. 실패하면 `pnpm catalog:gen` 을 실행하라.
 */

import { describe, it, expect } from 'vitest';
import type { LocalizedText } from '@aperi21/schema';
import { listBundleLoaderIds } from '@aperi21/host';
import { registerAperi21Bundles, getAperi21Catalog } from '../src/index.js';

registerAperi21Bundles();

const catalog = getAperi21Catalog();
const catalogIds = catalog.map((e) => e.id).sort();
const loaderIds = listBundleLoaderIds().sort();

/** LocalizedText 에 사람이 읽을 비어있지 않은 값이 있는지. */
function hasText(t: LocalizedText): boolean {
  if (typeof t === 'string') return t.trim() !== '';
  if (t && typeof t === 'object') {
    return Object.values(t).some((v) => typeof v === 'string' && v.trim() !== '');
  }
  return false;
}

describe('aperi21 카탈로그', () => {
  it('카탈로그 id 집합이 등록된 loader id 집합과 정확히 일치한다 (불일치 시 pnpm catalog:gen 실행)', () => {
    expect(catalogIds).toEqual(loaderIds);
  });

  it('id 중복이 없다', () => {
    expect(new Set(catalogIds).size).toBe(catalogIds.length);
  });

  it('모든 id 가 aperi21: 네임스페이스를 쓴다 (DSL {aperi21:<id>} 와 일치)', () => {
    for (const id of catalogIds) expect(id.startsWith('aperi21:')).toBe(true);
  });

  it('모든 엔트리가 사람이 읽을 title 과 유효한 domain 을 가진다', () => {
    for (const e of catalog) {
      expect(hasText(e.title)).toBe(true);
      expect(e.domain).not.toBe('');
    }
  });
});
