import type { BundleState, ControllerSpec, RenderContext, Vec2 } from '@aperi21/schema';
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
 * 포인터 이벤트 핸들러가 받는 컨텍스트. viewport 와 화면↔월드 변환 함수를 묶음.
 * placement 같이 월드 좌표에 값을 저장해야 하는 컨트롤러는 toWorld 를 사용한다.
 */
export interface ControllerEventContext {
  viewport: Viewport;
  toWorld(screen: Vec2): Vec2;
  toScreen(world: Vec2): Vec2;
  /** 격자 스냅 적용(비활성화 시 항등). */
  snapWorld(world: Vec2): Vec2;
  scale: number;
}

/**
 * Controller 구현체. drag 중간 상태(예: dragStart 좌표) 는 인스턴스 내부에 저장할 수
 * 있지만 Bundle state 는 handler 반환값으로만 수정한다. 반환값은 새 state 전체이며
 * (writePath 의 결과처럼) 호스트는 stateRef 를 그대로 교체한다. 변경이 없으면 null.
 */
export interface ControllerImpl<T extends ControllerSpec = ControllerSpec> {
  readonly type: T['type'];

  /** Canvas 에 컨트롤러 UI 를 그린다. */
  render(rc: ControllerRenderContext, spec: T, state: BundleState): void;

  /** 포인터가 이 컨트롤러의 히트 영역 안에 있는가. */
  hitTest(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: T,
    state: BundleState,
  ): boolean;

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: T,
    state: BundleState,
  ): BundleState | null;

  onPointerMove(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: T,
    state: BundleState,
  ): BundleState | null;

  onPointerUp(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: T,
    state: BundleState,
  ): BundleState | null;

  /** 드래그 중인지(pointer capture 여부). */
  isDragging(): boolean;
}

/** 조작기를 만드는 함수. 인스턴스는 임베드마다 따로 만든다 (C5). */
export type ControllerFactory = () => ControllerImpl;

/**
 * 조작기 등록부 — type → **만드는 법(팩토리)**.
 *
 * host 는 문서 전체가 공유한다(카탈로그 앱 하나, 외부 호스트는 에디터 하나). 조작기는
 * 끄는 중인지 · 당긴 힘 같은 상태를 가지므로, 여기 객체를 두면 한 문서의 모든 임베드가
 * 그 상태를 나눠 쓴다 — A 의 발사대를 당기면 B 의 발사대도 당겨진 모습으로 그려졌다.
 * 그래서 등록부는 만드는 법만 알고, 인스턴스는 임베드가 `createSet()` 으로 받는다.
 */
export class ControllerRegistry {
  private readonly factories = new Map<ControllerSpec['type'], ControllerFactory>();

  register(type: ControllerSpec['type'], factory: ControllerFactory): void {
    if (this.factories.has(type)) {
      throw new Error(`[aperi21] controller '${type}' already registered`);
    }
    this.factories.set(type, factory);
  }

  has(type: ControllerSpec['type']): boolean {
    return this.factories.has(type);
  }

  types(): ControllerSpec['type'][] {
    return [...this.factories.keys()];
  }

  /**
   * 임베드 하나가 쓸 조작기 묶음. 러너가 마운트마다 하나 만든다. 등록부를 매번
   * 조회하므로, 묶음을 만든 뒤에 등록된 type(늦게 로드된 조각)도 잡힌다.
   */
  createSet(): ControllerSet {
    return new ControllerSet((type) => this.factories.get(type));
  }
}

/**
 * 임베드 하나의 조작기 묶음. type 마다 처음 부를 때 만들고, 그 임베드 안에서는
 * 같은 인스턴스를 쓴다 — 드래그가 프레임을 넘어 이어져야 하기 때문이다.
 *
 * 자원을 갖지 않는다 — 조작기는 리스너 · 타이머를 걸지 않고 포인터는 러너가 넘긴다.
 * 조작기가 자원을 가지게 되면 여기에 거두는 자리를 두고 러너의 destroy 가 부른다.
 */
export class ControllerSet {
  private readonly made = new Map<ControllerSpec['type'], ControllerImpl>();

  constructor(private readonly lookup: (type: ControllerSpec['type']) => ControllerFactory | undefined) {}

  get(type: ControllerSpec['type']): ControllerImpl | undefined {
    const cached = this.made.get(type);
    if (cached) return cached;
    const factory = this.lookup(type);
    if (!factory) return undefined;
    const impl = factory();
    // 키와 구현이 어긋나면 다른 조작기가 그 선언을 받는다 — 타입도 통과하고 예외도 없다.
    if (impl.type !== type) {
      throw new Error(`[aperi21] controller factory for '${type}' made '${impl.type}'`);
    }
    this.made.set(type, impl);
    return impl;
  }
}
