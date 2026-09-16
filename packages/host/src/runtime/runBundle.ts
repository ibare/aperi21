/**
 * runBundle — Bundle 을 DOM 영역에 마운트하는 **유일한 러너.**
 *
 * 캔버스 껍데기 · RAF 루프 · 카메라 자동 프레이밍 · 포인터 · 세션이 전부 여기 있다.
 * React 는 이것을 감쌀 뿐이다 (`packages/react/src/Embed.tsx`).
 *
 * 2026-09-14 이전에는 `react/embed/Canvas.tsx` 가 같은 루프를 복제했고, 복제는
 * 곧 갈라졌다 — 배경 입자가 한쪽에만 있었고 프레이밍 여백이 한쪽만 조작기를 셌다.
 * 같은 조각이 카탈로그와 외부 호스트에서 다른 화면으로 열렸다는 뜻이다.
 */

import type {
  Bundle,
  BundleState,
  ControllerSpec,
  EnvironmentDef,
  MeasureService,
  Primitive,
  RenderContext,
  StageDef,
  Vec2,
  ViewDef,
} from '@aperi21/schema';

import { BackgroundParticleSystem, resolveBackgroundKind } from '../particles';
import { orderForDrawing, preprocessScene } from '../scene';
import { Camera, type Viewport } from '../camera';
import { Host, createHost } from '../host';
import { createTimeEngine, evaluateTimeline, withCaption } from '../time';
import type { HostTheme, SceneTheme, ThemeMode } from '../theme';
import type {
  ControllerEventContext,
  ControllerSession,
  PointerInput,
  ResolvedController,
} from '../controller/types';
import { visibleControllers } from '../controller/visibility';
import { writePath } from '../controller/path';

/**
 * 임베드 캔버스 치수의 기본값. 선언(`BundleSchema.canvas`)이 비었을 때만 쓰인다.
 * C2 가 요구하는 "코드에 남는 기본값은 named 상수로 한 곳에" 를 따른다.
 */
const CANVAS_DEFAULT = { height: 360, minHeight: 320 } as const;

/** 어느 변에나 두는 최소 숨 쉴 자리(화면 px). */
const BASE_MARGIN = 24;
/** 조작기와 그림 사이에 두는 틈. */
const CONTROLLER_GAP = 8;
/**
 * 한 변의 여백 상한 — **그 방향 가용 공간의** 이 비율까지다.
 *
 * 기준이 화면 전체가 아니라 절반인 이유: `camera.fitToBounds` 는 bounds 의 가운데를
 * 화면 가운데에 놓고 **네 방향을 따로** 맞춘다. 그래서 왼쪽 여백은 화면 전체가
 * 아니라 왼쪽 절반에서 빠진다 — 600px 화면에서 여백 220 은 왼쪽에 80 만 남긴다.
 * 전체 기준으로 재면 이 두 배의 아픔이 보이지 않는다.
 *
 * 상자를 전부 비우지 않는 것은 의도다. 조작기는 화면 가장자리에 반투명으로 얹히고,
 * 그림이 그 아래로 조금 들어가도 읽힌다. 다 비우면 그림이 사라진다.
 */
const MARGIN_LIMIT = 0.4;

/**
 * 조작기가 실제로 차지한 자리만큼 프레이밍을 비운다.
 *
 * 예전에는 네 변 모두 24 고정이었고, 카탈로그 쪽 러너는 오버레이가 있을지를
 * `schema.views.length > 1` 같은 조건으로 **추정**했다. 그래서 각도 다이얼을 쓰는
 * 조각은 발행본에서 조작기가 그림 위에 얹혔다. 이제 조작기가 마지막 렌더에서
 * 차지한 상자를 돌려주므로 추정하지 않는다.
 *
 * **자리를 선언한 조작기(`at`)는 세지 않는다.** 저작자가 그림과 겹치지 않게 놓은
 * 것이라, 거기까지 비우면 그림이 두 번 밀린다.
 */
function screenMargins(
  resolved: readonly ResolvedController[],
  vp: Viewport,
): { top: number; bottom: number; left: number; right: number } {
  const m = { top: BASE_MARGIN, bottom: BASE_MARGIN, left: BASE_MARGIN, right: BASE_MARGIN };
  for (const r of resolved) {
    if ('at' in r.spec && r.spec.at) continue;
    const b = r.impl.screenBounds?.();
    if (!b) continue;

    // **비우는 면적이 가장 작은 변**에 귀속시킨다.
    //
    // 직사각형 여백으로는 "구석에 놓인 상자" 를 정확히 말할 수 없다 — 어느 변에
    // 붙이든 그 변 전체를 비우게 된다. 그러니 덜 잃는 쪽을 고른다.
    //
    // 예전에는 "가장 가까운 변" 이었다. 그러면 왼쪽 아래 구석의 파라미터 상자가
    // **아래** 변으로 가서 세로를 상한까지 먹었고, 그림이 세로에 갇혀 아주 작게
    // 그려졌다. 임베드는 가로로 넓고 세로로 좁아 **세로가 비싸다** (S-piece).
    // 면적으로 재면 같은 상자라도 아래로 가는 쪽이 훨씬 비싸므로 자연히 옆으로 간다.
    const sides = [
      { side: 'top' as const, room: b.y + b.h + CONTROLLER_GAP, span: vp.width },
      { side: 'bottom' as const, room: vp.height - b.y + CONTROLLER_GAP, span: vp.width },
      { side: 'left' as const, room: b.x + b.w + CONTROLLER_GAP, span: vp.height },
      { side: 'right' as const, room: vp.width - b.x + CONTROLLER_GAP, span: vp.height },
    ];
    let best = sides[0]!;
    for (const s of sides) {
      if (s.room * s.span < best.room * best.span) best = s;
    }
    m[best.side] = Math.max(m[best.side], best.room);
  }
  const capV = (vp.height / 2) * MARGIN_LIMIT;
  const capH = (vp.width / 2) * MARGIN_LIMIT;
  return {
    top: Math.min(m.top, capV),
    bottom: Math.min(m.bottom, capV),
    left: Math.min(m.left, capH),
    right: Math.min(m.right, capH),
  };
}

/**
 * 프리롤의 걸음(초). 60fps 한 프레임이다.
 *
 * 실시간 dt 가 아니라 고정 걸음으로 굴린다 — 같은 선언이 기기마다 다른 초기
 * 화면을 만들면 `?t=` 로 찍은 것과 실제로 본 것이 갈린다.
 */
const PREROLL_STEP = 1 / 60;
/** 프리롤 상한(걸음). 선언이 터무니없이 크면 마운트가 멈춘다. */
const PREROLL_MAX_STEPS = 20_000;
/** 검사 시각 이동의 상한(초). 동기 루프가 메인 스레드를 막으므로 둔다. */
const INSPECT_MAX_T = 60;

/**
 * 조작기를 잡고 있다는 사실을 선언한 자리에 적는다.
 *
 * 러너가 하는 일은 여기까지다 — 자동 진행이 어떻게 양보하고 놓은 뒤 무엇으로
 * 돌아갈지는 조각마다 다르다. `laminar-vs-turbulent` 는 가장 가까운 정박값으로
 * 돌아가고 `lenz-law` 는 놓는 순간의 속도로 이어 간다.
 */
export function markHeld(
  refs: { state: BundleState },
  spec: ControllerSpec,
  held: boolean,
): void {
  if (!spec.heldPath) return;
  refs.state = writePath(refs.state, spec.heldPath, held);
}

/**
 * 마운트 전에 `step` 을 `schema.preroll` 만큼 미리 굴린다.
 *
 * 두 러너가 같은 규약을 써야 한다 — 한쪽만 굴리면 같은 조각이 카탈로그와 외부
 * 호스트에서 다른 화면으로 열린다.
 */
export function prerollState<T extends BundleState>(
  bundle: Bundle<T>,
  initial: T,
  stage: StageDef,
  environments: EnvironmentDef[],
): T {
  const seconds = bundle.schema.preroll ?? 0;
  if (!(seconds > 0)) return initial;
  const steps = Math.min(Math.round(seconds / PREROLL_STEP), PREROLL_MAX_STEPS);
  let s = initial;
  for (let i = 0; i < steps; i++) {
    s = bundle.step({ state: s, dt: PREROLL_STEP, stage, environments });
  }
  return s;
}

export interface RunBundleOptions {
  locale?: string;
  /** 테마. 모드 이름이거나 완성된 한 벌. host 를 함께 주면 그쪽이 이긴다. */
  theme?: ThemeMode | HostTheme;
  /** 호스트가 이미 만들어둔 Host 가 있으면 재사용. 없으면 새로 만든다. */
  host?: Host;
  /** Stage id (없으면 첫 stage). */
  stageId?: string;
  /** View id (없으면 default 또는 첫 view). */
  viewId?: string;
  /** 활성화할 Environment id 들. */
  environmentIds?: string[];
  /** 파라미터 초기값 (없으면 schema default). */
  values?: Record<string, number>;
  /**
   * **검사 전용.** 이 시각(초)까지 고정 걸음으로 미리 굴린 뒤 시간을 멈춘다.
   *
   * 자유 구현본과 같은 시각에 스크린샷을 찍어 나란히 비교하기 위한 것이다
   * (`scripts/piece-report.mts --sims`). **S-piece 의 프리롤이 아니다** — "도착한
   * 순간 이미 진행 중" 은 저작 결정이라 선언(`BundleSchema.preroll`)에 둔다.
   *
   * 한계: 렌더러 안에서 적분하는 어휘(`filament` · `vortexField`)는 이것으로
   * 전진하지 않는다. 그 상태는 `bundle.step` 이 아니라 `rc.store` 에 있다.
   */
  inspectAt?: number;
  /**
   * Host 가 자동 생성될 때 호출되는 플러그인 설치 훅. bootstrap 패키지의
   * installAperi21Plugins 같은 함수를 외부에서 주입할 수 있다. host 옵션이
   * 명시되어 있으면 호출되지 않는다 (이미 호출자가 host 를 준비했다고 가정).
   */
  installPlugins?: (host: Host) => void | Promise<void>;
}

export interface BundleRunHandle {
  destroy(): void;
}

interface RunContextRefs<T extends BundleState> {
  bundle: Bundle<T>;
  stage: StageDef;
  view: ViewDef;
  envs: EnvironmentDef[];
  state: T;
}

export function runBundle<T extends BundleState = BundleState>(
  bundle: Bundle<T>,
  mount: HTMLElement,
  options: RunBundleOptions = {},
): BundleRunHandle {
  const host = options.host ?? createHost({ theme: options.theme, lang: options.locale });
  if (!options.host && options.installPlugins) {
    // host 를 우리가 만든 경우에만 plugin 설치를 시도. 결과 promise 는
    // 무시하고 바로 마운트를 시작한다 — 동기 등록인 경우는 즉시 효과가 있고,
    // async 인 경우엔 첫 프레임 이후 점진 반영된다.
    void Promise.resolve(options.installPlugins(host));
  }

  // 이 조각이 자기 렌더러를 가져왔으면 지금 흡수한다. 여기가 곧 조각이 로드된
  // 시점이라 부팅 페이로드가 조각 수에 비례해 자라지 않는다 (R10).
  host.adoptBundleRenderers(bundle as Bundle);

  // 카메라·시간 엔진은 이 마운트 전용 인스턴스다. host 는 renderer/compute/controller
  // 레지스트리·theme·i18n 같은 불변 공유분만 제공하고, 패닝/줌/시간처럼 view 마다
  // 달라야 하는 상태는 host 에 두지 않는다 — 같은 host 를 공유하는 다른 임베드와
  // 카메라·시간이 묶이지 않도록 (한 콘텐츠에 임베드가 N 개여도 각자 독립적으로
  // 패닝·줌·재생된다). timeModel 도 번들별로 정확히 적용된다.
  const camera = new Camera({ screenYBias: bundle.schema.camera?.screenYBias });
  /** 프리미티브의 프레임 간 상태. 이 마운트 전용이다 (원칙 6). */
  const primitiveStore = new Map<string, unknown>();
  const timeEngine = createTimeEngine(bundle.schema.timeModel ?? 'linear');

  // Stage / View / Environment 결정
  const stage =
    bundle.schema.stages.find((s) => s.id === options.stageId) ?? bundle.schema.stages[0]!;
  const view =
    bundle.schema.views.find((v) => v.id === options.viewId) ??
    bundle.schema.views.find((v) => v.default) ??
    bundle.schema.views[0]!;
  const envs = (options.environmentIds ?? [])
    .map((id) => bundle.schema.environments.find((e) => e.id === id))
    .filter((e): e is EnvironmentDef => !!e);

  // 파라미터 기본값 + 사용자 override
  const values: Record<string, number> = {};
  for (const p of bundle.schema.parameters) values[p.id] = p.default;
  if (options.values) Object.assign(values, options.values);

  // 초기 상태. 선언이 `preroll` 을 주면 마운트 전에 그만큼 미리 굴린다 —
  // 상태를 누적하는 조각은 시계만 앞당겨도 화면이 비어 있다 (S-piece: 독자가
  // 도착한 순간 이미 진행 중). 고정 걸음이라 같은 선언은 같은 초기 화면을 만든다.
  let state: T = bundle.initialState({ values, stage, environments: envs });
  state = prerollState(bundle, state, stage, envs);

  // 캔버스 컨테이너 + 캔버스.
  // 치수는 선언에서 온다 (원칙 2). 코드에는 선언이 비었을 때의 기본값만 둔다.
  // 마운트 후 이 값들은 바뀌지 않는다 — 글 안에 박힌 그림의 높이가 변하면 위아래
  // 문단이 밀린다 (원칙 6). packages/host/src/__tests__/embed-runtime.test.ts 가 잰다.
  // 저작자 문안(1층)을 얹은 조회기. 러너가 하나만 만들어 렌더러와 컨트롤러 양쪽에
  // 같은 것을 넘긴다 — 각자 만들면 한 화면에서 문안 출처가 갈린다 (C1).
  const scopedI18n = host.i18n.withMessages(bundle.schema.messages);

  const canvasSpec = bundle.schema.canvas ?? {};
  const height = canvasSpec.height ?? CANVAS_DEFAULT.height;
  const minHeight = canvasSpec.minHeight ?? CANVAS_DEFAULT.minHeight;

  const wrapper = document.createElement('div');
  wrapper.className = 'aperi21-runbundle';
  wrapper.style.position = 'relative';
  wrapper.style.width = '100%';
  wrapper.style.minHeight = `${minHeight}px`;
  wrapper.style.height = `${height}px`;
  wrapper.style.background = host.theme.scene.background;
  wrapper.style.borderRadius = `${host.theme.ui.radius.container}px`;
  wrapper.style.overflow = 'hidden';
  wrapper.style.border = `${host.theme.ui.strokeWidth.regular}px solid ${host.theme.ui.border}`;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.touchAction = 'none';
  wrapper.appendChild(canvas);
  mount.appendChild(wrapper);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      destroy() {
        wrapper.remove();
      },
    };
  }

  const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
  const particles = new BackgroundParticleSystem();
  timeEngine.reset();
  // 시계를 선언만큼 앞당겨 연다 (S-piece). 시간표 안이 아니라 BundleSchema 에
  // 있어서 시간표 없는 조각도 앞당길 수 있다.
  if (bundle.schema.startAt) timeEngine.seek(bundle.schema.startAt);
  timeEngine.start();


  let disposed = false;
  let rafId = 0;
  let lastT =
    typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  // 이 임베드 전용 조작기 묶음. host 는 문서 전체가 공유하므로 조작기 인스턴스를
  // host 에 두면 임베드끼리 드래그 상태가 섞인다 (C5). 묶음은 자원을 갖지 않는다.
  const controllers = host.controllerRegistry.createSet();
  /**
   * 손가락(포인터)마다의 드래그. 한 손가락이 한 인스턴스를 잡는다 — 두 손가락이 두
   * 조작기를 동시에 끌 수 있고, 두 번째 손가락이 첫 번째의 드래그를 가로채지 않는다.
   */
  const sessions = new Map<number, ResolvedController>();
  let panning: {
    pointerId: number;
    startPx: number;
    startPy: number;
    lastPx: number;
    lastPy: number;
    active: boolean;
  } | null = null;
  let wasTerminated = bundle.isTerminated?.(state) ?? false;

  const refs: RunContextRefs<T> = { bundle, stage, view, envs, state };

  /**
   * 상태를 선언의 초기값으로 다시 만든다. 스테이지 · 환경 · 파라미터가 바뀌면
   * 그때까지 굴러온 상태가 더는 그 조건의 것이 아니다.
   */
  function reinitState(): void {
    refs.state = prerollState(
      bundle,
      bundle.initialState({ values, stage: refs.stage, environments: refs.envs }),
      refs.stage,
      refs.envs,
    );
  }

  /**
   * 이 임베드의 세션. 조작기 가운데 화면을 갈아 끼우는 것들이 읽고 쓴다.
   *
   * **임베드마다 하나다** (C5). 마운트 클로저 안에 있으므로 한 문서에 임베드가
   * 여럿이어도 스테이지 · 뷰 · 파라미터가 섞이지 않는다.
   */
  const session: ControllerSession = {
    get stageId() {
      return refs.stage.id;
    },
    get viewId() {
      return refs.view.id;
    },
    get envIds() {
      return refs.envs.map((e) => e.id);
    },
    get params() {
      return values;
    },
    get stages() {
      return bundle.schema.stages;
    },
    get views() {
      return bundle.schema.views;
    },
    get environments() {
      // 지금 스테이지에서 쓸 수 있는 것만. 이 추리기를 조작기마다 다시 짜면
      // 조작기마다 다른 목록이 뜬다.
      return bundle.schema.environments.filter(
        (e) => !e.availableInStages || e.availableInStages.includes(refs.stage.id),
      );
    },
    get parameters() {
      return bundle.schema.parameters;
    },
    setStage(id: string) {
      const next = bundle.schema.stages.find((s) => s.id === id);
      if (!next || next.id === refs.stage.id) return;
      refs.stage = next;
      // 새 스테이지에서 못 쓰는 환경은 함께 내린다.
      refs.envs = refs.envs.filter(
        (e) => !e.availableInStages || e.availableInStages.includes(id),
      );
      camera.reset();
      reinitState();
    },
    setView(id: string) {
      const next = bundle.schema.views.find((v) => v.id === id);
      if (next) refs.view = next;
    },
    toggleEnv(id: string) {
      if (refs.envs.some((e) => e.id === id)) {
        refs.envs = refs.envs.filter((e) => e.id !== id);
        reinitState();
        return;
      }
      const env = bundle.schema.environments.find((e) => e.id === id);
      if (!env) return;
      if (env.availableInStages && !env.availableInStages.includes(refs.stage.id)) return;
      refs.envs = [...refs.envs, env];
      reinitState();
    },
    setParam(id: string, value: number) {
      const p = bundle.schema.parameters.find((x) => x.id === id);
      if (!p) return;
      values[id] = value;
      if (p.statePath) {
        // 그 경로가 단일 소스다. 처음부터 다시 만들지 않는다 — 굴러가던 것이 멈춘다.
        refs.state = writePath(refs.state, p.statePath, value) as T;
        return;
      }
      reinitState();
    },
    resetCamera() {
      camera.reset();
    },
    resetState() {
      for (const p of bundle.schema.parameters) values[p.id] = p.default;
      camera.reset();
      reinitState();
    },
  };
  // 검사 시각 이동. t=0 도 검사 시각이다 — 첫 프레임에 멈춰야 도착 순간을 원본과
  // 견줄 수 있다.
  if (options.inspectAt !== undefined && bundle.schema.timeModel !== 'static') {
    const target = Math.min(options.inspectAt, INSPECT_MAX_T);
    const steps = Math.round(target / PREROLL_STEP);
    for (let i = 0; i < steps; i++) {
      if (bundle.isTerminated?.(refs.state)) {
        timeEngine.markTerminated();
        break;
      }
      refs.state = bundle.step({
        state: refs.state,
        dt: PREROLL_STEP,
        stage: refs.stage,
        environments: refs.envs,
      });
    }
    timeEngine.seek(target);
    timeEngine.pause();
  }

  function sizeCanvas(): Viewport {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    return { width: w, height: h };
  }

  function toPointerInput(e: PointerEvent): PointerInput {
    const rect = canvas.getBoundingClientRect();
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
      session,
      ui: host.theme.ui,
    };
  }

  function findControllerAt(input: PointerInput, viewport: Viewport): ResolvedController | null {
    const visible = visibleControllers(refs.bundle.controllers, refs.state as BundleState);
    // 다른 손가락이 잡고 있는 인스턴스는 건너뛴다 — 두 손가락이 한 조작기를 다투지 않게.
    const held = new Set([...sessions.values()].map((s) => s.spec.id));
    for (const r of controllers.resolve(visible)) {
      if (held.has(r.spec.id)) continue;
      if (r.impl.hitTest(input, makeEventCtx(viewport, r.slot), r.spec, refs.state as BundleState)) {
        return r;
      }
    }
    return null;
  }

  function applyPartial(patch: unknown) {
    if (patch === null || patch === undefined) return;
    refs.state = patch as T;
  }

  function onPointerDown(e: PointerEvent) {
    const vp = sizeCanvas();
    const input = toPointerInput(e);
    const hit = findControllerAt(input, vp);
    if (hit) {
      try { canvas.setPointerCapture(e.pointerId); } catch { /* noop */ }
      sessions.set(e.pointerId, hit);
      // 잡혔다는 사실만 적는다. 자동 진행을 어떻게 양보하고 놓은 뒤 무엇으로
      // 돌아갈지는 조각의 step 이 안다 (원칙 7 ④ · ControllerInstance.heldPath).
      markHeld(refs, hit.spec, true);
      const patch = hit.impl.onPointerDown(input, makeEventCtx(vp, hit.slot), hit.spec, refs.state as BundleState);
      applyPartial(patch);
      return;
    }
    // 카메라 팬은 조작기를 잡지 않은 손가락이 하나일 때만.
    if (sessions.size === 0 && !panning && (e.button === 0 || e.button === 1)) {
      try { canvas.setPointerCapture(e.pointerId); } catch { /* noop */ }
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
        refs.state as BundleState,
      );
      applyPartial(patch);
      return;
    }
    if (panning && panning.pointerId === e.pointerId) {
      if (!panning.active) {
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
      const dxWorld = dxScreen / camera.scale;
      const dyWorld = -dyScreen / camera.scale;
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
        refs.state as BundleState,
      );
      applyPartial(patch);
      markHeld(refs, session.spec, false);
      sessions.delete(e.pointerId);
      try { canvas.releasePointerCapture(e.pointerId); } catch { /* noop */ }
      return;
    }
    if (panning && panning.pointerId === e.pointerId) {
      panning = null;
      try { canvas.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    }
  }
  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const vp = sizeCanvas();
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const worldCenter = camera.toWorld([sx, sy], vp);
    const factor = Math.exp(-e.deltaY * 0.0015);
    camera.zoom(factor, worldCenter);
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  function frame(now: number) {
    if (disposed) return;
    const realDt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    const vp = sizeCanvas();
    // 그림 축과 UI 축을 여기서 가른다. 프리미티브 렌더러에게는 앞의 것만 간다.
    const theme = host.theme.scene;
    const ui = host.theme.ui;
    const i18n = scopedI18n;
    const b = refs.bundle;

    // 시간표 단계의 재생 속도. 시간표가 없으면 1 — 앞 번들의 느린 속도가 남지 않게.
    timeEngine.setSpeed(
      b.schema.timeline ? evaluateTimeline(b.schema.timeline, timeEngine.currentTime).timeScale : 1,
    );
    const simDt = timeEngine.tick(realDt);
    if (simDt > 0) {
      const next = b.step({ state: refs.state, dt: simDt, stage: refs.stage, environments: refs.envs });
      if (next !== refs.state) refs.state = next;
      if (b.isTerminated?.(next)) timeEngine.markTerminated();
    }

    const isTerm = b.isTerminated?.(refs.state) ?? false;
    if (wasTerminated && !isTerm) {
      // 조각이 「이제 안 끝났다」고 말하면 **시계가 다시 흘러야 한다.**
      //
      // 종료 상태의 `tick()` 은 0 을 돌려주므로 `simDt > 0` 이 거짓이 되어
      // `bundle.step` 이 아예 불리지 않는다. 발사대를 다시 당겨도 공이 날지 않았고,
      // 착지 뒤 스테이지·환경·파라미터를 바꾸거나 되돌려도 마찬가지였다 — 상태는
      // 갱신되는데 시계만 멈춰 있어서다. 예외도 안 나고 타입도 통과한다.
      //
      // `start()` 는 `terminated` 에서도 `running` 으로 보내고 `currentTime` 을
      // 건드리지 않는다. 시각을 되돌릴지는 조각의 몫이라 여기서 정하지 않는다
      // (`reset()` 을 쓰면 시간표 단계와 `startAt` 앞당김이 함께 지워진다).
      timeEngine.start();
      camera.userAdjusted = false;
    }
    wasTerminated = isTerm;

    // 이 프레임에 그려질 조작기. 아래 렌더 루프와 프레이밍이 같은 목록을 봐야
    // 여백과 그림이 어긋나지 않는다.
    const resolved = controllers.resolve(
      visibleControllers(b.controllers, refs.state as BundleState),
    );

    if (!camera.userAdjusted && b.boundsHint) {
      const bounds = b.boundsHint(refs.state, refs.stage);
      camera.fitToBounds(bounds, vp, {
        padding: 12,
        screenMargins: screenMargins(resolved, vp),
      });
    }

    particles.setKind(resolveBackgroundKind(refs.stage, refs.envs), vp);
    particles.update(realDt, vp);

    ctx!.save();
    ctx!.scale(dpr, dpr);
    ctx!.clearRect(0, 0, vp.width, vp.height);
    ctx!.fillStyle = theme.background;
    ctx!.fillRect(0, 0, vp.width, vp.height);
    particles.render(ctx!, theme);
    // 그리드는 선언이 켜야 나온다 (원칙 4, R9).
    if (b.schema.chrome?.grid) drawAxisGrid(ctx!, vp, camera, theme);

    // 시간표와 캡션은 선언이다.
    const timeline = b.schema.timeline
      ? evaluateTimeline(b.schema.timeline, timeEngine.currentTime)
      : undefined;
    const sceneGraph = withCaption(
      b.scene({
        state: refs.state,
        view: refs.view,
        stage: refs.stage,
        environments: refs.envs,
        timeline,
      }),
      b.schema,
      timeline,
      refs.state as BundleState,
    );
    const { refs: sceneRefs, orderedScene } = preprocessScene(sceneGraph);
    const sortedScene = orderForDrawing(orderedScene, b.schema.drawOrder, (t) =>
      host.rendererRegistry.getZ(t),
    );

    const rc: RenderContext = {
      ctx: ctx!,
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
      scene: sceneRefs,
      measure: createMeasure(ctx!, theme.fontFamily),
    };
    // 조작기는 세션을 함께 본다. 프리미티브 렌더러에게는 넘기지 않는다 —
    // 렌더러가 읽는 것은 SceneGraph 선언과 theme 뿐이다 (S-render).
    // 그림 축을 덜어내고 UI 축을 얹는다 — 조작기는 제 축의 색·치수만 본다.
    const { theme: _scene, ...rest } = rc;
    const crc = { ...rest, viewport: vp, session, ui };

    host.pluginManager.runFrameHooks(rc);

    for (const p of sortedScene as Primitive[]) {
      const renderer = host.rendererRegistry.get(p.type);
      if (!renderer) continue;
      renderer(rc, p, sceneRefs);
    }

    for (const r of resolved) {
      r.impl.render({ ...crc, slot: r.slot }, r.spec, refs.state as BundleState);
    }

    ctx!.restore();

    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);

  return {
    destroy() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      // 열린 드래그를 닫는다 — 잡은 손가락의 캡처를 풀고 세션을 비운다 (C5).
      for (const pointerId of sessions.keys()) {
        try { canvas.releasePointerCapture(pointerId); } catch { /* noop */ }
      }
      sessions.clear();
      primitiveStore.clear();
      try { wrapper.remove(); } catch { /* noop */ }
    },
  };
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

/**
 * 월드 좌표 m 단위 거리 축 그리드.
 */
function drawAxisGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  camera: Camera,
  theme: SceneTheme,
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

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = theme.strokeWidth.thin;
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

  if (xMin <= 0 && xMax >= 0) {
    const [sx] = camera.toScreen([0, 0], viewport);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = theme.strokeWidth.regular;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, viewport.height);
    ctx.stroke();
  }
  if (yMin <= 0 && yMax >= 0) {
    const [, sy] = camera.toScreen([0, 0], viewport);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = theme.strokeWidth.regular;
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(viewport.width, sy);
    ctx.stroke();
  }

  const decimals = step < 1 ? (step < 0.1 ? 2 : 1) : 0;
  const fmt = (v: number) => `${v.toFixed(decimals)}m`;

  ctx.fillStyle = labelColor;
  ctx.font = `${theme.fontSize.regular}px ${theme.fontFamilyMono}`;

  const yAxisScreen =
    yMin <= 0 && yMax >= 0
      ? camera.toScreen([0, 0], viewport)[1]
      : viewport.height - 16;
  const xLabelY = Math.max(14, Math.min(viewport.height - 4, yAxisScreen + 14));
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (let x = xStart; x <= xMax + 1e-9; x += step) {
    if (Math.abs(x) < step / 2) continue;
    const sx = camera.toScreen([x, 0], viewport)[0];
    if (sx < 20 || sx > viewport.width - 40) continue;
    ctx.fillText(fmt(x), sx + 3, xLabelY);
  }

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
