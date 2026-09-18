# 조각 직접 구현 지시서 (템플릿)

> `{{…}}` 를 채워 구현 에이전트에게 준다. 이관 지시서(`PORT_BRIEF.md`)와 달리
> **자유 구현 원본이 없다.** 엔진 어휘 위에서 곧바로 짓고, 원본 대조 대신 네가 직접
> 라이트 · 다크 스크린샷을 열어 주장이 서는지 판정한다.

---

## 너의 일

주제 **{{name}}** (`{{id}}`) — {{desc}}. 주제 목록의 시각 메모: 「{{visualNote}}」.

이 주제의 **조각**을 엔진 위의 정식 sim `sims/{{category}}/{{id}}/` 로 만든다.
조각은 글 한 문단 옆에 놓여 **한 주장**을 하는 그림이다. 시각 메모는 출발점일 뿐이다 —
그림이 글보다 나은 자리를 네가 찾아 주장을 정한다.

sim 패키지는 **이미 만들어져 있다** (6파일 최소 스텁 · loader · 카탈로그 연결 완료).
너는 다음만 만들거나 고친다. **그 밖은 고치지 않는다** — 다른 에이전트가 동시에 다른
조각을 만들고 있어서, 공유 파일을 건드리면 충돌한다.

- `sims/{{category}}/{{id}}/src/*` · `sims/{{category}}/{{id}}/NOTES.md`
- `tasks/piece-lab/{{id}}/inventory.json` (새로 만든다. `index.html` 은 만들지 않는다)

금지 — 공유 파일을 바꾸는 명령:
- `pnpm catalog:gen` · `pnpm catalog:topics` (메인이 합친 뒤 한 번 만든다)
- `pnpm install` · `pnpm add` · package.json 수정 (의존을 추가해야 하면 멈추고 보고한다)
- 엔진(`packages/*`) 수정. 어휘가 모자라면 근사하고 기록한다
- **커밋하지 않는다**

**export 이름을 바꾸지 않는다.** `{{camel}}Schema` · `initialState` · `step` · `scene` ·
`controllers` · `{{camel}}Bundle` — loader 가 이 이름으로 찾는다.
`schema.ts` 의 `id` 와 `*_ID` 상수(`'{{id}}'`)도 바꾸지 않는다 — 등록 키 `aperi21:{{id}}` 와
문자 그대로 같아야 한다 (C4). tsc 는 이것을 잡지 못한다.

`pnpm gen:capabilities` 는 공유 생성물을 다시 쓴다. 다른 에이전트와 동시에 돌아 서로 덮어써도
괜찮다 — 메인이 합친 뒤 한 번 더 만든다. 생성물 diff 는 믿지 말고 네 sim 의 typecheck 와 스크린샷만 본다.

## 읽을 것

1. 규칙 — `rules/principles.md` 와 `rules/specifics/S-sim.md` · `S-piece.md` · `S-render.md`,
   `rules/concerns/C1-message-resources.md` · `C2-token-boundary.md`
2. 어휘 — `packages/schema/src/index.ts` 의 primitive 타입들과
   `packages/host/src/renderer/primitives/*.ts`. **선언과 렌더러 구현을 둘 다 읽는다** —
   선언만 있고 구현이 없는 필드가 있다. **읽기만 한다.**
3. 구조 참고 — 같은 방식으로 먼저 만든 조각 `sims/mechanics/kinetic-energy/` ·
   `sims/mechanics/ballistic-pendulum/` (src · NOTES.md), 그리고
   `tasks/piece-lab/kinetic-energy/inventory.json`
4. 부족 장부 — `tasks/engine-requirements/gap-ledger.md`. 모자란 것을 여기 id 에 대 본다
{{related}}

## 규칙

- **자유 렌더를 쓰지 않는다** (`Bundle.renderers` 금지). 어휘로 안 되는 것은 억지로 맞추지도
  직접 그리지도 말고, **가장 가까운 어휘로 근사한 뒤 무엇이 모자랐는지 `NOTES.md` 「어휘 부족」
  에 적는다.**
- S-sim 6파일. `scene.ts` 는 그리지 않고 선언한다. 캔버스 · 색 · 좌표 변환을 만지지 않는다.
- 화면 문자는 `schema.ts` 의 messages 에 둔다 (C1, ko · en). 색은 `colorRole` 로만 (C2).
- **연출 시간표는 `BundleSchema.timeline` 으로 선언한다.** scene · physics 는
  `params.timeline` 의 `at(id)` · `start(id)` · `span(from, to)` 등을 읽는다. 단계 경계를
  모듈 상수로 두고 `if (u < B1)` 로 가르지 않는다 (S-piece · 원칙 2) — 시험 1 에서 rule-guard 가
  바로 이것을 잡았다.
- 도착한 순간 이미 진행 중이다 — `timeline.startAt` / 프리롤.
- 캡션은 `BundleSchema.caption` 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다.
- 같은 시각은 언제나 같은 화면이어야 한다. 누적 적분이 필요한 것만 `step` 이 상태에 쌓는다.
- 크롬(그리드 · 카메라 단추)은 주장이 요구할 때만 켠다. 조작기는 독자가 직접 해 봐야 하는 것이
  있을 때만 필요한 만큼 둔다.
- 테마 둘(라이트 · 다크) 모두에서 주장이 서야 한다.

## inventory.json

```json
{
  "id": "{{id}}",
  "claim": "한 문장 주장",
  "verb": "그 문장의 동사 — 화면에서 실제로 일어나는 것",
  "probeTimes": [주장이 드러나는 시각 3~5개(초) — 카탈로그를 `?t=` 로 여는 값. timeScale 로 느리게 흘린 단계가 있으면 단계 시각과 어긋나므로 찍힌 장면을 보고 잡는다],
  "controls": ["조작기와 그것이 바꾸는 것 — 없으면 빈 배열"],
  "timeline": [{ "t": 0.4, "what": "그 시각 화면에 보여야 하는 것" }]
}
```

`timeline[].t` 는 `probeTimes` 와 같은 값들이다.

## 주장 판정 — 필수

```sh
cd /Users/mintae/Documents/Develop/side-projects/aperi21
pnpm gen:capabilities                         # 네가 쓴 어휘가 번들에 실리도록
pnpm --filter @aperi21/sim-{{id}} typecheck
pnpm -s piece:report --sims={{simsBase}} {{id}}
```

결과는 `tasks/piece-lab/_report/_scratch/{{id}}/` 에 떨어진다.
`shots/{{id}}@<t>.sims.png`(라이트)와 `shots/{{id}}@<t>.sims.dark.png`(다크)를 **직접 열어 보고**
`inventory.json` 의 `what` 이 그 화면에 실제로 있는지, 주장의 동사가 일어나는지 판정한다.
안 서면 고치고 다시 찍는다. 글자 겹침 · 화면 밖으로 나감 · 다크에서 뒤집힘을 특히 본다.

dev 서버는 사용자가 운영한다. 켜지 말고, 응답이 없으면 멈추고 보고한다.
같은 기계에 다른 앱의 dev 서버도 떠 있다 — 첫 촬영본이 aperi21 카탈로그 화면인지부터 본다.

## NOTES.md

`sims/mechanics/ballistic-pendulum/NOTES.md` 와 같은 네 절.

- (a) 답하는 질문과 동사 — 화면에서 어떻게 일어나는가
- (b) 화면 구성의 결정 — **두지 않은 것 포함**, 이유와 함께
- (c) 어휘 부족 — 장부 id 가 있으면 id 로, 없으면 「새 부족」 표에. 영향은 `주장`(근사하면 주장이
  약해지거나 틀린다) / `근사`(모양만 조금 다르다). 장부 문안이 그 모자람을 적고 있지 않으면 새 부족이다.
  조각의 물리 · 배치 계산은 부족이 아니다
- (d) 주장이 화면에서 서는가 — probeTimes 마다 라이트 · 다크를 보고 판정한 것

## Baden 보고

파일 읽기 · 수정 · 생성 · 검색 · 검증 **실행 전에** 보고한다. `action` 은 snake_case 동사로 시작한다
(`read_*` · `modify_*` · `create_*` · `search_*` · `verify_*`). 이유는 나중에 읽어도 맥락이 서게 쓴다.

```sh
curl -s -X POST http://localhost:3800/api/events \
  -H "Content-Type: application/json" \
  -d '{"projectName":"aperi21","action":"...","reason":"...","taskId":"{{taskId}}"}'
```

## 끝나기 전에

- `pnpm --filter @aperi21/sim-{{id}} typecheck` 통과
- 두 테마 스크린샷에서 주장이 선다
- 마지막 보고에 (1) 주장과 동사 (2) 쓴 어휘 (3) 어휘 부족 — 장부 id / 새 부족(영향 포함)
  (4) 두 테마 판정 을 짧게 담는다
