# aperi21 MVP 스코프

첫 마일스톤의 범위 정의. 이 문서에 포함되지 않은 것은 마일스톤 2 이상으로 이연된다.

---

## MVP 목표

1. **아키텍처 검증** — Bundle / Host / Plugin / Scene Graph 분리가 실제로 작동하는지
2. **다양성 입증** — 단일 아키텍처로 세 개의 서로 다른 물리 도메인이 표현됨
3. **Plugin 시스템의 정당성 증명** — 두 개의 독립 Plugin(Optics, Circuit)이 공존하며 각자 도메인 유틸리티를 제공
4. **ID 참조 시스템 검증** — DC 회로의 Wire가 참조 기반 데이터 구조의 실사용 사례
5. **확장 패턴 확립** — 이후 26개 Bundle이 따를 모델 확정

**MVP 완료 = 세 Bundle이 카탈로그 웹사이트에서 실제로 돌아가며 다국어·테마·Plugin 시스템이 검증된 상태.**

---

## 선정된 3개 Bundle

### 1. Projectile (발사체)

- **역할**: 기준점 / 프로토타입. 연속 운동·라이브 환경 개입·시간 선형 진행을 대표.
- **시간 모델**: linear
- **스테이지**: earth, moon, vacuum
- **환경**: rain, headwind, tailwind (earth 전용, 라이브 토글)
- **뷰**: trajectory, forces, energy
- **컨트롤러**: pinball-launcher, angle-dial
- **Plugin**: 없음 (호스트 코어만)
- **이미 설계됨**: v3 데모 + Scene Graph 버전 Bundle 존재

### 2. Ray Tracing (광선 추적)

- **역할**: 다른 도메인 진입. static 시간 모델. 첫 번째 Plugin(Optics) 검증.
- **시간 모델**: static (시간 축 없음 — 파라미터 변경 시에만 재계산)
- **스테이지**: 없음 (매질 타입으로 대체: 공기, 물)
- **환경**: 없음
- **뷰**: rays (기본), with-focal-points (선택)
- **컨트롤러**: placement (물체·렌즈 드래그), slider (초점 거리)
- **Plugin**: `@aperi21/plugin-optics` 필수
- **MVP 범위 제한**:
  - 볼록 렌즈 결상
  - 오목 렌즈 결상
  - 평면 거울 반사
  - **제외**: 오목/볼록 거울, 프리즘 분산, 복합 광학계 (마일스톤 2)

### 3. DC Circuit (DC 회로)

- **역할**: 완전히 다른 시각 언어(격자 회로도). 두 번째 Plugin. 회로 해석 엔진. ID 참조 시스템의 실사용.
- **시간 모델**: steady_state (파라미터·토폴로지 변경 시에만 재해석)
- **스테이지**: 없음
- **환경**: 없음
- **뷰**: schematic (기본), values-overlay (전류·전압 표시), analysis (노드 전압·루프 전류)
- **컨트롤러**: placement (소자 드래그·회전), value-edit (소자 값 편집)
- **Plugin**: `@aperi21/plugin-circuit` 필수
- **MVP 범위 제한**:
  - 소자: resistor, battery, capacitor, switch, ground
  - **회로 해석 엔진(MNA) 완전 구현** — DC 정상 상태 전류·전압·전력 계산
  - Wire 자동 라우팅 (Manhattan)
  - **제외**: inductor, 다이오드, 트랜지스터, AC, 과도응답(RC 충전), 주파수 응답 (마일스톤 2)

---

## 검증되는 아키텍처 측면

세 Bundle이 같이 있을 때 드러나는 것들:

| 측면 | Projectile | Ray Tracing | DC Circuit |
|------|-----------|-------------|------------|
| 시간 모델 | linear | static | steady_state |
| 컨트롤러 | pinball + angle-dial | placement + slider | placement + value-edit |
| Plugin 사용 | 없음 | Optics | Circuit |
| 환경 라이브 개입 | ✓ (비/바람) | N/A | N/A |
| 에너지 뷰 | KE+PE 시소 | N/A | 전력 표시 |
| 스테이지 차이 검증 | g, drag | 매질 (굴절률) | — |
| 새 프리미티브 | — | Ray, OpticalElement | CircuitElement, Wire, Terminal |
| 시각 언어 | 연속 운동 | 광선 기하 | 격자 회로도 |
| ID 참조 시스템 | 미사용 | 가볍게 | **핵심 데이터 구조** |
| 도메인 유틸리티 | 없음 | traceRay (기하) | solve, routeWire (해석 + 라우팅) |
| 자동 라우팅 | 없음 | 없음 | ✓ (Manhattan) |
| 카메라 자동 프레이밍 | ✓ | ✓ | ✓ |
| 격자 정렬 | 자유 | 자유 | **격자 강제** |

**이 세 Bundle이 통과하면 아키텍처의 모든 주요 축이 검증된다.**

---

## MVP에 필요한 호스트 구현

### 코어 시스템

- [ ] **Plugin Manager** — register/unregister, 의존성 해결, 버전 호환 검사, 에러 격리
- [ ] **Renderer** — 프리미티브 타입별 렌더러 레지스트리, z-order 정렬
- [ ] **Scene Graph 전처리기** — ID 인덱싱, 의존성 그래프, 메모이제이션, 위상 정렬
- [ ] **Controller 시스템** — 4종 컨트롤러: pinball-launcher, angle-dial, placement, value-edit, slider
- [ ] **시간 엔진** — linear, static, steady_state 세 모드 지원
- [ ] **Camera** — pan/zoom, 자동 프레이밍, 더블클릭 리셋, **격자 스냅** (DC Circuit용)
- [ ] **Theme 엔진** — colorRole → 색상 해석, dark/light 전환
- [ ] **I18n** — LocalizedText resolver (실제 언어 전환은 준비만)
- [ ] **Compute Service** — gravity, uniform, custom 코어 메서드
- [ ] **배경 입자 시스템** — 비/별 (Projectile 전용)

### 코어 프리미티브 렌더러

MVP에서 필요한 것만 (전체 16개 중 8개):

- [ ] **Body** — point, circle (Projectile 공)
- [ ] **Trajectory** — solid, fade-tail (Projectile 궤적)
- [ ] **Vector** — arrowhead, label (Projectile 속도 분해)
- [ ] **Surface** — ground, incline (Projectile 바닥)
- [ ] **Graph** — bar (Projectile 에너지 뷰)
- [ ] **Gauge** — linear (DC Circuit 전류·전압 표시용)
- [ ] **Marker** — label (모든 Bundle의 라벨)
- [ ] **Event** — flash (선택적 — Projectile 착지, DC Circuit 단락 경고)

### MVP 제외 코어 프리미티브

- ~~Constraint~~ (진자 없음)
- ~~VectorField, ScalarField, FieldLine~~ (EM 없음)
- ~~Wave, Emitter~~ (파동 없음)
- ~~ParticleSystem~~ (다체 없음)
- ~~Axis~~ (회전 없음)

---

## MVP Plugin 구현

### @aperi21/plugin-optics

- [ ] **Ray 렌더러** — 꺾인 선분, colorRole 기반
- [ ] **OpticalElement 렌더러** — lens-convex, lens-concave, mirror-flat (세 subtype만)
- [ ] **traceRay 유틸** — 원점 + 방향 + 요소 배열 → 세그먼트 배열, 최대 바운스·최소 강도 제한
- [ ] **findImage 유틸** — 박막 렌즈 공식으로 상 위치 계산
- [ ] **refract compute** — 스넬 법칙
- [ ] **reflect compute** — 반사 법칙
- [ ] 단위 테스트 — 45° 굴절, 볼록 렌즈 결상, 평면 거울 반사

**Optics MVP 제외**: 오목/볼록 거울, 프리즘, 슬릿, 스크린, 편광자.

### @aperi21/plugin-circuit

- [ ] **CircuitElement 렌더러** — 5개 subtype: resistor, battery, capacitor, switch, ground
  - 각 subtype별 심볼 렌더 (저항 지그재그, 축전기 두 판, 전지 선 두 개, 스위치 개폐, 접지 삼각)
  - 4방향 회전 (0/90/180/270)
  - 값·단위 라벨 자동 배치
- [ ] **Wire 렌더러** — 참조 해석(`from: 'R1.a'`) + Manhattan 라우팅
- [ ] **Terminal 렌더러** — 연결점 표시
- [ ] **solve 유틸** — **Modified Nodal Analysis (MNA) 구현**
  - 입력: elements + wires
  - 출력: 각 소자의 전류·전압·전력, 각 노드의 전압
  - DC 정상 상태만
  - Ground 노드 자동 감지 (ground subtype)
- [ ] **terminalPosition 유틸** — subtype + pos + rotation → 터미널 월드 좌표
- [ ] **routeWire 유틸** — Manhattan 라우팅, 장애물 회피 기초
- [ ] **validate 유틸** — 단락·개방 검증
- [ ] 단위 테스트
  - 직렬 저항 (옴의 법칙 검증)
  - 병렬 저항
  - 분배기 회로 (전압 분배)
  - 복합 회로 (3개 이상 저항 혼합)
  - 단락 검출
  - 개방 회로 검출

**Circuit MVP 제외**: inductor, AC 해석, 과도응답, 능동 소자.

### 다른 Plugin들은 전부 제외

- ~~EM Plugin~~ — 마일스톤 2 (VectorField/FieldLine 렌더러 필요)
- ~~Thermo Plugin~~ — 마일스톤 2 이상
- ~~Modern Plugin~~ — 마일스톤 3 이상

---

## 통합 레이어

### @aperi21/react

- [ ] `<Embed>` 컴포넌트 — Bundle 받아 Canvas에 렌더
- [ ] Theme Provider (Context)
- [ ] I18n Provider (Context)
- [ ] 반응형 레이아웃 기본

### 카탈로그 웹사이트 연결

- 카탈로그 사이트는 별도 프롬프트로 구축
- MVP에서는 **3개 Bundle만 "구현됨" 배지로 표시**
- 클릭 시 `/bundle/:id` 페이지에서 Embed 렌더
- 나머지 26개 Bundle은 "SOON" 유지

---

## MVP에서 제외된 것들

### 제외 — Bundle
- 나머지 26개 Bundle
- Projectile의 축약 변형 (focus별 분기)

### 제외 — Plugin
- EM, Thermo, Modern
- Optics: 거울 일부, 프리즘, 편광
- Circuit: AC, 과도응답, 능동 소자

### 제외 — 인프라
- Tiptap 에디터 플러그인 (마일스톤 2)
- DSL 파서 (Embed를 React props로 받는 것까지만)
- 모바일 터치 최적화 (데스크톱 우선)
- 실제 다국어 전환 (UI 한국어 고정, 영어 키만 준비)
- 동적 Plugin 로딩 (정적 import만)
- SSR 지원
- 완전 접근성 (기본 aria만)
- 성능 품질 자동 적응
- 디버그 모드

### 제외 — 사용자 경험
- 공유 가능한 URL (Scene Graph 상태 직렬화)
- 학습 진도 저장
- 개인화 / 계정
- 댓글 · 커뮤니티

---

## MVP 구현 순서

**Phase 1 — 기반 (1~2주)**
1. 모노레포 구조 설정 (packages/host, schema, plugin-optics, plugin-circuit, bundles, react)
2. `@aperi21/schema` 패키지 — 스키마 타입 export
3. `@aperi21/host` 코어 — Plugin Manager + Renderer 레지스트리 + Theme + I18n Provider (렌더러 없이 구조만)
4. `@aperi21/react` Embed 컴포넌트 기본 골격

**Phase 2 — Projectile 완성 (2주)**
5. 시간 엔진 (linear 모드)
6. Camera 시스템
7. 코어 렌더러: Body, Trajectory, Vector, Surface, Marker, Graph (bar)
8. Controller: pinball-launcher, angle-dial
9. Scene Graph 전처리기
10. 배경 입자 시스템
11. `@aperi21/bundle-projectile` 이관

**마일스톤 2.완**: Projectile이 브라우저에서 돌고, 테마 전환 됨.

**Phase 3 — Ray Tracing (1.5주)**
12. 시간 엔진 확장: static 모드 (시간 없는 Bundle 지원)
13. Controller: placement, slider
14. `@aperi21/plugin-optics` 구현:
    - Ray, OpticalElement 렌더러
    - refract, reflect compute
    - traceRay, findImage 유틸
15. `@aperi21/bundle-ray-tracing` 구현

**마일스톤 3.완**: 2개 Bundle 돌고, 첫 Plugin이 등록·작동함.

**Phase 4 — DC Circuit (2~2.5주) ← 가장 무거운 Phase**
16. 시간 엔진 확장: steady_state 모드 (파라미터 변경 트리거 재계산)
17. Camera 확장: 격자 스냅 모드
18. Controller: value-edit
19. 코어 렌더러 추가: Gauge (linear)
20. `@aperi21/plugin-circuit` 구현:
    - CircuitElement 렌더러 (5개 subtype)
    - Wire 렌더러 + Manhattan 라우팅
    - Terminal 렌더러
    - **MNA 해석 엔진 (`solve()`)** — 이게 가장 큰 작업 덩어리
    - terminalPosition, routeWire, validate 유틸
21. `@aperi21/bundle-dc-circuit` 구현

**마일스톤 4.완**: 3개 Bundle 모두 돌고, Plugin 시스템이 두 개의 독립 Plugin으로 검증됨. ID 참조 시스템이 실사용에서 작동함.

**Phase 5 — 통합 (1주)**
22. 카탈로그 웹사이트와 연결 — 3개 Bundle의 상세 페이지 작동
23. 다국어 스캐폴드 검증
24. 최종 QA: 테마 일관성, 반응형 기본, 에러 처리

**총 예상: 7~9주.**

---

## 완료 기준

MVP 완료 선언을 위한 체크리스트:

- [ ] 세 Bundle이 모두 카탈로그 웹사이트에서 열리고 작동
- [ ] 각 Bundle의 모든 뷰 전환이 매끄러움
- [ ] 각 Bundle의 컨트롤러가 예상대로 동작
- [ ] Projectile의 환경 라이브 개입이 작동 (비행 중 비 켜면 궤적 꺾임)
- [ ] Ray Tracing이 렌즈·거울 파라미터 변경에 즉각 반응 (상 위치 재계산)
- [ ] **DC Circuit의 해석 엔진이 정확한 전류·전압 계산 (단위 테스트 모두 통과)**
- [ ] **DC Circuit의 Wire가 소자 이동 시 자동 재라우팅**
- [ ] **DC Circuit의 스위치 토글이 회로 재해석을 트리거**
- [ ] 테마 전환 (dark/light)이 세 Bundle 모두 일관
- [ ] 줌/팬이 세 Bundle 모두 작동, DC Circuit은 격자 스냅
- [ ] Scene Graph가 JSON 직렬화 가능 (세 Bundle 모두)
- [ ] **두 Plugin(Optics, Circuit) 등록·해제가 충돌 없이 작동**
- [ ] Plugin 간 독립성 — 하나를 빼면 해당 Bundle만 빠지고 나머지는 정상
- [ ] 전체 번들 사이즈 < 600KB gzipped
- [ ] 60 FPS 유지 (Projectile), 30 FPS 이상 (Ray Tracing 재계산·DC Circuit 토폴로지 갱신 시)

---

## MVP 이후 로드맵

**마일스톤 2 — 역학·전자기 확장 (2~3개월)**
- Oscillation Bundle (단진자·용수철·감쇠·강제 진동)
- Constraint 프리미티브 완성
- EM Plugin (VectorField, FieldLine, Charge 기반)
- Bundle: electric_field, magnetic_field, central_force_orbit
- AC Circuit Bundle (Circuit Plugin 확장: phasor, 과도응답)

**마일스톤 3 — 파동과 열 (2~3개월)**
- Wave 파이프라인 완성 (1D + 2D)
- Thermo Plugin
- Bundle: wave_1d, interference, ideal_gas, heat_transfer, kinetic_theory

**마일스톤 4 — 현대물리 + 통합 (2~3개월)**
- Modern Plugin
- ParticleSystem 완성
- Tiptap 플러그인 (에디터 통합)
- DSL 파서

**총 로드맵 ~1년**. 29 Bundle 모두 커버.

---

## 이 MVP 스코프가 답하는 질문

- **아키텍처가 작동하는가?** Phase 3에서 답함 (다른 도메인에서 재사용될 때)
- **Plugin 분리가 정당한가?** Phase 4에서 답함 (두 독립 Plugin이 공존하며 각자 도메인 유틸리티 제공)
- **Scene Graph 모델이 Bundle 작성 비용을 줄이는가?** Phase 3·4에서 답함 (Ray Tracing·DC Circuit 작성 시간으로 측정)
- **ID 참조 시스템이 실사용에서 작동하는가?** Phase 4에서 답함 (Wire의 `from: 'R1.a'` 참조 처리)
- **호스트가 서로 다른 시간 모델을 자연스럽게 처리하는가?** Phase 2·3·4에서 각각 답함
- **회로 해석 엔진이 Plugin 유틸리티로 적절한가?** Phase 4에서 답함 (Bundle이 `host.utilities.circuit.solve()` 호출 패턴 검증)
- **카탈로그 웹사이트가 Bundle을 제대로 담아내는가?** Phase 5에서 답함
- **다국어·테마 시스템이 Bundle 작성자에게 투명한가?** 전 Phase 지속 검증

MVP가 끝날 때 이 질문들에 "예"로 답할 수 있어야 한다. 답이 "아니오"인 질문이 있으면 마일스톤 2 전에 해결.
