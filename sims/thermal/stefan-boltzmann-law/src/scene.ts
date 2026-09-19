// ========================================================================
// stefan-boltzmann-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 판(body) · 막대(region) ·
// 글자(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 판은 셋이 같은 muted(칠하지 않는다: 600 K 는 아직 빛나지
// 않는다), 온도 막대는 muted, **강조색은 「내보내는 복사」 한 가지 뜻에만**(복사 막대와
// 그 배수 글자). 온도를 빨강 · 파랑으로 가르지 않는다 — 온도는 막대 높이와 글자가 말한다.
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
import { plateBars, readConstants } from './physics';
import {
  BAR_OFFSET,
  BAR_W,
  BASE_Y,
  COLUMN_XS,
  KELVIN_Y,
  PLATE_H,
  PLATE_W,
  SCENE_BOUNDS,
  TAG_Y,
  text,
} from './schema';
import type { StefanBoltzmannLawState } from './state';

/** 판 온도 글자 크기(화면 px). 판의 이름이라 막대 글자보다 조금 크다. */
const KELVIN_PX = 13;
/** 배수 글자 크기(화면 px). */
const MULT_PX = 13;
/** 막대 이름표 글자 크기(화면 px). 자리만 알리는 글자라 작다. */
const TAG_PX = 11;
/** 배수 글자를 막대 윗면에서 띄우는 거리(월드). */
const MULT_GAP = 0.2;
/** 온도 막대의 채움 짙기. 배경 정보보다 짙되 강조색 막대보다는 물러난다. */
const TEMP_FILL = 0.7;
/** 복사 막대의 채움 짙기. 다크 바탕에서도 또렷해야 한다. */
const EMIT_FILL = 0.85;

function rect(minX: number, minY: number, maxX: number, maxY: number): Vec2[] {
  return [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ];
}

export function scene(params: {
  state: StefanBoltzmannLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('stefan-boltzmann-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const bars = plateBars(c);
  const out: Primitive[] = [];

  // 단계 진행도 — 경계는 선언이 안다 (S-piece).
  const keep = 1 - tl.at('fade');
  const tempGrow = tl.at('temp');
  const tempMark = tl.at('temp-mark') * keep;
  const emitGrow = tl.at('emit');
  const emitMark = tl.at('emit-mark') * keep;

  COLUMN_XS.forEach((cx, i) => {
    const bar = bars[i];
    const temp = c.temps[i];
    if (!bar || temp === undefined) return;
    const tempX = cx - BAR_OFFSET;
    const emitX = cx + BAR_OFFSET;

    // ---- 판 ----
    // 셋이 같은 크기 · 같은 색이다. 다른 것은 온도 글자뿐이다.
    out.push({
      type: 'body',
      id: `plate-${i}`,
      pos: [cx, BASE_Y - PLATE_H / 2],
      shape: 'rect',
      size: [PLATE_W, PLATE_H],
      outline: 'none',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `kelvin-${i}`,
      anchor: { world: [cx, KELVIN_Y] },
      text: text('label.kelvin'),
      vars: { t: String(temp) },
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: KELVIN_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ---- 막대 이름표 — 제 막대 밑 ----
    out.push({
      type: 'readout',
      id: `tag-temp-${i}`,
      anchor: { world: [tempX, TAG_Y] },
      text: text('label.tagTemp'),
      chip: false,
      font: 'text',
      fontSize: TAG_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `tag-emit-${i}`,
      anchor: { world: [emitX, TAG_Y] },
      text: text('label.tagEmit'),
      chip: false,
      font: 'text',
      fontSize: TAG_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });

    // ---- 온도 막대 ----
    const tempH = bar.tempHeight * tempGrow;
    if (tempH > 0 && keep > 0) {
      out.push({
        type: 'region',
        id: `temp-bar-${i}`,
        points: rect(tempX - BAR_W / 2, BASE_Y, tempX + BAR_W / 2, BASE_Y + tempH),
        fillOpacity: TEMP_FILL,
        opaque: true,
        opacity: keep,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
    }
    if (tempMark > 0) {
      out.push({
        type: 'readout',
        id: `temp-mult-${i}`,
        anchor: { world: [tempX, BASE_Y + bar.tempHeight + MULT_GAP] },
        text: text('label.mult'),
        vars: { k: String(c.tempMarks[i]) },
        chip: false,
        font: 'mono',
        fontSize: MULT_PX,
        opacity: tempMark,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }

    // ---- 복사 막대 ----
    // 같은 바닥 · 같은 배율에서 선다. 첫 판에서는 온도 막대와 같은 높이다.
    const emitH = bar.emitHeight * emitGrow;
    if (emitH > 0 && keep > 0) {
      out.push({
        type: 'region',
        id: `emit-bar-${i}`,
        points: rect(emitX - BAR_W / 2, BASE_Y, emitX + BAR_W / 2, BASE_Y + emitH),
        fillOpacity: EMIT_FILL,
        opaque: true,
        opacity: keep,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
    if (emitMark > 0) {
      out.push({
        type: 'readout',
        id: `emit-mult-${i}`,
        anchor: { world: [emitX, BASE_Y + bar.emitHeight + MULT_GAP] },
        text: text('label.mult'),
        vars: { k: String(c.emitMarks[i]) },
        chip: false,
        font: 'mono',
        weight: 'bold',
        fontSize: MULT_PX,
        opacity: emitMark,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
