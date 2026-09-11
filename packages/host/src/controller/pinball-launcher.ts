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

type PinballSpec = Extract<ControllerSpec, { type: 'pinball-launcher' }>;

/** 플런저 tube 레이아웃(스크린 좌표 기준). */
interface Layout {
  tubeX: number;
  tubeY: number;
  tubeW: number;
  tubeH: number;
}

/** 선언에 `size` 가 없을 때의 크기. 코어는 기본값만 준다 (원칙 7 ③). */
const DEFAULT_TUBE_WIDTH = 56;
const DEFAULT_TUBE_HEIGHT = 220;
/** 튜브가 캔버스 세로에서 양보하는 몫 — 위쪽 이름표와 아래 여백. */
const TUBE_HEIGHT_RESERVE = 120;
const TUBE_MARGIN = 32;
/** 자리를 선언하지 않은 발사대끼리의 가로 간격. */
const TUBE_STACK_GAP = 56;
/** 자리를 선언하지 않으면 오른쪽 아래에서 왼쪽으로 쌓인다. */
const DEFAULT_AT: ScreenAnchor = { screen: 'bottom-right' };

function computeLayout(
  spec: PinballSpec,
  viewport: Viewport,
  toScreen: (w: Vec2) => Vec2,
  slot: number,
): Layout {
  const [declW, declH] = spec.size ?? [DEFAULT_TUBE_WIDTH, DEFAULT_TUBE_HEIGHT];
  // 뷰포트 clamp 는 선언보다 뒤에 온다 — 임베드 높이는 마운트 뒤 바뀌지 않으므로
  // 넘치는 튜브는 자리를 넓히는 대신 담는다 (원칙 6).
  const tubeH = Math.min(declH, viewport.height - TUBE_HEIGHT_RESERVE);
  const at = spec.at ?? stackedAnchor(DEFAULT_AT, slot, [-(declW + TUBE_STACK_GAP), 0]);
  const box = placeBox(at, declW, tubeH, viewport, toScreen, TUBE_MARGIN);
  return { tubeX: box.x, tubeY: box.y, tubeW: box.w, tubeH: box.h };
}

function inTube(input: PointerInput, layout: Layout): boolean {
  return (
    input.px >= layout.tubeX - 12 &&
    input.px <= layout.tubeX + layout.tubeW + 12 &&
    input.py >= layout.tubeY - 24 &&
    input.py <= layout.tubeY + layout.tubeH + 8
  );
}

/**
 * 세로 튜브에서 아래로 드래그하면 플런저가 내려오고 내부 파워 fill 이 오른다.
 * 놓으면 current power(0..1) 를 powerRange 로 스케일해서 spec.binds.power 경로에
 * 쓰고, spec.binds.trigger 경로를 'flying' 으로 세팅해 발사.
 *
 * 선언 하나가 인스턴스 하나다 — 당긴 세기(`dragPower`)는 이 인스턴스의 것이라
 * 다른 발사대에 비치지 않는다. 자리는 선언의 `at`.
 */
export class PinballLauncherController
  implements ControllerImpl<PinballSpec>
{
  readonly type = 'pinball-launcher' as const;

  private dragging = false;
  private dragPower = 0;
  private dragStartY = 0;

  isDragging(): boolean {
    return this.dragging;
  }

  render(rc: ControllerRenderContext, spec: PinballSpec, state: BundleState): void {
    const { ctx, theme, viewport } = rc;
    const layout = computeLayout(spec, viewport, rc.toScreen, rc.slot);
    const phase = readPath<string>(state, spec.binds.trigger) ?? 'idle';
    const range = spec.powerRange ?? [1, 60];
    const storedV0 = Number(readPath<number>(state, spec.binds.power) ?? range[0]);
    const storedPower = (storedV0 - range[0]) / Math.max(1, range[1] - range[0]);
    const power = this.dragging ? this.dragPower : phase === 'idle' ? storedPower : 0;

    const ballR = 10;
    const plungerThickness = 6;
    const topInset = 12;
    const bottomInset = 12;
    const ballY = layout.tubeY + topInset + ballR + 2;
    const plungerRest = ballY + ballR + 6;
    const plungerFull = layout.tubeY + layout.tubeH - bottomInset - plungerThickness;
    const travelY = plungerFull - plungerRest;
    const plungerY = plungerRest + power * travelY;
    const cx = layout.tubeX + layout.tubeW / 2;

    ctx.save();

    // 튜브 외곽
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.line;
    ctx.fillStyle = theme.resolveColor('muted', 'subtle');
    this.roundRect(ctx, layout.tubeX, layout.tubeY, layout.tubeW, layout.tubeH, 12);
    ctx.fill();
    ctx.stroke();

    // 파워 게이지: 튜브 우측 내부 세로 바. 아래→위로 차오른다.
    const barW = 5;
    const barX = layout.tubeX + layout.tubeW - barW - 6;
    const barBottom = layout.tubeY + layout.tubeH - 8;
    const barTop = layout.tubeY + 8;
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barTop, barW, barBottom - barTop);
    const barH = (barBottom - barTop) * power;
    if (barH > 1) {
      ctx.fillStyle = this.powerColor(rc, power);
      ctx.fillRect(barX, barBottom - barH, barW, barH);
    }

    // 스프링 코일: 공 바로 아래 고정점 ↔ 플런저 상단. 드래그로 아래로 늘어남.
    const coilTop = ballY + ballR + 2;
    const coilBottom = plungerY;
    const coilHeight = coilBottom - coilTop;
    if (coilHeight > 4) {
      ctx.strokeStyle = theme.muted;
      ctx.lineWidth = 1.5;
      const coils = 6;
      ctx.beginPath();
      for (let i = 0; i <= coils; i++) {
        const t = i / coils;
        const y = coilTop + t * coilHeight;
        const zx = cx + (i % 2 === 0 ? -8 : 8);
        if (i === 0) ctx.moveTo(zx, y);
        else ctx.lineTo(zx, y);
      }
      ctx.stroke();
    }

    // 플런저 캡 — 공 아래, 드래그하면 아래로 이동.
    ctx.fillStyle = theme.foreground;
    ctx.fillRect(layout.tubeX + 4, plungerY, layout.tubeW - 8 - barW - 6, plungerThickness);

    // 공: 튜브 상단(출구)에 고정. idle 일 때만 표시.
    if (phase === 'idle') {
      ctx.fillStyle = theme.resolveColor('primary', 'strong');
      ctx.beginPath();
      ctx.arc(cx - barW / 2 - 1, ballY, ballR, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = theme.line;
      ctx.stroke();
    }

    // 라벨
    ctx.font = `11px ${theme.fontFamilyMono}`;
    ctx.fillStyle = theme.muted;
    ctx.textAlign = 'center';
    ctx.fillText(
      controllerText(rc.i18n, spec.label, 'ui.pinballLauncher.label', 'LAUNCHER · {power}%', {
        power: Math.round(power * 100),
      }),
      layout.tubeX + layout.tubeW / 2,
      layout.tubeY - 8,
    );

    ctx.restore();
  }

  hitTest(input: PointerInput, ctx: ControllerEventContext, spec: PinballSpec): boolean {
    return inTube(input, computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot));
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: PinballSpec,
    state: BundleState,
  ): BundleState | null {
    const layout = computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot);
    if (!inTube(input, layout)) return null;
    const phase = readPath<string>(state, spec.binds.trigger) ?? 'idle';
    if (phase !== 'idle') {
      // 비행·착지 중에 다시 당기면 재장전
      this.dragging = true;
      this.dragStartY = input.py;
      this.dragPower = 0;
      return this.reload(spec, state);
    }
    this.dragging = true;
    this.dragStartY = input.py;
    this.dragPower = 0;
    return null;
  }

  onPointerMove(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: PinballSpec,
  ): BundleState | null {
    if (!this.dragging) return null;
    const layout = computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot);
    const dy = input.py - this.dragStartY;
    const travel = layout.tubeH - 24;
    this.dragPower = Math.max(0, Math.min(1, dy / travel));
    return null;
  }

  onPointerUp(
    _input: PointerInput,
    _ctx: ControllerEventContext,
    spec: PinballSpec,
    state: BundleState,
  ): BundleState | null {
    if (!this.dragging) return null;
    const power = this.dragPower;
    this.dragging = false;
    this.dragPower = 0;
    if (power <= 0.02) return null; // 거의 안 당김 — 무시
    const [lo, hi] = spec.powerRange ?? [1, 60];
    const v0 = lo + power * (hi - lo);

    // launch.v0 경로에 v0 쓰고 phase='flying' 으로 전환. 그 외 상태는
    // Embed 쪽이 initialState 로 재초기화 해줘야 하므로 여기서는 launch/phase 만 건드림.
    let updated: BundleState = state;
    updated = writePath(updated, spec.binds.power, v0);
    updated = writePath(updated, spec.binds.trigger, 'flying');
    return updated;
  }

  private reload(spec: PinballSpec, state: BundleState): BundleState {
    return writePath(state, spec.binds.trigger, 'idle');
  }

  private powerColor(rc: ControllerRenderContext, power: number): string {
    // 0~.4 초록, .4~.75 노랑(accent), .75~1 빨강(primary)
    if (power < 0.4) return rc.theme.resolveColor('positive', 'strong');
    if (power < 0.75) return rc.theme.resolveColor('accent', 'strong');
    return rc.theme.resolveColor('primary', 'strong');
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
