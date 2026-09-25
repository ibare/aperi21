# packages/

aperi21 의 엔진 패키지다. 조각(시각화 하나)은 여기가 아니라 저장소 루트의 `sims/<category>/<id>/` 에 있다.

의존은 한 방향이다 — **런타임(host) → 조각(sim) → 선언 타입(schema)**. 런타임은 특정 조각을 알지 않고, 조각은 렌더러를 알지
않는다. 자세한 규칙은 `rules/principles.md`.

## 발행 (npm)

세 패키지를 같은 버전으로 함께 발행한다. 나머지는 `private` 이고 발행본 안에 inline 된다.

| 패키지 | 역할 |
| --- | --- |
| `@aperi21/host` | 시각화 런타임 — Scene Graph 전처리 · Canvas 렌더러 · 시간 엔진 · 카메라 · 조작기 · 테마 · i18n · Plugin Manager, 그리고 **번들 레지스트리**. 레지스트리가 모듈 레벨 상태라 호스트가 하나를 설치해 공유한다 |
| `@aperi21/host-tiptap-bundle` | 외부 호스트가 쓰는 Tiptap 확장 번들. host-tiptap · bootstrap · 조각 445개 · plugin 을 묶고, 조각마다 lazy chunk 로 가른다. `@aperi21/host` 는 external + peer |
| `@aperi21/authoring` | 호스트의 LLM 글쓰기 파이프라인용 개념 메타 445개(`surface` = 고르는 재료, `briefing` = 고른 뒤 writer 에게 넘길 재료). 의존 0 |

## 내부 (private)

| 패키지 | 역할 |
| --- | --- |
| `@aperi21/schema` | 선언 타입 — `BundleSchema` · `SceneGraph` · 프리미티브 26종 · Plugin 인터페이스. 런타임 코드 0, 타입은 발행본 `.d.ts` 에 인라인된다 |
| `@aperi21/bootstrap` | 부팅의 단일 출처 — 조각 loader 등록부(생성물) · 조각별 능력(렌더러) 배선(생성물) · 언어별 카탈로그(생성물) · 조작기 문구. 카탈로그 앱과 외부 호스트가 같은 진입점을 쓴다 |
| `@aperi21/host-tiptap` | Tiptap NodeView 어댑터. `<span data-aperi21 data-aperi21-id>` 자리에 조각을 마운트한다 |
| `@aperi21/react` | 카탈로그 앱용 React 통합 — `HostProvider` · `Embed`(마운트 자리와 라이프사이클만, 그리기는 `runBundle`) |
| `@aperi21/plugin-optics` | 광선 · 광학 소자 렌더러 + 순수 계산(`traceRay` · `findImage` · `refract` · `wavelengthToLinearRgb` …) |
| `@aperi21/plugin-circuit` | 회로 소자 · 도선 · 단자 렌더러 + 순수 계산(`solveMna` · `manhattanRoute`) |
| `@aperi21/plugin-em` | 전자기 순수 계산(직선 도선 자기장 · 각도 도우미) |
| `@aperi21/plugin-mechanics` | 역학 순수 계산(경로 위 진행 · 곡률 경로 · 관찰자 기준계 …) |

조각은 plugin 에서 **순수 계산 함수와 타입만** import 한다. 렌더러 배선은 생성기(`pnpm gen:capabilities`)가 bootstrap 쪽에 만든다.

## 조각 (`sims/`)

`sims/<category>/<id>/` 하나가 패키지 하나(`@aperi21/sim-<id>`)이고, `src/` 의 여섯 파일(`schema` · `state` · `physics` · `scene` ·
`controllers` · `index`)과 제작 기록 `NOTES.md` 로 이루어진다. 조각 id 는 `docs/topics/topics.yaml` 의 주제 id 와 같고, 등록 키는
`aperi21:<id>` 다. 규칙은 `rules/specifics/S-sim.md` · `S-piece.md`.
