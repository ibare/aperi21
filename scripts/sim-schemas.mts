/**
 * 생성기 공용 — sim 선언 읽기 · 언어 목록 · 주제 원본.
 *
 * `gen-aperi21-catalog.mts` 와 `gen-screen-labels.mts` 가 같은 원본을 같은 방식으로
 * 읽게 한 곳에 둔다. 새 사실을 선언하지 않는다.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import type { BundleSchema, LocalizedText } from '@aperi21/schema';

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

/** 생성물 머리말 — 직접 편집 금지 표시. */
export function generatedHeader(command: string, script: string, source: string): string {
  return [
    '/**',
    ' * 자동 생성 파일 — 직접 편집하지 말 것.',
    ' *',
    ` * 생성: ${command}  (scripts/${script})`,
    ` * 출처: ${source}`,
    ' */',
  ].join('\n');
}

/**
 * 카탈로그·화면 라벨을 내는 언어. 프레임워크 문구 번들(`messages/<locale>.json`)이
 * 있는 언어와 같다. en 이 원본 언어라 맨 앞에 두고 나머지는 이름순이다.
 */
export function listLocales(): string[] {
  const locales = readdirSync(join(repoRoot, 'messages'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
  if (!locales.includes('en')) throw new Error('messages/en.json 이 없다 (pnpm messages:gen)');
  return ['en', ...locales.filter((l) => l !== 'en')];
}

export type TopicSource = {
  domains: { id: string; name: Record<string, string> }[];
  topics: { id: string; domain: string; sim?: string }[];
};

export function readTopics(): TopicSource {
  return parse(readFileSync(join(repoRoot, 'docs/topics/topics.yaml'), 'utf8')) as TopicSource;
}

/**
 * sims/<category>/<name>/src/schema.ts 를 직접 import 해 leaf 디렉터리명 → schema.
 * schema.ts 는 순수 데이터라 브라우저 전역을 건드리는 런타임을 끌어오지 않는다.
 */
export async function buildSchemaByLeaf(): Promise<Map<string, BundleSchema>> {
  const simsRoot = join(repoRoot, 'sims');
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
      // 이름이 아니라 **모양**으로 찾는다. S-sim 의 `<name>Schema` 규약과 초기 sim 의
      // `schema` 가 섞여 있어, 생성기가 한 이름에 묶이면 그 어긋남이 여기서 터진다.
      const mod = (await import(pathToFileURL(schemaFile).href)) as Record<string, unknown>;
      const found = Object.values(mod).find(
        (v): v is BundleSchema =>
          typeof v === 'object' &&
          v !== null &&
          typeof (v as BundleSchema).id === 'string' &&
          Array.isArray((v as BundleSchema).stages) &&
          Array.isArray((v as BundleSchema).views),
      );
      if (found) byLeaf.set(name, found);
    }
  }
  return byLeaf;
}

/**
 * 선언의 LocalizedText 를 한 언어로 푼다. 그 언어가 없으면 en, en 도 없으면 undefined.
 * `@i18n:` 키 참조는 선언에서 풀 수 없으므로 undefined.
 */
export function resolveText(text: LocalizedText | undefined, locale: string): string | undefined {
  if (text === undefined) return undefined;
  if (typeof text === 'string') return text.startsWith('@i18n:') ? undefined : text;
  return text[locale] ?? text['en'];
}
