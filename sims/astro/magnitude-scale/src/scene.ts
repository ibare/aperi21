// ========================================================================
// magnitude-scale — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
//   · 두 판 — `region` 빛 없음(`light: 0`). 라이트 테마에서도 별빛을 0 에서부터 읽게 한다 (G92).
//   · 사다리 별 — `body` circle, 빛의 세기 `light` = 등급의 밝기(선형광). 크기는 모두 같다.
//   · 강조 고리 — `body` 속 빈 원, 강조색. **강조색은 「지금 견주는 칸」 한 뜻에만.**
//   · 비 이름표 · 괄호 — `readout` · `trajectory`, 먹색 계열.
//   · 나눔 — 1등성 `body` 의 빛이 남은 몫만큼이고, 떠난 몫은 6등성 밝기 · 같은 크기의 `body`.
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
import { brightness, ladderPosition, readConstants, shareDots, shareHomes, stepShown } from './physics';
import {
  BRACKET_FOOT_Y,
  BRACKET_LABEL_Y,
  BRACKET_Y,
  LADDER_GAP,
  LADDER_MAX,
  LADDER_MIN,
  LADDER_X0,
  MAG_LABEL_Y,
  RATIO_LABEL_Y,
  SCENE_BOUNDS,
  SHARE_MAX,
  SHARE_MIN,
  SHARE_PITCH,
  STAR_R,
  text,
  type MagnitudeScaleMessageKey,
} from './schema';
import type { MagnitudeScaleState } from './state';

/** 강조 고리의 반지름(월드) — 별의 번짐(반지름 × 3) 바깥을 두른다. */
const RING_R = 0.38;
/** 괄호 · 안내선 굵기(화면 px). */
const GUIDE_WIDTH = 1;
/** 글자 크기(화면 px). */
const LABEL_PX = 12;
const RATIO_PX = 13;

function label(
  id: string,
  pos: Vec2,
  key: MagnitudeScaleMessageKey,
  vars: Record<string, string>,
  opts: { fontSize?: number; role?: 'muted' | 'ink'; opacity?: number } = {},
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    vars,
    chip: false,
    font: 'text',
    fontSize: opts.fontSize ?? LABEL_PX,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    style: { colorRole: opts.role ?? 'muted', emphasis: 'strong' },
  };
}

function panel(id: string, min: readonly [number, number], max: readonly [number, number]): Primitive {
  return {
    type: 'region',
    id,
    points: [
      [min[0], min[1]],
      [max[0], min[1]],
      [max[0], max[1]],
      [min[0], max[1]],
    ],
    light: 0,
    fillOpacity: 1,
  };
}

export function scene(params: {
  state: MagnitudeScaleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('magnitude-scale: 시간표가 없다');
  const c = readConstants(params.stage);
  const out: Primitive[] = [];

  /** 다시 모으는 동안 사다리의 표지(고리 · 비 · 괄호)가 걷힌다 — 다음 주기가 빈 사다리에서 다시 시작한다. */
  const clear = 1 - tl.at('gather');
  const ladderY = (LADDER_MIN[1] + LADDER_MAX[1]) / 2;
  const xOf = (i: number): number => LADDER_X0 + i * LADDER_GAP;
  const lastMag = c.firstMagnitude + c.factorSteps;

  // ---- 두 판 ----
  out.push(panel('ladder-sky', LADDER_MIN, LADDER_MAX));
  out.push(panel('share-sky', SHARE_MIN, SHARE_MAX));

  // ---- 사다리 — 1등급부터 한 칸씩 같은 비로 어두워진다 ----
  for (let i = 0; i <= c.factorSteps; i++) {
    out.push({
      type: 'body',
      id: `star-${i}`,
      pos: [xOf(i), ladderY],
      shape: 'circle',
      size: STAR_R,
      outline: 'none',
      glow: false,
      light: brightness(i, c),
    });
    out.push(
      label(`mag-${i}`, [xOf(i), MAG_LABEL_Y], 'label.magnitude', {
        m: String(c.firstMagnitude + i),
      }),
    );
  }

  // 칸 사이의 비 — 고리가 그 칸을 건너는 동안 켜진다. 다섯 칸 모두 **같은 글자**다.
  for (let k = 1; k <= c.factorSteps; k++) {
    const shown = stepShown(tl, k) * clear;
    if (shown <= 0) continue;
    out.push(
      label(
        `ratio-${k}`,
        [(xOf(k - 1) + xOf(k)) / 2, RATIO_LABEL_Y],
        'label.ratio',
        { r: String(c.stepRatio) },
        { fontSize: RATIO_PX, role: 'ink', opacity: shown },
      ),
    );
  }

  // 지금 견주는 칸 — 고리가 별에서 다음 별로 옮겨 간다.
  if (clear > 0) {
    out.push({
      type: 'body',
      id: 'focus-ring',
      pos: [xOf(ladderPosition(tl, c)), ladderY],
      shape: 'circle',
      size: RING_R,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: clear,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 첫 별과 끝 별을 묶는 괄호 — 같은 비를 다섯 번 거친 결과가 딱 떨어지는 수다.
  const bracket = tl.at('hundred') * clear;
  if (bracket > 0) {
    const x0 = xOf(0);
    const x1 = xOf(c.factorSteps);
    out.push({
      type: 'trajectory',
      id: 'bracket',
      points: [
        [x0, BRACKET_FOOT_Y],
        [x0, BRACKET_Y],
        [x1, BRACKET_Y],
        [x1, BRACKET_FOOT_Y],
      ],
      width: GUIDE_WIDTH,
      opacity: bracket,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push(
      label(
        'ratio-total',
        [(x0 + x1) / 2, BRACKET_LABEL_Y],
        'label.ratio',
        { r: String(c.factor) },
        { fontSize: RATIO_PX, role: 'ink', opacity: bracket },
      ),
    );
  }

  // ---- 나눔 — 1등성 하나를 끝 별(6등성) 몫으로 ----
  const center: Vec2 = [(SHARE_MIN[0] + SHARE_MAX[0]) / 2, (SHARE_MIN[1] + SHARE_MAX[1]) / 2];
  const n = Math.round(c.factor);
  const share = brightness(c.factorSteps, c); // 한 몫 = 끝 별 하나의 빛 = 1 / factor
  const dots = shareDots(tl, shareHomes(n, SHARE_PITCH));
  const away = dots.filter((d) => d.out > 0);
  
  // 떠난 몫 — 저마다 끝 별과 같은 빛 · 같은 크기의 별. 격자 자리로 흩어진다.
  // 입자 떼(`particleSystem`)가 아니라 `body` 인 까닭 — 사다리의 끝 별과 **같은 모양**이어야
  // "점 하나 = 6등성 하나" 가 모양으로도 참이다(입자는 화면 px 원이고 번짐이 없다).
  // id 는 격자 자리 번호라 떠나고 돌아오는 동안 바뀌지 않는다.
  dots.forEach((d, k) => {
    if (d.out <= 0) return;
    out.push({
      type: 'body',
      id: `share-${k}`,
      pos: [center[0] + d.home[0] * d.out, center[1] + d.home[1] * d.out],
      shape: 'circle',
      size: STAR_R,
      outline: 'none',
      glow: false,
      light: share,
    });
  });

  // 별에 남은 빛 = 1 − 떠난 몫. 몫 하나가 떠날 때마다 그만큼 옅어진다.
  // 떠나는 몫 **위에** 긋는다 — 막 떠난 희미한 점이 아직 별 자리에 겹쳐 있어 아래에 두면 별을 가린다.
  const remaining = Math.max(0, 1 - away.length * share);
  if (remaining > 0) {
    out.push({
      type: 'body',
      id: 'source-star',
      pos: center,
      shape: 'circle',
      size: STAR_R,
      outline: 'none',
      glow: false,
      light: remaining,
    });
  }

  out.push(
    label('source-name', [center[0], RATIO_LABEL_Y], 'label.source', { m: String(c.firstMagnitude) }),
  );
  if (away.length > 0) {
    out.push(
      label('share-count', [center[0], MAG_LABEL_Y], 'label.count', {
        m: String(lastMag),
        n: String(away.length),
      }),
    );
  }

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
