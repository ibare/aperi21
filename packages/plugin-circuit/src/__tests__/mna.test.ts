/**
 * MNA 해석기 — 답을 아는 회로로 고정한다.
 *
 * 수치 코드라 틀려도 예외가 나지 않는다. 전류 화살표가 조금 짧거나 반대로 흐르는
 * 그림이 조용히 그려질 뿐이라, 옴 법칙으로 손계산이 되는 회로를 정답지로 둔다.
 *
 * 전류 부호 규약 — 모든 소자의 전류는 a → b 방향이다. 전지도 같아서, 전지 **안을**
 * a(+) → b(−) 로 지나는 전류를 센다. 회로에 전류를 내보내는 전지는 그래서 음수다.
 */
import { describe, expect, it } from 'vitest';
import { solveLinear, solveMna, type MnaElement } from '../index';

describe('solveLinear', () => {
  it('2×2 연립을 푼다', () => {
    // 2x + y = 5, x − y = 1 → x = 2, y = 1
    const x = solveLinear(
      [
        [2, 1],
        [1, -1],
      ],
      [5, 1],
    );
    expect(x![0]).toBeCloseTo(2, 12);
    expect(x![1]).toBeCloseTo(1, 12);
  });

  it('첫 피벗이 0 이어도 행을 바꿔 푼다', () => {
    const x = solveLinear(
      [
        [0, 1],
        [1, 0],
      ],
      [3, 4],
    );
    expect(x).toEqual([4, 3]);
  });

  it('특이행렬이면 null', () => {
    expect(
      solveLinear(
        [
          [1, 2],
          [2, 4],
        ],
        [1, 2],
      ),
    ).toBeNull();
  });

  it('입력을 바꾸지 않는다', () => {
    const A = [
      [2, 1],
      [1, -1],
    ];
    const b = [5, 1];
    solveLinear(A, b);
    expect(A).toEqual([
      [2, 1],
      [1, -1],
    ]);
    expect(b).toEqual([5, 1]);
  });
});

const battery = (v: number): MnaElement => ({ id: 'bat', kind: 'voltageSource', a: 'p', b: 'gnd', value: v });
const ground: MnaElement = { id: 'g', kind: 'ground', a: 'gnd' };

describe('solveMna', () => {
  it('저항 하나 — 옴 법칙', () => {
    const s = solveMna([ground, battery(6), { id: 'r', kind: 'resistor', a: 'p', b: 'gnd', value: 3 }])!;
    expect(s.nodeVoltages['p']).toBeCloseTo(6, 12);
    expect(s.nodeVoltages['gnd']).toBe(0);
    expect(s.branchCurrents['r']).toBeCloseTo(2, 12);
    // 회로로 2 A 를 내보내므로 전지 안의 a→b 전류는 −2 A.
    expect(s.branchCurrents['bat']).toBeCloseTo(-2, 12);
  });

  it('직렬 — 저항이 더해지고, 전압이 저항 비로 나뉜다', () => {
    const s = solveMna([
      ground,
      battery(12),
      { id: 'r1', kind: 'resistor', a: 'p', b: 'm', value: 1 },
      { id: 'r2', kind: 'resistor', a: 'm', b: 'gnd', value: 2 },
    ])!;
    expect(s.branchCurrents['r1']).toBeCloseTo(4, 12);
    expect(s.branchCurrents['r2']).toBeCloseTo(4, 12);
    expect(s.nodeVoltages['m']).toBeCloseTo(8, 12);
  });

  it('병렬 — 전류가 가지마다 나뉘고 합이 전지 전류다', () => {
    const s = solveMna([
      ground,
      battery(6),
      { id: 'r1', kind: 'resistor', a: 'p', b: 'gnd', value: 2 },
      { id: 'r2', kind: 'resistor', a: 'p', b: 'gnd', value: 3 },
    ])!;
    expect(s.branchCurrents['r1']).toBeCloseTo(3, 12);
    expect(s.branchCurrents['r2']).toBeCloseTo(2, 12);
    expect(s.branchCurrents['bat']).toBeCloseTo(-5, 12);
  });

  it('같은 저항 둘을 병렬로 두면 직렬일 때보다 전류가 네 배다', () => {
    const series = solveMna([
      ground,
      battery(6),
      { id: 'r1', kind: 'resistor', a: 'p', b: 'm', value: 2 },
      { id: 'r2', kind: 'resistor', a: 'm', b: 'gnd', value: 2 },
    ])!;
    const parallel = solveMna([
      ground,
      battery(6),
      { id: 'r1', kind: 'resistor', a: 'p', b: 'gnd', value: 2 },
      { id: 'r2', kind: 'resistor', a: 'p', b: 'gnd', value: 2 },
    ])!;
    expect(parallel.branchCurrents['bat']! / series.branchCurrents['bat']!).toBeCloseTo(4, 12);
  });

  it('닫힌 스위치는 도선이고 열린 스위치는 회로에서 빠진다', () => {
    const circuit = (state: 'open' | 'closed'): MnaElement[] => [
      ground,
      battery(6),
      { id: 'r1', kind: 'resistor', a: 'p', b: 'gnd', value: 3 },
      { id: 'sw', kind: 'switch', a: 'p', b: 'q', state },
      { id: 'r2', kind: 'resistor', a: 'q', b: 'gnd', value: 6 },
    ];
    const closed = solveMna(circuit('closed'))!;
    expect(closed.branchCurrents['sw']).toBeCloseTo(1, 12);
    expect(closed.branchCurrents['bat']).toBeCloseTo(-3, 12);

    const open = solveMna(circuit('open'))!;
    expect(open.branchCurrents['sw']).toBe(0);
    expect(open.branchCurrents['r2']).toBeCloseTo(0, 12);
    expect(open.branchCurrents['bat']).toBeCloseTo(-2, 12);
  });

  it('전류원 — 저항에 I·R 의 전압을 세운다', () => {
    const s = solveMna([
      ground,
      { id: 'i', kind: 'currentSource', a: 'gnd', b: 'p', value: 2 },
      { id: 'r', kind: 'resistor', a: 'p', b: 'gnd', value: 5 },
    ])!;
    expect(s.nodeVoltages['p']).toBeCloseTo(10, 12);
    expect(s.branchCurrents['i']).toBe(2);
    expect(s.branchCurrents['r']).toBeCloseTo(2, 12);
  });

  it('ground 가 없으면 첫 소자의 a 단자를 기준으로 삼는다', () => {
    const s = solveMna([
      { id: 'bat', kind: 'voltageSource', a: 'p', b: 'n', value: 6 },
      { id: 'r', kind: 'resistor', a: 'p', b: 'n', value: 2 },
    ])!;
    expect(s.nodeVoltages['p']).toBe(0);
    expect(s.nodeVoltages['n']).toBeCloseTo(-6, 12);
    expect(s.branchCurrents['r']).toBeCloseTo(3, 12);
  });

  it('0 Ω 저항은 단락이라 풀지 않는다 — 닫힌 스위치로 넣어야 한다', () => {
    expect(solveMna([ground, battery(6), { id: 'r', kind: 'resistor', a: 'p', b: 'gnd', value: 0 }])).toBeNull();
  });

  it('전지를 도선으로 직접 이으면 모순이라 null', () => {
    expect(
      solveMna([ground, battery(6), { id: 'sw', kind: 'switch', a: 'p', b: 'gnd', state: 'closed' }]),
    ).toBeNull();
  });

  it('소자가 없으면 빈 해', () => {
    expect(solveMna([ground])).toEqual({ nodeVoltages: { gnd: 0 }, branchCurrents: {} });
  });
});
