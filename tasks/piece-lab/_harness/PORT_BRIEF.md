# 조각 이관 지시서 (템플릿)

> `{{…}}` 를 채워 이관 에이전트에게 준다. 자유 구현 지시서(`BRIEF.md`)와 달리
> 이번에는 **엔진 위에서** 만든다. 자유롭게 그리는 것이 아니라 원본을 어휘로 옮기는 일이다.

---

## 너의 일

`tasks/piece-lab/{{id}}/` 에 있는 **자유 구현 조각**을 엔진 위의 정식 sim
`sims/{{category}}/{{id}}/` 로 옮긴다. 화면은 원본과 같아야 한다.

sim 패키지는 **이미 만들어져 있다** (6파일 최소 스텁 · loader · 카탈로그 연결 완료).
너는 `sims/{{category}}/{{id}}/src/` 안의 파일과 `sims/{{category}}/{{id}}/NOTES.md` 만
고친다. **그 밖은 고치지 않는다** — 다른 에이전트가 동시에 다른 조각을 옮기고 있어서,
공유 파일을 건드리면 충돌한다.

금지 — 공유 파일을 바꾸는 명령:
- `pnpm catalog:gen` · `pnpm catalog:topics` (카탈로그 생성물은 메인이 합친 뒤 한 번 만든다)
- `pnpm install` · `pnpm add` · package.json 수정 (의존을 추가해야 하면 멈추고 보고한다)

**export 이름을 바꾸지 않는다.** `{{camel}}Schema` · `initialState` · `step` · `scene` ·
`controllers` · `{{camel}}Bundle` — loader 가 이 이름으로 찾는다.

## 읽을 것

1. 원본 — `tasks/piece-lab/{{id}}/` 의 `index.html` · `inventory.json` · `NOTES.md`
2. 규칙 — `rules/principles.md` 와 `rules/specifics/S-sim.md` · `S-piece.md` · `S-render.md`,
   `rules/concerns/C1-message-resources.md` · `C2-token-boundary.md`
3. 어휘 — `packages/schema/src/index.ts` 의 primitive 타입들과
   `packages/host/src/renderer/primitives/*.ts`. **읽기만 한다.**
4. 구조 참고 — `sims/fluids/torricellis-law/src/` (선언만으로 성립한 조각의 예)

## 규칙

- **자유 렌더를 쓰지 않는다** (`Bundle.renderers` 금지). 어휘로 안 되는 것이 있으면 억지로
  맞추지도 말고 직접 그리지도 말고, **가장 가까운 어휘로 근사한 뒤 무엇이 모자랐는지
  `NOTES.md` 「어휘 부족」에 적는다.** 그것이 다음 엔진 작업의 입력이다.
- S-sim 6파일. `scene.ts` 는 그리지 않고 선언한다. 캔버스·색·좌표 변환을 만지지 않는다.
- 화면 문자는 `schema.ts` 의 messages 에 둔다 (C1). 색은 `colorRole` 로만 (C2).
- **원본의 연출 시간표는 `BundleSchema.timeline` 으로 선언한다.** 주기 안 단계의 길이 ·
  이징 · 단계마다의 캡션 키를 적고, scene 은 `params.timeline` 의 `at(id)` · `start(id)` ·
  `span(from, to)` 를 읽는다. 단계 경계 상수와 `if (u < B1)` 분기를 옮겨 오지 않는다.
- **"도착한 순간 이미 진행 중"** 은 `timeline.startAt` 이다. 원본이 시계를 앞당겨 열었다면
  같은 만큼 앞당긴다.
- 캡션은 `BundleSchema.caption` 슬롯으로 선언한다(자리 · 정렬 · 글자 크기 · 페이드).
  scene 에 캡션 readout 을 따로 내지 않는다.
- 모든 것이 시각의 함수이면 상태는 비운다. 누적 적분이 필요한 것만 `step` 이 상태에
  쌓는다. 난수가 필요하면 시드를 상태나 선언에 둔다 — 같은 시각은 언제나 같은 화면이어야 한다.
- 시간표로 나눌 수 없는 연출(값으로 캡션을 고르는 것 등)은 코드에 두되 `NOTES.md`
  「어휘 부족」에 적는다.
- 크롬(그리드·카메라 버튼)은 원본에 없으면 켜지 않는다.
- 이번에 엔진에 새로 들어온 필드가 있으면 **원본이 그것을 쓰던 자리마다 실제로 선언한다.**
  엔진에 필드만 있고 조각이 쓰지 않으면 그 필드는 상상으로 만든 것이 된다 (원칙 4).
  {{newFields}}

## 원본과 대조 — 필수

원본의 `inventory.json` 의 `probeTimes` 시각마다 두 화면을 나란히 찍어 비교한다.

```sh
cd /Users/mintae/Documents/Develop/side-projects/aperi21
pnpm gen:capabilities                         # 네가 쓴 어휘가 번들에 실리도록
pnpm --filter @aperi21/sim-{{id}} typecheck
pnpm -s piece:report --sims={{simsBase}} {{id}}
```

결과는 `tasks/piece-lab/_report/_scratch/{{id}}/` 에 떨어진다. `shots/{{id}}@<t>.png`(원본)와
`shots/{{id}}@<t>.sims.png`(네 것)를 **직접 열어 보고** 같은 장면인지 확인한다. 기억에 의존해 옮기지 말고 원본의 상수·배치를
그대로 가져온다 — 앞선 이관에서 기억으로 옮기다 번짐 크기·간격·세기를 모두 틀렸다.

`_scratch/{{id}}/report.md` 에 `ⓘ 비교 한계` 가 뜨면 그 어휘는 시각 이동으로 전진하지 않는 것이라 차이가
장치 탓이다. 그 경우는 실시간으로 여는 화면으로 판단한다.

## 끝나기 전에

- `pnpm --filter @aperi21/sim-{{id}} typecheck` 통과
- 대조 스크린샷에서 주장이 같은 모양으로 일어난다
- `sims/{{category}}/{{id}}/NOTES.md` 에 (a) 원본과 달라진 점과 이유 (b) 「어휘 부족」
- **커밋하지 않는다**

마지막 보고에는 (1) 쓴 어휘 목록 (2) 원본과 달라진 점 (3) 어휘 부족 을 짧게 담는다.
