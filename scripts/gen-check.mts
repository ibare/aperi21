/**
 * 생성기 실행기 · 생성물 신선도 검사.
 *
 * 실행: `pnpm gen:all` (돌리기만) · `pnpm gen:check` (돌린 뒤 낡았는지 판정)
 *
 * 둘이 한 파일인 이유는 **생성기 목록이 하나여야** 하기 때문이다. 목록이 둘로 갈리면
 * 한쪽에만 생성기를 더하는 날이 오고, 그날 신선도 검사는 새 생성물을 보지 않는다.
 *
 * ## 왜 필요한가
 *
 * 지금까지의 검사는 모두 **생성물끼리** 맞댄다. 카탈로그의 id 집합과 등록부의 키
 * 집합이 같은지, 등록 수가 `BUNDLE_COUNT` 와 같은지. 그래서 조각을 하나 더하고
 * 생성기를 돌리지 않으면 — 카탈로그도 등록부도 **함께** 옛 상태라 서로 일치하고,
 * typecheck·test·release:check 가 모두 통과한다. 새 조각은 조용히 없는 것이 된다.
 *
 * 이 검사만이 원본(`sims/<category>/<name>/` · `docs/topics/topics.yaml` ·
 * `messages/*.json` · `packages/authoring/src/concepts/`)과 생성물을 맞댄다.
 * 조각 선언 안에도 생성물이 하나 있다 — `schema.ts` 의 `description` 블록은
 * `topics.yaml` 의 `desc` 에서 오는 파생값이다 (`description:gen`).
 * 판정은 단순하다 — 생성기를 다 돌렸는데 무언가 바뀌면 커밋된 생성물이 낡은 것이다.
 *
 * ## 실행 순서가 고정인 이유
 *
 * 생성기 사이에 의존이 있다. `catalog:gen` 은 bootstrap 을 import 하므로 그전에
 * 등록부(`registry:gen`)와 능력 파일(`gen:capabilities`)이 있어야 한다. 순서는
 * 아래 GENERATORS 의 나열 순서가 전부다.
 *
 * ## 더러운 작업 트리에서도 쓸 수 있다
 *
 * 돌리기 전후의 `git status` 와 **변경된 파일의 내용**을 견주어 새로 생긴 변경만
 * 따진다. 손으로 고쳐 둔 파일이 있어도 그것 때문에 실패하지 않는다. 내용까지 보는
 * 이유는, 이미 고쳐 둔 `schema.ts` 를 생성기가 다시 고치면 status 줄은 그대로라
 * 줄만 견주어서는 놓치기 때문이다.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** 의존 순서대로. `gen:all` 과 `gen:check` 가 함께 쓰는 유일한 목록이다. */
const GENERATORS = [
  'description:gen', // topics.yaml desc → 조각 선언의 description (다른 생성기가 선언을 읽으므로 맨 앞)
  'registry:gen', // sims/ → 등록부 · bootstrap 의존
  'gen:capabilities', // sim 선언 → 능력 파일
  'catalog:gen', // bootstrap → 언어별 카탈로그 · loader · sim-domains
  'screen:gen', // sim 선언 → 화면 문구 표
  'concept:index', // concepts/*.ts → index
  'messages:gen', // 호출부 en 리터럴 → messages/en.json
  'catalog:topics', // topics.yaml + 조각 → 사이트 데이터
  'gap:ledger', // 간극 entries → LEDGER
  'surface:gen', // LEDGER + sim 선언 → 선언된 표면 (장부를 맞댈 사실)
] as const;

/** 변경된 파일의 상태 줄 + 내용 해시. 상태 줄만으로는 이미 고쳐 둔 파일의 재변경을 못 본다. */
function status(): Set<string> {
  const out = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' });
  return new Set(
    out
      .split('\n')
      .filter((l) => l.trim() !== '')
      .map((line) => {
        const path = join(ROOT, line.slice(3).split(' -> ').pop()!.replace(/^"|"$/g, ''));
        if (!existsSync(path) || statSync(path).isDirectory()) return line;
        return `${line} ${createHash('sha1').update(readFileSync(path)).digest('hex')}`;
      }),
  );
}

/** `--write` 면 돌리기만 한다 (`gen:all`). 없으면 낡았는지까지 판정한다 (`gen:check`). */
const writeOnly = process.argv.includes('--write');

const before = writeOnly ? new Set<string>() : status();

const BOOTSTRAP_PKG = join(ROOT, 'packages/bootstrap/package.json');

for (const script of GENERATORS) {
  process.stdout.write(`\n[gen:check] ${script}\n`);
  const pkgBefore = script === 'registry:gen' ? readFileSync(BOOTSTRAP_PKG, 'utf8') : '';
  execFileSync('pnpm', ['-s', script], { cwd: ROOT, stdio: 'inherit' });

  // 조각이 늘거나 줄면 bootstrap 의 의존이 바뀐다. 설치가 따라붙지 않으면 바로 다음
  // 단계인 catalog:gen 이 새 조각을 모듈로 해석하지 못해 죽는다. CI 는 install 이
  // 앞서므로 해당 없고, 손으로 돌릴 때만 걸린다.
  if (script === 'registry:gen' && readFileSync(BOOTSTRAP_PKG, 'utf8') !== pkgBefore) {
    process.stdout.write(
      '\n[gen:check] 조각 목록이 바뀌었다 — `pnpm install` 을 먼저 돌려야 다음 단계가 선다.\n',
    );
  }
}

if (writeOnly) {
  process.stdout.write(`\n[gen:all] 생성기 ${GENERATORS.length}종 실행을 마쳤다.\n`);
  process.exit(0);
}

const changed = [...status()].filter((line) => !before.has(line));

if (changed.length > 0) {
  process.stderr.write(
    `\n생성물이 낡았다 — 생성기를 돌리니 ${changed.length}개가 바뀐다.\n\n` +
      changed.map((l) => `  ${l.replace(/ [0-9a-f]{40}$/, '')}`).join('\n') +
      `\n\n원본을 고치고 생성기를 돌리지 않은 것이다. \`pnpm gen:all\` 뒤 함께 커밋한다.\n`,
  );
  process.exit(1);
}

process.stdout.write(`\n[gen:check] 생성물 ${GENERATORS.length}종 모두 최신이다.\n`);
