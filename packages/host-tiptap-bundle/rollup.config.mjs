// @ts-check
/**
 * @aperi21/host-tiptap-bundle — rollup 설정.
 *
 * 정책 (FACET 의 host-tiptap-bundle 설정 이식):
 *  - 단일 ESM entry (host-tiptap-bundle.js) + dynamic import 자동 chunk 추론.
 *  - inlineDynamicImports: false — bundle-* 의 lazy 보존 핵심.
 *  - external: @tiptap/core, @tiptap/pm — 호스트의 단일 인스턴스 보장.
 *  - chunkFileNames 는 함수형 — bundles/, runtime/, vendor/ 디렉터리 분리.
 *  - manualChunks: bundle 별/runtime 공용 분리.
 *  - sourcemap: true.
 *  - VISUALIZE=1 환경변수일 때만 stats.html 생성.
 *  - .d.ts 는 별도 빌드 패스 (rollup-plugin-dts) 로 단일 dist/host-tiptap-bundle.d.ts 생성.
 */

import { nodeResolve } from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';

const VISUALIZE = process.env.VISUALIZE === '1';

const external = [/^@tiptap\/core/, /^@tiptap\/pm(\/.*)?$/];

/**
 * chunk 분리 + 이름 부여.
 *
 *  - packages/bundle-<name>   → 'bundle-<name>'   (개별 lazy chunk, bundles/)
 *  - packages/plugin-<name>   → 'plugin-<name>'   (개별 lazy chunk, plugins/)
 *  - packages/host*, schema, bootstrap → 'runtime' (entry 와 모든 bundle 공유)
 *  - node_modules/<pkg>       → 'vendor-<pkg>'    (의존성별 분리, vendor/)
 *
 * runtime 을 명시 분리하지 않으면 rollup 이 공용 코드를 임의의 한 bundle
 * chunk(알파벳 첫 번째) 에 흡수시켜 entry 가 그 bundle 을 정적 import 하는
 * 비정상 그래프가 만들어진다.
 *
 * plugin 을 runtime 에서 빼낸 이유:
 *  - 호스트가 사용하는 bundle 조합에 따라 필요한 plugin 이 다르다 (ray-tracing
 *    만 쓰는 호스트는 plugin-circuit 이 불필요).
 *  - 현재는 bootstrap 가 모든 plugin 을 entry 시점에 로드하지만, 향후 bundle
 *    메타데이터 기반 lazy 매칭 도입 시 chunk 분리가 전제 조건이 된다.
 *
 * vendor 를 패키지별로 분리한 이유:
 *  - marked, three 같은 큰 deps 가 일부 bundle 에서만 쓰이는 경우, 다른 호스트
 *    경로에서 불필요하게 로드되지 않도록.
 *
 * id 는 절대 파일 경로로 들어옴 (workspace 패키지명이 아님).
 */
function manualChunks(id) {
  const bundleMatch = id.match(/\/packages\/bundle-([^/]+)\//);
  if (bundleMatch) return `bundle-${bundleMatch[1]}`;

  const pluginMatch = id.match(/\/packages\/plugin-([^/]+)\//);
  if (pluginMatch) return `plugin-${pluginMatch[1]}`;

  if (
    id.includes('/packages/host/') ||
    id.includes('/packages/host-tiptap/') ||
    id.includes('/packages/schema/') ||
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

/** chunk 의 출력 디렉터리 결정. bundles/, plugins/, vendor/, runtime/ 분리. */
function chunkFileName(info) {
  const name = info.name ?? '';
  if (name.startsWith('bundle-')) return 'bundles/[name]-[hash].js';
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
  plugins: [dts()],
};

export default [jsBundle, dtsBundle];
