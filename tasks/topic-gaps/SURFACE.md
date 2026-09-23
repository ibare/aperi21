# 선언된 표면 — 장부의 주장을 맞댈 사실

자동 생성 — 직접 편집하지 말 것. 생성: `pnpm surface:gen` (scripts/gen-declared-surface.mts).

`LEDGER.md` 의 「화면이 하는 것」은 **사람이 읽어 쓴 것**이고, 여기 있는 것은
**기계가 선언에서 뽑은 것**이다. 둘을 나란히 놓고 어긋나는 데를 찾는다.

화면에 뜨는 문자는 모두 선언된 문안 키를 지나므로(C1), 「화면이 X 를 말하지 않는다」는
키 목록으로 판정된다. **못 잡는 것** — 화면이 무슨 주장을 하는가(해석), 무엇을 더
할 수 있는가(가능성), 실제로 그려진 결과(색 · 배치 · 읽힘).

`파싱 실패` 는 「없다」가 아니라 **못 읽었다**는 뜻이다. 그 자리는 사람이 연다.
대상 100건 · 파싱 실패 1건 · 문안 선언이 없는 구세대 조각 4건.


### T02 · `velocity-time-graph`

- 조각 — `aperi21:velocity-time-graph` · `sims/kinematics/velocity-time-graph`
- 문안 7건
  - `label.title` — 속도-시간 그래프
  - `label.operation` — 그래프 아래 넓이가 간 거리다
  - `label.stage` — 직선 길
  - `label.view` — 넓이와 길
  - `label.axisV` — 속도
  - `label.axisT` — 시간
  - `caption.main` — 1초마다 그래프 아래 쌓인 넓이를 떼어 길에 펴 놓으면, 그 1초 동안 물체가 간 거리에 꼭 맞는다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — main
- 뷰 — main
- 시간표 — 없음
- 노드 종류 — body · marker · readout · region · trajectory

### T04 · `projectile-range`

- 조각 — `aperi21:projectile` · `sims/physics/projectile`
- 문안 — **선언 없음.** 화면 문자가 C1 3층 조회를 지나지 않는 구세대 조각이다
- 조작기 — launch-angle(angle-dial) · launcher(pinball-launcher) · stages(stage-tabs) · views(view-tabs) · envs(env-toggles)
- 스테이지 — earth · moon · vacuum
- 뷰 — trajectory · forces · energy
- 시간표 — 없음
- 노드 종류 — body · event · gauge · surface · trajectory · vector

### T05 · `trajectory-equation`

- 조각 — `aperi21:trajectory-equation` · `sims/kinematics/trajectory-equation`
- 문안 9건
  - `label.title` — 궤적 방정식
  - `label.operation` — 시간을 소거해 얻은 경로의 식
  - `label.stage` — 기본
  - `label.view` — 기본
  - `label.tick` — {t}초
  - `caption.flying` — 공은 시각마다 한 점씩 지나간다
  - `caption.tagged` — 지나간 점마다 시각이 붙어 있다
  - `caption.erasing` — 시각을 지운다
  - `caption.remains` — 시각이 없어도 경로는 그대로 남는다
- 조작기 — 없음 (자동 진행)
- 스테이지 — default
- 뷰 — default
- 시간표 — fly→caption.flying · land→caption.tagged · erase→caption.erasing · remain→caption.remains
- 노드 종류 — body · readout · region · trace · trajectory

### T08 · `newtons-second-law`

- 조각 — `aperi21:newtons-second-law` · `sims/mechanics/newtons-second-law`
- 문안 8건
  - `label.title` — 가속도 법칙
  - `label.operation` — 알짜힘·질량·가속도의 관계
  - `label.stage` — 수레 셋
  - `label.view` — 기본
  - `label.force` — 힘 {f}배
  - `label.velocity` — 속도
  - `caption.push` — 같은 수레를 2배, 3배 힘으로 밀면 1초마다 붙는 속도(막대 한 칸)도 2배, 3배다.
  - `caption.hold` — 4초 동안 쌓인 칸은 셋 모두 넷 — 다른 것은 칸 하나의 크기뿐이다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — default
- 뷰 — default
- 시간표 — push→caption.push · hold→caption.hold
- 노드 종류 — body · readout · trace · trajectory · vector

### T16 · `impulse-force-relation`

- 조각 — `aperi21:impulse-force-relation` · `sims/mechanics/impulse-force-relation`
- 문안 15건
  - `label.title` — 힘과 충격량
  - `label.operation` — 짧고 큰 힘과 길고 작은 힘
  - `label.stage` — 벽과 방석
  - `label.view` — 나란히
  - `label.hard` — 딱딱한 벽
  - `label.soft` — 푹신한 방석
  - `label.force` — 힘
  - `label.time` — 시간
  - `label.slider` — 방석에서 멈추는 데 걸리는 시간
  - `caption.approach` — 같은 공이 같은 속력으로 벽과 방석을 향해 간다
  - `caption.hardHit` — 벽에 닿은 공은 순식간에 멈추며 큰 힘을 받는다
  - `caption.sameShort` — 둘 다 같은 짧은 시간에 멈추며 같은 큰 힘을 받는다
  - `caption.softStopping` — 방석에 닿은 공은 아직 멈추는 중 — 힘이 낮게 오래 이어진다
  - `caption.sameDone` — 같은 시간에 멈추면 힘도 같다
  - `caption.done` — 둘 다 멈췄다 — 오래 걸려 멈춘 쪽의 힘이 훨씬 낮았다
- 조작기 — soft-time(slider)
- 스테이지 — default
- 뷰 — default
- 시간표 — 없음
- 노드 종류 — body · readout · region · slider · trajectory · vector

### T20 · `conservation-of-mechanical-energy`

- 조각 — `aperi21:ramp-energy` · `sims/mechanics/ramp-energy`
- 문안 7건
  - `label.title` — 경사면과 에너지
  - `label.operation` — 길이 달라도 바닥에서의 속력은 같다
  - `label.stage` — 경사면
  - `label.view` — 세 길
  - `caption.descending` — 같은 높이에서 출발한 공 셋이 서로 다른 길로 내려간다
  - `caption.settled` — 셋 다 바닥에 내려섰다 — 벌어진 간격이 더는 변하지 않는다
  - `caption.adjusting` — 출발 높이를 다시 정하는 중 — 놓으면 셋이 같은 높이에서 함께 출발한다
- 조작기 — drop-steep-first(scale-drag) · drop-straight(scale-drag) · drop-steep-last(scale-drag)
- 스테이지 — ramps
- 뷰 — paths
- 시간표 — 없음
- 노드 종류 — body · trace · trajectory

### T28 · `pendulum-amplitude-dependence`

- 조각 — `aperi21:pendulum-isochronism` · `sims/oscillation/pendulum-isochronism`
- 문안 8건
  - `label.title` — 진자의 등시성
  - `label.operation` — 폭이 달라도 같은 박자로 돌아온다
  - `label.stage` — 진자
  - `label.view` — 다섯 진자
  - `label.amplitude` — {deg}°
  - `control.amplitude` — 흔들림 크기
  - `caption.same` — 진폭이 다섯 배까지 차이 나는데도, 다섯이 같은 순간 바닥을 지난다
  - `caption.lag` — 크게 흔들리는 것이 뒤처졌다 — 등시성은 작은 흔들림에서만 성립한다
- 조작기 — amplitude(slider)
- 스테이지 — pendulums
- 뷰 — five
- 시간표 — 없음
- 노드 종류 — body · constraint · readout · slider · string · trace · trajectory

### T29 · `normal-modes`

- 조각 — `aperi21:normal-modes` · `sims/oscillation/normal-modes`
- 문안 13건
  - `label.title` — 정규 모드
  - `label.operation` — 계가 가진 고유 진동 형태
  - `label.stage` — 구슬 사슬
  - `label.view` — 모드 분해
  - `label.equals` — =
  - `label.plus` — +
  - `caption.all` — 한 알을 당겼다 놓은 사슬의 뒤섞인 흔들림은, 아래 다섯 모양이 제 모양 그대로 저마다 다른 박자로 부풀고 줄어드는 것을 더한 것이다.
  - `caption.modes4` — 한 알을 당겼다 놓은 사슬의 뒤섞인 흔들림은, 아래 네 모양이 제 모양 그대로 저마다 다른 박자로 부풀고 줄어드는 것을 더한 것이다. 납작한 줄의 모양은 처음부터 들어 있지 않았다.
  - `caption.modes3` — 한 알을 당겼다 놓은 사슬의 뒤섞인 흔들림은, 아래 세 모양이 제 모양 그대로 저마다 다른 박자로 부풀고 줄어드는 것을 더한 것이다. 납작한 줄의 모양은 처음부터 들어 있지 않았다.
  - `caption.modes2` — 한 알을 당겼다 놓은 사슬의 뒤섞인 흔들림은, 아래 두 모양이 제 모양 그대로 저마다 다른 박자로 부풀고 줄어드는 것을 더한 것이다. 납작한 줄의 모양은 처음부터 들어 있지 않았다.
  - `caption.modes1` — 한 알을 당겼다 놓은 사슬의 뒤섞인 흔들림은, 아래 한 모양이 제 모양 그대로 저마다 다른 박자로 부풀고 줄어드는 것을 더한 것이다. 납작한 줄의 모양은 처음부터 들어 있지 않았다.
  - `caption.held` — 붙잡아 둔 모양도 아래 모양들을 더한 것이다 — 놓으면 저마다 제 박자로 흔들리기 시작한다.
  - `caption.still` — 사슬이 멈춰 있어 아래 모양도 모두 납작하다 — 구슬 하나를 끌어 당겼다 놓아 보라.
- 조작기 — **파싱 실패**
- 스테이지 — chain
- 뷰 — modes
- 시간표 — 없음
- 노드 종류 — lineSet · particleSystem · readout · trajectory

### T41 · `lift-force`

- 조각 — `aperi21:lift-force` · `sims/fluids/lift-force`
- 문안 7건
  - `label.title` — 양력
  - `label.operation` — 날개 위아래의 흐름 차이
  - `label.stage` — 날개 단면
  - `label.view` — 연기 줄
  - `label.aoa` — 받음각
  - `caption.overtake` — 같은 순간 한 줄로 뿌린 연기가 날개 앞에서 갈라져, 위쪽 절반이 아래쪽을 앞질러 간다 — 빨리 흐르는 날개 위쪽의 압력이 아래쪽보다 낮다.
  - `caption.flat` — 받음각이 0° 이면 같은 순간 뿌린 연기 줄의 위아래가 나란히 날개를 지나고, 위아래 압력도 같다.
- 조작기 — aoa(slider)
- 스테이지 — default
- 뷰 — default
- 시간표 — 없음
- 노드 종류 — lineSet · region · scalarField · slider

### T43 · `stokes-drag`

- 조각 — `aperi21:stokes-drag` · `sims/fluids/stokes-drag`
- 문안 11건
  - `label.title` — 스토크스 항력
  - `label.operation` — 느린 흐름에서의 저항
  - `label.stage` — 끈적한 액체
  - `label.view` — 두 관
  - `label.radiusSmall` — r
  - `label.radiusBig` — 2r
  - `label.depthSmall` — d
  - `label.depthBig` — 4d
  - `caption.drop` — 같은 액체에 놓은 두 구가 곧 일정한 빠르기로 가라앉는다
  - `caption.sink` — 반지름이 두 배인 구는 자국 간격이 네 배 — 네 배 빠르게 가라앉는다
  - `caption.arrive` — 큰 구가 바닥에 닿았을 때 작은 구는 4분의 1 만큼만 내려왔다
- 조작기 — 없음 (자동 진행)
- 스테이지 — default
- 뷰 — main
- 시간표 — drop→caption.drop · sink→caption.sink · arrive→caption.arrive · fade→caption.arrive
- 노드 종류 — body · dimension · readout · region · trace · trajectory

### T45 · `surface-tension`

- 조각 — `aperi21:surface-tension` · `sims/fluids/surface-tension`
- 문안 12건
  - `label.title` — 표면 장력
  - `label.operation` — 표면을 줄이려는 힘
  - `label.stage` — 물 위의 바늘
  - `label.view` — 단면
  - `label.tension` — T
  - `label.load` — F
  - `caption.drop` — 바늘 하나를 물 위에 살며시 내려놓는다
  - `caption.settle` — 수면이 오목하게 휘며 막처럼 바늘을 받쳐 든다
  - `caption.hold` — 막이 양쪽에서 수면을 따라 당긴다 — 위쪽 몫(점선) 둘을 합치면 누르는 힘 F 와 같다
  - `caption.press` — 위에서 누를수록 더 휜다 — T 의 크기는 그대로, 방향만 위로 돌아선다
  - `caption.limit` — 막이 곧추섰다 — T 가 모두 위를 향해 이보다 더 받칠 수 없다
  - `caption.sink` — 더 돌아설 방향이 없다 — 막이 뚫리고 바늘이 가라앉는다
- 조작기 — 없음 (자동 진행)
- 스테이지 — needle-on-water
- 뷰 — section
- 시간표 — drop→caption.drop · settle→caption.settle · hold→caption.hold · press→caption.press · limit→caption.limit · sink→caption.sink · fade→caption.sink
- 노드 종류 — body · region · trajectory · vector

### T54 · `refrigerator-heat-pump`

- 조각 — `aperi21:refrigerator-heat-pump` · `sims/thermal/refrigerator-heat-pump`
- 문안 16건
  - `label.title` — 냉장고와 열펌프
  - `label.operation` — 일을 넣어 열을 옮기는 것
  - `label.stage` — 부엌의 냉장고
  - `label.view` — 열의 흐름
  - `label.fridge` — 냉장고 안
  - `label.kitchen` — 부엌
  - `label.machine` — 기계
  - `label.socket` — 전기
  - `label.heat` — 열 {q} J
  - `label.work` — 일 {q} J
  - `label.temp` — {t} ℃
  - `caption.pull` — 기계가 전기 일({w} J)을 받아, 차가운 냉장고 안({tc} ℃)에서 열({qc} J)을 뽑아낸다.
  - `caption.deliver` — 두 줄기가 기계에서 합쳐져, 더 굵은 열 줄기({qh} J)가 더 따뜻한 부엌({th} ℃)으로 나간다.
  - `caption.cut` — 전기를 끊는다.
  - `caption.seep` — 흐름이 멈췄다. 부엌에서 냉장고 안으로 가는 가는 띠가 나타난다.
  - `caption.leak` — 흐름이 멈췄다. 이제 열은 더운 부엌에서 찬 냉장고 안으로 저절로 새어 들고, 냉장고 안 온도계가 오른다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — kitchen-fridge
- 뷰 — heat-flow
- 시간표 — appear→caption.pull · pull→caption.pull · deliver→caption.deliver · cut→caption.cut · seep→caption.seep · leak→caption.leak · fade→caption.leak
- 노드 종류 — body · particleSystem · readout · region · trajectory

### T61 · `doppler-effect`

- 조각 — `aperi21:doppler-effect` · `sims/waves/doppler-effect`
- 문안 8건
  - `label.title` — 도플러 효과
  - `label.operation` — 원천이 방출점을 밀고 가 앞쪽 간격이 좁아진다
  - `label.stage` — 매질
  - `label.view` — 파면
  - `label.speed` — 원천 속도
  - `caption.stopped` — 구급차가 멈춰 있다 — 파면이 사방으로 같은 간격으로 퍼진다.
  - `caption.starting` — 구급차가 출발한다 — 새로 나가는 파면이 앞쪽에서 서로 가까워진다.
  - `caption.running` — 앞쪽은 촘촘하고 뒤쪽은 성기다 — 파면은 그대로 퍼지고, 방출점만 앞으로 밀렸다.
- 조작기 — source-speed(slider)
- 스테이지 — medium
- 뷰 — fronts
- 시간표 — 없음
- 노드 종류 — body · slider · trace

### T66 · `thin-lens`

- 조각 — `aperi21:ray-tracing` · `sims/optics/ray-tracing`
- 문안 — **선언 없음.** 화면 문자가 C1 3층 조회를 지나지 않는 구세대 조각이다
- 조작기 — params(param-panel) · stages(stage-tabs) · views(view-tabs)
- 스테이지 — convex-lens · concave-lens · flat-mirror
- 뷰 — rays · image
- 시간표 — 없음
- 노드 종류 — body · marker · opticalElement · ray

### T67 · `thin-lens`

- 조각 — `aperi21:ray-tracing` · `sims/optics/ray-tracing`
- 문안 — **선언 없음.** 화면 문자가 C1 3층 조회를 지나지 않는 구세대 조각이다
- 조작기 — params(param-panel) · stages(stage-tabs) · views(view-tabs)
- 스테이지 — convex-lens · concave-lens · flat-mirror
- 뷰 — rays · image
- 시간표 — 없음
- 노드 종류 — body · marker · opticalElement · ray

### T73 · `coulombs-law`

- 조각 — `aperi21:coulombs-law` · `sims/em/coulombs-law`
- 문안 14건
  - `label.title` — 쿨롱 법칙
  - `label.operation` — 전하 사이의 힘
  - `label.stage` — 벌어지는 세 쌍
  - `label.view` — 세 줄
  - `mark.plus` — +
  - `mark.force` — F
  - `mark.forceOver` — F/{n}
  - `mark.distance` — r
  - `mark.distanceTimes` — {n}r
  - `caption.same` — 세 쌍 모두 같은 전하, 같은 거리 r — 밀어내는 힘도 같다
  - `caption.moveMid` — 가운데 쌍을 {mid}배 거리로 벌린다 — 힘 화살표가 빠르게 짧아진다
  - `caption.holdMid` — 거리 {mid}배 — 힘은 점선 길이를 {midParts}칸으로 나눈 한 칸이다
  - `caption.moveFar` — 아래 쌍을 {far}배 거리로 벌린다
  - `caption.hold` — 거리 {mid}배에 힘은 {midParts}칸 중 한 칸, {far}배에 {farParts}칸 중 한 칸에 멈췄다
- 조작기 — 없음 (자동 진행)
- 스테이지 — three-pairs
- 뷰 — rows
- 시간표 — appear→caption.same · same→caption.same · move-mid→caption.moveMid · hold-mid→caption.holdMid · move-far→caption.moveFar · hold→caption.hold · fade→caption.hold
- 노드 종류 — body · dimension · lineSet · readout · vector

### T75 · `equipotential-surface`

- 조각 — `aperi21:equipotential-surface` · `sims/em/equipotential-surface`
- 문안 5건
  - `label.title` — 등전위면
  - `label.operation` — 전기장과 수직인 면
  - `label.stage` — 두 전하
  - `label.view` — 지형과 지도
  - `caption.main` — 양전하에서 풀려난 시험 전하가 전위 지형의 가장 가파른 내리막을 따라 내려가며, 등전위선을 만날 때마다 직각으로 가로지른다.
- 조작기 — plus-drag(point-drag) · minus-drag(point-drag)
- 스테이지 — default
- 뷰 — default
- 시간표 — 없음
- 노드 종류 — body · lineSet · region · scalarField

### T79 · `series-parallel-resistors`

- 조각 — `aperi21:dc-circuit` · `sims/electronics/dc-circuit`
- 문안 — **선언 없음.** 화면 문자가 C1 3층 조회를 지나지 않는 구세대 조각이다
- 조작기 — params(param-panel) · stages(stage-tabs) · views(view-tabs)
- 스테이지 — simple · series · parallel
- 뷰 — schematic · meters
- 시간표 — 없음
- 노드 종류 — battery · circuitElement · marker · resistor · terminal · wire

### T57 · `wave-basics`

- 조각 — `aperi21:wave-basics` · `sims/waves/wave-basics`
- 문안 13건
  - `label.title` — 파동의 기본량
  - `label.operation` — 파장·진동수·속력·진폭
  - `label.stage` — 한 줄 파동
  - `label.view` — 줄과 한 점의 자취
  - `label.wavelengthControl` — 파장 λ
  - `label.amplitudeControl` — 진폭 A
  - `label.lambda` — λ
  - `label.amplitude` — A
  - `label.period` — T
  - `label.time` — t
  - `label.point` — P
  - `caption.travel` — P 는 제자리에서 오르내리고, 뒤에서 오던 마루는 P 를 향해 나아간다
  - `caption.result` — P 가 한 번 오르내린 시간 T 동안 마루는 꼭 한 파장 λ 를 갔다
- 조작기 — wavelength(slider) · amplitude(slider)
- 스테이지 — rope
- 뷰 — rope
- 시간표 — travel→caption.travel · hold→caption.result · fade→caption.result
- 노드 종류 — body · dimension · lineSet · readout · slider · trajectory · vector

### T01 · `uniformly-accelerated-motion`

- 조각 — `aperi21:uniformly-accelerated-motion` · `sims/kinematics/uniformly-accelerated-motion`
- 문안 6건
  - `label.title` — 등가속도 운동
  - `label.operation` — 같은 시간 동안 간 거리가 같은 만큼씩 늘어난다
  - `label.stage` — 선로
  - `label.view` — 간격
  - `caption.stamp` — 같은 시간마다 물체가 있던 자리를 찍는다
  - `caption.main` — 같은 시간 동안 간 거리가 매번 같은 만큼씩 늘어난다
- 조작기 — 없음 (자동 진행)
- 스테이지 — track
- 뷰 — gaps
- 시간표 — stamp→caption.stamp · run→caption.main · rest→caption.main · fade→caption.main
- 노드 종류 — body · trace · trajectory

### T03 · `relative-velocity`

- 조각 — `aperi21:relative-velocity` · `sims/kinematics/relative-velocity`
- 문안 10건
  - `label.title` — 상대 속도
  - `label.operation` — 보는 사람이 달라지면 배가 지나온 길이 기운다
  - `label.stage` — 강
  - `label.view` — 강을 건너는 배
  - `label.observer` — 보는 사람의 속도 · 강물 1.2
  - `caption.bank` — 강둑에 서서 본다 — 배가 지나온 길이 오른쪽으로 기운다
  - `caption.river` — 강물에 떠서 같이 흐르며 본다 — 배가 지나온 길이 똑바로 선다
  - `caption.upstream` — 강물을 거슬러 올라가며 본다 — 배가 지나온 길이 오른쪽으로 기운다
  - `caption.slower` — 강물보다 느리게 떠내려가며 본다 — 배가 지나온 길이 오른쪽으로 기운다
  - `caption.faster` — 강물보다 빠르게 떠내려가며 본다 — 배가 지나온 길이 왼쪽으로 기운다
- 조작기 — observer-speed(slider)
- 스테이지 — river
- 뷰 — crossing
- 시간표 — 없음
- 노드 종류 — body · particleSystem · region · slider · trace · trajectory

### T06 · `centripetal-acceleration`

- 조각 — `aperi21:centripetal-acceleration` · `sims/kinematics/centripetal-acceleration`
- 문안 9건
  - `label.title` — 구심 가속도
  - `label.operation` — 속도의 변화는 늘 중심 쪽으로 꺾인다
  - `label.stage` — 등속 원운동
  - `label.view` — 속도의 변화
  - `label.dv` — Δv
  - `caption.keep` — 공의 속도를 한 순간 남겨 둔다
  - `caption.align` — 조금 뒤의 속도와 꼬리를 맞댄다
  - `caption.differ` — 길이는 그대로, 방향만 달라졌다\n그 차이가 Δv
  - `caption.center` — Δv 를 호의 가운데로 옮기면\n중심을 향한다
- 조작기 — 없음 (자동 진행)
- 스테이지 — main
- 뷰 — main
- 시간표 — keep→caption.keep · align→caption.align · grow→caption.differ · hold→caption.differ · move→caption.center · rest→caption.center
- 노드 종류 — body · readout · trajectory · vector

### T07 · `newtons-first-law`

- 조각 — `aperi21:inertial-frame` · `sims/mechanics/inertial-frame`
- 문안 12건
  - `label.title` — 관성 기준계
  - `label.operation` — 버스만 느려지고 승객은 그대로 간다
  - `label.stage` — 도로
  - `label.view` — 땅에서 본 장면
  - `label.bus` — 버스
  - `label.rider` — 승객
  - `label.friction` — 승객의 신발과 바닥 사이 마찰
  - `caption.rolling` — 버스와 승객이 같은 속도로 간다.
  - `caption.busOnly` — 버스만 느려진다. 승객의 자취 간격은 그대로다 — 승객을 민 것은 아무것도 없다.
  - `caption.grip` — 발이 바닥을 붙잡은 만큼만 승객이 느려진다 — 그만큼 자취 간격도 좁아진다.
  - `caption.stopped` — 발이 바닥을 붙잡은 만큼 승객도 느려져, 버스와 함께 섰다.
  - `caption.contact` — 앞칸에 닿고서야 승객에게 처음으로 힘이 걸린다. 그 전까지 승객은 원래 속도로 그냥 가고 있었다.
- 조작기 — friction(slider)
- 스테이지 — road
- 뷰 — ground
- 시간표 — roll→caption.rolling · brake→caption.busOnly · fade→caption.busOnly
- 노드 종류 — body · readout · region · slider · trace · trajectory

### T09 · `inertial-vs-gravitational-mass`

- 조각 — `aperi21:inertial-vs-gravitational-mass` · `sims/mechanics/inertial-vs-gravitational-mass`
- 문안 15건
  - `label.title` — 관성 질량과 중력 질량
  - `label.operation` — 서로 다른 정의가 같은 값을 주는 것
  - `label.stage` — 저울과 얼음
  - `label.view` — 기본
  - `label.balance` — 저울 — 끌리는 세기로 비교
  - `label.ice` — 얼음 위 — 밀리기 어려움으로 비교
  - `control.object` — 올려 볼 물체
  - `object.stone` — 돌
  - `object.iron` — 쇠공
  - `object.wood` — 나무토막
  - `caption.hold` — 추 {n}개를 올렸다. 저울의 받침과 얼음 위 용수철을 한꺼번에 놓는다.
  - `caption.shortStone` — 추 {n}개: 저울은 돌 쪽으로 기울고, 얼음 위에서는 추가 돌보다 멀리 밀려난다.
  - `caption.shortIron` — 추 {n}개: 저울은 쇠공 쪽으로 기울고, 얼음 위에서는 추가 쇠공보다 멀리 밀려난다.
  - `caption.shortWood` — 추 {n}개: 저울은 나무토막 쪽으로 기울고, 얼음 위에서는 추가 나무토막보다 멀리 밀려난다.
  - `caption.match` — 추 {n}개: 저울이 수평을 지키는 바로 그 개수에서, 얼음 위의 둘도 똑같이 밀려난다.
- 조작기 — object(param-chips)
- 스테이지 — default
- 뷰 — default
- 시간표 — 없음
- 노드 종류 — body · constraint · readout · region · spring · trace · trajectory

### T10 · `normal-force`

- 조각 — `aperi21:normal-force` · `sims/mechanics/normal-force`
- 문안 15건
  - `label.title` — 수직항력
  - `label.operation` — 접촉면이 수직으로 미는 힘
  - `label.stage` — 기본
  - `label.view` — 기본
  - `label.weight` — 무게 {w} N
  - `label.pull` — 당김 {f} N
  - `label.push` — 누름 {f} N
  - `label.rodZero` — 막대 힘 0 N
  - `label.normal` — 수직항력 {n} N
  - `caption.floating` — 상자가 떴다 — 바닥은 더 밀 것이 없다
  - `caption.falling` — 놓인 상자가 내려온다 — 닿기 전까지 바닥은 밀지 않는다
  - `caption.balanced` — 당김이 무게와 같아졌다 — 바닥은 밀지 않는다
  - `caption.pulling` — 위로 당기는 만큼 바닥이 덜 민다
  - `caption.pressing` — 아래로 누르는 만큼 바닥이 더 민다
  - `caption.rest` — 막대가 힘을 주지 않으면 바닥은 무게만큼 민다
- 조작기 — 없음 (자동 진행)
- 스테이지 — default
- 뷰 — default
- 시간표 — 없음
- 노드 종류 — readout · region · trajectory · vector

### T11 · `pulley-system`

- 조각 — `aperi21:pulley-system` · `sims/mechanics/pulley-system`
- 문안 13건
  - `label.title` — 도르래
  - `label.operation` — 힘의 방향과 크기를 바꾸는 장치
  - `label.stage` — 기본
  - `label.view` — 기본
  - `label.weight` — {w} N
  - `label.rise` — 오른 높이
  - `label.riseValue` — {h} m
  - `label.pulled` — 당긴 줄 {d} m
  - `label.force` — 힘 {f} N
  - `label.strands` — 짐을 받치는 줄 {n}가닥
  - `caption.rise` — 세 짐이 똑같이 오르는 동안, 받치는 줄이 많은 쪽일수록 손은 약하게 당기며 더 멀리 물러난다.
  - `caption.hold` — 같은 1.00 m를 올리려고 당겨 낸 줄: 1.00 m, 2.00 m, 4.00 m.
  - `caption.lower` — 짐을 내려놓고 다시 올린다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — default
- 뷰 — default
- 시간표 — rise→caption.rise · hold→caption.hold · lower→caption.lower
- 노드 종류 — body · readout · trajectory · vector

### T12 · `centripetal-force`

- 조각 — `aperi21:centripetal-force` · `sims/mechanics/centripetal-force`
- 문안 7건
  - `label.title` — 구심력
  - `label.operation` — 원운동을 유지시키는 힘의 정체
  - `label.stage` — 기본
  - `label.view` — 기본
  - `label.release` — 지금 놓기
  - `caption.attached` — 줄이 공을 매 순간 중심 쪽으로 당겨, 곧게 가려는 공의 방향을 꺾는다
  - `caption.released` — 줄을 놓자 공은 바깥(점선)이 아니라 놓인 순간의 접선을 따라 곧게 날아간다
- 조작기 — release(button)
- 스테이지 — default
- 뷰 — default
- 시간표 — 없음
- 노드 종류 — body · button · constraint · string · trajectory · vector

### T13 · `conical-pendulum`

- 조각 — `aperi21:conical-pendulum` · `sims/mechanics/conical-pendulum`
- 문안 6건
  - `label.title` — 원뿔 진자
  - `label.operation` — 장력과 중력이 만드는 원운동
  - `label.stage` — 기본
  - `label.view` — 기본
  - `label.speed` — 돌리는 빠르기
  - `caption.main` — 줄 길이가 달라도 같은 빠르기로 돌면 세 추는 한 높이에서 돈다 — 빨리 돌수록 그 높이가 함께 올라간다
- 조작기 — speed(slider)
- 스테이지 — default
- 뷰 — default
- 시간표 — 없음
- 노드 종류 — body · region · slider · trajectory

### T14 · `vertical-loop`

- 조각 — `aperi21:vertical-loop` · `sims/mechanics/vertical-loop`
- 문안 12건
  - `label.title` — 연직 원운동
  - `label.operation` — 꼭대기에서 떨어지지 않는 최소 속력
  - `label.stage` — 기본
  - `label.view` — 기본
  - `label.minSpeed` — 꼭대기에서 필요한 최소 속력
  - `label.normal` — 레일이 미는 힘
  - `label.leftRail` — 레일을 떠남
  - `label.fastBall` — 빠르게 들어온 공
  - `label.slowBall` — 조금 느리게 들어온 공
  - `caption.rise` — 두 공 모두 레일에 눌린 채 올라간다 — 높아질수록 느려지고, 레일이 미는 힘도 줄어든다
  - `caption.leave` — 오른쪽 공은 레일이 미는 힘이 0 이 되자 꼭대기에 닿기 전에 레일을 떠나 떨어진다
  - `caption.pass` — 왼쪽 공은 꼭대기에서도 최소 속력보다 빨라, 레일에 눌린 채 계속 돈다
- 조작기 — 없음 (자동 진행)
- 스테이지 — default
- 뷰 — default
- 시간표 — rise→caption.rise · leave→caption.leave · pass→caption.pass · fade→caption.pass
- 노드 종류 — body · readout · trajectory · vector

### T15 · `fictitious-force`

- 조각 — `aperi21:fictitious-force` · `sims/mechanics/fictitious-force`
- 문안 10건
  - `label.title` — 관성력
  - `label.operation` — 비관성계에서 도입하는 겉보기 힘
  - `label.stage` — 기본
  - `label.view` — 기본
  - `label.mass` — 오른쪽 추의 질량
  - `label.massValue` — {m} kg
  - `label.inertial` — 관성력
  - `label.gravity` — 중력
  - `caption.main` — 관성력도 중력처럼 질량에 비례한다 — 그래서 무거운 추와 가벼운 추가 언제나 같은 각도로 기운다
  - `caption.equal` — 관성력도 중력처럼 질량에 비례한다 — 그래서 두 추는 질량이 얼마든 언제나 같은 각도로 기운다
- 조작기 — mass(slider)
- 스테이지 — default
- 뷰 — default
- 시간표 — 없음
- 노드 종류 — body · readout · slider · trajectory · vector

### T17 · `youngs-modulus`

- 조각 — `aperi21:youngs-modulus` · `sims/mechanics/youngs-modulus`
- 문안 10건
  - `label.title` — 영률
  - `label.operation` — 늘어나는 정도는 선의 길이가 아니라 재료가 정한다
  - `label.stage` — 기본
  - `label.view` — 기본
  - `label.wire.steel` — 강철 {l} m
  - `label.wire.aluminium` — 알루미늄 {l} m
  - `label.mass` — {m} kg
  - `label.stretch` — 늘어남 {x} mm
  - `label.scaleNote` — 늘어난 길이는 약 {k}배로 키워 그림 · 선 지름 {d} mm · 눈금 {c} cm 마다
  - `caption.main` — 같은 추를 걸면 강철선의 눈금은 선의 길이와 상관없이 같은 높이까지 내려오고, 알루미늄선의 눈금은 그보다 더 내려온다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — default
- 뷰 — default
- 시간표 — 없음
- 노드 종류 — body · readout · trace · trajectory

### T18 · `work-energy-theorem`

- 조각 — `aperi21:work-energy-theorem` · `sims/mechanics/work-energy-theorem`
- 문안 14건
  - `label.title` — 일-운동 에너지 정리
  - `label.operation` — 알짜일이 운동 에너지 변화와 같음
  - `label.stage` — 마찰 없는 바닥
  - `label.view` — 두 레인
  - `label.forceBig` — 2F
  - `label.forceSmall` — F
  - `label.speed` — v
  - `label.workShort` — 2F × d
  - `label.workLong` — F × 2d
  - `label.tick1` — d
  - `label.tick2` — 2d
  - `caption.push` — 같은 수레 둘을 민다 — 위는 2F 로 d 까지, 아래는 F 로 2d 까지
  - `caption.split` — 위 수레는 밀기가 끝났다 — 아래 수레는 아직 밀리며 속력이 붙는 중이다
  - `caption.result` — 힘과 거리는 달랐지만 한 일이 같다 — 두 수레에 같은 속력이 붙어 간격을 그대로 두고 달린다
- 조작기 — 없음 (자동 진행)
- 스테이지 — frictionless
- 뷰 — lanes
- 시간표 — ready→caption.push · push-both→caption.push · push-long→caption.split · coast→caption.result · fade→caption.result
- 노드 종류 — body · lineSet · readout · region · surface · trajectory · vector

### T19 · `conservative-force`

- 조각 — `aperi21:conservative-force` · `sims/mechanics/conservative-force`
- 문안 15건
  - `label.title` — 보존력
  - `label.operation` — 경로에 무관한 힘과 퍼텐셜의 존재
  - `label.stage` — 두 길
  - `label.view` — 중력이 한 일
  - `label.pointA` — A
  - `label.pointB` — B
  - `label.path1` — 길 1
  - `label.path2` — 길 2
  - `label.gravity` — mg
  - `label.work1` — W₁
  - `label.work2` — W₂
  - `label.height` — h
  - `caption.out` — 길 1 은 올라가는 동안 중력이 한 일이 깎이고, 길 2 는 내려가는 만큼 쌓인다
  - `caption.back` — 길 1 은 내려오며 되찾고, 길 2 는 올라오며 넘친 만큼 돌려준다
  - `caption.result` — 두 길 모두 중력이 한 일은 A 와 B 의 높이 차 h 에서 멈췄다
- 조작기 — 없음 (자동 진행)
- 스테이지 — two-paths
- 뷰 — work
- 시간표 — out→caption.out · back→caption.back · hold→caption.result · fade→caption.result
- 노드 종류 — body · dimension · readout · region · trajectory · vector

### T21 · `energy-dissipation`

- 조각 — `aperi21:energy-dissipation` · `sims/mechanics/energy-dissipation`
- 문안 10건
  - `label.title` — 에너지 소산
  - `label.operation` — 마찰이 가져가는 몫과 그 행방
  - `label.stage` — 거친 바닥
  - `label.view` — 기본
  - `label.mechanical` — 역학적 에너지
  - `label.heat` — 열
  - `label.floorHeat` — 문지른 자리에 쌓인 열
  - `caption.slide` — 오갈 때마다 물체가 바닥을 문지른다. 역학적 에너지 몫이 줄어든 만큼 열의 몫이 올라오고, 줄어든 에너지는 문지른 자리에 그대로 쌓인다.
  - `caption.rest` — 물체가 멈췄다. 처음 에너지는 남김없이 열이 되었고, 가장 여러 번 문지른 가운데에 가장 두껍게 쌓여 있다.
  - `caption.reset` — 쌓인 열을 치우고 물체를 처음 자리로 다시 당긴다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — rough-floor
- 뷰 — default
- 시간표 — slide→caption.slide · rest→caption.rest · reset→caption.reset
- 노드 종류 — body · constraint · readout · region · spring · surface · trajectory

### T22 · `elastic-collision`

- 조각 — `aperi21:elastic-collision` · `sims/mechanics/elastic-collision`
- 문안 12건
  - `label.title` — 탄성 충돌
  - `label.operation` — 운동 에너지까지 보존되는 충돌
  - `label.stage` — 레일 위 같은 공 둘
  - `label.view` — 속도 화살표
  - `label.mass` — m
  - `label.v` — v
  - `label.halfV` — ½v
  - `caption.approachRest` — 왼쪽 공이 v 로 달려와, 멈춰 있는 같은 질량의 공에 부딪친다.
  - `caption.contact` — 닿아 있는 짧은 순간 — 한쪽 화살표가 줄어드는 만큼 다른 쪽 화살표가 자란다.
  - `caption.afterRest` — 부딪친 공은 그 자리에 멈추고, 맞은 공이 v 를 줄지 않은 채 그대로 받아 떠난다.
  - `caption.approachBoth` — 이번에는 둘 다 움직인다 — 왼쪽 공은 v, 오른쪽 공은 ½v 로 마주 온다.
  - `caption.afterBoth` — 두 공이 속도를 통째로 바꿔 가졌다 — 왼쪽 공은 ½v 로 되돌아가고, 오른쪽 공이 v 로 떠난다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — rail
- 뷰 — arrows
- 시간표 — appear-rest→caption.approachRest · approach-rest→caption.approachRest · contact-rest→caption.contact · apart-rest→caption.afterRest · fade-rest→caption.afterRest · appear-both→caption.approachBoth · approach-both→caption.approachBoth · contact-both→caption.contact · apart-both→caption.afterBoth · fade-both→caption.afterBoth
- 노드 종류 — body · readout · trajectory · vector

### T23 · `inelastic-collision`

- 조각 — `aperi21:inelastic-collision` · `sims/mechanics/inelastic-collision`
- 문안 16건
  - `label.title` — 비탄성 충돌
  - `label.operation` — 에너지가 사라지는 충돌
  - `label.stage` — 바닥에 떨어뜨린 공
  - `label.view` — 튀는 공
  - `label.restitution` — e = {e}
  - `label.apex0` — h
  - `label.apex1` — e²h
  - `label.apex2` — e⁴h
  - `label.apex3` — e⁶h
  - `label.apex4` — e⁸h
  - `label.vIn` — v
  - `label.vOut` — ev
  - `label.lost` — 사라진 에너지
  - `caption.fall` — 높이 h 에서 놓은 공이 바닥으로 떨어진다.
  - `caption.bounce` — 부딪힐 때마다 공은 들어온 빠르기의 e 배로만 튀어 나온다 — 그래서 매번 앞 꼭짓점보다 낮게 오른다.
  - `caption.hold` — 꼭짓점이 매번 e² 배로 낮아졌다. 모자란 높이만큼의 에너지가 부딪힐 때마다 찌그러짐과 열로 빠져나갔다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — dropped-ball
- 뷰 — bouncing-ball
- 시간표 — appear→caption.fall · fall→caption.fall · bounce→caption.bounce · hold→caption.hold · fade→caption.hold
- 노드 종류 — body · dimension · readout · surface · trace · trajectory · vector

### T24 · `rocket-equation`

- 조각 — `aperi21:rocket-equation` · `sims/mechanics/rocket-equation`
- 문안 8건
  - `label.title` — 로켓 방정식
  - `label.operation` — 연료를 버려 얻는 속도
  - `label.stage` — 연료 여덟 칸
  - `label.view` — 로켓과 얻은 속도
  - `label.gain` — 한 칸이 붙인 속도
  - `caption.early` — 칸마다 같은 양의 연료를 같은 빠르기로 뒤로 뿜는다. 아직 실려 있는 연료가 무거워 한 칸이 붙이는 속도는 작다.
  - `caption.later` — 로켓이 가벼워질수록 같은 한 칸이 붙이는 속도가 커진다 — 아래 막대가 길어지고, 지나가는 별의 획도 길어진다.
  - `caption.hold` — 마지막 칸이 붙인 속도는 첫 칸의 네 배에 가깝다. 먼저 태운 칸은 뒤에 남은 연료까지 함께 밀어야 했다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — eight-blocks
- 뷰 — gain
- 시간표 — burn-1→caption.early · coast-1→caption.early · burn-2→caption.early · coast-2→caption.early · burn-3→caption.early · coast-3→caption.early · burn-4→caption.later · coast-4→caption.later · burn-5→caption.later · coast-5→caption.later · burn-6→caption.later · coast-6→caption.later · burn-7→caption.later · coast-7→caption.later · burn-8→caption.later · coast-8→caption.later · hold→caption.hold · clear→caption.hold
- 노드 종류 — lineSet · particleSystem · readout · region · stream · trajectory

### T25 · `ballistic-pendulum`

- 조각 — `aperi21:ballistic-pendulum` · `sims/mechanics/ballistic-pendulum`
- 문안 19건
  - `label.title` — 탄동 진자
  - `label.operation` — 충돌과 에너지 보존을 잇는 측정
  - `label.stage` — 매단 나무토막
  - `label.view` — 두 막대
  - `label.momentum` — 운동량
  - `label.energy` — 에너지
  - `label.kinetic` — 운동
  - `label.potential` — 위치
  - `label.lost` — 사라진 몫
  - `label.kept` — 그대로
  - `label.height` — h
  - `control.blockMass` — 나무토막
  - `option.mass08` — 0.8 kg
  - `option.mass14` — 1.4 kg
  - `option.mass24` — 2.4 kg
  - `caption.fly` — 날아오는 탄알 하나가 운동량과 에너지를 모두 가지고 있다.
  - `caption.impact` — 박히는 동안 운동량 막대는 그대로 서 있고, 에너지 막대만 무너진다 — 사라진 몫은 열과 찌그러짐으로 나갔다.
  - `caption.rise` — 올라가는 동안에는 에너지 막대의 높이가 그대로다 — 운동이 위치로 옮겨 갈 뿐이고, 줄어드는 것은 운동량 막대다.
  - `caption.top` — 멈춘 높이 h 는 박힌 뒤 남은 에너지만큼이다. 사라진 몫은 토막을 들어 올리지 않는다.
- 조작기 — block-mass(param-chips)
- 스테이지 — hanging-block
- 뷰 — bars
- 시간표 — fly→caption.fly · impact→caption.impact · rise→caption.rise · top→caption.top · fade→caption.top
- 노드 종류 — body · constraint · dimension · readout · region · string · surface · trajectory

### T26 · `angular-momentum`

- 조각 — `aperi21:angular-momentum` · `sims/oscillation/angular-momentum`
- 문안 11건
  - `label.title` — 각운동량
  - `label.operation` — 회전의 운동량
  - `label.stage` — 바닥 위 팽이 셋
  - `label.view` — 비스듬히 내려다본 모습
  - `label.still` — 안 돈다
  - `label.slow` — 천천히 돈다
  - `label.fast` — 빠르게 돈다
  - `caption.spin` — 같은 팽이 셋 — 하나는 안 돌고, 하나는 천천히, 하나는 빠르게 돈다
  - `caption.tap` — 셋의 머리를 옆에서 똑같이 툭 친다
  - `caption.respond` — 안 도는 팽이는 쓰러지고, 천천히 도는 팽이는 크게 휘청인다 — 빠른 팽이는 거의 기울지 않는다
  - `caption.result` — 많이 도는 팽이일수록 같은 충격에도 축이 덜 기운다
- 조작기 — 없음 (자동 진행)
- 스테이지 — three-tops
- 뷰 — oblique
- 시간표 — spin→caption.spin · tap→caption.tap · respond→caption.respond · hold→caption.result · fade→caption.result
- 노드 종류 — body · lineSet · readout · region · trajectory · vector

### T27 · `mass-spring-system`

- 조각 — `aperi21:mass-spring-system` · `sims/oscillation/mass-spring-system`
- 문안 12건
  - `label.title` — 용수철 진자
  - `label.operation` — 질량과 탄성 계수가 정하는 주기
  - `label.stage` — 같은 용수철 셋
  - `label.view` — 나란한 세 레인
  - `label.massLight` — m
  - `label.massHeavy` — 4m
  - `label.ampSmall` — A
  - `label.ampWide` — 2A
  - `caption.hold` — 같은 용수철 셋. 아래 추만 네 배 무겁고, 가운데 추만 두 배 멀리 당겨 두었다.
  - `caption.swingA` — 위의 두 추는 당긴 거리가 달라도 같은 순간 출발 자리로 돌아온다 — 돌아올 때마다 오른쪽에 점이 하나씩 찍힌다.
  - `caption.swingB` — 네 배 무거운 추가 한 번 오가는 동안 가벼운 추는 두 번 오간다.
  - `caption.together` — 네 번과 두 번 — 세 추가 다시 함께 출발 자리에 섰다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — three-springs
- 뷰 — lanes
- 시간표 — hold→caption.hold · swingA→caption.swingA · swingB→caption.swingB · together→caption.together · clear→caption.hold
- 노드 종류 — body · constraint · dimension · readout · spring · surface · trace · trajectory

### T30 · `phase-space`

- 조각 — `aperi21:phase-space` · `sims/oscillation/phase-space`
- 문안 12건
  - `label.title` — 위상 공간
  - `label.operation` — 위치-속도 평면에서 본 운동
  - `label.stage` — 감쇠 진자
  - `label.view` — 위상 평면
  - `axis.angle` — 각도 →
  - `axis.angularVelocity` — 각속도 ↑
  - `axis.inverted` — 거꾸로 섬
  - `axis.bottom` — 바닥
  - `control.friction` — 마찰
  - `caption.zero` — 마찰이 없으면 상태점은 제가 선 고리를 따라 돌 뿐, 안쪽 고리로 옮겨 가지 않는다.
  - `caption.spiral` — 마찰이 에너지를 빼는 만큼 상태점이 고리를 가로질러 바닥 한 점으로 감겨 든다.
  - `caption.settled` — 고리를 하나씩 가로지른 상태점이 바닥 한 점에 감겨 들어 멈췄다.
- 조작기 — friction(slider)
- 스테이지 — default
- 뷰 — default
- 시간표 — 없음
- 노드 종류 — body · lineSet · particleSystem · readout · slider · trajectory

### T31 · `gravitational-field`

- 조각 — `aperi21:gravitational-field` · `sims/astro/gravitational-field`
- 문안 8건
  - `label.title` — 중력장
  - `label.operation` — 공간에 분포한 중력의 세기
  - `label.stage` — 행성 하나
  - `label.view` — 장
  - `caption.field` — 행성 둘레 모든 자리에 화살표가 깔려 있다 — 가까울수록 길고, 멀수록 짧다
  - `caption.place` — 세 자리에 작은 질량을 놓는다 — 저마다 제자리 화살표를 받는다
  - `caption.fall` — 셋은 각자 제자리 화살표 방향으로 끌려가고, 가까워질수록 받는 화살표가 길어진다
  - `caption.hold` — 질량이 떠난 자리에도 화살표는 그대로다 — 장은 질량이 오기 전부터 있었다
- 조작기 — 없음 (자동 진행)
- 스테이지 — one-planet
- 뷰 — field
- 시간표 — field→caption.field · place→caption.place · fall→caption.fall · hold→caption.hold · fade→caption.hold
- 노드 종류 — body · trajectory · vector

### T32 · `shell-theorem`

- 조각 — `aperi21:shell-theorem` · `sims/astro/shell-theorem`
- 문안 10건
  - `label.title` — 껍질 정리
  - `label.operation` — 구 껍질 안팎에서의 중력
  - `label.stage` — 속 빈 껍질
  - `label.view` — 단면
  - `label.net` — 합 = 0
  - `caption.approach` — 껍질 밖에서는 가까워질수록 중심 쪽으로 세게 끌린다
  - `caption.enter` — 껍질을 넘어 안으로 들어서자 당김이 사라진다
  - `caption.cones` — 가까운 쪽 좁은 조각과 먼 쪽 넓은 조각이 같은 크기로 맞서 당긴다 — 어느 방향이든
  - `caption.wander` — 안 어디로 옮겨도 두 당김은 늘 맞서고, 합은 0 이다
  - `caption.exit` — 껍질 밖으로 나서자 다시 중심 쪽으로 끌린다
- 조작기 — 없음 (자동 진행)
- 스테이지 — hollow-shell
- 뷰 — section
- 시간표 — appear→caption.approach · approach→caption.approach · enter→caption.enter · open→caption.cones · cones→caption.cones · wander→caption.wander · linger→caption.wander · close→caption.exit · exit→caption.exit · fade→caption.exit
- 노드 종류 — body · readout · region · trajectory · vector

### T33 · `keplers-third-law`

- 조각 — `aperi21:keplers-third-law` · `sims/astro/keplers-third-law`
- 문안 17건
  - `label.title` — 케플러 제3법칙
  - `label.operation` — 주기와 긴반지름의 관계
  - `label.stage` — 반지름이 다른 두 궤도
  - `label.view` — 두 행성
  - `label.strip` — 한 바퀴에 걸린 시간
  - `label.inner` — 안쪽
  - `label.outer` — 바깥
  - `label.ghost` — 안쪽과 같은 빠르기라면
  - `sym.a` — a
  - `sym.ra` — {r}a
  - `sym.T` — T
  - `sym.pT` — {p}T
  - `sym.lap` — {n}
  - `caption.depart` — 두 행성이 출발선에서 함께 떠난다 — 안쪽 행성은 금세 한 바퀴를 돌아 온다
  - `caption.race` — 안쪽 행성이 바퀴를 거듭하는 동안 바깥 행성은 조금씩 나아갈 뿐이다
  - `caption.ghost` — 안쪽 행성의 빠르기였다면 바깥 행성은 벌써 한 바퀴를 마쳤다(점선) — 실제로는 더 느리게 가서 아직 한참 남았다
  - `caption.hold` — 바깥 행성이 겨우 한 바퀴를 마쳤다 — 그동안 안쪽 행성은 칸 수만큼 돌아 함께 출발선에 섰다
- 조작기 — 없음 (자동 진행)
- 스테이지 — two-orbits
- 뷰 — orbits
- 시간표 — depart→caption.depart · race→caption.race · half→caption.ghost · meet→caption.hold · hold→caption.hold · fade→caption.hold
- 노드 종류 — body · readout · region · trajectory

### T34 · `lagrange-points`

- 조각 — `aperi21:lagrange-points` · `sims/astro/lagrange-points`
- 문안 8건
  - `label.title` — 라그랑주 점
  - `label.operation` — 안장에서는 흘러나가고 꼭대기에서는 맴돈다
  - `label.stage` — 지구와 달
  - `label.view` — 함께 도는 틀
  - `label.earth` — 지구
  - `label.moon` — 달
  - `label.point` — L{n}
  - `caption.main` — 지구와 달을 따라 함께 도는 틀에서, 다섯 평형점 곁에 살짝 비껴 놓은 물체는 안장인 L1·L2·L3에서는 흘러나가고 언덕 꼭대기인 L4·L5에서는 그 둘레를 맴돈다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — default
- 뷰 — default
- 시간표 — 없음
- 노드 종류 — body · lineSet · particleSystem · readout · scalarField

### T35 · `orbital-transfer`

- 조각 — `aperi21:orbital-transfer` · `sims/astro/orbital-transfer`
- 문안 12건
  - `label.title` — 궤도 전이
  - `label.operation` — 호만 전이와 그 비용
  - `label.stage` — 호만 전이
  - `label.view` — 두 번 밀기
  - `label.dv1` — Δv₁
  - `label.dv2` — Δv₂
  - `caption.low` — 낮은 원 궤도를 도는 우주선 — 화살표의 길이가 빠르기다
  - `caption.burn1` — 진행 방향으로 한 번 민다 — 빨라진다
  - `caption.transfer` — 타원을 따라 올라가는 동안 점점 느려진다 — 밀지 않고 낮은 궤도에 남은 옅은 점보다도 느리다
  - `caption.burn2` — 반 바퀴 뒤 가장 높은 곳에서 한 번 더 민다
  - `caption.high` — 높은 원 궤도에 올라섰다 — 두 번 밀었는데 처음보다 느리게 돈다
  - `caption.cost` — 옮겨 가는 데 든 것은 짧은 두 번의 밀기(Δv₁ · Δv₂)뿐이다
- 조작기 — 없음 (자동 진행)
- 스테이지 — hohmann
- 뷰 — two-pushes
- 시간표 — low→caption.low · burn1→caption.burn1 · transfer→caption.transfer · burn2→caption.burn2 · high→caption.high · hold→caption.cost · fade→caption.cost
- 노드 종류 — body · trajectory · vector

### T36 · `diurnal-motion`

- 조각 — `aperi21:diurnal-motion` · `sims/astro/diurnal-motion`
- 문안 20건
  - `label.title` — 일주 운동
  - `label.operation` — 하루 동안 태양과 별이 하늘을 가로지르는 길
  - `label.stage` — 북쪽 하늘
  - `label.view` — 땅 위에서
  - `label.skyTitle` — 북쪽 하늘을 바라볼 때 — 북위 {lat}°
  - `label.polaris` — 북극성
  - `label.bigDipper` — 북두칠성
  - `label.cassiopeia` — 카시오페이아
  - `label.north` — 북
  - `label.west` — ← 서
  - `label.east` — 동 →
  - `label.elapsed` — 흐른 시간
  - `label.dusk` — 저녁
  - `label.midnight` — 자정
  - `label.dawn` — 새벽
  - `label.noon` — 정오
  - `caption.dusk` — 하루를 빨리 감는다. 별마다 북극성을 가운데 둔 원을 따라 시계 반대 방향으로 돈다.
  - `caption.midnight` — 안쪽 별은 작은 원, 바깥 별은 큰 원을 그리지만 같은 시간에 도는 각은 모두 같다 — 북두칠성은 모양 그대로 돈다.
  - `caption.daytime` — 낮에는 햇빛에 가려 보이지 않을 뿐, 별은 같은 빠르기로 계속 돈다. 지평선 아래로 졌다가 다시 뜨는 별도 있다.
  - `caption.full` — 하루가 지나 모든 별이 한 바퀴를 돌아 제자리에 왔다 — 하늘 전체가 한 덩어리로 돈다. 지구가 반대쪽으로 한 바퀴 돈 만큼이다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — northern-sky
- 뷰 — ground
- 시간표 — dusk→caption.dusk · midnight→caption.midnight · daytime→caption.daytime · full→caption.full · reset→caption.full
- 노드 종류 — lineSet · particleSystem · readout · region · sector · trajectory

### T37 · `solar-altitude-shadow`

- 조각 — `aperi21:solar-altitude-shadow` · `sims/astro/solar-altitude-shadow`
- 문안 16건
  - `label.title` — 태양 고도와 그림자
  - `label.operation` — 고도가 바뀌면 그림자 길이와 기온이 함께 바뀐다
  - `label.stage` — 땅 위의 막대
  - `label.view` — 옆에서
  - `label.sun` — 태양
  - `label.stick` — 막대
  - `label.shadow` — 그림자
  - `label.altitude` — {alt}°
  - `label.sameWidth` — 같은 폭의 햇빛
  - `label.litGround` — 닿는 땅
  - `label.perArea` — 넓이당 햇빛
  - `caption.low` — 해가 낮게 뜨면 막대 그림자가 길게 눕고, 같은 폭의 햇빛이 넓은 땅에 퍼진다 — 땅 한 칸이 받는 빛이 적다.
  - `caption.rise` — 해가 높이 오른다. 그림자가 줄어들고, 햇빛이 닿는 땅이 좁아지며 밝아진다.
  - `caption.mid` — 고도가 오른 만큼 그림자가 짧아졌다. 같은 햇빛이 더 좁은 땅에 모인다.
  - `caption.high` — 해가 높으면 그림자가 짧고, 같은 햇빛이 좁은 땅에 모인다 — 땅 한 칸이 받는 빛이 많아 땅이 더 데워진다.
  - `caption.fall` — 해가 다시 낮아지면 그림자가 길어지고, 햇빛이 넓게 흩어져 땅 한 칸이 받는 빛이 줄어든다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — stick-on-ground
- 뷰 — side
- 시간표 — low→caption.low · riseMid→caption.rise · mid→caption.mid · riseHigh→caption.rise · high→caption.high · fall→caption.fall
- 노드 종류 — body · dimension · lineSet · readout · region · sector · surface · trajectory

### T38 · `star-radiation-gravity-balance`

- 조각 — `aperi21:star-radiation-gravity-balance` · `sims/astro/star-radiation-gravity-balance`
- 문안 13건
  - `label.title` — 복사압과 중력의 평형
  - `label.operation` — 별이 무너지지도 흩어지지도 않는 이유
  - `label.stage` — 별 하나
  - `label.view` — 별의 단면
  - `label.gravity` — 중력
  - `label.pressure` — 압력
  - `label.calmSize` — 처음 크기
  - `caption.calm` — 어느 층에서나 안으로 당기는 중력과 밖으로 미는 압력이 같다 — 별은 제 크기를 지킨다
  - `caption.swell` — 중심에서 내는 에너지가 늘자 압력이 이겨 별이 부푼다 — 부풀수록 식어 미는 힘이 줄어든다
  - `caption.big` — 압력과 중력이 다시 같아졌다 — 더 큰 별이 되어 새 균형에 멈췄다
  - `caption.shrink` — 에너지가 줄자 중력이 이겨 별이 오그라든다 — 오그라들수록 데워져 미는 힘이 커진다
  - `caption.small` — 다시 같아졌다 — 더 작고 뜨거운 별이 되어 균형을 찾았다
  - `caption.return` — 에너지가 처음으로 돌아가면 별도 밀려 나가 처음 크기에서 다시 멈춘다
- 조작기 — 없음 (자동 진행)
- 스테이지 — one-star
- 뷰 — cross-section
- 시간표 — calm→caption.calm · boost→caption.swell · swell→caption.swell · big→caption.big · cut→caption.shrink · shrink→caption.shrink · small→caption.small · restore→caption.return · return→caption.return
- 노드 종류 — body · readout · region · trajectory · vector

### T39 · `buoyancy`

- 조각 — `aperi21:buoyancy` · `sims/fluids/buoyancy`
- 문안 10건
  - `label.title` — 부력
  - `label.operation` — 밀려난 유체의 무게만큼
  - `label.stage` — 물통
  - `label.view` — 면마다 미는 힘
  - `label.topFace` — 윗면
  - `label.bottomFace` — 아랫면
  - `label.buoyancy` — 부력
  - `caption.enter` — 잠겨 들수록 아랫면이 깊어져 물이 더 세게 밀어 올린다
  - `caption.sink` — 더 내려가면 윗면도 아랫면도 더 세게 밀린다 — 둘의 차이는 그대로다
  - `caption.hold` — 아랫면은 윗면보다 상자 높이만큼 깊다 — 그만큼 더 받는 힘이 부력이다
- 조작기 — 없음 (자동 진행)
- 스테이지 — tank
- 뷰 — faces
- 시간표 — appear→caption.enter · enter→caption.enter · sink→caption.sink · hold→caption.hold · fade→caption.hold
- 노드 종류 — body · readout · region · trajectory · vector

### T40 · `archimedes-principle`

- 조각 — `aperi21:archimedes-principle` · `sims/fluids/archimedes-principle`
- 문안 11건
  - `label.title` — 아르키메데스 원리 — 부력의 크기
  - `label.operation` — 2.0 kg · 1.0 L 물체를 주둥이까지 가득 찬 물에 천천히 담근다. 밀려난 물이 주둥이로 넘쳐 컵에 모이고, 물체 쪽 저울이 줄어드는 만큼 넘친 물 쪽 저울이 늘어난다.
  - `label.stage` — 실험대
  - `label.stageNote` — 물 밀도 1000 kg/m³, 중력 가속도 9.8 m/s²
  - `label.view` — 두 저울
  - `label.objectScale` — 물체 쪽 저울
  - `label.waterScale` — 넘친 물 쪽 저울
  - `label.buoyancy` — 부력
  - `label.brimFull` — 주둥이까지 가득
  - `label.claim` — 줄어든 무게 = 넘친 물의 무게
  - `control.submersion` — 잠긴 정도
- 조작기 — submersion(slider)
- 스테이지 — bench
- 뷰 — balance
- 시간표 — 없음
- 노드 종류 — body · marker · region · scale · slider · stream · surface · vector

### T42 · `viscosity`

- 조각 — `aperi21:viscosity` · `sims/fluids/viscosity`
- 문안 13건
  - `label.title` — 점성
  - `label.operation` — 층 사이의 마찰
  - `label.stage` — 두 판 사이
  - `label.view` — 옆모습
  - `label.thin` — 묽은 유체
  - `label.thick` — 끈적한 유체
  - `label.viscosity` — η
  - `label.viscosityTimes` — {n}η
  - `label.force` — F
  - `label.forceTimes` — {n}F
  - `caption.still` — 두 판 사이에 유체가 차 있다. 아래 판은 붙박여 있고, 위 판은 아직 서 있다.
  - `caption.drag` — 위 판을 끌면 판에 닿은 층이 끌려가고, 그 층이 바로 아래 층을 끈다 — 아래로 갈수록 덜 끌린다.
  - `caption.compare` — 두 유체의 층은 똑같이 끌려간다. 다른 것은 끄는 힘 — 점성이 {ratio}배인 쪽은 같은 빠르기로 끄는 데 힘이 {ratio}배 든다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — two-plates
- 뷰 — side
- 시간표 — still→caption.still · drag→caption.drag · compare→caption.compare · fade→caption.compare
- 노드 종류 — lineSet · particleSystem · readout · region · vector

### T44 · `reynolds-number`

- 조각 — `aperi21:reynolds-number` · `sims/fluids/reynolds-number`
- 문안 12건
  - `label.title` — 레이놀즈 수
  - `label.operation` — 전이를 가르는 무차원 수
  - `label.stage` — 세 관
  - `label.view` — 염료
  - `label.pipeTop` — D · v
  - `label.pipeMid` — D/2 · 2v
  - `label.pipeBottom` — D/2 · v
  - `label.re` — Re {re}
  - `caption.low` — 위(굵은 관 · 느린 물)와 가운데(가는 관 · 두 배 빠른 물)는 Re 가 같다 — 둘 다 곧게 흐른다
  - `caption.rise` — 세 관이 모두 같은 비율로 빨라진다
  - `caption.high` — 위와 가운데는 같은 자리에서 함께 흐트러진다 — 위와 빠르기가 같은 아래만 곧다
  - `caption.fall` — 다시 느려지면 위와 가운데가 함께 가라앉는다
- 조작기 — 없음 (자동 진행)
- 스테이지 — three-pipes
- 뷰 — dye
- 시간표 — low→caption.low · rise→caption.rise · high→caption.high · fall→caption.fall
- 노드 종류 — filament · readout · stream · surface · vortexField

### T46 · `drag-in-fluid`

- 조각 — `aperi21:drag-in-fluid` · `sims/fluids/drag-in-fluid`
- 문안 10건
  - `label.title` — 유체 속 항력
  - `label.operation` — 형상과 속도가 정하는 저항
  - `label.stage` — 같은 흐름
  - `label.view` — 두 레인
  - `label.cylinder` — 원기둥
  - `label.streamlined` — 유선형
  - `label.drag` — 저항
  - `caption.flow` — 같은 빠르기의 흐름에 두께가 같은 원기둥과 유선형을 세웠다
  - `caption.wake` — 원기둥 뒤로는 소용돌이가 번갈아 떨어져 넓게 번지고, 뒤가 매끈한 유선형 뒤는 좁게 닫힌다
  - `caption.drag` — 같은 빠르기에서 받는 저항 — 유선형은 원기둥의 10분의 1쯤이다
- 조작기 — 없음 (자동 진행)
- 스테이지 — default
- 뷰 — main
- 시간표 — flow→caption.flow · wake→caption.wake · drag→caption.drag · hold→caption.drag · fade→caption.drag
- 노드 종류 — body · particleSystem · readout · trajectory · vector

### T47 · `latent-heat`

- 조각 — `aperi21:latent-heat` · `sims/thermal/latent-heat`
- 문안 17건
  - `label.title` — 잠열
  - `label.operation` — 상변화 중 온도가 멈추는 이유
  - `label.stage` — 얼음 · 일정한 가열
  - `label.view` — 그릇과 시간-온도 곡선
  - `label.ice` — 얼음
  - `label.water` — 물
  - `label.steam` — 김
  - `label.tempAxis` — 온도
  - `label.timeAxis` — 시간 →
  - `label.tick` — {t} ℃
  - `label.latent` — {l} kJ/kg
  - `caption.ready` — {t0} ℃ 얼음 {m} kg 이 가열기 위 그릇에 담겨 있다
  - `caption.heatIce` — 일정한 세기로 데운다 — 얼음의 온도가 오른다
  - `caption.melt` — 같은 세기로 계속 데우는데 온도가 {tm} ℃ 에서 멈췄다 — 얼음이 줄고 물이 는다
  - `caption.heatWater` — 얼음이 다 녹자 온도가 다시 오른다
  - `caption.boil` — 물이 끓는 동안 온도가 {tb} ℃ 에서 멈춰 있다 — 물이 줄고 김이 는다
  - `caption.hold` — 물이 모두 김이 되었다 — {tb} ℃ 에서 멈춘 구간이 {tm} ℃ 에서 멈춘 구간보다 훨씬 길다
- 조작기 — 없음 (자동 진행)
- 스테이지 — default
- 뷰 — main
- 시간표 — ready→caption.ready · heat-ice→caption.heatIce · melt→caption.melt · heat-water→caption.heatWater · boil→caption.boil · hold→caption.hold · fade→caption.hold
- 노드 종류 — body · dimension · lineSet · particleSystem · readout · region · trajectory · vector

### T48 · `phase-diagram`

- 조각 — `aperi21:phase-diagram` · `sims/thermal/phase-diagram`
- 문안 23건
  - `label.title` — 상평형 그림
  - `label.operation` — 삼중점보다 낮은 압력에서는 액체 구간을 건너뛴다
  - `label.stage` — 기본
  - `label.view` — 기본
  - `label.solid` — 고체
  - `label.liquid` — 액체
  - `label.gas` — 기체
  - `label.triplePoint` — 삼중점
  - `label.pressureAxis` — 압력 ↑
  - `label.temperatureAxis` — 온도 →
  - `label.pathHigh` — 높은 압력
  - `label.pathLow` — 낮은 압력
  - `label.pathChosen` — 고른 압력
  - `label.sample` — 시료 속 입자
  - `label.pressureControl` — 압력 고르기
  - `caption.heatSolidHigh` — 삼중점보다 높은 압력에서 고체를 데운다
  - `caption.heatSolidLow` — 삼중점보다 낮은 압력에서 고체를 데운다
  - `caption.melt` — 경계선에 닿자 온도가 멈추고, 고체가 녹아 액체가 된다
  - `caption.heatLiquid` — 다시 온도가 오른다 — 지금은 액체다
  - `caption.boil` — 두 번째 경계선에서 다시 멈추고, 액체가 끓어 기체가 된다
  - `caption.sublimate` — 경계선이 하나뿐이다 — 고체가 액체를 거치지 않고 곧바로 기체가 된다
  - `caption.twoCrossings` — 고체 → 액체 → 기체: 경계선을 두 번 건넜다
  - `caption.skipped` — 고체 → 기체: 액체 구간을 건너뛰고 경계선을 한 번만 건넜다
- 조작기 — pressure(slider)
- 스테이지 — default
- 뷰 — default
- 시간표 — high-heat-solid→caption.heatSolidHigh · high-melt→caption.melt · high-heat-liquid→caption.heatLiquid · high-boil→caption.boil · high-heat-gas→caption.twoCrossings · high-hold→caption.twoCrossings · low-heat-solid→caption.heatSolidLow · low-sublimate→caption.sublimate · low-heat-gas→caption.skipped · low-hold→caption.skipped
- 노드 종류 — body · lineSet · particleSystem · readout · region · slider · trajectory

### T49 · `thermal-expansion`

- 조각 — `aperi21:thermal-expansion` · `sims/thermal/thermal-expansion`
- 문안 11건
  - `label.title` — 열팽창
  - `label.operation` — 온도에 따른 길이·부피 변화
  - `label.stage` — 철로 이음매
  - `label.view` — 옆에서 본 레일
  - `label.temp` — {t} ℃
  - `label.gap` — {g} mm
  - `label.exaggeration` — 틈과 늘어난 길이는 {x} 배로 키워 그렸다
  - `caption.winter` — 겨울 {cold} ℃ — 두 레일 사이 이음매에 {gapCold} mm 틈이 벌어져 있다
  - `caption.warm` — 날이 더워지며 레일 끝이 침목 위로 밀려 나오고, 이음매 틈이 좁아진다
  - `caption.summer` — 여름 {hot} ℃ — 레일마다 {grow} mm 늘어 틈이 {gapHot} mm 만 남았다
  - `caption.cool` — 날이 식으며 늘었던 끝이 물러나고, 틈이 다시 벌어진다
- 조작기 — 없음 (자동 진행)
- 스테이지 — rail-joint
- 뷰 — rails-side
- 시간표 — winter→caption.winter · warm→caption.warm · summer→caption.summer · cool→caption.cool
- 노드 종류 — body · dimension · lineSet · readout · region

### T50 · `pv-diagram`

- 조각 — `aperi21:pv-diagram` · `sims/thermal/pv-diagram`
- 문안 13건
  - `label.title` — PV 그림
  - `label.operation` — 넓이가 일인 표현
  - `label.stage` — 추를 얹은 기체
  - `label.view` — P-V 그림과 실린더
  - `label.heat` — 가열
  - `label.cool` — 식힘
  - `caption.a.intro` — 상태 A — 피스톤 받침에 추 {na}개
  - `caption.a.expand` — 추 {na}개를 얹은 채 데워 부피를 늘린다 — 지나온 길 아래가 칠해진다
  - `caption.drop` — 부피를 그대로 두고 식히며 추를 하나씩 선반에 내린다 — 칠해지는 넓이가 없다
  - `caption.a.result` — B 에 닿았다 — 추 {na}개가 모두 올라갔고, 칠해진 넓이는 {na}띠
  - `caption.b.intro` — 다시 상태 A, 추 {na}개 — 점선은 앞의 길과 넓이
  - `caption.b.expand` — 추 {nb}개만 얹은 채 데워 부피를 늘린다 — 지나온 길 아래가 칠해진다
  - `caption.b.result` — 같은 B 에 닿았다 — 이번에는 추 {nb}개가 올라갔고 넓이는 {nb}띠, 앞의 길은 {na}띠
- 조작기 — 없음 (자동 진행)
- 스테이지 — weights
- 뷰 — main
- 시간표 — a-in→caption.a.intro · a-show→caption.a.intro · a-expand→caption.a.expand · a-drop1→caption.drop · a-drop2→caption.drop · a-hold→caption.a.result · a-out→caption.a.result · b-in→caption.b.intro · b-show→caption.b.intro · b-drop1→caption.drop · b-drop2→caption.drop · b-expand→caption.b.expand · b-hold→caption.b.result · b-out→caption.b.result
- 노드 종류 — body · lineSet · readout · region · trajectory · vector

### T51 · `isothermal-process`

- 조각 — `aperi21:isothermal-process` · `sims/thermal/isothermal-process`
- 문안 16건
  - `label.title` — 등온 과정
  - `label.operation` — 온도를 유지하는 변화
  - `label.stage` — 항온조 위 실린더
  - `label.view` — 실린더와 P–V 그림
  - `label.pressure` — P
  - `label.volume` — V
  - `label.volumeStart` — V₁
  - `label.volumeEnd` — V₂
  - `label.heat` — Q
  - `label.work` — W
  - `label.temperature` — T = {t} K
  - `label.bath` — 항온조 {t} K
  - `caption.start` — {t} K 항온조에 담근 실린더 — 기체도 {t} K 이다
  - `caption.expand` — 피스톤이 천천히 올라가는 동안 항온조에서 열 알갱이가 들어와 기체를 지나 피스톤 쪽으로 나간다 — 온도계는 {t} K 그대로
  - `caption.hold` — 들어온 알갱이 {n}개, 나간 알갱이 {n}개 — 기체에 남은 것은 없고 온도는 {t} K 그대로다
  - `caption.reset` — 처음 자리로 되돌린다
- 조작기 — 없음 (자동 진행)
- 스테이지 — bath
- 뷰 — bath
- 시간표 — rest0→caption.start · expand→caption.expand · hold→caption.hold · reset→caption.reset
- 노드 종류 — body · lineSet · particleSystem · readout · region · surface · trajectory · vector

### T52 · `irreversibility`

- 조각 — `aperi21:irreversibility` · `sims/thermal/irreversibility`
- 문안 15건
  - `label.title` — 엔트로피와 비가역성
  - `label.operation` — 되돌릴 수 없는 이유
  - `label.stage` — 알갱이 바닥 위의 공
  - `label.view` — 정방향 · 거꾸로
  - `label.forward` — ▶︎
  - `label.reverse` — ◀︎
  - `label.startHeight` — h₀
  - `caption.ready` — 공을 놓기 직전. 바닥 알갱이들이 잔잔하게 떨고 있다.
  - `caption.play` — 공이 튈 때마다 덜 높이 오른다. 부딪힌 자리의 알갱이들이 세게 떨고, 그 떨림이 바닥 전체로 번진다.
  - `caption.settle` — 공이 멈췄다. 바닥 알갱이들이 처음보다 세게, 고르게 떤다.
  - `caption.turn` — 같은 장면을 거꾸로 돌린다.
  - `caption.rewindSettle` — 멈춘 공 아래에서 바닥 곳곳의 알갱이들이 떨고 있다.
  - `caption.rewindPlay` — 흩어져 있던 떨림이 공 밑 한 점으로 모여 공을 차 올린다. 공은 튈 때마다 더 높이 오른다.
  - `caption.rewindReady` — 공이 처음 높이에 멈춰 섰다. 바닥의 떨림은 처음처럼 잔잔하다.
  - `caption.rewound` — 처음 장면으로 돌아왔다. 재생 표식이 다시 정방향으로 바뀐다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — grainy-floor
- 뷰 — forward-and-reversed
- 시간표 — ready→caption.ready · play→caption.play · settle→caption.settle · turn→caption.turn · rewind-settle→caption.rewindSettle · rewind-play→caption.rewindPlay · rewind-ready→caption.rewindReady · rewound→caption.rewound
- 노드 종류 — body · particleSystem · readout · scalarField · trajectory

### T53 · `carnot-cycle`

- 조각 — `aperi21:carnot-cycle` · `sims/thermal/carnot-cycle`
- 문안 17건
  - `label.title` — 카르노 순환
  - `label.operation` — 이론적 최대 효율
  - `label.stage` — 이상 기관
  - `label.view` — 온도-엔트로피 도표
  - `label.floor` — 0 K 절대 영도
  - `label.temperature` — 온도
  - `label.entropy` — 엔트로피 →
  - `label.hot` — 뜨거운 쪽 {t} K
  - `label.cold` — 차가운 쪽 {t} K
  - `label.work` — 일 {n}%
  - `label.discard` — 빠져나간 열 {n}%
  - `label.coldControl` — 차가운 쪽 온도
  - `caption.hot` — {th} K 에서 열을 받는다 — 받은 열은 0 K 바닥부터 {th} K 까지 채워진다
  - `caption.expand` — 열 출입 없이 팽창하며 {th} K 에서 {tc} K 로 식는다
  - `caption.cold` — {tc} K 에서 열을 내놓는다 — {tc} K 아래 깔린 몫이 바닥으로 빠져나간다
  - `caption.compress` — 열 출입 없이 압축되며 {tc} K 에서 {th} K 로 돌아간다
  - `caption.result` — 받은 열 중 {tc} K 아래 {discard}% 는 빠져나가고, 그 위 {work}% 만 일로 남는다
- 조작기 — cold-temperature(slider)
- 스테이지 — engine
- 뷰 — ts
- 시간표 — hot→caption.hot · expand→caption.expand · cold→caption.cold · compress→caption.compress · hold→caption.result · fade→caption.result
- 노드 종류 — lineSet · readout · region · slider · trace · trajectory

### T55 · `diffusion`

- 조각 — `aperi21:diffusion` · `sims/thermal/diffusion`
- 문안 8건
  - `label.title` — 확산
  - `label.operation` — 농도 차이가 만드는 흐름
  - `label.stage` — 물에 떨어뜨린 잉크
  - `label.view` — 물통과 농도
  - `label.bars` — 구간마다 든 알갱이 수
  - `caption.drop` — 물 한가운데에 잉크 알갱이를 한데 모아 떨어뜨린다
  - `caption.spread` — 한 알갱이는 이리저리 되돌아가며 걷는데, 무리는 진한 가운데에서 옅은 양옆으로 번진다
  - `caption.even` — 이제 어느 구간이나 알갱이 수가 비슷하다 — 알갱이들은 여전히 걷는다
- 조작기 — 없음 (자동 진행)
- 스테이지 — ink-in-water
- 뷰 — tank-and-bars
- 시간표 — drop→caption.drop · leave→caption.spread · spread→caption.spread · even→caption.even · clear→caption.even
- 노드 종류 — body · lineSet · particleSystem · readout · region · trajectory

### T56 · `maxwells-demon`

- 조각 — `aperi21:maxwells-demon` · `sims/thermal/maxwells-demon`
- 문안 14건
  - `label.title` — 맥스웰의 도깨비
  - `label.operation` — 정보와 엔트로피의 관계
  - `label.stage` — 문 달린 상자
  - `label.view` — 상자 · 온도 막대 · 공책
  - `label.demon` — 도깨비
  - `label.temperature` — 온도
  - `label.left` — 왼쪽
  - `label.right` — 오른쪽
  - `label.start` — 처음
  - `label.notebook` — 도깨비의 공책
  - `caption.mixed` — 문이 닫혀 있다. 두 칸 모두 큰(빠른) 알갱이와 작은(느린) 알갱이가 {n}개씩 섞여 있고, 두 온도 막대의 높이가 같다.
  - `caption.sort` — 도깨비가 문으로 다가오는 알갱이마다 속력을 재어 본다. 빠른 것은 오른쪽으로, 느린 것은 왼쪽으로만 문을 열어 주고, 하나를 볼 때마다 공책에 한 줄을 적는다.
  - `caption.sorted` — 오른쪽에 큰 알갱이가, 왼쪽에 작은 알갱이가 모인다 — 오른쪽 막대가 오르고 왼쪽 막대가 내려간다. 닫힌 문에 튕겨 나간 알갱이도 공책에 한 줄씩 적힌다.
  - `caption.hold` — 문이 멈췄다. 오른쪽은 뜨거운 칸, 왼쪽은 찬 칸이 되었고, 공책에는 재어 본 횟수만큼 줄이 남았다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — trapdoor-box
- 뷰 — box-bars-notebook
- 시간표 — appear→caption.mixed · mixed→caption.mixed · sort→caption.sort · sorted→caption.sorted · hold→caption.hold · fade→caption.hold
- 노드 종류 — body · lineSet · particleSystem · readout · region · trace · trajectory

### T58 · `wave-speed-in-medium`

- 조각 — `aperi21:wave-speed-in-medium` · `sims/waves/wave-speed-in-medium`
- 문안 9건
  - `label.title` — 매질과 파동 속도
  - `label.operation` — 장력·밀도·탄성이 정하는 속도
  - `label.stage` — 세 줄 경주
  - `label.view` — 같은 펄스, 다른 줄
  - `label.laneTaut` — {k}T · μ
  - `label.laneBase` — T · μ
  - `label.laneHeavy` — T · {k}μ
  - `caption.race` — 세 줄에 같은 모양의 펄스를 동시에 보냈다 — 줄마다 나아가는 빠르기가 다르다
  - `caption.result` — 같은 시간 동안 팽팽한 줄의 펄스는 기준의 두 배를, 무거운 줄의 펄스는 절반을 갔다
- 조작기 — 없음 (자동 진행)
- 스테이지 — race
- 뷰 — race
- 시간표 — race→caption.race · hold→caption.result · fade→caption.result
- 노드 종류 — body · lineSet · readout · trajectory · vector

### T59 · `string-vibration`

- 조각 — `aperi21:string-vibration` · `sims/waves/string-vibration`
- 문안 17건
  - `label.title` — 줄의 진동
  - `label.operation` — 양끝이 고정된 줄의 모드
  - `label.stage` — 손가락으로 누르는 줄
  - `label.view` — 줄과 파형
  - `label.finger` — 손가락
  - `label.len.open` — L
  - `label.len.frac` — {a}/{b} L
  - `label.freq.open` — f₁
  - `label.freq.whole` — {n} f₁
  - `label.freq.frac` — {a}/{b} f₁
  - `label.scope` — 가운데 점의 흔들림 — 같은 시간 동안
  - `label.reference` — 누르지 않은 줄
  - `caption.open` — 누르지 않은 줄 — 너트에서 줄받침까지 줄 전체가 반파장 하나로 흔들린다.
  - `caption.slide` — 손가락이 줄을 누르며 미끄러진다 — 흔들리는 부분이 짧아질수록 더 빨리 흔들린다.
  - `caption.short` — 누른 자리부터 줄받침까지만 흔들린다 — 같은 시간에 더 여러 번, 음이 높아진다.
  - `caption.octave` — 흔들리는 길이가 절반 — 두 배 빠르게 흔들린다. 한 옥타브 위 음이다.
  - `caption.release` — 손가락을 떼며 돌아간다 — 길어지는 만큼 느려진다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — stopped-string
- 뷰 — string
- 시간표 — open→caption.open · slide-1→caption.slide · stop-1→caption.short · slide-2→caption.slide · stop-2→caption.octave · release→caption.release · mute→caption.release
- 노드 종류 — body · dimension · readout · trajectory

### T60 · `air-column-resonance`

- 조각 — `aperi21:air-column-resonance` · `sims/waves/air-column-resonance`
- 문안 15건
  - `label.title` — 기주 공명
  - `label.operation` — 열린 관과 닫힌 관의 차이
  - `label.stage` — 같은 길이의 관 둘
  - `label.view` — 관과 울린 진동수
  - `label.openTube` — 양쪽이 열린 관
  - `label.closedTube` — 한쪽을 막은 관
  - `label.source` — 음원
  - `label.ladder` — 크게 울린 진동수
  - `label.f1` — f₁
  - `label.fn` — {n}f₁
  - `label.fHalf` — {n}/2 f₁
  - `caption.closed` — 막힌 관만 크게 울린다 — 막힌 끝은 공기가 움직이지 못하는 마디, 열린 입구는 가장 크게 움직이는 배다.
  - `caption.open` — 이번엔 열린 관만 크게 울린다 — 두 끝이 모두 배인 모양이 관 길이에 맞았다.
  - `caption.shift` — 음을 올리는 중 — 두 관 모두 모양이 끝에 맞지 않아 조용하다.
  - `caption.rest` — 막힌 관은 열린 관의 절반 진동수에서 먼저 울렸고, 그 홀수 배에서만 울렸다 — 짝수 배 자리는 열린 관이 울렸다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — two-pipes
- 뷰 — pipes
- 시간표 — rise→caption.closed · ring-1→caption.closed · shift-2→caption.shift · ring-2→caption.open · shift-3→caption.shift · ring-3→caption.closed · shift-4→caption.shift · ring-4→caption.open · shift-5→caption.shift · ring-5→caption.closed · rest→caption.rest · fade→caption.rest
- 노드 종류 — body · marker · particleSystem · readout · region · surface · trajectory

### T62 · `wave-attenuation`

- 조각 — `aperi21:wave-attenuation` · `sims/waves/wave-attenuation`
- 문안 8건
  - `label.title` — 파동의 감쇠
  - `label.operation` — 매질이 흡수하는 에너지
  - `label.stage` — 흡수하는 줄
  - `label.view` — 줄과 높이 막대
  - `label.stepRatio` — ×{q}
  - `label.spacing` — {d} m
  - `caption.travel` — 퍼지지 않는 한 줄인데도 마루는 나아갈수록 낮아진다 — 줄이 파동의 에너지를 흡수한다
  - `caption.result` — 같은 거리를 지날 때마다 앞 높이의 같은 몫만 남는다 — 줄어드는 양이 아니라 비율이 같다
- 조작기 — 없음 (자동 진행)
- 스테이지 — absorbing-rope
- 뷰 — rope
- 시간표 — travel→caption.travel · hold→caption.result · fade→caption.result
- 노드 종류 — body · dimension · readout · region · trajectory

### T63 · `sound-through-materials`

- 조각 — `aperi21:sound-through-materials` · `sims/waves/sound-through-materials`
- 문안 12건
  - `label.title` — 물질을 통한 소리 전달
  - `label.operation` — 매질에 따라 달라지는 소리의 전달
  - `label.stage` — 네 통
  - `label.view` — 같은 떨림, 다른 물질
  - `label.steel` — 쇠 · {v} m/s
  - `label.water` — 물 · {v} m/s
  - `label.air` — 공기 · {v} m/s
  - `label.vacuum` — 진공 (공기를 뺌)
  - `label.ear` — 듣는 곳
  - `caption.strike` — 망치로 판을 한 번 두드린다 — 판에 붙은 네 통이 같은 떨림을 받는다
  - `caption.travel` — 떨림이 알갱이에서 알갱이로 건너간다 — 쇠가 가장 먼저, 그다음 물, 공기 순으로 끝에 닿는다
  - `caption.result` — 쇠 · 물 · 공기로는 소리가 끝까지 왔지만, 알갱이가 없는 진공으로는 전해지지 않았다
- 조작기 — 없음 (자동 진행)
- 스테이지 — four-tubes
- 뷰 — tubes
- 시간표 — strike→caption.strike · recoil→caption.strike · travel→caption.travel · hold→caption.result · fade→caption.result
- 노드 종류 — body · particleSystem · readout · trajectory

### T64 · `rectilinear-propagation`

- 조각 — `aperi21:rectilinear-propagation` · `sims/optics/rectilinear-propagation`
- 문안 12건
  - `label.title` — 빛의 직진
  - `label.operation` — 그림자와 광선 모형
  - `label.stage` — 점광원 · 가림판 · 스크린
  - `label.view` — 옆에서 본 모습
  - `label.source` — 광원
  - `label.plate` — 가림판
  - `label.screen` — 스크린
  - `label.ratio` — 가림판의 {k}배
  - `caption.far` — 가장자리를 스친 두 곧은 선이 스크린에 닿는 자리에서 그림자가 끝난다 — 그림자 높이는 가림판의 {kFar}배
  - `caption.moveIn` — 가림판을 광원 쪽으로 옮긴다
  - `caption.near` — 두 선이 더 크게 벌어진 채 스크린에 닿는다 — 그림자 높이는 가림판의 {kNear}배
  - `caption.moveOut` — 가림판을 스크린 쪽으로 옮긴다
- 조작기 — 없음 (자동 진행)
- 스테이지 — point-source
- 뷰 — side
- 시간표 — far→caption.far · move-in→caption.moveIn · near→caption.near · move-out→caption.moveOut
- 노드 종류 — body · dimension · lineSet · readout · region · trajectory

### T65 · `plane-mirror-image`

- 조각 — `aperi21:plane-mirror-image` · `sims/optics/plane-mirror-image`
- 문안 13건
  - `label.title` — 평면거울의 상
  - `label.operation` — 허상의 위치와 좌우 반전
  - `label.stage` — 평면거울
  - `label.view` — 옆에서
  - `label.object` — 물체
  - `label.image` — 상
  - `label.mirror` — 거울
  - `label.distance` — {d} cm
  - `caption.near` — 물체는 거울 앞 {near} cm — 눈에 든 빛을 거울 뒤로 거꾸로 이은 점선은 거울 뒤 {near} cm 에서 만난다.
  - `caption.away` — 물체를 거울에서 떼어 낸다 — 점선이 만나는 점도 거울 뒤로 함께 물러난다.
  - `caption.far` — 물체는 거울 앞 {far} cm — 점선이 만나는 점은 거울 뒤 {far} cm 에 있다.
  - `caption.behind` — 거울 뒤로 건너간 빛은 없다 — 뒤의 F 는 점선이 만나는 자리에 가로획을 거울 쪽으로 뻗고 선다.
  - `caption.toward` — 물체를 거울 쪽으로 되돌린다 — 점선이 만나는 점도 거울 쪽으로 다가온다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — plane-mirror
- 뷰 — side
- 시간표 — near→caption.near · away→caption.away · far→caption.far · behind→caption.behind · toward→caption.toward
- 노드 종류 — body · dimension · opticalElement · ray · readout · region · trajectory

### T68 · `spherical-aberration`

- 조각 — `aperi21:spherical-aberration` · `sims/optics/spherical-aberration`
- 문안 10건
  - `label.title` — 구면 수차
  - `label.operation` — 가장자리 광선이 다른 곳에 모임
  - `label.stage` — 두꺼운 구면 렌즈
  - `label.view` — 렌즈와 광축
  - `label.stop` — 조리개
  - `caption.enter` — 나란한 빛 줄기가 두 면이 둥근 볼록 렌즈로 들어간다.
  - `caption.pass` — 렌즈를 지난 줄기가 축 쪽으로 꺾여 축을 건너간다.
  - `caption.spread` — 가장 바깥 줄기는 렌즈 가까이에서, 가장 안쪽 줄기는 멀리서 축을 건넌다 — 줄기들이 한 점에 모이지 않는다.
  - `caption.stopIn` — 조리개가 들어와 바깥 줄기를 막는다.
  - `caption.narrow` — 안쪽 줄기만 남자 축을 건너는 자리가 좁게 모였다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — thick-lens
- 뷰 — lens
- 시간표 — enter→caption.enter · pass→caption.pass · mark→caption.spread · hold-open→caption.spread · stop-in→caption.stopIn · hold-stop→caption.narrow · drain→caption.narrow
- 노드 종류 — body · dimension · ray · readout · region · trajectory

### T69 · `birefringence`

- 조각 — `aperi21:birefringence` · `sims/optics/birefringence`
- 문안 23건
  - `label.title` — 복굴절
  - `label.operation` — 방향에 따라 다른 굴절률
  - `label.stage` — 기본
  - `label.view` — 기본
  - `label.side` — 옆에서 본 단면
  - `label.top` — 위에서 본 모습
  - `label.letter` — 글자
  - `label.crystal` — 방해석
  - `label.polarizer` — 편광판
  - `label.oRay` — 정상광 o
  - `label.eRay` — 이상광 e
  - `label.nO` — nₒ = {n}
  - `label.nE` — nₑ = {n}
  - `label.o` — o
  - `label.e` — e
  - `glyph.letter` — 가
  - `caption.split` — 한 줄기가 결정 안에서 두 줄기로 갈라진다. o 는 곧게, e 는 비스듬히 간다. 위에서 보면 글자가 두 겹이다.
  - `caption.rotate` — 결정을 돌린다. e 상이 o 상 둘레를 돈다.
  - `caption.polIn` — 편광판을 얹는다.
  - `caption.polA` — 편광판 결이 두 상을 잇는 선에서 {a}° — o 상이 사라지고 e 상만 남았다.
  - `caption.polTurn` — 편광판을 돌린다.
  - `caption.polB` — 편광판 결이 두 상을 잇는 선에서 {b}° — e 상이 사라지고 o 상만 남았다.
  - `caption.polOut` — 편광판을 걷는다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — default
- 뷰 — main
- 시간표 — split→caption.split · rotate→caption.rotate · polIn→caption.polIn · polA→caption.polA · polTurn→caption.polTurn · polB→caption.polB · polOut→caption.polOut
- 노드 종류 — body · lineSet · readout · region · trajectory · vector

### T70 · `scattering`

- 조각 — `aperi21:scattering` · `sims/optics/scattering`
- 문안 14건
  - `label.title` — 산란
  - `label.operation` — 하늘과 노을의 색
  - `label.stage` — 공기 분자와 구름 물방울
  - `label.view` — 두 레인
  - `label.small` — 공기 분자
  - `label.smallNote` — 파장보다 훨씬 작다
  - `label.large` — 구름 물방울
  - `label.largeNote` — 파장보다 크다
  - `label.lambda` — λ
  - `caption.smallIn` — 흰빛 줄기가 작은 입자들 사이로 들어간다
  - `caption.small` — 빛이 앞뒤 사방으로 흩어지고, 흩어진 빛은 파랗다
  - `caption.largeIn` — 흰빛 줄기가 큰 물방울들 사이로 들어간다
  - `caption.large` — 빛이 거의 앞쪽으로 몰려 흩어지고, 흩어진 빛은 희다
  - `caption.both` — 위에서는 파란 빛이 사방으로, 아래에서는 흰 빛이 앞쪽으로 흩어진다
- 조작기 — 없음 (자동 진행)
- 스테이지 — default
- 뷰 — main
- 시간표 — smallIn→caption.smallIn · small→caption.small · largeIn→caption.largeIn · large→caption.large · both→caption.both · fade→caption.both
- 노드 종류 — body · lineSet · readout · region · trajectory

### T71 · `rayleigh-scattering`

- 조각 — `aperi21:rayleigh-scattering` · `sims/optics/rayleigh-scattering`
- 문안 15건
  - `label.title` — 레일리 산란
  - `label.operation` — 파장 4제곱에 반비례하는 산란
  - `label.stage` — 햇빛과 공기
  - `label.view` — 막대와 대기 단면
  - `label.nm` — {nm} nm
  - `label.ratio` — ×{x}
  - `label.ratioOne` — ×1
  - `label.axisY` — 흩어지는 몫
  - `label.eye` — 눈에 닿은 빛
  - `caption.grow` — 공기가 흩뜨리는 몫 — 파랑 {b} nm 과 빨강 {r} nm 의 막대가 자란다
  - `caption.bars` — 파란 막대가 빨간 막대의 {x}배 높이다
  - `caption.travel` — 해가 머리 위에 있다 — 햇빛이 얇은 공기층을 곧장 내려온다
  - `caption.noon` — 짧은 길에서 옆으로 흩어진 빛은 파랗고, 눈에 닿은 빛은 거의 희다
  - `caption.sink` — 해가 낮아진다 — 빛이 지나는 공기의 길이 길어진다
  - `caption.sunset` — 길 앞쪽에서 파랑이 다 흩어져 나갔고, 눈에 닿은 빛은 붉다
- 조작기 — 없음 (자동 진행)
- 스테이지 — sunlight
- 뷰 — main
- 시간표 — grow→caption.grow · bars→caption.bars · travel→caption.travel · noon→caption.noon · sink→caption.sink · sunset→caption.sunset · fade→caption.sunset
- 노드 종류 — body · lineSet · readout · region · trajectory

### T72 · `electric-charge`

- 조각 — `aperi21:electric-charge` · `sims/em/electric-charge`
- 문안 11건
  - `label.title` — 전하
  - `label.operation` — 두 종류의 전하와 보존
  - `label.stage` — 실에 매단 공
  - `label.view` — 세 쌍
  - `mark.plus` — +
  - `mark.minus` — −
  - `label.like` — 같은 종류
  - `label.unlike` — 다른 종류
  - `caption.appear` — 세 쌍 모두 크기가 같은 전하를 띤 공이다. 다른 것은 부호뿐이다.
  - `caption.release` — + 와 +, − 와 − 는 서로 밀어 벌어지고, + 와 − 는 서로 당겨 붙는다.
  - `caption.hold` — 같은 종류는 벌어진 채로, 다른 종류는 붙은 채로 머문다. 점선은 전하가 없을 때 실이 드리우는 자리다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — hanging-balls
- 뷰 — pairs
- 시간표 — appear→caption.appear · release→caption.release · hold→caption.hold · fade→caption.hold
- 노드 종류 — body · constraint · readout · string · surface · trajectory

### T74 · `field-lines`

- 조각 — `aperi21:field-lines` · `sims/em/field-lines`
- 문안 5건
  - `label.title` — 전기력선
  - `label.operation` — 선이 촘촘한 곳이 장이 센 곳이다
  - `label.stage` — 두 전하
  - `label.view` — 선과 알갱이
  - `caption.main` — 선이 몰린 곳을 지나는 알갱이는 빨라지고, 선이 성긴 곳에서는 느려진다
- 조작기 — minus-drag(point-drag)
- 스테이지 — default
- 뷰 — default
- 시간표 — 없음
- 노드 종류 — body · lineSet · particleSystem · region · trajectory

### T76 · `electrostatic-shielding`

- 조각 — `aperi21:electrostatic-shielding` · `sims/em/electrostatic-shielding`
- 문안 12건
  - `label.title` — 정전기 차폐
  - `label.operation` — 도체 내부의 장이 0인 이유
  - `label.stage` — 고른 장 속의 속 빈 도체
  - `label.view` — 장선
  - `mark.plus` — +
  - `mark.minus` — −
  - `mark.q` — +q
  - `caption.field` — 고른 장 속의 시험 전하가 장 방향으로 힘을 받고 있다
  - `caption.place` — 시험 전하 둘레에 속 빈 도체를 놓는다
  - `caption.induce` — 도체 속 전자가 왼쪽 겉면으로 몰리고, 오른쪽 겉면에는 + 가 남는다
  - `caption.shielded` — 장선은 겉면에 수직으로 닿아 끝나고 안은 비었다 — 시험 전하는 힘을 받지 않는다
  - `caption.remove` — 도체를 치우자 장선이 다시 안으로 들어온다
- 조작기 — 없음 (자동 진행)
- 스테이지 — hollow-conductor
- 뷰 — main
- 시간표 — field→caption.field · place→caption.place · induce→caption.induce · shielded→caption.shielded · remove→caption.remove
- 노드 종류 — body · lineSet · readout · region · vector

### T77 · `energy-in-capacitor`

- 조각 — `aperi21:energy-in-capacitor` · `sims/em/energy-in-capacitor`
- 문안 16건
  - `label.title` — 축전기의 에너지
  - `label.operation` — 전기장에 저장된 에너지
  - `label.stage` — 한 몫씩 옮겨 충전
  - `label.view` — 판과 V–Q 그래프
  - `label.capacitance` — {c} μF
  - `label.voltage` — {v} V
  - `label.axisQ` — Q
  - `label.axisV` — V
  - `label.chunk` — Δq
  - `label.force` — F
  - `label.rect` — QV
  - `label.half` — ½QV
  - `caption.charge` — 전하를 한 몫씩 아래 판에서 위 판으로 옮긴다 — 판 전압이 오를수록 한 몫에 드는 일(띠)이 커진다
  - `caption.filled` — 다 옮기고 나니 띠들이 직선 아래 삼각형을 빈틈없이 채웠다
  - `caption.rect` — 모든 몫을 끝 전압으로 옮겼다면 든 일은 점선 직사각형이다
  - `caption.half` — 쌓인 에너지는 그 직사각형이 아니라 절반인 삼각형이다
- 조작기 — 없음 (자동 진행)
- 스테이지 — chunk-charging
- 뷰 — plates-graph
- 시간표 — charge→caption.charge · filled→caption.filled · rect-in→caption.rect · rect→caption.rect · half→caption.half · fade→caption.half
- 노드 종류 — body · lineSet · readout · region · trajectory · vector

### T78 · `drift-velocity`

- 조각 — `aperi21:drift-velocity` · `sims/em/drift-velocity`
- 문안 13건
  - `label.title` — 표류 속도
  - `label.operation` — 느린 전자와 빠른 신호
  - `label.stage` — 작은 회로
  - `label.view` — 고리 회로
  - `label.electron` — e⁻
  - `label.plus` — +
  - `label.minus` — −
  - `label.realSpeed` — 실제 약 {v} mm/s
  - `caption.open` — 스위치가 열려 있다 — 도선 속 전자는 제자리에서 마구 흔들릴 뿐 어느 쪽으로도 나아가지 않는다
  - `caption.close` — 스위치를 닫는다
  - `caption.lit` — 등이 곧바로 켜졌다 — 도선 곳곳의 전자가 한꺼번에 한쪽으로 밀리기 시작했다
  - `caption.compare` — 그동안 표시한 전자는 닫을 때의 자리에서 겨우 이만큼 나아갔다
  - `caption.release` — 스위치를 열자 등이 곧바로 꺼지고, 전자들도 한꺼번에 밀리기를 멈춘다
- 조작기 — 없음 (자동 진행)
- 스테이지 — small-circuit
- 뷰 — loop
- 시간표 — tag→caption.open · open→caption.open · close→caption.close · lit→caption.lit · compare→caption.compare · release→caption.release · untag→caption.release
- 노드 종류 — body · lineSet · particleSystem · readout · trajectory · vector

### T80 · `charged-particle-in-magnetic-field`

- 조각 — `aperi21:charged-particle-in-magnetic-field` · `sims/em/charged-particle-in-magnetic-field`
- 문안 7건
  - `label.title` — 자기장 속 전하의 원운동
  - `label.operation` — 빠른 전하도 한 바퀴 시간은 같다
  - `label.stage` — 기본
  - `label.view` — 기본
  - `caption.main` — 빠른 전하는 큰 원을 돌지만, 모두 한 줄로 선 채 함께 돈다
  - `caption.return` — 속력이 달라도 모두 같은 순간 출발점으로 돌아온다
  - `caption.depart` — 같은 순간 출발점에 모였다가 다시 함께 떠난다
- 조작기 — 없음 (자동 진행)
- 스테이지 — default
- 뷰 — default
- 시간표 — depart→caption.depart · orbit→caption.main · return→caption.return
- 노드 종류 — body · lineSet · trajectory

### T81 · `field-of-straight-wire`

- 조각 — `aperi21:current-magnetic-field` · `sims/em/current-magnetic-field`
- 문안 7건
  - `label.title` — 전류가 만드는 자기장
  - `label.operation` — 전선을 감아 도는 쪽으로 돌아서고, 멀수록 덜 돌아선다
  - `label.stage` — 전선 둘레
  - `label.view` — 나침반
  - `caption.on` — 전류가 흐르는 동안 — 바늘은 전선을 감아 도는 고리 쪽으로 돌아선다, 멀수록 덜
  - `caption.reverse` — 전류를 거꾸로 흘리면 — 바늘도 거꾸로 돌아선다, 고리가 뒤집힌다
  - `caption.off` — 전류를 끊으면 — 바늘은 모두 북쪽으로 되돌아간다
- 조작기 — 없음 (자동 진행)
- 스테이지 — around
- 뷰 — compasses
- 시간표 — 없음
- 노드 종류 — body · trajectory

### T82 · `faradays-law`

- 조각 — `aperi21:faradays-law` · `sims/em/faradays-law`
- 문안 22건
  - `label.title` — 패러데이 법칙
  - `label.operation` — 자속 변화가 만드는 기전력
  - `label.stage` — 코일과 자석
  - `label.view` — 옆에서
  - `label.poleN` — N
  - `label.poleS` — S
  - `label.axisV` — V
  - `label.axisT` — t
  - `label.speed` — v
  - `label.speedTimes` — {k}v
  - `label.turns` — N
  - `label.turnsTimes` — {k}N
  - `label.speedTurns` — {s}v · {n}N
  - `caption.setup` — 코일 옆에 자석을 놓았다
  - `caption.slow` — 자석을 천천히 밀어 넣는다 — 전압이 낮게 오른다
  - `caption.slowStop` — 자석이 멈췄다 — 전압도 0 으로 돌아왔다
  - `caption.again` — 같은 자석을 처음 자리로 되돌렸다
  - `caption.fast` — 이번에는 더 빠르게 밀어 넣는다 — 전압이 더 높이 튄다
  - `caption.fastStop` — 멈추면 다시 0 — 빠르게 밀 때 더 높이 튀었다
  - `caption.rewind` — 코일을 더 많이 감았다 — 자석은 다시 처음 자리에
  - `caption.turns` — 같은 빠르기로 밀어 넣는다 — 전압이 한 번 더 커진다
  - `caption.turnsStop` — 감은 수가 많은 코일에서 더 높이 튀었다 — 멈추면 역시 0
- 조작기 — 없음 (자동 진행)
- 스테이지 — coil
- 뷰 — side
- 시간표 — slow-in→caption.setup · slow-push→caption.slow · slow-rest→caption.slowStop · slow-out→caption.slowStop · fast-in→caption.again · fast-push→caption.fast · fast-rest→caption.fastStop · fast-out→caption.fastStop · turns-in→caption.rewind · turns-push→caption.turns · turns-rest→caption.turnsStop · clear→caption.turnsStop
- 노드 종류 — body · lineSet · readout · trajectory · vector

### T83 · `eddy-current`

- 조각 — `aperi21:eddy-current` · `sims/em/eddy-current`
- 문안 15건
  - `label.title` — 맴돌이 전류
  - `label.operation` — 덩어리 도체 속의 유도 전류
  - `label.stage` — 두 관
  - `label.view` — 옆에서
  - `label.plastic` — 플라스틱 관
  - `label.copper` — 구리 관
  - `label.poleN` — N
  - `label.poleS` — S
  - `label.weight` — mg
  - `label.brake` — F
  - `caption.hold` — 같은 자석 둘을 같은 높이에 들었다 — 왼쪽은 플라스틱 관, 오른쪽은 구리 관
  - `caption.fall` — 동시에 놓았다 — 플라스틱 관 속 자석은 점점 빨라지며 떨어진다
  - `caption.crawl` — 플라스틱 쪽은 벌써 바닥 — 구리 관 속 자석은 고른 빠르기로 천천히 내려간다
  - `caption.brake` — 자석 위아래 관 벽에 맴돌이 전류가 서로 반대로 돌며 떨어짐을 막는다
  - `caption.land` — 구리 관 쪽도 바닥에 닿았다 — 자석이 멈추자 맴돌이 전류도 사라졌다
- 조작기 — 없음 (자동 진행)
- 스테이지 — tubes
- 뷰 — side
- 시간표 — appear→caption.hold · hold→caption.hold · fall→caption.fall · crawl→caption.crawl · brake→caption.brake · land→caption.land · reset→caption.land
- 노드 종류 — body · lineSet · readout · trace · vector

### T84 · `reactance`

- 조각 — `aperi21:reactance` · `sims/em/reactance`
- 문안 18건
  - `label.title` — 리액턴스와 임피던스
  - `label.operation` — 주파수에 의존하는 저항
  - `label.stage` — 코일 하나 · 축전기 하나
  - `label.view` — 두 회로와 X–f 평면
  - `label.inductor` — L
  - `label.capacitor` — C
  - `label.current` — I
  - `label.time` — t
  - `label.freqAxis` — f (Hz)
  - `label.reactanceAxis` — X (Ω)
  - `label.voltage` — {v} V
  - `label.inductance` — {v} mH
  - `label.capacitance` — {v} μF
  - `label.tick` — {v}
  - `caption.low` — 같은 교류 전압에 코일과 축전기를 따로 이었다 — 낮은 진동수에서는 코일 쪽 전류가 크고 축전기 쪽 전류가 작다
  - `caption.rise` — 진동수를 올린다 — 코일은 더 막아 전류가 줄고, 축전기는 덜 막아 전류가 는다
  - `caption.hold` — 흐린 점선은 한 단계 낮은 진동수의 전류다 — 코일 쪽은 그보다 낮아졌고 축전기 쪽은 높아졌다
  - `caption.fall` — 진동수를 처음으로 낮춘다 — 코일 쪽 전류가 다시 커지고 축전기 쪽 전류는 작아진다
- 조작기 — 없음 (자동 진행)
- 스테이지 — coil-and-capacitor
- 뷰 — circuits-and-plane
- 시간표 — hold0→caption.low · rise1→caption.rise · hold1→caption.hold · rise2→caption.rise · hold2→caption.hold · rise3→caption.rise · hold3→caption.hold · fall→caption.fall
- 노드 종류 — body · lineSet · readout · trajectory

### T85 · `series-rlc-resonance`

- 조각 — `aperi21:series-rlc-resonance` · `sims/em/series-rlc-resonance`
- 문안 23건
  - `label.title` — RLC 공진
  - `label.operation` — 임피던스가 최소가 되는 주파수
  - `label.stage` — 저항 두 가지
  - `label.view` — 회로 · 막는 몫 · I–f 평면
  - `label.resistor` — R
  - `label.inductor` — L
  - `label.capacitor` — C
  - `label.reactance` — X
  - `label.current` — I
  - `label.freqAxis` — f
  - `label.resonance` — f₀
  - `label.voltage` — {v} V
  - `label.resistance` — {v} Ω
  - `label.inductance` — {v} mH
  - `label.capacitance` — {v} μF
  - `caption.approach` — 구동 진동수를 올린다 — 코일과 축전기가 막는 정도가 가까워지며 전류가 커진다
  - `caption.peak` — f₀ 에서 코일과 축전기가 막는 정도가 같아져 서로 지운다 — 저항만 남아 전류가 가장 크다
  - `caption.past` — f₀ 를 지나면 코일이 더 막아 전류가 다시 줄어든다
  - `caption.swap` — 저항을 줄이고 처음 진동수로 돌아간다 — 앞 곡선은 흐린 점선으로 남긴다
  - `caption.peakLow` — 공진 진동수는 그대로 f₀ 다 — 남는 저항이 작아 전류가 더 높이 솟는다
  - `caption.pastLow` — f₀ 를 벗어나자 전류가 가파르게 떨어진다
  - `caption.compare` — 저항이 작을수록 공진 봉우리가 높고 좁다
  - `caption.clear` — 처음 저항으로 되돌린다
- 조작기 — 없음 (자동 진행)
- 스테이지 — two-resistances
- 뷰 — circuit-chain-plane
- 시간표 — 없음
- 노드 종류 — body · lineSet · readout · trajectory · vector

### T86 · `generator`

- 조각 — `aperi21:generator` · `sims/em/generator`
- 문안 10건
  - `label.title` — 발전기
  - `label.operation` — 회전이 만드는 기전력
  - `label.stage` — 손잡이 발전기
  - `label.view` — 굴대 쪽에서
  - `label.poleN` — N
  - `label.poleS` — S
  - `label.force` — F
  - `caption.opened` — 스위치를 열었다 — 전류가 끊겨 전구가 식고, 손잡이가 다시 가벼워진다
  - `caption.open` — 스위치가 열려 있다 — 돌려도 전구는 꺼져 있고, 손잡이는 가볍게 돈다
  - `caption.closed` — 스위치를 닫았다 — 코일에 전류가 흘러 전구가 켜지고, 같은 빠르기로 돌리는 데 힘이 더 든다
- 조작기 — 없음 (자동 진행)
- 스테이지 — hand-crank
- 뷰 — axle
- 시간표 — opened→caption.opened · open→caption.open · closed→caption.closed
- 노드 종류 — body · circuitElement · lamp · lineSet · readout · switch · trajectory · vector

### T87 · `maxwells-equations`

- 조각 — `aperi21:maxwells-equations` · `sims/em/maxwells-equations`
- 문안 10건
  - `label.title` — 맥스웰 방정식
  - `label.operation` — 전자기를 묶는 네 식
  - `label.stage` — 고리 사슬
  - `label.view` — 비스듬히 위에서
  - `label.e` — E
  - `label.b` — B
  - `caption.seed` — 자기장 B 가 커진다
  - `caption.eFromB` — 커지는 B 를 전기장 E 의 고리가 두른다
  - `caption.bFromE` — 새로 생긴 E 를 자기장 B 의 고리가 두른다
  - `caption.chain` — 처음 B 는 사라졌는데도 E 고리와 B 고리가 번갈아 생기며 사슬이 한쪽으로 번져 간다 — 전자기파다
- 조작기 — 없음 (자동 진행)
- 스테이지 — chain
- 뷰 — oblique
- 시간표 — seed→caption.seed · link1→caption.eFromB · link2→caption.bFromE · link3→caption.chain · link4→caption.chain · link5→caption.chain · link6→caption.chain
- 노드 종류 — lineSet · readout · trajectory · vector

### T88 · `electromagnetic-wave`

- 조각 — `aperi21:electromagnetic-wave` · `sims/em/electromagnetic-wave`
- 문안 6건
  - `label.title` — 전자기파
  - `label.operation` — 전기장과 자기장의 자기 전파
  - `label.stage` — 기본
  - `label.view` — 기본
  - `caption.shaking` — 전하가 흔들리는 동안, 그 흔들림이 전기장과 자기장이 되어 바깥으로 퍼진다
  - `caption.stopped` — 전하는 멈췄다 — 이미 떨어져 나간 장은 전하 없이 스스로 계속 나아간다
- 조작기 — 없음 (자동 진행)
- 스테이지 — default
- 뷰 — default
- 시간표 — rampUp→caption.shaking · shake→caption.shaking · rampDown→caption.shaking · rest→caption.stopped
- 노드 종류 — lineSet · particleSystem

### T89 · `poynting-vector`

- 조각 — `aperi21:poynting-vector` · `sims/em/poynting-vector`
- 문안 14건
  - `label.title` — 포인팅 벡터
  - `label.operation` — 전자기파가 나르는 에너지 흐름
  - `label.stage` — 전지와 저항
  - `label.view` — 회로 평면
  - `label.e` — E
  - `label.b` — B
  - `label.s` — S
  - `label.i` — I
  - `label.plus` — +
  - `label.minus` — −
  - `caption.e` — 두 도선 사이에는 + 도선에서 − 도선 쪽으로 전기장 E 가 선다
  - `caption.b` — 전류가 흐르는 도선마다 둘레를 감는 자기장 B 의 고리가 생긴다
  - `caption.s` — S 는 E 와 B 모두에 수직이다 — 도선 사이 어느 자리에서나 저항 쪽을 가리킨다
  - `caption.flow` — 에너지는 도선 속이 아니라 둘레 공간을 지나 전지에서 저항으로 들어간다
- 조작기 — 없음 (자동 진행)
- 스테이지 — battery-resistor
- 뷰 — circuit-plane
- 시간표 — eIn→caption.e · eHold→caption.e · bIn→caption.b · bHold→caption.b · sIn→caption.s · sHold→caption.s · flowIn→caption.flow · flow→caption.flow · fade→caption.flow
- 노드 종류 — lineSet · particleSystem · readout · trajectory · vector

### T90 · `relativity-of-simultaneity`

- 조각 — `aperi21:relativity-of-simultaneity` · `sims/modern/relativity-of-simultaneity`
- 문안 14건
  - `label.title` — 동시성의 상대성
  - `label.operation` — 기준틀마다 다른 「동시」
  - `label.stage` — 달리는 기차
  - `label.view` — 두 틀을 나란히
  - `label.trainFrame` — 기차 안에서 본 것
  - `label.groundFrame` — 선로에서 본 것
  - `label.trainMoves` — 기차 {beta}c →
  - `label.trackMoves` — ← 선로 {beta}c
  - `label.same` — 동시
  - `label.first` — 먼저
  - `label.second` — 나중
  - `caption.approach` — 달리는 기차 한가운데의 등이 곧 앞뒤로 빛을 쏜다
  - `caption.travel` — 빛은 두 틀 모두에서 같은 빠르기로 퍼진다 — 선로에서 보면 뒤 끝은 빛을 마중 나가고 앞 끝은 달아난다
  - `caption.result` — 기차 안에서는 두 끝에 동시에 닿았고, 선로에서는 뒤 끝에 먼저 닿았다
- 조작기 — 없음 (자동 진행)
- 스테이지 — train
- 뷰 — two-frames
- 시간표 — appear→caption.approach · approach→caption.approach · travel→caption.travel · hold→caption.result · fade→caption.result
- 노드 종류 — body · lineSet · readout · trace · trajectory

### T91 · `twin-paradox`

- 조각 — `aperi21:twin-paradox` · `sims/modern/twin-paradox`
- 문안 15건
  - `label.title` — 쌍둥이 역설
  - `label.operation` — 비대칭을 만드는 가속
  - `label.stage` — 0.6c 로 6 광년 왕복
  - `label.view` — 지구 틀의 시공간 도표
  - `label.earthAge` — 지구 {n}년
  - `label.travelerAge` — 여행자 {n}년
  - `label.speedOut` — {beta}c →
  - `label.speedBack` — ← {beta}c
  - `label.depart` — 출발
  - `label.turn` — 돌아섬
  - `label.meet` — 재회
  - `caption.out` — 여행자가 멀어진다 — 기운 점선이 여행자의 ‘지금’, 여행자의 한 해마다 지구의 한 해보다 짧은 토막을 가리킨다
  - `caption.turn` — 돌아서는 쪽은 여행자뿐 — 틀을 바꾸는 순간 ‘지금’ 선이 돌아 지구 세계선의 한 토막을 건너뛴다
  - `caption.back` — 돌아오는 길에도 여행자에게 지구의 해는 짧게 지나간다 — 건너뛴 토막만큼 지구가 앞서 있다
  - `caption.meet` — 다시 만나 세어 보면 곧은 세계선의 점이 더 많다 — 꺾인 세계선을 산 쌍둥이가 덜 늙었다
- 조작기 — 없음 (자동 진행)
- 스테이지 — round-trip
- 뷰 — earth-frame
- 시간표 — out→caption.out · turn→caption.turn · back→caption.back · meet→caption.meet · hold→caption.meet · fade→caption.meet
- 노드 종류 — body · lineSet · readout · region · trace · trajectory

### T92 · `twin-paradox`

- 조각 — `aperi21:twin-paradox` · `sims/modern/twin-paradox`
- 문안 15건
  - `label.title` — 쌍둥이 역설
  - `label.operation` — 비대칭을 만드는 가속
  - `label.stage` — 0.6c 로 6 광년 왕복
  - `label.view` — 지구 틀의 시공간 도표
  - `label.earthAge` — 지구 {n}년
  - `label.travelerAge` — 여행자 {n}년
  - `label.speedOut` — {beta}c →
  - `label.speedBack` — ← {beta}c
  - `label.depart` — 출발
  - `label.turn` — 돌아섬
  - `label.meet` — 재회
  - `caption.out` — 여행자가 멀어진다 — 기운 점선이 여행자의 ‘지금’, 여행자의 한 해마다 지구의 한 해보다 짧은 토막을 가리킨다
  - `caption.turn` — 돌아서는 쪽은 여행자뿐 — 틀을 바꾸는 순간 ‘지금’ 선이 돌아 지구 세계선의 한 토막을 건너뛴다
  - `caption.back` — 돌아오는 길에도 여행자에게 지구의 해는 짧게 지나간다 — 건너뛴 토막만큼 지구가 앞서 있다
  - `caption.meet` — 다시 만나 세어 보면 곧은 세계선의 점이 더 많다 — 꺾인 세계선을 산 쌍둥이가 덜 늙었다
- 조작기 — 없음 (자동 진행)
- 스테이지 — round-trip
- 뷰 — earth-frame
- 시간표 — out→caption.out · turn→caption.turn · back→caption.back · meet→caption.meet · hold→caption.meet · fade→caption.meet
- 노드 종류 — body · lineSet · readout · region · trace · trajectory

### T93 · `gravitational-redshift`

- 조각 — `aperi21:gravitational-redshift` · `sims/modern/gravitational-redshift`
- 문안 12건
  - `label.title` — 중력 적색 이동
  - `label.operation` — 빠져나오며 잃는 에너지
  - `label.stage` — 중성자별에서 낸 빛
  - `label.view` — 빛의 길과 퍼텐셜 우물
  - `label.star` — 중성자별
  - `label.observer` — 먼 곳
  - `label.potential` — 중력 퍼텐셜
  - `label.ghost` — 떠날 때
  - `label.nm` — {l} nm
  - `caption.emit` — 중성자별 표면에서 빛 한 줄기를 낸다
  - `caption.climb` — 우물을 올라오는 동안 빛이 에너지를 잃는다 — 물결 간격이 벌어지고 붉어진다
  - `caption.arrive` — 먼 곳에서 받은 빛 — 같은 {n}개 물결이 더 길게 펼쳐졌다
- 조작기 — 없음 (자동 진행)
- 스테이지 — neutron-star
- 뷰 — main
- 시간표 — emit→caption.emit · climb→caption.climb · arrive→caption.arrive · compare→caption.arrive · fade→caption.arrive
- 노드 종류 — body · lineSet · readout · trajectory

### T94 · `work-function-and-threshold`

- 조각 — `aperi21:work-function-and-threshold` · `sims/modern/work-function-and-threshold`
- 문안 18건
  - `label.title` — 일함수와 문턱 진동수
  - `label.operation` — 세기가 아니라 진동수가 정하는 것
  - `label.stage` — 나트륨과 구리
  - `label.view` — 기본
  - `label.axisF` — 진동수 (×10¹⁴ Hz)
  - `label.axisK` — 튀어나온 전자의 최대 에너지 (eV)
  - `label.ultraviolet` — 자외선
  - `label.sodium` — 나트륨 · 일함수 {w} eV
  - `label.copper` — 구리 · 일함수 {w} eV
  - `label.threshold` — 문턱 {f}
  - `label.slope` — 기울기 h
  - `caption.naBelow` — 나트륨에 비추는 빛의 진동수를 올려 가도, 문턱에 닿기 전에는 전자가 하나도 나오지 않는다
  - `caption.naAbove` — 문턱을 넘는 순간부터 전자가 튀어나오고, 그 에너지는 진동수를 따라 곧게 자란다
  - `caption.cuBelow` — 구리에 비추는 빛의 진동수를 올려 나트륨의 문턱을 지나도 전자가 나오지 않는다
  - `caption.cuUv` — 일함수가 큰 구리는 자외선에 들어서도 한참 동안 전자가 나오지 않는다
  - `caption.cuAbove` — 구리의 문턱은 더 높은 진동수에 있고, 넘은 뒤에는 나트륨과 나란히 자란다
  - `caption.slide` — 나트륨의 직선을 오른쪽으로 옮기면 구리의 직선에 꼭 겹친다
  - `caption.match` — 기울기 h 는 어느 금속이나 같다 — 금속이 바꾸는 것은 문턱뿐이다
- 조작기 — 없음 (자동 진행)
- 스테이지 — sodium-copper
- 뷰 — main
- 시간표 — na-below→caption.naBelow · na-above→caption.naAbove · na-hold→caption.naAbove · cu-below→caption.cuBelow · cu-uv→caption.cuUv · cu-above→caption.cuAbove · cu-hold→caption.cuAbove · slide→caption.slide · match→caption.match · fade→caption.match
- 노드 종류 — body · readout · scalarField · trace · trajectory

### T95 · `de-broglie-wavelength`

- 조각 — `aperi21:de-broglie-wavelength` · `sims/modern/de-broglie-wavelength`
- 문안 12건
  - `label.title` — 드브로이 파장
  - `label.operation` — 물질의 파동성
  - `label.stage` — 전자 두 개
  - `label.view` — 따라가는 시점
  - `label.electron` — e⁻
  - `label.speedRef` — v
  - `label.speedFast` — {k}v
  - `label.lambdaRef` — λ
  - `label.lambdaFast` — λ/{k}
  - `caption.together` — 같은 전자 둘이 같은 속력으로 난다 — 물결 간격도 같다
  - `caption.accelerate` — 아래 전자만 빨라진다 — 빨라지는 만큼 물결 간격이 좁아진다
  - `caption.compare` — {k}배 빠른 전자의 파장은 1/{k} — 위 물결 하나에 아래 물결 {k}개가 들어간다
- 조작기 — 없음 (자동 진행)
- 스테이지 — two-electrons
- 뷰 — following
- 시간표 — together→caption.together · accelerate→caption.accelerate · compare→caption.compare · fade→caption.compare
- 노드 종류 — body · dimension · lineSet · readout · trajectory · vector

### T96 · `particle-in-a-box`

- 조각 — `aperi21:particle-in-a-box` · `sims/modern/particle-in-a-box`
- 문안 13건
  - `label.title` — 무한 우물
  - `label.operation` — 경계가 만드는 에너지 양자화
  - `label.stage` — 무한 우물
  - `label.view` — 준위와 파동 함수
  - `label.n` — n = {n}
  - `label.levelOne` — E₁
  - `label.level` — {k}E₁
  - `label.gap` — +{g}E₁
  - `label.energy` — 에너지
  - `caption.ground` — 양 벽에서 0 이 되는 가장 단순한 모양 — 반파장 하나가 우물을 채운다. 가장 낮은 준위다.
  - `caption.climb` — 반파장을 하나 더 넣으려면 에너지가 더 든다 — 다음 준위까지 같은 빠르기로 오르는 중.
  - `caption.land` — 반파장이 하나 더 들어간 모양이 새 준위에 얹힌다 — 양 벽에서는 여전히 0 이다.
  - `caption.rest` — 위로 갈수록 준위 사이가 벌어진다 — 다음 준위까지 오르는 칸 수가 매번 두 칸씩 늘었다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — infinite-well
- 뷰 — ladder
- 시간표 — ground→caption.ground · climb-2→caption.climb · grow-2→caption.land · hold-2→caption.land · climb-3→caption.climb · grow-3→caption.land · hold-3→caption.land · climb-4→caption.climb · grow-4→caption.land · hold-4→caption.rest · fade→caption.rest
- 노드 종류 — body · dimension · readout · surface · trajectory

### T97 · `spin`

- 조각 — `aperi21:spin` · `sims/modern/spin`
- 문안 15건
  - `label.title` — 스핀
  - `label.operation` — 고전 대응물이 없는 각운동량
  - `label.stage` — 은 원자 빔 · 장치 셋
  - `label.view` — 이어 놓은 장치 도식
  - `label.oven` — 은 원자
  - `mark.z` — z
  - `mark.x` — x
  - `mark.up` — ↑
  - `mark.down` — ↓
  - `mark.right` — →
  - `mark.left` — ←
  - `caption.same` — ↑ 만 걸러 낸 원자를 다시 z 로 재면, 모두 ↑ 로 나온다
  - `caption.turn` — 가운데 장치를 x 로 돌린다
  - `caption.cross` — x 로 재면 → 와 ← 로 반반, 그 → 를 다시 z 로 재면 ↑ 와 ↓ 로 반반 갈린다
  - `caption.erased` — 걸러 낸 ↑ 가 x 를 거치자 지워졌다 — 마지막 z 에서 ↓ 가 다시 나왔다
- 조작기 — 없음 (자동 진행)
- 스테이지 — three-magnets
- 뷰 — chain
- 시간표 — same→caption.same · sameLand→caption.same · sameHold→caption.same · turn→caption.turn · cross→caption.cross · crossLand→caption.cross · hold→caption.erased · fade→caption.erased
- 노드 종류 — body · lineSet · particleSystem · readout · region

### T98 · `binding-energy-curve`

- 조각 — `aperi21:binding-energy-curve` · `sims/modern/binding-energy-curve`
- 문안 20건
  - `label.title` — 결합 에너지 곡선
  - `label.operation` — 철에서 최대가 되는 이유
  - `label.stage` — 안정한 핵종
  - `label.view` — 융합과 분열
  - `label.axisBinding` — 핵자당 결합 에너지
  - `label.axisMass` — 질량수 A →
  - `label.energy` — 에너지
  - `label.fusion` — 융합
  - `label.fission` — 분열
  - `label.peak` — 약 {e} MeV
  - `label.value` — {v}
  - `symbol.H` — H
  - `symbol.He` — He
  - `symbol.Fe` — Fe
  - `symbol.Kr` — Kr
  - `symbol.Ba` — Ba
  - `symbol.U` — U
  - `caption.fuse` — 가벼운 핵은 합쳐서 오른다 — 수소 넷이 헬륨 하나가 되며 곡선을 크게 오르고, 오른 만큼 에너지가 나온다.
  - `caption.fission` — 무거운 핵은 쪼개서 오른다 — 우라늄-235 가 바륨과 크립톤으로 갈라지며 곡선을 조금 오른다.
  - `caption.meet` — 두 길 모두 꼭대기 철-56 을 향한다 — 철은 합쳐도 쪼개도 더 오를 곳이 없다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — stable-nuclides
- 뷰 — fusion-and-fission
- 시간표 — gather→caption.fuse · fuse→caption.fuse · fuse-way→caption.fuse · split→caption.fission · fission→caption.fission · fission-way→caption.fission · meet→caption.meet · clear→caption.meet · renew→caption.fuse
- 노드 종류 — body · readout · trajectory · vector

### T99 · `pn-junction`

- 조각 — `aperi21:pn-junction` · `sims/modern/pn-junction`
- 문안 18건
  - `label.title` — pn 접합
  - `label.operation` — 공핍층과 정류
  - `label.stage` — 실리콘 pn 접합
  - `label.view` — 접합 단면
  - `label.pType` — p형
  - `label.nType` — n형
  - `label.depletion` — 공핍층
  - `label.forward` — 순방향 {v} V
  - `label.reverse` — 역방향 {v} V
  - `label.field` — E
  - `label.plus` — +
  - `label.minus` — −
  - `caption.apart` — p형에는 양공(○)이 고정된 음이온(−) 곁에, n형에는 전자(●)가 고정된 양이온(+) 곁에 퍼져 있다. 두 조각을 붙인다.
  - `caption.meet` — 경계 가까이의 전자와 양공이 건너가 만나 함께 사라진다.
  - `caption.depleted` — 운반자가 사라진 자리(공핍층)에는 이온만 남고, 드러난 이온이 n쪽에서 p쪽으로 전기장을 만들어 더 건너오지 못하게 막는다.
  - `caption.forward` — 순방향 — p쪽에 +, n쪽에 −를 걸면 공핍층이 얇아지고 전자와 양공이 경계를 건너 계속 흐른다.
  - `caption.off` — 전압을 끄면 공핍층이 처음 폭으로 돌아온다.
  - `caption.reverse` — 역방향 — 반대로 걸면 전자와 양공이 양 끝으로 끌려가 공핍층이 넓어지고, 아무것도 경계를 건너지 못한다.
- 조작기 — 없음 (자동 진행)
- 스테이지 — silicon
- 뷰 — cross-section
- 시간표 — appear→caption.apart · apart→caption.apart · join→caption.apart · diffuse→caption.meet · recombine→caption.meet · fieldIn→caption.depleted · depleted→caption.depleted · fwdIn→caption.forward · fwd→caption.forward · fwdOut→caption.off · revIn→caption.reverse · rev→caption.reverse · fade→caption.reverse
- 노드 종류 — body · dimension · lineSet · particleSystem · readout · region · trace · vector

### T100 · `exchange-particles`

- 조각 — `aperi21:exchange-particles` · `sims/modern/exchange-particles`
- 문안 16건
  - `label.title` — 교환 입자
  - `label.operation` — 힘을 주고받는 입자
  - `label.stage` — 전자 둘의 광자 주고받기
  - `label.view` — 기본
  - `label.time` — 시간
  - `label.space` — 공간
  - `label.now` — 지금
  - `mark.electron` — e⁻
  - `mark.quark` — q
  - `mark.photon` — γ
  - `mark.gluon` — g
  - `caption.approach` — 두 전자가 서로 다가간다 — 세로는 시간, 가로는 공간이다
  - `caption.travel` — 한 전자가 광자를 내놓으며 반대로 튕겨 나고, 광자가 다른 전자로 건너간다
  - `caption.apart` — 광자를 받은 전자도 밀려나 둘이 멀어진다
  - `caption.hold` — 둘은 한 번도 닿지 않았다 — 광자 하나를 주고받은 것이 밀어냄이다
  - `caption.gluon` — 쿼크 둘 사이에서는 같은 자리를 글루온이 잇는다 — 강한 힘도 주고받음이다
- 조작기 — 없음 (자동 진행)
- 스테이지 — photon-exchange
- 뷰 — main
- 시간표 — approach→caption.approach · travel→caption.travel · apart→caption.apart · settle→caption.hold · hold→caption.hold · morph→caption.gluon · gluon→caption.gluon · fade→caption.gluon
- 노드 종류 — body · lineSet · readout · trajectory · vector
