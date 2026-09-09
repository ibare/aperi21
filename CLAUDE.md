# aperi21

pnpm workspace 모노레포. `{aperi21:<id>}` DSL로 끼어드는 인터랙티브 시각화의 카탈로그
웹사이트(`apps/catalog`)와 시각화 엔진 패키지(`sims/<category>/<name>/`, `packages/`)를 담는다.

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
  concerns/C1~C5.md          ← 관심사 5 (Tier 2)
  specifics/S-*.md           ← 도메인 3 (Tier 3)
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

## Release (npm 배포)

배포 대상은 **`@aperi21/host-tiptap-bundle` (public) 하나**다. 이 번들은 self-contained
ESM이라 내부 `@aperi21/*` 패키지를 모두 inline하므로 나머지 패키지는 `private: true`로
유지한다. `@tiptap/core`·`@tiptap/pm`만 peerDependencies로 외부에 남긴다.

변경 → 배포 절차:

1. `pnpm --filter @aperi21/host-tiptap-bundle typecheck`
2. semver 결정 (patch/minor/major)
3. `cd packages/host-tiptap-bundle && npm version <type> --no-git-tag-version`
4. `git commit -m "chore(release): host-tiptap-bundle <ver>"`
5. `git tag host-tiptap-bundle@<ver>` (예: `host-tiptap-bundle@0.2.0`)
6. `pnpm --filter @aperi21/host-tiptap-bundle publish --no-git-checks`
   — `prepack` 스크립트가 빌드를 자동 수행한다.
7. `git push && git push --tags`
8. `npm view @aperi21/host-tiptap-bundle version` 으로 확인.
   신규 publish 직후 GET(읽기) 전파는 최대 ~2분 지연될 수 있다(쓰기는 즉시 반영).
   조회 404여도 `E403 (cannot publish over previously published)` 이면 배포는 성공한 것.

인증·주의:

- 인증은 `~/.npmrc`의 Granular token(`@aperi21` 스코프 write)으로 OTP를 우회한다.
  토큰은 어떤 리포에도 커밋 금지. 계정 2FA는 security key 방식이라 CLI OTP가 없다.
- publish 대상 패키지의 `dependencies`에는 `workspace:*`를 두지 말 것
  (번들은 inline이라 무관하나, 향후 다른 패키지 배포 시 실버전 치환 누락에 주의).
- 향후 패키지가 늘면 GitHub Actions + npm Trusted Publishing(OIDC) 도입 검토 — 장기 토큰 불필요.
