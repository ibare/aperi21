# connected-bodies — 이관 NOTES

원본: `tasks/piece-lab/connected-bodies/` (자유 구현, 캔버스 직접 그리기).
이관본은 **자유 렌더 없이** 표준 어휘 다섯으로 선언한다 — `trajectory` · `trace` · `body` ·
`readout` · `vector`.

| 원본 묶음 | 어휘 |
|---|---|
| 바닥 | `trajectory` (2점 · width 1.5 · `muted` subtle) |
| 같은 시각 눈금 | `trace` shape `tick` (바닥 아래 4~14px, 길이 10 월드 · width 1.5 · `muted` medium) |
| 끈 | `trajectory` (2점 · width 2 · `ink`) |
| 물체 | `body` rect (가로 = 질량 × 40, 세로 34 · 윤곽 없음 · `muted` strong) + `readout` 질량 글자 (`{m} kg`, 13px bold, 칩 없음) |
| 당기는 힘 | `vector` (1 N = 10px · width 3 · headSize 9 · `accent`) + `readout` 힘 글자 (`{f} N`, 13px bold, `accent`) |
| 캡션 | `caption` 슬롯 — 단계 `run` 의 키 하나(고정 문장) |

월드는 **원본 캔버스 1px = 1** 이고 y 만 위로 뒤집었다. 배치 상수(1 kg = 40px · 물체 높이 34 · 끈 34 ·
줄 간격 72 · 출발 앞면 178 · 도착 앞면 744)를 그대로 옮겼다. 고정 경계는 840 × 236 에 캡션 자리 34.

시간표 — `run` 3 s 단계 하나(주기 3 s, 원본과 같음). 달린 시간은 `at('run') · duration('run')`.
원본은 `(t + 1) mod 3` 으로 1초 앞당겨 열었으므로 `startAt: 1`. 모든 것이 시각의 함수라 상태는
비었고 `step` 은 항등이다. 가속도는 줄마다 `acceleration(F, masses)` 로 계산한다 — 합만 들어가므로
세 줄이 같은 값을 낸다(원본은 상수 하나를 공유했다).

## (a) 원본과 달라진 점과 이유

1. **물체 위 질량 글자가 흰색이 아니라 먹색(`ink`)이다.** 짙은 물체 위 바탕색(반전) 글자를 낼 색 역할이
   없다 — (b) 1. 물체 색은 원본 슬레이트 회색(#5b6b7d)에 가장 가까운 `muted` strong(#6B7280)이라 먹색
   글자도 읽힌다(대조 스크린샷에서 확인). 다크 테마에서는 먹색이 밝은 크림색이 되어 원본 쪽에 더 가깝다.
2. **힘 글자 `6 N` 을 `vector.label` 이 아니라 `readout` 으로 두었다.** 엔진 대조표는 `vector (accent · label)`
   이었으나, `vector.label` 은 글자 크기가 테마 regular(11px) 고정 · 고정폭 글꼴 · 시작점에서 40% 자리이고
   `vars` 를 받지 않아 `{f} N` 을 조립할 수 없다. 원본은 13px 굵은 글자를 화살표 가운데 9px 위에 두었다 —
   `readout` 월드 앵커로 그 자리를 그대로 옮겼다. (b) 2.
3. **글꼴이 테마 글꼴이다.** 원본은 시스템 산세리프였다. 굵기 600 · 크기 13px 는 같다.
4. **색은 역할색으로 옮겼다** — 물체 `muted` strong, 끈 `ink`, 눈금 `muted` medium, 바닥 `muted` subtle,
   힘 `accent`(원본의 주황 강조색 한 가지 뜻 그대로). 캡션 `ink` 15px.
5. 캔버스 높이 340(최소 300). 300 에서는 그림이 원본의 약 0.84 배로 작아져 올렸다.

캡션은 원본과 같은 고정 한 문장이라 주기 어느 시각(되감기 순간 포함)에도 화면과 어긋나지 않는다.
en 문안을 새로 두었다.

## (b) 어휘 부족

1. **짙은 물체 위 글자에 바탕색(반전) 역할이 없다.** `readout` 의 색은 `ColorRole` 뿐이다. `atwood-machine`
   (b) 4 와 같은 부족 — 이 조각이 두 번째 사례다. `body.outline` · `vector.outline` 의 `'background'` 처럼
   글자에도 바탕색 선택지가 있으면 된다.
2. **`vector.label` 의 글자 크기 · 글꼴 · 자리 · 값 끼우기를 선언할 수 없다.** 크기는 테마 regular 고정,
   글꼴은 mono 고정, 자리는 40% 지점 고정이고 `vars` 가 없다. 그래서 "N 당 px 척도 화살표 + 크기 글자"
   (원본 engineWish 3)가 `vector` + `readout` 두 인스턴스로 갈라졌다 — 글자가 화살표를 따라가는 참조는
   잃었다(scene 이 같은 식으로 두 자리를 계산하므로 화면은 같다).

원본 engineWish 의 나머지 — 스트로보 눈금(`trace` tick 으로 됨), 줄을 쌓는 비교 배치(월드 좌표로 됨),
주기 반복과 위상 앞당김(`timeline` + `startAt` 으로 됨) — 은 어휘로 됐다.

## 화면에 두지 않은 것 (원본 판단 유지)

- 끈의 장력(가운데 줄 4 N, 아래 줄 2 N) — 「끈의 힘은 뒤 질량이 정한다」는 두 번째 주장이 된다.
- 가속도 · 속도 숫자, 거리 단위, 축 · 그리드 · 재생 버튼 · 범례 — 빨라짐은 눈금 간격이, 같음은 눈금 겹침이 말한다.
- 조작기 — 세 줄이 가능한 나눔을 이미 다 보여 준다.

## 대조 (probeTimes 0 · 1 · 1.95 · 2.3)

`pnpm -s piece:report --sims=http://localhost:5173/aperi21/ connected-bodies` 의 네 시각 스크린샷을 직접
열어 확인했다. 네 시각 모두 물체 위치 · 세 줄 앞면 정렬 · 눈금 수(3 · 5 · 6 · 1)와 x · 끈 · 힘 화살표 ·
캡션이 원본과 같은 장면이다. 다른 것은 (a) 1 의 질량 글자 색과 글꼴 · 역할색 톤뿐이다.
