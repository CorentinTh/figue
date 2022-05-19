import _ from 'lodash';
import type { Format } from '..';
import type { SchemaObjBase } from '../../figue';

export interface SchemaObjString extends SchemaObjBase<string> {
  format: 'string';
}

export const format: Format = {
  validate: (value) => _.isString(value),
  coerce: (value) => value.toString(),
};
