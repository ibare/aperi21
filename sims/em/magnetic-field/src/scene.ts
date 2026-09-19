// ========================================================================
// magnetic-field — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 쇳가루 2400 알은 `lineSet` 하나다 — 알마다 짧은 선분 한 획. 자석은 반쪽 `body` rect
// 둘과 자극 표식 `N` · `S`. 자기력선 · 화살표 · 나침반은 두지 않는다: 선을 미리 그으면
// 쇳가루가 그 선을 따라가는 그림이 되어 「쇳가루가 모양을 드러낸다」 가 순환논증이 된다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { deriveFilings, fieldAt, filingAngle, readConstants } from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { MagneticFieldState } from './state';

/** 쇳가루 한 획의 굵기(화면 px). 가루로 읽히되 2400 획이 뭉개지지 않는 굵기. */
const FILING_WIDTH_PX = 1.1;
/** 자극 표식 글자 크기(화면 px). */
const POLE_LABEL_PX = 15;

export function scene(params: {
  state: MagneticFieldState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const out: Primitive[] = [];

  // 주기 끝에서 종이를 털어 낸다 — 가루와 자석이 함께 흐려진다.
  const cleared = 1 - tl.at('clear');
  // 가루는 내려앉으며 짙어지고, 자석은 놓이며 짙어진다.
  const filingOpacity = tl.at('sprinkle') * cleared;
  const magnetOpacity = tl.at('place') * cleared;

  // 자석을 다 놓은 순간부터 흐른 시간. 쇳가루마다 돌아서는 시각은 단계가 아니라 그 자리
  // 장의 세기가 정한다 (physics.filingAngle).
  const tau = Math.max(0, tl.u - tl.end('place'));

  // ---- 쇳가루 ----
  // 자리는 흩뿌린 그대로다. 바뀌는 것은 각뿐이다.
  const lines: Vec2[][] = [];
  for (const f of deriveFilings(c)) {
    const theta = filingAngle(c, f, fieldAt(c, f.pos), tau);
    const hx = (Math.cos(theta) * f.length) / 2;
    const hy = (Math.sin(theta) * f.length) / 2;
    lines.push([
      [f.pos[0] - hx, f.pos[1] - hy],
      [f.pos[0] + hx, f.pos[1] + hy],
    ]);
  }
  const filings: LineSet = {
    type: 'lineSet',
    id: 'filings',
    lines,
    width: FILING_WIDTH_PX,
    opacity: filingOpacity,
    style: { colorRole: 'ink', emphasis: 'medium' },
  };
  out.push(filings);

  // ---- 막대자석 ----
  // 강조색은 자석 하나에만 쓴다 — 장의 근원이라는 한 가지 뜻이다. N · S 는 색이 아니라
  // 표식으로 가른다 (S-piece: 관례색 빨강 · 파랑을 범례로 쓰지 않는다).
  if (magnetOpacity > 0) {
    const quarter = c.magnetLength / 4;
    const halves: readonly { id: string; x: number; label: 'label.north' | 'label.south' }[] = [
      { id: 'north', x: quarter, label: 'label.north' },
      { id: 'south', x: -quarter, label: 'label.south' },
    ];
    for (const h of halves) {
      const body: Body = {
        type: 'body',
        id: `magnet-${h.id}`,
        pos: [h.x, 0],
        shape: 'rect',
        size: [c.magnetLength / 2, c.magnetWidth],
        fill: 'none',
        outline: 'role',
        opacity: magnetOpacity,
        style: { colorRole: 'accent', emphasis: 'strong' },
      };
      out.push(body);
      const label: Readout = {
        type: 'readout',
        id: `pole-${h.id}`,
        anchor: { world: [h.x, 0] },
        text: text(h.label),
        chip: false,
        font: 'text',
        weight: 'bold',
        fontSize: POLE_LABEL_PX,
        opacity: magnetOpacity,
        style: { colorRole: 'accent', emphasis: 'strong' },
      };
      out.push(label);
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 종이 전체와 캡션 줄 — 매 프레임 같은 값이다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
