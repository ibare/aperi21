# 영국 교육과정 ↔ 주제 대응표

`docs/topics/topics.yaml` 의 `curricula: [… uk …]` 근거다. 출처와 등급은 `sources.md`
(AQA specification, 등급 B, **KS3 결손**).

## 확보한 것

| 문서 | 절 | 범위 한정 |
|---|---|---|
| GCSE Physics 8463 | 8개 주제 **99절** | `(HT only)` 41 · `(physics only)` 28 |
| A-level Physics 7408 | 9개 절 **96절** | `A-level only` |

`level` 은 GCSE = `lower`(14~16세, IB MYP 11~16 을 `lower` 로 둔 것과 맞춤),
A-level = `upper`(16~18세). 이미 더 낮은 값이 있으면 그것을 지켰다.

## 신규 12건

### GCSE 에서 — 영국은 실생활 장치를 두껍게 다룬다

| id | 근거 절 | 판정 근거 |
|---|---|---|
| `gears` | 4.5.4 Moments, levers and gears (physics only) | 톱니 수를 바꾸면 회전 속도와 힘이 맞바뀐다 |
| `stopping-distance` | 4.5.6.3 Forces and braking | 속력을 올리면 반응 거리는 비례로, 제동 거리는 제곱으로 |
| `seismic-waves` | 4.6.1.5 Waves for detection (HT · physics only) | S파가 액체 핵을 못 지나 그림자대가 생긴다 |
| `power-transmission` | 4.2.4.3 The National Grid | 전압을 올리면 같은 전력에 전류가 줄어 손실이 준다 |
| `loudspeaker-and-microphone` | 4.7.2.4 · 4.7.3.3 (HT) | 전류가 진동이 되고, 진동이 전류가 되는 왕복 |

### A-level 에서

| id | 근거 절 | 판정 근거 |
|---|---|---|
| `youngs-modulus` | 3.4.2.2 The Young modulus | 같은 힘에 재료마다 다르게 늘어난다 |
| `stress-strain-curve` | 3.4.2.1 Bulk properties of solids | 당기다 보면 곡선이 꺾이고 되돌아오지 않는다 |
| `exchange-particles` | 3.2.1.4 Particle interactions | 파인만 도형에서 힘이 주고받음으로 그려진다 |
| `star-life-cycle` | GCSE 4.8.1.2 · 3.9.2.5 HR diagram | 질량에 따라 갈라지는 경로를 HR 도 위에서 따라간다 |
| `stellar-spectral-class` | 3.9.2.4 Stellar spectral classes | 온도가 바뀌면 흡수선 무늬가 O에서 M으로 옮겨 간다 |
| `supernova-and-neutron-star` | 3.9.2.6 | 중심이 무너지고 바깥이 튕겨 나간다 |
| `exoplanet-detection` | 3.9.3.4 Detection of exoplanets | 행성이 지날 때 광곡선이 파이고 별이 흔들린다 |

**천체물리가 네 번째로 나왔다.** A-level `3.9` 는 네 계열 중 관측천문을 가장 두껍게 다룬다
(망원경 · 광도 분류 · 절대 등급 · 흑체 복사 · 스펙트럼 분류 · HR 도 · 초신성 · 도플러 ·
허블 법칙 · 퀘이사 · 외계행성).

## 모집단 편입 19건 — 태그가 없던 127개 중

| id | 근거 |
|---|---|
| `superconductivity` | 3.5.1.3 — 임계온도 이하 비저항 0, 강자기장·송전 손실 |
| `rms-value` · `phase-in-ac-circuit` | 3.7.5.5 Alternating currents |
| `pair-production` · `antimatter` | 3.2.1.3 Particles, antiparticles and photons |
| `standard-model-overview` | 3.2.1.5~6 Classification of particles · Quarks |
| `rest-energy` | 3.8.1.6 Mass and energy |
| `plancks-quantum-hypothesis` | 3.2.2 Electromagnetic radiation and quantum phenomena |
| `brownian-motion` | 3.6.2.3 Molecular kinetic theory model |
| `radiometric-dating` | GCSE 4.4.3.2 · 3.8.1.3 |
| `geostationary-orbit` | 3.7.2.4 Orbits of planets and satellites |
| `resolving-power` · `lens-combination` | 3.9.1 Telescopes (Rayleigh 기준, 두 수렴렌즈) |
| `specular-diffuse-reflection` | GCSE 4.6.2.6 Visible light |
| `stability-of-floating-body` · `barometer` · `pressure-isotropy` · `pressure-and-container-shape` | GCSE 4.5.5 |
| `drag-in-fluid` | 3.4.1.4 Projectile motion (drag, terminal speed) |

## 물린 41건 — 낱말은 걸렸으나 근거가 아니었다

낱말 검색이 60건을 A-level 후보로 올렸지만 문장을 읽어 19건만 남겼다. 물린 것들의 유형:

| 물린 주제 | 걸린 낱말 | 실제 |
|---|---|---|
| `coordinate-choice` | `vector` | 3.4.1.1 은 벡터 합성·분해이지 좌표계 선택이 아니다 |
| `conical-pendulum` · `banked-curve` · `vertical-loop` | `circular motion` | 셋 다 같은 낱말 하나에 걸렸다. 3.6.1.1 은 등속 원운동 일반이다 |
| `ballistic-pendulum` · `variable-mass-system` | `momentum` | 운동량이라는 낱말만 같다 |
| `dispersion` · `scattering` · `rayleigh-scattering` | `dispersion`/`scattering` | GCSE 4.6.2.6 은 색 필터와 물체의 색이고 산란·분산은 없다 |
| `pendulum-amplitude-dependence` | `simple pendulum` | 3.6.1.3 은 등시성을 전제하고 진폭 의존성을 다루지 않는다 |
| `series-rlc-resonance` | `resonance` | 3.6.1.4 는 역학적 공명이다 |
| `gravitational-redshift` | `red shift` | 3.9.3.2 는 허블 법칙의 우주론적 적색편이다 |

**한국 계열에서 온도계에 「구르는 물체의 경주」를 붙였던 것과 같은 실패다.** 낱말 검색은
분과를 가로질러 후보를 넓히는 데까지만 쓰고, 판정은 문장을 읽어서 한다.

## 여전히 어디에도 없는 108건

네 계열 어디에도 걸리지 않았다. 마이컬슨-몰리 · 쌍둥이 역설 · 파울리 배타 · 스핀 ·
슈테른-게를라흐 · 라그랑주 점 · 로슈 한계 · 레이놀즈 수 · 경계층 · 맥스웰-볼츠만 분포 ·
포인팅 벡터 · 브루스터 각 · 복굴절 · 페르미 준위 · 마이스너 효과 · 보스-아인슈타인 응축…

**대학 과정이다.** 처음 455개가 「각 도메인을 최대한 짜낸」 결과로 대학 범위까지 넘어간
자리이며, 모집단 밖으로 정리할 후보다. 다만 KS3 를 못 구했으므로 **영국의 `lower` 축에서
걸릴 것이 남아 있을 수 있다** — 정리하기 전에 그 점을 감안한다.


---

## 기존 주제 대응 — 문서 단위

**한계를 먼저 밝힌다.** 이 계열은 절 단위 대응표를 만들지 않았다. GCSE 99절·A-level 96절을
읽고 주제에 붙였으나, 기록으로는 **어느 문서에서 왔는지까지만** 남는다. NGSS 는 성취기대
53건을 하나씩 적었는데 영국만 빠뜨린 것이라 일관성이 없다 — rule-guard 가 「uk 를 얻은
upper 주제 중 GCSE 근거로 붙은 것이 있는지 데이터만으로 가릴 수 없다」고 지적한 자리다.

되짚어야 할 때는 `sources.md` 의 AQA specification 주소에서 해당 절을 다시 확인해야 한다.

### GCSE 근거 (`level` primary 또는 lower) — 129건

  `ac-generation` · `apparent-brightness` · `archimedes-principle` · `atmospheric-pressure`
  `average-acceleration` · `average-velocity` · `barometer` · `blackbody-radiation`
  `boyles-law` · `buoyancy` · `chain-reaction` · `charging-methods`
  `charles-law` · `circular-orbit` · `conservation-of-mechanical-energy` · `conservation-of-momentum`
  `converging-diverging-lens` · `coulombs-law` · `decay-types` · `density`
  `diffraction` · `displacement-vs-distance` · `drag-force` · `drag-in-fluid`
  `efficiency` · `elastic-collision` · `elastic-potential-energy` · `electric-charge`
  `electric-current` · `electric-field` · `electric-power` · `electromagnet`
  `electromagnetic-spectrum` · `electromagnetic-wave` · `energy-dissipation` · `expanding-universe`
  `faradays-law` · `field-lines` · `field-of-loop-and-solenoid` · `field-of-straight-wire`
  `force-on-current-wire` · `free-body-diagram` · `free-fall` · `gears`
  `generator` · `gravitational-field` · `gravitational-potential-energy` · `half-life`
  `hookes-law` · `hydrostatic-pressure` · `impulse-momentum-theorem` · `insulation`
  `internal-energy` · `ionizing-radiation` · `iv-characteristic` · `joule-heating`
  `kinetic-energy` · `kinetic-theory-of-gases` · `latent-heat` · `lenzs-law`
  `lever-arm` · `light-through-materials` · `longitudinal-wave` · `loudspeaker-and-microphone`
  `magnet-attraction` · `magnetic-field` · `magnetic-field-lines` · `magnetic-poles`
  `magnification` · `magnitude-scale` · `mass-vs-weight` · `momentum`
  `motor` · `net-force` · `newtons-first-law` · `newtons-law-of-gravitation`
  `newtons-second-law` · `newtons-third-law` · `nuclear-fission` · `nuclear-fusion`
  `nuclear-structure` · `object-color` · `ohms-law` · `orbital-velocity`
  `pitch-loudness-timbre` · `position-time-graph` · `potential-difference` · `power`
  `power-transmission` · `pressure` · `pressure-and-container-shape` · `pressure-from-collisions`
  `pressure-isotropy` · `radioactive-decay` · `radiometric-dating` · `real-vs-virtual-image`
  `reflection-of-waves` · `refraction-of-waves` · `resistivity` · `seismic-waves`
  `series-parallel-resistors` · `snells-law` · `sound-speed` · `specific-heat`
  `specular-diffuse-reflection` · `speed-vs-velocity` · `spring-force` · `stability-of-floating-body`
  `star-color-temperature` · `star-life-cycle` · `stefan-boltzmann-law` · `stellar-nucleosynthesis`
  `stellar-parallax` · `stopping-distance` · `temperature` · `terminal-velocity`
  `thermal-conduction` · `thermal-radiation` · `thermistor-and-ldr` · `torque`
  `transformer` · `transverse-wave` · `vector-addition` · `vector-decomposition`
  `velocity-time-graph` · `wave-attenuation` · `wave-basics` · `wave-speed-in-medium`
  `work`

### A-level 근거 (`level` upper) — 94건

  `absolute-zero` · `angular-velocity` · `antimatter` · `binding-energy-curve`
  `black-hole-horizon` · `bohr-model` · `brownian-motion` · `capacitance`
  `center-of-gravity` · `centripetal-acceleration` · `centripetal-force` · `charged-particle-in-magnetic-field`
  `damped-oscillation` · `damping-regimes` · `de-broglie-wavelength` · `dielectric`
  `diffraction-grating` · `diode-and-led` · `doppler-effect` · `driven-oscillation`
  `electric-potential` · `electron-diffraction` · `emf-and-internal-resistance` · `energy-in-capacitor`
  `equipotential-surface` · `escape-velocity` · `exchange-particles` · `exoplanet-detection`
  `geostationary-orbit` · `gravitational-potential-energy-general` · `harmonics` · `hr-diagram`
  `hydrogen-spectrum` · `ideal-gas-law` · `impulse` · `index-of-refraction`
  `inelastic-collision` · `instantaneous-velocity` · `interference` · `inverse-square-law`
  `keplers-third-law` · `kirchhoffs-current-law` · `kirchhoffs-voltage-law` · `lens-combination`
  `lorentz-force` · `magnetic-flux` · `mass-energy-equivalence` · `mass-spring-system`
  `motional-emf` · `nuclear-binding-energy` · `optical-fiber` · `pair-production`
  `parallel-plate-capacitor` · `path-difference` · `phase-in-ac-circuit` · `photoelectric-effect`
  `photon-energy-momentum` · `plancks-quantum-hypothesis` · `polarization` · `potential-divider`
  `potential-vs-field` · `projectile-motion` · `rc-circuit` · `resistance-and-geometry`
  `resolving-power` · `resonance` · `rest-energy` · `rms-value`
  `rutherford-scattering` · `shm-energy` · `simple-harmonic-motion` · `simple-pendulum`
  `single-slit-diffraction` · `standard-model-overview` · `standing-wave` · `static-equilibrium`
  `stellar-luminosity` · `stellar-spectral-class` · `stress-strain-curve` · `string-vibration`
  `superconductivity` · `supernova-and-neutron-star` · `superposition` · `telescope`
  `temperature-and-resistance` · `total-internal-reflection` · `uniform-circular-motion` · `uniform-field`
  `uniformly-accelerated-motion` · `wave-particle-duality` · `wien-displacement-law` · `work-function-and-threshold`
  `youngs-double-slit` · `youngs-modulus`
