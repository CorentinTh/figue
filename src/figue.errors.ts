import _ from 'lodash';
import { z } from 'zod';

export { createConfigValidationError, createFigueError, isFigueError };

function createFigueError({ message, code }: { message: string; code: string }) {
  const error = Object.assign(new Error(message), { code, isFigueError: true });

  return error;
}

function isFigueError(error: unknown): error is Error & { isFigueError: true; code: string } {
  return error instanceof Error && (error as Error & { isFigueError?: boolean }).isFigueError === true;
}

function createConfigValidationError({ issues }: { issues: z.ZodIssue[] }) {
  const message = _.chain(issues)
    .map((issue) => {
      const path = issue.path.join('.');
      return `${path}: ${issue.message}`;
    })
    .join('\n')
    .value();

  return createFigueError({ message, code: 'CONFIG_VALIDATION_ERROR' });
}
