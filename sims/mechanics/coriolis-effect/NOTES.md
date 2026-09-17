# 코리올리 효과 (coriolis-effect) — 이관 기록

원본: `tasks/piece-lab/coriolis-effect/` (자유 구현). 자유 렌더 없이 선언만으로 옮겼다.
원본의 결정과 근거는 그쪽 `NOTES.md`.

## 쓴 어휘

- `body` — 원판(disc, `luminance` · `outline: 'line'` · `glow: false`) · 과녁 받침 · 던지는 사람 ·
  공(circle, `opacity`) · 깃발(custom 삼각형 + `orientation`)
- `trajectory` — 살 6개(`luminance`) · 깃대 · 공이 지나간 길(65점, `opacity`)
- `readout` — 판 이름표(월드 앵커, `font: 'text'`)
- 선언 — `timeline`(fly 2.4 · fade 1.2) · `startAt: 1.0` · `caption`(월드 앵커 슬롯) ·
  `drawOrder: 'scene'` · `canvas` · `boundsHint`
- `BaseMeta.clip` 은 쓰지 않았다 — 왼쪽 원판(85~345)과 깃발 끝(최대 365)이 두 판 사이(420)를
  넘지 않는다. 이번 배치의 새 필드(`button` · `restart` · `showDelta` · `Vector.outline`)도 쓸 자리가 없다.

## (a) 원본과 달라진 점

- **주기 경계** — 원본 `throwState(t)` 의 `floor((t + OFFSET) / CYCLE)` · `s < FLIGHT` 를 시간표 단계로
  옮겼다. 비행 시간은 `at('fly') × 2.4`, 알파는 `1 − at('fade')`, 던진 시각은 `t − startAt − u` 다. 값은 같다.
- **원판 회전** — 원본은 페이지 시계(앞당기기 전)로 돌렸다. `timeline.t − startAt` 으로 같은 값을 만든다.
- **색** — 원본 hex 를 색 역할로 옮겼다(C2). 공·길은 `primary`(원본 주황 #d9582b → 테마 빨강),
  과녁·사람은 `ink`(원본 #4a4a4a 보다 짙다), 이름표 `muted strong`. 원판 채움은 `muted` 를
  `luminance 0.16`, 살은 `0.3` 으로 바탕에 섞었다.
- **원판 테두리** — 원본은 1.5px #c9c3b6, 여기서는 테마 선 색 1px(`outline: 'line'`)이다.
- **캡션** — 원본은 캔버스 밖 DOM 한 줄. 캡션 슬롯을 캔버스 아래 월드 자리(y −366)에 두고
  경계를 30 늘렸다.
- **이름표 기준선** — 원본은 윗줄(top) 기준, readout 월드 앵커는 가운데 줄 기준이라 반 글자(7) 내렸다.
- **대조** — `piece:report` 0 · 1.4 · 3.2 · 5.0 네 시각 모두 원판 살의 각, 깃발 자리·기울기, 공 자리,
  왼쪽 직선 · 오른쪽 곡선 모양이 원본과 같다. 카탈로그 임베드가 원본보다 작게 잡혀 배율만 다르다.
  흐려지는 구간(2.0 s 근처)은 probe 시각에 없어 스크린샷으로는 보지 않았다.

## (b) 어휘 부족

1. **body 윤곽 굵기 · 색** — `outline: 'line'` 은 테마 `thin`(1px) · 선 색 고정이라 원본 원판 테두리
   1.5px 의 짙은 무채색을 낼 수 없다. closed `trajectory` 다각형으로 따로 그을 수는 있으나 원 하나를
   두 인스턴스로 나누는 것이라 근사로 두었다 (reference-frame 부족 1 과 같다).
2. **판 단위 좌표계 · 회전** — 한 사건을 두 기준틀로 그리려고 판마다 중심을 더하는 `at(p, …)` 와
   −ωt 회전을 인스턴스마다 손으로 계산했다. "이 인스턴스들은 이 판에 속하고 판이 이만큼 돈다"
   를 한 번에 선언하는 묶음은 없다 (원본 engineWish 1). 기준틀이 둘로 고정이라 메인 판정은 어휘 밖이다.
3. **해석식 경로를 지나간 길로** — scene 이 비행 시간 0..τ 를 64등분해 `ballOffset` 을 다시 샘플링한다
   (원본 engineWish 2). `trajectory` 는 점 목록만 받는다.
4. **색 역할의 폭** — 강조색이 주황이던 원본을 `primary`(빨강)로, #4a4a4a 무채색을 `ink`(먹)로 옮겼다.
   원판처럼 "바탕보다 한 톤 짙은 면" 은 역할이 없어 `luminance` 로 섞는다 — 값이 조각마다 눈대중이다.
5. **글자 배율** — readout · 캡션 글자가 카메라 배율을 따르지 않아, 임베드가 작아지면 그림에 비해 글자가
   상대적으로 크다.
