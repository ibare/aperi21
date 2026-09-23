/**
 * 개념 선언 목록 — 자동 생성. 직접 편집하지 말 것.
 *
 * 생성: pnpm concept:index  (scripts/gen-concept-index.mts)
 * 출처: concepts/<id>.ts 의 Aperi21ConceptSource export.
 *
 * 선언 순서(파일 이름순)가 공개 조회의 순서다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';
import { freeFallConcept } from './free-fall.js';
import { gravitationalAccelerationConcept } from './gravitational-acceleration.js';

export const CONCEPT_SOURCES: readonly Aperi21ConceptSource[] = [
  freeFallConcept,
  gravitationalAccelerationConcept,
];
