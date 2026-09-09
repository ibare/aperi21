---
name: C4 참조 문자열 정합
description: aperi21:<id> 등록 키 · sim 선언 id · primitive type 문자열은 실제 등록명과 일치해야 하며, 같은 대상에 두 이름을 두지 않는다.
type: concern
version: 1
last_verified: 2026-09-09
---

# C4. 참조 문자열 정합

## When to Apply

- `packages/bootstrap/src/index.ts` 의 `registerBundleLoader` 키
- `sims/**/schema.ts` 의 `id`
- `sims/**/scene.ts` 의 primitive `type`
- `packages/plugin-*/src/index.ts` 의 `primitiveTypes`
- 문서·데모의 `{aperi21:<id>}` 토큰

## 왜

문자열 참조는 **tsc 가 볼 수 없다.** 등록 키와 선언 id 가 어긋나도 타입은 통과하고,
런타임에 "등록 안 됨" 만 뜬다. 지금은 sim 이 3개라 사람이 외우지만 늘어나면 못 외운다.

## MUST

- **등록 키 형식은 `aperi21:<kebab-case-id>` 한 벌이다.**
- **sim 의 선언 `id` 는 등록 키의 `<id>` 부분과 문자 그대로 같다.**
  같은 대상에 두 이름을 두지 않는다.
- `scene.ts` 가 쓰는 primitive `type` 은 표준 primitive이거나, 그 sim 이 의존하는
  plugin 의 `primitiveTypes` 에 선언된 것이어야 한다.
- 문서·데모에 쓰는 `{aperi21:<id>}` 토큰은 실제 등록 키와 일치한다.

## MUST NOT

- 같은 대상을 kebab 과 snake 두 벌로 부르지 않는다.
- 등록 키를 문자열 조합으로 만들지 않는다 (`'aperi21:' + name`). grep 으로 추적할 수
  없게 되고, 정합 검사가 불가능해진다.

## 현재 위반 — 두 id 공간이 겹친다 (미해소)

```
레지스트리 / DSL 키   :  'aperi21:projectile'  'aperi21:ray-tracing'  'aperi21:dc-circuit'   (kebab)
sim 디렉터리 leaf     :  projectile            ray-tracing            dc-circuit             (kebab)
sim schema.id         :  'projectile'          'ray_tracing'          'dc_circuit'           (snake)
카탈로그 콘텐츠 명세  :  id 163개 중 snake 53 · kebab 0                                      (snake)
```

**진단을 두 번 했고 두 번째가 맞다.** 처음에는 "흘러나온 명명 실수, 파일 2개 rename"
으로 봤으나, `schema.id` 는 **카탈로그 콘텐츠 명세(`docs/01-catalog.json`)의 id 공간에
속한다.** 그쪽은 163개가 전부 snake 다.

그리고 카탈로그 생성기(`scripts/gen-aperi21-catalog.mts`)는 `schema.id` 가 아니라
**디렉터리 leaf** 로 조인한다. 즉 등록 키와 선언이 런타임에서 어긋나 있지는 않다.
겹치는 것은 3개 엔티티뿐이다.

**그래서 해소는 rename 이 아니라 규약 결정이다.** 어느 쪽을 리포 전역 표준으로 삼을지
정한 뒤에야 움직일 수 있고, 그 결정의 사정거리는 163개 엔트리다. 섣불리 3개만 바꾸면
한 파일 안에 두 규약이 섞여 지금보다 나빠진다.

> FACET 도 같은 문제를 겪고 `d65016f`("facet id 명명 규칙 확립 및 개명 적용")로 정리했다.
> 규칙을 세우고 **전수 개명**한 것이지 일부만 고친 것이 아니다.

## PREFER

- 등록 키 ↔ 선언 id 정합을 **테스트로 고정한다.** 카탈로그 전수를 돌며 대조하는 테스트가
  `packages/bootstrap/test/catalog.test.ts` 에 붙기 적당하다.
