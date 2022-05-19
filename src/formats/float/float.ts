import _ from 'lodash';
import type { Format } from '..';
import type { SchemaObjBase } from '../../figue';

export interface SchemaObjFloat extends SchemaObjBase<number> {
  format: 'float';
}

export const format: Format = {
  validate: (value) => _.isNumber(value) && !_.isNaN(value) && _.isFinite(value),
  coerce: (value) => (_.isString(value) ? parseFloat(value as string) : value),
};
