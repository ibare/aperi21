// ========================================================================
// coulombs-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 전하(`body` + 부호 `readout`) ·
// 힘 화살표와 점선 기준(`vector`) · 등분 눈금(`lineSet`) · 거리(`dimension`)가 모두
// 표준 어휘로 있다.
//
// 색은 뜻마다 하나다. 전하 여섯은 모두 같은 색(같은 전하), **강조색은 「지금 힘」
// 한 가지 뜻에만** — 세 줄의 힘 화살표. 점선 기준 · 눈금 · 치수선은 배경 정보라 muted.
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
import { readConstants, readPair, sceneOpacity } from './physics';
import {
  CHARGE_RADIUS,
  LANE_Y,
  MEASURE_DROP,
  SCENE_BOUNDS,
  TICK_HALF,
  text,
} from './schema';
import type { CoulombsLawState } from './state';

/** 부호 표식 글자 크기(화면 px). 공 안에 들어가는 크기다. */
const SIGN_PX = 14;
/** 등분 눈금 굵기(화면 px)와 짙기. 재는 선이라 가늘고 옅다. */
const TICK_WIDTH_PX = 1;
const TICK_OPACITY = 0.8;
/** 점선 기준 화살표 굵기(화면 px)와 짙기. 지금 힘보다 한 단 물러나 있어야 한다. */
const REFERENCE_WIDTH_PX = 1.5;
const REFERENCE_OPACITY = 0.75;
/** 힘 표식 글자 크기(화면 px)와, 화살표 위로 띄우는 거리(화면 px). */
const LABEL_PX = 12;
const LABEL_RISE_PX = 13;

export function scene(params: {
  state: CoulombsLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('coulombs-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const op = sceneOpacity(timeline);
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const ball = { colorRole: 'muted', emphasis: 'subtle' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const out: Primitive[] = [];

  // 세 줄 — 멈출 거리의 배수와, 벌어지는 단계. 위 줄은 벌어지지 않는 기준이다.
  const lanes: readonly { ratio: number; phase?: string }[] = [
    { ratio: c.ratioNear },
    { ratio: c.ratioMid, phase: 'move-mid' },
    { ratio: c.ratioFar, phase: 'move-far' },
  ];

  lanes.forEach((lane, i) => {
    const y = LANE_Y[i] ?? 0;
    const p = readPair(timeline, lane.ratio, lane.phase, c);
    const arrowFrom: Vec2 = [p.distance + CHARGE_RADIUS, y];

    // ---- 거리 ----
    // 두 전하의 가운데를 잇는다. 표식은 멈춰 있을 때만 — 출발 전엔 `r`, 닿은 뒤엔
    // `2r` · `3r`. 움직이는 동안 표식이 붙어 있으면 화면과 어긋난다.
    out.push({
      type: 'dimension',
      id: `distance-${i}`,
      from: [0, y - MEASURE_DROP],
      to: [p.distance, y - MEASURE_DROP],
      ...(!p.started || p.arrived
        ? lane.ratio === 1 || !p.started
          ? { text: text('mark.distance') }
          : { text: text('mark.distanceTimes'), vars: { n: String(lane.ratio) } }
        : {}),
      opacity: op,
      style: muted,
    });

    // ---- 점선 기준과 등분 눈금 ----
    // 벌어지는 줄에만 깐다. 점선은 거리 r 일 때의 화살표 길이이고, 눈금은 그것을
    // (배수)² 칸으로 나눈다 — 줄어든 화살표가 **첫 칸에 꼭 맞게** 멈추는 것이 1/4 ·
    // 1/9 를 글자 없이 보이는 방법이다.
    if (lane.phase && p.started) {
      out.push({
        type: 'vector',
        id: `reference-${i}`,
        from: arrowFrom,
        delta: [p.reference, 0],
        width: REFERENCE_WIDTH_PX,
        opacity: op * REFERENCE_OPACITY,
        style: { ...muted, lineStyle: 'dashed' },
      });
      const parts = lane.ratio * lane.ratio;
      const ticks: Vec2[][] = [];
      for (let j = 1; j <= parts; j++) {
        const x = arrowFrom[0] + (p.reference * j) / parts;
        ticks.push([
          [x, y - TICK_HALF],
          [x, y + TICK_HALF],
        ]);
      }
      out.push({
        type: 'lineSet',
        id: `ticks-${i}`,
        lines: ticks,
        width: TICK_WIDTH_PX,
        opacity: op * TICK_OPACITY,
        style: muted,
      });
    }

    // ---- 지금 힘 ----
    // q₂ 가 받는 밀어냄. 길이가 힘에 비례한다 (배율은 스테이지 상수). 표식은 멈춰
    // 있을 때만 — 줄어드는 도중에 `F` 가 남아 있으면 화면과 어긋난다.
    out.push({
      type: 'vector',
      id: `force-${i}`,
      from: arrowFrom,
      delta: [p.arrow, 0],
      opacity: op,
      style: accent,
    });
    // 이름표는 `readout` 으로 단다 — `vector.label` 은 값을 끼울 수 없어(G17) `F/{n}` 의
    // 배수를 스테이지 상수에서 넣지 못한다. 화살표 가운데 위에 둔다.
    if (!p.started || p.arrived) {
      const over = lane.ratio !== 1 && p.started;
      out.push({
        type: 'readout',
        id: `force-label-${i}`,
        anchor: { world: [arrowFrom[0] + p.arrow / 2, y], offset: [0, -LABEL_RISE_PX] },
        text: text(over ? 'mark.forceOver' : 'mark.force'),
        ...(over ? { vars: { n: String(lane.ratio * lane.ratio) } } : {}),
        chip: false,
        font: 'mono',
        weight: 'bold',
        fontSize: LABEL_PX,
        align: 'center',
        opacity: op,
        style: accent,
      });
    }

    // ---- 전하 ----
    // 둘 다 같은 +전하. 첫 전하는 세 줄 모두 x = 0 에 고정.
    ([0, p.distance] as const).forEach((x, j) => {
      out.push({
        type: 'body',
        id: `charge-${i}-${j}`,
        pos: [x, y],
        shape: 'circle',
        size: CHARGE_RADIUS,
        glow: false,
        outline: 'line',
        opacity: op,
        style: ball,
      });
      out.push({
        type: 'readout',
        id: `sign-${i}-${j}`,
        anchor: { world: [x, y] },
        text: text('mark.plus'),
        chip: false,
        font: 'text',
        weight: 'bold',
        fontSize: SIGN_PX,
        align: 'center',
        opacity: op,
        style: ink,
      });
    });
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
