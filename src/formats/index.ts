import { format as floatFormat, SchemaObjFloat } from './float/float';
import { format as integerFormat, SchemaObjInteger } from './integer/integer';
import { format as enumFormat, SchemaObjEnum } from './enum/enum';
import { format as anyFormat, SchemaObjAny } from './any/any';
import { format as stringFormat, SchemaObjString } from './string/string';
import { format as booleanFormat, SchemaObjBoolean } from './boolean/boolean';
import { format as customFormat, SchemaObjCustom } from './custom/custom';
import { format as arrayFormat, SchemaObjArray } from './array/array';

export type SchemaObj = SchemaObjInteger | SchemaObjEnum | SchemaObjFloat | SchemaObjAny | SchemaObjString | SchemaObjBoolean | SchemaObjCustom | SchemaObjArray;

export type Format = {
  validate(value: unknown, schema: SchemaObj): boolean;
  coerce?(value: unknown, schema: SchemaObj): unknown;
};

export const formats: { [k: string]: Format } = {
  integer: integerFormat,
  enum: enumFormat,
  float: floatFormat,
  any: anyFormat,
  string: stringFormat,
  boolean: booleanFormat,
  custom: customFormat,
  array: arrayFormat,
};
