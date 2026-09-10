/**
 * 조각 하나만 쓰는 최소 앱을 번들해 **실제로 실리는 것**을 잰다.
 *
 * `host/dist/index.js` 를 통째로 재면 그것은 상한이지 소비자가 받는 양이 아니다.
 * 트리셰이킹이 실제로 일어나는지는 소비자 쪽에서 번들해 봐야만 알 수 있다
 * (REQUIREMENTS.md §2.4 「증명 — 예산보다 음성 검사가 먼저다」).
 *
 * 두 번 번들한다.
 *   - minify 하지 않은 것 → 식별자가 남아 **음성 검사**가 가능하다
 *   - minify 한 것 → gzip 해서 **크기**를 잰다
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const ESBUILD = 'node_modules/.pnpm/node_modules/.bin/esbuild';
/** 한 번 번들이 이보다 오래 걸리면 무언가 잘못된 것이다. */
const BUNDLE_TIMEOUT_MS = 60_000;

export interface MinimalAppResult {
  /** minify + gzip 크기. */
  gz: number;
  /** minify 하지 않은 산출물. 음성 검사용. */
  readable: string;
}

/**
 * 조각 하나를 마운트하는 앱을 번들한다.
 *
 * 레지스트리 조회(`loadBundle`)가 아니라 **직접 import** 하는 것이 핵심이다.
 * 동적 조회로 쓰면 번들러가 모든 조각을 후보로 남겨야 해서, 재려는 것(이 조각
 * 하나가 실제로 끌고 오는 양)이 측정되지 않는다.
 */
export function bundleMinimalApp(
  root: string,
  opts: { simPkg: string; bundleExport: string; capabilitiesPath: string; outDir: string },
): MinimalAppResult {
  mkdirSync(opts.outDir, { recursive: true });
  const entry = join(opts.outDir, 'entry.ts');
  writeFileSync(
    entry,
    [
      `import { createHost, registerBundle, runBundle } from '@aperi21/host';`,
      `import { ${opts.bundleExport} } from '${opts.simPkg}';`,
      `import { capabilities } from '${opts.capabilitiesPath}';`,
      ``,
      `const bundle = registerBundle('measured', ${opts.bundleExport} as never, capabilities);`,
      `runBundle(bundle, document.body, { host: createHost() });`,
      ``,
    ].join('\n'),
  );

  const run = (minify: boolean, out: string): string => {
    const args = [
      entry,
      '--bundle',
      '--format=esm',
      '--platform=browser',
      '--target=es2022',
      `--outfile=${out}`,
    ];
    if (minify) args.push('--minify');
    execFileSync(join(root, ESBUILD), args, {
      cwd: root,
      timeout: BUNDLE_TIMEOUT_MS,
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    return readFileSync(out, 'utf8');
  };

  const readable = run(false, join(opts.outDir, 'app.js'));
  const minified = run(true, join(opts.outDir, 'app.min.js'));
  const gz = gzipSync(Buffer.from(minified), { level: 9 }).length;

  rmSync(entry, { force: true });
  return { gz, readable };
}
