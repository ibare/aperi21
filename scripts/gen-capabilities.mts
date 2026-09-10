/**
 * 조각별 능력 생성기 — 선언과 정적 참조를 잇는다 (REQUIREMENTS.md §2.4 조건 3).
 *
 * 저작자는 선언만 쓴다. 여기서 그 선언을 훑어 `import` 목록을 만든다. 그래야
 * 번들러가 무엇이 쓰이는지 알고, 쓰지 않는 능력이 조각의 번들에 실리지 않는다.
 *
 * **생성물을 sim 디렉터리에 두지 않는다.** sim 이 `@aperi21/host` 를 import 하면
 * 의존 방향이 뒤집힌다 (원칙 1 — sim 은 렌더러를 참조하지 않는다). 배선은
 * bootstrap 의 일이므로 생성물도 거기 둔다. loader 가 sim 모듈과 함께 동적
 * import 하므로 번들러는 이것을 조각 chunk 에 넣는다.
 *
 * 사용: pnpm gen:capabilities
 */

import { mkdirSync, writeFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTROLLERS, RENDERERS, declaredCapabilities, listSims } from './lib/capabilities.mts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = join(ROOT, 'packages/bootstrap/src/capabilities');

function generate(): void {
  const sims = listSims(ROOT);
  mkdirSync(OUT_DIR, { recursive: true });

  const written = new Set<string>();
  for (const sim of sims) {
    const used = declaredCapabilities(sim.src);
    const renderers = Object.keys(RENDERERS)
      .filter((t) => used.has(t))
      .sort();
    const controllers = Object.keys(CONTROLLERS)
      .filter((t) => used.has(t))
      .sort();

    const imports = [
      ...renderers.map((t) => RENDERERS[t]!),
      ...controllers.map((t) => CONTROLLERS[t]!),
    ].sort();

    const lines: string[] = [
      '// 자동 생성 파일 — 직접 편집하지 말 것.',
      '//',
      `// 생성: pnpm gen:capabilities  (scripts/gen-capabilities.mts)`,
      `// 출처: ${sim.pkg} 의 선언에 나타난 primitive type · controller type`,
      '//',
      '// 여기 없는 능력은 이 조각의 번들에 실리지 않는다 (R10).',
      '',
      "import type { HostCapabilities } from '@aperi21/host';",
    ];
    if (imports.length > 0) {
      lines.push(`import { ${imports.join(', ')} } from '@aperi21/host';`);
    }
    lines.push('');
    lines.push('export const capabilities: HostCapabilities = {');
    if (renderers.length > 0) {
      lines.push('  renderers: {');
      for (const t of renderers) lines.push(`    ${quoteKey(t)}: ${RENDERERS[t]!},`);
      lines.push('  },');
    }
    if (controllers.length > 0) {
      // 인스턴스가 아니라 만드는 법이다. 모듈 최상위에서 `new` 하면 번들러가 지우지
      // 못하고(C6), 한 문서의 임베드들이 그 인스턴스를 나눠 쓴다(C5).
      lines.push('  controllers: {');
      for (const t of controllers) lines.push(`    ${quoteKey(t)}: () => new ${CONTROLLERS[t]!}(),`);
      lines.push('  },');
    }
    lines.push('};');

    // `<category>/<name>.generated.ts` — rollup manualChunks 가 이 경로로 조각
    // chunk 를 찾아 합친다 (host-tiptap-bundle/rollup.config.mjs).
    const rel = `${sim.category}/${sim.name}.generated.ts`;
    mkdirSync(join(OUT_DIR, sim.category), { recursive: true });
    writeFileSync(join(OUT_DIR, rel), lines.join('\n') + '\n');
    written.add(rel);
    console.log(
      `  ${sim.id.padEnd(40)} 렌더러 ${String(renderers.length).padStart(2)} · 조작기 ${controllers.length}`,
    );
  }

  // 사라진 sim 의 생성물 청소
  for (const category of readdirSync(OUT_DIR)) {
    const catDir = join(OUT_DIR, category);
    if (!statSync(catDir).isDirectory()) {
      if (category.endsWith('.generated.ts')) rmSync(catDir); // 옛 평면 구조 잔재
      continue;
    }
    for (const f of readdirSync(catDir)) {
      if (f.endsWith('.generated.ts') && !written.has(`${category}/${f}`)) {
        rmSync(join(catDir, f));
        console.log(`  삭제 ${category}/${f}`);
      }
    }
  }
  console.log(`\n${written.size}개 생성 → packages/bootstrap/src/capabilities/`);
}

function quoteKey(k: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k}'`;
}

generate();
