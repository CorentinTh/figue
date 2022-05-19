import _ from 'lodash';
import type { Format } from '..';
import type { SchemaObjBase } from '../../figue';

export interface SchemaObjEnum extends SchemaObjBase<string> {
  format: 'enum';
  values: string[];
}

export const format: Format = {
  validate: (value, { values }: SchemaObjEnum) => _.isString(value) && values.includes(value),
  coerce: (value) => value.toString(),
};
