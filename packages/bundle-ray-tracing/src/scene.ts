import type { Primitive, SceneGraph, ViewDef, Vec2, Body, Marker } from '@aperi21/schema';
import { traceRay } from '@aperi21/plugin-optics';
import type { RayTracingState } from './state';

export function scene(params: { state: RayTracingState; view: ViewDef }): SceneGraph {
  const { state, view } = params;
  const nodes: Primitive[] = [];

  // 요소
  nodes.push(state.element);

  // 광원을 작은 body 로 표현 (화살표 머리 위치)
  const source: Body = {
    id: 'source',
    type: 'body',
    shape: 'point',
    pos: state.sourcePos,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  nodes.push(source);

  // 광축 수직에 물체 화살표 (height)
  const element = state.element;
  const axis: Vec2 = [Math.cos(element.orientation), Math.sin(element.orientation)];
  const perp: Vec2 = [-axis[1], axis[0]];
  const base: Vec2 = [
    element.pos[0] +
      axis[0] * -Math.abs(state.sourcePos[0] - element.pos[0]),
    state.sourcePos[1] - perp[1] * (state.sourcePos[1] - element.pos[1]),
  ];
  void base;
  void perp;

  // 3 주요 광선을 traceRay 로 추적 — 요소와의 1회 상호작용까지.
  for (const ray of state.rays) {
    const result = traceRay(ray.origin, ray.direction, [element], { maxLength: 60, maxBounces: 2 });
    nodes.push({
      id: ray.id,
      type: 'ray',
      segments: result.segments,
      wavelength: ray.wavelength,
      showArrow: true,
    });
  }

  // image 마커
  if (state.image && view.id !== 'rays') {
    const m: Marker = {
      id: 'image',
      type: 'marker',
      pos: state.image.position,
      kind: 'pin',
      text: { ko: '이미지', en: 'image' },
      style: { colorRole: 'primary', emphasis: 'strong' },
    };
    nodes.push(m);
  }

  return nodes;
}
