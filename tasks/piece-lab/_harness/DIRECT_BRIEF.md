# 조각 직접 구현 지시서 (템플릿)

> `{{…}}` 를 채워 구현 에이전트에게 준다. 이관 지시서(`PORT_BRIEF.md`)와 달리
> **자유 구현 원본이 없다.** 엔진 어휘 위에서 곧바로 짓고, 원본 대조 대신 네가 직접
> 라이트 · 다크 스크린샷을 열어 주장이 서는지 판정한다.

---

## 너의 일

주제 **{{name}}** (`{{id}}`) — {{desc}}. 주제 목록의 시각 메모: 「{{visualNote}}」.

이 주제의 **조각**을 엔진 위의 정식 sim `sims/{{category}}/{{id}}/` 로 만든다.
조각은 글 한 문단 옆에 놓여 **한 주장**을 하는 그림이다. 시각 메모는 출발점일 뿐이다 —
그림이 글보다 나은 자리를 네가 찾아 주장을 정한다.

sim 패키지는 **이미 만들어져 있다** (6파일 최소 스텁 · loader · 카탈로그 연결 완료).
너는 다음만 만들거나 고친다. **그 밖은 고치지 않는다** — 다른 에이전트가 동시에 다른
조각을 만들고 있어서, 공유 파일을 건드리면 충돌한다.

- `sims/{{category}}/{{id}}/src/*` · `sims/{{category}}/{{id}}/NOTES.md`
- `tasks/piece-lab/{{id}}/inventory.json` (새로 만든다. `index.html` 은 만들지 않는다)

금지 — 공유 파일을 바꾸는 명령:
- `pnpm catalog:gen` · `pnpm catalog:topics` (메인이 합친 뒤 한 번 만든다)
- `pnpm install` · `pnpm add` · package.json 수정 (의존을 추가해야 하면 멈추고 보고한다)
- 엔진(`packages/*`) 수정. 어휘가 모자라면 근사하고 기록한다
- **커밋하지 않는다**

**export 이름을 바꾸지 않는다.** `{{camel}}Schema` · `initialState` · `step` · `scene` ·
`controllers` · `{{camel}}Bundle` — loader 가 이 이름으로 찾는다.
`schema.ts` 의 `id` 와 `*_ID` 상수(`'{{id}}'`)도 바꾸지 않는다 — 등록 키 `aperi21:{{id}}` 와
문자 그대로 같아야 한다 (C4). tsc 는 이것을 잡지 못한다.

`pnpm gen:capabilities` 는 공유 생성물을 다시 쓴다. 다른 에이전트와 동시에 돌아 서로 덮어써도
괜찮다 — 메인이 합친 뒤 한 번 더 만든다. 생성물 diff 는 믿지 말고 네 sim 의 typecheck 와 스크린샷만 본다.

## 읽을 것

1. 규칙 — `rules/principles.md` 와 `rules/specifics/S-sim.md` · `S-piece.md` · `S-render.md`,
   `rules/concerns/C1-message-resources.md` · `C2-token-boundary.md`
2. 어휘 — `packages/schema/src/index.ts` 의 primitive 타입들과
   `packages/host/src/renderer/primitives/*.ts`. **선언과 렌더러 구현을 둘 다 읽는다** —
   선언만 있고 구현이 없는 필드가 있다. **읽기만 한다.**
3. 구조 참고 — 같은 방식으로 먼저 만든 조각 `sims/mechanics/kinetic-energy/` ·
   `sims/mechanics/ballistic-pendulum/` (src · NOTES.md), 그리고
   `tasks/piece-lab/kinetic-energy/inventory.json`
4. 부족 장부 — `tasks/engine-requirements/gap-ledger.md`. 모자란 것을 여기 id 에 대 본다
5. 같은 분야에서 먼저 끝난 조각 — 아래 「이웃」 에 적힌 것은 src · NOTES 를 읽고 주장 · 화면이 겹치지 않게 한다
{{related}}

## 규칙

- **자유 렌더를 쓰지 않는다** (`Bundle.renderers` 금지). 어휘로 안 되는 것은 억지로 맞추지도
  직접 그리지도 말고, **가장 가까운 어휘로 근사한 뒤 무엇이 모자랐는지 `NOTES.md` 「어휘 부족」
  에 적는다.**
- S-sim 6파일. `scene.ts` 는 그리지 않고 선언한다. 캔버스 · 색 · 좌표 변환을 만지지 않는다.
- 화면 문자는 `schema.ts` 의 messages 에 둔다 (C1, ko · en). 색은 `colorRole` 로만 (C2).
- **연출 시간표는 `BundleSchema.timeline` 으로 선언한다.** scene · physics 는
  `params.timeline` 의 `at(id)` · `start(id)` · `span(from, to)` 등을 읽는다. 단계 경계를
  모듈 상수로 두고 `if (u < B1)` 로 가르지 않는다 (S-piece · 원칙 2) — 시험 1 에서 rule-guard 가
  바로 이것을 잡았다.
- **주장이 기대는 물리량(질량 · 용수철 상수 · 감쇠 · 진폭 · 구동 진동수 · 충돌마다의 처음 속도 등)은
  `stages[].constants` 에 선언하고 `readConstants` 로 기본값과 함께 읽는다.** scene · physics 의 모듈 상수로만
  두지 않는다 (원칙 2) — 지난 배치에서 rule-guard 가 충돌별 처음 속도 배수로 이것을 잡았다.
- 스텁 schema 에는 `timeline` · `caption` 이 없다 — **새로 선언한다** (S-piece). 스텁 messages 의 `en` 자리에 든
  한글은 임시값이다 — **영어 문안으로 바꾼다** (C1, en 원본으로 화면이 온전해야 한다).
- 이웃 조각을 읽을 때 조작기를 상태에 따라 조건부로 돌려주거나(`pressure-isotropy`) 조작기 범위를 코드 상수로
  계산하는(`laminar-vs-turbulent`) 방식은 따라 하지 않는다 — 에디터가 편집할 데이터가 아니다 (원칙 7).
- **화면에 수(비 · 배수 · 계수)를 띄우면 선언값을 그대로 쓴다** — 스테이지 상수로 선언하고 `String(값)` 이나
  문안 키로 보인다. 계산해서 `toFixed` 로 줄이지 않는다 (S-piece 유효숫자). rule-guard 가 세 번(inelastic-collision ·
  physical-pendulum · viscosity) 잡았다.
- **천체 분야의 물리량도 같다** — G · 천체 질량 · 궤도 반지름 · 이심률 · 자전축 경사(23.5°) · 관측 위도 · 축척 비율 ·
  허블 상수 · 별의 온도는 `stages[].constants` 에 둔다.
- **큰 수 · 지수 표기를 코드에서 조립하지 않는다.** `String(6.674e-11)` 은 `"6.674e-11"` 이 된다 — `toExponential` 이나
  `` `${m}×10^${e}` `` 로 만들지 말고, 보일 문자열을 문안 키로 두거나 가수 · 지수를 스테이지 상수로 선언해 `{name}` 자리표시 +
  `vars` 로 끼운다 (C1 · S-piece 유효숫자). 로그 눈금 이름표(`10ⁿ`)도 같다. graph 의 `scale: 'log'` 는 없다(삭제됨).
- **별빛 · 적색 이동처럼 색 자체가 주장이면** `colorRole` 을 분광형마다 칠해 범례로 쓰지 말고, `light` 채널
  (`LightChannel.light: { rgb }`)에 `@aperi21/plugin-optics` 의 `spectrumToLinearRgb` · `wavelengthToLinearRgb` 를 쓴다
  (`sims/astro/hr-diagram` 참고). **온도 → RGB 표를 sim 안에 손으로 만들지 않는다** (C2). 의존이 없는데 필요하면 멈추고 보고한다.
- 배경 별 · 은하 분포처럼 흩뿌림이 필요하면 **시드를 받는 결정적 난수**만 쓴다. `Math.random` 금지 (S-sim — 같은 시각은 같은 화면).
- `boundsHint` 는 **고정값**이다. 궤도가 커지거나 줄어도 상태로 경계를 계산하지 않는다 (S-piece · 원칙 6). 가장 큰 장면이
  들어가도록 처음부터 잡는다.
- 천구 · 3D 를 2D 월드 좌표로 투영하는 계산은 조각의 배치 계산이라 괜찮다. 월드 → 화면 변환 · 캔버스는 만지지 않는다 (원칙 1).
- 캡션 슬롯을 선언하면 scene 에 id `caption` 인 primitive 를 두지 않는다 (예약 id).
- **선 굵기 · 글자 크기 · 불투명도 · 이름표 띄움 거리를 primitive 안에 숫자로 박지 않는다** — 파일 머리의 이름 있는
  상수(`TRAIL_WIDTH_PX`, `LABEL_PX`, `PLANET_OPACITY`, `LABEL_GAP`)로 둔다 (C2). 0 · 1(완전히 비움 · 채움)만 예외다.
  `anchor` 에 더하는 `+14` · `offset: [0, -16]`, 불투명도 램프 배율(`spread * 5`), 즉석 글자 크기(`LABEL_PX - 1`),
  점 크기 계수도 같다.
  rule-guard 가 이 큐에서 세 번(circular-orbit · escape-velocity · axial-tilt-seasons) 잡았다.
- **파동 분야의 물리량도 같다** — 파장 · 진동수 · 주기 · 진폭 · 파속 · 매질별 속력 · 감쇠 계수 · 슬릿 폭 · 관 길이 ·
  배음 차수 · 음원 속력 · 기준 세기는 `stages[].constants` 에 둔다. 이웃 `interference` · `standing-wave` 가 schema 모듈
  상수로 둔 방식은 따라 하지 않는다 (원칙 2, 사전 검토가 짚었다). 파형 표본 수 · 간격은 파일 머리의 이름 있는 상수로 두고
  상태로 계산하지 않는다.
- **잡음 · 입자 흩뿌림도 시드 결정적 난수** 이고 시드는 `stages[].constants.seed` 에 둔다. 프레임마다 바뀌는 잡음은
  (시드, 시간표 시각)의 함수로 만들고 `step` 에 난수를 쌓지 않는다. 다른 sim 의 난수 함수를 import 하지 말고 자기
  `physics.ts` 에 둔다 (S-sim · C3).
- **데시벨 · 세기 배수는 정박값을 상수로 선언** 하고 화면 글자는 `'{db} dB'` 문안 키 + `vars` 로 끼운다. 계산한 dB 를
  반올림해 띄우지 않는다 (C1 · S-piece 유효숫자).
- **위상 뒤집힘 · 보강 · 상쇄는 변위의 위아래 모양과 합성 곡선의 높이로** 보인다. 두 파동을 가르는 데 역할색을 범례처럼
  쓰지 않는다. P파 · S파는 입자가 흔들리는 방향과 표식 `P` · `S` 로 가른다 (S-piece).
- **소리는 들려주지 않는다.** `AudioContext` · `Audio` · `window` · `document` 금지 (원칙 1 · S-sim). 소리는 매질 입자의
  움직임과 파형으로 보이고, 들려줄 필요가 느껴지면 NOTES (c) 새 부족에 적는다.
- **현대물리의 물리량도 같다** — v/c · 반감기 · 일함수 · 띠틈 · 우물 깊이 · 핵종 질량 · 결합 에너지 · 준위 번호 · 외부 자기장은
  `stages[].constants` 에 둔다. 이웃 `radioactive-decay` · `hydrogen-spectrum` 이 모듈 상수로 둔 방식은 따라 하지 않는다 (원칙 2).
- **단위가 붙는 값(γ · MeV · eV · 연대 · 문턱 진동수)** 은 표시할 정박값을 상수로 선언하고 `'{e} MeV'` 같은 문안 키 + `vars` 로
  끼운다. 계산해 `toFixed` 로 띄우지 않는다(`spacetime-diagram` 의 `toFixed(2)` 를 따라 하지 않는다). 단위 · 기호(`MeV` · `γ` · `ψ` ·
  `e⁻` · `²³⁵U`)는 표식, 값이 끼는 조립문은 문안이다 (C1 · S-piece).
- **측정 · 붕괴 · 산란 결과는 (`constants.seed`, 주기 번호)의 함수** 로 뽑는다 — `radioactive-decay` 의 `drawCycle(seed, cycle)` 가
  선례. 확률 · 빈도는 계산한 % 로 띄우지 않고 쌓인 점 · 막대의 높이로 보인다 (S-sim · S-piece).
- **위상 부호는 축 위아래 높이로, |ψ|² 는 곡선 높이나 한 색의 점 밀도로** 보인다. 전자 · 양공 · 반입자 · 핵자 · 스핀 · 붕괴 종류는
  표식(`e⁻` `h⁺` `e⁺` `p` `n` `↑` `↓` `α` `β` `γ`)과 모양 · 움직임 방향으로 가르고 역할색을 범례처럼 쓰지 않는다 (S-piece).
- **보이지 않을 만큼 작은 효과를 키울 때는 그 배율을 `stages[].constants` 에 이름 붙여 선언** 하고, 화면에 알리지 않기로 했다면
  이유를 NOTES (b) 에 적는다. 배율을 계산 안에 숫자로 숨기지 않는다 (원칙 2 · S-piece).
- **목록형 데이터(원소 · 핵종 · 준위 · 곡선 표본)** 는 스테이지 상수로 흩을 수 있는 만큼 흩고, 목록 길이나 표가 코드에 남으면
  NOTES (c) 에 G105 로 적는다. 원소 · 핵종 기호는 표식, 원소 이름은 문안이다 (C1 · 원칙 2).
- **가시광 밖의 빛(자외선 · X선 · γ선 · 적외선)은 색을 지어내지 않는다** — 파장은 물결 간격으로, 세기는 모양으로 보인다.
  `wavelengthToLinearRgb` 는 380~780 nm 밖을 검정으로 돌려 다크에서 사라진다. plugin-optics 의존이 없는데 빛의 색이 필요하면
  멈추고 보고한다 (C2 · S-piece).
- **전자기의 물리량도 같다** — 전하량 · k · 거리 · 전압 · 저항 · 용량 · 인덕턴스 · 감은 수 · 전류 · B · E · 진동수 · 판 간격 · 넓이 · κ ·
  내부 저항은 `stages[].constants` 에 둔다. 이웃 `field-lines` · `rc-circuit` · `electromagnetic-wave` · `charged-particle-in-magnetic-field` ·
  `current-magnetic-field` 가 schema 모듈 상수로 두고 `constants: {}` 로 비운 방식, `rc-circuit` 의 `u < CHARGE_SPAN` · `current-magnetic-field` physics 가
  모듈 상수 `CURRENT_PHASES` 를 훑는 방식은 따라 하지 않는다 — 스위치 닫힘 · 끊김 · 전류 올리기 · 일정 · 내리기는 timeline 단계다 (원칙 2 · S-piece).
- **표시 배율도 선언이다** — 장 세기 → 화살표 길이 배율, 가까운 곳 길이 상한, 전류 → 알갱이 속력 배율, 과장 배율, 3D 투영 각은 `stages[].constants` 에
  이름 붙여 둔다. 상한에 걸린 화살표는 비례가 끊긴 것이므로 그 처리를 NOTES (b) 에 적는다 (원칙 2).
- **plugin-circuit · plugin-em 에서는 순수 계산과 타입만 import 한다**(`solveMna` · `MnaElement` · `manhattanRoute` · `followAngle` · `wireField*`).
  `render*` · `circuitPlugin` · default export 는 import 하지 않는다. circuitElement / wire / terminal 은 선언만 하면 bootstrap 이 그린다 (원칙 1 · S-sim).
- **`circuitElement.value` 는 화면 글자가 된다** — 렌더러가 `${value}${unit}` 를 그대로 쓴다. 넣으면 스테이지 상수를 보일 단위로(`2` + `'μF'`) 넣고,
  합성값 · solveMna 결과 같은 계산값은 넣지 않는다. circuitElement 에는 램프 켜짐 · 밝기, 계기 바늘, 검류계 · 다이오드 · 가변저항 · 써미스터 · LDR 소자,
  `opacity` · `highlight` · `label` 이 없다 — 켜짐 · 밝기는 `body` 의 `light` · 둘레 모양으로, 바늘은 `scale` 로 근사하고 NOTES (c) 에 적는다 (S-piece · S-render).
- **수를 스스로 띄우는 어휘를 조심한다** — `scale` dial 은 지금 값을 `toFixed(digits)` 로 늘 쓰고(G144), `graph` bar 는 막대마다 `toFixed(1)` 을,
  `vector.showMagnitude` 는 화살표의 월드 길이를 쓴다. `showMagnitude` 는 켜지 않고, 계기 · 막대에서 수가 뜨면 멈추는 값을 선언한 정박값과 같게 두거나
  G144 조립(`sector` + `lineSet` + `readout`)으로 대신한다 (S-piece 유효숫자).
- **단위가 붙는 값(V · Ω · A · μF · mH · T · Hz · e = 1.6×10⁻¹⁹ C)** 은 정박값 상수 + `'{v} V'` 문안 키 + `vars` 로 끼운다. `dc-circuit` 의 `fmt`
  (toFixed · `'e-3'` · toExponential) · `` `I=${…} A` `` 이어 붙이기 · scene 안 `{ko,en}` 문안, `rc-circuit` 의 `toFixed(1)` 을 따라 하지 않는다 (C1 · S-piece).
- **전하 부호 · 자극 · 전류 방향은 표식과 모양으로 가른다** — `+` / `−`, `N` / `S`, `⊙` / `⊗`, 관례 전류 화살표 `I` / 전자 알갱이 `e⁻`. N 빨강 · S 파랑
  관례색, 두 파형(V · I, 1차 · 2차, 전류 · 변위)을 역할색 범례로 쓰지 않는다 — 선 모양(실선 · 점선)과 표식으로 (S-piece). 도선 속을 흐르는 알갱이는
  무엇인지 표식으로 밝힌다 — 전자(`e⁻`)면 관례 전류 `I` 와 반대로 간다.
- **식은 캡션 · 문안에 쓰지 않는다** — `F = kq₁q₂/r²` · `B = μ₀nI` · `ε = −N dΦ/dt` 는 문단의 몫이다. 도식 옆 표식 한 조각(`V₂/V₁`)까지만 (S-piece).
  **법칙을 말로 푼 일반 진술도 식과 같다** — 「선의 수를 정하는 것은 안에 든 전하다」 · 「전압이 길이 비대로 나뉜다」 · 「전류가 일정하면
  역기전력은 없다」 · 「오른손 손가락을 감으면」 · 「벌린 배수의 제곱만큼」 대신 지금 화면에서 보이는 사실(「세 기둥이 모두 {n} 에 닿았다」)을 쓴다.
  rule-guard 가 여섯 번(coulombs-law · gausss-law · potential-divider · field-of-charged-sphere · energy-in-inductor · magnetic-dipole) 잡았다.
- **단계 안을 코드로 다시 가르지 않는다** — `tl.at('x') / 0.12` · `window * 0.5` · `FADE_S = 0.4` 로 앞머리 · 뒷부분을 잘라
  페이드하거나 멈춤 몫을 두거나, `x*x*(3-2x)` 같은 이징을 코드로 씌우는 것 모두 S-piece 위반이다. 짧은 단계를 timeline 에
  더 선언하고 `at()` 으로 읽거나 `ease` 를 선언한다. 알갱이마다 다른 시각처럼 단계로 풀 수 없으면 그 몫을 스테이지 상수로
  올리고 NOTES (c) 에 적는다. rule-guard 가 세 번(impedance-mismatch · sound-through-materials · band-theory) 잡았다.
- 도착한 순간 이미 진행 중이다 — `timeline.startAt` / 프리롤.
- 캡션은 `BundleSchema.caption` 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다. **다음 단계에서 일어날 일을 앞 단계 캡션에
  미리 걸지 않고**(appear 에 「쏟아진다」), **무작위 결과에 기대는 문장은 모든 주기에서 참이게** 결과를 보장한다(시드 · 자리
  바꿈). rule-guard 가 세 번(wave-function · relativistic-velocity-addition · ionizing-radiation) 잡았다.
  전자기에서도 세 번(lorentz-force · charging-methods · electromagnet) — **스위치를 닫는 · 여는 단계, 나타남 단계에는 그 단계의 일만
  쓰고**(「스위치를 닫는다」), 전류가 흐르고 · 클립이 오르고 · 전자가 옮겨 가는 결과는 결과 단계부터 건다.
- **캡션 · 이름표에 스테이지 상수의 값(「절반」 · 「두 배」 · 「한 바퀴」 · 「6 V」)을 문안으로 박지 않는다** — `initialState({ stage })` 에서
  `readConstants` 로 읽은 값을 `String(값)` 으로 state 에 두고 `caption.vars` 로 끼운다(`sims/modern/time-dilation/src/state.ts` 가 선례, G133 우회로).
  「G133 때문에 끼울 수 없다」 가 아니다. rule-guard 가 여덟 번 잡았다 (원칙 2).
- 같은 시각은 언제나 같은 화면이어야 한다. 누적 적분이 필요한 것만 `step` 이 상태에 쌓는다.
- 크롬(그리드 · 카메라 단추)은 주장이 요구할 때만 켠다. 조작기는 독자가 직접 해 봐야 하는 것이
  있을 때만 필요한 만큼 둔다.
- 테마 둘(라이트 · 다크) 모두에서 주장이 서야 한다.

## inventory.json

```json
{
  "id": "{{id}}",
  "claim": "한 문장 주장",
  "verb": "그 문장의 동사 — 화면에서 실제로 일어나는 것",
  "probeTimes": [주장이 드러나는 시각 3~5개(초) — 카탈로그를 `?t=` 로 여는 값. `?t=` 는 `startAt` 에서부터 흐른 화면 시간이다(조각 시계 = startAt + t, timeScale 적용). 단계 시각과 어긋나므로 찍힌 장면을 보고 잡는다],
  "controls": ["조작기와 그것이 바꾸는 것 — 없으면 빈 배열"],
  "timeline": [{ "t": 0.4, "what": "그 시각 화면에 보여야 하는 것" }]
}
```

`timeline[].t` 는 `probeTimes` 와 같은 값들이다.

## 주장 판정 — 필수

```sh
cd /Users/mintae/Documents/Develop/side-projects/aperi21
pnpm gen:capabilities                         # 네가 쓴 어휘가 번들에 실리도록
pnpm --filter @aperi21/sim-{{id}} typecheck
pnpm -s piece:report --sims={{simsBase}} {{id}}
```

결과는 `tasks/piece-lab/_report/_scratch/{{id}}/` 에 떨어진다.
`shots/{{id}}@<t>.sims.png`(라이트)와 `shots/{{id}}@<t>.sims.dark.png`(다크)를 **직접 열어 보고**
`inventory.json` 의 `what` 이 그 화면에 실제로 있는지, 주장의 동사가 일어나는지 판정한다.
안 서면 고치고 다시 찍는다. 글자 겹침 · 화면 밖으로 나감 · 다크에서 뒤집힘을 특히 본다.

dev 서버는 사용자가 운영한다. 켜지 말고, 응답이 없으면 멈추고 보고한다.
같은 기계에 다른 앱의 dev 서버도 떠 있다 — 첫 촬영본이 aperi21 카탈로그 화면인지부터 본다.

## NOTES.md

`sims/mechanics/ballistic-pendulum/NOTES.md` 와 같은 네 절.

- (a) 답하는 질문과 동사 — 화면에서 어떻게 일어나는가
- (b) 화면 구성의 결정 — **두지 않은 것 포함**, 이유와 함께
- (c) 어휘 부족 — 장부 id 가 있으면 id 로, 없으면 「새 부족」 표에. 영향은 `주장`(근사하면 주장이
  약해지거나 틀린다) / `근사`(모양만 조금 다르다). 장부 문안이 그 모자람을 적고 있지 않으면 새 부족이다.
  조각의 물리 · 배치 계산은 부족이 아니다
- (d) 주장이 화면에서 서는가 — probeTimes 마다 라이트 · 다크를 보고 판정한 것

## Baden 보고

파일 읽기 · 수정 · 생성 · 검색 · 검증 **실행 전에** 보고한다. `action` 은 snake_case 동사로 시작한다
(`read_*` · `modify_*` · `create_*` · `search_*` · `verify_*`). 이유는 나중에 읽어도 맥락이 서게 쓴다.

```sh
curl -s -X POST http://localhost:3800/api/events \
  -H "Content-Type: application/json" \
  -d '{"projectName":"aperi21","action":"...","reason":"...","taskId":"{{taskId}}"}'
```

**`inventory.json` · `state.ts` 처럼 새로 만드는 파일도 만들기 전에 보고한다** — 이 큐에서 세 에이전트가 파일을 만든 뒤에야
보고했다. 빠뜨렸으면 소급하지 말고 다음 보고에 그 사실을 적는다.

보고용 도우미 스크립트를 만들려면 이름에 네 id 를 넣는다(예: `/tmp/bd-{{id}}.sh`). 같은 이름을 다른 에이전트도 쓴다 —
지난 배치에서 공유 이름 `bd.sh` 가 서로 덮어써졌다. 저장소 안에는 두지 않는다.

## 끝나기 전에

- `pnpm --filter @aperi21/sim-{{id}} typecheck` 통과
- 두 테마 스크린샷에서 주장이 선다
- 마지막 보고에 (1) 주장과 동사 (2) 쓴 어휘 (3) 어휘 부족 — 장부 id / 새 부족(영향 포함)
  (4) 두 테마 판정 을 짧게 담는다
