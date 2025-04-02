import type { StandardSchemaV1 } from '@standard-schema/spec';

export { createConfigValidationError, createFigueError, isFigueError };

function createFigueError({ message, code }: { message: string; code: string }) {
  const error = Object.assign(new Error(message), { code, isFigueError: true });

  return error;
}

function isFigueError(error: unknown): error is Error & { isFigueError: true; code: string } {
  return error instanceof Error && (error as Error & { isFigueError?: boolean }).isFigueError === true;
}

function createConfigValidationError({ issues }: { issues: ReadonlyArray<StandardSchemaV1.Issue> }) {
  const message = issues.map(({ path, message }) => `${path?.join('.')}: ${message}`).join('\n');

  return createFigueError({ message, code: 'CONFIG_VALIDATION_ERROR' });
}
