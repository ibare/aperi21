// @ts-check
/**
 * @aperi21/host-tiptap-bundle — rollup 설정.
 *
 * 정책 (FACET 의 host-tiptap-bundle 설정 이식):
 *  - 단일 ESM entry (host-tiptap-bundle.js) + dynamic import 자동 chunk 추론.
 *  - inlineDynamicImports: false — sim-* 의 lazy 보존 핵심.
 *  - external: @aperi21/host, @tiptap/core, @tiptap/pm — 단일 인스턴스 보장.
 *  - chunkFileNames 는 함수형 — sims/<category>/, plugins/, runtime/, vendor/ 디렉터리 분리.
 *  - manualChunks: sim 별/runtime 공용 분리.
 *  - sourcemap: true.
 *  - VISUALIZE=1 환경변수일 때만 stats.html 생성.
 *  - .d.ts 는 별도 빌드 패스 (rollup-plugin-dts, respectExternal) 로 단일 파일 생성.
 *    private 패키지 타입은 인라인하고 external 만 import 로 남긴다.
 */

import { nodeResolve } from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';

const VISUALIZE = process.env.VISUALIZE === '1';

// @aperi21/host 는 레지스트리를 담고 있어 external 이다. inline 하면 호스트가 두 개의
// 진입점을 설치했을 때 bundleRegistry 의 Map 이 갈라져, bootstrap 이 등록한 sim 을
// runBundle 이 못 찾는다 (원칙 3, S-host 단일 registry 인스턴스).
const external = [/^@aperi21\/host$/, /^@tiptap\/core/, /^@tiptap\/pm(\/.*)?$/];

/**
 * chunk 분리 + 이름 부여.
 *
 *  - sims/<category>/<name>   → 'sim-<category>-<name>' (개별 lazy chunk, sims/<category>/)
 *  - packages/plugin-<name>   → 'plugin-<name>'         (개별 lazy chunk, plugins/)
 *  - packages/host-tiptap, bootstrap → 'runtime'        (entry 와 모든 sim 공유)
 *  - node_modules/<pkg>       → 'vendor-<pkg>'          (의존성별 분리, vendor/)
 *
 * runtime 을 명시 분리하지 않으면 rollup 이 공용 코드를 임의의 한 sim
 * chunk(알파벳 첫 번째) 에 흡수시켜 entry 가 그 sim 을 정적 import 하는
 * 비정상 그래프가 만들어진다.
 *
 * plugin 을 runtime 에서 빼낸 이유:
 *  - 호스트가 사용하는 sim 조합에 따라 필요한 plugin 이 다르다 (ray-tracing
 *    만 쓰는 호스트는 plugin-circuit 이 불필요).
 *  - 현재는 bootstrap 가 모든 plugin 을 entry 시점에 로드하지만, 향후 sim
 *    메타데이터 기반 lazy 매칭 도입 시 chunk 분리가 전제 조건이 된다.
 *
 * vendor 를 패키지별로 분리한 이유:
 *  - marked, three 같은 큰 deps 가 일부 sim 에서만 쓰이는 경우, 다른 호스트
 *    경로에서 불필요하게 로드되지 않도록.
 *
 * id 는 절대 파일 경로로 들어옴 (workspace 패키지명이 아님).
 */
function manualChunks(id) {
  // sims/<category>/<name>/src/...
  const simMatch = id.match(/\/sims\/([^/]+)\/([^/]+)\/src\//);
  if (simMatch) return `sim-${simMatch[1]}-${simMatch[2]}`;

  const pluginMatch = id.match(/\/packages\/plugin-([^/]+)\//);
  if (pluginMatch) return `plugin-${pluginMatch[1]}`;

  // packages/host 는 external 이라 여기 오지 않는다. schema 는 타입 전용이라
  // 런타임 코드가 없다. 남는 것은 어댑터와 bootstrap 이다.
  if (
    id.includes('/packages/host-tiptap/') ||
    id.includes('/packages/bootstrap/')
  ) {
    return 'runtime';
  }

  // node_modules: 패키지별 분리.
  // pnpm 경로(`/node_modules/.pnpm/<pkg>@x.y.z_xxx/node_modules/<pkg>/...`) 와
  // 일반 경로(`/node_modules/<pkg>/...`) 모두 처리. 마지막 node_modules 뒤의
  // 토큰을 패키지명으로 채택.
  const nmMatches = [...id.matchAll(/\/node_modules\/(@[^/]+\/[^/]+|[^/]+)\//g)];
  if (nmMatches.length > 0) {
    const last = nmMatches[nmMatches.length - 1][1];
    if (last !== '.pnpm') {
      return `vendor-${last.replace('/', '__').replace('@', '')}`;
    }
  }

  return undefined;
}

/** chunk 의 출력 디렉터리 결정. sims/<category>/, plugins/, vendor/, runtime/ 분리. */
function chunkFileName(info) {
  const name = info.name ?? '';
  if (name.startsWith('sim-')) {
    // sim-<category>-<name> → sims/<category>/<name>-[hash].js
    const m = name.match(/^sim-([^-]+)-(.+)$/);
    if (m) return `sims/${m[1]}/${m[2]}-[hash].js`;
  }
  if (name.startsWith('plugin-')) return 'plugins/[name]-[hash].js';
  if (name.startsWith('vendor-')) return 'vendor/[name]-[hash].js';
  return 'runtime/[name]-[hash].js';
}

const jsBundle = {
  input: 'src/index.ts',
  external,
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: 'host-tiptap-bundle.js',
    chunkFileNames: chunkFileName,
    inlineDynamicImports: false,
    sourcemap: true,
    generatedCode: 'es2015',
    manualChunks,
  },
  plugins: [
    nodeResolve({
      extensions: ['.ts', '.tsx', '.mjs', '.js'],
      preferBuiltins: false,
    }),
    esbuild({
      target: 'es2022',
      sourceMap: true,
      tsconfig: '../../tsconfig.base.json',
      // 타입체크는 pnpm typecheck (tsc --noEmit) 가 담당. 여기는 transpile only.
    }),
    VISUALIZE &&
      visualizer({
        filename: 'stats.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
};

const dtsBundle = {
  input: 'src/index.ts',
  external,
  output: {
    file: 'dist/host-tiptap-bundle.d.ts',
    format: 'es',
  },
  // respectExternal: 위 external 만 남기고 나머지(@aperi21/host-tiptap, bootstrap,
  // schema, sim-*, plugin-*)의 타입은 인라인한다. 이것이 없으면 발행본 d.ts 가
  // 미발행 private 패키지를 import 해 소비자 쪽에서 타입이 전부 any 로 떨어진다.
  plugins: [dts({ respectExternal: true })],
};

export default [jsBundle, dtsBundle];
