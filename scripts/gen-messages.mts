/**
 * 프레임워크 문구 en 원본 추출기.
 *
 * 실행: pnpm messages:gen
 *
 * `packages/<pkg>/src` 에서 `t('ui.<component>.<name>', '<en 원본>')` 처럼 키 리터럴 뒤에
 * en 원본 리터럴이 오는 자리를 스캔해
 * `messages/en.json` 을 만든다. 이 파일이 번역의 입력이고, 다른 언어 번들
 * (`messages/<locale>.json`) 이 그 산출물이다.
 *
 * sim 고유 문안은 여기 없다 — `BundleSchema.messages` 에 저작자가 선언한다 (C1).
 * 여기서 뽑는 것은 프레임워크(host 조작기 · 어댑터)가 기본으로 제공하는 문구뿐이다.
 *
 * en 원본은 **호출부 리터럴**이어야 잡힌다 (C1 MUST). 키가 `ui.` 로 시작하는데 둘째
 * 인자가 리터럴이 아닌 호출은 잡지 못하므로 경고로 알린다.
 *
 * 누락 검출: 이미 있는 다른 언어 번들과 대조해 en 에 없는 키(고아)와 번역이 빠진
 * 키를 보고한다. 번역이 빠진 것은 실패가 아니다 — 그 자리는 en 원본으로 뜬다.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const messagesDir = join(repoRoot, 'messages');
const SKIP = new Set(['node_modules', 'dist', '__tests__', 'test']);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry) && !entry.endsWith('.generated.ts')) out.push(full);
  }
  return out;
}

// 키 리터럴 바로 뒤에 en 원본 리터럴이 오는 자리. `t(key, en)` 과
// `controllerText(i18n, label, key, en)` 이 모두 이 모양이다.
const CALL = /'(ui\.[A-Za-z0-9.]+)'\s*,\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;
const ANY_UI_CALL = /'(ui\.[A-Za-z0-9.]+)'/g;

const found = new Map<string, string>();
const warnings: string[] = [];
const packagesDir = join(repoRoot, 'packages');
for (const pkg of readdirSync(packagesDir)) {
  const src = join(packagesDir, pkg, 'src');
  try {
    statSync(src);
  } catch {
    continue;
  }
  for (const file of walk(src)) {
    const text = readFileSync(file, 'utf8');
    const literal = new Set<number>();
    for (const m of text.matchAll(CALL)) {
      literal.add(m.index!);
      const key = m[1]!;
      const en = (m[2] ?? m[3] ?? '').replace(/\\(.)/g, '$1');
      const prev = found.get(key);
      if (prev !== undefined && prev !== en) {
        warnings.push(`키 ${key} 의 en 원본이 호출부마다 다르다: "${prev}" / "${en}"`);
      }
      found.set(key, en);
    }
    for (const m of text.matchAll(ANY_UI_CALL)) {
      if (!literal.has(m.index!)) {
        warnings.push(`${relative(repoRoot, file)}: ${m[1]} 의 en 원본이 리터럴이 아니다`);
      }
    }
  }
}

const en = Object.fromEntries([...found.entries()].sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(join(messagesDir, 'en.json'), `${JSON.stringify(en, null, 2)}\n`, 'utf8');
process.stdout.write(`[messages] ${found.size}개 키 → messages/en.json\n`);

for (const file of readdirSync(messagesDir).filter((f) => f.endsWith('.json') && f !== 'en.json')) {
  const bundle = JSON.parse(readFileSync(join(messagesDir, file), 'utf8')) as Record<string, string>;
  const orphan = Object.keys(bundle).filter((k) => !(k in en));
  const missing = Object.keys(en).filter((k) => !(k in bundle));
  process.stdout.write(
    `  ${file}: 번역 ${Object.keys(bundle).length - orphan.length}/${found.size}` +
      (missing.length ? ` · 빠짐 ${missing.join(', ')}` : '') +
      (orphan.length ? ` · 고아 ${orphan.join(', ')}` : '') +
      '\n',
  );
}
for (const w of warnings) process.stderr.write(`  경고: ${w}\n`);
