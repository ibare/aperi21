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
| G01 | `step` 이 `TimelineFrame` 을 받지 못한다 — 조각이 시계를 따로 세고 시간표를 다시 계산한다 | 근사 | inclined-plane · apparent-weight · atwood-machine · balance-scale · impulse-force-relation · stress-strain-curve · banked-curve · free-body-diagram · equilibrium-of-forces · kinetic-friction · normal-force · angle-of-friction · tension · conical-pendulum · buoyant-force-as-force · fictitious-force · phase-space · color-addition · bernoullis-principle · maxwell-boltzmann-distribution · spacetime-diagram · tidal-force · potential-energy-curve · hr-diagram · equipotential-surface · moon-phases · huygens-principle · polarization · phase-diagram · youngs-double-slit · moment-of-inertia · stability-of-floating-body · total-internal-reflection · radioactive-decay · equilibrium-points · angular-momentum |
| G02 | 화살촉 크기 상한이 길이의 0.35 로 고정 — 짧은 화살표의 방향이 약하다 | 근사 | gravitational-acceleration · newtons-second-law · inclined-plane · mechanical-advantage · normal-force · buoyant-force-as-force · gyroscopic-precession · gravitational-potential-energy · impulse-momentum-theorem · two-dimensional-collision · rotational-kinetic-energy · nonlinear-oscillation |
| G03 | `body` 둘레의 굵기 · 색을 채움과 따로 고를 수 없다 | 근사 | coriolis-effect · static-friction · vertical-loop · equilibrium-of-forces · angle-of-friction · interference · phase-space · field-lines · equipotential-surface · thermal-convection · phase-diagram · stability-of-floating-body · total-internal-reflection · perfectly-inelastic-collision · rolling-race · rolling-without-slipping · gears |
| G04 | 선 끝 · 이음 모양을 고를 수 없다 | 근사 | static-friction · stress-strain-curve · mechanical-advantage · carnot-cycle · double-slit-with-electrons · resonance · rc-circuit · refraction-of-waves |
| G05 | 점선 무늬(대시 길이 · 간격)를 선언할 수 없다 | 근사 | non-inertial-frame · stress-strain-curve · banked-curve · youngs-modulus · fictitious-force · phase-space · tidal-force · bernoullis-principle · maxwell-boltzmann-distribution · spacetime-diagram · potential-energy-curve · gyroscopic-precession · carnot-cycle · normal-modes · moon-phases · polarization · keplers-second-law · capillary-action · standing-wave · youngs-double-slit · rc-circuit · hydrogen-spectrum · stability-of-floating-body · refraction-of-waves · total-internal-reflection · radioactive-decay · perfectly-inelastic-collision |
| G06 | `rect` 에 모서리 둥글림이 없다 | 근사 | newtons-second-law · apparent-weight · non-inertial-frame · inertial-vs-gravitational-mass · tension |
| G07 | 짙은 물체 위 글자에 쓸 반전(바탕) 색 역할이 없다 | 근사 | atwood-machine · pulley-system · connected-bodies · youngs-modulus · field-lines · spacetime-diagram · equipotential-surface · thermal-convection · huygens-principle · refraction-of-waves · total-internal-reflection · charged-particle-in-magnetic-field · efficiency |
| G08 | 재질 · 옅은 면 톤에 맞는 색 역할이 없다 (`luminance` 로 눈대중) | 근사 | coriolis-effect · non-inertial-frame · impulse-force-relation · angle-of-friction · inertial-vs-gravitational-mass · energy-flow-diagram · field-lines · tidal-force · bernoullis-principle · maxwell-boltzmann-distribution · gyroscopic-precession · equipotential-surface · normal-modes · moon-phases · poiseuille-flow · double-slit-with-electrons · keplers-second-law · capillary-action · phase-diagram · rc-circuit · lagrange-points · stability-of-floating-body · refraction-of-waves · total-internal-reflection · inelastic-collision |
| G09 | 여러 인스턴스를 한꺼번에 흐리게 하는 묶음 불투명도가 없다 | 근사 | non-inertial-frame · stress-strain-curve · phase-space · tidal-force · perfectly-inelastic-collision · elastic-collision · inelastic-collision · conservation-of-momentum · energy-in-collision · rolling-race · driven-oscillation |
| G10 | 판(패널) 단위 좌표계가 없다 — 인스턴스마다 위치를 옮긴다 | 근사 | coriolis-effect · non-inertial-frame · tidal-force · normal-modes · phase-diagram · rc-circuit · kinetic-energy · rocket-equation · work-energy-theorem · non-conservative-force · equilibrium-points · inelastic-collision · energy-in-collision · impulse-momentum-theorem · torque · rolling-race · rolling-without-slipping · rotational-kinetic-energy · static-equilibrium · driven-oscillation · damping-regimes · nonlinear-oscillation |
| G11 | 시간표 이징 곡선이 모자라다 (감속 출발 · 코사인 · inOutQuad) | 근사 | net-force · inclined-plane · spring-force · pulley-system · buoyant-force-as-force · electromagnetic-wave · total-internal-reflection |
| G12 | 여러 단계에 걸친 이징을 선언할 자리가 없다 | 근사 | stress-strain-curve |
| G13 | 시간표 단계에 값을 실을 수 없고, 단계 길이가 상태 · 조작값을 따라가지 못한다 | 근사 | atwood-machine · normal-force · inertial-vs-gravitational-mass · impulse-force-relation · interference · spacetime-diagram · equipotential-surface · huygens-principle · double-slit-with-electrons · keplers-second-law · phase-diagram · youngs-double-slit · rc-circuit · moment-of-inertia · refraction-of-waves · energy-dissipation · perfectly-inelastic-collision · elastic-potential-energy · gravitational-potential-energy · elastic-collision · impulse-momentum-theorem · simple-harmonic-motion · mass-spring-system · simple-pendulum · damped-oscillation · coupled-oscillators · beats-in-oscillation · damping-regimes |
| G14 | 캡션 `vars` 에 문안 키를 넣을 수 없다 · 캡션 조건이 경로 하나뿐이다 | 근사 | free-body-diagram · drag-force · bernoullis-principle · potential-energy-curve · hr-diagram · normal-modes · moon-phases · capillary-action · stability-of-floating-body · explosion-and-recoil · center-of-mass-motion |
| G15 | 캡션을 흐리게 사라지게 하거나 단계마다 페이드를 정할 수 없다 | 근사 | static-friction · double-slit-with-electrons |
| G16 | `readout` 이 회전하지 않고, 글자 기준선에 맞출 수 없다 | 근사 | coriolis-effect · mechanical-advantage · kinetic-friction · phase-space · potential-energy-curve · hr-diagram · carnot-cycle · moon-phases · double-slit-with-electrons · standing-wave · moment-of-inertia · lagrange-points · total-internal-reflection · perfectly-inelastic-collision · elastic-collision · torque |
| G17 | `vector.label` 의 크기 · 자리가 고정이고 값을 끼울 수 없다 | 근사 | vertical-loop · connected-bodies · buoyant-force-as-force · gyroscopic-precession · conservative-force · elastic-collision · explosion-and-recoil · impulse-momentum-theorem · two-dimensional-collision · simple-harmonic-motion |
| G18 | `region` 에 구멍이 없고 테두리 굵기를 못 고른다 | 근사 | banked-curve · drag-force · normal-force · stability-of-floating-body · rocket-equation · ballistic-pendulum · work-energy-theorem · inelastic-collision · energy-in-collision · center-of-gravity · coupled-oscillators |
| G19 | `dimension` 이 점선뿐이다 | 근사 | stress-strain-curve · kinetic-energy · elastic-potential-energy · conservative-force · inelastic-collision · explosion-and-recoil · rotational-kinetic-energy · quality-factor |
| G20 | 용수철 옆 폭 · 굵기, 줄 굵기 · 짙기를 고를 수 없다 | 근사 | spring-force · centripetal-force · buoyant-force-as-force · tension · phase-space · elastic-potential-energy · quality-factor |
| G21 | `point-drag` 손잡이를 숨기거나 범위 · 판정 모양을 줄 수 없다 | 근사 | balance-scale · equilibrium-of-forces · tension · color-addition · field-lines · potential-energy-curve · thin-film-interference · equipotential-surface · normal-modes · moon-phases · total-internal-reflection |
| G22 | `slider` 값 표시 끄기 · 끝 이름표 · 단위 번역이 없다 | 근사 | impulse-force-relation · conical-pendulum · angle-of-friction · bernoullis-principle · spacetime-diagram · gyroscopic-precession · lift-force · polarization · resonance · phase-diagram · rc-circuit · refraction-of-waves |
| G23 | `restart` 는 엔진 시계만 되돌려 상태를 쌓는 조각에는 효과가 없다 | 근사 | inertial-vs-gravitational-mass · lift-force |
| G24 | 러너 여백 · 선언한 조작기 · 캡션 자리가 프레이밍 여백으로 잡히지 않는다 | 근사 | static-friction · banked-curve · tension · interference · field-lines · bernoullis-principle · maxwell-boltzmann-distribution · spacetime-diagram(그림 밖 캡션·조작기 줄) · potential-energy-curve · gyroscopic-precession · lift-force · carnot-cycle · longitudinal-wave · equipotential-surface · atomic-orbital · normal-modes · moon-phases · huygens-principle · polarization · electromagnetic-wave · resonance · youngs-double-slit · rc-circuit · hydrogen-spectrum · moment-of-inertia · lagrange-points · stability-of-floating-body · refraction-of-waves · charged-particle-in-magnetic-field · radioactive-decay · energy-dissipation · perfectly-inelastic-collision · elastic-collision · inelastic-collision · conservation-of-momentum · conservation-of-angular-momentum · rolling-race · simple-pendulum · driven-oscillation |
| G25 | 화면 px 로 고정되는 크기가 없고, 글자가 배율을 따르지 않는다 | 근사 | vertical-loop · non-inertial-frame · fictitious-force · interference · energy-flow-diagram · field-lines · tidal-force · maxwell-boltzmann-distribution · spacetime-diagram · gyroscopic-precession · hr-diagram · longitudinal-wave · thin-film-interference · equipotential-surface · huygens-principle · double-slit-with-electrons · resonance · phase-diagram · rc-circuit · moment-of-inertia · lagrange-points · stability-of-floating-body · radioactive-decay · angular-momentum-vector · center-of-gravity |
| G26 | 가는 선을 화면 픽셀에 맞추는 선언이 없다 | 근사 | youngs-modulus |
| G27 | `button` 에 비활성 모양이 없다 | 근사 | centripetal-force |
| G28 | 곡선(베지어) · 타원 어휘가 없어 점으로 표본한다 | 근사 | free-body-diagram · fictitious-force · energy-flow-diagram · field-lines · gyroscopic-precession · equipotential-surface · poiseuille-flow · electromagnetic-wave · keplers-second-law · capillary-action · charged-particle-in-magnetic-field · radioactive-decay · work-by-variable-force · efficiency · conservative-force · equilibrium-points · impulse-momentum-theorem · conservation-of-angular-momentum · angular-momentum · angular-momentum-vector · damped-oscillation · coupled-oscillators |

## 턴 기록

(턴마다 새 부족을 아래에 이어 적고, 분야별 새 부족 수를 표로 남긴다.)

## 턴 1 (2026-09-17) — 9개 분야 각 1번

### 새 부족

같은 턴에 두 분야가 같은 종류를 처음 보고하면 **두 분야 모두** 새 부족으로 센다(턴 시작 때 장부에 없었으므로).

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G29 | 자리마다 값이 있는 스칼라 장(격자 값)을 칠하는 어휘가 없다 — 칸마다 `region` 을 수백~수천 개 선언한다 (간섭 8208개 · 베르누이 400개). 실시간 프레임 비용 미확인 | 근사 | interference · bernoullis-principle |
| G30 | 값→색 척도가 없다 (음·0·양 발산형, 순차형). `luminance` 한 줄로 근사해 대비가 약하고 다크 테마에서 뒤집힌다 | 근사 | interference · bernoullis-principle · lift-force · longitudinal-wave · equipotential-surface |
| G31 | 그라데이션 채움(선형 · 방사형)이 없다 — 알파를 겹친 원판 56장, 층을 쌓은 꼬리로 흉내 낸다 | 근사 | energy-flow-diagram · tidal-force · hr-diagram · phase-diagram · hydrogen-spectrum · stability-of-floating-body · efficiency · rolling-race |
| G32 | `particleSystem` 이 인스턴스 하나에 색 · 알파 하나다 — 입자별 색 · 알파가 없다 | 근사 | energy-flow-diagram · hr-diagram |
| G33 | 빛의 원색 · 합색(빨강 · 초록 · 파랑 · 노랑 · 청록 · 자홍 · 흰)에 맞는 색 역할이 없다 — 「빨강 + 초록 = 노랑」 이 색으로 서지 않는다 | **주장** | color-addition · thin-film-interference · total-internal-reflection |
| G34 | 테마와 무관한 절대 검정 · 흰이 없다 — 흰 합색이 배경 미색이 되고, 다크 테마에서 막과 흰 칸의 밝기가 뒤집힐 것으로 보인다(다크 미촬영) | **주장** | color-addition · thin-film-interference · moon-phases · polarization |
| G35 | 가산 합성(겹친 빛을 더해 칠하기)이 없다 — 겹친 칸을 도형으로 잘라 따로 칠한다 | 근사 | color-addition · total-internal-reflection |
| G36 | `point-drag` 가 잡은 자리와 중심의 어긋남을 유지하지 못한다 — 가장자리를 잡아도 중심이 포인터로 뛴다 | 근사 | color-addition |
| G37 | 입자별 위치 이력 잔상이 없다 — `particleSystem.trail` 은 속도 반대 방향 직선 획뿐 | 근사 | phase-space |
| G38 | 감기는 좌표(−π~π)에서 선을 끊는 기능이 없다 | 근사 | phase-space |
| G39 | 실시간 `step` 의 dt 가 가변이라 고정 걸음을 쓰려면 조각이 누적기를 둔다 | 근사 | phase-space · color-addition · potential-energy-curve · lift-force · normal-modes · thermal-convection · resonance · capillary-action · hydrogen-spectrum · lagrange-points · stability-of-floating-body |
| G40 | `particleSystem` 꼬리의 알파 · 굵기 · 길이 계수가 고정이고 길이 상한 · 머리 점 끄기가 없다 — 그대로 쓰면 빠른 곳 꼬리가 사라져 「선이 몰린 곳이 세다」 가 뒤집혀 보인다. 입자마다 `trajectory` 950개로 우회 | **주장** | field-lines |
| G41 | 벡터장을 흐르는 획(격자 화살표 · 짧은 획)으로 그리는 어휘가 없다 — 획마다 인스턴스 최대 약 156개, 표현의 대부분이 scene 코드에 있다 | 근사 | tidal-force |
| G42 | `timeScale` 을 적용하기 전의 화면 시각을 조각이 받지 못한다 | 근사 | tidal-force |
| G43 | `particleSystem` 점 모양(사각 등)을 고를 수 없다 | 근사 | tidal-force |
| G44 | 값의 변화 방향(오름 · 내림 · 멈춤)으로 캡션을 고르거나, 조작하면 단계 캡션에서 상태 캡션으로 넘기는 전환을 선언할 자리가 없다 | 근사 | maxwell-boltzmann-distribution · polarization · phase-diagram · youngs-double-slit |
| G45 | `trace` ring 의 속을 바탕색으로 채울 수 없다 | 근사 | maxwell-boltzmann-distribution · spacetime-diagram |
| G46 | `slider.step` 이 값 글자까지 눈금에 붙인다 (744 → 750) | 근사 | maxwell-boltzmann-distribution · moment-of-inertia |
| G47 | 그래프 축 어휘가 없다 — `scale` linear 는 값 표식을 늘 그리고 눈금 숫자를 강조색으로 칠해, 대신 쓰면 강조색이 두 뜻이 된다 | 근사 | maxwell-boltzmann-distribution · phase-space(세로축 이름을 세우지 못함) · hr-diagram · thin-film-interference · rc-circuit · moment-of-inertia · total-internal-reflection · radioactive-decay · kinetic-energy · ballistic-pendulum · work-by-variable-force · work-energy-theorem · elastic-potential-energy · gravitational-potential-energy · conservation-of-momentum · impulse-momentum-theorem · two-dimensional-collision · conservation-of-angular-momentum · parallel-axis-theorem · damping-regimes · quality-factor |
| G48 | 한 점과 기울기로 긋는 무한 직선이 없다 | 근사 | spacetime-diagram |
| G49 | 선 끝 이름표를 화면 안에 두기 (`readout.clamp` 로 되는지 미확인) | 근사 | spacetime-diagram |
| G50 | 글자 둘레 바탕색 테두리가 없다 | 근사 | spacetime-diagram · stability-of-floating-body |
| G51 | 조각 선언이 인스턴스를 수백~수천 개 만들 때의 성능 한도가 없다 — 간섭 8208 · 전기력선 950 · 위상 공간 520+. 실시간 프레임률 미확인 | 미정 | interference · field-lines · phase-space · lift-force · equipotential-surface · moon-phases · huygens-principle · electromagnetic-wave · resonance · youngs-double-slit · refraction-of-waves |

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
| G53 | `opacities` 를 8 단계로 반올림해 1/16 미만이 그려지지 않는다 — 가장 옅은 끝이 잘린다 | 근사 | tidal-force · carnot-cycle · equipotential-surface · atomic-orbital · poiseuille-flow · thermal-convection · rc-circuit · hydrogen-spectrum · lagrange-points |
| G54 | `scalarField` 발산형에서 같은 역할을 양쪽에 주면 음 · 양이 같은 짙기라 부호가 갈리지 않는다(물결 띠가 반 파장 간격으로 보임). 한 역할 안에서 음 · 양을 짙기 · 결로 가르는 사상이 없다 | 근사 | interference |

## 턴 2 (2026-09-17) — 9개 분야 각 2번

### 새 부족

판정 기준: 장부 항목의 문안이 그 모자람을 적고 있지 않으면 새 id 로 세운다(턴 1 뒤 G54 를 G30 과 따로 세운 입도와 같다).
이관 에이전트가 장부 id 에 댄 것이라도 문안에 없으면 새로 세웠고(G61 흑체색 · G62), 새 부족이라 한 것이라도 문안에 있으면 장부 id 로 돌렸다
(thin-film-interference 의 「조작기 하나에 판정 자리 둘」 → G21 「판정 모양」).

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G55 | 고정 시점 3차원 투영이 없다 — 3차원 점 · 원 · 원판 · 화살표를 선언할 수 없어 조각이 투영 수식과 깊이 순서(단계별 인스턴스)를 짠다. 저작자가 시점을 못 바꾼다 | 근사 | gyroscopic-precession · atomic-orbital · polarization · angular-momentum · angular-momentum-vector |
| G56 | 높이장을 3차원 곡면으로 그리는 어휘가 없다 — 투영 · 가려짐 · 기울기 음영을 조각이 구워 `scalarField` 한 장으로 넘긴다. 곡면 위 선 · 점의 가려짐도 조각이 뺀다 | 근사 | equipotential-surface |
| G57 | 머리 있는 화살표 묶음이 없다 — `vector` 는 낱개, `lineSet` 은 머리가 없어 꺾쇠 두 획으로 흉내 낸다 | 근사 | gyroscopic-precession · stability-of-floating-body |
| G58 | 캡션 문안의 일부(값 하나)에 강조색 · 굵기를 걸 수 없다 — 화면 표식과 캡션 숫자를 색으로 잇지 못한다 | 근사 | hr-diagram |
| G59 | `TimelineFrame` 에 다른 시각의 진행도를 묻는 자리가 없다 — 「조금 전 자리」 꼬리를 위해 조각이 단계 길이 · 이징을 다시 계산한다 | 근사 | hr-diagram · electromagnetic-wave · standing-wave · center-of-mass-motion · conservation-of-angular-momentum · quality-factor |
| G60 | 파장마다 그 파장의 색으로 칠하는 스펙트럼 채움이 없다 — 「골이 초록 자리에 왔다」 가 눈금 숫자로만 읽힌다 (빛 색 트랙) | **주장** | thin-film-interference · hydrogen-spectrum |
| G61 | 물리 계산이 낸 색(값 → RGB)을 칠할 수 없다 — `scalarField` 색표 · 입자 색이 테마 역할의 명암뿐이다. 반사색 · 흑체색 (빛 색 트랙) | **주장** (thin-film) · 근사 (hr) | thin-film-interference · hr-diagram · youngs-double-slit · hydrogen-spectrum · total-internal-reflection |
| G62 | `scalarField` 의 값→색 사상 곡선 · 섞기 공간을 고를 수 없다 — 선형광 고정이라 원본의 농도 · 명도 사상을 옮기려면 조각이 테마 명도 숫자를 들고 되풀거나(다크에서 틀림) 중간 농도를 잃는다 | 근사 | lift-force · longitudinal-wave · thermal-convection · huygens-principle · polarization · double-slit-with-electrons · resonance · capillary-action · standing-wave · youngs-double-slit · hydrogen-spectrum · lagrange-points |
| G63 | `lineSet` 굵기를 월드 단위로 줄 수 없다 — 월드 간격으로 놓은 기둥이 배율에 따라 뜨거나 겹친다 | 근사 | carnot-cycle · double-slit-with-electrons · resonance |
| G64 | `trace` 자국마다 수명을 줄 수 없다 — 인스턴스 하나에 수명 하나 | 근사 | atomic-orbital |
| G65 | `param-chips` 선택 표시 모양을 고를 수 없다 | 근사 | atomic-orbital |
| G66 | 스칼라 장에서 등고선(같은 값 선)을 뽑는 어휘가 없다 — 조각이 마칭 스퀘어로 선분 2257개를 만들어 `lineSet` 로 넘긴다 | 근사 | equipotential-surface · electromagnetic-wave · lagrange-points · refraction-of-waves |

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

## 턴 3 (2026-09-17) — 8개 분야 각 3번

일·에너지·운동량은 턴 2 에서 제외됐다. 판정 기준은 턴 2 와 같다(장부 문안이 적고 있지 않으면 새 id).

### 새 부족

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G67 | 가로만 폭에 맞춰 늘어나는 배치를 선언할 수 없다 — 가로 · 세로 같은 배율이라 좁은 임베드에서 세로 눈금까지 준다 | 근사 | normal-modes |
| G68 | `lineSet` 에 선 모양(점선)이 없다 — 점선 가닥을 `trajectory` 낱개로 선언한다 (G05 는 대시 무늬 값을 고르는 문제) | 근사 | normal-modes · radioactive-decay · kinetic-energy · work-energy-theorem · non-conservative-force · shm-energy |
| G69 | 광원 · 시선 방향만 주면 구의 명암 경계를 그리는 원판 어휘가 없다 — 조각이 칸마다 내적을 계산해 `scalarField` 로 넘긴다 | 근사 | moon-phases |
| G70 | `scalarField` 순차형의 낮은 끝이 바탕으로 고정이고 여러 색 정박점이 없다 — 「그늘도 조금 밝은 톤」 · 「차가운 끝도 색」 을 줄 수 없다 | 근사 | moon-phases · thermal-convection · phase-diagram · stability-of-floating-body · refraction-of-waves |
| G71 | `scalarField` 의 칠 영역이 축 정렬 사각형뿐이다 — 원판 · 기울어진 판 밖을 바탕 값으로 칠해 모양을 만들고, 그 칸이 아래 그림을 가린다 | 근사 | moon-phases · polarization · capillary-action |
| G72 | 점 · 선 · 면에 쓸 바탕(반전) 색 역할이 없다 — `luminance: 0` 우회가 다크 테마에서 뒤집힌다 (G07 은 글자만) | 근사 | poiseuille-flow · keplers-second-law · stability-of-floating-body · refraction-of-waves · total-internal-reflection · rocket-equation · work-by-variable-force · conservation-of-momentum |
| G73 | 떨어진 면 여러 개를 한 선언으로 칠하는 면 묶음이 없다 — 칸마다 `region` | 근사 | poiseuille-flow · resonance · keplers-second-law · stability-of-floating-body · perfectly-inelastic-collision · rocket-equation |
| G74 | `lineSet` 에 선마다 다른 굵기가 없다 — 굵기별 인스턴스로 나눈다 | 근사 | thermal-convection · moment-of-inertia |
| G75 | `particleSystem` 에 「꼬리가 짧을 때만 점」 이 없다 | 근사 | thermal-convection |
| G76 | `preroll` 이 상태의 일부만 미리 굴리게 고를 수 없다 — `initialState` 가 직접 적분한다 | 근사 | thermal-convection |
| G77 | `particleSystem` 입자에 둘레 선(굵기 · 색)이 없다 (G03 은 `body` 한정) | 근사 | huygens-principle · radioactive-decay |
| G78 | 면 해칭의 방향 · 간격 · 색을 고를 수 없다 — `region` hatch 는 45° · 바탕색 고정 | 근사 | polarization · stability-of-floating-body · kinetic-energy · non-conservative-force · gravitational-potential-energy · rotational-kinetic-energy |
| G79 | `particleSystem` 점 크기를 월드 단위로 줄 수 없다 (G63 은 `lineSet` 굵기) | 근사 | electromagnetic-wave · resonance · phase-diagram · moment-of-inertia · radioactive-decay · efficiency |
| G80 | 간격이 점점 짧아지는 사건 일정표(사건 수 · 사건 시각)를 선언할 자리가 없다 | 근사 | double-slit-with-electrons · physical-pendulum |
| G81 | `scalarField` 를 보간 없이 칸 그대로 칠할 수 없다 | 근사 | double-slit-with-electrons · resonance |

### 기존 주장 부족의 재발

- **G34 (주장)** — moon-phases · polarization. 빛의 밝기를 테마 역할(`ink` = 밝음)로 칠해 **라이트 테마에서 밝음 · 어둠이 뒤집힌다**
  (보름달 원판이 짙은 남색, 되살아난 빛이 어두운 얼룩). 대조 보고서는 운영체제 설정으로 다크로 찍혔고, 라이트 강제 촬영으로 확인했다.
  다크 테마에서는 두 조각 모두 주장이 선다.

### 분야별 새 부족 수

| 분야 | 조각 | 새 부족 | 그중 주장 | 다음 턴 |
|---|---|---|---|---|
| 회전과 진동 | normal-modes | 2 (G67 · G68) | 0 | 계속 |
| 중력과 천체 | moon-phases | 3 (G69 · G70 · G71) | 0 (기존 G34 재발) | 계속 |
| 유체 | poiseuille-flow | 2 (G72 · G73) | 0 | 계속 |
| 열과 통계 | thermal-convection | 4 (G70 · G74 · G75 · G76) | 0 | 계속 |
| 파동과 음향 | huygens-principle | 1 (G77) | 0 | 계속 |
| 광학 | polarization | 2 (G71 · G78) | 0 (기존 G34 재발) | 계속 |
| 전자기 | electromagnetic-wave | 1 (G79) | 0 | 계속 |
| 현대물리 | double-slit-with-electrons | 2 (G80 · G81) | 0 | 계속 |

## G34 해결 (2026-09-17, 턴 3 과 턴 4 사이)

사용자 결정으로 G34 를 턴 사이에 먼저 풀었다. 「빛은 테마 색 역할이 아니라 물리량」 (턴 1 뒤 결정)에 따라 **색 역할에 넣지 않고 별도 빛 채널**로 만들었다 —
처음 계획(ColorRole 에 lit · unlit)은 rule-guard 사전 검토가 그 결정과 어긋난다고 짚어 바꿨다.

- `LightChannel.light` 0~1 — 테마와 무관한 빛의 세기. `body` · `trajectory` · `particleSystem` · `lineSet` · `region` · `sector` 에만 붙는다
  (처음엔 `BaseMeta` 에 두었다가 이 필드를 그리지 않는 렌더러가 있어 S-render 사후 검증으로 좁혔다).
- `scalarField.colors: 'light'` — 값을 빛의 세기로. 칸 값 `NaN` 은 칠하지 않는다(모든 모드).
- 테마 `light: { none, full }` — 어느 테마에서나 `none` 이 `full` 보다 어둡다.

| id | 상태 | 근거 |
|---|---|---|
| G34 | 해결됨 | moon-phases · polarization 을 다시 옮겨 라이트 · 다크 모두에서 밝은 곳이 밝다(라이트 강제 촬영으로 확인). color-addition · thin-film-interference 는 빛의 **색**(G33 · G60 · G61)이 남아 빛 색 트랙 대기 그대로 |
| G71 | 일부 해결 | `NaN` 칸으로 원판 · 기울어진 판 밖을 비운다. 경계가 칸 크기만큼 계단지는 것은 남음 |

재이관에서 드러난 것 (측정값에는 넣지 않는다): 라이트 테마에서 가득 찬 빛(흰색)이 미색 바탕에 묻혀 밝은 면의 윤곽이 사라진다 — moon-phases 는 빛이 아닌 윤곽선을 더해 우회. 턴 4 의 G92 와 같은 종류다.

## 턴 4 (2026-09-17) — 8개 분야 각 4번

턴 4 원본은 G34 작업과 나란히 만들었고, 이관은 빛 채널이 들어간 뒤 했다. 판정 기준은 턴 2 · 3 과 같다.

### 새 부족

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G82 | 한 줄씩 밀리는 시간 이력 무늬(폭포 무늬) 어휘가 없다 — 조각이 이력을 상태에 쌓고 매 프레임 통째로 넘긴다 | 근사 | resonance |
| G83 | 고정 촬영(`?t=`) 중 조작기를 비활성으로 그리는 선언이 없다 | 근사 | resonance · refraction-of-waves |
| G84 | 월드에 놓이는 막대 묶음이 없다 — `graph` bar 는 화면 카드라 막대를 `region` 으로 직접 배치한다 | 근사 | keplers-second-law · energy-dissipation · rocket-equation · ballistic-pendulum · non-conservative-force · conservative-force · inelastic-collision · energy-in-collision · parallel-axis-theorem · shm-energy · coupled-oscillators |
| G85 | 발산형 `scalarField` 의 가운데(0)가 바탕으로 고정이다 — 「대기압 액체 ≠ 공기」 · 「바탕보다 밝은 마루」 를 줄 수 없고 테마에 따라 명암이 뒤집힌다 (G70 은 순차형 낮은 끝) | 근사 | capillary-action · youngs-double-slit |
| G86 | `param-chips` 가 같은 칸을 다시 누른 것을 알리지 못한다 — `heldPath` 로 우회 | 근사 | capillary-action |
| G87 | 음 · 양을 가르는 중립 색 역할 쌍이 없다 — 뜻이 다른 `negative` 를 빌린다 (G54 는 같은 역할 양쪽) | 근사 | standing-wave |
| G88 | `marker` 점 크기를 고를 수 없다 | 근사 | standing-wave |
| G89 | 경로를 따라 흐르는 점 묶음이 없다 — scene 이 점 자리를 계산한다 | 근사 | rc-circuit · efficiency · conservative-force |
| G90 | 코어에 회로 기호 · 2위치 스위치가 없다 — 선으로 그린다 | 근사 | rc-circuit |
| G91 | 값에서 기준선까지 잇는 세로 차이 막대(끝 눈금 포함)가 없다 — `lineSet` 으로 근사 | 근사 | rc-circuit · radioactive-decay · conservative-force · rotational-kinetic-energy · damped-oscillation |
| G92 | 빛 채널의 가득 찬 빛이 라이트 바탕과 겹쳐 발광체 · 밝은 면의 윤곽이 사라진다 — 같은 대상을 역할 색과 빛으로 두 번 선언하거나 윤곽을 더한다 | 근사 | hydrogen-spectrum (moon-phases 재이관에서도) |

### 기존 부족으로 주장이 약해진 조각

- **hydrogen-spectrum** — 파장색이 없어(G60 · G61, 빛 색 트랙) 「같은 낙차 = 같은 색 = 띠의 선 색」 연결을 잃었다. 「같은 자리에만 쌓인다」 는 선다.
  캡션의 「색 하나가 나오고」 를 화면에 맞게 바꿨다.

### 분야별 새 부족 수

| 분야 | 조각 | 새 부족 | 그중 주장 | 다음 턴 |
|---|---|---|---|---|
| 회전과 진동 | resonance | 2 (G82 · G83) | 0 | 계속 |
| 중력과 천체 | keplers-second-law | 1 (G84) | 0 | 계속 |
| 유체 | capillary-action | 2 (G85 · G86) | 0 | 계속 |
| 열과 통계 | phase-diagram | 0 | 0 | **제외** |
| 파동과 음향 | standing-wave | 2 (G87 · G88) | 0 | 계속 |
| 광학 | youngs-double-slit | 1 (G85) | 0 | 계속 |
| 전자기 | rc-circuit | 3 (G89 · G90 · G91) | 0 | 계속 |
| 현대물리 | hydrogen-spectrum | 1 (G92) | 0 (기존 G60 · G61 로 약해짐) | 계속 |

## 턴 5 (2026-09-17) — 7개 분야 각 5번 (목록 마지막)

일·에너지·운동량(턴 2) · 열과 통계(턴 4)는 제외됐다. 판정 기준은 턴 2~4 와 같다.

### 새 부족

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G93 | 시간표 단계 경계에 부동소수 허용이 없다 — `?t=` 촬영이 1/60 초 걸음을 쌓아 경계 바로 앞(3.9999…)에 멈춰 **앞 단계 캡션**이 찍힌다. 어휘 부족이 아니라 엔진 시계의 결함일 수 있다(미확인) | 근사 | charged-particle-in-magnetic-field |
| G94 | `trajectory` `fade: 'tail'` 의 최소 알파 · 옅어지는 곡선을 고를 수 없다 | 근사 | charged-particle-in-magnetic-field |
| G95 | 굽은 화살표(원호 + 촉) 어휘가 없다 — 원호와 삼각형을 따로 선언하고 촉 자리를 scene 이 계산한다 | 근사 | moment-of-inertia · stability-of-floating-body · parallel-axis-theorem · angular-momentum-vector · gears |
| G96 | 조작한 뒤 다른 단계 묶음으로 넘어가는 시간표 선언이 없다 (G44 는 캡션 전환만) | 근사 | moment-of-inertia |
| G97 | 뷰포트 전체를 덮는 장을 선언할 수 없다 — 월드 사각형 끝이 비쳐 넓게 깔아 피한다 (G71 은 영역 모양) | 근사 | lagrange-points · rocket-equation · angular-momentum |
| G98 | 빛 채널에 값 → 밝기 사상(화면값 / 선형광)을 고를 자리가 없다 — 조각이 역변환해 넘긴다 (G62 는 `scalarField` 역할 색) | 근사 | total-internal-reflection |
| G99 | 조작하는 동안 시간표 시계를 멈추는 선언이 없다 — 손을 놓으면 그동안 흐른 자리로 뛴다 | 근사 | total-internal-reflection |

### 분야별 새 부족 수

| 분야 | 조각 | 새 부족 | 그중 주장 | 판정 |
|---|---|---|---|---|
| 회전과 진동 | moment-of-inertia | 2 (G95 · G96) | 0 | 섬 |
| 중력과 천체 | lagrange-points | 1 (G97) | 0 | 섬 (라이트에서 지형 명암 반전, G30 종류) |
| 유체 | stability-of-floating-body | 1 (G95) | 0 | 섬 |
| 파동과 음향 | refraction-of-waves | 0 | 0 | 섬 |
| 광학 | total-internal-reflection | 2 (G98 · G99) | 0 | 섬 (빛 채널, 라이트 확인) |
| 전자기 | charged-particle-in-magnetic-field | 2 (G93 · G94) | 0 | 섬 |
| 현대물리 | radioactive-decay | 0 | 0 | 섬 |

목록이 끝나 다음 턴은 없다. 파동과 음향 · 현대물리의 0 은 기록만 한다.

## 검증 요약 (턴 1~5, 2026-09-17)

| 턴 | 조각 | 새 부족 종류 | 주장 부족(새) | 주장이 약해진 조각 | 0 인 분야 |
|---|---|---|---|---|---|
| 1 | 9 | 23 (G29~G51) | 3 (G33 · G34 · G40) | color-addition | — |
| 2 | 9 | 12 (G55~G66) | 2 (G60 · G61) | thin-film-interference | 일·에너지·운동량 |
| 3 | 8 | 15 (G67~G81) | 0 (G34 재발 2 조각) | moon-phases · polarization (라이트) → G34 해결로 복구 | — |
| 4 | 8 | 11 (G82~G92) | 0 | hydrogen-spectrum (G60 · G61) | 열과 통계 |
| 5 | 7 | 7 (G93~G99) | 0 | — | 파동과 음향 · 현대물리 |

- 턴 사이 엔진 작업은 둘: 묶음 그리기(턴 1 뒤, G29 · G32 · G37 · G40 · G41 · G43 · G51) · 빛 채널(턴 3 뒤, G34).
- 주장이 아직 서지 않는 조각은 모두 **빛의 색** 한 뿌리다: color-addition · thin-film-interference · hydrogen-spectrum (G33 · G35 · G60 · G61).
- 그 밖의 새 부족은 모두 `근사`다. 턴 3 부터 새 주장 부족이 나오지 않았다.
- 새 부족 종류 수는 23 → 12 → 15 → 11 → 7 로 줄었지만 0 에 수렴하지 않았다 — 문안 기준이 기존 어휘의 옵션 하나까지 새 id 로 세기 때문이다.

## 빛 색 트랙 (2026-09-17, 검증 뒤)

턴 1 뒤 사용자 결정(빛의 색은 테마 색 역할이 아니라 물리량)으로 미뤄 둔 트랙이다. 검증 요약에서 주장이 서지 않는 조각이 모두 이
한 뿌리였다. 빛 채널(G34)을 색으로 넓혔다.

- `LightChannel.light` — 세기(0~1) 또는 `{ rgb }`(선형광, 가득 찬 흰빛 = `[1, 1, 1]`).
- `LightChannel.blend: 'add'` — 겹친 빛을 더해 칠한다(캔버스 `lighter`). 한계: 화면값 합이라 원색 1 끼리만 정확.
- `scalarField` `colors: 'lightRgb'` — 칸마다 세 성분, `NaN` 투명.
- `@aperi21/plugin-optics` 순수 함수 `wavelengthToLinearRgb` · `spectrumToLinearRgb`(CIE 1931 근사) — 색 계산은 렌더러가 아니라 조각이
  이 함수로 한다. 광선 렌더러의 파장색도 같은 함수를 쓴다.

| id | 상태 | 근거 |
|---|---|---|
| G33 | 해결됨 | color-addition 의 원색 · 합색, hr-diagram · hydrogen-spectrum · thin-film-interference 의 파장 · 흑체 · 반사색이 두 테마에서 색으로 선다 |
| G35 | 해결됨 | color-addition 이 `blend: 'add'` 로 겹친 칸 자르기를 지웠다 |
| G60 | 해결됨 | thin-film-interference 스펙트럼 채움 · hydrogen-spectrum 띠가 `lightRgb` 로 파장마다 제 색 |
| G61 | 해결됨 | thin-film-interference 막 · 원판 반사색, hr-diagram 흑체색 |
| G92 | 일부 해결 | hydrogen-spectrum 의 「같은 광자 두 번 선언」 우회가 필요 없어졌다. 흰빛이 라이트 미색 바탕에 묻히는 것은 남음 — color-addition 합 네모(회색 테로 구분), hr-diagram 은 원본처럼 그림 영역에 빛 없음 바탕을 깔았다 |

재이관에서 드러난 부족 (측정값에는 넣지 않는다):

| id | 부족 | 영향 | 조각 |
|---|---|---|---|
| G100 | 강조 역할 표지가 빛 색 대상 위에서 묻힐 때 쓸 둘레(바탕 테두리 · 대비)가 없다 — 황토 관찰 고리가 금빛 막 띠 위에서 거의 안 보인다 | 근사 | thin-film-interference |
| G101 | `lineSet` 에 선마다 다른 빛 색이 없다 — 파장마다 선언을 나눈다 (G32 는 `particleSystem`) | 근사 | hydrogen-spectrum |

판정: 네 조각 모두 다크 · 라이트에서 원본의 색 주장이 선다. 검증에서 주장이 약해졌던 조각(color-addition · thin-film-interference ·
hydrogen-spectrum)은 이제 모두 섰다.

## 직접 구현 시험 1 (2026-09-17) — 일·에너지·운동량 5개

새 작업 방식의 시험이다. **자유 구현 원본을 만들지 않고** 엔진 위에서 바로 지었다. 원본 대조가 없어진 자리는
「probeTimes 마다 라이트 · 다크 스크린샷을 만든 에이전트가 직접 열어 주장이 서는지 판정한다」 로 메웠다
(`piece:report` 가 원본 없는 조각을 지원하고 sims 를 두 테마로 강제 촬영하도록 고쳤다).

운동 에너지 · 에너지 소산 · 완전 비탄성 충돌 · 로켓 방정식 · 탄동 진자. 다섯 모두 주장 부족 0, 다크 · 라이트에서 주장이 선다.

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G102 | 열 · 온도처럼 뜻이 정해진 색 역할이 없다 — `accent` 를 빌리면 같은 그림에서 강조가 두 뜻이 된다 | 근사 | energy-dissipation |
| G103 | `dimension` 이 짧아지면 끝 표시와 글자가 겹친다 — 최소 길이 · 글자 자리 규칙이 없고, 조각이 「이 아래로는 재지 않는다」 를 판정할 자리도 없다 | 근사 | ballistic-pendulum · elastic-potential-energy · inelastic-collision · rotational-kinetic-energy · quality-factor |
| G104 | 시간표 단계에 「이 단계 동안 이 값은 그대로다」 를 선언할 자리가 없다 — 어느 표지를 걸지 scene 이 진행도로 다시 판정한다 (G01 은 `step` 쪽) | 근사 | ballistic-pendulum |

관찰(부족 아님): 같은 `t` 로 두 번 찍으면 조각 그림은 픽셀까지 같고 캡션 · 이름표 **글자의 래스터화**만 달라진다.
세 조각이 따로 재어 같은 결론을 냈다 — 카탈로그 페이지의 글꼴 적재 시점 차이로, 조각 쪽 흔들림이 아니다.

## 직접 구현 턴 1 (2026-09-18) — 일·에너지 8개

최종 채택 전 마지막 실험의 첫 턴이다(`_batches/14-direct-energy-2.json`). 시험 1 과 같이 원본 없이 엔진 위에서 바로 지었다.

변하는 힘이 한 일 · 일-운동 에너지 정리 · 중력 퍼텐셜 에너지 · 탄성 퍼텐셜 에너지 · 보존력 · 비보존력 · 평형점 · 효율.
여덟 모두 주장 부족 0, 두 테마에서 주장이 선다(만든 에이전트의 판정).

**새 부족 0.** 겪은 부족은 모두 장부에 있던 것이고 영향은 전부 근사다 — 위 표의 「겪은 조각」 칸에 더했다.
가장 많이 겪은 것: G28 곡선 표본 · G47 축 · 자 (각 4) · G10 판 좌표계 (3).

## 직접 구현 턴 2 (2026-09-18) — 운동량 · 충돌 8개

`_batches/15-direct-energy-3.json`. 충격량-운동량 정리 · 운동량 보존 · 탄성 충돌 · 비탄성 충돌 · 2차원 충돌 · 질량 중심의 운동 ·
폭발과 반동 · 충돌에서의 에너지. 여덟 모두 주장 부족 0, 두 테마에서 주장이 선다(만든 에이전트의 판정).

**새 부족 8, 모두 근사.** 턴 1(0)과 달리 운동량 조각에서 「잇기 · 붙이기 · 한 번 일어나기」 쪽 모자람이 새로 나왔다.

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G105 | 스테이지 상수가 수 하나씩뿐이라 목록(줄마다의 값)을 선언할 수 없다 — 줄 수는 코드에, 줄마다의 값은 이름 셋으로 흩는다 (G13 은 시간표 단계 쪽) | 근사 | inelastic-collision · energy-in-collision · mass-spring-system · physical-pendulum · damping-regimes |
| G106 | 한 번 터지고 끝나는 파편 어휘가 없다 — `stream` 은 계속 뿜기만 해서 scene 이 파편 자리를 계산해 `particleSystem` 으로 넘긴다 | 근사 | explosion-and-recoil |
| G107 | 용수철(`constraint` spring)에 다 눌린 최소 길이가 없다 — 가장 눌린 순간 코일이 뭉쳐 자연 길이를 늘려 피한다 (G20 은 폭 · 굵기) | 근사 | conservation-of-momentum · damping-regimes · nonlinear-oscillation |
| G108 | 화살표를 꼬리-머리로 잇는 묶음이 없다 — 이음 자리를 scene 이 계산하고, 짧아진 화살표는 머리만 남는다 (G57 은 나란한 묶음) | 근사 | energy-in-collision |
| G109 | 같은 자리에서 이름표 문안을 갈아 끼우는 선언이 없다 — 단계를 하나 더 두어 바꾼다 (G14 · G44 는 캡션 쪽) | 근사 | energy-in-collision |
| G110 | `vector.from` 을 물체 id 에 걸 수 없다 — 화살표 꼬리를 물체 가장자리에 두는 계산을 scene 이 한다 | 근사 | two-dimensional-collision · torque · static-equilibrium · center-of-gravity · simple-harmonic-motion · nonlinear-oscillation |
| G111 | 선을 따라 이름표를 붙일 자리가 없다 — 어디에 두어도 선과 겹쳐 이름표를 뺐다 (G49 는 선 끝) | 근사 | center-of-mass-motion · torque · parallel-axis-theorem · nonlinear-oscillation |
| G112 | 이름표와 대상을 잇는 지시선이 없다 — 움직이는 점의 이름표를 고정 자리에 두고 색으로만 잇는다 | 근사 | center-of-mass-motion |

가장 많이 겪은 기존 부족: G09 묶음 불투명도 · G17 화살표 이름표 (각 4) · G10 · G47 · G24 (각 3).

## 직접 구현 배치 16 (2026-09-18) — 회전 8개

`_batches/16-direct-rotation.json`. 돌림힘 · 평행축 정리 · 회전 운동 에너지 · 각운동량 · 각운동량 보존 · 각운동량의 방향 ·
미끄러지지 않는 구름 · 구르는 물체의 경주. 여덟 모두 두 테마에서 주장이 선다(만든 에이전트의 판정).

**새 부족 9 — 주장 1, 근사 8.** 처음으로 `주장` 영향이 나왔다(G120).

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G113 | `sector` 가 곧은 두 변을 긋지 않는다 — 어디서부터 잰 각인지 점선으로 따로 보인다 | 근사 | torque · static-equilibrium |
| G114 | `surface` wall 에 평면도(위에서 본) 벽 두께가 없다 — 선 하나로 벽을 대신한다 | 근사 | torque |
| G115 | `readout` 에 아래 · 위 첨자가 없다 — `I_cm` 을 밑줄 문자 그대로 쓴다 | 근사 | parallel-axis-theorem |
| G116 | 원형 `body` 가 `orientation` 을 그림에 드러내지 않는다 — 도는 표지를 `lineSet` 살로 따로 선언하고 끝점을 scene 이 계산한다 (moment-of-inertia 도 같은 우회) | 근사 | rolling-race · rotational-kinetic-energy |
| G117 | 물리 시계가 멈추는 단계를 선언할 수 없다(`timeScale` > 0) — physics 가 「움직이는 단계」 id 목록을 코드에 둔다 (G99 는 조작 중 시계, G104 는 값 그대로 표지) | 근사 | rolling-without-slipping |
| G118 | 한 점을 중심으로 함께 도는 묶음(테 · 살 · 표지점)을 각 하나로 돌리는 선언이 없다 — 인스턴스마다 cos · sin 으로 자리를 계산한다 (G10 은 평행 이동) | 근사 | rolling-without-slipping · static-equilibrium · center-of-gravity |
| G119 | `surface.material` 이 선언에만 있고 렌더러가 읽지 않는다 — S-render 「선언에 둔 필드는 렌더러가 구현한다」 위반(rule-guard 확인, 2026-04-21 부터). 20개 sim 의 `material` 선언이 그림에 반영되지 않는다 | 근사 | rotational-kinetic-energy |
| G120 | 3차원 투영이 거울상이 아님을 어휘가 보장하지 않는다 — 조각의 투영식 가로축 부호 하나로 오른손 규칙이 왼손 규칙이 되고, 모양은 멀쩡해 드러나지 않는다 (G55 의 투영 부재가 원인). gyroscopic-precession 의 투영이 이 기준으로 거울상일 수 있다는 보고가 있다(미확인) | **주장** | angular-momentum-vector |
| G121 | 한 선을 깊이에 따라 앞 · 뒤로 갈라 그릴 방법이 없다 — 표본마다 깊이를 보고 가닥을 나눠 선언한다 | 근사 | angular-momentum-vector |

rule-guard 사후 검증이 둘을 잡아 고쳤다 — conservation-of-angular-momentum 의 선언 이징(linear)과 physics 의 smoothstep 불일치
(선언 `smooth` 로 바꾸고 physics 가 선언의 이징 이름을 읽는다), parallel-axis-theorem 의 시작 축 거리 코드 상수(스테이지 상수로).

## 직접 구현 배치 17 (2026-09-18) — 평형 · 기어 · 조화 운동 8개

`_batches/17-direct-oscillation-1.json`. 정적 평형 · 무게 중심 · 기어 · 단순 조화 운동 · 조화 운동의 에너지 · 용수철 진자 · 단진자 ·
물리 진자. 여덟 모두 두 테마에서 주장이 선다(만든 에이전트의 판정). 주장 부족 0.

정적 평형 · 무게 중심의 「도는 물체에 붙는 좌표계 / 한 점 둘레로 돌리기」 는 G118 과 같은 모자람이라 새 id 를 주지 않았다.

**새 부족 9, 모두 근사.**

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G122 | 월드 앵커에 붙인 `readout` 칩이 `align` 을 무시하고 늘 가운데에 놓여 표지점을 덮는다 | 근사 | center-of-gravity |
| G123 | `dimension` 글자의 크기 · 글꼴 · 기울임 · 바탕 칩을 고를 수 없다 — 같은 그림에서 기호 모양이 갈리고, 물체 위에서 글자가 묻힌다 | 근사 | mass-spring-system · gears |
| G124 | 핀에 매달려 도는 강체 어휘가 없다 — `constraint` rigid_rod 는 핀 너머로 튀어나온 몸통을 그리지 못해 막대 · 질량 중심 · 거리 표지를 scene 이 매 프레임 계산한다 | 근사 | physical-pendulum |
| G125 | 움직이는 물체 위의 점을 따라가는 조작기가 없다 — 조작기 선언이 정적이다 | 근사 | physical-pendulum |
| G126 | `constraint` 끝을 물체 id 에 걸면 중심까지 긋는다 — 속 빈 물체 안으로 줄이 비쳐 둘레 끝점을 scene 이 계산한다 (G110 은 `vector.from`) | 근사 | simple-pendulum |
| G127 | 세로 `dimension` 의 글자가 선 위 끝 너머에 붙는다 — 다른 물체(보) 위에 얹혀 글자 없는 치수선 + 따로 붙인 이름표로 피한다 (G103 · G111 과 다름) | 근사 | simple-pendulum |
| G128 | 기어(톱니바퀴) 어휘가 없다 — 톱니를 사다리꼴로 계산해 매 프레임 SVG 경로 문자열로 `body` custom 에 넘긴다 | 근사 | gears |
| G129 | 단계 길이 사이의 관계(주기 = `turn` × 2 등)를 선언할 자리가 없다 — 저작자가 깨도 경고 없이 주기 끝에서 튄다 | 근사 | gears |
| G130 | 고정 촬영(`?t=`)에서 조작기 값을 고를 수 없다 — 칩의 다른 값 화면을 확인하지 못한다 (G83 은 비활성 모양) | 근사 | gears |

## 직접 구현 배치 18 (2026-09-18) — 감쇠 · 강제 · 결합 진동 7개

`_batches/18-direct-oscillation-2.json`. 감쇠 진동 · 감쇠의 세 양상 · 강제 진동 · Q 인자 · 결합 진동자 · 진동의 맥놀이 · 비선형 진동.
일곱 모두 두 테마에서 주장이 선다(만든 에이전트의 판정). 주장 부족 0. 회전과 진동 분야는 이 배치로 다 만들었다.

판정 메모 — coupled-oscillators 가 새 부족으로 올린 「단계 길이가 스테이지 상수를 따라가지 못한다」 는 배치 17 의 세 조각이
이미 G13 으로 적은 것과 같아 G13 으로 셌다. damping-regimes 의 「정착 시각을 표시하는 어휘」 는 정착 시각 계산이 조각의
물리라서 장부에 올리지 않았다(표시는 `trajectory` 눈금으로 된다).

**새 부족 2, 모두 근사.**

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G131 | 월드에 놓이는 흐르는 기록지(시간창 이력 곡선)가 없다 — `graph` 는 화면 카드라 물체 옆에 붙일 수 없어 scene 이 표본 수백 개를 매 프레임 계산해 `trajectory` 로 넘긴다 (waves/beats 의 NOTES 「시간창 잔상 트랙」 과 같다, G82 폭포 무늬와 다름) | 근사 | driven-oscillation · beats-in-oscillation |
| G132 | 감쇠기(대시포트) 어휘가 없다 — 감쇠의 존재와 세기를 이름표 글자만 말한다 | 근사 | damping-regimes |
