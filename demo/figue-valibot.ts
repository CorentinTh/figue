import { defineConfig } from 'figue';
import * as v from 'valibot';

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
      schema: v.pipe(v.union([v.number(), v.string()]), v.transform(Number)),
      default: 3000,
      env: 'PORT',
    },
    db: {
      host: {
        doc: 'Database server url',
        schema: v.pipe(v.string(), v.url()),
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
        schema: v.string(),
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
