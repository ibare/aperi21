# NGSS 성취기대 ↔ 주제 대응표

`docs/topics/topics.yaml` 의 `curricula: [… ngss …]` 가 무엇에 근거하는지를 되짚는 표다.
성취기대 원문은 `nextgenscience.org` 의 학년군×주제 페이지에서 받았다 (등급 A, `sources.md`).

**이 표를 남기는 이유.** `sources.md` 가 「자동 검사를 전부 통과한 오류를 잡은 것은 정답지
대조뿐이었다」고 적어 놓고 그 정답지를 남기지 않으면, 나중에 매핑을 의심할 때 되짚을
길이 없다. 실제로 rule-guard 가 이 표가 없어 「초등 성취기대가 너무 굵은 주제에 붙은 것
아닌가」를 데이터로 확인하지 못했다.

`—` 는 대응 주제 없이 **신규로 세운 것**, `(제외)` 는 목록에 넣지 않은 것이다.

## 초등 (primary)

| 코드 | 성취기대 요지 | 대응 주제 |
|---|---|---|
| K-PS2-1 | 밀기·당기기의 세기와 방향이 운동에 미치는 효과 | `push-and-pull` · `net-force` |
| K-PS2-2 | 설계 해법이 속력·방향을 바꾸는지 분석 | (제외 — 공학 실천) |
| 1-PS4-1 | 떨리는 물체가 소리를 내고, 소리가 물체를 떨게 한다 | `sound-source-vibration` |
| 1-PS4-2 | 어둠 속 물체는 비춰야 보인다 | `seeing-requires-light` |
| 1-PS4-3 | 재료를 빛 경로에 놓았을 때의 효과 | — `light-through-materials` **신규** |
| 1-PS4-4 | 빛·소리로 멀리 통신하는 장치 제작 | (제외 — 공학 실천) |
| 3-PS2-1 | 균형·불균형 힘이 운동에 미치는 효과 | `net-force` · `equilibrium-of-forces` · `uniform-motion` |
| 3-PS2-2 | 운동의 패턴으로 미래 운동 예측 | `position-time-graph` · `uniform-motion` · `average-velocity` |
| 3-PS2-3 | 접촉하지 않은 두 물체의 전기·자기 상호작용 | `magnet-attraction` · `magnetic-poles` · `electric-charge` · `charging-methods` |
| 3-PS2-4 | 자석을 이용한 설계 문제 정의 | (제외 — 공학 실천) |
| 4-PS3-1 | 속력과 에너지의 관계 | `kinetic-energy` · `speed-vs-velocity` |
| 4-PS3-2 | 소리·빛·열·전류로 에너지가 전달됨 | `thermal-conduction` · `thermal-radiation` · `electric-current` · `sound-through-materials` |
| 4-PS3-3 | 충돌할 때 일어나는 에너지 변화 | `energy-in-collision` |
| 4-PS3-4 | 에너지를 다른 형태로 바꾸는 장치 | (제외 — 공학 실천) |
| 4-PS4-1 | 파동 모형 — 진폭과 파장, 파동이 물체를 움직임 | `wave-basics` |
| 4-PS4-2 | 빛이 반사되어 눈에 들어와야 보인다 | `seeing-requires-light` · `object-color` · `law-of-reflection` |
| 4-PS4-3 | 패턴으로 정보를 전달하는 해법 비교 | (제외 — 공학 실천) |
| 5-PS2-1 | 지구가 당기는 중력은 아래로 향한다 | `mass-vs-weight` · `free-fall` |

> **2026-09-12 수정.** 처음에 `4-PS3-3` 을 `elastic-collision`·`inelastic-collision` 에,
> `4-PS3-4` 를 `energy-flow-diagram` 에, `4-PS4-1` 을 `wave-energy` 에, `5-PS2-1` 을
> `gravitational-field` 에 붙였다가 물렸다. 초등이 가리키는 것은 그 주제가 아니라 **앞
> 단계 장면**이다 — 초등은 탄성·비탄성을 가르지 않고, Sankey 도 진폭 제곱 비례도 중력장도
> 다루지 않는다. README 1절의 「같은 조각으로 둘 다 만들 수 있는가」를 통과하지 못한다.
>
> 같은 유형으로 한국 계열에서도 `snells-law` 를 물렸다. `[6과02-02]`("빛이 직진·반사·굴절
> 하는 성질이 있음을 말할 수 있다")로 `primary` 였는데, **그 성취기준의 해설이 「반사와
> 굴절의 법칙은 다루지 않는다」고 못박는다.** 초등은 현상을 관찰할 뿐 법칙을 다루지 않는다.

### 과잉 매핑을 막는 법 — 해설을 함께 읽는다

여섯 건 모두 원인이 같다. **성취기준 본문만 보고 굵은 주제에 붙였다.** 한국 교육과정은
성취기준마다 「성취기준 해설」에 범위 한정을 적어 두고(「~는 다루지 않는다」), NGSS 는
Assessment Boundary 에 같은 일을 한다. 그것을 함께 읽었으면 여섯 건 다 걸렀을 것이다.

`sources.md` 가 해설을 「버리면 수준 판정 근거를 잃는다」고 적어 놓고 정작 매핑에서는
쓰지 않은 것이 이번 실수다. **다음 계열(영국)에서는 범위 한정을 먼저 읽고 매핑한다.**

## 중학 (lower)

| 코드 | 성취기대 요지 | 대응 주제 |
|---|---|---|
| MS-PS2-1 | 뉴턴 3법칙으로 충돌 문제를 푼다 | `newtons-third-law` · `elastic-collision` · `impulse-momentum-theorem` |
| MS-PS2-2 | 운동 변화는 힘의 합과 질량에 달렸다 | `newtons-second-law` · `net-force` · `mass-vs-weight` |
| MS-PS2-3 | 전기력·자기력의 세기를 정하는 요인 | `coulombs-law` · `magnetic-field` · `electric-charge` |
| MS-PS2-4 | 중력은 인력이고 질량에 의존한다 | `newtons-law-of-gravitation` · `gravitational-field` |
| MS-PS2-5 | 접촉 없이도 장이 존재한다는 증거 | `electric-field` · `magnetic-field` · `field-lines` · `magnetic-field-lines` |
| MS-PS3-1 | 운동에너지와 질량·속력의 관계 | `kinetic-energy` |
| MS-PS3-2 | 배치가 바뀌면 저장되는 위치에너지가 달라진다 | `gravitational-potential-energy` · `elastic-potential-energy` · `potential-energy-curve` |
| MS-PS3-3 | 열 전달을 최소·최대화하는 장치 | `insulation` · `thermal-conduction` |
| MS-PS3-4 | 에너지 전달·물질·질량과 온도 변화의 관계 | `specific-heat` · `calorimetry` · `heat-capacity` · `temperature` |
| MS-PS3-5 | 운동에너지가 바뀌면 에너지가 오간 것 | `work-energy-theorem` · `kinetic-energy` |
| MS-PS4-1 | 파동의 진폭과 에너지의 관계 | `wave-basics` · `wave-energy` |
| MS-PS4-2 | 파동의 반사·흡수·투과 | `reflection-of-waves` · `wave-attenuation` · `impedance-mismatch` · `refraction-of-waves` |
| MS-PS4-3 | 디지털 신호가 아날로그보다 신뢰성이 높다 | — `digital-vs-analog-signal` **신규** |
| MS-ESS1-1 | 지구-태양-달 모형 — 달의 위상 · 식 · 계절 | `moon-phases` · `eclipse` · `axial-tilt-seasons` · `seasonal-sun-path` |
| MS-ESS1-2 | 은하와 태양계 운동에서 중력의 역할 | `newtons-law-of-gravitation` · `circular-orbit` · `gravitational-field` |
| MS-ESS1-3 | 태양계 천체의 규모 | `scale-of-universe` |

## 고교 (upper)

| 코드 | 성취기대 요지 | 대응 주제 |
|---|---|---|
| HS-PS2-1 | 뉴턴 2법칙의 수학적 관계 | `newtons-second-law` · `net-force` |
| HS-PS2-2 | 알짜힘이 없으면 운동량이 보존된다 | `conservation-of-momentum` · `momentum` |
| HS-PS2-3 | 충돌에서 힘을 줄이는 장치 | `impulse-momentum-theorem` · `impulse` · `impulse-force-relation` |
| HS-PS2-4 | 만유인력과 쿨롱 법칙 | `newtons-law-of-gravitation` · `coulombs-law` · — `inverse-square-law` **신규** |
| HS-PS2-5 | 전류가 자기장을, 변하는 자기장이 전류를 | `field-of-straight-wire` · `faradays-law` · `lenzs-law` · `motional-emf` |
| HS-PS3-1 | 계 안팎의 에너지 출입 계산 | `first-law-of-thermodynamics` · `internal-energy` · `energy-flow-diagram` |
| HS-PS3-2 | 거시 에너지 = 입자 운동 + 상대 위치 | `internal-energy` · `kinetic-theory-of-gases` · `gravitational-potential-energy` |
| HS-PS3-3 | 에너지를 다른 형태로 바꾸는 장치 | `generator` · `photovoltaic-effect` · `efficiency` |
| HS-PS3-4 | 열이 오가 균일해진다 (2법칙) | `thermal-equilibrium` · `second-law-of-thermodynamics` · `entropy` · `entropy-and-irreversibility` |
| HS-PS3-5 | 전기·자기장으로 상호작용하는 두 물체 | `electric-field` · `magnetic-field` · `electric-potential` |
| HS-PS4-1 | 진동수 · 파장 · 속력의 관계 | `wave-basics` · `wave-speed-in-medium` · `wave-equation` |
| HS-PS4-2 | 디지털 전송·저장의 이점 | `digital-vs-analog-signal` |
| HS-PS4-3 | 전자기 복사의 파동 모형과 입자 모형 | `wave-particle-duality` · `photon-energy-momentum` · `photoelectric-effect` |
| HS-PS4-4 | 진동수에 따라 달라지는 흡수의 결과 | `electromagnetic-spectrum` · `photon-energy-momentum` · — `ionizing-radiation` **신규** |
| HS-PS4-5 | 파동 원리를 쓰는 기술 | `photovoltaic-effect` · `optical-fiber` · `antenna-radiation` |
| HS-ESS1-1 | 태양의 수명과 핵융합 | `nuclear-fusion` · `star-radiation-gravity-balance` · `stellar-luminosity` |
| HS-ESS1-2 | 빅뱅 — 스펙트럼 · 은하의 운동 · 물질 조성 | `expanding-universe` · `hydrogen-spectrum` · `electromagnetic-spectrum` |
| HS-ESS1-3 | 별이 일생 동안 원소를 만든다 | `nuclear-fusion` · `binding-energy-curve` · — `stellar-nucleosynthesis` **신규** |
| HS-ESS1-4 | 궤도 운동의 예측 | `circular-orbit` · `elliptical-orbit` · `keplers-first-law` · `keplers-second-law` · `keplers-third-law` · `orbital-velocity` |

## AP Physics — 단원 대응

AP 는 **신규 0건**이다. 네 과목의 단원이 모두 기존 목록 안에 들어온다.

| 과목 | 단원 | 비고 |
|---|---|---|
| Physics 1 | 운동학 · 힘과 병진 동역학 · 일에너지일률 · 선운동량 · 돌림힘과 회전 동역학 · 회전계의 에너지와 운동량 · 진동 · 유체 | 유체는 2024-25 개정으로 Physics 2 에서 이동 |
| Physics 2 | 열역학 · 전기력과 장과 전위 · 전기회로 · 자기와 전자기 · 기하광학 · 파동과 소리와 물리광학 · 현대물리 | Unit 9~15 |
| C: Mechanics | Physics 1 과 같되 미적분 | |
| C: E&M | 전하와 장과 가우스 법칙 · 전위 · 도체와 축전기 · 회로 · 자기장과 전자기 · 전자기 유도 | Unit 8~13 |

대학 1학년 수준인데도 새 주제가 없는 것은, 기존 목록이 `maxwells-equations` ·
`poynting-vector` · `carnot-cycle` 까지 담아 그 위를 덮기 때문이다.
