import type { PublicUser } from '../dtos/auth.dto.ts';

export interface StoredUser extends PublicUser {
  isActive: boolean;
}

export interface UserCredentials extends StoredUser {
  passwordHash: string;
}
