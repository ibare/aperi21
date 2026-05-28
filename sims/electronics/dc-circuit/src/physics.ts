import type { Bounds, EnvironmentDef, StageDef } from '@aperi21/schema';
import { solveMna } from '@aperi21/plugin-circuit';
import { buildTopology } from './topology';
import type { DcCircuitState } from './state';

function topologyOf(stage: StageDef): number {
  const t = stage.constants.topology;
  return typeof t === 'number' ? t : 1;
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): DcCircuitState {
  const { values, stage } = params;
  const build = buildTopology({
    topology: topologyOf(stage),
    V: values.V ?? 9,
    R1: values.R1 ?? 100,
    R2: values.R2 ?? 200,
  });
  const solution = solveMna(build.mna);
  return {
    elements: build.elements,
    wires: build.wires,
    terminals: build.terminals,
    solution,
    nodeOfRef: build.nodeOfRef,
  };
}

export function step(params: { state: DcCircuitState }): DcCircuitState {
  // 시간 모델 static — 상태 전진 없음. 파라미터 변경 시 initialState 로 재빌드.
  return params.state;
}

export function boundsHint(state: DcCircuitState): Bounds {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const el of state.elements) {
    xs.push(el.pos[0] - 2, el.pos[0] + 2);
    ys.push(el.pos[1] - 2, el.pos[1] + 2);
  }
  for (const w of state.wires) {
    if (w.path) {
      for (const p of w.path) {
        xs.push(p[0]);
        ys.push(p[1]);
      }
    }
  }
  for (const t of state.terminals) {
    xs.push(t.pos[0]);
    ys.push(t.pos[1]);
  }
  if (xs.length === 0) return { minX: -10, minY: -6, maxX: 10, maxY: 6 };
  const pad = 2;
  return {
    minX: Math.min(...xs) - pad,
    minY: Math.min(...ys) - pad,
    maxX: Math.max(...xs) + pad,
    maxY: Math.max(...ys) + pad,
  };
}

export function derivedValues(state: DcCircuitState): Record<string, number> {
  const out: Record<string, number> = {};
  const sol = state.solution;
  if (!sol) return out;
  // I_total = BAT 의 지선 전류. 관행상 a→b 방향(+→−) = 외부회로로 흘러나가는 방향.
  //   solveMna 내부에선 voltageSource 확장 전류 j_BAT 가 KCL 에서 +j(node a), −j(node b) 로 들어감.
  //   즉 j_BAT = 노드 a 로부터 나가는 전류의 반대부호 → 외부로 흐르는 전류 = −j.
  //   편의상 크기만 노출.
  const iBat = sol.branchCurrents['BAT'];
  if (typeof iBat === 'number') out.I_total = Math.abs(iBat);
  // 각 저항 전류는 a→b 방향 값 그대로 (크기만 쓰고 싶으면 abs).
  for (const el of state.elements) {
    if (el.subtype === 'resistor' && el.id) {
      const i = sol.branchCurrents[el.id];
      if (typeof i === 'number') out[`I_${el.id}`] = Math.abs(i);
      if (el.value) out[`P_${el.id}`] = i != null ? i * i * el.value : 0;
    }
  }
  // 주요 노드 전압 — nodeOfRef 중복 제거하여 고유 노드만.
  const unique = new Set(Object.values(state.nodeOfRef));
  for (const n of unique) {
    const v = sol.nodeVoltages[n];
    if (typeof v === 'number') out[`V_${n}`] = v;
  }
  return out;
}
