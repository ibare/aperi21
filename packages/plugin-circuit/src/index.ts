import type { Plugin } from '@aperi21/schema';
import { renderCircuitElement, renderTerminal, renderWire } from './renderers';
import { manhattanRoute } from './routing';
import { solveMna, type MnaElement, type MnaSolution } from './mna';
import { solveLinear } from './linalg';

export { renderCircuitElement, renderWire, renderTerminal };
export { manhattanRoute, solveMna, solveLinear };
export type { MnaElement, MnaSolution };

/**
 * plugin-circuit — DC 회로 도메인 플러그인.
 *
 * 제공:
 *  - Primitive renderer: circuitElement, wire, terminal
 *  - utilities.circuit: { solveMna, manhattanRoute }
 *  - zHints: circuitElement=40, wire=11, terminal=41 (기본 layer 와 동일)
 *
 * docs/07 §플러그인 인터페이스, docs/08 §Phase4 (DC Circuit) 요구.
 */
export const circuitPlugin: Plugin = {
  id: 'plugin-circuit',
  version: '1.0.0',
  label: { ko: '회로', en: 'Circuit' },
  primitiveTypes: ['circuitElement', 'wire', 'terminal'],
  renderers: {
    circuitElement: renderCircuitElement,
    wire: renderWire,
    terminal: renderTerminal,
  },
  zHints: {
    circuitElement: 40,
    wire: 11,
    terminal: 41,
  },
  utilities: {
    solveMna,
    manhattanRoute,
  },
  onRegister(host) {
    host.logger.info(
      '[plugin-circuit] registered — circuitElement/wire/terminal renderers + MNA solver.',
    );
  },
};

export default circuitPlugin;
