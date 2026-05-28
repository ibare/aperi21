# packages/

이 디렉토리는 aperi21 엔진 패키지를 담으며, Phase 1부터 실제 코드가 추가된다.

## 코어
- `@aperi21/schema` (Phase 1) — Scene Graph 타입 정의, Bundle/Primitive 인터페이스
- `@aperi21/host` (Phase 1) — 플러그인 매니저, 렌더러·컨트롤러 레지스트리, Camera/TimeEngine, Bundle 레지스트리, runBundle 진입점
- `@aperi21/react` (Phase 1) — React 통합 레이어 (Embed, HostProvider, useBundleRuntime)

## 시각화 (sims/)
저장소 루트의 `sims/<category>/<name>/` 에 위치 (workspace 패턴: `sims/*/*`). 카테고리별로 그룹화되며, 호스트 측 dynamic import 로 lazy chunk 가 된다.

- `@aperi21/sim-projectile` (Phase 2) — 발사체 운동 — `sims/physics/projectile/`
- `@aperi21/sim-ray-tracing` (Phase 3) — 광선 추적 — `sims/optics/ray-tracing/`
- `@aperi21/sim-dc-circuit` (Phase 4) — DC 회로 — `sims/electronics/dc-circuit/`

## 도메인 플러그인
- `@aperi21/plugin-optics` (Phase 3) — Ray/OpticalElement Primitive 렌더러 + traceRay/findImage 유틸
- `@aperi21/plugin-circuit` (Phase 4) — CircuitElement/Wire/Terminal 렌더러 + solveMna/manhattanRoute 유틸

## 호스트 결합
- `@aperi21/bootstrap` — sim loader + plugin 설치의 단일 출처. 카탈로그 앱과 외부 호스트가 동일한 부팅 진입점을 공유.
- `@aperi21/host-tiptap` — Tiptap NodeView 어댑터. DSL `{aperi21:<id>}` 인라인 마운트.
- `@aperi21/host-tiptap-bundle` — 외부 호스트(예: 노트 에디터)가 단일 의존으로 소비하는 ESM 번들. Rollup 으로 host + sim + plugin 을 chunk 분리해 패키징.

MVP 스코프와 Phase 구분은 `docs/08-mvp-scope.md`를 참고.
