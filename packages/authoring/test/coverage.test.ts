/**
 * 전수 커버 — 모든 sim 이 개념을 갖는가.
 *
 * `concept:audit` 은 **선언된 것끼리만** 본다. 조각이 늘었는데 개념이 그대로인 것은
 * 거기서 드러나지 않는다 — FACET 은 facet 이 74 → 179 로 늘었는데 개념이 74 그대로인
 * 것을 한동안 몰랐고, 호스트는 그 사이 「신규 0」 으로 판정했다.
 *
 * 이 검사가 그 자리를 지킨다. 조각을 더하면 여기서 멈춘다.
 */

import { describe, expect, it } from 'vitest';
import { getAperi21Concepts } from '../src/index.js';
import { SIM_DOMAINS } from '../src/sim-domains.generated.js';

const concepts = getAperi21Concepts();
const covered = new Set(concepts.map((c) => c.canonicalSim));

describe('개념이 sim 전수를 덮는다', () => {
  it('개념 없는 sim 이 없다 (있으면 그 조각의 개념을 쓴다)', () => {
    const missing = Object.keys(SIM_DOMAINS).filter((id) => !covered.has(id));
    expect(missing).toEqual([]);
  });

  it('한 sim 을 두 개념이 canonical 로 삼지 않는다', () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const c of concepts) {
      const prev = seen.get(c.canonicalSim);
      if (prev) clashes.push(`${c.canonicalSim}: ${prev} · ${c.id}`);
      else seen.set(c.canonicalSim, c.id);
    }
    expect(clashes).toEqual([]);
  });

  it('개념 수가 sim 수와 같다', () => {
    expect(concepts.length).toBe(Object.keys(SIM_DOMAINS).length);
  });
});
