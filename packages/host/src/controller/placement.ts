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

type PlacementSpec = Extract<ControllerSpec, { type: 'placement' }>;

interface PlacedItem {
  id?: string;
  type: string;
  /** 월드 좌표. */
  position: Vec2;
}

/** 선언에 `size` 가 없을 때의 견본 한 칸 크기. 코어는 기본값만 준다 (원칙 7 ③). */
const DEFAULT_SWATCH_W = 56;
const DEFAULT_SWATCH_H = 56;
const PALETTE_GAP = 10;
/** 견본 칸의 기호 글자 크기. 칸 크기를 따라가는 이 조작기 고유 치수다. */
const SWATCH_GLYPH_SIZE = 18;

interface PaletteRect {
  index: number;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 자리를 선언하지 않은 팔레트끼리의 세로 간격(이름표 한 줄 포함). */
const PALETTE_STACK_GAP = 24;
/** 자리를 선언하지 않으면 왼쪽 위에서 아래로 쌓인다. */
const DEFAULT_AT: ScreenAnchor = { screen: 'top-left' };

interface Palette {
  /** 팔레트 상자의 좌상단 — 이름표가 그 위에 붙는다. */
  x: number;
  y: number;
  rects: PaletteRect[];
}

function computePalette(
  spec: PlacementSpec,
  viewport: Viewport,
  toScreen: (w: Vec2) => Vec2,
  slot: number,
  ui: UiTheme,
): Palette {
  const n = spec.placeableTypes.length;
  const [sw, sh] = spec.size ?? [DEFAULT_SWATCH_W, DEFAULT_SWATCH_H];
  const width = Math.max(sw, n * (sw + PALETTE_GAP) - PALETTE_GAP);
  const at = spec.at ?? stackedAnchor(DEFAULT_AT, slot, [0, sh + PALETTE_STACK_GAP]);
  const box = placeBox(at, width, sh, viewport, toScreen, ui.layout.margin);
  const rects: PaletteRect[] = [];
  for (let i = 0; i < n; i++) {
    const type = spec.placeableTypes[i]!;
    const x = box.x + i * (sw + PALETTE_GAP);
    if (x + sw > viewport.width - ui.layout.margin) break;
    rects.push({ index: i, type, x, y: box.y, w: sw, h: sh });
  }
  return { x: box.x, y: box.y, rects };
}

function paletteHit(input: PointerInput, rects: PaletteRect[]): PaletteRect | null {
  for (const r of rects) {
    if (
      input.px >= r.x &&
      input.px <= r.x + r.w &&
      input.py >= r.y &&
      input.py <= r.y + r.h
    ) {
      return r;
    }
  }
  return null;
}

function readPositions(state: BundleState, path: string): PlacedItem[] {
  const raw = readPath<unknown>(state, path);
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (it): it is PlacedItem =>
      !!it &&
      typeof it === 'object' &&
      typeof (it as PlacedItem).type === 'string' &&
      Array.isArray((it as PlacedItem).position) &&
      (it as PlacedItem).position.length === 2,
  );
}

/**
 * 팔레트에서 소자를 끌어와 월드 좌표로 내려놓는 컨트롤러. binds.positions 경로에
 * { type, position: [wx,wy] } 배열을 append.
 *
 * docs/04 §Controller, docs/08 §Phase4 요구:
 *   - placeableTypes 를 팔레트 스와치로 렌더.
 *   - 드래그 ghost 표시.
 *   - drop 시 screen→world 변환 후 배열에 추가.
 */
export class PlacementController implements ControllerImpl<PlacementSpec> {
  readonly type = 'placement' as const;

  private dragging = false;
  private dragType: string | null = null;
  private ghostScreen: Vec2 | null = null;

  isDragging(): boolean {
    return this.dragging;
  }

  /** 마지막 렌더의 자리. */
  private box: Box | null = null;

  /** 마지막 렌더에서 차지한 화면 상자. 자동 프레이밍이 이만큼을 비운다. */
  screenBounds(): Box | null {
    return this.box;
  }


  render(rc: ControllerRenderContext, spec: PlacementSpec, _state: BundleState): void {
    const { ctx, ui, viewport } = rc;
    const palette = computePalette(spec, viewport, rc.toScreen, rc.slot, rc.ui);
    const rects = palette.rects;
    this.box = rects.length
      ? {
          x: palette.x,
          y: palette.y,
          w: rects[rects.length - 1]!.x + rects[rects.length - 1]!.w - palette.x,
          h: rects[0]!.h,
        }
      : null;

    ctx.save();
    ctx.font = `${ui.fontSize.small}px ${ui.fontFamilyMono}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 헤더
    ctx.fillStyle = ui.label;
    ctx.textAlign = 'left';
    ctx.fillText(
      controllerText(rc.i18n, spec.label, 'ui.placement.label', 'PLACE'),
      palette.x,
      palette.y - 6,
    );
    ctx.textAlign = 'center';

    for (const r of rects) {
      ctx.fillStyle = ui.surface;
      ctx.strokeStyle = ui.border;
      ctx.lineWidth = ui.strokeWidth.regular;
      ctx.beginPath();
      ctx.rect(r.x, r.y, r.w, r.h);
      ctx.fill();
      ctx.stroke();

      // 타입 라벨
      ctx.fillStyle = ui.label;
      ctx.fillText(r.type, r.x + r.w / 2, r.y + r.h - 12);

      // 초성 아이콘
      ctx.fillStyle = ui.text;
      ctx.font = `600 ${SWATCH_GLYPH_SIZE}px ${ui.fontFamilyMono}`;
      ctx.fillText(r.type.slice(0, 2).toUpperCase(), r.x + r.w / 2, r.y + r.h / 2 - 4);
      ctx.font = `${ui.fontSize.small}px ${ui.fontFamilyMono}`;
    }

    // 드래그 ghost
    if (this.dragging && this.ghostScreen && this.dragType) {
      const [gx, gy] = this.ghostScreen;
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = ui.toggled;
      ctx.beginPath();
      ctx.arc(gx, gy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = ui.text;
      ctx.fillText(this.dragType, gx, gy + 22);
    }

    ctx.restore();
  }

  hitTest(input: PointerInput, ctx: ControllerEventContext, spec: PlacementSpec): boolean {
    if (this.dragging) return true;
    return paletteHit(input, computePalette(spec, ctx.viewport, ctx.toScreen, ctx.slot, ctx.ui).rects) !== null;
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: PlacementSpec,
  ): BundleState | null {
    const hit = paletteHit(input, computePalette(spec, ctx.viewport, ctx.toScreen, ctx.slot, ctx.ui).rects);
    if (!hit) return null;
    this.dragging = true;
    this.dragType = hit.type;
    this.ghostScreen = [input.px, input.py];
    return null;
  }

  onPointerMove(input: PointerInput): BundleState | null {
    if (!this.dragging) return null;
    this.ghostScreen = [input.px, input.py];
    return null;
  }

  onPointerUp(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: PlacementSpec,
    state: BundleState,
  ): BundleState | null {
    if (!this.dragging || !this.dragType) return null;
    const type = this.dragType;
    this.dragging = false;
    this.dragType = null;
    this.ghostScreen = null;

    // 팔레트 위에서 놓으면 취소
    if (paletteHit(input, computePalette(spec, ctx.viewport, ctx.toScreen, ctx.slot, ctx.ui).rects)) return null;

    const world = ctx.toWorld([input.px, input.py]);
    const snapped = ctx.snapWorld(world);
    const existing = readPositions(state, spec.binds.positions);
    const placed: PlacedItem = {
      id: `${type}_${existing.length + 1}`,
      type,
      position: snapped,
    };
    const next = [...existing, placed];
    return writePath(state, spec.binds.positions, next);
  }
}
