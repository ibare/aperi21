/**
 * 발행 전 게이트 (S-host 「발행 전 게이트」 3단의 자동화).
 *
 * 손으로 돌리던 tarball 검증을 스크립트로 고정한다. 0.1.0 은 이 검사 없이 나갔고,
 * 발행본 .d.ts 가 미발행 private 패키지를 import 해 소비자 쪽 타입이 끊긴 채로
 * 배포됐다. 워크스페이스에서는 멀쩡하고 발행본에서만 죽는 종류라 사람 눈으로는
 * 잡히지 않는다.
 *
 * 검사 여섯:
 *   1. src 누출         — 발행본에 .ts 소스가 들어가지 않았는지
 *   2. workspace: 잔존  — pnpm 이 semver 로 변환했는지 (npm publish 를 쓰면 실패한다)
 *   3. publishConfig    — main/types/exports 가 dist 로 오버라이드됐는지
 *   4. d.ts 참조        — 발행본 타입이 **발행 대상 밖** 패키지를 import 하지 않는지
 *   5. 소스맵           — 발행본에 .map 이 없는지. 맵이 가리킬 src 가 tarball 에 없고,
 *                         번들은 맵만으로 발행본이 세 배로 불었다
 *   6. LICENSE          — 패키지 폴더에 LICENSE 가 있어 tarball 에 실렸는지. npm 은
 *                         루트의 LICENSE 를 가져오지 않는다
 *
 * 사용: pnpm release:check
 *       typecheck 와 test 는 CI 가 이미 돌리므로 여기서는 tarball 만 본다.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

/** 발행 대상. 여기 없는 @aperi21/* 를 발행본이 참조하면 위반이다. */
const PUBLISHED = ['@aperi21/host', '@aperi21/host-tiptap-bundle', '@aperi21/authoring'] as const;

const PACKAGE_DIRS: Record<string, string> = {
  '@aperi21/host': 'packages/host',
  '@aperi21/host-tiptap-bundle': 'packages/host-tiptap-bundle',
  '@aperi21/authoring': 'packages/authoring',
};

const root = process.cwd();
let failures = 0;

function fail(pkg: string, gate: string, detail: string): void {
  failures++;
  console.error(`  ✗ [${gate}] ${pkg} — ${detail}`);
}

function pass(pkg: string, gate: string, detail: string): void {
  console.log(`  ✓ [${gate}] ${pkg} — ${detail}`);
}

/** 디렉터리 전체 파일 경로를 재귀 수집. */
function walk(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, base));
    else out.push(relative(base, full));
  }
  return out;
}

const work = mkdtempSync(join(tmpdir(), 'aperi21-release-'));

try {
  for (const pkg of PUBLISHED) {
    const dir = join(root, PACKAGE_DIRS[pkg]!);
    console.log(`\n${pkg}`);

    // prepack 이 빌드를 수행한다. 발행과 같은 경로를 탄다.
    const out = execFileSync('pnpm', ['pack', '--pack-destination', work], {
      cwd: dir,
      encoding: 'utf8',
    });
    const tgz = out.trim().split('\n').pop()!.trim();

    const extractDir = join(work, pkg.replace(/[@/]/g, '_'));
    execFileSync('mkdir', ['-p', extractDir]);
    execFileSync('tar', ['xzf', tgz, '-C', extractDir, '--strip-components=1']);

    const files = walk(extractDir);
    const manifest = JSON.parse(readFileSync(join(extractDir, 'package.json'), 'utf8'));

    // ── 1. src 누출
    const leaked = files.filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'));
    if (leaked.length > 0) fail(pkg, 'src 누출', `${leaked.length}건 — ${leaked.slice(0, 3).join(', ')}`);
    else pass(pkg, 'src 누출', `0건 (${files.length} 파일)`);

    // ── 2. workspace: 잔존
    const manifestText = JSON.stringify(manifest);
    if (manifestText.includes('workspace:')) {
      fail(pkg, 'workspace:', 'package.json 에 프로토콜이 남아 있다 — pnpm publish 를 썼는지 확인');
    } else {
      const peers = Object.entries(manifest.peerDependencies ?? {})
        .map(([k, v]) => `${k}@${v}`)
        .join(' ');
      pass(pkg, 'workspace:', peers ? `semver 변환됨 (${peers})` : '해당 없음');
    }

    // ── 3. publishConfig 오버라이드
    const entry = manifest.types ?? '';
    if (!entry.startsWith('./dist/')) {
      fail(pkg, 'publishConfig', `types 가 dist 를 가리키지 않는다: ${entry}`);
    } else if (!files.includes(entry.replace('./', ''))) {
      fail(pkg, 'publishConfig', `types 가 가리키는 ${entry} 가 tarball 에 없다`);
    } else {
      pass(pkg, 'publishConfig', `types → ${entry} (존재)`);
    }

    // ── 4. d.ts 가 발행 대상 밖 패키지를 참조하는지
    const dtsFiles = files.filter((f) => f.endsWith('.d.ts'));
    const bad: string[] = [];
    for (const f of dtsFiles) {
      const text = readFileSync(join(extractDir, f), 'utf8');
      // 주석은 제외하고 실제 import/export 문만 본다.
      for (const line of text.split('\n')) {
        const t = line.trim();
        if (t.startsWith('*') || t.startsWith('//')) continue;
        const m = t.match(/from ['"](@aperi21\/[a-z0-9-]+)['"]/);
        if (m && !PUBLISHED.includes(m[1] as (typeof PUBLISHED)[number])) {
          bad.push(`${f}: ${m[1]}`);
        }
      }
    }
    if (bad.length > 0) {
      fail(pkg, 'd.ts 참조', `미발행 패키지 참조 ${bad.length}건 — ${bad.slice(0, 3).join(', ')}`);
    } else {
      pass(pkg, 'd.ts 참조', `${dtsFiles.length}개 파일, 미발행 참조 0건`);
    }

    // ── 5. 소스맵
    const maps = files.filter((f) => f.endsWith('.map'));
    if (maps.length > 0) fail(pkg, '소스맵', `${maps.length}건 — ${maps.slice(0, 3).join(', ')}`);
    else pass(pkg, '소스맵', '0건');

    // ── 6. LICENSE
    if (files.includes('LICENSE')) pass(pkg, 'LICENSE', '있음');
    else fail(pkg, 'LICENSE', 'tarball 에 없다 — 패키지 폴더에 LICENSE 를 둔다');
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

console.log();
if (failures > 0) {
  console.error(`발행 게이트 실패 — ${failures}건. 고치기 전에 publish 하지 않는다.`);
  process.exit(1);
}
console.log('발행 게이트 통과. 다음은 CLAUDE.md 「Release」 절차를 따른다.');
