import { z } from 'zod';
import { createConfigValidationError } from './figue.errors';
import { mapValues, mergeDeep } from './utils';
import type { ConfigDefinition, ConfigDefinitionElement, EnvRecord, InferSchemaType } from './figue.types';

export { defineConfig };

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

function buildEnvConfig({ configDefinition, env }: { configDefinition: ConfigDefinition; env: EnvRecord }): Record<string, unknown> {
  return mapValues(configDefinition, (config) => {
    if (isConfigDefinitionElement(config)) {
      const { env: envKey } = config;

      if (envKey === undefined) {
        return undefined;
      }

      const value = env[envKey as string];
      return value;
    } else {
      return buildEnvConfig({ configDefinition: config, env });
    }
  });
}

function getConfigDefaults({ configDefinition }: { configDefinition: ConfigDefinition }): Record<string, unknown> {
  return mapValues(configDefinition, (config) => {
    if (isConfigDefinitionElement(config)) {
      const { default: defaultValue } = config;

      return defaultValue;
    } else {
      return getConfigDefaults({
        configDefinition: config as ConfigDefinition,
      });
    }
  });
}

function defineConfig<T extends ConfigDefinition, Config = InferSchemaType<T>>(
  configDefinition: T,
  {
    envSources = [],
    envSource = {},
  }: {
    envSources?: EnvRecord[];
    envSource?: EnvRecord;
  } = {},
) {
  const env: EnvRecord = [...envSources, envSource].reduce((acc, env) => ({ ...acc, ...env }), {});

  const schema = buildConfigSchema({ configDefinition });

  const envConfig = buildEnvConfig({ configDefinition, env });
  const defaults = getConfigDefaults({ configDefinition });

  const mergedConfig = mergeDeep(defaults, envConfig);

  const parsingResult = schema.safeParse(mergedConfig);

  if (!parsingResult.success) {
    throw createConfigValidationError({ issues: parsingResult.error.issues });
  }

  const { data: config } = parsingResult;

  return { config: config as Config, env, envConfig };
}
