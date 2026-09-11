import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type {
  Bundle,
  BundleState,
  EnvironmentDef,
  MeasureService,
  Primitive,
  RenderContext,
  StageDef,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  BackgroundParticleSystem,
  evaluateTimeline,
  orderForDrawing,
  preprocessScene,
  withCaption,
  type Camera,
  type ControllerEventContext,
  type HostI18n,
  type ResolvedController,
  type Host,
  type TimeEngine,
  type Viewport,
  type PointerInput,
  visibleControllers,
} from '@aperi21/host';
import { resolveBackgroundKind } from './backgroundKind';

/**
 * 오버레이가 점유하는 픽셀. fitToBounds 가 이만큼을 viewport 에서 빼고 스케일을
 * 내므로, 자동 프레이밍이 오버레이 아래로 그림을 밀어 넣지 않는다.
 *
 * **켜진 것만 센다.** 예전에는 `{60,130,180,110}` 한 벌이 고정이었는데, 그것은
 * 발사체 화면(각도 다이얼 + 핀볼 런처 + 파라미터 패널)에 맞춘 값이었다. 그 화면이
 * 아닌 조각들은 중심 아래 48px 만 남아 12~13배로 축소됐다.
 *
 * 각 값은 그 오버레이가 실제로 차지하는 크기다. C2 「기본값도 named 상수로 한
 * 곳에」 — 여기가 그 한 곳이다.
 */
const OVERLAY_EXTENT = {
  /** 어느 변에나 두는 최소 숨 쉴 자리. */
  base: 24,
  /** ViewTabs — 좌상단, top:12 + 높이 약 34. */
  viewTabs: 36,
  /** ParamPanel — 좌측, minWidth 240 중 그림이 양보할 만큼. */
  paramPanel: 156,
  /** angle-dial — 하단-좌에 그려지는 컨트롤러. */
  angleDial: 106,
  /** pinball-launcher — 하단-우 튜브. */
  pinballLauncher: 86,
} as const;

/** 지금 켜져 있는 오버레이만으로 프레이밍 여백을 낸다. */
function overlayMargins(
  hasViewTabs: boolean,
  hasParamPanel: boolean,
  controllerTypes: ReadonlySet<string>,
): { top: number; bottom: number; left: number; right: number } {
  const base = OVERLAY_EXTENT.base;
  const dial = controllerTypes.has('angle-dial');
  const pinball = controllerTypes.has('pinball-launcher');
  return {
    top: base + (hasViewTabs ? OVERLAY_EXTENT.viewTabs : 0),
    bottom: base + (dial || pinball ? OVERLAY_EXTENT.angleDial : 0),
    left: base + (hasParamPanel ? OVERLAY_EXTENT.paramPanel : 0),
    right: base + (pinball ? OVERLAY_EXTENT.pinballLauncher : 0),
  };
}

export interface BundleCanvasProps<T extends BundleState = BundleState> {
  host: Host;
  /**
   * 문안 조회기. Embed 가 **하나만** 만들어 오버레이 UI 와 캔버스(렌더러 · 조작기
   * 이름표)에 같은 것을 넘긴다 — 각자 만들면 저작자 문안이 적용되는 곳이 갈린다 (C1).
   */
  i18n: HostI18n;
  /** 이 임베드 전용 카메라. 같은 host 를 공유하는 다른 임베드와 분리되도록 Embed 가 주입. */
  camera: Camera;
  /** 이 임베드 전용 시간 엔진(번들 timeModel 기반). 마찬가지로 Embed 가 주입. */
  timeEngine: TimeEngine;
  bundle: Bundle<T>;
  stage: StageDef;
  view: ViewDef;
  environments: EnvironmentDef[];
  stateRef: React.MutableRefObject<T>;
  onStateChange(next: T): void;
  onDerived(values: Record<string, number> | null): void;
  registerResetCamera?(fn: () => void): void;
}

function createMeasure(ctx: CanvasRenderingContext2D, fontFamily: string): MeasureService {
  return {
    textWidth(text, fontSize) {
      ctx.save();
      ctx.font = `${fontSize}px ${fontFamily}`;
      const w = ctx.measureText(text).width;
      ctx.restore();
      return w;
    },
    textBounds(text, fontSize) {
      return { width: this.textWidth(text, fontSize), height: fontSize * 1.2 };
    },
  };
}

export function BundleCanvas<T extends BundleState>(props: BundleCanvasProps<T>) {
  const {
    host,
    i18n: i18nProp,
    camera,
    timeEngine,
    bundle,
    stage,
    view,
    environments,
    stateRef,
    onStateChange,
    onDerived,
    registerResetCamera,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 조각이 가져온 자유 렌더러 흡수. 렌더 중에 동기로 해야 첫 프레임에 이미
  // 등록돼 있다. 같은 번들을 두 번 흡수하지 않는 것은 host 가 보장한다.
  host.adoptBundleRenderers(bundle as Bundle);

  // 최신 props 를 RAF 루프에서 읽기 위한 refs
  const bundleRef = useRef(bundle);
  const stageRef = useRef(stage);
  const viewRef = useRef(view);
  const envRef = useRef(environments);
  const onStateChangeRef = useRef(onStateChange);
  const onDerivedRef = useRef(onDerived);
  const i18nRef = useRef(i18nProp);
  i18nRef.current = i18nProp;
  bundleRef.current = bundle;
  stageRef.current = stage;
  viewRef.current = view;
  envRef.current = environments;
  onStateChangeRef.current = onStateChange;
  onDerivedRef.current = onDerived;

  // 카메라 리셋을 상위로 노출
  useEffect(() => {
    registerResetCamera?.(() => camera.reset());
  }, [camera, registerResetCamera]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const particles = new BackgroundParticleSystem();
    /**
     * 프리미티브의 프레임 간 상태. 이 임베드 전용이라 같은 조각이 한 문서에
     * 여러 번 박혀도 서로 섞이지 않는다 (원칙 6).
     */
    const primitiveStore = new Map<string, unknown>();
    /**
     * 이 임베드 전용 조작기 묶음. host 는 문서 전체가 공유하므로 조작기 인스턴스를
     * host 에 두면 임베드끼리 드래그 상태가 섞인다 (C5). 묶음은 자원을 갖지 않는다.
     */
    const controllers = host.controllerRegistry.createSet();
    timeEngine.reset();
    timeEngine.start();

    let disposed = false;
    let rafId = 0;
    let lastT = performance.now();
    /**
     * 손가락(포인터)마다의 드래그. 한 손가락이 한 인스턴스를 잡는다 — 두 손가락이 두
     * 조작기를 동시에 끌 수 있고, 두 번째 손가락이 첫 번째의 드래그를 가로채지 않는다.
     */
    const sessions = new Map<number, ResolvedController>();
    // 비-컨트롤러 영역을 드래그하면 카메라 팬. 의도하지 않은 클릭(미세 흔들림 포함)
    // 이 userAdjusted 를 세팅해 auto-framing 을 영구 동결하지 않도록 5px deadzone
    // 이후에만 pan 을 시작한다. 조작기를 잡지 않은 손가락이 하나일 때만.
    let panning: {
      pointerId: number;
      startPx: number;
      startPy: number;
      lastPx: number;
      lastPy: number;
      active: boolean;
    } | null = null;
    // 재발사(isTerminated true→false) 감지를 위한 직전 terminated 상태.
    let wasTerminated = bundleRef.current.isTerminated?.(stateRef.current) ?? false;

    function sizeCanvas(): Viewport {
      const rect = canvas!.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      if (canvas!.width !== w * dpr || canvas!.height !== h * dpr) {
        canvas!.width = w * dpr;
        canvas!.height = h * dpr;
      }
      return { width: w, height: h };
    }

    function toPointerInput(e: PointerEvent): PointerInput {
      const rect = canvas!.getBoundingClientRect();
      return {
        px: e.clientX - rect.left,
        py: e.clientY - rect.top,
        button: e.button,
        buttons: e.buttons,
      };
    }

    function makeEventCtx(vp: Viewport, slot: number): ControllerEventContext {
      return {
        viewport: vp,
        toWorld: (s: Vec2) => camera.toWorld(s, vp),
        toScreen: (w: Vec2) => camera.toScreen(w, vp),
        snapWorld: (w: Vec2) => camera.snapWorld(w),
        scale: camera.scale,
        slot,
      };
    }

    function findControllerAt(input: PointerInput, viewport: Viewport): ResolvedController | null {
      const visible = visibleControllers(
        bundleRef.current.controllers,
        stateRef.current as BundleState,
      );
      // 다른 손가락이 잡고 있는 인스턴스는 건너뛴다 — 두 손가락이 한 조작기를 다투지 않게.
      const held = new Set([...sessions.values()].map((s) => s.spec.id));
      for (const r of controllers.resolve(visible)) {
        if (held.has(r.spec.id)) continue;
        if (r.impl.hitTest(input, makeEventCtx(viewport, r.slot), r.spec, stateRef.current as BundleState)) {
          return r;
        }
      }
      return null;
    }

    function applyPartial(patch: unknown) {
      if (patch === null || patch === undefined) return;
      // 현재 구현은 writePath 로 전체 state 를 반환 — 그대로 교체.
      const next = patch as T;
      stateRef.current = next;
      onStateChangeRef.current(next);
    }

    function onPointerDown(e: PointerEvent) {
      const vp = sizeCanvas();
      const input = toPointerInput(e);
      const hit = findControllerAt(input, vp);
      if (hit) {
        canvas!.setPointerCapture(e.pointerId);
        sessions.set(e.pointerId, hit);
        const patch = hit.impl.onPointerDown(
          input,
          makeEventCtx(vp, hit.slot),
          hit.spec,
          stateRef.current as BundleState,
        );
        applyPartial(patch);
        return;
      }
      // 컨트롤러 외 영역 → 카메라 팬 후보 (왼쪽/중간 버튼). 실제 pan 은
      // deadzone 을 넘은 뒤에만 시작 — 단순 클릭이 auto-framing 을 끄지 않도록.
      if (sessions.size === 0 && !panning && (e.button === 0 || e.button === 1)) {
        canvas!.setPointerCapture(e.pointerId);
        panning = {
          pointerId: e.pointerId,
          startPx: input.px,
          startPy: input.py,
          lastPx: input.px,
          lastPy: input.py,
          active: false,
        };
      }
    }
    function onPointerMove(e: PointerEvent) {
      const vp = sizeCanvas();
      const input = toPointerInput(e);
      const session = sessions.get(e.pointerId);
      if (session) {
        const patch = session.impl.onPointerMove(
          input,
          makeEventCtx(vp, session.slot),
          session.spec,
          stateRef.current as BundleState,
        );
        applyPartial(patch);
        return;
      }
      if (panning && panning.pointerId === e.pointerId) {
        if (!panning.active) {
          // Deadzone — 5px 누적 이동 전까지는 pan 을 시작하지 않는다.
          const ddx = input.px - panning.startPx;
          const ddy = input.py - panning.startPy;
          if (ddx * ddx + ddy * ddy < 25) return;
          panning.active = true;
          panning.lastPx = input.px;
          panning.lastPy = input.py;
          return;
        }
        const dxScreen = input.px - panning.lastPx;
        const dyScreen = input.py - panning.lastPy;
        if (dxScreen === 0 && dyScreen === 0) return;
        panning.lastPx = input.px;
        panning.lastPy = input.py;
        // 스크린 델타 → 월드 델타. Camera.pan 이 userAdjusted=true 로 전환해
        // 이후 자동 fitToBounds 를 멈춘다(재발사 시 자동 해제).
        const dxWorld = dxScreen / camera.scale;
        const dyWorld = -dyScreen / camera.scale; // 스크린 y 는 아래가 +
        camera.pan(dxWorld, dyWorld);
      }
    }
    function onPointerUp(e: PointerEvent) {
      const vp = sizeCanvas();
      const input = toPointerInput(e);
      const session = sessions.get(e.pointerId);
      if (session) {
        const patch = session.impl.onPointerUp(
          input,
          makeEventCtx(vp, session.slot),
          session.spec,
          stateRef.current as BundleState,
        );
        applyPartial(patch);
        sessions.delete(e.pointerId);
        try {
          canvas!.releasePointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
        return;
      }
      if (panning && panning.pointerId === e.pointerId) {
        panning = null;
        try {
          canvas!.releasePointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
      }
    }
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const vp = sizeCanvas();
      const rect = canvas!.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const worldCenter = camera.toWorld([sx, sy], vp);
      // deltaY<0 확대(휠 업), >0 축소. 한 틱당 약 10% 변화.
      const factor = Math.exp(-e.deltaY * 0.0015);
      camera.zoom(factor, worldCenter);
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    const frame = (now: number) => {
      if (disposed) return;
      const realDt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      const vp = sizeCanvas();
      const theme = host.theme;
      const bundle = bundleRef.current;
      // 저작자 문안(1층)을 얹은 조회기. Embed 의 오버레이 UI 와 같은 것을 써야
      // 한 화면에서 문안 출처가 갈리지 않는다 (C1).
      const i18n = i18nRef.current;
      const stage = stageRef.current;
      const view = viewRef.current;
      const envs = envRef.current;

      // 시간표 단계의 재생 속도. 시간표가 없으면 1 — 앞 번들의 느린 속도가 남지 않게.
      timeEngine.setSpeed(
        bundle.schema.timeline
          ? evaluateTimeline(bundle.schema.timeline, timeEngine.currentTime).timeScale
          : 1,
      );

      // 물리 스텝 — 종료되지 않았고 timeEngine 이 running 일 때만
      const simDt = timeEngine.tick(realDt);
      if (simDt > 0) {
        const nextState = bundle.step({ state: stateRef.current, dt: simDt, stage, environments: envs });
        if (nextState !== stateRef.current) {
          stateRef.current = nextState;
          onStateChangeRef.current(nextState);
        }
        if (bundle.isTerminated?.(nextState)) {
          timeEngine.markTerminated();
        }
      }

      // 재발사 감지: isTerminated true→false 전이 시 사용자 수동 조정 해제.
      const isTerm = bundle.isTerminated?.(stateRef.current) ?? false;
      if (wasTerminated && !isTerm) camera.userAdjusted = false;
      wasTerminated = isTerm;

      // 이 프레임에 실제로 그려질 컨트롤러. 아래 렌더 루프와 프레이밍이 같은
      // 목록을 봐야 여백과 그림이 어긋나지 않는다.
      const visibleCtrls = visibleControllers(bundle.controllers, stateRef.current as BundleState);
      // 여백은 기본 자리에 놓인 조작기만 센다 — 자리(`at`)를 선언한 것은 저작자가
      // 그림과 겹치지 않게 놓은 것이다.
      const controllerTypes = new Set(
        visibleCtrls
          .filter(({ spec }) => !('at' in spec && spec.at))
          .map(({ spec }) => spec.type),
      );

      // 카메라 자동 프레이밍 — bundle 이 제공한 bounds 로 **매 프레임 직접 스냅**.
      // trajectory 기반 bounds 가 프레임마다 자라는 속도 자체가 camera flow.
      if (!camera.userAdjusted && bundle.boundsHint) {
        const bounds = bundle.boundsHint(stateRef.current, stage);
        camera.fitToBounds(bounds, vp, {
          padding: 12,
          screenMargins: overlayMargins(
            // ViewTabs 는 고를 뷰가 있을 때만 뜬다 (embed/ViewTabs.tsx).
            bundle.schema.views.length > 1,
            (bundle.schema.parameters?.length ?? 0) > 0,
            controllerTypes,
          ),
        });
      }

      // 배경 입자
      particles.setKind(resolveBackgroundKind(stage, envs), vp);
      particles.update(realDt, vp);

      // 캔버스 클리어 + 배경
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, vp.width, vp.height);
      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, vp.width, vp.height);

      // 배경 입자
      particles.render(ctx, theme);

      // 거리 축 그리드. 선언이 켜야 나온다 — 그리드는 중립적인 장식이 아니라
      // "여기서 거리를 재라" 는 지시다 (원칙 4, R9).
      if (bundle.schema.chrome?.grid) drawAxisGrid(ctx, vp, camera, theme);

      // Scene Graph 렌더. 시간표와 캡션은 선언이다 — 시계는 이 임베드의 시간 엔진이라
      // 리셋·스테이지 전환·검사 시각 이동을 그대로 따른다.
      const timeline = bundle.schema.timeline
        ? evaluateTimeline(bundle.schema.timeline, timeEngine.currentTime)
        : undefined;
      const sceneGraph = withCaption(
        bundle.scene({
          state: stateRef.current,
          view,
          stage,
          environments: envs,
          timeline,
        }),
        bundle.schema,
        timeline,
      );
      const { refs, orderedScene } = preprocessScene(sceneGraph);
      const sortedScene = orderForDrawing(orderedScene, bundle.schema.drawOrder, (t) =>
        host.rendererRegistry.getZ(t),
      );

      const rc: RenderContext = {
        ctx,
        store: <T,>(key: string, init: () => T): T => {
          if (!primitiveStore.has(key)) primitiveStore.set(key, init());
          return primitiveStore.get(key) as T;
        },
        toScreen: (world: Vec2) => camera.toScreen(world, vp),
        toWorld: (screen: Vec2) => camera.toWorld(screen, vp),
        scale: camera.scale,
        viewport: vp,
        theme,
        i18n,
        time: timeEngine.currentTime,
        deltaTime: simDt,
        scene: refs,
        measure: createMeasure(ctx, theme.fontFamily),
      };

      // Plugin onFrame 훅 — 렌더 직전에 호출해 Plugin 이 현재 프레임 컨텍스트를 볼 수 있게 함.
      host.pluginManager.runFrameHooks(rc);

      for (const p of sortedScene as Primitive[]) {
        const renderer = host.rendererRegistry.get(p.type);
        if (!renderer) continue;
        renderer(rc, p, refs);
      }

      // Controller 렌더 (스크린 오버레이) — 목록은 프레이밍과 같은 것을 쓴다.
      for (const r of controllers.resolve(visibleCtrls)) {
        r.impl.render({ ...rc, viewport: vp, slot: r.slot }, r.spec, stateRef.current as BundleState);
      }

      ctx.restore();

      // 파생값 발행
      const dv = bundle.derivedValues?.(stateRef.current, stage) ?? null;
      onDerivedRef.current(dv);

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      // 열린 드래그를 닫는다 — 잡은 손가락의 캡처를 풀고 세션을 비운다 (C5).
      for (const pointerId of sessions.keys()) {
        try {
          canvas.releasePointerCapture(pointerId);
        } catch {
          /* noop */
        }
      }
      sessions.clear();
      // 프리미티브 상태도 함께 거둔다 — destroy 는 관찰 가능한 뒷일을 남기지
      // 않는다 (원칙 6, C5).
      primitiveStore.clear();
    };
  }, [host, camera, timeEngine]);

  const style: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'block',
    touchAction: 'none',
  };
  return <canvas ref={canvasRef} style={style} />;
}

/**
 * 월드 좌표 m 단위 거리 축 그리드. 레퍼런스 GIF 와 동일한 스타일:
 *   - 얇은 수평/수직선이 2·4·5·10 m 등 가독 스텝으로 깔림
 *   - 각 세로선에는 X 거리(예: `-4m`, `8m`)를 Y=0 축 아래에 라벨
 *   - 각 가로선에는 Y 높이(예: `2m`, `10m`)를 X=0 축 오른쪽에 라벨
 *   - X=0, Y=0 축은 약간 더 진하게
 *
 * 스텝은 화면상 50~110 px 유지되는 가장 큰 "1·2·5·10" 배수를 선택한다.
 */
function drawAxisGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  camera: Camera,
  theme: { foreground: string; muted: string; line: string; fontFamilyMono: string },
): void {
  const scale = camera.scale;
  if (!isFinite(scale) || scale <= 0) return;

  const targetPx = 70;
  const rawStep = targetPx / scale;
  const pow10 = Math.pow(10, Math.floor(Math.log10(Math.max(1e-6, rawStep))));
  const norm = rawStep / pow10;
  const nice = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  const step = nice * pow10;

  const topLeft = camera.toWorld([0, 0], viewport);
  const bottomRight = camera.toWorld([viewport.width, viewport.height], viewport);
  const xMin = topLeft[0];
  const xMax = bottomRight[0];
  const yMin = bottomRight[1];
  const yMax = topLeft[1];

  const gridColor = withAlpha(theme.line, 0.55);
  const axisColor = withAlpha(theme.muted, 0.75);
  const labelColor = theme.muted;

  ctx.save();

  // 일반 그리드선
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const xStart = Math.ceil(xMin / step) * step;
  for (let x = xStart; x <= xMax + 1e-9; x += step) {
    const sx = camera.toScreen([x, 0], viewport)[0];
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, viewport.height);
  }
  const yStart = Math.ceil(yMin / step) * step;
  for (let y = yStart; y <= yMax + 1e-9; y += step) {
    const sy = camera.toScreen([0, y], viewport)[1];
    ctx.moveTo(0, sy);
    ctx.lineTo(viewport.width, sy);
  }
  ctx.stroke();

  // X=0, Y=0 축 강조
  if (xMin <= 0 && xMax >= 0) {
    const [sx] = camera.toScreen([0, 0], viewport);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, viewport.height);
    ctx.stroke();
  }
  if (yMin <= 0 && yMax >= 0) {
    const [, sy] = camera.toScreen([0, 0], viewport);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(viewport.width, sy);
    ctx.stroke();
  }

  // 라벨 — 스텝이 1m 미만이면 소수점 한 자리, 아니면 정수.
  const decimals = step < 1 ? (step < 0.1 ? 2 : 1) : 0;
  const fmt = (v: number) => `${v.toFixed(decimals)}m`;

  ctx.fillStyle = labelColor;
  ctx.font = `11px ${theme.fontFamilyMono}`;

  // X 라벨: Y=0 축 바로 아래(없으면 화면 하단)에 표시
  const yAxisScreen =
    yMin <= 0 && yMax >= 0
      ? camera.toScreen([0, 0], viewport)[1]
      : viewport.height - 16;
  const xLabelY = Math.max(14, Math.min(viewport.height - 4, yAxisScreen + 14));
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (let x = xStart; x <= xMax + 1e-9; x += step) {
    if (Math.abs(x) < step / 2) continue; // 0 라벨 생략
    const sx = camera.toScreen([x, 0], viewport)[0];
    if (sx < 20 || sx > viewport.width - 40) continue;
    ctx.fillText(fmt(x), sx + 3, xLabelY);
  }

  // Y 라벨: X=0 축 바로 오른쪽(없으면 화면 좌측)에 표시
  const xAxisScreen =
    xMin <= 0 && xMax >= 0
      ? camera.toScreen([0, 0], viewport)[0]
      : 12;
  const yLabelX = Math.max(4, Math.min(viewport.width - 40, xAxisScreen + 4));
  ctx.textAlign = 'left';
  for (let y = yStart; y <= yMax + 1e-9; y += step) {
    if (Math.abs(y) < step / 2) continue;
    const sy = camera.toScreen([0, y], viewport)[1];
    if (sy < 12 || sy > viewport.height - 20) continue;
    ctx.fillText(fmt(y), yLabelX, sy - 3);
  }

  ctx.restore();
}

/** hex/rgb 컬러에 alpha 를 얹어 rgba 반환. 실패하면 원본. */
function withAlpha(color: string, alpha: number): string {
  const hex = color.replace('#', '');
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}
