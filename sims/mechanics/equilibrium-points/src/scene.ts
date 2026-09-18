// ========================================================================
// equilibrium-points — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 땅(region) · 트랙과
// 멈춤막이 · 평형 자리 점선(trajectory) · 공(body) · 비탈 힘(vector) · 이름표
// (readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 공 셋은 먹색(같은 공이라 같은 색), 트랙도 먹색, 땅은 옅은
// muted, 평형 자리 점선은 muted. **강조색은 「바닥이 공을 미는 힘」 한 가지 뜻에만.**
// 그 화살표가 있는지 · 어느 쪽을 보는지가 이 조각의 판정이다.
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
import { groundHeight, readBall, readConstants, sceneOpacity, type GroundKind } from './physics';
import {
  BALL_RADIUS,
  FORCE_ARROW_SCALE,
  GROUND_BOTTOM,
  HALF_WIDTH,
  MARK_ABOVE,
  MARK_BELOW,
  NAME_FADE_IN,
  NAME_Y,
  PANEL_PITCH,
  SCENE_BOUNDS,
  text,
  type EquilibriumPointsMessageKey,
} from './schema';
import type { EquilibriumPointsState } from './state';

/** 트랙을 표본하는 점 수. 곡선이 매끄럽게 보이는 만큼. */
const TRACK_SAMPLES = 64;
/** 땅 채움의 짙기. 바닥의 속이라 옅다 — 트랙선이 경계다. */
const GROUND_FILL = 0.16;
/** 트랙선 굵기(화면 px). 공이 구르는 길이라 곡선 기본 굵기. */
const TRACK_WIDTH = 2;
/** 평형 자리 점선 굵기(화면 px). 안내선이라 가늘게. */
const MARK_WIDTH = 1;
/** 멈춤막이 높이(m). 공 지름보다 조금 높다. */
const STOPPER_HEIGHT = 0.3;
/**
 * 이 길이(m)보다 짧은 힘 화살표는 두지 않는다. 골의 공은 감쇠 진동이라 끝내 0 이 되지 않고
 * 점선 둘레를 수 cm 오가는데, 그 자리에 촉만 남은 조각이 붙으면 「돌아왔다」 가 아니라
 * 「아직 밀린다」 로 읽힌다. 촉 크기(화면 8 px)보다 짧으면 방향도 읽히지 않는다.
 */
const MIN_ARROW = 0.08;
/** 이름표 글자 크기(화면 px). 캡션과 같다 — 결과를 부르는 말이다. */
const NAME_PX = 13;

/** 판 하나의 선언 — 바닥 모양 · 가운데 자리 · 이름표. */
interface Panel {
  kind: GroundKind;
  cx: number;
  name: EquilibriumPointsMessageKey;
}

/** 왼쪽부터 안정 · 불안정 · 중립. 주제 설명의 순서 그대로다. */
const PANELS: readonly Panel[] = [
  { kind: 'valley', cx: -PANEL_PITCH, name: 'label.stable' },
  { kind: 'crest', cx: 0, name: 'label.unstable' },
  { kind: 'flat', cx: PANEL_PITCH, name: 'label.neutral' },
];

export function scene(params: {
  state: EquilibriumPointsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('equilibrium-points: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  // 이름표는 결과 단계가 시작되고서야 떠오른다 — 이름은 본 것을 부르는 말이다.
  const holdStart = timeline.start('hold');
  const nameAlpha = timeline.span(holdStart, holdStart + NAME_FADE_IN) * alpha;
  const out: Primitive[] = [];

  for (const panel of PANELS) {
    const { kind, cx } = panel;

    // ---- 트랙 ----
    const track: Vec2[] = [];
    for (let i = 0; i <= TRACK_SAMPLES; i++) {
      const x = -HALF_WIDTH + (2 * HALF_WIDTH * i) / TRACK_SAMPLES;
      track.push([cx + x, groundHeight(kind, x)]);
    }

    // 땅 — 트랙 아래를 옅게 채워 「이 선이 땅의 겉이다」 로 읽히게 한다.
    out.push({
      type: 'region',
      id: `ground-${kind}`,
      points: [...track, [cx + HALF_WIDTH, GROUND_BOTTOM], [cx - HALF_WIDTH, GROUND_BOTTOM]],
      fillOpacity: GROUND_FILL,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'trajectory',
      id: `track-${kind}`,
      points: track,
      width: TRACK_WIDTH,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // 마루 판의 멈춤막이. 굴러떨어진 공이 판 밖으로 나가지 않고 **떠난 자리가 보이게** 남는다.
    if (kind === 'crest') {
      for (const side of [-1, 1] as const) {
        const x = cx + side * HALF_WIDTH;
        out.push({
          type: 'trajectory',
          id: `stopper-${side < 0 ? 'left' : 'right'}`,
          points: [
            [x, GROUND_BOTTOM],
            [x, STOPPER_HEIGHT],
          ],
          width: TRACK_WIDTH,
          style: { colorRole: 'ink', emphasis: 'strong' },
        });
      }
    }

    // ---- 평형 자리 ----
    // 공이 처음 멈춰 있던 자리를 세로 점선으로 남긴다. 공 **뒤로** 지나가서, 공이
    // 점선 위로 돌아왔는지 · 떠났는지 · 옆에 머무는지를 눈으로 잰다.
    const y0 = groundHeight(kind, 0);
    out.push({
      type: 'trajectory',
      id: `mark-${kind}`,
      points: [
        [cx, y0 - MARK_BELOW],
        [cx, y0 + MARK_ABOVE],
      ],
      width: MARK_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });

    // ---- 공 ----
    const ball = readBall(kind, timeline, c);
    const contact: Vec2 = [cx + ball.x, groundHeight(kind, ball.x)];
    const center: Vec2 = [
      contact[0] + ball.normal[0] * BALL_RADIUS,
      contact[1] + ball.normal[1] * BALL_RADIUS,
    ];
    out.push({
      type: 'body',
      id: `ball-${kind}`,
      pos: center,
      shape: 'circle',
      size: BALL_RADIUS,
      outline: 'none',
      glow: false,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ---- 바닥이 공을 미는 힘 ----
    // 비탈 방향 성분만 그린다 — 그것이 공을 움직이는 힘이다. 길이는 가속도에 비례해,
    // 평형 자리에서는 사라지고 옮기면 자란다. 평지에서는 끝내 나타나지 않는다.
    // 화살표는 공 테두리에서 출발한다 — 먹색 공 위에 겹치면 시작점이 묻힌다.
    const len = ball.pull * FORCE_ARROW_SCALE;
    if (Math.abs(len) >= MIN_ARROW) {
      const dir: Vec2 = [Math.sign(len) * ball.tangent[0], Math.sign(len) * ball.tangent[1]];
      out.push({
        type: 'vector',
        id: `pull-${kind}`,
        from: [center[0] + dir[0] * BALL_RADIUS, center[1] + dir[1] * BALL_RADIUS],
        delta: [dir[0] * Math.abs(len), dir[1] * Math.abs(len)],
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    // ---- 이름표 ----
    if (nameAlpha > 0) {
      out.push({
        type: 'readout',
        id: `name-${kind}`,
        anchor: { world: [cx, NAME_Y] },
        text: text(panel.name),
        chip: false,
        font: 'text',
        fontSize: NAME_PX,
        weight: 'bold',
        align: 'center',
        opacity: nameAlpha,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
