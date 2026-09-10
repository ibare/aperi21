import type {
  Bundle,
  PluginLogger,
  Plugin,
  PrimitiveRenderer,
  VectorComputeFn,
} from '@aperi21/schema';
import { Camera } from './camera';
import { ComputeRegistry } from './compute/registry';
import { gravityVectorField, uniformVectorField } from './compute/standard';
import { ControllerRegistry, type ControllerImpl } from './controller/types';
import { AngleDialController } from './controller/angle-dial';
import { PinballLauncherController } from './controller/pinball-launcher';
import { PlacementController } from './controller/placement';
import { ValueEditController } from './controller/value-edit';
import { SliderController } from './controller/slider';
import { I18nResolver, type Dictionary, type HostI18n } from './i18n/resolver';
import { FRAMEWORK_MESSAGES } from './i18n/messages';
import { PluginManager, ServiceRegistry, type HostPlugin } from './pluginManager';
import { CORE_RENDERERS } from './renderer/primitives';
import { RendererRegistry } from './renderer/registry';
import { getBundleCapabilities } from './runtime/bundleRegistry';
import { getTheme, type HostTheme, type ThemeMode } from './theme';
import {
  createTimeEngine,
  type TimeEngine,
  type TimeEngineMode,
} from './time';

export interface HostConfig {
  plugins?: HostPlugin[];
  theme?: ThemeMode;
  lang?: string;
  dictionary?: Dictionary;
  logger?: PluginLogger;
  /**
   * 초기 시간 모델. Embed 가 실제 Bundle 을 연결하기 전까지 사용하는 값.
   * Bundle 이 붙으면 Embed 가 setTimeMode 로 갱신한다.
   */
  timeMode?: TimeEngineMode;

  /**
   * 이 host 가 아는 능력. 생략하면 표준 한 벌이 전부 실린다.
   *
   * **그 기본값이 트리셰이킹을 막는다** — `new Host()` 한 번이 렌더러 8종과
   * 컨트롤러 5종을 살려 내므로, 슬라이더 하나 쓰는 조각도 핀볼 런처를 받는다
   * (REQUIREMENTS.md §2.4 조건 1). 지금은 아무것도 깨지 않기 위해 기본값을
   * 남겨 두고, 조각이 자기 능력을 가져오게 된 뒤(§2.4 조건 3) 걷어낸다.
   */
  capabilities?: HostCapabilities;
}

/** 호스트에 주입하는 능력 한 벌. 여기 없는 것은 이 host 가 모른다. */
export interface HostCapabilities {
  /** primitive type → 렌더러. */
  renderers?: Record<string, PrimitiveRenderer>;
  /** 조작기 구현. 각자 자기 `type` 을 안다. */
  controllers?: ControllerImpl[];
  /** 이름 → 벡터장 계산. */
  vectorCompute?: Record<string, VectorComputeFn>;
}

/**
 * 표준 한 벌. `capabilities` 를 주지 않은 host 가 받는 것이다.
 *
 * 이 표를 참조하는 것만으로 8+5+2 종이 번들에 들어온다. 그것이 지금의 상태이고
 * S3-C 에서 없앤다 — 여기 모아 둔 이유는 **없앨 자리를 한 곳으로 만들기 위해서**다.
 */
export const STANDARD_CAPABILITIES: Required<HostCapabilities> = {
  renderers: CORE_RENDERERS,
  controllers: [
    new PinballLauncherController(),
    new AngleDialController(),
    new PlacementController(),
    new ValueEditController(),
    new SliderController(),
  ],
  vectorCompute: { uniform: uniformVectorField, gravity: gravityVectorField },
};

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

    // 능력 등록. 주지 않으면 표준 한 벌이 전부 온다 (HostConfig.capabilities 주석).
    const caps = config.capabilities;
    for (const [type, renderer] of Object.entries(
      caps?.renderers ?? STANDARD_CAPABILITIES.renderers,
    )) {
      this.rendererRegistry.register(type, renderer);
    }
    for (const impl of caps?.controllers ?? STANDARD_CAPABILITIES.controllers) {
      this.controllerRegistry.register(impl);
    }
    for (const [name, fn] of Object.entries(
      caps?.vectorCompute ?? STANDARD_CAPABILITIES.vectorCompute,
    )) {
      this.computeRegistry.registerVector(name, fn);
    }

    this.themeMode = config.theme ?? 'light';
    this.theme = getTheme(this.themeMode);
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
    for (const impl of caps?.controllers ?? []) {
      if (this.controllerRegistry.get(impl.type)) continue;
      this.controllerRegistry.register(impl);
    }
    const vectorCompute: Record<string, VectorComputeFn> = { ...caps?.vectorCompute };
    for (const [name, fn] of Object.entries(vectorCompute)) {
      this.computeRegistry.registerVector(name, fn);
    }
  }

  setTheme(mode: ThemeMode): void {
    this.themeMode = mode;
    this.theme = getTheme(mode);
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
