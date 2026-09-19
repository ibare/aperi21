/**
 * 프레임워크 공통 문구 번들 로더.
 *
 * `messages/<locale>.json` 은 host 조작기·어댑터가 그리는 기본 문구만 담는다 (C1 의
 * 2층). sim 이 그리는 문안은 `BundleSchema.messages` 에 있으므로 여기 없다.
 *
 * 등록처는 `@aperi21/host` 의 모듈 레벨 저장소다. host 는 호스트가 단일 인스턴스로
 * 설치하므로(원칙 3) 여기서 한 번 등록하면 모든 Host 의 조회기가 함께 본다.
 * 조회기가 조회 시점에 저장소를 읽으므로, 이 함수를 기다리지 않아도 번들이 도착한
 * 뒤에 그려지는 문구는 그 언어로 나온다. 첫 화면부터 맞추려면 기다린 뒤 마운트한다.
 *
 * 언어 → 모듈 표는 생성기가 `messages-loaders.generated.ts` 로 만든다. 경로를
 * 보간하면 rollup 이 해석하지 못해 구문을 원문 그대로 남기고, 발행본에는 루트
 * `messages/` 가 없으므로 소비자 환경에서 이 함수가 죽는다 (FACET `c726076`).
 */

import { registerMessages } from '@aperi21/host';
import { MESSAGE_LOADERS } from './messages-loaders.generated.js';

/**
 * 프레임워크 문구 번들을 등록한다.
 *
 * 등록할 것이 없으면 (en 이거나 미지원 locale) 조용히 지나간다 — 번들이 없어도
 * 화면은 호출부의 en 원본으로 온전히 동작하므로 오류가 아니다.
 */
export async function loadFrameworkMessages(locale: string | undefined): Promise<void> {
  if (!locale || locale === 'en') return;
  const load = MESSAGE_LOADERS[locale];
  if (!load) return;
  const mod = await load();
  registerMessages(locale, mod.default);
}
