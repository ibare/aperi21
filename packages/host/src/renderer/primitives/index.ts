import type { PrimitiveRenderer } from '@aperi21/schema';
import { renderBody } from './body';
import { renderTrajectory } from './trajectory';
import { renderVector } from './vector';
import { renderSurface } from './surface';
import { renderMarker } from './marker';
import { renderGraph } from './graph';
import { renderEvent } from './event';
import { renderGauge } from './gauge';
import { renderRegion } from './region';
import { renderStream } from './stream';
import { renderReadout } from './readout';
import { renderScale } from './scale';
import { renderDimension } from './dimension';
import { renderVortexField } from './vortex-field';
import { renderFilament } from './filament';

export {
  renderBody,
  renderTrajectory,
  renderVector,
  renderSurface,
  renderMarker,
  renderGraph,
  renderEvent,
  renderGauge,
  renderRegion,
  renderStream,
  renderReadout,
  renderScale,
  renderDimension,
  renderVortexField,
  renderFilament,
};

/**
 * 코어 렌더러 맵 — 표준 어휘 13종.
 *
 * 앞의 여덟은 역학·발사체 수준의 최소 집합이고, 뒤의 다섯은 자유 렌더로 만든
 * 조각들이 손으로 그리던 것을 어휘로 올린 것이다
 * (`tasks/engine-requirements/REQUIREMENTS.md` §3).
 *
 * 어휘가 늘어도 조각은 자기가 선언한 것만 받는다 — 그것이 §2 의 트리셰이킹
 * 구조를 먼저 세운 이유다. 이 맵을 참조하는 것은 `standardCapabilities()` 뿐이고,
 * 조각은 생성기가 뽑은 목록으로 온다.
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
  region: renderRegion,
  stream: renderStream,
  readout: renderReadout,
  scale: renderScale,
  dimension: renderDimension,
  vortexField: renderVortexField,
  filament: renderFilament,
};
