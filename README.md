# Figue

[![ci](https://github.com/CorentinTh/figue/actions/workflows/ci.yml/badge.svg)](https://github.com/CorentinTh/figue/actions/workflows/ci.yml)

> Platform agnostic configuration management library, with environmental variables and validation, like [convict](https://github.com/mozilla/node-convict/tree/master/packages/convict) (but simpler, more modern, and written in ts).

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
  env: {
    doc: 'Application current environment',
    format: 'enum',
    values: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    doc: 'Application port to listen',
    format: 'integer',
    default: 3000,
    env: 'PORT',
  },
  db: {
    host: {
      doc: 'Database server host',
      format: 'string',
      default: 'localhost',
      env: 'APP_DB_HOST',
    },
    username: {
      doc: 'Database server username',
      format: 'string',
      default: 'pg',
      env: 'APP_DB_USERNAME',
    },
    password: {
      doc: 'Database server password',
      format: 'string',
      default: '',
      env: 'APP_DB_PASSWORD',
    },
  },
})
  // Load the environnement variables
  .loadEnv(process.env)
  // Validate the config
  .validate()
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
  .validate()
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
  .validate()
  .getConfig();
```

You can even specify you custom environment storage as long as it's a simple flat object map, for example:

```typescript
import { figue } from 'figue';

// Define the schema
const config = figue({
  db: {
    host: {
      doc: 'Database server host',
      format: 'string',
      default: 'localhost',
      env: 'APP_DB_HOST',
    },
    username: {
      doc: 'Database server username',
      format: 'string',
      default: 'pg',
      env: 'APP_DB_USERNAME',
    },
  },
})
  .loadConfig({
    db: {
      host: 'prod.example.com',
      username: 'super-root',
    },
  })
  .validate()
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
  .validate()
  .getConfig();
```

If you call `loadEnv` multiple times, the objects passed as argument will be merged and in cas of a conflict, the value of the last env loaded will be used.

### Loading a config

Sometime you may want to load you config value from a custom object (maybe from a config file ?)

```typescript
import { figue } from 'figue';

// Define the schema
const config = figue({
  var: {
    doc: 'Dummy example',
    format: 'string',
    default: 'foo',
    env: 'my-env-key',
  },
})
  .loadEnv({
    'my-env-key': 'bar',
  })
  .validate()
  .getConfig();
```

## Which value is used?

When a config variable has multiple possible value, the order of priority is:

**Env value** (if exists) > **Config value** (if exists) > **Default value**

## Formats available

<table>
<thead>
<tr>
<th>Format name</th>
<th>Description</th>
<th>Example</th>
</tr>
</thead>

<tbody>
<tr>
<td>String </td>
<td>Basically an string</td>
<td>

```js
{
  foo: {
    doc: 'My string variable',
    format: 'string',
    default: 'lorem ipsum',
  }
}
```

</td>
</tr>

<tr>
<td>Integer </td>
<td>Basically an integer, no floating point</td>
<td>

```js
{
  foo: {
    doc: 'My integer variable',
    format: 'integer',
    default: 42,
  }
}
```

</td>
</tr>

<tr>
<td>Float </td>
<td>A floating point value</td>
<td>

```js
{
  foo: {
    doc: 'My float variable',
    format: 'float',
    default: 0.5,
  }
}
```

</td>
</tr>

<tr>
<td>Enum </td>
<td>A variable from an enum specified by the `values` key</td>
<td>

```js
{
  env: {
    doc: 'Application current environment',
    format: 'enum',
    values: ['production', 'development', 'test'],
    default: 'development',
  }
}
```

</td>
</tr>

<tr>
<td>Boolean </td>
<td>A boolean variable. Env variable (string) are coerced with `value.trim().toLowerCase() === 'true'`</td>
<td>

```js
{
  env: {
    doc: 'Enable foo',
    format: 'boolean',
    default: false,
  }
}
```

</td>
</tr>

<tr>
<td>Custom</td>
<td>You can define your own validation and coercion function</td>
<td>

```js
{
  foo: {
    doc: 'Array of things',
    format: 'custom',
    validate: (value) => _.isString(value)
    coerce: (value) => value.split('-')
    default: 'a-b-c',
  }
}
```

</td>
</tr>

<tr>
<td>Any </td>
<td>It can be anything</td>
<td>

```js
{
  foo: {
    doc: 'My dumb variable',
    format: 'any',
    default: 'yo',
  }
}
```

</td>
</tr>

</tbody>
</table>

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
