import { ComputeRegistry } from './compute/registry';
import { gravityVectorField, uniformVectorField } from './compute/standard';
import { I18nResolver, type Dictionary, type HostI18n } from './i18n/resolver';
import { PluginManager, type HostPlugin, type Logger } from './pluginManager';
import { RendererRegistry } from './renderer/registry';
import { getTheme, type HostTheme, type ThemeMode } from './theme';

export interface HostConfig {
  plugins?: HostPlugin[];
  theme?: ThemeMode;
  lang?: string;
  dictionary?: Dictionary;
  logger?: Logger;
}

const defaultLogger: Logger = {
  warn(msg) {
    console.warn(msg);
  },
  info() {
    /* 기본 로거는 info 를 무시. 개발 중에는 주입해서 확인. */
  },
};

export class Host {
  readonly pluginManager: PluginManager;
  readonly rendererRegistry: RendererRegistry;
  readonly computeRegistry: ComputeRegistry;

  theme: HostTheme;
  i18n: HostI18n;

  // Phase 2+ 에 추가될 서브시스템을 위한 자리.
  // controllerRegistry?: ControllerRegistry;
  // timeEngine?: TimeEngine;
  // camera?: Camera;

  private readonly logger: Logger;
  private themeMode: ThemeMode;

  constructor(config: HostConfig = {}) {
    this.logger = config.logger ?? defaultLogger;

    this.rendererRegistry = new RendererRegistry();
    this.computeRegistry = new ComputeRegistry();
    this.pluginManager = new PluginManager(
      this.rendererRegistry,
      this.computeRegistry,
      this.logger,
    );

    // 코어 표준 compute 메서드 등록
    this.computeRegistry.registerVector('uniform', uniformVectorField);
    this.computeRegistry.registerVector('gravity', gravityVectorField);

    this.themeMode = config.theme ?? 'light';
    this.theme = getTheme(this.themeMode);
    this.i18n = new I18nResolver(config.lang ?? 'ko', config.dictionary ?? {});

    for (const plugin of config.plugins ?? []) {
      this.pluginManager.register(plugin);
    }
  }

  setTheme(mode: ThemeMode): void {
    this.themeMode = mode;
    this.theme = getTheme(mode);
  }

  getThemeMode(): ThemeMode {
    return this.themeMode;
  }

  setLang(lang: string, dictionary?: Dictionary): void {
    this.i18n = new I18nResolver(lang, dictionary ?? {});
  }
}

export function createHost(config?: HostConfig): Host {
  return new Host(config ?? {});
}
