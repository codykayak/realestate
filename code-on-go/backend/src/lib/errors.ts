import type { Response } from 'express';
import type { ApiErrorBody } from '@code-on-go/shared';

export class AppError extends Error {
  constructor(
    message: string,
    readonly status = 400,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function sendError(res: Response, err: unknown): void {
  if (err instanceof AppError) {
    const body: ApiErrorBody = { error: err.message, code: err.code };
    res.status(err.status).json(body);
    return;
  }
  console.error(err);
  const body: ApiErrorBody = { error: 'Internal server error', code: 'INTERNAL' };
  res.status(500).json(body);
}
