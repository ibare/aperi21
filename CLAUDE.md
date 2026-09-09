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
