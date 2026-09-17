# 접선·법선 가속도 — 이관 NOTES

원본: `tasks/piece-lab/tangential-normal-acceleration/` (주장·화면 결정은 그쪽 NOTES 가 기준).
자유 렌더 없이 표준 어휘 선언만으로 옮겼다.

## 쓴 어휘

| 원본 요소 | 어휘 |
|---|---|
| 지나는 길 | `trajectory` closed · width 2 · muted subtle · opacity 0.55 |
| 속도 화살 · 모은 속도 화살 | `vector` ink · width 3 · headSize 12 px |
| 속력 몫 / 방향 몫 (두 판) | `vector` accent / secondary · width 3.5 · headSize 11 px |
| 가속도 화살 (두 판) | `vector` muted · width 1.5 + `trajectory` 평행사변형 dashed · width 1 |
| '속력 몫' · '방향 몫' 글자 | `readout` world 앵커 + 화면 px offset · font text 13 · chip 없음 |
| 물체 · 모음판 원점 | `body` circle · ink · outline none · glow false |
| 모음판 이름 | `readout` world · muted · 13 px |
| 같은 길이 원 | `trajectory` closed · dotted · width 1 |
| 화살 끝 자취 | `trajectory` fade tail · opacity 0.5 · 최근 2.5 초 |
| 캡션 | `BundleSchema.caption` 슬롯 (15 px · 먹색 · 페이드 0.25 초) + `timeline` 단계 캡션 |
| 도착 순간 진행 중 | `BundleSchema.startAt: 0.8` (원본 START 48 프레임) |
| 겹침 순서 | `drawOrder: 'scene'` |

## (a) 원본과 달라진 점과 이유

- **시간표는 선언이다.** 원본의 `PHASES`(f 프레임 · dv · turn · kind)를 둘로 갈랐다 —
  길이와 캡션은 `timeline.phases` 12단계(반 바퀴 여섯 × 2, 2.2/2.0 초), 속력 변화·도는 각은
  `SCRIPT`(단계 id → 대본). 프레임 표는 physics 가 **선언된 단계 길이로** 적분한다.
  단계를 늘이면 경로도 그에 맞게 다시 적분되고 닫힘 오차는 같은 방식으로 나눠 없앤다.
- **시각 조회는 보간.** 원본은 `round(t·60)` 칸을 읽었고, 여기서는 이웃한 두 칸을
  선형 보간한다(방향각은 표 이음매의 2π 튐을 걷어 낸다). 두 몫의 크기는 표가 아니라
  지금 단계(`tl.phase`)의 대본에서 읽는다.
- **색.** 방향 몫의 청록(#2a7f9e)은 역할이 없어 `secondary`(파랑)로 옮겼다. 속력 몫
  주황은 `accent`. 두 색은 여전히 각각 한 뜻에만 쓴다.
- **배율.** 원본 캔버스 860×330 을 월드 ±4.3 × ±1.65 로 두고 그 아래 캡션 한 줄 자리를
  더해 고정 `boundsHint` 로 맞춘다. 900 px 창의 임베드에서 가로가 배율을 묶어 원본의
  약 0.87 배로 그려진다. 원본은 캡션이 캔버스 밖 DOM 이었고 여기서는 캔버스 안 슬롯이다.
- **화살 머리 비율.** 원본 `arrow()` 는 머리를 길이의 60% 까지, `vector` 는 35% 까지 준다.
  짧은 몫(느린 구간 시작의 방향 몫 등)에서 머리가 원본보다 작다.
- **점선 무늬.** 원본 평행사변형 [3,4] · 같은 길이 원 [2,5] 를 `dashed`[6,5] · `dotted`[0.5,4]
  로 근사했다.
- **모음판 원점 반지름** 3.5 px 는 `point`(고정 3 px) 대신 `circle` 크기로 줬다 — 배율을 따라간다.

## (b) 어휘 부족

- **[해결됨 2026-09-17 — 러너가 검사 시각을 `startAt` 위에 놓게 고쳤다(`runBundle.ts` inspectAt). 이 항목은 당시 기록이다]** **대조 장치의 시각 이동이 `startAt` 을 덮어쓴다.** `runBundle` 의 `inspectAt` 이
  `timeEngine.seek(t)` 로 시계를 `t` 에 두므로, `?t=4.6` 은 원본의 `t=4.6`(시계 5.4)보다
  0.8 초 이른 장면이다. `piece:report` 의 `.sims.png` 는 그래서 모두 어긋나 보인다.
  직접 `?t=<t+0.8>` 로 다시 찍어 여섯 시각 모두 원본과 같은 장면임을 확인했다.
  (엔진 쪽 공유 파일이라 고치지 않았다 — `inspectAt` 이 `startAt` 을 더할지 결정이 필요하다.)
- **점선 무늬를 선언할 수 없다.** `lineStyle` 은 dashed/dotted 두 벌뿐이라 원본의 짧은
  점선([2,5] · [3,4])을 그대로 옮길 수 없다.
- **화살 머리가 길이에 대해 차지하는 비율**을 선언할 수 없다(35% 고정).
- **화살 끝에 붙는 이름.** `vector.label` 은 시작점에서 40% 자리에 선을 비켜 놓이고
  mono 11 px 로 고정이라, 원본처럼 "화살 끝 너머 · 옆" 에 13 px 본문 글꼴로 붙이지 못한다.
  `readout` 을 따로 두고 자리를 조각이 계산했다.
- **구간 대본 → 프레임 표 적분기** 는 여전히 조각의 physics 다(원본 engineWish 1).
  같은 모양(구간마다 aT·ω 를 주고 닫힌 경로로 적분)이 다른 조각에 나오면 올릴 후보.
- **"한 점에 모은 판"(같은 벡터를 두 곳에 같은 배율로)** 은 선언이 아니라 scene 의 좌표
  계산이다. 두 판이 한 월드에 있어 배율 공유는 저절로 되지만, 판의 자리·크기를
  편집할 선언은 없다.
