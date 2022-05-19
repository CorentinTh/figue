import _ from 'lodash';
import { formats, SchemaObj } from './formats/index';
import { isFalsyOrHasThrown } from './utils';

export interface SchemaObjBase<T> {
  doc?: string;
  default: T;
  env?: string;
}

export type Schema = {
  [k: string]: Schema | SchemaObj;
};

type Config = {
  [k: string]: Config | unknown;
};

type TypeFromSchema<T> = {
  [P in keyof T]: T[P] extends SchemaObj ? T[P]['default'] : TypeFromSchema<T[P]>;
};

export function flattenSchema(schema: Schema, keys: string[] = []): { path: string[]; schema: SchemaObj }[] {
  const acc = [];

  for (const [key, value] of Object.entries(schema)) {
    const valueHasFormat = Object.entries(value).some(([k, v]) => k === 'format' && _.isString(v));

    const path = [...keys, key];
    if (_.isObject(value) && !valueHasFormat) {
      const childAcc = flattenSchema(value as Schema, path);
      acc.push(...childAcc);
    } else {
      acc.push({
        path,
        schema: value,
      });
    }
  }

  return acc;
}

type Env = { [k: string]: number | string | boolean };

export class Figue<T extends Schema> {
  private schemaFlat: { path: string[]; schema: SchemaObj }[];
  private env: Env = {};
  private config: Config;

  constructor(private schema: T) {
    this.schemaFlat = flattenSchema(schema);
  }

  loadEnv(env: Env) {
    this.env = _.merge(this.env, env);

    return this;
  }

  loadConfig(config: Config) {
    this.config = _.merge(this.config, config);

    return this;
  }

  validate() {
    const configValues = this.getConfig();
    const errors = [];

    for (const { path, schema } of this.schemaFlat) {
      const { format } = schema;

      const { validate } = formats[format];

      if (!validate) {
        throw new Error(`[figue:invalid-format] The format '${format}' does not exist, valid formats are ${Object.keys(formats).join(', ')}.`);
      }

      const value = _.get(configValues, path);

      if (isFalsyOrHasThrown(() => validate(value, schema))) {
        errors.push(`[figue:validation-error] The key '${path}' does not comply with the format '${format}', received value ${JSON.stringify(value)}`);
      }
    }

    if (errors.length > 0) {
      throw new TypeError(errors.join('\n'));
    }

    return this;
  }

  private getValue({ path, schema }: { path: string[]; schema: SchemaObj }) {
    const { coerce } = formats[schema.format];

    const value = this.env[schema.env] ?? _.get(this.config, path) ?? schema.default;

    return coerce?.(value, schema) ?? value;
  }

  getConfig(): TypeFromSchema<T> {
    const config = this.schemaFlat.reduce((acc, { path, schema }) => {
      const value = this.getValue({ path, schema });

      _.set(acc, path, value);

      return acc;
    }, {});

    return config as TypeFromSchema<T>;
  }
}

export const figue = <T extends Schema>(schema: T) => new Figue<T>(schema);
