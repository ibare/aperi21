# 어휘 부족 장부

표현력 검증(`tasks/piece-lab/_batches/probe-9domains.json`)의 측정값을 적는 곳이다.

- **새 부족 종류**만 턴의 측정값이 된다. 이미 여기 있는 부족을 또 겪으면 「겪은 조각」 에 id 만 더한다.
- 한 턴에 새 부족 종류가 0 인 분야는 다음 턴부터 뺀다.
- 부족마다 **영향**을 적는다.
  - `주장` — 어휘로 근사하면 조각의 주장이 약해지거나 틀린다. 턴 사이에 엔진에 반영한다.
  - `근사` — 모양만 조금 다르다. 검증이 끝난 뒤 겪은 조각 수 순으로 처리한다.
- 장부에 올리는 것은 **엔진 어휘**의 부족이다. 조각의 물리 계산 · 배치 계산은 올리지 않는다.

## 기준선 — 05~07 배치(운동학 · 뉴턴 역학)에서 이미 나온 부족

검증 전에 적었다. 겪은 조각은 각 sim 의 `NOTES.md` 「어휘 부족」 에서 옮겼고 전수가 아니다.

| id | 부족 | 영향 | 겪은 조각 (일부) |
|---|---|---|---|
| G01 | `step` 이 `TimelineFrame` 을 받지 못한다 — 조각이 시계를 따로 세고 시간표를 다시 계산한다 | 근사 | inclined-plane · apparent-weight · atwood-machine · balance-scale · impulse-force-relation · stress-strain-curve · banked-curve · free-body-diagram · equilibrium-of-forces · kinetic-friction · normal-force · angle-of-friction · tension · conical-pendulum · buoyant-force-as-force · fictitious-force · phase-space · color-addition · bernoullis-principle · maxwell-boltzmann-distribution · spacetime-diagram · tidal-force · potential-energy-curve · hr-diagram · equipotential-surface |
| G02 | 화살촉 크기 상한이 길이의 0.35 로 고정 — 짧은 화살표의 방향이 약하다 | 근사 | gravitational-acceleration · newtons-second-law · inclined-plane · mechanical-advantage · normal-force · buoyant-force-as-force · gyroscopic-precession |
| G03 | `body` 둘레의 굵기 · 색을 채움과 따로 고를 수 없다 | 근사 | coriolis-effect · static-friction · vertical-loop · equilibrium-of-forces · angle-of-friction · interference · phase-space · field-lines · equipotential-surface |
| G04 | 선 끝 · 이음 모양을 고를 수 없다 | 근사 | static-friction · stress-strain-curve · mechanical-advantage · carnot-cycle |
| G05 | 점선 무늬(대시 길이 · 간격)를 선언할 수 없다 | 근사 | non-inertial-frame · stress-strain-curve · banked-curve · youngs-modulus · fictitious-force · phase-space · tidal-force · bernoullis-principle · maxwell-boltzmann-distribution · spacetime-diagram · potential-energy-curve · gyroscopic-precession · carnot-cycle |
| G06 | `rect` 에 모서리 둥글림이 없다 | 근사 | newtons-second-law · apparent-weight · non-inertial-frame · inertial-vs-gravitational-mass · tension |
| G07 | 짙은 물체 위 글자에 쓸 반전(바탕) 색 역할이 없다 | 근사 | atwood-machine · pulley-system · connected-bodies · youngs-modulus · field-lines · spacetime-diagram · equipotential-surface |
| G08 | 재질 · 옅은 면 톤에 맞는 색 역할이 없다 (`luminance` 로 눈대중) | 근사 | coriolis-effect · non-inertial-frame · impulse-force-relation · angle-of-friction · inertial-vs-gravitational-mass · energy-flow-diagram · field-lines · tidal-force · bernoullis-principle · maxwell-boltzmann-distribution · gyroscopic-precession · equipotential-surface |
| G09 | 여러 인스턴스를 한꺼번에 흐리게 하는 묶음 불투명도가 없다 | 근사 | non-inertial-frame · stress-strain-curve · phase-space · tidal-force |
| G10 | 판(패널) 단위 좌표계가 없다 — 인스턴스마다 위치를 옮긴다 | 근사 | coriolis-effect · non-inertial-frame · tidal-force |
| G11 | 시간표 이징 곡선이 모자라다 (감속 출발 · 코사인 · inOutQuad) | 근사 | net-force · inclined-plane · spring-force · pulley-system · buoyant-force-as-force |
| G12 | 여러 단계에 걸친 이징을 선언할 자리가 없다 | 근사 | stress-strain-curve |
| G13 | 시간표 단계에 값을 실을 수 없고, 단계 길이가 상태 · 조작값을 따라가지 못한다 | 근사 | atwood-machine · normal-force · inertial-vs-gravitational-mass · impulse-force-relation · interference · spacetime-diagram · equipotential-surface |
| G14 | 캡션 `vars` 에 문안 키를 넣을 수 없다 · 캡션 조건이 경로 하나뿐이다 | 근사 | free-body-diagram · drag-force · bernoullis-principle · potential-energy-curve · hr-diagram |
| G15 | 캡션을 흐리게 사라지게 하거나 단계마다 페이드를 정할 수 없다 | 근사 | static-friction |
| G16 | `readout` 이 회전하지 않고, 글자 기준선에 맞출 수 없다 | 근사 | coriolis-effect · mechanical-advantage · kinetic-friction · phase-space · potential-energy-curve · hr-diagram · carnot-cycle |
| G17 | `vector.label` 의 크기 · 자리가 고정이고 값을 끼울 수 없다 | 근사 | vertical-loop · connected-bodies · buoyant-force-as-force · gyroscopic-precession |
| G18 | `region` 에 구멍이 없고 테두리 굵기를 못 고른다 | 근사 | banked-curve · drag-force · normal-force |
| G19 | `dimension` 이 점선뿐이다 | 근사 | stress-strain-curve |
| G20 | 용수철 옆 폭 · 굵기, 줄 굵기 · 짙기를 고를 수 없다 | 근사 | spring-force · centripetal-force · buoyant-force-as-force · tension · phase-space |
| G21 | `point-drag` 손잡이를 숨기거나 범위 · 판정 모양을 줄 수 없다 | 근사 | balance-scale · equilibrium-of-forces · tension · color-addition · field-lines · potential-energy-curve · thin-film-interference · equipotential-surface |
| G22 | `slider` 값 표시 끄기 · 끝 이름표 · 단위 번역이 없다 | 근사 | impulse-force-relation · conical-pendulum · angle-of-friction · bernoullis-principle · spacetime-diagram · gyroscopic-precession · lift-force |
| G23 | `restart` 는 엔진 시계만 되돌려 상태를 쌓는 조각에는 효과가 없다 | 근사 | inertial-vs-gravitational-mass · lift-force |
| G24 | 러너 여백 · 선언한 조작기 · 캡션 자리가 프레이밍 여백으로 잡히지 않는다 | 근사 | static-friction · banked-curve · tension · interference · field-lines · bernoullis-principle · maxwell-boltzmann-distribution · spacetime-diagram(그림 밖 캡션·조작기 줄) · potential-energy-curve · gyroscopic-precession · lift-force · carnot-cycle · longitudinal-wave · equipotential-surface · atomic-orbital |
| G25 | 화면 px 로 고정되는 크기가 없고, 글자가 배율을 따르지 않는다 | 근사 | vertical-loop · non-inertial-frame · fictitious-force · interference · energy-flow-diagram · field-lines · tidal-force · maxwell-boltzmann-distribution · spacetime-diagram · gyroscopic-precession · hr-diagram · longitudinal-wave · thin-film-interference · equipotential-surface |
| G26 | 가는 선을 화면 픽셀에 맞추는 선언이 없다 | 근사 | youngs-modulus |
| G27 | `button` 에 비활성 모양이 없다 | 근사 | centripetal-force |
| G28 | 곡선(베지어) · 타원 어휘가 없어 점으로 표본한다 | 근사 | free-body-diagram · fictitious-force · energy-flow-diagram · field-lines · gyroscopic-precession · equipotential-surface |

## 턴 기록

(턴마다 새 부족을 아래에 이어 적고, 분야별 새 부족 수를 표로 남긴다.)

## 턴 1 (2026-09-17) — 9개 분야 각 1번

### 새 부족

같은 턴에 두 분야가 같은 종류를 처음 보고하면 **두 분야 모두** 새 부족으로 센다(턴 시작 때 장부에 없었으므로).

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G29 | 자리마다 값이 있는 스칼라 장(격자 값)을 칠하는 어휘가 없다 — 칸마다 `region` 을 수백~수천 개 선언한다 (간섭 8208개 · 베르누이 400개). 실시간 프레임 비용 미확인 | 근사 | interference · bernoullis-principle |
| G30 | 값→색 척도가 없다 (음·0·양 발산형, 순차형). `luminance` 한 줄로 근사해 대비가 약하고 다크 테마에서 뒤집힌다 | 근사 | interference · bernoullis-principle · lift-force · longitudinal-wave · equipotential-surface |
| G31 | 그라데이션 채움(선형 · 방사형)이 없다 — 알파를 겹친 원판 56장, 층을 쌓은 꼬리로 흉내 낸다 | 근사 | energy-flow-diagram · tidal-force · hr-diagram |
| G32 | `particleSystem` 이 인스턴스 하나에 색 · 알파 하나다 — 입자별 색 · 알파가 없다 | 근사 | energy-flow-diagram · hr-diagram |
| G33 | 빛의 원색 · 합색(빨강 · 초록 · 파랑 · 노랑 · 청록 · 자홍 · 흰)에 맞는 색 역할이 없다 — 「빨강 + 초록 = 노랑」 이 색으로 서지 않는다 | **주장** | color-addition · thin-film-interference |
| G34 | 테마와 무관한 절대 검정 · 흰이 없다 — 흰 합색이 배경 미색이 되고, 다크 테마에서 막과 흰 칸의 밝기가 뒤집힐 것으로 보인다(다크 미촬영) | **주장** | color-addition · thin-film-interference |
| G35 | 가산 합성(겹친 빛을 더해 칠하기)이 없다 — 겹친 칸을 도형으로 잘라 따로 칠한다 | 근사 | color-addition |
| G36 | `point-drag` 가 잡은 자리와 중심의 어긋남을 유지하지 못한다 — 가장자리를 잡아도 중심이 포인터로 뛴다 | 근사 | color-addition |
| G37 | 입자별 위치 이력 잔상이 없다 — `particleSystem.trail` 은 속도 반대 방향 직선 획뿐 | 근사 | phase-space |
| G38 | 감기는 좌표(−π~π)에서 선을 끊는 기능이 없다 | 근사 | phase-space |
| G39 | 실시간 `step` 의 dt 가 가변이라 고정 걸음을 쓰려면 조각이 누적기를 둔다 | 근사 | phase-space · color-addition · potential-energy-curve · lift-force |
| G40 | `particleSystem` 꼬리의 알파 · 굵기 · 길이 계수가 고정이고 길이 상한 · 머리 점 끄기가 없다 — 그대로 쓰면 빠른 곳 꼬리가 사라져 「선이 몰린 곳이 세다」 가 뒤집혀 보인다. 입자마다 `trajectory` 950개로 우회 | **주장** | field-lines |
| G41 | 벡터장을 흐르는 획(격자 화살표 · 짧은 획)으로 그리는 어휘가 없다 — 획마다 인스턴스 최대 약 156개, 표현의 대부분이 scene 코드에 있다 | 근사 | tidal-force |
| G42 | `timeScale` 을 적용하기 전의 화면 시각을 조각이 받지 못한다 | 근사 | tidal-force |
| G43 | `particleSystem` 점 모양(사각 등)을 고를 수 없다 | 근사 | tidal-force |
| G44 | 값의 변화 방향(오름 · 내림 · 멈춤)으로 캡션을 고르거나, 조작하면 단계 캡션에서 상태 캡션으로 넘기는 전환을 선언할 자리가 없다 | 근사 | maxwell-boltzmann-distribution |
| G45 | `trace` ring 의 속을 바탕색으로 채울 수 없다 | 근사 | maxwell-boltzmann-distribution · spacetime-diagram |
| G46 | `slider.step` 이 값 글자까지 눈금에 붙인다 (744 → 750) | 근사 | maxwell-boltzmann-distribution |
| G47 | 그래프 축 어휘가 없다 — `scale` linear 는 값 표식을 늘 그리고 눈금 숫자를 강조색으로 칠해, 대신 쓰면 강조색이 두 뜻이 된다 | 근사 | maxwell-boltzmann-distribution · phase-space(세로축 이름을 세우지 못함) · hr-diagram · thin-film-interference |
| G48 | 한 점과 기울기로 긋는 무한 직선이 없다 | 근사 | spacetime-diagram |
| G49 | 선 끝 이름표를 화면 안에 두기 (`readout.clamp` 로 되는지 미확인) | 근사 | spacetime-diagram |
| G50 | 글자 둘레 바탕색 테두리가 없다 | 근사 | spacetime-diagram |
| G51 | 조각 선언이 인스턴스를 수백~수천 개 만들 때의 성능 한도가 없다 — 간섭 8208 · 전기력선 950 · 위상 공간 520+. 실시간 프레임률 미확인 | 미정 | interference · field-lines · phase-space · lift-force · equipotential-surface |

### 분야별 새 부족 수

| 분야 | 조각 | 새 부족 | 그중 주장 | 다음 턴 |
|---|---|---|---|---|
| 일·에너지·운동량 | energy-flow-diagram | 2 (G31 · G32) | 0 | 계속 |
| 회전과 진동 | phase-space | 5 (G37 · G38 · G39 · G47 · G51) | 0 | 계속 |
| 중력과 천체 | tidal-force | 4 (G31 · G41 · G42 · G43) | 0 | 계속 |
| 유체 | bernoullis-principle | 2 (G29 · G30) | 0 | 계속 |
| 열과 통계 | maxwell-boltzmann-distribution | 4 (G44 · G45 · G46 · G47) | 0 | 계속 |
| 파동과 음향 | interference | 3 (G29 · G30 · G51) | 0 | 계속 |
| 광학 | color-addition | 5 (G33 · G34 · G35 · G36 · G39) | 2 | 계속 |
| 전자기 | field-lines | 2 (G40 · G51) | 1 | 계속 |
| 현대물리 | spacetime-diagram | 4 (G45 · G48 · G49 · G50) | 0 | 계속 |

제외되는 분야 없음. G51 은 부족이 아니라 확인해야 할 위험이라 영향을 정하지 않았다.

### 턴 1 뒤 결정 (2026-09-17 사용자)

- **G33 · G34 → 「빛 색」 별도 트랙.** 빛의 색은 테마 색 역할(대상 구분)이 아니라 물리량이다. 가산 합성 · 스펙트럼색 · 흑체색 ·
  적색 이동이 광학 · 현대물리 · 천체의 약 20개 주제에 걸쳐 턴 사이 작업으로 다루지 않는다. G35 도 함께 간다.
- **턴 사이 엔진 작업:** G40(주장) 과 같은 계열 G32 · G37 · G43 (입자 묶음), 그리고 성능 위험 G51 을 푸는 묶음 그리기 — G29 · G30
  (스칼라 장을 이미지 한 장으로 · 값→색 척도) · G41 (선 · 획 묶음). 원칙 「선언은 묶음 하나, 그리기는 한 번」.
  이번 턴의 우회 조각(간섭 · 베르누이 · 전기력선 · 위상 공간 · 조석력 · 에너지 흐름도)을 새 어휘로 되돌린다.
- **선언 수 측정:** 한 프레임 선언 수를 `pnpm budget` 에 숫자로만 보고한다. 기준값은 데이터가 쌓인 뒤 정한다.


### 묶음 그리기 뒤 (2026-09-17, 턴 1 과 턴 2 사이)

엔진에 `particleSystem` 확장(`opacities` · `shape` · `showParticles` · `trailStyle`), 새 어휘 `scalarField` · `lineSet` 을 넣고
우회 조각 6 개를 되돌렸다. 위치 이력 잔상 `trails` 는 넣었다가 사용처가 없어 같은 날 지웠다(원칙 4).

| id | 상태 | 근거 |
|---|---|---|
| G29 | 해결됨 | interference · bernoullis-principle 이 `scalarField` 하나로 칠한다 |
| G30 | 일부 해결 | 발산형 · 순차형은 들어왔다. 한 역할 안에서 음 · 양을 가르는 것은 G54 |
| G31 | 일부 해결 | tidal-force 의 방사형 음영은 `scalarField` 로 풀림. energy-flow-diagram 의 한 방향 옅어짐(`region` 그라데이션)은 남음 |
| G32 | 일부 해결 | 입자별 투명도는 `opacities`. 입자별 색은 남음(종류마다 인스턴스 하나) |
| G37 | 해결됨 | phase-space 가 선분별 짙기가 필요해 `lineSet` + `opacities` 로 풀었다 (`trails` 는 불필요) |
| G40 | 해결됨 (주장) | field-lines 가 `trailStyle` · `showParticles:false` 로 원본과 같은 꼬리 |
| G41 | 해결됨 | tidal-force 흐름 획 · field-lines 전기력선 · phase-space 고리가 `lineSet` |
| G43 | 해결됨 | tidal-force · energy-flow-diagram 이 `shape:'square'` |
| G51 | 일부 해결 | 첫 프레임 선언 수: interference 8210→3 · field-lines 980→8 · phase-space 544→15 · bernoullis-principle 480→81 · tidal-force 215→19 · energy-flow-diagram 70→62. 값 배열(간섭 73100 · 위상 공간 선분 약 4700)은 매 프레임 새로 만들고, 실시간 프레임률은 미측정 |

되돌리기에서 드러난 새 부족 (측정값에는 넣지 않는다 — 턴이 아니라 엔진 작업의 결과):

| id | 부족 | 영향 | 조각 |
|---|---|---|---|
| G52 | `trailStyle.maxLength` 가 화면 px 뿐이라 월드 단위 꼬리 상한을 선언하지 못한다 — 넘기는 속도를 줄여 우회 | 근사 | field-lines |
| G53 | `opacities` 를 8 단계로 반올림해 1/16 미만이 그려지지 않는다 — 가장 옅은 끝이 잘린다 | 근사 | tidal-force · carnot-cycle · equipotential-surface · atomic-orbital |
| G54 | `scalarField` 발산형에서 같은 역할을 양쪽에 주면 음 · 양이 같은 짙기라 부호가 갈리지 않는다(물결 띠가 반 파장 간격으로 보임). 한 역할 안에서 음 · 양을 짙기 · 결로 가르는 사상이 없다 | 근사 | interference |

## 턴 2 (2026-09-17) — 9개 분야 각 2번

### 새 부족

판정 기준: 장부 항목의 문안이 그 모자람을 적고 있지 않으면 새 id 로 세운다(턴 1 뒤 G54 를 G30 과 따로 세운 입도와 같다).
이관 에이전트가 장부 id 에 댄 것이라도 문안에 없으면 새로 세웠고(G61 흑체색 · G62), 새 부족이라 한 것이라도 문안에 있으면 장부 id 로 돌렸다
(thin-film-interference 의 「조작기 하나에 판정 자리 둘」 → G21 「판정 모양」).

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G55 | 고정 시점 3차원 투영이 없다 — 3차원 점 · 원 · 원판 · 화살표를 선언할 수 없어 조각이 투영 수식과 깊이 순서(단계별 인스턴스)를 짠다. 저작자가 시점을 못 바꾼다 | 근사 | gyroscopic-precession · atomic-orbital |
| G56 | 높이장을 3차원 곡면으로 그리는 어휘가 없다 — 투영 · 가려짐 · 기울기 음영을 조각이 구워 `scalarField` 한 장으로 넘긴다. 곡면 위 선 · 점의 가려짐도 조각이 뺀다 | 근사 | equipotential-surface |
| G57 | 머리 있는 화살표 묶음이 없다 — `vector` 는 낱개, `lineSet` 은 머리가 없어 꺾쇠 두 획으로 흉내 낸다 | 근사 | gyroscopic-precession |
| G58 | 캡션 문안의 일부(값 하나)에 강조색 · 굵기를 걸 수 없다 — 화면 표식과 캡션 숫자를 색으로 잇지 못한다 | 근사 | hr-diagram |
| G59 | `TimelineFrame` 에 다른 시각의 진행도를 묻는 자리가 없다 — 「조금 전 자리」 꼬리를 위해 조각이 단계 길이 · 이징을 다시 계산한다 | 근사 | hr-diagram |
| G60 | 파장마다 그 파장의 색으로 칠하는 스펙트럼 채움이 없다 — 「골이 초록 자리에 왔다」 가 눈금 숫자로만 읽힌다 (빛 색 트랙) | **주장** | thin-film-interference |
| G61 | 물리 계산이 낸 색(값 → RGB)을 칠할 수 없다 — `scalarField` 색표 · 입자 색이 테마 역할의 명암뿐이다. 반사색 · 흑체색 (빛 색 트랙) | **주장** (thin-film) · 근사 (hr) | thin-film-interference · hr-diagram |
| G62 | `scalarField` 의 값→색 사상 곡선 · 섞기 공간을 고를 수 없다 — 선형광 고정이라 원본의 농도 · 명도 사상을 옮기려면 조각이 테마 명도 숫자를 들고 되풀거나(다크에서 틀림) 중간 농도를 잃는다 | 근사 | lift-force · longitudinal-wave |
| G63 | `lineSet` 굵기를 월드 단위로 줄 수 없다 — 월드 간격으로 놓은 기둥이 배율에 따라 뜨거나 겹친다 | 근사 | carnot-cycle |
| G64 | `trace` 자국마다 수명을 줄 수 없다 — 인스턴스 하나에 수명 하나 | 근사 | atomic-orbital |
| G65 | `param-chips` 선택 표시 모양을 고를 수 없다 | 근사 | atomic-orbital |
| G66 | 스칼라 장에서 등고선(같은 값 선)을 뽑는 어휘가 없다 — 조각이 마칭 스퀘어로 선분 2257개를 만들어 `lineSet` 로 넘긴다 | 근사 | equipotential-surface |

### 분야별 새 부족 수

| 분야 | 조각 | 새 부족 | 그중 주장 | 다음 턴 |
|---|---|---|---|---|
| 일·에너지·운동량 | potential-energy-curve | 0 | 0 | **제외** |
| 회전과 진동 | gyroscopic-precession | 2 (G55 · G57) | 0 | 계속 |
| 중력과 천체 | hr-diagram | 3 (G58 · G59 · G61) | 0 | 계속 |
| 유체 | lift-force | 1 (G62) | 0 | 계속 |
| 열과 통계 | carnot-cycle | 1 (G63) | 0 | 계속 |
| 파동과 음향 | longitudinal-wave | 1 (G62) | 0 | 계속 |
| 광학 | thin-film-interference | 2 (G60 · G61) | 2 | 계속 |
| 전자기 | equipotential-surface | 2 (G56 · G66) | 0 | 계속 |
| 현대물리 | atomic-orbital | 3 (G55 · G64 · G65) | 0 | 계속 |

주장 부족 G60 · G61 은 모두 빛 색 트랙 소속이다. 그 밖의 주장 부족은 없다.
