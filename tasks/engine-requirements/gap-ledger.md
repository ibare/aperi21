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
| G01 | `step` 이 `TimelineFrame` 을 받지 못한다 — 조각이 시계를 따로 세고 시간표를 다시 계산한다 | 근사 | inclined-plane · apparent-weight · atwood-machine · balance-scale · impulse-force-relation · stress-strain-curve · banked-curve · free-body-diagram · equilibrium-of-forces · kinetic-friction · normal-force · angle-of-friction · tension · conical-pendulum · buoyant-force-as-force · fictitious-force · phase-space · color-addition · bernoullis-principle · maxwell-boltzmann-distribution · spacetime-diagram · tidal-force · potential-energy-curve · hr-diagram · equipotential-surface · moon-phases · huygens-principle · polarization · phase-diagram · youngs-double-slit · moment-of-inertia · stability-of-floating-body · total-internal-reflection · radioactive-decay · equilibrium-points · angular-momentum · laplace-pressure · drag-in-fluid · ohms-law · emf-and-internal-resistance · joule-heating |
| G02 | 화살촉 크기 상한이 길이의 0.35 로 고정 — 짧은 화살표의 방향이 약하다 | 근사 | gravitational-acceleration · newtons-second-law · inclined-plane · mechanical-advantage · normal-force · buoyant-force-as-force · gyroscopic-precession · gravitational-potential-energy · impulse-momentum-theorem · two-dimensional-collision · rotational-kinetic-energy · nonlinear-oscillation · buoyancy · floating-and-draft · drag-in-fluid · gravitational-field · earth-rotation-day-night · newtons-law-of-gravitation · shell-theorem · escape-velocity · gravity-inside-earth · stellar-nucleosynthesis · binding-energy-curve · coulombs-law · displacement-current · uniform-field · maxwells-equations · field-of-loop-and-solenoid · charge-in-uniform-field · electric-field · amperes-law · eddy-current · potential-vs-field · millikan-experiment · thermal-equilibrium · snells-law · apparent-depth · mirage |
| G03 | `body` 둘레의 굵기 · 색을 채움과 따로 고를 수 없다 | 근사 | coriolis-effect · static-friction · vertical-loop · equilibrium-of-forces · angle-of-friction · interference · phase-space · field-lines · equipotential-surface · thermal-convection · phase-diagram · stability-of-floating-body · total-internal-reflection · perfectly-inelastic-collision · rolling-race · rolling-without-slipping · gears · weightlessness · reflection-of-waves · harmonics · air-column-resonance · relativity-of-simultaneity · chain-reaction · magnetic-field · magnetic-poles · magnet-attraction · drift-velocity · gausss-law · plane-mirror-image · brewster-angle · multiple-mirror-images |
| G04 | 선 끝 · 이음 모양을 고를 수 없다 | 근사 | static-friction · stress-strain-curve · mechanical-advantage · carnot-cycle · double-slit-with-electrons · resonance · rc-circuit · refraction-of-waves |
| G05 | 점선 무늬(대시 길이 · 간격)를 선언할 수 없다 | 근사 | non-inertial-frame · stress-strain-curve · banked-curve · youngs-modulus · fictitious-force · phase-space · tidal-force · bernoullis-principle · maxwell-boltzmann-distribution · spacetime-diagram · potential-energy-curve · gyroscopic-precession · carnot-cycle · normal-modes · moon-phases · polarization · keplers-second-law · capillary-action · standing-wave · youngs-double-slit · rc-circuit · hydrogen-spectrum · stability-of-floating-body · refraction-of-waves · total-internal-reflection · radioactive-decay · perfectly-inelastic-collision · circular-orbit · eclipse · two-body-problem · exoplanet-detection · superposition · harmonics · constructive-destructive · noise-cancellation · string-vibration · air-column-resonance · particle-in-a-box · uncertainty-principle · quantum-tunneling · wave-function · superposition-quantum · light-cone · measurement-collapse · finite-well · twin-paradox · magnetic-field-lines · magnetic-dipole · cyclic-process |
| G06 | `rect` 에 모서리 둥글림이 없다 | 근사 | newtons-second-law · apparent-weight · non-inertial-frame · inertial-vs-gravitational-mass · tension · weightlessness · sound-source-vibration · equivalence-principle |
| G07 | 짙은 물체 위 글자에 쓸 반전(바탕) 색 역할이 없다 | 근사 | atwood-machine · pulley-system · connected-bodies · youngs-modulus · field-lines · spacetime-diagram · equipotential-surface · thermal-convection · huygens-principle · refraction-of-waves · total-internal-reflection · charged-particle-in-magnetic-field · efficiency · stellar-luminosity · earth-revolution-constellations · nuclear-structure · lorentz-force · velocity-selector · mass-spectrometer · gausss-law · dispersion · prism · chromatic-aberration · rainbow |
| G08 | 재질 · 옅은 면 톤에 맞는 색 역할이 없다 (`luminance` 로 눈대중) | 근사 | coriolis-effect · non-inertial-frame · impulse-force-relation · angle-of-friction · inertial-vs-gravitational-mass · energy-flow-diagram · field-lines · tidal-force · bernoullis-principle · maxwell-boltzmann-distribution · gyroscopic-precession · equipotential-surface · normal-modes · moon-phases · poiseuille-flow · double-slit-with-electrons · keplers-second-law · capillary-action · phase-diagram · rc-circuit · lagrange-points · stability-of-floating-body · refraction-of-waves · total-internal-reflection · inelastic-collision |
| G09 | 여러 인스턴스를 한꺼번에 흐리게 하는 묶음 불투명도가 없다 | 근사 | non-inertial-frame · stress-strain-curve · phase-space · tidal-force · perfectly-inelastic-collision · elastic-collision · inelastic-collision · conservation-of-momentum · energy-in-collision · rolling-race · driven-oscillation · pascals-principle · stellar-nucleosynthesis · supernova-and-neutron-star · equivalence-principle · relativity-of-simultaneity · light-bending-by-gravity · nuclear-fission · decay-types · binding-energy-curve · relativistic-momentum · work-function-and-threshold · electron-configuration · radiometric-dating · chain-reaction · motional-emf · displacement-current · poynting-vector · thermal-equilibrium · specific-heat · calorimetry · latent-heat · insulation |
| G10 | 판(패널) 단위 좌표계가 없다 — 인스턴스마다 위치를 옮긴다 | 근사 | coriolis-effect · non-inertial-frame · tidal-force · normal-modes · phase-diagram · rc-circuit · kinetic-energy · rocket-equation · work-energy-theorem · non-conservative-force · equilibrium-points · inelastic-collision · energy-in-collision · impulse-momentum-theorem · torque · rolling-race · rolling-without-slipping · rotational-kinetic-energy · static-equilibrium · driven-oscillation · damping-regimes · nonlinear-oscillation · weightlessness · gravitational-potential-energy-general · roche-limit · gravitational-slingshot · digital-vs-analog-signal · wave-energy · slit-width-and-diffraction · equivalence-principle · band-theory · relativity-of-simultaneity · uncertainty-principle · semiconductor-doping · wave-function · pn-junction · superposition-quantum · fermi-level · measurement-collapse · chain-reaction · diode-and-led · magnetic-poles · energy-in-capacitor · kirchhoffs-current-law · loudspeaker-and-microphone · kirchhoffs-voltage-law · potential-divider · energy-in-inductor · magnetic-dipole · wheatstone-bridge · latent-heat · triple-point |
| G11 | 시간표 이징 곡선이 모자라다 (감속 출발 · 코사인 · inOutQuad) | 근사 | net-force · inclined-plane · spring-force · pulley-system · buoyant-force-as-force · electromagnetic-wave · total-internal-reflection · wetting-and-contact-angle |
| G12 | 여러 단계에 걸친 이징을 선언할 자리가 없다 | 근사 | stress-strain-curve · blackbody-radiation · nuclear-fusion |
| G13 | 시간표 단계에 값을 실을 수 없고, 단계 길이가 상태 · 조작값을 따라가지 못한다 | 근사 | atwood-machine · normal-force · inertial-vs-gravitational-mass · impulse-force-relation · interference · spacetime-diagram · equipotential-surface · huygens-principle · double-slit-with-electrons · keplers-second-law · phase-diagram · youngs-double-slit · rc-circuit · moment-of-inertia · refraction-of-waves · energy-dissipation · perfectly-inelastic-collision · elastic-potential-energy · gravitational-potential-energy · elastic-collision · impulse-momentum-theorem · simple-harmonic-motion · mass-spring-system · simple-pendulum · damped-oscillation · coupled-oscillators · beats-in-oscillation · damping-regimes · continuity-equation · venturi-effect · escape-velocity · eclipse · stellar-spectral-class · orbital-velocity · gravitational-potential-energy-general · orbital-transfer · black-hole-horizon · orbital-decay · elliptical-orbit · reflection-of-waves · diffraction · wave-basics · superposition · transverse-wave · harmonics · wave-speed-in-medium · constructive-destructive · impedance-mismatch · seismic-waves · slit-width-and-diffraction · noise-cancellation · string-vibration · wave-vs-particle-transport · wave-attenuation · sound-through-materials · air-column-resonance · photoelectric-effect · scale-of-universe · particle-in-a-box · compton-scattering · semiconductor-doping · pair-production · bose-einstein-condensate · wave-function · ionizing-radiation · pauli-exclusion · antimatter · superposition-quantum · work-function-and-threshold · quantum-harmonic-oscillator · light-cone · electron-configuration · radiometric-dating · photovoltaic-effect · exchange-particles · chain-reaction · diode-and-led · lc-oscillation · faradays-law · magnetic-poles · motional-emf · ohms-law · reactance-and-impedance · force-on-current-wire · energy-in-capacitor · velocity-selector · charging-methods · mass-spectrometer · kirchhoffs-current-law · self-inductance · series-rlc-resonance · radiation-pressure · electromagnet · motor · rl-circuit · field-of-loop-and-solenoid · loudspeaker-and-microphone · biot-savart-law · kirchhoffs-voltage-law · emf-and-internal-resistance · amperes-law · ac-generation · force-between-wires · eddy-current · potential-divider · energy-in-inductor · wheatstone-bridge · millikan-experiment · thermistor-and-ldr · first-law-of-thermodynamics · pv-diagram · entropy-and-irreversibility · latent-heat · pressure-from-collisions |
| G14 | 캡션 `vars` 에 문안 키를 넣을 수 없다 · 캡션 조건이 경로 하나뿐이다 | 근사 | free-body-diagram · drag-force · bernoullis-principle · potential-energy-curve · hr-diagram · normal-modes · moon-phases · capillary-action · stability-of-floating-body · explosion-and-recoil · center-of-mass-motion · floating-and-draft · earth-revolution-constellations · pair-production · refrigerator-heat-pump |
| G15 | 캡션을 흐리게 사라지게 하거나 단계마다 페이드를 정할 수 없다 | 근사 | static-friction · double-slit-with-electrons |
| G16 | `readout` 이 회전하지 않고, 글자 기준선에 맞출 수 없다 | 근사 | coriolis-effect · mechanical-advantage · kinetic-friction · phase-space · potential-energy-curve · hr-diagram · carnot-cycle · moon-phases · double-slit-with-electrons · standing-wave · moment-of-inertia · lagrange-points · total-internal-reflection · perfectly-inelastic-collision · elastic-collision · torque · star-color-temperature · stellar-spectral-class · stellar-nucleosynthesis · star-life-cycle · reflection-of-waves · harmonics · impedance-mismatch · string-vibration · air-column-resonance · particle-in-a-box · blackbody-radiation · binding-energy-curve · wien-displacement-law · relativistic-momentum · work-function-and-threshold · quantum-harmonic-oscillator |
| G17 | `vector.label` 의 크기 · 자리가 고정이고 값을 끼울 수 없다 | 근사 | vertical-loop · connected-bodies · buoyant-force-as-force · gyroscopic-precession · conservative-force · elastic-collision · explosion-and-recoil · impulse-momentum-theorem · two-dimensional-collision · simple-harmonic-motion · viscosity · buoyancy · surface-tension · wetting-and-contact-angle · newtons-law-of-gravitation · roche-limit · star-radiation-gravity-balance · de-broglie-wavelength · coulombs-law · motional-emf · velocity-selector · superposition-of-forces · biot-savart-law · amperes-law · malus-law |
| G18 | `region` 에 구멍이 없고 테두리 굵기를 못 고른다 | 근사 | banked-curve · drag-force · normal-force · stability-of-floating-body · rocket-equation · ballistic-pendulum · work-energy-theorem · inelastic-collision · energy-in-collision · center-of-gravity · coupled-oscillators · surface-tension · laplace-pressure · barometer · wetting-and-contact-angle · diurnal-motion · nuclear-fission · transformer · electrostatic-shielding · apparent-depth · plane-mirror-image |
| G19 | `dimension` 이 점선뿐이다 | 근사 | stress-strain-curve · kinetic-energy · elastic-potential-energy · conservative-force · inelastic-collision · explosion-and-recoil · rotational-kinetic-energy · quality-factor · particle-in-a-box · superconductivity · finite-well · phase-in-ac-circuit · random-walk · single-slit-diffraction · apparent-depth |
| G20 | 용수철 옆 폭 · 굵기, 줄 굵기 · 짙기를 고를 수 없다 | 근사 | spring-force · centripetal-force · buoyant-force-as-force · tension · phase-space · elastic-potential-energy · quality-factor · hydrostatic-pressure |
| G21 | `point-drag` 손잡이를 숨기거나 범위 · 판정 모양을 줄 수 없다 | 근사 | balance-scale · equilibrium-of-forces · tension · color-addition · field-lines · potential-energy-curve · thin-film-interference · equipotential-surface · normal-modes · moon-phases · total-internal-reflection · electric-field |
| G22 | `slider` 값 표시 끄기 · 끝 이름표 · 단위 번역이 없다 | 근사 | impulse-force-relation · conical-pendulum · angle-of-friction · bernoullis-principle · spacetime-diagram · gyroscopic-precession · lift-force · polarization · resonance · phase-diagram · rc-circuit · refraction-of-waves · wave-basics |
| G23 | `restart` 는 엔진 시계만 되돌려 상태를 쌓는 조각에는 효과가 없다 | 근사 | inertial-vs-gravitational-mass · lift-force |
| G24 | 러너 여백 · 선언한 조작기 · 캡션 자리가 프레이밍 여백으로 잡히지 않는다 | 근사 | static-friction · banked-curve · tension · interference · field-lines · bernoullis-principle · maxwell-boltzmann-distribution · spacetime-diagram(그림 밖 캡션·조작기 줄) · potential-energy-curve · gyroscopic-precession · lift-force · carnot-cycle · longitudinal-wave · equipotential-surface · atomic-orbital · normal-modes · moon-phases · huygens-principle · polarization · electromagnetic-wave · resonance · youngs-double-slit · rc-circuit · hydrogen-spectrum · moment-of-inertia · lagrange-points · stability-of-floating-body · refraction-of-waves · charged-particle-in-magnetic-field · radioactive-decay · energy-dissipation · perfectly-inelastic-collision · elastic-collision · inelastic-collision · conservation-of-momentum · conservation-of-angular-momentum · rolling-race · simple-pendulum · driven-oscillation · continuity-equation · venturi-effect · manometer · gravitational-field · earth-rotation-day-night · keplers-first-law · shell-theorem · axial-tilt-seasons · escape-velocity · diurnal-motion · gravity-inside-earth · orbital-velocity · earth-revolution-constellations · expanding-universe · solar-altitude-shadow · gravitational-potential-energy-general · stellar-parallax · geostationary-orbit · orbital-transfer · seasonal-sun-path · black-hole-horizon · orbital-decay · elliptical-orbit · diffraction · transverse-wave · wavefront-and-ray · wave-speed-in-medium · seismic-waves · slit-width-and-diffraction · wave-vs-particle-transport · wave-attenuation · sound-through-materials · photoelectric-effect · bohr-model · nuclear-structure · blackbody-radiation · superconductivity · nuclear-fission · rutherford-scattering · compton-scattering · uncertainty-principle · stern-gerlach · decay-types · gravitational-redshift · pair-production · laser-and-stimulated-emission · binding-energy-curve · bose-einstein-condensate · wave-function · ionizing-radiation · pauli-exclusion · antimatter · wien-displacement-law · superposition-quantum · zeeman-effect · relativistic-momentum · work-function-and-threshold · nuclear-fusion · electron-configuration · radiometric-dating · electron-diffraction · relativistic-doppler · photovoltaic-effect · spin · exchange-particles · measurement-collapse · meissner-effect · chain-reaction · diode-and-led · magnetic-field · parallel-plate-capacitor · antenna-radiation · capacitors-in-circuit · magnetic-poles · motional-emf · displacement-current · energy-in-capacitor · magnet-attraction · dielectric · poynting-vector · magnetic-field-lines · radiation-pressure · uniform-field · field-of-loop-and-solenoid · charge-in-uniform-field · electric-field · eddy-current · field-of-charged-sphere · energy-in-inductor · magnetic-dipole · magnetic-materials · electrostatic-shielding · millikan-experiment · second-law-of-thermodynamics · brownian-motion · entropy-and-irreversibility · diffusion · random-walk · statistical-fluctuation · maxwells-demon · refrigerator-heat-pump · malus-law · single-slit-diffraction · diffraction-grating · brewster-angle · resolving-power · birefringence |
| G25 | 화면 px 로 고정되는 크기가 없고, 글자가 배율을 따르지 않는다 | 근사 | vertical-loop · non-inertial-frame · fictitious-force · interference · energy-flow-diagram · field-lines · tidal-force · maxwell-boltzmann-distribution · spacetime-diagram · gyroscopic-precession · hr-diagram · longitudinal-wave · thin-film-interference · equipotential-surface · huygens-principle · double-slit-with-electrons · resonance · phase-diagram · rc-circuit · moment-of-inertia · lagrange-points · stability-of-floating-body · radioactive-decay · angular-momentum-vector · center-of-gravity · exoplanet-detection · star-life-cycle · time-dilation · relativity-of-simultaneity · gravitational-time-dilation · wave-function · light-clock · muon-decay-evidence · twin-paradox |
| G26 | 가는 선을 화면 픽셀에 맞추는 선언이 없다 | 근사 | youngs-modulus · potential-vs-field |
| G27 | `button` 에 비활성 모양이 없다 | 근사 | centripetal-force |
| G28 | 곡선(베지어) · 타원 어휘가 없어 점으로 표본한다 | 근사 | free-body-diagram · fictitious-force · energy-flow-diagram · field-lines · gyroscopic-precession · equipotential-surface · poiseuille-flow · electromagnetic-wave · keplers-second-law · capillary-action · charged-particle-in-magnetic-field · radioactive-decay · work-by-variable-force · efficiency · conservative-force · equilibrium-points · impulse-momentum-theorem · conservation-of-angular-momentum · angular-momentum · angular-momentum-vector · damped-oscillation · coupled-oscillators · surface-tension · laplace-pressure · manometer · wetting-and-contact-angle · boundary-layer · circular-orbit · keplers-first-law · shell-theorem · axial-tilt-seasons · stellar-luminosity · keplers-third-law · diurnal-motion · gravity-inside-earth · orbital-velocity · weightlessness · two-body-problem · gravitational-potential-energy-general · stellar-nucleosynthesis · exoplanet-detection · star-radiation-gravity-balance · orbital-transfer · seasonal-sun-path · supernova-and-neutron-star · orbital-decay · elliptical-orbit · reflection-of-waves · sound-source-vibration · harmonics · doppler-source-vs-observer · wavefront-and-ray · constructive-destructive · wave-energy · impedance-mismatch · sound-intensity · noise-cancellation · string-vibration · shock-wave · wave-vs-particle-transport · wave-attenuation · air-column-resonance · de-broglie-wavelength · bohr-model · nuclear-structure · light-bending-by-gravity · particle-in-a-box · blackbody-radiation · nuclear-fission · rutherford-scattering · uncertainty-principle · length-contraction · pair-production · wave-function · pauli-exclusion · antimatter · wien-displacement-law · superposition-quantum · light-cone · quantum-harmonic-oscillator · radiometric-dating · electron-diffraction · relativistic-doppler · measurement-collapse · meissner-effect · chain-reaction · finite-well · lorentz-force · antenna-radiation · lc-oscillation · motional-emf · reactance-and-impedance · force-on-current-wire · displacement-current · velocity-selector · phase-in-ac-circuit · generator · poynting-vector · mass-spectrometer · series-rlc-resonance · motor · maxwells-equations · field-of-loop-and-solenoid · charge-in-uniform-field · amperes-law · force-between-wires · eddy-current · gausss-law · field-of-charged-sphere · magnetic-dipole · electrostatic-shielding · iv-characteristic · thermal-equilibrium · brownian-motion · radiative-equilibrium · greenhouse-effect · insulation · snells-law · converging-diverging-lens · apparent-depth · plane-mirror-image · rayleigh-scattering · optical-fiber · multiple-mirror-images · lens-combination · concave-mirror · spherical-aberration · dispersion · scattering · human-eye-accommodation · convex-mirror · chromatic-aberration · myopia-hyperopia · rainbow · telescope |

## 턴 기록

(턴마다 새 부족을 아래에 이어 적고, 분야별 새 부족 수를 표로 남긴다.)

## 턴 1 (2026-09-17) — 9개 분야 각 1번

### 새 부족

같은 턴에 두 분야가 같은 종류를 처음 보고하면 **두 분야 모두** 새 부족으로 센다(턴 시작 때 장부에 없었으므로).

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G29 | 자리마다 값이 있는 스칼라 장(격자 값)을 칠하는 어휘가 없다 — 칸마다 `region` 을 수백~수천 개 선언한다 (간섭 8208개 · 베르누이 400개). 실시간 프레임 비용 미확인 | 근사 | interference · bernoullis-principle |
| G30 | 값→색 척도가 없다 (음·0·양 발산형, 순차형). `luminance` 한 줄로 근사해 대비가 약하고 다크 테마에서 뒤집힌다 | 근사 | interference · bernoullis-principle · lift-force · longitudinal-wave · equipotential-surface |
| G31 | 그라데이션 채움(선형 · 방사형)이 없다 — 알파를 겹친 원판 56장, 층을 쌓은 꼬리로 흉내 낸다 | 근사 | energy-flow-diagram · tidal-force · hr-diagram · phase-diagram · hydrogen-spectrum · stability-of-floating-body · efficiency · rolling-race · star-radiation-gravity-balance · orbital-decay · shadow-umbra-penumbra |
| G32 | `particleSystem` 이 인스턴스 하나에 색 · 알파 하나다 — 입자별 색 · 알파가 없다 | 근사 | energy-flow-diagram · hr-diagram · atmospheric-pressure · inverse-square-law · sound-through-materials · electric-current |
| G33 | 빛의 원색 · 합색(빨강 · 초록 · 파랑 · 노랑 · 청록 · 자홍 · 흰)에 맞는 색 역할이 없다 — 「빨강 + 초록 = 노랑」 이 색으로 서지 않는다 | **주장** | color-addition · thin-film-interference · total-internal-reflection |
| G34 | 테마와 무관한 절대 검정 · 흰이 없다 — 흰 합색이 배경 미색이 되고, 다크 테마에서 막과 흰 칸의 밝기가 뒤집힐 것으로 보인다(다크 미촬영) | **주장** | color-addition · thin-film-interference · moon-phases · polarization |
| G35 | 가산 합성(겹친 빛을 더해 칠하기)이 없다 — 겹친 칸을 도형으로 잘라 따로 칠한다 | 근사 | color-addition · total-internal-reflection |
| G36 | `point-drag` 가 잡은 자리와 중심의 어긋남을 유지하지 못한다 — 가장자리를 잡아도 중심이 포인터로 뛴다 | 근사 | color-addition |
| G37 | 입자별 위치 이력 잔상이 없다 — `particleSystem.trail` 은 속도 반대 방향 직선 획뿐 | 근사 | phase-space · transverse-wave |
| G38 | 감기는 좌표(−π~π)에서 선을 끊는 기능이 없다 | 근사 | phase-space |
| G39 | 실시간 `step` 의 dt 가 가변이라 고정 걸음을 쓰려면 조각이 누적기를 둔다 | 근사 | phase-space · color-addition · potential-energy-curve · lift-force · normal-modes · thermal-convection · resonance · capillary-action · hydrogen-spectrum · lagrange-points · stability-of-floating-body · drag-in-fluid |
| G40 | `particleSystem` 꼬리의 알파 · 굵기 · 길이 계수가 고정이고 길이 상한 · 머리 점 끄기가 없다 — 그대로 쓰면 빠른 곳 꼬리가 사라져 「선이 몰린 곳이 세다」 가 뒤집혀 보인다. 입자마다 `trajectory` 950개로 우회 | **주장** | field-lines |
| G41 | 벡터장을 흐르는 획(격자 화살표 · 짧은 획)으로 그리는 어휘가 없다 — 획마다 인스턴스 최대 약 156개, 표현의 대부분이 scene 코드에 있다 | 근사 | tidal-force · electric-field · field-of-charged-sphere |
| G42 | `timeScale` 을 적용하기 전의 화면 시각을 조각이 받지 못한다 | 근사 | tidal-force · supernova-and-neutron-star |
| G43 | `particleSystem` 점 모양(사각 등)을 고를 수 없다 | 근사 | tidal-force |
| G44 | 값의 변화 방향(오름 · 내림 · 멈춤)으로 캡션을 고르거나, 조작하면 단계 캡션에서 상태 캡션으로 넘기는 전환을 선언할 자리가 없다 | 근사 | maxwell-boltzmann-distribution · polarization · phase-diagram · youngs-double-slit |
| G45 | `trace` ring 의 속을 바탕색으로 채울 수 없다 | 근사 | maxwell-boltzmann-distribution · spacetime-diagram |
| G46 | `slider.step` 이 값 글자까지 눈금에 붙인다 (744 → 750) | 근사 | maxwell-boltzmann-distribution · moment-of-inertia |
| G47 | 그래프 축 어휘가 없다 — `scale` linear 는 값 표식을 늘 그리고 눈금 숫자를 강조색으로 칠해, 대신 쓰면 강조색이 두 뜻이 된다 | 근사 | maxwell-boltzmann-distribution · phase-space(세로축 이름을 세우지 못함) · hr-diagram · thin-film-interference · rc-circuit · moment-of-inertia · total-internal-reflection · radioactive-decay · kinetic-energy · ballistic-pendulum · work-by-variable-force · work-energy-theorem · elastic-potential-energy · gravitational-potential-energy · conservation-of-momentum · impulse-momentum-theorem · two-dimensional-collision · conservation-of-angular-momentum · parallel-axis-theorem · damping-regimes · quality-factor · hydrostatic-pressure · barometer · star-color-temperature · axial-tilt-seasons · gravity-inside-earth · stellar-spectral-class · solar-altitude-shadow · gravitational-potential-energy-general · stellar-nucleosynthesis · seasonal-sun-path · star-life-cycle · wave-basics · digital-vs-analog-signal · wave-energy · blackbody-radiation · superconductivity · uncertainty-principle · binding-energy-curve · bose-einstein-condensate · relativistic-velocity-addition · wave-function · wien-displacement-law · relativistic-momentum · fermi-level · work-function-and-threshold · radiometric-dating · measurement-collapse · diode-and-led · faradays-law · ohms-law · reactance-and-impedance · energy-in-capacitor · phase-in-ac-circuit · self-inductance · series-rlc-resonance · loudspeaker-and-microphone · field-of-dipole · mutual-inductance · kirchhoffs-voltage-law · transformer · emf-and-internal-resistance · ac-generation · field-of-charged-sphere · potential-divider · energy-in-inductor · potential-vs-field · wheatstone-bridge · iv-characteristic · millikan-experiment · second-law-of-thermodynamics · thermal-equilibrium · pv-diagram · calorimetry · isothermal-process · latent-heat · adiabatic-process · isobaric-isochoric · triple-point · random-walk · cyclic-process · insulation · statistical-fluctuation · malus-law · brewster-angle |
| G48 | 한 점과 기울기로 긋는 무한 직선이 없다 | 근사 | spacetime-diagram · potential-vs-field |
| G49 | 선 끝 이름표를 화면 안에 두기 (`readout.clamp` 로 되는지 미확인) | 근사 | spacetime-diagram · field-of-dipole |
| G50 | 글자 둘레 바탕색 테두리가 없다 | 근사 | spacetime-diagram · stability-of-floating-body · keplers-first-law · expanding-universe · elliptical-orbit · light-cone · motional-emf |
| G51 | 조각 선언이 인스턴스를 수백~수천 개 만들 때의 성능 한도가 없다 — 간섭 8208 · 전기력선 950 · 위상 공간 520+. 실시간 프레임률 미확인 | 미정 | interference · field-lines · phase-space · lift-force · equipotential-surface · moon-phases · huygens-principle · electromagnetic-wave · resonance · youngs-double-slit · refraction-of-waves · diffraction · slit-width-and-diffraction · meissner-effect |

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
| G53 | `opacities` 를 8 단계로 반올림해 1/16 미만이 그려지지 않는다 — 가장 옅은 끝이 잘린다 | 근사 | tidal-force · carnot-cycle · equipotential-surface · atomic-orbital · poiseuille-flow · thermal-convection · rc-circuit · hydrogen-spectrum · lagrange-points · parallel-plate-capacitor · antenna-radiation · lc-oscillation · capacitors-in-circuit · displacement-current · mean-free-path · pinhole-camera · scattering |
| G54 | `scalarField` 발산형에서 같은 역할을 양쪽에 주면 음 · 양이 같은 짙기라 부호가 갈리지 않는다(물결 띠가 반 파장 간격으로 보임). 한 역할 안에서 음 · 양을 짙기 · 결로 가르는 사상이 없다 | 근사 | interference |

## 턴 2 (2026-09-17) — 9개 분야 각 2번

### 새 부족

판정 기준: 장부 항목의 문안이 그 모자람을 적고 있지 않으면 새 id 로 세운다(턴 1 뒤 G54 를 G30 과 따로 세운 입도와 같다).
이관 에이전트가 장부 id 에 댄 것이라도 문안에 없으면 새로 세웠고(G61 흑체색 · G62), 새 부족이라 한 것이라도 문안에 있으면 장부 id 로 돌렸다
(thin-film-interference 의 「조작기 하나에 판정 자리 둘」 → G21 「판정 모양」).

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G55 | 고정 시점 3차원 투영이 없다 — 3차원 점 · 원 · 원판 · 화살표를 선언할 수 없어 조각이 투영 수식과 깊이 순서(단계별 인스턴스)를 짠다. 저작자가 시점을 못 바꾼다 | 근사 | gyroscopic-precession · atomic-orbital · polarization · angular-momentum · angular-momentum-vector · axial-tilt-seasons · stellar-luminosity · inverse-square-law · eclipse · geostationary-orbit · exoplanet-detection · seasonal-sun-path · michelson-morley · light-cone · lorentz-force · displacement-current · poynting-vector · maxwells-equations · field-of-loop-and-solenoid · biot-savart-law · magnetic-dipole · birefringence |
| G56 | 높이장을 3차원 곡면으로 그리는 어휘가 없다 — 투영 · 가려짐 · 기울기 음영을 조각이 구워 `scalarField` 한 장으로 넘긴다. 곡면 위 선 · 점의 가려짐도 조각이 뺀다 | 근사 | equipotential-surface · bose-einstein-condensate |
| G57 | 머리 있는 화살표 묶음이 없다 — `vector` 는 낱개, `lineSet` 은 머리가 없어 꺾쇠 두 획으로 흉내 낸다 | 근사 | gyroscopic-precession · stability-of-floating-body · buoyancy · pascals-principle · boundary-layer · gravitational-field · star-radiation-gravity-balance · wavefront-and-ray · stern-gerlach · pauli-exclusion · zeeman-effect · lc-oscillation · displacement-current · magnetic-field-lines · uniform-field · field-of-loop-and-solenoid · electric-field · gausss-law · magnetic-dipole · potential-vs-field · magnetic-materials · electrostatic-shielding · seeing-requires-light · object-color |
| G58 | 캡션 문안의 일부(값 하나)에 강조색 · 굵기를 걸 수 없다 — 화면 표식과 캡션 숫자를 색으로 잇지 못한다 | 근사 | hr-diagram |
| G59 | `TimelineFrame` 에 다른 시각의 진행도를 묻는 자리가 없다 — 「조금 전 자리」 꼬리를 위해 조각이 단계 길이 · 이징을 다시 계산한다 | 근사 | hr-diagram · electromagnetic-wave · standing-wave · center-of-mass-motion · conservation-of-angular-momentum · quality-factor · venturi-effect · roche-limit · string-vibration · shock-wave · gravitational-time-dilation · electron-diffraction · transistor-principle · diode-and-led · scanning-tunneling-microscope · loudspeaker-and-microphone · ideal-gas-law · first-law-of-thermodynamics · thermal-radiation · boyles-law · albedo · isothermal-process · adiabatic-process · scattering |
| G60 | 파장마다 그 파장의 색으로 칠하는 스펙트럼 채움이 없다 — 「골이 초록 자리에 왔다」 가 눈금 숫자로만 읽힌다 (빛 색 트랙) | **주장** | thin-film-interference · hydrogen-spectrum |
| G61 | 물리 계산이 낸 색(값 → RGB)을 칠할 수 없다 — `scalarField` 색표 · 입자 색이 테마 역할의 명암뿐이다. 반사색 · 흑체색 (빛 색 트랙) | **주장** (thin-film) · 근사 (hr) | thin-film-interference · hr-diagram · youngs-double-slit · hydrogen-spectrum · total-internal-reflection |
| G62 | `scalarField` 의 값→색 사상 곡선 · 섞기 공간을 고를 수 없다 — 선형광 고정이라 원본의 농도 · 명도 사상을 옮기려면 조각이 테마 명도 숫자를 들고 되풀거나(다크에서 틀림) 중간 농도를 잃는다 | 근사 | lift-force · longitudinal-wave · thermal-convection · huygens-principle · polarization · double-slit-with-electrons · resonance · capillary-action · standing-wave · youngs-double-slit · hydrogen-spectrum · lagrange-points · diffraction · slit-width-and-diffraction |
| G63 | `lineSet` 굵기를 월드 단위로 줄 수 없다 — 월드 간격으로 놓은 기둥이 배율에 따라 뜨거나 겹친다 | 근사 | carnot-cycle · double-slit-with-electrons · resonance · magnetic-field |
| G64 | `trace` 자국마다 수명을 줄 수 없다 — 인스턴스 하나에 수명 하나 | 근사 | atomic-orbital |
| G65 | `param-chips` 선택 표시 모양을 고를 수 없다 | 근사 | atomic-orbital |
| G66 | 스칼라 장에서 등고선(같은 값 선)을 뽑는 어휘가 없다 — 조각이 마칭 스퀘어로 선분 2257개를 만들어 `lineSet` 로 넘긴다 | 근사 | equipotential-surface · electromagnetic-wave · lagrange-points · refraction-of-waves · magnetic-dipole |

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
| G68 | `lineSet` 에 선 모양(점선)이 없다 — 점선 가닥을 `trajectory` 낱개로 선언한다 (G05 는 대시 무늬 값을 고르는 문제) | 근사 | normal-modes · radioactive-decay · kinetic-energy · work-energy-theorem · non-conservative-force · shm-energy · hydrostatic-pressure · viscosity · seismic-waves · quantum-tunneling · ionizing-radiation · radiometric-dating · twin-paradox · antenna-radiation · poynting-vector · maxwells-equations · magnetic-dipole · random-walk · single-slit-diffraction · diffraction-grating · resolving-power |
| G69 | 광원 · 시선 방향만 주면 구의 명암 경계를 그리는 원판 어휘가 없다 — 조각이 칸마다 내적을 계산해 `scalarField` 로 넘긴다 | 근사 | moon-phases · axial-tilt-seasons |
| G70 | `scalarField` 순차형의 낮은 끝이 바탕으로 고정이고 여러 색 정박점이 없다 — 「그늘도 조금 밝은 톤」 · 「차가운 끝도 색」 을 줄 수 없다 | 근사 | moon-phases · thermal-convection · phase-diagram · stability-of-floating-body · refraction-of-waves · diffraction · slit-width-and-diffraction |
| G71 | `scalarField` 의 칠 영역이 축 정렬 사각형뿐이다 — 원판 · 기울어진 판 밖을 바탕 값으로 칠해 모양을 만들고, 그 칸이 아래 그림을 가린다 | 근사 | moon-phases · polarization · capillary-action · newtons-rings |
| G72 | 점 · 선 · 면에 쓸 바탕(반전) 색 역할이 없다 — `luminance: 0` 우회가 다크 테마에서 뒤집힌다 (G07 은 글자만) | 근사 | poiseuille-flow · keplers-second-law · stability-of-floating-body · refraction-of-waves · total-internal-reflection · rocket-equation · work-by-variable-force · conservation-of-momentum · eclipse · exoplanet-detection · gausss-law · seeing-requires-light · rectilinear-propagation · shadow-umbra-penumbra · pinhole-camera · object-color · dispersion · light-through-materials · prism · chromatic-aberration · rainbow |
| G73 | 떨어진 면 여러 개를 한 선언으로 칠하는 면 묶음이 없다 — 칸마다 `region` | 근사 | poiseuille-flow · resonance · keplers-second-law · stability-of-floating-body · perfectly-inelastic-collision · rocket-equation |
| G74 | `lineSet` 에 선마다 다른 굵기가 없다 — 굵기별 인스턴스로 나눈다 | 근사 | thermal-convection · moment-of-inertia |
| G75 | `particleSystem` 에 「꼬리가 짧을 때만 점」 이 없다 | 근사 | thermal-convection |
| G76 | `preroll` 이 상태의 일부만 미리 굴리게 고를 수 없다 — `initialState` 가 직접 적분한다 | 근사 | thermal-convection |
| G77 | `particleSystem` 입자에 둘레 선(굵기 · 색)이 없다 (G03 은 `body` 한정) | 근사 | huygens-principle · radioactive-decay |
| G78 | 면 해칭의 방향 · 간격 · 색을 고를 수 없다 — `region` hatch 는 45° · 바탕색 고정 | 근사 | polarization · stability-of-floating-body · kinetic-energy · non-conservative-force · gravitational-potential-energy · rotational-kinetic-energy · uncertainty-principle · amperes-law · cyclic-process · malus-law · birefringence |
| G79 | `particleSystem` 점 크기를 월드 단위로 줄 수 없다 (G63 은 `lineSet` 굵기) | 근사 | electromagnetic-wave · resonance · phase-diagram · moment-of-inertia · radioactive-decay · efficiency · magnitude-scale · inverse-square-law · roche-limit · supernova-and-neutron-star · scale-of-universe · decay-types · muon-decay-evidence · heat-engine |
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
| G84 | 월드에 놓이는 막대 묶음이 없다 — `graph` bar 는 화면 카드라 막대를 `region` 으로 직접 배치한다 | 근사 | keplers-second-law · energy-dissipation · rocket-equation · ballistic-pendulum · non-conservative-force · conservative-force · inelastic-collision · energy-in-collision · parallel-axis-theorem · shm-energy · coupled-oscillators · buoyancy · keplers-third-law · solar-altitude-shadow · seasonal-sun-path · orbital-decay · wave-energy · sound-intensity · wave-attenuation · rutherford-scattering · wave-function · nuclear-fusion · chain-reaction · transistor-principle · lc-oscillation · energy-in-capacitor · amperes-law · gausss-law · thermal-equilibrium · ideal-gas-law · thermal-radiation · thermal-expansion · specific-heat · stefan-boltzmann-law · bimetal · calorimetry · albedo · radiative-equilibrium · pressure-from-collisions · adiabatic-process · diffusion · greenhouse-effect · random-walk · cyclic-process · insulation · mean-free-path · maxwells-demon · malus-law · lens-combination · microscope |
| G85 | 발산형 `scalarField` 의 가운데(0)가 바탕으로 고정이다 — 「대기압 액체 ≠ 공기」 · 「바탕보다 밝은 마루」 를 줄 수 없고 테마에 따라 명암이 뒤집힌다 (G70 은 순차형 낮은 끝) | 근사 | capillary-action · youngs-double-slit |
| G86 | `param-chips` 가 같은 칸을 다시 누른 것을 알리지 못한다 — `heldPath` 로 우회 | 근사 | capillary-action |
| G87 | 음 · 양을 가르는 중립 색 역할 쌍이 없다 — 뜻이 다른 `negative` 를 빌린다 (G54 는 같은 역할 양쪽) | 근사 | standing-wave |
| G88 | `marker` 점 크기를 고를 수 없다 | 근사 | standing-wave · quantum-harmonic-oscillator |
| G89 | 경로를 따라 흐르는 점 묶음이 없다 — scene 이 점 자리를 계산한다 | 근사 | rc-circuit · efficiency · conservative-force · viscosity · continuity-equation · venturi-effect · laplace-pressure · boundary-layer · seismic-waves · de-broglie-wavelength · photoelectric-effect · band-theory · rutherford-scattering · compton-scattering · stern-gerlach · decay-types · semiconductor-doping · pair-production · ionizing-radiation · pn-junction · electron-diffraction · photovoltaic-effect · spin · chain-reaction · transistor-principle · scanning-tunneling-microscope · electric-current · ohms-law · displacement-current · simple-circuit · poynting-vector · kirchhoffs-current-law · magnetic-field-lines · drift-velocity · resistance-and-geometry · kirchhoffs-voltage-law · emf-and-internal-resistance · amperes-law · joule-heating · gausss-law · temperature-and-resistance · power-transmission · thermistor-and-ldr · isothermal-process · heat-engine · refrigerator-heat-pump · seeing-requires-light · object-color |
| G90 | 코어에 회로 기호 · 2위치 스위치가 없다 — 선으로 그린다 | 근사 | rc-circuit · parallel-plate-capacitor · lc-oscillation · capacitors-in-circuit · ohms-law · reactance-and-impedance · simple-circuit · phase-in-ac-circuit · poynting-vector · charging-methods · kirchhoffs-current-law · series-rlc-resonance · drift-velocity · electromagnet · rl-circuit · resistance-and-geometry · kirchhoffs-voltage-law · transformer · emf-and-internal-resistance · joule-heating · potential-divider · temperature-and-resistance · power-transmission · wheatstone-bridge · thermistor-and-ldr |
| G91 | 값에서 기준선까지 잇는 세로 차이 막대(끝 눈금 포함)가 없다 — `lineSet` 으로 근사 | 근사 | rc-circuit · radioactive-decay · conservative-force · rotational-kinetic-energy · damped-oscillation · buoyancy |
| G92 | 빛 채널의 가득 찬 빛이 라이트 바탕과 겹쳐 발광체 · 밝은 면의 윤곽이 사라진다 — 같은 대상을 역할 색과 빛으로 두 번 선언하거나 윤곽을 더한다 | 근사 | hydrogen-spectrum (moon-phases 재이관에서도) · earth-rotation-day-night · star-color-temperature · magnitude-scale · axial-tilt-seasons · stellar-luminosity · eclipse · earth-revolution-constellations · solar-altitude-shadow · stellar-parallax · exoplanet-detection · star-life-cycle · gravitational-redshift · wien-displacement-law · relativistic-doppler · simple-circuit · drift-velocity · seeing-requires-light · diffraction-grating · rayleigh-scattering · real-vs-virtual-image · optical-fiber · pinhole-camera · mirage · dispersion · scattering · light-through-materials · prism · chromatic-aberration · rainbow |

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
| G93 | 시간표 단계 경계에 부동소수 허용이 없다 — `?t=` 촬영이 1/60 초 걸음을 쌓아 경계 바로 앞(3.9999…)에 멈춰 **앞 단계 캡션**이 찍힌다. 어휘 부족이 아니라 엔진 시계의 결함일 수 있다(미확인) | 근사 | charged-particle-in-magnetic-field · thermal-radiation |
| G94 | `trajectory` `fade: 'tail'` 의 최소 알파 · 옅어지는 곡선을 고를 수 없다 | 근사 | charged-particle-in-magnetic-field |
| G95 | 굽은 화살표(원호 + 촉) 어휘가 없다 — 원호와 삼각형을 따로 선언하고 촉 자리를 scene 이 계산한다 | 근사 | moment-of-inertia · stability-of-floating-body · parallel-axis-theorem · angular-momentum-vector · gears · earth-rotation-day-night · displacement-current · poynting-vector · maxwells-equations · eddy-current |
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
| G100 | 강조 역할 표지가 빛 색 대상 위에서 묻힐 때 쓸 둘레(바탕 테두리 · 대비)가 없다 — 황토 관찰 고리가 금빛 막 띠 위에서 거의 안 보인다 | 근사 | thin-film-interference · michelson-morley · newtons-rings |
| G101 | `lineSet` 에 선마다 다른 빛 색이 없다 — 파장마다 선언을 나눈다 (G32 는 `particleSystem`) | 근사 | hydrogen-spectrum · photoelectric-effect · bohr-model · gravitational-redshift · relativistic-doppler · photovoltaic-effect · diode-and-led · seeing-requires-light · object-color · dispersion · chromatic-aberration |

판정: 네 조각 모두 다크 · 라이트에서 원본의 색 주장이 선다. 검증에서 주장이 약해졌던 조각(color-addition · thin-film-interference ·
hydrogen-spectrum)은 이제 모두 섰다.

## 직접 구현 시험 1 (2026-09-17) — 일·에너지·운동량 5개

새 작업 방식의 시험이다. **자유 구현 원본을 만들지 않고** 엔진 위에서 바로 지었다. 원본 대조가 없어진 자리는
「probeTimes 마다 라이트 · 다크 스크린샷을 만든 에이전트가 직접 열어 주장이 서는지 판정한다」 로 메웠다
(`piece:report` 가 원본 없는 조각을 지원하고 sims 를 두 테마로 강제 촬영하도록 고쳤다).

운동 에너지 · 에너지 소산 · 완전 비탄성 충돌 · 로켓 방정식 · 탄동 진자. 다섯 모두 주장 부족 0, 다크 · 라이트에서 주장이 선다.

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G102 | 열 · 온도처럼 뜻이 정해진 색 역할이 없다 — `accent` 를 빌리면 같은 그림에서 강조가 두 뜻이 된다 | 근사 | energy-dissipation · star-radiation-gravity-balance · joule-heating · power-transmission · thermal-radiation · albedo · refrigerator-heat-pump |
| G103 | `dimension` 이 짧아지면 끝 표시와 글자가 겹친다 — 최소 길이 · 글자 자리 규칙이 없고, 조각이 「이 아래로는 재지 않는다」 를 판정할 자리도 없다 | 근사 | ballistic-pendulum · elastic-potential-energy · inelastic-collision · rotational-kinetic-energy · quality-factor · pascals-principle · manometer · weightlessness · exoplanet-detection · thermal-expansion |
| G104 | 시간표 단계에 「이 단계 동안 이 값은 그대로다」 를 선언할 자리가 없다 — 어느 표지를 걸지 scene 이 진행도로 다시 판정한다 (G01 은 `step` 쪽) | 근사 | ballistic-pendulum · axial-tilt-seasons · solar-altitude-shadow · seasonal-sun-path · band-theory · relativity-of-simultaneity · electron-diffraction |

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
| G105 | 스테이지 상수가 수 하나씩뿐이라 목록(줄마다의 값)을 선언할 수 없다 — 줄 수는 코드에, 줄마다의 값은 이름 셋으로 흩는다 (G13 은 시간표 단계 쪽) | 근사 | inelastic-collision · energy-in-collision · mass-spring-system · physical-pendulum · damping-regimes · floating-and-draft · gravitational-field · shell-theorem · escape-velocity · diurnal-motion · stellar-spectral-class · orbital-velocity · earth-revolution-constellations · gravitational-potential-energy-general · stellar-nucleosynthesis · black-hole-horizon · star-life-cycle · elliptical-orbit · digital-vs-analog-signal · string-vibration · bohr-model · nuclear-structure · scale-of-universe · blackbody-radiation · nuclear-fission · compton-scattering · semiconductor-doping · pair-production · laser-and-stimulated-emission · binding-energy-curve · bose-einstein-condensate · ionizing-radiation · wien-displacement-law · light-cone · zeeman-effect · relativistic-momentum · work-function-and-threshold · electron-configuration · chain-reaction · muon-decay-evidence · electric-charge · electric-current · coulombs-law · faradays-law · capacitors-in-circuit · motional-emf · ohms-law · reactance-and-impedance · magnet-attraction · simple-circuit · velocity-selector · generator · charging-methods · mass-spectrometer · kirchhoffs-current-law · radiation-pressure · uniform-field · electromagnet · superposition-of-forces · resistance-and-geometry · field-of-loop-and-solenoid · mutual-inductance · kirchhoffs-voltage-law · emf-and-internal-resistance · electric-field · amperes-law · force-between-wires · joule-heating · eddy-current · gausss-law · potential-divider · temperature-and-resistance · potential-vs-field · magnetic-materials · power-transmission · electrostatic-shielding · iv-characteristic · millikan-experiment · thermistor-and-ldr · specific-heat · stefan-boltzmann-law · boyles-law · calorimetry · albedo · charles-law · radiative-equilibrium · latent-heat · greenhouse-effect · triple-point · insulation · snells-law · converging-diverging-lens · malus-law · magnification · apparent-depth · diffraction-grating · real-vs-virtual-image · newtons-rings · optical-fiber · brewster-angle · multiple-mirror-images · mirage · lens-combination · resolving-power · birefringence · object-color · concave-mirror · spherical-aberration · dispersion · light-through-materials · human-eye-accommodation · prism · chromatic-aberration · myopia-hyperopia · rainbow · magnifying-glass · telescope |
| G106 | 한 번 터지고 끝나는 파편 어휘가 없다 — `stream` 은 계속 뿜기만 해서 scene 이 파편 자리를 계산해 `particleSystem` 으로 넘긴다 | 근사 | explosion-and-recoil · supernova-and-neutron-star · nuclear-fission · chain-reaction |
| G107 | 용수철(`constraint` spring)에 다 눌린 최소 길이가 없다 — 가장 눌린 순간 코일이 뭉쳐 자연 길이를 늘려 피한다 (G20 은 폭 · 굵기) | 근사 | conservation-of-momentum · damping-regimes · nonlinear-oscillation |
| G108 | 화살표를 꼬리-머리로 잇는 묶음이 없다 — 이음 자리를 scene 이 계산하고, 짧아진 화살표는 머리만 남는다 (G57 은 나란한 묶음) | 근사 | energy-in-collision · gravitational-slingshot · superposition · radiation-pressure |
| G109 | 같은 자리에서 이름표 문안을 갈아 끼우는 선언이 없다 — 단계를 하나 더 두어 바꾼다 (G14 · G44 는 캡션 쪽) | 근사 | energy-in-collision · floating-and-draft · earth-revolution-constellations · seasonal-sun-path · light-bending-by-gravity · pn-junction · photovoltaic-effect · transistor-principle · diode-and-led · scanning-tunneling-microscope · pv-diagram · cyclic-process |
| G110 | `vector.from` 을 물체 id 에 걸 수 없다 — 화살표 꼬리를 물체 가장자리에 두는 계산을 scene 이 한다 | 근사 | two-dimensional-collision · torque · static-equilibrium · center-of-gravity · simple-harmonic-motion · nonlinear-oscillation · hydrostatic-pressure · pascals-principle · surface-tension · atmospheric-pressure · barometer · gravitational-field · newtons-law-of-gravitation · escape-velocity · coulombs-law · radiation-pressure · electric-field |
| G111 | 선을 따라 이름표를 붙일 자리가 없다 — 어디에 두어도 선과 겹쳐 이름표를 뺐다 (G49 는 선 끝) | 근사 | center-of-mass-motion · torque · parallel-axis-theorem · nonlinear-oscillation · seismic-waves · statistical-fluctuation |
| G112 | 이름표와 대상을 잇는 지시선이 없다 — 움직이는 점의 이름표를 고정 자리에 두고 색으로만 잇는다 | 근사 | center-of-mass-motion · buoyancy · floating-and-draft · earth-rotation-day-night · shell-theorem · earth-revolution-constellations · stellar-parallax · geostationary-orbit · time-dilation · displacement-current |

가장 많이 겪은 기존 부족: G09 묶음 불투명도 · G17 화살표 이름표 (각 4) · G10 · G47 · G24 (각 3).

## 직접 구현 배치 16 (2026-09-18) — 회전 8개

`_batches/16-direct-rotation.json`. 돌림힘 · 평행축 정리 · 회전 운동 에너지 · 각운동량 · 각운동량 보존 · 각운동량의 방향 ·
미끄러지지 않는 구름 · 구르는 물체의 경주. 여덟 모두 두 테마에서 주장이 선다(만든 에이전트의 판정).

**새 부족 9 — 주장 1, 근사 8.** 처음으로 `주장` 영향이 나왔다(G120).

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G113 | `sector` 가 곧은 두 변을 긋지 않는다 — 어디서부터 잰 각인지 점선으로 따로 보인다 | 근사 | torque · static-equilibrium · stellar-parallax · michelson-morley · law-of-reflection · snells-law · prism · rainbow |
| G114 | `surface` wall 에 평면도(위에서 본) 벽 두께가 없다 — 선 하나로 벽을 대신한다 | 근사 | torque |
| G115 | `readout` 에 아래 · 위 첨자가 없다 — `I_cm` 을 밑줄 문자 그대로 쓴다 | 근사 | parallel-axis-theorem · nuclear-structure · scale-of-universe · nuclear-fission · binding-energy-curve · nuclear-fusion · heat-engine |
| G116 | 원형 `body` 가 `orientation` 을 그림에 드러내지 않는다 — 도는 표지를 `lineSet` 살로 따로 선언하고 끝점을 scene 이 계산한다 (moment-of-inertia 도 같은 우회) | 근사 | rolling-race · rotational-kinetic-energy |
| G117 | 물리 시계가 멈추는 단계를 선언할 수 없다(`timeScale` > 0) — physics 가 「움직이는 단계」 id 목록을 코드에 둔다 (G99 는 조작 중 시계, G104 는 값 그대로 표지) | 근사 | rolling-without-slipping · weightlessness · wave-basics · superposition · doppler-source-vs-observer · wave-speed-in-medium · shock-wave · sound-through-materials · relativity-of-simultaneity |
| G118 | 한 점을 중심으로 함께 도는 묶음(테 · 살 · 표지점)을 각 하나로 돌리는 선언이 없다 — 인스턴스마다 cos · sin 으로 자리를 계산한다 (G10 은 평행 이동) | 근사 | rolling-without-slipping · static-equilibrium · center-of-gravity · earth-rotation-day-night · circular-orbit · shell-theorem · axial-tilt-seasons · diurnal-motion · earth-revolution-constellations · two-body-problem · geostationary-orbit · roche-limit · michelson-morley · magnetic-poles · generator · motor · ac-generation · magnetic-materials · heat-engine |
| G119 | `surface.material` 이 선언에만 있고 렌더러가 읽지 않는다 — S-render 「선언에 둔 필드는 렌더러가 구현한다」 위반(rule-guard 확인, 2026-04-21 부터). 20개 sim 의 `material` 선언이 그림에 반영되지 않는다 | 근사 | rotational-kinetic-energy |
| G120 | 3차원 투영이 거울상이 아님을 어휘가 보장하지 않는다 — 조각의 투영식 가로축 부호 하나로 오른손 규칙이 왼손 규칙이 되고, 모양은 멀쩡해 드러나지 않는다 (G55 의 투영 부재가 원인). gyroscopic-precession 의 투영이 이 기준으로 거울상일 수 있다는 보고가 있다(미확인) | **주장** | angular-momentum-vector · light-cone · lorentz-force · poynting-vector · biot-savart-law |
| G121 | 한 선을 깊이에 따라 앞 · 뒤로 갈라 그릴 방법이 없다 — 표본마다 깊이를 보고 가닥을 나눠 선언한다 | 근사 | angular-momentum-vector · axial-tilt-seasons · eclipse · exoplanet-detection · light-cone · lorentz-force · displacement-current · poynting-vector · maxwells-equations · biot-savart-law · eddy-current |

rule-guard 사후 검증이 둘을 잡아 고쳤다 — conservation-of-angular-momentum 의 선언 이징(linear)과 physics 의 smoothstep 불일치
(선언 `smooth` 로 바꾸고 physics 가 선언의 이징 이름을 읽는다), parallel-axis-theorem 의 시작 축 거리 코드 상수(스테이지 상수로).

## 직접 구현 배치 17 (2026-09-18) — 평형 · 기어 · 조화 운동 8개

`_batches/17-direct-oscillation-1.json`. 정적 평형 · 무게 중심 · 기어 · 단순 조화 운동 · 조화 운동의 에너지 · 용수철 진자 · 단진자 ·
물리 진자. 여덟 모두 두 테마에서 주장이 선다(만든 에이전트의 판정). 주장 부족 0.

정적 평형 · 무게 중심의 「도는 물체에 붙는 좌표계 / 한 점 둘레로 돌리기」 는 G118 과 같은 모자람이라 새 id 를 주지 않았다.

**새 부족 9, 모두 근사.**

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G122 | 월드 앵커에 붙인 `readout` 칩이 `align` 을 무시하고 늘 가운데에 놓여 표지점을 덮는다 | 근사 | center-of-gravity · drag-in-fluid · star-color-temperature · star-radiation-gravity-balance · star-life-cycle · equivalence-principle · motional-emf · triple-point |
| G123 | `dimension` 글자의 크기 · 글꼴 · 기울임 · 바탕 칩을 고를 수 없다 — 같은 그림에서 기호 모양이 갈리고, 물체 위에서 글자가 묻힌다 | 근사 | mass-spring-system · gears · continuity-equation · pascals-principle · stokes-drag · earth-rotation-day-night · axial-tilt-seasons · expanding-universe · solar-altitude-shadow · wave-basics · doppler-source-vs-observer · wave-energy · de-broglie-wavelength · scale-of-universe · michelson-morley · uncertainty-principle · light-clock · phase-in-ac-circuit |
| G124 | 핀에 매달려 도는 강체 어휘가 없다 — `constraint` rigid_rod 는 핀 너머로 튀어나온 몸통을 그리지 못해 막대 · 질량 중심 · 거리 표지를 scene 이 매 프레임 계산한다 | 근사 | physical-pendulum |
| G125 | 움직이는 물체 위의 점을 따라가는 조작기가 없다 — 조작기 선언이 정적이다 | 근사 | physical-pendulum |
| G126 | `constraint` 끝을 물체 id 에 걸면 중심까지 긋는다 — 속 빈 물체 안으로 줄이 비쳐 둘레 끝점을 scene 이 계산한다 (G110 은 `vector.from`) | 근사 | simple-pendulum |
| G127 | 세로 `dimension` 의 글자가 선 위 끝 너머에 붙는다 — 다른 물체(보) 위에 얹혀 글자 없는 치수선 + 따로 붙인 이름표로 피한다 (G103 · G111 과 다름) | 근사 | simple-pendulum · stokes-drag · manometer · exoplanet-detection · band-theory · particle-in-a-box · length-contraction · quantum-tunneling · fermi-level · nuclear-fusion · light-clock · scanning-tunneling-microscope · parallel-plate-capacitor · random-walk · rectilinear-propagation · apparent-depth · shadow-umbra-penumbra · pinhole-camera |
| G128 | 기어(톱니바퀴) 어휘가 없다 — 톱니를 사다리꼴로 계산해 매 프레임 SVG 경로 문자열로 `body` custom 에 넘긴다 | 근사 | gears |
| G129 | 단계 길이 사이의 관계(주기 = `turn` × 2 등)를 선언할 자리가 없다 — 저작자가 깨도 경고 없이 주기 끝에서 튄다 | 근사 | gears · circular-orbit · keplers-first-law · keplers-third-law · eclipse · two-body-problem · geostationary-orbit · exoplanet-detection · elliptical-orbit · reflection-of-waves · wave-basics · transverse-wave · harmonics · doppler-source-vs-observer · wave-speed-in-medium · impedance-mismatch · shock-wave · wave-vs-particle-transport · sound-through-materials · time-dilation · relativity-of-simultaneity · scale-of-universe · particle-in-a-box · gravitational-time-dilation · stern-gerlach · length-contraction · semiconductor-doping · quantum-tunneling · laser-and-stimulated-emission · pauli-exclusion · relativistic-momentum · quantum-harmonic-oscillator · electron-configuration · photovoltaic-effect · spin · light-clock · chain-reaction · muon-decay-evidence · diode-and-led · twin-paradox · scanning-tunneling-microscope · electric-current · lc-oscillation · displacement-current · simple-circuit · kirchhoffs-current-law · maxwells-equations · transformer · eddy-current · thermal-equilibrium · thermal-radiation · specific-heat · calorimetry · albedo · entropy-and-irreversibility · mean-free-path · heat-engine · newtons-rings |
| G130 | 고정 촬영(`?t=`)에서 조작기 값을 고를 수 없다 — 칩의 다른 값 화면을 확인하지 못한다 (G83 은 비활성 모양) | 근사 | gears · wave-basics |

## 직접 구현 배치 18 (2026-09-18) — 감쇠 · 강제 · 결합 진동 7개

`_batches/18-direct-oscillation-2.json`. 감쇠 진동 · 감쇠의 세 양상 · 강제 진동 · Q 인자 · 결합 진동자 · 진동의 맥놀이 · 비선형 진동.
일곱 모두 두 테마에서 주장이 선다(만든 에이전트의 판정). 주장 부족 0. 회전과 진동 분야는 이 배치로 다 만들었다.

판정 메모 — coupled-oscillators 가 새 부족으로 올린 「단계 길이가 스테이지 상수를 따라가지 못한다」 는 배치 17 의 세 조각이
이미 G13 으로 적은 것과 같아 G13 으로 셌다. damping-regimes 의 「정착 시각을 표시하는 어휘」 는 정착 시각 계산이 조각의
물리라서 장부에 올리지 않았다(표시는 `trajectory` 눈금으로 된다).

**새 부족 2, 모두 근사.**

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G131 | 월드에 놓이는 흐르는 기록지(시간창 이력 곡선)가 없다 — `graph` 는 화면 카드라 물체 옆에 붙일 수 없어 scene 이 표본 수백 개를 매 프레임 계산해 `trajectory` 로 넘긴다 (waves/beats 의 NOTES 「시간창 잔상 트랙」 과 같다, G82 폭포 무늬와 다름) | 근사 | driven-oscillation · beats-in-oscillation · exoplanet-detection · wave-basics · digital-vs-analog-signal · superconductivity · pair-production · fermi-level · faradays-law · reactance-and-impedance · phase-in-ac-circuit · self-inductance · loudspeaker-and-microphone · mutual-inductance · transformer · ac-generation · iv-characteristic · statistical-fluctuation · mirage |
| G132 | 감쇠기(대시포트) 어휘가 없다 — 감쇠의 존재와 세기를 이름표 글자만 말한다 | 근사 | damping-regimes |

## 직접 구현 · 큐 첫 목표치 (2026-09-18) — 유체 17개

`_batches/19-direct-fluids.json`. 배치 장벽 없이 동시 5 개 큐로 돌렸다(PROCESS.md 「큐로 돌린다」). 정수압 · 연속 방정식 ·
표면 장력 · 부력 · 점성 · 파스칼 원리 · 벤투리 효과 · 라플라스 압력 · 뜨는 깊이 · 스토크스 항력 · 대기압 · 레이놀즈 수 ·
젖음과 접촉각 · 압력계 · 유체 속 항력 · 기압계 · 경계층. 17 모두 두 테마에서 주장이 선다(만든 에이전트의 판정). 주장 부족 0.
유체 분야 27/27.

**새 부족 7, 모두 근사.** G135 · G139 는 엔진 · 도구 쪽 사실이다.

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G133 | 캡션 `vars` 가 state 경로만 가리킨다 — 스테이지 상수에서 나온 값을 끼우려고 상태 없는 조각이 `initialState` 에서 글자를 계산해 state 에 둔다 (G14 는 문안 키 · 조건) | 근사 | viscosity · pascals-principle · newtons-law-of-gravitation · magnitude-scale · stellar-luminosity · inverse-square-law · earth-revolution-constellations · star-life-cycle · wave-speed-in-medium · sound-intensity · de-broglie-wavelength · time-dilation · relativity-of-simultaneity · scale-of-universe · nuclear-fission · decay-types · gravitational-redshift · pair-production · relativistic-velocity-addition · light-cone · nuclear-fusion · radiometric-dating · light-clock · chain-reaction · muon-decay-evidence · scanning-tunneling-microscope · parallel-plate-capacitor · coulombs-law · capacitors-in-circuit · motional-emf · ohms-law · dielectric · kirchhoffs-current-law · mass-spectrometer · resistance-and-geometry · field-of-loop-and-solenoid · field-of-dipole · biot-savart-law · charge-in-uniform-field · transformer · emf-and-internal-resistance · electric-field · ac-generation · joule-heating · gausss-law · temperature-and-resistance · power-transmission · iv-characteristic · second-law-of-thermodynamics · thermal-equilibrium · ideal-gas-law · first-law-of-thermodynamics · thermal-radiation · thermal-expansion · specific-heat · stefan-boltzmann-law · boyles-law · pv-diagram · bimetal · calorimetry · charles-law · isothermal-process · radiative-equilibrium · latent-heat · pressure-from-collisions · adiabatic-process · isobaric-isochoric · greenhouse-effect · triple-point · random-walk · insulation · statistical-fluctuation · mean-free-path · law-of-reflection · maxwells-demon · heat-engine · refrigerator-heat-pump · snells-law · rectilinear-propagation · malus-law · single-slit-diffraction · specular-diffuse-reflection · magnification · apparent-depth · diffraction-grating · plane-mirror-image · rayleigh-scattering · optical-fiber · brewster-angle · multiple-mirror-images · lens-combination · resolving-power · birefringence · dispersion · prism · chromatic-aberration · rainbow · magnifying-glass · microscope · telescope |
| G134 | `region.ripple` 물결을 같은 경계의 막 선(`trajectory`)에 걸 수 없고, 한 점에서 번지며 잦아드는 물결을 줄 수 없다 | 근사 | surface-tension |
| G135 | `stream` 이 입자 자리를 「나이 × 지금 속도」 로 매 프레임 다시 센다 — 속도가 바뀌면 이미 떠난 획이 한꺼번에 옮겨 간다 (코드로 확인, 화면에서는 미확인) | 근사 | laplace-pressure · equivalence-principle |
| G136 | `filament` 의 번짐 폭 · 끊는 거리 · 벽 복원 상수가 화면 px 로 고정이라 관 굵기를 따르지 않는다 — 가는 관의 흐트러진 결이 축소가 아니라 빽빽한 구름으로 보인다 | 근사 | reynolds-number |
| G137 | 조각이 준 속도장 u(x, y) 를 따라 알갱이를 흘려 주는 어휘가 없다 — `step` 이 알갱이 수천 개를 적분해 상태에 들거나, 줄마다 누적 시간표를 쌓아 거꾸로 읽는다 (G89 는 정해진 길, `stream` 은 등가속 궤적) | 근사 | drag-in-fluid · boundary-layer |
| G138 | `surface` 의 `arc` 가 선언에만 있고 렌더러가 그리지 않는다 — S-render 「선언에 둔 필드는 렌더러가 구현한다」 위반(메인이 `surface.ts` 에서 확인). G119(`material`)와 같은 부류 | 근사 | manometer |
| G139 | 고정 촬영(`?t=`)이 `filament` · `vortexField` 의 이력을 재현하지 않는다 — 촬영 시각에 새로 생겨 그 순간 성장률의 정상 상태로 그려져 「잦아드는 중」 을 찍을 수 없다 (G130 은 조작기 값) | 근사 | reynolds-number |

rule-guard 사후 검증 묶음마다 잡아 고친 것 — viscosity 점성 비 반올림 표시(스테이지 상수 `viscosityRatio` 로),
floating-and-draft 밀도 `toFixed(2)`(선언값 그대로), venturi-effect 선언 이징(linear)과 physics 코사인 불일치(선언 `smooth`
+ 선언의 이징 이름을 읽는다). 유효숫자 위반이 세 번째라 지시서에 「화면의 수는 선언값 그대로」 를 더했다.
가장 많이 겪은 기존 부족: G110 화살표 꼬리 · G89 흐르는 점 · G28 곡선 (각 5).

## 엔진 결함 수정 · 조각 패치 (2026-09-18)

사용자 결정: 선언만 있고 구현이 없던 `surface` 의 두 필드는 **지우지 않고 구현한다** — 선언 쪽 사용처가 있었고(`material`
46곳) 조각들이 우회하고 있었다(`arc` 를 원한 조각 3곳).

| id | 상태 | 근거 |
|---|---|---|
| G119 | 해결됨 | `renderSurface` 가 `material` 넷을 구현 — solid(기본 · 이전 그림 그대로), smooth(결 없는 면 · solid 와 같은 그림), rough(면 안쪽 결 사선), transparent(옅은 점선 경계, 띠는 그대로). `style` 색 역할도 따른다(선언 없으면 전경색). 쓰는 조각: non-conservative-force 가 거친 띠 `region` 을 지우고 바닥을 `rough` 로 |
| G138 | 해결됨 | `renderSurface` 가 `arc` 를 구현(라디안 · 월드 반시계 + · from→to). 쓰는 조각: angular-acceleration 이 바퀴 테두리를 `surface` 원호로 옮겨 구조물 층에 놓고 `drawOrder: 'scene'` 을 되돌렸다 |
| G120 | 일부 해결 | gyroscopic-precession 의 투영이 거울상이었다 — 가로축 부호를 뒤집어 오른손 투영으로 고쳤다. 어휘가 손잡이를 보장하지 않는 것(3차원 투영 부재, G55)은 남는다 |
| G78 | 일부 해결 | 거친 바닥의 결은 `surface.material: 'rough'` 로 풀렸다(non-conservative-force). `region` hatch 의 방향 · 간격 · 색 고정은 남는다 |

같은 날 inelastic-collision 을 다시 지었다 — energy-in-collision 과 「반발 계수만 다른 세 줄 + 에너지 칸」 화면이 겹쳐,
바닥에 여러 번 튀는 공 하나로 「매번 앞 꼭짓점보다 e² 배 낮게 오른다」 를 보인다. 새 부족 0.
variable-mass-system 은 rocket-equation 과 주장이 겹쳐 주제 목록에서 뺐다(사용자 결정).

## 직접 구현 · 큐 둘째 목표치 (2026-09-18) — 중력과 천체 38개

`_batches/20-direct-gravitation.json`. 동시 5 개 큐, category `astro`. 궤도 · 중력장 · 하늘과 지구 · 별 네 무리를 돌아가며 넣어
형제 조각을 떨어뜨렸다. 38 모두 두 테마에서 주장이 선다(만든 에이전트의 판정). 주장 부족 0. 중력과 천체 분야 44/44.

**새 부족 11, 모두 근사.** 에이전트가 새 부족이라 적은 것 가운데 셋은 기존 id 에 들었다 — particleSystem 월드 크기(G79),
치수선 글자 자리(G103), 비스듬한 면의 부채꼴(G55). 하나는 사실이 아니었다 — 「`BaseMeta.hidden` 을 렌더러가 읽지 않는다」 는
`packages/host/src/scene/preprocessor.ts` 가 거른다(earth-revolution-constellations NOTES 바로잡음).

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G140 | 빛 채널의 「빛 없음」이 다크 바탕과 거의 같아 밤 칸 · 빈 칸 · 그늘 반쪽의 경계가 사라진다 — G92 의 다크 쪽 짝. 윤곽 · 선으로 가른다 | 근사 | earth-rotation-day-night · axial-tilt-seasons · electron-diffraction · simple-circuit · radiation-pressure · seeing-requires-light · rectilinear-propagation · single-slit-diffraction · diffraction-grating · shadow-umbra-penumbra · real-vs-virtual-image · newtons-rings · pinhole-camera · resolving-power · object-color · light-through-materials |
| G141 | 곡선 아래를 파장마다 제 색으로 채우는 「그래프 아래 스펙트럼 채움」이 없다 — 조각이 칸 격자를 매 프레임 계산하고 곡선 위 칸을 NaN 으로 비워 모양을 낸다 (G71 은 고정 모양 영역) | 근사 | star-color-temperature |
| G142 | 칩 없는 월드 앵커 `readout` 에 `clamp` 를 걸면 화면 끝에 붙으며 글자가 작아진다(원인 미확인) — clamp 를 빼고 조각이 글자 x 를 화면 안쪽에 멈춘다. G49 의 「clamp 로 되는지」 에 대한 답 | 근사 | escape-velocity |
| G143 | 스테이지 상수 사이의 관계(`periodRatio` = `radiusRatio`^1.5)를 선언할 자리가 없다 — 저작자가 한쪽만 바꾸면 경고 없이 법칙과 어긋난 그림이 된다 (G129 는 단계 길이 사이) | 근사 | keplers-third-law · stellar-parallax · sound-intensity · wave-attenuation · time-dilation · photoelectric-effect · relativity-of-simultaneity · scale-of-universe · michelson-morley · gravitational-time-dilation · compton-scattering · length-contraction · semiconductor-doping · gravitational-redshift · pair-production · quantum-tunneling · laser-and-stimulated-emission · relativistic-velocity-addition · ionizing-radiation · pn-junction · fermi-level · work-function-and-threshold · nuclear-fusion · relativistic-momentum · relativistic-doppler · photovoltaic-effect · light-clock · muon-decay-evidence · transistor-principle · finite-well · diode-and-led · twin-paradox · scanning-tunneling-microscope · electric-current · lorentz-force · ohms-law · reactance-and-impedance · displacement-current · velocity-selector · generator · charging-methods · mass-spectrometer · self-inductance · magnetic-field-lines · series-rlc-resonance · rl-circuit · electromagnet · resistance-and-geometry · mutual-inductance · kirchhoffs-voltage-law · transformer · emf-and-internal-resistance · ac-generation · potential-divider · temperature-and-resistance · magnetic-dipole · power-transmission · wheatstone-bridge · charge-on-conductor-surface · iv-characteristic · thermistor-and-ldr · thermal-equilibrium · first-law-of-thermodynamics · thermal-expansion · specific-heat · bimetal · calorimetry · radiative-equilibrium · latent-heat · pressure-from-collisions · adiabatic-process · isobaric-isochoric · greenhouse-effect · triple-point · insulation · refrigerator-heat-pump · converging-diverging-lens · rectilinear-propagation · malus-law · magnification · apparent-depth · shadow-umbra-penumbra · rayleigh-scattering · real-vs-virtual-image · newtons-rings · optical-fiber · pinhole-camera · brewster-angle · multiple-mirror-images · lens-combination · resolving-power · birefringence · object-color · concave-mirror · spherical-aberration · human-eye-accommodation · convex-mirror · chromatic-aberration · myopia-hyperopia · rainbow · magnifying-glass · microscope · telescope |
| G144 | `scale` dial 이 눈금 이름표를 수로만 달고 지금 값 글자를 늘 쓰며 270° 판으로 고정이다 — 낱말 눈금 · 값 글자 없는 온 바퀴 판을 `sector` + `lineSet` + `trajectory` + `readout` 으로 조립 (G47 은 linear 축) | 근사 | diurnal-motion · faradays-law · mutual-inductance · potential-divider · wheatstone-bridge · millikan-experiment · thermistor-and-ldr · boyles-law |
| G145 | 두 도형의 겹친 부분만 칠하는 선언(교집합 채움 · 도형으로 자르기)이 없다 — 「원판 중 그림자 원뿔 안에 든 부분」 을 조각이 볼록 다각형 자르기로 계산해 `region` 으로 넘긴다 | 근사 | eclipse · cyclic-process |
| G146 | 원 둘레에 놓인 이름 고리에서 이름표끼리 겹치지 않을 자리를 고르는 배치 규칙이 없다 — 한 이름표를 고리 밖으로 빼고 경계를 늘린다 (G103 은 치수선 글자, G111 은 선 따라 붙는 이름표) | 근사 | earth-revolution-constellations |
| G147 | `surface` 에 선 굵기 · 점선 · 빛 채널이 없다 — 원(arc)은 그려지지만 굵은 테 · 점선 공 윤곽 · 자취 색을 선언할 수 없어 `trajectory` 점 표본으로 긋는다 | 근사 | stellar-nucleosynthesis · circular-orbit · stellar-luminosity · electron-diffraction · light-clock · motor |
| G148 | 캡션 슬롯의 월드 앵커가 글 덩이 세로 가운데에 붙는다 — 판 아래에 위 끝을 맞출 수 없어 가장 긴 문안 기준으로 앵커를 내리고, 짧은 문안은 판에서 떠 보인다 (G24 는 프레이밍 여백) | 근사 | roche-limit |
| G149 | 캔버스 글꼴에서 위 첨자 빼기(`⁻`)가 떨어져 `10⁻²` 가 `10⁻ ²` 로 벌어져 찍힌다 — 음의 거듭제곱 눈금을 `1/100` 으로 써서 한 축에 거듭제곱과 분수가 섞인다 | 근사 | star-life-cycle · scale-of-universe · antimatter · electric-current · millikan-experiment |
| G150 | 캡션 슬롯의 `fade` 를 조각 시계로 센다(`captionAge = u − 단계 시작`) — `timeScale` 이 느린 단계에서는 0.25 초 페이드가 화면 수 초로 늘어나 캡션이 단계 내내 옅다. `fade: 0` 으로 우회해 다른 단계의 전환도 잃는다 | 근사 | supernova-and-neutron-star · equivalence-principle · motor |

rule-guard 사후 검증 여덟 묶음에서 잡아 고친 것 — 이름 없는 선 굵기 · 글자 크기 · 불투명도 · 이름표 띄움 · 램프 배율
(circular-orbit · escape-velocity · axial-tilt-seasons · eclipse · stellar-luminosity · diurnal-motion · keplers-third-law ·
inverse-square-law · gravity-inside-earth · two-body-problem, C2), 모듈 상수에만 있던 물리량(eclipse 반달 수 · stellar-spectral-class
선 모양 · star-life-cycle 태양 온도 · 성운 파장, 원칙 2), 단계 안 시간 창을 상수로 가른 것(black-hole-horizon, S-piece).
C2 유형이 세 번 나오자 지시서에 한 줄을 더했고, 그 뒤에 투입한 조각(사후 6 · 7)에서는 C2 위반이 0 이었다.
사전 검토가 짚은 지시서 빈틈(큰 수 · 지수 표기 · 별빛 색은 `light` + plugin-optics · 시드 난수 · 고정 `boundsHint` ·
투영과 화면 변환의 경계 · 예약 id `caption`)은 투입 전에 지시서에 더했고, 별 무리 8개에는 plugin-optics 의존을 미리 넣었다.
가장 많이 겪은 기존 부족: G24 캡션 자리 · G28 곡선 (각 20), G92 라이트 바탕에 묻히는 빛 · G105 목록 선언 (각 11~12).
메인이 투입 순서에서 elliptical-orbit 을 건너뛰어 스텁으로 남긴 채 완료를 보고했고, 사용자 지적 뒤 만들었다(새 부족 0).
캡션 글자 몇 자가 옅게 찍히는 현상은 여러 조각의 촬영본에서 실제로 보인다(예: elliptical-orbit@13.5 의 「쪽 · 긴 · 퀴」). 원인 미확인.

## 직접 구현 · 큐 셋째 목표치 (2026-09-18) — 파동과 음향 24개

`_batches/21-direct-waves.json`. 동시 5 개 큐, category `waves`. 파동 기본 · 중첩 · 경계와 공명 · 회절 · 소리 · 신호와 지진 무리를
돌아가며 넣어 형제 조각을 떨어뜨렸다. 24 모두 두 테마에서 주장이 선다(만든 에이전트의 판정). 주장 부족 0. 파동과 음향 분야 31/31.
사용자 지시로 세 번 멈췄다 이어 갔고, 끝난 조각만 16 · 5 · 3 으로 나눠 커밋했다(스텁 몫은 공유 파일에서 걸러 index 에만).

**새 부족 4, 모두 근사.** 에이전트가 새 부족이라 적은 것 가운데 하나는 기존 id 에 들었다 — 단계 길이와 스테이지 상수의 관계
(doppler-source-vs-observer → G129). 하나는 rule-guard 경계 사례에서 나왔다 — 가속형 이징(G153).

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G151 | 한 점에서 주기마다 나와 퍼지는 고리 묶음(방출 시각 · 그때의 세기 · 지금 반지름)을 선언할 자리가 없다 — scene 이 방출 목록을 매 프레임 다시 계산하고 고리를 `trajectory` 로 긋는다 (G28 은 원 어휘) | 근사 | sound-source-vibration · doppler-source-vs-observer · wavefront-and-ray · sound-intensity · shock-wave · antenna-radiation |
| G152 | 손 · 망치 같은 도구 모양 어휘가 없다 — 다각형 `region` 과 이름표로 근사 | 근사 | sound-source-vibration |
| G153 | `TimelineEase` 에 가속형(ease-in) · 감속형(ease-out)이 없다 — 끝에서 가장 빠른 망치 휘두름을 단계 진행도의 제곱으로 scene 이 계산해, S-piece 「이징은 timeline 에」 를 지킬 자리가 없다 (rule-guard 사후 1 경계 사례) | 근사 | sound-source-vibration |
| G154 | 원 묶음의 포락선(모든 원에 접하는 선)을 선언할 자리가 없다 — 마하 원뿔 선의 방향 · 길이와 접점을 physics 가 기하로 계산해 선 둘로 넘긴다 (G151 은 고리 묶음 자체) | 근사 | shock-wave |

rule-guard 사후 검증 다섯 묶음에서 잡아 고친 것 — 모듈 상수에만 있던 물리량 · 화면 데이터(digital-vs-analog-signal 톤 · 비트,
wave-energy 줄 길이, wave-vs-particle-transport 줄 끝 · 출발 자리, sound-through-materials 물질별 흩뿌림 폭, 원칙 2), 단계 안을 코드
상수로 가른 것(impedance-mismatch 점선 윤곽 · sound-through-materials 망치 물러남, S-piece). 조각에서 고칠 수 없는 둘은 부족으로 적었다 — 망치 가속 이징(sound-source-vibration, G153), 선언 ease 를 읽지 못하는
가속 구간(shock-wave, G59). 사전 검토가 짚은 지시서 빈틈(파동 물리량 constants · 이웃 interference · standing-wave 의 모듈 상수를
따라 하지 않음 · 잡음 시드 · dB 정박값 · 뒤집힘은 모양 · 소리 재생 금지)은 투입 전에 지시서에 더했다.
가장 많이 겪은 기존 부족: G13 단계 길이가 상수를 따라가지 않음 (17), G28 곡선 (15), G129 단계 길이 사이 관계 (10), G24 캡션 자리 (9).
메인이 스캐폴드 뒤 `catalog:topics` 를 빠뜨려 첫 다섯의 촬영이 막혔다 — PROCESS.md 에 시점을 적었다.
캡션 글자 몇 자가 옅게 찍히는 현상은 이 목표치 대부분의 촬영본에서도 에이전트들이 보고했다. 원인 미확인.

## 직접 구현 · 큐 넷째 목표치 (2026-09-18) — 현대물리 61개

`_batches/22-direct-modern.json`. 동시 5 개 큐, category `modern`. 특수상대론 · 일반상대론 · 빛의 양자 · 양자역학 · 원자 · 핵 ·
고체 · 규모 무리를 돌아가며 넣고 기초 형제를 먼저 넣었다. 61 모두 두 테마에서 주장이 선다(만든 에이전트의 판정). 주장 부족 0.
현대물리 분야 66/66. 빛의 색이 주장인 12 조각 스텁에는 plugin-optics 의존을 미리 넣었다.

**새 부족 22(G155~G176), 모두 근사.** 에이전트가 새 부족이라 적은 것 가운데 여럿은 기존 id 에 들었다 — 묶음 회전(G118),
지난 시각의 진행도(G59), 자라는 곡선(G131), 알갱이마다 다른 시각 · 되풀이 단계(G13), 3 차원 투영 · 원뿔(G55), rect 윤곽 굵기(G03),
멈춤 단계(G117), 점선 호(G147), 고정 경계가 상수를 따라가지 않음(G143). 조각의 모양 · 배치 계산은 부족으로 올리지 않았다
(갈라지는 물방울 모양, 직각 표시, 단계 진행도 보간).

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G155 | 시계 문자판(눈금 · 바늘 · 째깍) 어휘가 없다 — 원 · 선 조합으로 짓고 바늘 끝을 scene 이 계산한다. `scale` dial 은 각도자로 읽혀 쓰지 못한다 (G144 는 dial 의 눈금 이름표) | 근사 | time-dilation · gravitational-time-dilation |
| G156 | 파동 묶음(포락선 × 반송파, 날아가는 물결 한 덩이) 어휘가 없다 — physics 가 물결을 표본해 `lineSet` 으로 넘긴다 (G28 은 곡선 일반) | 근사 | bohr-model · compton-scattering · decay-types · gravitational-redshift · pair-production · quantum-tunneling · laser-and-stimulated-emission · ionizing-radiation · antimatter · photovoltaic-effect · diode-and-led · radiation-pressure · thermal-radiation |
| G157 | 한 인스턴스가 두 자리 사이를 교차 페이드로 옮겨 가는 것(사라지며 나타남)을 말할 수 없다 — 도약 동안 전자를 `body` 둘로 나눠 불투명도를 엇갈린다 | 근사 | bohr-model · light-bending-by-gravity · rutherford-scattering · semiconductor-doping · laser-and-stimulated-emission · pauli-exclusion · spin |
| G158 | 준위 × 칸 격자의 차 있음 · 빔을 선언하는 점 묶음이 없다 — 양공이 한 칸 건너갈 때마다 전자와 빈자리의 자리 · 짙기를 scene 이 칸마다 계산한다 | 근사 | band-theory · semiconductor-doping · pauli-exclusion · fermi-level |
| G159 | `particleSystem` 에 속 빈 점(고리 모양 알갱이)이 없다 — 양공을 `body` 로 하나씩 선언한다 | 근사 | band-theory · stern-gerlach · semiconductor-doping · laser-and-stimulated-emission · pn-junction · photovoltaic-effect · diode-and-led · temperature-and-resistance |
| G160 | `body` custom 경로에 배율(scale) 필드가 없다 — 크기가 바뀌는 윤곽(사람 실루엣)을 매 프레임 SVG 경로 문자열로 다시 만든다 | 근사 | scale-of-universe · magnet-attraction |
| G161 | 사건이 끝날 때마다 칸이 하나씩 자라는 도수 더미(히스토그램 쌓기) 어휘가 없다 — scene 이 매 프레임 사건 끝 시각을 다시 계산 · 정렬해 더미 자리를 만든다 (G84 는 월드 막대 배치) | 근사 | rutherford-scattering · wave-function · spin · electric-current · kirchhoffs-current-law · millikan-experiment · isothermal-process · pressure-from-collisions · maxwells-demon · heat-engine |
| G162 | 흐르는 알갱이가 가로막는 것(벽 · 판)에 닿으면 멈추거나 흡수되는 흐름을 선언할 자리가 없다 — 알갱이마다 닿는 시각 · 멈춤 깊이를 scene 이 계산한다 | 근사 | decay-types · antimatter · pn-junction · photovoltaic-effect · velocity-selector · thermal-radiation · albedo · rectilinear-propagation · shadow-umbra-penumbra · pinhole-camera |
| G163 | 결정 격자 어휘(원자 · 결합선 · 결합 전자 · 밖으로 내민 결합 · 원 안의 원소 기호)가 없다 — 원자와 기호를 인스턴스마다 조립한다 | 근사 | semiconductor-doping · scanning-tunneling-microscope |
| G164 | 두 그림(격자 · 띠 그림) 사이에서 같은 사건의 짝을 선언할 자리가 없다 — 전자가 풀려나는 것과 띠에서 오르는 것의 대응이 코드에만 있다 | 근사 | semiconductor-doping |
| G165 | `particleSystem` 에서 겹친 점이 짙어지지 않는다(누적 · 밀도 합성 없음) — 몇 배 더 몰려도 덩이의 짙기가 같아, 「많이 몰렸다」 는 다른 판의 곡선 높이가 대신 말한다 | 근사 | bose-einstein-condensate |
| G166 | 로그 눈금 축 어휘가 없다(graph 의 `scale: log` 는 삭제됨) — 값 → 자리 로그 사상 · 자릿수 눈금 · 문안 키 이름표를 physics · scene 이 계산해 축이 여러 선언으로 흩어진다 (G47 은 선형 축) | 근사 | ionizing-radiation |
| G167 | `trace` 의 `strength` 가 반지름과 짙기에 함께 걸린다 — 크기는 그대로 옅어지는 고리를 선언할 수 없어, 짝이 되는 점도 옅어질 때 함께 작아지게 맞춘다 | 근사 | pn-junction · photovoltaic-effect · diode-and-led |
| G168 | 고정 전하 기호(`+` · `−`) 묶음 어휘가 없다 — 이온 수십 개를 `lineSet` 획으로 긋고, 가려짐 · 드러남을 두 벌 겹쳐 엇갈린다 | 근사 | pn-junction · parallel-plate-capacitor · capacitors-in-circuit · motional-emf · displacement-current · energy-in-capacitor · dielectric · charging-methods · potential-vs-field · electrostatic-shielding · charge-on-conductor-surface |
| G169 | `vector.label` 이 축의 40 % 자리에 고정이라 도는 화살표 끝을 따라가는 이름표 자리가 없다 — 두 화살표가 가까워지면 이름이 겹쳐, 끝 너머에 `readout` 을 따로 두고 방향에 따라 정렬을 scene 이 고른다 | 근사 | superposition-quantum · lorentz-force · force-on-current-wire · generator · superposition-of-forces · force-between-wires · malus-law |
| G170 | 확대 창(돋보기 · 인셋) 어휘가 없다 — 창 테두리와 이음선을 `lineSet` 으로 긋고 두 번째 축척을 scene 이 계산한다 (G10 은 판 좌표 평행 이동) | 근사 | fermi-level · nuclear-fusion · force-on-current-wire · brownian-motion · single-slit-diffraction |
| G171 | 표(격자) 칸 묶음 어휘가 없다 — 칸마다 `body` 하나와 `readout` 둘을 따로 선언한다(주기율표 108개). 배율이 바뀌면 칸 안 글자 여백이 달라진다 (G158 은 차 있음을 보이는 점 격자) | 근사 | electron-configuration |
| G172 | 점마다 태어난 시각 · 수명을 주면 저절로 옅어지는 잔광 점 묶음이 없다 — scene 이 매 프레임 잔광 시간 안의 도착 번호를 다시 뽑고 점마다 불투명도를 계산한다 (`trace` 는 한 점의 자취) | 근사 | electron-diffraction · insulation |
| G173 | 두 점 사이 선에 모양 종류(물결 · 고리 감김 · 용수철)를 거는 어휘가 없다 — 파인만 도형의 광자선 · 글루온선을 사인 · 고리 곡선으로 표본해 `lineSet` 으로 넘긴다 (G156 은 날아가는 물결 한 덩이, G68 은 점선) | 근사 | exchange-particles · thermal-radiation · greenhouse-effect |
| G174 | `region` 둘레 전체를 긋는(윤곽 선) 선언이 없다 — 다각형 둘레를 `lineSet` 변 인덱스 쌍으로 하나하나 나열한다 | 근사 | meissner-effect · displacement-current · electrostatic-shielding · apparent-depth |
| G175 | 세계선(꺾은 경로) 위에 제 시간 간격으로 찍는 고유 시간 눈금 어휘가 없다 — 꺾인 선을 따라 점 자리를 조각이 직접 계산한다 | 근사 | twin-paradox |
| G176 | 방출률이 시각에 따라 바뀌는 점 흐름이 없다 — `stream` 은 방출률이 하나뿐이라 scene 이 누적 방출 표를 매 프레임 다시 쌓는다 | 근사 | scanning-tunneling-microscope · thermal-equilibrium · specific-heat · calorimetry · insulation · heat-engine · scattering |

rule-guard 사후 검증 열두 묶음에서 잡아 고친 것 — 단계 안을 코드 비율 · 초 · smoothstep · 문턱 · 개수로 가른 것(band-theory ·
scale-of-universe · michelson-morley · blackbody-radiation · light-cone · electron-configuration, S-piece), 캡션이 지금 화면과 어긋난 것
(wave-function 무작위 · relativistic-velocity-addition · ionizing-radiation · light-cone · relativistic-momentum · work-function-and-threshold ·
nuclear-fusion · photovoltaic-effect · chain-reaction, S-piece), 캡션 · 치수선에 선언값을 박은 것(time-dilation · light-clock ·
de-broglie-wavelength · gravitational-redshift · quantum-tunneling · scanning-tunneling-microscope — G133 우회로(state + caption.vars)로 끼움,
원칙 2), 모듈 상수에만 있던 배율(scale-of-universe, 원칙 2), 즉석 배율(photoelectric-effect · light-bending-by-gravity, C2).
같은 유형이 세 번 나올 때마다 지시서에 한 줄을 더했다(단계 안 코드 분할 · 캡션). 사전 검토가 짚은 빈틈(현대물리 물리량 constants ·
단위 값 문안 · 측정 결과 (seed, 주기) · 표식으로 가름 · 과장 배율 선언 · 목록형 · 가시광 밖 색)은 투입 전에 더했다.
사용자 판정으로 남긴 것: `tl.span` 으로 여러 단계에 걸친 이징을 코드가 고르는 형태, trace 수명 초, 표시 잡음 폭 모듈 상수,
캡션이 두 상수의 비를 말하는 것(transistor-principle · wien-displacement-law · chain-reaction).
가장 많이 겪은 기존 부족: G24 캡션 자리 (37), G143 상수 사이 관계 (29), G28 곡선 (25), G129 단계 길이 관계 (22), G13 (21), G105 목록 (20).
캡션 글자 몇 자가 옅게 찍히는 현상은 이 목표치 거의 모든 촬영본에서 에이전트들이 보고했다. 원인 미확인.

## 직접 구현 · 큐 다섯째 목표치 (2026-09-19) — 전자기 69개

`_batches/23-direct-em.json`. 동시 5 개 큐, category `em`. 정전기 · 축전기 · 직류 회로 · 자기 · 자기력 · 유도 · 교류 · 전자기파
무리를 돌아가며 넣고 기초 형제를 먼저 넣었다. 회로 7 조각 스텁에는 plugin-circuit, 자기장 8 조각에는 plugin-em 의존을 미리 넣었다.

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G177 | `body` 가운데에 글자(전하 부호 · 극 표식)를 새길 자리가 없다 — `label` 은 물체 아래로 내려가, 같은 자리에 `readout` 을 겹쳐 둔다. 공과 표식이 따로 인스턴스라 에디터에서 공만 옮기면 표식이 남는다 (G163 은 결정 격자 원자의 기호) | 근사 | electric-charge · coulombs-law · magnetic-poles · force-on-current-wire · magnet-attraction · generator · charging-methods · uniform-field · motor · superposition-of-forces · field-of-dipole · charge-in-uniform-field · ac-generation · eddy-current · magnetic-materials · electrostatic-shielding · birefringence |
| G178 | plugin-circuit `circuitElement` battery · capacitor 는 리드선 끝과 기호 사이가 약 20 px 비어 도선에 이으면 회로가 끊긴 것처럼 보인다 — 전지를 `lineSet` 획으로 대신 긋는다 (G90 은 코어에 회로 기호가 없는 것) | 근사 | parallel-plate-capacitor · capacitors-in-circuit · ohms-law · simple-circuit · poynting-vector · kirchhoffs-current-law · self-inductance · rl-circuit · resistance-and-geometry · kirchhoffs-voltage-law · emf-and-internal-resistance · joule-heating · potential-divider · temperature-and-resistance · wheatstone-bridge |
| G179 | 선 하나를 따라 짙기 · 빛 색이 바뀌는 선(선 그라데이션)이 없다 — 고리를 조각으로 잘라 조각마다 불투명도를 주고(선 수백 개), 8단계 반올림(G53)으로 빈 쐐기가 계산보다 넓어진다 (G31 은 채움 그라데이션) | 근사 | antenna-radiation · rayleigh-scattering |
| G180 | 코일(감은 도선 · 솔레노이드) 어휘가 없고 나선의 앞 · 뒤 가닥 깊이 순서를 선언할 수 없다 — 나선을 점으로 찍고, 장선이 코일을 꿰는 것을 장선을 코일 아래에 깔아 근사한다 (G121 은 3차원 선의 깊이별 가름 일반) | 근사 | lc-oscillation · faradays-law · electromagnet · field-of-loop-and-solenoid · mutual-inductance · transformer · energy-in-inductor |
| G181 | `particleSystem` 꼬리가 속도 방향의 곧은 선이라 꺾이는 길(도선 모서리 · 저항 지그재그)에서 길 밖으로 삐진다 — 알갱이마다 호길이 구간을 잘라 `lineSet` 으로 길을 따라 긋는다 (G89 는 길을 따라 흐르는 점 묶음, G40 은 꼬리 계수) | 근사 | ohms-law · simple-circuit · kirchhoffs-current-law · second-law-of-thermodynamics · first-law-of-thermodynamics · maxwells-demon |
| G182 | 화면 안팎 방향 표식(⊗ · ⊙ — 자기장 · 전류가 종이 안 · 밖) 어휘가 없다 — 고리 표본 + 가위표 획 · 점으로 조각마다 조립한다 | 근사 | force-on-current-wire · motional-emf · charged-particle-in-magnetic-field · electromagnetic-wave · velocity-selector · generator · poynting-vector · mass-spectrometer · motor · field-of-loop-and-solenoid · loudspeaker-and-microphone · amperes-law · force-between-wires · magnetic-dipole · brewster-angle · birefringence |
| G183 | 자석(막대 · 말굽) 어휘가 없다 — rect · ㄷ 자 `region` 에 극 글자를 따로 얹어, 에디터로 자석을 옮기면 극 글자 · 자기장 화살표가 따라오지 않는다 | 근사 | force-on-current-wire · magnetic-field · magnetic-poles · magnet-attraction · generator · magnetic-field-lines · electromagnet · motor · loudspeaker-and-microphone · ac-generation · magnetic-dipole · magnetic-materials |
| G184 | plugin-circuit `circuitElement` lamp 에 켜짐 · 밝기 상태가 없다 — 빛 원(`light`) · 빛살을 따로 선언해, 에디터로 전구만 옮기면 빛이 남는다 | 근사 | simple-circuit · generator |
| G185 | 스위치 · 도선이 열리고 닫히는 도중을 선언할 수 없다 — `circuitElement` switch 는 열림 · 닫힘 두 모습(30° 고정)뿐이라 토막 회전을 조각이 계산한다 (G90 은 코어에 회로 기호 · 2위치 스위치가 없는 것) | 근사 | simple-circuit · generator · charging-methods · self-inductance · electromagnet · rl-circuit |
| G186 | plugin-circuit `circuitElement` 크기가 월드 길이 2 로 고정이라 소자(전구) 크기를 고를 수 없다 | 근사 | generator · self-inductance · rl-circuit |
| G187 | 쌍극자(양 끝에 + · − 가 붙어 함께 도는 짝) 어휘가 없다 — 몸통과 부호를 따로 선언하고 부호 자리를 조각이 각도로 계산해, 에디터로 몸통만 옮기면 부호가 남는다 (G177 은 물체 가운데 글자) | 근사 | dielectric |
| G188 | 「이 영역에 이 세기 · 방향의 고른 장」 을 선언할 자리가 없다 — 화살표 · ⊗ 격자를 조각이 늘어놓고 자리가 판 간격 기본값에 묶인다 (G182 는 ⊗ · ⊙ 표식 하나) | 근사 | velocity-selector · dielectric · mass-spectrometer · uniform-field · force-between-wires · electrostatic-shielding |
| G189 | 스테이지 상수에서 한 번만 계산하는 무거운 배치(장 풀이 · 흐름선, 약 80 ms)를 둘 자리가 없다 — 매 프레임 풀 수 없어 `initialState` 가 state 에 담아 둔다 (G76 은 preroll 일부 적분, G133 은 캡션 글자) | 근사 | poynting-vector · uniform-field · field-of-loop-and-solenoid · field-of-dipole · magnetic-dipole · charge-on-conductor-surface |
| G190 | 글자(`e⁻`)를 새긴 움직이는 알갱이 묶음이 없다 — 알갱이마다 `readout` 하나(한 프레임 약 30개)를 선언한다 (G168 은 고정 기호 묶음) | 근사 | charging-methods · charge-on-conductor-surface |
| G191 | plugin-circuit `terminal` junction 점이 3 px 고정이라 주인공인 마디를 키울 수 없다 | 근사 | kirchhoffs-current-law |
| G192 | plugin-circuit `circuitElement` 에 `highlight` · `opacity` 가 없어(렌더러가 따르지 않음) 값이 바뀐 소자를 짚을 수 없다 — 캡션이 대신 말한다 | 근사 | kirchhoffs-current-law |
| G193 | `TimelineFrame` 에 단계 목록(id · 시작 · 길이)이 없다 — 단계를 차례로 훑어야 하는 physics 가 모듈 schema 의 timeline 을 직접 읽어, 스테이지에서 바꾼 시간표를 따라가지 못한다 (G59 는 다른 시각의 진행도) | 근사 | kirchhoffs-current-law · maxwells-equations · kirchhoffs-voltage-law · ideal-gas-law · boyles-law · isothermal-process · adiabatic-process · heat-engine |
| G194 | 불꽃 · 방전 어휘가 없다 — 지그재그와 빛살 `lineSet` 을 조각이 계산한다 | 근사 | self-inductance |
| G195 | 스칼라 장의 등고선을 순서 있는 닫힌 곡선으로 뽑아 주는 어휘가 없다 — 선마다 방향 · 길이가 필요해 조각이 선을 직접 따라가 닫는다 (G66 은 흩어진 선분 조각) | 근사 | magnetic-field-lines |
| G196 | `particleSystem` 안의 알갱이 하나를 짚는(표시 · 강조) 선언이 없다 — 표시할 알갱이를 코드가 번호로 골라, 에디터가 표시 대상을 편집할 수 없다 (G32 는 입자마다 색) | 근사 | drift-velocity |
| G197 | 합이 일정한 두 몫을 쌓은 막대(누적 막대) 어휘가 없다 — `region` 둘 · 경계선 · 표식을 조각이 계산한다 (G84 는 월드 막대 배치) | 근사 | rl-circuit · amperes-law · greenhouse-effect · refrigerator-heat-pump · lens-combination · microscope |
| G198 | 코일 · 전류 고리가 만드는 자기력선 어휘가 없다 — 선마다 초타원을 손으로 맞춰 「이웃 코일을 꿰는 선 / 안 꿰는 선」 을 배치로 가른다. 에디터로 코일을 옮겨도 선이 따라오지 않는다 (G195 는 등고선 추출, G180 은 코일 모양) | 근사 | mutual-inductance · energy-in-inductor |
| G199 | plugin-circuit `circuitElement` 값 글자가 소자 가운데에서 화면 아래 14 px 로 고정이고 자리 · 크기를 고를 필드가 없다 (계산값을 넣을 수 없는 소자는 `readout` 으로 달아 값 글자가 두 모양으로 갈린다) — 세로 소자에서는 지그재그 위에 겹쳐, 저항을 가로 변에만 둔다 | 근사 | kirchhoffs-voltage-law · wheatstone-bridge |
| G200 | 곡선 위 사건(0 · 마루)에 작은 도식을 달아 두는 표지줄 어휘가 없다 — 선 · 표지 · 점선 세 인스턴스를 사분 시각마다 조립한다 (G112 는 지시선 하나) | 근사 | ac-generation |
| G201 | 두 끝이 묶이거나 한 끝이 물려 휘는 줄 · 띠(도선 · 두 겹 띠) 어휘가 없다 — 받침과 휜 선을 따로 선언하고 휨 모양을 scene 이 표본해, 에디터로 받침을 옮기면 도선이 따라오지 않는다 | 근사 | force-between-wires · bimetal |
| G202 | 열운동(격자 원자의 제자리 떨림, 폭이 온도를 따름) 어휘가 없다 — 원자마다 시드로 정한 사인 떨림을 scene 이 계산해 `particleSystem` 에 넘긴다 | 근사 | joule-heating · drift-velocity · temperature-and-resistance |
| G203 | 월드에 놓이는 x–y 선 그래프(공간 그림과 축을 나눠 씀)가 없다 — `graph` 는 화면 카드이고 눈금 수를 스스로 써서, 축 · 곡선 · 지금 점 · 판 자르기를 scene 이 `trajectory` 로 조립한다 (G131 은 시간창 이력, G84 는 월드 막대, G47 은 축) | 근사 | field-of-charged-sphere · field-of-dipole · potential-vs-field · second-law-of-thermodynamics · thermal-equilibrium · boyles-law · pv-diagram · charles-law · isothermal-process · radiative-equilibrium · latent-heat · adiabatic-process · isobaric-isochoric · greenhouse-effect · cyclic-process · insulation · statistical-fluctuation · malus-law · brewster-angle |
| G204 | plugin-circuit `circuitElement` 에 가변저항(미끄럼 접점) · 검류계 · 다이오드 · 써미스터 · LDR 소자가 없고, 전압계 · 전류계 기호에 바늘 · 읽음이 없다 — 저항선 · 접점 · 이름표를 따로 긋고 계기는 `scale` dial(G144)로 대신한다 | 근사 | potential-divider · wheatstone-bridge · thermistor-and-ldr |
| G205 | 판 안의 배율(축소 · 확대)을 선언할 수 없다 — 도형마다 좌표를 조각이 곱해 줄이고, 배율을 따르면 안 되는 표식(⊙ · ⊗ · N · S · 꺾쇠)을 하나씩 가른다 (G10 은 판 좌표 평행 이동, G170 은 확대 창) | 근사 | magnetic-dipole |
| G206 | 설비 아이콘(발전소 · 마을 · 집) 어휘가 없다 — SVG 경로를 코드 상수로 손수 적어 `body` custom 으로 둔다 | 근사 | power-transmission · seeing-requires-light · apparent-depth · plane-mirror-image · multiple-mirror-images |

69 모두 두 테마에서 주장이 선다(만든 에이전트의 판정). 주장 부족 0. 전자기 분야 77/77. 기존 **주장** 행 G120(3 차원 투영의 손잡이)을
lorentz-force · poynting-vector · biot-savart-law 가 겪었고, 셋 모두 오른손 투영을 수식과 화면으로 확인했다.

**새 부족 30(G177~G206), 모두 근사.** plugin-circuit 쪽이 여덟(G178 리드 틈 · G184 전구 켜짐 · G185 스위치 도중 · G186 소자 크기 ·
G191 마디 점 · G192 흐림 · G199 값 글자 자리 · G204 가변저항 · 검류계 · 계기 바늘)으로 가장 많다 — 회로 조각은 소자를 선언하고도
전지 · 전구 · 계기를 선으로 다시 긋는 일이 잦았다. 전자기 표기 어휘(G177 물체 가운데 부호 · G182 ⊗ ⊙ · G183 자석 · G187 쌍극자 ·
G188 고른 장 영역 · G190 글자 새긴 알갱이)와 판 · 그래프 어휘(G197 누적 막대 · G200 곡선 위 표지줄 · G203 월드 x–y 그래프 · G205
판 안 배율)가 뒤를 잇는다. 에이전트가 새 부족이라 적은 것 가운데 여럿은 기존 id 에 들었다 — 월드 선 그래프 · 곡선 앞부분만 긋기(G131),
파동 원천 포락선(G156), 캡션 fade 와 timeScale(G150), 벽에 닿아 멈춤(G162), 윗첨자 빼기 글꼴(G149). 조각의 모양 · 배치 계산은 올리지
않았다(직각 표지, 정류자 · 슬립 링 도식, 닫힌 모양의 둘레 길이 · 법선).

rule-guard 사후 검증 열네 묶음에서 잡아 고친 것 — 캡션 · 이름표에 박힌 선언값(parallel-plate-capacitor · lorentz-force ·
mass-spectrometer 질량수 · electromagnet 전지 수 · magnet-attraction 물건 목록, 원칙 2 — G133 우회로), 다음 단계 일을 앞 단계
캡션에 건 것(lorentz-force · charging-methods · electromagnet · rl-circuit · kirchhoffs-voltage-law, 스위치 · 나타남 단계), 캡션에
법칙을 일반 진술로 쓴 것(coulombs-law · gausss-law · potential-divider · field-of-charged-sphere · energy-in-inductor · magnetic-dipole ·
potential-vs-field · iv-characteristic), 단계 안을 코드로 가른 것(electric-current 문 닫힘 · loudspeaker-and-microphone 램프 ·
self-inductance 불꽃 단계 길이), 같은 물리량을 다른 색으로 그린 것(series-rlc-resonance), 알갱이 정체 표식 없음(power-transmission).
같은 유형이 세 번 나올 때마다 지시서에 한 줄을 더했다(캡션 선언값 state + vars · 스위치 단계 캡션 · 법칙 일반 진술 · 파일 생성 전
보고). 사전 검토가 짚은 빈틈(전자기 물리량 · 표시 배율 constants, plugin 순수 계산만 import, `circuitElement.value` 가 화면 글자,
수를 스스로 띄우는 어휘, 단위 값 문안, 부호 · 극 표식, 캡션 식 금지)은 투입 전에 더했고, 투입 문구의 물리 오류 하나(차폐 유도 전하
방향)를 바로잡았다.
가장 많이 겪은 기존 부족: G105 목록 (39), G13 단계 길이 (32), G143 상수 사이 관계 (28), G28 곡선 (25), G24 캡션 자리 (24), G90 회로 기호 (24), G133 (22).
캡션 글자 몇 자가 옅게 찍히는 현상은 이번에도 거의 모든 촬영본에서 보고됐다. 두 에이전트가 따로 「특정 음절(몫 · 옮 · 쌓 · 쇠 · 늄 · 껑)만
다른 글꼴로 찍힌다」 고 적었고, millikan-experiment 는 `readout` text 글꼴의 윗첨자 `⁻` 가 대체 글꼴로 떨어지는 것을 보았다 — 캔버스
글꼴에 없는 글리프가 대체 글꼴로 그려진다는 가설. 확인하지 않았다.

## 직접 구현 · 큐 여섯째 목표치 (2026-09-19) — 열과 통계 33개

`_batches/24-direct-thermal.json`. 동시 5 개 큐, category `thermal`. 열과 온도 · 복사 · 기체 · 과정 · 통계 · 팽창 무리를 돌아가며
넣고 기초 형제를 먼저 넣었다. 광학 목표치(일곱째)와 한 큐로 잇는다.

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G207 | 붙든 양(고정한 변수)을 알리는 자물쇠 표식 어휘가 없다 — SVG 경로를 코드에 적어 `body` custom 으로 막대 위에 얹는다 (G206 은 설비 아이콘) | 근사 | ideal-gas-law |
| G208 | 피스톤 실린더(벽 · 피스톤 · 기체 기둥 · 가두는 clip) 장치 어휘가 없다 — `surface` · `region` · `body` · `particleSystem` 다섯 인스턴스를 같은 좌표로 맞춰 조립해, 피스톤을 옮기면 기둥 · clip 을 따로 고쳐야 한다 | 근사 | ideal-gas-law · first-law-of-thermodynamics · boyles-law · pv-diagram · charles-law · isothermal-process · adiabatic-process · isobaric-isochoric |
| G209 | 두 도형의 넓이가 같음(또는 비)을 보이는 어휘가 없다 — 앞 멈춤의 직사각형을 점선으로 남겨 겹쳐 두고 눈으로 견주게 한다 | 근사 | boyles-law |
| G210 | 그래프 계열을 가르는 점 표식 모양(원 · 네모 · 세모 · 마름모) 어휘가 `body` 에 없다 — 세모는 SVG 경로를 코드에 적어 `body` custom 으로 그린다 (G43 은 `particleSystem` 점 모양, 해결됨) | 근사 | charles-law |
| G211 | `initialState` 가 시간표(단계 자리 · 길이)를 받지 않는다 — 단계 자리에 기대는 시드 경로(특정 단계에 튐을 맞춘 한 주기)를 미리 계산해 둘 수 없어 `scene` 이 매 프레임 한 주기를 다시 계산한다 (G189 는 스테이지 상수만으로 되는 무거운 배치) | 근사 | brownian-motion · mean-free-path |
| G212 | `clip` 이 사각형뿐이다 — 둥근 현미경 시야 · 원형 창으로 자를 수 없어 사각 창으로 둔다 (G145 는 교집합 채움) | 근사 | brownian-motion |
| G213 | 시간표에 「앞 구간을 거꾸로 되짚는 단계」(역재생)를 선언할 자리가 없다 — 정방향 · 거꾸로 단계의 짝과 필름 시각 식을 scene 코드가 잇는다 | 근사 | entropy-and-irreversibility |
| G214 | 알갱이 자리 목록을 구간 도수 막대(지금 순간의 히스토그램)로 바꾸는 어휘가 없다 — scene 이 매 프레임 알갱이 수백 개를 세어 막대 `region` 을 다시 선언한다 (G161 은 사건이 쌓이는 더미, `graph` bar 는 수를 스스로 띄운다) | 근사 | diffusion |
| G215 | 선 모양(실선 · 파선 · 점선)으로 가른 곡선의 머리에 「그 선 모양 견본 + 이름」 표지를 붙이는 선언이 없다 — 토막 `trajectory` 와 `readout` 을 따로 두고 scene 이 곡선 머리에 자리를 맞춘다 | 근사 | statistical-fluctuation |
| G216 | 주기 경계(감싸는 상자 — 한쪽 벽으로 나간 것이 맞은편으로 들어옴) 선언이 없다 — 선을 경계에서 자르고 맞은편 사본을 두는 일을 조각이 한다 (G38 은 각도 감기) | 근사 | mean-free-path |
| G220 | 물리가 정한 사건 시각마다 걸리는 짧은 연출 구간(문 여닫힘 · 방금 적은 줄 강조)을 선언할 자리가 없다 — 구간 길이를 스테이지 상수로 두고 physics 가 사건 목록에서 지금 모양을 계산한다 (G172 는 점마다 수명, 시간표 단계는 사건 수만큼 둘 수 없다) | 근사 | maxwells-demon |
| G221 | 흐름 띠(굵기가 양인 화살 띠 — 화살 끝 · 제비꼬리 홈 · 넓은 화살촉) 어휘가 없다 — 띠 윤곽 다각형을 physics 가 계산해 `region` 으로 넘긴다 (G197 은 합류 막대, G28 은 곡선 일반) | 근사 | refrigerator-heat-pump |


33 모두 두 테마에서 주장이 선다(만든 에이전트의 판정). 주장 부족 0. 열과 통계 분야 39/39.

**새 부족 12(G207~G216 · G220 · G221), 모두 근사.** 기체 · 과정 조각이 같은 장치를 되풀이해 지었다 — 피스톤 실린더(G208)를
여덟 조각이 조립했고, 붙든 양 자물쇠(G207) · 넓이 같음(G209) · 계열 점 모양(G210) · 선 모양 견본(G215)이 그래프 쪽에서 나왔다.
통계 조각에서는 시간표를 모르는 `initialState`(G211) · 둥근 clip(G212) · 역재생 단계(G213) · 지금 순간 히스토그램(G214) ·
주기 경계(G216)가, 사건마다 걸리는 짧은 연출(G220) · 흐름 띠(G221)가 나왔다. 에이전트가 새 부족이라 적은 것 가운데 여럿은
기존 id 에 들었다 — 온도계 조립(G84), 경로를 따라가는 점(G89), 개수 더미 · 세는 눈금(G161), 끝에서 옅어지는 알갱이(G172),
괄호(G19 · G127), 넓이 빼기(G145), 스테이지별 칸 이름(G14), 단계 길이와 상수의 관계(G13 · G143). 조각의 물리 계산(비율 분배,
원 사이 튕김 경로)은 올리지 않았다.

rule-guard 사후 검증 여섯 묶음(열 전용)에서 잡아 고친 것 — 계산값을 화면 수로 띄움(thermal-equilibrium 만난 온도 ·
thermal-expansion 틈 · 늘음 · refrigerator-heat-pump 부엌 열, 정수로 딱 떨어져도 계산값 — 정박값 상수로), 이름표 띄움 즉석
배율(calorimetry · triple-point · cyclic-process `LABEL_GAP / 2` 류), 스테이지 이름에 박은 배수(mean-free-path), 짧은 전환 단계에
다음 단계 캡션(refrigerator-heat-pump seep), 법칙 인과 진술(heat-engine), 무작위 결과 캡션이 모든 주기에서 보장되지 않음
(brownian-motion — 거절 뽑기를 구성으로 바꿈). 세 번 나온 유형마다 지시서에 한 줄을 더했다(정수 계산값도 계산값 · 즉석 띄움 배율 ·
짧은 전환 단계 캡션). 투입 문구의 물리 오류 하나(pv-diagram 「추 높이 = 일」, 두 길의 ΔV 가 같다)를 에이전트가 바로잡았다.
가장 많이 겪은 기존 부족: G133 (28), G84 월드 막대 (19), G143 (15), G203 월드 그래프 (14), G47 축 (13), G105 (11).

## 직접 구현 · 큐 일곱째 목표치 (2026-09-19) — 광학 39개

`_batches/25-direct-optics.json`. 열과 통계 뒤에 같은 큐로 잇는다, category `optics`. 직진 · 반사 · 굴절 · 렌즈 · 파동광학 ·
편광과 산란 무리를 돌아가며 넣었다. 39 조각 스텁 모두에 plugin-optics 의존을 미리 넣었다.

| id | 부족 | 영향 | 처음 보고한 조각 |
|---|---|---|---|
| G217 | plugin-optics `ray` 의 화살촉이 끝에만 붙는다 — 광선 가운데에 진행 방향을 보이려고 광선마다 두 토막으로 나눠 선언한다 (G02 는 `vector` 화살촉 크기) | 근사 | law-of-reflection · snells-law · specular-diffuse-reflection · plane-mirror-image · multiple-mirror-images · mirage · convex-mirror |
| G218 | plugin-optics `ray` 의 굵기(1.5 px) · 선 모양 · 빛 채널을 고를 수 없다 — 색은 파장 색 아니면 `accent`, `intensity` 는 0.2 아래로 안 내려가고 opacity · clip 을 따르지 않는다. 흰 줄기 · 연장 점선은 `trajectory` 로 대신 긋는다 | 근사 | law-of-reflection · converging-diverging-lens · rectilinear-propagation · specular-diffuse-reflection · magnification · shadow-umbra-penumbra · plane-mirror-image · rayleigh-scattering · real-vs-virtual-image · pinhole-camera · multiple-mirror-images · lens-combination · concave-mirror · spherical-aberration · human-eye-accommodation · convex-mirror · myopia-hyperopia · magnifying-glass · microscope |
| G219 | plugin-optics `opticalElement` 그림이 고정이다 — 거울 뒷면 결(눈금자처럼 보임) · 거울 휨 · 렌즈 두께를 고를 수 없고 `focalLength` · `refractiveIndex` · `polarizerAngle` 이 그림에 반영되지 않는다 | 근사 | law-of-reflection · converging-diverging-lens · magnification · plane-mirror-image · real-vs-virtual-image · multiple-mirror-images · lens-combination · concave-mirror · spherical-aberration · human-eye-accommodation · convex-mirror · chromatic-aberration · myopia-hyperopia · magnifying-glass · microscope · telescope |
| G222 | `readout` 에 빛 채널이 없다 — 빛 없음 바탕(어두운 방) 안에 이름표를 두면 라이트 테마에서 묻혀, 방 안 이름표(등 · 사과 · 눈)를 뺀다 (G92 는 가득 찬 빛의 윤곽) | 근사 | seeing-requires-light · rectilinear-propagation · shadow-umbra-penumbra · rayleigh-scattering · real-vs-virtual-image · pinhole-camera · object-color · scattering · light-through-materials · prism · rainbow |
| G223 | 스테이지 상수(수)에 표시 자릿수를 붙일 자리가 없다 — `String(17.0)` 이 「17」 이 되어 끝자리 0 을 잃어, 자릿수를 상수로 따로 두고 선언값에 `toFixed(선언 자릿수)` 를 건다 | 근사 | snells-law · dispersion |
| G224 | **엔진 결함** — plugin-optics `opticalElement` `lens-concave` 가 볼록 렌즈 모양으로 그려진다(`renderers.ts:137-146` 이 `lens-convex` 의 두 곡선 부호를 함께 뒤집어 같은 도형이 된다). 오목 렌즈가 볼록으로 보여 주장이 무너지므로 렌즈를 `region` 다각형으로 직접 그린다 | 주장 | converging-diverging-lens · lens-combination · myopia-hyperopia |
| G225 | 여러 조각으로 꺾인 반사면(거친 면 · 꺾은선 거울) 어휘가 없다 — 면을 그림(`region` + `trajectory`)과 계산(보이지 않는 `mirror-flat` 조각들을 `traceRay` 에 넘김)으로 두 번 선언해, 에디터에서 면을 옮기면 둘이 따로 논다 (G219 는 `opticalElement` 그림 고정) | 근사 | specular-diffuse-reflection |
| G226 | 빛 채널(`light: { rgb }`)에서 밝기와 색을 따로 고를 수 없다 — 남은 스펙트럼의 색만 보이려고 조각이 가장 큰 성분으로 나눠 밝기를 맞춘다 | 근사 | rayleigh-scattering · scattering |
| G227 | 흐림(번짐 · 초점 벗어남) 어휘가 없다 — 상 한 벌을 원판 위 수십 자리로 옮겨 옅게 겹친 `region` 수백 개로 근사하고, 겹친 칠의 반올림이 쌓여 색이 물든다(G53) | 근사 | pinhole-camera · light-through-materials |
| G228 | `body` 에 뒤집기(거울상) 변환이 없고 회전만 있다 — 거울상 물체마다 윤곽 점을 조각이 뒤집어 `customPath` 를 다시 적는다 (G120 은 3차원 투영의 손잡이) | 근사 | multiple-mirror-images |
| G229 | `readout` 글자 크기가 화면 px 로 고정이라 월드 크기로 놓이는 글자(결정 밑 글자 · 물체로서의 글자)가 없다 — 두 겹 상의 겹침 정도가 임베드 폭에 따라 달라진다 (G79 는 `particleSystem` 월드 크기) | 근사 | birefringence |

39 모두 두 테마에서 주장이 선다(만든 에이전트의 판정). 광학 분야 45/45.

**새 부족 11(G217~G219 · G222~G229) — 근사 10, 주장 1.** 주장 행 G224 는 **엔진 결함**이다: plugin-optics `lens-concave` 가
볼록 모양으로 그려진다(`renderers.ts:137-146`). 오목 렌즈가 필요한 세 조각(converging-diverging-lens · lens-combination ·
myopia-hyperopia)이 `region` 으로 직접 그려 우회했고, 발견 즉시 지시서에 줄을 더했다. 사용자 판정으로 같은 날 엔진을 고쳤다(아래 절).
나머지는 plugin-optics 어휘 쪽이 가장 많다 — `ray` 화살촉(G217) · 굵기 · 선 모양 · 빛 채널(G218), `opticalElement` 그림 고정(G219),
꺾인 반사면(G225). 빛 표현 쪽에서 `readout` 빛 채널(G222) · 밝기와 색 분리(G226) · 흐림(G227) · 월드 크기 글자(G229), 그 밖에
표시 자릿수(G223) · 뒤집기 변환(G228). 빛 없음 바탕 위에 빛이 아닌 대상을 그을 역할색이 없다는 보고가 일곱 조각에서 나왔는데
모두 G72 로, 편광 떨림 표식은 G182 로, 방출 흐름은 G176 · G59 로 판정했다. 세 조각(apparent-depth · plane-mirror-image ·
multiple-mirror-images)이 관찰자 눈을 따로 조립했다(G206).

rule-guard 사후 검증 여덟 묶음(광학)에서 잡아 고친 것 — 짧은 전환 · 나타남 단계에 다음 단계 캡션(multiple-mirror-images ·
mirage · dispersion · prism · microscope), 캡션이 화면과 다름(chromatic-aberration 「두 자리」 · microscope reset), 법칙 일반 진술
(newtons-rings · specular-diffuse-reflection), 상수 관계를 문안에 박음(lens-combination 「같은」), 손으로 만든 빛 RGB 표
(light-through-materials — 빛 세기와 채움으로 바꿈), 표시 배율 모듈 상수(chromatic-aberration `faceScale`). snells-law 의
「선언값에 선언 자릿수로 `toFixed`」 는 유효숫자를 지키는 방향이라 적법 판정을 받았다(G223).
사전 검토가 짚은 plugin-optics 어휘 제약(`findImage` 는 렌즈 전용, prism · 두꺼운 렌즈는 조각이 `refract` 로 면마다, `refract` 의
전반사 무음, 흰빛은 빛 없음 바탕)은 투입 전에 지시서에 더했고, 조각들이 그대로 따랐다.
가장 많이 겪은 기존 부족: G105 (27), G143 (27), G133 (24), G218 (19), G28 (18), G219 (16), G92 (13).
판정 후보: diffraction-grating 이 밝기 N² 를 틈 수마다 정규화해 뺐다 · rayleigh-scattering 해 질 녘 원판이 붉은 주황 ·
pinhole-camera 밝기를 구멍 폭에 비례(실제 넓이는 제곱)시켰다 — 셋 다 NOTES (b) 에 이유가 있다.

## 엔진 결함 수정 (2026-09-19)

| id | 상태 | 무엇을 고쳤나 |
|---|---|---|
| G224 | 해결됨 | `renderers.ts` 의 `lens-concave` 분기를 가장자리가 두껍고 가운데가 얇은 도형으로 다시 그었다 — 두 끝을 법선 방향으로 벌린 네 꼭짓점을 곧은 변으로 잇고, 두 면은 가운데가 안쪽에 닿는 이차 곡선. 치수는 이름 있는 상수(`CONCAVE_EDGE_HALF_PX` · `CONCAVE_CENTER_HALF_PX`). 굴절 계산(`trace.ts`)은 그대로. 화면에 그리는 조각은 `ray-tracing`(얇은 렌즈)의 「오목 렌즈」 스테이지 하나였고, 라이트 · 다크 촬영으로 오목 모양을 확인했다. 우회한 세 조각의 `region` 그림은 그대로 둔다 |
