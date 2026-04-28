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
 *  - bundle (packages/bundle-<name>) → 'bundle-<name>' (개별 lazy chunk).
 *  - host / plugin-* / schema → 'runtime' (entry 와 bundle 모두가 공유).
 *
 * runtime 을 명시 분리하지 않으면 rollup 이 공용 코드를 임의의 한 bundle
 * chunk(알파벳 첫 번째) 에 흡수시켜 entry 가 그 bundle 을 정적 import 하는
 * 비정상 그래프가 만들어진다.
 *
 * id 는 절대 파일 경로로 들어옴 (workspace 패키지명이 아님).
 */
function manualChunks(id) {
  const m = id.match(/\/packages\/bundle-([^/]+)\//);
  if (m) return `bundle-${m[1]}`;
  if (
    id.includes('/packages/host/') ||
    id.includes('/packages/host-tiptap/') ||
    id.includes('/packages/schema/') ||
    id.includes('/packages/bootstrap/') ||
    /\/packages\/plugin-[^/]+\//.test(id)
  ) {
    return 'runtime';
  }
  return undefined;
}

/** chunk 의 출력 디렉터리 결정. bundle → bundles/, vendor → vendor/, 나머지 → runtime/. */
function chunkFileName(info) {
  const name = info.name ?? '';
  if (name.startsWith('bundle-')) return 'bundles/[name]-[hash].js';
  const id = info.facadeModuleId ?? info.moduleIds?.[0] ?? '';
  if (id.includes('node_modules')) return 'vendor/[name]-[hash].js';
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
