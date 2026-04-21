# aperi21

aperi21의 29개 묶음 카탈로그 웹사이트와 향후 추가될 시각화 엔진 패키지를 함께 담는 **pnpm workspace 모노레포**다.

LLM이 생성한 물리 설명문 안에 `{physics:...}` DSL로 끼어드는 인터랙티브 시각화의 전체 지도이며, 현재 카탈로그는 SOON 플레이스홀더로 자리만 마련되어 있다. 실제 시각화는 `packages/` 하위의 엔진 패키지들로 단계별로 추가된다.

## 저장소 구조

```
aperi21/
├── apps/
│   └── catalog/          # 카탈로그 인덱스 웹사이트 (@aperi21/catalog)
├── packages/             # 엔진 패키지 (Phase 1부터 추가)
├── docs/                 # 설계 문서 (01~08)
├── prompts/              # 작업 프롬프트
├── pnpm-workspace.yaml
├── tsconfig.base.json    # workspace 공통 TS 설정
└── package.json          # workspace 루트 scripts
```

앞으로 추가될 패키지 목록은 `packages/README.md` 참고.

## 요구 사항

- Node.js 20+
- pnpm 10.x (`corepack enable` 혹은 직접 설치)

## 개발

```bash
pnpm install          # 전체 workspace 의존성 설치
pnpm dev              # apps/catalog 개발 서버 (http://localhost:5173)
pnpm build            # apps/catalog 프로덕션 빌드 → apps/catalog/dist
pnpm build:all        # 모든 패키지 빌드
pnpm preview          # 프로덕션 빌드 미리보기
pnpm typecheck        # 모든 패키지 타입 체크
```

특정 패키지만 작업할 때는 `pnpm --filter <이름> <script>` 형태로 호출한다.

```bash
pnpm --filter @aperi21/catalog build
```

## 기술 스택 (catalog)

- **빌드**: Vite 5
- **프레임워크**: React 18 + TypeScript
- **스타일**: CSS Modules + CSS custom properties
- **라우팅**: React Router (HashRouter — GitHub Pages SPA 호환)
- **i18n**: react-i18next (스캐폴드만)
- **테마**: CSS variables + React Context (라이트/다크)

## 배포

`main` 브랜치에 push 하면 `.github/workflows/deploy.yml` 워크플로우가 자동 실행되어 GitHub Pages 에 배포된다.

- 레포지토리 → Settings → Pages → Source 를 **GitHub Actions** 로 설정해야 한다.
- `apps/catalog/vite.config.ts` 의 `base: '/aperi21/'` 는 레포명 기준이다.
- `HashRouter` 를 사용하므로 SPA 라우팅이 404 없이 동작한다.

배포 URL (레포명이 `aperi21` 기준):

```
https://<사용자명>.github.io/aperi21/
```

## 카탈로그 데이터

`apps/catalog/src/data/catalog.json` 은 읽기 전용이다. 스키마는 `apps/catalog/src/types/catalog.ts` 에 정의되어 있다.

현재 모든 29개 묶음은 SOON 상태이다. 시각화가 추가되면 `apps/catalog/src/data/catalog.ts` 의 `IMPLEMENTED_BUNDLE_IDS` 에 해당 묶음 ID를 등록한다.

## 다국어

카탈로그 웹사이트 UI 자체는 한국어 고정이다. 언어 토글은 `KO` 로 표시되며 이번 단계에서 실제 전환은 일어나지 않는다. `react-i18next` 인프라는 향후 시각화 컴포넌트가 `useTranslation()` 훅으로 다국어 키에 접근할 수 있도록 준비해둔 것이다.
