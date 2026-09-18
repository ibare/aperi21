// ========================================================================
// meissner-effect — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음 — 시료(region) · 자기력선(lineSet) ·
// 자석(body rect 두 반쪽) · 글자(readout).
//
// 색은 뜻마다 하나다. 자기력선은 이 조각의 주인공이라 `primary` 한 색 — 시료를
// 지나가는 선과 휘돌아 가는 선이 **같은 선**이고, 달라지는 것은 가는 길뿐이다.
// 초전도 상태를 색으로 칠하지 않는다 — 시료는 온도와 무관하게 같은 물질이고,
// 상태는 선이 들어가느냐와 이름표 `T > Tc` · `T < Tc` 가 말한다 (S-piece).
// 자석은 먹색(N) · 회색(S) 명도와 글자로 극을 가른다. 강조색은 쓰지 않는다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { placeMagnet, readConstants, readPhase, sampleOutline, traceFieldLines } from './physics';
import { FIELD_CLIP, SCENE_BOUNDS, text, type MeissnerEffectMessageKey } from './schema';
import type { MeissnerEffectState } from './state';

/** 시료 윤곽의 점 수. 납작한 타원 양 끝이 각지지 않을 만큼. */
const OUTLINE_POINTS = 96;
/** 시료 채움의 짙기. 지나가는 자기력선이 그 위에서 또렷해야 한다. */
const SAMPLE_FILL = 0.3;
/** 자기력선 굵기(화면 px). */
const FIELD_WIDTH = 1.5;
/** 글자 크기(화면 px) — 시료 이름 · 온도 이름표 · 극 표식. */
const NAME_PX = 13;
const TEMP_PX = 13;
const POLE_PX = 13;
/** 이름표를 앵커에서 띄우는 거리(화면 px). */
const NAME_GAP = 24;
const POLE_GAP = 10;
/**
 * 시료 이름과 온도 이름표를 앵커 위아래로 띄우는 거리(화면 px). 이름이 위, 온도가 아래.
 * 둘 다 바탕 칩을 깔아 — 휘돌아 가는 자기력선이 그 자리를 지나가도 읽힌다 — 칩끼리
 * 맞닿지 않을 만큼 벌린다.
 */
const NAME_LIFT = 12;
const TEMP_DROP = 12;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const SOUTH = { colorRole: 'muted', emphasis: 'strong' } as const;
const SAMPLE = { colorRole: 'muted', emphasis: 'strong' } as const;
const FIELD = { colorRole: 'primary', emphasis: 'strong' } as const;
const LABEL = { colorRole: 'muted', emphasis: 'strong' } as const;

function label(
  id: string,
  key: MeissnerEffectMessageKey,
  world: Vec2,
  offset: Vec2,
  align: 'left' | 'center' | 'right',
  fontSize: number,
  opacity: number,
  style: Readout['style'] = LABEL,
  chip = false,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world, offset },
    text: text(key),
    chip,
    font: 'text',
    align,
    fontSize,
    opacity,
    style,
  };
}

export function scene(params: {
  state: MeissnerEffectState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('meissner-effect: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const now = readPhase(timeline, c);
  const magnet = placeMagnet(c, now.gap);
  const outline = sampleOutline(c, OUTLINE_POINTS);
  const out: Primitive[] = [];

  // ---- 시료: 옆에서 본 납작한 단면. 자기력선이 그 위를 지나가야 하므로 먼저 쓴다 ----
  out.push({
    type: 'region',
    id: 'sample',
    points: outline,
    fillOpacity: SAMPLE_FILL,
    outline: outline.map((_, i): readonly [number, number] => [i, (i + 1) % outline.length]),
    style: SAMPLE,
  });

  // ---- 자기력선: N 극에서 뿜어져 나와 S 극으로 돌아간다 ----
  // 보통 상태면 시료를 곧장 꿰뚫고, 밀어낸 만큼 시료를 비켜 휘돌아 간다.
  out.push({
    type: 'lineSet',
    id: 'field-lines',
    lines: traceFieldLines(c, magnet, now.expelled),
    width: FIELD_WIDTH,
    clip: { min: FIELD_CLIP.min, max: FIELD_CLIP.max },
    style: FIELD,
  });

  // ---- 자석: 아래 반쪽 N(먹색), 위 반쪽 S(회색). 자기력선 위에 덮는다 ----
  const half = c.magnetHeight / 2;
  const northCenter: Vec2 = [0, magnet.bottom + half / 2];
  const southCenter: Vec2 = [0, magnet.bottom + half + half / 2];
  out.push(
    {
      type: 'body',
      id: 'magnet-north',
      shape: 'rect',
      pos: northCenter,
      size: [c.magnetWidth, half],
      glow: false,
      style: INK,
    },
    {
      type: 'body',
      id: 'magnet-south',
      shape: 'rect',
      pos: southCenter,
      size: [c.magnetWidth, half],
      glow: false,
      style: SOUTH,
    },
  );

  // ---- 글자 ----
  const poleX = c.magnetWidth / 2;
  const sampleLeft: Vec2 = [-c.sampleHalfWidth, 0];
  out.push(
    label('pole-north', 'label.north', [poleX, northCenter[1]], [POLE_GAP, 0], 'left', POLE_PX, 1, INK),
    label('pole-south', 'label.south', [poleX, southCenter[1]], [POLE_GAP, 0], 'left', POLE_PX, 1, INK),
    label('sample-name', 'label.sample', sampleLeft, [-NAME_GAP, -NAME_LIFT], 'right', NAME_PX, 1, LABEL, true),
    // 온도 이름표 둘은 같은 자리에 번갈아 선다 — 한쪽이 다 사라진 뒤 다른 쪽이 나타난다.
    label('temp-warm', 'label.warm', sampleLeft, [-NAME_GAP, TEMP_DROP], 'right', TEMP_PX, now.warmLabel, INK, true),
    label('temp-cold', 'label.cold', sampleLeft, [-NAME_GAP, TEMP_DROP], 'right', TEMP_PX, now.coldLabel, INK, true),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
