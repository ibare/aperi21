# aperi21

pnpm workspace 모노레포. `{aperi21:<id>}` DSL로 끼어드는 인터랙티브 시각화의 카탈로그
웹사이트(`apps/catalog`)와 시각화 엔진 패키지(`sims/<category>/<name>/`, `packages/`)를 담는다.

- 요구 사항: Node.js 20+, pnpm 10.x
- 워크스페이스: `apps/*`, `packages/*`, `sims/*/*`

## 외부 호스트 소비 정책

methii 등 외부 호스트 소비자 프로젝트는 **read-only** — 직접 수정·커밋 금지.
수정 권한은 이 aperi21 저장소 내부에 한정한다.

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
