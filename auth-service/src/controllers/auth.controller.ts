import type { RequestHandler } from 'express';
import { HttpError } from '../models/http-error.ts';
import { loginSchema, registerSchema } from '../schemas/auth.schemas.ts';
import { getActiveUser, login, register } from '../services/auth.service.ts';

export const registerUser: RequestHandler = async (request, response) => {
  const input = registerSchema.safeParse(request.body);
  if (!input.success) throw new HttpError(400, 'Nombre, correo o contraseña inválidos');

  response.status(201).json({ user: await register(input.data) });
};

export const loginUser: RequestHandler = async (request, response) => {
  const input = loginSchema.safeParse(request.body);
  if (!input.success) throw new HttpError(400, 'Correo o contraseña inválidos');

  response.set('Cache-Control', 'no-store').json(await login(input.data));
};

export const getMe: RequestHandler = async (request, response) => {
  if (!request.auth) throw new HttpError(401, 'Se requiere autenticación');
  response.set('Cache-Control', 'no-store').json({ user: await getActiveUser(request.auth.id) });
};

export const getAdminAccess: RequestHandler = (_request, response) => {
  response.json({ access: 'granted' });
};
