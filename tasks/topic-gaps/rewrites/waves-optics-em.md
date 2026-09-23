# 문구 제안 — 파동과 음향 · 광학 · 전자기(앞)

`docs/topics/topics.yaml` 에 반영할 새 문구. 근거는 ../LEDGER.md 와 ../triage/waves-optics-em.md.

| id | 주제 | 필드 | 지금 | 제안 | 무엇을 뺐나 |
|---|---|---|---|---|---|
| T58 | `wave-speed-in-medium` | desc | 장력·밀도·탄성이 정하는 속도 | 장력과 선밀도가 정하는 속도 | 「탄성」 — 줄 하나의 어휘 밖이다. 재질의 뻣뻣함은 `youngs-modulus`, 매질별 음속은 `sound-through-materials` 가 갖는다. 「밀도」 도 화면이 굵기로 보이는 선밀도로 좁혔다 |
| T59 | `string-vibration` | desc | 양끝이 고정된 줄의 모드 | 흔들리는 길이가 정하는 음높이 | 「모드」 — 화면의 줄은 언제나 반파장 하나로만 흔들린다. 여러 모드는 `harmonics` 의 몫이다. 「양끝 고정」 도 뺐다 — 누르는 동안 왼쪽 끝은 손가락이다 |
| T60 | `air-column-resonance` | visualNote | 관을 막으면 울리는 길이가 달라진다 | 막은 관은 절반 진동수에서 먼저 울린다 | 「울리는 길이」 — 화면의 두 관은 길이가 끝까지 같고 바뀌는 것은 진동수다. 관 길이를 바꾸는 화면은 `string-vibration` 쪽이다 |
| T62 | `wave-attenuation` | desc | 매질이 흡수하는 에너지 | 같은 거리마다 같은 비율로 낮아지는 진폭 | 「에너지」 — 화면이 재는 것은 마루 높이 하나뿐이고 흡수된 에너지의 양도 행방도 없다. 에너지량은 `wave-energy` 의 몫이다 |
| T63 | `sound-through-materials` | desc | 매질에 따라 달라지는 소리의 전달 | 매질이 정하는 소리의 빠르기와 건너감 | 「전달」 의 모호함 — 세기로 읽히는 자리를 닫고 화면이 실제로 가르는 둘(도착 순서 · 건너가느냐)로 바꿨다 |
| T63 | `sound-through-materials` | visualNote | 매질을 바꾸면 전달되는 정도가 달라진다 | 쇠에서 먼저 닿고 진공에서는 닿지 않는다 | 「전달되는 정도」 — 떨림 띠의 밝기는 네 통에서 같고 가는 동안 옅어지지도 않는다. 세기 차이는 `wave-attenuation` · `impedance-mismatch` 의 주장이다 |
| T64 | `rectilinear-propagation` | visualNote | 가린 만큼 그림자가 생긴다 | 가림판을 광원 쪽으로 옮기면 그림자가 커진다 | 「가린 만큼」 이라는 1:1 — 점광원에서 성립한 적이 없다. 화면은 가림판 자리가 배수(2배 · 4배)를 정하는 것을 보인다. 바로잡는 쪽이지 좁히는 쪽이 아니다 |
| T65 | `plane-mirror-image` | desc | 허상의 위치와 좌우 반전 | 되짚은 빛이 만나는 거울 뒤의 허상 | 「좌우 반전」 — 통념이지 화면 사실이 아니다. 화면이 한 단계에서 스치는 것은 앞뒤 뒤집힘(가로획이 거울 쪽으로 뻗는다)이고 주장은 거리 쪽에 있다. 바로잡는 쪽이다 |
| T70 | `scattering` | desc | 하늘과 노을의 색 | 파란 하늘과 흰 구름을 가르는 입자 크기 | 「노을」 — 화면은 흩어진 빛만 다루고 지나간 빛의 색을 바꾸지 않는다. 노을은 `rayleigh-scattering` 이 실제로 갖고 있다 |
| T71 | `rayleigh-scattering` | desc | 파장 4제곱에 반비례하는 산란 | 파장이 짧을수록 가파르게 느는 산란 | 「4제곱」 이라는 지수 — 화면에 식도 지수도 없고 곡선의 가파름이 4제곱인지 3제곱인지 가릴 자리가 없다. 읽히는 수는 파랑 대 빨강의 배수 하나다 |
| T72 | `electric-charge` | desc | 두 종류의 전하와 보존 | 두 종류뿐인 전하 | 「보존」 — 세 쌍이 이미 대전된 채 매달려 있고 전하가 옮겨 가거나 세어지는 자리가 없다. 옮겨 가는 화면은 `charging-methods` 가 갖는다 |
| T76 | `electrostatic-shielding` | visualNote | 도체 상자 안으로 장이 들어오지 못한다 | 겉면에 전하가 모이며 속의 장이 사라진다 | 「상자」 — 화면은 속 빈 원통의 단면인 고리다. 원통이라야 선이 겉면에 정확히 수직으로 닿아 판정이 서므로 상자로 바꿀 수도 없다. 아울러 「막는다」 를 「모인 전하가 지운다」 로 바꿨다 — 화면이 유도 전하가 겉면에 짙어지는 단계와 장선이 밀려나는 단계를 갈라 보인다. 바로잡는 쪽이다 |
| T77 | `energy-in-capacitor` | desc | 전기장에 저장된 에너지 | 전하를 옮기는 데 든 일 | 「전기장」 — 화면에 장이 하나도 없다. 판 사이 장은 `uniform-field` 의 몫이고, 이 화면은 한 몫씩 옮기는 일을 V–Q 직선 아래 넓이로 쌓는다 |
| T78 | `drift-velocity` | desc | 느린 전자와 빠른 신호 | 도선 속 전자가 기어가는 속도 | 「빠른 신호」 — 두 속력의 견줌인데 화면에 퍼지는 파면이 없다. 화면이 말하는 것은 「빠르게」 가 아니라 「곧바로」 이고, 그 대비는 visualNote 가 이미 옳게 갖고 있다 |
| T80 | `charged-particle-in-magnetic-field` | desc | 속도에 수직인 힘 | 속력이 달라도 같은 한 바퀴 시간 | 「힘」 — 화면에 힘 화살표가 없다. 수직성은 `lorentz-force` 가 화면으로 갖고 있다. 대신 이 조각 고유의 주장(주기가 속력에 매이지 않는다)을 넣었다 |
| T80 | `charged-particle-in-magnetic-field` | visualNote | 힘이 늘 수직이라 원을 그린다 | 빠른 전하가 큰 원을 돌고도 같은 때 돌아온다 | 힘이 원운동의 까닭이라는 약속 — 화면은 다섯 원과 한 줄로 선 강조선, 같은 순간의 복귀만 보인다 |
| T81 | `field-of-straight-wire` | desc | 거리에 반비례하는 세기 | 거리가 멀수록 주는 세기 | 「반비례」 라는 함수 꼴 — 거리 눈금도 세기 수치도 없어 「반으로 줄이면 두 배」 를 읽을 자리가 없다. 화면은 「멀수록 덜 돌아선다」 까지 한다. 정량 쪽은 `biot-savart-law` 로 이었다 |

## 고치지 않은 필드

장부가 지적하지 않은 필드는 손대지 않았다. 특히 다음 넷은 **화면과 이미 맞아** 그대로 둔다.

- `wave-speed-in-medium` visualNote 「줄을 팽팽히 하면 파동이 빨라진다」
- `wave-attenuation` visualNote 「나아갈수록 진폭이 줄어든다」
- `drift-velocity` visualNote 「전자는 굼뜬데 불은 곧바로 켜진다」
- `field-of-straight-wire` visualNote 「도선 둘레로 자기장이 감긴다」

`air-column-resonance` desc 「열린 관과 닫힌 관의 차이」 · `rectilinear-propagation` desc
「그림자와 광선 모형」 · `plane-mirror-image` visualNote 「거울 뒤 같은 거리에 상이 선다」 ·
`scattering` visualNote 「입자 크기에 따라 흩어지는 방향이 달라진다」 ·
`electric-charge` visualNote 「같은 종류는 밀고 다른 종류는 당긴다」 ·
`electrostatic-shielding` desc 「도체 내부의 장이 0인 이유」 ·
`energy-in-capacitor` visualNote 「충전할수록 쌓이는 에너지가 넓이로 보인다」 ·
`rayleigh-scattering` visualNote 「짧은 파장이 더 흩어져 하늘이 파랗고 노을이 붉다」 도 같다.
마지막 것은 노을을 말하지만 그 조각의 화면이 해를 지평선까지 내리고 줄기와 눈에 닿는
빛의 색을 실제로 붉게 바꾼다 — 노을이 없는 쪽은 이웃 `scattering` 이다.
