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
  });

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
      const state = bundle.initialState({ values, stage: schema.stages[0]!, environments: [] });
      // 초기 상태에서 돌려주는 선언만 본다. 상태에 따라 조건부로 돌려주는 선언은
      // 러너(ControllerSet.resolve)가 매번 검사한다.
      const ids = bundle.controllers({ state }).map((c) => c.id);
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
