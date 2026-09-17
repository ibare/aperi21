/**
 * 페이로드 측정 — 조각 하나를 여는 데 실제로 몇 바이트를 받는가.
 *
 * `tasks/engine-requirements/REQUIREMENTS.md` §2 / §R10 의 자.
 * 두 가지를 잰다.
 *
 *  1. **크기** — 고정 비용(모든 조각이 받는 것)과 조각 비용을 나눠 센다.
 *  2. **음성 검사** — 조각이 쓰지 않는 능력이 실렸으면 실패.
 *     숫자 예산은 새는 것을 늦게 알려 주지만 이건 즉시 잡는다.
 *
 * 음성 검사는 **비minify 산출물**의 식별자로 판정한다. 소비자가 minify 하면
 * 이름은 사라지지만 코드는 남으므로, 이름으로 잡는 편이 더 이르다.
 *
 * 사용:
 *   pnpm budget              측정하고 baseline 과 비교
 *   pnpm budget --update     지금 값을 baseline 으로 기록
 *   pnpm budget --build      먼저 host / bundle 을 빌드하고 측정
 */

import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_CAPABILITIES, declaredCapabilities, listSims } from './lib/capabilities.mts';
import { bundleMinimalApp } from './lib/minimal-app.mts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const HOST_DIST = join(ROOT, 'packages/host/dist/index.js');
const BUNDLE_DIST = join(ROOT, 'packages/host-tiptap-bundle/dist');
const BASELINE = join(ROOT, 'tasks/engine-requirements/baseline.json');

// ------------------------------------------------------------------------
// 산출물
// ------------------------------------------------------------------------

const gz = (buf: Buffer): number => gzipSync(buf, { level: 9 }).length;

interface Chunk {
  path: string;
  name: string;
  raw: number;
  gz: number;
  text: string;
}

function readChunk(path: string): Chunk {
  const buf = readFileSync(path);
  return {
    path,
    name: basename(path).replace(/-[A-Za-z0-9_-]{8}\.js$/, '.js'),
    raw: buf.length,
    gz: gz(buf),
    text: buf.toString('utf8'),
  };
}

function collectChunks(dir: string, out: Chunk[] = []): Chunk[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) collectChunks(p, out);
    else if (name.endsWith('.js')) out.push(readChunk(p));
  }
  return out;
}

/**
 * 부트스트랩이 **무조건 실행하는** 동적 import 목록.
 *
 * `import()` 로 쓰여 있어 정적 그래프에는 lazy 로 보이지만, `installAperi21Plugins`
 * 는 부팅 시 반드시 불리므로 의미상 eager 다. 목록을 하드코딩하지 않고 소스에서
 * 뽑아, 고쳐지면 이 자가 저절로 따라오게 한다 (§2.2-2 가 사라지면 빈 배열이 된다).
 */
function eagerImports(): string[] {
  const src = readFileSync(join(ROOT, 'packages/bootstrap/src/index.ts'), 'utf8');
  const fn = src.slice(src.indexOf('export async function installAperi21Plugins'));
  const body = fn.slice(0, fn.indexOf('\n}'));
  return [...body.matchAll(/import\('([^']+)'\)/g)].map((m) => m[1]!);
}

/**
 * 패키지명 → chunk 파일명 조각.
 *
 * manualChunks 규칙(`host-tiptap-bundle/rollup.config.mjs`)이 sim 은 이름만,
 * plugin 은 `plugin-` 접두를 유지해 이름 짓는다. 그대로 따른다.
 *   `@aperi21/sim-projectile`  → `projectile`
 *   `@aperi21/plugin-optics`   → `plugin-optics`
 */
function chunkKeyOf(pkg: string): string {
  return pkg.replace(/^@aperi21\/sim-/, '').replace(/^@aperi21\//, '');
}

// ------------------------------------------------------------------------

function fmt(bytes: number): string {
  return (bytes / 1024).toFixed(1).padStart(6) + ' KB';
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.includes('--build')) {
    for (const pkg of ['@aperi21/host', '@aperi21/host-tiptap-bundle']) {
      execFileSync('pnpm', ['--filter', pkg, 'build'], { cwd: ROOT, stdio: 'inherit' });
    }
  }
  if (!existsSync(HOST_DIST) || !existsSync(BUNDLE_DIST)) {
    console.error('산출물이 없다. `pnpm budget --build` 로 먼저 빌드할 것.');
    process.exit(2);
  }

  const host = readChunk(HOST_DIST);
  const chunks = collectChunks(BUNDLE_DIST);
  const entry = chunks.find((c) => c.name === 'host-tiptap-bundle.js')!;
  const runtime = chunks.filter((c) => c.path.includes('/runtime/'));

  const eagerKeys = eagerImports().map(chunkKeyOf);
  const eager = chunks.filter((c) => eagerKeys.some((k) => c.name.startsWith(k + '.')));

  // 고정 비용 — 어떤 조각을 열든 받는 것
  const fixed = [host, entry, ...runtime, ...eager];
  const fixedGz = fixed.reduce((n, c) => n + c.gz, 0);

  // 조각 — sims/ 아래 chunk 중 eager 가 아닌 것
  const pieces = chunks
    .filter((c) => c.path.includes('/sims/') && !eager.includes(c))
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log('\n고정 비용 — 모든 조각이 받는 것');
  console.log('  @aperi21/host        ' + fmt(host.gz) + '   (통짜 재수출 11개 모듈)');
  console.log('  entry + runtime      ' + fmt(entry.gz + runtime.reduce((n, c) => n + c.gz, 0)));
  if (eager.length > 0) {
    console.log(
      '  eager (bootstrap)    ' + fmt(eager.reduce((n, c) => n + c.gz, 0)) +
        '   ← ' + eager.map((c) => c.name.replace('.js', '')).join(', '),
    );
  }
  console.log('  ' + '-'.repeat(58));
  console.log('  합계                 ' + fmt(fixedGz));

  console.log('\n조각별');
  console.log('  ' + '이름'.padEnd(34) + '조각'.padStart(9) + '합계'.padStart(11));
  for (const p of pieces) {
    const name = p.name.replace('.js', '');
    console.log('  ' + name.padEnd(32) + fmt(p.gz) + fmt(p.gz + fixedGz));
  }
  // eager 로 딸려온 조각은 자기 비용이 이미 고정 비용에 들어 있다
  for (const c of eager.filter((c) => c.path.includes('/sims/'))) {
    console.log('  ' + (c.name.replace('.js', '') + ' (eager)').padEnd(32) + '     — ' + fmt(fixedGz));
  }

  // ----------------------------------------------------------------------
  // 실측 — 조각 하나만 쓰는 앱을 번들해 본다
  //
  // 위의 chunk 크기는 상한이다. 소비자가 실제로 받는 양은 그쪽에서 번들해 봐야
  // 안다 (§2.4). 음성 검사도 여기서 한다 — minify 하지 않은 산출물이라 식별자가
  // 남아 있다.
  // ----------------------------------------------------------------------
  console.log('\n조각 하나를 쓰는 앱이 실제로 받는 것 (minify + gzip)');
  console.log('  ' + '이름'.padEnd(35) + '실측'.padStart(8) + '   안 쓰는 능력');

  const sims = listSims(ROOT);
  const report: Record<string, string[]> = {};
  const measured: Record<string, number> = {};
  let violations = 0;

  for (const sim of sims) {
    const used = declaredCapabilities(sim.src);
    const app = bundleMinimalApp(ROOT, {
      simPkg: sim.pkg,
      bundleExport: sim.bundleExport,
      capabilitiesPath: `../../src/capabilities/${sim.category}/${sim.name}.generated`,
      outDir: join(ROOT, 'packages/bootstrap/.budget-tmp', sim.name),
    });

    const unusedPresent = Object.entries(ALL_CAPABILITIES)
      .filter(([type]) => !used.has(type))
      .filter(([, marker]) => app.readable.includes(marker))
      .map(([type]) => type);

    report[sim.id] = unusedPresent;
    measured[sim.id] = app.gz;
    if (unusedPresent.length > 0) violations++;

    console.log(
      `  ${unusedPresent.length > 0 ? '✗' : '✓'} ${sim.id.padEnd(33)}${fmt(app.gz)}   ` +
        (unusedPresent.length > 0
          ? `${unusedPresent.length}종 — ${unusedPresent.join(', ')}`
          : '없음'),
    );
  }
  rmSync(join(ROOT, 'packages/bootstrap/.budget-tmp'), { recursive: true, force: true });

  const now = {
    date: new Date().toISOString().slice(0, 10),
    fixedGz,
    hostGz: host.gz,
    eagerGz: eager.reduce((n, c) => n + c.gz, 0),
    pieces: Object.fromEntries(pieces.map((p) => [p.name.replace('.js', ''), p.gz])),
    /** 조각 하나를 쓰는 앱의 실측 크기. 이것이 소비자가 받는 양이다. */
    measured,
    violations: report,
  };

  if (args.includes('--update')) {
    writeFileSync(BASELINE, JSON.stringify(now, null, 2) + '\n');
    console.log(`\n기준선 기록 → ${relative(ROOT, BASELINE)}`);
  } else if (existsSync(BASELINE)) {
    const base = JSON.parse(readFileSync(BASELINE, 'utf8'));
    const d = now.fixedGz - base.fixedGz;
    const sign = d > 0 ? '+' : '';
    console.log(
      `\n기준선(${base.date}) 대비 고정 비용 ${sign}${(d / 1024).toFixed(1)} KB` +
        `  (${(base.fixedGz / 1024).toFixed(1)} → ${(now.fixedGz / 1024).toFixed(1)})`,
    );
    const baseV = Object.values(base.violations as Record<string, string[]>).flat().length;
    const nowV = Object.values(report).flat().length;
    console.log(`위반 능력 수 ${baseV} → ${nowV}`);
  }

  const vals = Object.values(measured);
  console.log(
    `\n${violations}/${sims.length} 조각이 쓰지 않는 능력을 받고 있다.` +
      `  실측 ${(Math.min(...vals) / 1024).toFixed(1)} ~ ${(Math.max(...vals) / 1024).toFixed(1)} KB`,
  );
}

/**
 * 한 프레임 선언 수 — 조각이 첫 프레임에 만드는 프리미티브 인스턴스 수.
 *
 * 러너는 인스턴스마다 렌더러를 부르고 캔버스 상태를 저장 · 복원하므로 프레임 비용이 이 수에 비례한다.
 * 표현력 검증 턴 1 에서 간섭이 8208 개를 만들었다 (장부 G51). **숫자로만 보고한다** — 기준값은
 * 데이터가 쌓인 뒤 사용자가 정한다. 실패시키지 않는다.
 */
async function reportDeclarations(): Promise<void> {
  const host = await import('../packages/host/src/index.ts');
  const rows: { id: string; count: number }[] = [];
  for (const sim of listSims(ROOT)) {
    try {
      const mod = (await import(join(sim.src, 'index.ts'))) as Record<string, unknown>;
      const bundle = mod[sim.bundleExport] as {
        schema: { parameters: { id: string; default: number }[]; stages: unknown[]; startAt?: number; timeline?: unknown };
        initialState: (a: unknown) => unknown;
        scene: (a: unknown) => readonly unknown[];
      };
      const values = Object.fromEntries(bundle.schema.parameters.map((q) => [q.id, q.default]));
      const stage = bundle.schema.stages[0];
      const state = host.prerollState(bundle as never, bundle.initialState({ values, stage, environments: [] }), stage as never, []);
      const t = bundle.schema.startAt ?? 0;
      const timeline = bundle.schema.timeline ? host.evaluateTimeline(bundle.schema.timeline as never, t) : undefined;
      const scene = bundle.scene({ state, stage, environments: [], timeline });
      rows.push({ id: sim.id, count: scene.length });
    } catch (e) {
      rows.push({ id: `${sim.id} (측정 실패: ${(e as Error).message.slice(0, 40)})`, count: -1 });
    }
  }
  rows.sort((a, b) => b.count - a.count);
  console.log('\n한 프레임 선언 수 (첫 프레임 프리미티브 인스턴스, 많은 순 상위 12 — 기준값 없음)');
  for (const r of rows.slice(0, 12)) console.log('  ' + r.id.padEnd(45) + String(r.count).padStart(7));
}

main();
reportDeclarations().catch((e) => console.error('[budget] 선언 수 측정 실패', e));
