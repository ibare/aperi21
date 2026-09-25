/**
 * 화면 라벨 추출기.
 *
 * 실행: pnpm screen:gen
 *
 * 각 sim 의 선언(`schema.ts`)에서 화면에 뜨는 문자열을 언어별로 모아
 * `packages/authoring/src/screen-labels.generated.ts` 로 쓴다. 개념 메타의
 * `briefing.screen.labels` 가 이 표에서 온다 — writer 가 화면에 실제로 적힌 글자로
 * 화면을 가리키게 하려는 것이다. 손으로 옮겨 적으면 선언과 어긋난다.
 *
 * 모으는 것: 선언 전체를 재귀로 훑어 **LocalizedText 맵**(`{ en: …, ko: … }` —
 * 값이 전부 문자열이고 키가 전부 언어 코드이며 en 을 가진 객체)을 만나는 순서대로.
 * C1 이 화면 문안을 모두 선언의 LocalizedText 로 두게 하므로 이것으로 빠짐이 없다.
 * 같은 문자열은 한 번만 싣는다. `{name}` 자리표시자는 그대로 둔다 — 소비자가 알린다.
 *
 * 빼는 것: **조각의 제목(`schema.label`)과 한 줄 설명(`schema.description`)**. 둘 다
 * 카탈로그에만 쓰이고 임베드 화면에는 그려지지 않는다 (크롬 없음 — S-piece). writer 는 이 표를 「독자가 화면에서 찾을 수
 * 있는 글자」로 믿고 인용하므로, 제목이 섞이면 독자가 없는 글자를 찾게 된다. 이름이
 * 필요하면 개념 선언의 `label` 이 있다. 글자가 아니라 **객체로** 뺀다 — 제목과 글자가
 * 같은 문구가 화면에 따로 그려지는 조각이 있고(roche-limit 의 한계선 이름 등), 그
 * 문구는 제 객체로 따로 수집되어 남아야 한다.
 *
 * 언어: 그 sim 의 문안이 **모두** 그 언어를 가질 때만 싣는다. 일부만 있으면 화면에
 * 두 언어가 섞여 뜨므로 그 언어의 라벨이라 부를 수 없다 — 싣지 않아 조회가 en 으로
 * 떨어지고, 소비자는 반환된 `locale` 로 그 사실을 안다.
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSchemaByLeaf, generatedHeader, listLocales, repoRoot } from './sim-schemas.mts';

const OUT = join(repoRoot, 'packages/authoring/src/screen-labels.generated.ts');
const LOCALE_KEY = /^[a-z]{2}(-[A-Z]{2})?$/;

type TextMap = Record<string, string>;

function isTextMap(v: unknown): v is TextMap {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  const entries = Object.entries(v);
  return (
    entries.length > 0 &&
    typeof (v as TextMap)['en'] === 'string' &&
    entries.every(([k, s]) => LOCALE_KEY.test(k) && typeof s === 'string')
  );
}

function collect(node: unknown, out: TextMap[], seen: Set<unknown>): void {
  if (typeof node !== 'object' || node === null || seen.has(node)) return;
  seen.add(node);
  if (isTextMap(node)) {
    out.push(node);
    return;
  }
  for (const child of Array.isArray(node) ? node : Object.values(node)) collect(child, out, seen);
}

async function main(): Promise<void> {
  const locales = listLocales();
  const schemaByLeaf = await buildSchemaByLeaf();
  const table: Record<string, Record<string, string[]>> = {};

  for (const leaf of [...schemaByLeaf.keys()].sort()) {
    const schema = schemaByLeaf.get(leaf)!;
    const texts: TextMap[] = [];
    // 제목과 한 줄 설명 객체를 본 것으로 두어 건너뛴다. `text(key)` 는 messages 와 같은
    // 객체를 돌려주지만, 선언에 직접 적은 조각도 있어 둘 다 넣는다.
    const skip = [
      schema.label,
      schema.messages?.['label.title'],
      schema.description,
      schema.messages?.['label.description'],
    ].filter((t) => t !== undefined);
    collect(schema, texts, new Set<unknown>(skip));
    const byLocale: Record<string, string[]> = {};
    for (const locale of locales) {
      if (!texts.every((t) => typeof t[locale] === 'string')) continue;
      byLocale[locale] = [...new Set(texts.map((t) => t[locale]!.trim()).filter((s) => s !== ''))];
    }
    table[`aperi21:${leaf}`] = byLocale;
  }

  const rows = Object.entries(table).map(([id, v]) => `  ${JSON.stringify(id)}: ${JSON.stringify(v)},`);
  writeFileSync(
    OUT,
    [
      generatedHeader('pnpm screen:gen', 'gen-screen-labels.mts', '각 sim 의 schema.ts 에 선언된 LocalizedText.'),
      '',
      '/** sim id → locale → 화면에 뜨는 문자열 목록. */',
      'export const SCREEN_LABELS: Record<string, Record<string, string[]>> = {',
      ...rows,
      '};',
      '',
    ].join('\n'),
    'utf8',
  );
  const full = Object.values(table).filter((v) => locales.every((l) => v[l])).length;
  process.stdout.write(
    `[screen] ${rows.length}개 sim · 전 언어(${locales.join(', ')}) 갖춤 ${full} → packages/authoring/src/screen-labels.generated.ts\n`,
  );
}

main().catch((err: unknown) => {
  process.stderr.write(`[screen] 생성 실패: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
