# 주제 ↔ 조각 간극 장부

자동 생성 — 직접 편집하지 말 것. 원본은 `entries/<분과>-<n>.md`, 규약은 `README.md`.

생성: pnpm gap:ledger · 전체 17건 (설명 12 · 조각 5 · 엔진 0)

갈래는 쓰는 사람이 본 **가장 그럴듯한 것**이고 판정이 아니다. 한 건씩 읽고 사람이 정한다.

| id | 분과 | 주제 | 주제가 약속한 것 | 화면이 하는 것 | 개념에서 처리한 방식 | 갈래 |
|---|---|---|---|---|---|---|
| T01 | kinematics | `uniformly-accelerated-motion` | 「가속도가 일정한 운동의 **세 식**」 | 등시간 간격의 자국이 같은 양씩 길어지는 것만 보인다. 식이 한 글자도 없다 | definition 을 운동 자체로 좁히고, 식 검색어는 exemplarKeywords 로만. avoidWhen 에 「식 자체가 주제면 쓰지 말 것」 | 설명 |
| T02 | kinematics | `velocity-time-graph` | 「**기울기가 가속도**, 넓이가 변위」 | 넓이만 주장한다. 기울기·접선 표시가 소스 어디에도 없다 | definition 을 넓이로 좁히고 기울기는 avoidWhen 으로. 기울기는 average-acceleration 이 맡으므로 contrastWith 로 이음 | 조각 |
| T03 | kinematics | `relative-velocity` | 「기준틀 사이의 **속도 변환**」 | 속도 화살표가 없다. 기준틀이 바뀌면 배가 **지나온 길이 기우는 것**으로만 말한다 (조각의 의도된 결정 — NOTES (c) 「등속이라 궤적의 접선과 겹친다」) | definition 을 「보는 사람의 속도를 뺀 값으로 읽히는 속도, 그 결과 기우는 경로」로 쓰고, 화살표로 그린 벡터 뺄셈을 요구하는 글은 avoidWhen 으로 되돌렸다. 두 관측자를 맞세우는 쪽은 `reference-frame` 이라 contrastWith 로 이었다 | 설명 |
| T04 | kinematics | `projectile-range` | 「**45도에서 가장 멀리 간다**」 | 다이얼의 45° 눈금 하나와 거리 격자를 줄 뿐, 사거리를 숫자로 내지 않고 **지난 발사의 궤적도 남기지 않는다.** 두 각도를 나란히 놓고 견줄 수 없어 독자가 한 발씩 쏘고 기억해야 한다 | observable 을 「한 발씩 쏘아 격자에서 읽는다」로 적고, 사거리·최고점·체공 시간을 숫자로 원하는 글은 avoidWhen 으로 막았다. 나란히 견주는 주장은 `projectile-motion` 쪽이라 contrastWith 로 갈랐다 | 조각 |
| T05 | kinematics | `trajectory-equation` | 「시간을 소거해 얻은 경로의 **식**」 | 시각 딱지를 지우는 데까지만 간다. 지운 뒤 남는 관계를 적은 **식이 화면에 없다** | definition 을 「시각을 걷어 내도 남는, 가로와 높이 사이의 관계로서의 경로」로 쓰고, 식 자체를 화면에서 기대하는 글은 avoidWhen 으로 되돌렸다. 식 검색어는 exemplarKeywords 에만 남겼다 | 조각 |
| T06 | kinematics | `centripetal-acceleration` | 「방향만 바뀌는 운동의 **가속도**」 | 꼬리를 맞댄 두 속도의 차 Δv 가 **어디를 향하는가**만 주장한다. Δv/Δt 로 나눈 가속도 화살표도, 크기 v²/r 도, 숫자도 화면에 없다 (조각의 의도된 결정) | definition 의 주어를 「속력이 안 바뀌는 물체의 속도 변화」로 두고 주장을 방향 하나로 좁혔다. 크기·공식 요구는 avoidWhen 이 되돌린다 | 설명 |
| T07 | newtonian-mechanics | `newtons-first-law` | 「**기준틀을 바꾸면** 같은 운동이 달라 보인다」 | 시점이 「땅에서 본 장면」 하나뿐이다. 버스 안에서 본 장면으로 바꾸는 수단이 없고, 주장은 두 자취(버스·승객)의 간격을 **한 시점에서** 견주는 것이다 | definition 을 「민 것이 없으면 제 속도를 지킨다」로 잡고 기준틀 전환은 avoidWhen 으로 되돌렸다. 관찰자를 바꾸는 주장은 `reference-frame` 이 맡으므로 contrastWith 로 이었다 | 설명 |
| T08 | newtonian-mechanics | `newtons-second-law` | 「알짜힘·**질량**·가속도의 관계」 | 세 수레가 모두 같고 힘만 1 : 2 : 3 이다. 질량을 바꾸는 줄이 없다(조각 NOTES 「질량을 바꾸는 줄 — 두 번째 주장이라 다른 조각의 몫」) | definition 을 힘 ↔ 매초 붙는 속도의 비례로 좁히고, 질량이 변수인 글은 avoidWhen 으로 막았다. 질량 쪽은 `inertial-vs-gravitational-mass` 로 이었다 | 조각 |
| T09 | newtonian-mechanics | `inertial-vs-gravitational-mass` | 「**같이 떨어지는 것**이 두 질량이 같다는 증거다」 | 떨어지는 장면이 없다. 증거는 저울(중력이 끄는 세기)과 얼음 위 용수철 밀기(밀리기 어려움)가 **같은 추 개수**에서 맞는 것이다 | definition 을 「두 재는 절차가 같은 값을 준다」로 쓰고 낙하는 avoidWhen 으로 되돌렸다. 낙하 증거는 `free-fall` 이 맡으므로 contrastWith 로 이었다 | 설명 |
| T10 | newtonian-mechanics | `normal-force` | 「**면을 기울이면** 수직항력이 줄고 미끄러진다」 | 바닥이 수평 하나다. 수직항력이 줄어드는 까닭은 기울기가 아니라 막대가 위로 당기는 것이고, 미끄러짐 대신 상자가 **떠오른다**(수직항력 0) | definition 을 「뚫리지 않을 만큼만 민다」로 쓰고 경사·미끄러짐을 avoidWhen 으로 막았다. 기울기는 `inclined-plane` · `angle-of-friction` 이 따로 있는 주제다 | 설명 |
| T11 | newtonian-mechanics | `pulley-system` | 「힘의 **방향**과 크기를 바꾸는 장치」 | 크기만 주장한다 — 받치는 가닥 수에 따라 손의 힘이 1/n 이 되고 당길 줄이 n 배가 되는 거래 하나다. 방향이 꺾이는 것은 1가닥 고정 도르래의 기하에 보일 뿐 이름표·캡션·눈금 어디에도 주장으로 적히지 않는다 | definition 을 「가닥이 짐을 나눠 받쳐 힘이 줄고 줄 길이가 그만큼 는다」는 거래 하나로 쓰고, observable 에 고정 도르래의 기하만 적었다. 방향 전환을 요구하는 글은 따로 막지 않았다 — 화면에 있기는 하기 때문이다 | 설명 |
| T12 | newtonian-mechanics | `centripetal-force` | 「원운동을 유지시키는 힘의 **정체**」 | 줄 한 경우만 보인다. 안쪽 화살표와 놓았을 때의 접선 비행이 주장의 전부이고, 「구심력은 따로 있는 힘이 아니라 장력·마찰력·중력이 맡는 역할」이라는 흔한 교육 주장은 화면에 없다. visualNote(「줄을 놓으면 접선으로」)는 이미 화면과 같다 | definition 을 「없어지면 접선으로 간다」로 좁히고, 무엇이 그 힘을 대는가를 묻는 글은 avoidWhen 으로 되돌렸다. 무엇이 대는가는 conical-pendulum · banked-curve · vertical-loop 쪽이라 contrastWith 로 이었다 | 설명 |
| T13 | newtonian-mechanics | `conical-pendulum` | 「**장력과 중력**이 만드는 원운동」 | 두 힘 어느 쪽도 그리지 않는다. 화살표가 화면에 한 개도 없다(조각의 의도된 결정 — NOTES). 주장은 「줄 길이가 달라도 같은 빠르기면 세 추가 한 높이에서 돈다」는 깊이 h = g/ω² 하나다 | definition 을 「돌리는 빠르기만이 매단 점 아래 깊이를 정한다」로 쓰고, 장력을 성분으로 나누거나 힘을 그리길 기대하는 글은 avoidWhen 으로 막았다. 힘 검색어는 exemplarKeywords 에만 남겼다 | 설명 |
| T14 | newtonian-mechanics | `vertical-loop` | 「**꼭대기에서** 떨어지지 않는 최소 속력」 · visualNote 「꼭대기에서 최소 속력을 못 넘기면 떨어진다」 | 느린 공은 **꼭대기에 닿기 전에** 레일을 떠난다. 수직항력이 0 이 되는 자리에 고리가 남고, 그 고리가 꼭대기보다 확실히 아래에 찍히는 것이 조각의 요지다. 설명·visualNote 는 둘 다 사건을 꼭대기에 두고 있다 | definition 을 「꼭대기에 닿기도 전에 레일을 떠난다」로 바로잡고, useWhen 에 「꼭대기까지 갔다가 떨어진다는 오해를 고치는 자리」를 명시했다 | 설명 |
| T15 | newtonian-mechanics | `fictitious-force` | visualNote 가 「**회전 원판 위에서 공이 휘어 보인다**」 — `coriolis-effect` 의 visualNote 와 같은 문장이다 | 원판도 던진 공도 없다. 회전하는 틀에서 옆으로 본 **회전 그네** 두 추가 같은 각도로 기울고, 추마다 중력·관성력 화살표가 같은 배율로 그려진다. 주장은 「관성력이 질량에 비례한다」 | definition 의 주어를 「도입한 그 힘이 무엇에 비례하는가」로 두고 휜 경로는 avoidWhen 으로 되돌렸다. 휜 경로는 `coriolis-effect` 의 주장이라 contrastWith 로 이었다 | 설명 |
| T16 | newtonian-mechanics | `impulse-force-relation` | 「**같은 운동량 변화**도 길게 받으면 힘이 작다」 | 같은 공이 같은 속력으로 와 둘 다 멈추는 것으로 운동량 변화가 같음을 **짜 놓았을 뿐**, 두 힘-시간 곡선의 넓이가 같다는 표시가 없다 (조각 NOTES 「넓이가 같음을 겹쳐 보이는 표시」를 화면에 두지 않음) | observable 은 실제로 보이는 것 — 높고 좁은 언덕과 낮고 넓은 언덕 — 만 적고, 같음은 「같은 공이 같은 속력으로 와 둘 다 멈춘다」는 조건으로만 말했다. 넓이를 값으로 요구하는 글은 avoidWhen 으로 막았다 | 조각 |
| T17 | newtonian-mechanics | `youngs-modulus` | 「재료가 늘어나는 정도를 정하는 **값**」 | 그 값이 화면에 없다. 응력·변형률도 축도 수치도 없고, 적히는 수는 선마다의 늘어남(mm)과 배율 안내뿐이다 | definition 을 「어느 한 선이 아니라 재료에 속하는 뻣뻣함」으로 쓰고, 모듈러스 수치나 응력-변형률 축을 기대하는 글은 avoidWhen 으로 되돌렸다 | 설명 |
