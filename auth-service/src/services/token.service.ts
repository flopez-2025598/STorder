import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.ts';
import type { AuthenticatedUser } from '../dtos/auth.dto.ts';
import { roleNames } from '../models/role.ts';

const claimsSchema = z.object({
  sub: z.string().regex(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i),
  role: z.enum(roleNames),
  exp: z.number().int().positive(),
});

export function signToken(user: AuthenticatedUser): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    algorithm: 'HS256',
    subject: user.id,
    expiresIn: '1h',
  });
}

export function verifyToken(token: string): AuthenticatedUser {
  const claims = claimsSchema.parse(jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }));
  return { id: claims.sub, role: claims.role };
}
