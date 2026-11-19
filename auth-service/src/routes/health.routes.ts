import { Router } from 'express';
import { health } from '../controllers/health.controller.ts';

export const healthRouter = Router();
healthRouter.get('/health', health);
