/**
 * 조각 등록부 생성기.
 *
 * 실행: pnpm registry:gen
 *
 * `sims/<category>/<name>/` 을 훑어 `packages/bootstrap/src/bundles.generated.ts` 와
 * `packages/bootstrap/package.json` 의 `@aperi21/sim-*` 의존을 만든다.
 *
 * ## 왜 생성물인가
 *
 * 한 조각의 정체가 다섯 꼴로 반복된다 — 디렉터리 이름 · 패키지 이름 · 등록 키 ·
 * 능력 파일 경로 · 번들 export 이름. 손으로 441개를 유지하면 그중 하나만 어긋나도
 * **검사가 잡지 못하는 오배선**이 된다. 키가 다른 조각을 부르면 목록에는 제 이름이
 * 뜨고 화면에는 남의 조각이 나온다 — 모든 검사가 키에서 기대값을 끌어오기 때문이다.
 * 원본을 디렉터리 하나로 모으면 그 어긋남이 생길 자리가 없어진다.
 *
 * ## 왜 JSON 을 런타임에 읽지 않는가
 *
 * `import(변수)` 는 번들러가 해석하지 못한다. 경로가 정적 리터럴이어야 rollup 이
 * 조각별 chunk 로 가르고, 그래야 독자가 연 조각만 내려받는다 (S-host lazy 보존 · C6).
 * 그래서 산출물은 표가 아니라 **코드**다 — 손으로 쓰던 것과 같은 모양을 기계가 쓴다.
 *
 * 번들 export 이름은 각 조각의 `src/index.ts` 에서 **읽는다**. 이름 규약에서 추측하면
 * 규약을 벗어난 조각에서 조용히 undefined 가 등록된다.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listSims } from './lib/capabilities.mts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'packages/bootstrap/src/bundles.generated.ts');
const PKG = join(ROOT, 'packages/bootstrap/package.json');

const sims = listSims(ROOT).sort((a, b) => a.id.localeCompare(b.id));

const missing = sims.filter((s) => !s.bundleExport);
if (missing.length > 0) {
  throw new Error(
    `번들 export 를 찾지 못한 조각: ${missing.map((s) => s.id).join(', ')}\n` +
      `각 조각의 src/index.ts 에 'export const <이름>Bundle' 이 있어야 한다.`,
  );
}

const lines = [
  '/**',
  ' * 자동 생성 파일 — 직접 편집하지 말 것.',
  ' *',
  ' * 생성: pnpm registry:gen  (scripts/gen-bundle-registry.mts)',
  ' * 출처: sims/<category>/<name>/ 의 package.json 과 src/index.ts.',
  ' *',
  ' * 각 loader 는 조각과 **그 조각이 쓰는 능력**을 함께 가져온다. 능력 파일은',
  ' * `pnpm gen:capabilities` 가 선언에서 뽑아 만든다. 조각이 아니라 여기 있는 이유는',
  ' * 조각이 `@aperi21/host` 를 알면 의존 방향이 뒤집히기 때문이다 (원칙 1).',
  ' *',
  ' * 둘 다 dynamic import 라 번들러가 조각 chunk 로 가른다 — 조각을 열지 않은 독자는',
  ' * 그 조각의 능력도 받지 않는다 (C6). 경로는 반드시 정적 리터럴이어야 한다.',
  ' */',
  '',
  "import { registerBundle, registerBundleLoader } from '@aperi21/host';",
  '',
  '/** 등록된 조각 수. 검사가 기대값으로 쓴다. */',
  `export const BUNDLE_COUNT = ${sims.length};`,
  '',
  '/**',
  ' * 조각 loader 를 모두 등록한다. **멱등 가드는 여기 두지 않는다** — 호출자',
  ' * (`registerAperi21Bundles`)가 한 곳에서 관리한다 (S-host 「부팅 함수는 멱등」).',
  ' */',
  'export function registerGeneratedBundles(): void {',
];

for (const s of sims) {
  const key = `aperi21:${s.name}`;
  lines.push(
    `  registerBundleLoader(${JSON.stringify(key)}, async () => {`,
    '    const [m, caps] = await Promise.all([',
    `      import(${JSON.stringify(s.pkg)}),`,
    `      import(${JSON.stringify(`./capabilities/${s.category}/${s.name}.generated.js`)}),`,
    '    ]);',
    `    return registerBundle(${JSON.stringify(key)}, m.${s.bundleExport}, caps.capabilities);`,
    '  });',
    '',
  );
}
lines.push('}', '');

writeFileSync(OUT, lines.join('\n'), 'utf8');

// 의존 목록도 같은 원본에서 만든다 — 조각을 더하고 의존을 빠뜨리면 모듈 해석이 실패한다.
const pkg = JSON.parse(readFileSync(PKG, 'utf8')) as {
  dependencies: Record<string, string>;
};
const kept = Object.fromEntries(
  Object.entries(pkg.dependencies).filter(([name]) => !name.startsWith('@aperi21/sim-')),
);
const deps = Object.fromEntries(
  [...Object.entries(kept), ...sims.map((s) => [s.pkg, 'workspace:*'] as const)].sort(([a], [b]) =>
    a.localeCompare(b),
  ),
);
pkg.dependencies = deps;
writeFileSync(PKG, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

process.stdout.write(
  `[registry] ${sims.length}개 → packages/bootstrap/src/bundles.generated.ts · 의존 ${Object.keys(deps).length}개\n`,
);
