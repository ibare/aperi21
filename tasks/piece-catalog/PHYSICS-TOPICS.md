# 물리 주제 목록 — 1단계 산출물

> 작성 2026-09-09 · 개정 (1단계 방법으로 다시 씀)
> 근거: `tasks/facet-insights/ANALYSIS.md`, FACET `packages/authoring/src/concept-types.ts`

## 이 문서를 읽는 법

### 도메인은 열거의 비계다

소비 측(글)은 도메인을 보지 않는다. **주제 목록 전체에서 필요한 것을 집어간다.**
그래서 주제 하나가 여러 도메인의 글에 쓰이는 것이 정상이고, 주제와 도메인은 **1:N** 이다.

FACET 이 이것을 구조로 못박아 뒀다 — 카탈로그 항목의 `origin` 은 "어디서 나왔나" 이지
"어디에 속하나" 가 아니다.

> **출처와 소속을 구분한다.** 조각은 여러 주제의 글에 등장하므로 **소속이 N개**지만,
> 그것을 만들게 한 그룹은 하나다. 디렉터리 배치는 **출처**를 뜻한다. — `S-piece.md`

아래의 분과 구획은 **우리가 빠짐없이 훑기 위한 편의**일 뿐, 사용법이 아니다.

### 겹침은 결함이 아니라 예상 산출물이다

같은 주제가 여러 분과에서 나온다. 지수 감쇠는 방사성 붕괴에서도, RC 회로에서도,
감쇠 진동에서도 나온다. **그대로 둔다.** 여기서 지우지 않는다.

### 세 단계와 그 발동 시점

| 단계 | 하는 일 | 언제 |
|---|---|---|
| **1** | 세운 도메인으로 **최대한** 뽑는다. 겹침을 걱정하지 않는다 | 도메인별로, 미리 — **이 문서** |
| **2** | 겹치면 하나만 남긴다. 어느 쪽을 남길지는 상관없다 | **구현 직전**, 그 주제에서 |
| **3** | 정말 설 만한 주제인가 | **구현 직전**, 그 주제에서 |

**2·3단계를 일괄로 하지 않는다.** 도메인을 구현해 나가면서 주제마다 그 자리에서
발동시킨다 — "이미 구현됐나?" 그렇다면 제거(2단계), "이게 혼자 서나?" 아니면 제거(3단계).

일괄 제거는 목록 전체를 한눈에 놓고 판단해야 하는데 그것이 안 된다. 구현 직전에는 그
주제에 대한 맥락이 가장 두꺼워 두 판단이 싸고 정확하다. 끝내 도달하지 않을 주제를 미리
거를 필요도 없다.

### 분과별 수는 맞추지 않는다

균형은 목표가 아니다. 1단계의 목표는 **각 도메인을 최대한 짜내는 것**이다. 분과가
비계인 이상 그 사이의 비율에는 뜻이 없다.

---

## 구현 때 채울 필수 인터페이스

주제를 구현할 때 **호스트 서비스가 임베딩할 수 있는 공통 인터페이스**를 함께 선언한다.
FACET `concept-types.ts` 와 **같은 구조**를 쓴다. 이 목록의 항목은 그 선언의 `label`
자리에 해당하며, 나머지는 구현 시점에 쓴다.

```
id                              변별 가능한 식별자. 봉투 {aperi21:<id>} 의 <id>
label                           사람이 읽는 이름 (이 문서의 "이름" 열)
domain                          출처 도메인
canonicalSim                    이 개념의 기본 진입점

surface                         ── 임베딩 재료. 호스트가 이것만 보고 글↔개념 매칭
  definition                    정체 한 문장. **영어 단일**, 20~30 단어. 은유·수사 금지
  exemplarKeywords[]            definition 이 담지 않는 구어·약어·응용 맥락

briefing                        ── 선택 이후 재료. writer 의 집필 재료
  observable[]                  화면에서 실제로 관찰되는 사건
  screen.affordances[]          독자가 할 수 있는 조작과 초기 상태
  useWhen[]                     붙일 만한 자리
  avoidWhen[]                   붙이면 안 되는 조건
  contrastWith[]                인접 개념 대비 { concept, note }
```

**지켜야 하는 것 다섯.**

1. **surface 와 briefing 을 섞지 않는다.** 한 필드에 두 용도를 겹치면 양쪽 다 나빠진다.
2. **definition 은 영어 단일.** 언어별로 나눠 임베딩하면 같은 개념이 벡터 공간에서 두
   점으로 갈라져 매칭 점수가 글의 언어에 따라 흔들린다.
3. **`id` 의 변별력이 오선택을 막는 첫 방어선이다.** 같은 일반 명사를 쓰는 다른 개념이
   있거나 생길 수 있으면 변별어를 붙인다. `avoidWhen` 은 그것을 통과한 나머지를 막는
   두 번째 방어선이다.
4. **`avoidWhen` 은 어디에서도 도출되지 않는다.** 검색이 만드는 오검출을 되돌리는 유일한
   장치다. 비워 두면 오검출을 막을 방법이 없다.
5. **`useWhen` 은 같은 개념에 화면이 둘일 때 어느 쪽인지를 가린다.** 우리의 조각/실험실
   짝이 정확히 그 경우다 — definition 이 겹치므로 검색은 원리상 답을 낼 수 없다.

> `id` 표기는 우리 DSL 관례에 따라 kebab-case 로 둔다 (FACET 은 lowerCamelCase).
> 필드 스키마와 의미는 동일하되 표기는 이미 쓰이는 봉투(`aperi21:dc-circuit`)와 맞춘다.

---

## 1. 운동학

| id | 이름 | 다루는 것 |
|---|---|---|
| `displacement-vs-distance` | 변위와 이동 거리 | 방향을 가진 양과 누적된 양의 차이 |
| `reference-frame` | 기준틀 | 관찰자에 따라 달라지는 운동 기술 |
| `coordinate-choice` | 좌표계 선택 | 축을 어디에 두느냐가 식을 바꾸는 방식 |
| `average-velocity` | 평균 속도 | 구간 전체를 대표하는 속도 |
| `instantaneous-velocity` | 순간 속도 | 구간을 0으로 줄인 극한 |
| `speed-vs-velocity` | 속력과 속도 | 크기만인 양과 방향까지 가진 양 |
| `average-acceleration` | 평균 가속도 | 속도 변화의 비율 |
| `instantaneous-acceleration` | 순간 가속도 | 속도의 순간 변화율 |
| `direction-of-acceleration` | 가속도의 방향 | 속도와 같은 방향인지 반대인지가 정하는 것 |
| `uniform-motion` | 등속 운동 | 속도가 변하지 않는 운동 |
| `uniformly-accelerated-motion` | 등가속도 운동 | 가속도가 일정한 운동의 세 식 |
| `position-time-graph` | 위치-시간 그래프 | 기울기가 속도인 표현 |
| `velocity-time-graph` | 속도-시간 그래프 | 기울기가 가속도, 넓이가 변위인 표현 |
| `acceleration-time-graph` | 가속도-시간 그래프 | 넓이가 속도 변화인 표현 |
| `free-fall` | 자유 낙하 | 중력만 받는 연직 운동 |
| `vertical-throw` | 연직 투상 | 올라갔다 내려오는 운동의 대칭 |
| `gravitational-acceleration` | 중력 가속도 | 질량과 무관한 낙하 가속도 |
| `fall-with-air-resistance` | 저항이 있는 낙하 | 속도에 의존하는 저항과 그 결과 |
| `terminal-velocity` | 종단 속도 | 저항과 중력이 균형에 이르는 속도 |
| `vector-decomposition` | 벡터의 성분 분해 | 한 벡터를 축 방향으로 나누기 |
| `vector-addition` | 벡터의 합성 | 꼬리와 머리를 잇는 덧셈 |
| `relative-velocity` | 상대 속도 | 기준틀 사이의 속도 변환 |
| `river-crossing` | 강 건너기 | 두 속도의 합성이 만드는 경로 |
| `projectile-motion` | 포물선 운동 | 수평·연직 성분의 독립 |
| `trajectory-equation` | 궤적 방정식 | 시간을 소거해 얻은 경로의 식 |
| `uniform-circular-motion` | 등속 원운동 | 속력이 일정한 원 궤도 |
| `centripetal-acceleration` | 구심 가속도 | 방향만 바뀌는 운동의 가속도 |
| `period-and-frequency` | 주기와 진동수 | 한 바퀴에 걸리는 시간과 그 역수 |
| `angular-velocity` | 각속도 | 단위 시간당 각변위 |
| `angular-acceleration` | 각가속도 | 각속도의 변화율 |
| `tangential-normal-acceleration` | 접선·법선 가속도 | 속력 변화와 방향 변화의 분리 |
| `radius-of-curvature` | 곡률 반지름 | 곡선이 국소적으로 닮은 원 |

## 2. 뉴턴 역학

| id | 이름 | 다루는 것 |
|---|---|---|
| `newtons-first-law` | 관성 법칙 | 알짜힘이 없을 때의 운동 상태 |
| `inertia` | 관성 | 운동 상태를 유지하려는 성질 |
| `newtons-second-law` | 가속도 법칙 | 알짜힘·질량·가속도의 관계 |
| `newtons-third-law` | 작용 반작용 | 힘의 쌍과 서로 다른 작용점 |
| `net-force` | 알짜힘 | 여러 힘의 벡터 합 |
| `free-body-diagram` | 자유물체도 | 한 물체에 작용하는 힘만 분리하기 |
| `mass-vs-weight` | 질량과 무게 | 물질의 양과 중력이 주는 힘 |
| `inertial-vs-gravitational-mass` | 관성 질량과 중력 질량 | 서로 다른 정의가 같은 값을 주는 것 |
| `normal-force` | 수직항력 | 접촉면이 수직으로 미는 힘 |
| `apparent-weight` | 겉보기 무게 | 가속하는 엘리베이터 안의 저울 |
| `static-friction` | 정지 마찰력 | 움직이기 전까지 버티는 힘 |
| `kinetic-friction` | 운동 마찰력 | 미끄러지는 동안의 마찰 |
| `coefficient-of-friction` | 마찰 계수 | 수직항력과 마찰력의 비 |
| `angle-of-friction` | 마찰각 | 미끄러지기 시작하는 경사 |
| `inclined-plane` | 빗면 | 중력을 면에 나란한 성분과 수직 성분으로 |
| `tension` | 장력 | 줄이 당기는 힘과 그 전달 |
| `pulley-system` | 도르래 | 힘의 방향과 크기를 바꾸는 장치 |
| `connected-bodies` | 연결된 물체 | 함께 움직이는 계의 가속도 |
| `spring-force` | 탄성력 | 변형에 비례하는 복원력 |
| `hookes-law` | 훅 법칙 | 탄성 한계 안에서의 비례 관계 |
| `centripetal-force` | 구심력 | 원운동을 유지시키는 힘의 정체 |
| `conical-pendulum` | 원뿔 진자 | 장력과 중력이 만드는 원운동 |
| `banked-curve` | 경사진 커브 | 마찰 없이도 도는 각도 |
| `vertical-loop` | 연직 원운동 | 꼭대기에서 떨어지지 않는 최소 속력 |
| `drag-force` | 공기 저항 | 속도의 1차·2차에 비례하는 저항 |
| `buoyant-force-as-force` | 부력(힘으로서) | 유체가 위로 미는 힘 |
| `non-inertial-frame` | 비관성계 | 가속하는 기준틀에서의 운동 |
| `fictitious-force` | 관성력 | 비관성계에서 도입하는 겉보기 힘 |
| `coriolis-effect` | 코리올리 효과 | 회전 기준틀에서 휘는 경로 |
| `impulse-force-relation` | 힘과 충격량 | 짧고 큰 힘과 길고 작은 힘 |
| `equilibrium-of-forces` | 힘의 평형 | 알짜힘이 0인 상태 |
| `atwood-machine` | 애트우드 기계 | 두 추가 도르래로 연결된 계 |

## 3. 일·에너지·운동량

| id | 이름 | 다루는 것 |
|---|---|---|
| `work` | 일 | 힘과 변위의 내적 |
| `work-by-variable-force` | 변하는 힘이 한 일 | 힘-변위 그래프의 넓이 |
| `kinetic-energy` | 운동 에너지 | 속력이 담고 있는 에너지 |
| `work-energy-theorem` | 일-운동 에너지 정리 | 알짜일이 운동 에너지 변화와 같음 |
| `gravitational-potential-energy` | 중력 퍼텐셜 에너지 | 높이에 저장된 에너지 |
| `elastic-potential-energy` | 탄성 퍼텐셜 에너지 | 변형에 저장된 에너지 |
| `conservative-force` | 보존력 | 경로에 무관한 힘과 퍼텐셜의 존재 |
| `non-conservative-force` | 비보존력 | 경로에 따라 달라지는 일 |
| `conservation-of-mechanical-energy` | 역학적 에너지 보존 | 형태가 바뀌어도 총량이 유지됨 |
| `energy-dissipation` | 에너지 소산 | 마찰이 가져가는 몫과 그 행방 |
| `potential-energy-curve` | 퍼텐셜 곡선 | 곡선의 모양이 운동을 정하는 방식 |
| `equilibrium-points` | 평형점 | 안정·불안정·중립 평형 |
| `power` | 일률 | 단위 시간당 일 |
| `efficiency` | 효율 | 넣은 것과 얻은 것의 비 |
| `momentum` | 운동량 | 질량과 속도의 곱 |
| `impulse` | 충격량 | 힘의 시간 적분 |
| `impulse-momentum-theorem` | 충격량-운동량 정리 | 충격량이 운동량 변화와 같음 |
| `conservation-of-momentum` | 운동량 보존 | 외력이 없을 때의 총 운동량 |
| `elastic-collision` | 탄성 충돌 | 운동 에너지까지 보존되는 충돌 |
| `inelastic-collision` | 비탄성 충돌 | 에너지가 사라지는 충돌 |
| `perfectly-inelastic-collision` | 완전 비탄성 충돌 | 붙어서 함께 움직이는 경우 |
| `coefficient-of-restitution` | 반발 계수 | 충돌 전후 상대 속도의 비 |
| `two-dimensional-collision` | 2차원 충돌 | 성분마다 따로 성립하는 보존 |
| `center-of-mass` | 질량 중심 | 계를 대표하는 점 |
| `center-of-mass-motion` | 질량 중심의 운동 | 내부 힘에 영향받지 않는 운동 |
| `explosion-and-recoil` | 폭발과 반동 | 정지한 계가 갈라질 때 |
| `variable-mass-system` | 질량이 변하는 계 | 질량 유출입이 있는 운동 방정식 |
| `rocket-equation` | 로켓 방정식 | 연료를 버려 얻는 속도 |
| `ballistic-pendulum` | 탄동 진자 | 충돌과 에너지 보존을 잇는 측정 |
| `energy-in-collision` | 충돌에서의 에너지 | 보존되는 것과 안 되는 것의 구분 |

## 4. 회전과 진동

| id | 이름 | 다루는 것 |
|---|---|---|
| `torque` | 돌림힘 | 회전을 일으키는 양과 팔 길이 |
| `lever-arm` | 힘의 팔 | 회전축까지의 수직 거리 |
| `moment-of-inertia` | 관성 모멘트 | 질량 분포가 정하는 회전 저항 |
| `parallel-axis-theorem` | 평행축 정리 | 축을 옮길 때의 관성 모멘트 |
| `rotational-kinetic-energy` | 회전 운동 에너지 | 각속도가 담은 에너지 |
| `angular-momentum` | 각운동량 | 회전의 운동량 |
| `conservation-of-angular-momentum` | 각운동량 보존 | 팔을 오므리면 빨라지는 이유 |
| `rolling-without-slipping` | 미끄러지지 않는 구름 | 병진과 회전의 구속 조건 |
| `rolling-race` | 구르는 물체의 경주 | 질량 분포가 정하는 도착 순서 |
| `static-equilibrium` | 정적 평형 | 힘과 돌림힘이 모두 0 |
| `center-of-gravity` | 무게 중심 | 넘어지는 조건을 정하는 점 |
| `gyroscopic-precession` | 세차 운동 | 돌림힘이 각운동량 방향을 돌리는 것 |
| `angular-momentum-vector` | 각운동량의 방향 | 오른손 규칙과 회전축 |
| `simple-harmonic-motion` | 단순 조화 운동 | 복원력이 변위에 비례하는 운동 |
| `shm-energy` | 조화 운동의 에너지 | 운동 에너지와 퍼텐셜의 교환 |
| `phase-and-amplitude` | 위상과 진폭 | 같은 진동수의 두 진동을 가르는 것 |
| `mass-spring-system` | 용수철 진자 | 질량과 탄성 계수가 정하는 주기 |
| `simple-pendulum` | 단진자 | 작은 진폭에서의 주기 |
| `physical-pendulum` | 물리 진자 | 크기가 있는 물체의 진동 |
| `pendulum-amplitude-dependence` | 진폭과 주기 | 큰 진폭에서 깨지는 등시성 |
| `damped-oscillation` | 감쇠 진동 | 에너지가 빠져나가는 진동 |
| `damping-regimes` | 감쇠의 세 양상 | 부족·임계·과도 감쇠 |
| `driven-oscillation` | 강제 진동 | 외부 구동에 대한 응답 |
| `resonance` | 공명 | 구동 진동수가 고유 진동수에 맞을 때 |
| `quality-factor` | Q 인자 | 공명의 날카로움 |
| `coupled-oscillators` | 결합 진동자 | 에너지가 오가는 두 진동자 |
| `normal-modes` | 정규 모드 | 계가 가진 고유 진동 형태 |
| `beats-in-oscillation` | 진동의 맥놀이 | 가까운 두 진동수의 합 |
| `phase-space` | 위상 공간 | 위치-속도 평면에서 본 운동 |
| `nonlinear-oscillation` | 비선형 진동 | 복원력이 비례를 벗어날 때 |

## 5. 중력과 천체

| id | 이름 | 다루는 것 |
|---|---|---|
| `newtons-law-of-gravitation` | 만유인력 법칙 | 거리 제곱에 반비례하는 힘 |
| `gravitational-constant` | 중력 상수 | 캐번디시 실험과 그 측정 |
| `gravitational-field` | 중력장 | 공간에 분포한 중력의 세기 |
| `shell-theorem` | 껍질 정리 | 구 껍질 안팎에서의 중력 |
| `gravity-inside-earth` | 지구 내부의 중력 | 깊이에 따라 줄어드는 중력 |
| `gravitational-potential-energy-general` | 중력 퍼텐셜 에너지(일반) | 무한대를 기준으로 한 음의 에너지 |
| `escape-velocity` | 탈출 속도 | 중력을 벗어나는 최소 속도 |
| `orbital-velocity` | 궤도 속도 | 원 궤도를 유지하는 속도 |
| `circular-orbit` | 원 궤도 | 구심력이 중력인 운동 |
| `elliptical-orbit` | 타원 궤도 | 초점에 놓인 중심 천체 |
| `keplers-first-law` | 케플러 제1법칙 | 궤도는 타원이다 |
| `keplers-second-law` | 케플러 제2법칙 | 같은 시간에 같은 넓이 |
| `keplers-third-law` | 케플러 제3법칙 | 주기와 긴반지름의 관계 |
| `two-body-problem` | 이체 문제 | 질량 중심 둘레를 도는 두 천체 |
| `reduced-mass` | 환산 질량 | 이체를 일체로 바꾸는 양 |
| `tidal-force` | 조석력 | 중력의 차이가 만드는 늘어남 |
| `roche-limit` | 로슈 한계 | 조석력이 천체를 부수는 거리 |
| `weightlessness` | 무중력 | 자유 낙하 중의 겉보기 무게 |
| `geostationary-orbit` | 정지 궤도 | 자전 주기와 같은 궤도 |
| `gravitational-slingshot` | 중력 도움 | 천체를 이용한 속도 변화 |
| `lagrange-points` | 라그랑주 점 | 두 천체 사이의 평형 위치 |
| `orbital-transfer` | 궤도 전이 | 호만 전이와 그 비용 |
| `black-hole-horizon` | 사건 지평선 | 탈출 속도가 광속이 되는 반지름 |

## 6. 유체

| id | 이름 | 다루는 것 |
|---|---|---|
| `density` | 밀도 | 단위 부피당 질량 |
| `pressure` | 압력 | 단위 면적당 힘 |
| `pressure-isotropy` | 압력의 등방성 | 방향에 무관하게 같은 크기 |
| `hydrostatic-pressure` | 정수압 | 깊이에 비례하는 압력 |
| `pressure-and-container-shape` | 그릇 모양과 압력 | 바닥 압력이 모양에 무관한 것 |
| `atmospheric-pressure` | 대기압 | 공기 기둥의 무게 |
| `barometer` | 기압계 | 수은 기둥의 높이 |
| `manometer` | 압력계 | 액주 차이로 재는 압력 |
| `pascals-principle` | 파스칼 원리 | 압력의 전달과 유압 장치 |
| `buoyancy` | 부력 | 밀려난 유체의 무게만큼 |
| `archimedes-principle` | 아르키메데스 원리 | 뜨고 가라앉는 조건 |
| `floating-and-draft` | 뜨는 깊이 | 잠기는 부피가 정해지는 방식 |
| `stability-of-floating-body` | 부유체의 안정 | 무게 중심과 부심의 관계 |
| `continuity-equation` | 연속 방정식 | 단면적과 유속의 반비례 |
| `bernoullis-principle` | 베르누이 원리 | 속도와 압력의 교환 |
| `venturi-effect` | 벤투리 효과 | 좁아진 곳에서 낮아지는 압력 |
| `torricellis-law` | 토리첼리 법칙 | 구멍에서 나오는 유속 |
| `lift-force` | 양력 | 날개 위아래의 흐름 차이 |
| `viscosity` | 점성 | 층 사이의 마찰 |
| `poiseuille-flow` | 관 속의 층류 | 반지름 4제곱에 비례하는 유량 |
| `stokes-drag` | 스토크스 항력 | 느린 흐름에서의 저항 |
| `laminar-vs-turbulent` | 층류와 난류 | 흐름의 두 양상 |
| `reynolds-number` | 레이놀즈 수 | 전이를 가르는 무차원 수 |
| `boundary-layer` | 경계층 | 벽 근처에서 속도가 0이 되는 층 |
| `surface-tension` | 표면 장력 | 표면을 줄이려는 힘 |
| `laplace-pressure` | 라플라스 압력 | 곡률이 만드는 안팎 압력차 |
| `capillary-action` | 모세관 현상 | 좁은 관에서의 상승과 하강 |
| `wetting-and-contact-angle` | 젖음과 접촉각 | 액체가 고체 위에 퍼지는 정도 |
| `drag-in-fluid` | 유체 속 항력 | 형상과 속도가 정하는 저항 |

## 7. 열과 통계

| id | 이름 | 다루는 것 |
|---|---|---|
| `temperature` | 온도 | 열평형이 정의하는 양 |
| `thermal-equilibrium` | 열평형 | 접촉한 두 계가 도달하는 상태 |
| `zeroth-law` | 열역학 제0법칙 | 온도계가 성립하는 근거 |
| `temperature-scales` | 온도 눈금 | 섭씨·화씨·절대 온도 |
| `absolute-zero` | 절대 영도 | 도달할 수 없는 하한 |
| `heat-vs-temperature` | 열과 온도 | 전달되는 에너지와 상태량 |
| `specific-heat` | 비열 | 물질마다 다른 온도 변화 |
| `heat-capacity` | 열용량 | 계 전체가 받는 열과 온도 변화 |
| `calorimetry` | 열량 측정 | 섞었을 때의 최종 온도 |
| `latent-heat` | 잠열 | 상변화 중 온도가 멈추는 이유 |
| `phase-diagram` | 상평형 그림 | 압력과 온도가 정하는 상 |
| `triple-point` | 삼중점 | 세 상이 공존하는 조건 |
| `thermal-conduction` | 열전도 | 접촉을 통한 전달 |
| `thermal-convection` | 대류 | 유체의 이동이 나르는 열 |
| `thermal-radiation` | 열복사 | 매질 없이 전달되는 열 |
| `stefan-boltzmann-law` | 슈테판-볼츠만 법칙 | 온도 4제곱에 비례하는 복사 |
| `thermal-expansion` | 열팽창 | 온도에 따른 길이·부피 변화 |
| `bimetal` | 바이메탈 | 팽창률 차이가 만드는 휨 |
| `ideal-gas-law` | 이상 기체 법칙 | 압력·부피·온도의 관계 |
| `boyles-law` | 보일 법칙 | 온도가 일정할 때의 압력-부피 |
| `charles-law` | 샤를 법칙 | 압력이 일정할 때의 부피-온도 |
| `kinetic-theory-of-gases` | 기체 분자 운동론 | 거시량을 분자 운동으로 설명 |
| `pressure-from-collisions` | 충돌이 만드는 압력 | 벽에 부딪는 분자의 운동량 |
| `equipartition-theorem` | 등분배 정리 | 자유도마다 나뉘는 에너지 |
| `maxwell-boltzmann-distribution` | 맥스웰-볼츠만 분포 | 분자 속력의 분포 |
| `mean-free-path` | 평균 자유 행로 | 충돌과 충돌 사이의 거리 |
| `internal-energy` | 내부 에너지 | 계가 담고 있는 미시 에너지 |
| `first-law-of-thermodynamics` | 열역학 제1법칙 | 내부 에너지·일·열의 관계 |
| `pv-diagram` | PV 그림 | 넓이가 일인 표현 |
| `isothermal-process` | 등온 과정 | 온도를 유지하는 변화 |
| `adiabatic-process` | 단열 과정 | 열 출입이 없는 변화 |
| `isobaric-isochoric` | 등압·등적 과정 | 압력 또는 부피를 고정한 변화 |
| `cyclic-process` | 순환 과정 | 제자리로 돌아오는 변화 |
| `second-law-of-thermodynamics` | 열역학 제2법칙 | 방향이 있는 변화 |
| `entropy` | 엔트로피 | 경우의 수와 무질서 |
| `entropy-and-irreversibility` | 엔트로피와 비가역성 | 되돌릴 수 없는 이유 |
| `heat-engine` | 열기관 | 열을 일로 바꾸는 순환 |
| `carnot-cycle` | 카르노 순환 | 이론적 최대 효율 |
| `refrigerator-heat-pump` | 냉장고와 열펌프 | 일을 넣어 열을 옮기는 것 |
| `third-law` | 열역학 제3법칙 | 절대 영도에서의 엔트로피 |
| `brownian-motion` | 브라운 운동 | 분자 충돌이 만드는 무작위 운동 |
| `diffusion` | 확산 | 농도 차이가 만드는 흐름 |
| `random-walk` | 무작위 걸음 | 제곱근에 비례하는 이동 거리 |
| `statistical-fluctuation` | 요동 | 입자 수가 적을 때 커지는 흔들림 |
| `maxwells-demon` | 맥스웰의 도깨비 | 정보와 엔트로피의 관계 |

## 8. 파동과 음향

| id | 이름 | 다루는 것 |
|---|---|---|
| `wave-basics` | 파동의 기본량 | 파장·진동수·속력·진폭 |
| `wave-vs-particle-transport` | 파동이 나르는 것 | 매질은 제자리, 에너지는 이동 |
| `transverse-wave` | 횡파 | 진동 방향이 진행 방향과 수직 |
| `longitudinal-wave` | 종파 | 진동 방향이 진행 방향과 나란함 |
| `wave-speed-in-medium` | 매질과 파동 속도 | 장력·밀도·탄성이 정하는 속도 |
| `wave-equation` | 파동 방정식 | 파동을 지배하는 미분 방정식 |
| `wave-function-form` | 파동의 식 | 위상과 파수의 표현 |
| `wavefront-and-ray` | 파면과 광선 | 같은 위상의 면과 그 수직선 |
| `huygens-principle` | 하위헌스 원리 | 파면의 각 점이 새 파원이 되는 것 |
| `superposition` | 중첩 원리 | 파동이 겹칠 때의 합 |
| `constructive-destructive` | 보강과 상쇄 | 위상차가 정하는 합의 크기 |
| `interference` | 간섭 | 두 파원이 만드는 무늬 |
| `path-difference` | 경로차 | 무늬의 위치를 정하는 양 |
| `standing-wave` | 정상파 | 마디와 배가 고정되는 파동 |
| `harmonics` | 배음 | 경계 조건이 정하는 진동수 |
| `string-vibration` | 줄의 진동 | 양끝이 고정된 줄의 모드 |
| `air-column-resonance` | 기주 공명 | 열린 관과 닫힌 관의 차이 |
| `beats` | 맥놀이 | 가까운 두 진동수의 합 |
| `doppler-effect` | 도플러 효과 | 상대 운동에 따른 진동수 변화 |
| `doppler-source-vs-observer` | 음원과 관찰자 | 누가 움직이냐에 따른 비대칭 |
| `shock-wave` | 충격파 | 음속을 넘을 때 생기는 원뿔 |
| `mach-number` | 마하 수 | 음속에 대한 속도의 비 |
| `sound-speed` | 음속 | 매질과 온도가 정하는 속도 |
| `sound-intensity` | 음의 세기 | 거리 제곱에 반비례하는 감쇠 |
| `decibel-scale` | 데시벨 | 로그로 재는 세기 |
| `pitch-loudness-timbre` | 높이·크기·음색 | 물리량과 감각의 대응 |
| `reflection-of-waves` | 파동의 반사 | 고정단과 자유단에서의 위상 |
| `refraction-of-waves` | 파동의 굴절 | 속도 변화가 만드는 방향 전환 |
| `diffraction` | 회절 | 장애물을 돌아가는 파동 |
| `slit-width-and-diffraction` | 슬릿 폭과 회절 | 파장과 폭의 비가 정하는 퍼짐 |
| `wave-energy` | 파동의 에너지 | 진폭 제곱에 비례하는 에너지 |
| `wave-attenuation` | 파동의 감쇠 | 매질이 흡수하는 에너지 |
| `impedance-mismatch` | 임피던스 부정합 | 경계에서 반사되는 비율 |
| `noise-cancellation` | 능동 소음 제거 | 역위상 파동의 중첩 |

## 9. 광학

| id | 이름 | 다루는 것 |
|---|---|---|
| `rectilinear-propagation` | 빛의 직진 | 그림자와 광선 모형 |
| `shadow-umbra-penumbra` | 본그림자와 반그림자 | 광원의 크기가 만드는 경계 |
| `pinhole-camera` | 바늘구멍 사진기 | 구멍 하나가 만드는 상 |
| `law-of-reflection` | 반사 법칙 | 입사각과 반사각 |
| `specular-diffuse-reflection` | 정반사와 난반사 | 표면 거칠기가 정하는 반사 |
| `plane-mirror-image` | 평면거울의 상 | 허상의 위치와 좌우 반전 |
| `multiple-mirror-images` | 두 거울의 상 | 각도가 정하는 상의 개수 |
| `concave-mirror` | 오목거울 | 초점과 실상 |
| `convex-mirror` | 볼록거울 | 확대된 시야와 허상 |
| `mirror-equation` | 거울 공식 | 물체 거리·상 거리·초점 거리 |
| `snells-law` | 굴절 법칙 | 매질에 따른 경로 꺾임 |
| `index-of-refraction` | 굴절률 | 매질 속 빛의 속도 |
| `apparent-depth` | 겉보기 깊이 | 물속 물체가 떠 보이는 이유 |
| `total-internal-reflection` | 전반사 | 임계각과 그 조건 |
| `optical-fiber` | 광섬유 | 전반사로 가두는 빛 |
| `mirage` | 신기루 | 밀도 기울기가 휘게 하는 빛 |
| `dispersion` | 분산 | 파장에 따른 굴절률 차이 |
| `prism` | 프리즘 | 분산으로 나뉘는 스펙트럼 |
| `rainbow` | 무지개 | 물방울 속 굴절과 반사 |
| `thin-lens` | 얇은 렌즈 | 초점과 결상 |
| `converging-diverging-lens` | 볼록 렌즈와 오목 렌즈 | 모으는 렌즈와 퍼뜨리는 렌즈 |
| `lens-equation` | 렌즈 공식 | 물체·상·초점 거리의 관계 |
| `magnification` | 배율 | 상의 크기와 물체의 크기 |
| `real-vs-virtual-image` | 실상과 허상 | 빛이 실제로 모이는가 |
| `lens-maker-equation` | 렌즈 제작자 공식 | 곡률과 굴절률이 정하는 초점 |
| `lens-combination` | 렌즈의 조합 | 두 렌즈가 만드는 합성 초점 |
| `spherical-aberration` | 구면 수차 | 가장자리 광선이 다른 곳에 모임 |
| `chromatic-aberration` | 색수차 | 파장마다 다른 초점 |
| `human-eye-accommodation` | 눈의 조절 | 수정체가 초점을 맞추는 방식 |
| `myopia-hyperopia` | 근시와 원시 | 상이 맺히는 위치와 교정 |
| `magnifying-glass` | 돋보기 | 가까운 초점 안의 물체 |
| `microscope` | 현미경 | 대물과 접안의 배율 곱 |
| `telescope` | 망원경 | 초점 거리 비가 정하는 배율 |
| `youngs-double-slit` | 이중 슬릿 간섭 | 빛의 파동성 증거 |
| `single-slit-diffraction` | 단일 슬릿 회절 | 폭이 만드는 무늬 |
| `diffraction-grating` | 회절 격자 | 여러 슬릿이 만드는 날카로운 극대 |
| `thin-film-interference` | 박막 간섭 | 두께가 만드는 색 |
| `newtons-rings` | 뉴턴 링 | 곡면과 평면 사이의 간섭 |
| `resolving-power` | 분해능 | 두 점을 가르는 한계 |
| `polarization` | 편광 | 진동면의 선택 |
| `malus-law` | 말뤼스 법칙 | 편광판을 지난 세기 |
| `brewster-angle` | 브루스터 각 | 반사광이 완전 편광되는 각 |
| `birefringence` | 복굴절 | 방향에 따라 다른 굴절률 |
| `scattering` | 산란 | 하늘과 노을의 색 |
| `rayleigh-scattering` | 레일리 산란 | 파장 4제곱에 반비례하는 산란 |

## 10. 전자기

| id | 이름 | 다루는 것 |
|---|---|---|
| `electric-charge` | 전하 | 두 종류의 전하와 보존 |
| `charging-methods` | 대전 방법 | 마찰·접촉·유도 |
| `conductor-vs-insulator` | 도체와 부도체 | 전하가 움직일 수 있는가 |
| `coulombs-law` | 쿨롱 법칙 | 전하 사이의 힘 |
| `superposition-of-forces` | 전기력의 중첩 | 여러 전하가 주는 힘의 합 |
| `electric-field` | 전기장 | 단위 전하가 받는 힘 |
| `field-lines` | 전기력선 | 장을 그리는 규약과 그 뜻 |
| `field-of-dipole` | 쌍극자의 전기장 | 가까운 두 반대 전하 |
| `uniform-field` | 균일한 전기장 | 평행판 사이의 장 |
| `charge-in-uniform-field` | 균일장 속 전하 | 포물선 운동과의 대응 |
| `gausss-law` | 가우스 법칙 | 닫힌 면을 지나는 전기력선속 |
| `field-of-charged-sphere` | 대전된 구의 전기장 | 안과 밖이 다른 이유 |
| `electric-potential` | 전위 | 단위 전하당 퍼텐셜 에너지 |
| `potential-difference` | 전위차 | 두 점 사이의 전위 차이 |
| `equipotential-surface` | 등전위면 | 전기장과 수직인 면 |
| `potential-vs-field` | 전위와 전기장 | 기울기 관계 |
| `electrostatic-shielding` | 정전기 차폐 | 도체 내부의 장이 0인 이유 |
| `charge-on-conductor-surface` | 도체 표면의 전하 | 뾰족한 곳에 몰리는 전하 |
| `dielectric` | 유전체 | 분극과 전기장의 약화 |
| `capacitance` | 전기 용량 | 전하를 저장하는 능력 |
| `parallel-plate-capacitor` | 평행판 축전기 | 넓이·간격이 정하는 용량 |
| `capacitors-in-circuit` | 축전기의 연결 | 직렬과 병렬의 합성 |
| `energy-in-capacitor` | 축전기의 에너지 | 전기장에 저장된 에너지 |
| `electric-current` | 전류 | 전하의 흐름과 방향 규약 |
| `drift-velocity` | 표류 속도 | 느린 전자와 빠른 신호 |
| `ohms-law` | 옴 법칙 | 전압·전류·저항 |
| `resistivity` | 비저항 | 재료가 정하는 저항 |
| `resistance-and-geometry` | 저항과 형태 | 길이와 단면적의 영향 |
| `temperature-and-resistance` | 온도와 저항 | 금속과 반도체의 반대 경향 |
| `series-parallel-resistors` | 저항의 직렬과 병렬 | 연결 방식에 따른 합성 |
| `emf-and-internal-resistance` | 기전력과 내부 저항 | 단자 전압이 낮아지는 이유 |
| `kirchhoffs-current-law` | 키르히호프 전류 법칙 | 마디에서의 전하 보존 |
| `kirchhoffs-voltage-law` | 키르히호프 전압 법칙 | 고리에서의 에너지 보존 |
| `wheatstone-bridge` | 휘트스톤 브리지 | 평형으로 재는 저항 |
| `electric-power` | 전력 | 소비되는 에너지의 비율 |
| `joule-heating` | 줄 열 | 저항이 만드는 열 |
| `rc-circuit` | RC 회로 | 충전과 방전의 시간 상수 |
| `magnetic-field` | 자기장 | 자기력의 분포 |
| `magnetic-field-lines` | 자기력선 | 끊기지 않고 닫히는 선 |
| `lorentz-force` | 로런츠 힘 | 자기장 속 전하가 받는 힘 |
| `charged-particle-in-magnetic-field` | 자기장 속 전하의 원운동 | 속도에 수직인 힘 |
| `velocity-selector` | 속도 선택기 | 전기력과 자기력의 균형 |
| `mass-spectrometer` | 질량 분석기 | 반지름으로 가르는 질량 |
| `force-on-current-wire` | 전류가 받는 힘 | 도선에 작용하는 자기력 |
| `biot-savart-law` | 비오-사바르 법칙 | 전류 요소가 만드는 자기장 |
| `field-of-straight-wire` | 직선 전류의 자기장 | 거리에 반비례하는 세기 |
| `field-of-loop-and-solenoid` | 고리와 솔레노이드 | 축 위의 자기장 |
| `amperes-law` | 앙페르 법칙 | 전류와 자기장의 순환 |
| `force-between-wires` | 도선 사이의 힘 | 나란한 두 전류의 인력·척력 |
| `magnetic-dipole` | 자기 쌍극자 | 고리 전류와 자석의 동일성 |
| `magnetic-materials` | 자성체 | 강자성·상자성·반자성 |
| `magnetic-flux` | 자기 선속 | 면을 지나는 자기장의 양 |
| `faradays-law` | 패러데이 법칙 | 자속 변화가 만드는 기전력 |
| `lenzs-law` | 렌츠 법칙 | 변화를 방해하는 유도 전류 |
| `motional-emf` | 운동 기전력 | 도선이 움직여 생기는 전압 |
| `eddy-current` | 맴돌이 전류 | 덩어리 도체 속의 유도 전류 |
| `self-inductance` | 자체 인덕턴스 | 자기 자신의 자속 변화 |
| `mutual-inductance` | 상호 인덕턴스 | 이웃 회로에 유도되는 기전력 |
| `energy-in-inductor` | 인덕터의 에너지 | 자기장에 저장된 에너지 |
| `rl-circuit` | RL 회로 | 전류가 서서히 오르는 이유 |
| `lc-oscillation` | LC 진동 | 전기와 자기 에너지의 교환 |
| `ac-generation` | 교류의 발생 | 회전하는 코일과 사인파 |
| `rms-value` | 실효값 | 교류를 직류와 견주는 값 |
| `reactance-and-impedance` | 리액턴스와 임피던스 | 주파수에 의존하는 저항 |
| `phase-in-ac-circuit` | 교류의 위상차 | 전압과 전류가 어긋나는 것 |
| `series-rlc-resonance` | RLC 공진 | 임피던스가 최소가 되는 주파수 |
| `transformer` | 변압기 | 감은 수와 전압비 |
| `motor` | 전동기 | 전류가 받는 힘으로 도는 것 |
| `generator` | 발전기 | 회전이 만드는 기전력 |
| `displacement-current` | 변위 전류 | 축전기 사이를 잇는 항 |
| `maxwells-equations` | 맥스웰 방정식 | 전자기를 묶는 네 식 |
| `electromagnetic-wave` | 전자기파 | 전기장과 자기장의 자기 전파 |
| `speed-of-light-from-constants` | 상수에서 나온 광속 | 유전율과 투자율의 조합 |
| `electromagnetic-spectrum` | 전자기 스펙트럼 | 파장에 따른 분류 |
| `poynting-vector` | 포인팅 벡터 | 전자기파가 나르는 에너지 흐름 |
| `radiation-pressure` | 복사압 | 빛이 미는 힘 |
| `antenna-radiation` | 안테나의 복사 | 가속하는 전하가 내는 파동 |

## 11. 현대물리

| id | 이름 | 다루는 것 |
|---|---|---|
| `michelson-morley` | 마이컬슨-몰리 실험 | 에테르가 없다는 증거 |
| `special-relativity-postulates` | 특수 상대성 가정 | 광속 불변과 상대성 원리 |
| `relativity-of-simultaneity` | 동시성의 상대성 | 기준틀마다 다른 '동시' |
| `time-dilation` | 시간 지연 | 운동하는 시계가 느려짐 |
| `light-clock` | 빛 시계 | 시간 지연을 유도하는 사고 실험 |
| `length-contraction` | 길이 수축 | 운동 방향으로의 수축 |
| `muon-decay-evidence` | 뮤온의 도달 | 시간 지연의 관측 증거 |
| `lorentz-transformation` | 로런츠 변환 | 좌표 사이의 변환식 |
| `relativistic-velocity-addition` | 속도의 상대론적 덧셈 | 광속을 넘지 못하는 합성 |
| `twin-paradox` | 쌍둥이 역설 | 비대칭을 만드는 가속 |
| `spacetime-diagram` | 시공간 도표 | 세계선과 동시선 |
| `light-cone` | 광원뿔 | 인과가 닿는 영역 |
| `invariant-interval` | 불변 간격 | 모든 기준틀에서 같은 양 |
| `relativistic-momentum` | 상대론적 운동량 | 속도가 커질 때의 발산 |
| `mass-energy-equivalence` | 질량-에너지 등가 | E=mc² 의 뜻 |
| `rest-energy` | 정지 에너지 | 정지한 물체가 가진 에너지 |
| `relativistic-doppler` | 상대론적 도플러 | 시간 지연이 더해진 진동수 변화 |
| `equivalence-principle` | 등가 원리 | 가속과 중력의 구별 불가 |
| `gravitational-time-dilation` | 중력 시간 지연 | 퍼텐셜에 따른 시계의 차이 |
| `gravitational-redshift` | 중력 적색 이동 | 빠져나오며 잃는 에너지 |
| `light-bending-by-gravity` | 빛의 휨 | 질량 근처에서 휘는 경로 |
| `blackbody-radiation` | 흑체 복사 | 고전 이론의 파탄 |
| `wien-displacement-law` | 빈 변위 법칙 | 온도와 최대 파장 |
| `plancks-quantum-hypothesis` | 플랑크의 양자 가설 | 에너지가 덩어리라는 가정 |
| `photoelectric-effect` | 광전 효과 | 빛의 입자성 증거 |
| `work-function-and-threshold` | 일함수와 문턱 진동수 | 세기가 아니라 진동수가 정하는 것 |
| `photon-energy-momentum` | 광자의 에너지와 운동량 | 질량 없는 입자의 양 |
| `compton-scattering` | 콤프턴 산란 | 광자가 운동량을 가진다는 증거 |
| `pair-production` | 쌍생성 | 에너지가 물질이 되는 것 |
| `de-broglie-wavelength` | 드브로이 파장 | 물질의 파동성 |
| `electron-diffraction` | 전자 회절 | 물질파의 관측 증거 |
| `double-slit-with-electrons` | 전자의 이중 슬릿 | 하나씩 보내도 생기는 무늬 |
| `wave-particle-duality` | 파동-입자 이중성 | 상보적인 두 기술 |
| `uncertainty-principle` | 불확정성 원리 | 켤레량의 동시 결정 한계 |
| `energy-time-uncertainty` | 에너지-시간 불확정성 | 수명과 선폭의 관계 |
| `wave-function` | 파동 함수 | 확률 진폭과 그 해석 |
| `born-rule` | 보른 규칙 | 제곱이 확률이 되는 규약 |
| `superposition-quantum` | 양자 중첩 | 여러 상태의 합으로 있는 것 |
| `measurement-collapse` | 측정과 붕괴 | 관측이 상태를 정하는 것 |
| `particle-in-a-box` | 무한 우물 | 경계가 만드는 에너지 양자화 |
| `finite-well` | 유한 우물 | 벽 바깥으로 새는 파동 함수 |
| `quantum-tunneling` | 터널 효과 | 장벽을 통과하는 확률 |
| `scanning-tunneling-microscope` | 주사 터널 현미경 | 터널 전류로 그리는 표면 |
| `quantum-harmonic-oscillator` | 양자 조화 진동자 | 등간격 준위와 영점 에너지 |
| `hydrogen-spectrum` | 수소 스펙트럼 | 불연속한 선 스펙트럼 |
| `bohr-model` | 보어 모형 | 궤도의 양자화 |
| `atomic-orbital` | 원자 궤도 | 확률 분포로서의 전자 |
| `quantum-numbers` | 양자수 | 상태를 지정하는 네 수 |
| `pauli-exclusion` | 파울리 배타 원리 | 같은 상태를 못 가짐 |
| `electron-configuration` | 전자 배치 | 주기율표가 나오는 방식 |
| `spin` | 스핀 | 고전 대응물이 없는 각운동량 |
| `stern-gerlach` | 슈테른-게를라흐 실험 | 갈라지는 원자 빔 |
| `zeeman-effect` | 제이만 효과 | 자기장이 가르는 준위 |
| `laser-and-stimulated-emission` | 레이저와 유도 방출 | 결이 맞는 빛의 증폭 |
| `nuclear-structure` | 원자핵의 구성 | 양성자와 중성자 |
| `strong-force` | 강한 상호작용 | 핵을 묶는 짧은 거리의 힘 |
| `nuclear-binding-energy` | 핵결합 에너지 | 질량 결손과 안정성 |
| `binding-energy-curve` | 결합 에너지 곡선 | 철에서 최대가 되는 이유 |
| `radioactive-decay` | 방사성 붕괴 | 반감기와 지수 감소 |
| `decay-types` | 붕괴의 종류 | 알파·베타·감마 |
| `half-life` | 반감기 | 절반이 되는 데 걸리는 시간 |
| `radiometric-dating` | 방사성 연대 측정 | 남은 비율로 재는 시간 |
| `nuclear-fission` | 핵분열 | 무거운 핵이 갈라지며 내는 에너지 |
| `chain-reaction` | 연쇄 반응 | 중성자가 이어가는 분열 |
| `nuclear-fusion` | 핵융합 | 가벼운 핵이 합쳐지며 내는 에너지 |
| `standard-model-overview` | 표준 모형 | 기본 입자와 상호작용의 분류 |
| `antimatter` | 반물질 | 부호가 반대인 짝 |
| `neutrino` | 중성미자 | 거의 상호작용하지 않는 입자 |
| `band-theory` | 띠 이론 | 도체·부도체·반도체의 구분 |
| `fermi-level` | 페르미 준위 | 전자가 채워진 높이 |
| `semiconductor-doping` | 도핑 | 불순물이 만드는 n형과 p형 |
| `pn-junction` | pn 접합 | 공핍층과 정류 |
| `diode-and-led` | 다이오드와 LED | 한 방향 전류와 빛의 방출 |
| `transistor-principle` | 트랜지스터 | 작은 신호가 큰 전류를 제어 |
| `photovoltaic-effect` | 광전지 효과 | 빛이 만드는 전위차 |
| `superconductivity` | 초전도 | 저항이 사라지는 상태 |
| `meissner-effect` | 마이스너 효과 | 자기장을 밀어내는 초전도체 |
| `bose-einstein-condensate` | 보스-아인슈타인 응축 | 같은 상태로 몰리는 저온의 입자 |

---

## 집계

| 분과 | 주제 |
|---|---:|
| 1. 운동학 | 32 |
| 2. 뉴턴 역학 | 32 |
| 3. 일·에너지·운동량 | 30 |
| 4. 회전과 진동 | 30 |
| 5. 중력과 천체 | 23 |
| 6. 유체 | 29 |
| 7. 열과 통계 | 45 |
| 8. 파동과 음향 | 34 |
| 9. 광학 | 45 |
| 10. 전자기 | 77 |
| 11. 현대물리 | 78 |
| **합계** | **455** |

수를 맞추지 않았다. 분과가 열거의 비계인 이상 그 사이의 비율에는 뜻이 없다.

## 다음 국면

이 목록은 **1단계 산출물**이다. 여기서 곧바로 구현으로 가지 않는다.

1. **첫 조각 3~5개를 손으로.** 배치 없이 하나씩. FACET 은 하나씩 만든 처음 셋에서
   관성을 겪지 않았고, 그 셋이 나중에 배치 결과를 판정하는 기준이 됐다.
   - 주제마다 "글이 이 대목을 설명할 때 어디서 멈추는가" 를 묻고 질문을 캔다.
   - 잣대 셋을 적용한다 — 한 문장으로 쓸 수 있는가 / 그림 없이 이해시킬 수 있는가 /
     질문의 동사가 화면에서 실제로 일어나는가.
   - 구현 직전에 2단계(이미 구현됐나)와 3단계(혼자 서나)를 발동시킨다.
2. 잣대 확정 + 관성 계측기 이식.
3. 도메인별로 구현해 나간다. 2·3단계는 계속 그 자리에서 발동한다.

**첫 맥락은 이미 그림이 있는 주제를 피한다** (`projectile-motion` · `thin-lens` ·
`series-parallel-resistors`). 그림이 있으면 거기서 잘라내려는 중력이 생기고, FACET 의
발췌 15종이 그렇게 나왔다.
