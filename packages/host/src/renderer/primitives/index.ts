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
