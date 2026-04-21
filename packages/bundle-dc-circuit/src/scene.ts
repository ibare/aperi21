import type { Primitive, SceneGraph, ViewDef, Marker } from '@aperi21/schema';
import type { DcCircuitState } from './state';

export function scene(params: { state: DcCircuitState; view: ViewDef }): SceneGraph {
  const { state, view } = params;
  const nodes: Primitive[] = [];

  // 회로 프리미티브
  for (const t of state.terminals) nodes.push(t);
  for (const w of state.wires) nodes.push(w);
  for (const el of state.elements) nodes.push(el);

  // meters 뷰: 저항별 전류/전력, 배터리 전류를 주석 마커로 표시.
  if (view.id === 'meters' && state.solution) {
    for (const el of state.elements) {
      if (!el.id) continue;
      if (el.subtype === 'resistor') {
        const i = state.solution.branchCurrents[el.id];
        if (typeof i === 'number') {
          const m: Marker = {
            id: `meter_${el.id}`,
            type: 'marker',
            pos: [el.pos[0], el.pos[1] + 1.8],
            kind: 'annotation',
            text: {
              ko: `I=${fmt(Math.abs(i))} A`,
              en: `I=${fmt(Math.abs(i))} A`,
            },
            style: { colorRole: 'accent', emphasis: 'strong' },
          };
          nodes.push(m);
        }
      }
      if (el.subtype === 'battery') {
        const i = state.solution.branchCurrents[el.id];
        if (typeof i === 'number') {
          const m: Marker = {
            id: `meter_${el.id}`,
            type: 'marker',
            pos: [el.pos[0], el.pos[1] + 1.8],
            kind: 'annotation',
            text: {
              ko: `I=${fmt(Math.abs(i))} A`,
              en: `I=${fmt(Math.abs(i))} A`,
            },
            style: { colorRole: 'primary', emphasis: 'strong' },
          };
          nodes.push(m);
        }
      }
    }
  }

  return nodes;
}

function fmt(v: number): string {
  if (!isFinite(v)) return '∞';
  if (Math.abs(v) >= 1) return v.toFixed(2);
  if (Math.abs(v) >= 0.001) return (v * 1000).toFixed(2) + 'e-3';
  return v.toExponential(2);
}
