# pulley-system — 이관 NOTES

원본: `tasks/piece-lab/pulley-system/`. 자유 렌더 없이 선언만으로 옮겼다. 배치 상수는 원본 논리
좌표(900 × 330 px)를 그대로 가져와 1 m = 50 px 로 월드에 옮겼다(바닥선 y = 0, y 위).

## 쓴 어휘

| 원본 요소 | 어휘 |
|---|---|
| 천장 막대 | `body` rect (outline none · muted · luminance 0.6) |
| 바닥선 | `trajectory` (width 1.5 · muted · luminance 0.6) |
| 짐의 처음 자리 | `trajectory` closed · dashed · width 1.2 · muted subtle |
| 고정 · 움직도르래 | `body` circle 채움(luminance 0.22 · glow false) + `trajectory` closed 64각형 윤곽(1.5) + 바큇살 `trajectory` ×3 + 축 `body` point |
| 매단 줄 · 움직도르래 막대 · 고리 | `trajectory` (width 2 · ink · opacity 0.8) |
| 줄 | `trajectory` 두 겹 — 바탕(width 3.2 · muted luminance 0.7) + 무늬(width 3.2 · ink · **dotted**) |
| 짐 · 무게 글자 | `body` rect + `readout` (world · chip 없음 · bold 13 px) |
| 오른 높이 막대 · 값 | `trajectory` ×3 (눈금 · 막대, width 1.2) + `readout` ×2 |
| 당긴 줄 길이 막대 · 값 | `trajectory` ×3 (accent · width 2) + `readout` (accent · bold) |
| 손 | `body` custom (둥근 사각형 SVG 경로) |
| 당기는 힘 | `vector` (width 3 · headSize 10 px) + `readout` |
| 받치는 줄 가닥 수 | `readout` (muted · 14 px) |
| 오르기 · 멈춤 · 내리기 · 앞당김 | `timeline` 세 단계(4.5 · 2 · 1.5) + `startAt: 0.8` |
| 캡션 | `caption` 슬롯 (단계마다 키 하나 · world 앵커 · 왼쪽 정렬 15 px) |
| 겹침 순서 | `drawOrder: 'scene'` |
| 프레이밍 | `boundsHint` 고정 (원본 캔버스 + 캡션 줄) · `canvas` 390 |

상태는 비어 있다. 짐 높이 · 줄 경로 · 도르래 회전각 · 손 자리가 모두 `timeline` 진행도의 함수다.
기하(`geometry` · `sheaveAngle`)는 원본 함수를 `physics.ts` 로 그대로 옮겼다.

### 줄 무늬

원본은 줄 경로를 **묶인 끝**(1가닥은 짐에 매인 끝)부터 이어 긋고 `lineDashOffset = 0` 으로 무늬를
그 끝에 박았다. 줄이 늘지 않으니 그 끝에서 잰 길이가 곧 재료 좌표이고, 가닥이 짧아지는 만큼 무늬가
도르래를 타고 손 쪽으로 흐른다. 여기서도 경로를 같은 끝에서 시작하는 **한 trajectory** 로 두어
무늬 밀기 없이 같은 흐름이 난다. 호는 64등분으로 표본하는데 호의 각이 시각에 따라 변하지 않아 표본
길이도 일정하다 — 무늬 좌표가 흔들리지 않는다.

[2026-09-17] 엔진 대조에서 「무늬 위상을 선언할 수 없다(수정 필요)」 로 판정해 `Trajectory.dashOffset`
을 올렸으나, 이 이관에서 경로를 재료에 붙은 끝부터 그으면 필요 없다는 것이 드러나 필드를 되돌렸다.

## (a) 원본과 달라진 점과 이유

- **캡션이 캔버스 안에 들어왔다.** 원본은 330 px 캔버스 아래 DOM 문단이었다. 캡션 슬롯은 캔버스
  위에 놓이므로 경계를 캡션 줄까지 늘리고 캔버스를 390 px 로 두었다. 카탈로그 폭에서 가로가 제약이
  되는 높이다 — 360 으로 줄이면 세로가 제약이 되어 그림이 더 작아지는 것을 대조 스크린샷으로 확인했다.
  그래서 원본보다 배율이 조금 작다(약 0.84).
- **줄 무늬가 짧은 대시(3 px · 간격 9 px, 끝 자름)가 아니라 둥근 점(약 4 px · 주기 7.2 px)이다.**
  `trajectory` 의 무늬는 `dashed` [6, 5] · `dotted` [0.5, 4] 를 굵기 비례로 늘리는 두 벌뿐이고 끝이
  둥글다. `dashed` 는 굵기 3.2 에서 거의 실선이 되어 흐름이 안 보이고, `dotted` 가 원본의 성긴 무늬에
  가깝다. 주기가 짧아 무늬가 더 촘촘하고 바탕 줄이 원본보다 덜 보인다.
- **색 톤.** 원본 줄은 황갈색 바탕에 짙은 갈색 무늬였다. 갈색 역할이 없고 강조색은 '당긴 줄 길이' 에만
  써야 하므로, 줄 바탕은 옅은 회색(muted luminance 0.7) · 무늬는 먹색으로 옮겼다. 강조색은 원본의
  주황 빨강이 아니라 테마 accent(호박색)이다. 도르래 채움 · 천장 · 바닥도 원본 베이지 대신 회색 빛의 양으로 냈다.
- **짐 안 '40 N' 이 흰색이 아니라 먹색이다.** 짙은 물체 위 글자에 바탕색(반전) 역할이 없다
  (atwood-machine 과 같은 부족).
- **점선 사각형 무늬가 원본 [4, 4] 가 아니라 엔진 `dashed` [6, 5] 다.**
- **도르래 축 점 반지름이 2.2 가 아니라 `point` 고정 3 px 다.**
- **글꼴** — 원본 시스템 산세리프 대신 테마 `text` 글꼴이다.
- 캡션 문장 · 값 자릿수(소수 둘째 자리) · 힘 값(40 · 20 · 10 N 정수) · 모든 배치 상수는 원본 그대로다.
  캡션은 단계로만 갈리고 조작기가 없어 값에 따라 틀린 말을 할 수 없다 — 멈춤 단계의
  「1.00 m · 2.00 m · 4.00 m」 는 멈춤 동안 오르기 진행도가 정확히 1 이라 화면 값과 같다.

## (b) 어휘 부족

1. **시간표 이징에 코사인 곡선이 없다.** 원본의 오르내림은 `(1 − cos πx) / 2` 인데 `TimelineEase` 의
   `smooth` 는 smoothstep `x²(3 − 2x)` 이다(최대 차이 약 0.02 m → 값 글자 0.01 어긋남). 그래서 단계는
   `linear` 로 선언하고 scene 이 코사인을 건다 — 저작자가 이징을 바꿔도 화면이 따르지 않는다.
   후보: `TimelineEase` 에 `'cosine'`(sine in-out) 추가.
2. **무늬 모양을 선언할 수 없다.** `lineStyle` 은 `dashed` · `dotted` 두 벌이고 길이 · 간격 · 끝 모양이
   렌더러 상수다. 원본 줄 무늬(3 on / 9 off, butt)와 짐 자리 점선([4, 4])을 낼 수 없었다.
   후보: `Trajectory.dash?: readonly number[]`(화면 px) + `cap?: 'butt' | 'round'`.
3. **'감긴 줄' 요소가 없다** (원본 engineWish 1). 줄 경로(선분 + 호)를 묶인 끝부터 잇고 도르래 접촉 길이로
   회전각을 내는 계산을 sim 이 다시 짰다(`physics.ts` `geometry` · `sheaveAngle`). 호를 점으로 표본해
   `trajectory` 에 넘긴다. 도르래 장치마다 반복될 계산이다. 이번 판정은 어휘 조합으로 성립했으므로
   승격 대상인지는 다음 사례를 보고 정한다.
4. **`body circle` 둘레 굵기를 줄 수 없다.** 도르래 윤곽 1.5 px 를 내려고 원을 64각형 `trajectory` 로
   겹쳐 그었다 (atwood-machine 6 과 같은 부족).
5. **짙은 물체 위 글자에 바탕색(반전) 역할이 없다.** 짐 안 '40 N' 을 흰색으로 낼 수 없다
   (atwood-machine 4 와 같은 부족).
6. **`point` 반지름을 줄 수 없다.** 도르래 축 점이 3 px 고정이다(원본 2.2).
