import type { Routes } from '@angular/router';
import { AuthPage } from './components/auth-page';
import { CategoriesPage } from './components/categories-page';
import { Dashboard } from './components/dashboard';
import { InventoryPage } from './components/inventory-page';
import { NewOrderPage } from './components/new-order-page';
import { OrdersPage } from './components/orders-page';
import { ProductsPage } from './components/products-page';
import { sessionGuard } from './guards/session.guard';

export const routes: Routes = [
  { path: 'ingresar', component: AuthPage, title: 'Iniciar sesión | STorder' },
  { path: 'registrar', component: AuthPage, data: { registering: true }, title: 'Registro | STorder' },
  { path: '', pathMatch: 'full', component: Dashboard, canActivate: [sessionGuard], title: 'Panel | STorder' },
  { path: 'productos', component: ProductsPage, canActivate: [sessionGuard], title: 'Productos | STorder' },
  { path: 'pedidos/nuevo', component: NewOrderPage, canActivate: [sessionGuard], title: 'Nuevo pedido | STorder' },
  { path: 'pedidos', component: OrdersPage, canActivate: [sessionGuard], title: 'Pedidos | STorder' },
  {
    path: 'administracion/productos', component: ProductsPage, canActivate: [sessionGuard],
    data: { admin: true }, title: 'Administrar productos | STorder',
  },
  {
    path: 'administracion/categorias', component: CategoriesPage, canActivate: [sessionGuard],
    data: { admin: true }, title: 'Categorías | STorder',
  },
  {
    path: 'administracion/inventario', component: InventoryPage, canActivate: [sessionGuard],
    data: { admin: true }, title: 'Inventario | STorder',
  },
  { path: '**', redirectTo: '' },
];
