# aperi21

글 한복판에 끼워 넣는 **인터랙티브 물리 시각화**와 그 카탈로그 웹사이트를 담는 pnpm workspace 모노레포다.

LLM 이 쓴 설명문 안에 `{aperi21:<id>}` 토큰을 두면, 그 자리에 한 가지 주장을 하는 작은 그림 — **조각** — 이 뜬다.
조각은 글의 문단 하나가 고르는 크기이고, 누르지 않아도 스스로 진행해 할 말을 마친다.

- **조각 445개** — 물리 주제 하나에 조각 하나, 조각 id 가 주제 id 다.
- **11분과** — 운동학 · 뉴턴 역학 · 일·에너지·운동량 · 회전과 진동 · 중력과 천체 · 유체 · 열과 통계 · 파동과 음향 · 광학 · 전자기 · 현대물리.
- **열 언어** — `ko` · `en` · `ja` · `zh` · `ar` · `es` · `fr` · `hi` · `id` · `pt`. 조각 화면 문자열 · 카탈로그 · 조작기 문구가 모두 채워져 있다.
- 다루는 것은 **물리**다. 이유는 [`CLAUDE.md`](./CLAUDE.md) 「도메인 — 물리」.

## npm 패키지

외부 호스트(노트 에디터 등)가 쓰는 세 패키지를 같은 버전으로 발행한다. 변경 내역은 [`CHANGELOG.md`](./CHANGELOG.md).

| 패키지 | 역할 |
| --- | --- |
| [`@aperi21/host`](./packages/host) | 시각화 런타임과 번들 레지스트리. 호스트가 하나를 설치해 공유한다 |
| [`@aperi21/host-tiptap-bundle`](./packages/host-tiptap-bundle) | Tiptap 확장 + 조각 445개(조각마다 lazy chunk) + 언어별 카탈로그 · 문구. `@aperi21/host` 는 peer |
| [`@aperi21/authoring`](./packages/authoring) | 호스트의 LLM 글쓰기 파이프라인이 조각을 고르고 설명하는 데 쓰는 개념 메타. 의존 0 |

```bash
npm install @aperi21/host-tiptap-bundle @aperi21/host @tiptap/core@^3 @tiptap/pm@^3
```

쓰는 법은 [`packages/host-tiptap-bundle/README.md`](./packages/host-tiptap-bundle/README.md).

## 저장소 구조

```
aperi21/
├── apps/catalog/          # 카탈로그 웹사이트 (@aperi21/catalog)
├── sims/<category>/<id>/  # 조각 445개. 한 조각 = 한 패키지(@aperi21/sim-<id>), 파일 여섯 + NOTES.md
├── packages/              # 스키마 · 런타임 · 도메인 plugin · 부팅 · Tiptap 어댑터 · 발행 번들 — packages/README.md
├── docs/
│   ├── topics/            # 주제 목록의 원본(topics.yaml)과 그 원칙(README.md)
│   ├── i18n/glossary.md   # 열 언어 번역 용어집
│   └── 01~08              # 초기 설계 문서 (기록)
├── rules/                 # 구현 규칙 — principles.md · concerns/ · specifics/ · INDEX.yaml
├── scripts/               # 생성기 · 게이트 · 조각 촬영 보고서
└── tasks/                 # 작업 기록 (조각 제작 · 간극 장부 · 설명 전수 대조 …)
```

`sims/` 의 폴더 이름(`kinematics` · `mechanics` · `oscillation` · `astro` · `fluids` · `thermal` · `waves` · `optics` · `em` ·
`electronics` · `modern`)은 조각을 담는 자리일 뿐이고, 사이트와 카탈로그의 분과는 `docs/topics/topics.yaml` 의 11분과가 정한다.

## 요구 사항

- Node.js 20+
- pnpm 10 (`packageManager` 가 `pnpm@10.27.0` — `corepack enable` 이면 맞는 버전이 잡힌다)

## 개발

```bash
pnpm install
pnpm dev                 # 카탈로그 개발 서버 (http://localhost:5173/aperi21/)
pnpm build               # 카탈로그 프로덕션 빌드 → apps/catalog/dist
pnpm preview             # 빌드 미리보기
```

### 통과 바

코드를 바꾼 뒤에는 CI 와 같은 셋을 통과시킨다. ESLint 는 두지 않는다 — 기계적 검증은 `tsc strict`, 그 위는 `rules/` 가 맡는다.

```bash
pnpm gen:check           # 생성물이 원본과 맞는지 (아래 「원본과 생성물」)
pnpm -r typecheck
pnpm test
```

`pnpm -r` 은 패키지마다 프로세스를 띄우므로 포어그라운드로 돌린다.

### 원본과 생성물

원본은 조각 선언(`sims/**`), 주제 목록(`docs/topics/topics.yaml`), 개념 메타(`packages/authoring/src/concepts/`),
번역(`messages/<locale>.json`)이다. 레지스트리 · 카탈로그 · 조각의 한 줄 설명 · 사이트 데이터는 모두 생성물이고 커밋한다.

```bash
pnpm gen:all             # 생성기 10종을 순서대로 돌려 생성물을 다시 만든다
pnpm gen:check           # 다시 만들었을 때 바뀌는 것이 있으면 실패
```

조각의 한 줄 설명(카탈로그의 `description`)은 `topics.yaml` 의 `desc` 에서 온다 — 설명을 고치려면 `desc` 를 고치고
`gen:all` 을 돌린다. 조각을 새로 더했으면 `gen:all` 뒤에 `pnpm install` 을 한 번 더 한다.

### 조각 촬영

```bash
pnpm piece:report --sims=http://localhost:5173/aperi21/ <id>   # pnpm dev 로 띄운 주소
```

카탈로그 dev 서버에서 조각을 `?t=` 시각별로 열어(`tasks/piece-lab/<id>/inventory.json` 의 시각) 라이트 · 다크 스크린샷을 찍는다. 조각을 만들거나 고친 뒤 주장이 화면에서
서는지 판정하는 데 쓴다.

## 카탈로그 웹사이트 (`apps/catalog`)

- 첫 화면 — 11분과와 그 아래 주제 445개. 주제마다 조각이 있다.
- 주제 화면(`#/topic/<id>`) — 조각 하나를 띄운다.
- 에디터 데모(`#/editor-demo`) — 분과마다 조각 하나를 Tiptap 에디터 안에 띄워, 외부 호스트가 쓰는 모습을 보인다.
- Vite 5 · React 18 · TypeScript · CSS Modules · React Router(HashRouter) · 라이트 / 다크 테마.
- 사이트 데이터 `apps/catalog/src/data/catalog.json` 은 `topics.yaml` 에서 만든 생성물이라 손으로 고치지 않는다.
- 사이트 UI 는 한국어 고정이다. 머리의 `KO` 단추는 아직 언어를 바꾸지 않는다(조각 자체는 열 언어를 갖는다).

## 배포

- **npm** — 세 패키지를 lockstep 으로 발행한다. 절차와 게이트(`gen:check` · typecheck · test · `release:check` · 규칙 감사)는
  [`CLAUDE.md`](./CLAUDE.md) 「Release」.
- **카탈로그 사이트** — `main` 에 push 하면 `.github/workflows/deploy.yml` 이 게이트를 통과시킨 뒤 GitHub Pages 에 올린다.
  저장소 Settings → Pages → Source 가 **GitHub Actions** 여야 한다(지금은 설정되어 있지 않아 배포 단계가 실패한다).
  `apps/catalog/vite.config.ts` 의 `base: '/aperi21/'` 가 저장소 이름에 맞춰져 있다.

## 라이선스

[MIT](./LICENSE)
