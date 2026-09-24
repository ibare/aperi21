// ========================================================================
// conservation-of-mechanical-energy — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 기준면과 골짜기 길과
// 놓은 높이 수평선(trajectory) · 기둥의 두 몫(region) · 공(body) · 진행 속도(vector) ·
// 두 몫의 이름(readout)이 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다. **강조색은 「역학적 에너지」 한 뜻에만** — 기둥의 두 몫과 그
// 합이 닿아 있는 수평선이다. 두 몫은 같은 것의 다른 몫이라 색을 가르지 않고 결로
// 가른다(아래는 채움, 위는 사선). 공은 먹색, 진행 속도는 primary, 길과 기준면과
// 이름은 배경 정보라 muted.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { pointAt, readConstants, readSwing, thetaAtHeight } from './physics';
import {
  BALL_RADIUS,
  COLUMN_HALF,
  SCENE_BOUNDS,
  THETA_CAP,
  TRACK_MARGIN,
  TRACK_SAMPLES,
  text,
} from './schema';
import type { ConservationOfMechanicalEnergyState } from './state';

/** 골짜기 길의 굵기(화면 px). 무대라서 또렷하되 공보다 앞서지 않는다. */
const TRACK_WIDTH_PX = 2.5;
/** 놓은 높이 수평선의 굵기(화면 px). 재는 선이라 가늘게. */
const LEVEL_WIDTH_PX = 1.5;
/** 기준면 선의 굵기(화면 px). */
const GROUND_WIDTH_PX = 1;
/** 기둥의 채움 짙기. 아래 깔린 길이 비쳐 보일 만큼. */
const COLUMN_FILL = 0.5;
/** 기둥의 한 몫이 이보다 짧으면 그리지 않는다(m) — 0 에 가까운 몫이 선으로 남는다. */
const SHARE_MIN = 0.012;
/** 이름표는 그 몫이 이만큼은 되어야 붙는다(m). 몫이 사라지면 이름도 사라진다. */
const LABEL_MIN = 0.26;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;
/**
 * 이름표를 그 몫의 **먼 끝**(기준면 바로 위 · 수평선 바로 아래)에서 띄우는 거리(화면 px).
 *
 * 가르는 자리(공)와 그 자리에서 뻗는 화살표를 피해 앉히는 자리다. 첫 촬영에서 몫의
 * 한가운데에 두었더니 이름표가 화살표 위에 얹혔다.
 */
const LABEL_INSET_PX = 13;
/** 화살표가 이보다 짧으면 그리지 않는다(m) — 되돌아서는 자리에서 속력이 0 이다. */
const ARROW_MIN = 0.03;

export function scene(params: {
  state: ConservationOfMechanicalEnergyState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) {
    throw new Error('conservation-of-mechanical-energy: schema.timeline 이 선언되어야 한다');
  }
  const c = readConstants(stage);
  const swing = readSwing(timeline, c);
  const out: Primitive[] = [];

  // 되돌아서는 자리보다 조금 더 그린 길의 끝. 길이 남아 있는데도 공이 멈추는 것이
  // 보여야 멈춘 이유가 길의 끝이 아니라 높이로 읽힌다.
  const thetaEnd = Math.min(thetaAtHeight(c.releaseHeight, c.radius) + TRACK_MARGIN, THETA_CAP);
  const spanX = pointAt(thetaEnd, c.radius)[0];

  // ---- 기준면 ----
  // 높이를 여기서부터 잰다. 골짜기 바닥이 여기 닿아 있다.
  out.push({
    type: 'trajectory',
    id: 'datum',
    points: [
      [-spanX, 0],
      [spanX, 0],
    ],
    width: GROUND_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });

  // ---- 기둥 ----
  // 공의 가로 자리에 서서 **기준면부터 놓은 높이 수평선까지** 늘 닿아 있다. 공이
  // 그것을 두 몫으로 가른다 — 아래는 지금 높이에 담긴 몫, 위는 운동에 담긴 몫이다.
  // 가르는 자리는 쉬지 않고 오르내리는데 위끝은 한 번도 선에서 떨어지지 않는다.
  //
  // 두 몫을 색으로 가르지 않는다. **하나의 에너지가 두 몫으로 나뉜 것**이라 같은
  // 역할색을 쓰고 결로만 가른다 (S-piece — 색으로 설명하지 않는다).
  const cx = swing.pos[0];
  const column = (id: string, from: number, to: number, hatch: boolean): Region => ({
    type: 'region',
    id,
    points: [
      [cx - COLUMN_HALF, from],
      [cx + COLUMN_HALF, from],
      [cx + COLUMN_HALF, to],
      [cx - COLUMN_HALF, to],
    ],
    fill: hatch ? 'hatch' : 'solid',
    fillOpacity: COLUMN_FILL,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  if (swing.height > SHARE_MIN) out.push(column('share-height', 0, swing.pos[1], false));
  if (swing.motion > SHARE_MIN) {
    out.push(column('share-motion', swing.pos[1], c.releaseHeight, true));
  }

  // ---- 골짜기 길 ----
  // 매끄럽다 — 마찰로 잃는 몫은 `energy-dissipation` 의 것이고, 여기서 잃으면
  // 되돌아오는 높이가 줄어 주장이 무너진다.
  const track: Vec2[] = [];
  for (let i = 0; i <= TRACK_SAMPLES; i++) {
    track.push(pointAt(-thetaEnd + (2 * thetaEnd * i) / TRACK_SAMPLES, c.radius));
  }
  out.push({
    type: 'trajectory',
    id: 'track',
    points: track,
    width: TRACK_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 놓은 높이 수평선 ----
  // **합이다.** 기둥의 위끝이 늘 여기 닿아 있고, 공이 되돌아서는 두 자리에서 길과
  // 만난다 — 반대쪽에서도 꼭 이 높이까지 올라온다는 것이 그 두 교점이다.
  out.push({
    type: 'trajectory',
    id: 'level',
    points: [
      [-spanX, c.releaseHeight],
      [spanX, c.releaseHeight],
    ],
    width: LEVEL_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // ---- 공 ----
  out.push({
    type: 'body',
    id: 'ball',
    pos: swing.pos,
    shape: 'circle',
    size: BALL_RADIUS,
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 진행 속도 ----
  // 위 몫이 「운동에 담긴 것」 이라는 말의 증인이다. 바닥에서 가장 길고 되돌아서는
  // 자리에서 사라진다 — 위 몫이 자라고 줄어드는 것과 같은 박자다.
  const arrow = swing.speed * c.speedScale;
  if (arrow > ARROW_MIN) {
    out.push({
      type: 'vector',
      id: 'speed',
      from: swing.pos,
      delta: [swing.dir[0] * arrow, swing.dir[1] * arrow],
      outline: 'background',
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ---- 두 몫의 이름 ----
  // **기둥 안 가운데**에 앉힌다. 가르는 자리(공)와 거기서 뻗는 화살표를 비켜 각 몫의
  // 먼 끝에 두므로, 두 이름이 서로도 그림과도 겹치지 않는다. 몫이 남아 있을 때만
  // 붙는다 — 사라진 몫에 이름이 남으면 화면과 어긋난다.
  if (swing.height > LABEL_MIN) {
    out.push({
      type: 'readout',
      id: 'name-height',
      anchor: { world: [cx, 0], offset: [0, -LABEL_INSET_PX] },
      text: text('label.height'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      hideWhenClipped: true,
      // 기둥 위에 얹히는 글자다. 배경 정보(muted)로 두면 다크에서 사선 결에 섞여
      // 읽히지 않는다 — 글자의 역할은 먹이다.
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  if (swing.motion > LABEL_MIN) {
    out.push({
      type: 'readout',
      id: 'name-motion',
      anchor: { world: [cx, c.releaseHeight], offset: [0, LABEL_INSET_PX] },
      text: text('label.motion'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      hideWhenClipped: true,
      // 기둥 위에 얹히는 글자다. 배경 정보(muted)로 두면 다크에서 사선 결에 섞여
      // 읽히지 않는다 — 글자의 역할은 먹이다.
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
