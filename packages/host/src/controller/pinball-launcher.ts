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
/** 자리를 선언하지 않은 발사대끼리의 가로 간격. */
const TUBE_STACK_GAP = 56;
/** 자리를 선언하지 않으면 오른쪽 아래에서 왼쪽으로 쌓인다. */
const DEFAULT_AT: ScreenAnchor = { screen: 'bottom-right' };

function computeLayout(
  spec: PinballSpec,
  viewport: Viewport,
  toScreen: (w: Vec2) => Vec2,
  slot: number,
  ui: UiTheme,
): Layout {
  const [declW, declH] = spec.size ?? [DEFAULT_TUBE_WIDTH, DEFAULT_TUBE_HEIGHT];
  // 뷰포트 clamp 는 선언보다 뒤에 온다 — 임베드 높이는 마운트 뒤 바뀌지 않으므로
  // 넘치는 튜브는 자리를 넓히는 대신 담는다 (원칙 6).
  const tubeH = Math.min(declH, viewport.height - TUBE_HEIGHT_RESERVE);
  const at = spec.at ?? stackedAnchor(DEFAULT_AT, slot, [-(declW + TUBE_STACK_GAP), 0]);
  const box = placeBox(at, declW, tubeH, viewport, toScreen, ui.layout.margin);
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

  /** 마지막 렌더의 자리. */
  private box: Box | null = null;

  /** 마지막 렌더에서 차지한 화면 상자. 자동 프레이밍이 이만큼을 비운다. */
  screenBounds(): Box | null {
    return this.box;
  }


  render(rc: ControllerRenderContext, spec: PinballSpec, state: BundleState): void {
    const { ctx, ui, viewport } = rc;
    const layout = computeLayout(spec, viewport, rc.toScreen, rc.slot, rc.ui);
    this.box = { x: layout.tubeX, y: layout.tubeY, w: layout.tubeW, h: layout.tubeH };
    const phase = readPath<string>(state, spec.binds.trigger) ?? 'idle';
    /**
     * **끄는 동안만 당겨진다.** 손을 떼면 0 으로 돌아온다.
     *
     * 전에는 쉬는 동안 `binds.power` 에 남은 값을 되돌려 당겨진 채로 열렸다. 그것은
     * 마지막 설정을 붙들고 있는 슬라이더의 사고방식이고, 플런저는 **놓으면 튀어나가
     * 제자리로 돌아오는 물건**이라 은유가 어긋난다. 도착한 독자에게 "누가 이미 당겨
     * 놓았다" 고 말하는 셈이라, 당기는 일이 자기 몫이라는 것도 흐려진다.
     *
     * 발사 속도 자체는 `binds.power` 에 그대로 남는다 — 조각의 궤적이 그것을 쓴다.
     * 여기서 달라지는 것은 발사대가 무엇을 보이느냐뿐이다.
     */
    const power = this.dragging ? this.dragPower : 0;

    const ballR = 10;
    const plungerThickness = 6;
    const topInset = 12;
    const bottomInset = 12;
    /**
     * 완전히 눌려도 남기는 스프링 높이(px). 0 이 되면 **무엇이 발판을 밀어 올리는지**
     * 화면에서 사라진다.
     */
    const springMin = 18;
    /**
     * 발판이 가장 위에 있을 때의 자리 — 공이 튜브 꼭대기에 닿는다.
     *
     * 공은 **발판에 얹혀 함께 내려온다** (`ballY` 는 아래에서 `plungerY` 로 낸다).
     * 공중에 붙박아 두면 발판만 혼자 물러나, 무엇이 무엇을 미는지가 사라진다.
     */
    const plungerRest = layout.tubeY + topInset + ballR * 2;
    /** 스프링이 받치고 선 바닥. 여기는 움직이지 않는다 — 눌리는 쪽은 위다. */
    const springBase = layout.tubeY + layout.tubeH - bottomInset;
    const plungerFull = springBase - springMin - plungerThickness;
    // 낮은 뷰포트에서 튜브가 짧아지면 음수가 되어 당길수록 발판이 **위로** 간다.
    const travelY = Math.max(0, plungerFull - plungerRest);
    const plungerY = plungerRest + power * travelY;
    /** 발판 윗면에 얹힌 공의 중심. 당기면 발판을 따라 내려온다. */
    const ballY = plungerY - ballR;
    const cx = layout.tubeX + layout.tubeW / 2;

    ctx.save();

    // 튜브 외곽
    ctx.lineWidth = ui.strokeWidth.thick;
    ctx.strokeStyle = ui.border;
    ctx.fillStyle = ui.surface;
    this.roundRect(ctx, layout.tubeX, layout.tubeY, layout.tubeW, layout.tubeH, 12);
    ctx.fill();
    ctx.stroke();

    // 파워 게이지: 튜브 우측 내부 세로 바. 아래→위로 차오른다.
    const barW = 5;
    const barX = layout.tubeX + layout.tubeW - barW - 6;
    const barBottom = layout.tubeY + layout.tubeH - 8;
    const barTop = layout.tubeY + 8;
    ctx.strokeStyle = ui.border;
    ctx.lineWidth = ui.strokeWidth.thin;
    ctx.strokeRect(barX, barTop, barW, barBottom - barTop);
    const barH = (barBottom - barTop) * power;
    if (barH > 1) {
      ctx.fillStyle = this.powerColor(rc, power);
      ctx.fillRect(barX, barBottom - barH, barW, barH);
    }

    // 스프링 코일: **발판 아래**, 바닥에 받쳐 있다. 실제 플런저가 그렇고, 그래야
    // 당길 때 눌리는 것이 보인다.
    //
    // 코일 수는 고정이고 구간만 짧아진다 — 그래서 **조밀해지는 일이 저절로 일어난다.**
    // 감는 수를 파워에 따라 바꾸면 "눌렸다" 가 아니라 "다른 스프링" 이 된다.
    const coilTop = plungerY + plungerThickness;
    const coilBottom = springBase;
    const coilHeight = coilBottom - coilTop;
    if (coilHeight > 4) {
      ctx.strokeStyle = ui.label;
      ctx.lineWidth = ui.strokeWidth.regular;
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

    // 플런저 캡 — 공 아래. 당기면 스프링을 누르며 내려간다.
    const capX = layout.tubeX + 4;
    const capW = layout.tubeW - 8 - barW - 6;
    ctx.fillStyle = ui.text;
    ctx.fillRect(capX, plungerY, capW, plungerThickness);


    // 공: 발판 위에 얹혀 함께 움직인다. idle 일 때만 — 날아간 뒤에는 튜브가 비어야 한다.
    if (phase === 'idle') {
      ctx.fillStyle = ui.selected;
      ctx.beginPath();
      ctx.arc(cx - barW / 2 - 1, ballY, ballR, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = ui.strokeWidth.thin;
      ctx.strokeStyle = ui.border;
      ctx.stroke();
    }

    // 라벨
    ctx.font = `${ui.fontSize.regular}px ${ui.fontFamilyMono}`;
    ctx.fillStyle = ui.label;
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
    return inTube(input, computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot, ctx.ui));
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: PinballSpec,
    state: BundleState,
  ): BundleState | null {
    const layout = computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot, ctx.ui);
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
    const layout = computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot, ctx.ui);
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
    // 당길수록 짙어진다. 옅음 → 함께 켜진 색 → 고른 색.
    //
    // 예전에는 초록 → 노랑 → 빨강이었는데 그것은 **그림의 역할색**(`positive`)을
    // 조작기가 빌려 쓴 것이었다. 두 축을 가른 뒤로 조작기는 제 축의 색만 쓴다.
    if (power < 0.4) return rc.ui.track;
    if (power < 0.75) return rc.ui.toggled;
    return rc.ui.selected;
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
