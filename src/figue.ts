import { z } from 'zod';
import { createConfigValidationError } from './figue.errors';
import { castArray, mapValues, mergeDeep } from './utils';
import type { ConfigDefinition, ConfigDefinitionElement, EnvRecord, InferSchemaType } from './figue.types';
import type { DeepPartial, Falsy } from './types';

export { buildConfigSchema, defineConfig };

function buildConfigSchema({ configDefinition }: { configDefinition: ConfigDefinition }) {
  const schema: any = mapValues(configDefinition, (config) => {
    if (isConfigDefinitionElement(config)) {
      return config.schema;
    } else {
      return buildConfigSchema({
        configDefinition: config as ConfigDefinition,
      });
    }
  });

  return z.object(schema);
}

function isConfigDefinitionElement(config: unknown): config is ConfigDefinitionElement {
  try {
    return config instanceof Object && 'schema' in config && config.schema instanceof z.ZodType;
  } catch (_ignored) {
    return false;
  }
}

function buildEnvConfig<Config extends Record<string, unknown>>({ configDefinition, env }: { configDefinition: ConfigDefinition; env: EnvRecord }): DeepPartial<Config> {
  return mapValues(configDefinition, (config) => {
    if (isConfigDefinitionElement(config)) {
      const { env: envKey } = config;

      if (envKey === undefined) {
        return undefined;
      }

      const value = env[envKey as string];
      return value;
    } else {
      return buildEnvConfig<Config>({ configDefinition: config, env });
    }
  }) as DeepPartial<Config>;
}

function getConfigDefaults<Config extends Record<string, unknown>>(
  { configDefinition }: { configDefinition: ConfigDefinition },
): Config {
  return mapValues(configDefinition, (config) => {
    if (isConfigDefinitionElement(config)) {
      const { default: defaultValue } = config;

      return defaultValue;
    } else {
      return getConfigDefaults({
        configDefinition: config,
      });
    }
  }) as Config;
}

const isNotFalsy = <T>(value: T | Falsy): value is T => Boolean(value);

function buildDefaultsConfig(
  {
    rawDefaults,
    getDefaults,
    envConfig,
    configDefaults,
  }: {
    rawDefaults: (Record<string, unknown> | Falsy)[] | Record<string, unknown>;
    envConfig: Record<string, unknown>;
    configDefaults: Record<string, unknown>;
    getDefaults?: ((args: {
      configDefaults: Record<string, unknown>;
      envConfig: Record<string, unknown>;
      config: Record<string, unknown>;
    }) => (Record<string, unknown> | Falsy)[] | Record<string, unknown>);
  },
): Record<string, unknown> {
  const config = mergeDeep(configDefaults, envConfig);
  const defaults = castArray(rawDefaults).filter(isNotFalsy);

  const gotDefaultsRaw = getDefaults?.({ configDefaults, envConfig, config });
  const gotDefaults = castArray(gotDefaultsRaw).filter(isNotFalsy);

  return mergeDeep(...defaults, ...gotDefaults);
}

function defineConfig<T extends ConfigDefinition, Config extends Record<string, unknown> = InferSchemaType<T>>(
  configDefinition: T,
  {
    envSources = [],
    envSource = {},
    defaults: rawDefaults = [],
    priority = 'env',
    getDefaults,
  }: {
    envSources?: EnvRecord[];
    envSource?: EnvRecord;
    defaults?: (Record<string, unknown> | Falsy)[] | Record<string, unknown>;
    getDefaults?: ((args: {
      configDefaults: Record<string, unknown>;
      envConfig: Record<string, unknown>;
      config: Record<string, unknown>;
    }) => (Record<string, unknown> | Falsy)[] | Record<string, unknown>);
    priority?: 'env' | 'defaults';
  } = {},
) {
  const env: EnvRecord = [...envSources, envSource].reduce((acc, env) => ({ ...acc, ...env }), {});

  const schema = buildConfigSchema({ configDefinition });

  // The default config coming from zod schema defaults
  const configDefaults = getConfigDefaults<Config>({ configDefinition });

  // The config coming from env variables
  const envConfig = buildEnvConfig<Config>({ configDefinition, env });

  // The config coming from defaults and getDefaults arguments
  const defaultsConfig = buildDefaultsConfig({ rawDefaults, envConfig, configDefaults, getDefaults });

  const mergedConfig = priority === 'env'
    ? mergeDeep(configDefaults, envConfig, defaultsConfig)
    : mergeDeep(configDefaults, defaultsConfig, envConfig);

  const parsingResult = schema.safeParse(mergedConfig);

  if (!parsingResult.success) {
    throw createConfigValidationError({ issues: parsingResult.error.issues });
  }

  const { data: config } = parsingResult;

  return { config: config as Config, env, envConfig, schema };
}
