import type {
  Bundle,
  ControllerSpec,
  PluginLogger,
  Plugin,
  PrimitiveRenderer,
  VectorComputeFn,
} from '@aperi21/schema';
import { Camera } from './camera';
import { ComputeRegistry } from './compute/registry';
import { gravityVectorField, uniformVectorField } from './compute/standard';
import { ControllerRegistry, type ControllerFactory } from './controller/types';
import { AngleDialController } from './controller/angle-dial';
import { PinballLauncherController } from './controller/pinball-launcher';
import { PlacementController } from './controller/placement';
import { ValueEditController } from './controller/value-edit';
import { SliderController } from './controller/slider';
import { ScaleDragController } from './controller/scale-drag';
import { PointDragController } from './controller/point-drag';
import { ParamPanelController } from './controller/param-panel';
import { ViewTabsController } from './controller/view-tabs';
import { StageTabsController } from './controller/stage-tabs';
import { EnvTogglesController } from './controller/env-toggles';
import { ParamChipsController } from './controller/param-chips';
import { ResetButtonsController } from './controller/reset-buttons';
import { I18nResolver, type Dictionary, type HostI18n } from './i18n/resolver';
import { FRAMEWORK_MESSAGES } from './i18n/messages';
import { PluginManager, ServiceRegistry, type HostPlugin } from './pluginManager';
import { CORE_RENDERERS } from './renderer/primitives';
import { RendererRegistry } from './renderer/registry';
import { getBundleCapabilities } from './runtime/bundleRegistry';
import { getTheme, type HostTheme, type ThemeMode } from './theme';

/** 모드 이름이면 기본 테마를, 한 벌이면 그대로. */
function resolveThemeInput(input: ThemeMode | HostTheme | undefined): HostTheme {
  if (!input) return getTheme('light');
  return typeof input === 'string' ? getTheme(input) : input;
}
import {
  createTimeEngine,
  type TimeEngine,
  type TimeEngineMode,
} from './time';

export interface HostConfig {
  plugins?: HostPlugin[];
  /**
   * 테마. 모드 이름이거나, **완성된 테마 한 벌**이다.
   *
   * 한 벌을 통째로 준다 — 일부만 덮는 길을 두지 않는다. 부분 병합은 토큰을
   * 빠뜨렸을 때 조용히 기본값으로 떨어지고, 그 자리가 어디인지 화면을 봐야
   * 알게 된다. 통째로 주면 빠진 토큰을 타입이 잡는다.
   */
  theme?: ThemeMode | HostTheme;
  lang?: string;
  dictionary?: Dictionary;
  logger?: PluginLogger;
  /**
   * 초기 시간 모델. Embed 가 실제 Bundle 을 연결하기 전까지 사용하는 값.
   * Bundle 이 붙으면 Embed 가 setTimeMode 로 갱신한다.
   */
  timeMode?: TimeEngineMode;

  /**
   * 이 host 가 아는 능력. **주지 않으면 아무것도 모른다.**
   *
   * 조각은 이것을 직접 주지 않아도 된다 — `registerBundle` 의 세 번째 인자로
   * 온 능력을 `adoptBundleRenderers` 가 흡수한다. 여기 주는 것은 능력을 가려
   * 쓸 이유가 없는 소비자를 위한 길이다 (`standardCapabilities()`).
   */
  capabilities?: HostCapabilities;
}

/** 호스트에 주입하는 능력 한 벌. 여기 없는 것은 이 host 가 모른다. */
export interface HostCapabilities {
  /** primitive type → 렌더러. */
  renderers?: Record<string, PrimitiveRenderer>;
  /**
   * 조작기 type → **만드는 법.** 인스턴스가 아니다 — host 는 문서 전체가 공유하므로
   * 인스턴스를 두면 모든 임베드가 조작기 상태를 나눠 쓴다. 러너가 임베드마다 만든다.
   */
  controllers?: Partial<Record<ControllerSpec['type'], ControllerFactory>>;
  /** 이름 → 벡터장 계산. */
  vectorCompute?: Record<string, VectorComputeFn>;
}

/**
 * 표준 한 벌 전부. **아무도 부르지 않으면 번들에 실리지 않는다.**
 *
 * 상수가 아니라 함수인 것이 핵심이다 — 모듈 최상위에서 컨트롤러를 `new` 하면
 * 번들러가 그것을 부수 효과로 보고 지우지 못한다. 함수 본문은 호출되지 않으면
 * 통째로 사라진다 (§2.4 조건 1).
 *
 * 조각은 이것을 쓰지 않는다. 자기가 쓰는 것만 `capabilities` 로 받는다. 이 함수는
 * 능력을 가려 쓸 이유가 없는 소비자(개발 도구·전체 미리보기)를 위한 편의다.
 */
export function standardCapabilities(): Required<HostCapabilities> {
  return {
    renderers: CORE_RENDERERS,
    controllers: {
      'pinball-launcher': () => new PinballLauncherController(),
      'angle-dial': () => new AngleDialController(),
      placement: () => new PlacementController(),
      'value-edit': () => new ValueEditController(),
      slider: () => new SliderController(),
      'scale-drag': () => new ScaleDragController(),
      'point-drag': () => new PointDragController(),
      'param-panel': () => new ParamPanelController(),
      'view-tabs': () => new ViewTabsController(),
      'stage-tabs': () => new StageTabsController(),
      'env-toggles': () => new EnvTogglesController(),
      'param-chips': () => new ParamChipsController(),
      'reset-buttons': () => new ResetButtonsController(),
    },
    vectorCompute: { uniform: uniformVectorField, gravity: gravityVectorField },
  };
}

/** 능력 한 벌의 조작기 팩토리 목록. `Partial<Record>` 의 빈 자리는 건너뛴다. */
function controllerEntries(
  caps: HostCapabilities | undefined,
): [ControllerSpec['type'], ControllerFactory][] {
  const out: [ControllerSpec['type'], ControllerFactory][] = [];
  for (const [type, factory] of Object.entries(caps?.controllers ?? {})) {
    if (factory) out.push([type as ControllerSpec['type'], factory]);
  }
  return out;
}

/**
 * 프레임워크 문구 번들(2층) 위에 호스트가 준 사전을 얹는다. 호스트 값이 이긴다.
 * 이것이 없으면 ko 화면의 프레임워크 문구가 전부 en 원본으로 떨어진다 (C1).
 */
function mergeDictionary(dictionary?: Dictionary): Dictionary {
  if (!dictionary) return FRAMEWORK_MESSAGES;
  const merged: Dictionary = {};
  for (const lang of new Set([...Object.keys(FRAMEWORK_MESSAGES), ...Object.keys(dictionary)])) {
    merged[lang] = { ...FRAMEWORK_MESSAGES[lang], ...dictionary[lang] };
  }
  return merged;
}

const defaultLogger: PluginLogger = {
  warn(msg) {
    console.warn(msg);
  },
  info() {
    /* 개발 중 원하면 외부에서 주입. */
  },
};

/** ServiceRegistry 에 Host 가 기본 노출하는 서비스 id. */
export const HOST_SERVICE_IDS = {
  renderer: 'host.renderer',
  compute: 'host.compute',
  controller: 'host.controller',
  camera: 'host.camera',
  time: 'host.time',
  theme: 'host.theme',
  i18n: 'host.i18n',
  services: 'host.services',
} as const;

export class Host {
  readonly pluginManager: PluginManager;
  readonly rendererRegistry: RendererRegistry;
  readonly computeRegistry: ComputeRegistry;
  readonly controllerRegistry: ControllerRegistry;
  readonly services: ServiceRegistry;
  readonly camera: Camera;

  timeEngine: TimeEngine;
  theme: HostTheme;
  i18n: HostI18n;

  private readonly logger: PluginLogger;
  private themeMode: ThemeMode;
  /** 자유 렌더러를 이미 흡수한 번들. 중복 등록 방지용. */
  private readonly adoptedBundles = new WeakSet<Bundle>();

  constructor(config: HostConfig = {}) {
    this.logger = config.logger ?? defaultLogger;

    this.rendererRegistry = new RendererRegistry();
    this.computeRegistry = new ComputeRegistry();
    this.services = new ServiceRegistry();
    this.pluginManager = new PluginManager(
      this.rendererRegistry,
      this.computeRegistry,
      this.services,
      this.logger,
    );
    this.controllerRegistry = new ControllerRegistry();
    this.timeEngine = createTimeEngine(config.timeMode ?? 'linear');
    this.camera = new Camera();

    // 능력 등록. **주지 않으면 이 host 는 아무 능력도 모른다.**
    //
    // 예전에는 여기서 렌더러 8종·컨트롤러 5종·계산 2종을 무조건 등록했다.
    // 그래서 `new Host()` 한 번이 엔진 전체를 살려 냈고, 슬라이더 하나 쓰는
    // 조각도 핀볼 런처를 받았다 (§2.4 조건 1). 능력은 조각이 가져온다 —
    // `adoptBundleRenderers` 가 흡수하고, 그 출처는 생성기다.
    const caps = config.capabilities;
    for (const [type, renderer] of Object.entries(caps?.renderers ?? {})) {
      this.rendererRegistry.register(type, renderer);
    }
    for (const [type, factory] of controllerEntries(caps)) {
      this.controllerRegistry.register(type, factory);
    }
    for (const [name, fn] of Object.entries(caps?.vectorCompute ?? {})) {
      this.computeRegistry.registerVector(name, fn);
    }

    this.theme = resolveThemeInput(config.theme);
    this.themeMode = this.theme.mode;
    this.i18n = new I18nResolver(config.lang ?? 'ko', mergeDictionary(config.dictionary));

    // 서비스 등록 — Plugin 의 HostAPI.getService 로 조회 가능.
    this.services.register(HOST_SERVICE_IDS.renderer, this.rendererRegistry);
    this.services.register(HOST_SERVICE_IDS.compute, this.computeRegistry);
    this.services.register(HOST_SERVICE_IDS.controller, this.controllerRegistry);
    this.services.register(HOST_SERVICE_IDS.camera, this.camera);
    this.services.register(HOST_SERVICE_IDS.time, this.timeEngine);
    this.services.register(HOST_SERVICE_IDS.theme, this.theme);
    this.services.register(HOST_SERVICE_IDS.i18n, this.i18n);
    this.services.register(HOST_SERVICE_IDS.services, this.services);

    for (const plugin of config.plugins ?? []) {
      this.pluginManager.register(plugin);
    }
  }

  /**
   * 번들이 가지고 온 능력을 이 host 에 흡수한다.
   *
   * 두 갈래가 같은 문으로 들어온다.
   *   - `Bundle.renderers` — 조각이 자기 시각화를 직접 그리는 것 (원칙 4 의 탈출구)
   *   - 생성기가 뽑은 표준 어휘·조작기 — `registerBundle` 의 세 번째 인자
   *
   * **번들을 그리기 직전에 부른다.** 그 시점이 곧 번들이 로드된 시점이라
   * lazy 가 보존된다 — 부팅 때 미리 등록하려 들면 조각마다 그 조각을 통째로
   * 로드해야 하고, 조각 수에 비례해 첫 페이로드가 자란다.
   *
   * 같은 번들을 두 번 흡수하지 않는다. 한 문서에 같은 조각이 여러 번 박혀도
   * 등록은 한 번이다.
   */
  adoptBundleRenderers(bundle: Bundle): void {
    if (this.adoptedBundles.has(bundle)) return;
    this.adoptedBundles.add(bundle);

    const caps = getBundleCapabilities(bundle);
    const renderers: Record<string, PrimitiveRenderer> = {
      ...caps?.renderers,
      ...bundle.renderers,
    };
    for (const [type, renderer] of Object.entries(renderers)) {
      // 이미 있는 이름이면 건너뛴다. 표준 어휘·plugin 어휘를 조각이 덮어쓰지
      // 않는다 (C4) — 같은 이름을 쓰려 했다면 그것이 잘못이다.
      if (this.rendererRegistry.has(type)) {
        this.logger.warn(
          `[aperi21] bundle '${bundle.schema.id}' brings renderer '${type}' but that name is taken`,
        );
        continue;
      }
      this.rendererRegistry.register(type, renderer, bundle.zHints?.[type]);
    }
    // 이미 있는 type 은 건너뛴다. 등록부에 있는 것은 만드는 법이라, 먼저 온 조각의
    // 것을 써도 인스턴스는 임베드마다 따로다.
    for (const [type, factory] of controllerEntries(caps)) {
      if (this.controllerRegistry.has(type)) continue;
      this.controllerRegistry.register(type, factory);
    }
    const vectorCompute: Record<string, VectorComputeFn> = { ...caps?.vectorCompute };
    for (const [name, fn] of Object.entries(vectorCompute)) {
      this.computeRegistry.registerVector(name, fn);
    }
  }

  /** 테마를 갈아 끼운다. 모드 이름이거나 완성된 한 벌이다. */
  setTheme(theme: ThemeMode | HostTheme): void {
    this.theme = resolveThemeInput(theme);
    this.themeMode = this.theme.mode;
    this.services.register(HOST_SERVICE_IDS.theme, this.theme);
  }

  getThemeMode(): ThemeMode {
    return this.themeMode;
  }

  setLang(lang: string, dictionary?: Dictionary): void {
    this.i18n = new I18nResolver(lang, mergeDictionary(dictionary));
    this.services.register(HOST_SERVICE_IDS.i18n, this.i18n);
  }

  /** Bundle 의 시간 모델에 맞춰 시간 엔진을 교체. Embed 가 호출. */
  setTimeMode(mode: TimeEngineMode): void {
    if (this.timeEngine.mode === mode) return;
    this.timeEngine = createTimeEngine(mode);
    this.services.register(HOST_SERVICE_IDS.time, this.timeEngine);
  }
}

export function createHost(config?: HostConfig): Host {
  return new Host(config ?? {});
}

export type { Plugin };
