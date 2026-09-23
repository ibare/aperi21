# 개념 메타를 여러 개 만들 때 — 작업 절차

`packages/authoring/src/concepts/<id>.ts` 를 여러 개 만들 때의 방식이다. 규칙이 아니라
작업 방식이라 `rules/` 에 두지 않는다. 스키마 자체의 규범은
`packages/authoring/src/concept-types.ts` 의 주석에 있다.

## 왜 묶어서 쓰는가 — 개별로 쓰면 검색이 갈리지 않는다

호스트는 `definition` 과 `exemplarKeywords` 를 임베딩해 "이 글에 어떤 개념이 맞는가" 를
가린다. 우리 주제 목록에는 **같은 현상을 다른 각도로 보는 이웃이 흔하다** —
`free-fall` 과 `gravitational-acceleration`, `average-velocity` 와 `uniform-motion`,
`position-time-graph` 와 `velocity-time-graph`.

개별로 쓰면 그 갈림이 사라진다. 조각 하나만 보고 definition 을 쓰면 둘 다 "a body
falling under gravity" 로 수렴하고, 벡터 공간에서 두 점이 붙어 검색은 어느 쪽인지 답할
수 없다. `useWhen` 이 그 자리를 맡도록 설계되어 있지만, **후보 목록에 둘 다 오른 뒤에야**
일한다.

그래서 **이웃한 주제를 한 묶음으로 묶어 에이전트 하나가 통째로 쓴다.** 같은 에이전트가
형제를 한자리에서 보아야 "이쪽은 무게의 견줌, 저쪽은 속도의 변화" 가 문장으로 갈린다.

## 묶는 법

FACET 은 완제품 ↔ 조각의 `origin` 으로 묶었다. 우리는 그 관계가 없다 — 주제와 조각이
1:1 이다. 대신 **분과 안의 인접 주제**로 묶는다.

1. `docs/topics/topics.yaml` 의 **분과 안 등장 순서**가 이미 인접성이다. 목록을 세울 때
   비슷한 것끼리 붙여 두었다.
2. 한 묶음은 **8~12 개**. 그보다 크면 한 에이전트가 형제를 한자리에서 보기 어렵다.
3. 자르는 자리는 **가장 덜 닮은 선**이다. 운동학이라면 그래프 셋(위치·속도·가속도
   시간 그래프)을 가르지 않고, 벡터 둘(분해·덧셈)을 가르지 않는다.
4. 분과가 크면(전자기 77 · 현대물리 66) 여러 묶음이 된다. 묶음 경계를 넘는 형제가
   생기면 `contrastWith` 로 잇되, **이미 선언된 묶음**만 가리킨다(아래).

## 에이전트에게 주는 것

- 묶음의 주제 목록 — id · `sim` 등록 키 · `desc` · `visualNote`
- 각 조각의 `sims/<category>/<name>/` 에서 **`NOTES.md` · `src/schema.ts` ·
  `src/controllers.ts`**. 필요하면 `src/scene.ts`
- `concept-types.ts` (스키마 규범)
- 작성례 — `concepts/free-fall.ts` 와 `concepts/gravitational-acceleration.ts`.
  **둘이 어떻게 갈렸는지**가 작성례의 요지다
- 이미 선언된 이웃 개념 id 목록 (`contrastWith` 후보)

**묶음 안에서 definition 이 서로 갈리게 쓰라고 지시에 명시한다.** 이것이 묶는 이유이므로
빠지면 묶은 값이 없다.

## 지켜야 하는 것

- **`id` 는 주제 id 그대로**, `canonicalSim` 은 그 주제의 `sim` 값 그대로다.
  `topics.yaml` 이 원본이고 여기서 새로 짓지 않는다 (C4).
- **`screen.labels` 를 쓰지 않는다.** `pnpm screen:gen` 산출물에서 조회 시점에 붙는다.
  화면 문자는 선언이 원본이라 손으로 옮겨 적으면 어긋난다.
- **`aspects` 를 쓰지 않는다.** 호스트 어댑터가 2단 노출 배선을 아직 갖고 있지 않다.
- **부정형은 `avoidWhen` 에만.** 화면에 없는 것을 `observable` 이나 `affordances` 에
  "없다" 고 적지 않는다. 조작기가 없는 조각이면 **저절로 일어나는 것**을 적는다.
- **`contrastWith[].note` 는 개념 층위로 쓴다.** 상대 조각의 화면을 서술하지 않는다 —
  그 화면이 바뀌면 함께 틀리고, writer 가 독자에게 보이지도 않는 화면을 언급하게 된다.
  두 개념 사이의 **주장 차이**를 쓴다.
- **`contrastWith` 는 같은 묶음이거나 이미 선언된 개념만 가리킨다.** 미선언 참조는
  `validateConcepts` 가 로드 시점에 throw 하므로 배치가 통째로 멎는다.
- **영어 단일.** 번역하지 않는다. 언어가 남는 곳은 `screen.labels` 하나이고 그것은 생성물이다.
- 개념 파일 하나에 `Aperi21ConceptSource` export 하나. 목록(`concepts/index.ts`)은
  **손대지 않는다** — `pnpm concept:index` 가 파일을 훑어 다시 쓴다. 여러 에이전트가
  동시에 목록을 고치면 그 자리가 충돌 지점이 된다.

## 간극을 장부에 남긴다

개념을 쓰다 보면 **주제 설명이 화면보다 넓은 자리**를 반드시 만난다 — 「기울기가 가속도,
넓이가 변위」라고 적힌 주제인데 화면은 넓이만 말하는 식이다. `definition` 은 화면이 하는
주장으로 써야 하므로 그때 좁히게 되는데, **그 사실을 적지 않으면 개념 파일 안에 묻힌다.**

묶음마다 `tasks/topic-gaps/entries/<분과>-<n>.md` 에 행으로 적는다. 서식·바·갈래는
`tasks/topic-gaps/README.md`. 간극이 없으면 파일을 만들지 않는다.

이 장부는 개념 배치가 끝난 뒤 **보충 작업의 목록**이 된다. 한 건씩 사람이 방향을 잡는다.

## 한 묶음을 마치고

```sh
pnpm concept:index      # 선언 목록 재생성
pnpm gap:ledger         # 간극 장부 모으기
pnpm concept:audit      # definition 닮음 · useWhen 되풀이 · 내부 어휘 · 빈 필드
pnpm -r typecheck
pnpm test
```

`concept:audit` 이 내는 것은 **후보이지 판정이 아니다.** 읽고 사람이 정한다.

## 전부 마치고

전수를 덮는지 보는 검사는 **붙었다** — `packages/authoring/test/coverage.test.ts` 가
`concepts` ↔ `SIM_DOMAINS` 를 맞댄다. `concept:audit` 은 선언된 것끼리만 보므로 빠진
조각을 알려 주지 않는다. 조각을 더하면 이 검사가 멈춘다.

묶음 경계를 넘는 형제는 대비를 잇지 못한 채 남는다 (`contrastWith` 가 이미 선언된 것만
가리키므로). 전부 마친 뒤 **대비를 잇는 한 바퀴**를 따로 돈다.

## 확인 지점

한 묶음(첫 배치)을 마치면 **멈추고 보고한다.** 나머지를 돌리기 전에 작성례가 실제로
잣대 구실을 하는지, 묶음 크기가 맞는지 사람이 판정한다.
