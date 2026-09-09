# 프로젝트 구조 분석 (Phase 1)

> 작성 2026-09-09 · 기준 커밋 `830d827`
> 지침 `baden-rules-bootstrap-guide-claude.md` Phase 1 산출물.
> 규칙이 아니라 **규칙을 쓰기 위한 근거**다. Phase 5 완료 후 삭제 가능.

## 1-1. 기본 정보

| 항목 | 값 |
|---|---|
| 언어 | TypeScript (ESM, `strict: true`) |
| 주요 라이브러리 | React 18, Tiptap 3(peer), Vite, Rollup |
| 모노레포 | pnpm workspace — `apps/*`, `packages/*`, `sims/*/*` |
| 빌드 | Vite(catalog) · Rollup(발행 번들) · tsc(그 외) |
| 테스트 | Vitest (+ jsdom) |
| 정적 분석 | **ESLint 없음.** tsc `strict: true` 만 (CLAUDE.md 에 결정으로 명문화) |
| CI | `ci.yml`(typecheck+test) · `deploy.yml`(게이트 후 Pages) |

### 규모

- **128 파일 / 11,107 LOC** (node_modules · dist 제외)
- 13 워크스페이스 프로젝트 (packages 8 · sims 3 · apps 1 · root)

| 패키지 | 파일 | LOC |
|---|---:|---:|
| `packages/host` | 49 | 4,254 |
| `packages/react` | 19 | 1,690 |
| `apps/catalog` | 18 | 1,034 |
| `packages/schema` | 1 | 788 |
| `packages/plugin-circuit` | 5 | 679 |
| `sims/physics/projectile` | 7 | 607 |
| `sims/electronics/dc-circuit` | 7 | 571 |
| `packages/plugin-optics` | 4 | 528 |
| `packages/host-tiptap` | 3 | 344 |
| `sims/optics/ray-tracing` | 6 | 302 |
| `packages/bootstrap` | 4 | 140 |
| `packages/host-tiptap-bundle` | 1 | 94 |

`packages/host` 가 전체의 38%. 규칙 밀도를 여기에 집중해야 한다.

### 핵심 도메인

1. **선언 (schema)** — `SceneGraph` / `BundleSchema` 타입 정의. 788 LOC 단일 파일.
2. **런타임 (host)** — scene 전처리 · renderer/primitives · time · camera · controller ·
   theme · i18n · pluginManager · bundleRegistry/runBundle.
3. **도메인 플러그인 (plugin-*)** — 순수 계산(`solveMna`/`traceRay`) + 전용 렌더러.
4. **시뮬레이션 (sims/*/*)** — 선언 + 순수 물리. 6파일 구성.
5. **호스트 어댑터 (host-tiptap → bootstrap → host-tiptap-bundle)** — DSL `{aperi21:<id>}`
   파싱 · NodeView · 카탈로그 단일출처 · 외부 발행 번들.
6. **소비 앱 (react / catalog)** — Embed 컴포넌트와 카탈로그 사이트.

---

## 1-2. 패턴 탐색

### 이미 지켜지고 있는 좋은 패턴 (→ 원칙으로 격상)

| # | 관찰 | 실측 |
|---|---|---|
| G1 | **sim 이 렌더러를 참조하지 않는다.** sim 의 외부 import 는 `@aperi21/schema`(선언 타입) 와 plugin 의 **순수 계산 함수·타입**(`solveMna`·`traceRay`·`findImage`·`MnaElement`) 뿐 | `render*` import 0건 |
| G2 | **패키지 import 는 전부 루트 진입점 형태.** 내부 경로 직참조도 상대경로 침범도 없다 | 깊은 상대경로 0건, subpath import 0건 |
| G3 | **sim 선언은 문자열을 `LocalizedText` 로 둔다.** `{ko, en}` 구조가 schema 전반에 일관 | sim schema 전수 |
| G4 | **sim 은 색 리터럴을 쓰지 않는다.** 색은 theme 경유 | `sims/**` 색 리터럴 0건 |
| G5 | **RAF·리스너 등록/해제가 대칭이다.** `add 5 / remove 5`, RAF 루프에 cancel 존재 | runBundle · Canvas.tsx |
| G6 | **sim 파일 구성이 일정하다.** `schema · state · physics · scene · controllers · index` 6파일 | 3/3 sim 동일 |

G1·G2·G5 는 코드가 이미 만족하므로 규칙으로 쓰면 **잠금(lock-in)** 효과다. 위반이
들어오는 것을 막는 것이 목적이지 지금을 고치는 것이 아니다.

### 발견된 안티패턴 (→ 규칙 + AUDIT 대상)

| # | 안티패턴 | 위치 | 건수 |
|---|---|---|---:|
| A1 | **화면 문자열이 코드에 박혀 있다** — `ko ? '카메라' : 'Camera'` 삼항식 | `react/embed/CameraControls.tsx`(4) · `EnergyHUD.tsx`(5) | 9 |
| A2 | **문자열이 코드 안 카탈로그에 있다** — 모듈 상수 표에 `{ko, en}` | `react/embed/InfoPanel.tsx` LABELS | 5키 |
| A3 | **색 리터럴** (토큰 정의 파일 제외) | `host-tiptap/node-view.ts`(3) · `catalog/EditorDemoPage.tsx`(3) | 6 |
| A4 | **치수가 선언 밖 코드에 박혀 있다** | `host/runtime/runBundle.ts`(6: `360px`·`320px` 등) · `host-tiptap/node-view.ts`(4) | 10 |
| A5 | **식별자 명명이 이원화되어 있다** — DSL/등록 키는 kebab, schema id 는 snake | `aperi21:dc-circuit` ↔ `id: 'dc_circuit'`, `aperi21:ray-tracing` ↔ `id: 'ray_tracing'` | 2종 |
| A6 | **registry 가 모듈 레벨 싱글턴인데 번들이 그것을 inline 한다** | `host/runtime/bundleRegistry.ts` Map 3개 + `host-tiptap-bundle` rollup external 에 host 없음 | 구조 |
| A7 | **자유 렌더 계층이 없다** — sim 이 자기 시각화를 직접 그릴 자리가 없다 | `sims/**` 자체 렌더러 0건 | 구조 |
| A8 | `console.*` 직접 호출 | `host/host.ts` · `catalog/Header.tsx` | 2 |

#### A5 상세

같은 대상에 이름이 둘이다.

```
bootstrap 등록 키 :  'aperi21:projectile'  'aperi21:ray-tracing'  'aperi21:dc-circuit'
sim schema id     :  'projectile'          'ray_tracing'          'dc_circuit'
```

FACET 도 같은 문제를 겪고 `d65016f`("facet id 명명 규칙 확립 및 개명 적용")로 정리했다.
지금은 sim 3개라 사람이 외우지만, 늘어나면 등록 키와 선언 id 가 어긋나도 타입이 통과한다.

#### A6 상세 — 가장 무거운 것

`bundleRegistry.ts` 는 `bundles` · `loaders` · `inflight` 세 개의 모듈 레벨 `Map` 을 들고
있다. `host-tiptap-bundle` 의 rollup `external` 은 `@tiptap/*` 뿐이라 `@aperi21/host` 가
번들에 **inline** 된다.

- 현재 외부 진입점이 하나뿐이라 발현하지 않는다.
- 두 번째 진입점(`@aperi21/react` 등)이 외부에 노출되는 순간 Map 이 갈라진다.
  타입은 통과하고 예외도 안 나고 "등록 안 됨" 만 뜬다.
- 근거: `tasks/facet-insights/ANALYSIS.md` §1-1 (FACET CLAUDE.md 단일 registry 인스턴스 제약).

#### A7 상세

`sims/**` 에 자체 렌더러가 0개다. 그림은 전부 `host/src/renderer/primitives/`
(body · gauge · graph · marker · surface · trajectory · vector) 와 plugin 렌더러가 그린다.
플러그인은 `primitiveTypes` 로 어휘를 확장할 수 있으나(`['ray','opticalElement']`,
`['circuitElement','wire','terminal']`) **sim 단위의 확장 경로는 없다.**

FACET 이 이 구조를 대량 생산에서 실패로 판정했다(2026-09-09, 원칙 6 개정). 다만 도메인이
달라 그대로 폐기할 것은 아니다 — 판단과 근거는 `tasks/facet-insights/ANALYSIS.md` §3.

---

## 1-3. 정적 분석 현황

- **ESLint 미도입** — CLAUDE.md 「코드 품질 · 통과 바」에 결정으로 기록.
- tsc `strict: true` 가 기계적 검증의 전부. 통과 바는 `pnpm -r typecheck` + `pnpm test`.
- 따라서 **규칙에 정적 분석이 잡을 수 있는 항목을 쓰지 않는다** — 포매팅, 네이밍
  컨벤션, 미사용 import, 타입 안전. 규칙은 의존 방향 · 선언/런타임 경계 · 레지스트리
  경유 · 문자/색 리소스 위치처럼 tsc 가 볼 수 없는 것만 다룬다.

### 테스트 현황

실질 테스트 4파일 / 34케이스. 5개 패키지가 `--passWithNoTests`.

| 파일 | 케이스 |
|---|---:|
| `packages/host/src/__tests__/host.test.ts` | 19 |
| `sims/physics/projectile/src/__tests__/physics.test.ts` | 8 |
| `packages/bootstrap/test/catalog.test.ts` | 4 |
| `packages/react/src/__tests__/Embed.test.tsx` | 3 |

규칙 위반 중 **타입도 통과하고 예외도 안 나는** 종류는 테스트로만 잡힌다. Phase 5
Track E 에서 셋을 고정한다 — 마운트 후 캔버스 높이 불변 · 임베드 인스턴스 독립
(`fae3f35` 재발 방지) · 발행 tarball 누출 0.

---

## 규칙 매핑

| 관찰 | 규칙 |
|---|---|
| G1 | 원칙 1 (선언 → 런타임 방향성) |
| G2 | C3 (공개 API 경계) |
| G5 | C5 (리소스 수명) |
| G6 | S-sim (파일 구성) |
| A1 · A2 | C1 (화면 문자 리소스) |
| A3 | C2 (색·치수 토큰 경계) |
| A4 | 원칙 2 (선언 우선) + C2 |
| A5 | C4 (참조 문자열 정합) |
| A6 | 원칙 3 + S-host (단일 인스턴스) |
| A7 | 원칙 4 + S-render (탈출구 1급 승격) — 구조 신설 후 조항 확정 |
| A8 | C5 곁가지. 단독 규칙으로 만들 만큼 크지 않다 |
