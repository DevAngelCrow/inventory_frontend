import type { RouteRecordRaw } from 'vue-router';

export const routesBilling: RouteRecordRaw[] = [
  {
    path: '/billing/invoices',
    name: 'billing-invoices',
    component: () => import('./views/Invoices.vue'),
    meta: {
      title: 'Facturas',
      requiresAuth: true,
    },
  },
  {
    path: '/billing/payments',
    name: 'billing-payments',
    component: () => import('@/modules/payments/views/Payments.vue'),
    meta: {
      title: 'Pagos',
      requiresAuth: true,
    },
  },
];
