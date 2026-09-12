# 배치 01 — 넓게 (역학·진동·파동·전자기·열·천체 10)

파일럿(00)이 절차를 태웠으니 이번은 **폭**을 태운다. 기존 조각 10개가 유체에 몰려
있어(5/10), 같은 분과를 더 고르면 이미 있는 어휘를 다시 확인할 뿐이다. 유체는 0개로
두고 손대지 않은 분과를 열었다.

| 조각 | 주장 | 동사 |
|---|---|---|
| `inertial-frame` | 급정거한 버스에서 승객을 민 것은 없다 — 버스만 느려지고 승객은 원래 속도로 간다 | 그대로 간다 |
| `ramp-energy` | 어떤 길로 내려오든 바닥에 내려서는 속력이 같아, 먼저 간 공이 앞설 뿐 간격은 더 벌어지지 않는다 | 간격이 굳는다 |
| `pendulum-isochronism` | 진폭이 다섯 배 차이 나는 진자 다섯이 같은 순간 바닥에서 다시 만난다 | 다시 모인다 |
| `beats` | 두 음은 각각 세기가 변하지 않는데 발걸음이 어긋나 합쳐진 소리만 커졌다 작아졌다 한다 | 어긋난다 |
| `doppler-effect` | 파면은 같은 빠르기로 퍼지는데 원천이 방출점을 밀고 가 앞쪽 간격만 좁아진다 | 좁아진다 |
| `current-magnetic-field` | 전선 둘레 나침반이 전선을 감아 도는 쪽으로 돌아서고, 멀수록 덜 돌아선다 | 돌아선다 |
| `lenz-law` | 전류는 한가운데서 뒤집히지만 힘은 뒤집히지 않는다 — 언제나 움직임을 거스른다 | 거스른다 |
| `heat-conduction` | 같은 불에 같은 시간을 두어도 쇠에서는 번져 나가고 나무에서는 머문다 | 번져 나간다 / 머문다 |
| `gas-pressure` | 압력은 분자가 벽을 때리는 두드림의 합이고, 온도를 올리면 그 합이 커진다 | 쌓인다 |
| `apparent-brightness` | 빛 한 묶음이 멀어질수록 넓은 면에 나뉘어 한 칸이 받는 양이 36 → 9 → 4 로 준다 | 나뉜다 |

## 1. 자유 구현

격리된 에이전트 10개가 병렬로 만들었다. 지시서는 `BRIEF.md`, **엔진 이야기는 넣지
않았다** — 이 저장소에 시각화 엔진이 있다는 것도 알려 주지 않았다.

- 계측 약속을 열 조각 모두 지켰다. 같은 `t` 두 번 촬영에서 바이트 동일(결정성) 10/10
- 스크린샷을 보고 **스스로 고친 것이 여럿이다** — `apparent-brightness` 는 부동소수
  경계에서 캡션이 한 국면 뒤처진 것을, `heat-conduction` 은 해석해로 추정한 낙하 시각이
  적분 실측과 어긋난 것을, `pendulum-isochronism` 은 통과 링이 실제 지연을 19px 로
  증폭해 "다섯 개의 다른 순간" 으로 읽히던 것을 찾아 고쳤다
- 남은 `⚠` 는 열 조각 모두 `engine-fit.json 없음` 한 줄뿐이었고, 그것은 다음 단계의
  산출물이다

## 2. 추출 — 엔진이 주는 것 / 못 주는 것

집계: **없음 34 · 수정 필요 23 · 엔진 밖 41.**

### 가장 큰 발견 — 선언만 있고 렌더러가 없는 어휘 12종

```
Primitive 유니온 32종 − CORE_RENDERERS 15 − plugin 5 = 12
constraint · axis · vectorField · scalarField · fieldLine · wave
emitter · particleSystem · charge · coil · container · energyLevels
```

`sims/**` 사용처는 **12종 전부 0건**이었다. S-render MUST(「구현하지 않을 필드는 선언에서
지운다」) 위반이자 원칙 4 MUST NOT(「쓰임 없이 미리 만들지 않는다」) 위반 — FACET 이 빌트인
view 15종으로 실패한 것과 같은 모양이다. 이번 배치가 그중 여섯을 정면으로 밟아 드러났다.

### 몇 조각이 같은 것을 따로 짰나

| 요구 | 조각 수 |
|---|---:|
| 프리롤 / warm start | **9 / 10** |
| 시간창 사건 이력 (쌓이고 늙고 버려지는 뼈대) | 6 / 10 |
| 조작기 인계 규약 (자동 값을 따라 읽다 손대면 넘겨받기) | 6 / 10 (+ `laminar-vs-turbulent` = 7사례) |
| 상태로 갈리는 캡션 | 3 / 10 |
| 사건 순간의 짧은 강조 | 3 / 10 |
| 스트로보 자취 | 2 / 10 |
| 같은 순간의 대상을 잇는 비교선 | 2 / 10 |

### 조각 넷이 이미 있는 것을 새로 만들어 달라고 했다

`doppler-effect` · `gas-pressure` · `current-magnetic-field` · `inertial-frame` 이
"자동 진행 시간표를 선언으로 올려 달라, 구간 경계를 캡션에도 두 번 적어야 해서 어긋나기
쉽다" 고 적었는데 `timeline` · `caption` 이 이미 있다. 엔진을 모르게 한 절차의 의도된
결과이고, 이관 때 걷어 낸다. **절차가 제 일을 했다는 증거이기도 하다** — 엔진을 알려
줬다면 있는 것에 맞춰 만들었을 테고, 그러면 무엇이 모자란지 알 수 없었다.

### 가장 날카로운 단일 지적 — 선형광

`apparent-brightness` 가 1/4 · 1/9 을 **캔버스 알파로 칠하면 감마 때문에 실제 나오는 빛의
비가 그 값이 아니라는 것**을 짚었다. 선형으로 되돌려 섞고 다시 인코딩해야 "네 배 옅다" 가
말이 아니라 빛의 양으로 참이 된다. `BaseMeta.opacity` 는 이 보정을 하지 않는다.

> "조각마다 다시 짜면 언젠가 누군가는 알파로 대충 칠하고 그 조각은 거짓말을 한다."

## 3. 엔진 작업

rule-guard 사전 검토(ISSUE 6건)를 반영해 범위를 고쳤다.

| # | 대상 | 내용 |
|---|---|---|
| 1 | **선언 정리** | 렌더러 없는 10종 삭제 (`axis` · `vectorField` · `scalarField` · `fieldLine` · `wave` · `emitter` · `charge` · `coil` · `container` · `energyLevels`). `Event_.kind` 의 미구현 `decay` · `emission` 도 제거 |
| 2 | `constraint` | 렌더러 구현 — 매단 줄 · 막대 · 용수철 · 레일. `DEFAULT_Z_LAYERS` 에 층(15) 신설 |
| 3 | `particleSystem` | 렌더러 구현 — 자리 목록, 경로 하나로 모아 일괄 채움, `trail` |
| 4 | `trace` | **신설.** 지나간 자국 목록 `{자리 · 나이 · 세기}`. `dot` · `ring`(`spreadTo` 로 퍼짐) · `tick` |
| 5 | `BundleSchema.startAt` | `TimelineDef` 에서 **올렸다**. 시간표 없는 조각도 시계를 앞당겨야 한다 |
| 6 | `BundleSchema.preroll` | **신설.** 마운트 전에 `step` 을 고정 걸음으로 미리 굴린다 |
| 7 | `ControllerInstance.heldPath` | **신설.** 잡고 있는 동안 true. 러너는 사실만 적고 복귀는 조각이 정한다 |
| 8 | `CaptionSlotDef.cases` | **신설.** 상태 경로로 문안을 고른다. 슬롯은 여전히 하나 |
| 9 | `BaseMeta.luminance` | **신설.** 빛의 양. 선형광에서 섞고 sRGB 로 인코딩 |
| 10 | `@aperi21/plugin-mechanics` · `plugin-em` | **신설.** 순수 계산만. `installAperi21Plugins` 에 **등록하지 않는다** |

### 만들지 않기로 한 것

조각들이 **명시적으로 거부**했다.

- `wave` / `emitter` — "엔진이 '파동=동심원' 같은 기성품을 주면 이 조각의 핵심(방출점이
  갈라지는 것)이 사라진다" (`doppler-effect`)
- `vectorField` / `fieldLine` — "배치기가 '링을 그려 준다' 거나 벡터장 도구가 '장선을 깔아
  준다' 면 이 조각은 만들 수 없다" (`current-magnetic-field`). `body.customPath` 로 된다
- `coil` — "코일 도형이 전류 향을 접선으로 옮기는 규칙을 함께 들고 오면 안 된다" (`lenz-law`)

**비교선도 승격하지 않았다.** `ramp-energy` 는 `trajectory` 점 3개, `inertial-frame` 은
선분 목록이라 둘 다 표준 어휘 조합으로 된다 (원칙 4 MUST NOT). 동시 출발 표지를 올리지
않은 선례와 같다.

**스트로보 자취와 시간창 사건 이력은 하나로 합쳤다.** 둘 다 `{자리 · 나이 · 세기}` 목록이고
균일 간격이냐 아니냐만 다르다 — 나누면 C4 의 「같은 대상에 두 이름」이 된다.

### 사후 검증에서 더 지운 것

rule-guard 사후 감사가 **같은 위반이 필드 층위로 남은 것** 둘을 찾았다. 렌더러 없는
primitive 10종을 지워 해소한 것과 같은 문제다.

| 지운 것 | 이유 |
|---|---|
| `ParticleSystem.colorBy` · `tags` | 렌더러가 읽지 않는다. 쓸 조각도 없다 — `gas-pressure` 는 "온도에 따라 분자 색을 바꾸지 않는다"(S-piece 「색으로 설명하지 않는다」)가 결정이었고 `apparent-brightness` 도 알갱이를 한 색으로 둔다 |
| `Constraint.naturalLength` · `stiffness` | "정보용" 이라 적혀 있었고 그림이 달라지지 않았다 |

남긴 관찰: `ControllerInstance.heldPath` 와 `scale-drag.binds.held` 가 같은 사실을 두 자리에
적는다. C4 의 MUST NOT 은 등록 키·선언 id·primitive type 이 대상이라 위반은 아니고, 값이
같아 오작동도 아니다. 이관 지시서에서 **`heldPath` 를 쓰도록** 못박아 새 조각이 갈리지 않게 했다.

### 게이트

- `pnpm -r typecheck` — 31개 프로젝트 오류 0
- `pnpm test` — 100건 전부 통과 (host 78 · react 6 · bootstrap 8 · projectile 8)
- `pnpm gen:capabilities` — 20개 생성, `pnpm catalog:gen` — 20개 번들
- rule-guard 사전 검토(ISSUE 6건 전부 반영) · 사후 검증(ISSUE 2건 → 위와 같이 해소)

### rule-guard 가 교정한 것

1. **프리롤은 하나가 아니라 셋이었다** — 시계 앞당기기는 `TimelineDef.startAt` 이 이미
   하고(새 이름은 C4 위반), 입자 프리롤은 `kit/particles.ts` 가 이미 하며, 진짜 결손은
   **step 선행 구동** 하나뿐이었다
2. **선언에 식을 넣지 않는다** — `heldPath` · `cases.when` 은 `visibleWhen` 선례대로 상태
   경로 **이름**만 받는다 (원칙 2)
3. **공용 계산 plugin 을 부팅 경로에 등록하지 않는다** — 등록하면 쓰지 않는 조각도 받는다
   (C6). `dc-circuit` 이 `solveMna` 를 직접 import 하는 것이 선례다
4. **어휘 추가마다 셋을 맞춘다** — 렌더러 구현 · `CORE_RENDERERS` · `scripts/lib/capabilities.mts`
   의 `RENDERERS` 표. 마지막을 빠뜨리면 그 어휘를 선언한 조각이 아무것도 안 그려진다

## 4. 엔진이 아닌 것 — 사용자 결정

**공용 계산 도구를 허용한다 (2026-09-12 사용자 결정).** 원칙 1 의 sim 허용 목록이 「schema
선언 타입 + 도메인 plugin 의 순수 계산 함수」이므로 plugin 에 둔다.

2026-09-10 에 시간표 헬퍼 패키지(안 A)를 기각한 근거는 둘이었다 — ⓐ 원칙 1 을 넓혀야 하고
ⓑ 단계 길이와 캡션이 코드에 남아 저작자가 손댈 수 없다. **이번 허용은 ⓐ만 푼 것으로 읽는다.**
그래서 plugin 에 두는 것은 **순수 물리 계산**(구속 운동의 에너지 보존, 1차 추종 각도 적분)
뿐이고, 연출·시간표는 계속 선언(`timeline` · `caption`)이다.

## 5. 이관 — 10/10

격리된 에이전트 10개가 병렬로 옮겼다. 지시서는 `PORT_BRIEF.md` 에 조각마다 **이번에 새로
생긴 선언이 원본의 어느 부분에 대응하는지**를 짝지어 채웠다 — "네 분자 280개가
`particleSystem`, 벽 두드림이 `trace`, 2초 미리 굴린 것이 `preroll`" 처럼.

- **자유 렌더 0건.** 열 조각 모두 `Bundle.renderers` 없이 표준 어휘로만 섰다
- 게이트 — `pnpm -r typecheck` 오류 0 · `pnpm test` 100건 · `gen:capabilities` 20개 ·
  `catalog:gen` 20개 번들
- 새 어휘가 **실제로 쓰였다.** 조각마다 렌더러 3~6종 · 조작기 0~1. `trace` 는 6조각이,
  `preroll` 은 5조각이, `heldPath` 는 5조각이, `luminance` 는 `apparent-brightness` 가
  쓴다 — 원칙 4 의 「이관될 조각이 실제로 선언해야 한다」를 충족한다

### 이관에서 새로 드러난 어휘 부족

조각들이 `NOTES.md` 「어휘 부족」에 적은 것이다. **다음 배치의 엔진 대조 입력이다.**

| 부족 | 적은 조각 |
|---|---|
| **`trace` 의 크기가 화면 px 라 월드 도형에 맞출 수 없다** — 링이 칸을 감싸야 하는데 배율을 가정해야 한다. `sizeSpace: 'world' \| 'screen'` 이 필요하다 | doppler-effect · apparent-brightness · gas-pressure |
| `trace` 의 `strength` 가 길이와 진하기를 **함께** 진다 — "세기는 길이로, 나이는 진하기로" 를 말할 수 없다 | gas-pressure |
| `trace` 의 나이 감쇠가 선형 고정 — 사건 직후 강조는 대개 지수다(세 조각이 exp 를 손으로 짰다) | apparent-brightness |
| `particleSystem` 에 경계(clip)와 대비 테두리가 없다 — 밝은 면 위의 입자가 묻혀 **세어지지 않는다** | gas-pressure · apparent-brightness |
| `surface` 에 굵기·색 역할이 없다(`lineWidth = 3` 고정) — 재는 벽을 두께로 가르지 못한다 | gas-pressure |
| `gauge` 가 자리·크기·방향이 코어에 박혀 있고 숫자를 끌 수 없다 (원칙 7 ③) | gas-pressure |
| `vector` 의 이름표 자리를 선언이 고르지 못한다(40% 지점 고정) — 화살표 하나가 선언 둘이 됐다 | lenz-law |
| 값에 묶인 화살표의 **임계 이하 자동 소거**가 없다 | lenz-law |
| `slider` 의 값 표시가 `toFixed(2)` 고정이고 눈금 간격(step)이 없다 — 정수로 읽어야 할 온도가 `180.00 K` 로 뜬다 | gas-pressure · pendulum-isochronism |
| **`step` 이 `timeline` 을 받지 못한다** — 시간표가 정하는 양이 물리에 들어가야 하는 조각이 있다. 이징 곡선을 푸는 코드가 엔진과 조각 두 곳에 생긴다 | gas-pressure · doppler-effect |
| **React `Embed` 가 `BundleSchema.canvas` 를 읽지 않는다** — 선언은 있는데 그 경로에 구현이 없다 (S-render) | lenz-law |
| 물체를 직접 잡아 끄는 조작기가 없다 — `scale-drag` 로 근사하면 자기 손잡이 원을 그리고 트랙 근처를 전부 잡는다 | lenz-law |
| 굵기가 변하는 궤적 · `CaptionSlotDef.vars`(캡션에 수 넣기) · 윤곽선을 가진 `body` | pendulum-isochronism · current-magnetic-field |
| 시간표 단계 경계에 부동소수 여유(EPS)가 없다 — 결정타 시각이 경계면 캡션만 한 박자 뒤처진다 | apparent-brightness |

### 절차에서 드러난 것

- **카탈로그 연결이 빠져 열 조각이 모두 화면 대조에 막혔다.** `catalog.json` 의 주제에
  `simId` 가 없으면 `piece:report --sims` 가 sims 샷을 한 장도 만들지 않는다. 그 파일은
  `catalog:topics` 생성물이고 이관 에이전트에게는 금지된 공유 파일이라, **메인이 이관 전에
  배선했어야 했다.** 스텁·loader·의존은 미리 만들었는데 주제 연결을 빠뜨렸다.
  → 다음 배치에서는 스텁 생성 단계에 `IMPLEMENTED` 등록을 함께 넣는다.
- **dev 서버 주소를 확인 없이 지시서에 적었다.** `5173` 은 FACET Playground 였고 aperi21
  카탈로그는 `5174` 다. 조각 하나가 DOM 제목을 보고 찾아냈다.
- **`piece-report.mts` 가 「조각 id = 주제 id」를 가정하고 있었다.** 주제를 연결한 뒤에도
  여덟 조각이 여전히 sims 샷을 못 만들었다 — `simIdOf` 가 조각 id 로 주제를 찾고
  `#/topic/<조각 id>` 로 열었기 때문이다. 우연히 id 가 같았던 `beats`·`doppler-effect`
  둘만 찍혔다.

  이 배치가 그 가정을 깬 것은 **정상이다.** 주제 이름은 물리 개념의 이름이고(`lenzs-law` ·
  `thermal-conduction` · `newtons-first-law`) 조각 id 는 그 개념의 한 시각화다 — 주제 하나가
  조각 하나가 되지 않는다는 것이 `PHYSICS-TOPICS.md` 의 전제이기도 하다. 그래서 가정을
  고쳤다: `topicIdOf` 가 `simId === 'aperi21:<조각 id>'` 인 주제를 **거꾸로** 찾는다.
  등록 키가 조각 id 와 문자 그대로 같기를 C4 가 강제하므로 이 조회는 언제나 성립한다.
- **화면 대조를 마쳤다** — 원본 50장 · sims 45장, 아홉 조각이 같은 시각에 1:1로 짝을 이룬다
  (`tasks/piece-lab/_report/01-broad/index.html`). 빠진 다섯 장은 `apparent-brightness`
  하나이고, 대응 주제가 `PHYSICS-TOPICS.md` 에 없어 사용자 판단을 기다리는 중이다.
- 조각들은 막혀 있던 동안 **수치 대조로 대신했다** — 원본 코드를 같은 시계 규약으로 돌려
  선언값과 맞댔고, 증거 프레임이 같은 수로 재현되는 것을 보였다. 그 기록은 각 `NOTES.md`
  에 남아 있고, 화면 대조와 함께 보면 두 겹의 확인이 된다.

## 6. 자기 신고 중 엔진 일이 아니었던 것

| 신고 | 판정 |
|---|---|
| 논리 좌표계 스케일 · DPR 보정 (9조각이 요구) | **러너가 이미 한다.** 조각이 짤 일이 아니었다 |
| 자동 진행 시간표 (4조각이 요구) | **`timeline` 이 이미 있다** |
| 국면 → 문장 표 (4조각이 요구) | **`caption` 슬롯이 이미 있다** |
| 분포 샘플러 · 확산 적분기 · 적분기 선택 | 조각의 물리. 적분기를 엔진이 고정하면 진자가 깨진다 |
| 압력 막대의 요동 | 조각의 **내용**이다. 엔진이 평활하면 주장이 죽는다 |
| 색 배정 · 무엇을 그릴지 · 레이아웃 | 저작 결정. 선언이 쥐는 지금 구조가 이미 만족한다 |
