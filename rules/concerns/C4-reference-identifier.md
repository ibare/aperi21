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

## 현재 위반 (AUDIT-v1 대상)

**명명이 이원화되어 있다.**

```
bootstrap 등록 키 :  'aperi21:projectile'   'aperi21:ray-tracing'   'aperi21:dc-circuit'
sim schema id     :  'projectile'  (일치)   'ray_tracing'  (불일치)  'dc_circuit'  (불일치)
```

FACET 도 같은 문제를 겪고 `d65016f`("facet id 명명 규칙 확립 및 개명 적용")로 정리했다.

## PREFER

- 등록 키 ↔ 선언 id 정합을 **테스트로 고정한다.** 카탈로그 전수를 돌며 대조하는 테스트가
  `packages/bootstrap/test/catalog.test.ts` 에 붙기 적당하다.
