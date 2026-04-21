import type {
  HostAPI,
  Plugin,
  PluginLogger,
  RenderContext,
  ScalarComputeFn,
  VectorComputeFn,
} from '@aperi21/schema';
import type { ComputeRegistry } from './compute/registry';
import type { RendererRegistry } from './renderer/registry';
import { compareSemver, matchesRange, parseRequirement } from './semver';

/**
 * 호스트에서 쓰는 Plugin 별칭. 과거 host 패키지가 별도 인터페이스를 들고
 * 있었지만 스펙 일치를 위해 schema.Plugin 을 그대로 재사용한다.
 */
export type HostPlugin = Plugin;

/** Plugin 이 호스트에 남기는 로그 채널. schema 정의 재노출. */
export type Logger = PluginLogger;

/**
 * 호스트 서비스 레지스트리. getService 로 노출되는 이름공간.
 * Plugin 의 onRegister 훅이나 다른 Plugin 이 Controller/Time/Camera 등
 * 호스트 서비스에 접근할 때 사용한다.
 */
export class ServiceRegistry {
  private readonly services = new Map<string, unknown>();

  register<T>(id: string, value: T): void {
    this.services.set(id, value);
  }

  has(id: string): boolean {
    return this.services.has(id);
  }

  get<T = unknown>(id: string): T | undefined {
    return this.services.get(id) as T | undefined;
  }

  unregister(id: string): void {
    this.services.delete(id);
  }
}

interface RegistrationRecord {
  plugin: Plugin;
  rendererTypes: string[];
  vectorComputeNames: string[];
  scalarComputeNames: string[];
  utilityKeys: string[];
}

/** 호스트 입장에서 Plugin 집합을 관리하는 서브시스템. */
export class PluginManager {
  private readonly plugins = new Map<string, Plugin>();
  private readonly records = new Map<string, RegistrationRecord>();
  private readonly utilities = new Map<string, Map<string, unknown>>();

  constructor(
    private readonly rendererRegistry: RendererRegistry,
    private readonly computeRegistry: ComputeRegistry,
    private readonly services: ServiceRegistry,
    private readonly logger: PluginLogger,
  ) {}

  has(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  get(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  list(): Plugin[] {
    return [...this.plugins.values()];
  }

  getUtility<T = unknown>(pluginId: string, key: string): T | undefined {
    return this.utilities.get(pluginId)?.get(key) as T | undefined;
  }

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`[aperi21] plugin '${plugin.id}' already registered`);
    }

    if (!plugin.version || typeof plugin.version !== 'string') {
      throw new Error(
        `[aperi21] plugin '${plugin.id}' has no version — Plugin.version is required`,
      );
    }

    // 의존성·버전 호환 확인
    for (const raw of plugin.requires ?? []) {
      const { id, range } = parseRequirement(raw);
      const existing = this.plugins.get(id);
      if (!existing) {
        throw new Error(
          `[aperi21] plugin '${plugin.id}' requires '${id}' which is not registered`,
        );
      }
      if (range && !matchesRange(existing.version, range)) {
        throw new Error(
          `[aperi21] plugin '${plugin.id}' requires '${id}' version '${range}' but found '${existing.version}'`,
        );
      }
    }

    // 충돌 확인
    for (const conflicting of plugin.conflicts ?? []) {
      if (this.plugins.has(conflicting)) {
        throw new Error(
          `[aperi21] plugin '${plugin.id}' conflicts with already registered '${conflicting}'`,
        );
      }
    }

    // 프리미티브 타입 네임스페이스 충돌 확인
    for (const type of plugin.primitiveTypes) {
      if (this.rendererRegistry.has(type)) {
        throw new Error(
          `[aperi21] plugin '${plugin.id}' tries to register primitive type '${type}' which is already taken`,
        );
      }
    }

    // computeMethods 네임스페이스 충돌 확인
    const vectorNames = Object.keys(plugin.computeMethods?.vector ?? {});
    const scalarNames = Object.keys(plugin.computeMethods?.scalar ?? {});
    for (const name of vectorNames) {
      if (this.computeRegistry.hasVector(name)) {
        throw new Error(
          `[aperi21] plugin '${plugin.id}' tries to register vector compute '${name}' which is already taken`,
        );
      }
    }
    for (const name of scalarNames) {
      if (this.computeRegistry.hasScalar(name)) {
        throw new Error(
          `[aperi21] plugin '${plugin.id}' tries to register scalar compute '${name}' which is already taken`,
        );
      }
    }

    const record: RegistrationRecord = {
      plugin,
      rendererTypes: [],
      vectorComputeNames: [],
      scalarComputeNames: [],
      utilityKeys: [],
    };

    try {
      // 렌더러 등록
      for (const type of plugin.primitiveTypes) {
        const renderer = plugin.renderers[type];
        if (!renderer) {
          throw new Error(
            `[aperi21] plugin '${plugin.id}' declares primitive type '${type}' but provides no renderer`,
          );
        }
        const zHint = plugin.zHints?.[type];
        this.rendererRegistry.register(type, renderer, zHint);
        record.rendererTypes.push(type);
      }

      // compute 등록
      for (const [name, fn] of Object.entries(plugin.computeMethods?.vector ?? {})) {
        this.computeRegistry.registerVector(name, fn);
        record.vectorComputeNames.push(name);
      }
      for (const [name, fn] of Object.entries(plugin.computeMethods?.scalar ?? {})) {
        this.computeRegistry.registerScalar(name, fn);
        record.scalarComputeNames.push(name);
      }

      // 유틸리티 등록
      if (plugin.utilities) {
        const bucket = new Map<string, unknown>();
        for (const [key, value] of Object.entries(plugin.utilities)) {
          bucket.set(key, value);
          record.utilityKeys.push(key);
        }
        this.utilities.set(plugin.id, bucket);
      }

      // onRegister 훅 — 에러 격리: 내부에서 throw 하면 전체 롤백
      plugin.onRegister?.(this.buildHostAPI());

      this.plugins.set(plugin.id, plugin);
      this.records.set(plugin.id, record);
      this.logger.info(`[aperi21] plugin '${plugin.id}@${plugin.version}' registered`);
    } catch (err) {
      this.rollback(record);
      throw err;
    }
  }

  unregister(pluginId: string): void {
    const record = this.records.get(pluginId);
    if (!record) return;

    try {
      record.plugin.onUnregister?.();
    } catch (err) {
      this.logger.warn(
        `[aperi21] plugin '${pluginId}' onUnregister threw: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }

    this.rollback(record);
    this.plugins.delete(pluginId);
    this.records.delete(pluginId);
  }

  /**
   * 프레임 루프 시작에서 호출. 각 Plugin 의 onFrame 훅에 RenderContext 를
   * 전달한다. 한 Plugin 의 예외가 다음 Plugin 을 막지 않도록 에러 격리.
   */
  runFrameHooks(ctx: RenderContext): void {
    for (const plugin of this.plugins.values()) {
      const hook = plugin.onFrame;
      if (!hook) continue;
      try {
        hook.call(plugin, ctx);
      } catch (err) {
        this.logger.warn(
          `[aperi21] plugin '${plugin.id}' onFrame threw: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
  }

  /** semver 비교를 외부에서 쓸 수 있도록 노출 (테스트·툴링 용도). */
  static compareVersions = compareSemver;

  private rollback(record: RegistrationRecord): void {
    for (const type of record.rendererTypes) {
      this.rendererRegistry.unregister(type);
    }
    for (const name of record.vectorComputeNames) {
      this.computeRegistry.unregisterVector(name);
    }
    for (const name of record.scalarComputeNames) {
      this.computeRegistry.unregisterScalar(name);
    }
    if (record.utilityKeys.length > 0) {
      this.utilities.delete(record.plugin.id);
    }
  }

  private buildHostAPI(): HostAPI {
    const computeRegistry = this.computeRegistry;
    const utilities = this.utilities;
    const services = this.services;
    const logger = this.logger;

    return {
      registerComputeMethod(
        kind: 'vector' | 'scalar',
        name: string,
        fn: VectorComputeFn | ScalarComputeFn,
      ) {
        if (kind === 'vector') {
          computeRegistry.registerVector(name, fn as VectorComputeFn);
        } else {
          computeRegistry.registerScalar(name, fn as ScalarComputeFn);
        }
      },
      registerUtility(namespace: string, key: string, value: unknown) {
        const bucket = utilities.get(namespace) ?? new Map<string, unknown>();
        bucket.set(key, value);
        utilities.set(namespace, bucket);
      },
      getService<T>(id: string): T | undefined {
        return services.get<T>(id);
      },
      logger,
    };
  }
}
