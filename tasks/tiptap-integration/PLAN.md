# Aperi21 Tiptap 호스트 에디터 연동 계획서

> 컨텍스트 압축에 대비한 진행 계획서. 각 Phase 는 독립 PR 단위로 검증 가능하게 작성.
>
> 참조 모델: `/Users/mintae/Documents/Develop/side-projects/FACET`
> 대상 리포: `/Users/mintae/Documents/Develop/side-projects/aperi21`

## 목표

호스트(외부 Tiptap 에디터) 가 마크다운 본문에 `{bundle:<id>}` 토큰을 박으면 Aperi21
시뮬레이션 번들이 인라인으로 마운트되어 동작하는 체계를 구축한다.

## 핵심 패턴 (FACET 에서 검증된 것을 그대로 이식)

1. **Tiptap Node Extension** — 인라인 atom 노드, DSL `{bundle:<id>}` 입력/붙여넣기 룰
2. **NodeView Renderer** — 마운트 시 `runBundle()` 호출, update/destroy 라이프사이클 일치
3. **Markdown 확장** — `marked` inline-level extension 으로 토큰 → placeholder span 치환
4. **Bundle Registry** — 번들/loader Map, 동시 중복 로드 방지 (`inflightLoads`)
5. **Bootstrap** — 정적 등록 (built-in views/plugins) + 동적 등록 (`registerBundleLoader('bundle:foo', () => import('@aperi21/bundle-foo'))`)
6. **Rollup 번들** — `inlineDynamicImports: false`, `manualChunks` (bundle 별/runtime 공용)
7. **외부 호스트 facade** — `host-tiptap-bundle` 이 `bootstrapBundle + BundleExtension` 만 재export

---

## Phase 1: `packages/host-tiptap` 신규 패키지

### 목적
Tiptap Node + NodeView + Markdown 변환을 묶은 어댑터.

### 파일
```
packages/host-tiptap/
├── package.json          ← @aperi21/host-tiptap (private workspace)
├── tsconfig.json
├── src/
│   ├── index.ts          ← BundleExtension, parseBundleRaw, exports
│   ├── node-view.ts      ← createBundleNodeView (runBundle 호출)
│   └── markdown.ts       ← renderBundleMarkdown (marked extension)
```

### package.json 핵심
- `name: @aperi21/host-tiptap`
- `dependencies: @aperi21/host, @aperi21/schema, marked`
- `peerDependencies: @tiptap/core ^3, @tiptap/pm ^3`
- `devDependencies: @tiptap/core, @tiptap/pm` (typecheck 용)
- `main/types/exports`: `./src/index.ts` (workspace 내 직접 import)

### 산출물
- `BundleExtension` (Node, atom, inline) — DSL `{bundle:<id>}`
- `createBundleNodeView()` — runBundle 호출, update/destroy 일치
- `renderBundleMarkdown(md: string): string` — marked inline extension
- `parseBundleRaw(raw): id | null`

### 의존: 없음 (Phase 2 의 runBundle 은 별도. 첫 단계는 host-tiptap 만 우선 만들고, runBundle 은 임시 stub 으로 둔 뒤 Phase 2 에서 실제 연결)

---

## Phase 2: `@aperi21/host` 확장 — Bundle Registry & runBundle()

### 목적
Bundle JSON / 모듈을 id 로 조회·lazy load·DOM 마운트하는 런타임을 host 패키지에 추가.

### 파일
```
packages/host/src/
├── runtime/
│   ├── bundleRegistry.ts ← getBundleById/registerBundleLoader/loadBundle
│   ├── runBundle.ts      ← Bundle JSON + mount DOM → BundleRunHandle
│   └── index.ts          ← runtime barrel
└── index.ts              ← runtime/* re-export
```

### bundleRegistry.ts API
```ts
export type BundleLoader = () => Promise<unknown>;

export function registerBundle(id: string, bundle: Bundle): void;
export function getBundleById(id: string): Bundle | undefined;
export function registerBundleLoader(id: string, loader: BundleLoader): void;
export function hasBundleLoader(id: string): boolean;
export function loadBundle(id: string): Promise<Bundle | null>;
```
- 모듈 레벨 `Map` (싱글톤) — FACET 의 `facets`/`facetLoaders`/`inflightLoads` 패턴
- `loadBundle`: in-flight 중복 로드 방지 → 같은 id 동시 호출 시 같은 Promise 공유

### runBundle.ts API
```ts
export interface RunBundleOptions {
  locale?: string;
  theme?: 'light' | 'dark';
  /** 호스트가 미리 만든 Host 가 있으면 재사용, 없으면 내부 생성. */
  host?: Host;
}
export interface BundleRunHandle {
  destroy(): void;
}
export function runBundle(
  bundle: Bundle,
  mount: HTMLElement,
  options?: RunBundleOptions,
): BundleRunHandle;
```
- 내부 구현:
  - `Host` 1회 생성 (또는 옵션으로 받음)
  - `<canvas>` 직접 만들고 `BundleCanvas` 의 RAF 루프와 동등한 로직을 **DOM 단일 진입**으로 리팩토링한 `mountBundleCanvas(host, bundle, opts) → cleanup`
  - 이미 react/embed/Canvas.tsx 에 거의 동일 로직이 있음 → 비-React 버전으로 추출 (양쪽이 공유 가능하게 또는 host 안에 로직 두고 react 가 그걸 호출하도록)
  - 첫 구현은 **간소 버전**: 캔버스 단일 + RAF 루프 + 렌더 + step. ParamPanel/HUD 등은 Phase 5 에서 더 정교화. 마운트 검증이 우선.

### react Embed 와의 관계
- Phase 2 단계에서는 **react/Embed 를 건드리지 않는다**. 별도 비-React mountBundle 경로를 만들어 NodeView 에서 사용.
- 추후(Phase 5+) 둘이 같은 코어 mount 함수를 공유하도록 react/embed/Canvas 를 thin wrapper 로 리팩토링 가능 (이번 작업 범위 밖).

---

## Phase 3: `packages/bootstrap` 신규 패키지

### 목적
Bundle/Plugin 의 카탈로그 단일 출처. 외부 호스트가 `bootstrapAperi21()` 한 번 호출.

### 파일
```
packages/bootstrap/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

### src/index.ts
```ts
import { registerBundleLoader } from '@aperi21/host';

let initialized = false;
export function bootstrapAperi21(): void {
  if (initialized) return;
  initialized = true;

  registerBundleLoader('bundle:projectile', async () => {
    const m = await import('@aperi21/bundle-projectile');
    // 각 bundle 패키지가 register 함수를 export 하면 그걸 호출
    return m.registerProjectileBundle();
  });
  registerBundleLoader('bundle:ray-tracing', async () => {
    const m = await import('@aperi21/bundle-ray-tracing');
    return m.registerRayTracingBundle();
  });
  registerBundleLoader('bundle:dc-circuit', async () => {
    const m = await import('@aperi21/bundle-dc-circuit');
    return m.registerDcCircuitBundle();
  });
}
```

### 각 bundle 패키지 변경 (3개)
`packages/bundle-{projectile,ray-tracing,dc-circuit}/src/index.ts` 에 `register*Bundle()` 함수 추가:
```ts
import { registerBundle } from '@aperi21/host';
export function registerProjectileBundle() {
  registerBundle('bundle:projectile', projectileBundle);
  return projectileBundle;
}
```
- 기존 `projectileBundle` default/named export 는 유지 (호환성)
- plugin (optics/circuit) 도 추후 정적 등록 추가 — Phase 3 첫 시점에는 일단 bundle 만

### 의존성: Phase 1, Phase 2 완료 후

---

## Phase 4: `packages/host-tiptap-bundle` 외부 호스트용 Rollup 번들

### 목적
외부 호스트(예: methii 같은 노트 앱) 가 단일 의존으로 소비하는 ESM 번들.

### 파일
```
packages/host-tiptap-bundle/
├── package.json
├── tsconfig.json
├── rollup.config.mjs
└── src/
    └── index.ts
```

### src/index.ts
```ts
export {
  BundleExtension,
  parseBundleRaw,
  createBundleNodeView,
  renderBundleMarkdown,
  type BundleExtensionOptions,
} from '@aperi21/host-tiptap';
export { bootstrapAperi21 } from '@aperi21/bootstrap';
```

### rollup.config.mjs (FACET 설정 95% 재사용)
- `external: [/^@tiptap\/core/, /^@tiptap\/pm(\/.*)?$/, /^react/, /^react-dom/]`
- `inlineDynamicImports: false`
- `manualChunks`:
  - `/packages/bundle-/` → `bundle-<name>`
  - `/packages/host/` 또는 `/packages/plugin-/` → `runtime`
- `chunkFileNames`: bundle/, runtime/, vendor/ 분리
- `rollup-plugin-esbuild` (transpile only, target es2022)
- `rollup-plugin-dts` 별도 패스 → 단일 .d.ts
- `rollup-plugin-visualizer` (VISUALIZE=1)
- `rollup-plugin-node-resolve`

### package.json
- `main/types/exports`: `./dist/host-tiptap-bundle.{js,d.ts}`
- `peerDependencies: @tiptap/core ^3, @tiptap/pm ^3`
- `devDependencies`: rollup + 플러그인 + workspace deps

### 의존: Phase 1, 2, 3 완료

---

## Phase 5: 통합 검증 — apps/catalog 에 BundleEditor 데모 페이지

### 목적
실제로 동작하는 마크다운 → Tiptap Editor → BundleExtension → runBundle 경로 검증.

### 파일
- `apps/catalog/src/pages/EditorDemoPage.tsx` (신규) — 라우트 `/editor-demo`
- 또는 `BundleDetailPage.tsx` 에 마크다운 미리보기 섹션 추가
- `apps/catalog/package.json` 에 `@tiptap/react`, `@tiptap/starter-kit`, `@aperi21/host-tiptap`, `@aperi21/bootstrap` 추가
- `main.tsx` 또는 `EngineProvider` 에서 `bootstrapAperi21()` 호출

### 검증 시나리오
1. 마크다운 본문: `"포물선 운동을 보자: {bundle:projectile}"`
2. `renderBundleMarkdown(md)` 로 HTML 변환
3. `useEditor({ extensions: [StarterKit, BundleExtension], content: html })`
4. 페이지 로드 시 placeholder span 이 NodeView 로 업그레이드 → projectile 시뮬레이션 마운트 → RAF 루프 동작
5. dev 서버에서 `pnpm dev` → `/editor-demo` 접속 → 동작 확인

### 검증 기준 (한 줄):
- 마크다운 안의 `{bundle:projectile}` 토큰이 실제 시뮬레이션 캔버스로 렌더되고 시간 진행 시 공이 움직인다.

---

## 진행 상태 추적

각 Phase 완료 시 이 파일 하단에 체크박스 갱신 + 요약 한 줄.

### 완료 체크리스트
- [x] Phase 1: `@aperi21/host-tiptap` 패키지 생성
- [x] Phase 2: Bundle registry + runBundle() (host 확장)
- [x] Phase 3: `@aperi21/bootstrap` 패키지 + 각 bundle 의 register 함수
- [x] Phase 4: `@aperi21/host-tiptap-bundle` Rollup 번들
- [x] Phase 5: catalog 에 EditorDemo 통합 + dev 검증

### 진행 로그
- 2026-04-28: Phase 1 — host-tiptap 패키지 생성 (BundleExtension/NodeView/markdown). typecheck 통과.
- 2026-04-28: Phase 2 — host 패키지에 runtime/{bundleRegistry,runBundle} 추가. NodeView 가 stub→실제 runBundle 호출. typecheck 통과.
- 2026-04-28: Phase 3 — `@aperi21/bootstrap` 패키지 신규 + 3개 bundle 에 `register*Bundle()` export 추가.
- 2026-04-28: Phase 4 — `@aperi21/host-tiptap-bundle` Rollup 번들 패키지 신규. `pnpm install` 로 의존성 설치 후 build 검증 권장.
- 2026-04-28: Phase 5 — catalog 앱에 `/editor-demo` 라우트 추가, `registerAperi21Bundles()` 부팅, 마크다운 본문에 `{bundle:projectile}` 등 3종 토큰을 박은 데모 페이지 동작 가능. 전체 typecheck 통과 + `pnpm --filter @aperi21/catalog build` 성공. (실제 dev 서버 검증은 `pnpm dev` → http://localhost:5173/#/editor-demo 에서 진행)
- vite 빌드 경고: catalog 가 `mocks/phase1-bundles.ts`/`EngineProvider.tsx` 에서 bundle/plugin 을 정적 import 하고, bootstrap 이 같은 모듈을 dynamic import 하기 때문. catalog 자기 번들 안의 lazy 분리는 효과가 없지만, **외부 호스트가 host-tiptap-bundle dist 만 소비하는 경우엔 lazy 가 유지**된다 (Phase 4 빌드 결과로 검증됨: bundles/, runtime/ 분리). 데모용 catalog 에선 무시.

---

## 위험·주의 사항

1. **Phase 2 runBundle 의 캔버스 로직 중복**: 이미 react/embed/Canvas.tsx 에 RAF 루프가 있음. 첫 이식은 그 로직을 비-React 헬퍼로 그대로 추출. 이중 유지 부담 있지만 Phase 5 검증 후 한쪽으로 통일.
2. **번들 ID 컨벤션**: FACET 은 `facet:bubbleSort` (camelCase). Aperi21 카탈로그 JSON 은 `projectile`/`ray_tracing`/`dc_circuit` (snake_case). DSL 은 `{bundle:projectile}`/`{bundle:ray-tracing}` 등으로 **kebab-case 통일** (DSL 정규식이 그게 더 깔끔). 등록 시 `bundle:` prefix 포함.
3. **plugin 등록**: ray-tracing 은 optics 플러그인 필요, dc-circuit 은 circuit 플러그인 필요. runBundle 이 내부 Host 를 새로 만들 때 어떤 plugin 을 등록할지 결정 필요. 첫 구현은 **모든 plugin 을 항상 등록**(번들이 작아서 OK), Phase 5 후 최적화.
4. **react/Embed 와의 분리**: react 패키지는 그대로 두고, host-tiptap 은 react 의존 없이 동작하게 만든다. 이중 마운트 경로 유지.

---

## 작업 시 명령

```bash
# 새 패키지 생성 후
pnpm install                    # workspace 링크 갱신

# 패키지별 typecheck
pnpm --filter @aperi21/host-tiptap typecheck
pnpm --filter @aperi21/host typecheck
pnpm --filter @aperi21/bootstrap typecheck
pnpm --filter @aperi21/host-tiptap-bundle build  # rollup

# 전체
pnpm typecheck

# 개발 서버
pnpm dev   # → catalog 앱
```
