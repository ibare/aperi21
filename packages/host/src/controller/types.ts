import type { BundleState, ControllerSpec, RenderContext } from '@aperi21/schema';
import type { Viewport } from '../camera';

/**
 * 포인터 이벤트를 소비하는 Controller 의 입력. PointerEvent 원형이 아닌,
 * 렌더 캔버스 로컬 좌표(px) + button 정보만 필요. React 쪽에서 변환 후 주입한다.
 */
export interface PointerInput {
  px: number;
  py: number;
  button: number;
  buttons: number;
}

/**
 * Controller 렌더·이벤트에 전달되는 컨텍스트. RenderContext 를 일부 재활용하지만
 * Controller 는 월드 좌표 프리미티브가 아니라 스크린 오버레이이므로 renderer
 * 가 보는 RenderContext 보다 좁은 편이 이상적. 지금은 공용으로 쓴다.
 */
export interface ControllerRenderContext extends RenderContext {
  viewport: Viewport;
}

/**
 * Controller 구현체. drag 중간 상태(예: dragStart 좌표) 는 인스턴스 내부에 저장할 수
 * 있지만 Bundle state 는 handler 반환값으로만 수정한다.
 */
export interface ControllerImpl<T extends ControllerSpec = ControllerSpec> {
  readonly type: T['type'];

  /** Canvas 에 컨트롤러 UI 를 그린다. */
  render(rc: ControllerRenderContext, spec: T, state: BundleState): void;

  /** 포인터가 이 컨트롤러의 히트 영역 안에 있는가. */
  hitTest(input: PointerInput, viewport: Viewport, spec: T, state: BundleState): boolean;

  onPointerDown(
    input: PointerInput,
    viewport: Viewport,
    spec: T,
    state: BundleState,
  ): Partial<BundleState> | null;

  onPointerMove(
    input: PointerInput,
    viewport: Viewport,
    spec: T,
    state: BundleState,
  ): Partial<BundleState> | null;

  onPointerUp(
    input: PointerInput,
    viewport: Viewport,
    spec: T,
    state: BundleState,
  ): Partial<BundleState> | null;

  /** 드래그 중인지(pointer capture 여부). */
  isDragging(): boolean;
}

export class ControllerRegistry {
  private readonly impls = new Map<ControllerSpec['type'], ControllerImpl>();

  register(impl: ControllerImpl): void {
    if (this.impls.has(impl.type)) {
      throw new Error(`[aperi21] controller '${impl.type}' already registered`);
    }
    this.impls.set(impl.type, impl);
  }

  get(type: ControllerSpec['type']): ControllerImpl | undefined {
    return this.impls.get(type);
  }

  list(): ControllerImpl[] {
    return [...this.impls.values()];
  }
}
