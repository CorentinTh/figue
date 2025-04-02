import type { ConfigIssue } from './figue.types';

export function createFigueError({ message, code }: { message: string; code: string }) {
  const error = Object.assign(new Error(message), { code, isFigueError: true });

  return error;
}

export function isFigueError(error: unknown): error is Error & { isFigueError: true; code: string } {
  return error instanceof Error && (error as Error & { isFigueError?: boolean }).isFigueError === true;
}

export function createConfigValidationError({ issues }: { issues: ReadonlyArray<ConfigIssue> }) {
  const message = issues.map(({ path, message, definition }) => `${path?.join('.')}${definition?.env ? ` (${definition.env})` : ''}: ${message}`).join('\n');

  return createFigueError({ message, code: 'CONFIG_VALIDATION_ERROR' });
}
