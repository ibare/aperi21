# 문구 제안 — 중력과 천체 · 유체 · 열과 통계

`docs/topics/topics.yaml` 에 반영할 새 문구. 근거는 ../LEDGER.md 와 ../triage/gravitation-fluids-thermal.md.

| id | 주제 | 필드 | 지금 | 제안 | 무엇을 뺐나 |
|---|---|---|---|---|---|
| T31 | `gravitational-field` | visualNote | 질량 주위에서 화살표가 촘촘해지고 성겨진다 | 질량 곁에서는 화살표가 길고 멀어질수록 짧아진다 | 화살표 밀도가 변한다는 관례. 화면은 같은 간격의 격자에 길이만 바꾼다 — 힘선도 선 밀도도 없다 |
| T33 | `keplers-third-law` | desc | 주기와 긴반지름의 관계 | 궤도 반지름과 한 바퀴 시간의 관계 | 「긴반지름」이라는 명칭. 화면에 타원이 없고 원 궤도 둘이라 눈에 보이는 것은 반지름이다 |
| T33 | `keplers-third-law` | visualNote | 긴반지름을 늘리면 주기가 따라 길어진다 | 궤도를 넓히면 한 바퀴 시간이 반지름보다 훨씬 빨리 길어진다 | 「긴반지름」. 「따라 길어진다」가 비례로 읽히던 것을 화면이 바퀴 수로 실제 보이는 훨씬-빠름으로 바꿨다. T² ∝ a³ 은 글에도 쓰지 않는다 |
| T34 | `lagrange-points` | desc | 두 천체 사이의 평형 위치 | 함께 도는 두 천체와 보조를 맞추는 다섯 자리 | 「사이」. 다섯 중 두 천체 사이에 있는 것은 하나뿐이고 넷은 바깥이다. 대신 회전을 주어 안에 넣었다 |
| T34 | `lagrange-points` | visualNote | 두 중력이 만드는 다섯 자리가 드러난다 | 함께 도는 틀의 지형 위에 다섯 자리가 드러난다 | 「두 중력이 만드는」. 화면의 지형은 회전틀 유효 퍼텐셜이고, 돌지 않으면 L4 · L5 는 서지 않는다 |
| T35 | `orbital-transfer` | desc | 호만 전이와 그 비용 | 낮은 궤도에서 높은 궤도로 옮기는 호만 전이 | 「비용」. delta-v · 연료 · 걸리는 시간 어느 수도 화면에 없다 |
| T36 | `diurnal-motion` | desc | 하루 동안 태양과 별이 하늘을 가로지르는 길 | 하루 동안 밤하늘 전체가 한 점을 두고 도는 길 | 「태양」. 화면에 태양이 한 번도 그려지지 않는다 — 태양의 하루 길은 `seasonal-sun-path` 의 몫이다 |
| T37 | `solar-altitude-shadow` | desc | 고도가 바뀌면 그림자 길이와 기온이 함께 바뀐다 | 고도가 바뀌면 그림자 길이와 햇빛이 퍼지는 넓이가 함께 바뀐다 | 「기온」. 온도계도 수도 없다. 모형에 열용량 · 공기가 없어 수를 내면 지어낸 값이 되므로 데워짐을 넓이당 받는 빛으로 되돌렸다 |
| T38 | `star-radiation-gravity-balance` | visualNote | 한쪽을 키우면 별이 부풀거나 무너진다 | 한쪽을 키우면 둘이 다시 같아지는 크기까지 부풀거나 줄어든다 | 「무너진다」. 흐트러뜨린 어느 쪽도 새 균형으로 되돌아간다 — 붕괴는 `star-life-cycle` · `supernova-and-neutron-star` 의 무대다 |
| T39 | `buoyancy` | desc | 밀려난 유체의 무게만큼 | 아랫면이 더 세게 밀리는 만큼 남는 위쪽 힘 | 「밀려난 유체의 무게」 — 이웃 `archimedes-principle` 의 주장이다. 화면에 넘친 물도 저울도 없고 서는 것은 윗면 · 아랫면 압력 차다 |
| T39 | `buoyancy` | visualNote | 잠긴 부피만큼 밀려난 유체가 되밀어 올린다 | 윗면보다 아랫면을 미는 힘이 더 커서 그 차이가 남는다 | 「밀려난 유체」 · 「잠긴 부피」. 면마다 미는 화살표와 막대 둘이 화면이 가진 전부다 |
| T40 | `archimedes-principle` | desc | 뜨고 가라앉는 조건 | 받는 힘은 밀려난 유체의 무게와 같다 | 「뜨고 가라앉는 조건」. 물체는 한 번도 놓이지 않고 평형 깊이도 없다 — 그쪽은 `floating-and-draft` 의 무대다. 대신 T39 가 잘못 갖고 있던 크기 주장을 제자리로 되돌렸다 |
| T42 | `viscosity` | visualNote | 끈적한 유체일수록 층이 느리게 끌린다 | 끈적한 유체일수록 같은 빠르기로 끌려면 힘이 더 든다 | 「느리게 끌린다」. 층이 판을 따라잡는 시간은 끈적할수록 오히려 짧아 그대로 그리면 물리가 거꾸로 된다. 화면은 두 레인의 층 계단을 같게 두고 끄는 힘만 F · 4F 로 가른다 |
| T44 | `reynolds-number` | desc | 전이를 가르는 무차원 수 | 흐름의 결을 정하는 무차원 수 | 「전이를 가르는」. 2300 표시도 Re 눈금도 없다 — 문턱은 `laminar-vs-turbulent` 의 주장이다 |
| T44 | `reynolds-number` | visualNote | 한 수를 넘기면 흐름의 결이 바뀐다 | 값이 같으면 굵기와 빠르기가 달라도 같은 결로 흐른다 | 「한 수를 넘기면」. 세 관이 함께 빨라질 뿐 넘어가는 순간이 없다. 화면만의 주장인 닮음을 대신 세웠다 |
| T46 | `drag-in-fluid` | desc | 형상과 속도가 정하는 저항 | 빠른 흐름에서 뒤 모양이 정하는 저항 | 「속도」. 두 레인의 빠르기는 끝까지 묶여 있고 바뀌는 것은 뒤 모양뿐이다 — 속도 의존은 `drag-force` 의 몫이다 |
| T48 | `phase-diagram` | visualNote | 압력과 온도를 옮기면 어느 상태에 있는지 자리가 바뀐다 | 압력을 낮추면 같은 가열이 액체 구간을 건너뛴다 | 독자가 온도를 옮긴다는 약속. 온도는 정해진 가열이 훑고 지나가며 세울 수 없다. 화면의 판정 장치인 두 압력 견줌으로 좁혔다 |
| T49 | `thermal-expansion` | desc | 온도에 따른 길이·부피 변화 | 온도에 따른 고체의 길이 변화 | 「부피」. 부피가 느는 장면도 액체가 관을 타고 오르는 장면도 없다. 다만 thermal 분과에 부피 팽창 조각이 **하나도 없다** — 여기서 빼는 것은 새 주제 후보를 하나 세워 두자는 뜻이기도 하다 |
| T50 | `pv-diagram` | visualNote | 둘러싼 넓이가 한 일로 읽힌다 | 같은 두 상태를 잇는 두 길의 아래 넓이가 서로 다르다 | 「둘러싼」. 고리를 그리지 않는다 — 돌아오는 길이 없고 견주는 것은 두 길 아래 넓이다. 둘러싼 넓이는 `cyclic-process` 의 몫이다 |
| T51 | `isothermal-process` | visualNote | 온도를 붙들면 곡선이 정해진 모양을 따른다 | 온도를 붙들면 들어온 열이 남김없이 일로 나간다 | 「정해진 모양」. 비교 곡선도 P×V 확인도 없다 — 곱이 일정하다는 확인은 `boyles-law` 의 몫이고, 화면의 주장은 열의 행방이다 |
| T52 | `irreversibility` | name | 엔트로피와 비가역성 | 비가역성 | 「엔트로피」. 재는 값 · 식 · 눈금이 화면에 하나도 없고 서는 것은 되감은 장면의 방향뿐이다. desc · visualNote 는 이미 화면과 맞아 그대로 둔다. **주의** — id · sim · curricula 대응은 그대로라 이름만 좁히면 셋이 어긋난다. 이름을 좁힐지 주제를 그대로 두고 엔트로피 쪽을 다른 조각에 맡길지는 사람이 정할 일이다 |
| T56 | `maxwells-demon` | desc | 정보와 엔트로피의 관계 | 살펴본 만큼 갈라지는 기체 | 「정보와 엔트로피의 관계」. 두 양의 값 · 식 · 눈금이 없고 판정 횟수조차 글자로 없다. k ln 2 · 비트는 문단의 몫이라 화면이 실제로 보이는 것(가름과 공책 줄이 나란히 자란다)으로 좁혔다 |

## 고치지 않는 필드

장부가 지적하지 않았고 화면과 맞아 그대로 두는 것.

- T31 `gravitational-field` desc — 「공간에 분포한 중력의 세기」. 세기를 화살표 길이로 옮긴 화면과 어긋나지 않는다
- T35 `orbital-transfer` visualNote — 「두 번 밀어 낮은 궤도에서 높은 궤도로 옮긴다」. 화면이 하는 그대로다
- T36 `diurnal-motion` visualNote — 「하루를 빨리 감으면 별이 그리는 길이 드러난다」. 별에만 걸려 있어 맞다
- T37 `solar-altitude-shadow` visualNote — 「고도가 바뀌면 그림자 길이가 함께 바뀐다」. 기온을 걸지 않는다
- T38 `star-radiation-gravity-balance` desc — 「별이 무너지지도 흩어지지도 않는 이유」. 되돌림이 그 답이라 그대로 선다
- T40 `archimedes-principle` visualNote — 「밀려난 물의 무게만큼 가벼워진다」. 두 저울이 마주 움직이는 화면과 맞다
- T42 `viscosity` desc — 「층 사이의 마찰」
- T46 `drag-in-fluid` visualNote — 「형상을 바꾸면 같은 속도에서 저항이 달라진다」. 속도를 묶어 두는 화면과 맞다
- T48 `phase-diagram` desc — 「압력과 온도가 정하는 상」. 개념 definition 과 같다
- T49 `thermal-expansion` visualNote — 「데우면 늘어나 틈이 메워진다」
- T50 `pv-diagram` desc — 「넓이가 일인 표현」
- T51 `isothermal-process` desc — 「온도를 유지하는 변화」
- T52 `irreversibility` desc · visualNote — 되감기만 말해 화면과 맞다
- T56 `maxwells-demon` visualNote — 「빠른 분자만 골라 보내면 저절로 갈라지는 것처럼 보인다」

## 이웃과의 자리

- T39 `buoyancy` ↔ T40 `archimedes-principle` — 둘의 설명이 서로 뒤바뀌어 있었다. 제안은 buoyancy 를 「어디서 오는가」(압력 차), archimedes 를 「얼마인가」(밀려난 유체의 무게)로 갈랐다. 개념 선언이 이미 contrastWith 로 이렇게 이어 두었다
- T33 `keplers-third-law` ↔ `keplers-second-law` — 궤도끼리의 견줌 ↔ 한 궤도 안의 빠르기 변화
- T44 `reynolds-number` ↔ `laminar-vs-turbulent` — 닮음 ↔ 문턱
- T46 `drag-in-fluid` ↔ `drag-force` — 뒤 모양 ↔ 속력 의존
- T50 `pv-diagram` ↔ `cyclic-process` — 길 아래 넓이 ↔ 둘러싼 넓이
- T51 `isothermal-process` ↔ `boyles-law` — 열의 행방 ↔ 곱의 확인
