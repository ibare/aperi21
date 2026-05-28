import type { CircuitElement, Terminal, Vec2, Wire } from '@aperi21/schema';
import type { MnaElement } from '@aperi21/plugin-circuit';

/**
 * 토폴로지 빌드 결과.
 *  - primitives: 씬에 올릴 요소·와이어·단자
 *  - mna: solveMna 에 넘길 소자 목록
 *  - nodeOfRef: 'elementId.a' / 'elementId.b' / 'terminalId' → MNA 노드 id
 *  - bounds: 카메라 힌트용
 */
export interface TopologyBuild {
  elements: CircuitElement[];
  wires: Wire[];
  terminals: Terminal[];
  mna: MnaElement[];
  nodeOfRef: Record<string, string>;
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

export interface TopologyParams {
  topology: number;
  V: number;
  R1: number;
  R2: number;
}

/**
 * topology:
 *  1 = simple (BAT + R1)
 *  2 = series (BAT + R1 + R2)
 *  3 = parallel (BAT + R1 || R2)
 */
export function buildTopology(params: TopologyParams): TopologyBuild {
  switch (params.topology) {
    case 2:
      return buildSeries(params);
    case 3:
      return buildParallel(params);
    case 1:
    default:
      return buildSimple(params);
  }
}

function buildSimple(params: TopologyParams): TopologyBuild {
  const { V, R1 } = params;
  const battery: CircuitElement = {
    id: 'BAT',
    type: 'circuitElement',
    subtype: 'battery',
    pos: [-4, 0],
    rotation: 0,
    value: V,
    unit: 'V',
  };
  const r1: CircuitElement = {
    id: 'R1',
    type: 'circuitElement',
    subtype: 'resistor',
    pos: [4, 0],
    rotation: 0,
    value: R1,
    unit: 'Ω',
  };

  // wire1 (top): BAT.b(−5,0) → ... → R1.b(5,0) 위로 돌아감
  const wireTop: Wire = {
    id: 'w_top',
    type: 'wire',
    from: 'BAT.b',
    to: 'R1.b',
    path: [[-3, 0], [-3, 4], [5, 4], [5, 0]],
  };
  // wire2 (bottom): BAT.a(−5,0) → ... → R1.a(3,0) 아래로 돌아감
  const wireBottom: Wire = {
    id: 'w_bot',
    type: 'wire',
    from: 'BAT.a',
    to: 'R1.a',
    path: [[-5, 0], [-5, -4], [3, -4], [3, 0]],
  };

  // MNA nodes
  //   BAT.a (+) ↔ R1.a  →  n_bot
  //   BAT.b (−) ↔ R1.b  →  n_top
  const nodeOfRef: Record<string, string> = {
    'BAT.a': 'n_bot',
    'BAT.b': 'n_top',
    'R1.a': 'n_bot',
    'R1.b': 'n_top',
  };
  const mna: MnaElement[] = [
    { id: 'BAT', kind: 'voltageSource', a: 'n_bot', b: 'n_top', value: V },
    { id: 'R1', kind: 'resistor', a: 'n_bot', b: 'n_top', value: R1 },
    { id: 'GND', kind: 'ground', a: 'n_top' },
  ];
  return {
    elements: [battery, r1],
    wires: [wireTop, wireBottom],
    terminals: [],
    mna,
    nodeOfRef,
    bounds: { minX: -7, minY: -5, maxX: 7, maxY: 5 },
  };
}

function buildSeries(params: TopologyParams): TopologyBuild {
  const { V, R1, R2 } = params;
  const battery: CircuitElement = {
    id: 'BAT',
    type: 'circuitElement',
    subtype: 'battery',
    pos: [-6, 0],
    rotation: 0,
    value: V,
    unit: 'V',
  };
  const r1: CircuitElement = {
    id: 'R1',
    type: 'circuitElement',
    subtype: 'resistor',
    pos: [0, 0],
    rotation: 0,
    value: R1,
    unit: 'Ω',
  };
  const r2: CircuitElement = {
    id: 'R2',
    type: 'circuitElement',
    subtype: 'resistor',
    pos: [6, 0],
    rotation: 0,
    value: R2,
    unit: 'Ω',
  };

  // 직접 연결 (y=0 축): BAT.b(−5,0) ↔ R1.a(−1,0), R1.b(1,0) ↔ R2.a(5,0)
  const w1: Wire = {
    id: 'w1',
    type: 'wire',
    from: 'BAT.b',
    to: 'R1.a',
    path: [[-5, 0], [-1, 0]],
  };
  const w2: Wire = {
    id: 'w2',
    type: 'wire',
    from: 'R1.b',
    to: 'R2.a',
    path: [[1, 0], [5, 0]],
  };
  // 폐로: BAT.a(−7,0) ↔ R2.b(+7,0) 아래로 돌아감.
  const wBot: Wire = {
    id: 'w_bot',
    type: 'wire',
    from: 'BAT.a',
    to: 'R2.b',
    path: [[-7, 0], [-7, -4], [7, -4], [7, 0]],
  };

  const nodeOfRef: Record<string, string> = {
    'BAT.a': 'n0',
    'R2.b': 'n0',
    'BAT.b': 'n1',
    'R1.a': 'n1',
    'R1.b': 'n2',
    'R2.a': 'n2',
  };
  const mna: MnaElement[] = [
    { id: 'BAT', kind: 'voltageSource', a: 'n0', b: 'n1', value: V },
    { id: 'R1', kind: 'resistor', a: 'n1', b: 'n2', value: R1 },
    { id: 'R2', kind: 'resistor', a: 'n2', b: 'n0', value: R2 },
    { id: 'GND', kind: 'ground', a: 'n0' },
  ];
  return {
    elements: [battery, r1, r2],
    wires: [w1, w2, wBot],
    terminals: [],
    mna,
    nodeOfRef,
    bounds: { minX: -9, minY: -5, maxX: 9, maxY: 3 },
  };
}

function buildParallel(params: TopologyParams): TopologyBuild {
  const { V, R1, R2 } = params;
  const battery: CircuitElement = {
    id: 'BAT',
    type: 'circuitElement',
    subtype: 'battery',
    pos: [-6, 0],
    rotation: 0,
    value: V,
    unit: 'V',
  };
  const r1: CircuitElement = {
    id: 'R1',
    type: 'circuitElement',
    subtype: 'resistor',
    pos: [2, 3],
    rotation: 0,
    value: R1,
    unit: 'Ω',
  };
  const r2: CircuitElement = {
    id: 'R2',
    type: 'circuitElement',
    subtype: 'resistor',
    pos: [2, -3],
    rotation: 0,
    value: R2,
    unit: 'Ω',
  };
  // junction 두 개 — 시각용 점.
  const jLeft: Terminal = { id: 'JL', type: 'terminal', pos: [-3, 0], kind: 'junction' };
  const jRight: Terminal = { id: 'JR', type: 'terminal', pos: [5, 0], kind: 'junction' };

  const pt = (x: number, y: number): Vec2 => [x, y];

  // BAT.b (−5,0) → JL(−3,0)
  const wA: Wire = { id: 'wA', type: 'wire', from: 'BAT.b', to: 'JL', path: [pt(-5, 0), pt(-3, 0)] };
  // JL → R1.a (1,3)
  const wB: Wire = {
    id: 'wB',
    type: 'wire',
    from: 'JL',
    to: 'R1.a',
    path: [pt(-3, 0), pt(-3, 3), pt(1, 3)],
  };
  // JL → R2.a (1,−3)
  const wC: Wire = {
    id: 'wC',
    type: 'wire',
    from: 'JL',
    to: 'R2.a',
    path: [pt(-3, 0), pt(-3, -3), pt(1, -3)],
  };
  // R1.b (3,3) → JR (5,0)
  const wD: Wire = {
    id: 'wD',
    type: 'wire',
    from: 'R1.b',
    to: 'JR',
    path: [pt(3, 3), pt(5, 3), pt(5, 0)],
  };
  // R2.b (3,−3) → JR
  const wE: Wire = {
    id: 'wE',
    type: 'wire',
    from: 'R2.b',
    to: 'JR',
    path: [pt(3, -3), pt(5, -3), pt(5, 0)],
  };
  // JR → BAT.a (−7,0) 밑으로 돌아감
  const wF: Wire = {
    id: 'wF',
    type: 'wire',
    from: 'JR',
    to: 'BAT.a',
    path: [pt(5, 0), pt(5, -6), pt(-7, -6), pt(-7, 0)],
  };

  const nodeOfRef: Record<string, string> = {
    'BAT.a': 'nR',
    'JR': 'nR',
    'R1.b': 'nR',
    'R2.b': 'nR',
    'BAT.b': 'nL',
    'JL': 'nL',
    'R1.a': 'nL',
    'R2.a': 'nL',
  };
  const mna: MnaElement[] = [
    { id: 'BAT', kind: 'voltageSource', a: 'nR', b: 'nL', value: V },
    { id: 'R1', kind: 'resistor', a: 'nL', b: 'nR', value: R1 },
    { id: 'R2', kind: 'resistor', a: 'nL', b: 'nR', value: R2 },
    { id: 'GND', kind: 'ground', a: 'nR' },
  ];

  return {
    elements: [battery, r1, r2],
    wires: [wA, wB, wC, wD, wE, wF],
    terminals: [jLeft, jRight],
    mna,
    nodeOfRef,
    bounds: { minX: -9, minY: -7, maxX: 7, maxY: 5 },
  };
}
