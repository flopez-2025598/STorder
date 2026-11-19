export type Role = 'admin' | 'operator';

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface ProductInput {
  name: string;
  description: string;
  price: string;
  stock: number;
  categoryId: string;
}

export interface Product extends ProductInput {
  id: string;
  sku: string;
}

export interface ProductFilters {
  name?: string;
  categoryId?: string;
}

export interface Stock {
  productId: string;
  stock: number;
}

export interface OrderSelection {
  productId: string;
  quantity: number;
}

export interface OrderItem extends OrderSelection {
  unitPrice: string;
}

export interface Order {
  id: string;
  customerId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  total: string;
  items: OrderItem[];
}
