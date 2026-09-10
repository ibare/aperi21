import type { BundleState, ControllerSpec, Vec2 } from '@aperi21/schema';
import type { Viewport } from '../camera';
import { placeBox, stackedAnchor, type ScreenAnchor } from './layout';
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

const PALETTE_MARGIN = 24;
const PALETTE_SWATCH = 56;
const PALETTE_GAP = 10;

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
): Palette {
  const n = spec.placeableTypes.length;
  const width = Math.max(PALETTE_SWATCH, n * (PALETTE_SWATCH + PALETTE_GAP) - PALETTE_GAP);
  const at = spec.at ?? stackedAnchor(DEFAULT_AT, slot, [0, PALETTE_SWATCH + PALETTE_STACK_GAP]);
  const box = placeBox(at, width, PALETTE_SWATCH, viewport, toScreen, PALETTE_MARGIN);
  const rects: PaletteRect[] = [];
  for (let i = 0; i < n; i++) {
    const type = spec.placeableTypes[i]!;
    const x = box.x + i * (PALETTE_SWATCH + PALETTE_GAP);
    if (x + PALETTE_SWATCH > viewport.width - PALETTE_MARGIN) break;
    rects.push({ index: i, type, x, y: box.y, w: PALETTE_SWATCH, h: PALETTE_SWATCH });
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

  render(rc: ControllerRenderContext, spec: PlacementSpec, _state: BundleState): void {
    const { ctx, theme, viewport } = rc;
    const palette = computePalette(spec, viewport, rc.toScreen, rc.slot);
    const rects = palette.rects;

    ctx.save();
    ctx.font = `10px ${theme.fontFamilyMono}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 헤더
    ctx.fillStyle = theme.muted;
    ctx.textAlign = 'left';
    ctx.fillText(
      controllerText(rc.i18n, spec.label, 'ui.placement.label', 'PLACE'),
      palette.x,
      palette.y - 6,
    );
    ctx.textAlign = 'center';

    for (const r of rects) {
      ctx.fillStyle = theme.resolveColor('muted', 'subtle');
      ctx.strokeStyle = theme.line;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(r.x, r.y, r.w, r.h);
      ctx.fill();
      ctx.stroke();

      // 타입 라벨
      ctx.fillStyle = theme.muted;
      ctx.fillText(r.type, r.x + r.w / 2, r.y + r.h - 12);

      // 초성 아이콘
      ctx.fillStyle = theme.foreground;
      ctx.font = `600 18px ${theme.fontFamilyMono}`;
      ctx.fillText(r.type.slice(0, 2).toUpperCase(), r.x + r.w / 2, r.y + r.h / 2 - 4);
      ctx.font = `10px ${theme.fontFamilyMono}`;
    }

    // 드래그 ghost
    if (this.dragging && this.ghostScreen && this.dragType) {
      const [gx, gy] = this.ghostScreen;
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = theme.resolveColor('accent', 'strong');
      ctx.beginPath();
      ctx.arc(gx, gy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = theme.foreground;
      ctx.fillText(this.dragType, gx, gy + 22);
    }

    ctx.restore();
  }

  hitTest(input: PointerInput, ctx: ControllerEventContext, spec: PlacementSpec): boolean {
    if (this.dragging) return true;
    return paletteHit(input, computePalette(spec, ctx.viewport, ctx.toScreen, ctx.slot).rects) !== null;
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: PlacementSpec,
  ): BundleState | null {
    const hit = paletteHit(input, computePalette(spec, ctx.viewport, ctx.toScreen, ctx.slot).rects);
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
    if (paletteHit(input, computePalette(spec, ctx.viewport, ctx.toScreen, ctx.slot).rects)) return null;

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
