import _ from 'lodash';
import type { Format } from '..';
import type { SchemaObjBase } from '../../figue';

export interface SchemaObjArray extends SchemaObjBase<string[]> {
  format: 'array';
}

export const format: Format = {
  validate: (value) => _.isArray(value) && value.every((item) => _.isString(item)),
  coerce: (value) => {
    if (!_.isString(value)) return value;

    if (value === '') return [];

    return value.split(',');
  },
};
