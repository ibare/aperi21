// ========================================================================
// antenna-radiation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 축 점선(trajectory) ·
// 마루 고리(lineSet, 방향마다 짙기) · 두 잎(trajectory closed) · 안테나(lineSet) ·
// 전하(particleSystem)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 물결은 primary, 두 잎은 먹색(ink), 안테나 · 축은 배경 정보라 muted,
// **강조색은 흔들리는 전하 한 가지 뜻에만** (이웃 `electromagnetic-wave` 와 같은 대상 · 같은 색).
// 방향마다 다른 것은 색이 아니라 고리의 **짙기**다 (S-piece — 색으로 설명하지 않는다).
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  ViewDef,
} from '@aperi21/schema';
import { chargeOffset, lobeOutline, readConstants, ringPieces } from './physics';
import { FIELD_BOUNDS, RING_REACH, SCENE_BOUNDS } from './schema';
import type { AntennaRadiationState } from './state';

/** 마루 고리 굵기(화면 px). 짙기로 세기를 읽어야 하므로 가늘지 않게. */
const RING_WIDTH_PX = 2.4;
/** 두 잎 윤곽 굵기(화면 px). 고리보다 굵어야 고리 위에서 한 모양으로 읽힌다. */
const LOBE_WIDTH_PX = 2.6;
/** 축 점선 굵기(화면 px) · 짙기. 방향을 가리키는 안내선이라 가장 가늘고 옅게. */
const AXIS_WIDTH_PX = 1;
const AXIS_OPACITY = 0.55;
/** 안테나 막대 굵기(화면 px). */
const ANTENNA_WIDTH_PX = 3;
/** 전하 점 반지름(화면 px). */
const CHARGE_PX = 5;
/** 안테나 끝과 축 점선 사이의 틈(월드 칸). 점선이 안테나의 연장으로 읽히되 붙지 않게. */
const AXIS_GAP = 0.15;

export function scene(params: {
  state: AntennaRadiationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('antenna-radiation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  // 고리 · 전하는 단계와 상관없이 조각 시계로 흔들린다 — 주기가 넘어가도 끊기지 않는다.
  const t = timeline.t;
  const out: Primitive[] = [];

  // ---- 안테나 축 점선 ----
  // 「축 방향」 이 어디인지 가리킨다. 이 선 위로는 고리가 비어 있다 — 그것이 주장의 절반이다.
  const axisFrom = c.antennaHalf + AXIS_GAP;
  out.push({
    type: 'trajectory',
    id: 'axis-up',
    points: [
      [0, axisFrom],
      [0, FIELD_BOUNDS.maxY],
    ],
    width: AXIS_WIDTH_PX,
    opacity: AXIS_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'trajectory',
    id: 'axis-down',
    points: [
      [0, -axisFrom],
      [0, FIELD_BOUNDS.minY],
    ],
    width: AXIS_WIDTH_PX,
    opacity: AXIS_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // ---- 마루 고리 ----
  // 모양은 원 그대로, 조각마다 제 방향의 세기만큼 짙다. 판 아래 캡션 띠로는 넘지 않는다.
  const rings = ringPieces(t, c);
  out.push({
    type: 'lineSet',
    id: 'crests',
    lines: rings.lines,
    opacities: rings.opacities,
    width: RING_WIDTH_PX,
    // 아래만 자른다 — 캡션 띠 뒤로 고리가 지나가지 않게. 옆 · 위는 넓은 임베드에서
    // 판 밖 여백까지 고리가 이어져야 물결이 판 끝에서 끊긴 것으로 읽히지 않는다.
    clip: {
      min: [-RING_REACH, FIELD_BOUNDS.minY],
      max: [RING_REACH, RING_REACH],
    },
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 두 잎 (극좌표 복사 무늬) ----
  // `trace` 동안 가운데에서 자라고, `clear` 동안 옅어진다. 다음 주기 `ripple` 에는 없다.
  const grow = timeline.at('trace');
  const fade = 1 - timeline.at('clear');
  if (grow > 0 && fade > 0) {
    out.push({
      type: 'trajectory',
      id: 'lobes',
      points: lobeOutline(grow, c),
      closed: true,
      width: LOBE_WIDTH_PX,
      opacity: fade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 안테나 ----
  out.push({
    type: 'lineSet',
    id: 'antenna',
    lines: [
      [
        [0, -c.antennaHalf],
        [0, c.antennaHalf],
      ],
    ],
    width: ANTENNA_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 흔들리는 전하 ----
  // 위 · 아래 전하가 안테나 두 팔 가운데를 중심으로 엇갈려 오르내린다. 물결을 내는 것은 이 흔들림이다.
  const d = chargeOffset(t, c);
  out.push({
    type: 'particleSystem',
    id: 'charges',
    positions: [
      [0, c.antennaHalf / 2 + d],
      [0, -c.antennaHalf / 2 - d],
    ],
    sizes: CHARGE_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
