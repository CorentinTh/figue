import type { ConfigIssue } from './figue.types';
import { castArray } from './utils';

export function createFigueError({ message, code }: { message: string; code: string }) {
  const error = Object.assign(new Error(message), { code, isFigueError: true });

  return error;
}

export function isFigueError(error: unknown): error is Error & { isFigueError: true; code: string } {
  return error instanceof Error && (error as Error & { isFigueError?: boolean }).isFigueError === true;
}

function serializeIssue({ message, path, definition }: ConfigIssue) {
  const envKey = definition?.env !== undefined ? castArray(definition.env).join(', ') : undefined;

  return `${path?.join('.')}${envKey !== undefined ? ` (${envKey})` : ''}: ${message}`;
}

export function createConfigValidationError({ issues }: { issues: ReadonlyArray<ConfigIssue> }) {
  const message = issues.map(serializeIssue).join('\n');

  return createFigueError({ message, code: 'CONFIG_VALIDATION_ERROR' });
}
