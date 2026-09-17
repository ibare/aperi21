# spring-force — 이관 NOTES

원본: `tasks/piece-lab/spring-force/` (자유 구현, 캔버스 직접 그리기).
이관본은 **자유 렌더 없이** 표준 어휘 여섯으로 선언한다 — `body` · `trace` · `trajectory` ·
`readout` · `constraint` · `vector`.

| 원본 묶음 | 어휘 |
|---|---|
| 벽 | `body` rect(18 × 120, `muted` opacity 0.25) + `trace` tick 빗금(방향 [1,1], 길이 17, width 1) + `trajectory` 벽 면(width 2, `ink`) |
| 원래 길이 선 | `trajectory` dashed(width 1, `muted`) + `readout` '원래 길이'(오른쪽 정렬 13px) |
| 늘임 눈금 | `trajectory`(width 1) + `trace` tick(길이 8) + `readout` '{n}칸'(가운데 13px) |
| 용수철 | `constraint` spring(`secondary`, coils 14) |
| 물체 | `body` rect 50 × 50 (`ink`, 둘레 없음) |
| 손잡이 | `trajectory` 줄(width 2) + `body` circle 반지름 8 (`fill: 'none'` · `outline: 'role'` · glow 끔) + `readout` '당김' |
| 되돌리는 힘 | `vector`(width 4 · headSize 14 · `accent`) + `readout` '되돌리는 힘'(14px, 길이 40 넘을 때만) |
| 남겨 둔 힘 | `vector`(width 3 · headSize 14 · `accent` · opacity 0.55 × 떠오름 × 흐려짐) |
| 캡션 | `caption` 슬롯 — 단계마다 키 |

월드는 **원본 캔버스 1px = 1** 이고 y 만 위로 뒤집었다. 배치 상수(벽 60 · 원래 길이 320 ·
한 칸 100 · 용수철 높이 95 · 힘 화살표 42 · 자국 182 + 22 줄 간격)를 그대로 옮겼다. 고정 경계는
860 × 270 에 캡션 자리 34 를 더한 것이다.

시간표 — (`move1` 0.9 smooth → `hold1` 0.9) × 4 → `final` 1.3 → `return` 1.5 smooth → `rest` 0.5
(주기 10.5 s, 원본과 같음). 늘인 칸 수는 `Σ at('move i') − 4 · at('return')`. 자국 i 는
`start('hold i')` 이후 쉼 전까지 남고, `span(start, start + 0.2)` 로 떠오르며, 되돌아감의
`span(start, start + 1.5/1.4)` 로 흐려진다. 원본은 `(t + 0.45) mod 10.5` 로 열었으므로
`startAt: 0.45`. 모든 것이 시각의 함수라 상태는 비었고 `step` 은 항등이다.

캡션 — 당김 1 '한 칸 늘인다', 당김 2~4 '한 칸 더 늘인다', 멈춤 n 'n칸 늘이면 …', 마지막 멈춤
'같은 비율로 커졌다', 되돌아감 '함께 줄어든다', 쉼 '원래 길이에서는 힘이 없다'. 원본의
`captionFor` 분기와 같고, 문장이 가리키는 상태(칸 수·힘 유무)는 그 단계 내내 참이다 — 멈춤 n
단계 동안 늘임은 정확히 n, 쉼 단계 동안 늘임은 0 이고 힘 화살표가 없다.

## (a) 원본과 달라진 점과 이유

1. **이징이 `smooth`(smoothstep) 다.** 원본은 easeInOutQuad 였다. 엔진의 이징 이름은
   `linear` · `smooth` · `inOutCubic` 셋이고 그중 가장 가까운 것을 골랐다. 양 끝과 한가운데
   값은 같고 사이만 조금 다르다 — 되돌아감 77% 시점(t=9.2)에서 원본 늘임 0.43칸, 이관본
   0.55칸. `inOutCubic` 은 0.20칸으로 더 멀다.
2. **용수철이 가늘고 덜 벌어진다.** 원본은 굵기 2.5 · 옆 폭 14 · 곧은 목 14 였고, 엔진은
   굵기 `strokeWidth.regular`(1.5) · 옆 폭 7(고정) · 목 최대 10 이다. 봉우리 수(14)는 맞췄다.
   감긴 수가 고정이고 간격이 길이를 따라 벌어진다는 주장의 모양은 같다.
3. **색은 역할색이다.** 용수철 `secondary`, 힘 `accent`(원본 주황보다 갈색에 가깝다), 물체·벽 면
   `ink`, 나머지 `muted`. 벽 판의 옅은 회색은 `muted` opacity 0.25. 자국은 원본처럼 같은 색을 옅게.
4. **원래 길이 점선의 무늬가 [6,5] 다.** 원본은 [4,4]. 선 모양은 엔진의 무늬를 따른다.
5. 글자는 원본이 기준선(alphabetic)에 놓았고 readout 은 가운데(middle)에 놓아, 원본 기준선
   높이에서 5px 올려 앵커를 잡았다.
6. 화살촉은 원본이 `min(14, 길이 × 0.6)`, 엔진이 `min(14, 길이 × 0.35)` 다. 짧은 화살표(당기기
   시작할 때)의 머리가 원본보다 작다.

## (b) 화면에 없는 것

원본 NOTES 그대로 — 손이 당기는 힘 화살표, k 값·뉴턴 수치, 놓았을 때의 진동은 두지 않는다.
조작기·그리드·카메라 버튼도 없다.

## (c) 어휘 부족

1. ~~**`constraint` spring 의 `coils` 가 반 물결을 센다.**~~ **해결됨** — 선언은 코일 개수인데
   렌더러가 반 물결로 그리던 엔진 결함이었고 메인이 고쳤다. 이제 코일 하나 = 위·아래 한 벌이라
   원본 감은 수 그대로 `coils: 14` 를 준다.
2. **용수철의 옆 폭 · 굵기 · 목 길이를 선언할 수 없다.** `COIL_SPREAD = 7` 과
   `strokeWidth.regular` 가 렌더러에 고정이다. 원본의 굵고 깊은 코일(폭 14 · 굵기 2.5)을 낼
   수 없다. `Vector.width` 처럼 `width` 와 옆 폭 필드가 있으면 된다.
3. **이징 `inOutQuad` 가 없다.** 원본 조각들이 가장 흔히 손으로 짜는 이징인데 이름이 없어
   `smooth` 로 근사했다 (a) 1.
4. **화살촉 비율 상한(0.35)이 선언 밖이다.** 짧아지는 힘 화살표가 원본보다 머리가 작다 (a) 6.
5. **world 앵커 readout 의 세로 기준이 가운데 하나뿐이다.** 원본 좌표(기준선)를 옮길 때마다
   글자 크기로 어림한 오프셋을 더해야 한다.
