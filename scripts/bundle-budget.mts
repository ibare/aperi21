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
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const HOST_DIST = join(ROOT, 'packages/host/dist/index.js');
const BUNDLE_DIST = join(ROOT, 'packages/host-tiptap-bundle/dist');
const BASELINE = join(ROOT, 'tasks/engine-requirements/baseline.json');

// ------------------------------------------------------------------------
// 능력 목록 — 키는 선언에 쓰는 type, 값은 산출물에서 찾을 식별자.
// 이 표가 늘어나는 것이 곧 엔진이 커지는 것이고, 음성 검사가 지키는 대상이다.
// ------------------------------------------------------------------------

const RENDERERS: Record<string, string> = {
  body: 'renderBody',
  trajectory: 'renderTrajectory',
  vector: 'renderVector',
  surface: 'renderSurface',
  marker: 'renderMarker',
  graph: 'renderGraph',
  event: 'renderEvent',
  gauge: 'renderGauge',
};

const CONTROLLERS: Record<string, string> = {
  'pinball-launcher': 'PinballLauncherController',
  'angle-dial': 'AngleDialController',
  slider: 'SliderController',
  'value-edit': 'ValueEditController',
  placement: 'PlacementController',
};

const ALL: Record<string, string> = { ...RENDERERS, ...CONTROLLERS };

// ------------------------------------------------------------------------
// 조각이 선언한 능력 — src 를 훑어 `type: '<x>'` 를 모은다.
//
// 조건부로 반환하는 조작기(상태에 따라 [] 를 주는 경우)도 소스에는 문자열이
// 남으므로 보수적으로 잡힌다. 놓치는 쪽보다 넘치는 쪽이 안전하다.
// S3-B 의 생성기가 이 추출을 그대로 쓴다.
// ------------------------------------------------------------------------

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === '__tests__' || name === 'node_modules') continue;
      walk(p, out);
    } else if (name.endsWith('.ts')) out.push(p);
  }
  return out;
}

function declaredCapabilities(simSrc: string): Set<string> {
  const used = new Set<string>();
  for (const file of walk(simSrc)) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/type:\s*'([a-zA-Z-]+)'/g)) {
      const t = m[1]!;
      if (t in ALL) used.add(t);
    }
  }
  return used;
}

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
  // 음성 검사
  // ----------------------------------------------------------------------
  console.log('\n음성 검사 — 쓰지 않는 능력이 실렸는가');
  const simDirs: { id: string; src: string; chunkKey: string }[] = [];
  for (const category of readdirSync(join(ROOT, 'sims'))) {
    const catDir = join(ROOT, 'sims', category);
    if (!statSync(catDir).isDirectory()) continue;
    for (const name of readdirSync(catDir)) {
      const src = join(catDir, name, 'src');
      if (existsSync(src)) simDirs.push({ id: `${category}/${name}`, src, chunkKey: name });
    }
  }

  let violations = 0;
  const report: Record<string, string[]> = {};
  for (const sim of simDirs) {
    const used = declaredCapabilities(sim.src);
    const own = chunks.find((c) => c.name.startsWith(sim.chunkKey + '.'));
    const loaded = own ? [...fixed, own] : fixed;
    const unusedPresent = Object.entries(ALL)
      .filter(([type]) => !used.has(type))
      .filter(([, marker]) => loaded.some((c) => c.text.includes(marker)))
      .map(([type]) => type);

    report[sim.id] = unusedPresent;
    if (unusedPresent.length > 0) {
      violations++;
      console.log(
        `  ✗ ${sim.id.padEnd(38)} ${unusedPresent.length}종 — ${unusedPresent.join(', ')}`,
      );
    } else {
      console.log(`  ✓ ${sim.id}`);
    }
  }

  const now = {
    date: new Date().toISOString().slice(0, 10),
    fixedGz,
    hostGz: host.gz,
    eagerGz: eager.reduce((n, c) => n + c.gz, 0),
    pieces: Object.fromEntries(pieces.map((p) => [p.name.replace('.js', ''), p.gz])),
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

  console.log(
    `\n${violations}/${simDirs.length} 조각이 쓰지 않는 능력을 받고 있다.` +
      (violations > 0 ? ' (S3-C 까지는 정상)' : ''),
  );
}

main();
