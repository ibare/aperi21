import type { Dictionary } from './resolver';

/**
 * 프레임워크 공통 문구의 locale 번들 저장소 — 조회 3층 중 **2층** (C1).
 *
 * 1층(저작자 선언)과 3층(호출부 en 원본) 사이에 놓인다. 문안은 코드에 두지 않는다 —
 * 원본은 저장소 루트의 `messages/<locale>.json` 이고, `@aperi21/bootstrap` 의
 * `loadFrameworkMessages(locale)` 가 그 언어 하나만 불러와 여기 등록한다 (원칙 5).
 * en 은 등록하지 않아도 된다 — 호출부 리터럴이 그 역할을 한다.
 *
 * **모듈 레벨 상태다.** `@aperi21/host` 는 호스트가 단일 인스턴스로 설치하므로
 * (원칙 3) bootstrap 이 등록한 번들을 모든 Host 의 조회기가 함께 본다. 조회기는
 * 이 저장소를 **조회 시점에** 읽는다 — 번들이 Host 생성보다 늦게 도착해도 그 뒤에
 * 그려지는 문구는 그 언어로 나온다.
 *
 * 키 규약: `ui.<component>.<name>` (세그먼트는 lowerCamelCase).
 * 저작자는 `BundleSchema.messages` 에 같은 키를 써서 이것을 덮어쓸 수 있다.
 */
const registered: Dictionary = {};

/**
 * 한 locale 의 문구 번들을 등록한다. 같은 locale 로 여러 번 부르면 병합되며
 * 같은 키는 나중 값이 이긴다.
 */
export function registerMessages(locale: string, bundle: Record<string, string>): void {
  registered[locale] = { ...registered[locale], ...bundle };
}

/** 등록된 번들에서 한 키를 찾는다. 없으면 undefined. */
export function lookupRegisteredMessage(locale: string, key: string): string | undefined {
  return registered[locale]?.[key];
}

/** 등록된 번들이 있는 locale 목록. */
export function listMessageLocales(): string[] {
  return Object.keys(registered);
}

/** 테스트용 — 등록된 번들을 모두 비운다. */
export function clearMessages(): void {
  for (const locale of Object.keys(registered)) delete registered[locale];
}
