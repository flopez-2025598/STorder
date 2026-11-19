import bcrypt from 'bcrypt';
import type { LoginInput, PublicUser, RegisterInput } from '../dtos/auth.dto.ts';
import { HttpError } from '../models/http-error.ts';
import { roleNames } from '../models/role.ts';
import { findCredentials, findUserById, insertOperator } from '../repositories/users.repository.ts';
import { signToken } from './token.service.ts';

const bcryptCost = 12;
// Hash de relleno del mismo costo para verificar también los correos inexistentes.
const dummyHash = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.5YyV5GHeSdu5qS34dJDI.Aegf0euEsi';

function publicUser({ id, name, email, role }: PublicUser): PublicUser {
  return { id, name, email, role };
}

export async function register(input: RegisterInput): Promise<PublicUser> {
  const passwordHash = await bcrypt.hash(input.password, bcryptCost);
  const user = await insertOperator(input.name, input.email, passwordHash);
  if (!user) throw new HttpError(409, 'El correo electrónico ya está registrado');
  return publicUser(user);
}

export async function login(input: LoginInput): Promise<{ token: string; user: PublicUser }> {
  const user = await findCredentials(input.email);
  const matches = await bcrypt.compare(input.password, user?.passwordHash ?? dummyHash);
  if (!user?.isActive || !matches || !roleNames.includes(user.role)) {
    throw new HttpError(401, 'Credenciales incorrectas');
  }
  return { token: signToken(user), user: publicUser(user) };
}

export async function getActiveUser(id: string): Promise<PublicUser> {
  const user = await findUserById(id);
  if (!user) throw new HttpError(404, 'Usuario no encontrado');
  if (!user.isActive) throw new HttpError(401, 'Usuario inactivo');
  return publicUser(user);
}
