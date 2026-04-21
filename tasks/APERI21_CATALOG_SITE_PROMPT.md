# aperi21 카탈로그 웹사이트 구현 프롬프트

## 이 문서의 목적

이 문서는 **aperi21 카탈로그 인덱스 웹사이트**를 구현하기 위한 지시서다.
aperi21 프로덕트의 **시각화 엔진이나 임베드 자체를 만드는 것이 아니라**, 카탈로그를 조망하고 향후 시각화들이 추가될 자리를 마련하는 **정적 인덱스 웹사이트**를 만든다.

## 중요 — 작업 범위

### 이번 작업에 포함되는 것
- 카탈로그 JSON을(tasks/aperi21-catalog.json) 읽어 인덱스 페이지를 렌더링하는 정적 웹사이트
- 다국어 (한/영) 스캐폴드 — 웹사이트 UI는 한국어 고정, 향후 시각화 컴포넌트에 주입될 다국어 시스템만 준비
- Dark/Light 테마
- GitHub Pages 배포 설정, push 하면 action 이 배포 워크플로우를 작동시켜 배포되는 방식.

### 이번 작업에 포함되지 않는 것
- **aperi21 시각화 엔진 구현 금지.** 카탈로그 웹사이트를 먼제 구현 후 추후 본체는 구현할 예정임.
- **실제 물리 시뮬레이션 컴포넌트 구현 금지.** 모든 항목은 현재 SOON 상태이며, 향후 별도 패키지로 추가될 것이다.
- 시각화 상세 페이지의 실제 내용은 만들지 않는다. 라우트만 정의하고 "곧 공개" 플레이스홀더를 둔다.

---

## aperi21 맥락

aperi21은 글로 된 물리 설명 콘텐츠 안에 삽입되는 인터랙션 도구다. LLM이 생성한 설명문 안에 `{physics:...}` 형태의 DSL로 임베드가 들어가고, 그 자리에 파라미터를 조작할 수 있는 인터랙티브 시각화가 렌더된다. 29개의 묶음(bundle)으로 구성되며, 각 묶음은 공통된 조작 언어와 시간 모델을 공유하는 물리 현상들의 집합이다.

이 웹사이트는 그 카탈로그를 사람이 볼 수 있는 형태로 제공한다. 개발 진행도 추적, 시각화 탐색, 향후 데모 진입점의 역할을 한다.

---

## 레퍼런스 프로젝트

**FACET** 프로젝트를 참고할 것.

경로: `/Users/mintae/Documents/Develop/side-projects/FACET`

FACET은 같은 저자의 CS 개념 시각화 제품이다. aperi21은 FACET의 웹사이트 구조를 직접적 참고 모델로 삼는다. 특히 다음 요소들을 FACET과 일관되게 구현할 것:

- 랜딩 페이지의 카탈로그 인덱스 레이아웃 (3단 그리드, 카테고리별 섹션, 구현/예정 구분)
- 상단 헤더 (로고 + 테마 토글 + 언어 토글)
- 타이포그래피와 여백 감각
- 카드·배지·섹션 확장/축소 인터랙션
- 다크/라이트 테마 토큰 체계

**단, FACET 코드를 그대로 복사하지 말 것.** 패턴을 참고하되 aperi21의 정체성을 가진 독립 프로젝트로 구축한다. 색상과 분위기는 aperi21에 맞게 새로 조정한다 (물리·과학 에디토리얼 톤).

구현 전 FACET의 다음 파일들을 반드시 확인:
- `src/App.tsx` (또는 루트 컴포넌트) — 전체 레이아웃
- 카탈로그 렌더링 컴포넌트
- 테마 프로바이더
- i18n 설정
- `vite.config.ts` — 빌드 설정
- `.github/workflows/` — 배포 워크플로우
- `package.json` — 의존성 목록

---

## 기술 스택

- **빌드**: Vite
- **프레임워크**: React 18 + TypeScript
- **스타일**: CSS Modules 또는 CSS with custom properties (Tailwind 금지 — FACET 스타일 일관성)
- **라우팅**: React Router (HashRouter 권장 — GitHub Pages 호환)
- **i18n**: react-i18next
- **테마**: CSS variables + React Context
- **배포**: GitHub Actions → GitHub Pages

FACET이 다른 스택을 쓰고 있다면 FACET을 따를 것.

---

## 카탈로그 데이터

카탈로그 JSON 파일을 `src/data/catalog.json`에 배치할 것. 파일은 이미 생성되어 있으며 다음 구조를 가진다:

```json
{
  "version": "0.1",
  "categories": { "mechanics": "역학", ... },
  "timeModels": { ... },
  "bundles": [
    {
      "id": "projectile",
      "label": "발사체",
      "category": "mechanics",
      "operation": "각도 다이얼 + 핀볼 런처",
      "timeModel": "linear",
      "parameters": [...],
      "stages": [...],
      "environments": [...],
      "phenomena": ["포물선 운동", "자유낙하", ...],
      "embedEstimate": { "min": 20, "max": 30 }
    },
    ...
  ],
  "summary": { ... }
}
```

이 JSON은 이 프로젝트에서 **읽기 전용**이다. 수정하지 말 것.

---

## 프로젝트 구조

```
aperi21-catalog/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Pages 배포
├── public/
│   └── (favicon 등)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── data/
│   │   └── catalog.json         # 카탈로그 (여기 배치)
│   ├── pages/
│   │   ├── HomePage.tsx         # 카탈로그 인덱스
│   │   └── BundleDetailPage.tsx # 묶음 상세 (SOON 플레이스홀더)
│   ├── components/
│   │   ├── Header.tsx           # 로고 + 테마 토글 + 언어 토글
│   │   ├── CategorySection.tsx  # 카테고리별 섹션 (확장/축소)
│   │   ├── BundleSection.tsx    # 묶음 서브섹션
│   │   ├── PhenomenonCard.tsx   # 개별 현상 카드 (구현/SOON)
│   │   └── Badge.tsx
│   ├── i18n/
│   │   ├── index.ts             # i18n 초기화
│   │   ├── ko.json              # 한국어 (기본)
│   │   └── en.json              # 영어 (시각화용 키 정의)
│   ├── theme/
│   │   ├── ThemeProvider.tsx
│   │   └── tokens.css           # CSS variables
│   ├── types/
│   │   └── catalog.ts           # 카탈로그 타입 정의
│   └── styles/
│       └── global.css
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 페이지 요구사항

### 1. 홈 페이지 (`/`)

**FACET의 홈 페이지를 구조 모델로 삼아 구현할 것.** 레이아웃·상호작용은 그와 동등한 수준으로 완성도 있게.

구성 요소:

1. **상단 헤더**
   - 좌측: aperi21 로고 (텍스트 또는 심볼)
   - 우측: 테마 토글 (달/태양 아이콘), 언어 토글 ("KO"로 고정 표시 — 이번 단계에서 실제 전환 없음)

2. **히어로 섹션**
   - 대제목 (예: "물리 세상의 현상을 / 직접 만지는 형태로")
   - 서브 설명 한두 문장 (카탈로그 범위 설명)
   - 구현/예정 배지 (현재는 "0개 구현 완료" · "29개 묶음 예정" 등)

3. **카탈로그 인덱스**
   - 7개 카테고리(역학·파동·광학·열역학·전자기·유체·현대물리) 각각 섹션
   - 각 섹션은 확장/축소 가능 (기본 확장)
   - 섹션 안에 해당 카테고리의 묶음들이 서브섹션으로 나열
   - 각 서브섹션(묶음)은 3단 그리드로 해당 묶음의 `phenomena` 배열을 카드로 표시
   - 모든 카드는 현재 **"SOON" 상태** (락 아이콘 + "SOON" 라벨)
   - 각 카드 클릭 시 `/bundle/:bundleId` 로 이동 (현재는 플레이스홀더 페이지)

배지/카운트 처리:
- 카테고리 섹션 헤더에 `x/N` 표기 (구현/전체). 현재는 `0/N`
- 묶음 서브섹션 헤더에 해당 묶음 내 현상 수 표시

### 2. 묶음 상세 페이지 (`/bundle/:bundleId`)

이번 단계에서는 최소 구현:
- 상단 뒤로가기 링크
- 묶음 메타 정보 (라벨, 카테고리, 조작 언어, 시간 모델, 포함 현상 목록)
- 큰 "곧 공개" 플레이스홀더 (시각화가 들어갈 자리)
- 파라미터·스테이지·환경 목록을 정보성 표시

실제 시각화 임베드는 만들지 않는다.

### 3. 404 페이지

단순한 "페이지를 찾을 수 없음" 표시. 홈으로 돌아가기 링크.

---

## 공통 기능

### 다국어 (i18n)

**핵심 제약**: 웹사이트 UI 자체는 한국어 고정이다. 이번 단계에서 언어 전환 기능은 실질적으로 동작하지 않지만, **향후 시각화 컴포넌트가 다국어 키를 사용할 수 있도록 인프라만 준비**한다.

- `react-i18next` 설치 및 초기화
- `src/i18n/ko.json`, `src/i18n/en.json` 생성
- 웹사이트 UI 문자열은 `ko.json`에 들어가되 실제 언어 전환은 이 단계에서 하지 않음
- 언어 토글 버튼은 UI 상 "KO" 표기로 고정 (클릭 시 동작 없음, 또는 콘솔 로그)
- 향후 시각화 컴포넌트가 `useTranslation()` 훅으로 접근할 수 있는 기반만 마련

`en.json`에는 예시로 기본 키 몇 개만 정의해두고, 실제 시각화가 추가될 때 확장하도록 주석으로 명시.

### 테마

- Dark / Light 두 가지
- CSS variables로 토큰화: 색상, 간격, radius, 그림자 등
- `ThemeProvider`로 Context 관리
- `localStorage`에 선택 저장
- 시스템 선호 감지 (`prefers-color-scheme`) — 초기값으로
- 테마 토글 버튼으로 전환

aperi21 톤 제안 (최종 결정은 구현자 재량):
- Light: 크림/오프화이트 계열 (#F5F1E8 근처) + 암청색 잉크 (#1A2332)
- Dark: 딥 네이비 또는 검정 + 크림/따뜻한 흰색
- 액센트 색: 빨강 (#C73E3A) — aperi21의 시그니처

물리·에디토리얼 톤을 유지하되 FACET과 겹치지 않는 고유성을 확보할 것.

### 타이포그래피

세리프 + 모노 조합 (FACET 스타일과 같은 계열이되 개별 선택은 자유):
- 본문/제목: Newsreader, Fraunces, EB Garamond 같은 세리프
- 데이터/캡션: JetBrains Mono, IBM Plex Mono 같은 모노
- Google Fonts CDN 사용

---

## 배포

### GitHub Pages 설정

1. `vite.config.ts`에 `base` 설정 (레포명 기반)
2. `.github/workflows/deploy.yml` 생성 — main 브랜치 푸시 시 자동 빌드 & 배포
3. `BrowserRouter` 대신 `HashRouter` 사용 (GitHub Pages SPA 호환 간단)
4. `README.md`에 배포 URL 명시

워크플로우는 Node 20, pnpm 또는 npm, Vite 빌드, `actions/deploy-pages` 사용.

---

## 디자인 가이드

### 톤 & 분위기
- 에디토리얼 / 과학 저널 감성
- 정보 밀도가 높되 숨 막히지 않는 여백
- 미니멀하되 인위적으로 차갑지 않음
- aperi21의 "물리를 몸으로 느낀다"는 컨셉과 맞는 따뜻함과 신뢰성

### 레이아웃
- 최대 너비 약 1200~1320px 중앙 정렬
- 모바일 반응형은 기본 수준만 (이번 단계 필수는 아님)
- 카드 그리드는 3단 (데스크톱), 2단 (태블릿), 1단 (모바일)

### 인터랙션
- 카드 호버 시 미묘한 lift 또는 border 변화
- 섹션 접기/펴기는 부드러운 높이 애니메이션
- 테마 전환은 CSS transition으로 자연스럽게
- 과한 애니메이션은 피할 것 — 이 사이트는 조용한 카탈로그다

### 접근성
- 시맨틱 HTML (`<nav>`, `<main>`, `<section>` 등)
- 키보드 네비게이션
- 충분한 색 대비

---

## 구현 순서 제안

1. FACET 코드베이스를 먼저 확인 (`/Users/mintae/Documents/Develop/side-projects/FACET`)
2. Vite + React + TypeScript 초기 설정
3. 타입 정의 (`catalog.ts`) — JSON 스키마에 맞춰 엄격하게
4. 테마 토큰 및 Provider
5. i18n 인프라 (실제 전환은 비활성)
6. 헤더 컴포넌트
7. 홈 페이지 — 카탈로그 인덱스
8. 라우팅 및 묶음 상세 페이지 (플레이스홀더)
9. GitHub Pages 배포 설정
10. 최종 점검 — 다크/라이트 전환, 반응형, 404

---

## 제약 재확인

**Claude Code에게**: 이 작업은 카탈로그 웹사이트만 만드는 것이다. aperi21의 시각화 컴포넌트, 물리 엔진, 인터랙티브 임베드는 이번 작업에서 **절대 구현하지 않는다.** 나중에 별도 패키지로 추가될 것이다.

만약 "포물선 운동 시각화"를 만들고 싶은 충동이 든다면, 그것은 범위 밖이다. 모든 항목은 "SOON" 플레이스홀더로 유지한다.

실제 시각화는 향후 별도 npm 패키지(예: `@aperi21/projectile`)로 제작되어 이 웹사이트에 통합될 예정이다. 이번 단계에서는 그 자리를 마련해둘 뿐이다.

---

## 완료 기준

- [ ] `npm run dev`로 로컬 개발 서버 실행 가능
- [ ] `npm run build`로 프로덕션 빌드 성공
- [ ] 홈 페이지에 29개 묶음이 7개 카테고리로 분류되어 표시됨
- [ ] 모든 현상 카드가 SOON 상태로 표시됨
- [ ] 다크/라이트 테마 전환 동작
- [ ] 언어 토글 UI 존재 (실제 전환은 이번 단계에서 비활성)
- [ ] `/bundle/:id` 라우트가 플레이스홀더 페이지 렌더링
- [ ] GitHub Actions 워크플로우 파일 포함
- [ ] README에 개발·빌드·배포 방법 기재
- [ ] FACET과 일관된 인상을 주되 aperi21 고유의 색·타이포그래피
