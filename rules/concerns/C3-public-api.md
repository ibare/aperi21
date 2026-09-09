---
name: C3 공개 API 경계
description: 패키지 간 import 는 해당 패키지의 지정된 진입점만 사용한다. 내부 구현 파일 직접 import 금지.
type: concern
version: 1
last_verified: 2026-09-09
---

# C3. 공개 API 경계

## When to Apply

- 다른 `@aperi21/*` 패키지의 심볼을 import 할 때
- 새 패키지를 만들거나 기존 패키지에 export 를 추가할 때

## MUST

- 다른 패키지 import 는 **`@aperi21/<pkg>` 루트 진입점**(package.json 의 `exports`)만
  사용한다. subpath 를 쓰려면 `exports` 에 먼저 선언한다.
- 패키지의 모든 public symbol 은 그 패키지 `src/index.ts` 에서 export 된다.
- 새 export 를 추가할 때 `src/index.ts` 를 **같은 커밋에서** 수정한다.

## MUST NOT

- `@aperi21/host/src/runtime/bundleRegistry` 처럼 **내부 구현 경로**로 import 하지 않는다.
- `../../../packages/host/src/...` 처럼 **상대 경로로 다른 패키지를 침범**하지 않는다.
- `package.json::exports` 에 없는 subpath 를 만들어 쓰지 않는다.

## 현재 상태

**위반 0건.** 실측 결과 `@aperi21/*` import 111건이 전부 패키지 루트 형태이고, 깊은
상대경로 침범도 없다 (`_analysis.md` G2). 이 규칙은 **고치기 위한 것이 아니라 잠그기
위한 것**이다.

| import 대상 | 건수 |
|---|---:|
| `@aperi21/schema` | 71 |
| `@aperi21/host` | 22 |
| 그 외 | 18 |

## Exception

- 테스트 파일은 편의상 다른 패키지의 심볼을 직접 import 할 수 있다 (devDependencies 선언 시).
- `apps/catalog` 은 호스트 앱이므로 모든 `@aperi21/*` 공개 API 를 자유롭게 쓴다.
  다만 카탈로그 등록은 직접 `register*` 대신 `@aperi21/bootstrap` 을 거친다.
