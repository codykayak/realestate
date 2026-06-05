import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors.js';

/**
 * MVP auth: Bearer token = Firebase ID token (verified in production)
 * or `dev:<userId>` for local testing without Firebase.
 */
export interface AuthedRequest extends Request {
  userId: string;
}

export function getUserId(req: Request): string {
  return (req as AuthedRequest).userId;
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Missing Authorization header', 401, 'UNAUTHORIZED'));
  }

  const token = header.slice('Bearer '.length).trim();

  // Local dev shortcut — replace with firebase-admin verifyIdToken in production
  if (token.startsWith('dev:')) {
    (req as AuthedRequest).userId = token.slice('dev:'.length);
    return next();
  }

  // TODO: verify Firebase ID token when USE_IN_MEMORY_STORE=false
  (req as AuthedRequest).userId = 'anonymous';
  next();
}
