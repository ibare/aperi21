import type { Plugin } from '@aperi21/schema';
import { renderOpticalElement, renderRay } from './renderers';
import { findImage, traceRay } from './trace';
import { reflect, refract } from './math';

export { traceRay, findImage, reflect, refract };
export { renderRay, renderOpticalElement };

/**
 * plugin-optics — 광학 도메인 플러그인.
 *
 * 제공:
 *  - Primitive renderer: ray, opticalElement
 *  - utilities.optics: { traceRay, findImage, reflect, refract }
 *  - zHints: ray=22, opticalElement=12 (기본 layer 와 동일)
 *
 * docs/07 §플러그인 인터페이스, docs/08 §Phase3 요구.
 */
export const opticsPlugin: Plugin = {
  id: 'plugin-optics',
  version: '1.0.0',
  label: { ko: '광학', en: 'Optics' },
  primitiveTypes: ['ray', 'opticalElement'],
  renderers: {
    ray: renderRay,
    opticalElement: renderOpticalElement,
  },
  zHints: {
    ray: 22,
    opticalElement: 12,
  },
  utilities: {
    traceRay,
    findImage,
    reflect,
    refract,
  },
  onRegister(host) {
    host.logger.info('[plugin-optics] registered — ray/opticalElement renderers + trace utilities.');
  },
};

export default opticsPlugin;
