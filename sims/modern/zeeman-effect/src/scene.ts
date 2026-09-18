// ========================================================================
// zeeman-effect — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 준위(lineSet) · 빛의 낙차(lineSet 빛 채널) ·
// 분광기 창(region 빛 없음 + trajectory 테) · 창 속 선(lineSet 빛 채널) · 자기장 눈금자(scale linear) ·
// 이름표(readout) 가 모두 표준 어휘로 있다.
//
// 색 — 준위 · 테 · 글자는 무채색 역할(muted), 강조색은 쓰지 않는다. **빛만 빛의 색이다** — 낙차 셋과
// 창 속 선 셋은 643.8 nm 의 색을 빛 채널로 칠한다(같은 빛 = 같은 색). 세 줄을 색으로 가르지 않는다 —
// 실제로도 파장 차가 0.04 nm 에 못 미쳐 색이 같고, 가르는 것은 자리다 (S-piece).
// 분광기 창 바탕은 「빛 없음」(`light: 0`)이라 두 테마에서 똑같이 어둡고, 선이 그 위에서 빛난다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  Readout,
  Region,
  Scale,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { dropX, fieldAt, mlStates, lineLight, lineX, readConstants, sublevelY, windowWorldPerNm } from './physics';
import { FIELD_SCALE, LEVELS, SCENE_BOUNDS, WINDOW, text, type ZeemanEffectMessageKey } from './schema';
import type { ZeemanEffectState } from './state';

/** 준위선 굵기(화면 px). */
const LEVEL_WIDTH = 1.8;
/** 빛의 낙차 굵기(화면 px) — 빛의 색이 읽히도록 굵게. */
const DROP_WIDTH = 3.2;
/** 낙차 끝의 꺾쇠 — 반폭 · 높이(월드). 머리 있는 화살표 묶음이 없어 두 획으로 긋는다(장부 G57). */
const ARROW_HALF = 0.45;
const ARROW_LEN = 0.7;
/** 창 속 선의 굵기(화면 px) · 창 위아래 가장자리에서 띄우는 거리(월드). */
const LINE_WIDTH = 3.4;
const LINE_INSET = 0.5;
/** 창 테 굵기(화면 px). 다크 테마에서 「빛 없음」 바탕이 배경과 닮아 테가 창을 가른다. */
const FRAME_WIDTH = 1.2;
/** 앞 자리 눈금 — 창 위 가장자리에서 띄우는 거리 · 길이(월드), 굵기(화면 px), 짙기. */
const GHOST_GAP = 0.3;
const GHOST_LEN = 0.8;
const GHOST_WIDTH = 2;
const GHOST_OPACITY = 0.6;
/** 축척 막대 — 창 아래로 띄우는 거리 · 양 끝 세움 높이(월드), 굵기(화면 px). */
const BAR_GAP = 1;
const BAR_CAP = 0.3;
const BAR_WIDTH = 1.4;
/** 자기장 눈금자의 범위 여유 — 높은 정박값이 끝에 붙지 않게 이만큼 더 둔다. */
const FIELD_SCALE_HEADROOM = 1.2;
/** 글자 크기(화면 px). */
const LABEL_PX = 12;
const SMALL_PX = 11;
/** 이름표를 선 끝 · 눈금에서 띄우는 거리(화면 px). */
const LABEL_GAP = 6;
const TICK_LABEL_GAP = 20;
/** 자기장 기호 `B` 를 눈금자 왼쪽 끝에서 띄우는 거리(화면 px). */
const FIELD_NAME_GAP = 12;
/** 창 이름표를 창 위 가장자리에서 띄우는 거리(화면 px). */
const WINDOW_LABEL_GAP = 10;

function label(
  id: string,
  key: ZeemanEffectMessageKey,
  vars: Record<string, string>,
  pos: Vec2,
  align: Readout['align'],
  opts: { size?: number; offset?: Vec2; opacity?: number; italic?: boolean } = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor: opts.offset ? { world: pos, offset: opts.offset } : { world: pos },
    text: text(key),
    vars,
    chip: false,
    font: 'text',
    fontSize: opts.size ?? LABEL_PX,
    align,
    ...(opts.italic ? { italic: true } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** mₗ 을 이름표에 끼울 문자열 — 부호가 읽혀야 한다(+1 · 0 · −1). */
const mlText = (ml: number): string => (ml > 0 ? `+${ml}` : ml < 0 ? `−${-ml}` : '0');

export function scene(params: {
  state: ZeemanEffectState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('zeeman-effect: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const b = fieldAt(tl, c);
  const rgb = lineLight(c);
  const states = mlStates(c);
  /** 갈라진 동안 — mₗ 이름표가 보이는 정도. 벌어진 뒤(`labelIn`) 나타나 모이기 전(`labelOut`) 사라진다. */
  const split = tl.at('labelIn') * (1 - tl.at('labelOut'));
  /** 키운 동안 — 앞(낮은 자기장) 자리 눈금이 보이는 정도. */
  const stronger = tl.at('rampHigh') * (1 - tl.at('rampOff'));
  const out: Primitive[] = [];

  // ── 준위 그림 — 아래 준위 하나, 위 준위는 한 토막에서 셋으로 벌어진다 ──
  out.push({
    type: 'lineSet',
    id: 'levels',
    lines: [
      [
        [LEVELS.x0, LEVELS.yLower],
        [LEVELS.x1, LEVELS.yLower],
      ],
      [
        [LEVELS.x0, LEVELS.yUpper],
        [LEVELS.xStub, LEVELS.yUpper],
      ],
      ...states.map((ml): Vec2[] => {
        const y = sublevelY(ml, b, c);
        return [
          [LEVELS.xStub, LEVELS.yUpper],
          [LEVELS.xFan, y],
          [LEVELS.x1, y],
        ];
      }),
    ],
    width: LEVEL_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies LineSet);
  out.push(label('orbital-upper', 'label.orbital', { l: String(c.upperL) }, [LEVELS.x0, LEVELS.yUpper], 'right', { offset: [-LABEL_GAP, 0] }));
  out.push(label('orbital-lower', 'label.orbital', { l: String(c.lowerL) }, [LEVELS.x0, LEVELS.yLower], 'right', { offset: [-LABEL_GAP, 0] }));
  if (split > 0) {
    states.forEach((ml) => {
      out.push(
        label(`ml-${ml}`, 'label.ml', { m: mlText(ml) }, [LEVELS.x1, sublevelY(ml, b, c)], 'left', {
          size: SMALL_PX,
          offset: [LABEL_GAP, 0],
          opacity: split,
        }),
      );
    });
  }

  // ── 빛의 낙차 — 세 상태에서 아래 준위로. 길이가 곧 빛 한 알의 에너지 ──
  const drops: Vec2[][] = [];
  states.forEach((ml, i) => {
    const x = dropX(i, c);
    const yTop = sublevelY(ml, b, c);
    const yEnd = LEVELS.yLower;
    drops.push([
      [x, yTop],
      [x, yEnd],
    ]);
    drops.push([
      [x - ARROW_HALF, yEnd + ARROW_LEN],
      [x, yEnd],
      [x + ARROW_HALF, yEnd + ARROW_LEN],
    ]);
  });
  out.push({
    type: 'lineSet',
    id: 'drops',
    lines: drops,
    width: DROP_WIDTH,
    light: { rgb },
  } satisfies LineSet);

  // ── 분광기 창 — 빛 없는 바탕에 선이 빛난다 ─────────────
  const corners: Vec2[] = [
    [WINDOW.x0, WINDOW.y0],
    [WINDOW.x1, WINDOW.y0],
    [WINDOW.x1, WINDOW.y1],
    [WINDOW.x0, WINDOW.y1],
  ];
  out.push({
    type: 'region',
    id: 'window',
    points: corners,
    light: 0,
    fillOpacity: 1,
    opaque: true,
  } satisfies Region);
  out.push({
    type: 'lineSet',
    id: 'lines',
    lines: states.map((ml): Vec2[] => {
      const x = lineX(ml, b, c);
      return [
        [x, WINDOW.y0 + LINE_INSET],
        [x, WINDOW.y1 - LINE_INSET],
      ];
    }),
    width: LINE_WIDTH,
    light: { rgb },
  } satisfies LineSet);
  out.push({
    type: 'trajectory',
    id: 'window-frame',
    points: corners,
    closed: true,
    width: FRAME_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'solid' },
  } satisfies Trajectory);
  out.push(
    label('window-label', 'label.window', {}, [WINDOW.x0, WINDOW.y1], 'left', {
      size: SMALL_PX,
      offset: [0, -WINDOW_LABEL_GAP],
    }),
  );

  // ── 앞 자리 눈금 — 키운 동안, 낮은 자기장에서 선이 섰던 자리 ────
  if (stronger > 0) {
    out.push({
      type: 'lineSet',
      id: 'ghost-ticks',
      lines: states.map((ml): Vec2[] => {
        const x = lineX(ml, c.fieldLowT, c);
        return [
          [x, WINDOW.y1 + GHOST_GAP],
          [x, WINDOW.y1 + GHOST_GAP + GHOST_LEN],
        ];
      }),
      width: GHOST_WIDTH,
      opacity: GHOST_OPACITY * stronger,
      style: { colorRole: 'muted', emphasis: 'strong' },
    } satisfies LineSet);
  }

  // ── 창 아래 — 축척 막대와 파장 방향 ──────────────────
  const barY = WINDOW.y0 - BAR_GAP;
  const barX1 = WINDOW.x0 + c.scaleBarNm * windowWorldPerNm(c);
  out.push({
    type: 'lineSet',
    id: 'scale-bar',
    lines: [
      [
        [WINDOW.x0, barY],
        [barX1, barY],
      ],
      [
        [WINDOW.x0, barY - BAR_CAP],
        [WINDOW.x0, barY + BAR_CAP],
      ],
      [
        [barX1, barY - BAR_CAP],
        [barX1, barY + BAR_CAP],
      ],
    ],
    width: BAR_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies LineSet);
  out.push(
    label('scale-bar-label', 'label.nm', { w: String(c.scaleBarNm) }, [barX1, barY], 'left', {
      size: SMALL_PX,
      offset: [LABEL_GAP, 0],
    }),
  );
  out.push(label('wavelength', 'label.wavelength', {}, [WINDOW.x1, barY], 'right', { size: SMALL_PX }));

  // ── 자기장 눈금자 — 지침이 0 → 낮음 → 높음 → 0 으로 옮긴다 ──────
  const scaleMax = c.fieldHighT * FIELD_SCALE_HEADROOM;
  const anchors = [0, c.fieldLowT, c.fieldHighT];
  out.push({
    type: 'scale',
    id: 'field',
    shape: 'linear',
    pos: [FIELD_SCALE.x0, FIELD_SCALE.y],
    size: FIELD_SCALE.length,
    range: [0, scaleMax],
    value: b,
    tickAt: anchors,
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies Scale);
  out.push(
    label('field-name', 'label.field', {}, [FIELD_SCALE.x0, FIELD_SCALE.y], 'right', {
      offset: [-FIELD_NAME_GAP, 0],
      italic: true,
    }),
  );
  anchors.forEach((v, i) => {
    const x = FIELD_SCALE.x0 + (FIELD_SCALE.length * v) / scaleMax;
    out.push(
      label(`field-tick-${i}`, 'label.tesla', { b: String(v) }, [x, FIELD_SCALE.y], 'center', {
        size: SMALL_PX,
        offset: [0, TICK_LABEL_GAP],
      }),
    );
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
