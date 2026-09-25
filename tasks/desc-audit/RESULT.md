# 조각 설명 전수 대조 — 결과

`대조 444 · 이상 없음 400 · A 4 · B 33 (오독 21 · 누락 12) · D 1 · E 2 · X 5`

판정 45건 · 조각 44개 (`sound-intensity` 는 B 와 X). 근거(파일:줄)와 제안 전문은 `findings.yaml`.
기준은 `PLAN.md`, 본보기는 `seed-findings.yaml`. 2026-09-25.

- 새로 나온 A · D 는 없다 — 넷과 하나 모두 본보기 11건의 판정이 그대로 확인됐다.
- 인용된 파일:줄 전부가 실재하고, 표본 6건은 내용까지 맞춰 봤다.
- 제안 문구는 ko 초안이다. 채택하면 desc 10개 언어를 함께 고친다.

## A — desc 가 틀렸다 (4) · 고칠 곳 `topics.yaml` desc

| 조각 | 문제 | 제안 |
|---|---|---|
| boundary-layer | 「속도가 0이 되는 층」 — 0 은 벽면뿐, 층은 회복하는 곳 | 벽의 0 에서 바깥 흐름 속도까지 회복하는 얇은 층 |
| elastic-collision | 「빠르기를 잃지 않는」 ↔ 캡션 「부딪친 공은 멈추고」 | 운동 에너지의 합까지 보존되는 충돌 |
| concave-mirror | 「초점과 실상」 — 핵심인 실상→허상 전환의 절반 | 초점 밖에서는 실상, 안에서는 허상 |
| wien-displacement-law (ko) | 「최대 파장」이 가장 긴 파장으로 읽힘 | 온도와 봉우리 파장 |

## B 오독 — desc 가 틀린 쪽으로 읽힌다 (21) · 고칠 곳 `topics.yaml` desc

| 조각 | 이렇게 읽힌다 | 제안 |
|---|---|---|
| pulley-system | 힘을 공짜로 줄이는 장치 | 힘의 방향을 바꾸고, 드는 힘을 줄이는 만큼 당길 줄이 길어지는 장치 |
| mechanical-advantage | 〃 | 지레와 빗면이 힘을 줄이는 대신 더 먼 거리를 밀게 하는 맞바꿈 |
| stokes-drag | 「크기가 가라앉는」 — 뜻이 서지 않음 (ko · en) | 느린 흐름에서 반지름이 두 배면 네 배 빨리 가라앉는 구 |
| efficiency (ko) | 넣은 것 ÷ 얻은 것 (역수) | 넣은 것 가운데 쓸모로 나온 몫 |
| gears | 힘이 바뀐다 (실제로는 돌림힘) | 톱니 수가 맞바꾸는 빠르기와 돌림힘 |
| geostationary-orbit | 동기 궤도의 정의 (적도 조건 없음) | 적도 위에서 지구 자전과 같은 주기로 도는 궤도 |
| keplers-third-law | 반지름에 비례 | 반지름보다 훨씬 빨리 길어지는 한 바퀴 시간 |
| stellar-nucleosynthesis | 철보다 무거운 원소도 별의 핵융합이 만든다 | 별 중심에서 철까지 한 겹씩 무거운 원소가 쌓이는 것 |
| thermal-conduction | 두 물체가 맞닿는 전달 | 물질을 타고 번지는 열 — 쇠는 빨리, 나무는 느리게 |
| random-walk | 「이동 거리」 = 걸은 거리 | 걸음 수의 제곱근만큼만 멀어지는 처음 자리와의 거리 |
| heat-engine | 받은 열이 모두 일이 된다 | 받은 열의 일부만 일로 바꾸고 나머지는 찬 쪽에 버리는 순환 |
| sound-intensity | 소리 크기가 거리 제곱으로 준다 | 거리 제곱에 반비례해 꺼지는 세기, 조금씩만 낮아지는 데시벨 |
| seismic-waves | 두 파가 모두 지구 속을 지난다 | 액체 외핵이 S파를 막고 P파를 꺾어 만드는 그림자대 |
| convex-mirror (ko) | 「확대」 = 상의 확대 (실제로는 작은 상) | 넓어진 시야와 작고 바로 선 허상 |
| birefringence | 진행 방향에 따른 굴절률 | 한 줄기가 떨림이 직각인 두 줄기로 갈라져 두 겹으로 보이는 것 |
| lorentz-force (ko) | 멈춘 전하도 힘을 받는다 | 자기장 속에서 움직이는 전하가 받는 힘 |
| field-of-loop-and-solenoid | 축 위의 값 (화면에 없음) | 고리를 겹칠수록 속은 고르고 세지고 바깥은 약해지는 자기장 |
| self-inductance (ko) | en 과 뜻이 다른 명사구 | 자기 자속의 변화에 맞서는 코일 |
| reactance | 「저항」 + 코일·축전기 대비 없음 | 진동수가 오르면 코일은 더 막고 축전기는 덜 막는 것 |
| relativistic-momentum | 속도만 커지면 발산 (광속 없음) | 광속에 다가갈수록 끝없이 커지는 운동량 |
| finite-well | 벽을 넘어 새어 나간다 | 벽 속으로 스며든 만큼 낮아지는 준위 |

## B 누락 — 정의로는 맞고 조각의 핵심만 빠졌다 (12) · 고칠 곳 `topics.yaml` desc (선택)

| 조각 | 빠진 것 | 제안 |
|---|---|---|
| average-acceleration | 「평균」 — 처음과 끝만으로 정해진다 | 가는 길과 상관없이 처음과 끝 속도만으로 정해지는 속도 변화의 비율 |
| direction-of-acceleration | 같은 쪽이면 빨라지고 반대면 느려진다 | 속도와 같은 쪽이면 빨라지고 반대쪽이면 느려지게 하는 가속도의 방향 |
| free-fall | 질량과 무관하게 나란히 떨어진다 | 무게와 상관없이 중력만 받아 똑같이 떨어지는 운동 |
| quality-factor | 날카로울수록 오래 울린다 | 공명이 날카로울수록 오래 울리는 것 |
| keplers-first-law | 태양은 한 초점에 | 태양이 한 초점에 놓인 타원 궤도 |
| hr-diagram | 무거운 별부터 주계열을 떠난다 | 성단이 나이 들수록 무거운 별부터 주계열을 떠나는 HR 도 |
| pressure-from-collisions | 세기 × 횟수 → 속력의 제곱 | 더 세게, 더 자주 — 속력의 제곱으로 커지는 벽의 압력 |
| magnifying-glass | 크고 바로 선 허상 (결과) | 초점 안의 물체가 크고 바로 선 허상으로 보이는 것 |
| single-slit-diffraction | 좁을수록 가운데 띠가 넓어진다 | 틈이 좁을수록 넓어지는 가운데 밝은 띠 |
| antenna-radiation | 옆으로 가장 세고 축 방향은 0 | 옆으로 가장 세고 축 방향으로는 내보내지 않는 안테나의 파동 |
| nuclear-structure | 양성자는 원소, 중성자는 동위원소 | 양성자 수는 원소를, 중성자 수는 동위원소를 정한다 |
| antimatter | 만나면 함께 사라지고 광자 둘 | 전자와 만나 함께 사라지며 광자 둘을 정반대로 내놓는 짝 |

## E — 이름 · 제목만 어긋난다 (2)

| 조각 | 문제 | 고칠 곳 · 제안 |
|---|---|---|
| star-radiation-gravity-balance | 떠받치는 것은 기체압 + 복사압인데 이름이 복사압 | `topics.yaml` name · `label.title` — 압력과 중력의 평형 |
| newtons-first-law | 주제는 「관성 법칙」인데 제목이 「관성 기준계」 | `label.title` 만 — 관성 법칙 / Newton's first law |

## D — 조각 자체가 틀렸다 (1)

| 조각 | 문제 | 고칠 곳 |
|---|---|---|
| ionizing-radiation | 10 eV 를 「결합을 끊는 문턱」으로 가르친다 (결합은 3~5 eV, 10 eV 는 이온화) | 조각 주장 재설계 → 그 뒤 desc |

## X — 사람이 판단 (5) · 모두 desc 는 맞고 조각의 표현이 걸린다

| 조각 | 걸리는 것 |
|---|---|
| wave-basics | 한 줄에서 T 를 고정하고 λ 를 바꾸면 마루가 빨라진다 — 같은 매질의 속력은 매질이 정한다 |
| sound-intensity | dB 를 「소리 크기 / Loudness」라 부름 — 음압 준위와 지각 음량은 다르다 |
| resolving-power | 레일리 기준을 넘자마자 골이 사라지는 것으로 읽힘 (실제는 약 0.78배, 계산은 맞음) |
| equipotential-surface | 전기력선을 일정 속력으로 따라가는 경로를 「풀려난 전하의 길」로 보임 (과감쇠 모형이 명시 안 됨) |
| energy-in-inductor (ko) | 캡션 「전류가 멈춰」가 전류 0 으로 읽힘 (en 「holds」는 맞음) |

## 다음 작업

1. **desc 한 커밋** — A 4 + B오독 21 (+ B누락 12 를 넣을지 결정). 제안 문구를 확정하고 10개 언어로
   옮겨 `topics.yaml` 을 고친 뒤 `pnpm description:gen` → `gen:check`.
2. **이름 · 제목** — E 2. star-radiation-gravity-balance 는 name 과 title, newtons-first-law 는 title 만.
3. **조각 작업** — D 1 (ionizing-radiation 재설계). X 5 는 판단 뒤 조각별로 캡션 · 이름표를 고친다.
