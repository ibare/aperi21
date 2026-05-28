import type { CircuitElement, Terminal, Wire } from '@aperi21/schema';
import type { MnaSolution } from '@aperi21/plugin-circuit';

/**
 * DC 회로 번들 상태.
 *
 * `elements`/`wires`/`terminals` 는 씬에 렌더될 프리미티브.
 * `solution` 은 MNA 로 계산된 노드 전압·지선 전류.
 * `nodeOfRef` 는 wire-연결된 단자들이 공유하는 MNA 노드 id 로 매핑되는 룩업:
 *   key: `'elementId.a'|'elementId.b'|'terminalId'` · value: MNA node id.
 */
export interface DcCircuitState {
  elements: CircuitElement[];
  wires: Wire[];
  terminals: Terminal[];
  solution: MnaSolution | null;
  nodeOfRef: Record<string, string>;
}
