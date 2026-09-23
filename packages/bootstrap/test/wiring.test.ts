/**
 * 배선 정합 — 등록 키가 부르는 것이 그 키의 조각인가.
 *
 * 다른 검사들은 **키에서 기대값을 끌어온다.** 카탈로그는 키로 디렉터리를 찾아 제목을
 * 가져오고, 선언 검사는 실린 번들 자신의 내부 정합만 본다. 그래서 키와 그 키가 실제로
 * 불러오는 것이 어긋나면 어디에도 걸리지 않았다 —
 *
 *   registerBundleLoader('aperi21:free-fall', () => import('@aperi21/sim-vertical-throw'))
 *
 * 이 배선은 지금까지의 모든 검사를 통과한다. 목록에는 「자유 낙하」가 뜨고 화면에는 다른
 * 조각이 나온다. 그 자리를 이 검사가 막는다.
 *
 * 등록부가 생성물이 된 뒤로는 이런 어긋남이 생길 자리가 없지만, 검사는 남긴다 — 생성기가
 * 바뀌거나 누가 손으로 등록을 더할 때 다시 열리는 문이다.
 */

import { describe, it, expect } from 'vitest';
import { listBundleLoaderIds, loadBundle } from '@aperi21/host';
import { registerAperi21Bundles } from '../src/index.js';
import { BUNDLE_COUNT } from '../src/bundles.generated.js';

registerAperi21Bundles();

describe('배선 정합', () => {
  it('등록 키가 그 키로 실리는 조각의 선언 id 와 문자 그대로 같다 (C4)', async () => {
    const mismatched: string[] = [];
    for (const id of listBundleLoaderIds()) {
      const bundle = await loadBundle(id);
      if (!bundle) {
        mismatched.push(`${id}: 로드 실패`);
        continue;
      }
      const expected = id.replace(/^aperi21:/, '');
      if (bundle.schema.id !== expected) {
        mismatched.push(`${id} → 선언 id '${bundle.schema.id}'`);
      }
    }
    expect(mismatched).toEqual([]);
  }, 60_000);

  it('등록 수가 생성물이 센 조각 수와 같다 (등록을 손으로 더하면 여기서 걸린다)', () => {
    expect(listBundleLoaderIds().length).toBe(BUNDLE_COUNT);
  });

  it('부팅 함수는 멱등이다 — 두 번 불러도 등록이 늘지 않는다', () => {
    const before = listBundleLoaderIds().length;
    registerAperi21Bundles();
    expect(listBundleLoaderIds().length).toBe(before);
  });
});
