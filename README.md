# Figue

[![ci](https://github.com/CorentinTh/figue/actions/workflows/ci.yml/badge.svg)](https://github.com/CorentinTh/figue/actions/workflows/ci.yml)

> Platform agnostic configuration management library, with environmental variables and validation, like [convict](https://github.com/mozilla/node-convict/tree/master/packages/convict) but simpler, cross env and using [zod schemas](https://github.com/colinhacks/zod).

## Usage

Install package:

```sh
# npm
npm install figue zod

# yarn
yarn install figue zod

# pnpm
pnpm install figue zod
```

Import:

```js
// ESM
import { defineConfig } from 'figue';

// CommonJS
const { defineConfig } = require('figue');
```

## API

### Basic example

```typescript
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
      schema: z.coerce.number().int().positive(),
      default: 3000,
      env: 'PORT',
    },
    db: {
      host: {
        doc: 'Database server url',
        schema: z.string().url(),
        default: 'localhost',
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
// {
//   env: "development",
//   port: 3000,
//   db: {
//     url: "https://localhost",
//     username: "pg",
//     password: "",
//   },
// }
```

### Load environnement

Use the `envSource` key of the second argument of `defineConfig` to specify the source of the environment variables:

```typescript
const { config } = defineConfig(
  {
    /* ... */
  },
  {
    envSource: process.env,
  },
);
```

In some case you don't have access to a `process.env` variable, like with `vite`, just simply load what stores your env variables :

```typescript
const { config } = defineConfig(
  {
    /* ... */
  },
  {
    envSource: import.meta.env,
  },
);
```

You can even specify you custom environment storage as long as it's a simple flat object map, for example:

```typescript
const { config } = defineConfig(
  {
    env: {
      doc: 'Application current environment',
      default: 'development',
      schema: z.enum(['development', 'production', 'test']),
      env: 'NODE_ENV',
    },

    /* ... */
  },
  {
    envSource: {
      NODE_ENV: 'development',
      PORT: '3000',
      APP_DB_HOST: 'localhost',
      APP_DB_USERNAME: 'pg',
      APP_DB_PASSWORD: '',
    },
  },
);
```

If, for some reason, you have multiple sources of environment variables, you can use the `envSources` key of the second argument of `defineConfig` to specify an array of sources:

```typescript
const { config } = defineConfig(
  {
    /* ... */
  },
  {
    envSource: [import.meta.env, myEnvs],
  },
);
```

### Get defaults

You can use the `getDefaults` key of the second argument of `defineConfig` to specify a function that will be called to get some defaults:

```typescript
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
      schema: z.coerce.number().int().positive(),
      default: 3000,
      env: 'PORT',
    },
  },
  {
    envSource: {
      PORT: 3001,
    },
    // The config argument is build from the config definition defaults and the envSources
    // Typically you will use it to override some defaults based the config
    getDefaults: ({ config }) => ({
      port: config.env === 'test' ? 4444 : config.port,
    }),
  },
);

```

You can also use the `defaults` property of the second argument of `defineConfig` to specify some static defaults (for example taken from a json file):

```typescript
const { config } = defineConfig(
  {
    /* ... */
  },
  {
    // Either an array of config partial...
    defaults: [
      {
        port: 4444,
      },
    ],

    // ... or a single config partial
    defaults: {
      port: 4444,
    },
  },
);
```

## What's wrong with convict?

Convict is meant to be used in node based environnement, it needs to have access to global variables that may may not be present in some environnement (like `process`, `global`), and it also imports `fs`.

## Figue?

**Figue** is the french for _fig_ -> con-fig.

## Development

- Clone this repository
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## Credits

Coded with ❤️ by [Corentin Thomasset](//corentin-thomasset.fr).

## License

This project is under the [MIT license](LICENSE).
