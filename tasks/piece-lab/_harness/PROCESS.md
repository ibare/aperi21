# 조각 배치 절차

한 번에 N 개(기본 10)를 만든다. **확인 지점 셋에서 멈추고 사용자의 명시적 응답을 기다린다.**
"끝까지 진행해 보라" 는 절차가 도는지 보라는 뜻이지 확인 지점을 빼라는 뜻이 아니다.

```
① 선정 ──확인──▶ 자유 구현 ─▶ 엔진 대조 ─▶ ② 보고서 ──확인──▶ 엔진 작업 ─▶ 이관 ─▶ ③ sims ──확인──▶ 커밋
```

## ① 주제 선정 — 멈춘다

- 동사와 장면이 겹치지 않게 여러 분과에서 고른다. 같은 분과만 고르면 이미 있는 어휘를 다시 확인할 뿐이다
- 후보와 고른 이유를 드리고 **확정을 받는다**
- 확정되면 배치 매니페스트를 쓴다 — `tasks/piece-lab/_batches/<NN-이름>.json`
  ```json
  { "name": "01-…", "title": "…", "record": "tasks/engine-requirements/batches/01-….md", "pieces": ["…"] }
  ```

## 자유 구현

- 격리된 에이전트 N 개를 병렬로. 지시서는 `BRIEF.md`. **엔진 이야기는 넣지 않는다**
- 산출물: `tasks/piece-lab/<id>/` 의 `index.html` · `inventory.json` · `NOTES.md`
- 계측 약속(`piece-kit.js`)을 지켰는지 에이전트가 `pnpm piece:report <id>` 로 스스로 확인한다.
  결과는 `_report/_scratch/<id>/` 로 가서 배치 보고서를 덮지 않는다

## 엔진 대조 — 메인 에이전트가 한다

조각마다 `tasks/piece-lab/<id>/engine-fit.json` 을 쓴다. 원본의 `inventory.json` 요소를 하나씩
엔진 어휘에 대 본다.

```json
{
  "rows": [
    { "element": "원 궤도", "vocab": "trajectory (closed · width)", "status": "수정 필요",
      "note": "closed 가 선언만 있고 미구현" }
  ],
  "outside": ["꺾은선 속도의 정확한 적분 — sim 의 물리"]
}
```

`status` 는 넷 중 하나다.

| 판정 | 뜻 |
|---|---|
| `있음` | 지금 어휘로 된다 (조합 포함) |
| `수정 필요` | 어휘는 있는데 모자라거나 선언만 있고 구현이 없다 |
| `없음` | 새 어휘·새 계약이 필요하다 |
| `엔진 밖` | sim 의 물리·배치 계산이거나, 사용자 결정이 필요하다 |

판정 전에 **어휘의 선언과 렌더러 구현을 둘 다 읽는다.** 선언만 보고 "있음" 이라 하면
`trajectory.lineStyle` 처럼 선언만 있고 구현이 없는 것을 놓친다.

## ② 보고서 — 멈춘다

```sh
pnpm piece:report --batch=<NN-이름>       # --sims 는 넣지 않는다
```

`tasks/piece-lab/_report/<NN-이름>/index.html` 한 장에 셋이 담긴다.

1. 배치 전체의 **없는 기능 · 수정 필요** 합계 — 엔진 작업 목록 초안
2. 조각별 원본 스크린샷 (주장이 드러나는 시각들)
3. 조각별 엔진 대조표

드리고 **멈춘다.** 사용자가 판단하는 것:
- 원본이 주장을 담았는가. 아니면 무엇을 고칠지
- 엔진 대조가 맞는가. 엔진 작업 범위와 `엔진 밖` 항목의 결정

## 엔진 작업

- rule-guard 사전 검토 → 구현 → typecheck · test · budget → 기존 sims 시각 회귀 → rule-guard 사후 검증
- 새 필드는 이관될 조각이 **실제로 선언**해야 한다. 쓰는 곳 없이 엔진만 들어가면 상상으로 만든 것이다

## 이관

- 메인이 sim 스텁 · loader · 카탈로그 연결을 먼저 만든다 (병렬 이관의 공유 파일 충돌 방지)
- 격리된 에이전트 N 개를 병렬로. 지시서는 `PORT_BRIEF.md`
- 에이전트는 원본과 같은 `?t=` 에서 대조한다: `pnpm piece:report --sims=<base> <id>` → `_report/_scratch/<id>/`

## ③ 정식 sims — 멈춘다

`pnpm piece:report --batch=<NN-이름> --sims=<base>` 로 원본과 sims 를 나란히 드린다. 이관에서 드러난 어휘 부족은 다음 배치의 엔진 대조 입력이 된다.
확인을 받은 뒤 커밋한다.

## 보고서 자리

```
tasks/piece-lab/_report/            (gitignore — 언제든 다시 만든다)
  index.html                        배치 목차. 각 배치의 summary.json 만 모은다
  <NN-이름>/                         배치 하나 = 확인 한 번
    index.html  report.md  summary.json  shots/
  _scratch/<id>/                    에이전트 자기 점검. 배치 보고서를 덮지 않는다
```

한 페이지에 한 배치만 담는다. 조각이 수백 개가 되어도 확인하는 화면은 배치 크기(10)를 넘지 않는다.

---

# 표현력 검증 턴제 (2026-09-17 사용자 확정)

운동학 · 뉴턴 역학 59개를 위 절차로 전수 구현한 뒤, 나머지 9개 분야에서 엔진 표현력을 검증하는 동안은
아래로 대신한다. 검증이 끝나면 결과로 최종 절차를 다시 정한다.

```
[한 번] 45개 목록 확정 ──확인
턴 n:  자유 구현(분야당 1개) ─▶ 바로 이관 ─▶ 결과 보고 ──확인 ─▶ 「주장」 부족만 엔진 반영 ─▶ 커밋 ─▶ 새 부족 0 인 분야 제외
```

- 목록: `_batches/probe-9domains.json`. 턴 n 의 매니페스트는 `_batches/<NN>-probe-t<n>.json`
- **엔진 대조표(`engine-fit.json`)와 ② 보고서는 쓰지 않는다.** 05~07 에서 결함 · 판정 오류가 모두 이관 중에 드러났다.
- 자유 구현(원본)은 유지한다 — 엔진에 묶이지 않은 기준 그림이 있어야 「어휘 때문에 주장이 약해졌는가」 를 판단한다.
- 이관 에이전트는 부족을 `tasks/engine-requirements/gap-ledger.md` 의 id 에 대 보고, 없으면 **새 부족**으로 영향(`주장` / `근사`)과 함께 보고한다. 장부는 메인이 고친다.
- 결과 보고: `pnpm piece:report --batch=<NN>-probe-t<n> --sims=<base>` + 분야별 새 부족 수 표 + 주장 판단 거리
- 한 턴에 새 부족 종류가 0 인 분야는 `probe-9domains.json` 의 `excluded` 로 옮긴다.
