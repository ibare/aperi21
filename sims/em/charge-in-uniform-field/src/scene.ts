// ========================================================================
// charge-in-uniform-field — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 판(body rect) · 부호와
// 질량 기호(readout) · 곧은 점선 길과 포물선 · 내려온 거리(trajectory) · 눈금과
// 자국(trace) · 전하(body) · 받는 힘(vector)이 모두 표준 어휘다.
//
// 색은 뜻마다 하나다 — 판 · 부호 · 전하 · 자국은 먹, 곧은 점선 길과 그 위 눈금은 muted,
// 포물선과 힘은 secondary. **강조색은 「장이 없었다면 갔을 자리에서 내려온 거리」 한
// 가지 뜻에만** 쓴다. 두 전하를 색으로 가르지 않는다 — 가르는 것은 끝의 질량 기호다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  chargeOpacity,
  flightClock,
  forceArrow,
  inField,
  pathSoFar,
  positionAt,
  readConstants,
  recordShown,
  strobeTimes,
  type Which,
} from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { ChargeInUniformFieldState } from './state';

/** 곧은 점선 길의 굵기(화면 px) — 안내선이라 가늘다. */
const GUIDE_WIDTH = 1.2;
/** 곧은 점선 길 위 같은 걸음 눈금의 길이(월드) · 굵기(화면 px). */
const TICK_SIZE = 0.24;
const TICK_WIDTH = 1.5;
/** 포물선 굵기(화면 px). */
const PATH_WIDTH = 1.5;
/** 내려온 거리 세로선 굵기(화면 px). 주장의 선이라 가장 굵다. */
const DROP_WIDTH = 3;
/** 자국(스트로보 점) 반지름(화면 px). */
const DOT_PX = 3.5;
/** 받는 힘 화살표의 굵기(화면 px) · 머리 크기(월드). */
const FORCE_WIDTH = 2.5;
const FORCE_HEAD = 0.16;
/** 판 부호 글자 크기(화면 px) · 판 왼쪽 끝에서 띄우는 거리(화면 px). */
const PLATE_SIGN_PX = 18;
const PLATE_SIGN_GAP = 14;
/** 질량 기호 글자 크기(화면 px) · 전하 오른쪽으로 띄우는 거리(화면 px). */
const MASS_LABEL_PX = 15;
const MASS_LABEL_GAP = 12;
/**
 * 무거운 전하가 들어오면 가벼운 전하의 기록(포물선 · 세로선 · 자국)을 이만큼으로 옅게 한다.
 * 겹친 세로선에서 무거운 쪽이 앞에 읽히게 하는 위계다 — 지우지 않는 것은 견줄 짝이라서다.
 */
const LIGHT_DIM_OPACITY = 0.4;

export function scene(params: {
  state: ChargeInUniformFieldState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const out: Primitive[] = [];
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const top = c.gap / 2;
  const clearFade = 1 - tl.at('clear');

  // 1. 두 판 — 먹색 얇은 막대. 위 +, 아래 −. 부호는 판 왼쪽 끝 밖에.
  ([['plate-top', top, 'mark.plus'], ['plate-bottom', -top, 'mark.minus']] as const).forEach(
    ([id, y, sign]) => {
      out.push({
        type: 'body',
        id,
        pos: [c.plateLength / 2, y],
        shape: 'rect',
        size: [c.plateLength, c.plateThickness],
        glow: false,
        outline: 'none',
        style: ink,
      });
      out.push({
        type: 'readout',
        id: `${id}-sign`,
        anchor: { world: [0, y], offset: [-PLATE_SIGN_GAP, 0] },
        text: text(sign),
        chip: false,
        font: 'text',
        weight: 'bold',
        fontSize: PLATE_SIGN_PX,
        align: 'center',
        style: ink,
      });
    },
  );

  // 2. 장이 없었다면 갔을 곧은 길 — 들어온 높이 그대로의 점선.
  out.push({
    type: 'trajectory',
    id: 'straight-path',
    points: [
      [-c.approachLength, c.entryY],
      [c.plateLength, c.entryY],
    ],
    width: GUIDE_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  const tauLight = flightClock('light', tl, c);
  // 곧은 길 위 같은 걸음 눈금 — 가벼운 전하의 자국과 같은 시각에 찍힌다. 두 전하의 속력이
  // 같아 무거운 전하의 자국도 같은 눈금 아래에 선다.
  const ticks = strobeTimes(tauLight, c).map((s) => ({ pos: [c.speed * s, c.entryY] as Vec2 }));
  if (ticks.length > 0) {
    out.push({
      type: 'trace',
      id: 'step-ticks',
      marks: ticks,
      shape: 'tick',
      size: TICK_SIZE,
      width: TICK_WIDTH,
      opacity: clearFade,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  const lightDim = 1 - (1 - LIGHT_DIM_OPACITY) * tl.at('heavyApproach');
  const which: readonly Which[] = ['light', 'heavy'];

  // 3. 기록 — 포물선, 내려온 거리, 자국. 가벼운 전하를 먼저 깔고 무거운 전하를 위에.
  which.forEach((w) => {
    if (!recordShown(w, tl)) return;
    const tau = w === 'light' ? tauLight : flightClock('heavy', tl, c);
    const shown = clearFade * (w === 'light' ? lightDim : 1);

    const path = pathSoFar(tau, w, c);
    if (path.length >= 2) {
      out.push({
        type: 'trajectory',
        id: `path-${w}`,
        points: path,
        width: PATH_WIDTH,
        opacity: shown,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
    }

    const strobes = strobeTimes(tau, c);
    strobes.forEach((s, k) => {
      if (k === 0) return; // 판 앞 x = 0 은 아직 내려오지 않았다.
      const p = positionAt(s, w, c);
      out.push({
        type: 'trajectory',
        id: `drop-${w}-${k}`,
        points: [[p[0], c.entryY], p],
        width: DROP_WIDTH,
        opacity: shown,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    });

    if (strobes.length > 0) {
      out.push({
        type: 'trace',
        id: `dots-${w}`,
        marks: strobes.map((s) => ({ pos: positionAt(s, w, c) })),
        shape: 'dot',
        size: DOT_PX,
        opacity: shown,
        style: ink,
      });
    }
  });

  // 4. 전하 — 먹색 원, 판 사이에서는 받는 힘, 오른쪽에 질량 기호. 기호는 전하가 사라진
  //    뒤에도 기록 끝에 남아 두 줄을 가른다.
  which.forEach((w) => {
    if (!recordShown(w, tl)) return;
    const tau = w === 'light' ? tauLight : flightClock('heavy', tl, c);
    const pos = positionAt(tau, w, c);
    const body = chargeOpacity(w, tl) * clearFade;
    const record = clearFade * (w === 'light' ? lightDim : 1);

    if (body > 0) {
      out.push({
        type: 'body',
        id: `charge-${w}`,
        pos,
        shape: 'circle',
        size: c.chargeRadius,
        glow: false,
        outline: 'background',
        opacity: body,
        style: ink,
      });
      if (inField(tau)) {
        out.push({
          type: 'vector',
          id: `force-${w}`,
          from: pos,
          delta: forceArrow(c),
          headSize: FORCE_HEAD,
          width: FORCE_WIDTH,
          label: text('mark.force'),
          labelSide: 'cw',
          opacity: body,
          style: { colorRole: 'secondary', emphasis: 'strong' },
        });
      }
    }

    out.push({
      type: 'readout',
      id: `mass-${w}`,
      anchor: { world: pos, offset: [MASS_LABEL_GAP, 0] },
      text: text(w === 'light' ? 'mark.mass' : 'mark.heavyMass'),
      ...(w === 'heavy' ? { vars: { ratio: String(c.heavyMassRatio) } } : {}),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: MASS_LABEL_PX,
      align: 'left',
      opacity: record,
      style: ink,
    });
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
