import type { BundleState, ControllerSpec, Vec2 } from '@aperi21/schema';
import type { Viewport } from '../camera';
import type { UiTheme } from '../theme/types';
import { placeBox, stackedAnchor, type Box, type ScreenAnchor } from './layout';
import { readPath, writePath } from './path';
import { controllerText } from './text';
import type {
  ControllerEventContext,
  ControllerImpl,
  ControllerRenderContext,
  PointerInput,
} from './types';

type AngleSpec = Extract<ControllerSpec, { type: 'angle-dial' }>;

interface Layout {
  cx: number;
  cy: number;
  /** 반원 아래 글자의 치수. `screenBounds` 가 이만큼을 함께 비우고 render 가 그대로 그린다. */
  band: TextBand;
  r: number;
}

/** 선언에 `radius` 가 없을 때의 반지름. 코어는 기본값만 준다 (원칙 7 ③). */
const DEFAULT_DIAL_RADIUS = 72;
/**
 * 중앙 각도 숫자의 기준 크기. 반지름에 비례해 커진다 — 이 조작기 고유 치수다
 * (`scale.ts` 의 다이얼 글자와 같은 성격). 이름표 쪽은 축의 값을 쓴다.
 */
const VALUE_FONT_BASE = 18;
/** 줄여도 여기까지. 더 작으면 읽히지 않는다. */
const MIN_LABEL_FONT = 8;
/** 자리를 선언하지 않은 다이얼끼리의 **가로** 간격. 축의 stackGap 은 세로용이다. */
const DIAL_STACK_GAP = 24;
/** 자리를 선언하지 않으면 왼쪽 아래에서 오른쪽으로 쌓인다. */
const DEFAULT_AT: ScreenAnchor = { screen: 'bottom-left' };

/** 이름표 baseline 아래로 글자가 내려가는 몫. 글꼴 계량 어림값이다. */
const LABEL_DESCENDER_RATIO = 0.3;

interface TextBand {
  valueFont: number;
  labelFont: number;
  /** 값 글자와 반원 사이. */
  lead: number;
  /** 값 글자와 이름표 사이. */
  gap: number;
  /** 띠 전체 세로. */
  height: number;
}

/**
 * 반원 아래에 붙는 글자(각도 값 + 이름표)의 치수. **재는 쪽과 그리는 쪽이 이 하나를
 * 함께 본다.**
 *
 * 상자를 반원(`2r × r`)으로만 잡으면 글자가 그 밖에 그려져 캔버스 아래로 잘린다.
 * 그렇다고 띠 높이를 따로 세면 같은 숫자가 두 곳에 남아, 한쪽만 고쳤을 때 **다시
 * 잘린다** — 고치려던 버그와 같은 모양이 된다. 그래서 값을 한 군데서 낸다.
 */
function textBand(r: number, ui: UiTheme): TextBand {
  const k = r / DEFAULT_DIAL_RADIUS;
  const valueFont = Math.max(ui.fontSize.small, Math.round(VALUE_FONT_BASE * k));
  const labelFont = Math.max(MIN_LABEL_FONT, Math.round(ui.fontSize.small * k));
  const lead = ui.spacing.sm;
  const gap = ui.spacing.lg;
  return {
    valueFont,
    labelFont,
    lead,
    gap,
    height: valueFont + labelFont + gap + Math.round(labelFont * LABEL_DESCENDER_RATIO),
  };
}

/** 반원 다이얼의 상자는 지름 × (반지름 + 글자 띠). 중심은 반원의 아래 변 가운데. */
function computeLayout(
  spec: AngleSpec,
  viewport: Viewport,
  toScreen: (w: Vec2) => Vec2,
  slot: number,
  ui: UiTheme,
): Layout {
  const r = spec.radius ?? DEFAULT_DIAL_RADIUS;
  // 쌓는 간격도 선언한 반지름을 따른다 — 기본값으로 세면 큰 다이얼끼리 겹친다.
  const at = spec.at ?? stackedAnchor(DEFAULT_AT, slot, [2 * r + DIAL_STACK_GAP, 0]);
  const band = textBand(r, ui);
  const box = placeBox(at, 2 * r, r + band.height, viewport, toScreen, ui.layout.margin);
  return { cx: box.x + r, cy: box.y + r, r, band };
}

function hitDial(input: PointerInput, layout: Layout): boolean {
  const dx = input.px - layout.cx;
  const dy = input.py - layout.cy;
  const d2 = dx * dx + dy * dy;
  // 반원(위쪽) 안쪽 + 바깥 4px 여유. y 가 center 보다 아래면 제외 — 다이얼 아래의
  // 캔버스 클릭이 다이얼로 빨려가지 않도록 여유는 작게 둔다.
  if (input.py > layout.cy + 2) return false;
  return d2 <= (layout.r + 4) * (layout.r + 4);
}

/**
 * 반원 다이얼. 마우스 위치 → 중심 기준 각도 → range 로 클램프 후 spec.binds.angle
 * 경로에 기록. tickAt 에 지정된 각도에 강조 눈금. 선언 하나가 인스턴스 하나다.
 */
export class AngleDialController implements ControllerImpl<AngleSpec> {
  readonly type = 'angle-dial' as const;

  private dragging = false;

  isDragging(): boolean {
    return this.dragging;
  }

  /** 마지막 렌더의 자리. */
  private box: Box | null = null;

  /** 마지막 렌더에서 차지한 화면 상자. 자동 프레이밍이 이만큼을 비운다. */
  screenBounds(): Box | null {
    return this.box;
  }


  render(rc: ControllerRenderContext, spec: AngleSpec, state: BundleState): void {
    const { ctx, ui, viewport } = rc;
    const layout = computeLayout(spec, viewport, rc.toScreen, rc.slot, rc.ui);
    // 반원이라 상자는 `2r × r` 이고 중심이 아래 변 가운데다.
    // 글자 띠까지 포함한다. 반원만 잡으면 자동 프레이밍이 글자 자리를 안 비워
    // 그림이 그 위로 올라오고, 아래로는 캔버스 밖으로 잘린다.
    this.box = {
      x: layout.cx - layout.r,
      y: layout.cy - layout.r,
      w: 2 * layout.r,
      h: layout.r + layout.band.height,
    };
    const angle = Number(readPath<number>(state, spec.binds.angle) ?? 45);
    const range = spec.range ?? [0, 90];

    ctx.save();

    // 반원 base
    ctx.beginPath();
    ctx.arc(layout.cx, layout.cy, layout.r, Math.PI, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = ui.surface;
    ctx.fill();
    ctx.strokeStyle = ui.border;
    ctx.lineWidth = ui.strokeWidth.thick;
    ctx.stroke();

    // 각도 틱 (10° 마다) — 0°=오른쪽, 90°=위쪽 (포물선 발사 방향)
    ctx.strokeStyle = ui.label;
    ctx.lineWidth = ui.strokeWidth.thin;
    for (let a = range[0]; a <= range[1]; a += 10) {
      const rad = (a * Math.PI) / 180;
      const x1 = layout.cx + Math.cos(rad) * (layout.r - 6);
      const y1 = layout.cy - Math.sin(rad) * (layout.r - 6);
      const x2 = layout.cx + Math.cos(rad) * layout.r;
      const y2 = layout.cy - Math.sin(rad) * layout.r;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // tickAt 강조 (물리 특수점)
    if (spec.tickAt) {
      ctx.strokeStyle = ui.toggled;
      ctx.lineWidth = ui.strokeWidth.thick;
      for (const a of spec.tickAt) {
        const rad = (a * Math.PI) / 180;
        const x1 = layout.cx + Math.cos(rad) * (layout.r - 12);
        const y1 = layout.cy - Math.sin(rad) * (layout.r - 12);
        const x2 = layout.cx + Math.cos(rad) * layout.r;
        const y2 = layout.cy - Math.sin(rad) * layout.r;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    // 바늘 — 0°=오른쪽(+x), 90°=위쪽(+y)
    const rad = (angle * Math.PI) / 180;
    const nx = layout.cx + Math.cos(rad) * (layout.r - 12);
    const ny = layout.cy - Math.sin(rad) * (layout.r - 12);
    ctx.strokeStyle = ui.selected;
    ctx.lineWidth = ui.strokeWidth.heavy;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(layout.cx, layout.cy);
    ctx.lineTo(nx, ny);
    ctx.stroke();

    // 글자와 중심점은 선언한 반지름을 따른다 — 기본 크기에 맞춰 고정하면 작은
    // 다이얼을 선언했을 때 글자가 상자를 벗어난다. 값은 `computeLayout` 이 낸 것을
    // 그대로 쓴다. 여기서 다시 세면 상자와 어긋난다.
    const { valueFont, labelFont, lead, gap } = layout.band;
    const k = layout.r / DEFAULT_DIAL_RADIUS;

    // 중심 point
    ctx.fillStyle = ui.text;
    ctx.beginPath();
    ctx.arc(layout.cx, layout.cy, Math.max(2, 4 * k), 0, Math.PI * 2);
    ctx.fill();

    // 큰 각도 숫자
    ctx.font = `600 ${valueFont}px ${ui.fontFamilyMono}`;
    ctx.fillStyle = ui.text;
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(angle)}°`, layout.cx, layout.cy + valueFont + lead);

    // 이름표 — 선언의 label, 없으면 프레임워크 문구
    ctx.font = `${labelFont}px ${ui.fontFamilyMono}`;
    ctx.fillStyle = ui.label;
    ctx.fillText(
      controllerText(rc.i18n, spec.label, 'ui.angleDial.label', 'ANGLE'),
      layout.cx,
      layout.cy + valueFont + labelFont + gap,
    );

    ctx.restore();
  }

  hitTest(input: PointerInput, ctx: ControllerEventContext, spec: AngleSpec): boolean {
    return hitDial(input, computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot, ctx.ui));
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: AngleSpec,
    state: BundleState,
  ): BundleState | null {
    const layout = computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot, ctx.ui);
    if (!hitDial(input, layout)) return null;
    this.dragging = true;
    return this.angleFromPointer(input, layout, spec, state);
  }

  onPointerMove(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: AngleSpec,
    state: BundleState,
  ): BundleState | null {
    if (!this.dragging) return null;
    return this.angleFromPointer(
      input,
      computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot, ctx.ui),
      spec,
      state,
    );
  }

  onPointerUp(): BundleState | null {
    this.dragging = false;
    return null;
  }

  private angleFromPointer(
    input: PointerInput,
    layout: Layout,
    spec: AngleSpec,
    state: BundleState,
  ): BundleState {
    const dx = input.px - layout.cx;
    const dy = layout.cy - input.py;
    // 반원 위쪽만 허용. 0°=오른쪽, 90°=위쪽 규약.
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    const [lo, hi] = spec.range ?? [0, 90];
    deg = Math.max(lo, Math.min(hi, deg));
    return writePath(state, spec.binds.angle, Math.round(deg));
  }
}
