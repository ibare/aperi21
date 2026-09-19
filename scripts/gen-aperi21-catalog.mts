/**
 * aperi21 카탈로그 생성기.
 *
 * 실행: pnpm catalog:gen
 *
 * 원본은 셋이고 이 스크립트는 그것을 합칠 뿐 새 사실을 선언하지 않는다.
 *   - 어떤 시각화가 있는가      → registerAperi21Bundles() 의 loader id
 *   - 제목 · 설명               → 각 sim 의 schema(label/operation)
 *   - 분야와 그 이름 · 순서     → docs/topics/topics.yaml (주제의 `sim` 이 가리키는 것)
 *   - 어떤 언어가 있는가        → messages/<locale>.json 파일 목록
 *
 * 산출물:
 *   packages/bootstrap/src/catalog/<locale>.generated.ts   언어 하나의 카탈로그
 *   packages/bootstrap/src/catalog/loaders.generated.ts    언어 → 동적 import 표
 *   packages/bootstrap/src/messages-loaders.generated.ts   언어 → 문구 번들 동적 import 표
 *   packages/authoring/src/sim-domains.generated.ts        sim id → 분야 id
 *
 * 경로를 정적 리터럴로 나열하는 까닭은 번들러가 보간된 경로를 해석하지 못하기
 * 때문이다. 산출물은 순수 데이터라 sim chunk 를 끌어오지 않는다 (lazy 보존).
 */

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { registerAperi21Bundles } from '@aperi21/bootstrap';
import { listBundleLoaderIds } from '@aperi21/host';
import type {
  Aperi21Catalog,
  Aperi21CatalogEntry,
} from '../packages/bootstrap/src/catalog-types.js';
import {
  buildSchemaByLeaf,
  generatedHeader,
  listLocales,
  readTopics,
  repoRoot,
  resolveText,
} from './sim-schemas.mts';

const CATALOG_DIR = join(repoRoot, 'packages/bootstrap/src/catalog');
const MESSAGE_LOADERS_FILE = join(repoRoot, 'packages/bootstrap/src/messages-loaders.generated.ts');
const SIM_DOMAINS_FILE = join(repoRoot, 'packages/authoring/src/sim-domains.generated.ts');
const HEADER = (source: string) =>
  generatedHeader('pnpm catalog:gen', 'gen-aperi21-catalog.mts', source);

async function main(): Promise<void> {
  const locales = listLocales();
  const topics = readTopics();
  const schemaByLeaf = await buildSchemaByLeaf();

  registerAperi21Bundles();
  const loaderIds = new Set(listBundleLoaderIds());

  // 주제 원본과 loader 가 정확히 1:1 로 맞물려야 한다. 어긋나면 분야가 비는 항목이나
  // 목록에 없는 시각화가 생기므로 이름을 지목해 멈춘다.
  const bySim = new Map<string, { domain: string }>();
  for (const t of topics.topics) {
    if (!t.sim) continue;
    if (bySim.has(t.sim)) throw new Error(`sim ${t.sim} 을 두 주제가 가리킨다`);
    if (!loaderIds.has(t.sim)) throw new Error(`주제 ${t.id} 의 sim ${t.sim} 이 loader 에 없다`);
    bySim.set(t.sim, { domain: t.domain });
  }
  for (const id of loaderIds) {
    if (!bySim.has(id)) throw new Error(`loader ${id} 를 가리키는 주제가 topics.yaml 에 없다`);
  }

  // 순서 — topics.yaml 의 분야 순서, 그 안에서 주제 순서.
  const ordered: { id: string; domain: string }[] = [];
  for (const d of topics.domains) {
    for (const t of topics.topics) {
      if (t.domain === d.id && t.sim) ordered.push({ id: t.sim, domain: d.id });
    }
  }

  rmSync(CATALOG_DIR, { recursive: true, force: true });
  mkdirSync(CATALOG_DIR, { recursive: true });

  for (const locale of locales) {
    const entries: Aperi21CatalogEntry[] = ordered.map(({ id, domain }) => {
      const leaf = id.replace(/^aperi21:/, '');
      const schema = schemaByLeaf.get(leaf);
      if (!schema) throw new Error(`loader id ${id} 에 대응하는 sims/<category>/${leaf}/src/schema.ts 가 없다`);
      const title = resolveText(schema.label, locale);
      if (!title) throw new Error(`${id} 의 schema.label 에 en 이 없다 (C1)`);
      const description = resolveText(schema.operation, locale);
      return { id, title, ...(description ? { description } : {}), domain };
    });
    const used = new Set(entries.map((e) => e.domain));
    const catalog: Aperi21Catalog = {
      locale,
      domains: topics.domains
        .filter((d) => used.has(d.id))
        .map((d) => {
          const name = d.name[locale] ?? d.name['en'];
          if (!name) throw new Error(`topics.yaml 분야 ${d.id} 에 en 이름이 없다`);
          return { id: d.id, name };
        }),
      entries,
    };
    const body = [
      `  locale: ${JSON.stringify(catalog.locale)},`,
      '  domains: [',
      ...catalog.domains.map((d) => `    ${JSON.stringify(d)},`),
      '  ],',
      '  entries: [',
      ...catalog.entries.map((e) => `    ${JSON.stringify(e)},`),
      '  ],',
    ].join('\n');
    writeFileSync(
      join(CATALOG_DIR, `${locale}.generated.ts`),
      [
        HEADER('각 sim 의 schema(label/operation) + docs/topics/topics.yaml(분야).'),
        '',
        "import type { Aperi21Catalog } from '../catalog-types.js';",
        '',
        `export const CATALOG: Aperi21Catalog = {\n${body}\n};`,
        '',
      ].join('\n'),
      'utf8',
    );
  }

  writeFileSync(
    join(CATALOG_DIR, 'loaders.generated.ts'),
    [
      HEADER('messages/<locale>.json 파일 목록.'),
      '',
      "import type { Aperi21Catalog } from '../catalog-types.js';",
      '',
      '/** 언어 → 그 언어 카탈로그 모듈. 경로가 정적 리터럴이어야 번들러가 chunk 로 가른다. */',
      'export const CATALOG_LOADERS: Record<string, () => Promise<{ CATALOG: Aperi21Catalog }>> = {',
      ...locales.map((l) => `  ${JSON.stringify(l)}: () => import('./${l}.generated.js'),`),
      '};',
      '',
    ].join('\n'),
    'utf8',
  );

  // en 은 호출부 리터럴이 원본이라 불러올 번들이 없다.
  const messageLocales = readdirSync(join(repoRoot, 'messages'))
    .filter((f) => f.endsWith('.json') && f !== 'en.json')
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
  writeFileSync(
    MESSAGE_LOADERS_FILE,
    [
      HEADER('messages/<locale>.json 파일 목록.'),
      '',
      'type MessageModule = { default: Record<string, string> };',
      '',
      '/** 언어 → 프레임워크 문구 번들. en 은 호출부 리터럴이 원본이라 없다. */',
      'export const MESSAGE_LOADERS: Record<string, () => Promise<MessageModule>> = {',
      ...messageLocales.map(
        (l) => `  ${JSON.stringify(l)}: () => import('../../../messages/${l}.json') as Promise<MessageModule>,`,
      ),
      '};',
      '',
    ].join('\n'),
    'utf8',
  );

  writeFileSync(
    SIM_DOMAINS_FILE,
    [
      HEADER('docs/topics/topics.yaml (주제의 sim → 분야).'),
      '',
      '/**',
      ' * sim id → 분야 id. 개념 메타의 `domain` 은 canonicalSim 으로 여기서 찾는다.',
      ' * 호스트 카탈로그(`getAperi21Catalog`)의 `domain` 과 같은 값이다.',
      ' */',
      'export const SIM_DOMAINS: Record<string, string> = {',
      ...ordered.map(({ id, domain }) => `  ${JSON.stringify(id)}: ${JSON.stringify(domain)},`),
      '};',
      '',
    ].join('\n'),
    'utf8',
  );

  process.stdout.write(
    `[catalog] ${ordered.length}개 × ${locales.length}개 언어(${locales.join(', ')}) → packages/bootstrap/src/catalog/\n`,
  );
}

main().catch((err: unknown) => {
  process.stderr.write(`[catalog] 생성 실패: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
