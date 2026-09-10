/**
 * 조작기 이름표 — 선언의 `label` 이 이기고, 없으면 프레임워크 문구 키로 찾는다 (C1).
 */

import type { I18n, LocalizedText } from '@aperi21/schema';
import { interpolate } from '../renderer/kit/text';

export function controllerText(
  i18n: I18n,
  authored: LocalizedText | undefined,
  key: string,
  en: string,
  vars?: Record<string, string | number>,
): string {
  return authored ? interpolate(i18n.resolve(authored), vars) : i18n.t(key, en, vars);
}
