/**
 * 개념 선언 검증 — 불러오는 순간 멈춰야 하는 실수들.
 *
 * 선언 목록이 아직 비어 있어 모듈 로드만으로는 검증이 돌지 않는다. 검증 함수를
 * 직접 불러 잡아야 할 것을 잡는지 본다.
 */

import { describe, expect, it } from 'vitest';
import { getAperi21Concepts, validateConcepts, type Aperi21ConceptSource } from '../src/index.js';
import { SIM_DOMAINS } from '../src/sim-domains.generated.js';

const DOMAINS = { 'aperi21:a': 'optics', 'aperi21:b': 'optics' };

function concept(id: string, extra: Partial<Aperi21ConceptSource> = {}): Aperi21ConceptSource {
  return {
    id,
    label: id,
    canonicalSim: 'aperi21:a',
    surface: { definition: `definition of ${id}`, exemplarKeywords: [] },
    briefing: { observable: [], screen: { affordances: [] }, useWhen: [], avoidWhen: [], contrastWith: [] },
    ...extra,
  };
}

describe('validateConcepts', () => {
  it('분야를 붙이고 definitionHash 를 계산한다', () => {
    const [c] = validateConcepts([concept('x')], DOMAINS);
    expect(c!.domain).toBe('optics');
    expect(c!.definitionHash).toMatch(/^[0-9a-f]{8}$/);
  });

  it('id 중복을 거부한다', () => {
    expect(() => validateConcepts([concept('x'), concept('x')], DOMAINS)).toThrow(/중복/);
  });

  it('등록되지 않은 canonicalSim · aspect 를 거부한다', () => {
    expect(() => validateConcepts([concept('x', { canonicalSim: 'aperi21:z' })], DOMAINS)).toThrow();
    expect(() => validateConcepts([concept('x', { aspects: ['aperi21:z'] })], DOMAINS)).toThrow();
  });

  it('미선언 개념을 가리키는 contrastWith · specializes 를 거부한다', () => {
    const contrast = concept('x');
    contrast.briefing.contrastWith.push({ concept: 'nope', note: '' });
    expect(() => validateConcepts([contrast], DOMAINS)).toThrow(/미선언/);
    expect(() => validateConcepts([concept('x', { specializes: 'nope' })], DOMAINS)).toThrow(/미선언/);
  });
});

describe('생성된 분야 표', () => {
  it('모든 sim 이 분야를 가진다', () => {
    expect(Object.keys(SIM_DOMAINS).length).toBeGreaterThan(0);
    for (const [id, domain] of Object.entries(SIM_DOMAINS)) {
      expect(id.startsWith('aperi21:')).toBe(true);
      expect(domain).not.toBe('');
    }
  });

  it('공개 조회가 모듈 로드만으로 동작한다', () => {
    expect(Array.isArray(getAperi21Concepts('ko'))).toBe(true);
  });
});
