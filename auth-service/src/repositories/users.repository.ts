import { pool } from '../config/database.ts';
import type { PublicUser } from '../dtos/auth.dto.ts';
import type { StoredUser, UserCredentials } from '../models/auth-user.ts';

export async function insertOperator(
  name: string,
  email: string,
  passwordHash: string,
): Promise<PublicUser | undefined> {
  const { rows } = await pool.query<PublicUser>(
    `WITH created AS (
       INSERT INTO users (name, email, password_hash, role_id)
       VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'operator'))
       ON CONFLICT (lower(email)) DO NOTHING
       RETURNING id, name, email, role_id
     )
     SELECT created.id, created.name, created.email, roles.name AS role
     FROM created JOIN roles ON roles.id = created.role_id`,
    [name, email, passwordHash],
  );
  return rows[0];
}

export async function findCredentials(email: string): Promise<UserCredentials | undefined> {
  const { rows } = await pool.query<UserCredentials>(
    `SELECT users.id, users.name, users.email, users.is_active AS "isActive",
            users.password_hash AS "passwordHash", roles.name AS role
     FROM users JOIN roles ON roles.id = users.role_id
     WHERE lower(users.email) = $1`,
    [email],
  );
  return rows[0];
}

export async function findUserById(id: string): Promise<StoredUser | undefined> {
  const { rows } = await pool.query<StoredUser>(
    `SELECT users.id, users.name, users.email, users.is_active AS "isActive", roles.name AS role
     FROM users JOIN roles ON roles.id = users.role_id
     WHERE users.id = $1`,
    [id],
  );
  return rows[0];
}
