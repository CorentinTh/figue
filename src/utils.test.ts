import { describe, expect, test } from 'vitest';
import { castArray, mapValues, mergeDeep } from './utils';

describe('utils', () => {
  describe('mapValues', () => {
    test('permits to iterate over an object values', () => {
      expect(mapValues({ a: 1, b: 2 }, value => value + 1)).toEqual({ a: 2, b: 3 });
    });
  });

  describe('mergeDeep', () => {
    test('merges two objects deeply', () => {
      expect(mergeDeep({ a: { b: 1 } }, { a: { c: 2 } }, { d: 5 })).toEqual({ a: { b: 1, c: 2 }, d: 5 });
    });

    test('array values are not merged', () => {
      expect(mergeDeep({ a: [1] }, { a: [2] })).toEqual({ a: [2] });
    });
  });

  describe('castArray', () => {
    test('casts a single value to an array', () => {
      expect(castArray(1)).toEqual([1]);
    });

    test('returns the array if the value is already an array', () => {
      expect(castArray([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });
});
