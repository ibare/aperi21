// @ts-check
/**
 * @aperi21/host — rollup 설정.
 *
 * 이 패키지는 **레지스트리를 담고 있으므로 발행 대상**이다 (원칙 3, S-host).
 * 외부 호스트가 여러 aperi21 진입점을 쓰더라도 `bundleRegistry` 의 Map 이
 * 하나여야 하므로, 소비 번들이 이것을 inline 하지 않고 peer 로 공유한다.
 *
 * 정책:
 *  - 단일 ESM entry. dynamic import 없음 → 단일 파일.
 *  - external 없음 — 유일한 워크스페이스 의존 `@aperi21/schema` 는 **타입 전용**
 *    (런타임 export 0건) 이라 JS 에는 흔적이 남지 않고, .d.ts 에는 rollup-plugin-dts
 *    가 인라인한다. 그래서 schema 는 private 로 남는다.
 *  - .d.ts 는 별도 패스로 단일 dist/index.d.ts 생성.
 *  - sourcemap: false — 맵이 가리킬 src 가 tarball 에 없다 (authoring · 번들과 같은 방침).
 */

import { nodeResolve } from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

const jsBundle = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: false,
    generatedCode: 'es2015',
  },
  plugins: [
    nodeResolve({ extensions: ['.ts', '.mjs', '.js'], preferBuiltins: false }),
    esbuild({
      target: 'es2022',
      sourceMap: false,
      tsconfig: '../../tsconfig.base.json',
      // 타입체크는 pnpm typecheck (tsc --noEmit) 담당. 여기는 transpile only.
    }),
  ],
};

const dtsBundle = {
  input: 'src/index.ts',
  output: { file: 'dist/index.d.ts', format: 'es' },
  // respectExternal: @aperi21/schema 는 private 이므로 타입을 인라인해야 한다.
  // 없으면 발행본 d.ts 가 미발행 패키지를 import 한다.
  plugins: [dts({ respectExternal: true })],
};

export default [jsBundle, dtsBundle];
