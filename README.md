# aperi21 — 물리 카탈로그 인덱스

aperi21의 29개 묶음 카탈로그를 조망하는 정적 웹사이트.

LLM이 생성한 물리 설명문 안에 `{physics:...}` DSL로 끼어드는 인터랙티브 시각화의 전체 지도이며, 현재는 SOON 플레이스홀더로 자리만 마련되어 있다. 실제 시각화는 추후 별도 npm 패키지(예: `@aperi21/projectile`)로 구현되어 이 웹사이트에 통합될 예정이다.

## 개발

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build → dist/
npm run preview    # 프로덕션 빌드 미리보기
npm run typecheck  # 타입 체크만
```

## 기술 스택

- **빌드**: Vite 5
- **프레임워크**: React 18 + TypeScript
- **스타일**: CSS Modules + CSS custom properties (Tailwind 미사용)
- **라우팅**: React Router (HashRouter — GitHub Pages SPA 호환)
- **i18n**: react-i18next (스캐폴드만, 실제 전환은 비활성)
- **테마**: CSS variables + React Context (라이트/다크, localStorage 영속)

## 프로젝트 구조

```
src/
├── main.tsx               # 진입점
├── App.tsx                # 라우터 + 프로바이더
├── data/
│   ├── catalog.json       # 카탈로그 원본 (읽기 전용)
│   └── catalog.ts         # 타입된 접근자
├── pages/
│   ├── HomePage.tsx       # 카탈로그 인덱스
│   ├── BundleDetailPage.tsx  # 묶음 상세 (SOON 플레이스홀더)
│   └── NotFoundPage.tsx   # 404
├── components/
│   ├── Header.tsx         # 로고 + 테마/언어 토글
│   ├── CategorySection.tsx   # 7개 카테고리 섹션
│   ├── BundleSection.tsx  # 묶음 서브섹션
│   ├── PhenomenonCard.tsx # 개별 현상 카드 (SOON/READY)
│   └── Badge.tsx
├── theme/
│   ├── ThemeProvider.tsx  # 라이트/다크 Context
│   └── tokens.css         # CSS 변수 토큰
├── i18n/
│   ├── index.ts           # react-i18next 초기화
│   ├── ko.json            # 한국어 (기본, 웹사이트 UI)
│   └── en.json            # 영어 (시각화용 예시 키)
├── types/
│   └── catalog.ts         # 엄격 타입 정의
└── styles/
    └── global.css
```

## 배포

`main` 브랜치에 push 하면 `.github/workflows/deploy.yml` 워크플로우가 자동 실행되어 GitHub Pages 에 배포된다.

- 레포지토리 → Settings → Pages → Source 를 **GitHub Actions** 로 설정해야 한다.
- `vite.config.ts` 의 `base: '/aperi21/'` 는 레포명 기준이다. 레포명이 다르면 이 값을 수정한다.
- `HashRouter` 를 사용하므로 SPA 라우팅이 404 없이 동작한다.

배포 URL (레포명이 `aperi21` 기준):

```
https://<사용자명>.github.io/aperi21/
```

## 카탈로그 데이터

`src/data/catalog.json` 은 이 프로젝트에서 읽기 전용이다. 원본은 `tasks/aperi21-catalog.json` 에 있으며, 스키마는 `src/types/catalog.ts` 에 정의되어 있다.

현재 모든 29개 묶음은 SOON 상태이다. 시각화가 추가되면 `src/data/catalog.ts` 의 `IMPLEMENTED_BUNDLE_IDS` 에 해당 묶음 ID를 등록한다.

## 작업 범위 — 하지 않는 것

이 레포는 **카탈로그 인덱스 웹사이트만 담는다.** 시각화 엔진, 물리 시뮬레이션, 인터랙티브 임베드는 별도 패키지로 분리된다. 실제 시각화 컴포넌트는 이 레포에 추가하지 않는다.

## 다국어

웹사이트 UI 자체는 한국어 고정이다. 언어 토글 버튼은 `KO` 로 표시되며 이번 단계에서 실제 전환은 일어나지 않는다. `react-i18next` 인프라는 향후 시각화 컴포넌트가 `useTranslation()` 훅으로 다국어 키에 접근할 수 있도록 준비해둔 것이다.

`src/i18n/en.json` 은 예시 키만 담고 있으며, 실제 시각화 번역은 각 시각화 패키지가 추가될 때 확장한다.
