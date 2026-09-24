/**
 * 조각 문안의 locale 정합 — 조각이 **무엇이라 말하는지**를 보는 검사.
 *
 * 다른 검사들은 조각이 도는지를 본다. 번역이 빠지거나 값 자리가 사라지는 것은 타입도
 * 통과하고 그 언어로 띄워 본 사람만 안다 (FACET `test/facet-i18n.test.ts` 가 겪은 것).
 *
 * 언어 목록의 원본은 `messages/<locale>.json` 파일 목록이다 (`scripts/sim-schemas.mts`).
 */

import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { listBundleLoaderIds, loadBundle } from '@aperi21/host';
import { registerAperi21Bundles } from '../src/index.js';

registerAperi21Bundles();

const messagesDir = join(dirname(fileURLToPath(import.meta.url)), '../../../messages');
const LOCALES = readdirSync(messagesDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''));
/**
 * `SIM_ONLY=<조각 id,...>` 이면 그 조각만 본다. 번역 배치가 동시에 돌 때 형제 배치의
 * 반쯤 채운 조각 때문에 멎지 않게 한다 (FACET `FACET_ONLY` 와 같다).
 */
const only = (process.env['SIM_ONLY'] ?? '').split(',').map((s) => s.trim()).filter((s) => s !== '');
const simIds = (): string[] =>
  listBundleLoaderIds().filter((id) => only.length === 0 || only.includes(id.replace(/^aperi21:/, '')));

/** 이 둘은 조각을 만들 때부터 쓴 언어다. 나머지를 하나라도 가지면 번역에 들어선 조각이다. */
const BASE = new Set(['en', 'ko']);

type TextMap = Record<string, string>;

/**
 * 선언을 걸어 문안을 모은다. **이름이 아니라 모양으로 가른다** — `en` 문자열을 가진
 * 문자열 맵이면 문안이다. `messages` 표만 보면 표 밖 라벨(stages · views · 조작기
 * 선언 안)을 놓친다. FACET 이 `blocks` 안의 353 개를 그렇게 놓쳤다.
 */
function collectTexts(node: unknown, path: string, out: Map<string, TextMap>, seen: WeakSet<object>): void {
  if (typeof node !== 'object' || node === null || seen.has(node)) return;
  seen.add(node);
  const values = Object.values(node);
  if (
    !Array.isArray(node) &&
    typeof (node as TextMap)['en'] === 'string' &&
    values.every((v) => typeof v === 'string')
  ) {
    out.set(path, node as TextMap);
    return;
  }
  for (const [k, v] of Object.entries(node)) collectTexts(v, path === '' ? k : `${path}.${k}`, out, seen);
}

const placeholders = (s: string): string[] => [...new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!))];

describe('조각 문안', () => {
  it('언어 목록이 열이다 — en 을 포함한다', () => {
    expect(LOCALES).toContain('en');
    expect(LOCALES.length).toBe(10);
  });

  /*
   * 조각 단위로 본다. 번역은 조각씩 들어오므로, 들어온 조각은 빠짐없이 채워야 한다.
   * 한 조각 안에서 버튼만 번역되고 캡션이 영어로 뜨는 것을 막는다.
   */
  it('새 언어를 하나라도 가진 조각은 모든 문안이 열 언어를 채운다', async () => {
    const bad: string[] = [];
    let translated = 0;
    for (const id of simIds()) {
      const texts = new Map<string, TextMap>();
      collectTexts((await loadBundle(id))!.schema, '', texts, new WeakSet());
      const started = [...texts.values()].some((t) => Object.keys(t).some((l) => !BASE.has(l)));
      if (!started) continue;
      translated += 1;
      for (const [path, t] of texts) {
        const missing = LOCALES.filter((l) => typeof t[l] !== 'string' || t[l]!.trim() === '');
        if (missing.length) bad.push(`${id} ${path} [${missing.join(' ')}]`);
      }
    }
    expect(translated, '번역에 들어선 조각 수 — 0 이면 아래가 헛통과한다').toBeGreaterThan(0);
    expect(bad.slice(0, 20)).toEqual([]);
    // 첫 테스트라 등록된 번들 전부를 처음 import 하는 비용을 떠안는다 (declarations.test 와 같다).
  }, 120_000);

  /*
   * **en 이 쓰는 값을 번역이 빠뜨리는 것만 결함으로 본다.** 개수나 반대 방향은 보지
   * 않는다 — 같은 값을 두 번 쓰지 않거나, 넘겨받는 값을 더 쓰는 것은 자연스러운
   * 번역일 수 있다 (FACET `scc` · `open-addressing-probe`).
   *
   * 빠뜨린 자리를 en 에 없는 다른 자리로 **바꿔 쓴** 것도 결함이 아니다. 언어마다 수를
   * 다른 단위로 읽는다 — `hr-diagram` 의 ko 는 `{ageMyr}`(백만 년) 대신 조각이 따로
   * 넘기는 `{ageMan}`(만 년) · `{ageEok}`(억 년)을 쓴다.
   */
  it('en 이 쓰는 플레이스홀더를 번역이 빠뜨리지 않는다', async () => {
    const bad: string[] = [];
    for (const id of simIds()) {
      const texts = new Map<string, TextMap>();
      collectTexts((await loadBundle(id))!.schema, '', texts, new WeakSet());
      for (const [path, t] of texts) {
        const want = placeholders(t['en']!);
        if (want.length === 0) continue;
        for (const [locale, text] of Object.entries(t)) {
          if (locale === 'en') continue;
          const got = placeholders(text);
          const missing = want.filter((p) => !got.includes(p));
          const substituted = got.filter((p) => !want.includes(p));
          if (missing.length > substituted.length) bad.push(`${id} ${path} [${locale}] {${missing.join('} {')}} 빠짐`);
        }
      }
    }
    expect(bad.slice(0, 20)).toEqual([]);
  });
});
