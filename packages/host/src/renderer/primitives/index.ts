import type { PrimitiveRenderer } from '@aperi21/schema';
import { renderBody } from './body';
import { renderTrajectory } from './trajectory';
import { renderVector } from './vector';
import { renderSurface } from './surface';
import { renderMarker } from './marker';
import { renderGraph } from './graph';
import { renderEvent } from './event';
import { renderGauge } from './gauge';

export { renderBody, renderTrajectory, renderVector, renderSurface, renderMarker, renderGraph, renderEvent, renderGauge };

/**
 * Phase 2 코어 렌더러 맵. Phase 2 는 역학/발사체 수준이라 8종이 최소 집합이다.
 * Phase 3+ 에서 Constraint, Axis, VectorField, ScalarField, FieldLine, Wave,
 * ParticleSystem, Emitter 가 순차 추가된다.
 */
export const CORE_RENDERERS: Record<string, PrimitiveRenderer> = {
  body: renderBody,
  trajectory: renderTrajectory,
  vector: renderVector,
  surface: renderSurface,
  marker: renderMarker,
  graph: renderGraph,
  event: renderEvent,
  gauge: renderGauge,
};
