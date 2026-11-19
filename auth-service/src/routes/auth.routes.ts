import { Router } from 'express';
import { getAdminAccess, getMe, loginUser, registerUser } from '../controllers/auth.controller.ts';
import { authenticate } from '../middlewares/authenticate.ts';
import { requireRole } from '../middlewares/authorize.ts';

export const authRouter = Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.get('/me', authenticate, getMe);
authRouter.get('/admin/check', authenticate, requireRole('admin'), getAdminAccess);
