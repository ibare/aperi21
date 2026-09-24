---
name: C5 리소스 수명
description: RAF 루프·타이머·리스너·옵저버는 destroy 에서 전부 거둔다. 인스턴스 상태를 모듈 스코프에 두지 않는다.
type: concern
version: 1
last_verified: 2026-09-10
---

# C5. 리소스 수명

## When to Apply

- `packages/host/src/runtime/runBundle.ts` — RAF 루프를 도는 유일한 자리
- `packages/react/src/Embed.tsx` — 그 루프를 React 라이프사이클에 잇는 자리
- `addEventListener` · `ResizeObserver` · `setTimeout` / `setInterval` 을 쓰는 모든 자리
- 모듈 최상단에 가변 상태를 두려 할 때

## 왜

시각화는 남의 글 한복판에 박히고, 한 문서에 여러 개가 동시에 산다. 한쪽이 남긴
루프나 리스너가 다른 쪽 화면을 건드리면 원인을 찾기 어렵다. 이미 한 번 겪었다 —
`fae3f35`("카메라·시간 엔진을 임베드 인스턴스별로 분리").

## MUST

- **스스로 다음 회차를 예약하는 루프는 반드시 멈춘다.** RAF 루프는 핸들을 보관하고
  정리 시점에 `cancelAnimationFrame` 한다. `destroyed` 플래그 하나와 핸들 한 개면 된다.
- **등록한 리스너·옵저버는 같은 수만큼 해제한다.** `addEventListener` 가 늘면
  `removeEventListener` 도 같이 는다.
- **인스턴스 상태는 인스턴스가 갖는다.** 카메라 · 시간 엔진 · 뷰 상태를 모듈 스코프
  변수에 두지 않는다. 모듈 스코프에 두어도 되는 것은 **레지스트리뿐**이고, 그것은
  의도된 싱글턴이다 (원칙 3).
- **host 도 공유 스코프다.** host 하나를 문서 전체가 쓴다(카탈로그 앱 하나, 외부 호스트는
  에디터 하나). 조작기처럼 상태를 가진 능력은 host 에 **인스턴스로 두지 않고 만드는 법
  (팩토리)** 으로 두며, 인스턴스는 임베드마다 만든다 (`ControllerRegistry.createSet`).
  인스턴스를 두면 A 의 발사대를 당길 때 B 의 발사대도 당겨져 그려진다 — 타입도 통과하고
  예외도 나지 않는다.
- 오류는 **throw 로 표현한다.** `console.*` 는 호스트 경계(`host.ts` 의 logger)에서만 쓴다.

## MUST NOT

- `destroy()`/cleanup 이 관찰 가능한 뒷일을 남기지 않는다.
- **"정리할 것 없음" 이라 적어 놓고 타이머나 리스너가 있으면 안 된다.** 그 주석 한 줄이
  다음 사람의 점검을 막는다. 남기기로 했다면 무엇을 왜 남기는지 적는다.

## PREFER

- 임베드 인스턴스 독립을 **회귀 테스트로 고정한다.** 한 문서에 두 개를 마운트해 한쪽의
  카메라 조작이 다른 쪽에 새지 않는지 재는 테스트 (Phase 5 Track E).
