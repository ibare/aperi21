# 조각 보강 착수 목록

간극 100건을 한 건씩 판단한 결과 **보강 20건 · 보류 3건**이 남았다. 여기는 그 목록이다.

- **사실**은 `LEDGER.md` (자동 생성)
- **판단과 근거**는 `triage/*.md`
- **순서와 상태**는 이 파일. 손으로 고친다 — 생성물이 아니다

각 행의 「더할 것」은 판단에서 옮긴 요약이다. 왜 그렇게 보는지는 근거 칸이 가리키는
판단 파일에 한 줄씩 적혀 있다.

## 한 건을 처리하는 절차

1. 판단 파일에서 그 행의 근거와 「무엇을 더하면 서는가」를 읽는다
2. 조각의 `NOTES.md` 를 읽는다 — **뺀 이유가 적혀 있으면 그것을 뒤집는 일**이므로,
   뒤집는 근거를 NOTES 에 함께 적는다
3. 조각을 보강한다 (선언에 둘 것과 코드에 둘 것의 경계는 원칙 2)
4. **개념 메타를 다시 쓴다** — 화면이 하는 주장이 바뀌면 `packages/authoring/src/concepts/<id>.ts`
   의 `definition` · `observable` · `screen.affordances` 가 함께 바뀌어야 한다.
   `definition` 이 바뀌면 `definitionHash` 가 바뀌고 호스트가 그 개념만 다시 임베딩한다
5. `pnpm gen:check` → `pnpm -r typecheck` → `pnpm test`
6. 상태 칸을 `완료` 로 바꾸고 커밋한다

## 조각 이름이 주제 id 와 다른 셋

| 주제 | 조각 |
|---|---|
| `projectile-range` | `aperi21:projectile` |
| `pendulum-amplitude-dependence` | `aperi21:pendulum-isochronism` |
| `thin-lens` | `aperi21:ray-tracing` (T66 · T67 이 같은 조각이다) |

---

## 1층 — 화면이 스스로 하려던 말을 못 하고 있다

결함에 가깝다. 재료도 문안도 이미 있는데 켜지지 않거나 닿지 않는다.

| id | 주제 | 더할 것 | 근거 | 상태 |
|---|---|---|---|---|
| T29 | `normal-modes` | 아래 모드 줄 다섯을 고르는 조작 — 누르면 구슬이 그 모양 비율로 놓이고 사슬이 한 모양으로만 흔들린다. **선언에 든 `caption.modes1` 이 어느 상태에서도 켜지지 않는다** | [pieces-rotation-fluids](triage/pieces-rotation-fluids.md) | 대기 |
| T67 | `thin-lens` | 기본 「광선」 뷰에서도 세 줄기 교점에 상 표식 — 지금은 `view.id !== 'rays'` 에 묶여 답에 이름이 없다 | [pieces-thermal-waves-optics](triage/pieces-thermal-waves-optics.md) | 대기 |
| T66 | `thin-lens` | 광축 선과 양쪽 초점 점·`F` 이름표 — 셋째 줄기를 쏘는 데 이미 쓰는 `F1` 을 화면에 올리기만 하면 된다 | [pieces-thermal-waves-optics](triage/pieces-thermal-waves-optics.md) | 대기 |
| T28 | `pendulum-amplitude-dependence` | 시간표 단계 — 좁은 진폭에서 세로줄이 한 줄로 선 뒤 스스로 60° 로 넓어져 기우는 데까지. 지금은 20° 로 열려 자동 진행만 보면 **반대쪽 장면만 남는다** | [pieces-rotation-fluids](triage/pieces-rotation-fluids.md) | 대기 |

## 2층 — 그 화면이 저장소에서 유일해진다

| id | 주제 | 더할 것 | 근거 | 상태 |
|---|---|---|---|---|
| T82 | `faradays-law` | 코일을 지나는 자기력선 서너 가닥 — 자석이 다가오는 동안 늘고 멈추면 선다. **`magnetic-flux` 주제가 없어 자속이 변하는 화면이 사이트에 하나도 없다** | [waves-optics-em](triage/waves-optics-em.md) | 대기 |
| T98 | `binding-energy-curve` | 반경험 질량 공식의 항을 하나씩 얹기 — 부피 → 표면 → 쿨롱 → 비대칭. 네 항이 다 얹히는 순간 철 자리에 꼭짓점이 생긴다 (**그림이 식의 항과 직접 연동되는 식 조항의 예외**) | [em-modern](triage/em-modern.md) | 대기 |
| T99 | `pn-junction` | 작은 입력 전압 칸 — 사인 한 주기와 지금 시각 표지. 공핍층의 넓어짐·얇아짐이 파형의 어느 자리인지와 짝지어진다. **정류 파형을 가진 조각이 달리 없다** | [em-modern](triage/em-modern.md) | 대기 |
| T90 | `relativity-of-simultaneity` | 왼쪽으로 달리는 세 번째 판(β = −0.5) — 세 판의 도착 이름표가 「먼저·나중」 / 「동시·동시」 / 「나중·먼저」 로 나란히 남는다 | [em-modern](triage/em-modern.md) | 대기 |

## 3층 — 틀이 서 있고 한 자리가 비어 있다

새 장면을 만들지 않고 지금 화면에 한 겹을 더한다.

| id | 주제 | 더할 것 | 근거 | 상태 |
|---|---|---|---|---|
| T08 | `newtons-second-law` | 네 번째 레인 — 힘 2배 · 질량 2배. 눈금 간격이 1배 줄과 정확히 겹친다 (지금은 세 레인이 모두 같은 수레라 **질량 축이 통째로 비어 있다**) | [pieces-mechanics](triage/pieces-mechanics.md) | 대기 |
| T27 | `mass-spring-system` | 네 번째 레인 — 같은 m · 같은 A · **4k**. 주기가 절반이라 섬광이 두 배로 터진다 | [mechanics](triage/mechanics.md) | 대기 |
| T16 | `impulse-force-relation` | 벽 쪽 좁고 높은 넓이를 떼어 방석 쪽 언덕 아래로 포개는 한 장면 — 「넓이가 같다」는 숫자가 아니라 모양으로 판가름 난다 | [pieces-mechanics](triage/pieces-mechanics.md) | 대기 |
| T04 | `projectile-range` | 지난 발사의 궤적을 옅은 자국으로 남기고 착지 자리에 자국을 찍는다 — 45° 가 가장 멀고 30°·60° 가 겹치는 것이 함께 보인다 (사거리 숫자는 그대로 내지 않는다) | [pieces-mechanics](triage/pieces-mechanics.md) | 대기 |
| T55 | `diffusion` | 가름선에서 왼→오 · 오→왼 건넌 수를 걸음마다 세어 굵기 다른 화살표 둘을 마주 놓는다 — 고르게 된 뒤 둘이 같아진다 | [gravitation-fluids-thermal](triage/gravitation-fluids-thermal.md) | 대기 |
| T47 | `latent-heat` | 가열기에서 나오는 열 알갱이의 갈래 — 비스듬한 구간에서는 온도 막대 쪽으로, 평평한 구간에서는 상 쪽으로만 흘러든다 | [gravitation-fluids-thermal](triage/gravitation-fluids-thermal.md) | 대기 |
| T32 | `shell-theorem` | 껍질 밖 구간에 「중심에 점질량이 있었다면」 유령 화살표를 실제 당김 위에 겹친다 | [gravitation-fluids-thermal](triage/gravitation-fluids-thermal.md) | 대기 |
| T03 | `relative-velocity` | 한 귀퉁이에 v(배) · −v(관측자) · 합 세 화살표의 삼각형 — 슬라이더를 움직이면 삼각형이 변형된다 | [mechanics](triage/mechanics.md) | 대기 |
| T13 | `conical-pendulum` | 가운데 추 하나에만 장력 · 중력 두 화살표 (합이 수평 안쪽을 향하게) | [mechanics](triage/mechanics.md) | 대기 |
| T68 | `spherical-aberration` | 교차점 퍼짐 오른쪽에 축과 수직한 스크린 한 장 — 광점 원반이 조리개 단계에서 함께 작아진다 | [waves-optics-em](triage/waves-optics-em.md) | 대기 |
| T74 | `field-lines` | 두 전하 옆 가닥 수 이름표 한 쌍(24 · 12) — 화면은 이미 전하량 1당 12가닥을 지키고 있다 | [waves-optics-em](triage/waves-optics-em.md) | 대기 |
| T11 | `pulley-system` | 고정 도르래 단계에 「손은 아래로 / 짐은 위로」 화살표 한 쌍과 캡션 한 줄 — 새 장면 없이 이름표만 는다 | [mechanics](triage/mechanics.md) | 대기 |

---

## 보류 3건 — 작업이 아니라 결정이다

밀린 것이 아니다. 어디까지 다룰지를 정해야 손을 댈 수 있다.

| id | 주제 | 무엇을 정해야 하나 |
|---|---|---|
| T53 | `carnot-cycle` | 「최대」를 화면으로 세우려면 비가역 기관을 옆에 둬야 하는데 그 견줌이 `heat-engine` 과 겹친다. 반대로 desc 에서 「최대」를 빼면 주제의 알맹이가 사라진다 — **주제 범위의 결정** |
| T69 | `birefringence` | 광축을 그리면 e 줄기와 헷갈리고, desc 에서 빼면 복굴절의 원인이 사이트에서 사라진다 — **이득과 비용을 재는 결정** |
| T85 | `series-rlc-resonance` | 임피던스 삼각형은 기하가 곧 식이라 드물게 보는 것이 유리한데, 같은 배율에서 R 이 X 의 1/7~1/16 이라 읽히지 않는다 — **배율을 거짓 없이 나누는 방법이 서는지** |
