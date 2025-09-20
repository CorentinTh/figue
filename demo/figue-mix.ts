import { StandardSchemaV1 } from '@standard-schema/spec';
import { defineConfig } from 'figue';
import { z } from 'zod';
import * as v from 'valibot';

const passwordSchema: StandardSchemaV1<unknown, string> = {
  ['~standard']: {
    version: 1,
    vendor: 'custom',
    validate: (value) => {
      if (typeof value !== 'string') {
        return { issues: [{ message: 'Password must be a string' }] };
      }

      return { value };
    },
  },
};

const { config } = defineConfig(
  {
    env: {
      doc: 'Application current environment',
      default: 'development',
      schema: v.picklist(['development', 'production', 'test']),
      env: 'NODE_ENV',
    },
    port: {
      doc: 'Application port to listen',
      schema: z.coerce.number(),
      default: 3000,
      env: 'PORT',
    },
    db: {
      host: {
        doc: 'Database server url',
        schema: z.url(),
        default: 'http://localhost:5432',
        env: 'APP_DB_HOST',
      },
      username: {
        doc: 'Database server username',
        schema: v.string(),
        default: 'pg',
        env: 'APP_DB_USERNAME',
      },
      password: {
        doc: 'Database server password',
        schema: passwordSchema,
        default: '',
        env: 'APP_DB_PASSWORD',
      },
    },
  },
  {
    envSource: process.env,
  },
);

console.log(config);
// {
//   env: 'development',
//   port: 3000,
//   db: { host: 'http://localhost:5432', username: 'pg', password: '' }
// }
