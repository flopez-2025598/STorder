import type { Request, RequestHandler } from 'express';
import { HttpError } from '../models/http-error.ts';
import {
  categorySchema, idSchema, orderSchema, productFiltersSchema, productSchema,
  productUpdateSchema, stockSchema, validate,
} from '../schemas/catalog.schemas.ts';
import * as catalog from '../services/catalog.service.ts';
import * as orders from '../services/orders.service.ts';

function authenticatedUser(request: Request) {
  if (!request.catalogUser) throw new HttpError(401, 'Se requiere autenticación');
  return request.catalogUser;
}

export const listCategories: RequestHandler = async (_request, response) => {
  response.json({ categories: await catalog.listCategories() });
};

export const addCategory: RequestHandler = async (request, response) => {
  const input = validate(categorySchema, request.body);
  response.status(201).json({ category: await catalog.addCategory(input) });
};

export const listProducts: RequestHandler = async (request, response) => {
  const filters = validate(productFiltersSchema, request.query);
  response.json({ products: await catalog.listProducts(filters) });
};

export const getProduct: RequestHandler = async (request, response) => {
  response.json({ product: await catalog.getProduct(validate(idSchema, request.params.id)) });
};

export const addProduct: RequestHandler = async (request, response) => {
  const input = validate(productSchema, request.body);
  response.status(201).json({ product: await catalog.addProduct(input) });
};

export const editProduct: RequestHandler = async (request, response) => {
  const id = validate(idSchema, request.params.id);
  const input = validate(productUpdateSchema, request.body);
  response.json({ product: await catalog.editProduct(id, input) });
};

export const removeProduct: RequestHandler = async (request, response) => {
  await catalog.removeProduct(validate(idSchema, request.params.id));
  response.status(204).send();
};

export const getStock: RequestHandler = async (request, response) => {
  const { id, stock } = await catalog.getProduct(validate(idSchema, request.params.id));
  response.json({ productId: id, stock });
};

export const updateStock: RequestHandler = async (request, response) => {
  const id = validate(idSchema, request.params.id);
  const input = validate(stockSchema, request.body);
  const product = await catalog.editProduct(id, input);
  response.json({ productId: product.id, stock: product.stock });
};

export const placeOrder: RequestHandler = async (request, response) => {
  const user = authenticatedUser(request);
  const input = validate(orderSchema, request.body);
  response.status(201).json({ order: await orders.placeOrder(input, user.id) });
};

export const getOrders: RequestHandler = async (request, response) => {
  response.json({ orders: await orders.getOrders(authenticatedUser(request)) });
};

export const getOrder: RequestHandler = async (request, response) => {
  const id = validate(idSchema, request.params.id);
  response.json({ order: await orders.getOrder(id, authenticatedUser(request)) });
};
