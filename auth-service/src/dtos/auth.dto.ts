import type { z } from 'zod';
import type { RoleName } from '../models/role.ts';
import type { loginSchema, registerSchema } from '../schemas/auth.schemas.ts';

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthenticatedUser {
  id: string;
  role: RoleName;
}

export interface PublicUser extends AuthenticatedUser {
  name: string | null;
  email: string;
}
