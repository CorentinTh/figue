import type { ConfigDefinitionElement } from './figue.types';
import { describe, expect, test } from 'vitest';
import { createConfigValidationError, createFigueError, isFigueError } from './figue.errors';

describe('figue errors', () => {
  describe('createFigueError', () => {
    test('a figue error is an error with a code and a flag', () => {
      const error = createFigueError({ message: 'message', code: 'code' });

      expect(error.message).toBe('message');
      expect(error.code).toBe('code');
      expect(isFigueError(error)).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('isFigueError', () => {
    test('validates if an error is a figue error', () => {
      expect(isFigueError(createFigueError({ message: 'message', code: 'code' }))).toBe(true);

      expect(isFigueError(new Error('test'))).toBe(false);
      expect(isFigueError({})).toBe(false);
      expect(isFigueError(null)).toBe(false);
      expect(isFigueError(undefined)).toBe(false);
      expect(isFigueError('test')).toBe(false);
    });
  });

  describe('createConfigValidationError', () => {
    test('creates a config validation error for the user given the issues', () => {
      const error = createConfigValidationError({ issues: [
        { path: ['a', 'b'], message: 'message', definition: { env: 'FOO' } as ConfigDefinitionElement },
      ] });

      expect(error.message).toBe('a.b (FOO): message');
    });
  });
});
