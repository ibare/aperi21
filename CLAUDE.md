# aperi21

pnpm workspace 모노레포. `{aperi21:<id>}` DSL로 끼어드는 인터랙티브 시각화의 카탈로그
웹사이트(`apps/catalog`)와 시각화 엔진 패키지(`sims/<category>/<name>/`, `packages/`)를 담는다.

## 도메인 — 물리

**aperi21이 다루는 것은 물리다** (2026-09-09 결정).

물리는 한 벌의 시각 언어로 도메인 전체를 덮는다 — 좌표계 하나, 시간축 하나, 그리고
물체·벡터·궤적·장이라는 공통 어휘. 화학의 결합, 생물의 계통수처럼 **좌표계 자체가 없는**
표현을 요구하는 도메인은 어휘를 새로 세워야 하므로 지금 열지 않는다.

좁힌 이유는 규모가 아니라 **판정 가능성**이다. 조각이 성립하는지를 검증하는 중에 도메인을
함께 넓히면, 실패했을 때 원인이 조각 때문인지 낯선 어휘 때문인지 가릴 수 없다.

이름(`aperi21`)과 구조(`sims/<category>/`)는 물리에 묶여 있지 않다. 넓히는 것은
되돌릴 수 있는 결정이며, 그때는 도메인마다 시각 어휘를 세우는 비용을 함께 치른다.

- 요구 사항: Node.js 20+, pnpm 10.x
- 워크스페이스: `apps/*`, `packages/*`, `sims/*/*`

## 외부 호스트 소비 정책

methii 등 외부 호스트 소비자 프로젝트는 **read-only** — 직접 수정·커밋 금지.
수정 권한은 이 aperi21 저장소 내부에 한정한다.

## 코드 품질 · 통과 바

**ESLint 를 도입하지 않는다.** 기계적 검증은 tsc `strict: true` 하나로 커버하고,
그 위의 의미·맥락 영역은 `rules/` 규칙 체계 + rule-guard 가 맡는다. 11K LOC 단일 저자
규모에서 ESLint 설정·플러그인·CI 시간의 비용이 잡아 줄 문제보다 크다는 판단이다.

이 결정의 실질적 귀결: **`rules/` 에 정적 분석이 잡을 수 있는 항목(포매팅·네이밍
컨벤션·미사용 import 등)을 쓰지 않는다.** 규칙은 tsc 가 잡을 수 없는 것 — 의존성 방향,
선언/런타임 경계, 레지스트리 경유, 문자·색 리소스 위치 — 에만 집중한다.

통과 바는 CI 와 동등하다. 코드 변경 뒤 다음을 통과시킨다.

```sh
pnpm -r typecheck
pnpm test
```

`.github/workflows/ci.yml` 이 push·PR 에서 같은 둘을 돌리고, `deploy.yml` 도 빌드 전에
같은 게이트를 통과해야 배포된다.

> 백그라운드 실행 주의 — `pnpm -r` 은 recursive 라 child 프로세스를 패키지마다 spawn 한다.
> 반드시 포어그라운드로 실행한다 (전역 CLAUDE.md 의 Background Process Safety 참조).

## 구현 규칙 (rules/)

`rules/` 에 이 프로젝트의 구현 규칙이 선언되어 있다.

```
rules/
  INDEX.yaml                 ← 트리거 레지스트리 (경로·패턴·import·이벤트)
  principles.md              ← 원칙 6 (Tier 1, 항상 로드)
  concerns/C1~C6.md          ← 관심사 6 (Tier 2)
  specifics/S-*.md           ← 도메인 4 (Tier 3)
  _analysis.md / _audit-v*.md ← 분석·감사 기록 (규칙 아님)
```

### 로딩 규약

- **`principles.md` 는 모든 작업에서 항상 로드한다.**
- 파일을 읽거나 편집할 때 `rules/INDEX.yaml` 의 trigger 에 경로·패턴·import 가 매치되면
  해당 `concerns/*` · `specifics/*` 를 추가로 로드한다.
- MUST / MUST NOT 을 침범하면 수정 제안 전에 **규칙 ID 를 명시해 경고**한다.
- PREFER / Exception 은 강제가 아니나 설계 판단의 맥락으로 참고한다.
- **규칙 파일을 추론하지 않는다. 읽고 판정한다.**

### 컴팩션 후 복원

대화 compaction 이후 `rules/principles.md` 와 `rules/INDEX.yaml` 을 우선 다시 읽어 맥락을
복구한다. `.claude/settings.json` 의 SessionStart 훅이 자동으로 둘을 출력한다.

## Rule Guard

`.claude/agents/rule-guard.md` 서브에이전트가 규칙 준수를 감사한다.

- 코드 수정 시 **두 번 호출한다** — 계획 수립 후 실행 전(사전 검토), 수정 완료 후(사후 검증).
- 사용자가 "규칙 체크" / "rule-guard" / "감사" 로 명시 호출할 수도 있다.
- rule-guard 는 코드를 고치지 않는다. 판정과 보고만 한다.
- 서브에이전트에 복합 작업을 위임하지 않는다. 작업 단위를 나눠 각각 호출한다.
- 작업 완료 보고 전에 반드시 `pnpm -r typecheck` + `pnpm test` 를 통과시킨다.

## Baden 보고

이 프로젝트는 Baden 모니터링 하에서 운영된다. **모든 행동을 해당 baden MCP 도구로 보고한다.**

- **Project Name**: `aperi21` (Baden 등록 id `bdn_HBQXRddL`, rules_path 는 이 리포의 `rules/`)

### 필수 호출

1. **사용자 지시 수신** — `baden_start_task` 로 `projectName: "aperi21"` 을 넘겨 `taskId` 를
   발급받는다. **작업 시작 전에 호출한다.** 이후 모든 `baden_*` 호출에 같은 taskId 를 쓴다.
2. **계획 수립** — 접근 방식을 정하거나 설계 판단을 내릴 때 `baden_plan`. 코드를 읽거나
   고치지 않는 사고 과정도 보고 대상이다.
3. **일반 행동** — 파일 읽기·수정·생성·검색 **실행 전에** `baden_action`.
   `action` 은 snake_case 동사로 시작한다 (`read_*` · `modify_*` · `create_*` · `search_*`).
4. **검증** — `pnpm -r typecheck` / `pnpm test` / 빌드 / `pnpm pack` 결과는 `baden_verify`.
5. **규칙 사건** — rule-guard 가 위반을 찾거나 수정을 적용하면 `baden_rule`
   (`ruleId` 는 `rules/INDEX.yaml` 의 `id` 를 그대로 — `C1`~`C6`, `S-sim`, `S-host`,
   `S-piece`, `S-render`).
6. **작업 종료** — `baden_complete_task` 에 결과를 요약해 보고한다.

### 원칙

- **보고 없이 행동하지 않는다.** 읽기·검색·테스트도 보고 후 수행한다.
- **이유를 구체적으로 쓴다.** 나중에 읽었을 때 맥락이 이해되는 수준으로.
- **소급 기록하지 않는다.** 이미 지나간 행동을 지금 올리면 발생 시각이 위조된다.
  보고를 빠뜨렸으면 그 사실을 사용자에게 말하고, 현재 열려 있는 상태만 사실로 보고한다.

### rule-guard 의 보고

서브에이전트는 MCP 도구에 접근할 수 없다(알려진 제약). rule-guard 는 Bash + HTTP 로 보고한다.

```sh
curl -s -X POST http://localhost:3800/api/events \
  -H "Content-Type: application/json" \
  -d '{"projectName":"aperi21","action":"...","reason":"...","taskId":"..."}'
```

메인 에이전트는 rule-guard 결과를 받아 위반마다 `baden_rule` 호출을 보조한다.

## Release (npm 배포)

배포 대상은 **두 패키지**이며 **lockstep** 으로 같은 버전을 함께 올린다.

| 패키지 | 역할 | 빌드 |
| --- | --- | --- |
| `@aperi21/host` | 시각화 런타임 + **번들 레지스트리**. 호스트가 단일 인스턴스로 설치 | rollup (JS + dts, 의존 0) |
| `@aperi21/host-tiptap-bundle` | Tiptap 확장 + sim/plugin 번들. host 는 peer | rollup (chunk 분리 유지) |

나머지 패키지는 `private: true` 로 유지하고 번들에 inline 한다.
`@aperi21/schema` 는 **타입 전용**(런타임 export 0건)이라 발행하지 않는다 — 타입은
빌드 시 각 발행본 `.d.ts` 에 인라인된다.

### 단일 registry 인스턴스 (이 구조의 이유)

`@aperi21/host` 는 `registerBundle`/`loadBundle` 이 공유하는 모듈 레벨 Map 을 갖는다.
번들이 host 를 inline 하면 사본이 둘이 되어 **bootstrap 이 등록한 sim 을 runBundle 이
못 찾는다.** 예외도 안 나고 타입도 통과한다. 그래서 번들은 host 를 rollup `external` +
`peerDependencies` 로 두고 호스트가 하나를 설치해 공유한다 (원칙 3, `rules/specifics/S-host.md`).

### 발행 전 게이트 (순서대로 통과)

1. `pnpm -r typecheck`
2. `pnpm test`
3. **`pnpm release:check`** — 위 넷을 자동으로 검사한다 (`src` 누출 0 · `workspace:` 잔존 0 ·
   `publishConfig` 오버라이드 적용 · **발행본 `.d.ts` 가 미발행 private 패키지를
   참조하지 않을 것**). CI 가 push·PR 마다 같은 스크립트를 돌린다.
4. rule-guard 감사 (S-host 의존 일방향 · lazy 보존 · 단일 인스턴스)

3번이 없으면 **워크스페이스에서는 멀쩡하고 발행본에서만 죽는** 사고를 못 잡는다.
0.1.0 이 실제로 그랬다 — `.d.ts` 가 미발행 `@aperi21/host-tiptap` / `@aperi21/bootstrap`
을 import 해 소비자 쪽 타입이 전부 끊겨 있었다. `rollup-plugin-dts` 의
`respectExternal: true` 로 고쳤다.

### 절차

1. 게이트 1~4 통과
2. semver 결정 — 0.x 동안 minor 를 breaking 허용 구간으로 본다
3. 두 패키지를 같은 버전으로 올린다
   ```sh
   cd packages/host && npm version <type> --no-git-tag-version
   cd packages/host-tiptap-bundle && npm version <type> --no-git-tag-version
   ```
4. `git commit -m "chore(release): aperi21 <ver>"`
5. `git tag v<ver>` (lockstep 이므로 단일 태그)
6. **peer 순서대로** 발행 — `host` 를 먼저 올려야 번들의 peer range 가 해결된다
   ```sh
   cd packages/host && pnpm publish --no-git-checks
   cd packages/host-tiptap-bundle && pnpm publish --no-git-checks
   ```
   `prepack` 이 빌드를 자동 수행한다.
7. `git push && git push --tags`
8. `npm view @aperi21/host version` / `npm view @aperi21/host-tiptap-bundle version` 확인.
   신규 publish 직후 GET(읽기) 전파는 최대 ~2분 지연될 수 있다(쓰기는 즉시).
   조회 404여도 `E403 (cannot publish over previously published)` 이면 배포는 성공한 것.

### 인증·주의

- **`pnpm publish` 만 사용한다** (`npm publish` 금지). `workspace:^` 를 npm semver 로
  변환하는 것은 pnpm 뿐이다. `npm publish` 는 프로토콜을 그대로 올려 깨진 의존을 발행한다.
- **`publishConfig` 로 src↔dist 를 분리한다.** `main`/`types`/`exports` 는 `./src/*.ts` 를
  가리켜 워크스페이스 내부는 빌드 없이 소스를 직참조하고, `publishConfig` 가 publish
  시에만 `./dist/*` 로 오버라이드한다.
- 인증은 `~/.npmrc` 의 Granular token(`@aperi21` 스코프 write)으로 OTP 를 우회한다.
  토큰은 어떤 리포에도 커밋 금지. 계정 2FA 는 security key 방식이라 CLI OTP 가 없다.
- **소비자 영향** — host 가 peer 가 되면서 번들만 설치하던 호스트는 `@aperi21/host` 를
  함께 설치해야 한다. 0.1.0 → 0.2.0 은 그 의미에서 breaking 이다.
- 향후 패키지가 늘면 GitHub Actions + npm Trusted Publishing(OIDC) 도입 검토.
