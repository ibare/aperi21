/**
 * aperi21 카탈로그 ↔ loader 정합성 · 프레임워크 문구 번들.
 *
 * getAperi21Catalog(locale) 는 빌드타임 codegen(pnpm catalog:gen) 산출물이다.
 * 번들을 추가/삭제하고 카탈로그를 재생성하지 않으면 loader 집합과 어긋나는데,
 * 이 테스트가 그 신선도(freshness)를 가드한다. 실패하면 `pnpm catalog:gen` 을 실행하라.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { listBundleLoaderIds } from '@aperi21/host';
import { registerAperi21Bundles, getAperi21Catalog } from '../src/index.js';
import { CATALOG_LOADERS } from '../src/catalog/loaders.generated.js';

registerAperi21Bundles();

const loaderIds = listBundleLoaderIds().sort();
const locales = Object.keys(CATALOG_LOADERS);
const messagesDir = join(dirname(fileURLToPath(import.meta.url)), '../../../messages');

describe('aperi21 카탈로그', () => {
  it('언어는 en 을 포함하고 messages/<locale>.json 목록과 같다 (불일치 시 pnpm catalog:gen)', () => {
    const files = readdirSync(messagesDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''))
      .sort();
    expect(locales).toContain('en');
    expect([...locales].sort()).toEqual(files);
  });

  for (const locale of locales) {
    describe(locale, () => {
      it('id 집합이 등록된 loader id 집합과 정확히 일치하고 중복이 없다', async () => {
        const ids = (await getAperi21Catalog(locale)).entries.map((e) => e.id).sort();
        expect(ids).toEqual(loaderIds);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it('반환 locale 이 요청 언어이고, 모든 항목이 제목과 이름표가 있는 분야를 가진다', async () => {
        const catalog = await getAperi21Catalog(locale);
        expect(catalog.locale).toBe(locale);
        const domainIds = new Set(catalog.domains.map((d) => d.id));
        for (const d of catalog.domains) expect(d.name.trim()).not.toBe('');
        for (const e of catalog.entries) {
          expect(e.id.startsWith('aperi21:')).toBe(true);
          expect(e.title.trim()).not.toBe('');
          expect(domainIds.has(e.domain)).toBe(true);
        }
        // 항목이 없는 분야는 이름표에 싣지 않는다.
        expect(new Set(catalog.entries.map((e) => e.domain))).toEqual(domainIds);
      });
    });
  }

  it('미지원 언어는 영어 카탈로그로 대체하고 그 사실을 locale 로 알린다', async () => {
    expect((await getAperi21Catalog('xx')).locale).toBe('en');
  });
});

describe('프레임워크 문구 번들', () => {
  const read = (f: string) =>
    JSON.parse(readFileSync(join(messagesDir, f), 'utf8')) as Record<string, string>;
  const en = read('en.json');
  const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

  for (const file of readdirSync(messagesDir).filter((f) => f.endsWith('.json') && f !== 'en.json')) {
    it(`${file} 는 en 에 없는 키가 없고, 자리표시자가 en 과 같다`, () => {
      const bundle = read(file);
      for (const [key, text] of Object.entries(bundle)) {
        expect(en, `고아 키 ${key}`).toHaveProperty([key]);
        expect(placeholders(text), key).toBe(placeholders(en[key]!));
      }
    });
  }
});
