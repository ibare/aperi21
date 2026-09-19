/**
 * 선언 참조 정합 — 등록된 모든 조각의 선언이 가리키는 것이 실제로 있는가.
 *
 * 시간표·캡션 슬롯의 문안 키는 문자열이라 타입이 못 잡는다. 틀리면 캡션이 빈 채로
 * 그려지거나 첫 프레임에 던진다. 조각이 수백 개가 되면 눈으로 확인할 수 없다.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { evaluateTimeline, listBundleLoaderIds, loadBundle } from '@aperi21/host';
import { registerAperi21Bundles } from '../src/index.js';

registerAperi21Bundles();

const CAPABILITIES_DIR = fileURLToPath(new URL('../src/capabilities', import.meta.url));

/** 조각 id 의 능력 생성물 본문. 카테고리 폴더 아래 `<id>.generated.ts`. */
function generatedFor(simId: string): string | undefined {
  for (const category of readdirSync(CAPABILITIES_DIR, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const dir = join(CAPABILITIES_DIR, category.name);
    const file = readdirSync(dir).find((f) => f === `${simId}.generated.ts`);
    if (file) return readFileSync(join(dir, file), 'utf8');
  }
  return undefined;
}

describe('선언 참조 정합', () => {
  it('시간표와 캡션 슬롯이 부르는 문안 키가 messages 에 있다', async () => {
    for (const id of listBundleLoaderIds()) {
      const bundle = await loadBundle(id);
      expect(bundle, id).not.toBeNull();
      const { timeline, caption, messages = {} } = bundle!.schema;
      const keys = [...(timeline?.phases.map((p) => p.caption) ?? []), caption?.text];
      for (const key of keys) {
        if (key) expect(messages[key], `${id}: ${key}`).toBeDefined();
      }
    }
    // 이 파일의 첫 테스트라 등록된 번들 전부를 처음 import 하는 비용을 떠안는다 — 조각 수에 비례해
    // 기본 5 초를 넘는다(441 조각에서 약 5.1 초). 뒤 테스트는 같은 번들을 캐시에서 읽는다.
  }, 30_000);

  it('캡션 슬롯을 선언한 조각의 번들에 readout 이 실린다 — 빠지면 캡션이 조용히 사라진다', async () => {
    for (const id of listBundleLoaderIds()) {
      const schema = (await loadBundle(id))?.schema;
      if (!schema?.caption) continue;
      expect(generatedFor(schema.id), `${id}: 능력 생성물`).toContain('renderReadout');
    }
  });

  it('조작기 선언의 id 가 조각 안에서 겹치지 않는다 — 선언 하나가 인스턴스 하나다 (원칙 7)', async () => {
    for (const id of listBundleLoaderIds()) {
      const bundle = (await loadBundle(id))!;
      const { schema } = bundle;
      const values = Object.fromEntries(schema.parameters.map((p) => [p.id, p.default]));
      bundle.initialState({ values, stage: schema.stages[0]!, environments: [] });
      // 선언은 데이터라 상태와 무관하게 전부 보인다 (원칙 7 ④). 지금 화면에
      // 뜨는지는 `visibleWhen` 이 정하고 러너가 매 프레임 검사한다.
      const ids = bundle.controllers.map((c) => c.id);
      expect(new Set(ids).size, id).toBe(ids.length);
    }
  });

  it('시간표가 풀린다 — 단계 id 가 겹치지 않고 길이가 양수다', async () => {
    for (const id of listBundleLoaderIds()) {
      const bundle = await loadBundle(id);
      const timeline = bundle?.schema.timeline;
      if (timeline) expect(() => evaluateTimeline(timeline, 0), id).not.toThrow();
    }
  });
});
