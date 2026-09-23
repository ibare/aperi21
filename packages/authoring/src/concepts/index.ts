/**
 * 개념 선언 목록 — 자동 생성. 직접 편집하지 말 것.
 *
 * 생성: pnpm concept:index  (scripts/gen-concept-index.mts)
 * 출처: concepts/<id>.ts 의 Aperi21ConceptSource export.
 *
 * 선언 순서(파일 이름순)가 공개 조회의 순서다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';
import { accelerationTimeGraphConcept } from './acceleration-time-graph.js';
import { averageAccelerationConcept } from './average-acceleration.js';
import { averageVelocityConcept } from './average-velocity.js';
import { coordinateChoiceConcept } from './coordinate-choice.js';
import { directionOfAccelerationConcept } from './direction-of-acceleration.js';
import { freeFallConcept } from './free-fall.js';
import { gravitationalAccelerationConcept } from './gravitational-acceleration.js';
import { positionTimeGraphConcept } from './position-time-graph.js';
import { referenceFrameConcept } from './reference-frame.js';
import { uniformMotionConcept } from './uniform-motion.js';
import { uniformlyAcceleratedMotionConcept } from './uniformly-accelerated-motion.js';
import { velocityTimeGraphConcept } from './velocity-time-graph.js';

export const CONCEPT_SOURCES: readonly Aperi21ConceptSource[] = [
  accelerationTimeGraphConcept,
  averageAccelerationConcept,
  averageVelocityConcept,
  coordinateChoiceConcept,
  directionOfAccelerationConcept,
  freeFallConcept,
  gravitationalAccelerationConcept,
  positionTimeGraphConcept,
  referenceFrameConcept,
  uniformMotionConcept,
  uniformlyAcceleratedMotionConcept,
  velocityTimeGraphConcept,
];
