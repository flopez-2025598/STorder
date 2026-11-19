import { Router } from 'express';
import * as catalog from '../controllers/catalog.controller.ts';
import { authenticate, requireAdmin } from '../middlewares/authenticate.ts';

export const catalogRouter = Router();

catalogRouter.get('/categories', catalog.listCategories);
catalogRouter.post('/categories', authenticate, requireAdmin, catalog.addCategory);

catalogRouter.get('/products', catalog.listProducts);
catalogRouter.post('/products', authenticate, requireAdmin, catalog.addProduct);
catalogRouter.get('/products/:id', catalog.getProduct);
catalogRouter.patch('/products/:id', authenticate, requireAdmin, catalog.editProduct);
catalogRouter.delete('/products/:id', authenticate, requireAdmin, catalog.removeProduct);
catalogRouter.get('/products/:id/stock', catalog.getStock);
catalogRouter.patch('/products/:id/stock', authenticate, requireAdmin, catalog.updateStock);

catalogRouter.post('/orders', authenticate, catalog.placeOrder);
catalogRouter.get('/orders', authenticate, catalog.getOrders);
catalogRouter.get('/orders/:id', authenticate, catalog.getOrder);
