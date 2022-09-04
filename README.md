# Figue

[![ci](https://github.com/CorentinTh/figue/actions/workflows/ci.yml/badge.svg)](https://github.com/CorentinTh/figue/actions/workflows/ci.yml)

> Platform agnostic configuration management library, with environmental variables and validation, like [convict](https://github.com/mozilla/node-convict/tree/master/packages/convict) but simpler, cross env and using json schema.

## Usage

Install package:

```sh
# npm
npm install figue

# yarn
yarn install figue

# pnpm
pnpm install figue
```

Import:

```js
// ESM
import { figue } from 'figue';

// CommonJS
const { figue } = require('figue');
```

## API

### Basic example

```typescript
import { figue } from 'figue';

// Define the schema
const config = figue({
  type: 'object',
  allRequired: true,
  default: {},
  properties: {
    env: {
      doc: 'Application current environment',
      type: 'string',
      enum: ['production', 'development', 'test'],
      default: 'development',
      env: 'NODE_ENV',
    },
    port: {
      doc: 'Application port to listen',
      type: 'integer',
      default: 3000,
      env: 'PORT',
    },
    db: {
      type: 'object',
      allRequired: true,
      default: {},
      properties: {
        host: {
          doc: 'Database server host',
          type: 'string',
          format: 'hostname',
          default: 'localhost',
          env: 'APP_DB_HOST',
        },
        username: {
          doc: 'Database server username',
          type: 'string',
          default: 'pg',
          env: 'APP_DB_USERNAME',
        },
        password: {
          doc: 'Database server password',
          type: 'string',
          format: 'password',
          default: '',
          env: 'APP_DB_PASSWORD',
        },
      },
    },
  },
})
  // Load the environnement variables
  .loadEnv(process.env) // Or .loadEnv(import.meta.env) for vite
  // Get the config
  .getConfig();

console.log(config);
// {
//   env: 'development',
//   port: 3000,
//   db: {
//     host: 'localhost',
//     username: 'pg',
//     password: '',
//   },
// }
```

### Load environnement

Use the `loadEnv` method to specify you environnement variables that will be used by the `env` keys

```typescript
import { figue } from 'figue';

// Define the schema
const config = figue({
  /* schema */
})
  .loadEnv(process.env)
  .getConfig();
```

In some case you don't have access to a `process.env` variable, like with `vite`, just simply load what stores your env variables :

```typescript
import { figue } from 'figue';

// Define the schema
const config = figue({
  /* schema */
})
  .loadEnv(import.meta.env)
  .getConfig();
```

You can even specify you custom environment storage as long as it's a simple flat object map, for example:

```typescript
import { figue } from 'figue';

// Define the schema
const config = figue({
  type: 'object',
  allRequired: true,
  default: {},
  properties: {
    db: {
      type: 'object',
      allRequired: true,
      default: {},
      properties: {
        host: {
          doc: 'Database server host',
          type: 'string',
          format: 'hostname',
          default: 'localhost',
          env: 'APP_DB_HOST',
        },
        username: {
          doc: 'Database server username',
          type: 'string',
          default: 'pg',
          env: 'APP_DB_USERNAME',
        },
      },
    },
  },
})
  .loadConfig({
    db: {
      host: 'prod.example.com',
      username: 'super-root',
    },
  })
  .getConfig();
```

From a json file :

```typescript
import { figue } from 'figue';

import configValues from '../settings.json';

// Define the schema
const config = figue({
  /**/
})
  .loadConfig(configValues)
  .getConfig();
```

If you call `loadEnv` multiple times, the objects passed as argument will be merged and in cas of a conflict, the value of the last env loaded will be used.

### Loading a config

Sometime you may want to load you config value from a custom object (maybe from a config file ?)

```typescript
import { figue } from 'figue';

// Define the schema
const config = figue({
  type: 'object',
  allRequired: true,
  default: {},
  properties: {
    var: {
      doc: 'Dummy example',
      type: 'string',
      default: 'foo',
      env: 'my-env-key',
    },
  },
})
  .loadEnv({
    'my-env-key': 'bar',
  })
  .getConfig();
```

## Which value is used?

When a config variable has multiple possible value, the order of priority is:

**Env value** (if exists) > **Config value** (if exists) > **Default value**

## Formats available

Figue uses Ajv under the hood with [ajv-formats](https://www.npmjs.com/package/ajv-formats) and [ajv-keywords](https://www.npmjs.com/package/ajv-keywords) extensions in addition to the basic JSON Schema types.
So please refer to this document to know more about available formats.

## Extending Ajv

You can pass your own Ajv instance...

```typescript
import { figue } from 'figue';

const ajv = Ajv();

// Define the schema
const config = figue(schema, { ajv }).loadEnv(process.env).getConfig();
```

...or extends the default one

```typescript
import { figue, getAjv } from 'figue';

const ajv = getAjv();

// Define the schema
const config = figue(schema, { ajv }).loadEnv(process.env).getConfig();
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
