import _ from 'lodash';
import type { Format } from '..';
import type { SchemaObjBase } from '../../figue';

export interface SchemaObjBoolean extends SchemaObjBase<boolean> {
  format: 'boolean';
}

export const format: Format = {
  validate: () => true,
  coerce: (value) => (_.isString(value) ? value.trim().toLowerCase() === 'true' : Boolean(value)),
};
