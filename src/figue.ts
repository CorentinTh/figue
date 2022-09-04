import Ajv from 'ajv';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import _ from 'lodash';
import type { DeepRequired } from 'ts-essentials';

import addAJVFormats from 'ajv-formats';
import addAJVKeywords from 'ajv-keywords';

export { figue, getEnvMapper, buildEnvObject, getAjv };

type EnvObject = Record<string, unknown>;

function getEnvMapper({ schema }: { schema: JSONSchema }): Record<string, string> {
  const walk = (node: JSONSchema, keyPrefix: string): Record<string, string> => {
    if (_.isEmpty(node) || !_.isObject(node)) return {};

    if (node.type === 'object') {
      return _.reduce(node.properties ?? {}, (acc, value, key) => ({ ...acc, ...walk(value as JSONSchema, [keyPrefix, key].filter(Boolean).join('.')) }), {});
    }

    if (node.env) {
      return {
        [node.env]: keyPrefix,
      };
    }

    return {};
  };

  return walk(schema, '');
}

function buildEnvObject({ envVariables, envMapper }: { envVariables: EnvObject; envMapper: Record<string, string> }): unknown {
  return _.reduce(
    envVariables,
    (acc, value, key) => {
      if (key in envMapper) {
        _.set(acc, envMapper[key], value);
      }

      return acc;
    },
    {},
  );
}

function getAjv() {
  const ajv = new Ajv({ removeAdditional: true, coerceTypes: true, useDefaults: true });

  addAJVFormats(ajv);
  addAJVKeywords(ajv);

  ajv.addKeyword({
    keyword: 'env',
  });

  ajv.addKeyword({
    keyword: 'doc',
  });

  return ajv;
}

function figue<S extends JSONSchema>(schema: S, { ajv = getAjv() }: { ajv?: Ajv } = {}) {
  const envVariables: EnvObject = {};
  const loadedConfig: object = {};

  const validate = ajv.compile(schema);

  return {
    loadEnv(loadedEnv: EnvObject) {
      Object.assign(envVariables, loadedEnv);

      return this;
    },

    loadConfig(config: object) {
      Object.assign(loadedConfig, config);

      return this;
    },

    getConfig(): DeepRequired<FromSchema<S>> {
      const configFromEnv = buildEnvObject({ envVariables, envMapper: getEnvMapper({ schema }) });

      const aggregatedConfig = Object.assign({}, loadedConfig, configFromEnv);

      validate(aggregatedConfig);

      return aggregatedConfig as unknown as DeepRequired<FromSchema<S>>;
    },
  };
}

figue({
  type: 'object',
  properties: {
    a: {
      type: 'integer',
    },
  },
});
