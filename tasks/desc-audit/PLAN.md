# 조각 설명 전수 대조 — 계획

작성 2026-09-25. **컨텍스트 압축 뒤에는 이 파일과 `seed-findings.yaml` 만 읽고 이어 간다.**

## 왜 하는가

조각의 한 줄 설명(`docs/topics/topics.yaml` 의 `desc` — 조각 `description` 의 원본, `description:gen`)
444개를 글만 읽고 11건을 문제로 골랐다. 구현과 맞대 보니 판정이 절반쯤만 그대로였다 —
틀려 보인 것이 명시된 모형 안에서는 맞았고(2), 글은 맞는데 조각이 틀린 것도 나왔다(1).
그래서 **desc ↔ 캡션 ↔ 물리 코드**를 조각마다 맞대는 전수 대조를 한다. 결과를 보고 변경 작업을
이어 가므로, 결과지는 고칠 곳이 한눈에 정해지게 만든다.

## 이 단계에서 하지 않는 것

- 코드 · `topics.yaml` · 조각을 **고치지 않는다.** 결과지 두 파일만 만든다.
- 판정은 제안이다. 채택은 사용자가 한다.

## 분류 — 다섯 가지 (고칠 곳이 분류마다 하나)

| 분류 | 뜻 | 고칠 곳 |
|---|---|---|
| **A** | desc 가 틀렸다 — 물리로도, 화면(캡션 · NOTES 주장)에 비춰도. 구현은 맞다 | `topics.yaml` desc → `description:gen` |
| **B** | desc 가 틀리진 않았지만 화면의 핵심을 빠뜨렸거나 오독될 수 있다 | `topics.yaml` desc (선택) |
| **D** | 조각 자체(주장 · 캡션 · `physics.ts`)가 물리적으로 틀렸다 | 조각 — 별도 작업 |
| **E** | 이름 · 제목만 화면과 어긋난다 | `topics.yaml` name · 조각 `label.title` |
| **X** | 판정 불가 · 확신 낮음 — 사람이 본다 | — |

이상 없는 조각은 결과지에 싣지 않고 수만 센다.

## 판정 기준 (본보기 11건에서 나온 것)

1. **명시된 모형 안에서 판정한다.** 조각이 좁은 모형(균일 밀도, 계기압 …)을 코드 · NOTES · 스테이지
   이름에 **명시**했으면, 그 모형 안에서 맞는 desc 는 OK 다 (`gravity-inside-earth` · `hydrostatic-pressure`).
   명시가 없는데 좁은 모형을 쓰면 B.
2. **desc 는 화면이 말하는 것과 맞아야 한다.** 캡션과 모순되면 A (`elastic-collision` · `boundary-layer`).
   화면의 핵심 주장의 절반만 말하면 A (`concave-mirror`), 핵심을 빠뜨렸을 뿐이면 B (`reactance`).
3. **언어별로 본다.** ko 와 en 이 다르면 틀린 쪽만 적는다 (`wien-displacement-law` 는 ko 만).
4. **desc 가 화면과 맞아도 화면이 틀리면 D** (`ionizing-radiation`). 캡션 · 주장 · 물리 코드를 물리로 판정한다.
5. **이름만 어긋나면 E** (`star-radiation-gravity-balance`). desc 와 구현이 맞으면 A · D 로 올리지 않는다.
6. 물리 판단은 **교과서 수준의 명백한 것만** A · D 로 적는다. 해석이 갈리거나 근거가 약하면 X.

## 조각 하나에서 볼 것

1. desc(ko · en) — `docs/topics/topics.yaml` 그 주제의 `desc`
2. 조각의 주장 — `sims/<category>/<id>/NOTES.md` 의 「(a) 답하는 질문과 동사」
3. 화면이 말하는 것 — `src/schema.ts` 의 `caption.*` · `label.*` (en 기준, ko 대조)
4. 물리 — `src/physics.ts` 의 핵심 식 (캡션이 말하는 것을 식이 실제로 하는가)
5. 이름 · 제목 — `topics.yaml` name · `label.title`

## 결과지

### `tasks/desc-audit/findings.yaml` — 후속 작업의 입력

```yaml
- id: elastic-collision        # 주제 id (= 조각 id)
  class: A                     # A | B | D | E | X
  problem: 한 문장
  evidence: 파일:줄 (여럿이면 · 로)
  fix_at: 고칠 곳 (위 분류표의 것)
  suggest: 제안 문구 (ko). A · B · E 만
  langs: [ko]                  # 문제가 특정 언어에만 있으면. 없으면 생략 = 전 언어
  confidence: high             # high 만 A · B · D · E 에 둔다. low 는 X 로
```

### `tasks/desc-audit/RESULT.md` — 사람이 보는 한 장

- 첫 줄: `대조 444 · 이상 없음 N · A n · B n · D n · E n · X n`
- 분류마다 표 하나, 한 조각 한 줄: `| 조각 | 문제 | 고칠 곳 |`
- 끝에 「다음 작업」 — A·B 는 desc 일괄 수정 한 커밋, E 는 name·title, D 는 조각별 작업 목록

## 묶음 — 20개 (분과 순서대로 30 이하로 자름)

| 묶음 | 수 | 범위 (topics.yaml 순서) |
|---|---|---|
| kinematics-1 | 27 | reference-frame … stopping-distance |
| newtonian-mechanics-1 | 16 | newtons-first-law … spring-force |
| newtonian-mechanics-2 | 16 | centripetal-force … stress-strain-curve |
| fluids-1 | 28 | projectile-in-wind … drag-in-fluid |
| energy-momentum-1 | 24 | work-by-variable-force … energy-flow-diagram |
| rotation-oscillation-1 | 29 | torque … gears |
| gravitation-1 | 23 | newtons-law-of-gravitation … diurnal-motion |
| gravitation-2 | 22 | earth-rotation-day-night … exoplanet-detection |
| thermodynamics-1 | 20 | thermal-equilibrium … first-law-of-thermodynamics |
| thermodynamics-2 | 19 | pv-diagram … greenhouse-effect |
| waves-acoustics-1 | 16 | wave-basics … doppler-effect |
| waves-acoustics-2 | 15 | doppler-source-vs-observer … seismic-waves |
| optics-1 | 23 | rectilinear-propagation … lens-combination |
| optics-2 | 23 | spherical-aberration … light-through-materials |
| electromagnetism-1 | 26 | electric-charge … emf-and-internal-resistance |
| electromagnetism-2 | 26 | kirchhoffs-current-law … energy-in-inductor |
| electromagnetism-3 | 25 | rl-circuit … loudspeaker-and-microphone |
| modern-physics-1 | 22 | michelson-morley … pair-production |
| modern-physics-2 | 22 | de-broglie-wavelength … nuclear-structure |
| modern-physics-3 | 22 | binding-energy-curve … exchange-particles |

묶음 목록은 `topics.yaml` 에서 분과별로 나눠 `ceil(수/30)` 등분한 것이다 (다시 뽑으면 같다).

## 진행 순서

1. **시험** — `modern-physics-1` 하나를 돌린다. 본보기 `wien-displacement-law` 가 들어 있어 판정이
   seed 와 같은지로 지시문을 보정한다. 한 묶음의 비용을 사용자에게 알린다.
2. **본 실행** — 나머지 19 묶음을 5 · 5 · 5 · 4 로 동시에 돌린다. 서브에이전트(general-purpose,
   읽기 전용)가 결과를 **스크래치패드의 `desc-audit/<묶음>.yaml`** 에 쓰고, 메인에는 분류별 건수만 돌려준다.
3. **검수 (메인)** — A · D 는 근거 줄을 직접 다시 열어 확인하고, 확인되지 않으면 X 로 내린다.
   seed 11건은 seed 판정을 쓴다. 중복을 합친다.
4. **결과지** — `findings.yaml` · `RESULT.md` 를 쓰고, 이 계획 · seed 와 함께 한 커밋.
5. **보고** — `RESULT.md` 요약을 사용자에게. 변경 작업은 사용자 결정 뒤에.

## 서브에이전트 지시문 (초안)

```
aperi21 조각 설명 대조 — 묶음 <이름>. 읽기 전용: 어떤 파일도 고치지 않는다(결과 파일 하나만 쓴다).

먼저 읽을 것: tasks/desc-audit/PLAN.md 의 「분류」「판정 기준」「조각 하나에서 볼 것」,
tasks/desc-audit/seed-findings.yaml (판정 본보기 11건).

대상 주제 id: <목록>. 각 주제마다 topics.yaml desc(ko·en) · NOTES (a) · schema.ts 의 caption.*/label.* ·
physics.ts 핵심 식 · name/label.title 을 맞대 A·B·D·E·X 로 판정한다. 이상 없으면 적지 않는다.
물리 판단은 교과서 수준의 명백한 것만 A·D. 애매하면 X. evidence 는 반드시 파일:줄.

결과: <스크래치패드>/desc-audit/<이름>.yaml 에 PLAN.md 의 findings 양식으로 쓴다.
돌려줄 것: 「대조 n · 이상 없음 n · A n · B n · D n · E n · X n」 한 줄과 파일 경로만.
```

## 진행 기록

- [ ] 시험 묶음 (modern-physics-1)
- [ ] 본 실행 1파 · 2파 · 3파 · 4파
- [ ] 검수
- [ ] 결과지 · 커밋
- [ ] 보고
