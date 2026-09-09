# 물리 주제 목록 — 조각을 캘 광맥

> 작성 2026-09-09 · Phase 0 산출물
> 근거: `tasks/facet-insights/ANALYSIS.md` §4, FACET `tasks/piece-facet-experiment.md`

## 이 문서가 무엇이 아닌지 먼저

**만들 시각화 목록이 아니다.** 주제 하나가 조각 하나가 되지 않는다.

여기 있는 것은 **글이 다룰 만한 맥락**이다. 다음 국면에서 각 주제마다 "글이 이 대목을
설명할 때 어디서 멈추는가" 를 물어 질문을 캐고, 거기에 잣대 셋을 적용해 살아남는 것만
조각이 된다.

> 1. 답하는 질문을 **한 문장**으로 쓸 수 있는가
> 2. 그 문장을 **그림 없이** 이해시킬 수 있는가 (시킬 수 있으면 만들지 않는다)
> 3. 그 질문의 **동사가 화면에서 실제로 일어나는가** (안 일어나면 발췌다)

`docs/01-catalog.json` 은 이 구분 없이 "만들 시각화" 로 적힌 목록이라 상상이 섞였다.
그것을 확장하지 않고 도메인에서 새로 뽑는다.

## 규약

- **이름은 통용 용어로 짓는다.** 서술문으로 지으면 벡터 검색에 걸리지 않고, 걸리지
  않으면 선택받지 못한다. FACET 이 조각 530개를 서술문으로 짓고 전부 되돌렸다
  (`0c04e1c`: *"조각 530개 중 83% 가 동사로 끝나는 서술문이었다 … 용어가 없으면 벡터
  검색에 걸리지 않는다"*). 통용 용어가 없을 때만 묘사를 이름으로 쓴다 — 억지로 짓는
  편이 더 나쁘다.
- **id 는 kebab-case.** 레지스트리 키(`aperi21:<id>`)와 같은 표기를 쓴다.
- 설명 한 줄은 **그 주제가 무엇을 다루는지**만 적는다. 어떻게 그릴지는 적지 않는다 —
  적는 순간 상상이 시작된다.

---

## 1. 운동학 (kinematics)

| id | 이름 | 다루는 것 |
|---|---|---|
| `position-velocity-acceleration` | 위치·속도·가속도 | 세 양의 관계와 미분·적분 구조 |
| `uniform-motion` | 등속 운동 | 속도가 일정한 운동 |
| `uniform-acceleration` | 등가속도 운동 | 가속도가 일정한 운동과 그 식 |
| `free-fall` | 자유 낙하 | 중력만 받는 연직 운동 |
| `projectile-motion` | 포물선 운동 | 수평·연직 성분의 독립 |
| `relative-motion` | 상대 운동 | 기준틀에 따른 속도의 변환 |
| `circular-motion` | 등속 원운동 | 속력이 일정한 원 궤도와 구심 가속도 |
| `angular-kinematics` | 각운동학 | 각변위·각속도·각가속도 |
| `motion-graphs` | 운동 그래프 | x-t · v-t · a-t 의 대응 |
| `terminal-velocity` | 종단 속도 | 저항과 중력이 균형에 이르는 속도 |

## 2. 뉴턴 역학 (newtonian-mechanics)

| id | 이름 | 다루는 것 |
|---|---|---|
| `newtons-first-law` | 관성 법칙 | 힘이 없을 때의 운동 상태 |
| `newtons-second-law` | 가속도 법칙 | 힘·질량·가속도의 관계 |
| `newtons-third-law` | 작용 반작용 | 힘의 쌍과 그 작용점 |
| `free-body-diagram` | 자유물체도 | 한 물체에 작용하는 힘의 분리 |
| `normal-force` | 수직항력 | 접촉면이 미는 힘 |
| `friction` | 마찰력 | 정지·운동 마찰과 임계 |
| `inclined-plane` | 빗면 | 중력의 성분 분해 |
| `tension-and-pulley` | 장력과 도르래 | 줄로 연결된 계의 운동 |
| `spring-force` | 탄성력 | 훅 법칙과 변형 |
| `centripetal-force` | 구심력 | 원운동을 유지하는 힘의 정체 |
| `non-inertial-frame` | 비관성계 | 가속하는 기준틀과 관성력 |
| `drag-force` | 공기 저항 | 속도에 의존하는 저항력 |

## 3. 일·에너지·운동량 (energy-momentum)

| id | 이름 | 다루는 것 |
|---|---|---|
| `work` | 일 | 힘과 변위의 곱, 경로 의존성 |
| `kinetic-energy` | 운동 에너지 | 속도와 에너지의 관계 |
| `potential-energy` | 퍼텐셜 에너지 | 위치에 저장된 에너지 |
| `conservation-of-energy` | 에너지 보존 | 형태가 바뀌어도 총량이 유지됨 |
| `power` | 일률 | 단위 시간당 일 |
| `conservative-force` | 보존력 | 경로에 무관한 힘과 퍼텐셜의 존재 |
| `energy-diagram` | 퍼텐셜 곡선 | 곡선의 모양이 운동을 정하는 방식 |
| `momentum` | 운동량 | 질량과 속도의 곱 |
| `impulse` | 충격량 | 힘의 시간 적분 |
| `conservation-of-momentum` | 운동량 보존 | 외력이 없을 때의 총 운동량 |
| `elastic-collision` | 탄성 충돌 | 운동 에너지가 보존되는 충돌 |
| `inelastic-collision` | 비탄성 충돌 | 에너지가 사라지는 충돌과 그 행방 |
| `center-of-mass` | 질량 중심 | 계를 대표하는 점과 그 운동 |
| `rocket-equation` | 로켓 방정식 | 질량이 변하는 계의 추진 |

## 4. 회전과 진동 (rotation-oscillation)

| id | 이름 | 다루는 것 |
|---|---|---|
| `torque` | 돌림힘 | 회전을 일으키는 양 |
| `moment-of-inertia` | 관성 모멘트 | 질량 분포와 회전의 저항 |
| `angular-momentum` | 각운동량 | 회전의 운동량과 그 보존 |
| `rolling-motion` | 구르는 운동 | 병진과 회전의 결합 |
| `static-equilibrium` | 정적 평형 | 힘과 돌림힘이 모두 0인 상태 |
| `gyroscope` | 자이로스코프 | 세차 운동과 각운동량의 방향 |
| `simple-harmonic-motion` | 단순 조화 운동 | 복원력이 변위에 비례하는 운동 |
| `pendulum` | 진자 | 진폭과 주기의 관계 |
| `damped-oscillation` | 감쇠 진동 | 에너지가 빠지는 진동 |
| `driven-oscillation` | 강제 진동 | 외부 구동과 응답 |
| `resonance` | 공명 | 구동 진동수가 고유 진동수에 맞을 때 |
| `coupled-oscillators` | 결합 진동자 | 에너지가 오가는 두 진동자 |
| `normal-modes` | 정규 모드 | 계가 가진 고유한 진동 형태 |

## 5. 중력과 천체 (gravitation)

| id | 이름 | 다루는 것 |
|---|---|---|
| `newtons-law-of-gravitation` | 만유인력 법칙 | 거리 제곱에 반비례하는 힘 |
| `gravitational-field` | 중력장 | 공간에 분포한 중력의 세기 |
| `orbital-motion` | 궤도 운동 | 중심력 아래의 닫힌 궤도 |
| `keplers-laws` | 케플러 법칙 | 타원·면적 속도·주기의 규칙 |
| `escape-velocity` | 탈출 속도 | 중력을 벗어나는 데 필요한 속도 |
| `tidal-force` | 조석력 | 중력의 차이가 만드는 변형 |
| `weightlessness` | 무중력 | 자유 낙하 중의 겉보기 무게 |
| `two-body-problem` | 이체 문제 | 서로 도는 두 물체와 질량 중심 |
| `gravitational-slingshot` | 중력 도움 | 천체를 이용한 속도 변화 |

## 6. 유체 (fluids)

| id | 이름 | 다루는 것 |
|---|---|---|
| `pressure` | 압력 | 단위 면적당 힘과 그 등방성 |
| `hydrostatic-pressure` | 정수압 | 깊이에 따른 압력 |
| `pascals-principle` | 파스칼 원리 | 압력의 전달과 유압 |
| `buoyancy` | 부력 | 밀려난 유체의 무게 |
| `archimedes-principle` | 아르키메데스 원리 | 뜨고 가라앉는 조건 |
| `continuity-equation` | 연속 방정식 | 단면적과 유속의 관계 |
| `bernoullis-principle` | 베르누이 원리 | 속도와 압력의 교환 |
| `viscosity` | 점성 | 층 사이의 마찰 |
| `laminar-turbulent-flow` | 층류와 난류 | 흐름의 두 양상과 전이 |
| `surface-tension` | 표면 장력 | 표면을 줄이려는 힘 |
| `capillary-action` | 모세관 현상 | 좁은 관에서의 상승 |

## 7. 열과 통계 (thermodynamics)

| id | 이름 | 다루는 것 |
|---|---|---|
| `temperature` | 온도 | 열평형과 온도의 정의 |
| `heat-transfer` | 열의 이동 | 전도·대류·복사 |
| `specific-heat` | 비열 | 물질마다 다른 온도 변화 |
| `latent-heat` | 잠열 | 상변화 중 온도가 멈추는 이유 |
| `thermal-expansion` | 열팽창 | 온도에 따른 부피 변화 |
| `ideal-gas-law` | 이상 기체 법칙 | 압력·부피·온도의 관계 |
| `kinetic-theory-of-gases` | 기체 분자 운동론 | 거시량을 분자 운동으로 설명 |
| `maxwell-boltzmann-distribution` | 맥스웰-볼츠만 분포 | 분자 속력의 분포 |
| `first-law-of-thermodynamics` | 열역학 제1법칙 | 내부 에너지와 일·열 |
| `thermodynamic-processes` | 열역학 과정 | 등온·단열·등압·등적 |
| `second-law-of-thermodynamics` | 열역학 제2법칙 | 방향이 있는 변화 |
| `entropy` | 엔트로피 | 경우의 수와 비가역성 |
| `heat-engine` | 열기관 | 열을 일로 바꾸는 순환 |
| `carnot-cycle` | 카르노 순환 | 이론적 최대 효율 |
| `brownian-motion` | 브라운 운동 | 분자 충돌이 만드는 무작위 운동 |
| `diffusion` | 확산 | 농도 차이가 만드는 흐름 |

## 8. 파동과 음향 (waves-acoustics)

| id | 이름 | 다루는 것 |
|---|---|---|
| `wave-basics` | 파동의 기본량 | 파장·진동수·속력·진폭 |
| `transverse-longitudinal-wave` | 횡파와 종파 | 진동 방향과 진행 방향 |
| `wave-equation` | 파동 방정식 | 매질이 정하는 전파 속도 |
| `superposition` | 중첩 원리 | 파동이 겹칠 때의 합 |
| `interference` | 간섭 | 보강과 상쇄 |
| `standing-wave` | 정상파 | 마디와 배가 고정되는 파동 |
| `harmonics` | 배음 | 경계 조건이 정하는 진동수 |
| `beats` | 맥놀이 | 가까운 두 진동수의 합 |
| `doppler-effect` | 도플러 효과 | 상대 운동에 따른 진동수 변화 |
| `shock-wave` | 충격파 | 음속을 넘을 때 생기는 원뿔 |
| `sound-intensity` | 음의 세기 | 거리에 따른 감쇠와 데시벨 |
| `reflection-refraction-of-waves` | 파동의 반사와 굴절 | 경계면에서의 방향 변화 |
| `diffraction` | 회절 | 장애물을 돌아가는 파동 |
| `resonance-in-air-column` | 기주 공명 | 관의 길이와 진동수 |

## 9. 광학 (optics)

| id | 이름 | 다루는 것 |
|---|---|---|
| `rectilinear-propagation` | 빛의 직진 | 그림자와 광선 모형 |
| `law-of-reflection` | 반사 법칙 | 입사각과 반사각 |
| `plane-mirror-image` | 평면거울의 상 | 허상의 위치와 좌우 반전 |
| `spherical-mirror` | 구면거울 | 오목·볼록 거울의 결상 |
| `snells-law` | 굴절 법칙 | 매질에 따른 경로 꺾임 |
| `total-internal-reflection` | 전반사 | 임계각과 광섬유 |
| `dispersion` | 분산 | 파장에 따른 굴절률 차이 |
| `thin-lens` | 얇은 렌즈 | 초점과 결상 공식 |
| `lens-aberration` | 수차 | 이상적 결상에서의 벗어남 |
| `optical-instruments` | 광학 기기 | 망원경·현미경의 배율 구성 |
| `human-eye` | 눈의 조절 | 수정체와 근시·원시 |
| `youngs-double-slit` | 이중 슬릿 간섭 | 빛의 파동성 증거 |
| `thin-film-interference` | 박막 간섭 | 두께가 만드는 색 |
| `polarization` | 편광 | 진동면의 선택 |
| `scattering` | 산란 | 하늘과 노을의 색 |

## 10. 전자기 (electromagnetism)

| id | 이름 | 다루는 것 |
|---|---|---|
| `electric-charge` | 전하 | 두 종류의 전하와 보존 |
| `coulombs-law` | 쿨롱 법칙 | 전하 사이의 힘 |
| `electric-field` | 전기장 | 공간에 분포한 전기력 |
| `field-lines` | 전기력선 | 장을 그리는 규약과 그 뜻 |
| `gausss-law` | 가우스 법칙 | 닫힌 면을 지나는 선속 |
| `electric-potential` | 전위 | 단위 전하당 퍼텐셜 에너지 |
| `equipotential-surface` | 등전위면 | 전위가 같은 면과 장의 수직성 |
| `conductor-in-field` | 도체의 정전기 유도 | 도체 내부의 장이 0인 이유 |
| `dielectric` | 유전체 | 분극과 전기장의 약화 |
| `capacitance` | 전기 용량 | 전하를 저장하는 능력 |
| `electric-current` | 전류 | 전하의 흐름과 방향 |
| `ohms-law` | 옴 법칙 | 전압·전류·저항 |
| `resistivity` | 비저항 | 재료와 형태가 정하는 저항 |
| `series-parallel-circuit` | 직렬과 병렬 | 연결 방식에 따른 합성 |
| `kirchhoffs-laws` | 키르히호프 법칙 | 마디와 고리의 보존 |
| `rc-circuit` | RC 회로 | 충전·방전의 시간 상수 |
| `magnetic-field` | 자기장 | 자기력의 분포 |
| `lorentz-force` | 로런츠 힘 | 자기장 속 전하가 받는 힘 |
| `biot-savart-law` | 비오-사바르 법칙 | 전류가 만드는 자기장 |
| `amperes-law` | 앙페르 법칙 | 전류와 자기장의 순환 |
| `magnetic-dipole` | 자기 쌍극자 | 고리 전류와 자석의 동일성 |
| `faradays-law` | 패러데이 법칙 | 자속 변화가 만드는 기전력 |
| `lenzs-law` | 렌츠 법칙 | 유도 전류의 방향 |
| `inductance` | 인덕턴스 | 자기 유도와 저장 |
| `lc-oscillation` | LC 진동 | 전기와 자기 에너지의 교환 |
| `ac-circuit` | 교류 회로 | 위상차와 임피던스 |
| `transformer` | 변압기 | 감은 수와 전압비 |
| `motor-and-generator` | 전동기와 발전기 | 힘과 기전력의 상호 변환 |
| `maxwells-equations` | 맥스웰 방정식 | 전자기를 묶는 네 식 |
| `electromagnetic-wave` | 전자기파 | 전기장과 자기장의 자기 전파 |
| `electromagnetic-spectrum` | 전자기 스펙트럼 | 파장에 따른 분류 |

## 11. 현대물리 (modern-physics)

| id | 이름 | 다루는 것 |
|---|---|---|
| `michelson-morley` | 마이컬슨-몰리 실험 | 에테르가 없다는 증거 |
| `special-relativity-postulates` | 특수 상대성 가정 | 광속 불변과 상대성 원리 |
| `time-dilation` | 시간 지연 | 운동하는 시계가 느려짐 |
| `length-contraction` | 길이 수축 | 운동 방향으로의 수축 |
| `relativity-of-simultaneity` | 동시성의 상대성 | 기준틀마다 다른 '동시' |
| `lorentz-transformation` | 로런츠 변환 | 좌표의 변환식 |
| `mass-energy-equivalence` | 질량-에너지 등가 | E=mc² 의 뜻 |
| `spacetime-diagram` | 시공간 도표 | 세계선과 광원뿔 |
| `equivalence-principle` | 등가 원리 | 가속과 중력의 구별 불가 |
| `gravitational-time-dilation` | 중력 시간 지연 | 퍼텐셜에 따른 시계의 차이 |
| `blackbody-radiation` | 흑체 복사 | 고전 이론의 파탄 |
| `photoelectric-effect` | 광전 효과 | 빛의 입자성 증거 |
| `compton-scattering` | 콤프턴 산란 | 광자의 운동량 |
| `de-broglie-wavelength` | 드브로이 파장 | 물질의 파동성 |
| `double-slit-with-particles` | 전자의 이중 슬릿 | 입자가 만드는 간섭 무늬 |
| `uncertainty-principle` | 불확정성 원리 | 켤레량의 동시 결정 한계 |
| `wave-function` | 파동 함수 | 확률 진폭과 그 해석 |
| `particle-in-a-box` | 무한 우물 | 경계가 만드는 에너지 양자화 |
| `quantum-tunneling` | 터널 효과 | 장벽을 통과하는 확률 |
| `bohr-model` | 보어 모형 | 궤도의 양자화와 스펙트럼 |
| `atomic-orbital` | 원자 궤도 | 확률 분포로서의 전자 |
| `pauli-exclusion` | 파울리 배타 원리 | 같은 상태를 못 가짐 |
| `nuclear-binding-energy` | 핵결합 에너지 | 질량 결손과 안정성 |
| `radioactive-decay` | 방사성 붕괴 | 반감기와 지수 감소 |
| `fission-fusion` | 핵분열과 핵융합 | 에너지가 나오는 두 방향 |
| `band-theory` | 띠 이론 | 도체·부도체·반도체의 구분 |
| `semiconductor-junction` | pn 접합 | 다이오드의 정류 |
| `superconductivity` | 초전도 | 저항이 사라지는 상태와 마이스너 효과 |

---

## 집계

| 분과 | 주제 |
|---|---:|
| 운동학 | 10 |
| 뉴턴 역학 | 12 |
| 일·에너지·운동량 | 14 |
| 회전과 진동 | 13 |
| 중력과 천체 | 9 |
| 유체 | 11 |
| 열과 통계 | 16 |
| 파동과 음향 | 14 |
| 광학 | 15 |
| 전자기 | 31 |
| 현대물리 | 28 |
| **합계** | **173** |

## 다음 국면

이 목록에서 조각을 캔다. 주제 하나가 조각 하나가 되지 않으므로 **수를 미리 정하지
않는다** — 잣대를 통과한 것이 몇 개인지가 답이다.

착수 순서는 `tasks/facet-insights/ANALYSIS.md` 의 논의를 따른다.

1. **첫 조각 3~5개를 손으로.** 배치 없이 하나씩. FACET 은 하나씩 만든 처음 셋에서
   관성을 겪지 않았고, 그 셋이 나중에 배치 결과를 판정하는 기준이 됐다.
2. 잣대 확정 + 관성 계측기 이식.
3. 전면 도출 — 주제마다 "글이 멈추는 지점" 을 캐고 잣대 셋을 적용.
4. 배치 구현.

**첫 맥락은 이미 그림이 있는 주제를 피한다** (`projectile-motion` ·
`thin-lens` · `series-parallel-circuit`). 그림이 있으면 거기서 잘라내려는 중력이 생기고,
FACET 의 발췌 15종이 그렇게 나왔다.
