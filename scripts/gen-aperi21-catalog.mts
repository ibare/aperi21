/**
 * aperi21 카탈로그 매니페스트 생성기.
 *
 * 실행: pnpm catalog:gen
 *
 * 동작:
 *  1. registerAperi21Bundles() 로 loader 를 등록하고 listBundleLoaderIds() 로
 *     "추가 가능한 시각화" id 집합을 확정한다 (sim 모듈은 로드하지 않는다).
 *  2. sims/<category>/<name>/src/schema.ts 를 직접 import 해 leaf 디렉터리명 →
 *     schema 매핑을 만든다 (schema.ts 는 순수 데이터라 무거운 런타임을 안 끌어온다).
 *  3. 각 loader id(aperi21:<leaf>) 를 leaf 로 schema 와 join 하여 id/title/
 *     description/domain 만 추린 경량 배열을 packages/bootstrap/src/
 *     aperi21-catalog.generated.ts 로 emit 한다.
 *
 * 단일 출처: id 는 registerAperi21Bundles 의 loader, title/description/domain 은
 * 각 sim 의 schema(label/operation/category). 이 스크립트는 그 둘을 join 한
 * 파생물을 만들 뿐 새 사실을 선언하지 않는다.
 *
 * 빌드타임 전용 스크립트다. 산출물(generated.ts)은 순수 데이터라 런타임/번들에는
 * sim chunk 가 딸려오지 않는다 (lazy 보존).
 *
 * 참고: FACET 의 gen 은 loadFacet 으로 모듈을 실제 로드해 메타를 뽑지만, aperi21 은
 * sim 이 schema.ts 를 별도로 분리해 두어 그 파일만 직접 읽는다 — node 에서 브라우저
 * 전역(canvas/window)을 건드릴 위험 없이 더 견고하다.
 */

import { readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { BundleSchema } from '@aperi21/schema';
import { registerAperi21Bundles } from '@aperi21/bootstrap';
import { listBundleLoaderIds } from '@aperi21/host';
import type { Aperi21CatalogEntry } from '../packages/bootstrap/src/catalog-types.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const simsRoot = join(repoRoot, 'sims');
const outFile = join(repoRoot, 'packages/bootstrap/src/aperi21-catalog.generated.ts');

/** sims/<category>/<name>/src/schema.ts 를 직접 import 해 leaf 디렉터리명 → schema 매핑 구축. */
async function buildSchemaByLeaf(): Promise<Map<string, BundleSchema>> {
  const byLeaf = new Map<string, BundleSchema>();
  for (const category of readdirSync(simsRoot)) {
    let names: string[];
    try {
      names = readdirSync(join(simsRoot, category));
    } catch {
      continue; // 파일(디렉터리 아님) 스킵
    }
    for (const name of names) {
      const schemaFile = join(simsRoot, category, name, 'src', 'schema.ts');
      if (!existsSync(schemaFile)) continue;
      const mod = (await import(pathToFileURL(schemaFile).href)) as { schema?: BundleSchema };
      if (mod.schema) byLeaf.set(name, mod.schema);
    }
  }
  return byLeaf;
}

function renderFile(entries: Aperi21CatalogEntry[]): string {
  const rows = entries.map((e) => `  ${JSON.stringify(e)},`).join('\n');
  return [
    '/**',
    ' * 자동 생성 파일 — 직접 편집하지 말 것.',
    ' *',
    ' * 생성: pnpm catalog:gen  (scripts/gen-aperi21-catalog.mts)',
    ' * 출처: 각 sim 의 schema(label/operation/category) + registerAperi21Bundles 의 loader id.',
    ' *',
    ' * 이 배열은 순수 데이터라 sim 의 무거운 시각화 chunk 를 참조하지 않는다.',
    ' * 따라서 호스트는 이 카탈로그를 읽어도 sim 모듈을 로드하지 않는다 (lazy 보존).',
    ' */',
    '',
    "import type { Aperi21CatalogEntry } from './catalog-types.js';",
    '',
    'export const APERI21_CATALOG: readonly Aperi21CatalogEntry[] = [',
    rows,
    '];',
    '',
  ].join('\n');
}

async function main(): Promise<void> {
  const schemaByLeaf = await buildSchemaByLeaf();

  registerAperi21Bundles();
  const ids = listBundleLoaderIds().sort();

  const entries: Aperi21CatalogEntry[] = [];
  for (const id of ids) {
    const leaf = id.replace(/^aperi21:/, '');
    const schema = schemaByLeaf.get(leaf);
    if (!schema) {
      throw new Error(
        `loader id ${id} 에 대응하는 sims/<category>/${leaf}/src/schema.ts 를 찾지 못함`,
      );
    }
    entries.push({
      id,
      title: schema.label,
      ...(schema.operation ? { description: schema.operation } : {}),
      domain: schema.category,
    });
  }

  entries.sort((a, b) => a.domain.localeCompare(b.domain) || a.id.localeCompare(b.id));

  writeFileSync(outFile, renderFile(entries), 'utf8');
  process.stdout.write(
    `[catalog] ${entries.length}개 번들 → packages/bootstrap/src/aperi21-catalog.generated.ts\n`,
  );
}

main().catch((err: unknown) => {
  process.stderr.write(
    `[catalog] 생성 실패: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exitCode = 1;
});
