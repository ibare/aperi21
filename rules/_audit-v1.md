# AUDIT-v1 — 초기 전수 감사

> 실행 2026-09-09 · 기준 커밋 `3fbf246`
> 범위: `packages/**` · `sims/**` · `apps/**` 소스 128파일 / 11,107 LOC (전수)
> 배치 1(Principles + C1~C5) · 배치 2(S-sim · S-host · S-render) 를 한 세션에 수행.
> 규모가 작아 배치를 나눌 필요가 없었다.

## 요약

| | |
|---|---:|
| 검사한 MUST 항목 | 27 |
| PASS | 19 |
| **위반** | **8** |
| 예외 판정 | 4 |
| **준수율** | **70%** (19/27) |

| Severity | 건수 |
|---|---:|
| Critical | 1 |
| High | 3 |
| Medium | 3 |
| Low | 1 |

규칙을 코드베이스의 현실 위에 썼으므로 위반이 나오는 것은 설계된 결과다. Critical/High
4건이 Phase 5 의 실질 대상이다.

---

## 위반 목록

| # | 규칙 | 파일 | Severity | 내용 |
|---|---|---|:---:|---|
| 1 | 원칙 3 · S-host | `packages/host-tiptap-bundle/rollup.config.mjs:23` | **Critical** | `external` 이 `@tiptap/*` 뿐이라 `@aperi21/host` 가 번들에 inline 된다. `bundleRegistry` 의 Map 3개가 모듈 싱글턴이라 두 번째 외부 진입점이 생기면 등록과 조회가 갈린다 |
| 2 | 원칙 5 · C1 | `packages/react/src/embed/CameraControls.tsx:34,35,37,38` · `EnergyHUD.tsx:67-72` | **High** | 화면 문자열이 `ko ? '…' : '…'` 삼항식으로 코드에 박혀 있다. 9건 |
| 3 | 원칙 5 · C1 | `packages/react/src/embed/InfoPanel.tsx:11-15` | **High** | 문자열이 모듈 상수 표(`{ko, en}`)에 있다. 코드 안 카탈로그도 코드다 |
| 4 | 원칙 2 · C2 · S-render | `packages/host/src/runtime/runBundle.ts:113,114,117` | **High** | 임베드 컨테이너 치수가 코드에 박혀 있다 (`minHeight 320px` · `height 360px` · `borderRadius 8px`). 저작자가 크기를 정할 수 없다 |
| 5 | C4 | `sims/optics/ray-tracing/src/schema.ts:4` · `sims/electronics/dc-circuit/src/schema.ts:4` | Medium | 등록 키는 kebab(`aperi21:ray-tracing`), 선언 id 는 snake(`ray_tracing`). 같은 대상에 두 이름 |
| 6 | C2 | `packages/host-tiptap/src/node-view.ts:38,39` | Medium | 플레이스홀더 배지 색이 hex 리터럴 (`#FAECE7` · `#A8331C`). 3건 |
| 7 | 원칙 4 · S-render | `sims/**` | Medium | sim 단위 자유 렌더 경로가 없다. 프리미티브로 표현 불가능한 시각화를 만들 자리가 없음 (구조적 결손) |
| 8 | C2 | `packages/host-tiptap/src/node-view.ts:37,40,80` | Low | 배지 치수가 리터럴 (`4px` · `12px`). 임베드 본체가 아니라 오류 플레이스홀더라 영향이 작다 |

---

## PASS 항목

감사에서 **위반 0건**으로 확인된 것. 이 규칙들은 고치기 위한 것이 아니라 **잠그기 위한
것**이다.

| 규칙 | 검사 | 결과 |
|---|---|---|
| 원칙 1 | `sims/**` 의 `render*` import | **0건** |
| 원칙 1 | `sims/**` 이 canvas·ctx 접근 | **0건** |
| 원칙 3 | 레지스트리 경유 조회 (`getBundleById`/`loadBundle`) | 준수 |
| 원칙 6 | 마운트 후 높이 변동 | 없음 (고정값이라 흔들리지 않음 — 단 위반 4번과 별개) |
| 원칙 6 | 인스턴스 독립 | 준수 (`fae3f35` 이후) |
| 원칙 6 | `destroy()` 정리 | `node-view` 가 handle 을 보관해 호출 |
| C2 | `sims/**` 색 리터럴 | **0건** |
| C3 | 패키지 루트 진입점 import | 111건 전부 준수 |
| C3 | 깊은 상대경로 침범 | **0건** |
| C5 | 리스너 등록/해제 대칭 | `runBundle` 5/5 · `Canvas.tsx` 5/5 |
| C5 | RAF 핸들 관리 | 양쪽 모두 cancel 존재 |
| S-sim | 6파일 구성 | 3/3 sim 준수 |
| S-host | lazy loader 형식 (`() => import(...)`) | 3/3 준수 — chunk 경계 보존 |
| S-host | 의존 일방향 (bootstrap → 어댑터 역참조) | **0건** (주석 언급뿐) |
| S-host | 번들이 `sim-*`/`plugin-*` 직접 의존 | **0건** (bootstrap 경유) |
| S-render | 렌더러 간 상호 import | **0건** (barrel `index.ts` 집계는 제외) |
| S-render | 캔버스 부착 순서 | 정상 — 아래 예외 2 참조 |

---

## 예외 판정

위반처럼 보이나 검토 결과 위반이 아닌 것.

### 예외 1 — `packages/host/src/theme/themes.ts` 의 색 리터럴 22건

토큰 정의 파일 자체다. C2 Exception 에 이미 명시.

### 예외 2 — `node-view.ts` 의 `mount.textContent = ''` 4건

FACET 이 겪은 함정(*"컨테이너를 비우면 캔버스가 떨어져 나간다"*)과 **순서가 다르다.**

- FACET: 러너가 캔버스를 **먼저 붙이고** view.mount 를 부름 → mount 안의 비우기가 캔버스를 지움
- 우리: node-view 가 mount 를 비운 **뒤** `runBundle(…, mount)` 을 부르고, runBundle 이
  `wrapper` + `canvas` 를 만들어 `mount.appendChild` 함 (`runBundle.ts:128`)

순서가 반대라 안전하다. 다만 **runBundle 이 캔버스를 미리 붙이는 방식으로 바뀌면 그
순간 함정이 된다.** S-render 의 해당 MUST 가 그 변경을 막는 자리다.

### 예외 3 — `packages/host-tiptap/src/markdown.ts:37` 의 `let installed = false`

모듈 스코프 가변 상태이나 **marked 확장 설치 멱등 가드**이지 인스턴스 상태가 아니다.
원칙 6 이 금하는 것은 카메라·시간·뷰 같은 인스턴스별 상태다.

### 예외 4 — `packages/host/src/host.ts` 의 `console.*`

`host.logger` 경계다. C5 가 허용하는 자리.
`apps/catalog/src/components/Header.tsx` 의 1건은 카탈로그 앱이라 적용 범위 밖.

---

## 감사 중 발견된 규칙 자체의 결함

**C2 의 「현재 위반」 표에 적용 범위 밖인 `apps/catalog/src/pages/EditorDemoPage.tsx` 가
섞여 있었다.** C2 의 When to Apply 는 임베드 런타임(host · plugin · host-tiptap · sims)인데
카탈로그 앱의 데모 페이지를 위반으로 세었다.

→ C2 Exception 에 적용 범위를 명시하고 표에서 제거했다. 규칙을 쓴 직후 감사가 규칙의
경계를 되짚는 것은 정상 절차다.

### C1 검사 패턴이 불완전했다

위반 2를 셀 때 `ko ?` 삼항식만 grep 해서 **`i18n.lang === 'ko' ?` 형태 2건을 놓쳤다**
(`ParamPanel.tsx:96,99`). Track C 사후 전수 검증에서 드러났다.

같은 뜻을 코드가 두 가지 형태로 쓰고 있었고 감사는 한 형태만 봤다. 감사의 grep 은
**규칙이 금지하는 것**이 아니라 **코드가 실제로 쓰는 형태**를 기준으로 짜야 한다.

→ 해당 위반은 Track C 에서 해소했고, `.claude/agents/rule-guard.md` 의 C1 검사에 두 형태를
모두 넣었다.

---

## Phase 5 Track 배정

| Track | 위반 # | Severity |
|---|---|:---:|
| **A** 기계적 | 6, 8 (node-view 색·치수) | Medium·Low |
| **B** 구조 | **1** (레지스트리 분리) | **Critical** |
| **C** 선언 승격 | 2, 3, 4 (문자열 3층 · 치수 선언화) | High×3 |
| **A′** 명명 | 5 (id 이원화) | Medium |
| **D** 계층 신설 | 7 (자유 렌더 경로) | Medium |
| **E** 게이트 | — (예방: `pnpm pack` 검증 + 회귀 테스트 3종) | — |
| **F** | AUDIT-v2 | — |

**목표: Critical 0 · High 0.** Medium 이하는 다음 라운드로 미룰 수 있다.

Track B·E 는 다음 릴리스 전에 끝나야 한다 (`tasks/facet-insights/ANALYSIS.md` §7).
