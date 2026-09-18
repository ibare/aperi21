// 자동 생성 파일 — 직접 편집하지 말 것.
//
// 생성: pnpm gen:capabilities  (scripts/gen-capabilities.mts)
// 출처: @aperi21/sim-viscosity 의 선언에 나타난 primitive type · controller type
//
// 여기 없는 능력은 이 조각의 번들에 실리지 않는다 (R10).

import type { HostCapabilities } from '@aperi21/host';
import { renderLineSet, renderParticleSystem, renderReadout, renderRegion, renderVector } from '@aperi21/host';

export const capabilities: HostCapabilities = {
  renderers: {
    lineSet: renderLineSet,
    particleSystem: renderParticleSystem,
    readout: renderReadout,
    region: renderRegion,
    vector: renderVector,
  },
};
