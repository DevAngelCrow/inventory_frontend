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
];
