# aperi21 Rules 부트스트랩 계획

> 수립 2026-09-09
> 지침: `baden-rules-bootstrap-guide-claude.md` (리포 루트)
> 설계 근거: `tasks/facet-insights/ANALYSIS.md` (FACET 조사 결과)
>
> 8~10 세션짜리 작업이라 컨텍스트가 끊겨도 이어갈 수 있게 남긴다.
> 진행 상태는 §6 체크리스트에서 갱신한다.

## 0. 사전 실측

Phase 1 의 1-1 · 1-3 선행분. 2026-09-09 기준.

| 항목 | 값 |
|---|---|
| 소스 | **128 파일 / 11,107 LOC** (node_modules · dist 제외) |
| 최대 패키지 | `packages/host` 49파일 4,254 LOC (전체의 38%) |
| 정적 분석 | **ESLint 없음.** tsc `strict: true` 만 |
| 테스트 | vitest, **실질 테스트 4개** (8개 패키지 중 5개가 `--passWithNoTests`) |
| CI | `deploy.yml` 하나 — **typecheck/test 게이트 없음** |
| `.claude/` | 없음 (rule-guard 신설 필요) |

지침의 성숙도 구분으로 **"초기 프로젝트(~10K lines)"** 구간.
권고: *Phase 1 빠르게, Concerns 3~5개, Specifics 2~3개, 가벼운 감사 후 즉시 정상 운영.*
볼륨 확대가 예정되어 있으므로 **개수는 지침대로 통제하되 뼈대는 확장 가능하게** 잡는다.

### 결정 1 — ESLint 미도입

지침은 *"기계적 검증은 기계에 맡긴다"* 가 원칙이나, FACET 은 반대로 가고 그것을
CLAUDE.md 에 명시했다 (*"ESLint 미도입. strict tsc + rules + rule-guard 로 커버"*).

**우리도 같은 선택을 한다.** 11K LOC 단일 저자 규모에서 ESLint 설정·플러그인·CI 시간의
비용이 잡아 줄 문제보다 크다. **단 그 선택을 CLAUDE.md 에 명문화한다** — 적어 두지 않으면
규칙에 네이밍·포매팅 항목이 섞여 들어오고, 그것이 지침이 가장 경계하는 실패다.

### 결정 2 — CI 통과 바를 먼저 세운다

규칙 체계는 통과 바가 있어야 의미가 생긴다. 지금 CI 는 배포만 한다.
Phase 0 에서 `typecheck + test` 를 CI 에 넣는다. 규칙 작업의 전제다.

### 결정 3 — Baden 연동은 Phase 6 이후 판단

지침상 "선택" 이고 11K LOC 는 필수 구간이 아니다. Phase 6 까지 끝내고 판단한다.

---

## 1. 인사이트 문서를 규칙에 넣는 방식 (핵심 판단)

지침과 인사이트 문서 사이에 실제 긴장이 있다.

> 지침 Phase 3: **"코드베이스의 현실을 반영한다. 이상적인 규칙이 아니라 이 프로젝트에서
> 실제로 지켜야 하는 것을 쓴다."**

인사이트 권고 8건 중 상당수는 **아직 우리 코드에 구조가 없다.** 뭉뚱그리면 규칙이
위시리스트가 된다. 셋으로 가른다.

### 갈래 A — 지금 규칙으로 쓴다 (위반이 나오는 게 정상)

판정 대상이 이미 코드에 있고 grep·읽기로 가릴 수 있는 것.

| 인사이트 | 규칙 | 현재 상태 |
|---|---|---|
| §1-1 레지스트리 단일 인스턴스 | `S-host` MUST | 위반 (번들이 host inline) → AUDIT Critical |
| §2-1 화면 문자열 | `C1` MUST | 위반 4곳 이상 |
| §2-2 선언 밖 하드코딩 | `principles 2` + `C2` | 위반 (`runBundle.ts:114`, `node-view.ts:38`) |

규칙에 MUST 를 쓰고 감사가 위반으로 잡는 것은 **정상 흐름**이다. FACET 도 그렇게 했다
(`_audit-v1.md` → 리팩토링 → `_audit-v2.md`). 지침 Phase 4~5 가 그 절차다.

### 갈래 B — 구조를 먼저 만들고 그 다음에 규칙으로 승격

판정할 대상 자체가 없는 것. 규칙으로 쓰면 감사에서 "해당 없음" 만 나온다.

- §3 sim 자유 렌더 계층(`<name>-stage.ts`) — 지금 0개. 계층 신설 후 `S-render` 에 조항 추가.
- §5-4 authoring 개념 메타 — 패키지 자체가 없음.

### 갈래 C — 지금은 쓰지 않는다

- §4 조각(piece) 규범 — **대상 0개.** FACET 도 조각 9종을 실제로 만든 뒤에야 `S-piece` 를
  썼다 (`1682bbb`). 그 문서의 값어치는 아홉을 만들어 보고 넷이 서로 닮았다는 것을
  **실측한 데서** 나왔다. 지금 베껴 쓰면 근거 없는 조항이 된다.
- `tasks/facet-insights/ANALYSIS.md` §4 에 남겨 두고 **첫 조각을 만들 때 승격**한다.
  관성 계측기(`piece-inertia`)도 그때 함께 이식한다.

---

## 2. 규칙 체계 설계

### 아키텍처 대응

```
FACET  :  Algorithm      →  Projector  →  FacetJson       →  Runner
aperi21:  physics/state  →  scene      →  SceneGraph 선언  →  host(renderer/time/camera)
```

### Principles — 6개 (지침 상한)

| # | 원칙 | 출처 |
|---|---|---|
| 1 | **선언 → 런타임 방향성.** sim 은 선언과 순수 물리만. sim 이 renderer/host 내부를 직접 참조하지 않는다 | FACET 원칙 1 |
| 2 | **DSL 최소성 · 선언 우선.** 호스트가 보는 것은 `{aperi21:<id>}` 뿐. 화면에 뜨는 모든 것(치수·문자·시작 시점)은 선언에 둔다 | 인사이트 §2 |
| 3 | **레지스트리 경유 · 단일 인스턴스.** `register*`/`get*` 만 쓰고, registry 를 담은 패키지를 번들에 inline 하지 않는다 | 인사이트 §1-1 |
| 4 | **프리미티브는 어휘, 탈출구는 1급.** 표준 primitive 우선, 표현 불가하면 sim 이 자기 stage 를 그린다. **공유 프리미티브를 선제적으로 만들지 않는다 — 두 번째 사례가 나온 뒤에** | 인사이트 §3 |
| 5 | **색과 문자는 토큰·키로만.** 색은 theme 경유, 문자는 키 경유. 코드 리터럴 금지 | 인사이트 §2-1 |
| 6 | **임베드는 글의 흐름을 흔들지 않는다.** 마운트 후 높이 불변 · 인스턴스 독립 · destroy 완전 정리 | 인사이트 §2-2 + 우리 커밋 `fae3f35` |

6번은 FACET 에 없는 **우리 고유 원칙**이다. `fae3f35`("카메라·시간 엔진을 임베드
인스턴스별로 분리")에서 이미 겪은 사고를 격상한 것 — 지침의 *"기존 코드에서 이미 따르고
있는 좋은 패턴을 원칙으로 격상"* 에 해당한다.

### Concerns — 5개 (지침 권고 3~5)

| ID | 이름 | 근거 |
|---|---|---|
| C1 | 화면 문자 리소스 (3층 조회 + 표식/문안 판정) | FACET C10, 인사이트 §2-1 |
| C2 | 색·치수 토큰 경계 (hex/px 리터럴 금지) | FACET S-view, 인사이트 §2-2 |
| C3 | 패키지 공개 API 경계 (index.ts 경유) | FACET C7 |
| C4 | 참조 문자열 정합 (`aperi21:<id>`·primitive 이름 ↔ 실제 등록명) | FACET C4 |
| C5 | 리소스 수명 (RAF·타이머·리스너 정리, 인스턴스 독립) | 우리 `fae3f35`, FACET S-view |

C1 의 **표식/문안 판정 4단계는 반드시 포함**한다. 우리는 `m/s²`·`EMF`·`KE`/`PE`·`y_max`
가 전부 표식이라, 판정표 없이 시작하면 수식까지 번역 키로 만들어 화면이 망가진다.

### Specifics — 3개 + 예약 1

| ID | 범위 | 근거 |
|---|---|---|
| S-sim | `sims/*/*/src/**` 파일 구성 규약 | FACET S-facet |
| S-host | `host-tiptap`·`bootstrap`·`host-tiptap-bundle` 의존 방향 · lazy 보존 · 단일 인스턴스 · 발행 게이트 | FACET S-host + 인사이트 §1 |
| S-render | `host/src/renderer/**` · plugin 렌더러 · theme 계약 · 캔버스 치수 | FACET S-view + 인사이트 §2-2, §3 |
| (예약) S-piece | 첫 조각 제작 시 승격 | 갈래 C |

---

## 3. 규칙 작성 규범

지침의 작성 원칙에 더해, FACET 규칙을 읽으며 관찰한 것 하나를 추가한다.

> FACET 의 규칙 조항에는 **위반이 발견된 실제 사건이 근거로 붙어 있다.**
> — *"38곳이 갈렸고 그중 하나가 폭을 CSS 로만 줘서 300px 로 떨어져 그림이 절반 아래로 눌렸다"*
> — *"reset 이 29곳에 쓰이는 동안 라벨이 세 갈래로 어긋나 있었다"*
> — *"열하나가 이 함정에 빠졌고 일곱은 발견되지 않은 채 커밋됐다"*

**규칙이 훈계가 아니라 사고 기록이다.** 각 MUST 에 근거를 단다 — 우리 커밋이든, FACET
사건이든, 이번 감사에서 나온 위반이든. **근거 없는 조항은 쓰지 않는다.**

그리고 **규칙 → 회귀 테스트 승격** (인사이트 §5-2). 다음 셋은 타입도 통과하고 예외도
안 나는 종류라 테스트로만 잡힌다. Track E 에서 고정한다.

- 마운트 후 캔버스 높이 불변 (원칙 6)
- 임베드 인스턴스 독립 (원칙 6, `fae3f35` 재발 방지)
- 발행 tarball 에 `src`·workspace 프로토콜 누출 0 (S-host)

---

## 4. Phase 별 실행 계획

| # | 내용 | 산출물 | 세션 |
|---|---|---|---|
| **0** | CI 에 typecheck+test 게이트, ESLint 미도입 결정 명문화 | `.github/workflows`, CLAUDE.md | 0.5 |
| **1** | 구조 파악 + 패턴/안티패턴 탐색 | `rules/_analysis.md` | 1 |
| **2-3a** | principles.md + INDEX.yaml 골격 + C1~C5 | `rules/` 절반 | 1 |
| **2-3b** | S-sim / S-host / S-render + INDEX 트리거 완성 | `rules/` 완성 | 1 |
| **4** | AUDIT-v1 전수 감사 (배치 2개) | `rules/_audit-v1.md` | 1~2 |
| **5** | 리팩토링 Track A~F | 코드 + `_audit-v2.md` | 3~4 |
| **6** | rule-guard + CLAUDE.md 지침 + compaction 훅 | `.claude/` | 0.5 |
| **7** | Baden 연동 (판단 후) | CLAUDE.md | 0.5 |

### Phase 5 Track 분할

| Track | 내용 | 인사이트 · 권고 |
|---|---|---|
| **A** 기계적 | 색 hex → theme 토큰, 참조 문자열 정합, import 경로 정리 | C2·C3·C4 위반 |
| **B** 구조 (Critical) | `@aperi21/host`+schema 발행 승격 → 번들에서 external+peer | §1-1 · 권고 1 |
| **C** 선언 승격 | `canvas.height`·`autoStart` 스키마화, 문자열 3층 조회, React 삼항식 제거 | §2-1·2-2 · 권고 3·4 |
| **D** 계층 신설 | `sims/*/src/<name>-stage.ts` 자유 렌더 계층 → S-render 조항 승격 | §3 · 권고 5 |
| **E** 게이트 | 발행 전 `pnpm pack` 검증 + 회귀 테스트 3종 | §1-4·§5-2 · 권고 2 |
| **F** | AUDIT-v2 (Critical 0 · High 0 목표) | — |

**Track B·E 는 다음 릴리스 전에 끝나야 한다** (인사이트 §7). Track B 를 감사가 Critical 로
자동으로 물어 오게 설계했으므로 규칙 부트스트랩과 릴리스 준비가 한 흐름이 된다.

---

## 5. 위험

- **규칙 인플레이션** — Concern 5 · Specific 3 상한을 넘기지 않는다. 넘길 만한 것이 생기면
  기존 규칙에 조항으로 넣거나, 그 규칙을 쪼갤 근거가 쌓였는지 먼저 따진다.
- **FACET 규칙 복사** — 어휘가 아니라 판정 기준을 옮긴다. 우리 코드에 대상이 없는 조항은
  쓰지 않는다 (갈래 B·C).
- **감사 피로** — AUDIT-v1 에서 위반이 많이 나오는 것은 설계된 결과다. Critical/High 만
  Phase 5 대상으로 삼고 Medium/Low 는 다음 라운드로 미룬다.

---

## 6. 체크리스트

```
Phase 0: 통과 바
  [x] CI typecheck + test 게이트
  [x] CLAUDE.md 에 ESLint 미도입 결정 명문화

Phase 1: 프로젝트 분석
  [ ] 구조 파악 (사전 실측 §0 으로 갈음)
  [ ] 패턴/안티패턴 탐색
  [ ] rules/_analysis.md 작성

Phase 2-3: 규칙 작성
  [ ] principles.md (6개)
  [ ] concerns C1~C5
  [ ] specifics S-sim / S-host / S-render
  [ ] INDEX.yaml 트리거 매핑

Phase 4: 초기 감사
  [ ] AUDIT-v1 배치 1 (Principles + Concerns)
  [ ] AUDIT-v1 배치 2 (Specifics)
  [ ] 예외 판정 · 준수율 산출

Phase 5: 리팩토링
  [ ] Track A 기계적
  [ ] Track B 레지스트리 분리 (Critical)
  [ ] Track C 선언 승격
  [ ] Track D 렌더 계층 신설
  [ ] Track E 발행 게이트 + 회귀 테스트
  [ ] Track F AUDIT-v2

Phase 6: Rule Guard
  [ ] .claude/agents/rule-guard.md
  [ ] CLAUDE.md Rule Guard 지침
  [ ] compaction 훅

Phase 7: Baden (판단 후)
  [ ] 연동 여부 결정
```
