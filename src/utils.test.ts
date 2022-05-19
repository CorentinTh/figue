import { describe, expect, it } from 'vitest';
import { isFalsyOrHasThrown } from './utils';

describe('isFalsyOrHasThrown', () => {
  describe('when the callback return a boolean', () => {
    it('should return the inverse value of the callback', () => {
      expect(isFalsyOrHasThrown(() => true)).toBe(false);
      expect(isFalsyOrHasThrown(() => false)).toBe(true);
    });
  });

  describe('when the callback throw an error', () => {
    it('should return true', () => {
      expect(
        isFalsyOrHasThrown(() => {
          throw 'error';
        }),
      ).toBe(true);
    });
  });
});
