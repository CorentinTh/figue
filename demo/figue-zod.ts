import { defineConfig } from 'figue';
import { z } from 'zod';

const { config } = defineConfig(
  {
    env: {
      doc: 'Application current environment',
      default: 'development',
      schema: z.enum(['development', 'production', 'test']),
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
        schema: z.string(),
        default: 'pg',
        env: 'APP_DB_USERNAME',
      },
      password: {
        doc: 'Database server password',
        schema: z.string(),
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
