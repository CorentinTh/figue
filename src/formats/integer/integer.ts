import _ from 'lodash';
import { Format } from '..';
import type { SchemaObjBase } from '../../figue';

export interface SchemaObjInteger extends SchemaObjBase<number> {
  format: 'integer';
}

export const format: Format = {
  validate: (value) => _.isInteger(value),
  coerce: (value) => (_.isString(value) ? parseInt(value as string) : value),
};
